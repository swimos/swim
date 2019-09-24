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
import swim.structure.Value;
import swim.util.Cursor;

public abstract class Page {
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
    return pageRef().pageContext();
  }

  public abstract PageType pageType();

  public abstract long version();

  public int stem() {
    return pageRef().stem();
  }

  public int post() {
    return pageRef().post();
  }

  public int zone() {
    return pageRef().zone();
  }

  public long base() {
    return pageRef().base();
  }

  public long span() {
    return pageRef().span();
  }

  public Value fold() {
    return pageRef().fold();
  }

  public abstract boolean isEmpty();

  public abstract int arity();

  public abstract int childCount();

  public abstract PageRef getChildRef(int index);

  public abstract Page getChild(int index);

  public int pageSize() {
    return pageRef().pageSize();
  }

  public int diffSize() {
    return pageRef().diffSize();
  }

  public long treeSize() {
    return pageRef().treeSize();
  }

  public abstract Value toHeader();

  public abstract Value toValue();

  public abstract Page evacuated(int zone, long version);

  public abstract Page committed(int zone, long base, long version);

  public abstract Page uncommitted(long version);

  public abstract void writePage(Output<?> output);

  public abstract void writeDiff(Output<?> output);

  public abstract void loadTreeAsync(PageLoader pageLoader, Cont<Page> cont);

  public abstract void soften(long version);

  public abstract Cursor<? extends Object> cursor();

  public void printTree() {
    System.out.println(pageRef());
    printTree(0);
  }
  void printTree(int indent) {
    for (int j = 0; j < indent; j += 1) {
      System.out.print(' ');
    }
    System.out.println(this);
    for (int i = 0, n = childCount(); i < n; i += 1) {
      getChildRef(i).page().printTree(indent + 2);
    }
  }

  public String toDebugString() {
    return pageRef().toDebugString();
  }

  static final class LoadSubtree implements Cont<Page> {
    final PageLoader pageLoader;
    final Page page;
    final int index;
    final Cont<Page> andThen;

    LoadSubtree(PageLoader pageLoader, Page page, int index, Cont<Page> andThen) {
      this.pageLoader = pageLoader;
      this.page = page;
      this.index = index;
      this.andThen = andThen;
    }

    @Override
    public void bind(Page previous) {
      try {
        final int i = this.index;
        final int n = this.page.childCount();
        if (i >= n) {
          this.andThen.bind(this.page);
        } else {
          final Cont<Page> next = new LoadSubtree(this.pageLoader, this.page, i + 1, this.andThen);
          this.page.getChildRef(i).loadTreeAsync(this.pageLoader, next);
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
    public void trap(Throwable cause) {
      this.andThen.trap(cause);
    }
  }
}
