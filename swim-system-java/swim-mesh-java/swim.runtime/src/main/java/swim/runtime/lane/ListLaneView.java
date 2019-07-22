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

import java.util.AbstractMap;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.agent.AgentContext;
import swim.api.data.ListData;
import swim.api.lane.ListLane;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;
import swim.concurrent.Conts;
import swim.observable.function.DidClear;
import swim.observable.function.DidDrop;
import swim.observable.function.DidMoveIndex;
import swim.observable.function.DidRemoveIndex;
import swim.observable.function.DidTake;
import swim.observable.function.DidUpdateIndex;
import swim.observable.function.WillClear;
import swim.observable.function.WillDrop;
import swim.observable.function.WillMoveIndex;
import swim.observable.function.WillRemoveIndex;
import swim.observable.function.WillTake;
import swim.observable.function.WillUpdateIndex;
import swim.runtime.warp.WarpLaneView;
import swim.structure.Form;
import swim.util.KeyedList;

public class ListLaneView<V> extends WarpLaneView implements ListLane<V> {
  protected final AgentContext agentContext;
  protected Form<V> valueForm;

  protected int flags;
  protected ListLaneModel laneBinding;
  protected ListData<V> dataView;

  ListLaneView(AgentContext agentContext, Form<V> valueForm, int flags, Object observers) {
    super(observers);
    this.agentContext = agentContext;
    this.valueForm = valueForm;
    this.flags = flags;
  }

  public ListLaneView(AgentContext agentContext, Form<V> valueForm) {
    this(agentContext, valueForm, 0, null);
  }

  @Override
  public AgentContext agentContext() {
    return this.agentContext;
  }

  @Override
  public ListLaneModel laneBinding() {
    return this.laneBinding;
  }

  void setLaneBinding(ListLaneModel laneBinding) {
    this.laneBinding = laneBinding;
  }

  @Override
  public ListLaneModel createLaneBinding() {
    return new ListLaneModel(this.flags);
  }

  @Override
  public final Form<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public <V2> ListLaneView<V2> valueForm(Form<V2> valueForm) {
    return new ListLaneView<V2>(this.agentContext, valueForm, this.flags,
                                typesafeObservers(this.observers));
  }

  @Override
  public <V2> ListLaneView<V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  public void setValueForm(Form<V> valueForm) {
    this.valueForm = valueForm;
  }

  protected Object typesafeObservers(Object observers) {
    // TODO: filter out WillUpdateIndex, DidUpdateIndex,
    //       WillMoveIndex, DidMoveIndex, WillRemoveIndex, DidRemoveIndex,
    //       WillDrop, DidDrop, WillTake, DidTake, WillClear, DidClear
    return observers;
  }

  public final boolean isResident() {
    return (this.flags & RESIDENT) != 0;
  }

  @Override
  public ListLaneView<V> isResident(boolean isResident) {
    if (isResident) {
      this.flags |= RESIDENT;
    } else {
      this.flags &= ~RESIDENT;
    }
    final ListLaneModel laneBinding = this.laneBinding;
    if (laneBinding != null) {
      laneBinding.isResident(isResident);
    }
    return this;
  }

  void didSetResident(boolean isResident) {
    if (isResident) {
      this.flags |= RESIDENT;
    } else {
      this.flags &= ~RESIDENT;
    }
  }

  public final boolean isTransient() {
    return (this.flags & TRANSIENT) != 0;
  }

  @Override
  public ListLaneView<V> isTransient(boolean isTransient) {
    if (isTransient) {
      this.flags |= TRANSIENT;
    } else {
      this.flags &= ~TRANSIENT;
    }
    final ListLaneModel laneBinding = this.laneBinding;
    if (laneBinding != null) {
      laneBinding.isTransient(isTransient);
    }
    return this;
  }

  void didSetTransient(boolean isTransient) {
    if (isTransient) {
      this.flags |= TRANSIENT;
    } else {
      this.flags &= ~TRANSIENT;
    }
  }

  @Override
  protected void willLoad() {
    this.dataView = this.laneBinding.data.valueForm(this.valueForm);
    super.willLoad();
  }

  @Override
  public void close() {
    this.laneBinding.closeLaneView(this);
  }

  @Override
  public ListLaneView<V> observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public ListLaneView<V> unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public ListLaneView<V> willUpdate(WillUpdateIndex<V> willUpdate) {
    return observe(willUpdate);
  }

  @Override
  public ListLaneView<V> didUpdate(DidUpdateIndex<V> didUpdate) {
    return observe(didUpdate);
  }

  @Override
  public ListLaneView<V> willMove(WillMoveIndex<V> willMove) {
    return observe(willMove);
  }

  @Override
  public ListLaneView<V> didMove(DidMoveIndex<V> didMove) {
    return observe(didMove);
  }

  @Override
  public ListLaneView<V> willRemove(WillRemoveIndex willRemove) {
    return observe(willRemove);
  }

  @Override
  public ListLaneView<V> didRemove(DidRemoveIndex<V> didRemove) {
    return observe(didRemove);
  }

  @Override
  public ListLaneView<V> willDrop(WillDrop willDrop) {
    return observe(willDrop);
  }

  @Override
  public ListLaneView<V> didDrop(DidDrop didDrop) {
    return observe(didDrop);
  }

  @Override
  public ListLaneView<V> willTake(WillTake willTake) {
    return observe(willTake);
  }

  @Override
  public ListLaneView<V> didTake(DidTake didTake) {
    return observe(didTake);
  }

  @Override
  public ListLaneView<V> willClear(WillClear willClear) {
    return observe(willClear);
  }

  @Override
  public ListLaneView<V> didClear(DidClear didClear) {
    return observe(didClear);
  }

  @Override
  public ListLaneView<V> willCommand(WillCommand willCommand) {
    return observe(willCommand);
  }

  @Override
  public ListLaneView<V> didCommand(DidCommand didCommand) {
    return observe(didCommand);
  }

  @Override
  public ListLaneView<V> willUplink(WillUplink willUplink) {
    return observe(willUplink);
  }

  @Override
  public ListLaneView<V> didUplink(DidUplink didUplink) {
    return observe(didUplink);
  }

  @Override
  public ListLaneView<V> willEnter(WillEnter willEnter) {
    return observe(willEnter);
  }

  @Override
  public ListLaneView<V> didEnter(DidEnter didEnter) {
    return observe(didEnter);
  }

  @Override
  public ListLaneView<V> willLeave(WillLeave willLeave) {
    return observe(willLeave);
  }

  @Override
  public ListLaneView<V> didLeave(DidLeave didLeave) {
    return observe(didLeave);
  }

  @SuppressWarnings("unchecked")
  public Map.Entry<Boolean, V> dispatchWillUpdate(Link link, int index, V newValue, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillUpdateIndex<?>) {
        if (((WillUpdateIndex<?>) observers).isPreemptive() == preemptive) {
          try {
            newValue = ((WillUpdateIndex<V>) observers).willUpdate(index, newValue);
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
          if (observer instanceof WillUpdateIndex<?>) {
            if (((WillUpdateIndex<?>) observer).isPreemptive() == preemptive) {
              try {
                newValue = ((WillUpdateIndex<V>) observer).willUpdate(index, newValue);
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
      return new AbstractMap.SimpleImmutableEntry<Boolean, V>(complete, newValue);
    } finally {
      SwimContext.setLink(oldLink);
      SwimContext.setLane(oldLane);
    }
  }

  @SuppressWarnings("unchecked")
  public boolean dispatchDidUpdate(Link link, int index, V newValue, V oldValue, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidUpdateIndex<?>) {
        if (((DidUpdateIndex<?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidUpdateIndex<V>) observers).didUpdate(index, newValue, oldValue);
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
          if (observer instanceof DidUpdateIndex<?>) {
            if (((DidUpdateIndex<?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidUpdateIndex<V>) observer).didUpdate(index, newValue, oldValue);
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
  public boolean dispatchWillMove(Link link, int fromIndex, int toIndex, V value, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillMoveIndex<?>) {
        if (((WillMoveIndex<?>) observers).isPreemptive() == preemptive) {
          try {
            ((WillMoveIndex<V>) observers).willMove(fromIndex, toIndex, value);
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
          if (observer instanceof WillMoveIndex<?>) {
            if (((WillMoveIndex<?>) observer).isPreemptive() == preemptive) {
              try {
                ((WillMoveIndex<V>) observer).willMove(fromIndex, toIndex, value);
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
  public boolean dispatchDidMove(Link link, int fromIndex, int toIndex, V value, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidMoveIndex<?>) {
        if (((DidMoveIndex<?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidMoveIndex<V>) observers).didMove(fromIndex, toIndex, value);
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
          if (observer instanceof DidMoveIndex<?>) {
            if (((DidMoveIndex<?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidMoveIndex<V>) observer).didMove(fromIndex, toIndex, value);
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

  public boolean dispatchWillRemove(Link link, int index, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillRemoveIndex) {
        if (((WillRemoveIndex) observers).isPreemptive() == preemptive) {
          try {
            ((WillRemoveIndex) observers).willRemove(index);
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
          if (observer instanceof WillRemoveIndex) {
            if (((WillRemoveIndex) observer).isPreemptive() == preemptive) {
              try {
                ((WillRemoveIndex) observer).willRemove(index);
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
  public boolean dispatchDidRemove(Link link, int index, V oldValue, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidRemoveIndex<?>) {
        if (((DidRemoveIndex<?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidRemoveIndex<V>) observers).didRemove(index, oldValue);
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
          if (observer instanceof DidRemoveIndex<?>) {
            if (((DidRemoveIndex<?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidRemoveIndex<V>) observer).didRemove(index, oldValue);
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

  public boolean dispatchWillDrop(Link link, int lower, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillDrop) {
        if (((WillDrop) observers).isPreemptive() == preemptive) {
          try {
            ((WillDrop) observers).willDrop(lower);
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
          if (observer instanceof WillDrop) {
            if (((WillDrop) observer).isPreemptive() == preemptive) {
              try {
                ((WillDrop) observer).willDrop(lower);
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

  public boolean dispatchDidDrop(Link link, int lower, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidDrop) {
        if (((DidDrop) observers).isPreemptive() == preemptive) {
          try {
            ((DidDrop) observers).didDrop(lower);
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
          if (observer instanceof DidDrop) {
            if (((DidDrop) observer).isPreemptive() == preemptive) {
              try {
                ((DidDrop) observer).didDrop(lower);
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

  public boolean dispatchWillTake(Link link, int upper, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillTake) {
        if (((WillTake) observers).isPreemptive() == preemptive) {
          try {
            ((WillTake) observers).willTake(upper);
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
          if (observer instanceof WillTake) {
            if (((WillTake) observer).isPreemptive() == preemptive) {
              try {
                ((WillTake) observer).willTake(upper);
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

  public boolean dispatchDidTake(Link link, int upper, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidTake) {
        if (((DidTake) observers).isPreemptive() == preemptive) {
          try {
            ((DidTake) observers).didTake(upper);
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
          if (observer instanceof DidTake) {
            if (((DidTake) observer).isPreemptive() == preemptive) {
              try {
                ((DidTake) observer).didTake(upper);
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

  public boolean dispatchWillClear(Link link, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillClear) {
        if (((WillClear) observers).isPreemptive() == preemptive) {
          try {
            ((WillClear) observers).willClear();
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
          if (observer instanceof WillClear) {
            if (((WillClear) observer).isPreemptive() == preemptive) {
              try {
                ((WillClear) observer).willClear();
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

  public boolean dispatchDidClear(Link link, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidClear) {
        if (((DidClear) observers).isPreemptive() == preemptive) {
          try {
            ((DidClear) observers).didClear();
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
          if (observer instanceof DidClear) {
            if (((DidClear) observer).isPreemptive() == preemptive) {
              try {
                ((DidClear) observer).didClear();
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

  public V laneWillInsert(int index, V newValue) {
    return newValue;
  }

  public void laneDidInsert(int index, V newValue) {
  }

  public V laneWillUpdate(int index, V newValue) {
    return newValue;
  }

  public void laneDidUpdate(int index, V newValue, V oldValue) {
  }

  public void laneWillMove(int fromIndex, int toIndex, V value) {

  }

  public void laneDidMove(int fromIndex, int toIndex, V value) {
  }

  public void laneWillRemove(int index) {
  }

  public void laneDidRemove(int index, V oldValue) {
  }

  public void laneWillDrop(int lower) {
  }

  public void laneDidDrop(int lower) {
  }

  public void laneWillTake(int upper) {
  }

  public void laneDidTake(int upper) {
  }

  public void laneWillClear() {
  }

  public void laneDidClear() {
  }

  @Override
  public boolean isEmpty() {
    return this.dataView.isEmpty();
  }

  @Override
  public boolean contains(Object o) {
    return this.dataView.contains(o);
  }

  @Override
  public Iterator<V> iterator() {
    return this.dataView.iterator();
  }

  @Override
  public Object[] toArray() {
    return this.dataView.toArray();
  }

  @Override
  public <T> T[] toArray(T[] a) {
    return this.dataView.toArray(a);
  }

  @Override
  public boolean add(V v) {
    return this.laneBinding.add(this, size(), v);
  }

  @Override
  public boolean remove(Object o) {
    final int index = indexOf(o);
    if (index != -1) {
      final V oldObject = this.laneBinding.remove(this, index);
      return oldObject != null && oldObject != this.valueForm.unit(); // TODO
    }
    return false;
  }

  @Override
  public boolean containsAll(Collection<?> elements) {
    return this.dataView.containsAll(elements);
  }

  @Override
  public boolean addAll(Collection<? extends V> elements) {
    boolean added = false;
    for (V element: elements) {
      added = added || add(element);
    }
    return added;
  }

  @Override
  public boolean addAll(int index, Collection<? extends V> elements) {
    int position = index;
    for (V element: elements) {
      add(position++, element);
    }
    return elements.isEmpty();
  }

  @Override
  public boolean removeAll(Collection<?> elements) {
    boolean didRemove = false;
    for (Object element: elements) {
      final int index = indexOf(element);
      if (index != -1) {
        didRemove = didRemove || remove(element);
      }
    }
    return didRemove;
  }

  @Override
  public boolean retainAll(Collection<?> elements) {
    boolean modified = false;
    for (Object element: elements) {
      if (!elements.contains(element)) {
        modified = modified || remove(element);
      }
    }
    return modified;
  }

  @Override
  public int size() {
    return this.dataView.size();
  }

  @Override
  public void drop(int lower) {
    this.laneBinding.drop(this, lower);
  }

  @Override
  public void take(int upper) {
    this.laneBinding.take(this, upper);
  }

  @Override
  public void clear() {
    this.laneBinding.clear(this);
  }

  @Override
  public V get(int index) {
    return this.dataView.get(index);
  }

  @Override
  public V set(int index, V element) {
    return this.laneBinding.set(this, index, element);
  }

  @Override
  public void add(int index, V element) {
    this.laneBinding.add(this, index, element);
  }

  @Override
  public V remove(int index) {
    return this.laneBinding.remove(this, index);
  }

  @Override
  public int indexOf(Object o) {
    return this.dataView.indexOf(o);
  }

  @Override
  public int lastIndexOf(Object o) {
    return this.dataView.lastIndexOf(o);
  }

  @Override
  public ListIterator<V> listIterator() {
    return this.dataView.listIterator();
  }

  @Override
  public ListIterator<V> listIterator(int index) {
    return this.dataView.listIterator(index);
  }

  @Override
  public List<V> subList(int fromIndex, int toIndex) {
    return this.dataView.subList(fromIndex, toIndex);
  }

  @Override
  public KeyedList<V> snapshot() {
    return this.dataView.snapshot();
  }

  @Override
  public V get(int index, Object key) {
    return this.dataView.get(index, key);
  }

  @Override
  public Map.Entry<Object, V> getEntry(int index) {
    return this.dataView.getEntry(index);
  }

  @Override
  public Map.Entry<Object, V> getEntry(int index, Object key) {
    return this.dataView.getEntry(index, key);
  }

  @Override
  public V set(int index, V element, Object key) {
    return this.laneBinding.set(this, index, element, key);
  }

  @Override
  public boolean add(V element, Object key) {
    return this.laneBinding.add(this, size(), element, key);
  }

  @Override
  public void add(int index, V element, Object key) {
    this.laneBinding.add(this, index, element, key);
  }

  @Override
  public V remove(int index, Object key) {
    return this.laneBinding.remove(this, index, key);
  }

  @Override
  public void move(int fromIndex, int toIndex) {
    this.laneBinding.move(fromIndex, toIndex);
  }

  @Override
  public void move(int fromIndex, int toIndex, Object key) {
    this.laneBinding.move(fromIndex, toIndex, key);
  }

  @Override
  public ListIterator<Object> keyIterator() {
    return this.dataView.keyIterator();
  }

  @Override
  public ListIterator<Map.Entry<Object, V>> entryIterator() {
    return this.dataView.entryIterator();
  }

  static final int RESIDENT = 1 << 0;
  static final int TRANSIENT = 1 << 1;
  static final int SIGNED = 1 << 2;
}
