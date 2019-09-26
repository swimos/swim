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

import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.streaming.Junction;
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.persistence.ValuePersister;
import swim.streaming.sampling.Sampling;
import swim.streamlet.Junction2;
import swim.streamlet.StatefulStreamlets;
import swim.streamlet.StreamInterpretation;

/**
 * Reduces the values of the stream over time. The operation used to update the reduction can be controlled by a
 * separate control stream.
 *
 * @param <T> The type of the values.
 * @param <M> The type of the control stream.
 */
class ModalReducedStream<T, M> extends AbstractSwimStream<T> {

  private final SwimStream<T> in;
  private final M initialMode;
  private final Function<M, BinaryOperator<T>> modalOperator;
  private final SwimStream<M> controlStream;
  private final Sampling sampling;
  private final boolean isTransient;

  /**
   * @param inputs      The source stream.
   * @param context     The instantiation context.
   * @param initial     The initial mode.
   * @param op          The modal accumulation operator.
   * @param sampleStrat The sampling strategy for the link.
   * @param control     The control stream.
   * @param isTransient Whether the state of this stream is stored persistently.
   */
  ModalReducedStream(final SwimStream<T> inputs,
                     final BindingContext context,
                     final M initial,
                     final Function<M, BinaryOperator<T>> op,
                     final Sampling sampleStrat,
                     final SwimStream<M> control,
                     final boolean isTransient) {
    super(inputs.form(), context);
    in = inputs;
    modalOperator = op;
    controlStream = control;
    initialMode = initial;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  /**
   * @param inputs      The source stream.
   * @param context     The instantiation context.
   * @param initial     The initial mode.
   * @param op          The modal accumulation operator.
   * @param sampleStrat The sampling strategy for the link.
   * @param control     The control stream.
   * @param ts          Timestamp assigner for the link.
   * @param isTransient Whether the state of this stream is stored persistently.
   */
  ModalReducedStream(final SwimStream<T> inputs,
                     final BindingContext context,
                     final M initial,
                     final Function<M, BinaryOperator<T>> op,
                     final Sampling sampleStrat,
                     final SwimStream<M> control,
                     final boolean isTransient,
                     final ToLongFunction<T> ts) {
    super(inputs.form(), context, ts);
    in = inputs;
    modalOperator = op;
    controlStream = control;
    initialMode = initial;
    sampling = sampleStrat;
    this.isTransient = isTransient;
  }

  @Override
  public SwimStream<T> updateTimestamps(final ToLongFunction<T> datation) {
    return new ModalReducedStream<>(in, getContext(), initialMode, modalOperator, sampling, controlStream,
        isTransient, datation);
  }

  @Override
  public Junction<T> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<T> source = StreamDecoupling.sampleStream(id(), context, context.createFor(in),
        sampling, StreamInterpretation.DISCRETE);
    final Junction<M> control = context.createFor(controlStream);
    final Junction2<T, M, T> junction;
    if (isTransient) {
      junction = StatefulStreamlets.modalReduce(initialMode, modalOperator);
    } else {
      final ValuePersister<M> modePersister = context.getPersistenceProvider().forValue(
          StateTags.modeTag(id()), controlStream.form(), initialMode);
      final ValuePersister<T> statePersister = context.getPersistenceProvider().forValue(
          StateTags.stateTag(id()), form(), null);
      junction = StatefulStreamlets.modalReduce(modePersister, statePersister, modalOperator);
    }
    source.subscribe(junction.first());
    control.subscribe(junction.second());
    return junction;
  }

}
