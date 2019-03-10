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

package swim.store.mem;

import swim.store.StorageProxy;
import swim.store.StoreBinding;

public class MemStorage extends StorageProxy {
  @Override
  public double storagePriority() {
    return 0.0;
  }

  @Override
  public StoreBinding createStore() {
    return new MemStore();
  }
}
