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

import java.util.Map;
import java.util.function.ToLongFunction;
import swim.streaming.Junction;
import swim.streaming.MapJunction;
import swim.streaming.MapSwimStream;
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streamlet.MapExtractor;
import swim.structure.Form;

/**
 * A stream of key-value pairs representing the entries of a map stream.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public class KeyValueStream<K, V> extends AbstractSwimStream<Map<K, V>> {

  private final MapSwimStream<K, V> inner;

  /**
   * @param source  The source map stream.
   * @param context The instantiation context.
   */
  KeyValueStream(final MapSwimStream<K, V> source, final BindingContext context) {
    super(Form.forMap(Map.class, source.keyForm(), source.valueForm()), context);
    inner = source;
  }

  /**
   * @param source  The source map stream.
   * @param context The instantiation context.
   * @param ts      Timestamp assigner for the stream.
   */
  KeyValueStream(final MapSwimStream<K, V> source,
                 final BindingContext context,
                 final ToLongFunction<Map<K, V>> ts) {
    super(Form.forMap(Map.class, source.keyForm(), source.valueForm()), context, ts);
    inner = source;
  }

  @Override
  public SwimStream<Map<K, V>> updateTimestamps(
          final ToLongFunction<Map<K, V>> datation) {
    return new KeyValueStream<>(inner, getContext(), datation);
  }

  @Override
  public Junction<Map<K, V>> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = context.createFor(inner);
    final MapExtractor<K, V> collector = new MapExtractor<>();
    source.subscribe(collector);
    return collector;
  }
}
