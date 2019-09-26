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
import swim.streaming.MapJunction;
import swim.streaming.MapSwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.persistence.MapPersister;
import swim.streamlet.FirstValueMapConduit;

/**
 * A stream that will only ever contain the first value received from its source for each key.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
class FirstMapStream<K, V> extends AbstractMapStream<K, V> {

  private final MapSwimStream<K, V> in;
  private final boolean resetOnRemoval;
  private final boolean isTransient;

  /**
   * @param in          The input stream.
   * @param context         The instantiation context.
   * @param resetOnRemoval Whether the first value resets on key removal.
   * @param isTransient Whether to persist the first value.
   */
  FirstMapStream(final MapSwimStream<K, V> in, final BindingContext context,
                 final boolean resetOnRemoval,
                 final boolean isTransient) {
    super(in.keyForm(), in.valueForm(), context);
    this.in = in;
    this.resetOnRemoval = resetOnRemoval;
    this.isTransient = isTransient;
  }

  /**
   * @param in          The input stream.
   * @param context         The instantiation context.
   * @param resetOnRemoval Whether the first value resets on key removal.
   * @param isTransient Whether to persist the first value.
   * @param ts          Assigns timestamps to the values.
   */
  FirstMapStream(final MapSwimStream<K, V> in, final BindingContext context,
                 final boolean resetOnRemoval,
                 final boolean isTransient,
                        final ToLongFunction<V> ts) {
    super(in.keyForm(), in.valueForm(), context, ts);
    this.in = in;
    this.resetOnRemoval = resetOnRemoval;
    this.isTransient = isTransient;
  }

  @Override
  public MapSwimStream<K, V> updateTimestamps(final ToLongFunction<V> datation) {
    return new FirstMapStream<>(in, getContext(), resetOnRemoval, isTransient, datation);
  }

  @Override
  public MapJunction<K, V> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = context.createFor(in);
    final FirstValueMapConduit<K, V> conduit;
    if (isTransient) {
      conduit = new FirstValueMapConduit<>(resetOnRemoval, valueForm());
    } else {
      final MapPersister<K, V> persister = context.getPersistenceProvider()
          .forMap(StateTags.stateTag(id()), keyForm(), valueForm());
      conduit = new FirstValueMapConduit<>(resetOnRemoval, persister);
    }
    source.subscribe(conduit);
    return conduit;
  }
}
