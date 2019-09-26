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
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.streaming.Junction;
import swim.streaming.MapJunction;
import swim.streaming.MapSwimStream;
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.persistence.MapPersister;
import swim.streaming.persistence.ValuePersister;
import swim.streaming.sampling.Sampling;
import swim.streamlet.MapJunction2;
import swim.streamlet.StatefulConduits;
import swim.streamlet.StreamInterpretation;
import swim.structure.Form;

/**
 * Stream of rolling aggregate values over another map stream. The operation that is applied can be modified with an
 * independent control stream.
 *
 * @param <K> The key type of the input stream.
 * @param <V> The value type of the input stream.
 * @param <U> The value type of the outputs.
 * @param <M> The type of the control stream.
 */
class ModalFoldedMapStream<K, V, U, M> extends AbstractMapStream<K, U> {
  private final MapSwimStream<K, V> in;
  private final U seed;
  private final M init;
  private final Function<M, BiFunction<U, V, U>> modalFoldFunction;
  private final SwimStream<M> controlStream;
  private final Sampling sampling;
  private final boolean isTransient;

  /**
   * @param inputs      The source stream.
   * @param context     The instantiation context.
   * @param valForm     The form of the type of the output values.
   * @param seedValue   The seed value for the aggregation.
   * @param initialMode The initial value of the mode.
   * @param folder     The aggregation operation.
   * @param control     The control stream.
   * @param sampleStrat The sampling strategy for the link.
   * @param isTransient Whether the state of this stream is stored persistently.
   */
  ModalFoldedMapStream(final MapSwimStream<K, V> inputs,
                       final BindingContext context,
                       final Form<U> valForm,
                       final U seedValue,
                       final M initialMode,
                       final Function<M, BiFunction<U, V, U>> folder,
                       final SwimStream<M> control,
                       final Sampling sampleStrat,
                       final boolean isTransient) {
    super(inputs.keyForm(), valForm, context);
    in = inputs;
    seed = seedValue;
    modalFoldFunction = folder;
    controlStream = control;
    init = initialMode;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  /**
   * @param inputs      The source stream.
   * @param context     The instantiation context.
   * @param valForm     The form of the type of the output values.
   * @param seedValue   The seed value for the aggregation.
   * @param initialMode The initial value of the mode.
   * @param folder     The aggregation operation.
   * @param control     The control stream.
   * @param sampleStrat The sampling strategy for the link.
   * @param ts          Timestamp assignment for the values.
   * @param isTransient Whether the state of this stream is stored persistently.
   */
  ModalFoldedMapStream(final MapSwimStream<K, V> inputs,
                       final BindingContext context,
                       final Form<U> valForm,
                       final U seedValue,
                       final M initialMode,
                       final Function<M, BiFunction<U, V, U>> folder,
                       final SwimStream<M> control,
                       final Sampling sampleStrat,
                       final boolean isTransient,
                       final ToLongFunction<U> ts) {
    super(inputs.keyForm(), valForm, context, ts);
    in = inputs;
    seed = seedValue;
    modalFoldFunction = folder;
    controlStream = control;
    init = initialMode;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  @Override
  public MapSwimStream<K, U> updateTimestamps(final ToLongFunction<U> datation) {
    return new ModalFoldedMapStream<>(in, getContext(), valueForm(), seed, init, modalFoldFunction,
        controlStream, sampling, isTransient, datation);
  }

  @Override
  public MapJunction<K, U> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = StreamDecoupling.sampleMapStream(id(), context, context.createFor(in),
        sampling, StreamInterpretation.DISCRETE);
    final Junction<M> control = context.createFor(controlStream);
    final MapJunction2<K, K, V, U, M> conduit;
    if (isTransient) {
      conduit = StatefulConduits.modalFoldMap(init, seed, modalFoldFunction);
    } else {
      final ValuePersister<M> modePersister = context.getPersistenceProvider().forValue(StateTags.modeTag(id()),
          controlStream.form(), init);
      final MapPersister<K, U> statePersister = context.getPersistenceProvider().forMap(
          StateTags.stateTag(id()),
          keyForm(), valueForm(), seed);
      conduit = StatefulConduits.modalFoldMap(modePersister, statePersister, modalFoldFunction);
    }
    source.subscribe(conduit.first());
    control.subscribe(conduit.second());
    return conduit;
  }

}
