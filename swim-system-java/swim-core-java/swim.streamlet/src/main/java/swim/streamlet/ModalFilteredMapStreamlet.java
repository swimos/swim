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
import java.util.HashSet;
import java.util.Map;
import java.util.function.BiPredicate;
import java.util.function.Function;
import swim.collections.HashTrieMap;
import swim.streaming.MapView;
import swim.streaming.persistence.ValuePersister;
import swim.util.Deferred;
import swim.util.Pair;

/**
 * Filtered map streamlet where the behaviour of the filtering is controlled by an auxiliary control input.
 *
 * @param <Key>   The type of the keys.
 * @param <Value> The type of the values.
 * @param <Mode>  The type of the control values
 */
public class ModalFilteredMapStreamlet<Key, Value, Mode> extends ModalMapStreamlet<Key, Key, Value, Value, Mode, BiPredicate<Key, Value>> {

  private final Function<Mode, BiPredicate<Key, Value>> switcher;
  private HashTrieMap<Key, Value> filtered = HashTrieMap.empty();
  private Deferred<MapView<Key, Value>> view = null;

  /**
   * @param init     The initial value of the mode.
   * @param switcher Switches the filter based on the mode.
   */
  public ModalFilteredMapStreamlet(final Mode init, final Function<Mode, BiPredicate<Key, Value>> switcher) {
    super(switcher.apply(init));
    this.switcher = switcher;
  }

  /**
   * @param modePersister Persistence for the mode.
   * @param switcher      Switches the filter based on the mode.
   */
  public ModalFilteredMapStreamlet(final ValuePersister<Mode> modePersister,
                                   final Function<Mode, BiPredicate<Key, Value>> switcher) {
    super(modePersister, switcher.apply(modePersister.get()));
    this.switcher = switcher;
  }

  @Override
  protected Deferred<BiPredicate<Key, Value>> changeMode(final Deferred<Mode> mode) {
    return mode.andThen(switcher).memoize();
  }

  @Override
  protected void didChangeMode(final Deferred<BiPredicate<Key, Value>> state) {
    if (view != null) {
      final BiPredicate<Key, Value> predicate = state.get();
      final HashSet<Key> toRemove = new HashSet<>();
      for (final Map.Entry<Key, Value> entry : filtered.entrySet()) {
        if (!predicate.test(entry.getKey(), entry.getValue())) {
          toRemove.add(entry.getKey());
        }
      }
      final ArrayList<Pair<Key, Value>> toRestore = new ArrayList<>();
      final MapView<Key, Value> matView = view.get();
      for (final Map.Entry<Key, Deferred<Value>> entry : matView) {
        final Key k = entry.getKey();
        if (!filtered.containsKey(k)) {
          final Value v = entry.getValue().get();
          if (predicate.test(k, v)) {
            toRestore.add(Pair.pair(k, v));
          }
        }
      }

      //The changes are simultaneous so we apply them all at once before emitting the events.
      for (final Key key : toRemove) {
        filtered = filtered.removed(key);
      }
      for (final Pair<Key, Value> entry : toRestore) {
        filtered = filtered.updated(entry.getFirst(), entry.getSecond());
      }
      for (final Key key : toRemove) {
        emitRemoval(key, MapView.wrap(filtered));
      }
      for (final Pair<Key, Value> entry : toRestore) {
        emit(entry.getFirst(), Deferred.value(entry.getSecond()), Deferred.value(MapView.wrap(filtered)));
      }
    }
  }

  @Override
  protected void notifyChange(final Deferred<BiPredicate<Key, Value>> state, final Key key, final Deferred<Value> value, final Deferred<MapView<Key, Value>> map) {
    view = map;
    final BiPredicate<Key, Value> predicate = state.get();
    final Value newVal = value.get();
    if (predicate.test(key, newVal)) {
      filtered = filtered.updated(key, newVal);
      emit(key, newVal, Deferred.value(MapView.wrap(filtered)));
    } else {
      //If a key that was previously not filtered is now not passing the filter, remove it.
      if (filtered.containsKey(key)) {
        filtered = filtered.removed(key);
        emitRemoval(key, Deferred.value(MapView.wrap(filtered)));
      }
    }
  }

  @Override
  protected void notifyRemoval(final Deferred<BiPredicate<Key, Value>> state, final Key key, final Deferred<MapView<Key, Value>> map) {
    view = map;
    if (filtered.containsKey(key)) {
      filtered = filtered.removed(key);
      emitRemoval(key, Deferred.value(MapView.wrap(filtered)));
    }
  }
}
