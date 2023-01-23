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

import swim.concurrent.Stage;

public abstract class Store {

  public Store() {
    // nop
  }

  public abstract StoreContext storeContext();

  public StoreSettings settings() {
    return this.storeContext().settings;
  }

  public abstract Database database();

  public abstract Stage stage();

  public abstract long size();

  public abstract boolean isCommitting();

  public abstract boolean isCompacting();

  public abstract boolean open();

  public abstract boolean close();

  public abstract int oldestZoneId();

  public abstract int newestZoneId();

  public abstract Zone zone();

  public abstract Zone zone(int zoneId);

  public abstract Zone openZone(int zoneId);

  public abstract void deletePost(int post);

  public abstract Database openDatabase();

  public abstract PageLoader openPageLoader(TreeDelegate treeDelegate, boolean isResident);

  public abstract void commitAsync(Commit commit);

  public abstract Zone shiftZone();

  boolean pageShouldSplit(Database database, Page page) {
    return this.storeContext().pageShouldSplit(this, database, page);
  }

  boolean pageShouldMerge(Database database, Page page) {
    return this.storeContext().pageShouldMerge(this, database, page);
  }

  void hitPage(Database database, Page page) {
    this.storeContext().hitPage(this, database, page);
  }

  void treeDidOpen(Database database, Tree tree) {
    this.storeContext().treeDidOpen(this, database, tree);
  }

  void treeDidClose(Database database, Tree tree) {
    this.storeContext().treeDidClose(this, database, tree);
  }

  void treeDidChange(Database database, Tree newTree, Tree oldTree) {
    this.storeContext().treeDidChange(this, database, newTree, oldTree);
  }

  void databaseWillOpen(Database database) {
    this.storeContext().databaseWillOpen(this, database);
  }

  void databaseDidOpen(Database database) {
    this.storeContext().databaseDidOpen(this, database);
  }

  void databaseWillClose(Database database) {
    this.storeContext().databaseWillClose(this, database);
  }

  void databaseDidClose(Database database) {
    this.storeContext().databaseDidClose(this, database);
  }

  Commit databaseWillCommit(Database database, Commit commit) {
    return this.storeContext().databaseWillCommit(this, database, commit);
  }

  void databaseDidCommit(Database database, Chunk chunk) {
    this.storeContext().databaseDidCommit(this, database, chunk);
  }

  void databaseCommitDidFail(Database database, Throwable error) {
    this.storeContext().databaseCommitDidFail(this, database, error);
  }

  void databaseWillCompact(Database database, int post) {
    this.storeContext().databaseWillCompact(this, database, post);
  }

  void databaseDidCompact(Database database, int post) {
    this.storeContext().databaseDidCompact(this, database, post);
  }

  void databaseCompactDidFail(Database database, Throwable error) {
    this.storeContext().databaseCompactDidFail(this, database, error);
  }

}
