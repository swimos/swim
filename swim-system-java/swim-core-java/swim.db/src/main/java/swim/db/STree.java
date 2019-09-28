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

public final class STree extends Tree {
  final TreeContext treeContext;
  final STreePageRef rootRef;
  final Seed seed;
  final boolean isResident;
  final boolean isTransient;

  public STree(TreeContext treeContext, STreePageRef rootRef, Seed seed,
               boolean isResident, boolean isTransient) {
    this.treeContext = treeContext;
    this.rootRef = rootRef;
    this.seed = seed;
    this.isResident = isResident;
    this.isTransient = isTransient;
  }

  public STree(TreeContext treeContext, Seed seed, boolean isResident, boolean isTransient) {
    this.treeContext = treeContext;
    this.rootRef = (STreePageRef) seed.rootRef(treeContext);
    this.seed = seed;
    this.isResident = isResident;
    this.isTransient = isTransient;
  }

  public STree(TreeContext treeContext, int stem, long version,
               boolean isResident, boolean isTransient) {
    this.treeContext = treeContext;
    this.rootRef = STreePageRef.empty(treeContext, stem, version);
    final long time = System.currentTimeMillis();
    this.seed = new Seed(TreeType.STREE, stem, time, time, this.rootRef.toValue());
    this.isResident = isResident;
    this.isTransient = isTransient;
  }

  @Override
  public TreeType treeType() {
    return TreeType.STREE;
  }

  @Override
  public TreeContext treeContext() {
    return this.treeContext;
  }

  @Override
  public STreePageRef rootRef() {
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
  public STree isResident(boolean isResident) {
    if (this.isResident != isResident) {
      return new STree(this.treeContext, this.rootRef, this.seed, isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public boolean isTransient() {
    return this.isTransient;
  }

  @Override
  public STree isTransient(boolean isTransient) {
    if (this.isTransient != isTransient) {
      return new STree(this.treeContext, this.rootRef, this.seed, this.isResident, isTransient);
    } else {
      return this;
    }
  }

  @Override
  public boolean isEmpty() {
    return this.rootRef.isEmpty();
  }

  public boolean contains(Value value) {
    return this.rootRef.page().contains(value);
  }

  public Value get(long index) {
    return this.rootRef.page().get(index);
  }

  public Slot getEntry(long index) {
    return this.rootRef.page().getEntry(index);
  }

  public STree updated(long index, Value newValue, long newVersion, int newPost) {
    final STreePage oldRoot = this.rootRef.page();
    final STreePage newRoot = oldRoot.updated(index, newValue, newVersion)
        .balanced(newVersion).evacuated(newPost, newVersion);
    if (oldRoot != newRoot) {
      return new STree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  public STree inserted(long index, Value key, Value newValue, long newVersion, int newPost) {
    final STreePage oldRoot = this.rootRef.page();
    final STreePage newRoot = oldRoot.inserted(index, key, newValue, newVersion)
        .balanced(newVersion).evacuated(newPost, newVersion);
    return new STree(this.treeContext, newRoot.pageRef(), this.seed,
                     this.isResident, this.isTransient);
  }

  public STree appended(Value key, Value newValue, long newVersion, int newPost) {
    final STreePage oldRoot = this.rootRef.page();
    final STreePage newRoot = oldRoot.appended(key, newValue, newVersion)
        .balanced(newVersion).evacuated(newPost, newVersion);
    return new STree(this.treeContext, newRoot.pageRef(), this.seed,
                     this.isResident, this.isTransient);
  }

  public STree prepended(Value key, Value newValue, long newVersion, int newPost) {
    final STreePage oldRoot = this.rootRef.page();
    final STreePage newRoot = oldRoot.prepended(key, newValue, newVersion)
        .balanced(newVersion).evacuated(newPost, newVersion);
    return new STree(this.treeContext, newRoot.pageRef(), this.seed,
                     this.isResident, this.isTransient);
  }

  public STree removed(long index, long newVersion, int newPost) {
    final STreePage oldRoot = this.rootRef.page();
    final STreePage newRoot = oldRoot.removed(index, newVersion)
        .balanced(newVersion).evacuated(newPost, newVersion);
    return new STree(this.treeContext, newRoot.pageRef(), this.seed,
                     this.isResident, this.isTransient);
  }

  public STree removed(Object object, long newVersion, int newPost) {
    final STreePage oldRoot = this.rootRef.page();
    final STreePage newRoot = oldRoot.removed(object, newVersion)
        .balanced(newVersion).evacuated(newPost, newVersion);
    if (oldRoot != newRoot) {
      return new STree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  public STree drop(long lower, long newVersion, int newPost) {
    if (lower > 0L) {
      final STreePageRef oldRootRef = this.rootRef;
      final STreePage newRoot;
      if (lower < oldRootRef.span()) {
        newRoot = oldRootRef.page().drop(lower, newVersion)
            .balanced(newVersion).evacuated(newPost, newVersion);
      } else {
        newRoot = STreePage.empty(this.treeContext, this.seed.stem, newVersion);
      }
      return new STree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  public STree take(long upper, long newVersion, int newPost) {
    final STreePageRef oldRootRef = this.rootRef;
    if (upper < oldRootRef.span()) {
      final STreePage newRoot;
      if (upper > 0L) {
        newRoot = oldRootRef.page().take(upper, newVersion)
            .balanced(newVersion).evacuated(newPost, newVersion);
      } else {
        newRoot = STreePage.empty(this.treeContext, this.seed.stem, newVersion);
      }
      return new STree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  public STree cleared(long newVersion) {
    if (!this.rootRef.isEmpty()) {
      final STreePage newRoot = STreePage.empty(this.treeContext, this.seed.stem, newVersion);
      return new STree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  public long indexOf(Object object) {
    return this.rootRef.page().indexOf(object);
  }

  public long lastIndexOf(Object object) {
    return this.rootRef.page().lastIndexOf(object);
  }

  public long lookup(long start, Object key) {
    final STreePage root = this.rootRef.page();
    start = Math.min(Math.max(0L, start), root.span() - 1L);
    if (start > -1) { // when root.span() is 0
      long index = start;
      do {
        final Slot slot = root.getEntry(index);
        if (slot != null && slot.key().equals(key)) {
          return index;
        }
        index = (index + 1L) % root.span();
      } while (index != start);
    }
    return -1L;
  }

  public void copyToArray(Object[] array, int offset) {
    this.rootRef.page().copyToArray(array, offset);
  }

  @Override
  public int diffSize(long version) {
    if (version == this.rootRef.softVersion()) {
      return this.rootRef.diffSize();
    } else {
      return 0;
    }
  }

  @Override
  public long treeSize() {
    return this.rootRef.treeSize();
  }

  public STree reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                       CombinerFunction<Value, Value> combiner, long newVersion, int newPost) {
    final STreePageRef oldRootRef = this.rootRef;
    final STreePageRef newRootRef = oldRootRef.reduced(identity, accumulator, combiner, newVersion)
        .evacuated(newPost, newVersion);
    if (oldRootRef != newRootRef) {
      return new STree(this.treeContext, newRootRef, this.seed, this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public STree evacuated(int post, long version) {
    final STreePageRef oldRootRef = this.rootRef;
    final STreePageRef newRootRef = oldRootRef.evacuated(post, version);
    if (oldRootRef != newRootRef) {
      return new STree(this.treeContext, newRootRef, this.seed, this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public STree committed(int zone, long base, long version, long time) {
    if (!this.rootRef.isCommitted()) {
      final STreePageRef newRootRef = this.rootRef.committed(zone, base, version);
      final Seed newSeed = this.seed.committed(time, newRootRef);
      return new STree(this.treeContext, newRootRef, newSeed, this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public STree uncommitted(long version) {
    final STreePageRef oldRootRef = this.rootRef;
    final STreePageRef newRootRef = oldRootRef.uncommitted(version);
    if (oldRootRef != newRootRef) {
      final Seed newSeed = this.seed.uncommitted(newRootRef);
      return new STree(this.treeContext, newRootRef, newSeed, this.isResident, this.isTransient);
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
  public STree load() throws InterruptedException {
    final Sync<Tree> syncTree = new Sync<Tree>();
    loadAsync(syncTree);
    return (STree) syncTree.await(settings().treeLoadTimeout);
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

  public Cursor<Slot> depthCursor(int maxDepth) {
    return this.rootRef.depthCursor(maxDepth);
  }

  public Cursor<Slot> deltaCursor(long sinceVersion) {
    return this.rootRef.deltaCursor(sinceVersion);
  }
}
