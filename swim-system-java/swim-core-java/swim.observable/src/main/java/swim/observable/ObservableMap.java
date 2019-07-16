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

import java.util.Map;
import swim.observable.function.DidClear;
import swim.observable.function.DidRemoveKey;
import swim.observable.function.DidUpdateKey;
import swim.observable.function.WillClear;
import swim.observable.function.WillRemoveKey;
import swim.observable.function.WillUpdateKey;

public interface ObservableMap<K, V> extends Observable<Object>, Map<K, V> {
  @Override
  ObservableMap<K, V> observe(Object observer);

  @Override
  ObservableMap<K, V> unobserve(Object observer);

  ObservableMap<K, V> willUpdate(WillUpdateKey<K, V> willUpdate);

  ObservableMap<K, V> didUpdate(DidUpdateKey<K, V> didUpdate);

  ObservableMap<K, V> willRemove(WillRemoveKey<K> willRemove);

  ObservableMap<K, V> didRemove(DidRemoveKey<K, V> didRemove);

  ObservableMap<K, V> willClear(WillClear willClear);

  ObservableMap<K, V> didClear(DidClear didClear);
}
