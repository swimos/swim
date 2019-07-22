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

package swim.runtime.lane;

import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.agent.AgentContext;
import swim.api.lane.DemandLane;
import swim.api.lane.function.OnCue;
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
import swim.runtime.warp.WarpLaneView;
import swim.structure.Form;
import swim.structure.Value;

public class DemandLaneView<V> extends WarpLaneView implements DemandLane<V> {
  protected final AgentContext agentContext;
  protected Form<V> valueForm;

  protected DemandLaneModel laneBinding;
  protected volatile OnCue<V> onCue;

  public DemandLaneView(AgentContext agentContext, Form<V> valueForm, Object observers) {
    super(observers);
    this.agentContext = agentContext;
    this.valueForm = valueForm;
    this.onCue = onCue;
  }

  public DemandLaneView(AgentContext agentContext, Form<V> valueForm) {
    this(agentContext, valueForm, null);
  }

  @Override
  public AgentContext agentContext() {
    return this.agentContext;
  }

  @Override
  public DemandLaneModel laneBinding() {
    return this.laneBinding;
  }

  void setLaneBinding(DemandLaneModel laneBinding) {
    this.laneBinding = laneBinding;
  }

  @Override
  public DemandLaneModel createLaneBinding() {
    return new DemandLaneModel();
  }

  @Override
  public final Form<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public <V2> DemandLaneView<V2> valueForm(Form<V2> valueForm) {
    return new DemandLaneView<V2>(this.agentContext, valueForm, typesafeObservers(this.observers));
  }

  @Override
  public <V2> DemandLaneView<V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  public void setValueForm(Form<V> valueForm) {
    this.valueForm = valueForm;
  }

  protected Object typesafeObservers(Object observers) {
    // TODO: filter out OnCue
    return observers;
  }

  @Override
  public void close() {
    this.laneBinding.closeLaneView(this);
  }

  @Override
  public DemandLaneView<V> observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public DemandLaneView<V> unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public DemandLaneView<V> onCue(OnCue<V> onCue) {
    return observe(onCue);
  }

  @Override
  public DemandLaneView<V> willCommand(WillCommand willCommand) {
    return observe(willCommand);
  }

  @Override
  public DemandLaneView<V> didCommand(DidCommand didCommand) {
    return observe(didCommand);
  }

  @Override
  public DemandLaneView<V> willUplink(WillUplink willUplink) {
    return observe(willUplink);
  }

  @Override
  public DemandLaneView<V> didUplink(DidUplink didUplink) {
    return observe(didUplink);
  }

  @Override
  public DemandLaneView<V> willEnter(WillEnter willEnter) {
    return observe(willEnter);
  }

  @Override
  public DemandLaneView<V> didEnter(DidEnter didEnter) {
    return observe(didEnter);
  }

  @Override
  public DemandLaneView<V> willLeave(WillLeave willLeave) {
    return observe(willLeave);
  }

  @Override
  public DemandLaneView<V> didLeave(DidLeave didLeave) {
    return observe(didLeave);
  }

  @SuppressWarnings("unchecked")
  public V dispatchOnCue(WarpUplink uplink) {
    final Lane lane = SwimContext.getLane();
    final Link link = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      if (observers instanceof OnCue<?>) {
        try {
          final V value = ((OnCue<V>) observers).onCue(uplink);
          if (value != null) {
            return value;
          }
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            laneDidFail(error);
          }
          throw error;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof OnCue<?>) {
            try {
              final V value = ((OnCue<V>) observer).onCue(uplink);
              if (value != null) {
                return value;
              }
            } catch (Throwable error) {
              if (Conts.isNonFatal(error)) {
                laneDidFail(error);
              }
              throw error;
            }
          }
        }
      }
      return null;
    } finally {
      SwimContext.setLink(link);
      SwimContext.setLane(lane);
    }
  }

  Value nextDownCue(WarpUplink uplink) {
    final V object = dispatchOnCue(uplink);
    if (object != null) {
      return this.valueForm.mold(object).toValue();
    } else {
      return null;
    }
  }

  @Override
  public void cue() {
    this.laneBinding.cueDown();
  }
}
