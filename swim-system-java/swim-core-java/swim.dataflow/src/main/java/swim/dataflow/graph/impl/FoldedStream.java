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
import swim.dataflow.connector.Conduit;
import swim.dataflow.connector.Junction;
import swim.dataflow.connector.StatefulConduits;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.StreamInterpretation;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.persistence.ValuePersister;
import swim.dataflow.graph.sampling.Sampling;
import swim.structure.Form;

/**
 * Stream of the intermediate results of apply an aggregation over a stream.
 *
 * @param <T> The type of the values.
 * @param <U> The type of the results.
 */
class FoldedStream<T, U> extends AbstractSwimStream<U> {

  private final SwimStream<T> in;
  private final U seed;
  private final BiFunction<U, T, U> foldFunction;
  private final Sampling sampling;
  private final boolean isTransient;

  /**
   * @param inputs      The source stream.
   * @param context     The instantiation context.
   * @param valForm     The form of the type of the outputs.
   * @param seedValue   The seed value for the aggregation.
   * @param scanner     The aggregation operation.
   * @param sampleStrat Sampling strategy for the link.
   * @param isTransient Whether the state of this stream is stored persistently.
   */
  FoldedStream(final SwimStream<T> inputs,
               final BindingContext context,
               final Form<U> valForm,
               final U seedValue,
               final BiFunction<U, T, U> scanner,
               final Sampling sampleStrat,
               final boolean isTransient) {
    super(valForm, context);
    in = inputs;
    seed = seedValue;
    foldFunction = scanner;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  /**
   * @param inputs      The source stream.
   * @param context     The instantiation context.
   * @param valForm     The form of the type of the outputs.
   * @param seedValue   The seed value for the aggregation.
   * @param folder     The aggregation operation.
   * @param sampleStrat Sampling strategy for the link.
   * @param ts          Timestamp assigner for the stream.
   */
  FoldedStream(final SwimStream<T> inputs,
               final BindingContext context,
               final Form<U> valForm,
               final U seedValue,
               final BiFunction<U, T, U> folder,
               final Sampling sampleStrat,
               final boolean isTransient,
               final ToLongFunction<U> ts) {
    super(valForm, context, ts);
    in = inputs;
    seed = seedValue;
    foldFunction = folder;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  @Override
  public SwimStream<U> updateTimestamps(final ToLongFunction<U> datation) {
    return new FoldedStream<>(in, getContext(), form(), seed, foldFunction, sampling, isTransient, datation);
  }

  @Override
  public Junction<U> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<T> source = StreamDecoupling.sampleStream(id(), context, context.createFor(in),
        sampling, StreamInterpretation.DISCRETE);
    final Conduit<T, U> foldConduit;
    if (isTransient) {
      foldConduit = StatefulConduits.fold(seed, foldFunction);
    } else {
      final ValuePersister<U> persister = context.getPersistenceProvider().forValue(
          StateTags.stateTag(id()), form(), seed);
      foldConduit = StatefulConduits.foldPersistent(persister, foldFunction);
    }
    source.subscribe(foldConduit);
    return foldConduit;
  }

}
