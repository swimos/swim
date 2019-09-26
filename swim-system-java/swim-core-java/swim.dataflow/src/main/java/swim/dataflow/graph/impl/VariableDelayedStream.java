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

import java.util.function.ToLongFunction;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.streamlet.Junction;
import swim.streamlet.VariableDelayJunction;
import swim.streamlet.persistence.ListPersister;
import swim.streamlet.persistence.ValuePersister;
import swim.structure.Form;
import swim.util.Require;

/**
 * Stream that, interpreting its input as a sequence of discrete samples, will return the value received a variable
 * number of samples back from the most recent sample.
 *
 * @param <T> The type of the values.
 */
class VariableDelayedStream<T> extends AbstractSwimStream<T> {

  private final SwimStream<T> in;
  private final SwimStream<Integer> delays;
  private final int init;
  private final boolean isTransient;

  /**
   * @param in          The source stream.
   * @param context     The instantiation context.
   * @param delays      Stream of number of samples of delay.
   * @param init        The initial number of samples of delay.
   * @param isTransient Whether to store the buffer of samples persistently.
   */
  VariableDelayedStream(final SwimStream<T> in,
                        final BindingContext context,
                        final SwimStream<Integer> delays,
                        final int init,
                        final boolean isTransient) {
    super(in.form(), context);
    validate(init);
    this.in = in;
    this.delays = delays;
    this.init = init;
    this.isTransient = isTransient;
  }

  /**
   * @param in          The source stream.
   * @param context     The instantiation context.
   * @param delays      Stream of number of samples of delay.
   * @param init        The initial number of samples of delay.
   * @param isTransient Whether to store the buffer of samples persistently.
   * @param ts          Assigns timestamps to the values.
   */
  VariableDelayedStream(final SwimStream<T> in,
                        final BindingContext context,
                        final SwimStream<Integer> delays,
                        final int init,
                        final boolean isTransient,
                        final ToLongFunction<T> ts) {
    super(in.form(), context, ts);
    validate(init);
    this.in = in;
    this.delays = delays;
    this.init = init;
    this.isTransient = isTransient;
  }

  private static void validate(final int steps) {
    Require.that(steps > 1, "Delay must be at least 1");
  }

  @Override
  public SwimStream<T> updateTimestamps(final ToLongFunction<T> datation) {
    return new VariableDelayedStream<>(in, getContext(), delays, init, isTransient, datation);
  }

  @Override
  public Junction<T> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<T> source = context.createFor(in);
    final Junction<Integer> control = context.createFor(delays);
    final VariableDelayJunction<T> junction;
    if (isTransient) {
      junction = new VariableDelayJunction<>(init);
    } else {
      final ListPersister<T> listPersister = context.getPersistenceProvider()
          .forList(StateTags.stateTag(id()), form());
      final ValuePersister<Integer> delayPersister = context.getPersistenceProvider().forValue(StateTags.modeTag(id()),
          Form.forInteger().unit(init));

      junction = new VariableDelayJunction<>(listPersister, delayPersister);
    }

    source.subscribe(junction.first());
    control.subscribe(junction.second());
    return junction;
  }
}
