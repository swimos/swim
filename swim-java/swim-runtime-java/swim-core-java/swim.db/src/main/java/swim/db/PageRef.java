// Copyright 2015-2021 Swim Inc.
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
import swim.recon.Recon;
import swim.structure.Value;
import swim.util.Builder;
import swim.util.Cursor;

public abstract class PageRef {

  PageRef() {
    // sealed
  }

  public abstract PageContext pageContext();

  public StoreSettings settings() {
    return this.pageContext().settings();
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

  public abstract void buildDiff(Builder<Page, ?> builder);

  public abstract Page setPageValue(Value value, boolean isResident);

  public abstract Page loadPage(boolean isResident);

  public abstract Page loadPage(PageLoader pageLoader);

  public abstract Page loadTree(boolean isResident);

  public abstract Page loadTree(PageLoader pageLoader);

  public abstract void soften(long version);

  public abstract Cursor<? extends Object> cursor();

  public String toDebugString() {
    return "stem: " + this.stem() + ", pageRef: " + Recon.toString(this.toValue());
  }

}
