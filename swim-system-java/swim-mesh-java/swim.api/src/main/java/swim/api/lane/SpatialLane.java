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
import swim.api.lane.function.WillEnter;
import swim.api.lane.function.WillLeave;
import swim.api.lane.function.WillUplink;
import swim.observable.ObservableSpatialMap;
import swim.observable.function.DidClear;
import swim.observable.function.DidMoveShape;
import swim.observable.function.DidRemoveShape;
import swim.observable.function.DidUpdateShape;
import swim.observable.function.WillClear;
import swim.observable.function.WillMoveShape;
import swim.observable.function.WillRemoveShape;
import swim.observable.function.WillUpdateShape;
import swim.spatial.SpatialMap;
import swim.structure.Form;

public interface SpatialLane<K, S, V> extends Lane, ObservableSpatialMap<K, S, V> {
  Form<K> keyForm();

  <K2> SpatialLane<K2, S, V> keyForm(Form<K2> keyForm);

  <K2> SpatialLane<K2, S, V> keyClass(Class<K2> keyClass);

  Form<V> valueForm();

  <V2> SpatialLane<K, S, V2> valueForm(Form<V2> valueForm);

  <V2> SpatialLane<K, S, V2> valueClass(Class<V2> valueClass);

  boolean isResident();

  SpatialLane<K, S, V> isResident(boolean isResident);

  boolean isTransient();

  SpatialLane<K, S, V> isTransient(boolean isTransient);

  @Override
  SpatialLane<K, S, V> isSigned(boolean isSigned);

  @Override
  SpatialLane<K, S, V> observe(Object observer);

  @Override
  SpatialLane<K, S, V> unobserve(Object observer);

  @Override
  SpatialLane<K, S, V> willUpdate(WillUpdateShape<K, S, V> willUpdate);

  @Override
  SpatialLane<K, S, V> didUpdate(DidUpdateShape<K, S, V> didUpdate);

  @Override
  SpatialLane<K, S, V> willMove(WillMoveShape<K, S, V> willMove);

  @Override
  SpatialLane<K, S, V> didMove(DidMoveShape<K, S, V> didMove);

  @Override
  SpatialLane<K, S, V> willRemove(WillRemoveShape<K, S> willRemove);

  @Override
  SpatialLane<K, S, V> didRemove(DidRemoveShape<K, S, V> didRemove);

  @Override
  SpatialLane<K, S, V> willClear(WillClear willClear);

  @Override
  SpatialLane<K, S, V> didClear(DidClear didClear);

  @Override
  SpatialLane<K, S, V> willCommand(WillCommand willCommand);

  @Override
  SpatialLane<K, S, V> didCommand(DidCommand didCommand);

  @Override
  SpatialLane<K, S, V> willUplink(WillUplink willUplink);

  @Override
  SpatialLane<K, S, V> didUplink(DidUplink didUplink);

  @Override
  SpatialLane<K, S, V> willEnter(WillEnter willEnter);

  @Override
  SpatialLane<K, S, V> didEnter(DidEnter didEnter);

  @Override
  SpatialLane<K, S, V> willLeave(WillLeave willLeave);

  @Override
  SpatialLane<K, S, V> didLeave(DidLeave didLeave);

  @Override
  SpatialLane<K, S, V> decodeRequest(DecodeRequestHttp<Object> decodeRequest);

  @Override
  SpatialLane<K, S, V> willRequest(WillRequestHttp<?> willRequest);

  @Override
  SpatialLane<K, S, V> didRequest(DidRequestHttp<Object> didRequest);

  @Override
  SpatialLane<K, S, V> doRespond(DoRespondHttp<Object> doRespond);

  @Override
  SpatialLane<K, S, V> willRespond(WillRespondHttp<?> willRespond);

  @Override
  SpatialLane<K, S, V> didRespond(DidRespondHttp<?> didRespond);

  SpatialMap<K, S, V> snapshot();
}
