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

import swim.api.Link;
import swim.api.SwimContext;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.http.HttpDownlink;
import swim.api.http.function.DecodeResponseHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRequestHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.codec.Decoder;
import swim.concurrent.Conts;
import swim.concurrent.Stage;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.header.Host;
import swim.runtime.CellContext;
import swim.runtime.DownlinkView;
import swim.uri.Uri;

public abstract class HttpDownlinkView<V> extends DownlinkView implements HttpDownlink<V> {

  protected Uri hostUri;
  protected HttpRequest<V> request;

  protected volatile int flags;

  public HttpDownlinkView(CellContext cellContext, Stage stage, Uri requestUri, Object observers) {
    super(cellContext, stage, observers);
    this.request = HttpRequest.get(requestUri, Host.from(requestUri.authority()));
    this.hostUri = Uri.empty().scheme(requestUri.scheme()).authority(requestUri.authority());
  }

  @Override
  public abstract HttpDownlinkModel<?> downlinkModel();

  @Override
  public final Uri hostUri() {
    return this.hostUri;
  }

  @Override
  public final Uri nodeUri() {
    return Uri.empty();
  }

  @Override
  public final Uri laneUri() {
    return Uri.empty();
  }

  @Override
  public HttpDownlinkView<V> requestUri(Uri requestUri) {
    this.request = HttpRequest.get(requestUri, Host.from(requestUri.authority()));
    this.hostUri = Uri.empty().scheme(requestUri.scheme()).authority(requestUri.authority());
    return this;
  }

  @Override
  public Uri requestUri() {
    return this.request.uri();
  }


  @Override
  public HttpDownlink<V> request(HttpRequest<V> request) {
    if (request.getHeader(Host.class) == null) {
      this.request = request.appendedHeader(Host.from(request.uri().authority()));
    } else {
      this.request = request;
    }
    this.hostUri = Uri.empty().scheme(request.uri().scheme()).authority(request.uri().authority());
    return this;
  }

  @Override
  public HttpRequest<V> request() {
    return this.request;
  }

  @Override
  public HttpDownlinkView<V> observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public HttpDownlinkView<V> unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public HttpDownlinkView<V> didConnect(DidConnect didConnect) {
    observe(didConnect);
    return this;
  }

  @Override
  public HttpDownlinkView<V> didDisconnect(DidDisconnect didDisconnect) {
    observe(didDisconnect);
    return this;
  }

  @Override
  public HttpDownlinkView<V> didClose(DidClose didClose) {
    observe(didClose);
    return this;
  }

  @Override
  public HttpDownlinkView<V> didFail(DidFail didFail) {
    observe(didFail);
    return this;
  }

  @Override
  public abstract HttpDownlinkModel<?> createDownlinkModel();

  @Override
  public abstract HttpDownlinkView<V> open();

  @Override
  public HttpDownlink<V> doRequest(DoRequestHttp<?> doRequest) {
    this.downlinkModel().doRequest();
    observe(doRequest);
    return this;
  }

  @Override
  public HttpDownlink<V> willRequest(WillRequestHttp<?> willRequest) {
    observe(willRequest);
    return this;
  }

  @Override
  public HttpDownlink<V> didRequest(DidRequestHttp<?> didRequest) {
    observe(didRequest);
    return this;
  }

  @Override
  public HttpDownlink<V> decodeResponse(DecodeResponseHttp<V> decodeResponse) {
    observe(decodeResponse);
    return this;
  }

  @Override
  public HttpDownlink<V> willRespond(WillRespondHttp<V> willRespond) {
    observe(willRespond);
    return this;
  }

  @Override
  public HttpDownlink<V> didRespond(DidRespondHttp<V> didRespond) {
    observe(didRespond);
    return this;
  }

  @SuppressWarnings("unchecked")
  public HttpRequest<?> dispatchDoRequest() {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      if (observers instanceof DoRequestHttp<?>) {
        try {
          final HttpRequest<?> request = ((DoRequestHttp<?>) observers).doRequest();
          if (request != null) {
            return request;
          }
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            downlinkDidFail(error);
          }
          throw error;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DoRequestHttp) {

            try {
              final HttpRequest<?> request = ((DoRequestHttp<?>) observer).doRequest();
              if (request != null) {
                return request;
              }
            } catch (Throwable error) {
              if (Conts.isNonFatal(error)) {
                downlinkDidFail(error);
              }
              throw error;
            }
          }
        }
      }
      return null;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  @SuppressWarnings("unchecked")
  public <R> boolean dispatchWillRequest(HttpRequest<R> httpRequest, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillRequestHttp) {
        if (((WillRequestHttp<R>) observers).isPreemptive() == preemptive) {
          try {
            ((WillRequestHttp<R>) observers).willRequest(httpRequest);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
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
          if (observer instanceof WillRequestHttp) {
            if (((WillRequestHttp<R>) observer).isPreemptive() == preemptive) {
              try {
                ((WillRequestHttp<R>) observer).willRequest(httpRequest);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
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
    }
  }

  @SuppressWarnings("unchecked")
  public <R> boolean dispatchDidRequest(HttpRequest<R> httpRequest, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidRequestHttp) {
        if (((DidRequestHttp<R>) observers).isPreemptive() == preemptive) {
          try {
            ((DidRequestHttp<R>) observers).didRequest(httpRequest);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
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
          if (observer instanceof DidRequestHttp) {
            if (((DidRequestHttp<R>) observer).isPreemptive() == preemptive) {
              try {
                ((DidRequestHttp<R>) observer).didRequest(httpRequest);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
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
    }
  }

  @SuppressWarnings("unchecked")
  public <R> boolean dispatchWillRespond(HttpResponse<R> httpResponse, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillRespondHttp) {
        if (((WillRespondHttp<R>) observers).isPreemptive() == preemptive) {
          try {
            ((WillRespondHttp<R>) observers).willRespond(httpResponse);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
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
          if (observer instanceof WillRespondHttp) {
            if (((WillRespondHttp<R>) observer).isPreemptive() == preemptive) {
              try {
                ((WillRespondHttp<R>) observer).willRespond(httpResponse);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
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
    }
  }

  @SuppressWarnings("unchecked")
  public Decoder<Object> dispatchDecodeResponse(HttpResponse<?> response) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      if (observers instanceof DecodeResponseHttp<?>) {
        try {
          final Decoder<Object> decoder = ((DecodeResponseHttp<Object>) observers).decodeResponse((HttpResponse<Object>) response);
          if (decoder != null) {
            return decoder;
          }
        } catch (Throwable error) {
          throw error;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DecodeResponseHttp<?>) {
            try {
              final Decoder<Object> decoder = ((DecodeResponseHttp<Object>) observer).decodeResponse((HttpResponse<Object>) response);
              if (decoder != null) {
                return decoder;
              }
            } catch (Throwable error) {
              throw error;
            }
          }
        }
      }
      return null;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  @SuppressWarnings("unchecked")
  public <R> boolean dispatchDidRespond(HttpResponse<R> httpResponse, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLink(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidRespondHttp) {
        if (((DidRespondHttp<R>) observers).isPreemptive() == preemptive) {
          try {
            ((DidRespondHttp<R>) observers).didRespond(httpResponse);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              downlinkDidFail(error);
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
          if (observer instanceof DidRespondHttp) {
            if (((DidRespondHttp<R>) observer).isPreemptive() == preemptive) {
              try {
                ((DidRespondHttp<R>) observer).didRespond(httpResponse);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  downlinkDidFail(error);
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
    }
  }

  public void downlinkWillRequest(HttpRequest<?> httpRequest) {
    // stub
  }

  public void downlinkDidRequest(HttpRequest<?> httpRequest) {
    // stub
  }

  public void downlinkWillRespond(HttpResponse<?> httpResponse) {
    // stub
  }

  public void downlinkDidRespond(HttpResponse<?> httpResponse) {
    // stub
  }

}
