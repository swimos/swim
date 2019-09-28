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

import java.lang.ref.WeakReference;
import java.nio.ByteBuffer;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicLongFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.codec.Binary;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.concurrent.Cont;
import swim.concurrent.Conts;
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

public class Database {
  final Store store;
  volatile DatabaseDelegate delegate;
  volatile Germ germ;
  volatile int stem;
  volatile int post;
  volatile long version;
  volatile long diffSize;
  volatile long treeSize;
  final Trunk<BTree> metaTrunk;
  final Trunk<BTree> seedTrunk;
  volatile HashTrieMap<Value, WeakReference<Trunk<Tree>>> trunks;
  volatile HashTrieMap<Value, Trunk<Tree>> sprouts;
  volatile int status;

  Database(Store store, int stem, long version) {
    this.store = store;
    this.stem = stem;
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
    this.version = germ.version() + 1L;
    this.metaTrunk = new Trunk<BTree>(this, Record.create(1).attr("meta"), null);
    this.metaTrunk.tree = new BTree(this.metaTrunk, 0, version, true, false);
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
    return this.diffSize;
  }

  public long treeSize() {
    return this.treeSize;
  }

  public long treeCount() {
    return this.seedTrunk.tree.span();
  }

  public int trunkCount() {
    return this.trunks.size();
  }

  public void openAsync(Cont<Database> cont) {
    try {
      do {
        final int oldStatus = this.status;
        if ((oldStatus & (OPENING | OPENED | FAILED)) == 0) {
          final int newStatus = oldStatus | OPENING;
          if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
            try {
              this.store.databaseWillOpen(this);
              this.seedTrunk.tree.loadAsync(new DatabaseOpen(this, cont));
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
              ForkJoinPool.managedBlock(new DatabaseAwait(this));
            }
          }
          if ((this.status & OPENED) != 0) {
            cont.bind(this);
          } else {
            cont.trap(new StoreException("failed to open database"));
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

  public Database open() throws InterruptedException {
    final Sync<Database> syncDatabase = new Sync<Database>();
    openAsync(syncDatabase);
    return syncDatabase.await(settings().databaseOpenTimeout);
  }

  public void closeAsync(Cont<Database> cont) {
    try {
      commitAsync(Commit.closed().andThen(new DatabaseClose(this, cont)));
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public void close() throws InterruptedException {
    final Sync<Database> syncDatabase = new Sync<Database>();
    closeAsync(syncDatabase);
    syncDatabase.await(settings().databaseCloseTimeout);
  }

  @SuppressWarnings("unchecked")
  public <T extends Tree> Trunk<T> openTrunk(Value name, TreeType treeType, boolean isResident, boolean isTransient) {
    Trunk<T> newTrunk = null;
    WeakReference<Trunk<Tree>> newTrunkRef = null;
    boolean created = false;
    do {
      final HashTrieMap<Value, WeakReference<Trunk<Tree>>> oldTrunks = this.trunks;
      final WeakReference<Trunk<Tree>> oldTrunkRef = oldTrunks.get(name);
      final Trunk<Tree> oldTrunk = oldTrunkRef != null ? oldTrunkRef.get() : null;
      if (oldTrunk == null) {
        if (newTrunk == null) {
          final Seed seed = Seed.fromValue(this.seedTrunk.tree.get(name));
          newTrunk = new Trunk<T>(this, name, null);
          if (seed != null) {
            newTrunk.tree = (T) seed.treeType().treeFromSeed(newTrunk, seed, isResident, isTransient);
          } else if (treeType != null) {
            final int stem = STEM.getAndIncrement(this);
            newTrunk.tree = (T) treeType.emptyTree(newTrunk, stem, this.version, isResident, isTransient);
            created = true;
          } else {
            return null;
          }
          newTrunkRef = new WeakReference<Trunk<Tree>>((Trunk<Tree>) newTrunk);
        }
        final HashTrieMap<Value, WeakReference<Trunk<Tree>>> newTrunks = oldTrunks.updated(name, newTrunkRef);
        if (TRUNKS.compareAndSet(this, oldTrunks, newTrunks)) {
          if (created) {
            databaseDidCreateTrunk(newTrunk);
          }
          databaseDidOpenTrunk(newTrunk);
          return newTrunk;
        }
      } else {
        return (Trunk<T>) oldTrunk;
      }
    } while (true);
  }

  public Trunk<BTree> openBTreeTrunk(Value name, boolean isResident, boolean isTransient) {
    return openTrunk(name, TreeType.BTREE, isResident, isTransient);
  }

  public BTreeMap openBTreeMap(Value name, boolean isResident, boolean isTransient) {
    return new BTreeMap(openBTreeTrunk(name, isResident, isTransient));
  }

  public BTreeMap openBTreeMap(Value name) {
    return new BTreeMap(openBTreeTrunk(name, false, false));
  }

  public BTreeMap openBTreeMap(String name) {
    return new BTreeMap(openBTreeTrunk(Text.from(name), false, false));
  }

  public Trunk<QTree> openQTreeTrunk(Value name, boolean isResident, boolean isTransient) {
    return openTrunk(name, TreeType.QTREE, isResident, isTransient);
  }

  public <S> QTreeMap<S> openQTreeMap(Value name, Z2Form<S> shapeForm, boolean isResident, boolean isTransient) {
    return new QTreeMap<S>(openQTreeTrunk(name, isResident, isTransient), shapeForm);
  }

  public <S> QTreeMap<S> openQTreeMap(Value name, Z2Form<S> shapeForm) {
    return new QTreeMap<S>(openQTreeTrunk(name, false, false), shapeForm);
  }

  public <S> QTreeMap<S> openQTreeMap(String name, Z2Form<S> shapeForm) {
    return new QTreeMap<S>(openQTreeTrunk(Text.from(name), false, false), shapeForm);
  }

  public Trunk<STree> openSTreeTrunk(Value name, boolean isResident, boolean isTransient) {
    return openTrunk(name, TreeType.STREE, isResident, isTransient);
  }

  public STreeList openSTreeList(Value name, boolean isResident, boolean isTransient) {
    return new STreeList(openSTreeTrunk(name, isResident, isTransient));
  }

  public STreeList openSTreeList(Value name) {
    return new STreeList(openSTreeTrunk(name, false, false));
  }

  public STreeList openSTreeList(String name) {
    return new STreeList(openSTreeTrunk(Text.from(name), false, false));
  }

  private Trunk<UTree> openUTreeTrunk(Value name, boolean isResident, boolean isTransient) {
    return openTrunk(name, TreeType.UTREE, isResident, isTransient);
  }

  public UTreeValue openUTreeValue(Value name) {
    return new UTreeValue(openUTreeTrunk(name, false, false));
  }

  public UTreeValue openUTreeValue(String name) {
    return new UTreeValue(openUTreeTrunk(Text.from(name), false, false));
  }

  public void closeTrunk(Value name) {
    do {
      final HashTrieMap<Value, WeakReference<Trunk<Tree>>> oldTrunks = this.trunks;
      final HashTrieMap<Value, WeakReference<Trunk<Tree>>> newTrunks = oldTrunks.removed(name);
      if (oldTrunks != newTrunks) {
        if (TRUNKS.compareAndSet(this, oldTrunks, newTrunks)) {
          final WeakReference<Trunk<Tree>> oldTrunkRef = oldTrunks.get(name);
          final Trunk<?> oldTrunk = oldTrunkRef.get();
          if (oldTrunk != null) {
            databaseDidCloseTrunk(oldTrunk);
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  public void removeTree(Value name) {
    closeTrunk(name);
    do {
      final HashTrieMap<Value, Trunk<Tree>> oldSprouts = this.sprouts;
      final HashTrieMap<Value, Trunk<Tree>> newSprouts = oldSprouts.removed(name);
      if (oldSprouts != newSprouts) {
        if (SPROUTS.compareAndSet(this, oldSprouts, newSprouts)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    do {
      final long newVersion = this.version;
      final int newPost = this.post;
      final BTree oldSeedTree = this.seedTrunk.tree;
      final BTree newSeedTree = oldSeedTree.removed(name, newVersion, newPost);
      if (oldSeedTree != newSeedTree) {
        if (Trunk.TREE.compareAndSet(this.seedTrunk, oldSeedTree, newSeedTree)) {
          final Value seedValue = oldSeedTree.get(name);
          final Value sizeValue = seedValue.get("root").head().toValue().get("area");
          final long treeSize = sizeValue.longValue(0L);
          TREE_SIZE.addAndGet(this, -treeSize);
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  public void commitAsync(Commit commit) {
    try {
      if (this.diffSize > 0L) {
        this.store.commitAsync(commit);
      } else {
        commit.bind(null);
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        commit.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public Chunk commit(Commit commit) throws InterruptedException {
    if (this.diffSize > 0L) {
      final Sync<Chunk> syncChunk = new Sync<Chunk>();
      commitAsync(commit.andThen(syncChunk));
      return syncChunk.await(settings().databaseCommitTimeout);
    } else {
      return null;
    }
  }

  public void compactAsync(Compact compact) {
    try {
      this.store.compactAsync(compact);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        compact.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public Store compact(Compact compact) throws InterruptedException {
    final Sync<Store> syncStore = new Sync<Store>();
    compactAsync(compact.andThen(syncStore));
    return syncStore.await(settings().databaseCompactTimeout);
  }

  public void evacuateAsync(int post, Cont<Database> cont) {
    try {
      stage().execute(new DatabaseEvacuate(this, this.post, cont));
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public void evacuate(int post) {
    boolean quiescent;
    do {
      quiescent = true;

      // Evacuate data trees
      final Cursor<Map.Entry<Value, Value>> seedCursor = this.seedTrunk.tree.cursor();
      while (seedCursor.hasNext()) {
        final Value name = seedCursor.next().getKey();
        do {
          final long version = this.version;
          final Trunk<Tree> trunk = openTrunk(name, null, false, false);
          final Tree oldTree = trunk.tree;
          final Tree newTree = oldTree.evacuated(post, version);
          if (oldTree != newTree) {
            final int newPost = newTree.post();
            if (trunk.updateTree(oldTree, newTree, version)) {
              if (newPost != 0 && newPost < post) {
                quiescent = false;
                break;
              }
            }
          } else {
            break;
          }
        } while (true);
      }

      // Evacuate seed tree
      do {
        final long version = this.version;
        final BTree oldSeedTree = this.seedTrunk.tree;
        final BTree newSeedTree = oldSeedTree.evacuated(post, version);
        if (oldSeedTree != newSeedTree) {
          final int newPost = newSeedTree.post();
          if (Trunk.TREE.compareAndSet(this.seedTrunk, oldSeedTree, newSeedTree)) {
            if (newPost != 0 && newPost < post) {
              quiescent = false;
              break;
            }
          }
        } else {
          break;
        }
      } while (true);

      // Evacuate meta tree
      do {
        final long version = this.version;
        final BTree oldMetaTree = this.metaTrunk.tree;
        final BTree newMetaTree = oldMetaTree.evacuated(post, version);
        if (oldMetaTree != newMetaTree) {
          final int newPost = newMetaTree.post();
          if (Trunk.TREE.compareAndSet(this.metaTrunk, oldMetaTree, newMetaTree)) {
            if (newPost != 0 && newPost < post) {
              quiescent = false;
              break;
            }
          }
        } else {
          break;
        }
      } while (true);
    } while (!quiescent);
  }

  public void shiftZone() {
    this.store.shiftZone();
  }

  public Chunk commitChunk(Commit commit, int zone, long base) {
    DIFF_SIZE.set(this, 0L);
    final long version = VERSION.getAndIncrement(this);
    final long time = System.currentTimeMillis();

    HashTrieMap<Value, Trunk<Tree>> sprouts;
    do {
      sprouts = this.sprouts;
    } while (!SPROUTS.compareAndSet(this, sprouts, HashTrieMap.<Value, Trunk<Tree>>empty()));
    if (sprouts.isEmpty()) {
      return null;
    }

    final Builder<Tree, FingerTrieSeq<Tree>> commitBuilder = FingerTrieSeq.builder();
    long step = base;

    // Commit data pages
    final Iterator<Trunk<Tree>> trunks = sprouts.valueIterator();
    while (trunks.hasNext()) {
      final Trunk<Tree> trunk = trunks.next();
      do {
        final Tree oldTree = trunk.tree;
        final Tree newTree = oldTree.committed(zone, step, version, time);
        if (oldTree != newTree) {
          if (Trunk.TREE.compareAndSet(trunk, oldTree, newTree)) {
            do {
              final BTree oldSeedTree = this.seedTrunk.tree;
              final BTree newSeedTree = oldSeedTree.updated(trunk.name, newTree.seed().toValue(), version, this.post);
              if (Trunk.TREE.compareAndSet(this.seedTrunk, oldSeedTree, newSeedTree)) {
                break;
              }
            } while (true);
            commitBuilder.add(newTree);
            TREE_SIZE.addAndGet(this, newTree.treeSize() - oldTree.treeSize());
            newTree.treeContext().treeDidCommit(newTree, oldTree);
            step += newTree.diffSize(version);
            break;
          }
        } else {
          break;
        }
      } while (true);
    }

    // Commit seed tree
    BTree seedTree;
    do {
      final BTree oldSeedTree = this.seedTrunk.tree;
      seedTree = oldSeedTree.committed(zone, step, version, time);
      if (Trunk.TREE.compareAndSet(this.seedTrunk, oldSeedTree, seedTree)) {
        step += seedTree.diffSize(version);
        break;
      }
    } while (true);

    // Commit meta tree
    BTree metaTree;
    do {
      final BTree oldMetaTree = this.metaTrunk.tree;
      metaTree = oldMetaTree.updated(Text.from("seed"), seedTree.rootRef().toValue(), version, this.post)
                            .updated(Text.from("stem"), Num.from(this.stem), version, this.post)
                            .updated(Text.from("time"), Num.from(time), version, this.post)
                            .committed(zone, step, version, time);
      if (Trunk.TREE.compareAndSet(this.metaTrunk, oldMetaTree, metaTree)) {
        step += metaTree.diffSize(version);
        break;
      }
    } while (true);

    final FingerTrieSeq<Tree> commits = commitBuilder.bind();
    final int size = (int) (step - base);
    final OutputBuffer<ByteBuffer> output = Binary.outputBuffer(new byte[size]);
    final Output<ByteBuffer> encoder = Utf8.encodedOutput(output);
    step = base;

    // Write data pages
    for (Tree tree : commits) {
      tree.writeDiff(encoder, version);
      step += tree.diffSize(version);
      assertStep(output, base, step);
    }

    // Write seed pages
    seedTree.writeDiff(encoder, version);
    step += seedTree.diffSize(version);
    assertStep(output, base, step);

    // Write meta pages
    metaTree.writeDiff(encoder, version);
    step += metaTree.diffSize(version);
    assertStep(output, base, step);

    if (output.index() != size) {
      throw new StoreException();
    }

    final Germ germ = new Germ(this.stem, version, this.germ.created(), time,
                               seedTree.rootRef().toValue());
    this.germ = germ;
    return new Chunk(this, commit, zone, germ, commits, output.bind());
  }

  private static void assertStep(OutputBuffer<?> output, long base, long step) {
    if (output.index() != (int) (step - base)) {
      throw new StoreException("chunk offset skew: " + (output.index() - (int) (step - base)));
    }
  }

  public void uncommit(long version) {
    final Cursor<Map.Entry<Value, Value>> seedCursor = this.seedTrunk.tree.cursor();
    while (seedCursor.hasNext()) {
      final Value name = seedCursor.next().getKey();
      do {
        final long newVersion = this.version;
        final Trunk<Tree> trunk = openTrunk(name, null, false, false);
        final Tree oldTree = trunk.tree;
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
    return new DatabaseTreeIterator(this.seedTrunk.tree.cursor());
  }

  public Iterator<MetaLeaf> leafs() {
    return new DatabaseLeafIterator(this, trees());
  }

  void databaseDidOpen() {
    long treeSize = 0L;
    final Cursor<Map.Entry<Value, Value>> seedCursor = this.seedTrunk.tree.cursor();
    while (seedCursor.hasNext()) {
      final Value seedValue = seedCursor.next().getValue();
      final Value sizeValue = seedValue.get("root").head().toValue().get("area");
      treeSize += sizeValue.longValue(0L);
    }
    TREE_SIZE.set(this, treeSize);
    this.store.databaseDidOpen(this);
  }

  void databaseDidClose() {
    this.store.databaseDidClose(this);
  }

  public void databaseDidCreateTrunk(Trunk<?> trunk) {
    TREE_SIZE.addAndGet(this, trunk.tree.treeSize());
  }

  public void databaseDidOpenTrunk(Trunk<?> trunk) {
    this.store.treeDidOpen(this, trunk.tree);
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

  Compact databaseWillCompact(Compact compact) {
    return this.store.databaseWillCompact(this, compact);
  }

  void databaseDidCompact(Compact compact) {
    this.store.databaseDidCompact(this, compact);
    final DatabaseDelegate delegate = this.delegate;
    if (delegate != null) {
      delegate.databaseDidCompact(this, compact);
    }
  }

  void databaseCompactDidFail(Throwable error) {
    this.store.databaseCompactDidFail(this, error);
  }

  @SuppressWarnings("unchecked")
  public void databaseDidUpdateTrunk(Trunk<?> trunk, Tree newTree, Tree oldTree, long newVersion) {
    if (!newTree.isTransient()) {
      do {
        final HashTrieMap<Value, Trunk<Tree>> oldSprouts = this.sprouts;
        final HashTrieMap<Value, Trunk<Tree>> newSprouts = oldSprouts.updated(trunk.name, (Trunk<Tree>) trunk);
        if (oldSprouts != newSprouts) {
          if (SPROUTS.compareAndSet(this, oldSprouts, newSprouts)) {
            break;
          }
        } else {
          break;
        }
      } while (true);
      int deltaSize = newTree.diffSize(newVersion);
      if (!oldTree.isTransient()) {
        deltaSize -= oldTree.diffSize(newVersion);
      }
      DIFF_SIZE.addAndGet(this, deltaSize);
    }
    TREE_SIZE.addAndGet(this, newTree.treeSize() - oldTree.treeSize());
  }

  public void databaseDidCloseTrunk(Trunk<?> trunk) {
    this.store.treeDidClose(this, trunk.tree);
  }

  static final int OPENING = 1 << 0;
  static final int OPENED = 1 << 1;
  static final int FAILED = 1 << 2;

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
  static final AtomicReferenceFieldUpdater<Database, HashTrieMap<Value, WeakReference<Trunk<Tree>>>> TRUNKS =
      AtomicReferenceFieldUpdater.newUpdater(Database.class, (Class<HashTrieMap<Value, WeakReference<Trunk<Tree>>>>) (Class<?>) HashTrieMap.class, "trunks");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<Database, HashTrieMap<Value, Trunk<Tree>>> SPROUTS =
      AtomicReferenceFieldUpdater.newUpdater(Database.class, (Class<HashTrieMap<Value, Trunk<Tree>>>) (Class<?>) HashTrieMap.class, "sprouts");
}

final class DatabaseOpen implements Cont<Tree> {
  final Database database;
  final Cont<Database> andThen;

  DatabaseOpen(Database database, Cont<Database> andThen) {
    this.database = database;
    this.andThen = andThen;
  }

  @Override
  public void bind(Tree tree) {
    try {
      this.database.databaseDidOpen();
      Database.STATUS.set(this.database, Database.OPENED);
      this.andThen.bind(this.database);
      synchronized (this.database) {
        this.database.notifyAll();
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
      Database.STATUS.set(this.database, Database.FAILED);
      this.andThen.trap(error);
    } finally {
      synchronized (this.database) {
        this.database.notifyAll();
      }
    }
  }
}

final class DatabaseAwait implements ForkJoinPool.ManagedBlocker {
  final Database database;

  DatabaseAwait(Database database) {
    this.database = database;
  }

  @Override
  public boolean isReleasable() {
    return (this.database.status & Database.OPENING) == 0;
  }

  @Override
  public boolean block() throws InterruptedException {
    if ((this.database.status & Database.OPENING) != 0) {
      this.database.wait();
    }
    return (this.database.status & Database.OPENING) == 0;
  }
}

final class DatabaseClose implements Cont<Chunk> {
  final Database database;
  final Cont<Database> andThen;

  DatabaseClose(Database database, Cont<Database> andThen) {
    this.database = database;
    this.andThen = andThen;
  }

  @Override
  public void bind(Chunk chunk) {
    final Database database = this.database;
    try {
      database.databaseDidClose();
      database.stage().call(this.andThen).bind(database);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void trap(Throwable cause) {
    this.andThen.trap(cause);
  }
}

final class DatabaseEvacuate implements Runnable {
  final Database database;
  final int post;
  final Cont<Database> andThen;

  DatabaseEvacuate(Database database, int post, Cont<Database> andThen) {
    this.database = database;
    this.post = post;
    this.andThen = andThen;
  }

  @Override
  public void run() {
    try {
      this.database.evacuate(this.post);
      this.andThen.bind(this.database);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        this.andThen.trap(cause);
      } else {
        throw cause;
      }
    }
  }
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
        this.leafs = this.trunk.tree.cursor();
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
          final TreeType type = this.trunk.tree.treeType();
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
        this.leafs = this.trunk.tree.cursor();
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
