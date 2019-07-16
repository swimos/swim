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
import swim.api.downlink.MapDownlink;
import swim.api.function.DidCommand;
import swim.api.function.WillCommand;
import swim.api.http.function.DecodeRequestHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.api.lane.function.DidDownlinkMap;
import swim.api.lane.function.DidEnter;
import swim.api.lane.function.DidLeave;
import swim.api.lane.function.DidUplink;
import swim.api.lane.function.WillDownlinkMap;
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

public interface JoinMapLane<L, K, V> extends Lane, Iterable<Map.Entry<K, V>>, ObservableMap<K, V> {
  Form<L> linkForm();

  <L2> JoinMapLane<L2, K, V> linkForm(Form<L2> linkForm);

  <L2> JoinMapLane<L2, K, V> linkClass(Class<L2> linkClass);

  Form<K> keyForm();

  <K2> JoinMapLane<L, K2, V> keyForm(Form<K2> keyForm);

  <K2> JoinMapLane<L, K2, V> keyClass(Class<K2> keyClass);

  Form<V> valueForm();

  <V2> JoinMapLane<L, K, V2> valueForm(Form<V2> valueForm);

  <V2> JoinMapLane<L, K, V2> valueClass(Class<V2> valueClass);

  boolean isResident();

  JoinMapLane<L, K, V> isResident(boolean isResident);

  boolean isTransient();

  JoinMapLane<L, K, V> isTransient(boolean isTransient);

  @Override
  JoinMapLane<L, K, V> isSigned(boolean isSigned);

  @Override
  JoinMapLane<L, K, V> observe(Object observer);

  @Override
  JoinMapLane<L, K, V> unobserve(Object observer);

  JoinMapLane<L, K, V> willDownlink(WillDownlinkMap<L> willDownlink);

  JoinMapLane<L, K, V> didDownlink(DidDownlinkMap<L> didDownlink);

  @Override
  JoinMapLane<L, K, V> willUpdate(WillUpdateKey<K, V> willUpdate);

  @Override
  JoinMapLane<L, K, V> didUpdate(DidUpdateKey<K, V> didUpdate);

  @Override
  JoinMapLane<L, K, V> willRemove(WillRemoveKey<K> willRemove);

  @Override
  JoinMapLane<L, K, V> didRemove(DidRemoveKey<K, V> didRemove);

  @Override
  JoinMapLane<L, K, V> willClear(WillClear willClear);

  @Override
  JoinMapLane<L, K, V> didClear(DidClear didClear);

  @Override
  JoinMapLane<L, K, V> willCommand(WillCommand willCommand);

  @Override
  JoinMapLane<L, K, V> didCommand(DidCommand didCommand);

  @Override
  JoinMapLane<L, K, V> willUplink(WillUplink willUplink);

  @Override
  JoinMapLane<L, K, V> didUplink(DidUplink didUplink);

  @Override
  JoinMapLane<L, K, V> willEnter(WillEnter willEnter);

  @Override
  JoinMapLane<L, K, V> didEnter(DidEnter didEnter);

  @Override
  JoinMapLane<L, K, V> willLeave(WillLeave willLeave);

  @Override
  JoinMapLane<L, K, V> didLeave(DidLeave didLeave);

  @Override
  JoinMapLane<L, K, V> decodeRequest(DecodeRequestHttp<Object> decodeRequest);

  @Override
  JoinMapLane<L, K, V> willRequest(WillRequestHttp<?> willRequest);

  @Override
  JoinMapLane<L, K, V> didRequest(DidRequestHttp<Object> didRequest);

  @Override
  JoinMapLane<L, K, V> doRespond(DoRespondHttp<Object> doRespond);

  @Override
  JoinMapLane<L, K, V> willRespond(WillRespondHttp<?> willRespond);

  @Override
  JoinMapLane<L, K, V> didRespond(DidRespondHttp<?> didRespond);

  MapDownlink<K, V> downlink(L key);

  MapDownlink<?, ?> getDownlink(Object key);

  Iterator<K> keyIterator();

  Iterator<V> valueIterator();

  Iterator<Entry<L, MapDownlink<?, ?>>> downlinkIterator();
}
