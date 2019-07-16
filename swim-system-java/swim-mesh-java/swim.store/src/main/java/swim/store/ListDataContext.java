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

public interface ListDataContext extends DataContext {
  void didUpdate(long index, Value newValue, Value oldValue);

  void didInsert(long index, Value newValue);

  void didRemove(long index, Value oldValue);

  void didDrop(long lower);

  void didTake(long upper);

  void didClear();
}
