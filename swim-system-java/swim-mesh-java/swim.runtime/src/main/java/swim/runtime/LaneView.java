// Copyright 2015-2020 SWIM.AI inc.
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

package swim.runtime;

import java.util.Objects;
import swim.api.Downlink;
import swim.api.Lane;
import swim.api.agent.AgentContext;
import swim.api.policy.Policy;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.observable.Observer;
import swim.runtime.observer.LaneObserver;
import swim.store.StoreBinding;
import swim.uri.Uri;

public abstract class LaneView extends AbstractTierBinding implements Lane {

  protected volatile LaneObserver observers;

  public LaneView(LaneObserver observers) {
    this.observers = Objects.requireNonNullElseGet(observers, () -> new LaneObserver(this));
  }

  @Override
  public TierContext tierContext() {
    return null;
  }

  public abstract AgentContext agentContext();

  public abstract LaneBinding laneBinding();

  public LaneContext laneContext() {
    return laneBinding().laneContext();
  }

  public abstract LaneBinding createLaneBinding();

  @SuppressWarnings("unchecked")
  public <T> T unwrapLane(Class<T> laneClass) {
    if (laneClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public LaneAddress cellAddress() {
    return laneContext().cellAddress();
  }

  @Override
  public final String edgeName() {
    return laneContext().edgeName();
  }

  @Override
  public final Uri meshUri() {
    return laneContext().meshUri();
  }

  @Override
  public final Uri hostUri() {
    return laneBinding().hostUri();
  }

  @Override
  public final Uri nodeUri() {
    return laneBinding().nodeUri();
  }

  @Override
  public final Uri laneUri() {
    return laneBinding().laneUri();
  }

  @Override
  public abstract void close();

  @Override
  public LaneView observe(Observer newObserver) {
    this.observers.observe(newObserver);
    return this;
  }

  @Override
  public LaneView unobserve(Observer oldObserver) {
    this.observers.unobserve(oldObserver);
    return this;
  }

  public void laneDidFail(Throwable error) {
    // stub
  }

  @Override
  public Policy policy() {
    return laneContext().policy();
  }

  @Override
  public Schedule schedule() {
    return laneContext().schedule();
  }

  @Override
  public Stage stage() {
    return laneContext().stage();
  }

  @Override
  public StoreBinding store() {
    return laneContext().store();
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return laneContext().bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    laneContext().openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    laneContext().closeDownlink(link);
  }

  @Override
  public void pushDown(Push<?> push) {
    laneContext().pushDown(push);
  }

  @Override
  public void reportDown(Metric metric) {
    laneContext().reportDown(metric);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    laneBinding().openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public void trace(Object message) {
    laneBinding().trace(message);
  }

  @Override
  public void debug(Object message) {
    laneBinding().debug(message);
  }

  @Override
  public void info(Object message) {
    laneBinding().info(message);
  }

  @Override
  public void warn(Object message) {
    laneBinding().warn(message);
  }

  @Override
  public void error(Object message) {
    laneBinding().error(message);
  }

  @Override
  public void fail(Object message) {
    laneBinding().fail(message);
  }

}
