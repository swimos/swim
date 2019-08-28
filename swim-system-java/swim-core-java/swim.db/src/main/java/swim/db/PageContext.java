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

import swim.concurrent.Stage;
import swim.structure.Record;
import swim.structure.Value;

public class PageContext {
  public StoreSettings settings() {
    return StoreSettings.standard();
  }

  public Stage stage() {
    throw new UnsupportedOperationException();
  }

  public boolean pageShouldSplit(Page page) {
    return pageShouldSplit(page, settings().pageSplitSize);
  }

  public boolean pageShouldMerge(Page page) {
    return pageShouldMerge(page, settings().pageSplitSize);
  }

  public PageLoader openPageLoader(boolean isResident) {
    throw new UnsupportedOperationException();
  }

  public void hitPage(Page page) {
    // nop
  }

  public Value reduce(Record record) {
    return Value.absent();
  }

  public static boolean pageShouldSplit(Page page, int pageSplitSize) {
    return page.pageSize() > pageSplitSize;
  }

  public static boolean pageShouldMerge(Page page, int pageSplitSize) {
    return page.pageSize() < pageSplitSize >>> 1;
  }
}
