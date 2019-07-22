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

import java.util.List;
import swim.api.warp.WarpLane;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidEnter;
import swim.api.warp.function.DidLeave;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillEnter;
import swim.api.warp.function.WillLeave;
import swim.api.warp.function.WillUplink;
import swim.observable.ObservableList;
import swim.observable.function.DidClear;
import swim.observable.function.DidDrop;
import swim.observable.function.DidMoveIndex;
import swim.observable.function.DidRemoveIndex;
import swim.observable.function.DidTake;
import swim.observable.function.DidUpdateIndex;
import swim.observable.function.WillClear;
import swim.observable.function.WillDrop;
import swim.observable.function.WillMoveIndex;
import swim.observable.function.WillRemoveIndex;
import swim.observable.function.WillTake;
import swim.observable.function.WillUpdateIndex;
import swim.structure.Form;
import swim.util.KeyedList;

public interface ListLane<V> extends WarpLane, KeyedList<V>, ObservableList<V> {
  Form<V> valueForm();

  <V2> ListLane<V2> valueForm(Form<V2> valueForm);

  <V2> ListLane<V2> valueClass(Class<V2> valueClass);

  boolean isResident();

  ListLane<V> isResident(boolean isResident);

  boolean isTransient();

  ListLane<V> isTransient(boolean isTransient);

  @Override
  ListLane<V> observe(Object observer);

  @Override
  ListLane<V> unobserve(Object observer);

  @Override
  ListLane<V> willUpdate(WillUpdateIndex<V> willUpdate);

  @Override
  ListLane<V> didUpdate(DidUpdateIndex<V> didUpdate);

  @Override
  ListLane<V> willMove(WillMoveIndex<V> willMove);

  @Override
  ListLane<V> didMove(DidMoveIndex<V> didMove);

  @Override
  ListLane<V> willRemove(WillRemoveIndex willRemove);

  @Override
  ListLane<V> didRemove(DidRemoveIndex<V> didRemove);

  @Override
  ListLane<V> willDrop(WillDrop willDrop);

  @Override
  ListLane<V> didDrop(DidDrop didDrop);

  @Override
  ListLane<V> willTake(WillTake willTake);

  @Override
  ListLane<V> didTake(DidTake didTake);

  @Override
  ListLane<V> willClear(WillClear willClear);

  @Override
  ListLane<V> didClear(DidClear didClear);

  @Override
  ListLane<V> willCommand(WillCommand willCommand);

  @Override
  ListLane<V> didCommand(DidCommand didCommand);

  @Override
  ListLane<V> willUplink(WillUplink willUplink);

  @Override
  ListLane<V> didUplink(DidUplink didUplink);

  @Override
  ListLane<V> willEnter(WillEnter willEnter);

  @Override
  ListLane<V> didEnter(DidEnter didEnter);

  @Override
  ListLane<V> willLeave(WillLeave willLeave);

  @Override
  ListLane<V> didLeave(DidLeave didLeave);

  @Override
  void drop(int lower);

  @Override
  void take(int keep);

  List<V> snapshot();
}
