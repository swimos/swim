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

package swim.dataflow.graph.persistence;


import java.util.Set;

/**
 * Provides durable persistence for a set.
 *
 * @param <T> The type of the values.
 */
public interface SetPersister<T> {

  /**
   * Determine whether the value is in the state.
   *
   * @param val The value.
   * @return Whether the value is in the state.
   */
  boolean contains(T val);

  /**
   * @return A view of the state.
   */
  Set<T> get();

  /**
   * Add a value to the sate.
   *
   * @param value The new value.
   */
  void add(T value);

  /**
   * Remove A value from the state.
   *
   * @param value The key.
   */
  void remove(T value);

  /**
   * Close the persister. It should be be used again afterwards.
   */
  void close();
}
