// Copyright 2015-2022 Swim.inc
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

package swim.actor;

import swim.concurrent.MainStage;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.store.StoreBinding;
import swim.system.TierBinding;
import swim.system.TierContext;

public abstract class ActorTier extends ActorCell implements TierBinding, TierContext {

  Stage stage;
  StoreBinding store;

  public ActorTier() {
    this.stage = null;
    this.store = null;
  }

  @Override
  public final TierContext tierContext() {
    return this;
  }

  @Override
  public Schedule schedule() {
    final Stage stage = this.stage;
    return stage != null ? stage : this.cellContext().schedule();
  }

  @Override
  public Stage stage() {
    final Stage stage = this.stage;
    return stage != null ? stage : this.cellContext().stage();
  }

  @Override
  public StoreBinding store() {
    final StoreBinding store = this.store;
    return store != null ? store : this.cellContext().store();
  }

  protected Stage openStage() {
    return null;
  }

  protected void closeStage() {
    final Stage stage = this.stage;
    if (stage instanceof MainStage) {
      ((MainStage) stage).stop();
    }
    this.stage = null;
  }

  protected StoreBinding openStore() {
    return null;
  }

  protected void closeStore() {
    final StoreBinding store = this.store;
    if (store != null) {
      store.close();
    }
    this.store = null;
  }

  @Override
  public boolean isClosed() {
    return ((TierBinding) this.cellBinding()).isClosed();
  }

  @Override
  public boolean isOpened() {
    return ((TierBinding) this.cellBinding()).isOpened();
  }

  @Override
  public boolean isLoaded() {
    return ((TierBinding) this.cellBinding()).isLoaded();
  }

  @Override
  public boolean isStarted() {
    return ((TierBinding) this.cellBinding()).isStarted();
  }

  @Override
  public void open() {
    ((TierBinding) this.cellBinding()).open();
  }

  @Override
  public void load() {
    ((TierBinding) this.cellBinding()).load();
  }

  @Override
  public void start() {
    ((TierBinding) this.cellBinding()).start();
  }

  @Override
  public void stop() {
    ((TierBinding) this.cellBinding()).stop();
  }

  @Override
  public void unload() {
    ((TierBinding) this.cellBinding()).unload();
  }

  @Override
  public void close() {
    ((TierContext) this.cellContext()).close();
  }

  @Override
  public void willOpen() {
    ((TierContext) this.cellContext()).willOpen();
    if (this.log == null) {
      this.log = this.openLog();
    }
    if (this.policy == null) {
      this.policy = this.openPolicy();
    }
    if (this.stage == null) {
      this.stage = this.openStage();
    }
    if (this.store == null) {
      this.store = this.openStore();
    }
  }

  @Override
  public void didOpen() {
    ((TierContext) this.cellContext()).didOpen();
  }

  @Override
  public void willLoad() {
    ((TierContext) this.cellContext()).willLoad();
  }

  @Override
  public void didLoad() {
    ((TierContext) this.cellContext()).didLoad();
  }

  @Override
  public void willStart() {
    ((TierContext) this.cellContext()).willStart();
  }

  @Override
  public void didStart() {
    ((TierContext) this.cellContext()).didStart();
  }

  @Override
  public void willStop() {
    ((TierContext) this.cellContext()).willStop();
  }

  @Override
  public void didStop() {
    ((TierContext) this.cellContext()).didStop();
  }

  @Override
  public void willUnload() {
    ((TierContext) this.cellContext()).willUnload();
  }

  @Override
  public void didUnload() {
    ((TierContext) this.cellContext()).didUnload();
  }

  @Override
  public void willClose() {
    ((TierContext) this.cellContext()).willClose();
    this.closeStore();
    this.closeStage();
    this.closePolicy();
    this.closeLog();
  }

}
