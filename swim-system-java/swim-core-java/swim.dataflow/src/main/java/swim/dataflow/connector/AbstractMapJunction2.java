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

package swim.dataflow.connector;

/**
 * Abstract {@link MapJunction} with two inputs, one of which is a map, the other of which is a simple value.
 *
 * @param <KeyIn>  The type of the input keys.
 * @param <KeyOut> The type of the output keys.
 * @param <ValIn>  The type of the input values.
 * @param <ValOut> The type of the output values.
 * @param <T>      The type of the data on the auxiliary channel.
 */
public abstract class AbstractMapJunction2<KeyIn, KeyOut, ValIn, ValOut, T> extends AbstractMapJunction<KeyOut, ValOut>
    implements MapJunction2<KeyIn, KeyOut, ValIn, ValOut, T> {

  /**
   * Handler for changes to the values on the map input.
   *
   * @param key   The key.
   * @param value The new value.
   * @param map   View of the state of the map.
   */
  protected abstract void notifyChange(KeyIn key, Deferred<ValIn> value, Deferred<MapView<KeyIn, ValIn>> map);

  /**
   * Handler for removals of the values on the map input.
   *
   * @param key The key being removed.
   * @param map View of the state of the map.
   */
  protected abstract void notifyRemoval(KeyIn key, Deferred<MapView<KeyIn, ValIn>> map);

  /**
   * Handler for changes on the auxiliary channel.
   *
   * @param value The new value.
   */
  protected abstract void notifyChange(Deferred<T> value);


  private final MapReceptacle<KeyIn, ValIn> dataReceptacle = new MapReceptacle<KeyIn, ValIn>() {
    @Override
    public void notifyChange(final KeyIn key, final Deferred<ValIn> value, final Deferred<MapView<KeyIn, ValIn>> map) {
      AbstractMapJunction2.this.notifyChange(key, value, map);
    }

    @Override
    public void notifyRemoval(final KeyIn key, final Deferred<MapView<KeyIn, ValIn>> map) {
      AbstractMapJunction2.this.notifyRemoval(key, map);
    }
  };

  private final Receptacle<T> sideReceptacle = AbstractMapJunction2.this::notifyChange;

  @Override
  public final MapReceptacle<KeyIn, ValIn> first() {
    return dataReceptacle;
  }

  @Override
  public final Receptacle<T> second() {
    return sideReceptacle;
  }
}
