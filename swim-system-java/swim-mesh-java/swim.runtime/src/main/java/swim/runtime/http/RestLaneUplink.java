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

package swim.runtime.http;

import swim.codec.Decoder;
import swim.concurrent.Stage;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.runtime.HttpBinding;

public class RestLaneUplink extends HttpUplinkModem {
  protected final RestLaneModel laneBinding;

  public RestLaneUplink(RestLaneModel laneBinding, HttpBinding linkBinding) {
    super(linkBinding);
    this.laneBinding = laneBinding;
  }

  @Override
  public final RestLaneModel laneBinding() {
    return this.laneBinding;
  }

  @Override
  public Stage stage() {
    return this.laneBinding.stage();
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
  public void doRespond(HttpRequest<Object> request) {
    this.laneBinding.doRespond(this, request);
  }

  @Override
  public void willRespond(HttpResponse<?> response) {
    this.laneBinding.willRespond(this, response);
  }

  @Override
  public void didRespond(HttpResponse<?> response) {
    this.laneBinding.didRespond(this, response);
  }
}
