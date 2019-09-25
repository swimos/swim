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

import java.util.Iterator;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.dataflow.graph.Iterables;
import swim.dataflow.graph.JoinKind;
import swim.util.Deferred;

/**
 * {@link Junction} that combines together two map inputs (with a common key type) to produce a joined output map
 * based on their values.
 *
 * @param <Key> The shared key type.
 * @param <L>   The left input value type.
 * @param <R>   The right input value type.
 * @param <Out> The output value type.
 */
public class JoinOnKeyJunction<Key, L, R, Out> extends AbstractMapJunction<Key, Out> implements MapJoinJunction<Key, L, R, Key, Out> {

  private final BiFunction<L, R, Out> combine;
  private final Function<L, Out> leftOnly;
  private final Function<R, Out> rightOnly;
  private final JoinKind kind;
  private HashTrieSet<Key> leftKeys = HashTrieSet.empty();
  private HashTrieSet<Key> rightKeys = HashTrieSet.empty();
  private HashTrieSet<Key> joinedKeys = HashTrieSet.empty();
  private Deferred<MapView<Key, R>> rightMap = Deferred.value(MapView.wrap(HashTrieMap.empty()));
  private Deferred<MapView<Key, L>> leftMap = Deferred.value(MapView.wrap(HashTrieMap.empty()));

  /**
   * @param combine   Combines together values with the same key.
   * @param leftOnly  Produces a value when only the left stream provides a value for a key (may be {@code  null}).
   * @param rightOnly Produces a value when only the right stream provides a value for a key (may be {@code  null}).
   */
  public JoinOnKeyJunction(final BiFunction<L, R, Out> combine,
                           final Function<L, Out> leftOnly,
                           final Function<R, Out> rightOnly) {
    this.combine = combine;
    this.leftOnly = leftOnly;
    this.rightOnly = rightOnly;
    if (leftOnly == null) {
      if (rightOnly == null) {
        kind = JoinKind.INNER;
      } else {
        kind = JoinKind.RIGHT;
      }
    } else if (rightOnly == null) {
      kind = JoinKind.LEFT;
    } else {
      kind = JoinKind.FULL;
    }
  }

  public JoinOnKeyJunction(final BiFunction<L, R, Out> combine) {
    this(combine, null, null);
  }

  private static boolean requiresRight(final JoinKind kind) {
    return kind == JoinKind.INNER || kind == JoinKind.RIGHT;
  }

  private static boolean requiresLeft(final JoinKind kind) {
    return kind == JoinKind.INNER || kind == JoinKind.LEFT;
  }

  private final MapReceptacle<Key, L> leftReceptacle = new MapReceptacle<Key, L>() {

    @Override
    public void notifyChange(final Key key, final Deferred<L> value, final Deferred<MapView<Key, L>> map) {
      leftKeys = leftKeys.added(key);
      leftMap = map;
      if (rightKeys.contains(key) || !requiresRight(kind)) {
        if (!joinedKeys.contains(key)) {
          joinedKeys = joinedKeys.added(key);
        }
        final MapView<Key, Out> joinedView = joinedMapView(leftMap, rightMap, joinedKeys);
        emit(key, joinedView.get(key), Deferred.value(joinedView));
      }
    }

    @Override
    public void notifyRemoval(final Key key, final Deferred<MapView<Key, L>> map) {
      leftKeys = leftKeys.removed(key);
      leftMap = map;
      if (joinedKeys.contains(key)) {
        if (requiresLeft(kind) || !rightKeys.contains(key)) {
          joinedKeys = joinedKeys.removed(key);
          emitRemoval(key, joinedMapView(leftMap, rightMap, joinedKeys));
        } else {
          final MapView<Key, Out> joinedView = joinedMapView(leftMap, rightMap, joinedKeys);
          emit(key, joinedView.get(key), Deferred.value(joinedView));
        }
      }
      leftMap = map;
    }
  };

  private final MapReceptacle<Key, R> rightReceptcale = new MapReceptacle<Key, R>() {
    @Override
    public void notifyChange(final Key key, final Deferred<R> value, final Deferred<MapView<Key, R>> map) {
      rightKeys = rightKeys.added(key);
      rightMap = map;
      if (leftKeys.contains(key) || !requiresLeft(kind)) {
        if (!joinedKeys.contains(key)) {
          joinedKeys = joinedKeys.added(key);
        }
        final MapView<Key, Out> joinedView = joinedMapView(leftMap, rightMap, joinedKeys);
        emit(key, joinedView.get(key), Deferred.value(joinedView));
      }
    }

    @Override
    public void notifyRemoval(final Key key, final Deferred<MapView<Key, R>> map) {
      rightKeys = rightKeys.removed(key);
      rightMap = map;
      if (joinedKeys.contains(key)) {
        if (requiresRight(kind) || !leftKeys.contains(key)) {
          joinedKeys = joinedKeys.removed(key);
          emitRemoval(key, joinedMapView(leftMap, rightMap, joinedKeys));
        } else {
          final MapView<Key, Out> joinedView = joinedMapView(leftMap, rightMap, joinedKeys);
          emit(key, joinedView.get(key), Deferred.value(joinedView));
        }

      }
      rightMap = map;
    }
  };

  @Override
  public MapReceptacle<Key, L> first() {
    return leftReceptacle;
  }

  @Override
  public MapReceptacle<Key, R> second() {
    return rightReceptcale;
  }

  /**
   * Create a lazy map view that joines together the map views from the left and right input channels.
   *
   * @param left       The left map view.
   * @param right      The right map view.
   * @param joinedKeys The keys that should exist in the joined map.
   * @return The map view.
   */
  private MapView<Key, Out> joinedMapView(final Deferred<MapView<Key, L>> left,
                                          final Deferred<MapView<Key, R>> right,
                                          final HashTrieSet<Key> joinedKeys) {

    final SetView<Key> keys = SetView.wrap(joinedKeys);

    final MapView<Key, L> leftView = left.get();
    final MapView<Key, R> rightView = right.get();
    return new MapView<Key, Out>() {
      @Override
      public boolean containsKey(final Key key) {
        return joinedKeys.contains(key);
      }

      @Override
      public Iterator<Map.Entry<Key, Deferred<Out>>> iterator() {
        return Iterables.mapIterable(keys, k -> MapView.entryFor(k, get(k))).iterator();
      }

      @Override
      public SetView<Key> keys() {
        return keys;
      }

      @Override
      public Deferred<Out> get(final Key key) {
        final boolean inLeft = leftView.containsKey(key);
        final boolean inRight = rightView.containsKey(key);
        if (inLeft && inRight) {
          return () -> combine.apply(leftView.get(key).get(), rightView.get(key).get());
        } else if (inLeft) {
          return () -> leftOnly.apply(leftView.get(key).get());
        } else if (inRight) {
          return () -> rightOnly.apply(rightView.get(key).get());
        } else {
          return null;
        }
      }
    };
  }
}
