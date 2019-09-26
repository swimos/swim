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

package swim.streaming.windows;

import java.util.Set;
import java.util.function.Supplier;

/**
 * Assigns partitions to elements of a stream.
 *
 * @param <T> The type of the elements.
 * @param <P> The type of the partitions.
 * @param <S> The type of the state store for the active partitions.
 */
public interface PartitionAssigner<T, P, S extends PartitionState<P, S>> {

  /**
   * @return A factory for empty partition state stores.
   */
  Supplier<S> stateFactory();

  /**
   * Get the partitions for an element.
   *
   * @param data The element.
   * @param activePartitions Currently active partitions.
   * @return The partition assignment.
   */
  Assignment<P, S> partitionsFor(T data, S activePartitions);

  interface Assignment<P, S> {

    /**
     * @return The set of partitions.
     */
    Set<P> partitions();

    /**
     * @return The updated partition state store.
     */
    S updatedState();

  }
}
