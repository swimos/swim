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

import java.util.ArrayList;
import swim.collections.HashTrieMap;
import swim.streaming.MapReceptacle;
import swim.streaming.MapView;
import swim.streaming.Receptacle;
import swim.util.Deferred;
import swim.util.Either;
import swim.util.Unit;

/**
 * Utility methods, primarily for tesing or debugging {@link Conduit}s.
 */
public final class ConnectorUtilities {

  private ConnectorUtilities() {
  }

  @SafeVarargs
  public static <In, Out> ArrayList<Out> pushData(final Conduit<In, Out> conduit, final In... values) {
    final ArrayList<Out> output = new ArrayList<>(values.length);
    final Receptacle<Out> receptacle = x -> output.add(x.get());
    conduit.subscribe(receptacle);
    for (final In val : values) {
      conduit.notifyChange(Deferred.value(val));
    }
    return output;
  }

  public interface MapAction<K, V> {

    void push(MapReceptacle<K, V> receptacle);

  }

  @FunctionalInterface
  public interface UpdateHandler<K, V> {

    void onUpdate(K key, V value, MapView<K, V> map);

  }

  @FunctionalInterface
  public interface RemovalHandler<K, V> {

    void onRemove(K key, MapView<K, V> map);

  }

  public static final class Update<K, V> implements MapAction<K, V> {

    private final K key;
    private final V value;
    private final MapView<K, V> state;

    Update(final K key, final V value) {
      this.key = key;
      this.value = value;
      state = MapView.wrap(HashTrieMap.<K, V>empty().updated(key, value));
    }

    Update(final K key, final V value, final MapView<K, V> state) {
      this.key = key;
      this.value = value;
      this.state = state;
    }

    @Override
    public void push(final MapReceptacle<K, V> receptacle) {
      receptacle.notifyChange(key, Deferred.value(value), Deferred.value(state));
    }
  }

  public static final class Remove<K, V> implements  MapAction<K, V> {

    private final K key;
    private final MapView<K, V> state;

    Remove(final K key) {
      this.key = key;
      state = MapView.wrap(HashTrieMap.empty());
    }

    Remove(final K key, final MapView<K, V> state) {
      this.key = key;
      this.state = state;
    }

    @Override
    public void push(final MapReceptacle<K, V> receptacle) {
      receptacle.notifyRemoval(key, Deferred.value(state));
    }
  }

  public static final class ActionAccumulator<K, V> {

    private HashTrieMap<K, V> map = HashTrieMap.empty();

    public Update<K, V> update(final K key, final V value) {
      final Update<K, V> upd = ConnectorUtilities.update(key, value, map);
      map = map.updated(key, value);
      return upd;
    }

    public Remove<K, V> remove(final K key) {
      final Remove<K, V> rem = ConnectorUtilities.remove(key, map);
      map = map.removed(key);
      return rem;
    }

  }

  public static <K, V> Update<K, V> update(final K key, final V value) {
    return new Update<>(key, value);
  }

  public static <K, V> Update<K, V> update(final K key, final V value, final MapView<K, V> state) {
    return new Update<>(key, value, state);
  }

  public static <K, V> Update<K, V> update(final K key, final V value, final HashTrieMap<K, V> state) {
    return new Update<>(key, value, MapView.wrap(state.updated(key, value)));
  }

  public static <K, V> Remove<K, V> remove(final K key) {
    return new Remove<>(key);
  }

  public static <K, V> Remove<K, V> remove(final K key, final HashTrieMap<K, V> state) {
    return new Remove<>(key, MapView.wrap(state.removed(key)));
  }

  public static <K, V> Remove<K, V> remove(final K key, final MapView<K, V> state) {
    return new Remove<>(key, state);
  }

  @SafeVarargs
  public static <K, V, Out> ArrayList<Out> pushData(final MapToValueConduit<K, V, Out> conduit, final MapAction<K, V>... actions) {
    final ArrayList<Out> output = new ArrayList<>(actions.length);
    final Receptacle<Out> receptacle = x -> output.add(x.get());
    conduit.subscribe(receptacle);
    for (final MapAction<K, V> action : actions) {
      action.push(conduit);
    }
    return output;
  }

  @SafeVarargs
  public static <In, KOut, VOut> ArrayList<MapAction<KOut, VOut>> pushData(final ValueToMapConduit<In, KOut, VOut> conduit, final In... values) {
    final ArrayList<MapAction<KOut, VOut>> output = new ArrayList<>(values.length);
    final MapReceptacle<KOut, VOut> receptacle = new MapReceptacle<KOut, VOut>() {
      @Override
      public void notifyChange(final KOut key, final Deferred<VOut> value, final Deferred<MapView<KOut, VOut>> map) {
        output.add(new Update<>(key, value.get(), map.get()));
      }

      @Override
      public void notifyRemoval(final KOut key, final Deferred<MapView<KOut, VOut>> map) {
        output.add(new Remove<>(key, map.get()));
      }
    };
    conduit.subscribe(receptacle);
    for (final In value : values) {
      conduit.notifyChange(Deferred.value(value));
    }
    return output;
  }

  @SafeVarargs
  public static <KIn, VIn, KOut, VOut> ArrayList<MapAction<KOut, VOut>> pushData(final MapConduit<KIn, KOut, VIn, VOut> conduit, final MapAction<KIn, VIn>... actions) {
    final ArrayList<MapAction<KOut, VOut>> output = new ArrayList<>(actions.length);
    final MapReceptacle<KOut, VOut> receptacle = new MapReceptacle<KOut, VOut>() {
      @Override
      public void notifyChange(final KOut key, final Deferred<VOut> value, final Deferred<MapView<KOut, VOut>> map) {
        output.add(new Update<>(key, value.get(), map.get()));
      }

      @Override
      public void notifyRemoval(final KOut key, final Deferred<MapView<KOut, VOut>> map) {
        output.add(new Remove<>(key, map.get()));
      }
    };
    conduit.subscribe(receptacle);
    for (final MapAction<KIn, VIn> action : actions) {
      action.push(conduit);
    }
    return output;
  }

  @SafeVarargs
  public static <KIn, VIn, KOut, VOut, T> ArrayList<MapAction<KOut, VOut>> pushData(
      final MapJunction2<KIn, KOut, VIn, VOut, T> conduit,
      final Either<MapAction<KIn, VIn>, T>... events) {

    final ArrayList<MapAction<KOut, VOut>> output = new ArrayList<>(events.length);
    final MapReceptacle<KOut, VOut> receptacle = new MapReceptacle<KOut, VOut>() {
      @Override
      public void notifyChange(final KOut key, final Deferred<VOut> value, final Deferred<MapView<KOut, VOut>> map) {
        output.add(new Update<>(key, value.get(), map.get()));
      }

      @Override
      public void notifyRemoval(final KOut key, final Deferred<MapView<KOut, VOut>> map) {
        output.add(new Remove<>(key, map.get()));
      }
    };
    conduit.subscribe(receptacle);
    for (final Either<MapAction<KIn, VIn>, T> event : events) {
      event.match(
          action -> {
            action.push(conduit.first());
            return Unit.INSTANCE;
          },
          val -> {
            conduit.second().notifyChange(Deferred.value(val));
            return Unit.INSTANCE;
          });
    }
    return output;
  }

  @SafeVarargs
  public static <KIn, VIn1, VIn2, KOut, VOut> ArrayList<MapAction<KOut, VOut>> pushData(
      final MapJoinJunction<KIn, VIn1, VIn2, KOut, VOut> conduit,
      final Either<MapAction<KIn, VIn1>, MapAction<KIn, VIn2>>... events) {

    final ArrayList<MapAction<KOut, VOut>> output = new ArrayList<>(events.length);
    final MapReceptacle<KOut, VOut> receptacle = new MapReceptacle<KOut, VOut>() {
      @Override
      public void notifyChange(final KOut key, final Deferred<VOut> value, final Deferred<MapView<KOut, VOut>> map) {
        output.add(new Update<>(key, value.get(), map.get()));
      }

      @Override
      public void notifyRemoval(final KOut key, final Deferred<MapView<KOut, VOut>> map) {
        output.add(new Remove<>(key, map.get()));
      }
    };
    conduit.subscribe(receptacle);
    for (final Either<MapAction<KIn, VIn1>, MapAction<KIn, VIn2>> event : events) {
      event.match(
          action -> {
            action.push(conduit.first());
            return Unit.INSTANCE;
          },
          action -> {
            action.push(conduit.second());
            return Unit.INSTANCE;
          });
    }
    return output;
  }

  @SafeVarargs
  public static <In1, In2, Out> ArrayList<Out> pushData(final Junction2<In1, In2, Out> conduit,
                                                        final Either<In1, In2>... values) {
    final ArrayList<Out> output = new ArrayList<>(values.length);
    final Receptacle<Out> receptacle = x -> output.add(x.get());
    conduit.subscribe(receptacle);
    for (final Either<In1, In2> val : values) {
      val.match(
          in -> {
            conduit.first().notifyChange(Deferred.value(in));
            return Unit.INSTANCE;
          },
          in -> {
            conduit.second().notifyChange(Deferred.value(in));
            return Unit.INSTANCE;
          });

    }
    return output;
  }



}
