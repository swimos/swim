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

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.agent.AgentContext;
import swim.api.auth.Identity;
import swim.api.downlink.Downlink;
import swim.api.function.DidCommand;
import swim.api.function.WillCommand;
import swim.api.http.HttpUplink;
import swim.api.http.function.DecodeRequestHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.api.lane.Lane;
import swim.api.lane.function.DidEnter;
import swim.api.lane.function.DidLeave;
import swim.api.lane.function.DidUplink;
import swim.api.lane.function.WillEnter;
import swim.api.lane.function.WillLeave;
import swim.api.lane.function.WillUplink;
import swim.api.policy.Policy;
import swim.api.uplink.Uplink;
import swim.codec.Decoder;
import swim.concurrent.Conts;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.runtime.AbstractTierBinding;
import swim.runtime.HttpBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LaneContext;
import swim.runtime.LinkBinding;
import swim.runtime.PushRequest;
import swim.runtime.TierContext;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public abstract class LaneView extends AbstractTierBinding implements Lane {
  protected volatile Object observers; // Observer | Observer[]

  public LaneView(Object observers) {
    this.observers = observers;
  }

  @Override
  public TierContext tierContext() {
    return null;
  }

  public abstract AgentContext agentContext();

  public abstract LaneBinding laneBinding();

  public LaneContext laneContext() {
    return laneBinding().laneContext();
  }

  public abstract LaneBinding createLaneBinding();

  @SuppressWarnings("unchecked")
  public <T> T unwrapLane(Class<T> laneClass) {
    if (laneClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public final Uri hostUri() {
    return laneBinding().hostUri();
  }

  @Override
  public final Uri nodeUri() {
    return laneBinding().nodeUri();
  }

  @Override
  public final Uri laneUri() {
    return laneBinding().laneUri();
  }

  @Override
  public abstract void close();

  @Override
  public LaneView observe(Object newObserver) {
    do {
      final Object oldObservers = this.observers;
      final Object newObservers;
      if (oldObservers == null) {
        newObservers = newObserver;
      } else if (!(oldObservers instanceof Object[])) {
        final Object[] newArray = new Object[2];
        newArray[0] = oldObservers;
        newArray[1] = newObserver;
        newObservers = newArray;
      } else {
        final Object[] oldArray = (Object[]) oldObservers;
        final int oldCount = oldArray.length;
        final Object[] newArray = new Object[oldCount + 1];
        System.arraycopy(oldArray, 0, newArray, 0, oldCount);
        newArray[oldCount] = newObserver;
        newObservers = newArray;
      }
      if (OBSERVERS.compareAndSet(this, oldObservers, newObservers)) {
        break;
      }
    } while (true);
    return this;
  }

  @Override
  public LaneView unobserve(Object oldObserver) {
    do {
      final Object oldObservers = this.observers;
      final Object newObservers;
      if (oldObservers == null) {
        break;
      } else if (!(oldObservers instanceof Object[])) {
        if (oldObservers == oldObserver) { // found as sole observer
          newObservers = null;
        } else {
          break; // not found
        }
      } else {
        final Object[] oldArray = (Object[]) oldObservers;
        final int oldCount = oldArray.length;
        if (oldCount == 2) {
          if (oldArray[0] == oldObserver) { // found at index 0
            newObservers = oldArray[1];
          } else if (oldArray[1] == oldObserver) { // found at index 1
            newObservers = oldArray[0];
          } else {
            break; // not found
          }
        } else {
          int i = 0;
          while (i < oldCount) {
            if (oldArray[i] == oldObserver) { // found at index i
              break;
            }
            i += 1;
          }
          if (i < oldCount) {
            final Object[] newArray = new Object[oldCount - 1];
            System.arraycopy(oldArray, 0, newArray, 0, i);
            System.arraycopy(oldArray, i + 1, newArray, i, oldCount - 1 - i);
            newObservers = newArray;
          } else {
            break; // not found
          }
        }
      }
      if (OBSERVERS.compareAndSet(this, oldObservers, newObservers)) {
        break;
      }
    } while (true);
    return this;
  }

  @Override
  public abstract LaneView willCommand(WillCommand willCommand);

  @Override
  public abstract LaneView didCommand(DidCommand didCommand);

  @Override
  public abstract LaneView willUplink(WillUplink willUplink);

  @Override
  public abstract LaneView didUplink(DidUplink didUplink);

  @Override
  public abstract LaneView willEnter(WillEnter willEnter);

  @Override
  public abstract LaneView didEnter(DidEnter didEnter);

  @Override
  public abstract LaneView willLeave(WillLeave willLeave);

  @Override
  public abstract LaneView didLeave(DidLeave didLeave);

  @Override
  public abstract LaneView decodeRequest(DecodeRequestHttp<Object> decodeRequest);

  @Override
  public abstract LaneView willRequest(WillRequestHttp<?> willRequest);

  @Override
  public abstract LaneView didRequest(DidRequestHttp<Object> didRequest);

  @Override
  public abstract LaneView doRespond(DoRespondHttp<Object> doRespond);

  @Override
  public abstract LaneView willRespond(WillRespondHttp<?> willRespond);

  @Override
  public abstract LaneView didRespond(DidRespondHttp<?> didRespond);

  protected boolean dispatchWillCommand(Value body, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    try {
      SwimContext.setLane(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillCommand) {
        if (((WillCommand) observers).isPreemptive() == preemptive) {
          try {
            ((WillCommand) observers).willCommand(body);
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
          if (observer instanceof WillCommand) {
            if (((WillCommand) observer).isPreemptive() == preemptive) {
              try {
                ((WillCommand) observer).willCommand(body);
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
      SwimContext.setLane(oldLane);
    }
  }

  protected boolean dispatchDidCommand(Value body, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    try {
      SwimContext.setLane(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidCommand) {
        if (((DidCommand) observers).isPreemptive() == preemptive) {
          try {
            ((DidCommand) observers).didCommand(body);
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
          if (observer instanceof DidCommand) {
            if (((DidCommand) observer).isPreemptive() == preemptive) {
              try {
                ((DidCommand) observer).didCommand(body);
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
      SwimContext.setLane(oldLane);
    }
  }

  protected boolean dispatchWillUplink(Uplink uplink, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillUplink) {
        if (((WillUplink) observers).isPreemptive() == preemptive) {
          try {
            ((WillUplink) observers).willUplink(uplink);
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
          if (observer instanceof WillUplink) {
            if (((WillUplink) observer).isPreemptive() == preemptive) {
              try {
                ((WillUplink) observer).willUplink(uplink);
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

  protected boolean dispatchDidUplink(Uplink uplink, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidUplink) {
        if (((DidUplink) observers).isPreemptive() == preemptive) {
          try {
            ((DidUplink) observers).didUplink(uplink);
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
          if (observer instanceof DidUplink) {
            if (((DidUplink) observer).isPreemptive() == preemptive) {
              try {
                ((DidUplink) observer).didUplink(uplink);
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

  protected boolean dispatchWillEnter(Identity identity, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    SwimContext.setLane(this);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillEnter) {
        if (((WillEnter) observers).isPreemptive() == preemptive) {
          try {
            ((WillEnter) observers).willEnter(identity);
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
          if (observer instanceof WillEnter) {
            if (((WillEnter) observer).isPreemptive() == preemptive) {
              try {
                ((WillEnter) observer).willEnter(identity);
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
      SwimContext.setLane(oldLane);
    }
  }

  protected boolean dispatchDidEnter(Identity identity, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    SwimContext.setLane(this);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidEnter) {
        if (((DidEnter) observers).isPreemptive() == preemptive) {
          try {
            ((DidEnter) observers).didEnter(identity);
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
          if (observer instanceof DidEnter) {
            if (((DidEnter) observer).isPreemptive() == preemptive) {
              try {
                ((DidEnter) observer).didEnter(identity);
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
      SwimContext.setLane(oldLane);
    }
  }

  protected boolean dispatchWillLeave(Identity identity, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    SwimContext.setLane(this);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillLeave) {
        if (((WillLeave) observers).isPreemptive() == preemptive) {
          try {
            ((WillLeave) observers).willLeave(identity);
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
          if (observer instanceof WillLeave) {
            if (((WillLeave) observer).isPreemptive() == preemptive) {
              try {
                ((WillLeave) observer).willLeave(identity);
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
      SwimContext.setLane(oldLane);
    }
  }

  protected boolean dispatchDidLeave(Identity identity, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    SwimContext.setLane(this);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidLeave) {
        if (((DidLeave) observers).isPreemptive() == preemptive) {
          try {
            ((DidLeave) observers).didLeave(identity);
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
          if (observer instanceof DidLeave) {
            if (((DidLeave) observer).isPreemptive() == preemptive) {
              try {
                ((DidLeave) observer).didLeave(identity);
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
      SwimContext.setLane(oldLane);
    }
  }

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

  public void laneWillCommand(CommandMessage message) {
    // stub
  }

  public void laneDidCommand(CommandMessage message) {
    // stub
  }

  public void laneWillUplink(Uplink uplink) {
    // stub
  }

  public void laneDidUplink(Uplink uplink) {
    // stub
  }

  public void laneWillEnter(Identity identity) {
    // stub
  }

  public void laneDidEnter(Identity identity) {
    // stub
  }

  public void laneWillLeave(Identity identity) {
    // stub
  }

  public void laneDidLeave(Identity identity) {
    // stub
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

  public void laneDidFail(Throwable error) {
    // stub
  }

  @Override
  public Uri meshUri() {
    return laneContext().meshUri();
  }

  @Override
  public Policy policy() {
    return laneContext().policy();
  }

  @Override
  public Schedule schedule() {
    return laneContext().schedule();
  }

  @Override
  public Stage stage() {
    return laneContext().stage();
  }

  @Override
  public StoreBinding store() {
    return laneContext().store();
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return laneContext().bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    laneContext().openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    laneContext().closeDownlink(link);
  }

  @Override
  public void httpDownlink(HttpBinding http) {
    laneContext().httpDownlink(http);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    laneContext().pushDown(pushRequest);
  }

  @Override
  public void trace(Object message) {
    laneBinding().trace(message);
  }

  @Override
  public void debug(Object message) {
    laneBinding().debug(message);
  }

  @Override
  public void info(Object message) {
    laneBinding().info(message);
  }

  @Override
  public void warn(Object message) {
    laneBinding().warn(message);
  }

  @Override
  public void error(Object message) {
    laneBinding().error(message);
  }

  static final AtomicReferenceFieldUpdater<LaneView, Object> OBSERVERS =
      AtomicReferenceFieldUpdater.newUpdater(LaneView.class, Object.class, "observers");
}
