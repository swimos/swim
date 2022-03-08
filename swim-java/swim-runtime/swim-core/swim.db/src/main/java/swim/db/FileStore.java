// Copyright 2015-2022 Swim.inc
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
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import swim.collections.HashTrieMap;
import swim.concurrent.Cont;
import swim.concurrent.Stage;
import swim.util.HashGenCacheSet;

public class FileStore extends Store {

  final StoreContext context;
  final File directory;
  final String baseName;
  final String zoneFileExt;
  final Stage stage;
  final HashGenCacheSet<Page> pageCache;
  final FileStoreCommitter committer;
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
    this.zonePattern = Pattern.compile(Pattern.quote(this.baseName) + "-([0-9]+)\\." + Pattern.quote(this.zoneFileExt));
    this.zoneFilter = new FileStoreZoneFilter(this.zonePattern);
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
    return (this.status & FileStore.COMMITTING_FLAG) != 0;
  }

  @Override
  public final boolean isCompacting() {
    return (this.status & FileStore.COMPACTING_FLAG) != 0;
  }

  @Override
  public boolean open() {
    // Load the current store status, without ordering constraints.
    //int status = (int) FileStore.STATUS_VAR.getOpaque(this);
    int status = FileStore.STATUS.get(this);
    int state = status & FileStore.STATE_MASK;
    // Track whether or not this operation causes the store to open.
    boolean opened = false;
    // Track opening interrupts and failures.
    boolean interrupted = false;
    StoreException error = null;
    // Loop while the store has not been opened.
    do {
      if (state == FileStore.OPENED_STATE) {
        // The store has already been opened;
        // check if we're the thread that opened it.
        if (opened) {
          // Our thread caused the store to open.
          try {
            // Invoke store lifecycle callback.
            this.didOpen();
          } catch (Throwable cause) {
            if (Cont.isNonFatal(cause)) {
              if (error == null) {
                // Capture non-fatal exceptions.
                error = new StoreException("lifecycle callback failure", cause);
              }
            } else {
              // Rethrow fatal exceptions.
              throw cause;
            }
          }
        }
        // Because the initial status load was unordered, the store may
        // technically have already been closed. We don't bother ordering
        // our state check because all we can usefully guarantee is that
        // the store was at some point opened.
        break;
      } else if (state == FileStore.OPENING_STATE) {
        // The store is concurrently opening;
        // check if we're not the thread opening the store.
        if (!opened) {
          // Another thread is opening the store;
          // prepare to wait for the store to finish opening.
          synchronized (this) {
            // Loop while the store is transitioning.
            do {
              // Re-check store status before waiting, synchronizing with
              // concurrent stores.
              //status = (int) FileStore.STATUS_VAR.getAcquire(this);
              status = FileStore.STATUS.get(this);
              state = status & FileStore.STATE_MASK;
              // Ensure the store is still transitioning before waiting.
              if (state == FileStore.OPENING_STATE) {
                try {
                  this.wait(100);
                } catch (InterruptedException e) {
                  // Defer interrupt.
                  interrupted = true;
                }
              } else {
                // The store is no longer transitioning.
                break;
              }
            } while (true);
          }
        } else {
          // We're responsible for opening the store.
          try {
            // Invoke store lifecycle callback.
            this.onOpen();
          } catch (Throwable cause) {
            if (Cont.isNonFatal(cause)) {
              if (error == null) {
                // Capture non-fatal exceptions.
                error = new StoreException("lifecycle callback failure", cause);
              }
            } else {
              // Rethrow fatal exceptions.
              throw cause;
            }
          } finally {
            // Always finish openening the store.
            synchronized (this) {
              do {
                final int oldStatus = status;
                final int newStatus = (oldStatus & ~FileStore.STATE_MASK) | FileStore.OPENED_STATE;
                // Set the store state to opened, synchronizing with concurrent
                // status loads; linearization point for store open completion.
                //status = (int) FileStore.STATUS_VAR.compareAndExchangeAcquire(this, oldStatus, newStatus);
                status = FileStore.STATUS.compareAndSet(this, oldStatus, newStatus) ? oldStatus : FileStore.STATUS.get(this);
                state = status & FileStore.STATE_MASK;
                // Check if we succeeded at transitioning into the opened state.
                if (state == oldStatus) {
                  // Notify waiters that opening is complete.
                  this.notifyAll();
                  break;
                }
              } while (true);
            }
          }
        }
        // Re-check store status.
        continue;
      } else if (state == FileStore.INITIAL_STATE) {
        // The store has not yet been opened.
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~FileStore.STATE_MASK) | FileStore.OPENING_STATE;
        // Try to initiate store opening, synchronizing with concurrent stores;
        // linearization point for store open.
        //status = (int) FileStore.STATUS_VAR.compareAndExchangeAcquire(this, oldStatus, newStatus);
        status = FileStore.STATUS.compareAndSet(this, oldStatus, newStatus) ? oldStatus : FileStore.STATUS.get(this);
        state = status & FileStore.STATE_MASK;
        // Check if we succeeded at transitioning into the opening state.
        if (status == oldStatus) {
          // This operation caused the opening of the store.
          opened = true;
          try {
            // Invoke store lifecycle callback.
            this.willOpen();
          } catch (Throwable cause) {
            if (Cont.isNonFatal(cause)) {
              // Capture non-fatal exceptions.
              error = new StoreException("lifecycle callback failure", cause);
            } else {
              // Rethrow fatal exceptions.
              throw cause;
            }
          }
          // Comtinue opening sequence.
          continue;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else if (state == FileStore.CLOSING_STATE || state == FileStore.CLOSED_STATE) {
        // The store is either currently closing, or has already been closed.
        // Although not currently open, the contract that the store has been
        // opened is met, so we're ready to return.
        break;
      } else {
        throw new AssertionError(Integer.toString(state)); // unreachable
      }
    } while (true);
    if (interrupted) {
      // Resume interrupt.
      Thread.currentThread().interrupt();
    }
    if (error != null) {
      // Close the store.
      this.close();
      // Rethrow the caught exception.
      throw error;
    }
    // Return whether or not this operation caused the store to open.
    return opened;
  }

  /**
   * Lifecycle callback invoked upon entering the opening state.
   */
  protected void willOpen() {
    // hook
  }

  /**
   * Lifecycle callback invoked to actually open the store.
   */
  protected void onOpen() {
    // Open the latest zone.
    this.openZone();
  }

  /**
   * Lifecycle callback invoked upon entering the opened state.
   */
  protected void didOpen() {
    // hook
  }

  @Override
  public boolean close() {
    // Load the current store status, without ordering constraints.
    //int status = (int) FileStore.STATUS_VAR.getOpaque(this);
    int status = FileStore.STATUS.get(this);
    int state = status & FileStore.STATE_MASK;
    // Track whether or not this operation causes the store to close.
    boolean closed = false;
    // Track closing interrupts and failures.
    boolean interrupted = false;
    StoreException error = null;
    // Loop while the store has not been closed.
    do {
      if (state == FileStore.CLOSED_STATE) {
        // The store has already been closed;
        // check if we're the thread that closed it.
        if (closed) {
          // Our thread caused the store to close.
          try {
            // Invoke store lifecycle callback.
            this.didClose();
          } catch (Throwable cause) {
            if (Cont.isNonFatal(cause)) {
              if (error == null) {
                // Capture non-fatal exceptions.
                error = new StoreException("lifecycle callback failure", cause);
              }
            } else {
              // Rethrow fatal exceptions.
              throw cause;
            }
          }
        }
        // The initial status load was unordered, but that's ok because
        // the transition to the closed state is final.
        break;
      } else if (state == FileStore.CLOSING_STATE
              || state == FileStore.OPENING_STATE) {
        // The store is concurrently closing or opening; capture which.
        final int oldState = state;
        // Check if we're not the thread closing the store.
        if (!closed) {
          // Prepare to wait for the store to finish transitioning.
          synchronized (this) {
            // Loop while the store is transitioning.
            do {
              // Re-check store status before waiting, synchronizing with
              // concurrent stores.
              //status = (int) FileStore.STATUS_VAR.getAcquire(this);
              status = FileStore.STATUS.get(this);
              state = status & FileStore.STATE_MASK;
              // Ensure the store is still transitioning before waiting.
              if (state == oldState) {
                try {
                  this.wait(100);
                } catch (InterruptedException e) {
                  // Defer interrupt.
                  interrupted = true;
                }
              } else {
                // The store is no longer transitioning.
                break;
              }
            } while (true);
          }
        } else {
          // We're responsible for closing the store.
          try {
            // Invoke store lifecycle callback.
            this.onClose();
          } catch (Throwable cause) {
            if (Cont.isNonFatal(cause)) {
              if (error == null) {
                // Capture non-fatal exceptions.
                error = new StoreException("lifecycle callback failure", cause);
              }
            } else {
              // Rethrow fatal exceptions.
              throw cause;
            }
          } finally {
            // Always finish closing the store.
            synchronized (this) {
              do {
                final int oldStatus = status;
                final int newStatus = (oldStatus & ~FileStore.STATE_MASK) | FileStore.CLOSED_STATE;
                // Set the store state to closed, synchronizing with concurrent
                // status loads; linearization point for store close completion.
                //status = (int) FileStore.STATUS_VAR.compareAndExchangeAcquire(this, oldStatus, newStatus);
                status = FileStore.STATUS.compareAndSet(this, oldStatus, newStatus) ? oldStatus : FileStore.STATUS.get(this);
                state = status & FileStore.STATE_MASK;
                // Check if we succeeded at transitioning into the closed state.
                if (state == oldStatus) {
                  // Notify waiters that closing is complete.
                  this.notifyAll();
                  break;
                }
              } while (true);
            }
          }
        }
        // Re-check store status.
        continue;
      } else if (state == FileStore.OPENED_STATE) {
        // The store is open, and has not yet been closed.
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~FileStore.STATE_MASK) | FileStore.CLOSING_STATE;
        // Try to initiate store closing, synchronizing with concurrent stores;
        // linearization point for store close.
        //status = (int) FileStore.STATUS_VAR.compareAndExchangeAcquire(this, oldStatus, newStatus);
        status = FileStore.STATUS.compareAndSet(this, oldStatus, newStatus) ? oldStatus : FileStore.STATUS.get(this);
        state = status & FileStore.STATE_MASK;
        // Check if we succeeded at transitioning into the closing state.
        if (status == oldStatus) {
          // This operation caused the closing of the store.
          closed = true;
          try {
            // Invoke store lifecycle callback.
            this.willClose();
          } catch (Throwable cause) {
            if (Cont.isNonFatal(cause)) {
              // Capture non-fatal exceptions.
              error = new StoreException("lifecycle callback failure", cause);
            } else {
              // Rethrow fatal exceptions.
              throw cause;
            }
          }
          // Continue closing sequence.
          continue;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else if (state == FileStore.INITIAL_STATE) {
        // The store has not yet been started; to ensure an orderly
        // sequence of lifecycle state changes, we must first open
        // the store before we can close it.
        this.open();
        continue;
      } else {
        throw new AssertionError(Integer.toString(state)); // unreachable
      }
    } while (true);
    if (interrupted) {
      // Resume interrupt.
      Thread.currentThread().interrupt();
    }
    if (error != null) {
      // Rethrow the caught exception.
      throw error;
    }
    return closed;
  }

  /**
   * Lifecycle callback invoked upon entering the closing state.
   */
  protected void willClose() {
    // hook
  }

  /**
   * Lifecycle callback invoked to actually close the store.
   */
  protected void onClose() {
    // Close all zones.
    this.closeZones();
  }

  /**
   * Lifecycle callback invoked upon entering the closed state.
   */
  protected void didClose() {
    // hook
  }

  @Override
  public int oldestZoneId() {
    final TreeMap<Integer, File> zoneFiles = this.zoneFiles();
    if (!zoneFiles.isEmpty()) {
      return zoneFiles.firstKey();
    } else {
      return 1;
    }
  }

  @Override
  public int newestZoneId() {
    final TreeMap<Integer, File> zoneFiles = this.zoneFiles();
    if (!zoneFiles.isEmpty()) {
      return zoneFiles.lastKey();
    } else {
      return 1;
    }
  }

  @Override
  public FileZone zone() {
    return this.zone;
  }

  @Override
  public FileZone zone(int zoneId) {
    return this.zones.get(zoneId);
  }

  protected Zone openZone() {
    this.directory.mkdirs();
    final TreeMap<Integer, File> zoneFiles = this.zoneFiles();
    do {
      final int zoneId;
      if (!zoneFiles.isEmpty()) {
        zoneId = zoneFiles.lastKey();
        zoneFiles.remove(zoneId);
      } else {
        zoneId = 1;
      }
      final FileZone zone = this.openZone(zoneId);
      if (zoneFiles.isEmpty() || zone.germ().seedRefValue().isDefined()) {
        FileStore.ZONE.set(this, zone);
        return zone;
      } else {
        this.closeZone(zone.id);
        final File oldFile = zone.file;
        if (oldFile.exists()) {
          if (oldFile.length() == 0) {
            // Delete empty zone
            oldFile.delete();
          } else {
            // Move corrupted zone
            final String newFileName = "~" + oldFile.getName() + "-" + System.currentTimeMillis();
            final File newFile = new File(oldFile.getParent(), newFileName);
            oldFile.renameTo(newFile);
          }
        }
        // Open previous zone
        continue;
      }
    } while (true);
  }

  @Override
  public FileZone openZone(int zoneId) {
    FileZone newZone = null;
    do {
      final HashTrieMap<Integer, FileZone> oldZones = this.zones;
      final FileZone oldZone = oldZones.get(zoneId);
      if (oldZone == null) {
        if (newZone == null) {
          final File zoneFile = this.zoneFile(zoneId);
          final FileZone zone = this.zone;
          if (zone == null || zoneId > zone.id || zoneFile.exists()) {
            newZone = new FileZone(this, zoneId, zoneFile, this.stage);
          } else {
            throw new StoreException("failed to open deleted zone " + zoneFile);
          }
        }
        final HashTrieMap<Integer, FileZone> newZones = oldZones.updated(zoneId, newZone);
        if (FileStore.ZONES.compareAndSet(this, oldZones, newZones)) {
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
    newZone.open();
    return newZone;
  }

  void closeZone(int zoneId) {
    do {
      final HashTrieMap<Integer, FileZone> oldZones = this.zones;
      final HashTrieMap<Integer, FileZone> newZones = oldZones.removed(zoneId);
      if (oldZones != newZones) {
        if (FileStore.ZONES.compareAndSet(this, oldZones, newZones)) {
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
        if (FileStore.ZONES.compareAndSet(this, oldZones, newZones)) {
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
  public void deletePost(int post) {
    final Database database = this.openDatabase();
    final TreeMap<Integer, File> zoneFiles = this.zoneFiles();
    while (!zoneFiles.isEmpty()) {
      final int oldestZone = zoneFiles.firstKey();
      if (oldestZone < post) {
        final boolean deleted = zoneFiles.get(oldestZone).delete();
        zoneFiles.remove(oldestZone);
        this.closeZone(oldestZone);
        if (deleted) {
          this.context.databaseDidDeleteZone(this, database, oldestZone);
        }
      } else {
        break;
      }
    }
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
  public Database openDatabase() {
    this.open();
    return this.zone.openDatabase();
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
      if (Cont.isNonFatal(cause)) {
        commit.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public synchronized FileZone shiftZone() {
    this.open();
    final FileZone oldZone = this.zone;
    final int oldZoneId = oldZone.id;
    final int newZoneId = oldZoneId + 1;
    FileZone newZone = null;
    do {
      final HashTrieMap<Integer, FileZone> oldZones = this.zones;
      final FileZone zone = oldZones.get(newZoneId);
      if (zone == null) {
        if (newZone == null) {
          newZone = new FileZone(this, newZoneId, this.zoneFile(newZoneId), this.stage,
                                 oldZone.database, oldZone.germ());
          newZone.open();
        }
        final HashTrieMap<Integer, FileZone> newZones = oldZones.updated(newZoneId, newZone);
        if (FileStore.ZONES.compareAndSet(this, oldZones, newZones)) {
          FileStore.ZONE.set(this, newZone);
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

  static final int INITIAL_STATE = 0;
  static final int OPENING_STATE = 1;
  static final int OPENED_STATE = 2;
  static final int CLOSING_STATE = 3;
  static final int CLOSED_STATE = 4;

  static final int STATE_BITS = 3;
  static final int STATE_MASK = (1 << STATE_BITS) - 1;

  static final int COMMITTING_FLAG = 1 << (FileStore.STATE_BITS + 0);
  static final int COMPACTING_FLAG = 1 << (FileStore.STATE_BITS + 1);

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
