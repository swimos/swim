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
import java.util.function.ToLongFunction;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.streamlet.Junction;
import swim.streamlet.MapJunction;
import swim.streamlet.VariableDelayMapJunction;
import swim.streamlet.persistence.ListPersister;
import swim.streamlet.persistence.PersistenceProvider;
import swim.streamlet.persistence.SetPersister;
import swim.structure.Form;
import swim.util.Require;

/**
 * Stream that, interpreting its input as a sequence of discrete samples, will return the value received a variable
 * number of samples back from the most recent sample, for each key.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
final class VariableDelayedMapStream<K, V> extends AbstractMapStream<K, V> {
  private final MapSwimStream<K, V> in;
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
  VariableDelayedMapStream(final MapSwimStream<K, V> in,
                           final BindingContext context,
                           final SwimStream<Integer> delays,
                           final int init,
                           final boolean isTransient) {
    super(in.keyForm(), in.valueForm(), context);
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
  VariableDelayedMapStream(final MapSwimStream<K, V> in,
                           final BindingContext context,
                           final SwimStream<Integer> delays,
                           final int init,
                           final boolean isTransient,
                           final ToLongFunction<V> ts) {
    super(in.keyForm(), in.valueForm(), context, ts);
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
  public MapSwimStream<K, V> updateTimestamps(final ToLongFunction<V> datation) {
    return new VariableDelayedMapStream<>(in, getContext(), delays, init, isTransient, datation);
  }

  @Override
  public MapJunction<K, V> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = context.createFor(in);
    final Junction<Integer> control = context.createFor(delays);
    final VariableDelayMapJunction<K, V> junction;
    if (isTransient) {
      junction = new VariableDelayMapJunction<>(init);
    } else {
      final PersistenceProvider perProvider = context.getPersistenceProvider();
      final Form<K> kForm = keyForm();
      final Form<V> vForm = valueForm();
      final Function<K, ListPersister<V>> bufferPeristers = k -> perProvider.forList(
          StateTags.keyedStateTag(id(), kForm.mold(k).toValue()), vForm);
      final SetPersister<K> keysPersister = perProvider.forSet(StateTags.stateTag(id()), kForm);
      junction = new VariableDelayMapJunction<>(bufferPeristers, keysPersister,
          perProvider.forValue(StateTags.modeTag(id()), Form.forInteger(), init));
    }
    source.subscribe(junction.first());
    control.subscribe(junction.second());
    return junction;
  }
}
