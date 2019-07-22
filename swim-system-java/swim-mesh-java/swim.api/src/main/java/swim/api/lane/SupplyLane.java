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

public interface SupplyLane<V> extends WarpLane {
  Form<V> valueForm();

  <V2> SupplyLane<V2> valueForm(Form<V2> valueForm);

  <V2> SupplyLane<V2> valueClass(Class<V2> valueClass);

  @Override
  SupplyLane<V> observe(Object observer);

  @Override
  SupplyLane<V> unobserve(Object observer);

  @Override
  SupplyLane<V> willCommand(WillCommand willCommand);

  @Override
  SupplyLane<V> didCommand(DidCommand didCommand);

  @Override
  SupplyLane<V> willUplink(WillUplink willUplink);

  @Override
  SupplyLane<V> didUplink(DidUplink didUplink);

  @Override
  SupplyLane<V> willEnter(WillEnter willEnter);

  @Override
  SupplyLane<V> didEnter(DidEnter didEnter);

  @Override
  SupplyLane<V> willLeave(WillLeave willLeave);

  @Override
  SupplyLane<V> didLeave(DidLeave didLeave);

  void push(V value);
}
