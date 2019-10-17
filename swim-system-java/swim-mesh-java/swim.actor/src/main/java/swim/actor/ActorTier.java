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

package swim.actor;

import swim.concurrent.MainStage;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.TierBinding;
import swim.runtime.TierContext;
import swim.store.StoreBinding;

public abstract class ActorTier extends ActorCell implements TierBinding, TierContext {
  Stage stage;
  StoreBinding store;

  @Override
  public final TierContext tierContext() {
    return this;
  }

  @Override
  public Schedule schedule() {
    final Stage stage = this.stage;
    return stage != null ? stage : cellContext().schedule();
  }

  @Override
  public Stage stage() {
    final Stage stage = this.stage;
    return stage != null ? stage : cellContext().stage();
  }

  @Override
  public StoreBinding store() {
    final StoreBinding store = this.store;
    return store != null ? store : cellContext().store();
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
    return ((TierBinding) cellBinding()).isClosed();
  }

  @Override
  public boolean isOpened() {
    return ((TierBinding) cellBinding()).isOpened();
  }

  @Override
  public boolean isLoaded() {
    return ((TierBinding) cellBinding()).isLoaded();
  }

  @Override
  public boolean isStarted() {
    return ((TierBinding) cellBinding()).isStarted();
  }

  @Override
  public void open() {
    ((TierBinding) cellBinding()).open();
  }

  @Override
  public void load() {
    ((TierBinding) cellBinding()).load();
  }

  @Override
  public void start() {
    ((TierBinding) cellBinding()).start();
  }

  @Override
  public void stop() {
    ((TierBinding) cellBinding()).stop();
  }

  @Override
  public void unload() {
    ((TierBinding) cellBinding()).unload();
  }

  @Override
  public void close() {
    ((TierContext) cellContext()).close();
  }

  @Override
  public void willOpen() {
    ((TierContext) cellContext()).willOpen();
    if (this.log == null) {
      this.log = openLog();
    }
    if (this.policy == null) {
      this.policy = openPolicy();
    }
    if (this.stage == null) {
      this.stage = openStage();
    }
    if (this.store == null) {
      this.store = openStore();
    }
  }

  @Override
  public void didOpen() {
    ((TierContext) cellContext()).didOpen();
  }

  @Override
  public void willLoad() {
    ((TierContext) cellContext()).willLoad();
  }

  @Override
  public void didLoad() {
    ((TierContext) cellContext()).didLoad();
  }

  @Override
  public void willStart() {
    ((TierContext) cellContext()).willStart();
  }

  @Override
  public void didStart() {
    ((TierContext) cellContext()).didStart();
  }

  @Override
  public void willStop() {
    ((TierContext) cellContext()).willStop();
  }

  @Override
  public void didStop() {
    ((TierContext) cellContext()).didStop();
  }

  @Override
  public void willUnload() {
    ((TierContext) cellContext()).willUnload();
  }

  @Override
  public void didUnload() {
    ((TierContext) cellContext()).didUnload();
  }

  @Override
  public void willClose() {
    ((TierContext) cellContext()).willClose();
    closeStore();
    closeStage();
    closePolicy();
    closeLog();
  }
}
