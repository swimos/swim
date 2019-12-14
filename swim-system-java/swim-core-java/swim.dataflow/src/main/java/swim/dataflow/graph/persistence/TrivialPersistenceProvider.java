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

package swim.dataflow.graph.persistence;

import java.util.List;
import java.util.Set;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.dataflow.connector.MapView;
import swim.structure.Form;
import swim.structure.Value;

/**
 * Trivial implementation of {@link PersistenceProvider} that stores values in simple variables/maps.
 */
public final class TrivialPersistenceProvider implements PersistenceProvider {

  private HashTrieSet<Value> keys = HashTrieSet.empty();

  private void checkKey(final Value key) {
    if (key == null) {
      throw new IllegalArgumentException("A key must be provided.");
    } else if (keys.contains(key)) {
      throw new IllegalArgumentException(String.format("The storage key %s has already been used.", key));
    } else {
      keys = keys.added(key);
    }
  }

  @Override
  public <T> ValuePersister<T> forValue(final Value key, final Form<T> form) {
    checkKey(key);
    return new TrivialValuePersister<>(form.unit());
  }

  @Override
  public <T> SetPersister<T> forSet(final Value key, final Form<T> form) {
    return new TrivialSetPersisiter<>();
  }

  @Override
  public <T> ListPersister<T> forList(final Value key, final Form<T> form) {
    checkKey(key);
    return new TrivialListPersister<>();
  }

  @Override
  public <K, V> MapPersister<K, V> forMap(final Value key, final Form<K> keyForm, final Form<V> valForm) {
    checkKey(key);
    return new TrivialMapPersister<>(valForm);
  }

  public static class TrivialValuePersister<T> implements ValuePersister<T> {

    private T value;

    public TrivialValuePersister(final T initial) {
      value = initial;
    }

    @Override
    public T get() {
      return value;
    }

    @Override
    public void set(final T value) {
      this.value = value;
    }

    @Override
    public void close() {
      value = null;
    }
  }

  public static class TrivialMapPersister<K, V> implements MapPersister<K, V> {

    private final Form<V> valForm;
    private HashTrieMap<K, V> map;

    public TrivialMapPersister(final Form<V> valForm) {
      this.valForm = valForm;
      map = HashTrieMap.empty();
    }

    @Override
    public V get(final K key) {
      return map.get(key);
    }

    @Override
    public V getOrDefault(final K key) {
      return map.getOrDefault(key, valForm.unit());
    }

    @Override
    public boolean containsKey(final K key) {
      return map.containsKey(key);
    }

    @Override
    public MapView<K, V> get() {
      return MapView.wrapSimple(map);
    }

    @Override
    public Set<K> keys() {
      return map.keySet();
    }

    @Override
    public void put(final K key, final V value) {
      if (key == null || value == null) {
        throw new IllegalArgumentException("Key and value must both be non-null.");
      }
      map = map.updated(key, value);
    }

    @Override
    public void remove(final K key) {
      if (key == null) {
        throw new IllegalArgumentException("Key must be non-null.");
      }
      map = map.removed(key);
    }

    @Override
    public void close() {
      map = HashTrieMap.empty();
    }
  }

  public static class TrivialListPersister<T> implements ListPersister<T> {

    private FingerTrieSeq<T> list = FingerTrieSeq.empty();

    @Override
    public T get(final int index) {
      return list.get(index);
    }

    @Override
    public void append(final T value) {
      list = list.appended(value);
    }

    @Override
    public void prepend(final T value) {
      list = list.prepended(value);
    }

    @Override
    public int size() {
      return list.size();
    }

    @Override
    public void drop(final int n) {
      list = list.drop(n);
    }

    @Override
    public void take(final int n) {
      list = list.take(n);
    }

    @Override
    public List<T> get() {
      return list;
    }

    @Override
    public void close() {
      list = FingerTrieSeq.empty();
    }
  }

  public static class TrivialSetPersisiter<T> implements SetPersister<T> {

    private HashTrieSet<T> set = HashTrieSet.empty();

    @Override
    public boolean contains(final T val) {
      return set.contains(val);
    }

    @Override
    public Set<T> get() {
      return set;
    }

    @Override
    public void add(final T value) {
      set = set.added(value);
    }

    @Override
    public void remove(final T value) {
      set = set.removed(value);
    }

    @Override
    public void close() {
      set = HashTrieSet.empty();
    }
  }
}
