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

package swim.system.http;

import swim.api.agent.AgentContext;
import swim.api.http.function.DecodeRequestHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;

public class RestLaneView<V> extends HttpLaneView<V> {

  protected final AgentContext agentContext;
  protected RestLaneModel laneBinding;

  public RestLaneView(AgentContext agentContext, Object observers) {
    super(observers);
    this.agentContext = agentContext;
  }

  @Override
  public AgentContext agentContext() {
    return this.agentContext;
  }

  @Override
  public RestLaneModel laneBinding() {
    return this.laneBinding;
  }

  void setLaneBinding(RestLaneModel laneBinding) {
    this.laneBinding = laneBinding;
  }

  @Override
  public RestLaneModel createLaneBinding() {
    return new RestLaneModel();
  }

  @Override
  public void close() {
    this.laneBinding.closeLaneView(this);
  }

  @Override
  public RestLaneView<V> observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public RestLaneView<V> unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public RestLaneView<V> decodeRequest(DecodeRequestHttp<V> decodeRequest) {
    return this.observe(decodeRequest);
  }

  @Override
  public RestLaneView<V> willRequest(WillRequestHttp<?> willRequest) {
    return this.observe(willRequest);
  }

  @Override
  public RestLaneView<V> didRequest(DidRequestHttp<V> didRequest) {
    return this.observe(didRequest);
  }

  @Override
  public RestLaneView<V> doRespond(DoRespondHttp<V> doRespond) {
    return this.observe(doRespond);
  }

  @Override
  public RestLaneView<V> willRespond(WillRespondHttp<?> willRespond) {
    return this.observe(willRespond);
  }

  @Override
  public RestLaneView<V> didRespond(DidRespondHttp<?> didRespond) {
    return this.observe(didRespond);
  }

}
