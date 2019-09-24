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
import swim.structure.Value;
import swim.util.Cursor;

public abstract class Tree {
  public abstract TreeType treeType();

  public abstract TreeContext treeContext();

  public StoreSettings settings() {
    return treeContext().settings();
  }

  public TreeDelegate treeDelegate() {
    return treeContext().treeDelegate();
  }

  public void setTreeDelegate(TreeDelegate treeDelegate) {
    treeContext().setTreeDelegate(treeDelegate);
  }

  public abstract PageRef rootRef();

  public abstract Seed seed();

  public int stem() {
    return seed().stem;
  }

  public int post() {
    return rootRef().post();
  }

  public long span() {
    return rootRef().span();
  }

  public Value fold() {
    return rootRef().fold();
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

  public abstract void loadAsync(Cont<Tree> cont);

  public abstract Tree load() throws InterruptedException;

  public abstract void soften(long version);

  public abstract Cursor<? extends Object> cursor();
}
