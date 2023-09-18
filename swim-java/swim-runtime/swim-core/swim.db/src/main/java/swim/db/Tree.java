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
import swim.collections.FingerTrieSeq;
import swim.structure.Value;
import swim.util.Builder;
import swim.util.Cursor;

public abstract class Tree {

  Tree() {
    // sealed
  }

  public abstract TreeType treeType();

  public abstract TreeContext treeContext();

  public StoreSettings settings() {
    return this.treeContext().settings();
  }

  public TreeDelegate treeDelegate() {
    return this.treeContext().treeDelegate();
  }

  public void setTreeDelegate(TreeDelegate treeDelegate) {
    this.treeContext().setTreeDelegate(treeDelegate);
  }

  public abstract PageRef rootRef();

  public abstract Page rootPage();

  public abstract Seed seed();

  public int stem() {
    return this.seed().stem;
  }

  public int post() {
    return this.rootRef().post();
  }

  public long span() {
    return this.rootRef().span();
  }

  public Value fold() {
    return this.rootRef().fold();
  }

  public abstract boolean isResident();

  public abstract Tree isResident(boolean isResident);

  public abstract boolean isTransient();

  public abstract Tree isTransient(boolean isTransient);

  public abstract boolean isEmpty();

  public abstract int diffSize(long version);

  public abstract long treeSize();

  public abstract Tree evacuated(int zone, long version);

  public abstract Tree committed(int zone, long base, long version, long time);

  public abstract Tree uncommitted(long version);

  public abstract void writeDiff(Output<?> output, long version);

  public abstract void buildDiff(long version, Builder<Page, ?> builder);

  public FingerTrieSeq<Page> toDiff(long version) {
    final Builder<Page, FingerTrieSeq<Page>> builder = FingerTrieSeq.builder();
    this.buildDiff(version, builder);
    return builder.bind();
  }

  public abstract Tree load();

  public abstract void soften(long version);

  public abstract Cursor<? extends Object> cursor();

}
