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

/**
 * State store of open partitions.
 *
 * @param <P> The type of the partitions.
 * @param <Self> The type of the implementing class.
 */
public interface PartitionState<P, Self> {

  /**
   * @return The set of currently open partitions.
   */
  Set<P> activePartitions();

  /**
   * Remove a partition from the store.
   *
   * @param partititon The partition to remove.
   * @return The new store formed by removing the window.
   */
  Self removePartition(P partititon);

  /**
   * Add a window to the store.
   *
   * @param partition The partition to add.
   * @return The new store formed by adding the window.
   */
  Self addPartition(P partition);

}
