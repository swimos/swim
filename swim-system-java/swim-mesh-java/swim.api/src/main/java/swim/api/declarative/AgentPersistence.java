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

package swim.api.declarative;

import java.util.List;
import java.util.Set;
import swim.api.data.ListData;
import swim.api.data.MapData;
import swim.api.data.ValueData;
import swim.api.store.Store;
import swim.dataflow.persistence.UnitForm;
import swim.streaming.MapView;
import swim.streaming.persistence.ListPersister;
import swim.streaming.persistence.MapPersister;
import swim.streaming.persistence.PersistenceProvider;
import swim.streaming.persistence.SetPersister;
import swim.streaming.persistence.ValuePersister;
import swim.structure.Form;
import swim.structure.Value;
import swim.util.Unit;

/**
 * Persistence provider which stores state using a {@link Store}.
 */
public class AgentPersistence implements PersistenceProvider {

  private final Store factory;

  public AgentPersistence(final Store factory) {
    this.factory = factory;
  }

  @Override
  public <T> ValuePersister<T> forValue(final Value key, final Form<T> form) {
    return new ValueDataPersister<>(factory.valueData(key).valueForm(form));
  }

  @Override
  public <T> SetPersister<T> forSet(final Value key, final Form<T> form) {
    return new SetDataPersister<>(factory.mapData(key).keyForm(form).valueForm(UnitForm.INSTANCE));
  }

  @Override
  public <T> ListPersister<T> forList(final Value key, final Form<T> form) {
    return new ListDataPersister<>(factory.listData(key).valueForm(form));
  }

  @Override
  public <K, V> MapPersister<K, V> forMap(final Value key, final Form<K> keyForm, final Form<V> valForm) {
    return new MapDataPersister<>(factory.mapData(key).keyForm(keyForm).valueForm(valForm));
  }
}

final class ValueDataPersister<T> implements ValuePersister<T> {

  private ValueData<T> data;

  ValueDataPersister(final ValueData<T> data) {
    this.data = data;
  }

  @Override
  public T get() {
    checkOpen();
    return data.get();
  }

  private void checkOpen() {
    if (data == null) {
      throw new IllegalStateException("Value persister has already been closed.");
    }
  }

  @Override
  public void set(final T value) {
    checkOpen();
    data.set(value);
  }

  @Override
  public void close() {
    if (data != null) {
      try {
        data.close();
      } finally {
        data = null;
      }
    }

  }
}

final class MapDataPersister<K, V> implements MapPersister<K, V> {

  private MapData<K, V> data;

  MapDataPersister(final MapData<K, V> data) {
    this.data = data;
  }

  private void checkOpen() {
    if (data == null) {
      throw new IllegalStateException("Value persister has already been closed.");
    }
  }

  @Override
  public V get(final K key) {
    checkOpen();
    return data.get(key);
  }

  @Override
  public V getOrDefault(final K key) {
    checkOpen();
    return data.getOrDefault(key, data.valueForm().unit());
  }

  @Override
  public boolean containsKey(final K key) {
    checkOpen();
    return data.containsKey(key);
  }

  @Override
  public MapView<K, V> get() {
    return MapView.wrap(data.snapshot());
  }

  @Override
  public Set<K> keys() {
    checkOpen();
    return data.keySet();
  }

  @Override
  public void put(final K key, final V value) {
    checkOpen();
    data.put(key, value);
  }

  @Override
  public void remove(final K key) {
    checkOpen();
    data.remove(key);
  }

  @Override
  public void close() {
    if (data != null) {
      try {
        data.close();
      } finally {
        data = null;
      }
    }
  }
}

final class ListDataPersister<T> implements ListPersister<T> {

  private ListData<T> data;

  ListDataPersister(final ListData<T> data) {
    this.data = data;
  }

  @Override
  public T get(final int index) {
    return data.get(index);
  }

  @Override
  public void append(final T value) {
    data.add(value);
  }

  @Override
  public void prepend(final T value) {
    data.add(0, value);
  }

  @Override
  public int size() {
    return data.size();
  }

  @Override
  public void drop(final int n) {
    data.drop(n);
  }

  @Override
  public void take(final int n) {
    data.take(n);
  }

  @Override
  public List<T> get() {
    return data.snapshot();
  }

  @Override
  public void close() {
    if (data != null) {
      try {
        data.close();
      } finally {
        data = null;
      }
    }
  }
}

final class SetDataPersister<T> implements SetPersister<T> {

  private MapData<T, Unit> data;

  SetDataPersister(final MapData<T, Unit> data) {
    this.data = data;
  }

  @Override
  public boolean contains(final T val) {
    return data.containsKey(val);
  }

  @Override
  public Set<T> get() {
    return data.snapshot().keySet();
  }

  @Override
  public void add(final T value) {
    data.put(value, Unit.INSTANCE);
  }

  @Override
  public void remove(final T value) {
    data.remove(value, Unit.INSTANCE);
  }

  @Override
  public void close() {
    if (data != null) {
      try {
        data.close();
      } finally {
        data = null;
      }
    }
  }
}
