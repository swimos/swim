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

package swim.remote;

import swim.api.Downlink;
import swim.api.policy.Policy;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.CellAddress;
import swim.runtime.CellContext;
import swim.runtime.LinkBinding;
import swim.runtime.Metric;
import swim.runtime.NodeBinding;
import swim.runtime.Push;
import swim.store.StoreBinding;
import swim.uri.Uri;

public class TestCellContext implements CellContext {
  private final Policy policy;
  private final Schedule schedule;
  private final Stage stage;
  private final StoreBinding store;

  public TestCellContext(Policy policy, Schedule schedule, Stage stage, StoreBinding store) {
    this.policy = policy;
    this.schedule = schedule;
    this.stage = stage;
    this.store = store;
  }

  public TestCellContext(Stage stage) {
    this(null, stage, stage, null);
  }

  public TestCellContext() {
    this(null, null, null, null);
  }

  @Override
  public CellAddress cellAddress() {
    return null;
  }

  @Override
  public String edgeName() {
    return "";
  }

  @Override
  public Uri meshUri() {
    return Uri.empty();
  }

  @Override
  public Policy policy() {
    return policy;
  }

  @Override
  public Schedule schedule() {
    return schedule;
  }

  @Override
  public Stage stage() {
    return stage;
  }

  @Override
  public StoreBinding store() {
    return store;
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return null;
  }

  @Override
  public void openDownlink(LinkBinding link) {
  }

  @Override
  public void closeDownlink(LinkBinding link) {
  }

  @Override
  public void pushDown(Push<?> push) {
  }

  @Override
  public void reportDown(Metric metric) {
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
  }

  @Override
  public void trace(Object message) {
  }

  @Override
  public void debug(Object message) {
  }

  @Override
  public void info(Object message) {
  }

  @Override
  public void warn(Object message) {
  }

  @Override
  public void error(Object message) {
  }

  @Override
  public void fail(Object message) {
  }
}
