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

import swim.math.Z2Form;
import swim.spatial.SpatialMap;
import swim.structure.Form;
import swim.structure.Value;

public interface SpatialData<K, S, V> extends SpatialMap<K, S, V> {
  Value name();

  Form<K> keyForm();

  <K2> SpatialData<K2, S, V> keyForm(Form<K2> keyForm);

  <K2> SpatialData<K2, S, V> keyClass(Class<K2> keyClass);

  Z2Form<S> shapeForm();

  Form<V> valueForm();

  <V2> SpatialData<K, S, V2> valueForm(Form<V2> valueForm);

  <V2> SpatialData<K, S, V2> valueClass(Class<V2> valueClass);

  boolean isResident();

  SpatialData<K, S, V> isResident(boolean isResident);

  boolean isTransient();

  SpatialData<K, S, V> isTransient(boolean isTransient);

  SpatialMap<K, S, V> snapshot();

  void close();
}
