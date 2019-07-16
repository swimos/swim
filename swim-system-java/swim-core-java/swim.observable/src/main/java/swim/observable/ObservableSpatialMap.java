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

import swim.observable.function.DidClear;
import swim.observable.function.DidMoveShape;
import swim.observable.function.DidRemoveShape;
import swim.observable.function.DidUpdateShape;
import swim.observable.function.WillClear;
import swim.observable.function.WillMoveShape;
import swim.observable.function.WillRemoveShape;
import swim.observable.function.WillUpdateShape;
import swim.spatial.SpatialMap;

public interface ObservableSpatialMap<K, S, V> extends Observable<Object>, SpatialMap<K, S, V> {
  @Override
  ObservableSpatialMap<K, S, V> observe(Object observer);

  @Override
  ObservableSpatialMap<K, S, V> unobserve(Object observer);

  ObservableSpatialMap<K, S, V> willUpdate(WillUpdateShape<K, S, V> willUpdate);

  ObservableSpatialMap<K, S, V> didUpdate(DidUpdateShape<K, S, V> didUpdate);

  ObservableSpatialMap<K, S, V> willMove(WillMoveShape<K, S, V> willMove);

  ObservableSpatialMap<K, S, V> didMove(DidMoveShape<K, S, V> didMove);

  ObservableSpatialMap<K, S, V> willRemove(WillRemoveShape<K, S> willRemove);

  ObservableSpatialMap<K, S, V> didRemove(DidRemoveShape<K, S, V> didRemove);

  ObservableSpatialMap<K, S, V> willClear(WillClear willClear);

  ObservableSpatialMap<K, S, V> didClear(DidClear didClear);
}
