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

import swim.codec.Output;
import swim.concurrent.Cont;
import swim.concurrent.Conts;
import swim.concurrent.Sync;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.CombinerFunction;
import swim.util.Cursor;

public final class QTree extends Tree {
  final TreeContext treeContext;
  final QTreePageRef rootRef;
  final Seed seed;
  final boolean isResident;
  final boolean isTransient;

  public QTree(TreeContext treeContext, QTreePageRef rootRef, Seed seed,
               boolean isResident, boolean isTransient) {
    this.treeContext = treeContext;
    this.rootRef = rootRef;
    this.seed = seed;
    this.isResident = isResident;
    this.isTransient = isTransient;
  }

  public QTree(TreeContext treeContext, Seed seed, boolean isResident, boolean isTransient) {
    this.treeContext = treeContext;
    this.rootRef = (QTreePageRef) seed.rootRef(treeContext);
    this.seed = seed;
    this.isResident = isResident;
    this.isTransient = isTransient;
  }

  public QTree(TreeContext treeContext, int stem, long version,
               boolean isResident, boolean isTransient) {
    this.treeContext = treeContext;
    this.rootRef = QTreePageRef.empty(treeContext, stem, version);
    final long time = System.currentTimeMillis();
    this.seed = new Seed(TreeType.QTREE, stem, time, time, this.rootRef.toValue());
    this.isResident = isResident;
    this.isTransient = isTransient;
  }

  @Override
  public TreeType treeType() {
    return TreeType.QTREE;
  }

  @Override
  public TreeContext treeContext() {
    return this.treeContext;
  }

  @Override
  public QTreePageRef rootRef() {
    return this.rootRef;
  }

  @Override
  public Seed seed() {
    return this.seed;
  }

  @Override
  public boolean isResident() {
    return this.isResident;
  }

  @Override
  public QTree isResident(boolean isResident) {
    if (this.isResident != isResident) {
      return new QTree(this.treeContext, this.rootRef, this.seed, isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public boolean isTransient() {
    return this.isTransient;
  }

  @Override
  public QTree isTransient(boolean isTransient) {
    if (this.isTransient != isTransient) {
      return new QTree(this.treeContext, this.rootRef, this.seed, this.isResident, isTransient);
    } else {
      return this;
    }
  }

  @Override
  public boolean isEmpty() {
    return this.rootRef.isEmpty();
  }

  public boolean containsKey(Value key, long x, long y) {
    return this.rootRef.page().containsKey(key, x, y);
  }

  public boolean containsKey(Value key) {
    final Cursor<Slot> cursor = cursor();
    while (cursor.hasNext()) {
      if (key.equals(cursor.next().key())) {
        return true;
      }
    }
    return false;
  }

  public boolean containsValue(Value value) {
    final Cursor<Slot> cursor = cursor();
    while (cursor.hasNext()) {
      if (value.equals(cursor.next().toValue())) {
        return true;
      }
    }
    return false;
  }

  public Value get(Value key, long x, long y) {
    return this.rootRef.page().get(key, x, y);
  }

  public Value get(Value key) {
    final Cursor<Slot> cursor = cursor();
    while (cursor.hasNext()) {
      final Slot slot = cursor.next();
      if (key.equals(slot.key())) {
        return slot.toValue();
      }
    }
    return Value.absent();
  }

  public QTree updated(Value key, long x, long y, Value newValue, long newVersion, int newPost) {
    final QTreePage oldRoot = this.rootRef.page();
    final QTreePage newRoot = oldRoot.updated(key, x, y, newValue, newVersion)
        .balanced(newVersion).evacuated(newPost, newVersion);
    if (oldRoot != newRoot) {
      return new QTree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  public QTree moved(Value key, long oldX, long oldY, long newX, long newY,
                     Value newValue, long newVersion, int newPost) {
    final QTreePage oldRoot = this.rootRef.page();
    final QTreePage newRoot = oldRoot.removed(key, oldX, oldY, newVersion)
        .balanced(newVersion)
        .updated(key, newX, newY, newValue, newVersion)
        .balanced(newVersion)
        .evacuated(newPost, newVersion);
    if (oldRoot != newRoot) {
      return new QTree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  public QTree removed(Value key, long x, long y, long newVersion, int newPost) {
    final QTreePage oldRoot = this.rootRef.page();
    final QTreePage newRoot = oldRoot.removed(key, x, y, newVersion)
        .balanced(newVersion).evacuated(newPost, newVersion);
    if (oldRoot != newRoot) {
      return new QTree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  public QTree cleared(long newVersion) {
    if (!this.rootRef.isEmpty()) {
      final QTreePage newRoot = QTreePage.empty(this.treeContext, this.seed.stem, newVersion);
      return new QTree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public int diffSize(long version) {
    if (version <= this.rootRef.softVersion()) {
      return this.rootRef.diffSize();
    } else {
      return 0;
    }
  }

  @Override
  public long treeSize() {
    return this.rootRef.treeSize();
  }

  public QTree reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                       CombinerFunction<Value, Value> combiner, long newVersion, int newPost) {
    final QTreePageRef oldRootRef = this.rootRef;
    final QTreePageRef newRootRef = oldRootRef.reduced(identity, accumulator, combiner, newVersion)
        .evacuated(newPost, newVersion);
    if (oldRootRef != newRootRef) {
      return new QTree(this.treeContext, newRootRef, this.seed, this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public QTree evacuated(int post, long version) {
    final QTreePageRef oldRootRef = this.rootRef;
    final QTreePageRef newRootRef = oldRootRef.evacuated(post, version);
    if (oldRootRef != newRootRef) {
      return new QTree(this.treeContext, newRootRef, this.seed, this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public QTree committed(int zone, long base, long version, long time) {
    if (!this.rootRef.isCommitted()) {
      final QTreePageRef newRootRef = this.rootRef.committed(zone, base, version);
      final Seed newSeed = this.seed.committed(time, newRootRef);
      return new QTree(this.treeContext, newRootRef, newSeed, this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public QTree uncommitted(long version) {
    final QTreePageRef oldRootRef = this.rootRef;
    final QTreePageRef newRootRef = oldRootRef.uncommitted(version);
    if (oldRootRef != newRootRef) {
      final Seed newSeed = this.seed.uncommitted(newRootRef);
      return new QTree(this.treeContext, newRootRef, newSeed, this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public void writeDiff(Output<?> output, long version) {
    if (version == this.rootRef.softVersion()) {
      this.rootRef.writeDiff(output);
    }
  }

  @Override
  public void loadAsync(Cont<Tree> cont) {
    try {
      final Cont<Page> andThen = Conts.constant(cont, this);
      this.rootRef.loadTreeAsync(this.isResident, andThen);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        cont.trap(new StoreException(this.rootRef.toDebugString(), error));
      } else {
        throw error;
      }
    }
  }

  @Override
  public QTree load() throws InterruptedException {
    final Sync<Tree> syncTree = new Sync<Tree>();
    loadAsync(syncTree);
    return (QTree) syncTree.await(settings().treeLoadTimeout);
  }

  @Override
  public void soften(long version) {
    if (!this.isResident && !this.isTransient) {
      this.rootRef.soften(version);
    }
  }

  @Override
  public Cursor<Slot> cursor() {
    return this.rootRef.cursor();
  }

  public Cursor<Slot> cursor(long x, long y) {
    return this.rootRef.cursor(x, y);
  }

  public Cursor<Slot> depthCursor(long x, long y, int maxDepth) {
    return this.rootRef.depthCursor(x, y, maxDepth);
  }

  public Cursor<Slot> depthCursor(int maxDepth) {
    return this.rootRef.depthCursor(maxDepth);
  }

  public Cursor<Slot> deltaCursor(long x, long y, long sinceVersion) {
    return this.rootRef.deltaCursor(x, y, sinceVersion);
  }

  public Cursor<Slot> deltaCursor(long sinceVersion) {
    return this.rootRef.deltaCursor(sinceVersion);
  }
}
