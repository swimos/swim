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

import java.util.Set;
import java.util.function.ToLongFunction;
import swim.streaming.CollectionSwimStream;
import swim.streaming.Junction;
import swim.streaming.MapJunction;
import swim.streaming.MapSwimStream;
import swim.streaming.SwimStreamContext;
import swim.streamlet.MapKeysCollector;
import swim.structure.Form;

/**
 * A stream of the key sets of a map stream.
 *
 * @param <K> The type of the keys of the map stream.
 * @param <V> The type of the values of the map stream.
 */
class KeyStream<K, V> extends AbstractCollectionStream<K, Set<K>> {

  private final MapSwimStream<K, V> inner;

  /**
   * @param source  The source map stream.
   * @param context The instantiation context.
   */
  KeyStream(final MapSwimStream<K, V> source, final BindingContext context) {
    super(Form.forCollection(Set.class, source.keyForm()), context);
    inner = source;
  }

  /**
   * @param source  The source map stream.
   * @param context The instantiation context.
   * @param ts      Time stamp assigner for the stream.
   */
  KeyStream(final MapSwimStream<K, V> source,
            final BindingContext context,
            final ToLongFunction<Set<K>> ts) {
    super(Form.forCollection(Set.class, source.keyForm()), context, ts);
    inner = source;
  }

  @Override
  public CollectionSwimStream<K, Set<K>> updateTimestamps(final ToLongFunction<Set<K>> datation) {
    return new KeyStream<>(inner, getContext(), datation);
  }

  @Override
  public Junction<Set<K>> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = context.createFor(inner);
    final MapKeysCollector<K, V> collector = new MapKeysCollector<>();
    source.subscribe(collector);
    return collector;
  }
}
