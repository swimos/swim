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

import java.util.function.BiFunction;
import java.util.function.ToLongFunction;
import swim.streaming.MapJunction;
import swim.streaming.MapSwimStream;
import swim.streaming.SwimStreamContext;
import swim.streamlet.MapConduit;
import swim.streamlet.MapMemoizingConduit;
import swim.streamlet.TransformMapConduit;
import swim.structure.Form;

/**
 * Map stream based on another with the values transformed.
 *
 * @param <K>  The key type of the stream.
 * @param <V1> The input value type.
 * @param <V2> The output value type.
 */
class TransformedValuesMapStream<K, V1, V2> extends AbstractMapStream<K, V2> {

  private final MapSwimStream<K, V1> in;
  private final BiFunction<K, V1, ? extends V2> f;
  private final boolean memoizeValues;

  /**
   * @param input       The source stream.
   * @param context     The instantiation context.
   * @param mapFunction The transformation.
   * @param memoize Memoize the computed values.
   * @param form        The form of the type of the output values.
   */
  TransformedValuesMapStream(final MapSwimStream<K, V1> input,
                             final BindingContext context, final BiFunction<K, V1, ? extends V2> mapFunction,
                             final boolean memoize,
                             final Form<V2> form) {
    super(input.keyForm(), form, context);
    in = input;
    f = mapFunction;
    memoizeValues = memoize;
  }

  /**
   * @param input       The source stream.
   * @param context     The instantiation context.
   * @param mapFunction The transformation.
   * @param form        The form of the type of the output values.
   * @param ts          Timestamp assignment for the values.
   */
  TransformedValuesMapStream(final MapSwimStream<K, V1> input,
                             final BindingContext context, final BiFunction<K, V1, ? extends V2> mapFunction,
                             final boolean memoize,
                             final Form<V2> form, final ToLongFunction<V2> ts) {
    super(input.keyForm(), form, context);
    in = input;
    f = mapFunction;
    memoizeValues = memoize;
  }

  @Override
  public MapSwimStream<K, V2> updateTimestamps(final ToLongFunction<V2> datation) {
    return new TransformedValuesMapStream<>(in, getContext(), f, memoizeValues, valueForm(), datation);
  }

  @Override
  public MapJunction<K, V2> instantiate(final SwimStreamContext.InitContext context) {
    final MapJunction<K, V1> source = context.createFor(in);
    final TransformMapConduit<K, V1, V2> conduit = new TransformMapConduit<>(f);
    source.subscribe(conduit);
    if (memoizeValues) {
      final MapConduit<K, K, V2, V2> memoizer = new MapMemoizingConduit<>();
      conduit.subscribe(memoizer);
      return memoizer;
    } else {
      return conduit;
    }
  }
}
