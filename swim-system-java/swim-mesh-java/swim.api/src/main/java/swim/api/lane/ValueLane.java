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
import swim.observable.ObservableValue;
import swim.observable.function.DidSet;
import swim.observable.function.WillSet;
import swim.streamlet.Inlet;
import swim.streamlet.Outlet;
import swim.structure.Form;

public interface ValueLane<V> extends WarpLane, ObservableValue<V>, Inlet<V>, Outlet<V> {
  Form<V> valueForm();

  <V2> ValueLane<V2> valueForm(Form<V2> valueForm);

  <V2> ValueLane<V2> valueClass(Class<V2> valueClass);

  boolean isResident();

  ValueLane<V> isResident(boolean isResident);

  boolean isTransient();

  ValueLane<V> isTransient(boolean isTransient);

  @Override
  ValueLane<V> observe(Object observer);

  @Override
  ValueLane<V> unobserve(Object observer);

  @Override
  ValueLane<V> willSet(WillSet<V> willSet);

  @Override
  ValueLane<V> didSet(DidSet<V> didSet);

  @Override
  ValueLane<V> willCommand(WillCommand willCommand);

  @Override
  ValueLane<V> didCommand(DidCommand didCommand);

  @Override
  ValueLane<V> willUplink(WillUplink willUplink);

  @Override
  ValueLane<V> didUplink(DidUplink didUplink);

  @Override
  ValueLane<V> willEnter(WillEnter willEnter);

  @Override
  ValueLane<V> didEnter(DidEnter didEnter);

  @Override
  ValueLane<V> willLeave(WillLeave willLeave);

  @Override
  ValueLane<V> didLeave(DidLeave didLeave);

  @Override
  V get();

  @Override
  V set(V newValue);
}
