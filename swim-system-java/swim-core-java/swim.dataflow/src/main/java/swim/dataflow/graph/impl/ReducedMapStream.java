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

package swim.dataflow.graph.impl;

import java.util.function.BinaryOperator;
import java.util.function.ToLongFunction;
import swim.dataflow.connector.MapConduit;
import swim.dataflow.connector.MapJunction;
import swim.dataflow.connector.StatefulConduits;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.persistence.MapPersister;
import swim.dataflow.graph.sampling.Sampling;

/**
 * Accumulates the values associated with each key over time.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
final class ReducedMapStream<K, V> extends AbstractMapStream<K, V> {
  private final MapSwimStream<K, V> in;
  private final BinaryOperator<V> operator;
  private final Sampling sampling;
  private final boolean isTransient;

  /**
   * @param inputs      The input stream.
   * @param context     Instantiation context.
   * @param op          Operation to apply on each new value and the previous state of the accumulation.
   * @param sampleStrat Sampling strategy for the link.
   * @param isTransient Whether the state of this stream is stored persistently.
   */
  ReducedMapStream(final MapSwimStream<K, V> inputs,
                   final BindingContext context,
                   final BinaryOperator<V> op,
                   final Sampling sampleStrat,
                   final boolean isTransient) {
    super(inputs.keyForm(), inputs.valueForm(), context);
    in = inputs;
    operator = op;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  /**
   * @param inputs      The input stream.
   * @param context     Instantiation context.
   * @param op          Operation to apply on each new value and the previous state of the accumulation.
   * @param sampleStrat Sampling strategy for the link.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param ts          Timestamp assignment for the values.
   */
  ReducedMapStream(final MapSwimStream<K, V> inputs,
                   final BindingContext context,
                   final BinaryOperator<V> op,
                   final Sampling sampleStrat,
                   final boolean isTransient,
                   final ToLongFunction<V> ts) {
    super(inputs.keyForm(), inputs.valueForm(), context, ts);
    in = inputs;
    operator = op;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  @Override
  public MapSwimStream<K, V> updateTimestamps(final ToLongFunction<V> datation) {
    return new ReducedMapStream<>(in, getContext(), operator, sampling, isTransient, datation);
  }

  @Override
  public MapJunction<K, V> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = context.createFor(in);
    final MapConduit<K, K, V, V> conduit;
    if (isTransient) {
      conduit = StatefulConduits.reduceMap(operator);
    } else {
      final MapPersister<K, V> statePersister = context.getPersistenceProvider()
          .forMap(StateTags.stateTag(id()), keyForm(), valueForm(), null);
      conduit = StatefulConduits.reduceMap(statePersister, operator);
    }
    source.subscribe(conduit);
    return conduit;
  }
}
