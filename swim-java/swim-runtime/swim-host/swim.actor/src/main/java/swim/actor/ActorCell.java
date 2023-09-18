// Copyright 2015-2023 Nstream, inc.
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

import swim.api.Downlink;
import swim.api.policy.Policy;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.store.StoreBinding;
import swim.system.CellAddress;
import swim.system.CellBinding;
import swim.system.CellContext;
import swim.system.LinkBinding;
import swim.system.Metric;
import swim.system.Push;
import swim.uri.Uri;
import swim.util.Log;

public abstract class ActorCell implements CellBinding, CellContext {

  Log log;
  Policy policy;

  public ActorCell() {
    this.log = null;
    this.policy = null;
  }

  public abstract CellBinding cellBinding();

  public abstract CellContext cellContext();

  @Override
  public abstract CellAddress cellAddress();

  @Override
  public String edgeName() {
    return this.cellContext().edgeName();
  }

  @Override
  public Uri meshUri() {
    return this.cellContext().meshUri();
  }

  @Override
  public Policy policy() {
    final Policy policy = this.policy;
    return policy != null ? policy : this.cellContext().policy();
  }

  @Override
  public Schedule schedule() {
    return this.cellContext().schedule();
  }

  @Override
  public Stage stage() {
    return this.cellContext().stage();
  }

  @Override
  public StoreBinding store() {
    return this.cellContext().store();
  }

  protected Log openLog() {
    return null;
  }

  protected void closeLog() {
    this.log = null;
  }

  protected Policy openPolicy() {
    return null;
  }

  protected void closePolicy() {
    this.policy = null;
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.cellContext().bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.cellContext().openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    this.cellContext().closeDownlink(link);
  }

  @Override
  public void pushDown(Push<?> push) {
    this.cellContext().pushDown(push);
  }

  @Override
  public void reportDown(Metric metric) {
    this.cellContext().reportDown(metric);
  }

  @Override
  public void openUplink(LinkBinding link) {
    this.cellBinding().openUplink(link);
  }

  @Override
  public void pushUp(Push<?> push) {
    this.cellBinding().pushUp(push);
  }

  @Override
  public void trace(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.trace(message);
    } else {
      this.cellContext().trace(message);
    }
  }

  @Override
  public void debug(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.debug(message);
    } else {
      this.cellContext().debug(message);
    }
  }

  @Override
  public void info(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.info(message);
    } else {
      this.cellContext().info(message);
    }
  }

  @Override
  public void warn(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.warn(message);
    } else {
      this.cellContext().warn(message);
    }
  }

  @Override
  public void error(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.error(message);
    } else {
      this.cellContext().error(message);
    }
  }

  @Override
  public void fail(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.fail(message);
    } else {
      this.cellContext().fail(message);
    }
  }

}
