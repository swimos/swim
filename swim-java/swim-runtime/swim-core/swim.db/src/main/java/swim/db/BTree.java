// Copyright 2015-2023 Nstream, inc.
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
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.Builder;
import swim.util.CombinerFunction;
import swim.util.OrderedMapCursor;

public final class BTree extends Tree {

  final TreeContext treeContext;
  final BTreePageRef rootRef;
  final Seed seed;
  final boolean isResident;
  final boolean isTransient;

  public BTree(TreeContext treeContext, BTreePageRef rootRef, Seed seed,
               boolean isResident, boolean isTransient) {
    this.treeContext = treeContext;
    this.rootRef = rootRef;
    this.seed = seed;
    this.isResident = isResident;
    this.isTransient = isTransient;
  }

  public BTree(TreeContext treeContext, Seed seed, boolean isResident, boolean isTransient) {
    this.treeContext = treeContext;
    this.rootRef = (BTreePageRef) seed.rootRef(treeContext);
    this.seed = seed;
    this.isResident = isResident;
    this.isTransient = isTransient;
  }

  public BTree(TreeContext treeContext, int stem, long version,
               boolean isResident, boolean isTransient) {
    this.treeContext = treeContext;
    this.rootRef = BTreePageRef.empty(treeContext, stem, version);
    final long time = System.currentTimeMillis();
    this.seed = new Seed(TreeType.BTREE, stem, time, time, this.rootRef.toValue());
    this.isResident = isResident;
    this.isTransient = isTransient;
  }

  @Override
  public TreeType treeType() {
    return TreeType.BTREE;
  }

  @Override
  public TreeContext treeContext() {
    return this.treeContext;
  }

  @Override
  public BTreePageRef rootRef() {
    return this.rootRef;
  }

  @Override
  public BTreePage rootPage() {
    try {
      return this.rootRef.page();
    } catch (Throwable error) {
      if (Cont.isNonFatal(error)) {
        throw new StoreException(this.seed.toString(), error);
      } else {
        throw error;
      }
    }
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
  public BTree isResident(boolean isResident) {
    if (this.isResident != isResident) {
      return new BTree(this.treeContext, this.rootRef, this.seed, isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public boolean isTransient() {
    return this.isTransient;
  }

  @Override
  public BTree isTransient(boolean isTransient) {
    if (this.isTransient != isTransient) {
      return new BTree(this.treeContext, this.rootRef, this.seed, this.isResident, isTransient);
    } else {
      return this;
    }
  }

  @Override
  public boolean isEmpty() {
    return this.rootRef.isEmpty();
  }

  public boolean containsKey(Value key) {
    return this.rootPage().containsKey(key);
  }

  public boolean containsValue(Value value) {
    return this.rootPage().containsValue(value);
  }

  public long indexOf(Value key) {
    return this.rootPage().indexOf(key);
  }

  public Value get(Value key) {
    return this.rootPage().get(key);
  }

  public Slot getEntry(Value key) {
    return this.rootPage().getEntry(key);
  }

  public Slot getIndex(long index) {
    if (0 <= index && index < this.rootRef.span()) {
      return this.rootPage().getIndex(index);
    } else {
      return null;
    }
  }

  public Slot firstEntry(Value key) {
    return this.rootPage().firstEntry(key);
  }

  public Value firstKey() {
    final Slot entry = this.rootPage().firstEntry();
    if (entry != null) {
      return entry.key();
    } else {
      return null;
    }
  }

  public Value firstValue() {
    final Slot entry = this.rootPage().firstEntry();
    if (entry != null) {
      return entry.value();
    } else {
      return null;
    }
  }

  public Slot firstEntry() {
    return this.rootPage().firstEntry();
  }

  public Value lastKey() {
    final Slot entry = this.rootPage().lastEntry();
    if (entry != null) {
      return entry.key();
    } else {
      return null;
    }
  }

  public Value lastValue() {
    final Slot entry = this.rootPage().lastEntry();
    if (entry != null) {
      return entry.value();
    } else {
      return null;
    }
  }

  public Slot lastEntry() {
    return this.rootPage().lastEntry();
  }

  public Value nextKey(Value key) {
    final Slot entry = this.rootPage().nextEntry(key);
    if (entry != null) {
      return entry.key();
    } else {
      return null;
    }
  }

  public Value nextValue(Value key) {
    final Slot entry = this.rootPage().nextEntry(key);
    if (entry != null) {
      return entry.value();
    } else {
      return null;
    }
  }

  public Slot nextEntry(Value key) {
    return this.rootPage().nextEntry(key);
  }

  public Value previousKey(Value key) {
    final Slot entry = this.rootPage().previousEntry(key);
    if (entry != null) {
      return entry.key();
    } else {
      return null;
    }
  }

  public Value previousValue(Value key) {
    final Slot entry = this.rootPage().previousEntry(key);
    if (entry != null) {
      return entry.value();
    } else {
      return null;
    }
  }

  public Slot previousEntry(Value key) {
    return this.rootPage().previousEntry(key);
  }

  public BTree updated(Value key, Value newValue, long newVersion, int newPost) {
    final BTreePage oldRoot = this.rootPage();
    final BTreePage newRoot = oldRoot.updated(key, newValue, newVersion)
                                     .balanced(newVersion)
                                     .evacuated(newPost, newVersion);
    if (oldRoot != newRoot) {
      return new BTree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  public BTree removed(Value key, long newVersion, int newPost) {
    final BTreePage oldRoot = this.rootPage();
    final BTreePage newRoot = oldRoot.removed(key, newVersion)
                                     .balanced(newVersion)
                                     .evacuated(newPost, newVersion);
    if (oldRoot != newRoot) {
      return new BTree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  public BTree drop(long lower, long newVersion, int newPost) {
    if (lower > 0L) {
      final BTreePageRef oldRootRef = this.rootRef;
      final BTreePage newRoot;
      if (lower < oldRootRef.span) {
        newRoot = oldRootRef.page().drop(lower, newVersion)
                                   .balanced(newVersion)
                                   .evacuated(newPost, newVersion);
      } else {
        newRoot = BTreePage.empty(this.treeContext, this.seed.stem, newVersion);
      }
      return new BTree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  public BTree take(long upper, long newVersion, int newPost) {
    final BTreePageRef oldRootRef = this.rootRef;
    if (upper < oldRootRef.span) {
      final BTreePage newRoot;
      if (upper > 0L) {
        newRoot = oldRootRef.page().take(upper, newVersion)
                                   .balanced(newVersion)
                                   .evacuated(newPost, newVersion);
      } else {
        newRoot = BTreePage.empty(this.treeContext, this.seed.stem, newVersion);
      }
      return new BTree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  public BTree cleared(long newVersion) {
    if (!this.rootRef.isEmpty()) {
      final BTreePage newRoot = BTreePage.empty(this.treeContext, this.seed.stem, newVersion);
      return new BTree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
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

  public BTree reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                       CombinerFunction<Value, Value> combiner, long newVersion, int newPost) {
    final BTreePageRef oldRootRef = this.rootRef;
    final BTreePageRef newRootRef = oldRootRef.reduced(identity, accumulator, combiner, newVersion)
                                              .evacuated(newPost, newVersion);
    if (oldRootRef != newRootRef) {
      return new BTree(this.treeContext, newRootRef, this.seed, this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public BTree evacuated(int post, long version) {
    final BTreePageRef oldRootRef = this.rootRef;
    final BTreePageRef newRootRef = oldRootRef.evacuated(post, version);
    if (oldRootRef != newRootRef) {
      return new BTree(this.treeContext, newRootRef, this.seed, this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public BTree committed(int zone, long base, long version, long time) {
    if (!this.rootRef.isCommitted()) {
      final BTreePageRef newRootRef = this.rootRef.committed(zone, base, version);
      final Seed newSeed = this.seed.committed(time, newRootRef);
      return new BTree(this.treeContext, newRootRef, newSeed, this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public BTree uncommitted(long version) {
    final BTreePageRef oldRootRef = this.rootRef;
    final BTreePageRef newRootRef = oldRootRef.uncommitted(version);
    if (oldRootRef != newRootRef) {
      final Seed newSeed = this.seed.uncommitted(newRootRef);
      return new BTree(this.treeContext, newRootRef, newSeed, this.isResident, this.isTransient);
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
  public void buildDiff(long version, Builder<Page, ?> builder) {
    if (version == this.rootRef.softVersion()) {
      this.rootRef.buildDiff(builder);
    }
  }

  @Override
  public BTree load() {
    this.rootRef.loadTree(this.isResident);
    return this;
  }

  @Override
  public void soften(long version) {
    if (!this.isResident && !this.isTransient) {
      this.rootRef.soften(version);
    }
  }

  @Override
  public OrderedMapCursor<Value, Value> cursor() {
    return this.rootRef.cursor();
  }

  public OrderedMapCursor<Value, Value> depthCursor(int maxDepth) {
    return this.rootRef.depthCursor(maxDepth);
  }

}
