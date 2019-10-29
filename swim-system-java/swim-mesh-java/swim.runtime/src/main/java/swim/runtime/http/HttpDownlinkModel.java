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
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.runtime.DownlinkRelay;
import swim.uri.Uri;

public abstract class HttpDownlinkModel<View extends HttpDownlinkView<?>> extends HttpDownlinkModem<View> {

  public HttpDownlinkModel(Uri hostUri, HttpRequest<?> request) {
    super(hostUri, request);
  }

  @Override
  public HttpRequest<?> request() {
    return this.request;
  }

  @SuppressWarnings("unchecked")
  @Override
  public HttpRequest<?> doRequest() {
    final Object views = this.views;
    HttpDownlinkView<?> view;
    HttpRequest<?> request = null;
    if (views instanceof HttpDownlinkView) {
      view = (HttpDownlinkView<?>) views;
      request = view.dispatchDoRequest();
    } else if (views instanceof HttpDownlinkView[]) {
      final HttpDownlinkView<?>[] viewArray = (HttpDownlinkView<?>[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        view = viewArray[i];
        request = view.dispatchDoRequest();
        if (request != null) {
          break;
        }
      }
    }
    return request == null ? request() : request;
  }

  @Override
  public Decoder<Object> decodeResponseDown(HttpResponse<?> response) {
    final Object views = this.views;
    HttpDownlinkView<?> view;
    Decoder<Object> decoder = null;
    if (views instanceof HttpDownlinkView) {
      view = (HttpDownlinkView<?>) views;
      decoder = view.dispatchDecodeResponse(response);
    } else if (views instanceof HttpDownlinkView[]) {
      final HttpDownlinkView<?>[] viewArray = (HttpDownlinkView<?>[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        view = viewArray[i];
        decoder = view.dispatchDecodeResponse(response);
        if (decoder != null) {
          break;
        }
      }
    }
    if (decoder == null) {
      decoder = decodeRespondDefault(response);
    }
    return decoder;
  }

  @Override
  public void writeResponse(HttpResponse<?> response) {
    // stub
  }

  @Override
  public void willRequestDown(HttpRequest<?> request) {
    new HttpDownlinkRelayWillRequest<>(this, request).run();
  }

  @Override
  public void didRequestDown(HttpRequest<Object> request) {
    new HttpDownlinkRelayDidRequest<>(this, request).run();
  }

  @Override
  public void doRespondDown(HttpRequest<Object> request) {
    //stub
  }

  @Override
  public void willRespondDown(HttpResponse<?> response) {
    new HttpDownlinkRelayWillRespond<>(this, response).run();
  }

  @Override
  public void didRespondDown(HttpResponse<?> response) {
    new HttpDownlinkRelayDidRespond<>(this, response).run();
  }

  protected Decoder<Object> decodeRespondDefault(HttpResponse<?> response) {
    return response.contentDecoder();
  }

}

final class HttpDownlinkRelayWillRequest<View extends HttpDownlinkView<?>> extends DownlinkRelay<HttpDownlinkModel<View>, View> {

  final HttpRequest<?> request;

  HttpDownlinkRelayWillRequest(HttpDownlinkModel<View> model, HttpRequest<?> request) {
    super(model);
    this.request = request;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillRequest(this.request);
      }
      return view.dispatchWillRequest(this.request, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class HttpDownlinkRelayDidRequest<View extends HttpDownlinkView<?>> extends DownlinkRelay<HttpDownlinkModel<View>, View> {

  final HttpRequest<?> request;

  HttpDownlinkRelayDidRequest(HttpDownlinkModel<View> model, HttpRequest<?> request) {
    super(model);
    this.request = request;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkDidRequest(this.request);
      }
      return view.dispatchDidRequest(this.request, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class HttpDownlinkRelayWillRespond<View extends HttpDownlinkView<?>> extends DownlinkRelay<HttpDownlinkModel<View>, View> {

  final HttpResponse<?> response;

  HttpDownlinkRelayWillRespond(HttpDownlinkModel<View> model, HttpResponse<?> response) {
    super(model);
    this.response = response;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillRespond(this.response);
      }
      return view.dispatchWillRespond(this.response, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class HttpDownlinkRelayDidRespond<View extends HttpDownlinkView<?>> extends DownlinkRelay<HttpDownlinkModel<View>, View> {

  final HttpResponse<?> response;

  HttpDownlinkRelayDidRespond(HttpDownlinkModel<View> model, HttpResponse<?> response) {
    super(model);
    this.response = response;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkDidRespond(this.response);
      }
      return view.dispatchDidRespond(this.response, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}
