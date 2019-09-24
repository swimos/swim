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

public class TestStore extends Store {
  public final StoreContext context;

  public TestStore(StoreContext context) {
    this.context = context;
  }

  public TestStore() {
    this(new StoreContext());
  }

  @Override
  public StoreContext storeContext() {
    return this.context;
  }

  @Override
  public Database database() {
    return null;
  }

  @Override
  public Stage stage() {
    return null;
  }

  @Override
  public long size() {
    return 0L;
  }

  @Override
  public boolean isCommitting() {
    return false;
  }

  @Override
  public boolean isCompacting() {
    return false;
  }

  @Override
  public void openAsync(Cont<Store> cont) {
    cont.trap(null);
  }

  @Override
  public Store open() {
    return this;
  }

  @Override
  public void closeAsync(Cont<Store> cont) {
    cont.trap(null);
  }

  @Override
  public void close() {
    // nop
  }

  @Override
  public Zone zone() {
    return null;
  }

  @Override
  public Zone zone(int zoneId) {
    return null;
  }

  @Override
  public void openZoneAsync(int zoneId, Cont<Zone> cont) {
    cont.trap(null);
  }

  @Override
  public Zone openZone(int zoneId) {
    return null;
  }

  @Override
  public void openDatabaseAsync(Cont<Database> cont) {
    cont.trap(null);
  }

  @Override
  public PageLoader openPageLoader(TreeDelegate treeDelegate, boolean isResident) {
    return null;
  }

  @Override
  public void commitAsync(Commit commit) {
    commit.trap(null);
  }

  @Override
  public void compactAsync(Compact compact) {
    compact.trap(null);
  }

  @Override
  public Zone shiftZone() {
    return null;
  }
}
