// Copyright 2015-2021 Swim inc.
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
import java.util.Comparator;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.agent.AgentContext;
import swim.api.data.MapData;
import swim.api.lane.MapLane;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;
import swim.collections.HashTrieMap;
import swim.concurrent.Cont;
import swim.observable.function.DidClear;
import swim.observable.function.DidDrop;
import swim.observable.function.DidRemoveKey;
import swim.observable.function.DidTake;
import swim.observable.function.DidUpdateKey;
import swim.observable.function.WillClear;
import swim.observable.function.WillDrop;
import swim.observable.function.WillRemoveKey;
import swim.observable.function.WillTake;
import swim.observable.function.WillUpdateKey;
import swim.runtime.warp.WarpLaneView;
import swim.streamlet.Inlet;
import swim.streamlet.KeyEffect;
import swim.streamlet.KeyOutlet;
import swim.streamlet.MapInlet;
import swim.streamlet.MapOutlet;
import swim.streamlet.Outlet;
import swim.structure.Form;
import swim.util.Cursor;
import swim.util.OrderedMap;
import swim.util.OrderedMapCursor;

public class MapLaneView<K, V> extends WarpLaneView implements MapLane<K, V> {

  protected final AgentContext agentContext;
  protected Form<K> keyForm;
  protected Form<V> valueForm;
  protected MapLaneModel laneBinding;
  protected MapData<K, V> dataView;
  protected int flags;

  protected MapOutlet<K, V, ? extends Map<K, V>> input;
  protected HashTrieMap<K, KeyEffect> effects;
  protected HashTrieMap<K, KeyOutlet<K, V>> outlets;
  protected Inlet<? super MapLane<K, V>>[] outputs; // TODO: unify with observers
  protected int version;

  MapLaneView(AgentContext agentContext, Form<K> keyForm, Form<V> valueForm,
              int flags, Object observers) {
    super(observers);
    this.agentContext = agentContext;
    this.keyForm = keyForm;
    this.valueForm = valueForm;
    this.laneBinding = null;
    this.dataView = null;
    this.flags = flags;

    this.input = null;
    this.effects = HashTrieMap.empty();
    this.outlets = HashTrieMap.empty();
    this.outputs = null;
    this.version = -1;
  }

  public MapLaneView(AgentContext agentContext, Form<K> keyForm, Form<V> valueForm) {
    this(agentContext, keyForm, valueForm, 0, null);
  }

  @Override
  public AgentContext agentContext() {
    return this.agentContext;
  }

  @Override
  public MapLaneModel laneBinding() {
    return this.laneBinding;
  }

  void setLaneBinding(MapLaneModel laneBinding) {
    this.laneBinding = laneBinding;
  }

  @Override
  public MapLaneModel createLaneBinding() {
    return new MapLaneModel(this.flags);
  }

  @Override
  public final Form<K> keyForm() {
    return this.keyForm;
  }

  @Override
  public <K2> MapLaneView<K2, V> keyForm(Form<K2> keyForm) {
    return new MapLaneView<K2, V>(this.agentContext, keyForm, this.valueForm,
                                  this.flags, this.typesafeObservers(this.observers));
  }

  @Override
  public <K2> MapLaneView<K2, V> keyClass(Class<K2> keyClass) {
    return this.keyForm(Form.<K2>forClass(keyClass));
  }

  public void setKeyForm(Form<K> keyForm) {
    this.keyForm = keyForm;
  }

  @Override
  public final Form<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public <V2> MapLaneView<K, V2> valueForm(Form<V2> valueForm) {
    return new MapLaneView<K, V2>(this.agentContext, this.keyForm, valueForm,
                                  this.flags, this.typesafeObservers(this.observers));
  }

  @Override
  public <V2> MapLaneView<K, V2> valueClass(Class<V2> valueClass) {
    return this.valueForm(Form.<V2>forClass(valueClass));
  }

  public void setValueForm(Form<V> valueForm) {
    this.valueForm = valueForm;
  }

  protected Object typesafeObservers(Object observers) {
    // TODO: filter out WillUpdateKey, DidUpdateKey, WillRemoveKey, DidRemoveKey,
    //       WillDrop, DidDrop, WillTake, DidTake, WillClear, DidClear
    return observers;
  }

  public final boolean isResident() {
    return (this.flags & MapLaneView.RESIDENT) != 0;
  }

  @Override
  public MapLaneView<K, V> isResident(boolean isResident) {
    if (isResident) {
      this.flags |= MapLaneView.RESIDENT;
    } else {
      this.flags &= ~MapLaneView.RESIDENT;
    }
    final MapLaneModel laneBinding = this.laneBinding;
    if (laneBinding != null) {
      laneBinding.isResident(isResident);
    }
    return this;
  }

  void didSetResident(boolean isResident) {
    if (isResident) {
      this.flags |= MapLaneView.RESIDENT;
    } else {
      this.flags &= ~MapLaneView.RESIDENT;
    }
  }

  public final boolean isTransient() {
    return (this.flags & MapLaneView.TRANSIENT) != 0;
  }

  @Override
  public MapLaneView<K, V> isTransient(boolean isTransient) {
    if (isTransient) {
      this.flags |= MapLaneView.TRANSIENT;
    } else {
      this.flags &= ~MapLaneView.TRANSIENT;
    }
    final MapLaneModel laneBinding = this.laneBinding;
    if (laneBinding != null) {
      laneBinding.isTransient(isTransient);
    }
    return this;
  }

  void didSetTransient(boolean isTransient) {
    if (isTransient) {
      this.flags |= MapLaneView.TRANSIENT;
    } else {
      this.flags &= ~MapLaneView.TRANSIENT;
    }
  }

  @Override
  protected void willLoad() {
    this.dataView = this.laneBinding.data.keyForm(this.keyForm).valueForm(this.valueForm);
    super.willLoad();
  }

  @Override
  public void close() {
    this.laneBinding.closeLaneView(this);
  }

  @Override
  public MapLaneView<K, V> observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public MapLaneView<K, V> unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public MapLaneView<K, V> willUpdate(WillUpdateKey<K, V> willUpdate) {
    return this.observe(willUpdate);
  }

  @Override
  public MapLaneView<K, V> didUpdate(DidUpdateKey<K, V> didUpdate) {
    return this.observe(didUpdate);
  }

  @Override
  public MapLaneView<K, V> willRemove(WillRemoveKey<K> willRemove) {
    return this.observe(willRemove);
  }

  @Override
  public MapLaneView<K, V> didRemove(DidRemoveKey<K, V> didRemove) {
    return this.observe(didRemove);
  }

  @Override
  public MapLaneView<K, V> willDrop(WillDrop willDrop) {
    return this.observe(willDrop);
  }

  @Override
  public MapLaneView<K, V> didDrop(DidDrop didDrop) {
    return this.observe(didDrop);
  }

  @Override
  public MapLaneView<K, V> willTake(WillTake willTake) {
    return this.observe(willTake);
  }

  @Override
  public MapLaneView<K, V> didTake(DidTake didTake) {
    return this.observe(didTake);
  }

  @Override
  public MapLaneView<K, V> willClear(WillClear willClear) {
    return this.observe(willClear);
  }

  @Override
  public MapLaneView<K, V> didClear(DidClear didClear) {
    return this.observe(didClear);
  }

  @Override
  public MapLaneView<K, V> willCommand(WillCommand willCommand) {
    return this.observe(willCommand);
  }

  @Override
  public MapLaneView<K, V> didCommand(DidCommand didCommand) {
    return this.observe(didCommand);
  }

  @Override
  public MapLaneView<K, V> willUplink(WillUplink willUplink) {
    return this.observe(willUplink);
  }

  @Override
  public MapLaneView<K, V> didUplink(DidUplink didUplink) {
    return this.observe(didUplink);
  }

  @Override
  public MapLaneView<K, V> willEnter(WillEnter willEnter) {
    return this.observe(willEnter);
  }

  @Override
  public MapLaneView<K, V> didEnter(DidEnter didEnter) {
    return this.observe(didEnter);
  }

  @Override
  public MapLaneView<K, V> willLeave(WillLeave willLeave) {
    return this.observe(willLeave);
  }

  @Override
  public MapLaneView<K, V> didLeave(DidLeave didLeave) {
    return this.observe(didLeave);
  }

  @SuppressWarnings("unchecked")
  public Entry<Boolean, V> dispatchWillUpdate(Link link, K key, V newValue, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillUpdateKey<?, ?>) {
        if (((WillUpdateKey<?, ?>) observers).isPreemptive() == preemptive) {
          try {
            newValue = ((WillUpdateKey<K, V>) observers).willUpdate(key, newValue);
          } catch (Throwable error) {
            if (Cont.isNonFatal(error)) {
              this.laneDidFail(error);
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
          if (observer instanceof WillUpdateKey<?, ?>) {
            if (((WillUpdateKey<?, ?>) observer).isPreemptive() == preemptive) {
              try {
                newValue = ((WillUpdateKey<K, V>) observer).willUpdate(key, newValue);
              } catch (Throwable error) {
                if (Cont.isNonFatal(error)) {
                  this.laneDidFail(error);
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
  public boolean dispatchDidUpdate(Link link, K key, V newValue, V oldValue, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidUpdateKey<?, ?>) {
        if (((DidUpdateKey<?, ?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidUpdateKey<K, V>) observers).didUpdate(key, newValue, oldValue);
          } catch (Throwable error) {
            if (Cont.isNonFatal(error)) {
              this.laneDidFail(error);
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
          if (observer instanceof DidUpdateKey<?, ?>) {
            if (((DidUpdateKey<?, ?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidUpdateKey<K, V>) observer).didUpdate(key, newValue, oldValue);
              } catch (Throwable error) {
                if (Cont.isNonFatal(error)) {
                  this.laneDidFail(error);
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
  public boolean dispatchWillRemove(Link link, K key, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillRemoveKey<?>) {
        if (((WillRemoveKey<?>) observers).isPreemptive() == preemptive) {
          try {
            ((WillRemoveKey<K>) observers).willRemove(key);
          } catch (Throwable error) {
            if (Cont.isNonFatal(error)) {
              this.laneDidFail(error);
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
          if (observer instanceof WillRemoveKey<?>) {
            if (((WillRemoveKey<?>) observer).isPreemptive() == preemptive) {
              try {
                ((WillRemoveKey<K>) observer).willRemove(key);
              } catch (Throwable error) {
                if (Cont.isNonFatal(error)) {
                  this.laneDidFail(error);
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
  public boolean dispatchDidRemove(Link link, K key, V oldValue, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidRemoveKey<?, ?>) {
        if (((DidRemoveKey<?, ?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidRemoveKey<K, V>) observers).didRemove(key, oldValue);
          } catch (Throwable error) {
            if (Cont.isNonFatal(error)) {
              this.laneDidFail(error);
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
          if (observer instanceof DidRemoveKey<?, ?>) {
            if (((DidRemoveKey<?, ?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidRemoveKey<K, V>) observer).didRemove(key, oldValue);
              } catch (Throwable error) {
                if (Cont.isNonFatal(error)) {
                  this.laneDidFail(error);
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
            if (Cont.isNonFatal(error)) {
              this.laneDidFail(error);
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
                if (Cont.isNonFatal(error)) {
                  this.laneDidFail(error);
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
            if (Cont.isNonFatal(error)) {
              this.laneDidFail(error);
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
                if (Cont.isNonFatal(error)) {
                  this.laneDidFail(error);
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
            if (Cont.isNonFatal(error)) {
              this.laneDidFail(error);
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
                if (Cont.isNonFatal(error)) {
                  this.laneDidFail(error);
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
            if (Cont.isNonFatal(error)) {
              this.laneDidFail(error);
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
                if (Cont.isNonFatal(error)) {
                  this.laneDidFail(error);
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
            if (Cont.isNonFatal(error)) {
              this.laneDidFail(error);
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
                if (Cont.isNonFatal(error)) {
                  this.laneDidFail(error);
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
            if (Cont.isNonFatal(error)) {
              this.laneDidFail(error);
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
                if (Cont.isNonFatal(error)) {
                  this.laneDidFail(error);
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

  public V laneWillUpdate(K key, V newValue) {
    return newValue;
  }

  public void laneDidUpdate(K key, V newValue, V oldValue) {
    this.decohereInputKey(key, KeyEffect.UPDATE);
    this.recohereInputKey(key, 0); // TODO: debounce and track version
  }

  public void laneWillRemove(K key) {
    // hook
  }

  public void laneDidRemove(K key, V oldValue) {
    this.decohereInputKey(key, KeyEffect.REMOVE);
    this.recohereInputKey(key, 0); // TODO: debounce and track version
  }

  public void laneWillDrop(int lower) {
    // hook
  }

  public void laneDidDrop(int lower) {
    // hook
  }

  public void laneWillTake(int upper) {
    // hook
  }

  public void laneDidTake(int upper) {
    // hook
  }

  public void laneWillClear() {
    // hook
  }

  public void laneDidClear() {
    // hook
  }

  @Override
  public boolean isEmpty() {
    return this.dataView.isEmpty();
  }

  @Override
  public int size() {
    return this.dataView.size();
  }

  @Override
  public boolean containsKey(Object key) {
    return this.dataView.containsKey(key);
  }

  @Override
  public boolean containsValue(Object value) {
    return this.dataView.containsValue(value);
  }

  @Override
  public int indexOf(Object key) {
    return this.dataView.indexOf(key);
  }

  @Override
  public V get(Object key) {
    return this.dataView.get(key);
  }

  @Override
  public Entry<K, V> getEntry(Object key) {
    return this.dataView.getEntry(key);
  }

  @Override
  public Entry<K, V> getIndex(int index) {
    return this.dataView.getIndex(index);
  }

  @Override
  public Entry<K, V> firstEntry() {
    return this.dataView.firstEntry();
  }

  @Override
  public K firstKey() {
    return this.dataView.firstKey();
  }

  @Override
  public V firstValue() {
    return this.dataView.firstValue();
  }

  @Override
  public Entry<K, V> lastEntry() {
    return this.dataView.lastEntry();
  }

  @Override
  public K lastKey() {
    return this.dataView.lastKey();
  }

  @Override
  public V lastValue() {
    return this.dataView.lastValue();
  }

  @Override
  public Entry<K, V> nextEntry(K key) {
    return this.dataView.nextEntry(key);
  }

  @Override
  public K nextKey(K key) {
    return this.dataView.nextKey(key);
  }

  @Override
  public V nextValue(K key) {
    return this.dataView.nextValue(key);
  }

  @Override
  public Entry<K, V> previousEntry(K key) {
    return this.dataView.previousEntry(key);
  }

  @Override
  public K previousKey(K key) {
    return this.dataView.previousKey(key);
  }

  @Override
  public V previousValue(K key) {
    return this.dataView.previousValue(key);
  }

  @Override
  public V put(K key, V value) {
    return this.laneBinding.put(this, key, value);
  }

  @Override
  public void putAll(Map<? extends K, ? extends V> map) {
    for (Entry<? extends K, ? extends V> entry : map.entrySet()) {
      this.laneBinding.put(this, entry.getKey(), entry.getValue());
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public V remove(Object key) {
    final Class<?> keyType = this.keyForm.type();
    if (keyType == null || keyType.isInstance(key)) {
      return this.laneBinding.remove(this, (K) key);
    }
    return this.valueForm.unit();
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
  public OrderedMap<K, V> headMap(K toKey) {
    return this.dataView.headMap(toKey);
  }

  @Override
  public OrderedMap<K, V> tailMap(K fromKey) {
    return this.dataView.tailMap(fromKey);
  }

  @Override
  public OrderedMap<K, V> subMap(K fromKey, K toKey) {
    return this.dataView.subMap(fromKey, toKey);
  }

  @Override
  public Set<Entry<K, V>> entrySet() {
    return this.dataView.entrySet();
  }

  @Override
  public Set<K> keySet() {
    return this.dataView.keySet();
  }

  @Override
  public Collection<V> values() {
    return this.dataView.values();
  }

  @Override
  public OrderedMapCursor<K, V> iterator() {
    return this.dataView.iterator();
  }

  @Override
  public Cursor<K> keyIterator() {
    return this.dataView.keyIterator();
  }

  @Override
  public Cursor<V> valueIterator() {
    return this.dataView.valueIterator();
  }

  @Override
  public OrderedMap<K, V> snapshot() {
    return this.dataView.snapshot();
  }

  @Override
  public Comparator<? super K> comparator() {
    return this.dataView.comparator();
  }

  @Override
  public MapLane<K, V> get() {
    return this;
  }

  @Override
  public MapOutlet<K, V, ? extends Map<K, V>> input() {
    return this.input;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void bindInput(Outlet<? extends Map<K, V>> input) {
    if (input instanceof MapOutlet<?, ?, ?>) {
      this.bindInput((MapOutlet<K, V, ? extends Map<K, V>>) input);
    } else {
      throw new IllegalArgumentException(input.toString());
    }
  }

  public void bindInput(MapOutlet<K, V, ? extends Map<K, V>> input) {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = input;
    if (this.input != null) {
      this.input.bindOutput(this);
    }
  }

  @Override
  public void unbindInput() {
    if (this.input != null) {
      this.input.unbindOutput(this);
    }
    this.input = null;
  }

  @Override
  public void disconnectInputs() {
    final MapOutlet<K, V, ? extends Map<K, V>> input = this.input;
    if (input != null) {
      input.unbindOutput(this);
      this.input = null;
      input.disconnectInputs();
    }
  }

  @Override
  public Outlet<V> outlet(K key) {
    KeyOutlet<K, V> outlet = this.outlets.get(key);
    if (outlet == null) {
      outlet = new KeyOutlet<K, V>(this, key);
      this.outlets = this.outlets.updated(key, outlet);
    }
    return outlet;
  }

  @Override
  public Iterator<Inlet<? super MapLane<K, V>>> outputIterator() {
    return this.outputs != null ? Cursor.array(this.outputs) : Cursor.empty();
  }

  @SuppressWarnings("unchecked")
  @Override
  public void bindOutput(Inlet<? super MapLane<K, V>> output) {
    final Inlet<? super MapLane<K, V>>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    final Inlet<? super MapLane<K, V>>[] newOutputs = (Inlet<? super MapLane<K, V>>[]) new Inlet<?>[n + 1];
    if (n > 0) {
      System.arraycopy(oldOutputs, 0, newOutputs, 0, n);
    }
    newOutputs[n] = output;
    this.outputs = newOutputs;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void unbindOutput(Inlet<? super MapLane<K, V>> output) {
    final Inlet<? super MapLane<K, V>>[] oldOutputs = this.outputs;
    final int n = oldOutputs != null ? oldOutputs.length : 0;
    for (int i = 0; i < n; i += 1) {
      if (oldOutputs[i] == output) {
        if (n > 1) {
          final Inlet<? super MapLane<K, V>>[] newOutputs = (Inlet<? super MapLane<K, V>>[]) new Inlet<?>[n - 1];
          System.arraycopy(oldOutputs, 0, newOutputs, 0, i);
          System.arraycopy(oldOutputs, i + 1, newOutputs, i, (n - 1) - i);
          this.outputs = newOutputs;
        } else {
          this.outputs = null;
        }
        break;
      }
    }
  }

  @Override
  public void unbindOutputs() {
    final HashTrieMap<K, KeyOutlet<K, V>> outlets = this.outlets;
    if (!outlets.isEmpty()) {
      this.outlets = HashTrieMap.empty();
      final Iterator<KeyOutlet<K, V>> keyOutlets = outlets.valueIterator();
      while (keyOutlets.hasNext()) {
        final KeyOutlet<K, V> keyOutlet = keyOutlets.next();
        keyOutlet.unbindOutputs();
      }
    }
    final Inlet<? super MapLane<K, V>>[] outputs = this.outputs;
    if (outputs != null) {
      this.outputs = null;
      for (int i = 0, n = outputs.length; i < n; i += 1) {
        final Inlet<? super MapLane<K, V>> output = outputs[i];
        output.unbindInput();
      }
    }
  }

  @Override
  public void disconnectOutputs() {
    final HashTrieMap<K, KeyOutlet<K, V>> outlets = this.outlets;
    if (!outlets.isEmpty()) {
      this.outlets = HashTrieMap.empty();
      final Iterator<KeyOutlet<K, V>> keyOutlets = outlets.valueIterator();
      while (keyOutlets.hasNext()) {
        final KeyOutlet<K, V> keyOutlet = keyOutlets.next();
        keyOutlet.disconnectOutputs();
      }
    }
    final Inlet<? super MapLane<K, V>>[] outputs = this.outputs;
    if (outputs != null) {
      this.outputs = null;
      for (int i = 0, n = outputs.length; i < n; i += 1) {
        final Inlet<? super MapLane<K, V>> output = outputs[i];
        output.unbindInput();
        output.disconnectOutputs();
      }
    }
  }

  @Override
  public void decohereOutputKey(K key, KeyEffect effect) {
    this.decohereKey(key, effect);
  }

  @Override
  public void decohereInputKey(K key, KeyEffect effect) {
    this.decohereKey(key, effect);
  }

  @SuppressWarnings("unchecked")
  public void decohereKey(K key, KeyEffect effect) {
    final HashTrieMap<K, KeyEffect> oldEffects = this.effects;
    if (oldEffects.get(key) != effect) {
      this.willDecohereKey(key, effect);
      this.effects = oldEffects.updated(key, effect);
      this.version = -1;
      this.onDecohereKey(key, effect);
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        final Inlet<?> output = this.outputs[i];
        if (output instanceof MapInlet<?, ?, ?>) {
          ((MapInlet<K, V, ? super MapLane<K, V>>) output).decohereOutputKey(key, effect);
        } else {
          output.decohereOutput();
        }
      }
      final KeyOutlet<K, V> outlet = this.outlets.get(key);
      if (outlet != null) {
        outlet.decohereInput();
      }
      this.didDecohereKey(key, effect);
    }
  }

  @Override
  public void decohereOutput() {
    this.decohere();
  }

  @Override
  public void decohereInput() {
    this.decohere();
  }

  public void decohere() {
    if (this.version >= 0) {
      this.willDecohere();
      this.version = -1;
      this.onDecohere();
      final int n = this.outputs != null ? this.outputs.length : 0;
      for (int i = 0; i < n; i += 1) {
        this.outputs[i].decohereOutput();
      }
      final Iterator<KeyOutlet<K, V>> outlets = this.outlets.valueIterator();
      while (outlets.hasNext()) {
        outlets.next().decohereInput();
      }
      this.didDecohere();
    }
  }

  @Override
  public void recohereOutputKey(K key, int version) {
    this.recohereKey(key, version);
  }

  @Override
  public void recohereInputKey(K key, int version) {
    this.recohereKey(key, version);
  }

  @SuppressWarnings("unchecked")
  public void recohereKey(K key, int version) {
    if (this.version < 0) {
      final HashTrieMap<K, KeyEffect> oldEffects = this.effects;
      final KeyEffect effect = oldEffects.get(key);
      if (effect != null) {
        this.willRecohereKey(key, effect, version);
        this.effects = oldEffects.removed(key);
        if (this.input != null) {
          this.input.recohereInputKey(key, version);
        }
        this.onRecohereKey(key, effect, version);
        for (int i = 0, n = this.outputs != null ? this.outputs.length : 0; i < n; i += 1) {
          final Inlet<?> output = this.outputs[i];
          if (output instanceof MapInlet<?, ?, ?>) {
            ((MapInlet<K, V, ? super MapLane<K, V>>) output).recohereOutputKey(key, version);
          }
        }
        final KeyOutlet<K, V> outlet = this.outlets.get(key);
        if (outlet != null) {
          outlet.recohereInput(version);
        }
        this.didRecohereKey(key, effect, version);
      }
    }
  }

  @Override
  public void recohereOutput(int version) {
    this.recohere(version);
  }

  @Override
  public void recohereInput(int version) {
    this.recohere(version);
  }

  public void recohere(int version) {
    if (this.version < 0) {
      this.willRecohere(version);
      final Iterator<K> keys = this.effects.keyIterator();
      while (keys.hasNext()) {
        this.recohereKey(keys.next(), version);
      }
      this.version = version;
      this.onRecohere(version);
      for (int i = 0, n = this.outputs != null ? this.outputs.length : 0; i < n; i += 1) {
        this.outputs[i].recohereOutput(version);
      }
      this.didRecohere(version);
    }
  }

  protected void willDecohereKey(K key, KeyEffect effect) {
    // hook
  }

  protected void onDecohereKey(K key, KeyEffect effect) {
    // hook
  }

  protected void didDecohereKey(K key, KeyEffect effect) {
    // hook
  }

  protected void willDecohere() {
    // hook
  }

  protected void onDecohere() {
    // hook
  }

  protected void didDecohere() {
    // hook
  }

  protected void willRecohereKey(K key, KeyEffect effect, int version) {
    // hook
  }

  protected void onRecohereKey(K key, KeyEffect effect, int version) {
    if (effect == KeyEffect.UPDATE) {
      if (this.input != null) {
        final V value = this.input.get(key);
        if (value != null) {
          this.put(key, value);
        } else {
          this.remove(key);
        }
      }
    } else if (effect == KeyEffect.REMOVE) {
      if (this.containsKey(key)) {
        this.remove(key);
      }
    }
  }

  protected void didRecohereKey(K key, KeyEffect effect, int version) {
    // hook
  }

  protected void willRecohere(int version) {
    // hook
  }

  protected void onRecohere(int version) {
    // hook
  }

  protected void didRecohere(int version) {
    // hook
  }

  static final int RESIDENT = 1 << 0;
  static final int TRANSIENT = 1 << 1;

}
