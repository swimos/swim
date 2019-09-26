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

package swim.streaming;

import java.util.Iterator;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Predicate;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.util.Deferred;
import swim.util.Iterables;

/**
 * Immutable view of the current state of a map.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public interface MapView<K, V> extends Iterable<Map.Entry<K, Deferred<V>>> {

  /**
   * Expose a deferred {@link HashTrieMap} through a view.
   *
   * @param map The underlying map.
   * @param <K> The type of the keys.
   * @param <V> The type of the values.
   * @return The view.
   */
  static <K, V> MapView<K, V> wrap(final HashTrieMap<K, Deferred<V>> map) {
    return new MapWrapper<>(map);
  }

  /**
   * Create an immutable view of a Java map.
   *
   * @param map The underlying map.
   * @param <K> The type of the keys.
   * @param <V> The type of the values.
   * @return The view.
   */
  static <K, V> MapView<K, V> wrap(final Map<K, V> map) {
    return new JavaMapView<>(map, null, null);
  }

  /**
   * Expose a {@link HashTrieMap} through a view.
   *
   * @param map The underlying map.
   * @param <K> The type of the keys.
   * @param <V> The type of the values.
   * @return The view.
   */
  static <K, V> MapView<K, V> wrapSimple(final HashTrieMap<K, V> map) {
    return new SimpleMapWrapper<>(map);
  }

  /**
   * {@link MapView}s are covariant in their second parameter but this cannot be determined by the Java type checker.
   * Peform a covariance cast on a map view.
   *
   * @param view The map view.
   * @param <K>  The type of the keys.
   * @param <V1> The target value type.
   * @param <V2> The initial value type.
   * @return The same view instance.
   */
  @SuppressWarnings("unchecked")
  static <K, V1, V2 extends V1> MapView<K, V1> covCast(final MapView<K, V2> view) {
    return (MapView<K, V1>) view;
  }

  /**
   * Defer the value of a map entry.
   *
   * @param entry The entry.
   * @param <K>   The type of the key.
   * @param <V>   The type of the value.
   * @return The deferred entry.
   */
  static <K, V> Map.Entry<K, Deferred<V>> deferValue(final Map.Entry<K, V> entry) {
    return new Map.Entry<K, Deferred<V>>() {
      @Override
      public K getKey() {
        return entry.getKey();
      }

      @Override
      public Deferred<V> getValue() {
        return Deferred.value(entry.getValue());
      }

      @Override
      public Deferred<V> setValue(final Deferred<V> value) {
        entry.setValue(value.get());
        return value;
      }
    };
  }

  //Create a map entry.
  static <K, V> Map.Entry<K, V> entryFor(final K key, final V val) {
    return new Map.Entry<K, V>() {
      @Override
      public K getKey() {
        return key;
      }

      @Override
      public V getValue() {
        return val;
      }

      @Override
      public V setValue(final V value) {
        throw new UnsupportedOperationException();
      }
    };
  }

  /**
   * @return Immutable view of the keys.
   */
  SetView<K> keys();

  /**
   * Get the deferred value for a key.
   *
   * @param key The key.
   * @return The deferred value.
   */
  Deferred<V> get(K key);

  /**
   * @return The number of entries.
   */
  default int size() {
    return keys().size();
  }

  /**
   * @param key A key.
   * @return Whether this contains the key.
   */
  default boolean containsKey(final K key) {
    return keys().contains(key);
  }

  /**
   * Create a new view which is the same as this view only containing an updated entry.
   *
   * @param key   The updated key.
   * @param value The new value.
   * @return The new view.
   */
  default MapView<K, V> updated(final K key, final Deferred<V> value) {
    return memoize().updated(key, value);
  }

  /**
   * Create a new view which is the same as this view only with an entry removed.
   *
   * @param key The removed key.
   * @return The new view.
   */
  default MapView<K, V> removed(final K key) {
    return memoize().removed(key);
  }

  /**
   * Create a new view that has the same keys as this view but with the values transformed.
   *
   * @param f   The function to apply to the values.
   * @param <U> The type of the transformed values.
   * @return The transformed view.
   */
  default <U> MapView<K, U> map(final Function<V, U> f) {
    return map((k, v) -> f.apply(v));
  }

  /**
   * Create a new view that has the same keys as this view but with the values transformed.
   *
   * @param f   The function to apply to the values (taking the key into account).
   * @param <U> The type of the transformed values.
   * @return The transformed view.
   */
  default <U> MapView<K, U> map(final BiFunction<K, V, ? extends U> f) {
    return new TransformedMapView<>(this, f, null);
  }

  /**
   * Create a view that is the same as this view but with some keys filtered out.
   *
   * @param p The predicate to filter the keys.
   * @return The filtered view.
   */
  default MapView<K, V> filter(final Predicate<K> p) {
    return new FilteredMapView<>(this, p);
  }

  /**
   * Memoize this view.
   *
   * @return The memoized view.
   */
  default MapView<K, V> memoize() {
    HashTrieMap<K, Deferred<V>> memoized = HashTrieMap.empty();
    for (final Map.Entry<K, Deferred<V>> entry : this) {
      memoized = memoized.updated(entry.getKey(), entry.getValue().memoize());
    }
    return new MapWrapper<>(memoized);
  }
}

class MapWrapper<K, V> implements MapView<K, V> {

  private final HashTrieMap<K, Deferred<V>> wrapped;
  private SetView<K> keys = null;

  MapWrapper(final HashTrieMap<K, Deferred<V>> wrapped) {
    this.wrapped = wrapped;
  }

  @Override
  public SetView<K> keys() {
    if (keys == null) {
      keys = SetView.wrap(wrapped.keySet());
    }
    return keys;
  }

  @Override
  public Deferred<V> get(final K key) {
    return wrapped.get(key);
  }

  @Override
  public MapView<K, V> updated(final K key, final Deferred<V> value) {
    return new MapWrapper<>(wrapped.updated(key, value));
  }

  @Override
  public MapView<K, V> removed(final K key) {
    return new MapWrapper<>(wrapped.removed(key));
  }

  @Override
  public <U> MapView<K, U> map(final BiFunction<K, V, ? extends U> f) {
    return new TransformedMapView<>(this, f, null);
  }

  @Override
  public MapView<K, V> filter(final Predicate<K> p) {
    return new FilteredMapView<>(this, p);
  }

  @Override
  public MapView<K, V> memoize() {
    HashTrieMap<K, Deferred<V>> memoized = HashTrieMap.empty();
    for (final Map.Entry<K, Deferred<V>> entry : wrapped) {
      memoized = memoized.updated(entry.getKey(), entry.getValue().memoize());
    }
    return new MapWrapper<>(memoized);
  }

  @Override
  public Iterator<Map.Entry<K, Deferred<V>>> iterator() {
    return wrapped.entrySet().iterator();
  }


}

class SimpleMapWrapper<K, V> implements MapView<K, V> {

  private final HashTrieMap<K, V> wrapped;
  private SetView<K> keys = null;

  SimpleMapWrapper(final HashTrieMap<K, V> wrapped) {
    this.wrapped = wrapped;
  }

  @Override
  public SetView<K> keys() {
    if (keys == null) {
      keys = SetView.wrap(wrapped.keySet());
    }
    return keys;
  }

  @Override
  public Deferred<V> get(final K key) {
    if (wrapped.containsKey(key)) {
      return Deferred.value(wrapped.get(key));
    } else {
      return null;
    }
  }

  @Override
  public MapView<K, V> updated(final K key, final Deferred<V> value) {
    HashTrieMap<K, Deferred<V>> map = HashTrieMap.empty();
    for (final Map.Entry<K, V> entry : wrapped.entrySet()) {
      map = map.updated(entry.getKey(), Deferred.value(entry.getValue()));
    }
    return new MapWrapper<>(map.updated(key, value));
  }

  @Override
  public MapView<K, V> removed(final K key) {
    if (!wrapped.containsKey(key)) {
      return this;
    } else {
      HashTrieMap<K, Deferred<V>> map = HashTrieMap.empty();
      for (final Map.Entry<K, V> entry : wrapped.entrySet()) {
        if (!entry.getKey().equals(key)) {
          map = map.updated(entry.getKey(), Deferred.value(entry.getValue()));
        }
      }
      return new MapWrapper<>(map);
    }
  }

  @Override
  public <U> MapView<K, U> map(final BiFunction<K, V, ? extends U> f) {
    return new TransformedMapView<>(this, f, null);
  }

  @Override
  public MapView<K, V> filter(final Predicate<K> p) {
    return new FilteredMapView<>(this, p);
  }

  @Override
  public MapView<K, V> memoize() {
    return this;
  }

  @Override
  public Iterator<Map.Entry<K, Deferred<V>>> iterator() {
    return Iterables.mapIterable(wrapped.entrySet(), MapView::deferValue).iterator();
  }
}

class FilteredMapView<K, V> implements MapView<K, V> {

  private final MapView<K, V> wrapped;
  private final Predicate<K> predicate;

  FilteredMapView(final MapView<K, V> wrapped, final Predicate<K> predicate) {
    this.wrapped = wrapped;
    this.predicate = predicate;
  }

  @Override
  public SetView<K> keys() {
    return wrapped.keys().filter(predicate);
  }

  @Override
  public Deferred<V> get(final K key) {
    if (predicate.test(key)) {
      return wrapped.get(key);
    } else {
      return null;
    }
  }

  @Override
  public MapView<K, V> updated(final K key, final Deferred<V> value) {
    if (predicate.test(key)) {
      return new FilteredMapView<>(wrapped.updated(key, value), predicate);
    } else {
      return this;
    }
  }

  @Override
  public MapView<K, V> removed(final K key) {
    if (predicate.test(key) && wrapped.containsKey(key)) {
      return new FilteredMapView<>(wrapped.removed(key), predicate);
    } else {
      return this;
    }
  }

  @Override
  public <U> MapView<K, U> map(final BiFunction<K, V, ? extends U> f) {
    return new TransformedMapView<>(this, f, null);
  }

  @Override
  public MapView<K, V> filter(final Predicate<K> p) {
    return new FilteredMapView<>(wrapped, predicate.and(p));
  }

  @Override
  public MapView<K, V> memoize() {
    HashTrieMap<K, Deferred<V>> map = HashTrieMap.empty();
    for (final K key : wrapped.keys()) {
      if (predicate.test(key)) {
        map = map.updated(key, wrapped.get(key).memoize());
      }
    }
    return new MapWrapper<>(map);
  }

  @Override
  public Iterator<Map.Entry<K, Deferred<V>>> iterator() {
    return Iterables.filterIterable(wrapped, entry -> predicate.test(entry.getKey())).iterator();
  }
}

class TransformedMapView<K, V, U> implements MapView<K, U> {

  private final MapView<K, V> base;
  private final BiFunction<K, V, ? extends U> f;
  private final MapView<K, U> delta;
  private SetView<K> keys = null;

  TransformedMapView(final MapView<K, V> base, final BiFunction<K, V, ? extends U> f,
                     final MapView<K, U> delta) {
    this.base = base;
    this.f = f;
    this.delta = delta;
  }

  @Override
  public SetView<K> keys() {
    if (keys == null) {
      keys = base.keys();
      if (delta != null) {
        for (final K key : delta.keys()) {
          keys = keys.added(key);
        }
      }
    }
    return base.keys();
  }

  @Override
  public Deferred<U> get(final K key) {
    if (delta != null && delta.containsKey(key)) {
      return delta.get(key);
    } else if (base.containsKey(key)) {
      return base.get(key).andThen(v -> f.apply(key, v));
    } else {
      return null;
    }
  }

  @Override
  public MapView<K, U> updated(final K key, final Deferred<U> value) {
    final MapView<K, U> newDelta = delta == null ? new MapWrapper<>(HashTrieMap.empty()) : delta;
    return new TransformedMapView<>(base, f, newDelta.updated(key, value));
  }

  @Override
  public MapView<K, U> removed(final K key) {
    if (base.containsKey(key) || (delta != null && delta.containsKey(key))) {
      return new TransformedMapView<>(base.removed(key), f, delta != null ? delta.removed(key) : null);
    } else {
      return this;
    }
  }

  @Override
  public <U1> MapView<K, U1> map(final BiFunction<K, U, ? extends U1> f2) {
    return new TransformedMapView<>(base, (k, v) -> f2.apply(k, f.apply(k, v)), delta != null ? delta.map(f2) : null);
  }

  @Override
  public MapView<K, U> filter(final Predicate<K> p) {
    return new FilteredMapView<>(this, p);
  }

  @Override
  public MapView<K, U> memoize() {
    HashTrieMap<K, Deferred<U>> map = HashTrieMap.empty();
    for (final K key : base.keys()) {
      map = map.updated(key, Deferred.covCast(base.get(key).andThen(v -> f.apply(key, v)).memoize()));
    }
    if (delta != null) {
      for (final K key : delta.keys()) {
        map = map.updated(key, delta.get(key).memoize());
      }
    }
    return new MapWrapper<>(map);
  }

  @Override
  public Iterator<Map.Entry<K, Deferred<U>>> iterator() {
    return Iterables.mapIterable(keys, k -> MapView.entryFor(k, get(k))).iterator();
  }
}

class JavaMapView<K, V> implements MapView<K, V> {

  private final Map<K, V> wrapped;
  private final SetView<K> keys;
  private final MapView<K, V> delta;
  private final HashTrieSet<K> removals;


  JavaMapView(final Map<K, V> wrapped, final MapView<K, V> delta, final HashTrieSet<K> removals) {
    this.wrapped = wrapped;
    this.delta = delta;
    HashTrieSet<K> keysBuilder = HashTrieSet.from(wrapped.keySet());
    if (delta != null) {
      for (final K key : delta.keys()) {
        keysBuilder = keysBuilder.added(key);
      }
    }
    if (removals != null) {
      for (final K key : removals) {
        keysBuilder = keysBuilder.removed(key);
      }
    }
    keys = SetView.wrap(keysBuilder);
    this.removals = removals;
  }

  @Override
  public SetView<K> keys() {
    return keys;
  }

  @Override
  public Deferred<V> get(final K key) {
    if (delta != null && delta.containsKey(key)) {
      return delta.get(key);
    } else if ((removals == null || !removals.contains(key) && wrapped.containsKey(key))) {
      return Deferred.value(wrapped.get(key));
    } else {
      return null;
    }
  }

  @Override
  public MapView<K, V> updated(final K key, final Deferred<V> value) {

    return new JavaMapView<>(wrapped, delta.updated(key, value), removals == null ? null : removals.removed(key));
  }

  @Override
  public MapView<K, V> removed(final K key) {
    if ((removals == null || !removals.contains(key)) && wrapped.containsKey(key)) {
      return new JavaMapView<>(wrapped, delta.removed(key),
          removals == null ? HashTrieSet.<K>empty().added(key) : removals.added(key));
    } else if (delta.containsKey(key)) {
      return new JavaMapView<>(wrapped, delta.removed(key), removals);
    } else {
      return this;
    }
  }

  @Override
  public <U> MapView<K, U> map(final BiFunction<K, V, ? extends U> f) {
    return new TransformedMapView<>(this, f, null);
  }

  @Override
  public MapView<K, V> filter(final Predicate<K> p) {
    return new FilteredMapView<>(this, p);
  }

  @Override
  public MapView<K, V> memoize() {
    HashTrieMap<K, Deferred<V>> map = HashTrieMap.empty();
    for (final Map.Entry<K, V> entry : wrapped.entrySet()) {
      if (!removals.contains(entry.getKey())) {
        map = map.updated(entry.getKey(), Deferred.value(entry.getValue()));
      }
    }
    for (final K key : delta.keys()) {
      if (!removals.contains(key)) {
        map = map.updated(key, delta.get(key));
      }
    }
    return new MapWrapper<>(map);
  }

  @Override
  public Iterator<Map.Entry<K, Deferred<V>>> iterator() {
    return Iterables.mapIterable(keys, k -> MapView.entryFor(k, get(k))).iterator();
  }
}
