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

package swim.api.lane;

import java.util.Iterator;
import java.util.Map;
import swim.api.downlink.ValueDownlink;
import swim.api.function.DidCommand;
import swim.api.function.WillCommand;
import swim.api.http.function.DecodeRequestHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.api.lane.function.DidDownlinkValue;
import swim.api.lane.function.DidEnter;
import swim.api.lane.function.DidLeave;
import swim.api.lane.function.DidUplink;
import swim.api.lane.function.WillDownlinkValue;
import swim.api.lane.function.WillEnter;
import swim.api.lane.function.WillLeave;
import swim.api.lane.function.WillUplink;
import swim.observable.ObservableMap;
import swim.observable.function.DidClear;
import swim.observable.function.DidRemoveKey;
import swim.observable.function.DidUpdateKey;
import swim.observable.function.WillClear;
import swim.observable.function.WillRemoveKey;
import swim.observable.function.WillUpdateKey;
import swim.structure.Form;

public interface JoinValueLane<K, V> extends Lane, Iterable<Map.Entry<K, V>>, ObservableMap<K, V> {
  Form<K> keyForm();

  <K2> JoinValueLane<K2, V> keyForm(Form<K2> keyForm);

  <K2> JoinValueLane<K2, V> keyClass(Class<K2> keyClass);

  Form<V> valueForm();

  <V2> JoinValueLane<K, V2> valueForm(Form<V2> valueForm);

  <V2> JoinValueLane<K, V2> valueClass(Class<V2> valueClass);

  boolean isResident();

  JoinValueLane<K, V> isResident(boolean isResident);

  boolean isTransient();

  JoinValueLane<K, V> isTransient(boolean isTransient);

  @Override
  JoinValueLane<K, V> isSigned(boolean isSigned);

  @Override
  JoinValueLane<K, V> observe(Object observer);

  @Override
  JoinValueLane<K, V> unobserve(Object observer);

  JoinValueLane<K, V> willDownlink(WillDownlinkValue<K> willDownlink);

  JoinValueLane<K, V> didDownlink(DidDownlinkValue<K> didDownlink);

  @Override
  JoinValueLane<K, V> willUpdate(WillUpdateKey<K, V> willUpdate);

  @Override
  JoinValueLane<K, V> didUpdate(DidUpdateKey<K, V> didUpdate);

  @Override
  JoinValueLane<K, V> willRemove(WillRemoveKey<K> willRemove);

  @Override
  JoinValueLane<K, V> didRemove(DidRemoveKey<K, V> didRemove);

  @Override
  JoinValueLane<K, V> willClear(WillClear willClear);

  @Override
  JoinValueLane<K, V> didClear(DidClear didClear);

  @Override
  JoinValueLane<K, V> willCommand(WillCommand willCommand);

  @Override
  JoinValueLane<K, V> didCommand(DidCommand didCommand);

  @Override
  JoinValueLane<K, V> willUplink(WillUplink willUplink);

  @Override
  JoinValueLane<K, V> didUplink(DidUplink didUplink);

  @Override
  JoinValueLane<K, V> willEnter(WillEnter willEnter);

  @Override
  JoinValueLane<K, V> didEnter(DidEnter didEnter);

  @Override
  JoinValueLane<K, V> willLeave(WillLeave willLeave);

  @Override
  JoinValueLane<K, V> didLeave(DidLeave didLeave);

  @Override
  JoinValueLane<K, V> decodeRequest(DecodeRequestHttp<Object> decodeRequest);

  @Override
  JoinValueLane<K, V> willRequest(WillRequestHttp<?> willRequest);

  @Override
  JoinValueLane<K, V> didRequest(DidRequestHttp<Object> didRequest);

  @Override
  JoinValueLane<K, V> doRespond(DoRespondHttp<Object> doRespond);

  @Override
  JoinValueLane<K, V> willRespond(WillRespondHttp<?> willRespond);

  @Override
  JoinValueLane<K, V> didRespond(DidRespondHttp<?> didRespond);

  ValueDownlink<V> downlink(K key);

  ValueDownlink<?> getDownlink(Object key);

  Iterator<K> keyIterator();

  Iterator<V> valueIterator();

  Iterator<Entry<K, ValueDownlink<?>>> downlinkIterator();
}
