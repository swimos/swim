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

package swim.system.lane;

import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.agent.AgentContext;
import swim.api.lane.CommandLane;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.OnCommand;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;
import swim.concurrent.Cont;
import swim.structure.Form;
import swim.system.warp.WarpLaneView;

public class CommandLaneView<V> extends WarpLaneView implements CommandLane<V> {

  protected final AgentContext agentContext;
  protected Form<V> valueForm;
  protected CommandLaneModel laneBinding;

  public CommandLaneView(AgentContext agentContext, Form<V> valueForm, Object observers) {
    super(observers);
    this.agentContext = agentContext;
    this.valueForm = valueForm;
    this.laneBinding = null;
  }

  public CommandLaneView(AgentContext agentContext, Form<V> valueForm) {
    this(agentContext, valueForm, null);
  }

  @Override
  public AgentContext agentContext() {
    return this.agentContext;
  }

  @Override
  public CommandLaneModel laneBinding() {
    return this.laneBinding;
  }

  void setLaneBinding(CommandLaneModel laneBinding) {
    this.laneBinding = laneBinding;
  }

  @Override
  public CommandLaneModel createLaneBinding() {
    return new CommandLaneModel();
  }

  @Override
  public final Form<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public <V2> CommandLaneView<V2> valueForm(Form<V2> valueForm) {
    return new CommandLaneView<V2>(this.agentContext, valueForm,
                                   this.typesafeObservers(this.observers));
  }

  @Override
  public <V2> CommandLaneView<V2> valueClass(Class<V2> valueClass) {
    return this.valueForm(Form.<V2>forClass(valueClass));
  }

  public void setValueForm(Form<V> valueForm) {
    this.valueForm = valueForm;
  }

  protected Object typesafeObservers(Object observers) {
    // TODO: filter out OnCommand
    return observers;
  }

  @Override
  public void close() {
    this.laneBinding.closeLaneView(this);
  }

  @Override
  public CommandLaneView<V> observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public CommandLaneView<V> unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public CommandLaneView<V> onCommand(OnCommand<V> onCommand) {
    return this.observe(onCommand);
  }

  @Override
  public CommandLaneView<V> willCommand(WillCommand willCommand) {
    return this.observe(willCommand);
  }

  @Override
  public CommandLaneView<V> didCommand(DidCommand didCommand) {
    return this.observe(didCommand);
  }

  @Override
  public CommandLaneView<V> willUplink(WillUplink willUplink) {
    return this.observe(willUplink);
  }

  @Override
  public CommandLaneView<V> didUplink(DidUplink didUplink) {
    return this.observe(didUplink);
  }

  @Override
  public CommandLaneView<V> willEnter(WillEnter willEnter) {
    return this.observe(willEnter);
  }

  @Override
  public CommandLaneView<V> didEnter(DidEnter didEnter) {
    return this.observe(didEnter);
  }

  @Override
  public CommandLaneView<V> willLeave(WillLeave willLeave) {
    return this.observe(willLeave);
  }

  @Override
  public CommandLaneView<V> didLeave(DidLeave didLeave) {
    return this.observe(didLeave);
  }

  public void laneOnCommand(V value) {
    // hook
  }

  @SuppressWarnings("unchecked")
  public boolean dispatchOnCommand(Link link, V value, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof OnCommand<?>) {
        if (((OnCommand<?>) observers).isPreemptive() == preemptive) {
          try {
            ((OnCommand<V>) observers).onCommand(value);
          } catch (Throwable error) {
            if (Cont.isNonFatal(error)) {
              this.laneDidFail(error);
            }
            throw error;
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof OnCommand<?>) {
            if (((OnCommand<?>) observer).isPreemptive() == preemptive) {
              try {
                ((OnCommand<V>) observer).onCommand(value);
              } catch (Throwable error) {
                if (Cont.isNonFatal(error)) {
                  this.laneDidFail(error);
                }
                throw error;
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
      SwimContext.setLane(oldLane);
    }
  }

}
