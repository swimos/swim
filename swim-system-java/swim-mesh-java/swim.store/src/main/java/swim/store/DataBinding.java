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

package swim.store;

import swim.structure.Value;

public interface DataBinding {
  DataContext dataContext();

  StoreBinding storeBinding();

  void setStoreBinding(StoreBinding storeBinding);

  <T> T unwrapData(Class<T> dataClass);

  Value name();

  long dataSize();

  boolean isResident();

  DataBinding isResident(boolean isResident);

  boolean isTransient();

  DataBinding isTransient(boolean isTransient);

  void close();
}
