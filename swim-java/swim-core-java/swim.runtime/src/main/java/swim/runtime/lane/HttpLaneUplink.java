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

import swim.codec.Decoder;
import swim.concurrent.Stage;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.runtime.HttpBinding;
import swim.runtime.uplink.HttpUplinkModem;

public class HttpLaneUplink extends HttpUplinkModem {
  protected final LaneModel<?, ?> laneBinding;

  public HttpLaneUplink(LaneModel<?, ?> laneBinding, HttpBinding httpBinding) {
    super(httpBinding);
    this.laneBinding = laneBinding;
  }

  public LaneModel<?, ?> getLaneBinding() {
    return this.laneBinding;
  }

  @Override
  public Stage stage() {
    return this.laneBinding.stage();
  }

  @Override
  public HttpLaneUplink observe(Object observer) {
    return (HttpLaneUplink) super.observe(observer);
  }

  @Override
  public HttpLaneUplink unobserve(Object observer) {
    return (HttpLaneUplink) super.unobserve(observer);
  }

  @Override
  public Decoder<Object> decodeRequest(HttpRequest<?> request) {
    return this.laneBinding.decodeRequest(this, request);
  }

  @Override
  public void willRequest(HttpRequest<?> request) {
    this.laneBinding.willRequest(this, request);
  }

  @Override
  public void didRequest(HttpRequest<Object> request) {
    this.laneBinding.didRequest(this, request);
  }

  @Override
  public void willRespond(HttpResponse<?> response) {
    this.laneBinding.willRespond(this, response);
  }

  @Override
  public void didRespond(HttpResponse<?> response) {
    this.laneBinding.didRespond(this, response);
  }

  @Override
  public void traceUp(Object message) {
    this.laneBinding.trace(message);
  }

  @Override
  public void debugUp(Object message) {
    this.laneBinding.debug(message);
  }

  @Override
  public void infoUp(Object message) {
    this.laneBinding.info(message);
  }

  @Override
  public void warnUp(Object message) {
    this.laneBinding.warn(message);
  }

  @Override
  public void errorUp(Object message) {
    this.laneBinding.error(message);
  }
}
