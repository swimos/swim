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
import swim.structure.Value;
import swim.util.Builder;
import swim.util.Cursor;

public abstract class Page {

  Page() {
    // sealed
  }

  public boolean isBTreePage() {
    return false;
  }

  public boolean isQTreePage() {
    return false;
  }

  public boolean isSTreePage() {
    return false;
  }

  public boolean isUTreePage() {
    return false;
  }

  public boolean isNode() {
    return false;
  }

  public boolean isLeaf() {
    return false;
  }

  public abstract PageRef pageRef();

  public PageContext pageContext() {
    return this.pageRef().pageContext();
  }

  public abstract PageType pageType();

  public abstract long version();

  public int stem() {
    return this.pageRef().stem();
  }

  public int post() {
    return this.pageRef().post();
  }

  public int zone() {
    return this.pageRef().zone();
  }

  public long base() {
    return this.pageRef().base();
  }

  public long span() {
    return this.pageRef().span();
  }

  public Value fold() {
    return this.pageRef().fold();
  }

  public abstract boolean isEmpty();

  public abstract int arity();

  public abstract int childCount();

  public abstract PageRef getChildRef(int index);

  public abstract Page getChild(int index);

  public int pageSize() {
    return this.pageRef().pageSize();
  }

  public int diffSize() {
    return this.pageRef().diffSize();
  }

  public long treeSize() {
    return this.pageRef().treeSize();
  }

  public abstract Value toHeader();

  public abstract Value toValue();

  public abstract Page evacuated(int zone, long version);

  public abstract Page committed(int zone, long base, long version);

  public abstract Page uncommitted(long version);

  public abstract void writePage(Output<?> output);

  public abstract void writeDiff(Output<?> output);

  public abstract void buildDiff(Builder<Page, ?> builder);

  public abstract Page loadTree(PageLoader pageLoader);

  public abstract void soften(long version);

  public abstract Cursor<? extends Object> cursor();

  public void printTree() {
    System.out.println(this.pageRef());
    this.printTree(0);
  }

  void printTree(int indent) {
    for (int j = 0; j < indent; j += 1) {
      System.out.print(' ');
    }
    System.out.println(this);
    for (int i = 0, n = this.childCount(); i < n; i += 1) {
      this.getChildRef(i).page().printTree(indent + 2);
    }
  }

  public String toDebugString() {
    return this.pageRef().toDebugString();
  }

}
