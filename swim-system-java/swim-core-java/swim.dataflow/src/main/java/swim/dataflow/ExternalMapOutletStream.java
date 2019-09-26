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

import java.util.function.Supplier;
import java.util.function.ToLongFunction;
import swim.streaming.MapJunction;
import swim.streaming.MapSwimStream;
import swim.streaming.SwimStreamContext;
import swim.structure.Form;

/**
 * Map stream drawing value from an external source.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
final class ExternalMapOutletStream<K, V> extends AbstractMapStream<K, V> {

  private final Supplier<MapJunction<K, V>> outlet;

  /**
   * @param keyForm   The form of the type of the keys.
   * @param valueForm The form of the type of the values.
   * @param context   The instantiation context.
   * @param junctionSupplier Supplier for the source junction.
   */
  ExternalMapOutletStream(final Form<K> keyForm, final Form<V> valueForm,
                          final BindingContext context,
                          final Supplier<MapJunction<K, V>> junctionSupplier) {
    super(keyForm, valueForm, context);
    outlet = junctionSupplier;
  }

  /**
   * @param keyForm   The form of the type of the keys.
   * @param valueForm The form of the type of the values.
   * @param context   The instantiation context.
   * @param junctionSupplier Supplier for the source junction.
   * @param ts        Timestamp assignment for the values.
   */
  ExternalMapOutletStream(final Form<K> keyForm, final Form<V> valueForm,
                          final BindingContext context,
                          final Supplier<MapJunction<K, V>> junctionSupplier,
                          final ToLongFunction<V> ts) {
    super(keyForm, valueForm, context, ts);
    outlet = junctionSupplier;
  }

  @Override
  public MapSwimStream<K, V> updateTimestamps(final ToLongFunction<V> datation) {
    return new ExternalMapOutletStream<>(keyForm(), valueForm(), getContext(), outlet, datation);
  }

  @Override
  public MapJunction<K, V> instantiate(final SwimStreamContext.InitContext context) {
    return outlet.get();
  }

}

