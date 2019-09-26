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

package swim.dataflow;

import java.util.function.BiFunction;
import java.util.function.BinaryOperator;
import java.util.function.ToLongFunction;
import swim.streaming.Junction;
import swim.streaming.MapJunction;
import swim.streaming.MapSwimStream;
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.sampling.Sampling;
import swim.streamlet.ReduceFieldsStreamlet;
import swim.streamlet.StreamInterpretation;
import swim.structure.Form;

/**
 * Maintain an instantaneous reduced view of the values of a map stream, for all keys.
 *
 * @param <K> The key type of the map stream.
 * @param <V> The value type of the map stream.
 * @param <U> The type of the output of the reduction.
 */
class ReducedByEntriesMapStream<K, V, U> extends AbstractSwimStream<U> {

  private final MapSwimStream<K, V> in;
  private final U seed;
  private final BiFunction<U, ? super V, U> operation;
  private final BinaryOperator<U> combiner;
  private final Sampling sampling;

  /**
   * @param input         The source map stream.
   * @param context       The instantiation context.
   * @param seedValue     The seed value for the reduction.
   * @param op            The reduction operation.
   * @param combine       Combiner for intermediate results.
   * @param form          The form of the type of the outputs.
   * @param samplingStrat The sampling strategy for the link.
   */
  ReducedByEntriesMapStream(final MapSwimStream<K, V> input,
                            final BindingContext context,
                            final U seedValue,
                            final BiFunction<U, ? super V, U> op,
                            final BinaryOperator<U> combine, final Form<U> form,
                            final Sampling samplingStrat) {
    super(form, context);
    seed = seedValue;
    in = input;
    operation = op;
    combiner = combine;
    sampling = samplingStrat;
  }

  /**
   * @param input         The source map stream.
   * @param context       The instantiation context.
   * @param seedValue     The seed value for the reduction.
   * @param op            The reduction operation.
   * @param combine       Combiner for intermediate results.
   * @param form          The form of the type of the outputs.
   * @param samplingStrat The sampling strategy for the link.
   * @param ts            Timestamp assigner for the stream.
   */
  ReducedByEntriesMapStream(final MapSwimStream<K, V> input,
                            final BindingContext context,
                            final U seedValue,
                            final BiFunction<U, ? super V, U> op,
                            final BinaryOperator<U> combine, final Form<U> form,
                            final Sampling samplingStrat,
                            final ToLongFunction<U> ts) {
    super(form, context, ts);
    seed = seedValue;
    in = input;
    operation = op;
    combiner = combine;
    sampling = samplingStrat;
  }

  @Override
  public SwimStream<U> updateTimestamps(final ToLongFunction<U> datation) {
    return new ReducedByEntriesMapStream<>(in, getContext(), seed, operation, combiner, form(), sampling);
  }

  @Override
  public Junction<U> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = StreamDecoupling.sampleMapStream(id(), context,
        context.createFor(in), sampling, StreamInterpretation.DISCRETE);
    final ReduceFieldsStreamlet<K, V, U> streamlet = new ReduceFieldsStreamlet<>(seed, operation, combiner);
    source.subscribe(streamlet);
    return streamlet;
  }

}
