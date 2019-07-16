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

package swim.observable;

import java.util.List;
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

public interface ObservableList<V> extends Observable<Object>, List<V> {
  void drop(int lower);

  void take(int upper);

  void move(int fromIndex, int toIndex);

  @Override
  ObservableList<V> observe(Object observer);

  @Override
  ObservableList<V> unobserve(Object observer);

  ObservableList<V> willUpdate(WillUpdateIndex<V> willUpdate);

  ObservableList<V> didUpdate(DidUpdateIndex<V> didUpdate);

  ObservableList<V> willMove(WillMoveIndex<V> willMove);

  ObservableList<V> didMove(DidMoveIndex<V> didMove);

  ObservableList<V> willRemove(WillRemoveIndex willRemove);

  ObservableList<V> didRemove(DidRemoveIndex<V> didRemove);

  ObservableList<V> willDrop(WillDrop willDrop);

  ObservableList<V> didDrop(DidDrop didDrop);

  ObservableList<V> willTake(WillTake willTake);

  ObservableList<V> didTake(DidTake didTake);

  ObservableList<V> willClear(WillClear willClear);

  ObservableList<V> didClear(DidClear didClear);
}
