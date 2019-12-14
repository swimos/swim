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

import java.util.function.BiPredicate;
import java.util.function.ToLongFunction;
import swim.dataflow.connector.FilteredMapConduit;
import swim.dataflow.connector.MapJunction;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.SwimStreamContext;

/**
 * A filtered view on a map stream.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
class FilteredMapStream<K, V> extends AbstractMapStream<K, V> {

  private final MapSwimStream<K, V> in;
  private final BiPredicate<K, V> predicate;

  /**
   * @param input The input stream.
   * @param con   The instantiation context.
   * @param pred  Predicate to filter the stream.
   */
  FilteredMapStream(final MapSwimStream<K, V> input, final BindingContext con, final BiPredicate<K, V> pred) {
    super(input.keyForm(), input.valueForm(), con);
    in = input;
    predicate = pred;
  }

  /**
   * @param input The input stream.
   * @param con   The instantiation context.
   * @param pred  Predicate to filter the stream.
   */
  FilteredMapStream(final MapSwimStream<K, V> input, final BindingContext con, final BiPredicate<K, V> pred,
                    final ToLongFunction<V> ts) {
    super(input.keyForm(), input.valueForm(), con, ts);
    in = input;
    predicate = pred;
  }

  @Override
  public MapSwimStream<K, V> updateTimestamps(final ToLongFunction<V> datation) {
    return new FilteredMapStream<>(in, getContext(), predicate, datation);
  }

  @Override
  public MapJunction<K, V> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V> source = context.createFor(in);
    final FilteredMapConduit<K, V> conduit = new FilteredMapConduit<>(predicate);
    source.subscribe(conduit);
    return conduit;
  }
}
