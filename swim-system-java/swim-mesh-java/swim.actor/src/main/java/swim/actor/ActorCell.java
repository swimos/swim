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

import swim.api.Downlink;
import swim.api.policy.Policy;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.CellAddress;
import swim.runtime.CellBinding;
import swim.runtime.CellContext;
import swim.runtime.LinkBinding;
import swim.runtime.Metric;
import swim.runtime.PushRequest;
import swim.store.StoreBinding;
import swim.uri.Uri;
import swim.util.Log;

public abstract class ActorCell implements CellBinding, CellContext {
  Log log;
  Policy policy;

  public abstract CellBinding cellBinding();

  public abstract CellContext cellContext();

  @Override
  public abstract CellAddress cellAddress();

  @Override
  public String edgeName() {
    return cellContext().edgeName();
  }

  @Override
  public Uri meshUri() {
    return cellContext().meshUri();
  }

  @Override
  public Policy policy() {
    final Policy policy = this.policy;
    return policy != null ? policy : cellContext().policy();
  }

  @Override
  public Schedule schedule() {
    return cellContext().schedule();
  }

  @Override
  public Stage stage() {
    return cellContext().stage();
  }

  @Override
  public StoreBinding store() {
    return cellContext().store();
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
    return cellContext().bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    cellContext().openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    cellContext().closeDownlink(link);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    cellContext().pushDown(pushRequest);
  }

  @Override
  public void reportDown(Metric metric) {
    cellContext().reportDown(metric);
  }

  @Override
  public void openUplink(LinkBinding link) {
    cellBinding().openUplink(link);
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    cellBinding().pushUp(pushRequest);
  }

  @Override
  public void trace(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.trace(message);
    } else {
      cellContext().trace(message);
    }
  }

  @Override
  public void debug(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.debug(message);
    } else {
      cellContext().debug(message);
    }
  }

  @Override
  public void info(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.info(message);
    } else {
      cellContext().info(message);
    }
  }

  @Override
  public void warn(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.warn(message);
    } else {
      cellContext().warn(message);
    }
  }

  @Override
  public void error(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.error(message);
    } else {
      cellContext().error(message);
    }
  }

  @Override
  public void fail(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.fail(message);
    } else {
      cellContext().fail(message);
    }
  }
}
