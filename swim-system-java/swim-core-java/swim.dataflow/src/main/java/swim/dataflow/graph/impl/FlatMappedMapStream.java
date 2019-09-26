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

import java.util.Set;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.streamlet.FlatMapEntriesConduit;
import swim.streamlet.MapJunction;
import swim.structure.Form;
import swim.util.Pair;

/**
 * Flat-map operation across the key-value pairs of a map stream. A combine operation is supplied to merge
 * together multiple values for a single key after the operation.
 *
 * @param <K1> The type of the input keys.
 * @param <K2> The type if the output keys.
 * @param <V1> The type of the input values.
 * @param <V2> The type of the output values.
 */
class FlatMappedMapStream<K1, K2, V1, V2> extends AbstractMapStream<K2, V2> {

  private final MapSwimStream<K1, V1> in;
  private final BiFunction<K1, V1, Iterable<Pair<K2, V2>>> f;
  private final Function<K1, Set<K2>> onRemove;

  /**
   * @param input   The input stream.
   * @param context The instantiation context.
   * @param fun     Flat-map operation (which may result in multiple values for the new keys).
   * @param onRem   Mapping for key removals.
   * @param kform   The form of the type of the output keys.
   * @param vform   The form of the type of the output values.
   */
  FlatMappedMapStream(
          final MapSwimStream<K1, V1> input,
          final BindingContext context,
          final BiFunction<K1, V1, Iterable<Pair<K2, V2>>> fun,
          final Function<K1, Set<K2>> onRem,
          final Form<K2> kform, final Form<V2> vform) {
    super(kform, vform, context);
    f = fun;
    in = input;
    onRemove = onRem;
  }

  /**
   * @param input   The input stream.
   * @param context The instantiation context.
   * @param fun     Flat-map operation (which may result in multiple values for the new keys).
   * @param onRem   Mapping for key removals.
   * @param kform   The form of the type of the output keys.
   * @param vform   The form of the type of the output values.
   * @param ts      Timestamp assignment for the values.
   */
  FlatMappedMapStream(
      final MapSwimStream<K1, V1> input,
      final BindingContext context,
      final BiFunction<K1, V1, Iterable<Pair<K2, V2>>> fun,
      final Function<K1, Set<K2>> onRem,
      final Form<K2> kform, final Form<V2> vform,
      final ToLongFunction<V2> ts) {
    super(kform, vform, context, ts);
    f = fun;
    in = input;
    onRemove = onRem;
  }

  @Override
  public MapSwimStream<K2, V2> updateTimestamps(final ToLongFunction<V2> datation) {
    return new FlatMappedMapStream<>(in, getContext(), f, onRemove, keyForm(), valueForm(), datation);
  }

  @Override
  public MapJunction<K2, V2> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K1, V1> source = context.createFor(in);
    final FlatMapEntriesConduit<K1, K2, V1, V2> conduit = new FlatMapEntriesConduit<>(f, onRemove);
    source.subscribe(conduit);
    return conduit;
  }
}
