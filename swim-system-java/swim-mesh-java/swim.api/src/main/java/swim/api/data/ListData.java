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
import swim.util.KeyedList;

public interface ListData<V> extends KeyedList<V> {
  Value name();

  Form<V> valueForm();

  <V2> ListData<V2> valueForm(Form<V2> valueForm);

  <V2> ListData<V2> valueClass(Class<V2> valueClass);

  boolean isResident();

  ListData<V> isResident(boolean isResident);

  boolean isTransient();

  ListData<V> isTransient(boolean isTransient);

  void drop(int lower);

  void take(int keep);

  KeyedList<V> snapshot();

  void close();
}
