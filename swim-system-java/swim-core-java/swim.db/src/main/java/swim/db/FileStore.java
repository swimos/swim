// Copyright 2015-2019 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.db;

import java.io.File;
import java.io.FilenameFilter;
import java.util.Iterator;
import java.util.TreeMap;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import swim.collections.HashTrieMap;
import swim.concurrent.Cont;
import swim.concurrent.Conts;
import swim.concurrent.Stage;
import swim.concurrent.Sync;
import swim.util.HashGenCacheSet;

public class FileStore extends Store {
  final StoreContext context;
  final File directory;
  final String baseName;
  final String zoneFileExt;
  final Stage stage;
  final HashGenCacheSet<Page> pageCache;
  final FileStoreCommitter committer;
  final FileStoreCompactor compactor;
  final Pattern zonePattern;
  final FilenameFilter zoneFilter;
  volatile HashTrieMap<Integer, FileZone> zones;
  volatile FileZone zone;
  volatile int status;

  public FileStore(StoreContext context, File directory, String baseName, Stage stage) {
    this.context = context;
    this.directory = directory != null ? directory : new File("");
    final int lastDotIndex = baseName.lastIndexOf('.');
    if (lastDotIndex >= 0) {
      this.baseName = baseName.substring(0, lastDotIndex);
      this.zoneFileExt = baseName.substring(lastDotIndex + 1);
    } else {
      this.baseName = baseName;
      this.zoneFileExt = "swimdb";
    }
    this.stage = stage;
    this.pageCache = new HashGenCacheSet<Page>(context.settings.pageCacheSize);
    this.committer = new FileStoreCommitter(this);
    stage.task(this.committer);
    this.compactor = new FileStoreCompactor(this);
    stage.task(this.compactor);
    this.zonePattern = Pattern.compile(Pattern.quote(this.baseName) + "-([0-9]+)\\." + Pattern.quote(this.zoneFileExt));
    this.zoneFilter = new FileStoreZoneFilter(zonePattern);
    this.zones = HashTrieMap.empty();
    this.status = 0;
  }

  public FileStore(StoreContext context, File basePath, Stage stage) {
    this(context, basePath.getParentFile(), basePath.getName(), stage);
  }

  public FileStore(StoreContext context, String basePath, Stage stage) {
    this(context, new File(basePath), stage);
  }

  public FileStore(File directory, String baseName, Stage stage) {
    this(new StoreContext(), directory, baseName, stage);
  }

  public FileStore(File basePath, Stage stage) {
    this(new StoreContext(), basePath, stage);
  }

  public FileStore(String basePath, Stage stage) {
    this(new StoreContext(), new File(basePath), stage);
  }

  @Override
  public final StoreContext storeContext() {
    return this.context;
  }

  @Override
  public final Database database() {
    final FileZone zone = this.zone;
    if (zone != null) {
      return zone.database();
    } else {
      return null;
    }
  }

  public final File directory() {
    return this.directory;
  }

  public final String baseName() {
    return this.baseName;
  }

  public final String zoneFileExt() {
    return this.zoneFileExt;
  }

  @Override
  public final Stage stage() {
    return this.stage;
  }

  public final HashGenCacheSet<Page> pageCache() {
    return this.pageCache;
  }

  @Override
  public final long size() {
    long size = 0L;
    final Iterator<FileZone> zoneIterator = this.zones.valueIterator();
    while (zoneIterator.hasNext()) {
      size += zoneIterator.next().size();
    }
    return size;
  }

  @Override
  public final boolean isCommitting() {
    return (this.status & COMMITTING) != 0;
  }

  @Override
  public final boolean isCompacting() {
    return (this.status & COMPACTING) != 0;
  }

  @Override
  public void openAsync(Cont<Store> cont) {
    try {
      do {
        final int oldStatus = this.status;
        if ((oldStatus & (OPENING | OPENED)) == 0) {
          final int newStatus = oldStatus | OPENING;
          if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
            try {
              this.directory.mkdirs();
              final TreeMap<Integer, File> zoneFiles = zoneFiles();
              final int newestZone;
              if (!zoneFiles.isEmpty()) {
                newestZone = zoneFiles.lastKey();
                zoneFiles.remove(newestZone);
              } else {
                newestZone = 1;
              }
              openZoneAsync(newestZone, new FileStoreOpenZone(this, zoneFiles, cont));
            } catch (Throwable cause) {
              try {
                if (Conts.isNonFatal(cause)) {
                  close();
                }
              } finally {
                synchronized (this) {
                  notifyAll();
                }
              }
              throw cause;
            }
          }
        } else {
          if ((oldStatus & OPENING) != 0) {
            synchronized (this) {
              ForkJoinPool.managedBlock(new FileStoreAwait(this));
            }
          }
          if ((this.status & OPENED) != 0) {
            cont.bind(this);
          } else {
            throw new StoreException("failed to open store");
          }
          break;
        }
      } while (true);
    } catch (InterruptedException cause) {
      cont.trap(cause);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public FileStore open() throws InterruptedException {
    final Sync<Store> syncStore = new Sync<Store>();
    openAsync(syncStore);
    return (FileStore) syncStore.await(settings().storeOpenTimeout);
  }

  @Override
  public void closeAsync(Cont<Store> cont) {
    try {
      final Database database = database();
      if (database != null) {
        database.closeAsync(new FileStoreClose(this, cont));
      } else {
        closeZones();
        cont.bind(this);
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void close() throws InterruptedException {
    final Sync<Store> syncStore = new Sync<Store>();
    closeAsync(syncStore);
    syncStore.await(settings().storeCloseTimeout);
  }

  public boolean delete() {
    boolean deleted = false;
    final File[] files = this.directory.listFiles(this.zoneFilter);
    if (files != null) {
      deleted = true;
      for (int i = 0, n = files.length; i < n; i += 1) {
        final File file = files[i];
        deleted = file.delete() && deleted;
      }
    }
    return deleted;
  }

  @Override
  public FileZone zone() {
    return this.zone;
  }

  @Override
  public FileZone zone(int zoneId) {
    return this.zones.get(zoneId);
  }

  @Override
  public void openZoneAsync(int zoneId, Cont<Zone> cont) {
    try {
      FileZone newZone = null;
      do {
        final HashTrieMap<Integer, FileZone> oldZones = this.zones;
        final FileZone oldZone = oldZones.get(zoneId);
        if (oldZone == null) {
          if (newZone == null) {
            final File zoneFile = zoneFile(zoneId);
            final FileZone zone = this.zone;
            if (zone == null || zoneId > zone.id || zoneFile.exists()) {
              newZone = new FileZone(this, zoneId, zoneFile, this.stage);
            } else {
              throw new StoreException("failed to open deleted zone " + zoneFile);
            }
          }
          final HashTrieMap<Integer, FileZone> newZones = oldZones.updated(zoneId, newZone);
          if (ZONES.compareAndSet(this, oldZones, newZones)) {
            break;
          }
        } else {
          if (newZone != null) {
            // Lost open race
            newZone.close();
          }
          newZone = oldZone;
          break;
        }
      } while (true);
      newZone.openAsync(cont);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public FileZone openZone(int zoneId) throws InterruptedException {
    final Sync<Zone> eventualZone = new Sync<Zone>();
    openZoneAsync(zoneId, eventualZone);
    return (FileZone) eventualZone.await(settings().zoneOpenTimeout);
  }

  void closeZone(int zoneId) {
    do {
      final HashTrieMap<Integer, FileZone> oldZones = this.zones;
      final HashTrieMap<Integer, FileZone> newZones = oldZones.removed(zoneId);
      if (oldZones != newZones) {
        if (ZONES.compareAndSet(this, oldZones, newZones)) {
          oldZones.get(zoneId).close();
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  void closeZones() {
    do {
      final HashTrieMap<Integer, FileZone> oldZones = this.zones;
      final HashTrieMap<Integer, FileZone> newZones = HashTrieMap.empty();
      if (oldZones != newZones) {
        if (ZONES.compareAndSet(this, oldZones, newZones)) {
          final Iterator<FileZone> zoneIterator = oldZones.valueIterator();
          while (zoneIterator.hasNext()) {
            zoneIterator.next().close();
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  @Override
  public void openDatabaseAsync(Cont<Database> cont) {
    try {
      openAsync(new FileStoreOpenDatabase(this, cont));
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public PageLoader openPageLoader(TreeDelegate treeDelegate, boolean isResident) {
    return new FilePageLoader(this, treeDelegate, isResident);
  }

  @Override
  public void commitAsync(Commit commit) {
    try {
      this.committer.commitAsync(commit);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        commit.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void compactAsync(Compact compact) {
    try {
      this.compactor.compactAsync(compact);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        compact.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public synchronized FileZone shiftZone() {
    if ((this.status & OPENED) == 0) {
      try {
        open();
      } catch (InterruptedException cause) {
        throw new StoreException(cause);
      }
    }
    final FileZone oldZone = this.zone;
    final int oldZoneId = oldZone.id;
    final int newZoneId = oldZoneId + 1;
    FileZone newZone = null;
    do {
      final HashTrieMap<Integer, FileZone> oldZones = this.zones;
      final FileZone zone = oldZones.get(newZoneId);
      if (zone == null) {
        if (newZone == null) {
          newZone = new FileZone(this, newZoneId, zoneFile(newZoneId), this.stage,
                                 oldZone.database, oldZone.germ());
          try {
            newZone.open();
          } catch (InterruptedException cause) {
            throw new StoreException(cause);
          }
        }
        final HashTrieMap<Integer, FileZone> newZones = oldZones.updated(newZoneId, newZone);
        if (ZONES.compareAndSet(this, oldZones, newZones)) {
          ZONE.set(this, newZone);
          this.context.databaseDidShiftZone(this, newZone.database, newZone);
          break;
        }
      } else {
        if (newZone != null) {
          // Lost open race
          newZone.close();
        }
        newZone = zone;
        break;
      }
    } while (true);
    return newZone;
  }

  protected File zoneFile(int zone) {
    return new File(this.directory, this.baseName + '-' + zone + '.' + this.zoneFileExt);
  }

  protected TreeMap<Integer, File> zoneFiles() {
    this.directory.mkdirs();
    final File[] files = this.directory.listFiles(this.zoneFilter);
    if (files == null) {
      throw new StoreException("failed to access directory " + this.directory.getPath());
    }
    final TreeMap<Integer, File> zoneFiles = new TreeMap<Integer, File>();
    for (int i = 0, n = files.length; i < n; i += 1) {
      final File file = files[i];
      final String name = file.getName();
      final Matcher matcher = this.zonePattern.matcher(name);
      if (matcher.matches()) {
        final int zone = Integer.parseInt(matcher.group(1));
        zoneFiles.put(zone, file);
      }
    }
    return zoneFiles;
  }

  @Override
  void hitPage(Database database, Page page) {
    this.pageCache.put(page);
    super.hitPage(database, page);
  }

  static final int OPENING = 1 << 0;
  static final int OPENED = 1 << 1;
  static final int COMMITTING = 1 << 2;
  static final int COMPACTING = 1 << 3;

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<FileStore, HashTrieMap<Integer, FileZone>> ZONES =
      AtomicReferenceFieldUpdater.newUpdater(FileStore.class, (Class<HashTrieMap<Integer, FileZone>>) (Class<?>) HashTrieMap.class, "zones");

  static final AtomicReferenceFieldUpdater<FileStore, FileZone> ZONE =
      AtomicReferenceFieldUpdater.newUpdater(FileStore.class, FileZone.class, "zone");

  static final AtomicIntegerFieldUpdater<FileStore> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(FileStore.class, "status");
}

final class FileStoreZoneFilter implements FilenameFilter {
  final Pattern zonePattern;

  FileStoreZoneFilter(Pattern zonePattern) {
    this.zonePattern = zonePattern;
  }

  @Override
  public boolean accept(File directory, String name) {
    return this.zonePattern.matcher(name).matches();
  }
}

final class FileStoreOpenZone implements Cont<Zone> {
  final FileStore store;
  final TreeMap<Integer, File> zoneFiles;
  final Cont<Store> andThen;

  FileStoreOpenZone(FileStore store, TreeMap<Integer, File> zoneFiles, Cont<Store> andThen) {
    this.store = store;
    this.zoneFiles = zoneFiles;
    this.andThen = andThen;
  }

  @Override
  public void bind(Zone zone) {
    try {
      final FileZone fileZone = (FileZone) zone;
      if (zone.germ().seedRefValue().isDefined() || this.zoneFiles.isEmpty()) {
        FileStore.ZONE.set(this.store, fileZone);
        do {
          final int oldStatus = this.store.status;
          final int newStatus = oldStatus & ~FileStore.OPENING | FileStore.OPENED;
          if (FileStore.STATUS.compareAndSet(this.store, oldStatus, newStatus)) {
            break;
          }
        } while (true);
        this.andThen.bind(this.store);
        synchronized (this.store) {
          this.store.notifyAll();
        }
      } else {
        this.store.closeZone(fileZone.id);
        // Move corrupted zone
        final File oldFile = fileZone.file;
        if (oldFile.exists()) {
          final String newFileName = "~" + oldFile.getName() + "-" + System.currentTimeMillis();
          final File newFile = new File(oldFile.getParent(), newFileName);
          oldFile.renameTo(newFile);
        }
        // Open previous zone
        final int previousZone = this.zoneFiles.lastKey();
        this.zoneFiles.remove(previousZone);
        this.store.openZoneAsync(previousZone, new FileStoreOpenZone(this.store, this.zoneFiles, this.andThen));
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void trap(Throwable error) {
    try {
      try {
        this.store.close();
      } catch (InterruptedException swallow) {
        swallow.printStackTrace();
      } finally {
        this.andThen.trap(error);
      }
    } finally {
      synchronized (this.store) {
        this.store.notifyAll();
      }
    }
  }
}

final class FileStoreOpenDatabase implements Cont<Store> {
  final FileStore store;
  final Cont<Database> cont;

  FileStoreOpenDatabase(FileStore store, Cont<Database> cont) {
    this.store = store;
    this.cont = cont;
  }

  @Override
  public void bind(Store store) {
    try {
      this.store.zone.openDatabaseAsync(this.cont);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void trap(Throwable error) {
    this.cont.trap(error);
  }
}

final class FileStoreAwait implements ForkJoinPool.ManagedBlocker {
  final FileStore store;

  FileStoreAwait(FileStore store) {
    this.store = store;
  }

  @Override
  public boolean isReleasable() {
    return (this.store.status & FileStore.OPENING) == 0;
  }

  @Override
  public boolean block() throws InterruptedException {
    if ((this.store.status & FileStore.OPENING) != 0) {
      this.store.wait();
    }
    return (this.store.status & FileStore.OPENING) == 0;
  }
}

final class FileStoreClose implements Cont<Database> {
  final FileStore store;
  final Cont<Store> andThen;

  FileStoreClose(FileStore store, Cont<Store> andThen) {
    this.store = store;
    this.andThen = andThen;
  }

  @Override
  public void bind(Database database) {
    try {
      this.store.closeZones();
      this.andThen.bind(this.store);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void trap(Throwable error) {
    this.andThen.trap(error);
  }
}
