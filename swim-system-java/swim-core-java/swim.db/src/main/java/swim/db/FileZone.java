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
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.Buffer;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.codec.Binary;
import swim.codec.Input;
import swim.codec.Parser;
import swim.codec.Utf8;
import swim.concurrent.Cont;
import swim.concurrent.Conts;
import swim.concurrent.Stage;
import swim.concurrent.Sync;
import swim.recon.Recon;
import swim.structure.Value;

public class FileZone extends Zone {
  final Store store;
  final int id;
  final File file;
  final Stage stage;
  volatile Database database;
  volatile Germ germ;
  volatile long size;
  volatile int status;

  public FileZone(Store store, int id, File file, Stage stage, Database database, Germ germ) {
    if (database == null || germ == null) {
      throw new NullPointerException();
    }
    this.store = store;
    this.id = id;
    this.file = file;
    this.stage = stage;
    this.database = database;
    this.germ = germ;
    this.status = OPENED;
  }

  public FileZone(Store store, int id, File file, Stage stage) {
    this.store = store;
    this.id = id;
    this.file = file;
    this.stage = stage;
  }

  public final Store store() {
    return this.store;
  }

  @Override
  public final int id() {
    return this.id;
  }

  public final File file() {
    return this.file;
  }

  public final Stage stage() {
    return this.stage;
  }

  public final Database database() {
    return this.database;
  }

  @Override
  public final Germ germ() {
    return this.germ;
  }

  @Override
  public final StoreSettings settings() {
    return this.store.settings();
  }

  @Override
  public final long size() {
    return this.size;
  }

  @Override
  public void openAsync(Cont<Zone> cont) {
    try {
      do {
        final int oldStatus = this.status;
        if ((oldStatus & (OPENING | OPENED | FAILED)) == 0) {
          final int newStatus = oldStatus | OPENING;
          if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
            try {
              FileChannel channel = null;
              try {
                channel = openReadChannel();
                this.size = channel.size();
              } catch (FileNotFoundException cause) {
                // Continue with null channel.
              }
              this.stage.execute(new FileZoneOpen(this, channel, cont));
            } catch (Throwable cause) {
              STATUS.set(this, FAILED);
              synchronized (this) {
                notifyAll();
              }
              throw cause;
            }
            break;
          }
        } else {
          if ((oldStatus & OPENING) != 0) {
            synchronized (this) {
              ForkJoinPool.managedBlock(new FileZoneAwait(this));
            }
          }
          if ((this.status & OPENED) != 0) {
            cont.bind(this);
          } else {
            cont.trap(new StoreException("failed to open zone " + this.file.getPath()));
          }
          break;
        }
      } while (true);
    } catch (IOException | InterruptedException cause) {
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
  public FileZone open() throws InterruptedException {
    final Sync<Zone> syncZone = new Sync<Zone>();
    openAsync(syncZone);
    return (FileZone) syncZone.await(settings().zoneOpenTimeout);
  }

  @Override
  public void close() {
    // nop
  }

  @Override
  public void openDatabaseAsync(Cont<Database> cont) {
    try {
      openAsync(new FileZoneOpenDatabase(this, cont));
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public FileChannel openReadChannel() throws IOException {
    return new RandomAccessFile(file, "r").getChannel();
  }

  public FileChannel openWriteChannel() throws IOException {
    return new RandomAccessFile(file, "rw").getChannel();
  }

  void loadPageAsync(FileChannel channel, PageRef pageRef, TreeDelegate treeDelegate,
                     boolean isResident, Cont<Page> cont) {
    try {
      this.stage.execute(new FileZonePageReader(this, channel, pageRef.base(), pageRef.pageSize(),
                                                pageRef, treeDelegate, isResident, cont));
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public Chunk commitAndWriteChunk(Commit commit) {
    final Database database = this.database;
    Chunk chunk = null;
    try (FileChannel channel = openWriteChannel()) {
      FileLock fileLock = null;
      if (!WINDOWS) {
        fileLock = channel.lock();
      }
      try {
        final long base = Math.max(this.size, Math.max(2 * Germ.BLOCK_SIZE, channel.size()));
        chunk = database.commitChunk(commit, this.id, base);
        if (chunk != null) {
          ByteBuffer buffer = chunk.toByteBuffer();
          write(channel, buffer, base);

          final Germ germ = chunk.germ();
          buffer = germ.toByteBuffer();
          write(channel, buffer, 0L);
          ((Buffer) buffer).flip();
          write(channel, buffer, Germ.BLOCK_SIZE);
          if (commit.isForced()) {
            channel.force(true);
          }

          this.size = Math.max(this.size + chunk.size(), channel.size());
        }
        return chunk;
      } finally {
        if (fileLock != null) {
          fileLock.release();
        }
      }
    } catch (IOException cause) {
      if (chunk != null) {
        database.uncommit(chunk.germ.version);
      }
      throw new StoreException(cause);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        if (chunk != null) {
          database.uncommit(chunk.germ.version);
        }
        throw new StoreException(cause);
      } else {
        throw cause;
      }
    }
  }

  void write(FileChannel channel, ByteBuffer buffer, long position) throws IOException {
    int k;
    do {
      k = channel.write(buffer, position);
      position += k;
    } while (k >= 0 && buffer.hasRemaining());
    if (buffer.hasRemaining()) {
      throw new StoreException("wrote incomplete chunk to " + this.file.getPath());
    }
  }

  static final int OPENING = 1 << 0;
  static final int OPENED = 1 << 1;
  static final int FAILED = 1 << 2;

  static final boolean WINDOWS = System.getProperty("os.name").toLowerCase().indexOf("win") >= 0;

  static final AtomicReferenceFieldUpdater<FileZone, Database> DATABASE =
      AtomicReferenceFieldUpdater.newUpdater(FileZone.class, Database.class, "database");

  static final AtomicIntegerFieldUpdater<FileZone> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(FileZone.class, "status");
}

abstract class FileZoneReader implements Runnable {
  protected final FileZone zone;
  protected final FileChannel channel;
  protected final long offset;
  protected final int size;

  protected FileZoneReader(FileZone zone, FileChannel channel, long offset, int size) {
    if (size < 0L) {
      throw new IllegalArgumentException("negative read size: " + size);
    }
    this.zone = zone;
    this.channel = channel;
    this.offset = offset;
    this.size = size;
  }

  protected abstract void bind(ByteBuffer buffer);

  protected abstract void trap(Throwable error);

  protected void doRead(FileChannel channel) {
    try {
      final ByteBuffer buffer = ByteBuffer.allocate(this.size);
      long position = this.offset;
      int k = 0;
      do {
        k = channel.read(buffer, position);
        position += k;
      } while (k >= 0 && buffer.hasRemaining());
      if (!buffer.hasRemaining()) {
        ((Buffer) buffer).flip();
        bind(buffer);
      } else {
        throw new StoreException("incomplete read from " + zone.file.getPath()
                                 + ':' + this.offset + '-' + position);
      }
    } catch (IOException cause) {
      trap(cause);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void run() {
    doRead(this.channel);
  }
}

abstract class FileZoneReconReader extends FileZoneReader {
  protected FileZoneReconReader(FileZone zone, FileChannel channel, long offset, int size) {
    super(zone, channel, offset, size);
  }

  protected abstract void bind(Value value);

  @Override
  protected void bind(ByteBuffer buffer) {
    try {
      final Parser<Value> parser = Utf8.parseDecoded(Recon.structureParser().blockParser(),
                                                     Binary.inputBuffer(buffer));
      if (parser.isDone()) {
        bind(parser.bind());
      } else {
        trap(parser.trap());
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        trap(new StoreException("failed read from " + this.zone.file.getPath()
                                + ':' + this.offset + '-' + this.size, cause));
      } else {
        throw cause;
      }
    }
  }
}

final class FileZonePageReader extends FileZoneReconReader {
  final PageRef pageRef;
  final TreeDelegate treeDelegate;
  final boolean isResident;
  final Cont<Page> cont;

  FileZonePageReader(FileZone zone, FileChannel channel, long offset, int size,
                    PageRef pageRef, TreeDelegate treeDelegate,
                    boolean isResident, Cont<Page> cont) {
    super(zone, channel, offset, size);
    this.pageRef = pageRef;
    this.treeDelegate = treeDelegate;
    this.isResident = isResident;
    this.cont = cont;
  }

  @Override
  protected void bind(Value value) {
    try {
      final Page page = this.pageRef.setPageValue(value, this.isResident);
      if (treeDelegate != null) {
        treeDelegate.treeDidLoadPage(page);
      }
      this.cont.bind(page);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  protected void trap(Throwable error) {
    this.cont.trap(error);
  }
}

final class FileZoneOpenDatabase implements Cont<Zone> {
  final FileZone zone;
  final Cont<Database> cont;

  FileZoneOpenDatabase(FileZone zone, Cont<Database> cont) {
    this.zone = zone;
    this.cont = cont;
  }

  @Override
  public void bind(Zone zone) {
    try {
      Database newDatabase;
      do {
        final Database oldDatabase = this.zone.database;
        if (oldDatabase == null) {
          newDatabase = new Database(this.zone.store, this.zone.germ);
          if (FileZone.DATABASE.compareAndSet(this.zone, oldDatabase, newDatabase)) {
            break;
          }
        } else {
          newDatabase = oldDatabase;
          break;
        }
      } while (true);
      newDatabase.openAsync(this.cont);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        this.cont.trap(cause);
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

final class FileZoneOpen extends FileZoneReader {
  final Cont<Zone> cont;

  FileZoneOpen(FileZone zone, FileChannel channel, Cont<Zone> cont) {
    super(zone, channel, 0L, 2 * Germ.BLOCK_SIZE);
    this.cont = cont;
  }

  @Override
  protected void bind(ByteBuffer buffer) {
    buffer.position(0).limit(Germ.BLOCK_SIZE);
    final Germ germ0 = parseGerm(Utf8.decodedInput(Binary.inputBuffer(buffer)));
    buffer.position(Germ.BLOCK_SIZE).limit(2 * Germ.BLOCK_SIZE);
    final Germ germ1 = parseGerm(Utf8.decodedInput(Binary.inputBuffer(buffer)));
    final Germ germ;
    if (germ0 != null && germ1 != null) {
      if (germ0.updated() < germ1.updated()) {
        germ = germ1;
      } else {
        germ = germ0;
      }
    } else if (germ1 != null) {
      germ = germ1;
    } else if (germ0 != null) {
      germ = germ0;
    } else {
      final long time = System.currentTimeMillis();
      germ = new Germ(10, 1L, time, time, Value.absent());
    }

    this.zone.germ = germ;
    FileZone.STATUS.set(this.zone, FileZone.OPENED);
    this.cont.bind(this.zone);
  }

  @Override
  protected void trap(Throwable error) {
    try {
      FileZone.STATUS.set(this.zone, FileZone.FAILED);
      this.zone.close();
    } finally {
      this.cont.trap(error);
    }
  }

  @Override
  protected void doRead(FileChannel channel) {
    try {
      if (channel != null && this.size <= channel.size()) {
        super.doRead(channel);
      } else {
        final long time = System.currentTimeMillis();
        this.zone.germ = new Germ(10, 1L, time, time, Value.absent());
        FileZone.STATUS.set(this.zone, FileZone.OPENED);
        this.cont.bind(this.zone);
      }
    } catch (IOException cause) {
      trap(cause);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        trap(cause);
      } else {
        throw cause;
      }
    } finally {
      try {
        if (channel != null) {
          channel.close();
        }
      } catch (IOException swallow) {
        swallow.printStackTrace();
      } finally {
        synchronized (this.zone) { // notify waiters under all circumstances
          this.zone.notifyAll();
        }
      }
    }
  }

  protected Germ parseGerm(Input input) {
    try {
      final Parser<Value> parser = Recon.structureParser().parseBlock(input);
      if (parser.isDone()) {
        return Germ.fromValue(parser.bind());
      } else {
        return null;
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        return null;
      } else {
        throw cause;
      }
    }
  }
}

final class FileZoneAwait implements ForkJoinPool.ManagedBlocker {
  final FileZone zone;

  FileZoneAwait(FileZone zone) {
    this.zone = zone;
  }

  @Override
  public boolean isReleasable() {
    return (this.zone.status & FileZone.OPENING) == 0;
  }

  @Override
  public boolean block() throws InterruptedException {
    if ((this.zone.status & FileZone.OPENING) != 0) {
      this.zone.wait();
    }
    return (this.zone.status & FileZone.OPENING) == 0;
  }
}
