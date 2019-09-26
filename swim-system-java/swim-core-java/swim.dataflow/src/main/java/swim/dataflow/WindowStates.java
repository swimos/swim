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

package swim.dataflow;

import swim.collections.BTreeMap;
import swim.collections.FingerTrieSeq;
import swim.dataflow.persistence.BTreeMapForm;
import swim.dataflow.windows.MapWindowAccumulators;
import swim.dataflow.windows.PersisterAccumulators;
import swim.dataflow.windows.WindowAccumulators;
import swim.streaming.persistence.MapPersister;
import swim.streaming.persistence.PersistenceProvider;
import swim.streaming.timestamps.WithTimestamp;
import swim.structure.Form;
import swim.structure.Value;
import swim.structure.form.FingerTrieSeqForm;

/**
 * Factories for {@link WindowAccumulators}s to hold the current state of a windowed conduit.
 */
final class WindowStates {

  private WindowStates() {
  }

  /**
   * Create a {@link Form} for a {@link FingerTrieSeq} of elements.
   * @param elementForm The form of the elements.
   * @param <T> The type of the elements.
   * @return The {@link Form} of the sequence.
   */
  static <T> Form<FingerTrieSeq<WithTimestamp<T>>> sequenceForm(final Form<T> elementForm) {
    final Form<WithTimestamp<T>> withTsForm = WithTimestamp.form(elementForm);
    return new FingerTrieSeqForm<>(withTsForm);
  }

  /**
   * Create a {@link Form} for a {@link BTreeMap}.
   * @param keyForm The form of the map key type.
   * @param valForm The form of the map value type.
   * @param <K> The type of the keys.
   * @param <V> The type of the values.
   * @param <U> The aggregation type.
   * @return The form of the map.
   */
  static <K, V, U> Form<BTreeMap<K, V, U>> mapForm(final Form<K> keyForm, final Form<V> valForm) {
    return new BTreeMapForm<>(keyForm, valForm);
  }

  /**
   * Create an accumulator for a non-collection type.
   * @param isTransient Whether the state is transient.
   * @param key The unique key to identify the state store.
   * @param persistence Context for creating state stores.
   * @param windowForm The form of the windows.
   * @param stateForm The form of the state values.
   * @param <W> The type of the windows.
   * @param <U> The type of the state values.
   * @return The accumulators.
   */
  static <W, U> WindowAccumulators<W, U> forSimpleState(final boolean isTransient,
                                                        final Value key,
                                                        final PersistenceProvider persistence,
                                                        final Form<W> windowForm,
                                                        final Form<U> stateForm) {
    if (isTransient) {
      return new MapWindowAccumulators<>();
    } else {
      final MapPersister<W, U> persister = persistence.forMap(key, windowForm, stateForm);
      return new PersisterAccumulators<>(persister);
    }
  }

  /**
   * Create an accumulator for a map type.
   * @param isTransient Whether the state is transient.
   * @param key The unique key to identify the state store.
   * @param persistence Context for creating state stores.
   * @param windowForm The form of the windows.@param windowForm
   * @param criterionForm The form of the eviction criterion.
   * @param form The form of the map values.
   * @param <U> The aggregation type.
   * @param <W> The window type.
   * @param <T> The type of the state values.
   * @param <K> The type of the eviction criteria.
   * @return The accumulators.
   */
  static <U, W, T, K extends Comparable<K>> WindowAccumulators<W, BTreeMap<K, T, U>> forMapState(
      final boolean isTransient,
      final Value key,
      final PersistenceProvider persistence,
      final Form<W> windowForm,
      final Form<K> criterionForm,
      final Form<T> form) {
    if (isTransient) {
      return new MapWindowAccumulators<>();
    } else {
      final Form<BTreeMap<K, T, U>> stateForm = mapForm(criterionForm, form);
      final MapPersister<W, BTreeMap<K, T, U>> persister = persistence.forMap(
          key, windowForm, stateForm);
      return new PersisterAccumulators<>(persister);
    }
  }

  /**
   * Create an accumulator for a sequence type.
   * @param isTransient Whether the state is transient.
   * @param key The unique key to identify the state store.
   * @param persistence Context for creating state stores.
   * @param windowForm The form of the windows.@param windowForm
   * @param elementForm The form of the state values.
   * @param <W> The window type.
   * @param <T> The type of the state values.
   * @return The accumulators.
   */
  static <W, T> WindowAccumulators<W, FingerTrieSeq<WithTimestamp<T>>> forSequencesState(
      final boolean isTransient,
      final Value key,
      final PersistenceProvider persistence,
      final Form<W> windowForm,
      final Form<T> elementForm) {
    if (isTransient) {
      return new MapWindowAccumulators<>();
    } else {
      final Form<FingerTrieSeq<WithTimestamp<T>>> stateForm = WindowStates.sequenceForm(elementForm);
      final MapPersister<W, FingerTrieSeq<WithTimestamp<T>>> persister = persistence.forMap(
          key, windowForm, stateForm);
      return new PersisterAccumulators<>(persister);
    }
  }

}
