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

import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicLongFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.concurrent.Cont;
import swim.concurrent.Stage;
import swim.concurrent.Sync;
import swim.math.Z2Form;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Text;
import swim.structure.Value;
import swim.util.Builder;
import swim.util.Cursor;
import swim.util.Murmur3;

public class Database {

  final Store store;
  volatile DatabaseDelegate delegate;
  volatile Germ germ;
  volatile int stem;
  volatile int post;
  int stablePost;
  volatile long version;
  volatile long diffSize;
  volatile long treeSize;
  final Trunk<BTree> metaTrunk;
  final Trunk<BTree> seedTrunk;
  volatile HashTrieMap<Value, Trunk<Tree>> trunks;
  volatile HashTrieMap<Value, Trunk<Tree>> sprouts;
  Value commitKey;
  Value evacuateKey;
  int evacuationPass;
  volatile int status;

  Database(Store store, int stem, long version) {
    this.store = store;
    this.stem = stem;
    this.post = store.oldestZoneId();
    this.stablePost = this.post;
    this.version = version;
    this.metaTrunk = new Trunk<BTree>(this, Record.create(1).attr("meta"), null);
    this.metaTrunk.tree = new BTree(this.metaTrunk, 0, version, true, false);
    this.seedTrunk = new Trunk<BTree>(this, Record.create(1).attr("seed"), null);
    this.seedTrunk.tree = new BTree(this.seedTrunk, 1, version, true, false);
    this.trunks = HashTrieMap.empty();
    this.sprouts = HashTrieMap.empty();

    final long time = System.currentTimeMillis();
    this.germ = new Germ(stem, version, time, time, this.seedTrunk.tree.rootRef().toValue());
  }

  Database(Store store, Germ germ) {
    this.store = store;
    this.germ = germ;
    this.stem = germ.stem();
    this.post = store.oldestZoneId();
    this.stablePost = this.post;
    this.version = germ.version() + 1L;
    this.metaTrunk = new Trunk<BTree>(this, Record.create(1).attr("meta"), null);
    this.metaTrunk.tree = new BTree(this.metaTrunk, 0, this.version, true, false);
    this.seedTrunk = new Trunk<BTree>(this, Record.create(1).attr("seed"), null);
    this.seedTrunk.tree = new BTree(this.seedTrunk, germ.seed(), true, false);
    this.trunks = HashTrieMap.empty();
    this.sprouts = HashTrieMap.empty();
  }

  Database(Store store) {
    this(store, 10, 1L);
  }

  public Store store() {
    return this.store;
  }

  public StoreSettings settings() {
    return this.store.settings();
  }

  public Stage stage() {
    return this.store.stage();
  }

  public DatabaseDelegate databaseDelegate() {
    return this.delegate;
  }

  public void setDatabaseDelegate(DatabaseDelegate delegate) {
    this.delegate = delegate;
  }

  public Germ germ() {
    return this.germ;
  }

  public int stem() {
    return this.stem;
  }

  public int post() {
    return this.post;
  }

  public long version() {
    return this.version;
  }

  public long diffSize() {
    return Database.DIFF_SIZE.get(this);
  }

  public long treeSize() {
    return this.treeSize;
  }

  public long treeCount() {
    return Trunk.TREE.get(this.seedTrunk).span();
  }

  public int trunkCount() {
    return this.trunks.size();
  }

  public boolean isCompacting() {
    return this.evacuationPass != 0;
  }

  public boolean open() {
    // Load the current database status, without ordering constraints.
    //int status = (int) Database.STATUS_VAR.getOpaque(this);
    int status = Database.STATUS.get(this);
    int state = status & Database.STATE_MASK;
    // Track whether or not this operation causes the database to open.
    boolean opened = false;
    // Track opening interrupts and failures.
    boolean interrupted = false;
    StoreException error = null;
    // Loop while the database has not been opened.
    do {
      if (state == Database.OPENED_STATE) {
        // The database has already been opened;
        // check if we're the thread that opened it.
        if (opened) {
          // Our thread caused the database to open.
          try {
            // Invoke database lifecycle callback.
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
        // Because the initial status load was unordered, the database may
        // technically have already been closed. We don't bother ordering
        // our state check because all we can usefully guarantee is that
        // the database was at some point opened.
        break;
      } else if (state == Database.OPENING_STATE) {
        // The database is concurrently opening;
        // check if we're not the thread opening the database.
        if (!opened) {
          // Another thread is opening the database;
          // prepare to wait for the database to finish opening.
          synchronized (this) {
            // Loop while the database is transitioning.
            do {
              // Re-check database status before waiting, synchronizing with
              // concurrent databases.
              //status = (int) Database.STATUS_VAR.getAcquire(this);
              status = Database.STATUS.get(this);
              state = status & Database.STATE_MASK;
              // Ensure the database is still transitioning before waiting.
              if (state == Database.OPENING_STATE) {
                try {
                  this.wait(100);
                } catch (InterruptedException e) {
                  // Defer interrupt.
                  interrupted = true;
                }
              } else {
                // The database is no longer transitioning.
                break;
              }
            } while (true);
          }
        } else {
          // We're responsible for opening the database.
          try {
            // Invoke database lifecycle callback.
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
            // Always finish openening the database.
            synchronized (this) {
              do {
                final int oldStatus = status;
                final int newStatus = (oldStatus & ~Database.STATE_MASK) | Database.OPENED_STATE;
                // Set the database state to opened, synchronizing with concurrent
                // status loads; linearization point for database open completion.
                //status = (int) Database.STATUS_VAR.compareAndExchangeAcquire(this, oldStatus, newStatus);
                status = Database.STATUS.compareAndSet(this, oldStatus, newStatus) ? oldStatus : Database.STATUS.get(this);
                state = status & Database.STATE_MASK;
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
        // Re-check database status.
        continue;
      } else if (state == Database.INITIAL_STATE) {
        // The database has not yet been opened.
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~Database.STATE_MASK) | Database.OPENING_STATE;
        // Try to initiate database opening, synchronizing with concurrent databases;
        // linearization point for database open.
        //status = (int) Database.STATUS_VAR.compareAndExchangeAcquire(this, oldStatus, newStatus);
        status = Database.STATUS.compareAndSet(this, oldStatus, newStatus) ? oldStatus : Database.STATUS.get(this);
        state = status & Database.STATE_MASK;
        // Check if we succeeded at transitioning into the opening state.
        if (status == oldStatus) {
          // This operation caused the opening of the database.
          opened = true;
          try {
            // Invoke database lifecycle callback.
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
      } else if (state == Database.CLOSING_STATE || state == Database.CLOSED_STATE) {
        // The database is either currently closing, or has already been closed.
        // Although not currently open, the contract that the database has been
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
      // Close the database.
      this.close();
      // Rethrow the caught exception.
      throw error;
    }
    // Return whether or not this operation caused the database to open.
    return opened;
  }

  /**
   * Lifecycle callback invoked upon entering the opening state.
   */
  protected void willOpen() {
    this.store.databaseWillOpen(this);
  }

  /**
   * Lifecycle callback invoked to actually open the database.
   */
  protected void onOpen() {
    final BTree seedTree = ((BTree) Trunk.TREE.get(this.seedTrunk));
    seedTree.load();
    long treeSize = 0L;
    final Cursor<Map.Entry<Value, Value>> seedCursor = seedTree.cursor();
    while (seedCursor.hasNext()) {
      final Value seedValue = seedCursor.next().getValue();
      final Value sizeValue = seedValue.get("root").head().toValue().get("area");
      treeSize += sizeValue.longValue(0L);
    }
    Database.TREE_SIZE.set(this, treeSize);
  }

  /**
   * Lifecycle callback invoked upon entering the opened state.
   */
  protected void didOpen() {
    this.store.databaseDidOpen(this);
  }

  public boolean close() {
    // Load the current database status, without ordering constraints.
    //int status = (int) Database.STATUS_VAR.getOpaque(this);
    int status = Database.STATUS.get(this);
    int state = status & Database.STATE_MASK;
    // Track whether or not this operation causes the database to close.
    boolean closed = false;
    // Track closing interrupts and failures.
    boolean interrupted = false;
    StoreException error = null;
    // Loop while the database has not been closed.
    do {
      if (state == Database.CLOSED_STATE) {
        // The database has already been closed;
        // check if we're the thread that closed it.
        if (closed) {
          // Our thread caused the database to close.
          try {
            // Invoke database lifecycle callback.
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
      } else if (state == Database.CLOSING_STATE
              || state == Database.OPENING_STATE) {
        // The database is concurrently closing or opening; capture which.
        final int oldState = state;
        // Check if we're not the thread closing the database.
        if (!closed) {
          // Prepare to wait for the database to finish transitioning.
          synchronized (this) {
            // Loop while the database is transitioning.
            do {
              // Re-check database status before waiting, synchronizing with
              // concurrent databases.
              //status = (int) Database.STATUS_VAR.getAcquire(this);
              status = Database.STATUS.get(this);
              state = status & Database.STATE_MASK;
              // Ensure the database is still transitioning before waiting.
              if (state == oldState) {
                try {
                  this.wait(100);
                } catch (InterruptedException e) {
                  // Defer interrupt.
                  interrupted = true;
                }
              } else {
                // The database is no longer transitioning.
                break;
              }
            } while (true);
          }
        } else {
          // We're responsible for closing the database.
          try {
            // Invoke database lifecycle callback.
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
            // Always finish closing the database.
            synchronized (this) {
              do {
                final int oldStatus = status;
                final int newStatus = (oldStatus & ~Database.STATE_MASK) | Database.CLOSED_STATE;
                // Set the database state to closed, synchronizing with concurrent
                // status loads; linearization point for database close completion.
                //status = (int) Database.STATUS_VAR.compareAndExchangeAcquire(this, oldStatus, newStatus);
                status = Database.STATUS.compareAndSet(this, oldStatus, newStatus) ? oldStatus : Database.STATUS.get(this);
                state = status & Database.STATE_MASK;
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
        // Re-check database status.
        continue;
      } else if (state == Database.OPENED_STATE) {
        // The database is open, and has not yet been closed.
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~Database.STATE_MASK) | Database.CLOSING_STATE;
        // Try to initiate database closing, synchronizing with concurrent databases;
        // linearization point for database close.
        //status = (int) Database.STATUS_VAR.compareAndExchangeAcquire(this, oldStatus, newStatus);
        status = Database.STATUS.compareAndSet(this, oldStatus, newStatus) ? oldStatus : Database.STATUS.get(this);
        state = status & Database.STATE_MASK;
        // Check if we succeeded at transitioning into the closing state.
        if (status == oldStatus) {
          // This operation caused the closing of the database.
          closed = true;
          try {
            // Invoke database lifecycle callback.
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
      } else if (state == Database.INITIAL_STATE) {
        // The database has not yet been started; to ensure an orderly
        // sequence of lifecycle state changes, we must first open
        // the database before we can close it.
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
   * Lifecycle callback invoked to actually close the database.
   */
  protected void onClose() {
    // hook
  }

  /**
   * Lifecycle callback invoked upon entering the closed state.
   */
  protected void didClose() {
    this.store.databaseDidClose(this);
  }

  @SuppressWarnings("unchecked")
  public <T extends Tree> Trunk<T> openTrunk(Value name, TreeType treeType, boolean isResident, boolean isTransient) {
    Trunk<T> newTrunk = null;
    boolean created = false;
    do {
      final HashTrieMap<Value, Trunk<Tree>> oldTrunks = this.trunks;
      final Trunk<Tree> oldTrunk = oldTrunks.get(name);
      if (oldTrunk == null) {
        if (newTrunk == null) {
          final Seed seed = Seed.fromValue(((BTree) Trunk.TREE.get(this.seedTrunk)).get(name));
          newTrunk = new Trunk<T>(this, name, null);
          if (seed != null) {
            newTrunk.tree = (T) seed.treeType().treeFromSeed(newTrunk, seed, isResident, isTransient);
          } else if (treeType != null) {
            final int stem = Database.STEM.getAndIncrement(this);
            newTrunk.tree = (T) treeType.emptyTree(newTrunk, stem, this.version, isResident, isTransient);
            created = true;
          } else {
            return null;
          }
        }
        final HashTrieMap<Value, Trunk<Tree>> newTrunks = oldTrunks.updated(name, (Trunk<Tree>) newTrunk);
        if (Database.TRUNKS.compareAndSet(this, oldTrunks, newTrunks)) {
          if (created) {
            this.databaseDidCreateTrunk(newTrunk);
          }
          this.databaseDidOpenTrunk(newTrunk);
          return newTrunk;
        }
      } else {
        return (Trunk<T>) oldTrunk;
      }
    } while (true);
  }

  public Trunk<BTree> openBTreeTrunk(Value name, boolean isResident, boolean isTransient) {
    return this.openTrunk(name, TreeType.BTREE, isResident, isTransient);
  }

  public BTreeMap openBTreeMap(Value name, boolean isResident, boolean isTransient) {
    return new BTreeMap(this.openBTreeTrunk(name, isResident, isTransient));
  }

  public BTreeMap openBTreeMap(Value name) {
    return new BTreeMap(this.openBTreeTrunk(name, false, false));
  }

  public BTreeMap openBTreeMap(String name) {
    return new BTreeMap(this.openBTreeTrunk(Text.from(name), false, false));
  }

  public Trunk<QTree> openQTreeTrunk(Value name, boolean isResident, boolean isTransient) {
    return this.openTrunk(name, TreeType.QTREE, isResident, isTransient);
  }

  public <S> QTreeMap<S> openQTreeMap(Value name, Z2Form<S> shapeForm, boolean isResident, boolean isTransient) {
    return new QTreeMap<S>(this.openQTreeTrunk(name, isResident, isTransient), shapeForm);
  }

  public <S> QTreeMap<S> openQTreeMap(Value name, Z2Form<S> shapeForm) {
    return new QTreeMap<S>(this.openQTreeTrunk(name, false, false), shapeForm);
  }

  public <S> QTreeMap<S> openQTreeMap(String name, Z2Form<S> shapeForm) {
    return new QTreeMap<S>(this.openQTreeTrunk(Text.from(name), false, false), shapeForm);
  }

  public Trunk<STree> openSTreeTrunk(Value name, boolean isResident, boolean isTransient) {
    return this.openTrunk(name, TreeType.STREE, isResident, isTransient);
  }

  public STreeList openSTreeList(Value name, boolean isResident, boolean isTransient) {
    return new STreeList(this.openSTreeTrunk(name, isResident, isTransient));
  }

  public STreeList openSTreeList(Value name) {
    return new STreeList(this.openSTreeTrunk(name, false, false));
  }

  public STreeList openSTreeList(String name) {
    return new STreeList(this.openSTreeTrunk(Text.from(name), false, false));
  }

  private Trunk<UTree> openUTreeTrunk(Value name, boolean isResident, boolean isTransient) {
    return this.openTrunk(name, TreeType.UTREE, isResident, isTransient);
  }

  public UTreeValue openUTreeValue(Value name) {
    return new UTreeValue(this.openUTreeTrunk(name, false, false));
  }

  public UTreeValue openUTreeValue(String name) {
    return new UTreeValue(this.openUTreeTrunk(Text.from(name), false, false));
  }

  public Trunk<Tree> closeTrunk(Value name) {
    do {
      final HashTrieMap<Value, Trunk<Tree>> oldTrunks = this.trunks;
      final HashTrieMap<Value, Trunk<Tree>> newTrunks = oldTrunks.removed(name);
      if (Database.TRUNKS.compareAndSet(this, oldTrunks, newTrunks)) {
        final Trunk<Tree> oldTrunk = oldTrunks.get(name);
        if (oldTrunk != null) {
          this.databaseDidCloseTrunk(oldTrunk);
        }
        return oldTrunk;
      }
    } while (true);
  }

  public void removeTree(Value name) {
    final Trunk<Tree> oldTrunk = this.closeTrunk(name);
    do {
      final HashTrieMap<Value, Trunk<Tree>> oldSprouts = Database.SPROUTS.get(this);
      final HashTrieMap<Value, Trunk<Tree>> newSprouts = oldSprouts.removed(name);
      if (Database.SPROUTS.compareAndSet(this, oldSprouts, newSprouts)) {
        break;
      }
    } while (true);
    if (oldTrunk != null) {
      final int oldDiffSize = Trunk.DIFF_SIZE.getAndSet(oldTrunk, 0);
      Database.DIFF_SIZE.addAndGet(this, -((long) oldDiffSize));
    }
    do {
      final long newVersion = this.version;
      final BTree oldSeedTree = (BTree) Trunk.TREE.get(this.seedTrunk);
      final BTree newSeedTree = oldSeedTree.removed(name, newVersion, this.post);
      if (oldSeedTree != newSeedTree) {
        if (Trunk.TREE.compareAndSet(this.seedTrunk, oldSeedTree, newSeedTree)) {
          final Value seedValue = oldSeedTree.get(name);
          final Value sizeValue = seedValue.get("root").head().toValue().get("area");
          final long treeSize = sizeValue.longValue(0L);
          Database.TREE_SIZE.addAndGet(this, -treeSize);
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  public void commitAsync(Commit commit) {
    try {
      if (Database.DIFF_SIZE.get(this) > 0L) {
        this.store.commitAsync(commit);
      } else {
        commit.bind(null);
      }
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        commit.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public Chunk commit(Commit commit) throws InterruptedException {
    if (Database.DIFF_SIZE.get(this) > 0L) {
      final Sync<Chunk> syncChunk = new Sync<Chunk>();
      this.commitAsync(commit.andThen(syncChunk));
      return syncChunk.await();
    } else {
      return null;
    }
  }

  public void shiftZone() {
    this.store.shiftZone();
  }

  public Chunk commitChunk(Commit commit, int zone, long base) {
    final long version = Database.VERSION.getAndIncrement(this);
    final long time = System.currentTimeMillis();
    int post = this.post;

    final Builder<Tree, FingerTrieSeq<Tree>> treeBuilder = FingerTrieSeq.builder();
    final Builder<Page, FingerTrieSeq<Page>> pageBuilder = FingerTrieSeq.builder();
    long step = base;

    if (this.evacuationPass == 0 && post < zone) {
      final long treeSize = this.treeSize;
      final long storeSize = this.store.size();
      final double treeFill = (double) treeSize / (double) storeSize;
      if (storeSize > this.settings().minCompactSize && treeFill < this.settings().minTreeFill) {
        post = zone;
        this.evacuateKey = null;
        this.evacuationPass = 1;
        this.post = post;
        this.databaseWillCompact(post);
        this.store.databaseWillCompact(this, post);
      }
    }

    final Value startCommitKey = this.commitKey;
    final int startCommitKeyHash = Murmur3.hash(startCommitKey);
    boolean commitKeyRollover = false;

    // Commit data pages
    Value prevCommitKey = startCommitKey;
    do {
      Value nextCommitKey;
      Trunk<Tree> nextTrunk = null;

      // Get the next tree to commit
      do {
        final HashTrieMap<Value, Trunk<Tree>> oldSprouts = Database.SPROUTS.get(this);
        nextCommitKey = oldSprouts.nextKey(prevCommitKey);
        boolean rollover = commitKeyRollover;
        if (nextCommitKey == null) {
          rollover = true;
          nextCommitKey = oldSprouts.nextKey(null);
        }
        if (nextCommitKey == null) {
          // Nothing to commit
          break;
        } else if (rollover) {
          final int nextKeyHash = Murmur3.hash(nextCommitKey);
          if (HashTrieMap.compareKeyHashes(startCommitKeyHash, nextKeyHash) <= 0) {
            // Cycled through all trees
            break;
          }
        }
        nextTrunk = oldSprouts.get(nextCommitKey);
        final HashTrieMap<Value, Trunk<Tree>> newSprouts = oldSprouts.removed(nextCommitKey);
        if (Database.SPROUTS.compareAndSet(this, oldSprouts, newSprouts)) {
          this.commitKey = nextCommitKey;
          prevCommitKey = nextCommitKey;
          commitKeyRollover = rollover;
          break;
        }
      } while (true);

      // Commit the next tree
      if (nextTrunk != null) {
        do {
          final Tree oldTree = Trunk.TREE.get(nextTrunk);
          final Tree newTree = oldTree.committed(zone, step, version, time);
          if (oldTree == newTree) {
            break;
          } else if (Trunk.TREE.compareAndSet(nextTrunk, oldTree, newTree)) {
            Database.DIFF_SIZE.addAndGet(this, -((long) Trunk.DIFF_SIZE.getAndSet(nextTrunk, 0)));
            do {
              final BTree oldSeedTree = (BTree) Trunk.TREE.get(this.seedTrunk);
              final BTree newSeedTree = oldSeedTree.updated(nextTrunk.name, newTree.seed().toValue(), version, post);
              if (Trunk.TREE.compareAndSet(this.seedTrunk, oldSeedTree, newSeedTree)) {
                break;
              }
            } while (true);
            treeBuilder.add(newTree);
            newTree.buildDiff(version, pageBuilder);
            Database.TREE_SIZE.addAndGet(this, newTree.treeSize() - oldTree.treeSize());
            newTree.treeContext().treeDidCommit(newTree, oldTree);
            step += newTree.diffSize(version);
            break;
          }
        } while (true);
      } else {
        break;
      }

      if ((step - base) > this.settings().maxCommitSize) {
        break;
      }
      if (System.currentTimeMillis() - time > this.settings().maxCommitTime) {
        break;
      }
    } while (true);

    // Incrementally compact the store
    if (this.evacuationPass != 0) {
      final long startEvacuationBase = base;
      final long startEvacuationTime = System.currentTimeMillis();

      // Evacuate data pages
      do {
        final BTree seedTree = (BTree) Trunk.TREE.get(this.seedTrunk);
        final Value nextEvacuateKey = seedTree.nextKey(this.evacuateKey);
        this.evacuateKey = nextEvacuateKey;
        if (nextEvacuateKey == null) {
          this.evacuationPass += 1;
          if (this.evacuationPass <= 2) {
            // Finished evacuation pass
            break;
          } else {
            // Completed evacuation
            this.stablePost = post;
            this.evacuationPass = 0;
            this.databaseDidCompact(post);
            this.store.databaseDidCompact(this, post);
            break;
          }
        }
        final Value seedValue = seedTree.get(nextEvacuateKey);
        final Seed seed = Seed.fromValue(seedValue);
        Trunk<Tree> trunk = new Trunk<Tree>(this, nextEvacuateKey, null);
        Tree tree = seed.treeType().treeFromSeed(trunk, seed, false, false);
        trunk.tree = tree;
        final int treePost = tree.rootRef().post();
        if (treePost != 0 && treePost < post) {
          trunk = this.openTrunk(nextEvacuateKey, null, false, false);
          tree = trunk.tree;
          // Evacuate next tree
          do {
            final Tree oldTree = Trunk.TREE.get(trunk);
            final Tree newTree = oldTree.evacuated(post, version);
            if (oldTree == newTree) {
              break;
            } else if (Trunk.TREE.compareAndSet(trunk, oldTree, newTree)) {
              final int newPost = newTree.post();
              if (newPost == 0 || newPost >= post) {
                break;
              }
            }
          } while (true);
          // Commit next tree
          do {
            final Tree oldTree = Trunk.TREE.get(trunk);
            final Tree newTree = oldTree.committed(zone, step, version, time);
            if (oldTree == newTree) {
              break;
            } else if (Trunk.TREE.compareAndSet(trunk, oldTree, newTree)) {
              Database.DIFF_SIZE.addAndGet(this, -((long) Trunk.DIFF_SIZE.getAndSet(trunk, 0)));
              do {
                final BTree oldSeedTree = (BTree) Trunk.TREE.get(this.seedTrunk);
                final BTree newSeedTree = oldSeedTree.updated(trunk.name, newTree.seed().toValue(), version, post);
                if (Trunk.TREE.compareAndSet(this.seedTrunk, oldSeedTree, newSeedTree)) {
                  break;
                }
              } while (true);
              treeBuilder.add(newTree);
              newTree.buildDiff(version, pageBuilder);
              Database.TREE_SIZE.addAndGet(this, newTree.treeSize() - oldTree.treeSize());
              newTree.treeContext().treeDidCommit(newTree, oldTree);
              step += newTree.diffSize(version);
              break;
            }
          } while (true);
        }

        if ((step - startEvacuationBase) > this.settings().maxCompactSize) {
          break;
        }
        if (System.currentTimeMillis() - startEvacuationTime > this.settings().maxCompactTime) {
          break;
        }
      } while (true);
    }

    // Evacuate seed tree
    do {
      final BTree oldSeedTree = (BTree) Trunk.TREE.get(this.seedTrunk);
      final BTree newSeedTree = oldSeedTree.evacuated(post, version);
      if (oldSeedTree == newSeedTree) {
        break;
      } else if (Trunk.TREE.compareAndSet(this.seedTrunk, oldSeedTree, newSeedTree)) {
        final int newPost = newSeedTree.post();
        if (newPost == 0 || newPost >= post) {
          break;
        }
      }
    } while (true);

    // Commit seed tree
    BTree seedTree;
    do {
      final BTree oldSeedTree = (BTree) Trunk.TREE.get(this.seedTrunk);
      seedTree = oldSeedTree.committed(zone, step, version, time);
      if (oldSeedTree == seedTree) {
        break;
      } else if (Trunk.TREE.compareAndSet(this.seedTrunk, oldSeedTree, seedTree)) {
        seedTree.buildDiff(version, pageBuilder);
        step += seedTree.diffSize(version);
        break;
      }
    } while (true);

    // Evacuate meta tree
    do {
      final BTree oldMetaTree = (BTree) Trunk.TREE.get(this.seedTrunk);
      final BTree newMetaTree = oldMetaTree.evacuated(post, version);
      if (oldMetaTree == newMetaTree) {
        break;
      } else if (Trunk.TREE.compareAndSet(this.seedTrunk, oldMetaTree, newMetaTree)) {
        final int newPost = newMetaTree.post();
        if (newPost == 0 || newPost >= post) {
          break;
        }
      }
    } while (true);

    // Commit meta tree
    BTree metaTree;
    do {
      final BTree oldMetaTree = (BTree) Trunk.TREE.get(this.metaTrunk);
      metaTree = oldMetaTree.updated(Text.from("seed"), seedTree.rootRef().toValue(), version, post)
                            .updated(Text.from("stem"), Num.from(this.stem), version, post)
                            .updated(Text.from("time"), Num.from(time), version, post)
                            .committed(zone, step, version, time);
      if (oldMetaTree == metaTree) {
        break;
      } else if (Trunk.TREE.compareAndSet(this.metaTrunk, oldMetaTree, metaTree)) {
        metaTree.buildDiff(version, pageBuilder);
        step += metaTree.diffSize(version);
        break;
      }
    } while (true);

    final long size = step - base;
    final FingerTrieSeq<Tree> trees = treeBuilder.bind();
    final FingerTrieSeq<Page> pages = pageBuilder.bind();

    final Germ germ = new Germ(this.stem, version, this.germ.created(),
                               time, seedTree.rootRef().toValue());
    this.germ = germ;
    return new Chunk(this, commit, post, zone, germ, size, trees, pages);
  }

  public void uncommit(long version) {
    final Cursor<Map.Entry<Value, Value>> seedCursor = ((BTree) Trunk.TREE.get(this.seedTrunk)).cursor();
    while (seedCursor.hasNext()) {
      final Value name = seedCursor.next().getKey();
      do {
        final long newVersion = this.version;
        final Trunk<Tree> trunk = this.openTrunk(name, null, false, false);
        final Tree oldTree = Trunk.TREE.get(trunk);
        final Tree newTree = oldTree.uncommitted(version);
        if (oldTree != newTree) {
          if (trunk.updateTree(oldTree, newTree, newVersion)) {
            break;
          }
        } else {
          break;
        }
      } while (true);
    }
  }

  public Iterator<MetaTree> trees() {
    return new DatabaseTreeIterator(((BTree) Trunk.TREE.get(this.seedTrunk)).cursor());
  }

  public Iterator<MetaLeaf> leafs() {
    return new DatabaseLeafIterator(this, this.trees());
  }

  public void databaseDidCreateTrunk(Trunk<?> trunk) {
    Database.TREE_SIZE.addAndGet(this, Trunk.TREE.get(trunk).treeSize());
  }

  public void databaseDidOpenTrunk(Trunk<?> trunk) {
    this.store.treeDidOpen(this, Trunk.TREE.get(trunk));
  }

  Commit databaseWillCommit(Commit commit) {
    return this.store.databaseWillCommit(this, commit);
  }

  void databaseDidCommit(Chunk chunk) {
    this.store.databaseDidCommit(this, chunk);
    final DatabaseDelegate delegate = this.delegate;
    if (delegate != null) {
      delegate.databaseDidCommit(this, chunk);
    }
  }

  void databaseCommitDidFail(Throwable error) {
    this.store.databaseCommitDidFail(this, error);
  }

  void databaseWillCompact(int post) {
    this.store.databaseWillCompact(this, post);
  }

  void databaseDidCompact(int post) {
    this.store.databaseDidCompact(this, post);
    final DatabaseDelegate delegate = this.delegate;
    if (delegate != null) {
      delegate.databaseDidCompact(this, post);
    }
  }

  void databaseCompactDidFail(Throwable error) {
    this.store.databaseCompactDidFail(this, error);
  }

  @SuppressWarnings("unchecked")
  public void databaseDidUpdateTrunk(Trunk<?> trunk, Tree newTree, Tree oldTree, long newVersion) {
    if (!newTree.isTransient()) {
      do {
        final HashTrieMap<Value, Trunk<Tree>> oldSprouts = Database.SPROUTS.get(this);
        final HashTrieMap<Value, Trunk<Tree>> newSprouts = oldSprouts.updated(trunk.name, (Trunk<Tree>) trunk);
        if (Database.SPROUTS.compareAndSet(this, oldSprouts, newSprouts)) {
          break;
        }
      } while (true);
      final int newDiffSize = newTree.diffSize(newVersion);
      final int oldDiffSize = Trunk.DIFF_SIZE.getAndSet(trunk, newDiffSize);
      long deltaSize = (long) newDiffSize;
      if (!oldTree.isTransient()) {
        deltaSize -= (long) oldDiffSize;
      }
      Database.DIFF_SIZE.addAndGet(this, deltaSize);
    }
    Database.TREE_SIZE.addAndGet(this, newTree.treeSize() - oldTree.treeSize());
  }

  public void databaseDidCloseTrunk(Trunk<?> trunk) {
    this.store.treeDidClose(this, Trunk.TREE.get(trunk));
  }

  static final int INITIAL_STATE = 0;
  static final int OPENING_STATE = 1;
  static final int OPENED_STATE = 2;
  static final int CLOSING_STATE = 3;
  static final int CLOSED_STATE = 4;

  static final int STATE_BITS = 3;
  static final int STATE_MASK = (1 << STATE_BITS) - 1;

  static final AtomicIntegerFieldUpdater<Database> STEM =
      AtomicIntegerFieldUpdater.newUpdater(Database.class, "stem");

  static final AtomicLongFieldUpdater<Database> VERSION =
      AtomicLongFieldUpdater.newUpdater(Database.class, "version");

  static final AtomicIntegerFieldUpdater<Database> POST =
      AtomicIntegerFieldUpdater.newUpdater(Database.class, "post");

  static final AtomicLongFieldUpdater<Database> DIFF_SIZE =
      AtomicLongFieldUpdater.newUpdater(Database.class, "diffSize");

  static final AtomicLongFieldUpdater<Database> TREE_SIZE =
      AtomicLongFieldUpdater.newUpdater(Database.class, "treeSize");

  static final AtomicIntegerFieldUpdater<Database> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(Database.class, "status");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<Database, HashTrieMap<Value, Trunk<Tree>>> TRUNKS =
      AtomicReferenceFieldUpdater.newUpdater(Database.class, (Class<HashTrieMap<Value, Trunk<Tree>>>) (Class<?>) HashTrieMap.class, "trunks");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<Database, HashTrieMap<Value, Trunk<Tree>>> SPROUTS =
      AtomicReferenceFieldUpdater.newUpdater(Database.class, (Class<HashTrieMap<Value, Trunk<Tree>>>) (Class<?>) HashTrieMap.class, "sprouts");

}

final class DatabaseTreeIterator implements Iterator<MetaTree> {

  final Cursor<Map.Entry<Value, Value>> seeds;

  DatabaseTreeIterator(Cursor<Map.Entry<Value, Value>> seeds) {
    this.seeds = seeds;
  }

  @Override
  public boolean hasNext() {
    return this.seeds.hasNext();
  }

  @Override
  public MetaTree next() {
    final Map.Entry<Value, Value> slot = this.seeds.next();
    return MetaTree.fromValue(slot.getKey(), slot.getValue());
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }

}

final class DatabaseLeafIterator implements Iterator<MetaLeaf> {

  final Database database;
  final Iterator<MetaTree> trees;
  Trunk<Tree> trunk;
  Cursor<? extends Object> leafs;

  DatabaseLeafIterator(Database database, Iterator<MetaTree> trees) {
    this.database = database;
    this.trees = trees;
  }

  @Override
  public boolean hasNext() {
    do {
      if (this.leafs != null) {
        if (this.leafs.hasNext()) {
          return true;
        } else {
          this.trunk = null;
          this.leafs = null;
        }
      }
      if (this.trees.hasNext()) {
        final MetaTree metaTree = this.trees.next();
        final Value name = metaTree.name;
        final TreeType type = metaTree.type;
        this.trunk = this.database.openTrunk(name, type, false, false);
        this.leafs = Trunk.TREE.get(this.trunk).cursor();
      } else {
        return false;
      }
    } while (true);
  }

  @Override
  public MetaLeaf next() {
    do {
      if (this.leafs != null) {
        if (this.leafs.hasNext()) {
          final Item leaf = (Item) this.leafs.next();
          final Value name = this.trunk.name;
          final TreeType type = Trunk.TREE.get(this.trunk).treeType();
          final Value key = leaf.key();
          final Value value = leaf.toValue();
          return new MetaLeaf(name, type, key, value);
        } else {
          this.trunk = null;
          this.leafs = null;
        }
      }
      if (this.trees.hasNext()) {
        final MetaTree metaTree = this.trees.next();
        final Value name = metaTree.name;
        final TreeType type = metaTree.type;
        this.trunk = this.database.openTrunk(name, type, false, false);
        this.leafs = Trunk.TREE.get(this.trunk).cursor();
      } else {
        throw new NoSuchElementException();
      }
    } while (true);
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }

}
