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

import java.util.AbstractCollection;
import java.util.AbstractMap;
import java.util.AbstractSet;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.agent.AgentContext;
import swim.api.data.MapData;
import swim.api.downlink.ValueDownlink;
import swim.api.lane.JoinValueLane;
import swim.api.lane.function.DidDownlinkValue;
import swim.api.lane.function.WillDownlinkValue;
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
import swim.observable.function.DidRemoveKey;
import swim.observable.function.DidUpdateKey;
import swim.observable.function.WillClear;
import swim.observable.function.WillRemoveKey;
import swim.observable.function.WillUpdateKey;
import swim.runtime.LaneContext;
import swim.runtime.warp.WarpLaneView;
import swim.structure.Form;
import swim.structure.Value;
import swim.structure.collections.ValueEntryIterator;
import swim.structure.collections.ValueIterator;
import swim.uri.Uri;

public class JoinValueLaneView<K, V> extends WarpLaneView implements JoinValueLane<K, V> {
  protected final AgentContext agentContext;
  protected Form<K> keyForm;
  protected Form<V> valueForm;

  protected int flags;
  protected JoinValueLaneModel laneBinding;
  protected MapData<K, V> dataView;

  JoinValueLaneView(AgentContext agentContext, Form<K> keyForm, Form<V> valueForm,
                    int flags, Object observers) {
    super(observers);
    this.agentContext = agentContext;
    this.keyForm = keyForm;
    this.valueForm = valueForm;
    this.flags = flags;
  }

  public JoinValueLaneView(AgentContext agentContext, Form<K> keyForm, Form<V> valueForm) {
    this(agentContext, keyForm, valueForm, RESIDENT, null);
  }

  @Override
  public AgentContext agentContext() {
    return this.agentContext;
  }

  @Override
  public JoinValueLaneModel laneBinding() {
    return this.laneBinding;
  }

  void setLaneBinding(JoinValueLaneModel laneBinding) {
    this.laneBinding = laneBinding;
  }

  @Override
  public JoinValueLaneModel createLaneBinding() {
    return new JoinValueLaneModel(this.flags);
  }

  @Override
  public final Form<K> keyForm() {
    return this.keyForm;
  }

  @Override
  public <K2> JoinValueLaneView<K2, V> keyForm(Form<K2> keyForm) {
    return new JoinValueLaneView<K2, V>(this.agentContext, keyForm, this.valueForm,
                                        this.flags, typesafeObservers(this.observers));
  }

  @Override
  public <K2> JoinValueLaneView<K2, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  public void setKeyForm(Form<K> keyForm) {
    this.keyForm = keyForm;
  }

  @Override
  public final Form<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public <V2> JoinValueLaneView<K, V2> valueForm(Form<V2> valueForm) {
    return new JoinValueLaneView<K, V2>(this.agentContext, this.keyForm, valueForm,
                                        this.flags, typesafeObservers(this.observers));
  }

  @Override
  public <V2> JoinValueLaneView<K, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  public void setValueForm(Form<V> valueForm) {
    this.valueForm = valueForm;
  }

  protected Object typesafeObservers(Object observers) {
    // TODO: filter out WillDownlinkValue, DidDownlinkValue, WillUpdateKey, DidUpdateKey,
    //       WillRemoveKey, DidRemoveKey, WillClear, DidClear
    return observers;
  }

  public final boolean isResident() {
    return (this.flags & RESIDENT) != 0;
  }

  @Override
  public JoinValueLaneView<K, V> isResident(boolean isResident) {
    if (isResident) {
      this.flags |= RESIDENT;
    } else {
      this.flags &= ~RESIDENT;
    }
    final JoinValueLaneModel laneBinding = this.laneBinding;
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
  public JoinValueLaneView<K, V> isTransient(boolean isTransient) {
    if (isTransient) {
      this.flags |= TRANSIENT;
    } else {
      this.flags &= ~TRANSIENT;
    }
    final JoinValueLaneModel laneBinding = this.laneBinding;
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
  public JoinValueLaneView<K, V> observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public JoinValueLaneView<K, V> unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public JoinValueLaneView<K, V> willDownlink(WillDownlinkValue<K> willDownlink) {
    return observe(willDownlink);
  }

  @Override
  public JoinValueLaneView<K, V> didDownlink(DidDownlinkValue<K> didDownlink) {
    return observe(didDownlink);
  }

  @Override
  public JoinValueLaneView<K, V> willUpdate(WillUpdateKey<K, V> willUpdate) {
    return observe(willUpdate);
  }

  @Override
  public JoinValueLaneView<K, V> didUpdate(DidUpdateKey<K, V> didUpdate) {
    return observe(didUpdate);
  }

  @Override
  public JoinValueLaneView<K, V> willRemove(WillRemoveKey<K> willRemove) {
    return observe(willRemove);
  }

  @Override
  public JoinValueLaneView<K, V> didRemove(DidRemoveKey<K, V> didRemove) {
    return observe(didRemove);
  }

  @Override
  public JoinValueLaneView<K, V> willClear(WillClear willClear) {
    return observe(willClear);
  }

  @Override
  public JoinValueLaneView<K, V> didClear(DidClear didClear) {
    return observe(didClear);
  }

  @Override
  public JoinValueLaneView<K, V> willCommand(WillCommand willCommand) {
    return observe(willCommand);
  }

  @Override
  public JoinValueLaneView<K, V> didCommand(DidCommand didCommand) {
    return observe(didCommand);
  }

  @Override
  public JoinValueLaneView<K, V> willUplink(WillUplink willUplink) {
    return observe(willUplink);
  }

  @Override
  public JoinValueLaneView<K, V> didUplink(DidUplink didUplink) {
    return observe(didUplink);
  }

  @Override
  public JoinValueLaneView<K, V> willEnter(WillEnter willEnter) {
    return observe(willEnter);
  }

  @Override
  public JoinValueLaneView<K, V> didEnter(DidEnter didEnter) {
    return observe(didEnter);
  }

  @Override
  public JoinValueLaneView<K, V> willLeave(WillLeave willLeave) {
    return observe(willLeave);
  }

  @Override
  public JoinValueLaneView<K, V> didLeave(DidLeave didLeave) {
    return observe(didLeave);
  }

  @SuppressWarnings("unchecked")
  public Map.Entry<Boolean, V> dispatchWillUpdate(Link link, K key, V newValue, boolean preemptive) {
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
          if (observer instanceof WillUpdateKey<?, ?>) {
            if (((WillUpdateKey<?, ?>) observer).isPreemptive() == preemptive) {
              try {
                newValue = ((WillUpdateKey<K, V>) observer).willUpdate(key, newValue);
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
          if (observer instanceof DidUpdateKey<?, ?>) {
            if (((DidUpdateKey<?, ?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidUpdateKey<K, V>) observer).didUpdate(key, newValue, oldValue);
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
          if (observer instanceof WillRemoveKey<?>) {
            if (((WillRemoveKey<?>) observer).isPreemptive() == preemptive) {
              try {
                ((WillRemoveKey<K>) observer).willRemove(key);
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
          if (observer instanceof DidRemoveKey<?, ?>) {
            if (((DidRemoveKey<?, ?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidRemoveKey<K, V>) observer).didRemove(key, oldValue);
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

  @SuppressWarnings("unchecked")
  public Map.Entry<Boolean, ValueDownlink<?>> dispatchWillDownlink(K key, ValueDownlink<?> downlink, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    try {
      SwimContext.setLane(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillDownlinkValue<?>) {
        if (((WillDownlinkValue<?>) observers).isPreemptive() == preemptive) {
          try {
            downlink = ((WillDownlinkValue<K>) observers).willDownlink(key, downlink);
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
          if (observer instanceof WillDownlinkValue<?>) {
            if (((WillDownlinkValue<?>) observer).isPreemptive() == preemptive) {
              try {
                downlink = ((WillDownlinkValue<K>) observer).willDownlink(key, downlink);
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
      return new AbstractMap.SimpleImmutableEntry<Boolean, ValueDownlink<?>>(complete, downlink);
    } finally {
      SwimContext.setLane(oldLane);
    }
  }

  @SuppressWarnings("unchecked")
  public boolean dispatchDidDownlink(K key, ValueDownlink<?> downlink, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    try {
      SwimContext.setLane(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidDownlinkValue<?>) {
        if (((DidDownlinkValue<?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidDownlinkValue<K>) observers).didDownlink(key, downlink);
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
          if (observer instanceof DidDownlinkValue<?>) {
            if (((DidDownlinkValue<?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidDownlinkValue<K>) observer).didDownlink(key, downlink);
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

  public ValueDownlink<V> laneWillDownlink(K key, ValueDownlink<V> downlink) {
    return downlink;
  }

  public void laneDidDownlink(K key, ValueDownlink<V> downlink) {
  }

  public V laneWillUpdate(K key, V newValue) {
    return newValue;
  }

  public void laneDidUpdate(K key, V newValue, V oldValue) {
  }

  public void laneWillRemove(K key) {
  }

  public void laneDidRemove(K key, V oldValue) {
  }

  public void laneWillClear() {
  }

  public void laneDidClear() {
  }

  @Override
  public ValueDownlink<V> downlink(K key) {
    final LaneContext laneContext = this.laneBinding.laneContext();
    return new JoinValueLaneDownlink<V>(laneContext, laneContext.stage(), this.laneBinding,
                                        this.keyForm.mold(key).toValue(), this.laneBinding.meshUri(),
                                        Uri.empty(), Uri.empty(), Uri.empty(), 0.0f, 0.0f,
                                        Value.absent(), this.valueForm);
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
  public V get(Object key) {
    return this.dataView.get(key);
  }

  @SuppressWarnings("unchecked")
  @Override
  public ValueDownlink<?> getDownlink(Object key) {
    return this.laneBinding.getDownlink(this.keyForm.mold((K) key));
  }

  @Override
  public V put(K key, V value) {
    return this.laneBinding.put(this, key, value);
  }

  @Override
  public void putAll(Map<? extends K, ? extends V> map) {
    for (Map.Entry<? extends K, ? extends V> entry : map.entrySet()) {
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
  public void clear() {
    this.laneBinding.clear(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Set<Map.Entry<K, V>> entrySet() {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      return new JoinValueLaneViewEntrySet<K, V>(this);
    } else {
      return (Set<Map.Entry<K, V>>) (Set<?>) this.laneBinding.entrySet();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Set<K> keySet() {
    if (this.keyForm != Form.forValue()) {
      return this.dataView.keySet();
    } else {
      return (Set<K>) (Set<?>) this.laneBinding.keySet();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Collection<V> values() {
    if (this.valueForm != Form.forValue()) {
      return new JoinValueLaneViewValues<K, V>(this);
    } else {
      return (Collection<V>) this.laneBinding.values();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Iterator<Map.Entry<K, V>> iterator() {
    if (this.keyForm != Form.forValue() || this.valueForm != Form.forValue()) {
      return new ValueEntryIterator<K, V>(this.laneBinding.iterator(), this.keyForm, this.valueForm);
    } else {
      return (Iterator<Map.Entry<K, V>>) (Iterator<?>) this.laneBinding.iterator();
    }
  }

  @Override
  public Iterator<K> keyIterator() {
    return this.dataView.keyIterator();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Iterator<V> valueIterator() {
    if (this.valueForm != Form.forValue()) {
      return new ValueIterator<V>(this.laneBinding.valueIterator(), this.valueForm);
    } else {
      return (Iterator<V>) this.laneBinding.valueIterator();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Iterator<Map.Entry<K, ValueDownlink<?>>> downlinkIterator() {
    return (Iterator<Map.Entry<K, ValueDownlink<?>>>) (Iterator<?>) this.laneBinding.downlinks.iterator();
  }

  static final int RESIDENT = 1 << 0;
  static final int TRANSIENT = 1 << 1;
  static final int SIGNED = 1 << 2;
}

final class JoinValueLaneViewEntrySet<K, V> extends AbstractSet<Map.Entry<K, V>> {
  final JoinValueLaneView<K, V> view;

  JoinValueLaneViewEntrySet(JoinValueLaneView<K, V> view) {
    this.view = view;
  }

  @Override
  public int size() {
    return this.view.size();
  }

  @Override
  public Iterator<Map.Entry<K, V>> iterator() {
    return this.view.iterator();
  }
}

final class JoinValueLaneViewValues<K, V> extends AbstractCollection<V> {
  final JoinValueLaneView<K, V> view;

  JoinValueLaneViewValues(JoinValueLaneView<K, V> view) {
    this.view = view;
  }

  @Override
  public int size() {
    return this.view.size();
  }

  @Override
  public Iterator<V> iterator() {
    return this.view.valueIterator();
  }
}
