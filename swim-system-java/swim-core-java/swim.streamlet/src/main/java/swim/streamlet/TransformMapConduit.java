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

package swim.streamlet;

import java.util.function.BiFunction;
import swim.streaming.MapView;
import swim.util.Deferred;

/**
 * {@link MapConduit} that transforms the map values with a function that depends on both the key and input value.
 *
 * @param <K>    The type of the keys.
 * @param <VIn>  The type of the input values.
 * @param <VOut> The type of the output values.
 */
public class TransformMapConduit<K, VIn, VOut> extends AbstractMapJunction<K, VOut> implements MapConduit<K, K, VIn, VOut> {

  private final BiFunction<K, VIn, ? extends VOut> f;

  /**
   * @param f The transformation function.
   */
  public TransformMapConduit(final BiFunction<K, VIn, ? extends VOut> f) {
    this.f = f;
  }

  @Override
  public void notifyChange(final K key, final Deferred<VIn> value, final Deferred<MapView<K, VIn>> map) {
    emit(key, value.andThen(v -> f.apply(key, v)), map.andThen(m -> m.map(f)));
  }

  @Override
  public void notifyRemoval(final K key, final Deferred<MapView<K, VIn>> map) {
    emitRemoval(key, map.andThen(m -> m.map(f)));
  }
}
