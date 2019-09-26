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

import java.util.function.ToLongFunction;
import swim.streaming.Junction;
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.persistence.ListPersister;
import swim.streamlet.DelayConduit;
import swim.util.Require;

/**
 * Stream that, interpreting its input as a sequence of discrete samples, will return the value received a fixed
 * number of samples back from the most recent sample.
 *
 * @param <T> The type of the values.
 */
public class DelayedStream<T> extends AbstractSwimStream<T> {

  private final SwimStream<T> in;
  private final int steps;
  private final boolean isTransient;

  /**
   * @param in          The source stream.
   * @param con         The instantiation context.
   * @param steps       Number of samples of delay.
   * @param isTransient Whether to store the buffer of samples persistently.
   */
  DelayedStream(final SwimStream<T> in, final BindingContext con,
                final int steps,
                final boolean isTransient) {
    super(in.form(), con);
    validate(steps);
    this.in = in;
    this.steps = steps;
    this.isTransient = isTransient;
  }

  private static void validate(final int steps) {
    Require.that(steps > 1, "Delay must be at least 1");
  }

  /**
   * @param in          The source stream.
   * @param con         The instantiation context.
   * @param steps       Number of samples of delay.
   * @param isTransient Whether to store the buffer of samples persistently.
   * @param ts          Assigns timestamps to the values.
   */
  DelayedStream(final SwimStream<T> in, final BindingContext con,
                final int steps,
                final boolean isTransient,
                final ToLongFunction<T> ts) {
    super(in.form(), con, ts);
    validate(steps);
    this.in = in;
    this.steps = steps;
    this.isTransient = isTransient;
  }

  @Override
  public SwimStream<T> updateTimestamps(final ToLongFunction<T> datation) {
    return new DelayedStream<>(in, getContext(), steps, isTransient, datation);
  }

  @Override
  public Junction<T> instantiate(final SwimStreamContext.InitContext context) {

    final Junction<T> source = context.createFor(in);
    final DelayConduit<T> conduit;

    if (isTransient) {
      conduit = new DelayConduit<>(steps);
    } else {
      final ListPersister<T> persister = context.getPersistenceProvider().forList(StateTags.stateTag(id()), form());
      conduit = new DelayConduit<>(persister, steps);
    }
    source.subscribe(conduit);
    return conduit;
  }
}
