// Copyright 2015-2022 Swim.inc
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

import swim.api.agent.AgentContext;
import swim.api.lane.SupplyLane;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;
import swim.structure.Form;
import swim.system.warp.WarpLaneView;

public class SupplyLaneView<V> extends WarpLaneView implements SupplyLane<V> {

  protected final AgentContext agentContext;
  protected Form<V> valueForm;
  protected SupplyLaneModel laneBinding;

  public SupplyLaneView(AgentContext agentContext, Form<V> valueForm, Object observers) {
    super(observers);
    this.agentContext = agentContext;
    this.valueForm = valueForm;
    this.laneBinding = null;
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
    return this.valueForm(Form.<V2>forClass(valueClass));
  }

  public void setValueForm(Form<V> valueForm) {
    this.valueForm = valueForm;
  }

  @Override
  public void close() {
    this.laneBinding.closeLaneView(this);
  }

  @Override
  public SupplyLaneView<V> observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public SupplyLaneView<V> unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public SupplyLaneView<V> willCommand(WillCommand willCommand) {
    return this.observe(willCommand);
  }

  @Override
  public SupplyLaneView<V> didCommand(DidCommand didCommand) {
    return this.observe(didCommand);
  }

  @Override
  public SupplyLaneView<V> willUplink(WillUplink willUplink) {
    return this.observe(willUplink);
  }

  @Override
  public SupplyLaneView<V> didUplink(DidUplink didUplink) {
    return this.observe(didUplink);
  }

  @Override
  public SupplyLaneView<V> willEnter(WillEnter willEnter) {
    return this.observe(willEnter);
  }

  @Override
  public SupplyLaneView<V> didEnter(DidEnter didEnter) {
    return this.observe(didEnter);
  }

  @Override
  public SupplyLaneView<V> willLeave(WillLeave willLeave) {
    return this.observe(willLeave);
  }

  @Override
  public SupplyLaneView<V> didLeave(DidLeave didLeave) {
    return this.observe(didLeave);
  }

  @Override
  public void push(V value) {
    final SupplyLaneModel laneBinding = this.laneBinding;
    if (laneBinding != null && laneBinding.isLinked()) {
      laneBinding.sendDown(this.valueForm.mold(value).toValue());
    }
  }

}
