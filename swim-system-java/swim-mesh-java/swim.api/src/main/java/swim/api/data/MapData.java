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

package swim.api.data;

import swim.structure.Form;
import swim.structure.Value;
import swim.util.OrderedMap;

public interface MapData<K, V> extends OrderedMap<K, V> {
  Value name();

  Form<K> keyForm();

  <K2> MapData<K2, V> keyForm(Form<K2> keyForm);

  <K2> MapData<K2, V> keyClass(Class<K2> keyClass);

  Form<V> valueForm();

  <V2> MapData<K, V2> valueForm(Form<V2> valueForm);

  <V2> MapData<K, V2> valueClass(Class<V2> valueClass);

  boolean isResident();

  MapData<K, V> isResident(boolean isResident);

  boolean isTransient();

  MapData<K, V> isTransient(boolean isTransient);

  void drop(int lower);

  void take(int keep);

  OrderedMap<K, V> snapshot();

  void close();
}
