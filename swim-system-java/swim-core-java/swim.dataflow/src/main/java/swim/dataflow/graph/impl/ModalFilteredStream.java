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

import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.ToLongFunction;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.streamlet.Junction;
import swim.streamlet.ModalFilteredConduit;
import swim.streamlet.persistence.ValuePersister;

/**
 * Stream where the values are filtered according to a variable predicate.
 *
 * @param <T> The type of the values.
 * @param <M> The type of the control stream for the predicate.
 */
class ModalFilteredStream<T, M> extends AbstractSwimStream<T> {

  private final SwimStream<T> in;
  private final M init;
  private final Function<M, Predicate<T>> switcher;
  private final SwimStream<M> control;
  private final boolean isTransient;

  /**
   * @param input         The stream of input values.
   * @param context       The stream initialization context.
   * @param initialMode   The initial control value.
   * @param predicate     The modal predicate.
   * @param controlStream A stream of control values.
   * @param isTransient Whether the state of this stream is stored persistently.
   */
  ModalFilteredStream(final SwimStream<T> input,
                      final BindingContext context,
                      final M initialMode,
                      final Function<M, Predicate<T>> predicate,
                      final SwimStream<M> controlStream,
                      final boolean isTransient) {
    super(input.form(), context);
    in = input;
    init = initialMode;
    switcher = predicate;
    control = controlStream;
    this.isTransient = isTransient;
  }

  ModalFilteredStream(final SwimStream<T> input,
                      final BindingContext context,
                      final M initialMode,
                      final Function<M, Predicate<T>> predicate,
                      final SwimStream<M> controlStream,
                      final boolean isTransient,
                      final ToLongFunction<T> ts) {
    super(input.form(), context, ts);
    in = input;
    init = initialMode;
    switcher = predicate;
    control = controlStream;
    this.isTransient = isTransient;
  }

  @Override
  public SwimStream<T> updateTimestamps(final ToLongFunction<T> datation) {
    return new ModalFilteredStream<>(in, getContext(), init, switcher, control, isTransient, datation);
  }

  @Override
  public Junction<T> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<T> source = context.createFor(in);
    final Junction<M> modes = context.createFor(control);
    final ModalFilteredConduit<T, M> junction;
    if (isTransient) {
      junction = new ModalFilteredConduit<>(init, switcher);
    } else {
      final ValuePersister<M> modePersister = context.getPersistenceProvider().forValue(
          StateTags.modeTag(id()), control.form(), init);
      junction = new ModalFilteredConduit<>(modePersister, switcher);
    }
    source.subscribe(junction.first());
    modes.subscribe(junction.second());
    return junction;
  }
}
