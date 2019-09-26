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
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.persistence.ValuePersister;
import swim.streaming.sampling.Sampling;
import swim.streamlet.Junction2;
import swim.streamlet.StatefulConduits;
import swim.streamlet.StreamInterpretation;
import swim.structure.Form;

/**
 * Stream of rolling aggregate values over another stream. The operation that is applied can be modified with an
 * independent control stream.
 *
 * @param <T> The type of the inputs.
 * @param <U> The type of the outputs.
 * @param <M> The type of the control stream.
 */
class ModalFoldedStream<T, U, M> extends AbstractSwimStream<U> {

  private final SwimStream<T> in;
  private final M initialMode;
  private final U seed;
  private final Function<M, BiFunction<U, T, U>> modalFoldFunction;
  private final SwimStream<M> controlStream;
  private final Sampling sampling;
  private final boolean isTransient;

  /**
   * @param inputs      The source stream.
   * @param context     The instantiation context.
   * @param initial     The initial mode.
   * @param valForm     The form of the type of the outputs.
   * @param seedValue   The seed value for the aggregation.
   * @param folder     The aggregation operation.
   * @param sampleStrat The sampling strategy for the link.
   * @param control     The control stream.
   * @param isTransient Whether the state of this stream is stored persistently.
   */
  ModalFoldedStream(final SwimStream<T> inputs,
                    final BindingContext context,
                    final M initial,
                    final Form<U> valForm,
                    final U seedValue,
                    final Function<M, BiFunction<U, T, U>> folder,
                    final Sampling sampleStrat,
                    final SwimStream<M> control,
                    final boolean isTransient) {
    super(valForm, context);
    in = inputs;
    seed = seedValue;
    modalFoldFunction = folder;
    controlStream = control;
    initialMode = initial;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  /**
   * @param inputs      The source stream.
   * @param context     The instantiation context.
   * @param initial     The initial mode.
   * @param valForm     The form of the type of the outputs.
   * @param seedValue   The seed value for the aggregation.
   * @param folder     The aggregation operation.
   * @param sampleStrat The sampling strategy for the link.
   * @param control     The control stream.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param ts          Timestamp assigner for the stream.
   */
  ModalFoldedStream(final SwimStream<T> inputs,
                    final BindingContext context,
                    final M initial,
                    final Form<U> valForm,
                    final U seedValue,
                    final Function<M, BiFunction<U, T, U>> folder,
                    final Sampling sampleStrat,
                    final SwimStream<M> control,
                    final boolean isTransient,
                    final ToLongFunction<U> ts) {
    super(valForm, context, ts);
    in = inputs;
    seed = seedValue;
    modalFoldFunction = folder;
    controlStream = control;
    initialMode = initial;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  @Override
  public SwimStream<U> updateTimestamps(final ToLongFunction<U> datation) {
    return new ModalFoldedStream<>(in, getContext(), initialMode, form(),
        seed, modalFoldFunction, sampling, controlStream, isTransient, datation);
  }

  @Override
  public Junction<U> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<T> source = StreamDecoupling.sampleStream(id(), context,
        context.createFor(in), sampling, StreamInterpretation.DISCRETE);
    final Junction<M> control = context.createFor(controlStream);
    final Junction2<T, M, U> junction;
    if (isTransient) {
      junction = StatefulConduits.modalFold(initialMode, seed, modalFoldFunction);
    } else {
      final ValuePersister<M> modePersister = context.getPersistenceProvider().forValue(
          StateTags.modeTag(id()), controlStream.form(), initialMode);
      final ValuePersister<U> statePersister = context.getPersistenceProvider().forValue(
          StateTags.stateTag(id()), form(), seed);
      junction = StatefulConduits.modalFold(modePersister, statePersister, modalFoldFunction);
    }
    source.subscribe(junction.first());
    control.subscribe(junction.second());
    return junction;
  }

}
