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

package swim.streamlet;

import java.util.function.BiFunction;
import java.util.function.BinaryOperator;
import swim.collections.BTreeMap;
import swim.streaming.MapView;
import swim.util.Deferred;

/**
 * Reduces the entries of a map to a sequence of values for each update/removal.
 * @param <Key> The type of the map keys.
 * @param <Value> The type of the map values.
 * @param <Out> The reduced output type.
 */
public class ReduceFieldsConduit<Key, Value, Out> extends AbstractJunction<Out> implements MapToValueConduit<Key, Value, Out> {

  private BTreeMap<Key, Value, Out> state = BTreeMap.empty();
  private final Out seed;
  private final BiFunction<Out, ? super Value, Out> operation;
  private final BinaryOperator<Out> combiner;

  /**
   * @param seed Seed value for an empty map.
   * @param operation Add a contribution into the reduction.
   * @param combiner Combine together two sub-reductions.
   */
  public ReduceFieldsConduit(final Out seed,
                             final BiFunction<Out, ? super Value, Out> operation,
                             final BinaryOperator<Out> combiner) {
    this.seed = seed;
    this.operation = operation;
    this.combiner = combiner;
  }

  @Override
  public void notifyChange(final Key key, final Deferred<Value> value, final Deferred<MapView<Key, Value>> map) {
    state = state.updated(key, value.get());
    emitReduced();
  }

  private void emitReduced() {
    final BTreeMap<Key, Value, Out> current = state;
    emit(() -> current.reduced(seed, operation::apply, combiner::apply));
  }

  @Override
  public void notifyRemoval(final Key key, final Deferred<MapView<Key, Value>> map) {
    state = state.removed(key);
    emitReduced();
  }
}
