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

import swim.api.lane.function.OnCueKey;
import swim.api.lane.function.OnSyncKeys;
import swim.api.warp.WarpLane;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;
import swim.structure.Form;

public interface DemandMapLane<K, V> extends WarpLane {
  Form<K> keyForm();

  <K2> DemandMapLane<K2, V> keyForm(Form<K2> keyForm);

  <K2> DemandMapLane<K2, V> keyClass(Class<K2> keyClass);

  Form<V> valueForm();

  <V2> DemandMapLane<K, V2> valueForm(Form<V2> valueForm);

  <V2> DemandMapLane<K, V2> valueClass(Class<V2> valueClass);

  @Override
  DemandMapLane<K, V> observe(Object observer);

  @Override
  DemandMapLane<K, V> unobserve(Object observer);

  DemandMapLane<K, V> onCue(OnCueKey<K, V> onCue);

  DemandMapLane<K, V> onSync(OnSyncKeys<K> onSync);

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

  void cue(K key);

  void remove(K key);
}
