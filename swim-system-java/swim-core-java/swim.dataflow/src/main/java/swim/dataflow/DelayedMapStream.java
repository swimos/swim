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

import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.streaming.MapJunction;
import swim.streaming.MapSwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.persistence.ListPersister;
import swim.streaming.persistence.PersistenceProvider;
import swim.streaming.persistence.SetPersister;
import swim.streamlet.DelayMapConduit;
import swim.structure.Form;
import swim.util.Require;

/**
 * Stream that, interpreting its input as a sequence of discrete samples, will return the value received a fixed
 * number of samples back from the most recent sample, for each key.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
class DelayedMapStream<K, V> extends AbstractMapStream<K, V> {

  private final MapSwimStream<K, V> in;
  private final int steps;
  private final boolean isTransient;

  /**
   * @param in          The source stream.
   * @param con         The instantiation context.
   * @param steps       Number of samples of delay.
   * @param isTransient Whether to store the buffer of samples persistently.
   */
  DelayedMapStream(final MapSwimStream<K, V> in, final BindingContext con,
                   final int steps,
                   final boolean isTransient) {
    super(in.keyForm(), in.valueForm(), con);
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
  DelayedMapStream(final MapSwimStream<K, V> in, final BindingContext con,
                   final int steps,
                   final boolean isTransient,
                   final ToLongFunction<V> ts) {
    super(in.keyForm(), in.valueForm(), con, ts);
    validate(steps);
    this.in = in;
    this.steps = steps;
    this.isTransient = isTransient;
  }

  @Override
  public MapSwimStream<K, V> updateTimestamps(final ToLongFunction<V> datation) {
    return new DelayedMapStream<>(in, getContext(), steps, isTransient, datation);
  }

  @Override
  public MapJunction<K, V> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = context.createFor(in);
    final DelayMapConduit<K, V> conduit;
    if (isTransient) {
      conduit = new DelayMapConduit<>(steps);
    } else {
      final PersistenceProvider perProvider = context.getPersistenceProvider();
      final Form<K> kForm = keyForm();
      final Form<V> vForm = valueForm();
      final Function<K, ListPersister<V>> bufferPeristers = k -> perProvider.forList(
          StateTags.keyedStateTag(id(), kForm.mold(k).toValue()), vForm);
      final SetPersister<K> keysPersister = perProvider.forSet(StateTags.stateTag(id()), kForm);
      conduit = new DelayMapConduit<>(bufferPeristers, keysPersister, steps);
    }
    source.subscribe(conduit);
    return conduit;
  }
}
