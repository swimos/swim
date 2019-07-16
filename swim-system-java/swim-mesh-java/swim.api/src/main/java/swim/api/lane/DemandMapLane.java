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

import swim.api.function.DidCommand;
import swim.api.function.WillCommand;
import swim.api.http.function.DecodeRequestHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.api.lane.function.DidEnter;
import swim.api.lane.function.DidLeave;
import swim.api.lane.function.DidUplink;
import swim.api.lane.function.OnCueKey;
import swim.api.lane.function.OnSyncMap;
import swim.api.lane.function.WillEnter;
import swim.api.lane.function.WillLeave;
import swim.api.lane.function.WillUplink;
import swim.structure.Form;

public interface DemandMapLane<K, V> extends Lane {
  Form<K> keyForm();

  <K2> DemandMapLane<K2, V> keyForm(Form<K2> keyForm);

  <K2> DemandMapLane<K2, V> keyClass(Class<K2> keyClass);

  Form<V> valueForm();

  <V2> DemandMapLane<K, V2> valueForm(Form<V2> valueForm);

  <V2> DemandMapLane<K, V2> valueClass(Class<V2> valueClass);

  @Override
  DemandMapLane<K, V> isSigned(boolean isSigned);

  @Override
  DemandMapLane<K, V> observe(Object observer);

  @Override
  DemandMapLane<K, V> unobserve(Object observer);

  DemandMapLane<K, V> onCue(OnCueKey<K, V> onCue);

  DemandMapLane<K, V> onSync(OnSyncMap<K, V> onSync);

  @Override
  DemandMapLane<K, V> willCommand(WillCommand willCommand);

  @Override
  DemandMapLane<K, V> didCommand(DidCommand didCommand);

  @Override
  DemandMapLane<K, V> willUplink(WillUplink willUplink);

  @Override
  DemandMapLane<K, V> didUplink(DidUplink didUplink);

  @Override
  DemandMapLane<K, V> willEnter(WillEnter willEnter);

  @Override
  DemandMapLane<K, V> didEnter(DidEnter didEnter);

  @Override
  DemandMapLane<K, V> willLeave(WillLeave willLeave);

  @Override
  DemandMapLane<K, V> didLeave(DidLeave didLeave);

  @Override
  DemandMapLane<K, V> decodeRequest(DecodeRequestHttp<Object> decodeRequest);

  @Override
  DemandMapLane<K, V> willRequest(WillRequestHttp<?> willRequest);

  @Override
  DemandMapLane<K, V> didRequest(DidRequestHttp<Object> didRequest);

  @Override
  DemandMapLane<K, V> doRespond(DoRespondHttp<Object> doRespond);

  @Override
  DemandMapLane<K, V> willRespond(WillRespondHttp<?> willRespond);

  @Override
  DemandMapLane<K, V> didRespond(DidRespondHttp<?> didRespond);

  void cue(K key);

  void remove(K key);
}
