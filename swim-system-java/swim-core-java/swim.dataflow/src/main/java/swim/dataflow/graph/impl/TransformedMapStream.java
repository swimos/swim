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

import java.util.Collections;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.dataflow.connector.FlatMapEntriesConduit;
import swim.dataflow.connector.MapJunction;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.Pair;
import swim.dataflow.graph.SwimStreamContext;
import swim.structure.Form;

/**
 * A map stream formed by applying a function to the key-value pairs of another stream.
 *
 * @param <K1> The type of the input keys.
 * @param <K2> The type of the output keys.
 * @param <V1> The type of the input values.
 * @param <V2> The type of the output values.
 */
class TransformedMapStream<K1, K2, V1, V2> extends AbstractMapStream<K2, V2> {

  private final MapSwimStream<K1, V1> in;
  private final BiFunction<K1, V1, Pair<K2, V2>> f;
  private final Function<K1, Set<K2>> onRemove;

  /**
   * @param input   The source stream.
   * @param context The instantiation context.
   * @param fun     The transformation function.
   * @param onRem   Keys to remove from the derived map when a key is moved from the source.
   * @param kform   The form of the type of the output keys.
   * @param vform   The form of the type of the output values.
   */
  TransformedMapStream(
          final MapSwimStream<K1, V1> input,
          final BindingContext context,
          final BiFunction<K1, V1, Pair<K2, V2>> fun,
          final Function<K1, Set<K2>> onRem,
          final Form<K2> kform, final Form<V2> vform) {
    super(kform, vform, context);
    in = input;
    f = fun;
    onRemove = onRem;
  }

  /**
   * @param input   The source stream.
   * @param context The instantiation context.
   * @param fun     The transformation function.
   * @param onRem   Keys to remove from the derived map when a key is moved from the source.
   * @param kform   The form of the type of the output keys.
   * @param vform   The form of the type of the output values.
   * @param ts      Timestamp assignment for the values.
   */
  TransformedMapStream(
      final MapSwimStream<K1, V1> input,
      final BindingContext context,
      final BiFunction<K1, V1, Pair<K2, V2>> fun,
      final Function<K1, Set<K2>> onRem,
      final Form<K2> kform, final Form<V2> vform,
      final ToLongFunction<V2> ts) {
    super(kform, vform, context, ts);
    in = input;
    f = fun;
    onRemove = onRem;
  }

  @Override
  public MapSwimStream<K2, V2> updateTimestamps(final ToLongFunction<V2> datation) {
    return new TransformedMapStream<>(in, getContext(), f, onRemove, keyForm(), valueForm(), datation);
  }

  @Override
  public MapJunction<K2, V2> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K1, V1> source = context.createFor(in);
    final BiFunction<K1, V1, Iterable<Pair<K2, V2>>> itFun = (k1, v1) -> Collections.singletonList(f.apply(k1, v1));
    final FlatMapEntriesConduit<K1, K2, V1, V2> conduit = new FlatMapEntriesConduit<>(itFun, onRemove);
    source.subscribe(conduit);
    return conduit;
  }
}
