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

package swim.system;

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Downlink;
import swim.api.Lane;
import swim.api.agent.AgentContext;
import swim.api.policy.Policy;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.store.StoreBinding;
import swim.uri.Uri;

public abstract class LaneView extends AbstractTierBinding implements Lane {

  protected volatile Object observers; // Observer | Observer[]

  public LaneView(Object observers) {
    this.observers = observers;
  }

  @Override
  public TierContext tierContext() {
    return null;
  }

  public abstract AgentContext agentContext();

  public abstract LaneBinding laneBinding();

  public LaneContext laneContext() {
    return this.laneBinding().laneContext();
  }

  public abstract LaneBinding createLaneBinding();

  @SuppressWarnings("unchecked")
  public <T> T unwrapLane(Class<T> laneClass) {
    if (laneClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  public <T> T bottomLane(Class<T> laneClass) {
    if (laneClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public LaneAddress cellAddress() {
    return this.laneContext().cellAddress();
  }

  @Override
  public final String edgeName() {
    return this.laneContext().edgeName();
  }

  @Override
  public final Uri meshUri() {
    return this.laneContext().meshUri();
  }

  @Override
  public final Uri hostUri() {
    return this.laneBinding().hostUri();
  }

  @Override
  public final Uri nodeUri() {
    return this.laneBinding().nodeUri();
  }

  @Override
  public final Uri laneUri() {
    return this.laneBinding().laneUri();
  }

  @Override
  public abstract void close();

  @Override
  public LaneView observe(Object newObserver) {
    do {
      final Object oldObservers = LaneView.OBSERVERS.get(this);
      final Object newObservers;
      if (oldObservers == null) {
        newObservers = newObserver;
      } else if (!(oldObservers instanceof Object[])) {
        final Object[] newArray = new Object[2];
        newArray[0] = oldObservers;
        newArray[1] = newObserver;
        newObservers = newArray;
      } else {
        final Object[] oldArray = (Object[]) oldObservers;
        final int oldCount = oldArray.length;
        final Object[] newArray = new Object[oldCount + 1];
        System.arraycopy(oldArray, 0, newArray, 0, oldCount);
        newArray[oldCount] = newObserver;
        newObservers = newArray;
      }
      if (LaneView.OBSERVERS.compareAndSet(this, oldObservers, newObservers)) {
        break;
      }
    } while (true);
    return this;
  }

  @Override
  public LaneView unobserve(Object oldObserver) {
    do {
      final Object oldObservers = LaneView.OBSERVERS.get(this);
      final Object newObservers;
      if (oldObservers == null) {
        break;
      } else if (!(oldObservers instanceof Object[])) {
        if (oldObservers == oldObserver) { // found as sole observer
          newObservers = null;
        } else {
          break; // not found
        }
      } else {
        final Object[] oldArray = (Object[]) oldObservers;
        final int oldCount = oldArray.length;
        if (oldCount == 2) {
          if (oldArray[0] == oldObserver) { // found at index 0
            newObservers = oldArray[1];
          } else if (oldArray[1] == oldObserver) { // found at index 1
            newObservers = oldArray[0];
          } else {
            break; // not found
          }
        } else {
          int i = 0;
          while (i < oldCount) {
            if (oldArray[i] == oldObserver) { // found at index i
              break;
            }
            i += 1;
          }
          if (i < oldCount) {
            final Object[] newArray = new Object[oldCount - 1];
            System.arraycopy(oldArray, 0, newArray, 0, i);
            System.arraycopy(oldArray, i + 1, newArray, i, oldCount - 1 - i);
            newObservers = newArray;
          } else {
            break; // not found
          }
        }
      }
      if (LaneView.OBSERVERS.compareAndSet(this, oldObservers, newObservers)) {
        break;
      }
    } while (true);
    return this;
  }

  public void laneDidFail(Throwable error) {
    // hook
  }

  @Override
  public Policy policy() {
    return this.laneContext().policy();
  }

  @Override
  public Schedule schedule() {
    return this.laneContext().schedule();
  }

  @Override
  public Stage stage() {
    return this.laneContext().stage();
  }

  @Override
  public StoreBinding store() {
    return this.laneContext().store();
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.laneContext().bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.laneContext().openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    this.laneContext().closeDownlink(link);
  }

  @Override
  public void pushDown(Push<?> push) {
    this.laneContext().pushDown(push);
  }

  @Override
  public void reportDown(Metric metric) {
    this.laneContext().reportDown(metric);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.laneBinding().openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public void trace(Object message) {
    this.laneBinding().trace(message);
  }

  @Override
  public void debug(Object message) {
    this.laneBinding().debug(message);
  }

  @Override
  public void info(Object message) {
    this.laneBinding().info(message);
  }

  @Override
  public void warn(Object message) {
    this.laneBinding().warn(message);
  }

  @Override
  public void error(Object message) {
    this.laneBinding().error(message);
  }

  @Override
  public void fail(Object message) {
    this.laneBinding().fail(message);
  }

  static final AtomicReferenceFieldUpdater<LaneView, Object> OBSERVERS =
      AtomicReferenceFieldUpdater.newUpdater(LaneView.class, Object.class, "observers");

}
