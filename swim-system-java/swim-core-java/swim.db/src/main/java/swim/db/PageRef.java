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
import swim.recon.Recon;
import swim.structure.Value;
import swim.util.Cursor;

public abstract class PageRef {
  public abstract PageContext pageContext();

  public StoreSettings settings() {
    return pageContext().settings();
  }

  public abstract PageType pageType();

  public abstract int stem();

  public abstract int post();

  public abstract int zone();

  public abstract long base();

  public abstract long span();

  public abstract Value fold();

  public abstract Page page();

  public abstract Page hardPage();

  public abstract Page softPage();

  public abstract long softVersion();

  public abstract boolean isEmpty();

  public abstract boolean isCommitted();

  public abstract int pageRefSize();

  public abstract int pageSize();

  public abstract int diffSize();

  public abstract long treeSize();

  public abstract Value toValue();

  public abstract PageRef evacuated(int zone, long version);

  public abstract PageRef committed(int zone, long base, long version);

  public abstract PageRef uncommitted(long version);

  public abstract void writePageRef(Output<?> output);

  public abstract void writePage(Output<?> output);

  public abstract void writeDiff(Output<?> output);

  public abstract Page setPageValue(Value value, boolean isResident);

  public abstract void loadPageAsync(boolean isResident, Cont<Page> cont);

  public abstract void loadTreeAsync(boolean isResident, Cont<Page> cont);

  public abstract void loadTreeAsync(PageLoader pageLoader, Cont<Page> cont);

  public abstract void soften(long version);

  public abstract Cursor<? extends Object> cursor();

  public String toDebugString() {
    return "stem: " + stem() + ", pageRef: " + Recon.toString(toValue());
  }

  static final class LoadPage implements Cont<Page> {
    final PageLoader pageLoader;
    final Cont<Page> cont;

    LoadPage(PageLoader pageLoader, Cont<Page> cont) {
      this.pageLoader = pageLoader;
      this.cont = cont;
    }

    @Override
    public void bind(Page page) {
      try {
        this.cont.bind(page);
      } catch (Throwable cause) {
        if (Conts.isNonFatal(cause)) {
          this.cont.trap(cause);
        } else {
          throw cause;
        }
      } finally {
        this.pageLoader.close();
      }
    }

    @Override
    public void trap(Throwable cause) {
      try {
        this.cont.trap(cause);
      } finally {
        this.pageLoader.close();
      }
    }
  }

  static final class LoadTree implements Cont<Page> {
    final PageLoader pageLoader;
    final Cont<Page> cont;

    LoadTree(PageLoader pageLoader, Cont<Page> cont) {
      this.pageLoader = pageLoader;
      this.cont = cont;
    }

    @Override
    public void bind(Page page) {
      try {
        final Cont<Page> andThen = Conts.constant(this.cont, page);
        page.loadTreeAsync(this.pageLoader, andThen);
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
      this.cont.trap(cause);
    }
  }
}
