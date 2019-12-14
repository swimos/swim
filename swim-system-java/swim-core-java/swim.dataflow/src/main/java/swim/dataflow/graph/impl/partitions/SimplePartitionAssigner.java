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

import java.util.Collections;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Supplier;
import swim.dataflow.graph.windows.PartitionAssigner;
import swim.dataflow.graph.windows.PartitionState;

/**
 * Trivial partition assignment that adds new partitions to the state and never removes them.
 * @param <T> The type of the values.
 * @param <P> The type of the partitions.
 * @param <S> The type of the partition state.
 */
public class SimplePartitionAssigner<T, P, S extends PartitionState<P, S>> implements PartitionAssigner<T, P, S> {

  private final Function<T, Set<P>> partFun;

  private final Supplier<S> fac;

  /**
   * @param parts Function to assign partitions to values.
   * @param stateFac Factory to create the empty state.
   */
  public SimplePartitionAssigner(final Function<T, Set<P>> parts, final Supplier<S> stateFac) {
    partFun = parts;
    fac = stateFac;
  }

  @Override
  public Supplier<S> stateFactory() {
    return fac;
  }

  @Override
  public Assignment<P, S> partitionsFor(final T data, final S active) {
    final Set<P> parts = partFun.apply(data);
    S newStateAcc = active;
    for (final P part : parts) {
      newStateAcc = newStateAcc.addPartition(part);
    }
    final S newState = newStateAcc;
    return new Assignment<P, S>() {
      @Override
      public Set<P> partitions() {
        return parts;
      }

      @Override
      public S updatedState() {
        return newState;
      }
    };
  }

  /**
   * Create an assigner that assigns multiple partitions to each value and stores them in a simple set.
   * @param f The assignment.
   * @param <T> The type of the values.
   * @param <P> The type of the partitions.
   * @return The assigner.
   */
  public static <T, P> SimplePartitionAssigner<T, P, PartitionSet<P>> ofMulti(final Function<T, Set<P>> f) {
    return new SimplePartitionAssigner<>(f, PartitionSet::new);
  }

  /**
   * Create an assigner that assigns a single partition to each value and stores them in a simple set.
   * @param f The assignment.
   * @param <T> The type of the values.
   * @param <P> The type of the partitions.
   * @return The assigner.
   */
  public static <T, P> SimplePartitionAssigner<T, P, PartitionSet<P>> of(final Function<T, P> f) {
    return new SimplePartitionAssigner<>(f.andThen(Collections::singleton), PartitionSet::new);
  }
}
