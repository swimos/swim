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

package swim.dataflow.graph.windows;

import java.util.Set;

/**
 * A combined store for partition and window labels.
 *
 * @param <P> The type of the partitions.
 * @param <W> The type of the windows.
 * @param <Self> The type of the implementing class.
 */
public interface CombinedState<P, W, Self> extends PartitionState<P, Self> {

  /**
   * Get the open windows in a partition.
   *
   * @param part The partition.
   * @return The set of open windows.
   */
  Set<W> openWindows(P part);

}
