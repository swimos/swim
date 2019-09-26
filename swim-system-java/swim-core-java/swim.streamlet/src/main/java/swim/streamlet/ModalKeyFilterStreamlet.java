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

import java.util.Map;
import java.util.function.Function;
import java.util.function.Predicate;
import swim.collections.HashTrieSet;
import swim.streaming.MapView;
import swim.streaming.persistence.ValuePersister;
import swim.util.Deferred;

/**
 * Filtered {@link MapStreamlet} that filters solely by key using a predicate that is modified by an auxiliary control
 * input.
 *
 * @param <Key>  The type of the keys.
 * @param <Val>  The type of the values.
 * @param <Mode> The type of the control values.
 */
public class ModalKeyFilterStreamlet<Key, Val, Mode> extends ModalMapStreamlet<Key, Key, Val, Val, Mode, Predicate<Key>> {

  private final Function<Mode, Predicate<Key>> switcher;
  private HashTrieSet<Key> keys = HashTrieSet.empty();
  private Deferred<MapView<Key, Val>> view = null;

  /**
   * @param init     The initial value of the mode.
   * @param switcher Alters the predicate based on the mode.
   */
  public ModalKeyFilterStreamlet(final Mode init, final Function<Mode, Predicate<Key>> switcher) {
    super(switcher.apply(init));
    this.switcher = switcher;
  }

  /**
   * @param modePersister Persistence for the mode.
   * @param switcher      Alters the predicate based on the mode.
   */
  public ModalKeyFilterStreamlet(final ValuePersister<Mode> modePersister,
                                 final Function<Mode, Predicate<Key>> switcher) {
    super(modePersister, switcher.apply(modePersister.get()));
    this.switcher = switcher;
  }

  @Override
  protected Deferred<Predicate<Key>> changeMode(final Deferred<Mode> mode) {
    if (view == null) {
      return mode.andThen(switcher).memoize();
    } else {
      final Predicate<Key> newPredicate = switcher.apply(mode.get());

      final MapView<Key, Val> matView = view.get();

      final Deferred<MapView<Key, Val>> filteredView = Deferred.value(matView.filter(newPredicate));

      for (final Map.Entry<Key, Deferred<Val>> entry : matView) {
        final Key k = entry.getKey();
        if (newPredicate.test(k)) {
          if (!keys.contains(k)) {
            keys = keys.added(k);
            emit(k, entry.getValue(), filteredView);
          }
        } else if (keys.contains(k)) {
          keys = keys.removed(k);
          emitRemoval(k, filteredView);
        }
      }

      return Deferred.value(newPredicate);
    }
  }

  @Override
  protected void notifyChange(final Deferred<Predicate<Key>> state, final Key key, final Deferred<Val> value, final Deferred<MapView<Key, Val>> map) {
    view = map;
    final Predicate<Key> predicate = state.get();
    if (predicate.test(key)) {
      keys = keys.added(key);
      emit(key, value, map.andThen(m -> m.filter(predicate)));
    }
  }

  @Override
  protected void notifyRemoval(final Deferred<Predicate<Key>> state, final Key key, final Deferred<MapView<Key, Val>> map) {
    view = map;
    final Predicate<Key> predicate = state.get();
    if (predicate.test(key)) {
      keys = keys.removed(key);
      emitRemoval(key, map.andThen(m -> m.filter(predicate)));
    }
  }
}
