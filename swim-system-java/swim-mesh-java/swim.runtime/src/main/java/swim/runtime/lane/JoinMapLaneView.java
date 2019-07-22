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
import java.util.Map;
import java.util.Set;
import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.agent.AgentContext;
import swim.api.data.MapData;
import swim.api.downlink.MapDownlink;
import swim.api.lane.JoinMapLane;
import swim.api.lane.function.DidDownlinkMap;
import swim.api.lane.function.WillDownlinkMap;
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
import swim.uri.Uri;

public class JoinMapLaneView<L, K, V> extends WarpLaneView implements JoinMapLane<L, K, V> {
  protected final AgentContext agentContext;
  protected Form<L> linkForm;
  protected Form<K> keyForm;
  protected Form<V> valueForm;

  protected int flags;
  protected JoinMapLaneModel laneBinding;
  protected MapData<K, V> dataView;

  JoinMapLaneView(AgentContext agentContext, Form<L> linkForm, Form<K> keyForm,
                  Form<V> valueForm, int flags, Object observers) {
    super(observers);
    this.agentContext = agentContext;
    this.linkForm = linkForm;
    this.keyForm = keyForm;
    this.valueForm = valueForm;
    this.flags = flags;
  }

  public JoinMapLaneView(AgentContext agentContext, Form<L> linkForm,
                         Form<K> keyForm, Form<V> valueForm) {
    this(agentContext, linkForm, keyForm, valueForm, RESIDENT, null);
  }

  @Override
  public AgentContext agentContext() {
    return this.agentContext;
  }

  @Override
  public JoinMapLaneModel laneBinding() {
    return this.laneBinding;
  }

  void setLaneBinding(JoinMapLaneModel laneBinding) {
    this.laneBinding = laneBinding;
  }

  @Override
  public JoinMapLaneModel createLaneBinding() {
    return new JoinMapLaneModel(this.flags);
  }

  @Override
  public final Form<L> linkForm() {
    return this.linkForm;
  }

  @Override
  public <L2> JoinMapLaneView<L2, K, V> linkForm(Form<L2> linkForm) {
    return new JoinMapLaneView<L2, K, V>(this.agentContext, linkForm, this.keyForm, this.valueForm,
                                         this.flags, typesafeObservers(this.observers));
  }

  @Override
  public <L2> JoinMapLaneView<L2, K, V> linkClass(Class<L2> linkClass) {
    return linkForm(Form.<L2>forClass(linkClass));
  }

  public void setLinkForm(Form<L> linkForm) {
    this.linkForm = linkForm;
  }

  @Override
  public final Form<K> keyForm() {
    return keyForm;
  }

  @Override
  public <K2> JoinMapLaneView<L, K2, V> keyForm(Form<K2> keyForm) {
    return new JoinMapLaneView<L, K2, V>(this.agentContext, this.linkForm, keyForm, this.valueForm,
                                         this.flags, typesafeObservers(this.observers));
  }

  @Override
  public <K2> JoinMapLaneView<L, K2, V> keyClass(Class<K2> keyClass) {
    return keyForm(Form.<K2>forClass(keyClass));
  }

  public void setKeyForm(Form<K> keyForm) {
    this.keyForm = keyForm;
  }

  @Override
  public final Form<V> valueForm() {
    return valueForm;
  }

  @Override
  public <V2> JoinMapLaneView<L, K, V2> valueForm(Form<V2> valueForm) {
    return new JoinMapLaneView<L, K, V2>(this.agentContext, this.linkForm, this.keyForm, valueForm,
                                         this.flags, typesafeObservers(this.observers));
  }

  @Override
  public <V2> JoinMapLaneView<L, K, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  public void setValueForm(Form<V> valueForm) {
    this.valueForm = valueForm;
  }

  protected Object typesafeObservers(Object observers) {
    // TODO: filter out WillDownlinkMap, DidDownlinkMap, WillUpdateKey, DidUpdateKey,
    //       WillRemoveKey, DidRemoveKey, WillClear, DidClear
    return observers;
  }

  public final boolean isResident() {
    return (this.flags & RESIDENT) != 0;
  }

  @Override
  public JoinMapLaneView<L, K, V> isResident(boolean isResident) {
    if (isResident) {
      this.flags |= RESIDENT;
    } else {
      this.flags &= ~RESIDENT;
    }
    final JoinMapLaneModel laneBinding = this.laneBinding;
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
  public JoinMapLaneView<L, K, V> isTransient(boolean isTransient) {
    if (isTransient) {
      this.flags |= TRANSIENT;
    } else {
      this.flags &= ~TRANSIENT;
    }
    final JoinMapLaneModel laneBinding = this.laneBinding;
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
  public JoinMapLaneView<L, K, V> observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public JoinMapLaneView<L, K, V> unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public JoinMapLaneView<L, K, V> willDownlink(WillDownlinkMap<L> willDownlink) {
    return observe(willDownlink);
  }

  @Override
  public JoinMapLaneView<L, K, V> didDownlink(DidDownlinkMap<L> didDownlink) {
    return observe(didDownlink);
  }

  @Override
  public JoinMapLaneView<L, K, V> willUpdate(WillUpdateKey<K, V> willUpdate) {
    return observe(willUpdate);
  }

  @Override
  public JoinMapLaneView<L, K, V> didUpdate(DidUpdateKey<K, V> didUpdate) {
    return observe(didUpdate);
  }

  @Override
  public JoinMapLaneView<L, K, V> willRemove(WillRemoveKey<K> willRemove) {
    return observe(willRemove);
  }

  @Override
  public JoinMapLaneView<L, K, V> didRemove(DidRemoveKey<K, V> didRemove) {
    return observe(didRemove);
  }

  @Override
  public JoinMapLaneView<L, K, V> willClear(WillClear willClear) {
    return observe(willClear);
  }

  @Override
  public JoinMapLaneView<L, K, V> didClear(DidClear didClear) {
    return observe(didClear);
  }

  @Override
  public JoinMapLaneView<L, K, V> willCommand(WillCommand willCommand) {
    return observe(willCommand);
  }

  @Override
  public JoinMapLaneView<L, K, V> didCommand(DidCommand didCommand) {
    return observe(didCommand);
  }

  @Override
  public JoinMapLaneView<L, K, V> willUplink(WillUplink willUplink) {
    return observe(willUplink);
  }

  @Override
  public JoinMapLaneView<L, K, V> didUplink(DidUplink didUplink) {
    return observe(didUplink);
  }

  @Override
  public JoinMapLaneView<L, K, V> willEnter(WillEnter willEnter) {
    return observe(willEnter);
  }

  @Override
  public JoinMapLaneView<L, K, V> didEnter(DidEnter didEnter) {
    return observe(didEnter);
  }

  @Override
  public JoinMapLaneView<L, K, V> willLeave(WillLeave willLeave) {
    return observe(willLeave);
  }

  @Override
  public JoinMapLaneView<L, K, V> didLeave(DidLeave didLeave) {
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
  public Map.Entry<Boolean, MapDownlink<?, ?>> dispatchWillDownlink(L key, MapDownlink<?, ?> downlink, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    try {
      SwimContext.setLane(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof WillDownlinkMap<?>) {
        if (((WillDownlinkMap<?>) observers).isPreemptive() == preemptive) {
          try {
            downlink = ((WillDownlinkMap<L>) observers).willDownlink(key, downlink);
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
          if (observer instanceof WillDownlinkMap<?>) {
            if (((WillDownlinkMap<?>) observer).isPreemptive() == preemptive) {
              try {
                downlink = ((WillDownlinkMap<L>) observer).willDownlink(key, downlink);
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
      return new AbstractMap.SimpleImmutableEntry<Boolean, MapDownlink<?, ?>>(complete, downlink);
    } finally {
      SwimContext.setLane(oldLane);
    }
  }

  @SuppressWarnings("unchecked")
  public boolean dispatchDidDownlink(L key, MapDownlink<?, ?> downlink, boolean preemptive) {
    final Lane oldLane = SwimContext.getLane();
    try {
      SwimContext.setLane(this);
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof DidDownlinkMap<?>) {
        if (((DidDownlinkMap<?>) observers).isPreemptive() == preemptive) {
          try {
            ((DidDownlinkMap<L>) observers).didDownlink(key, downlink);
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
          if (observer instanceof DidDownlinkMap<?>) {
            if (((DidDownlinkMap<?>) observer).isPreemptive() == preemptive) {
              try {
                ((DidDownlinkMap<L>) observer).didDownlink(key, downlink);
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

  public MapDownlink<K, V> laneWillDownlink(L key, MapDownlink<K, V> downlink) {
    return downlink;
  }

  public void laneDidDownlink(K key, MapDownlink<K, V> downlink) {
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
  public MapDownlink<K, V> downlink(L key) {
    final LaneContext laneContext = this.laneBinding.laneContext();
    return new JoinMapLaneDownlink<K, V>(laneContext, laneContext.stage(),
        this.laneBinding, this.linkForm.mold(key).toValue(), this.laneBinding.meshUri(), Uri.empty(),
        Uri.empty(), Uri.empty(), 0.0f, 0.0f, Value.absent(), this.keyForm, this.valueForm);
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
  public MapDownlink<?, ?> getDownlink(Object key) {
    return this.laneBinding.getDownlink(this.linkForm.mold((L) key));
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

  @Override
  public Set<Map.Entry<K, V>> entrySet() {
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
  public Iterator<Map.Entry<K, V>> iterator() {
    return this.dataView.iterator();
  }

  @Override
  public Iterator<K> keyIterator() {
    return this.dataView.keyIterator();
  }

  @Override
  public Iterator<V> valueIterator() {
    return this.dataView.valueIterator();
  }

  @SuppressWarnings("unchecked")
  @Override
  public Iterator<Map.Entry<L, MapDownlink<?, ?>>> downlinkIterator() {
    return (Iterator<Map.Entry<L, MapDownlink<?, ?>>>) (Iterator<?>) this.laneBinding.downlinks.iterator();
  }

  static final int RESIDENT = 1 << 0;
  static final int TRANSIENT = 1 << 1;
  static final int SIGNED = 1 << 2;
}
