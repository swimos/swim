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

import swim.api.Link;
import swim.api.SwimContext;
import swim.api.agent.AgentContext;
import swim.api.function.DidCommand;
import swim.api.function.WillCommand;
import swim.api.http.function.DecodeRequestHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.api.lane.CommandLane;
import swim.api.lane.Lane;
import swim.api.lane.function.DidEnter;
import swim.api.lane.function.DidLeave;
import swim.api.lane.function.DidUplink;
import swim.api.lane.function.OnCommand;
import swim.api.lane.function.WillEnter;
import swim.api.lane.function.WillLeave;
import swim.api.lane.function.WillUplink;
import swim.concurrent.Conts;
import swim.structure.Form;

public class CommandLaneView<V> extends LaneView implements CommandLane<V> {
  protected final AgentContext agentContext;
  protected Form<V> valueForm;

  protected CommandLaneModel laneBinding;

  public CommandLaneView(AgentContext agentContext, Form<V> valueForm, Object observers) {
    super(observers);
    this.agentContext = agentContext;
    this.valueForm = valueForm;
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
                                   typesafeObservers(this.observers));
  }

  @Override
  public <V2> CommandLaneView<V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  public void setValueForm(Form<V> valueForm) {
    this.valueForm = valueForm;
  }

  protected Object typesafeObservers(Object observers) {
    // TODO: filter out OnCommand
    return observers;
  }

  @Override
  public final boolean isSigned() {
    return false; // TODO
  }

  @Override
  public CommandLaneView<V> isSigned(boolean isSigned) {
    return this; // TODO
  }

  @Override
  public void close() {
    this.laneBinding.closeLaneView(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public CommandLaneView<V> observe(Object observer) {
    return (CommandLaneView<V>) super.observe(observer);
  }

  @SuppressWarnings("unchecked")
  @Override
  public CommandLaneView<V> unobserve(Object observer) {
    return (CommandLaneView<V>) super.unobserve(observer);
  }

  @Override
  public CommandLaneView<V> onCommand(OnCommand<V> onCommand) {
    return observe(onCommand);
  }

  @Override
  public CommandLaneView<V> willCommand(WillCommand willCommand) {
    return observe(willCommand);
  }

  @Override
  public CommandLaneView<V> didCommand(DidCommand didCommand) {
    return observe(didCommand);
  }

  @Override
  public CommandLaneView<V> willUplink(WillUplink willUplink) {
    return observe(willUplink);
  }

  @Override
  public CommandLaneView<V> didUplink(DidUplink didUplink) {
    return observe(didUplink);
  }

  @Override
  public CommandLaneView<V> willEnter(WillEnter willEnter) {
    return observe(willEnter);
  }

  @Override
  public CommandLaneView<V> didEnter(DidEnter didEnter) {
    return observe(didEnter);
  }

  @Override
  public CommandLaneView<V> willLeave(WillLeave willLeave) {
    return observe(willLeave);
  }

  @Override
  public CommandLaneView<V> didLeave(DidLeave didLeave) {
    return observe(didLeave);
  }

  @Override
  public CommandLaneView<V> decodeRequest(DecodeRequestHttp<Object> decodeRequest) {
    return observe(decodeRequest);
  }

  @Override
  public CommandLaneView<V> willRequest(WillRequestHttp<?> willRequest) {
    return observe(willRequest);
  }

  @Override
  public CommandLaneView<V> didRequest(DidRequestHttp<Object> didRequest) {
    return observe(didRequest);
  }

  @Override
  public CommandLaneView<V> doRespond(DoRespondHttp<Object> doRespond) {
    return observe(doRespond);
  }

  @Override
  public CommandLaneView<V> willRespond(WillRespondHttp<?> willRespond) {
    return observe(willRespond);
  }

  @Override
  public CommandLaneView<V> didRespond(DidRespondHttp<?> didRespond) {
    return observe(didRespond);
  }

  public void laneOnCommand(V value) {
  }

  @SuppressWarnings("unchecked")
  protected boolean dispatchOnCommand(Link link, V value, boolean preemptive) {
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
            if (Conts.isNonFatal(error)) {
              laneDidFail(error);
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
                if (Conts.isNonFatal(error)) {
                  laneDidFail(error);
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
