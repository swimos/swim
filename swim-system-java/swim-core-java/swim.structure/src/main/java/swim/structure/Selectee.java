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

package swim.structure;

import swim.structure.selector.ChildrenSelector;
import swim.structure.selector.KeysSelector;

/**
 * Represents an operation that is used exclusively as a helper to some {@link
 * Selector Selector's} {@link Selector#mapSelected} or {@link
 * Selector#forSelected} methods.
 */
//@FunctionalInterface
public interface Selectee<T> {
  /**
   * Performs this operation against {@code interpreter}.  By convention, a null
   * return value indicates to "collection-oriented" calling {@code Selectors}
   * (e.g. {@link ChildrenSelector}, {@link KeysSelector}) that {@code
   * forSelected} should continue to be invoked, if possible. A non-null value
   * indicates to such {@code Selectors} that {@code forSelected} should return
   * immediately.
   */
  T selected(Interpreter interpreter);
}
