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

package swim.dynamic;

/**
 * A dynamically typed field descriptor for a host type.
 */
public interface HostField<T> extends HostMember<T> {
  Object get(Bridge bridge, T self);

  default void set(Bridge bridge, T self, Object value) {
    throw new UnsupportedOperationException();
  }

  default boolean remove(Bridge bridge, T self) {
    throw new UnsupportedOperationException();
  }
}
