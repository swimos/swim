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
import java.util.Iterator;
import java.util.Map;
import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.agent.AgentContext;
import swim.api.data.SpatialData;
import swim.api.lane.SpatialLane;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;
import swim.concurrent.Conts;
import swim.math.Z2Form;
import swim.observable.function.DidClear;
import swim.observable.function.DidMoveShape;
import swim.observable.function.DidRemoveShape;
import swim.observable.function.DidUpdateShape;
import swim.observable.function.WillClear;
import swim.observable.function.WillMoveShape;
import swim.observable.function.WillRemoveShape;
import swim.observable.function.WillUpdateShape;
import swim.runtime.LaneBinding;
import swim.runtime.warp.WarpLaneView;
import swim.spatial.SpatialMap;
import swim.structure.Form;

public class SpatialLaneView<K, S, V> extends WarpLaneView implements SpatialLane<K, S, V> {
  protected final AgentContext agentContext;
  protected Form<K> keyForm;
  protected Z2Form<S> shapeForm;
  protected Form<V> valueForm;

  protected SpatialLaneModel<S> laneBinding;
  protected SpatialData<K, S, V> dataView;
  protected int flags;

  SpatialLaneView(AgentContext agentContext, Form<K> keyForm, Z2Form<S> shapeForm, Form<V> valueForm,
                  int flags, Object observers) {
    super(observers);
    this.agentContext = agentContext;
    this.keyForm = keyForm;
    this.shapeForm = shapeForm;
    this.valueForm = valueForm;
    this.flags = flags;
  }

  public SpatialLaneView(AgentContext agentContext, Form<K> keyForm, Z2Form<S> shapeForm, Form<V> valueForm) {
    this(agentContext, keyForm, shapeForm, valueForm, 0, null);
  }

  @Override
  public AgentContext agentContext() {
    return this.agentContext;
  }

  @Override
  public SpatialLaneModel<S> laneBinding() {
    return this.laneBinding;
  }

  public void setLaneBinding(SpatialLaneModel<S> laneBinding) {
    this.laneBinding = laneBinding;
  }

  @Override
  public LaneBinding createLaneBinding() {
    return new SpatialLaneModel<S>(shapeForm, flags);
  }

  @Override
  public Form<K> keyForm() {
    return this.keyForm;
  }

  @Override
  public <K2> SpatialLane<K2, S, V> keyForm(Form<K2> keyForm) {
    return new SpatialLaneView<K2, S, V>(this.agentContext, keyForm, this.shapeForm, this.valueForm,
        this.flags, typesafeObservers(this.observers));
  }

  @Override
  public <K2> SpatialLane<K2, S, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  public void setKeyForm(Form<K> keyForm) {
    this.keyForm = keyForm;
  }

  @Override
  public Form<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public <V2> SpatialLane<K, S, V2> valueForm(Form<V2> valueForm) {
    return new SpatialLaneView<K, S, V2>(this.agentContext, keyForm, this.shapeForm, valueForm,
        this.flags, typesafeObservers(this.observers));
  }

  @Override
  public <V2> SpatialLane<K, S, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
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
    return (this.flags & RESIDENT) != 0;
  }

  @Override
  public SpatialLane<K, S, V> isResident(boolean isResident) {
    if (isResident) {
      this.flags |= RESIDENT;
    } else {
      this.flags &= ~RESIDENT;
    }
    final SpatialLaneModel<S> laneBinding = this.laneBinding;
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
  public SpatialLane<K, S, V> isTransient(boolean isTransient) {
    if (isTransient) {
      this.flags |= TRANSIENT;
    } else {
      this.flags &= ~TRANSIENT;
    }
    final SpatialLaneModel<S> laneBinding = this.laneBinding;
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
    this.dataView = this.laneBinding.data.keyForm(this.keyForm).valueForm(this.valueForm);
    super.willLoad();
  }

  @Override
  public void close() {
    this.laneBinding.closeLaneView(this);
  }

  @Override
  public SpatialLaneView<K, S, V> observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public SpatialLaneView<K, S, V> unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public SpatialLane<K, S, V> willUpdate(WillUpdateShape<K, S, V> willUpdate) {
    return observe(willUpdate);
  }

  @Override
  public SpatialLane<K, S, V> didUpdate(DidUpdateShape<K, S, V> didUpdate) {
    return observe(didUpdate);
  }

  @Override
  public SpatialLane<K, S, V> willMove(WillMoveShape<K, S, V> willMove) {
    return observe(willMove);
  }

  @Override
  public SpatialLane<K, S, V> didMove(DidMoveShape<K, S, V> didMove) {
    return observe(didMove);
  }

  @Override
  public SpatialLane<K, S, V> willRemove(WillRemoveShape<K, S> willRemove) {
    return observe(willRemove);
  }

  @Override
  public SpatialLane<K, S, V> didRemove(DidRemoveShape<K, S, V> didRemove) {
    return observe(didRemove);
  }

  @Override
  public SpatialLane<K, S, V> willClear(WillClear willClear) {
    return observe(willClear);
  }

  @Override
  public SpatialLane<K, S, V> didClear(DidClear didClear) {
    return observe(didClear);
  }

  @Override
  public SpatialLaneView<K, S, V> willCommand(WillCommand willCommand) {
    return observe(willCommand);
  }

  @Override
  public SpatialLaneView<K, S, V> didCommand(DidCommand didCommand) {
    return observe(didCommand);
  }

  @Override
  public SpatialLaneView<K, S, V> willUplink(WillUplink willUplink) {
    return observe(willUplink);
  }

  @Override
  public SpatialLaneView<K, S, V> didUplink(DidUplink didUplink) {
    return observe(didUplink);
  }

  @Override
  public SpatialLaneView<K, S, V> willEnter(WillEnter willEnter) {
    return observe(willEnter);
  }

  @Override
  public SpatialLaneView<K, S, V> didEnter(DidEnter didEnter) {
    return observe(didEnter);
  }

  @Override
  public SpatialLaneView<K, S, V> willLeave(WillLeave willLeave) {
    return observe(willLeave);
  }

  @Override
  public SpatialLaneView<K, S, V> didLeave(DidLeave didLeave) {
    return observe(didLeave);
  }

  @SuppressWarnings("unchecked")
  public Map.Entry<Boolean, V> dispatchWillUpdate(Link link, K key, S shape, V newValue, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillUpdateShape<?, ?, ?>) {
        if (((WillUpdateShape<?, ?, ?>) observers).isPreemptive() == preemptive) {
          try {
            newValue = ((WillUpdateShape<K, S, V>) observers).willUpdate(key, shape, newValue);
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
          if (observer instanceof WillUpdateShape<?, ?, ?>) {
            if (((WillUpdateShape<?, ?, ?>) observer).isPreemptive() == preemptive) {
              try {
                newValue = ((WillUpdateShape<K, S, V>) observer).willUpdate(key, shape, newValue);
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
  public boolean dispatchDidUpdate(Link link, K key, S shape, V newValue, V oldValue, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidUpdateShape<?, ?, ?>) {
        if (((DidUpdateShape<?, ?, ?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidUpdateShape<K, S, V>) observers).didUpdate(key, shape, newValue, oldValue);
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
          if (observer instanceof DidUpdateShape<?, ?, ?>) {
            if (((DidUpdateShape<?, ?, ?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidUpdateShape<K, S, V>) observer).didUpdate(key, shape, newValue, oldValue);
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
  public Map.Entry<Boolean, V> dispatchWillMove(Link link, K key, S newShape, V newValue, S oldShape,
                                                boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillMoveShape<?, ?, ?>) {
        if (((WillMoveShape<?, ?, ?>) observers).isPreemptive() == preemptive) {
          try {
            newValue = ((WillMoveShape<K, S, V>) observers).willMove(key, newShape, newValue, oldShape);
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
          if (observer instanceof WillMoveShape<?, ?, ?>) {
            if (((WillMoveShape<?, ?, ?>) observer).isPreemptive() == preemptive) {
              try {
                newValue = ((WillMoveShape<K, S, V>) observer).willMove(key, newShape, newValue, oldShape);
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
  public boolean dispatchDidMove(Link link, K key, S newShape, V newValue, S oldShape, V oldValue,
                                               boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillMoveShape<?, ?, ?>) {
        if (((DidMoveShape<?, ?, ?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidMoveShape<K, S, V>) observers).didMove(key, newShape, newValue, oldShape, oldValue);
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
          if (observer instanceof WillMoveShape<?, ?, ?>) {
            if (((DidMoveShape<?, ?, ?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidMoveShape<K, S, V>) observer).didMove(key, newShape, newValue, oldShape, oldValue);
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
  public boolean dispatchWillRemove(Link link, K key, S shape, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillMoveShape<?, ?, ?>) {
        if (((WillRemoveShape<?, ?>) observers).isPreemptive() == preemptive) {
          try {
            ((WillRemoveShape<K, S>) observers).willRemove(key, shape);
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
          if (observer instanceof WillMoveShape<?, ?, ?>) {
            if (((WillRemoveShape<?, ?>) observers).isPreemptive() == preemptive) {
              try {
                ((WillRemoveShape<K, S>) observers).willRemove(key, shape);
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
  public boolean dispatchDidRemove(Link link, K key, S shape, V oldValue, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    try {
      SwimContext.setLane(this);
      SwimContext.setLink(link);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillMoveShape<?, ?, ?>) {
        if (((DidRemoveShape<?, ?, ?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidRemoveShape<K, S, V>) observers).didRemove(key, shape, oldValue);
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
          if (observer instanceof WillMoveShape<?, ?, ?>) {
            if (((DidRemoveShape<?, ?, ?>) observers).isPreemptive() == preemptive) {
              try {
                ((DidRemoveShape<K, S, V>) observers).didRemove(key, shape, oldValue);
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

  public V laneWillUpdate(K key, S shape, V newValue) {
    return newValue;
  }

  public void laneDidUpdate(K key, S shape, V newValue, V oldValue) {

  }

  public V laneWillMove(K key, S newShape, V newValue, S oldShape) {
    return newValue;
  }

  public V laneDidMove(K key, S newShape, V newValue, S oldShape, V oldValue) {
    return newValue;
  }

  public void laneWillRemove(K key, S shape) {

  }

  public void laneDidRemove(K key, S shape) {

  }

  public void laneWillClear() {

  }

  public void laneDidClear() {

  }

  @Override
  public SpatialMap<K, S, V> snapshot() {
    return this.dataView.snapshot();
  }

  @Override
  public Iterator<Entry<K, S, V>> iterator() {
    return this.dataView.iterator();
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
  public boolean containsKey(K key, S shape) {
    return this.dataView.containsKey(key, shape);
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
  public V get(K key, S shape) {
    return this.dataView.get(key, shape);
  }

  @Override
  public V get(Object key) {
    return this.dataView.get(key);
  }

  @Override
  public V put(K key, S shape, V newValue) {
    return this.dataView.put(key, shape, newValue);
  }

  @Override
  public V move(K key, S oldShape, S newShape, V newValue) {
    return this.dataView.move(key, oldShape, newShape, newValue);
  }

  @Override
  public V remove(K key, S shape) {
    return this.dataView.remove(key, shape);
  }

  @Override
  public void clear() {
    this.dataView.clear();
  }

  @Override
  public Iterator<Entry<K, S, V>> iterator(S shape) {
    return this.dataView.iterator(shape);
  }

  @Override
  public Iterator<K> keyIterator() {
    return this.dataView.keyIterator();
  }

  @Override
  public Iterator<V> valueIterator() {
    return this.dataView.valueIterator();
  }

  static final int RESIDENT = 1 << 0;
  static final int TRANSIENT = 1 << 1;
  static final int SIGNED = 1 << 2;
}
