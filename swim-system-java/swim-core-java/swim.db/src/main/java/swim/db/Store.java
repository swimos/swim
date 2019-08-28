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

import swim.concurrent.Cont;
import swim.concurrent.Stage;
import swim.concurrent.Sync;

public abstract class Store {
  public abstract StoreContext storeContext();

  public StoreSettings settings() {
    return storeContext().settings;
  }

  public abstract Database database();

  public abstract Stage stage();

  public abstract long size();

  public abstract boolean isCommitting();

  public abstract boolean isCompacting();

  public abstract void openAsync(Cont<Store> cont);

  public abstract Store open() throws InterruptedException;

  public abstract void closeAsync(Cont<Store> cont);

  public abstract void close() throws InterruptedException;

  public abstract Zone zone();

  public abstract Zone zone(int zoneId);

  public abstract void openZoneAsync(int zoneId, Cont<Zone> cont);

  public abstract Zone openZone(int zoneId) throws InterruptedException;

  public abstract void openDatabaseAsync(Cont<Database> cont);

  public Database openDatabase() throws InterruptedException {
    final Sync<Database> syncDatabase = new Sync<Database>();
    openDatabaseAsync(syncDatabase);
    return syncDatabase.await(settings().databaseOpenTimeout);
  }

  public abstract PageLoader openPageLoader(TreeDelegate treeDelegate, boolean isResident);

  public abstract void commitAsync(Commit commit);

  public abstract void compactAsync(Compact compact);

  public abstract Zone shiftZone();

  boolean pageShouldSplit(Database database, Page page) {
    return storeContext().pageShouldSplit(this, database, page);
  }

  boolean pageShouldMerge(Database database, Page page) {
    return storeContext().pageShouldMerge(this, database, page);
  }

  void hitPage(Database database, Page page) {
    storeContext().hitPage(this, database, page);
  }

  void treeDidOpen(Database database, Tree tree) {
    storeContext().treeDidOpen(this, database, tree);
  }

  void treeDidClose(Database database, Tree tree) {
    storeContext().treeDidClose(this, database, tree);
  }

  void treeDidChange(Database database, Tree newTree, Tree oldTree) {
    storeContext().treeDidChange(this, database, newTree, oldTree);
  }

  void databaseWillOpen(Database database) {
    storeContext().databaseWillOpen(this, database);
  }

  void databaseDidOpen(Database database) {
    storeContext().databaseDidOpen(this, database);
  }

  void databaseWillClose(Database database) {
    storeContext().databaseWillClose(this, database);
  }

  void databaseDidClose(Database database) {
    storeContext().databaseDidClose(this, database);
  }

  Commit databaseWillCommit(Database database, Commit commit) {
    return storeContext().databaseWillCommit(this, database, commit);
  }

  void databaseDidCommit(Database database, Chunk chunk) {
    storeContext().databaseDidCommit(this, database, chunk);
  }

  void databaseCommitDidFail(Database database, Throwable error) {
    storeContext().databaseCommitDidFail(this, database, error);
  }

  Compact databaseWillCompact(Database database, Compact compact) {
    return storeContext().databaseWillCompact(this, database, compact);
  }

  void databaseDidCompact(Database database, Compact compact) {
    storeContext().databaseDidCompact(this, database, compact);
  }

  void databaseCompactDidFail(Database database, Throwable error) {
    storeContext().databaseCompactDidFail(this, database, error);
  }
}
