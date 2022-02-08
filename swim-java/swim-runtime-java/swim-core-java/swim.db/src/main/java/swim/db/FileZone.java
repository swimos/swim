// Copyright 2015-2021 Swim Inc.
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
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.codec.Binary;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Parser;
import swim.codec.Utf8;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Cont;
import swim.concurrent.Stage;
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
    this.status = FileZone.OPENED_STATE;
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
  public boolean open() {
    // Load the current zone status, without ordering constraints.
    //int status = (int) FileZone.STATUS_VAR.getOpaque(this);
    int status = FileZone.STATUS.get(this);
    int state = status & FileZone.STATE_MASK;
    // Track whether or not this operation causes the zone to open.
    boolean opened = false;
    // Track opening interrupts and failures.
    boolean interrupted = false;
    StoreException error = null;
    // Loop while the zone has not been opened.
    do {
      if (state == FileZone.OPENED_STATE) {
        // The zone has already been opened;
        // check if we're the thread that opened it.
        if (opened) {
          // Our thread caused the zone to open.
          try {
            // Invoke zone lifecycle callback.
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
        // Because the initial status load was unordered, the zone may
        // technically have already been closed. We don't bother ordering
        // our state check because all we can usefully guarantee is that
        // the zone was at some point opened.
        break;
      } else if (state == FileZone.OPENING_STATE) {
        // The zone is concurrently opening;
        // check if we're not the thread opening the zone.
        if (!opened) {
          // Another thread is opening the zone;
          // prepare to wait for the zone to finish opening.
          synchronized (this) {
            // Loop while the zone is transitioning.
            do {
              // Re-check zone status before waiting, synchronizing with
              // concurrent stores.
              //status = (int) FileZone.STATUS_VAR.getAcquire(this);
              status = FileZone.STATUS.get(this);
              state = status & FileZone.STATE_MASK;
              // Ensure the zone is still transitioning before waiting.
              if (state == FileZone.OPENING_STATE) {
                try {
                  this.wait(100);
                } catch (InterruptedException e) {
                  // Defer interrupt.
                  interrupted = true;
                }
              } else {
                // The zone is no longer transitioning.
                break;
              }
            } while (true);
          }
        } else {
          // We're responsible for opening the zone.
          try {
            // Invoke zone lifecycle callback.
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
            // Always finish openening the zone.
            synchronized (this) {
              do {
                final int oldStatus = status;
                final int newStatus = (oldStatus & ~FileZone.STATE_MASK) | FileZone.OPENED_STATE;
                // Set the zone state to opened, synchronizing with concurrent
                // status loads; linearization point for zone open completion.
                //status = (int) FileZone.STATUS_VAR.compareAndExchangeAcquire(this, oldStatus, newStatus);
                status = FileZone.STATUS.compareAndSet(this, oldStatus, newStatus) ? oldStatus : FileZone.STATUS.get(this);
                state = status & FileZone.STATE_MASK;
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
        // Re-check zone status.
        continue;
      } else if (state == FileZone.INITIAL_STATE) {
        // The zone has not yet been opened.
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~FileZone.STATE_MASK) | FileZone.OPENING_STATE;
        // Try to initiate zone opening, synchronizing with concurrent stores;
        // linearization point for zone open.
        //status = (int) FileZone.STATUS_VAR.compareAndExchangeAcquire(this, oldStatus, newStatus);
        status = FileZone.STATUS.compareAndSet(this, oldStatus, newStatus) ? oldStatus : FileZone.STATUS.get(this);
        state = status & FileZone.STATE_MASK;
        // Check if we succeeded at transitioning into the opening state.
        if (status == oldStatus) {
          // This operation caused the opening of the zone.
          opened = true;
          try {
            // Invoke zone lifecycle callback.
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
      } else if (state == FileZone.CLOSING_STATE || state == FileZone.CLOSED_STATE) {
        // The zone is either currently closing, or has already been closed.
        // Although not currently open, the contract that the zone has been
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
      // Close the zone.
      this.close();
      // Rethrow the caught exception.
      throw error;
    }
    // Return whether or not this operation caused the zone to open.
    return opened;
  }

  /**
   * Lifecycle callback invoked upon entering the opening state.
   */
  protected void willOpen() {
    // hook
  }

  /**
   * Lifecycle callback invoked to actually open the zone.
   */
  protected void onOpen() {
    // Load the zone header.
    this.loadGerm();
  }

  /**
   * Lifecycle callback invoked upon entering the opened state.
   */
  protected void didOpen() {
    // hook
  }

  @Override
  public boolean close() {
    // Load the current zone status, without ordering constraints.
    //int status = (int) FileZone.STATUS_VAR.getOpaque(this);
    int status = FileZone.STATUS.get(this);
    int state = status & FileZone.STATE_MASK;
    // Track whether or not this operation causes the zone to close.
    boolean closed = false;
    // Track closing interrupts and failures.
    boolean interrupted = false;
    StoreException error = null;
    // Loop while the zone has not been closed.
    do {
      if (state == FileZone.CLOSED_STATE) {
        // The zone has already been closed;
        // check if we're the thread that closed it.
        if (closed) {
          // Our thread caused the zone to close.
          try {
            // Invoke zone lifecycle callback.
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
      } else if (state == FileZone.CLOSING_STATE
              || state == FileZone.OPENING_STATE) {
        // The zone is concurrently closing or opening; capture which.
        final int oldState = state;
        // Check if we're not the thread closing the zone.
        if (!closed) {
          // Prepare to wait for the zone to finish transitioning.
          synchronized (this) {
            // Loop while the zone is transitioning.
            do {
              // Re-check zone status before waiting, synchronizing with
              // concurrent stores.
              //status = (int) FileZone.STATUS_VAR.getAcquire(this);
              status = FileZone.STATUS.get(this);
              state = status & FileZone.STATE_MASK;
              // Ensure the zone is still transitioning before waiting.
              if (state == oldState) {
                try {
                  this.wait(100);
                } catch (InterruptedException e) {
                  // Defer interrupt.
                  interrupted = true;
                }
              } else {
                // The zone is no longer transitioning.
                break;
              }
            } while (true);
          }
        } else {
          // We're responsible for closing the zone.
          try {
            // Invoke zone lifecycle callback.
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
            // Always finish closing the zone.
            synchronized (this) {
              do {
                final int oldStatus = status;
                final int newStatus = (oldStatus & ~FileZone.STATE_MASK) | FileZone.CLOSED_STATE;
                // Set the zone state to closed, synchronizing with concurrent
                // status loads; linearization point for zone close completion.
                //status = (int) FileZone.STATUS_VAR.compareAndExchangeAcquire(this, oldStatus, newStatus);
                status = FileZone.STATUS.compareAndSet(this, oldStatus, newStatus) ? oldStatus : FileZone.STATUS.get(this);
                state = status & FileZone.STATE_MASK;
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
        // Re-check zone status.
        continue;
      } else if (state == FileZone.OPENED_STATE) {
        // The zone is open, and has not yet been closed.
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~FileZone.STATE_MASK) | FileZone.CLOSING_STATE;
        // Try to initiate zone closing, synchronizing with concurrent stores;
        // linearization point for zone close.
        //status = (int) FileZone.STATUS_VAR.compareAndExchangeAcquire(this, oldStatus, newStatus);
        status = FileZone.STATUS.compareAndSet(this, oldStatus, newStatus) ? oldStatus : FileZone.STATUS.get(this);
        state = status & FileZone.STATE_MASK;
        // Check if we succeeded at transitioning into the closing state.
        if (status == oldStatus) {
          // This operation caused the closing of the zone.
          closed = true;
          try {
            // Invoke zone lifecycle callback.
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
      } else if (state == FileZone.INITIAL_STATE) {
        // The zone has not yet been started; to ensure an orderly
        // sequence of lifecycle state changes, we must first open
        // the zone before we can close it.
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
   * Lifecycle callback invoked to actually close the zone.
   */
  protected void onClose() {
    // hook
  }

  /**
   * Lifecycle callback invoked upon entering the closed state.
   */
  protected void didClose() {
    // hook
  }

  protected Germ loadGerm() {
    Germ germ;
    try (FileChannel channel = this.openReadChannel()) {
      this.size = channel.size();
      final long offset = 0L;
      final int size = 2 * Germ.BLOCK_SIZE;
      if (size <= this.size) {
        final ByteBuffer buffer = ByteBuffer.allocate(size);
        long position = offset;
        int k = 0;
        do {
          k = channel.read(buffer, position);
          position += k;
        } while (k >= 0 && buffer.hasRemaining());
        if (buffer.hasRemaining()) {
          throw new StoreException("incomplete header read from " + this.file.getPath()
                                 + ':' + offset + '-' + position);
        }
        ((Buffer) buffer).position(0).limit(Germ.BLOCK_SIZE);
        final Germ germ0 = this.parseGerm(Utf8.decodedInput(Binary.inputBuffer(buffer)));
        ((Buffer) buffer).position(Germ.BLOCK_SIZE).limit(2 * Germ.BLOCK_SIZE);
        final Germ germ1 = this.parseGerm(Utf8.decodedInput(Binary.inputBuffer(buffer)));
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
      } else {
        final long time = System.currentTimeMillis();
        germ = new Germ(10, 1L, time, time, Value.absent());
      }
    } catch (FileNotFoundException cause) {
      final long time = System.currentTimeMillis();
      germ = new Germ(10, 1L, time, time, Value.absent());
    } catch (IOException cause) {
      throw new StoreException("failed to load header from " + this.file.getPath(), cause);
    }
    this.germ = germ;
    return germ;
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
      if (Cont.isNonFatal(cause)) {
        return null;
      } else {
        throw cause;
      }
    }
  }

  @Override
  public Database openDatabase() {
    this.open();
    Database newDatabase = null;
    do {
      final Database oldDatabase = FileZone.DATABASE.get(this);
      if (oldDatabase != null) {
        newDatabase = oldDatabase;
        break;
      } else {
        if (newDatabase == null) {
          newDatabase = new Database(this.store, this.germ);
        }
        if (FileZone.DATABASE.compareAndSet(this, oldDatabase, newDatabase)) {
          break;
        }
      }
    } while (true);
    newDatabase.open();
    return newDatabase;
  }

  public FileChannel openReadChannel() throws IOException {
    return new RandomAccessFile(this.file, "r").getChannel();
  }

  public FileChannel openWriteChannel() throws IOException {
    return new RandomAccessFile(this.file, "rw").getChannel();
  }

  Page loadPage(FileChannel channel, PageRef pageRef, TreeDelegate treeDelegate, boolean isResident) {
    final long offset = pageRef.base();
    final int size = pageRef.pageSize();
    final ByteBuffer buffer = ByteBuffer.allocate(size);
    long position = offset;
    try {
      int k = 0;
      do {
        k = channel.read(buffer, position);
        position += k;
      } while (k >= 0 && buffer.hasRemaining());
    } catch (IOException cause) {
      throw new StoreException("failed to read page from " + this.file.getPath()
                             + ':' + offset + '-' + size, cause);
    }
    if (buffer.hasRemaining()) {
      throw new StoreException("incomplete page read from " + this.file.getPath()
                             + ':' + offset + '-' + position);
    }
    ((Buffer) buffer).flip();
    try {
      final Parser<Value> parser = Utf8.parseDecoded(Binary.inputBuffer(buffer),
                                                     Recon.structureParser().blockParser());
      final Value value = parser.bind();
      final Page page = pageRef.setPageValue(value, isResident);
      if (treeDelegate != null) {
        treeDelegate.treeDidLoadPage(page);
      }
      return page;
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        throw new StoreException("failed to decode page from " + this.file.getPath()
                               + ':' + offset + '-' + size, cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public Chunk commitAndWriteChunk(Commit commit) {
    final Database database = this.database;
    Chunk chunk = null;
    try (FileChannel channel = this.openWriteChannel()) {
      FileLock fileLock = null;
      if (!FileZone.WINDOWS) {
        fileLock = channel.lock();
      }
      try {
        final long base = Math.max(this.size, Math.max(2 * Germ.BLOCK_SIZE, channel.size()));
        chunk = database.commitChunk(commit, this.id, base);
        if (chunk != null) {
          long step = base;

          final FingerTrieSeq<Page> pages = chunk.pages;
          for (int i = 0; i < pages.size(); i += 1) {
            final Page page = pages.get(i);
            final int pageSize = page.pageSize();
            final OutputBuffer<ByteBuffer> output = Binary.outputBuffer(new byte[pageSize]);
            final Output<ByteBuffer> encoder = Utf8.encodedOutput(output);
            page.writePage(encoder);
            final ByteBuffer pageBuffer = output.bind();
            if (pageBuffer.remaining() != pageSize) {
              throw new StoreException("serialized page size of " + pageBuffer.remaining() + " bytes "
                                     + "does not match expected page size of " + pageSize + " bytes");
            }
            this.write(channel, pageBuffer, step);
            step += pageSize;
          }

          if (commit.isForced()) {
            // prevent header update from reordering before chunk write
            channel.force(true);
          }

          final long actualSize = channel.size();
          final long expectedSize = base + chunk.size();
          if (actualSize != expectedSize) {
            throw new StoreException("inconsistent size detected for file "
                                   + this.file.getPath() + " after chunk write;"
                                   + " expected length of " + expectedSize + " bytes,"
                                   + " but found length of " + actualSize + " bytes");
          }

          final Germ germ = chunk.germ();
          final ByteBuffer germBuffer = germ.toByteBuffer();
          this.write(channel, germBuffer, 0L);
          ((Buffer) germBuffer).flip();
          this.write(channel, germBuffer, Germ.BLOCK_SIZE);
          if (commit.isForced()) {
            channel.force(true);
          }

          this.size = actualSize;
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
      if (Cont.isNonFatal(cause)) {
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
    final long base = position;
    do {
      position += (long) channel.write(buffer, position);
    } while (buffer.hasRemaining());
    if (buffer.hasRemaining()) {
      throw new StoreException("wrote incomplete chunk to " + this.file.getPath());
    }
  }

  static final int INITIAL_STATE = 0;
  static final int OPENING_STATE = 1;
  static final int OPENED_STATE = 2;
  static final int CLOSING_STATE = 3;
  static final int CLOSED_STATE = 4;

  static final int STATE_BITS = 3;
  static final int STATE_MASK = (1 << STATE_BITS) - 1;

  static final boolean WINDOWS = System.getProperty("os.name").toLowerCase().indexOf("win") >= 0;

  static final AtomicReferenceFieldUpdater<FileZone, Database> DATABASE =
      AtomicReferenceFieldUpdater.newUpdater(FileZone.class, Database.class, "database");
  static final AtomicIntegerFieldUpdater<FileZone> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(FileZone.class, "status");

}
