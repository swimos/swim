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

package swim.runtime.warp;

import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.auth.Identity;
import swim.api.warp.WarpLane;
import swim.api.warp.WarpUplink;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;
import swim.concurrent.Conts;
import swim.observable.Observer;
import swim.runtime.LaneView;
import swim.runtime.observer.LaneObserver;
import swim.structure.Value;
import swim.warp.CommandMessage;

public abstract class WarpLaneView extends LaneView implements WarpLane {

  public WarpLaneView(LaneObserver observers) {
    super(observers);
  }

  @Override
  public WarpLaneView observe(Observer observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public WarpLaneView unobserve(Observer observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public abstract WarpLaneView willCommand(WillCommand willCommand);

  @Override
  public abstract WarpLaneView didCommand(DidCommand didCommand);

  @Override
  public abstract WarpLaneView willUplink(WillUplink willUplink);

  @Override
  public abstract WarpLaneView didUplink(DidUplink didUplink);

  @Override
  public abstract WarpLaneView willEnter(WillEnter willEnter);

  @Override
  public abstract WarpLaneView didEnter(DidEnter didEnter);

  @Override
  public abstract WarpLaneView willLeave(WillLeave willLeave);

  @Override
  public abstract WarpLaneView didLeave(DidLeave didLeave);

  public boolean dispatchWillCommand(Value body, boolean preemptive) {
    return this.observers.dispatchWillCommand(null, preemptive, body);
  }

  public boolean dispatchDidCommand(Value body, boolean preemptive) {
    return this.observers.dispatchDidCommand(null, preemptive, body);
  }

  public boolean dispatchWillUplink(WarpUplink uplink, boolean preemptive) {
    return this.observers.dispatchWillUplink(null, preemptive, uplink);
  }

  public boolean dispatchDidUplink(WarpUplink uplink, boolean preemptive) {
    return this.observers.dispatchDidUplink(null, preemptive, uplink);
  }

  public boolean dispatchWillEnter(Identity identity, boolean preemptive) {
    return this.observers.dispatchWillEnter(null, preemptive, identity);
  }

  public boolean dispatchDidEnter(Identity identity, boolean preemptive) {
    return this.observers.dispatchDidEnter(null, preemptive, identity);
  }

  public boolean dispatchWillLeave(Identity identity, boolean preemptive) {
    return this.observers.dispatchWillLeave(null, preemptive, identity);
  }

  public boolean dispatchDidLeave(Identity identity, boolean preemptive) {
    return this.observers.dispatchDidLeave(null, preemptive, identity);
  }

  public void laneWillCommand(CommandMessage message) {
    // stub
  }

  public void laneDidCommand(CommandMessage message) {
    // stub
  }

  public void laneWillUplink(WarpUplink uplink) {
    // stub
  }

  public void laneDidUplink(WarpUplink uplink) {
    // stub
  }

  public void laneWillEnter(Identity identity) {
    // stub
  }

  public void laneDidEnter(Identity identity) {
    // stub
  }

  public void laneWillLeave(Identity identity) {
    // stub
  }

  public void laneDidLeave(Identity identity) {
    // stub
  }

}
