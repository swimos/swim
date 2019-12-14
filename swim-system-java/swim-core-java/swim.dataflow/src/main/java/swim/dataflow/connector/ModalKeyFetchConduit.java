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

import swim.dataflow.graph.persistence.TrivialPersistenceProvider.TrivialValuePersister;
import swim.dataflow.graph.persistence.ValuePersister;
import swim.util.Deferred;

/**
 * {@link Conduit} that selects values from a {@link MapJunction} according to a variable key.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public class ModalKeyFetchConduit<K, V> extends AbstractJunction<V> {

  private final ValuePersister<K> keyPersister;

  private final Receptacle<K> keyReceptcale;

  private final MapReceptacle<K, V> mapReceptacle = new MapReceptacle<K, V>() {
    @Override
    public void notifyChange(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
      final K selected = keyPersister.get();
      if (selected != null && selected.equals(key)) {
        emit(value);
      }
    }

    @Override
    public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {

    }
  };

  public ModalKeyFetchConduit(final ValuePersister<K> keyPersister) {
    this.keyPersister = keyPersister;
    this.keyReceptcale = value -> this.keyPersister.set(value.get());
  }

  public ModalKeyFetchConduit() {
    this(new TrivialValuePersister<>(null));
  }

  /**
   * @return Channel to select the key.
   */
  public Receptacle<K> keySelector() {
    return keyReceptcale;
  }

  /**
   * @return Input channel for the map data.
   */
  public MapReceptacle<K, V> mapInput() {
    return mapReceptacle;
  }

}
