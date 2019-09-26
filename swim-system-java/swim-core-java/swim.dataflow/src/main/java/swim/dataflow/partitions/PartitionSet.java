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

package swim.dataflow.partitions;

import java.util.Set;
import swim.collections.HashTrieSet;
import swim.streaming.windows.PartitionState;

/**
 * Simple partition state that keeps all partitions in a set.
 * @param <P> The type of the partitions.
 */
public class PartitionSet<P> implements PartitionState<P, PartitionSet<P>> {

  /**
   * The partition set.
   */
  private final HashTrieSet<P> partitions;

  public PartitionSet() {
    this(HashTrieSet.empty());
  }

  private PartitionSet(final HashTrieSet<P> parts) {
    partitions = parts;
  }

  @Override
  public Set<P> activePartitions() {
    return partitions;
  }

  @Override
  public PartitionSet<P> removePartition(final P partititon) {
    return new PartitionSet<>(partitions.removed(partititon));
  }

  @Override
  public PartitionSet<P> addPartition(final P partition) {
    return new PartitionSet<>(partitions.added(partition));
  }
}
