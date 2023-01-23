// Copyright 2015-2023 Swim.inc
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

package swim.system.lane;

import java.util.Iterator;
import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.agent.AgentContext;
import swim.api.lane.DemandMapLane;
import swim.api.lane.function.OnCueKey;
import swim.api.lane.function.OnSyncKeys;
import swim.api.warp.WarpUplink;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;
import swim.concurrent.Cont;
import swim.structure.Form;
import swim.structure.Value;
import swim.system.warp.WarpLaneView;

public class DemandMapLaneView<K, V> extends WarpLaneView implements DemandMapLane<K, V> {

  protected final AgentContext agentContext;
  protected Form<K> keyForm;
  protected Form<V> valueForm;
  protected DemandMapLaneModel laneBinding;

  public DemandMapLaneView(AgentContext agentContext, Form<K> keyForm, Form<V> valueForm, Object observers) {
    super(observers);
    this.agentContext = agentContext;
    this.keyForm = keyForm;
    this.valueForm = valueForm;
    this.laneBinding = null;
  }

  public DemandMapLaneView(AgentContext agentContext, Form<K> keyForm, Form<V> valueForm) {
    this(agentContext, keyForm, valueForm, null);
  }

  @Override
  public AgentContext agentContext() {
    return this.agentContext;
  }

  @Override
  public DemandMapLaneModel laneBinding() {
    return this.laneBinding;
  }

  void setLaneBinding(DemandMapLaneModel laneBinding) {
    this.laneBinding = laneBinding;
  }

  @Override
  public DemandMapLaneModel createLaneBinding() {
    return new DemandMapLaneModel();
  }

  @Override
  public final Form<K> keyForm() {
    return this.keyForm;
  }

  @Override
  public <K2> DemandMapLaneView<K2, V> keyForm(Form<K2> keyForm) {
    return new DemandMapLaneView<K2, V>(this.agentContext, keyForm, this.valueForm,
                                        this.typesafeObservers(this.observers));
  }

  @Override
  public <K2> DemandMapLaneView<K2, V> keyClass(Class<K2> keyClass) {
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
  public <V2> DemandMapLaneView<K, V2> valueForm(Form<V2> valueForm) {
    return new DemandMapLaneView<K, V2>(this.agentContext, this.keyForm, valueForm,
                                        this.typesafeObservers(this.observers));
  }

  @Override
  public <V2> DemandMapLaneView<K, V2> valueClass(Class<V2> valueClass) {
    return this.valueForm(Form.<V2>forClass(valueClass));
  }

  public void setValueForm(Form<V> valueForm) {
    this.valueForm = valueForm;
  }

  protected Object typesafeObservers(Object observers) {
    // TODO: filter out OnCueKey, OnSyncKeys
    return observers;
  }

  @Override
  public void close() {
    this.laneBinding.closeLaneView(this);
  }

  @Override
  public DemandMapLaneView<K, V> observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public DemandMapLaneView<K, V> unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public DemandMapLaneView<K, V> onCue(OnCueKey<K, V> onCue) {
    return this.observe(onCue);
  }

  @Override
  public DemandMapLaneView<K, V> onSync(OnSyncKeys<K> onSync) {
    return this.observe(onSync);
  }

  @Override
  public DemandMapLaneView<K, V> willCommand(WillCommand willCommand) {
    return this.observe(willCommand);
  }

  @Override
  public DemandMapLaneView<K, V> didCommand(DidCommand didCommand) {
    return this.observe(didCommand);
  }

  @Override
  public DemandMapLaneView<K, V> willUplink(WillUplink willUplink) {
    return this.observe(willUplink);
  }

  @Override
  public DemandMapLaneView<K, V> didUplink(DidUplink didUplink) {
    return this.observe(didUplink);
  }

  @Override
  public DemandMapLaneView<K, V> willEnter(WillEnter willEnter) {
    return this.observe(willEnter);
  }

  @Override
  public DemandMapLaneView<K, V> didEnter(DidEnter didEnter) {
    return this.observe(didEnter);
  }

  @Override
  public DemandMapLaneView<K, V> willLeave(WillLeave willLeave) {
    return this.observe(willLeave);
  }

  @Override
  public DemandMapLaneView<K, V> didLeave(DidLeave didLeave) {
    return this.observe(didLeave);
  }

  @SuppressWarnings("unchecked")
  public V dispatchOnCue(K key, WarpUplink uplink) {
    final Lane lane = SwimContext.getLane();
    final Link link = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      if (observers instanceof OnCueKey<?, ?>) {
        try {
          final V value = ((OnCueKey<K, V>) observers).onCue(key, uplink);
          if (value != null) {
            return value;
          }
        } catch (Throwable error) {
          if (Cont.isNonFatal(error)) {
            this.laneDidFail(error);
          }
          throw error;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof OnCueKey<?, ?>) {
            try {
              final V value = ((OnCueKey<K, V>) observer).onCue(key, uplink);
              if (value != null) {
                return value;
              }
            } catch (Throwable error) {
              if (Cont.isNonFatal(error)) {
                this.laneDidFail(error);
              }
              throw error;
            }
          }
        }
      }
      return null;
    } finally {
      SwimContext.setLink(link);
      SwimContext.setLane(lane);
    }
  }

  @SuppressWarnings("unchecked")
  public Iterator<K> dispatchOnSync(WarpUplink uplink) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      if (observers instanceof OnSyncKeys<?>) {
        try {
          final Iterator<K> iterator = ((OnSyncKeys<K>) observers).onSync(uplink);
          if (iterator != null) {
            return iterator;
          }
        } catch (Throwable error) {
          if (Cont.isNonFatal(error)) {
            this.laneDidFail(error);
          }
          throw error;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof OnSyncKeys<?>) {
            try {
              final Iterator<K> iterator = ((OnSyncKeys<K>) observer).onSync(uplink);
              if (iterator != null) {
                return iterator;
              }
            } catch (Throwable error) {
              if (Cont.isNonFatal(error)) {
                this.laneDidFail(error);
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

  Value nextDownCue(Value key, WarpUplink uplink) {
    final K keyObject = this.keyForm.cast(key);
    final V object = this.dispatchOnCue(keyObject, uplink);
    if (object != null) {
      return this.valueForm.mold(object).toValue();
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  Iterator<Value> syncKeys(WarpUplink uplink) {
    final Iterator<K> keyIterator = this.dispatchOnSync(uplink);
    if (keyIterator != null) {
      if (this.keyForm == Form.forValue() && this.valueForm == Form.forValue()) {
        return (Iterator<Value>) (Iterator<?>) keyIterator;
      } else {
        return new DemandMapLaneKeyIterator<K>(keyIterator, this.keyForm);
      }
    }
    return null;
  }

  @Override
  public void cue(K key) {
    this.laneBinding.cueDownKey(this.keyForm.mold(key).toValue());
  }

  @Override
  public void remove(K key) {
    this.laneBinding.remove(this.keyForm.mold(key).toValue());
  }

}

final class DemandMapLaneKeyIterator<K> implements Iterator<Value> {

  final Iterator<K> inner;
  final Form<K> keyForm;

  DemandMapLaneKeyIterator(Iterator<K> inner, Form<K> keyForm) {
    this.inner = inner;
    this.keyForm = keyForm;
  }

  @Override
  public boolean hasNext() {
    return this.inner.hasNext();
  }

  @Override
  public Value next() {
    return this.keyForm.mold(this.inner.next()).toValue();
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }

}
