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

package swim.util;

import java.util.Collection;
import java.util.Map;

/**
 * Type that accumulates map entries, and binds an output result of type
 * {@code O}.
 */
public interface EntryBuilder<K, V, O> extends PairBuilder<K, V, O>, Builder<Map.Entry<K, V>, O> {
  /**
   * Adds an input pair to this builder, returning {@code true} if the state
   * of the builder changed.
   */
  @Override
  boolean add(K key, V value);

  /**
   * Adds a single entry to this builder, returning {@code true} if the state
   * of the builder changed.
   */
  @Override
  boolean add(Map.Entry<K, V> input);

  /**
   * Adds multiple entries to this builder, returning {@code true} if the state
   * of the builder changed.
   */
  @Override
  boolean addAll(Collection<? extends Map.Entry<K, V>> inputs);

  /**
   * Adds multiple entries to this builder, returning {@code true} if the state
   * of the builder changed.
   */
  boolean addAll(Map<? extends K, ? extends V> inputs);

  /**
   * Returns the output result of this builder.
   */
  @Override
  O bind();
}
