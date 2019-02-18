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

import java.util.Iterator;
import java.util.Map;
import swim.streamlet.combinator.FilterFieldsCombinator;
import swim.streamlet.combinator.MapFieldValuesCombinator;
import swim.streamlet.combinator.MemoizeMapCombinator;
import swim.streamlet.combinator.ReduceFieldsCombinator;
import swim.streamlet.combinator.WatchFieldsCombinator;
import swim.streamlet.function.FilterFieldsFunction;
import swim.streamlet.function.MapFieldValuesFunction;
import swim.streamlet.function.WatchFieldsFunction;
import swim.util.CombinerFunction;

/**
 * Output connector from a {@link Streamlet} for a key-value map state.
 */
public interface MapOutlet<K, V, O> extends Outlet<O> {
  /**
   * Returns {@code true} if the current state of this {@code MapOutlet}
   * contains the given {@code key}; otherwise returns {@code false}.
   */
  boolean containsKey(K key);

  /**
   * Returns the value assocaited with the given {@code key} in the current
   * state of this {@code MapOutlet}, if defined; otherwise returns {@code
   * null}.
   */
  V get(K key);

  /**
   * Returns an {@code Iterator} over the keys in the current state of this
   * {@code MapOutlet}.
   */
  Iterator<K> keyIterator();

  /**
   * Returns an {@code Outlet} that updates when the specified {@code key}
   * updates.
   */
  Outlet<V> outlet(K key);

  /**
   * Marks this {@code MapOutlet} as needing an {@code effect} applied to a
   * given {@code key}.  Invalidating an individual key invalidates the entire
   * state of the {@code Outlet}.  But only the invalidated keys need to be
   * updated in order to reconcile the overall state of the {@code Outlet}.
   */
  void invalidateInputKey(K key, KeyEffect effect);

  /**
   * Reconciles the state of an individual {@code key} in this {@code
   * MapOutlet}, if the version of this {@code MapOutlet}'s state differs from
   * the target {@code version}.  To reconcile the state of a key, the {@code
   * MapOutlet} first invokes {@link Streamlet#reconcile(int)} on its attached
   * streamlets.  Then, for each dependent output, it invokes {@link
   * MapInlet#reconcileOutputKey(Object, int)}, if the dependent output is a
   * {@link MapInlet}, or it invokes {@link Inlet#reconcileOutput(int)}, if the
   * dependent output is not a {@code MapInlet}.
   */
  void reconcileInputKey(K key, int version);

  @Override
  default MapOutlet<K, V, O> memoize() {
    final MemoizeMapCombinator<K, V, O> combinator = new MemoizeMapCombinator<K, V, O>();
    combinator.bindInput(this);
    return combinator;
  }

  default MapOutlet<K, V, ? extends Map<K, V>> filter(FilterFieldsFunction<? super K, ? super V> func) {
    final FilterFieldsCombinator<K, V, O> combinator = new FilterFieldsCombinator<K, V, O>(func);
    combinator.bindInput(this);
    return combinator;
  }

  default <V2> MapOutlet<K, V2, ? extends Map<K, V2>> map(MapFieldValuesFunction<? super K, ? super V, V2> func) {
    final MapFieldValuesCombinator<K, V, V2, O> combinator = new MapFieldValuesCombinator<K, V, V2, O>(func);
    combinator.bindInput(this);
    return combinator;
  }

  default <U> Outlet<U> reduce(U identity, CombinerFunction<? super V, U> accumulator, CombinerFunction<U, U> combiner) {
    final ReduceFieldsCombinator<K, V, O, U> combinator = new ReduceFieldsCombinator<K, V, O, U>(identity, accumulator, combiner);
    combinator.bindInput(this);
    return combinator;
  }

  default MapOutlet<K, V, O> watch(WatchFieldsFunction<? super K, ? super V> func) {
    final WatchFieldsCombinator<K, V, O> combinator = new WatchFieldsCombinator<K, V, O>(func);
    combinator.bindInput(this);
    return this;
  }
}
