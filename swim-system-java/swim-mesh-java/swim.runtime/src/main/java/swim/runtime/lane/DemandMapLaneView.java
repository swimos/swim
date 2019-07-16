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

import java.util.Iterator;
import java.util.Map;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.agent.AgentContext;
import swim.api.function.DidCommand;
import swim.api.function.WillCommand;
import swim.api.http.function.DecodeRequestHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.api.lane.DemandMapLane;
import swim.api.lane.Lane;
import swim.api.lane.function.DidEnter;
import swim.api.lane.function.DidLeave;
import swim.api.lane.function.DidUplink;
import swim.api.lane.function.OnCueKey;
import swim.api.lane.function.OnSyncMap;
import swim.api.lane.function.WillEnter;
import swim.api.lane.function.WillLeave;
import swim.api.lane.function.WillUplink;
import swim.api.uplink.Uplink;
import swim.concurrent.Conts;
import swim.structure.Form;
import swim.structure.Slot;
import swim.structure.Value;

public class DemandMapLaneView<K, V> extends LaneView implements DemandMapLane<K, V> {
  protected final AgentContext agentContext;
  protected Form<K> keyForm;
  protected Form<V> valueForm;

  protected DemandMapLaneModel laneBinding;

  public DemandMapLaneView(AgentContext agentContext, Form<K> keyForm, Form<V> valueForm, Object observers) {
    super(observers);
    this.agentContext = agentContext;
    this.keyForm = keyForm;
    this.valueForm = valueForm;
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
                                        typesafeObservers(this.observers));
  }

  @Override
  public <K2> DemandMapLaneView<K2, V> keyClass(Class<K2> keyClass) {
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
  public <V2> DemandMapLaneView<K, V2> valueForm(Form<V2> valueForm) {
    return new DemandMapLaneView<K, V2>(this.agentContext, this.keyForm, valueForm,
                                        typesafeObservers(this.observers));
  }

  @Override
  public <V2> DemandMapLaneView<K, V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  public void setValueForm(Form<V> valueForm) {
    this.valueForm = valueForm;
  }

  protected Object typesafeObservers(Object observers) {
    // TODO: filter out OnCueKey, OnSyncMap
    return observers;
  }

  @Override
  public final boolean isSigned() {
    return false; // TODO
  }

  @Override
  public DemandMapLaneView<K, V> isSigned(boolean isSigned) {
    return this; // TODO
  }

  @Override
  public void close() {
    this.laneBinding.closeLaneView(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public DemandMapLaneView<K, V> observe(Object observer) {
    return (DemandMapLaneView<K, V>) super.observe(observer);
  }

  @SuppressWarnings("unchecked")
  @Override
  public DemandMapLaneView<K, V> unobserve(Object observer) {
    return (DemandMapLaneView<K, V>) super.unobserve(observer);
  }

  @Override
  public DemandMapLaneView<K, V> onCue(OnCueKey<K, V> onCue) {
    return observe(onCue);
  }

  @Override
  public DemandMapLaneView<K, V> onSync(OnSyncMap<K, V> onSync) {
    return observe(onSync);
  }

  @Override
  public DemandMapLaneView<K, V> willCommand(WillCommand willCommand) {
    return observe(willCommand);
  }

  @Override
  public DemandMapLaneView<K, V> didCommand(DidCommand didCommand) {
    return observe(didCommand);
  }

  @Override
  public DemandMapLaneView<K, V> willUplink(WillUplink willUplink) {
    return observe(willUplink);
  }

  @Override
  public DemandMapLaneView<K, V> didUplink(DidUplink didUplink) {
    return observe(didUplink);
  }

  @Override
  public DemandMapLaneView<K, V> willEnter(WillEnter willEnter) {
    return observe(willEnter);
  }

  @Override
  public DemandMapLaneView<K, V> didEnter(DidEnter didEnter) {
    return observe(didEnter);
  }

  @Override
  public DemandMapLaneView<K, V> willLeave(WillLeave willLeave) {
    return observe(willLeave);
  }

  @Override
  public DemandMapLaneView<K, V> didLeave(DidLeave didLeave) {
    return observe(didLeave);
  }

  @Override
  public DemandMapLaneView<K, V> decodeRequest(DecodeRequestHttp<Object> decodeRequest) {
    return observe(decodeRequest);
  }

  @Override
  public DemandMapLaneView<K, V> willRequest(WillRequestHttp<?> willRequest) {
    return observe(willRequest);
  }

  @Override
  public DemandMapLaneView<K, V> didRequest(DidRequestHttp<Object> didRequest) {
    return observe(didRequest);
  }

  @Override
  public DemandMapLaneView<K, V> doRespond(DoRespondHttp<Object> doRespond) {
    return observe(doRespond);
  }

  @Override
  public DemandMapLaneView<K, V> willRespond(WillRespondHttp<?> willRespond) {
    return observe(willRespond);
  }

  @Override
  public DemandMapLaneView<K, V> didRespond(DidRespondHttp<?> didRespond) {
    return observe(didRespond);
  }

  @SuppressWarnings("unchecked")
  protected V dispatchOnCue(K key, Uplink uplink) {
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
          if (Conts.isNonFatal(error)) {
            laneDidFail(error);
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
      SwimContext.setLink(link);
      SwimContext.setLane(lane);
    }
  }

  @SuppressWarnings("unchecked")
  protected Iterator<Map.Entry<K, V>> dispatchOnSync(Uplink uplink) {
    final Lane oldLane = SwimContext.getLane();
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLane(this);
    SwimContext.setLink(uplink);
    try {
      final Object observers = this.observers;
      if (observers instanceof OnSyncMap<?, ?>) {
        try {
          final Iterator<Map.Entry<K, V>> iterator = ((OnSyncMap<K, V>) observers).onSync(uplink);
          if (iterator != null) {
            return iterator;
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
          if (observer instanceof OnSyncMap<?, ?>) {
            try {
              final Iterator<Map.Entry<K, V>> iterator = ((OnSyncMap<K, V>) observer).onSync(uplink);
              if (iterator != null) {
                return iterator;
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

  Value nextDownCue(Value key, Uplink uplink) {
    final K keyObject = this.keyForm.cast(key);
    final V object = dispatchOnCue(keyObject, uplink);
    if (object != null) {
      return this.valueForm.mold(object).toValue();
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  Iterator<Map.Entry<Value, Value>> syncKeys(Uplink uplink) {
    final Iterator<Map.Entry<K, V>> iterator = dispatchOnSync(uplink);
    if (iterator != null) {
      if (this.keyForm == Form.forValue() && this.valueForm == Form.forValue()) {
        return (Iterator<Map.Entry<Value, Value>>) (Iterator<?>) iterator;
      } else {
        return new DemandMapLaneIterator<K, V>(iterator, this.keyForm, this.valueForm);
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

final class DemandMapLaneIterator<K, V> implements Iterator<Map.Entry<Value, Value>> {
  final Iterator<Map.Entry<K, V>> inner;
  final Form<K> keyForm;
  final Form<V> valueForm;

  DemandMapLaneIterator(Iterator<Map.Entry<K, V>> inner, Form<K> keyForm, Form<V> valueForm) {
    this.inner = inner;
    this.keyForm = keyForm;
    this.valueForm = valueForm;
  }

  @Override
  public boolean hasNext() {
    return this.inner.hasNext();
  }

  @Override
  public Map.Entry<Value, Value> next() {
    final Map.Entry<K, V> entry = this.inner.next();
    final Value key = this.keyForm.mold(entry.getKey()).toValue();
    final Value value = this.valueForm.mold(entry.getValue()).toValue();
    return Slot.of(key, value);
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}
