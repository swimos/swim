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
import swim.structure.Value;
import swim.util.Builder;
import swim.util.Cursor;

public final class UTree extends Tree {

  final TreeContext treeContext;
  final UTreePageRef rootRef;
  final Seed seed;
  final boolean isResident;
  final boolean isTransient;

  public UTree(TreeContext treeContext, UTreePageRef rootRef, Seed seed,
               boolean isResident, boolean isTransient) {
    this.treeContext = treeContext;
    this.rootRef = rootRef;
    this.seed = seed;
    this.isResident = isResident;
    this.isTransient = isTransient;
  }

  public UTree(TreeContext treeContext, Seed seed, boolean isResident, boolean isTransient) {
    this.treeContext = treeContext;
    this.rootRef = (UTreePageRef) seed.rootRef(treeContext);
    this.seed = seed;
    this.isResident = isResident;
    this.isTransient = isTransient;
  }

  public UTree(TreeContext treeContext, int stem, long version,
               boolean isResident, boolean isTransient) {
    this.treeContext = treeContext;
    this.rootRef = UTreePageRef.empty(treeContext, stem, version);
    final long time = System.currentTimeMillis();
    this.seed = new Seed(TreeType.UTREE, stem, time, time, this.rootRef.toValue());
    this.isResident = isResident;
    this.isTransient = isTransient;
  }

  @Override
  public TreeType treeType() {
    return TreeType.UTREE;
  }

  @Override
  public TreeContext treeContext() {
    return this.treeContext;
  }

  @Override
  public UTreePageRef rootRef() {
    return this.rootRef;
  }

  @Override
  public UTreePage rootPage() {
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
  public UTree isResident(boolean isResident) {
    if (this.isResident != isResident) {
      return new UTree(this.treeContext, this.rootRef, this.seed, isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public boolean isTransient() {
    return this.isTransient;
  }

  @Override
  public UTree isTransient(boolean isTransient) {
    if (this.isTransient != isTransient) {
      return new UTree(this.treeContext, this.rootRef, this.seed, this.isResident, isTransient);
    } else {
      return this;
    }
  }

  @Override
  public boolean isEmpty() {
    return this.rootRef.isEmpty();
  }

  public Value get() {
    return this.rootPage().get();
  }

  public UTree updated(Value newValue, long newVersion, int newPost) {
    final UTreePage oldRoot = this.rootPage();
    final UTreePage newRoot = oldRoot.updated(newValue, newVersion)
                                     .evacuated(newPost, newVersion);
    if (oldRoot != newRoot) {
      return new UTree(this.treeContext, newRoot.pageRef(), this.seed,
                       this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  public UTree cleared(long newVersion) {
    if (!this.rootRef.isEmpty()) {
      final UTreePage newRoot = UTreePage.empty(this.treeContext, this.seed.stem, newVersion);
      return new UTree(this.treeContext, newRoot.pageRef(), this.seed,
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

  @Override
  public UTree evacuated(int post, long version) {
    final UTreePageRef oldRootRef = this.rootRef;
    final UTreePageRef newRootRef = oldRootRef.evacuated(post, version);
    if (oldRootRef != newRootRef) {
      return new UTree(this.treeContext, newRootRef, this.seed, this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public UTree committed(int zone, long base, long version, long time) {
    if (!this.rootRef.isCommitted()) {
      final UTreePageRef newRootRef = this.rootRef.committed(zone, base, version);
      final Seed newSeed = this.seed.committed(time, newRootRef);
      return new UTree(this.treeContext, newRootRef, newSeed, this.isResident, this.isTransient);
    } else {
      return this;
    }
  }

  @Override
  public UTree uncommitted(long version) {
    final UTreePageRef oldRootRef = this.rootRef;
    final UTreePageRef newRootRef = oldRootRef.uncommitted(version);
    if (oldRootRef != newRootRef) {
      final Seed newSeed = this.seed.uncommitted(newRootRef);
      return new UTree(this.treeContext, newRootRef, newSeed, this.isResident, this.isTransient);
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
  public UTree load() {
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
  public Cursor<Value> cursor() {
    return this.rootRef.cursor();
  }

}
