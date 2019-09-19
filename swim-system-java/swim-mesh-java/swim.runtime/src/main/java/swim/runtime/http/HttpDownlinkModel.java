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

import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.header.Host;
import swim.runtime.DownlinkRelay;
import swim.uri.Uri;

public abstract class HttpDownlinkModel<View extends HttpDownlinkView<?>> extends HttpDownlinkModem<View> {

  public HttpDownlinkModel(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri, Uri requestUri) {
    super(meshUri, hostUri, nodeUri, laneUri, requestUri);
  }

  @Override
  public HttpRequest<?> request() {
    // TODO figure out the headers
    return HttpRequest.get(this.requestUri, Host.from(this.requestUri.authority()));
  }

  @SuppressWarnings("unchecked")
  @Override
  public HttpRequest<?> doRequest() {
    final HttpDownlinkRelayRequest<?> relay = new HttpDownlinkRelayRequest<>(this, request());
    relay.run();
    if (relay.isDone()) {
      return relay.httpRequest;
    } else {
      return null;
    }
  }

  @SuppressWarnings({"unchecked"})
  @Override
  public void writeResponse(HttpResponse<?> response) {
    new HttpDownlinkRelayResponse<>(this, response).run();
  }
}

final class HttpDownlinkRelayRequest<View extends HttpDownlinkView<?>> extends DownlinkRelay<HttpDownlinkModel<View>, View> {

  final HttpRequest<?> httpRequest;

  HttpDownlinkRelayRequest(HttpDownlinkModel<View> model, HttpRequest<?> httpRequest) {
    super(model, 2);
    this.httpRequest = httpRequest;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillRequest(this.httpRequest);
      }
      return view.dispatchWillRequest(this.httpRequest, preemptive);
    } else if (phase == 1) {
      if (preemptive) {
        view.downlinkDidRequest(this.httpRequest);
      }
      return view.dispatchDidRequest(this.httpRequest, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

}

final class HttpDownlinkRelayResponse<View extends HttpDownlinkView<?>> extends DownlinkRelay<HttpDownlinkModel<View>, View> {

  final HttpResponse<?> httpResponse;

  HttpDownlinkRelayResponse(HttpDownlinkModel<View> model, HttpResponse<?> httpResponse) {
    super(model, 2);
    this.httpResponse = httpResponse;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillRespond(this.httpResponse);
      }
      return view.dispatchWillRespond(this.httpResponse, preemptive);
    } else if (phase == 1) {
      if (preemptive) {
        view.downlinkDidRespond(this.httpResponse);
      }
      return view.dispatchDidRespond(this.httpResponse, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}
