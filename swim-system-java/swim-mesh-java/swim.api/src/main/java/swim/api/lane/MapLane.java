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

import java.util.Map;
import swim.api.warp.WarpLane;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;
import swim.observable.ObservableOrderedMap;
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
import swim.streamlet.MapInlet;
import swim.streamlet.MapOutlet;
import swim.structure.Form;
import swim.util.Cursor;
import swim.util.OrderedMap;

public interface MapLane<K, V> extends WarpLane, ObservableOrderedMap<K, V>, MapInlet<K, V, Map<K, V>>, MapOutlet<K, V, MapLane<K, V>> {
  Form<K> keyForm();

  <K2> MapLane<K2, V> keyForm(Form<K2> keyForm);

  <K2> MapLane<K2, V> keyClass(Class<K2> keyClass);

  Form<V> valueForm();

  <V2> MapLane<K, V2> valueForm(Form<V2> valueForm);

  <V2> MapLane<K, V2> valueClass(Class<V2> valueClass);

  boolean isResident();

  MapLane<K, V> isResident(boolean isResident);

  boolean isTransient();

  MapLane<K, V> isTransient(boolean isTransient);

  @Override
  MapLane<K, V> observe(Object observer);

  @Override
  MapLane<K, V> unobserve(Object observer);

  @Override
  MapLane<K, V> willUpdate(WillUpdateKey<K, V> willUpdate);

  @Override
  MapLane<K, V> didUpdate(DidUpdateKey<K, V> didUpdate);

  @Override
  MapLane<K, V> willRemove(WillRemoveKey<K> willRemove);

  @Override
  MapLane<K, V> didRemove(DidRemoveKey<K, V> didRemove);

  @Override
  MapLane<K, V> willDrop(WillDrop willDrop);

  @Override
  MapLane<K, V> didDrop(DidDrop didDrop);

  @Override
  MapLane<K, V> willTake(WillTake willTake);

  @Override
  MapLane<K, V> didTake(DidTake didTake);

  @Override
  MapLane<K, V> willClear(WillClear willClear);

  @Override
  MapLane<K, V> didClear(DidClear didClear);

  @Override
  MapLane<K, V> willCommand(WillCommand willCommand);

  @Override
  MapLane<K, V> didCommand(DidCommand didCommand);

  @Override
  MapLane<K, V> willUplink(WillUplink willUplink);

  @Override
  MapLane<K, V> didUplink(DidUplink didUplink);

  @Override
  MapLane<K, V> willEnter(WillEnter willEnter);

  @Override
  MapLane<K, V> didEnter(DidEnter didEnter);

  @Override
  MapLane<K, V> willLeave(WillLeave willLeave);

  @Override
  MapLane<K, V> didLeave(DidLeave didLeave);

  OrderedMap<K, V> snapshot();

  @Override
  Cursor<K> keyIterator();
}
