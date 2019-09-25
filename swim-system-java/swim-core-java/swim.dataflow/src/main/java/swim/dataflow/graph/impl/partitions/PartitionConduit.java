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

package swim.dataflow.graph.impl.partitions;

import java.util.HashSet;
import java.util.Set;
import swim.dataflow.connector.AbstractMapJunction;
import swim.dataflow.connector.MapView;
import swim.dataflow.connector.ValueToMapConduit;
import swim.dataflow.graph.persistence.MapPersister;
import swim.dataflow.graph.persistence.TrivialPersistenceProvider.TrivialMapPersister;
import swim.dataflow.graph.windows.PartitionAssigner;
import swim.dataflow.graph.windows.PartitionState;
import swim.structure.Form;
import swim.util.Deferred;

public class PartitionConduit<T, P, S extends PartitionState<P, S>>
    extends AbstractMapJunction<P, T> implements ValueToMapConduit<T, P, T> {

  private final MapPersister<P, T> persister;
  private final PartitionAssigner<T, P, S> partitions;
  private S partitionState;

  /**
   * @param partitionStrat The partition assignment strategy.
   * @param persister Persistent storage for the current state.
   */
  public PartitionConduit(final PartitionAssigner<T, P, S> partitionStrat,
                          final MapPersister<P, T> persister) {
    partitions = partitionStrat;
    partitionState = partitionStrat.stateFactory().get();
    this.persister = persister;
  }

  /**
   * @param partitionStrat The partition assignment strategy.
   * @param valForm        The form of the type of the values.
   */
  public PartitionConduit(final PartitionAssigner<T, P, S> partitionStrat,
                          final Form<T> valForm) {
    this(partitionStrat, new TrivialMapPersister<>(valForm));
  }

  @Override
  public void notifyChange(final Deferred<T> value) {
    final T val = value.get();
    final PartitionAssigner.Assignment<P, S> assignment = partitions.partitionsFor(val, partitionState);
    addToPartitions(val, assignment.partitions());
    final HashSet<P> toRemove = new HashSet<>(partitionState.activePartitions());
    toRemove.removeAll(assignment.updatedState().activePartitions());
    flushPartitions(toRemove);
    partitionState = assignment.updatedState();
  }

  /**
   * Update the latest value for every partition assigned to a value.
   *
   * @param value      The value.
   * @param partitions The assigned partitions.
   */
  private void addToPartitions(final T value, final Set<P> partitions) {
    for (final P part : partitions) {
      persister.put(part, value);
    }
    final Deferred<MapView<P, T>> mapView = Deferred.value(persister.get());
    for (final P part : partitions) {
      emit(part, Deferred.value(value), mapView);
    }
  }

  /**
   * A partition assigner is permitted to expire partitions. Remove all expired partitions from the map.
   *
   * @param partitions The set of expire partitions.
   */
  private void flushPartitions(final Set<P> partitions) {
    for (final P part : partitions) {
      if (persister.containsKey(part)) {
        persister.remove(part);
        emitRemoval(part, Deferred.value(persister.get()));
      }
    }
  }
}
