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

package swim.runtime.http;

import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.http.HttpLane;
import swim.api.http.HttpUplink;
import swim.api.http.function.DecodeRequestHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.codec.Decoder;
import swim.concurrent.Conts;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.observable.Observer;
import swim.runtime.LaneView;
import swim.runtime.observer.LaneObserver;

public abstract class HttpLaneView<V> extends LaneView implements HttpLane<V> {

  public HttpLaneView(LaneObserver observers) {
    super(observers);
  }

  @Override
  public HttpLaneView<V> observe(Observer observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public HttpLaneView<V> unobserve(Observer observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public abstract HttpLaneView<V> decodeRequest(DecodeRequestHttp<V> decodeRequest);

  @Override
  public abstract HttpLaneView<V> willRequest(WillRequestHttp<?> willRequest);

  @Override
  public abstract HttpLaneView<V> didRequest(DidRequestHttp<V> didRequest);

  @Override
  public abstract HttpLaneView<V> doRespond(DoRespondHttp<V> doRespond);

  @Override
  public abstract HttpLaneView<V> willRespond(WillRespondHttp<?> willRespond);

  @Override
  public abstract HttpLaneView<V> didRespond(DidRespondHttp<?> didRespond);

  protected Decoder<Object> dispatchDecodeRequest(HttpUplink uplink, HttpRequest<?> request) {
    return this.observers.dispatchDecodeRequestHttp(uplink, request);
  }

  protected boolean dispatchWillRequest(HttpUplink uplink, HttpRequest<?> request, boolean preemptive) {
    return this.observers.dispatchWillRequestHttp(uplink, request, preemptive);
  }

  protected boolean dispatchDidRequest(HttpUplink uplink, HttpRequest<Object> request, boolean preemptive) {
    return this.observers.dispatchDidRequestHttp(uplink, request, preemptive);
  }

  protected Object dispatchDoRespond(HttpUplink uplink, HttpRequest<Object> request, boolean preemptive) {
    return this.observers.dispatchDoRespondHttp(uplink, request, preemptive);
  }

  protected boolean dispatchWillRespond(HttpUplink uplink, HttpResponse<?> response, boolean preemptive) {
    return this.observers.dispatchWillRespondHttp(uplink, response, preemptive);
  }

  protected boolean dispatchDidRespond(HttpUplink uplink, HttpResponse<?> response, boolean preemptive) {
    return this.observers.dispatchDidRespondHttp(uplink, response, preemptive);
  }

  public Decoder<Object> laneDecodeRequest(HttpUplink uplink, HttpRequest<?> request) {
    return null;
  }

  public void laneWillRequest(HttpUplink uplink, HttpRequest<?> request) {
    // stub
  }

  public void laneDidRequest(HttpUplink uplink, HttpRequest<Object> request) {
    // stub
  }

  public HttpResponse<?> laneDoRespond(HttpUplink uplink, HttpRequest<Object> request) {
    return null;
  }

  public void laneWillRespond(HttpUplink uplink, HttpResponse<?> response) {
    // stub
  }

  public void laneDidRespond(HttpUplink uplink, HttpResponse<?> response) {
    // stub
  }

}
