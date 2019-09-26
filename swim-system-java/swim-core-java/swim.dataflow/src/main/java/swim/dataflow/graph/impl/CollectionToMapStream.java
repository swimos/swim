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

import java.util.Collection;
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.streamlet.CollectionToMapConduit;
import swim.streamlet.Junction;
import swim.streamlet.MapJunction;
import swim.streamlet.persistence.MapPersister;
import swim.structure.Form;

/**
 * Map stream derived from a stream of collections, the elements of which induce the key value pairs of the map.
 *
 * @param <T> The type of the incoming stream elements.
 * @param <C> The type of the incoming stream collections.
 * @param <K> The type of the output keys.
 * @param <V> The type of the output values.
 */
class CollectionToMapStream<T, C extends Collection<T>, K, V> extends AbstractMapStream<K, V> {

  private final SwimStream<C> in;
  private final Function<T, K> toKey;
  private final Function<T, V> toValue;
  private final boolean isTransient;

  /**
   * @param input     The source stream.
   * @param context   The initialization context.
   * @param keys      Function from input data to keys.
   * @param values    Function from input data to values.
   * @param keyForm   The form of the type of the keys.
   * @param valueForm The form of the type of the values.
   * @param isTransient   Whether the state of this stream is stored persistently.
   */
  CollectionToMapStream(final SwimStream<C> input,
                        final BindingContext context,
                        final Function<T, K> keys,
                        final Function<T, V> values,
                        final Form<K> keyForm,
                        final Form<V> valueForm,
                        final boolean isTransient) {
    super(keyForm, valueForm, context);
    in = input;
    toKey = keys;
    toValue = values;
    this.isTransient = isTransient;
  }

  /**
   * @param input     The source stream.
   * @param context   The initialization context.
   * @param keys      Function from input data to keys.
   * @param values    Function from input data to values.
   * @param keyForm   The form of the type of the keys.
   * @param valueForm The form of the type of the values.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @param ts        Timestamp assignment for the values.
   */
  CollectionToMapStream(final SwimStream<C> input,
                        final BindingContext context,
                        final Function<T, K> keys,
                        final Function<T, V> values,
                        final Form<K> keyForm,
                        final Form<V> valueForm,
                        final boolean isTransient,
                        final ToLongFunction<V> ts) {
    super(keyForm, valueForm, context, ts);
    in = input;
    toKey = keys;
    toValue = values;
    this.isTransient = isTransient;
  }

  @Override
  public MapSwimStream<K, V> updateTimestamps(final ToLongFunction<V> datation) {
    return new CollectionToMapStream<>(in, getContext(), toKey, toValue, keyForm(), valueForm(), isTransient, datation);
  }

  @Override
  public MapJunction<K, V> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<C> source = context.createFor(in);
    final CollectionToMapConduit<T, Collection<T>, K, V> conduit;
    if (isTransient) {
      conduit = new CollectionToMapConduit<>(toKey, toValue, valueForm());
    } else {
      final MapPersister<K, V> persister = context.getPersistenceProvider().forMap(
          StateTags.stateTag(id()), keyForm(), valueForm());
      conduit = new CollectionToMapConduit<>(toKey, toValue, persister);
    }
    source.subscribe(conduit);
    return conduit;
  }
}
