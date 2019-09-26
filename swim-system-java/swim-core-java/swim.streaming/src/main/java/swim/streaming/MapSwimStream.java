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

import java.util.Map;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.function.BiPredicate;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.ToLongFunction;
import swim.streaming.sampling.Sampling;
import swim.streaming.windows.KeyedWindowSpec;
import swim.streaming.windows.TemporalWindowAssigner;
import swim.streaming.windows.WindowSpec;
import swim.streaming.windows.WindowState;
import swim.structure.Form;
import swim.util.Pair;

/**
 * An abstract stream of mappings from keys to values. In combination with {@link SwimStream} this is used to construct
 * a directed graph of combinators which pump data from sources to sinks. The graph can then be instantiated against a
 * set of source {@link MapJunction}s and sink {@link MapReceptacle}s to
 * create an executable data-flow that can run inside a Swim agent.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public interface MapSwimStream<K, V> {

  /**
   * @return The unique identifier of this stream.
   */
  String id();

  /**
   * Set the unique identifier of this stream.
   *
   * @param id The new identifier.
   * @return This stream.
   */
  MapSwimStream<K, V> setId(String id);

  /**
   * @return The form of the key type of the stream.
   */
  Form<K> keyForm();

  /**
   * @return The form of the value type of the stream.
   */
  Form<V> valueForm();

  /**
   * @return Timestamp assigner for the stream.
   */
  ToLongFunction<V> getTimestamps();

  /**
   * Replace the timestamps on the values in this stream.
   *
   * @param datation The timestamp assignment function.
   * @return A copy of this stream with different timestamps.
   */
  MapSwimStream<K, V> updateTimestamps(ToLongFunction<V> datation);

  /**
   * @return A stream containing just the keys of this stream.
   */
  CollectionSwimStream<K, Set<K>> keys();

  /**
   * Transform the keys of this stream.
   *
   * @param f     The function to transform the keys.
   * @param form  The from of the new key type.
   * @param onRem Mapping from key removals.
   * @param <K2>  The type of the new keys.
   * @return A new stream with the keys transformed.
   */
  <K2> MapSwimStream<K2, V> mapKeys(BiFunction<K, V, ? extends K2> f, Function<K, Set<K2>> onRem, Form<K2> form);

  /**
   * Transform the keys of this stream.
   *
   * @param f     The function to transform the keys.
   * @param onRem Mapping from key removals.
   * @return A new stream with the keys transformed.
   */
  default MapSwimStream<K, V> mapKeys(final BiFunction<K, V, ? extends K> f, final Function<K, Set<K>> onRem) {
    return mapKeys(f, onRem, keyForm());
  }

  /**
   * Transform the values of this stream.
   *
   * @param f       The function to transform the values.
   * @param form    The form of the new value type.
   * @param memoize Memoize the computed values.
   * @param <V2>    The type of the new values.
   * @return A new stream with the values transformed.
   */
  <V2> MapSwimStream<K, V2> mapValues(BiFunction<K, V, ? extends V2> f, boolean memoize, Form<V2> form);

  /**
   * Transform the values of this stream.
   *
   * @param f    The function to transform the values.
   * @param form The form of the new value type.
   * @param <V2> The type of the new values.
   * @return A new stream with the values transformed.
   */
  default <V2> MapSwimStream<K, V2> mapValues(final BiFunction<K, V, ? extends V2> f, final Form<V2> form) {
    return mapValues(f, false, form);
  }

  /**
   * Transform the values of this stream.
   *
   * @param f The function to transform the values.
   * @return A new stream with the values transformed.
   */
  default MapSwimStream<K, V> mapValues(final BiFunction<K, V, ? extends V> f) {
    return mapValues(f, false, valueForm());
  }

  /**
   * Transform both the keys and values of this stream.
   *
   * @param f     The function to transform the keys and values.
   * @param onRem Mapping for key removals.
   * @param kform The form of the new key type.
   * @param vform The form of the new value type.
   * @param <K2>  The type of the new keys.
   * @param <V2>  The type of the new values.
   * @return A new stream with the keys and values transformed.
   */
  <K2, V2> MapSwimStream<K2, V2> map(BiFunction<K, V, Pair<K2, V2>> f, Function<K, Set<K2>> onRem,
                                     Form<K2> kform, Form<V2> vform);

  /**
   * Transform both the keys and values of this stream.
   *
   * @param f     The function to transform the keys and values.
   * @param onRem Mapping for key removals.
   * @return A new stream with the keys and values transformed.
   */
  default MapSwimStream<K, V> map(final BiFunction<K, V, Pair<K, V>> f, final Function<K, Set<K>> onRem) {
    return map(f, onRem, keyForm(), valueForm());
  }

  /**
   * Flat-map over the keys and values of this stream. For each key-value pair a sequence of new key-value pairs
   * is generated, each of which becomes a new record in the transformed stream.
   *
   * @param f     The function to transform the key-value pairs.
   * @param onRem Mapping for key removals.
   * @param kform The form of the new key type.
   * @param vform The form of the new value type.
   * @param <K2>  The type of the new keys.
   * @param <V2>  The type of the new values.
   * @return A new stream with both the keys and values transformed.
   */
  <K2, V2> MapSwimStream<K2, V2> flatMap(BiFunction<K, V, Iterable<Pair<K2, V2>>> f,
                                         Function<K, Set<K2>> onRem, Form<K2> kform, Form<V2> vform);

  /**
   * Flat-map over the keys and values of this stream. For each key-value pair a sequence of new key-value pairs
   * is generated, each of which becomes a new record in the transformed stream.
   *
   * @param f     The function to transform the key-value pairs.
   * @param onRem Mapping for key removals.
   * @return A new stream with both the keys and values transformed.
   */
  default MapSwimStream<K, V> flatMap(final BiFunction<K, V, Iterable<Pair<K, V>>> f,
                                      final Function<K, Set<K>> onRem) {
    return flatMap(f, onRem, keyForm(), valueForm());
  }

  default SwimStream<V> get(final K key) {
    return get(key, Sampling.eager());
  }

  /**
   * Get the stream of values associated with a specific key.
   *
   * @param key      The key.
   * @param sampling The sampling strategy for the link.
   * @return The value stream.
   */
  SwimStream<V> get(K key, Sampling sampling);

  /**
   * Get the stream of values associated with a dynamically changing key.
   *
   * @param keys        The stream of keys.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @return The value stream.
   */
  default SwimStream<V> get(final SwimStream<K> keys, final boolean isTransient) {
    return get(keys, Sampling.eager(), isTransient);
  }

  /**
   * Get the stream of values associated with a dynamically changing key.
   *
   * @param keys The stream of keys.
   * @return The value stream.
   */
  default SwimStream<V> get(final SwimStream<K> keys) {
    return get(keys, Sampling.eager());
  }

  /**
   * Get the stream of values associated with a dynamically changing key.
   *
   * @param keys        The stream of keys.
   * @param sampling    The sampling strategy for the link.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @return The value stream.
   */
  SwimStream<V> get(SwimStream<K> keys, Sampling sampling, boolean isTransient);

  /**
   * Get the stream of values associated with a dynamically changing key.
   *
   * @param keys     The stream of keys.
   * @param sampling The sampling strategy for the link.
   * @return The value stream.
   */
  default SwimStream<V> get(final SwimStream<K> keys, final Sampling sampling) {
    return get(keys, sampling, false);
  }

  /**
   * Interpret this as a {@link SwimStream} of collections of {@link Pair}s of keys and values.
   *
   * @return The Key-Value stream.
   */
  SwimStream<Map<K, V>> stream();

  /**
   * Apply a binary operator across the values for each key of this stream. The new stream will maintain running
   * accumulations as computed by the operator.
   *
   * @param op       The operator.
   * @param sampling Sampling strategy for the link (this will control which values the operator is applied to).
   * @return A stream of running accumulations.
   */
  MapSwimStream<K, V> reduce(BinaryOperator<V> op, Sampling sampling, boolean isTransient);

  /**
   * Apply a binary operator across the values for each key of this stream. The new stream will maintain running
   * accumulations as computed by the operator.
   *
   * @param op       The operator.
   * @param sampling Sampling strategy for the link (this will control which values the operator is applied to).
   * @return A stream of running accumulations.
   */
  default MapSwimStream<K, V> reduce(final BinaryOperator<V> op, final Sampling sampling) {
    return reduce(op, sampling, false);
  }

  /**
   * Apply a binary operator across the values for each key of this stream. The new stream will maintain running
   * accumulations as computed by the operator.
   *
   * @param op The operator.
   * @return A stream of running accumulations.
   */
  default MapSwimStream<K, V> reduce(final BinaryOperator<V> op, final boolean isTransient) {
    return reduce(op, Sampling.eager(), isTransient);
  }

  /**
   * Apply a binary operator across the values for each key of this stream. The new stream will maintain running
   * accumulations as computed by the operator.
   *
   * @param op The operator.
   * @return A stream of running accumulations.
   */
  default MapSwimStream<K, V> reduce(final BinaryOperator<V> op) {
    return reduce(op, Sampling.eager());
  }

  /**
   * Fold across the values of the stream for a each key to produce a new stream. For each key and each sample taken
   * from this stream apply the provided function to it and the previously computed value (starting with the specified
   * seed). The output of the function is the new value of the stream for the key.
   *
   * @param seed     The seed value for the computation.
   * @param op       The function to combine the values of this stream with the previously computed value.
   * @param form     The form of the new values.
   * @param sampling The sampling strategy for the link (this will control which values the function is applied to).
   * @param isTransient Whether the stream stores its state.
   * @param <U>      The type of the new values.
   * @return A new stream of the applications of the function.
   */
  <U> MapSwimStream<K, U> fold(U seed, BiFunction<U, V, U> op, Form<U> form, Sampling sampling, boolean isTransient);

  /**
   * Fold across the values of the stream for a each key to produce a new stream. For each key and each sample taken
   * from this stream apply the provided function to it and the previously computed value (starting with the specified
   * seed). The output of the function is the new value of the stream for the key.
   *
   * @param seed     The seed value for the computation.
   * @param op       The function to combine the values of this stream with the previously computed value.
   * @param form     The form of the new values.
   * @param sampling The sampling strategy for the link (this will control which values the function is applied to).
   * @param <U>      The type of the new values.
   * @return A new stream of the applications of the function.
   */
  default <U> MapSwimStream<K, U> fold(final U seed, final BiFunction<U, V, U> op,
                                       final Form<U> form, final Sampling sampling) {
    return fold(seed, op, form, sampling, false);
  }

  /**
   * Folded across the values of the stream for a each key to produce a new stream. For each key and each sample taken
   * from this stream apply the provided function to it and the previously computed value (starting with the specified
   * seed). The output of the function is the new value of the stream for the key.
   *
   * @param seed The seed value for the computation.
   * @param op   The function to combine the values of this stream with the previously computed value.
   * @param form The form of the new values.
   * @param isTransient Whether the stream stores its state.
   * @param <U>  The type of the new values.
   * @return A new stream of the applications of the function.
   */
  default <U> MapSwimStream<K, U> fold(final U seed, final BiFunction<U, V, U> op,
                                       final Form<U> form, final boolean isTransient) {
    return fold(seed, op, form, Sampling.eager(), isTransient);
  }

  /**
   * Folded across the values of the stream for a each key to produce a new stream. For each key and each sample taken
   * from this stream apply the provided function to it and the previously computed value (starting with the specified
   * seed). The output of the function is the new value of the stream for the key.
   *
   * @param seed The seed value for the computation.
   * @param op   The function to combine the values of this stream with the previously computed value.
   * @param form The form of the new values.
   * @param <U>  The type of the new values.
   * @return A new stream of the applications of the function.
   */
  default <U> MapSwimStream<K, U> fold(final U seed, final BiFunction<U, V, U> op, final Form<U> form) {
    return fold(seed, op, form, Sampling.eager(), false);
  }

  /**
   * Folded across the values of the stream for a each key to produce a new stream. For each key and each sample taken
   * from this stream apply the provided function to it and the previously computed value (starting with the specified
   * seed). The output of the function is the new value of the stream for the key.
   *
   * @param seed        The seed value for the computation.
   * @param op          The function to combine the values of this stream with the previously computed value.
   * @param isTransient Whether the stream stores its state.
   * @return A new stream of the applications of the function.
   */
  default MapSwimStream<K, V> fold(final V seed, final BiFunction<V, V, V> op, final boolean isTransient) {
    return fold(seed, op, valueForm(), Sampling.eager(), isTransient);
  }

  /**
   * Folded across the values of the stream for a each key to produce a new stream. For each key and each sample taken
   * from this stream apply the provided function to it and the previously computed value (starting with the specified
   * seed). The output of the function is the new value of the stream for the key.
   *
   * @param seed The seed value for the computation.
   * @param op   The function to combine the values of this stream with the previously computed value.
   * @return A new stream of the applications of the function.
   */
  default MapSwimStream<K, V> fold(final V seed, final BiFunction<V, V, V> op) {
    return fold(seed, op, valueForm(), Sampling.eager());
  }

  /**
   * Modally apply a binary operator across the values for each key of this stream. The new stream will maintain running
   * accumulating as computed by the operator. The difference between this and {@link #reduce(BinaryOperator, Sampling)}
   * is that an auxiliary control stream modifies the behaviour of the operator.
   *
   * @param initialMode   The initial value of the mode.
   * @param op            The modal operator.
   * @param sampling      Sampling strategy for the link (this will control which values the operator is applied to).
   * @param controlStream The control stream of the operator.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @return A stream of running accumulations.
   */
  <M> MapSwimStream<K, V> reduceModal(M initialMode, Function<M, BinaryOperator<V>> op, Sampling sampling,
                                      SwimStream<M> controlStream, boolean isTransient);

  /**
   * Modally apply a binary operator across the values for each key of this stream. The new stream will maintain running
   * accumulating as computed by the operator. The difference between this and {@link #reduce(BinaryOperator, Sampling)}
   * is that an auxiliary control stream modifies the behaviour of the operator.
   *
   * @param initialMode   The initial value of the mode.
   * @param op            The modal operator.
   * @param sampling      Sampling strategy for the link (this will control which values the operator is applied to).
   * @param controlStream The control stream of the operator.
   * @return A stream of running accumulations.
   */
  default <M> MapSwimStream<K, V> reduceModal(final M initialMode, final Function<M, BinaryOperator<V>> op,
                                              final Sampling sampling,
                                              final SwimStream<M> controlStream) {
    return reduceModal(initialMode, op, sampling, controlStream, false);
  }

  /**
   * Modally apply a binary operator across the values for each key of this stream. The new stream will maintain running
   * accumulating as computed by the operator. The difference between this and {@link #reduce(BinaryOperator)}
   * is that an auxiliary control stream modifies the behaviour of the operator.
   *
   * @param initialMode   The initial value of the mode.
   * @param op            The modal operator.
   * @param controlStream The control stream of the operator.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @return A stream of running accumulations.
   */
  default <M> MapSwimStream<K, V> reduceModal(final M initialMode,
                                              final Function<M, BinaryOperator<V>> op, final SwimStream<M> controlStream,
                                              final boolean isTransient) {
    return reduceModal(initialMode, op, Sampling.eager(), controlStream, isTransient);
  }

  /**
   * Modally apply a binary operator across the values for each key of this stream. The new stream will maintain running
   * accumulating as computed by the operator. The difference between this and {@link #reduce(BinaryOperator)}
   * is that an auxiliary control stream modifies the behaviour of the operator.
   *
   * @param initialMode   The initial value of the mode.
   * @param op            The modal operator.
   * @param controlStream The control stream of the operator.
   * @return A stream of running accumulations.
   */
  default <M> MapSwimStream<K, V> reduceModal(final M initialMode,
                                              final Function<M, BinaryOperator<V>> op, final SwimStream<M> controlStream) {
    return reduceModal(initialMode, op, Sampling.eager(), controlStream);
  }

  /**
   * Modally fold across the values of the stream for a each key to produce a new stream. For each key and each sample
   * taken from this stream apply the provided function to it and the previously computed value (starting with the
   * specified seed). The output of the function is the new value of the stream for the key. The difference between
   * this and {@link #fold(Object, BiFunction, Form, Sampling)} is that an auxiliary control stream modifies the
   * behaviour of the update function.
   *
   * @param initialMode   The initial value of the mode.
   * @param seed          The seed value for the computation.
   * @param op            The  modal function to combine the values of this stream with the previously computed value.
   * @param form          The form of the new values.
   * @param sampling      The sampling strategy for the link (this will control which values the function is applied to).
   * @param controlStream The control stream of the update operation.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param <U>           The type of the new values.
   * @return A new stream of the applications of the function.
   */
  <U, M> MapSwimStream<K, U> foldModal(M initialMode, U seed, Function<M, BiFunction<U, V, U>> op,
                                       Form<U> form, Sampling sampling, SwimStream<M> controlStream,
                                       boolean isTransient);

  /**
   * Modally fold across the values of the stream for a each key to produce a new stream. For each key and each sample
   * taken from this stream apply the provided function to it and the previously computed value (starting with the
   * specified seed). The output of the function is the new value of the stream for the key. The difference between
   * this and {@link #fold(Object, BiFunction, Form, Sampling)} is that an auxiliary control stream modifies the
   * behaviour of the update function.
   *
   * @param initialMode   The initial value of the mode.
   * @param seed          The seed value for the computation.
   * @param op            The  modal function to combine the values of this stream with the previously computed value.
   * @param form          The form of the new values.
   * @param sampling      The sampling strategy for the link (this will control which values the function is applied to).
   * @param controlStream The control stream of the update operation.
   * @param <U>           The type of the new values.
   * @return A new stream of the applications of the function.
   */
  default <U, M> MapSwimStream<K, U> foldModal(final M initialMode, final U seed,
                                               final Function<M, BiFunction<U, V, U>> op,
                                               final Form<U> form, final Sampling sampling,
                                               final SwimStream<M> controlStream) {
    return foldModal(initialMode, seed, op, form, sampling, controlStream, false);
  }

  /**
   * Modally fold across the values of the stream for a each key to produce a new stream. For each key and each sample
   * taken from this stream apply the provided function to it and the previously computed value (starting with the
   * specified seed). The output of the function is the new value of the stream for the key. The difference between
   * this and {@link #fold(Object, BiFunction, Form, Sampling)} is that an auxiliary control stream modifies the
   * behaviour of the update function.
   *
   * @param initialMode   The initial value of the mode.
   * @param seed          The seed value for the computation.
   * @param op            The  modal function to combine the values of this stream with the previously computed value.
   * @param form          The form of the new values.
   * @param controlStream The control stream of the update operation.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @param <U>           The type of the new values.
   * @return A new stream of the applications of the function.
   */
  default <U, M> MapSwimStream<K, U> foldModal(final M initialMode, final U seed, final Function<M, BiFunction<U, V, U>> op,
                                               final Form<U> form, final SwimStream<M> controlStream,
                                               final boolean isTransient) {
    return foldModal(initialMode, seed, op, form, Sampling.eager(), controlStream, isTransient);
  }


  /**
   * Modally fold across the values of the stream for a each key to produce a new stream. For each key and each sample
   * taken from this stream apply the provided function to it and the previously computed value (starting with the
   * specified seed). The output of the function is the new value of the stream for the key. The difference between
   * this and {@link #fold(Object, BiFunction, Form, Sampling)} is that an auxiliary control stream modifies the
   * behaviour of the update function.
   *
   * @param initialMode   The initial value of the mode.
   * @param seed          The seed value for the computation.
   * @param op            The  modal function to combine the values of this stream with the previously computed value.
   * @param form          The form of the new values.
   * @param controlStream The control stream of the update operation.
   * @param <U>           The type of the new values.
   * @return A new stream of the applications of the function.
   */
  default <U, M> MapSwimStream<K, U> foldModal(final M initialMode, final U seed, final Function<M, BiFunction<U, V, U>> op,
                                               final Form<U> form, final SwimStream<M> controlStream) {
    return foldModal(initialMode, seed, op, form, Sampling.eager(), controlStream);
  }

  /**
   * Modally fold across the values of the stream for a each key to produce a new stream. For each key and each sample
   * taken from this stream apply the provided function to it and the previously computed value (starting with the
   * specified seed). The output of the function is the new value of the stream for the key. The difference between
   * this and {@link #fold(Object, BiFunction, Form, Sampling)} is that an auxiliary control stream modifies the
   * behaviour of the update function.
   *
   * @param initialMode   The initial value of the mode.
   * @param seed          The seed value for the computation.
   * @param op            The  modal function to combine the values of this stream with the previously computed value.
   * @param controlStream The control stream of the update operation.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @return A new stream of the applications of the function.
   */
  default <M> MapSwimStream<K, V> foldModal(final M initialMode, final V seed, final Function<M, BiFunction<V, V, V>> op,
                                            final SwimStream<M> controlStream, final boolean isTransient) {
    return foldModal(initialMode, seed, op, valueForm(), Sampling.eager(), controlStream, isTransient);
  }

  /**
   * Modally fold across the values of the stream for a each key to produce a new stream. For each key and each sample
   * taken from this stream apply the provided function to it and the previously computed value (starting with the
   * specified seed). The output of the function is the new value of the stream for the key. The difference between
   * this and {@link #fold(Object, BiFunction, Form, Sampling)} is that an auxiliary control stream modifies the
   * behaviour of the update function.
   *
   * @param initialMode   The initial value of the mode.
   * @param seed          The seed value for the computation.
   * @param op            The  modal function to combine the values of this stream with the previously computed value.
   * @param controlStream The control stream of the update operation.
   * @return A new stream of the applications of the function.
   */
  default <M> MapSwimStream<K, V> foldModal(final M initialMode, final V seed, final Function<M, BiFunction<V, V, V>> op,
                                            final SwimStream<M> controlStream) {
    return foldModal(initialMode, seed, op, valueForm(), Sampling.eager(), controlStream);
  }

  /**
   * Filter out elements from this stream.
   *
   * @param predicate Predicate to apply to the key-value pairs.
   * @return The filtered stream.
   */
  MapSwimStream<K, V> filter(BiPredicate<K, V> predicate);

  /**
   * Modally filter out elements from this stream.
   *
   * @param initialMode    The initial value of the mode.
   * @param modalPredicate Function to switch the predicate according to the mode.
   * @param controlStream  Stream of modes.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param <M>            The type of the modes.
   * @return The filtered stream.
   */
  <M> MapSwimStream<K, V> filterModal(M initialMode, Function<M, BiPredicate<K, V>> modalPredicate,
                                      SwimStream<M> controlStream, boolean isTransient);

  /**
   * Modally filter out elements from this stream.
   *
   * @param initialMode    The initial value of the mode.
   * @param modalPredicate Function to switch the predicate according to the mode.
   * @param controlStream  Stream of modes.
   * @param <M>            The type of the modes.
   * @return The filtered stream.
   */
  default <M> MapSwimStream<K, V> filterModal(final M initialMode, final Function<M, BiPredicate<K, V>> modalPredicate,
                                              final SwimStream<M> controlStream) {
    return filterModal(initialMode, modalPredicate, controlStream, false);
  }

  /**
   * Filter out elements from this stream by key.
   *
   * @param predicate The key predicate.
   * @return The filtered stream.
   */
  default MapSwimStream<K, V> filterKeys(final Predicate<K> predicate) {
    return filter((k, v) -> predicate.test(k));
  }

  /**
   * Modally filter out elements from this stream by key.
   *
   * @param initialMode    The initial value of the mode.
   * @param modalPredicate Function to switch the predicate according to the mode.
   * @param controlStream  Stream of modes.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param <M>            The type of the modes.
   * @return The filtered stream.
   */
  <M> MapSwimStream<K, V> filterKeysModal(M initialMode, Function<M, Predicate<K>> modalPredicate,
                                          SwimStream<M> controlStream, boolean isTransient);

  /**
   * Modally filter out elements from this stream by key.
   *
   * @param initialMode    The initial value of the mode.
   * @param modalPredicate Function to switch the predicate according to the mode.
   * @param controlStream  Stream of modes.
   * @param <M>            The type of the modes.
   * @return The filtered stream.
   */
  default <M> MapSwimStream<K, V> filterKeysModal(final M initialMode, final Function<M, Predicate<K>> modalPredicate,
                                                  final SwimStream<M> controlStream) {
    return filterKeysModal(initialMode, modalPredicate, controlStream, false);
  }

  /**
   * Apply a reduction over the keys and values of the instantaneous state of this stream.
   *
   * @param seed     The initial seed value.
   * @param op       Operation to add a value to the aggregate value.
   * @param combine  Combines together intermediate results.
   * @param form     The form of the type of the result.
   * @param sampling The sampling strategy of the link.
   * @param <U>      The type of the results.
   * @return The reduced stream.
   */
  <U> SwimStream<U> reduceKeyed(U seed, BiFunction<U, ? super V, U> op, BinaryOperator<U> combine, Form<U> form, Sampling sampling);

  /**
   * Apply a reduction over the keys and values of the instantaneous state of this stream.
   *
   * @param seed    The initial seed value.
   * @param op      Operation to add a value to the aggregate value.
   * @param combine Combines together intermediate results.
   * @param form    The form of the type of the result.
   * @param <U>     The type of the results.
   * @return The reduced stream.
   */
  default <U> SwimStream<U> reduceKeyed(final U seed, final BiFunction<U, ? super V, U> op, final BinaryOperator<U> combine, final Form<U> form) {
    return reduceKeyed(seed, op, combine, form, Sampling.eager());
  }

  /**
   * Apply a reduction over the keys and values of the instantaneous state of this stream.
   *
   * @param seed    The initial seed value.
   * @param op      Operation to add a value to the aggregate value.
   * @param combine Combines together intermediate results.
   * @return The reduced stream.
   */
  default SwimStream<V> reduceKeyed(final V seed, final BiFunction<V, ? super V, V> op, final BinaryOperator<V> combine) {
    return reduceKeyed(seed, op, combine, valueForm(), Sampling.eager());
  }

  /**
   * For each key, divide the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more windows.
   * @param windowForm The form of the windows.
   * @param sampling   The sampling strategy for the link.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @param <W>        The type of the windows.
   * @return A windowed stream.
   */
  <W, S extends WindowState<W, S>> MapWindowedSwimStream<K, V, W> window(Function<K, TemporalWindowAssigner<V, W, S>> assigner,
                                                                         Form<W> windowForm,
                                                                         Sampling sampling,
                                                                         boolean isTransient);

  /**
   * For each key, divide the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more windows.
   * @param windowForm The form of the windows.
   * @param sampling   The sampling strategy for the link.
   * @param <W>        The type of the windows.
   * @return A windowed stream.
   */
  default <W, S extends WindowState<W, S>> MapWindowedSwimStream<K, V, W> window(final Function<K, TemporalWindowAssigner<V, W, S>> assigner,
                                                                                 final Form<W> windowForm,
                                                                                 final Sampling sampling) {
    return window(assigner, windowForm, sampling, false);
  }

  /**
   * For each key, divide the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more windows.
   * @param windowForm The form of the windows.
   * @param sampling   The sampling strategy for the link.
   * @param <W>        The type of the windows.
   * @return A windowed stream.
   */
  default <W, S extends WindowState<W, S>> MapWindowedSwimStream<K, V, W> window(final TemporalWindowAssigner<V, W, S> assigner,
                                                                                 final Form<W> windowForm,
                                                                                 final Sampling sampling,
                                                                                 final boolean isTransient) {
    return window(k -> assigner, windowForm, sampling, isTransient);
  }

  /**
   * For each key, divide the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more windows.
   * @param windowForm The form of the windows.
   * @param sampling   The sampling strategy for the link.
   * @param <W>        The type of the windows.
   * @return A windowed stream.
   */
  default <W, S extends WindowState<W, S>> MapWindowedSwimStream<K, V, W> window(final TemporalWindowAssigner<V, W, S> assigner,
                                                                                 final Form<W> windowForm,
                                                                                 final Sampling sampling) {
    return window(k -> assigner, windowForm, sampling);
  }

  /**
   * For each key, divide the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more windows.
   * @param windowForm The form of the windows.
   * @param <W>        The type of the windows.
   * @return A windowed stream.
   */
  default <W, S extends WindowState<W, S>> MapWindowedSwimStream<K, V, W> window(
      final Function<K, TemporalWindowAssigner<V, W, S>> assigner,
      final Form<W> windowForm,
      final boolean isTransient) {
    return window(assigner, windowForm, Sampling.eager(), isTransient);
  }

  /**
   * For each key, divide the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more windows.
   * @param windowForm The form of the windows.
   * @param <W>        The type of the windows.
   * @return A windowed stream.
   */
  default <W, S extends WindowState<W, S>> MapWindowedSwimStream<K, V, W> window(
      final Function<K, TemporalWindowAssigner<V, W, S>> assigner,
      final Form<W> windowForm) {
    return window(assigner, windowForm, Sampling.eager());
  }

  /**
   * For each key, divide the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more windows.
   * @param windowForm The form of the windows.
   * @param <W>        The type of the windows.
   * @return A windowed stream.
   */
  default <W, S extends WindowState<W, S>> MapWindowedSwimStream<K, V, W> window(
      final TemporalWindowAssigner<V, W, S> assigner,
      final Form<W> windowForm,
      final boolean isTransient) {
    return window(k -> assigner, windowForm, Sampling.eager(), isTransient);
  }

  /**
   * For each key, divide the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more windows.
   * @param windowForm The form of the windows.
   * @param <W>        The type of the windows.
   * @return A windowed stream.
   */
  default <W, S extends WindowState<W, S>> MapWindowedSwimStream<K, V, W> window(
      final TemporalWindowAssigner<V, W, S> assigner,
      final Form<W> windowForm) {
    return window(k -> assigner, windowForm, Sampling.eager());
  }

  /**
   * Divides the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param spec     The specification of the windows.
   * @param sampling The sampling strategy for the link.
   * @param <W>      The type of the windows.
   * @param <S>      The type of the state tracking open windows.
   * @return The windowed stream.
   */
  default <W, S extends WindowState<W, S>> MapWindowedSwimStream<K, V, W> window(final KeyedWindowSpec<K, V, W, S> spec,
                                                                                 final Sampling sampling) {
    return window(spec.getAssigner(), spec.getWindowForm(), sampling)
        .withTrigger(spec.getTrigger())
        .withEviction(spec.getEvictionStrategy())
        .setIsTransient(spec.isTransient());
  }

  /**
   * Divides the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param spec The specification of the windows.
   * @param <W>  The type of the windows.
   * @param <S>  The type of the state tracking open windows.
   * @return The windowed stream.
   */
  default <W, S extends WindowState<W, S>> MapWindowedSwimStream<K, V, W> window(final KeyedWindowSpec<K, V, W, S> spec) {
    return window(spec.getAssigner(), spec.getWindowForm())
        .withTrigger(spec.getTrigger())
        .withEviction(spec.getEvictionStrategy())
        .setIsTransient(spec.isTransient());
  }

  /**
   * Divides the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param spec     The specification of the windows.
   * @param sampling The sampling strategy for the link.
   * @param <W>      The type of the windows.
   * @param <S>      The type of the state tracking open windows.
   * @return The windowed stream.
   */
  default <W, S extends WindowState<W, S>> MapWindowedSwimStream<K, V, W> window(final WindowSpec<V, W, S> spec,
                                                                                 final Sampling sampling) {
    return window(spec.getAssigner(), spec.getWindowForm(), sampling)
        .withTrigger(spec.getTrigger())
        .withEviction(spec.getEvictionStrategy())
        .setIsTransient(spec.isTransient());
  }

  /**
   * Divides the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param spec The specification of the windows.
   * @param <W>  The type of the windows.
   * @param <S>  The type of the state tracking open windows.
   * @return The windowed stream.
   */
  default <W, S extends WindowState<W, S>> MapWindowedSwimStream<K, V, W> window(final WindowSpec<V, W, S> spec) {
    return window(spec.getAssigner(), spec.getWindowForm())
        .withTrigger(spec.getTrigger())
        .withEviction(spec.getEvictionStrategy())
        .setIsTransient(spec.isTransient());
  }

  /**
   * Join this stream with another keyed streams. The values for each key in the new stream are computed from the
   * currently sampled values for that key in the contributing streams. If a key is missing in on of the streams
   * it will not occur in the new stream.
   *
   * @param other    The other stream.
   * @param combiner Function used to combine the values.
   * @param form     The form of the new value type.
   * @param sampling The sampling strategy for the link.
   * @param <V2>     The value type of the other stream.
   * @param <U>      The type of the combined values.
   * @return A new stream containing the joined values.
   */
  <V2, U> MapSwimStream<K, U> join(MapSwimStream<K, V2> other, BiFunction<V, V2, U> combiner, Form<U> form, Sampling sampling);

  /**
   * Join this stream with another keyed streams. The values for each key in the new stream are computed from the
   * currently sampled values for that key in the contributing streams. If a key is missing in one of the streams
   * it will not occur in the new stream.
   *
   * @param other    The other stream.
   * @param combiner Function used to combine the values.
   * @param form     The form of the new value type.
   * @param <V2>     The value type of the other stream.
   * @param <U>      The type of the combined values.
   * @return A new stream containing the joined values.
   */
  default <V2, U> MapSwimStream<K, U> join(final MapSwimStream<K, V2> other, final BiFunction<V, V2, U> combiner, final Form<U> form) {
    return join(other, combiner, form, Sampling.eager());
  }

  /**
   * Join this stream with another keyed streams. The values for each key in the new stream are computed from the
   * currently sampled values for that key in the contributing streams. If a key is missing in this stream a
   * value will be substituted. If a key is missing in other stream the value will be missing.
   *
   * @param other    The other stream.
   * @param combiner Function used to combine the values.
   * @param leftOnly Provides the substitute values on the left.
   * @param form     The form of the new value type.
   * @param sampling The sampling strategy for the link.
   * @param <V2>     The value type of the other stream.
   * @param <U>      The type of the combined values.
   * @return A new stream containing the joined values.
   */
  <V2, U> MapSwimStream<K, U> leftJoin(MapSwimStream<K, V2> other, BiFunction<V, V2, U> combiner,
                                       Function<V, U> leftOnly, Form<U> form, Sampling sampling);

  /**
   * Join this stream with another keyed streams. The values for each key in the new stream are computed from the
   * currently sampled values for that key in the contributing streams. If a key is missing in this stream a
   * value will be substituted. If a key is missing in other stream the value will be missing.
   *
   * @param other    The other stream.
   * @param combiner Function used to combine the values.
   * @param leftOnly Provides the substitute values on the left.
   * @param form     The form of the new value type.
   * @param <V2>     The value type of the other stream.
   * @param <U>      The type of the combined values.
   * @return A new stream containing the joined values.
   */
  default <V2, U> MapSwimStream<K, U> leftJoin(final MapSwimStream<K, V2> other, final BiFunction<V, V2, U> combiner,
                                               final Function<V, U> leftOnly, final Form<U> form) {
    return leftJoin(other, combiner, leftOnly, form, Sampling.eager());
  }

  /**
   * Join this stream with another keyed streams. The values for each key in the new stream are computed from the
   * currently sampled values for that key in the contributing streams. If a key is missing in this stream a
   * the value will be missing. If a key is missing in other stream a value will be substituted.
   *
   * @param other     The other stream.
   * @param combiner  Function used to combine the values.
   * @param rightOnly Provides the substitute values on the right.
   * @param form      The form of the new value type.
   * @param sampling  The sampling strategy for the link.
   * @param <V2>      The value type of the other stream.
   * @param <U>       The type of the combined values.
   * @return A new stream containing the joined values.
   */
  <V2, U> MapSwimStream<K, U> rightJoin(MapSwimStream<K, V2> other, BiFunction<V, V2, U> combiner,
                                        Function<V2, U> rightOnly, Form<U> form, Sampling sampling);

  /**
   * Join this stream with another keyed streams. The values for each key in the new stream are computed from the
   * currently sampled values for that key in the contributing streams. If a key is missing in this stream a
   * the value will be missing. If a key is missing in other stream a value will be substituted.
   *
   * @param other     The other stream.
   * @param combiner  Function used to combine the values.
   * @param rightOnly Provides the substitute values on the right.
   * @param form      The form of the new value type.
   * @param <V2>      The value type of the other stream.
   * @param <U>       The type of the combined values.
   * @return A new stream containing the joined values.
   */
  default <V2, U> MapSwimStream<K, U> rightJoin(final MapSwimStream<K, V2> other, final BiFunction<V, V2, U> combiner,
                                                final Function<V2, U> rightOnly, final Form<U> form) {
    return rightJoin(other, combiner, rightOnly, form, Sampling.eager());
  }

  /**
   * Join this stream with another keyed streams. The values for each key in the new stream are computed from the
   * currently sampled values for that key in the contributing streams. If a key is missing in either stream a value
   * will be substituted.
   *
   * @param other     The other stream.
   * @param combiner  Function used to combine the values.
   * @param leftOnly  Provides the substitute values on the left.
   * @param rightOnly Provides the substitute values on the right.
   * @param form      The form of the new value type.
   * @param sampling  The sampling strategy for the link.
   * @param <V2>      The value type of the other stream.
   * @param <U>       The type of the combined values.
   * @return A new stream containing the joined values.
   */
  <V2, U> MapSwimStream<K, U> fullJoin(MapSwimStream<K, V2> other, BiFunction<V, V2, U> combiner,
                                       Function<V, U> leftOnly, Function<V2, U> rightOnly,
                                       Form<U> form, Sampling sampling);

  /**
   * Join this stream with another keyed streams. The values for each key in the new stream are computed from the
   * currently sampled values for that key in the contributing streams. If a key is missing in either stream a value
   * will be substituted.
   *
   * @param other     The other stream.
   * @param combiner  Function used to combine the values.
   * @param leftOnly  Provides the substitute values on the left.
   * @param rightOnly Provides the substitute values on the right.
   * @param form      The form of the new value type.
   * @param <V2>      The value type of the other stream.
   * @param <U>       The type of the combined values.
   * @return A new stream containing the joined values.
   */
  default <V2, U> MapSwimStream<K, U> fullJoin(final MapSwimStream<K, V2> other, final BiFunction<V, V2, U> combiner,
                                               final Function<V, U> leftOnly, final Function<V2, U> rightOnly,
                                               final Form<U> form) {
    return fullJoin(other, combiner, leftOnly, rightOnly, form, Sampling.eager());
  }

  /**
   * Create a stream that will always hold the first value received by this stream for each key.
   *
   * @param isTransient Whether to store the first values persistently.
   * @param resetOnRemoval Whether the first value resets of key removal.
   * @return The first value stream.
   */
  MapSwimStream<K, V> first(boolean resetOnRemoval, boolean isTransient);

  /**
   * Create a stream that will always hold the first value received by this stream for each key.
   *
   * @return The first value stream.
   */
  default MapSwimStream<K, V> first() {
    return first(true, false);
  }

  /**
   * Interpreting this stream as a sequence of discrete samples, create a stream which contains the value
   * received by this stream {@code n} steps before the current value, for each key.
   *
   * @param n           The number of steps back (must be at least 1).
   * @param isTransient Whether to store the history persistently.
   * @return The delayed stream.
   */
  MapSwimStream<K, V> delayed(int n, boolean isTransient);

  /**
   * Interpreting this stream as a sequence of discrete samples, create a stream which contains the value
   * received by this stream {@code n} steps before the current value, for each key.
   *
   * @param ns          Stream of the number of steps back (must be at least 1).
   * @param isTransient Whether to store the history persistently.
   * @param init        Initial delay.
   * @return The delayed stream.
   */
  MapSwimStream<K, V> delayed(SwimStream<Integer> ns, int init, boolean isTransient);

  /**
   * Interpreting this stream as a sequence of discrete samples, create a stream which contains the value
   * received by this stream {@code n} steps before the current value, for each key.
   *
   * @param n The number of steps back (must be at least 1).
   * @return The delayed stream.
   */
  default MapSwimStream<K, V> delayed(final int n) {
    return delayed(n, false);
  }

  /**
   * Interpreting this stream as a sequence of discrete samples, create a stream which contains the value
   * received by this stream {@code n} steps before the current value, for each key.
   *
   * @param ns   Stream of the number of steps back (must be at least 1).
   * @param init Initial delay.
   * @return The delayed stream.
   */
  default MapSwimStream<K, V> delayed(final SwimStream<Integer> ns, final int init) {
    return delayed(ns, init, false);
  }

  /**
   * Interpreting this stream as a sequence of discrete samples, create a stream which contains the previous value of
   * this stream, for each key.
   *
   * @param isTransient Whether to store the history persistently.
   * @return The delayed stream.
   */
  default MapSwimStream<K, V> previous(final boolean isTransient) {
    return delayed(1, isTransient);
  }

  /**
   * Interpreting this stream as a sequence of discrete samples, create a stream which contains the previous value of
   * this stream, for each key.
   *
   * @return The delayed stream.
   */
  default MapSwimStream<K, V> previous() {
    return delayed(1, false);
  }

  /**
   * Attach this stream to a sink.
   *
   * @param sink Descriptor of the sink.
   * @return Handle for the graph leaf represented by this sink.
   */
  SinkHandle<K, V> bind(MapSink<K, V> sink);

  /**
   * Instantiate this stream as a node in a flow graph.
   *
   * @param context Initialization context to keep track of nodes in the graph.
   * @return The outlet corresponding to this node.
   */
  MapJunction<K, V> instantiate(SwimStreamContext.InitContext context);
}
