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
import swim.runtime.LaneView;

public abstract class HttpLaneView<V> extends LaneView implements HttpLane<V> {
  public HttpLaneView(Object observers) {
    super(observers);
  }

  @Override
  public HttpLaneView<V> observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public HttpLaneView<V> unobserve(Object observer) {
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

  @SuppressWarnings("unchecked")
  protected Decoder<Object> dispatchDecodeRequest(HttpUplink uplink, HttpRequest<?> request) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      if (observers instanceof DecodeRequestHttp<?>) {
        try {
          final Decoder<Object> decoder = ((DecodeRequestHttp<Object>) observers).decodeRequest((HttpRequest<Object>) request);
          if (decoder != null) {
            return decoder;
          }
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            laneDidFail(error);
          }
          throw error;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DecodeRequestHttp<?>) {
            try {
              final Decoder<Object> decoder = ((DecodeRequestHttp<Object>) observer).decodeRequest((HttpRequest<Object>) request);
              if (decoder != null) {
                return decoder;
              }
            } catch (Throwable error) {
              if (Conts.isNonFatal(error)) {
                laneDidFail(error);
              }
              throw error;
            }
          }
        }
      }
      return null;
    } finally {
      SwimContext.setLink(oldLink);
      SwimContext.setLane(oldLane);
    }
  }

  @SuppressWarnings("unchecked")
  protected boolean dispatchWillRequest(HttpUplink uplink, HttpRequest<?> request, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillRequestHttp<?>) {
        if (((WillRequestHttp<?>) observers).isPreemptive() == preemptive) {
          try {
            ((WillRequestHttp<Object>) observers).willRequest((HttpRequest<Object>) request);
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
          if (observer instanceof WillRequestHttp<?>) {
            if (((WillRequestHttp<?>) observer).isPreemptive() == preemptive) {
              try {
                ((WillRequestHttp<Object>) observer).willRequest((HttpRequest<Object>) request);
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

  @SuppressWarnings("unchecked")
  protected boolean dispatchDidRequest(HttpUplink uplink, HttpRequest<Object> request, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidRequestHttp<?>) {
        if (((DidRequestHttp<?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidRequestHttp<Object>) observers).didRequest(request);
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
          if (observer instanceof DidRequestHttp<?>) {
            if (((DidRequestHttp<?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidRequestHttp<Object>) observer).didRequest(request);
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

  @SuppressWarnings("unchecked")
  protected Object dispatchDoRespond(HttpUplink uplink, HttpRequest<Object> request, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DoRespondHttp<?>) {
        if (((DoRespondHttp<?>) observers).isPreemptive() == preemptive) {
          try {
            final HttpResponse<?> response = ((DoRespondHttp<Object>) observers).doRespond(request);
            if (response != null) {
              return response;
            }
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
          if (observer instanceof DoRespondHttp<?>) {
            if (((DoRespondHttp<?>) observer).isPreemptive() == preemptive) {
              try {
                final HttpResponse<?> response = ((DoRespondHttp<Object>) observer).doRespond(request);
                if (response != null) {
                  return response;
                }
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

  @SuppressWarnings("unchecked")
  protected boolean dispatchWillRespond(HttpUplink uplink, HttpResponse<?> response, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillRespondHttp<?>) {
        if (((WillRespondHttp<?>) observers).isPreemptive() == preemptive) {
          try {
            ((WillRespondHttp<Object>) observers).willRespond((HttpResponse<Object>) response);
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
          if (observer instanceof WillRespondHttp<?>) {
            if (((WillRespondHttp<?>) observer).isPreemptive() == preemptive) {
              try {
                ((WillRespondHttp<Object>) observer).willRespond((HttpResponse<Object>) response);
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

  @SuppressWarnings("unchecked")
  protected boolean dispatchDidRespond(HttpUplink uplink, HttpResponse<?> response, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidRespondHttp<?>) {
        if (((DidRespondHttp<?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidRespondHttp<Object>) observers).didRespond((HttpResponse<Object>) response);
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
          if (observer instanceof DidRespondHttp<?>) {
            if (((DidRespondHttp<?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidRespondHttp<Object>) observer).didRespond((HttpResponse<Object>) response);
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
