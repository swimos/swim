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
    // nop
  }

  public void treeDidOpen(Store store, Database database, Tree tree) {
    // nop
  }

  public void treeDidClose(Store store, Database database, Tree tree) {
    // nop
  }

  public void treeDidChange(Store store, Database database, Tree newTree, Tree oldTree) {
    autoCommit(database, this.settings.autoCommitSize, this.settings.autoCommitInterval, Commit.forced());
  }

  public void databaseWillOpen(Store store, Database database) {
    // nop
  }

  public void databaseDidOpen(Store store, Database database) {
    // nop
  }

  public void databaseWillClose(Store store, Database database) {
    // nop
  }

  public void databaseDidClose(Store store, Database database) {
    // nop
  }

  public Commit databaseWillCommit(Store store, Database database, Commit commit) {
    return autoCommitShifted(store, this.settings.maxZoneSize, commit);
  }

  public void databaseDidCommit(Store store, Database database, Chunk chunk) {
    if (chunk != null && !chunk.commit().isClosed()) {
      autoCompact(store, database, this.settings.minTreeFill, this.settings.minCompactSize,
                  Compact.forced(this.settings.deleteDelay));
    }
  }

  public void databaseCommitDidFail(Store store, Database database, Throwable error) {
    error.printStackTrace();
  }

  public Compact databaseWillCompact(Store store, Database database, Compact compact) {
    return autoCompactShifted(store, this.settings.minZoneFill, compact);
  }

  public void databaseDidCompact(Store store, Database database, Compact compact) {
    // nop
  }

  public void databaseCompactDidFail(Store store, Database database, Throwable error) {
    error.printStackTrace();
  }

  public void databaseDidShiftZone(Store store, Database database, Zone newZone) {
    // nop
  }

  public void databaseDidDeleteZone(Store store, Database database, int zoneId) {
    // nop
  }

  public static boolean autoCommit(Database database, long autoCommitSize,
                                   int autoCommitInterval, Commit commit) {
    if (autoCommitInterval > 0 && (database.diffSize() > autoCommitSize
        || System.currentTimeMillis() - database.germ().updated() > (long) autoCommitInterval)) {
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

  public static boolean autoCompact(Store store, Database database, double minTreeFill,
                                    long minCompactSize, Compact compact) {
    if (!store.isCompacting()) {
      final long treeSize = database.treeSize();
      final long storeSize = store.size();
      final double treeFill = (double) treeSize / (double) storeSize;
      if (storeSize > minCompactSize && treeFill < minTreeFill) {
        store.compactAsync(compact);
        return true;
      }
    }
    return false;
  }

  public static Compact autoCompactShifted(Store store, double minZoneFill, Compact compact) {
    final long zoneSize = store.zone().size();
    final long storeSize = store.size();
    final double zoneFill = (double) zoneSize / (double) storeSize;
    if (zoneSize > 0L && zoneFill > minZoneFill) {
      return compact.isShifted(true);
    } else {
      return compact;
    }
  }
}
