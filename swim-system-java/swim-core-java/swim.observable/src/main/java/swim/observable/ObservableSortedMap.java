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

import java.util.SortedMap;
import swim.observable.function.DidDrop;
import swim.observable.function.DidTake;
import swim.observable.function.WillDrop;
import swim.observable.function.WillTake;

public interface ObservableSortedMap<K, V> extends ObservableMap<K, V>, SortedMap<K, V> {
  void drop(int lower);

  void take(int upper);

  @Override
  ObservableSortedMap<K, V> observe(Object observer);

  @Override
  ObservableSortedMap<K, V> unobserve(Object observer);

  ObservableSortedMap<K, V> willDrop(WillDrop willDrop);

  ObservableSortedMap<K, V> didDrop(DidDrop didDrop);

  ObservableSortedMap<K, V> willTake(WillTake willTake);

  ObservableSortedMap<K, V> didTake(DidTake didTake);
}
