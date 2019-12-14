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

import java.util.function.BiFunction;
import java.util.function.ToLongFunction;
import swim.dataflow.connector.MapConduit;
import swim.dataflow.connector.MapJunction;
import swim.dataflow.connector.StatefulConduits;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.StreamInterpretation;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.persistence.MapPersister;
import swim.dataflow.graph.sampling.Sampling;
import swim.structure.Form;

/**
 * Stream of the intermediate results of apply an aggregation over a map stream, per key.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 * @param <U> The type of the results.
 */
class FoldedMapStream<K, V, U> extends AbstractMapStream<K, U> {

  private final MapSwimStream<K, V> in;
  private final U seed;
  private final BiFunction<U, V, U> foldFunction;
  private final Sampling sampling;
  private final boolean isTransient;

  /**
   * @param inputs      The source stream.
   * @param context     The instantiation context.
   * @param valForm     The form of the type of the results.
   * @param seedValue   The seed value for the aggregation.
   * @param foldOp     The aggregation operation.
   * @param sampleStrat The sampling strategy for the link.
   * @param isTransient Whether the state of this stream is stored persistently.
   */
  FoldedMapStream(final MapSwimStream<K, V> inputs,
                  final BindingContext context,
                  final Form<U> valForm,
                  final U seedValue,
                  final BiFunction<U, V, U> foldOp,
                  final Sampling sampleStrat,
                  final boolean isTransient) {
    super(inputs.keyForm(), valForm, context);
    in = inputs;
    seed = seedValue;
    foldFunction = foldOp;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  /**
   * @param inputs      The source stream.
   * @param context     The instantiation context.
   * @param valForm     The form of the type of the results.
   * @param seedValue   The seed value for the aggregation.
   * @param scanner     The aggregation operation.
   * @param sampleStrat The sampling strategy for the link.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param ts          Timestamp assignment for the values.
   */
  FoldedMapStream(final MapSwimStream<K, V> inputs,
                  final BindingContext context,
                  final Form<U> valForm,
                  final U seedValue,
                  final BiFunction<U, V, U> scanner,
                  final Sampling sampleStrat,
                  final boolean isTransient,
                  final ToLongFunction<U> ts) {
    super(inputs.keyForm(), valForm, context, ts);
    in = inputs;
    seed = seedValue;
    foldFunction = scanner;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  @Override
  public MapSwimStream<K, U> updateTimestamps(final ToLongFunction<U> datation) {
    return new FoldedMapStream<>(in, getContext(), valueForm(), seed, foldFunction, sampling, isTransient, datation);
  }

  @Override
  public MapJunction<K, U> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = StreamDecoupling.sampleMapStream(id(), context, context.createFor(in),
        sampling, StreamInterpretation.DISCRETE);
    final MapConduit<K, K, V, U> conduit;
    if (isTransient) {
      conduit = StatefulConduits.foldMap(seed, foldFunction);
    } else {
      final MapPersister<K, U> persister = context.getPersistenceProvider()
          .forMap(StateTags.stateTag(id()), keyForm(), valueForm(), seed);
      conduit = StatefulConduits.foldMapPersistent(persister, foldFunction);
    }
    source.subscribe(conduit);
    return conduit;
  }

}
