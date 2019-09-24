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

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.concurrent.Stage;
import swim.structure.Value;

public class Trunk<T extends Tree> extends TreeContext {
  final Database database;
  final Value name;
  volatile T tree;
  TreeDelegate treeDelegate;

  public Trunk(Database database, Value name, T tree) {
    this.database = database;
    this.name = name;
    this.tree = tree;
  }

  public final StoreSettings settings() {
    return this.database.settings();
  }

  public final Database database() {
    return this.database;
  }

  public final long version() {
    return this.database.version;
  }

  public final int post() {
    return this.database.post;
  }

  public final Value name() {
    return this.name;
  }

  public final T tree() {
    return this.tree;
  }

  public boolean updateTree(T oldTree, T newTree, long newVersion) {
    if (this.database.version == newVersion && TREE.compareAndSet(this, oldTree, newTree)) {
      this.database.databaseDidUpdateTrunk(this, newTree, oldTree, newVersion);
      return this.database.version == newVersion; // Re-check version after CAS.
    }
    return false;
  }

  public void commitAsync(Commit commit) {
    this.database.commitAsync(commit);
  }

  public Chunk commit(Commit commit) throws InterruptedException {
    return this.database.commit(commit);
  }

  public TreeDelegate treeDelegate() {
    return this.treeDelegate;
  }

  public void setTreeDelegate(TreeDelegate treeDelegate) {
    this.treeDelegate = treeDelegate;
  }

  @Override
  public Stage stage() {
    return this.database.stage();
  }

  @Override
  public boolean pageShouldSplit(Page page) {
    return this.database.store.pageShouldSplit(this.database, page);
  }

  @Override
  public boolean pageShouldMerge(Page page) {
    return this.database.store.pageShouldMerge(this.database, page);
  }

  @Override
  public PageLoader openPageLoader(boolean isResident) {
    return this.database.store.openPageLoader(treeDelegate, isResident);
  }

  @Override
  public void hitPage(Page page) {
    this.database.store.hitPage(this.database, page);
  }

  @Override
  public void treeDidChange(Tree newTree, Tree oldTree) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate != null) {
      treeDelegate.treeDidChange(newTree, oldTree);
    }
    this.database.store.treeDidChange(this.database, newTree, oldTree);
  }

  @Override
  public void treeDidCommit(Tree newTree, Tree oldTree) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate != null) {
      treeDelegate.treeDidCommit(newTree, oldTree);
    }
  }

  @Override
  public void treeDidClear(Tree newTree, Tree oldTree) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate != null) {
      treeDelegate.treeDidClear(newTree, oldTree);
    }
  }

  @Override
  public void btreeDidUpdate(BTree newTree, BTree oldTree, Value key, Value newValue, Value oldValue) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate instanceof BTreeDelegate) {
      ((BTreeDelegate) treeDelegate).btreeDidUpdate(newTree, oldTree, key, newValue, oldValue);
    }
  }

  @Override
  public void btreeDidRemove(BTree newTree, BTree oldTree, Value key, Value oldValue) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate instanceof BTreeDelegate) {
      ((BTreeDelegate) treeDelegate).btreeDidRemove(newTree, oldTree, key, oldValue);
    }
  }

  @Override
  public void btreeDidDrop(BTree newTree, BTree oldTree, long lower) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate instanceof BTreeDelegate) {
      ((BTreeDelegate) treeDelegate).btreeDidDrop(newTree, oldTree, lower);
    }
  }

  @Override
  public void btreeDidTake(BTree newTree, BTree oldTree, long upper) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate instanceof BTreeDelegate) {
      ((BTreeDelegate) treeDelegate).btreeDidTake(newTree, oldTree, upper);
    }
  }

  @Override
  public void qtreeDidUpdate(QTree newTree, QTree oldTree, Value key, long x, long y, Value newValue, Value oldValue) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate instanceof QTreeDelegate) {
      ((QTreeDelegate) treeDelegate).qtreeDidUpdate(newTree, oldTree, key, x, y, newValue, oldValue);
    }
  }

  @Override
  public void qtreeDidMove(QTree newTree, QTree oldTree, Value key, long newX, long newY, Value newValue, long oldX, long oldY, Value oldValue) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate instanceof QTreeDelegate) {
      ((QTreeDelegate) treeDelegate).qtreeDidMove(newTree, oldTree, key, newX, newY, newValue, oldX, oldY, oldValue);
    }
  }

  @Override
  public void qtreeDidRemove(QTree newTree, QTree oldTree, Value key, long x, long y, Value oldValue) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate instanceof QTreeDelegate) {
      ((QTreeDelegate) treeDelegate).qtreeDidRemove(newTree, oldTree, key, x, y, oldValue);
    }
  }

  @Override
  public void streeDidUpdate(STree newTree, STree oldTree, long index, Value id, Value newValue, Value oldValue) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate instanceof STreeDelegate) {
      ((STreeDelegate) treeDelegate).streeDidUpdate(newTree, oldTree, index, id, newValue, oldValue);
    }
  }

  @Override
  public void streeDidInsert(STree newTree, STree oldTree, long index, Value id, Value newValue) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate instanceof STreeDelegate) {
      ((STreeDelegate) treeDelegate).streeDidInsert(newTree, oldTree, index, id, newValue);
    }
  }

  @Override
  public void streeDidRemove(STree newTree, STree oldTree, long index, Value id, Value oldValue) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate instanceof STreeDelegate) {
      ((STreeDelegate) treeDelegate).streeDidRemove(newTree, oldTree, index, id, oldValue);
    }
  }

  @Override
  public void streeDidDrop(STree newTree, STree oldTree, long lower) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate instanceof STreeDelegate) {
      ((STreeDelegate) treeDelegate).streeDidDrop(newTree, oldTree, lower);
    }
  }

  @Override
  public void streeDidTake(STree newTree, STree oldTree, long upper) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate instanceof STreeDelegate) {
      ((STreeDelegate) treeDelegate).streeDidTake(newTree, oldTree, upper);
    }
  }

  @Override
  public void utreeDidUpdate(UTree newTree, UTree oldTree, Value newValue, Value oldValue) {
    final TreeDelegate treeDelegate = this.treeDelegate;
    if (treeDelegate instanceof UTreeDelegate) {
      ((UTreeDelegate) treeDelegate).utreeDidUpdate(newTree, oldTree, newValue, oldValue);
    }
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<Trunk<?>, Tree> TREE =
      AtomicReferenceFieldUpdater.newUpdater((Class<Trunk<?>>) (Class<?>) Trunk.class, Tree.class, "tree");
}
