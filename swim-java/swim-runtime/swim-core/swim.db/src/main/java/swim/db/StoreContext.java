// Copyright 2015-2023 Swim.inc
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

public class StoreContext {

  protected final StoreSettings settings;

  public StoreContext(StoreSettings settings) {
    this.settings = settings;
  }

  public StoreContext() {
    this(StoreSettings.standard());
  }

  public final StoreSettings settings() {
    return this.settings;
  }

  public boolean pageShouldSplit(Store store, Database database, Page page) {
    return PageContext.pageShouldSplit(page, this.settings.pageSplitSize);
  }

  public boolean pageShouldMerge(Store store, Database database, Page page) {
    return PageContext.pageShouldMerge(page, this.settings.pageSplitSize);
  }

  public void hitPage(Store store, Database database, Page page) {
    // hook
  }

  public void treeDidOpen(Store store, Database database, Tree tree) {
    // hook
  }

  public void treeDidClose(Store store, Database database, Tree tree) {
    // hook
  }

  public void treeDidChange(Store store, Database database, Tree newTree, Tree oldTree) {
    StoreContext.autoCommit(database, this.settings.minCommitSize,
                            this.settings.minCommitInterval, Commit.forced());
  }

  public void databaseWillOpen(Store store, Database database) {
    // hook
  }

  public void databaseDidOpen(Store store, Database database) {
    // hook
  }

  public void databaseWillClose(Store store, Database database) {
    // hook
  }

  public void databaseDidClose(Store store, Database database) {
    // hook
  }

  public Commit databaseWillCommit(Store store, Database database, Commit commit) {
    return StoreContext.autoCommitShifted(store, this.settings.maxZoneSize, commit);
  }

  public void databaseDidCommit(Store store, Database database, Chunk chunk) {
    // hook
  }

  public void databaseCommitDidFail(Store store, Database database, Throwable error) {
    error.printStackTrace();
  }

  public void databaseWillCompact(Store store, Database database, int post) {
    // hook
  }

  public void databaseDidCompact(Store store, Database database, int post) {
    // hook
  }

  public void databaseCompactDidFail(Store store, Database database, Throwable error) {
    error.printStackTrace();
  }

  public void databaseDidShiftZone(Store store, Database database, Zone newZone) {
    // hook
  }

  public void databaseDidDeleteZone(Store store, Database database, int zoneId) {
    // hook
  }

  public static boolean autoCommit(Database database, long minCommitSize,
                                   long minCommitInterval, Commit commit) {
    if (database.isCompacting()
        || minCommitInterval > 0L && (database.diffSize() > minCommitSize
        || System.currentTimeMillis() - database.germ().updated() > minCommitInterval)) {
      database.commitAsync(commit);
      return true;
    } else {
      return false;
    }
  }

  public static Commit autoCommitShifted(Store store, long maxZoneSize, Commit commit) {
    if (store.zone().size() > maxZoneSize) {
      return commit.isShifted(true);
    } else {
      return commit;
    }
  }

}
