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

import swim.api.agent.AgentContext;
import swim.api.function.DidCommand;
import swim.api.function.WillCommand;
import swim.api.http.function.DecodeRequestHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.api.lane.SupplyLane;
import swim.api.lane.function.DidEnter;
import swim.api.lane.function.DidLeave;
import swim.api.lane.function.DidUplink;
import swim.api.lane.function.WillEnter;
import swim.api.lane.function.WillLeave;
import swim.api.lane.function.WillUplink;
import swim.structure.Form;

public class SupplyLaneView<V> extends LaneView implements SupplyLane<V> {
  protected final AgentContext agentContext;
  protected Form<V> valueForm;

  protected SupplyLaneModel laneBinding;

  public SupplyLaneView(AgentContext agentContext, Form<V> valueForm, Object observers) {
    super(observers);
    this.agentContext = agentContext;
    this.valueForm = valueForm;
  }

  public SupplyLaneView(AgentContext agentContext, Form<V> valueForm) {
    this(agentContext, valueForm, null);
  }

  @Override
  public AgentContext agentContext() {
    return this.agentContext;
  }

  @Override
  public SupplyLaneModel laneBinding() {
    return this.laneBinding;
  }

  void setLaneBinding(SupplyLaneModel laneBinding) {
    this.laneBinding = laneBinding;
  }

  @Override
  public SupplyLaneModel createLaneBinding() {
    return new SupplyLaneModel();
  }

  @Override
  public final Form<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public <V2> SupplyLaneView<V2> valueForm(Form<V2> valueForm) {
    return new SupplyLaneView<V2>(this.agentContext, valueForm, this.observers);
  }

  @Override
  public <V2> SupplyLaneView<V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  public void setValueForm(Form<V> valueForm) {
    this.valueForm = valueForm;
  }

  @Override
  public final boolean isSigned() {
    return false; // TODO
  }

  @Override
  public SupplyLaneView<V> isSigned(boolean isSigned) {
    return this; // TODO
  }

  @Override
  public void close() {
    this.laneBinding.closeLaneView(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public SupplyLaneView<V> observe(Object observer) {
    return (SupplyLaneView<V>) super.observe(observer);
  }

  @SuppressWarnings("unchecked")
  @Override
  public SupplyLaneView<V> unobserve(Object observer) {
    return (SupplyLaneView<V>) super.unobserve(observer);
  }

  @Override
  public SupplyLaneView<V> willCommand(WillCommand willCommand) {
    return observe(willCommand);
  }

  @Override
  public SupplyLaneView<V> didCommand(DidCommand didCommand) {
    return observe(didCommand);
  }

  @Override
  public SupplyLaneView<V> willUplink(WillUplink willUplink) {
    return observe(willUplink);
  }

  @Override
  public SupplyLaneView<V> didUplink(DidUplink didUplink) {
    return observe(didUplink);
  }

  @Override
  public SupplyLaneView<V> willEnter(WillEnter willEnter) {
    return observe(willEnter);
  }

  @Override
  public SupplyLaneView<V> didEnter(DidEnter didEnter) {
    return observe(didEnter);
  }

  @Override
  public SupplyLaneView<V> willLeave(WillLeave willLeave) {
    return observe(willLeave);
  }

  @Override
  public SupplyLaneView<V> didLeave(DidLeave didLeave) {
    return observe(didLeave);
  }

  @Override
  public SupplyLaneView<V> decodeRequest(DecodeRequestHttp<Object> decodeRequest) {
    return observe(decodeRequest);
  }

  @Override
  public SupplyLaneView<V> willRequest(WillRequestHttp<?> willRequest) {
    return observe(willRequest);
  }

  @Override
  public SupplyLaneView<V> didRequest(DidRequestHttp<Object> didRequest) {
    return observe(didRequest);
  }

  @Override
  public SupplyLaneView<V> doRespond(DoRespondHttp<Object> doRespond) {
    return observe(doRespond);
  }

  @Override
  public SupplyLaneView<V> willRespond(WillRespondHttp<?> willRespond) {
    return observe(willRespond);
  }

  @Override
  public SupplyLaneView<V> didRespond(DidRespondHttp<?> didRespond) {
    return observe(didRespond);
  }

  @Override
  public void push(V value) {
    this.laneBinding.sendDown(this.valueForm.mold(value).toValue());
  }
}
