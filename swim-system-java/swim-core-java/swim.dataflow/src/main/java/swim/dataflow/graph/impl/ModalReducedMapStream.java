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
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.sampling.Sampling;
import swim.streamlet.Junction;
import swim.streamlet.MapJunction;
import swim.streamlet.MapJunction2;
import swim.streamlet.StatefulConduits;
import swim.streamlet.StreamInterpretation;
import swim.streamlet.persistence.MapPersister;
import swim.streamlet.persistence.ValuePersister;

/**
 * Accumulates the values associated with each key over time. The operation used to update the accumulation can be
 * controlled by a separate control stream.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 * @param <M> The type of the control values.
 */
class ModalReducedMapStream<K, V, M> extends AbstractMapStream<K, V> {

  private final MapSwimStream<K, V> in;
  private final Function<M, BinaryOperator<V>> modalOperator;
  private final SwimStream<M> controlStream;
  private final M init;
  private final Sampling sampling;
  private final boolean isTransient;

  /**
   * @param inputs      The source map stream.
   * @param context     The instantiation context.
   * @param op          The modal accumulation operator.
   * @param initialMode The initial value of the mode.
   * @param control     The control stream.
   * @param sampleStrat The sampling strategy for the link.
   * @param isTransient Whether the state of this stream is stored persistently.
   */
  ModalReducedMapStream(final MapSwimStream<K, V> inputs,
                        final BindingContext context,
                        final Function<M, BinaryOperator<V>> op,
                        final M initialMode,
                        final SwimStream<M> control,
                        final Sampling sampleStrat,
                        final boolean isTransient) {
    super(inputs.keyForm(), inputs.valueForm(), context);
    in = inputs;
    modalOperator = op;
    controlStream = control;
    init = initialMode;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  /**
   * @param inputs      The source map stream.
   * @param context     The instantiation context.
   * @param op          The modal accumulation operator.
   * @param initialMode The initial value of the mode.
   * @param control     The control stream.
   * @param sampleStrat The sampling strategy for the link.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param ts          Timestamp assignment for the values.
   */
  ModalReducedMapStream(final MapSwimStream<K, V> inputs,
                        final BindingContext context,
                        final Function<M, BinaryOperator<V>> op,
                        final M initialMode,
                        final SwimStream<M> control,
                        final Sampling sampleStrat,
                        final boolean isTransient,
                        final ToLongFunction<V> ts) {
    super(inputs.keyForm(), inputs.valueForm(), context, ts);
    in = inputs;
    modalOperator = op;
    controlStream = control;
    init = initialMode;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  @Override
  public MapSwimStream<K, V> updateTimestamps(final ToLongFunction<V> datation) {
    return new ModalReducedMapStream<>(in, getContext(), modalOperator, init, controlStream, sampling,
        isTransient, datation);
  }

  @Override
  public MapJunction<K, V> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = StreamDecoupling.sampleMapStream(id(), context, context.createFor(in),
        sampling, StreamInterpretation.DISCRETE);
    final Junction<M> modes = context.createFor(controlStream);
    final MapJunction2<K, K, V, V, M> conduit;
    if (isTransient) {
      conduit = StatefulConduits.modalReduceMap(init, modalOperator);
    } else {
      final ValuePersister<M> modePersister = context.getPersistenceProvider().forValue(StateTags.modeTag(id()),
          controlStream.form(), init);
      final MapPersister<K, V> statePersister = context.getPersistenceProvider().forMap(
          StateTags.stateTag(id()),
          keyForm(), valueForm(), null);
      conduit = StatefulConduits.modalReduceMap(modePersister, statePersister, modalOperator);
    }
    source.subscribe(conduit.first());
    modes.subscribe(conduit.second());
    return conduit;
  }

}
