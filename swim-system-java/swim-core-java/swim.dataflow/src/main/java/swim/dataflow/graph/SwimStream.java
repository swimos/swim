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

package swim.dataflow.graph;

import java.util.Collection;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.ToLongFunction;
import swim.dataflow.connector.Junction;
import swim.dataflow.graph.sampling.DelaySpecifier;
import swim.dataflow.graph.sampling.Sampling;
import swim.dataflow.graph.windows.CombinedState;
import swim.dataflow.graph.windows.CombinedWindowAssigner;
import swim.dataflow.graph.windows.PartitionAssigner;
import swim.dataflow.graph.windows.PartitionState;
import swim.dataflow.graph.windows.TemporalWindowAssigner;
import swim.dataflow.graph.windows.WindowSpec;
import swim.dataflow.graph.windows.WindowState;
import swim.dataflow.graph.windows.triggers.Trigger;
import swim.streamlet.Inlet;
import swim.streamlet.Outlet;
import swim.structure.Form;

/**
 * An abstract stream of values. In combination with {@link MapSwimStream} this is used to construct a directed
 * graph of combinators which pump data from sources to sinks. The graph can then be instantiated against a set of
 * source {@link Outlet}s and sink {@link Inlet}s to create an executable data-flow that can run inside a Swim
 * agent.
 *
 * @param <T> The type of the values.
 */
public interface SwimStream<T> {

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
  SwimStream<T> setId(String id);

  /**
   * @return The form of the stream value type.
   */
  Form<T> form();

  /**
   * @return Timestamp assigner for the stream.
   */
  ToLongFunction<T> getTimestamps();

  /**
   * Transform the values of this stream.
   *
   * @param f       The function to transform the values.
   * @param memoize Whether to memoize the result.
   * @param form    The from of the new value type.
   * @param <U>     The type of the new value.
   * @return A new stream with the values transformed.
   */
  <U> SwimStream<U> map(Function<T, ? extends U> f, boolean memoize, Form<U> form);

  /**
   * Transform the values of this stream.
   *
   * @param f    The function to transform the values.
   * @param form The from of the new value type.
   * @param <U>  The type of the new value.
   * @return A new stream with the values transformed.
   */
  default <U> SwimStream<U> map(final Function<T, ? extends U> f, final Form<U> form) {
    return map(f, false, form);
  }

  /**
   * Transform the values of this stream.
   *
   * @param f The function to transform the values.
   * @return A new stream with the values transformed.
   */
  default SwimStream<T> map(final Function<T, ? extends T> f) {
    return map(f, false, form());
  }

  /**
   * Transform the values of this stream into a collection of another type.
   *
   * @param f    The transformation function.
   * @param form The form of the collection type.
   * @param <U>  The element type.
   * @param <C>  The collection type.
   * @return The collection stream.
   */
  default <U, C extends Collection<U>> CollectionSwimStream<U, C> mapToCollection(final Function<T, C> f,
                                                                                  final Form<C> form) {
    return mapToCollection(f, false, form);
  }

  /**
   * Transform the values of this stream into a collection of another type.
   *
   * @param f       The transformation function.
   * @param memoize Whether to memoize the result.
   * @param form    The form of the collection type.
   * @param <U>     The element type.
   * @param <C>     The collection type.
   * @return The collection stream.
   */
  <U, C extends Collection<U>> CollectionSwimStream<U, C> mapToCollection(Function<T, C> f, boolean memoize, Form<C> form);

  /**
   * Consider only values of the state of the stream satisfying a predicate.
   *
   * @param predicate The predicate.
   * @return The filtered stream.
   */
  SwimStream<T> filter(Predicate<T> predicate);

  /**
   * Consider only values of the state of the stream satisfying a predicate.
   *
   * @param intialMode    The initial value of the mode.
   * @param predicate     The predicate.
   * @param controlStream The stream of modes.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @return The filtered stream.
   */
  <M> SwimStream<T> filterModal(M intialMode, Function<M, Predicate<T>> predicate,
                                SwimStream<M> controlStream, boolean isTransient);

  /**
   * Consider only values of the state of the stream satisfying a predicate.
   *
   * @param intialMode    The initial value of the mode.
   * @param predicate     The predicate.
   * @param controlStream The stream of modes.
   * @return The filtered stream.
   */
  default <M> SwimStream<T> filterModal(final M intialMode, final Function<M, Predicate<T>> predicate,
                                        final SwimStream<M> controlStream) {
    return filterModal(intialMode, predicate, controlStream, false);
  }

  /**
   * Split the states of the stream by a predicate.
   *
   * @param predicate The predicate.
   * @return Pair of stream the first containing the states that satisfy the predicate and the second those that
   * do not.
   */
  Pair<SwimStream<T>, SwimStream<T>> split(Predicate<T> predicate);

  /**
   * Categorize the states of the stream by an enumeration.
   *
   * @param categories Function to assign the categories.
   * @param enumType   The type of the enumeration.
   * @param <E>        The type of the enumeration.
   * @return Map from categories to streams.
   */
  <E extends Enum<E>> Map<E, SwimStream<T>> categorize(Function<T, E> categories, Class<E> enumType);

  /**
   * Modally transform the values of this stream. This differs from {@link #map} in there being an additional
   * control scheme that modifies the behaviour of the mapping function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param f             The modal function to transform the values.
   * @param memoize       Whether to memoize the result.
   * @param form          The from of the new value type.
   * @param controlStream The control stream.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @param <U>           The type of the new value.
   * @return A new stream with the values transformed.
   */
  <U, M> SwimStream<U> mapModal(M initialMode, Function<M, Function<T, ? extends U>> f, boolean memoize,
                                Form<U> form, SwimStream<M> controlStream, boolean isTransient);

  /**
   * Modally transform the values of this stream. This differs from {@link #map} in there being an additional
   * control scheme that modifies the behaviour of the mapping function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param f             The modal function to transform the values.
   * @param memoize       Whether to memoize the result.
   * @param form          The from of the new value type.
   * @param controlStream The control stream.
   * @param <U>           The type of the new value.
   * @return A new stream with the values transformed.
   */
  default <U, M> SwimStream<U> mapModal(final M initialMode, final Function<M, Function<T, ? extends U>> f,
                                        final boolean memoize, final Form<U> form,
                                        final SwimStream<M> controlStream) {
    return mapModal(initialMode, f, memoize, form, controlStream, false);
  }

  /**
   * Modally transform the values of this stream. This differs from {@link #map} in there being an additional
   * control scheme that modifies the behaviour of the mapping function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param f             The modal function to transform the values.
   * @param form          The from of the new value type.
   * @param controlStream The control stream.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @param <U>           The type of the new value.
   * @return A new stream with the values transformed.
   */
  default <U, M> SwimStream<U> mapModal(final M initialMode, final Function<M, Function<T, ? extends U>> f,
                                        final Form<U> form, final SwimStream<M> controlStream,
                                        final boolean isTransient) {
    return mapModal(initialMode, f, false, form, controlStream, isTransient);
  }

  /**
   * Modally transform the values of this stream. This differs from {@link #map} in there being an additional
   * control scheme that modifies the behaviour of the mapping function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param f             The modal function to transform the values.
   * @param form          The from of the new value type.
   * @param controlStream The control stream.
   * @param <U>           The type of the new value.
   * @return A new stream with the values transformed.
   */
  default <U, M> SwimStream<U> mapModal(final M initialMode, final Function<M, Function<T, ? extends U>> f,
                                        final Form<U> form, final SwimStream<M> controlStream) {
    return mapModal(initialMode, f, false, form, controlStream);
  }

  /**
   * Modally transform the values of this stream. This differs from {@link #map} in there being an additional
   * control scheme that modifies the behaviour of the mapping function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param f             The modal function to transform the values.
   * @param controlStream The control stream.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @return A new stream with the values transformed.
   */
  default <M> SwimStream<T> mapModal(final M initialMode,
                                     final Function<M, Function<T, ? extends T>> f,
                                     final SwimStream<M> controlStream,
                                     final boolean isTransient) {
    return mapModal(initialMode, f, form(), controlStream, isTransient);
  }

  /**
   * Modally transform the values of this stream. This differs from {@link #map} in there being an additional
   * control scheme that modifies the behaviour of the mapping function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param f             The modal function to transform the values.
   * @param controlStream The control stream.
   * @return A new stream with the values transformed.
   */
  default <M> SwimStream<T> mapModal(final M initialMode,
                                     final Function<M, Function<T, ? extends T>> f,
                                     final SwimStream<M> controlStream) {
    return mapModal(initialMode, f, form(), controlStream);
  }

  /**
   * Modally transform the values of this stream. This differs from {@link #map} in there being an additional
   * control scheme that modifies the behaviour of the mapping function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param f             The modal function to transform the values.
   * @param memoize       Whether to memoize the result.
   * @param controlStream The control stream.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @return A new stream with the values transformed.
   */
  default <M> SwimStream<T> mapModal(final M initialMode,
                                     final Function<M, Function<T, ? extends T>> f,
                                     final boolean memoize,
                                     final SwimStream<M> controlStream,
                                     final boolean isTransient) {
    return mapModal(initialMode, f, memoize, form(), controlStream, isTransient);
  }

  /**
   * Modally transform the values of this stream. This differs from {@link #map} in there being an additional
   * control scheme that modifies the behaviour of the mapping function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param f             The modal function to transform the values.
   * @param memoize       Whether to memoize the result.
   * @param controlStream The control stream.
   * @return A new stream with the values transformed.
   */
  default <M> SwimStream<T> mapModal(final M initialMode,
                                     final Function<M, Function<T, ? extends T>> f,
                                     final boolean memoize,
                                     final SwimStream<M> controlStream) {
    return mapModal(initialMode, f, memoize, form(), controlStream);
  }

  /**
   * Flat-map over the values of this stream. Each value in this stream will become 0 or more values in the new stream.
   *
   * @param f     The function to apply.
   * @param form  The form of the new value type.
   * @param delay Delay strategy for the outputs.
   * @param <U>   The new value type.
   * @return A new stream with the transformed values.
   */
  <U> SwimStream<U> flatMap(Function<T, Iterable<U>> f, Form<U> form, DelaySpecifier delay);

  /**
   * Flat-map over the values of this stream. Each value in this stream will become 0 or more values in the new stream.
   *
   * @param f     The function to apply.
   * @param delay Delay strategy for the outputs.
   * @return A new stream with the transformed values.
   */
  default SwimStream<T> flatMap(final Function<T, Iterable<T>> f, final DelaySpecifier delay) {
    return flatMap(f, form(), delay);
  }

  /**
   * Modally flat-map over the values of this stream. Each value in this stream will become 0 or more values in the
   * new stream. This differs from {@link #flatMap} in there being an additional control scheme that modifies the
   * behaviour of the mapping function.
   *
   * @param initialMode The initial value of the mode.
   * @param f           The function to apply.
   * @param form        The form of the new value type.
   * @param delay       Delay strategy for the outputs.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param <U>         The new value type.
   * @return A new stream with the transformed values.
   */
  <U, M> SwimStream<U> flatMapModal(M initialMode, Function<M, Function<T, Iterable<U>>> f,
                                    Form<U> form, DelaySpecifier delay, SwimStream<M> controlStream,
                                    boolean isTransient);

  /**
   * Modally flat-map over the values of this stream. Each value in this stream will become 0 or more values in the
   * new stream. This differs from {@link #flatMap} in there being an additional control scheme that modifies the
   * behaviour of the mapping function.
   *
   * @param initialMode The initial value of the mode.
   * @param f           The function to apply.
   * @param form        The form of the new value type.
   * @param delay       Delay strategy for the outputs.
   * @param <U>         The new value type.
   * @return A new stream with the transformed values.
   */
  default <U, M> SwimStream<U> flatMapModal(final M initialMode, final Function<M, Function<T, Iterable<U>>> f,
                                            final Form<U> form, final DelaySpecifier delay,
                                            final SwimStream<M> controlStream) {
    return flatMapModal(initialMode, f, form, delay, controlStream, false);
  }

  /**
   * Modally flat-map over the values of this stream. Each value in this stream will become 0 or more values in the
   * new stream. This differs from {@link #flatMap} in there being an additional control scheme that modifies the
   * behaviour of the mapping function.
   *
   * @param initialMode The initial value of the mode.
   * @param f           The function to apply.
   * @param delay       Delay strategy for the outputs.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @return A new stream with the transformed values.
   */
  default <M> SwimStream<T> flatMapModal(final M initialMode, final Function<M, Function<T, Iterable<T>>> f,
                                         final DelaySpecifier delay, final SwimStream<M> controlStream,
                                         final boolean isTransient) {
    return flatMapModal(initialMode, f, form(), delay, controlStream, isTransient);
  }

  /**
   * Modally flat-map over the values of this stream. Each value in this stream will become 0 or more values in the
   * new stream. This differs from {@link #flatMap} in there being an additional control scheme that modifies the
   * behaviour of the mapping function.
   *
   * @param initialMode The initial value of the mode.
   * @param f           The function to apply.
   * @param delay       Delay strategy for the outputs.
   * @return A new stream with the transformed values.
   */
  default <M> SwimStream<T> flatMapModal(final M initialMode, final Function<M, Function<T, Iterable<T>>> f,
                                         final DelaySpecifier delay, final SwimStream<M> controlStream) {
    return flatMapModal(initialMode, f, form(), delay, controlStream);
  }

  /**
   * Replace the timestamps on the values in this stream.
   *
   * @param datation The timestamp assignment function.
   * @return A copy of this stream with different timestamps.
   */
  SwimStream<T> updateTimestamps(ToLongFunction<T> datation);

  /**
   * Apply a binary operator across the values of this stream. The new stream will maintain a running accumulation
   * as computed by the operator.
   *
   * @param op       The operator.
   * @param sampling Sampling strategy for the link (this will control which values the operator is applied to).
   * @return A stream of running accumulations.
   */
  SwimStream<T> reduce(BinaryOperator<T> op, Sampling sampling, boolean isTransient);

  /**
   * Apply a binary operator across the values of this stream. The new stream will maintain a running accumulation
   * as computed by the operator.
   *
   * @param op       The operator.
   * @param sampling Sampling strategy for the link (this will control which values the operator is applied to).
   * @return A stream of running accumulations.
   */
  default SwimStream<T> reduce(final BinaryOperator<T> op, final Sampling sampling) {
    return reduce(op, sampling, false);
  }

  /**
   * Apply a binary operator across the values of this stream. The new stream will maintain a running accumulation
   * as computed by the operator.
   *
   * @param op The operator.
   * @return A stream of running accumulations.
   */
  default SwimStream<T> reduce(final BinaryOperator<T> op, final boolean isTransient) {
    return reduce(op, Sampling.eager(), isTransient);
  }

  /**
   * Apply a binary operator across the values of this stream. The new stream will maintain a running accumulation
   * as computed by the operator.
   *
   * @param op The operator.
   * @return A stream of running accumulations.
   */
  default SwimStream<T> reduce(final BinaryOperator<T> op) {
    return reduce(op, Sampling.eager());
  }

  /**
   * Fold across the values of the stream to produce a new stream. For each sample taken from this stream apply the
   * provided function to it and the previously computed value (starting with the specified seed). The output of the
   * function is the new value of the stream.
   *
   * @param seed        The seed value for the computation.
   * @param op          The function to combine the values of this stream with the previously computed value.
   * @param form        The form of the new values.
   * @param sampling    The sampling strategy for the link (this will control which values the function is applied to).
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param <U>         The type of the new values.
   * @return A new stream of the applications of the function.
   */
  <U> SwimStream<U> fold(U seed, BiFunction<U, T, U> op, Form<U> form, Sampling sampling, boolean isTransient);

  /**
   * Fold across the values of the stream to produce a new stream. For each sample taken from this stream apply the
   * provided function to it and the previously computed value (starting with the specified seed). The output of the
   * function is the new value of the stream.
   *
   * @param seed     The seed value for the computation.
   * @param op       The function to combine the values of this stream with the previously computed value.
   * @param form     The form of the new values.
   * @param sampling The sampling strategy for the link (this will control which values the function is applied to).
   * @param <U>      The type of the new values.
   * @return A new stream of the applications of the function.
   */
  default <U> SwimStream<U> fold(final U seed, final BiFunction<U, T, U> op,
                                 final Form<U> form, final Sampling sampling) {
    return fold(seed, op, form, sampling, false);
  }

  /**
   * Fold across the values of the stream to produce a new stream. For each sample taken from this stream apply the
   * provided function to it and the previously computed value (starting with the specified seed). The output of the
   * function is the new value of the stream.
   *
   * @param seed The seed value for the computation.
   * @param op   The function to combine the values of this stream with the previously computed value.
   * @param form The form of the new values.
   * @param <U>  The type of the new values.
   * @return A new stream of the applications of the function.
   */
  default <U> SwimStream<U> fold(final U seed, final BiFunction<U, T, U> op, final Form<U> form) {
    return fold(seed, op, form, Sampling.eager());
  }

  /**
   * Fold across the values of the stream to produce a new stream. For each sample taken from this stream apply the
   * provided function to it and the previously computed value (starting with the specified seed). The output of the
   * function is the new value of the stream.
   *
   * @param seed        The seed value for the computation.
   * @param op          The function to combine the values of this stream with the previously computed value.
   * @param form        The form of the new values.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param <U>         The type of the new values.
   * @return A new stream of the applications of the function.
   */
  default <U> SwimStream<U> fold(final U seed, final BiFunction<U, T, U> op,
                                 final Form<U> form, final boolean isTransient) {
    return fold(seed, op, form, Sampling.eager(), isTransient);
  }

  /**
   * Fold across the values of the stream to produce a new stream. For each sample taken from this stream apply the
   * provided function to it and the previously computed value (starting with the specified seed). The output of the
   * function is the new value of the stream.
   *
   * @param seed The seed value for the computation.
   * @param op   The function to combine the values of this stream with the previously computed value.
   * @return A new stream of the applications of the function.
   */
  default SwimStream<T> fold(final T seed, final BiFunction<T, T, T> op) {
    return fold(seed, op, form(), Sampling.eager());
  }

  /**
   * Fold across the values of the stream to produce a new stream. For each sample taken from this stream apply the
   * provided function to it and the previously computed value (starting with the specified seed). The output of the
   * function is the new value of the stream.
   *
   * @param seed        The seed value for the computation.
   * @param op          The function to combine the values of this stream with the previously computed value.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @return A new stream of the applications of the function.
   */
  default SwimStream<T> fold(final T seed, final BiFunction<T, T, T> op, final boolean isTransient) {
    return fold(seed, op, form(), Sampling.eager(), isTransient);
  }

  /**
   * Modally apply a binary operator across the values of this stream. The new stream will maintain a running
   * accumulation as computed by the operator. The difference between this and {@link #reduce(BinaryOperator, Sampling)}
   * is that an auxiliary control stream modifies the behaviour of the operator.
   *
   * @param initialMode   The initial mode of the stream.
   * @param op            The modal operator.
   * @param sampling      Sampling strategy for the link (this will control which values the operator is applied to).
   * @param controlStream The control stream of the operator.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @return A stream of running accumulations.
   */
  <M> SwimStream<T> reduceModal(M initialMode, Function<M, BinaryOperator<T>> op, Sampling sampling,
                                SwimStream<M> controlStream, boolean isTransient);

  /**
   * Modally apply a binary operator across the values of this stream. The new stream will maintain a running
   * accumulation as computed by the operator. The difference between this and {@link #reduce(BinaryOperator, Sampling)}
   * is that an auxiliary control stream modifies the behaviour of the operator.
   *
   * @param initialMode   The initial mode of the stream.
   * @param op            The modal operator.
   * @param sampling      Sampling strategy for the link (this will control which values the operator is applied to).
   * @param controlStream The control stream of the operator.
   * @return A stream of running accumulations.
   */
  default <M> SwimStream<T> reduceModal(final M initialMode, final Function<M, BinaryOperator<T>> op,
                                        final Sampling sampling, final SwimStream<M> controlStream) {
    return reduceModal(initialMode, op, sampling, controlStream, false);
  }

  /**
   * Modally apply a binary operator across the values of this stream. The new stream will maintain a running
   * accumulation as computed by the operator. The difference between this and {@link #reduce(BinaryOperator, Sampling)}
   * is that an auxiliary control stream modifies the behaviour of the operator.
   *
   * @param initialMode   The initial mode of the stream.
   * @param op            The modal operator.
   * @param controlStream The control stream of the operator.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @return A stream of running accumulations.
   */
  default <M> SwimStream<T> reduceModal(final M initialMode, final Function<M, BinaryOperator<T>> op,
                                        final SwimStream<M> controlStream, final boolean isTransient) {
    return reduceModal(initialMode, op, Sampling.eager(), controlStream, isTransient);
  }

  /**
   * Modally apply a binary operator across the values of this stream. The new stream will maintain a running
   * accumulation as computed by the operator. The difference between this and {@link #reduce(BinaryOperator, Sampling)}
   * is that an auxiliary control stream modifies the behaviour of the operator.
   *
   * @param initialMode   The initial mode of the stream.
   * @param op            The modal operator.
   * @param controlStream The control stream of the operator.
   * @return A stream of running accumulations.
   */
  default <M> SwimStream<T> reduceModal(final M initialMode, final Function<M, BinaryOperator<T>> op,
                                        final SwimStream<M> controlStream) {
    return reduceModal(initialMode, op, Sampling.eager(), controlStream);
  }

  /**
   * Modally fold across the values of the stream to produce a new stream. For each sample taken from this stream
   * apply the provided function to it and the previously computed value (starting with the specified seed). The
   * output of the function is the new value of the stream for the key. The difference between this and
   * {@link #fold(Object, BiFunction, Form, Sampling)} is that an auxiliary control stream modifies the behaviour
   * of the update function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param seed          The seed value for the computation.
   * @param op            The  modal function to combine the values of this stream with the previously computed value.
   * @param form          The form of the new values.
   * @param sampling      The sampling strategy for the link (this will control which values the function is applied to).
   * @param controlStream The control stream of the update operation.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @param <U>           The type of the new values.
   * @return A new stream of the applications of the function.
   */
  <U, M> SwimStream<U> foldModal(M initialMode, U seed, Function<M, BiFunction<U, T, U>> op, Form<U> form,
                                 Sampling sampling, SwimStream<M> controlStream, boolean isTransient);

  /**
   * Modally fold across the values of the stream to produce a new stream. For each sample taken from this stream
   * apply the provided function to it and the previously computed value (starting with the specified seed). The
   * output of the function is the new value of the stream for the key. The difference between this and
   * {@link #fold(Object, BiFunction, Form, Sampling)} is that an auxiliary control stream modifies the behaviour
   * of the update function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param seed          The seed value for the computation.
   * @param op            The  modal function to combine the values of this stream with the previously computed value.
   * @param form          The form of the new values.
   * @param sampling      The sampling strategy for the link (this will control which values the function is applied to).
   * @param controlStream The control stream of the update operation.
   * @param <U>           The type of the new values.
   * @return A new stream of the applications of the function.
   */
  default <U, M> SwimStream<U> foldModal(final M initialMode, final U seed,
                                         final Function<M, BiFunction<U, T, U>> op, final Form<U> form,
                                         final Sampling sampling, final SwimStream<M> controlStream) {
    return foldModal(initialMode, seed, op, form, sampling, controlStream, false);
  }

  /**
   * Modally fold across the values of the stream to produce a new stream. For each sample taken from this stream
   * apply the provided function to it and the previously computed value (starting with the specified seed). The
   * output of the function is the new value of the stream for the key. The difference between this and
   * {@link #fold(Object, BiFunction, Form, Sampling)} is that an auxiliary control stream modifies the behaviour
   * of the update function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param seed          The seed value for the computation.
   * @param op            The  modal function to combine the values of this stream with the previously computed value.
   * @param form          The form of the new values.
   * @param controlStream The control stream of the update operation.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @param <U>           The type of the new values.
   * @return A new stream of the applications of the function.
   */
  default <U, M> SwimStream<U> foldModal(final M initialMode,
                                         final U seed, final Function<M, BiFunction<U, T, U>> op,
                                         final Form<U> form,
                                         final SwimStream<M> controlStream, final boolean isTransient) {
    return foldModal(initialMode, seed, op, form, Sampling.eager(), controlStream, isTransient);
  }

  /**
   * Modally fold across the values of the stream to produce a new stream. For each sample taken from this stream
   * apply the provided function to it and the previously computed value (starting with the specified seed). The
   * output of the function is the new value of the stream for the key. The difference between this and
   * {@link #fold(Object, BiFunction, Form, Sampling)} is that an auxiliary control stream modifies the behaviour
   * of the update function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param seed          The seed value for the computation.
   * @param op            The  modal function to combine the values of this stream with the previously computed value.
   * @param form          The form of the new values.
   * @param controlStream The control stream of the update operation.
   * @param <U>           The type of the new values.
   * @return A new stream of the applications of the function.
   */
  default <U, M> SwimStream<U> foldModal(final M initialMode,
                                         final U seed, final Function<M, BiFunction<U, T, U>> op,
                                         final Form<U> form,
                                         final SwimStream<M> controlStream) {
    return foldModal(initialMode, seed, op, form, Sampling.eager(), controlStream);
  }

  /**
   * Modally fold across the values of the stream to produce a new stream. For each sample taken from this stream
   * apply the provided function to it and the previously computed value (starting with the specified seed). The
   * output of the function is the new value of the stream for the key. The difference between this and
   * {@link #fold(Object, BiFunction, Form, Sampling)} is that an auxiliary control stream modifies the behaviour
   * of the update function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param seed          The seed value for the computation.
   * @param op            The  modal function to combine the values of this stream with the previously computed value.
   * @param controlStream The control stream of the update operation.
   * @param isTransient   Whether the state of this stream is stored persistently.
   * @return A new stream of the applications of the function.
   */
  default <M> SwimStream<T> foldModal(final M initialMode,
                                      final T seed, final Function<M, BiFunction<T, T, T>> op,
                                      final SwimStream<M> controlStream, final boolean isTransient) {
    return foldModal(initialMode, seed, op, form(), Sampling.eager(), controlStream, isTransient);
  }

  /**
   * Modally fold across the values of the stream to produce a new stream. For each sample taken from this stream
   * apply the provided function to it and the previously computed value (starting with the specified seed). The
   * output of the function is the new value of the stream for the key. The difference between this and
   * {@link #fold(Object, BiFunction, Form, Sampling)} is that an auxiliary control stream modifies the behaviour
   * of the update function.
   *
   * @param initialMode   The initial mode of the stream.
   * @param seed          The seed value for the computation.
   * @param op            The  modal function to combine the values of this stream with the previously computed value.
   * @param controlStream The control stream of the update operation.
   * @return A new stream of the applications of the function.
   */
  default <M> SwimStream<T> foldModal(final M initialMode,
                                      final T seed, final Function<M, BiFunction<T, T, T>> op,
                                      final SwimStream<M> controlStream) {
    return foldModal(initialMode, seed, op, form(), Sampling.eager(), controlStream);
  }

  /**
   * Partitions the stream into a map stream.
   *
   * @param assigner    Assigns partitions (keys in the map) to values.
   * @param partForm    The form of the partitions.
   * @param sampling    The sampling strategy for the link.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param <P>         The type of the partitions.
   * @param <S>         The type of the state tracking open windows.
   * @return The partitioned stream.
   */
  <P, S extends PartitionState<P, S>> MapSwimStream<P, T> partition(PartitionAssigner<T, P, S> assigner,
                                                                    Form<P> partForm,
                                                                    Sampling sampling,
                                                                    boolean isTransient);

  /**
   * Partitions the stream into a map stream.
   *
   * @param assigner Assigns partitions (keys in the map) to values.
   * @param partForm The form of the partitions.
   * @param sampling The sampling strategy for the link.
   * @param <P>      The type of the partitions.
   * @param <S>      The type of the state tracking open windows.
   * @return The partitioned stream.
   */
  default <P, S extends PartitionState<P, S>> MapSwimStream<P, T> partition(final PartitionAssigner<T, P, S> assigner,
                                                                            final Form<P> partForm,
                                                                            final Sampling sampling) {
    return partition(assigner, partForm, sampling, false);
  }

  /**
   * Partitions the stream into a map stream.
   *
   * @param assigner    Assigns partitions (keys in the map) to values.
   * @param partForm    The form of the partitions.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param <P>         The type of the partitions.
   * @param <S>         The type of the state tracking open windows.
   * @return The partitioned stream.
   */
  default <P, S extends PartitionState<P, S>> MapSwimStream<P, T> partition(final PartitionAssigner<T, P, S> assigner,
                                                                            final Form<P> partForm,
                                                                            final boolean isTransient) {
    return partition(assigner, partForm, Sampling.eager(), isTransient);
  }

  /**
   * Partitions the stream into a map stream.
   *
   * @param assigner Assigns partitions (keys in the map) to values.
   * @param partForm The form of the partitions.
   * @param <P>      The type of the partitions.
   * @param <S>      The type of the state tracking open windows.
   * @return The partitioned stream.
   */
  default <P, S extends PartitionState<P, S>> MapSwimStream<P, T> partition(final PartitionAssigner<T, P, S> assigner,
                                                                            final Form<P> partForm) {
    return partition(assigner, partForm, Sampling.eager());
  }

  /**
   * Divides the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param assigner    Assigns each value to one or more windows.
   * @param windowForm  The form of the windows.
   * @param sampling    The sampling strategy for the link.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param <W>         The type of the windows.
   * @return A windowed stream.
   */
  <W, S extends WindowState<W, S>> WindowedSwimStream<T, W> window(TemporalWindowAssigner<T, W, S> assigner,
                                                                   Form<W> windowForm,
                                                                   Sampling sampling,
                                                                   boolean isTransient);

  /**
   * Divides the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more windows.
   * @param windowForm The form of the windows.
   * @param sampling   The sampling strategy for the link.
   * @param <W>        The type of the windows.
   * @return A windowed stream.
   */
  default <W, S extends WindowState<W, S>> WindowedSwimStream<T, W> window(final TemporalWindowAssigner<T, W, S> assigner,
                                                                           final Form<W> windowForm,
                                                                           final Sampling sampling) {
    return window(assigner, windowForm, sampling, false);
  }

  /**
   * Divides the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param assigner    Assigns each value to one or more windows.
   * @param windowForm  The form of the windows.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param <W>         The type of the windows.
   * @return A windowed stream.
   */
  default <W, S extends WindowState<W, S>> WindowedSwimStream<T, W> window(
      final TemporalWindowAssigner<T, W, S> assigner,
      final Form<W> windowForm,
      final boolean isTransient) {
    return window(assigner, windowForm, Sampling.eager(), isTransient);
  }

  /**
   * Divides the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more windows.
   * @param windowForm The form of the windows.
   * @param <W>        The type of the windows.
   * @return A windowed stream.
   */
  default <W, S extends WindowState<W, S>> WindowedSwimStream<T, W> window(
      final TemporalWindowAssigner<T, W, S> assigner,
      final Form<W> windowForm) {
    return window(assigner, windowForm, Sampling.eager());
  }

  /**
   * Divides the values by partition and temporal window simultaneously using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more partitions and windows.
   * @param partForm   The form of the partitions.
   * @param windowForm The form of the windows.
   * @param sampling   The sampling strategy for the link.
   * @param <P>        The type of the partitions.
   * @param <W>        The type of the windows.
   * @param <S>        The type of the state managing the open partitions and windows.
   * @return The partitioned and windowed stream.
   */
  <P, W, S extends CombinedState<P, W, S>> MapWindowedSwimStream<P, T, W> window(
      CombinedWindowAssigner<T, P, W, S> assigner,
      Form<P> partForm,
      Form<W> windowForm,
      Sampling sampling,
      boolean isTransient);

  /**
   * Divides the values by partition and temporal window simultaneously using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more partitions and windows.
   * @param partForm   The form of the partitions.
   * @param windowForm The form of the windows.
   * @param sampling   The sampling strategy for the link.
   * @param <P>        The type of the partitions.
   * @param <W>        The type of the windows.
   * @param <S>        The type of the state managing the open partitions and windows.
   * @return The partitioned and windowed stream.
   */
  default <P, W, S extends CombinedState<P, W, S>> MapWindowedSwimStream<P, T, W> window(
      final CombinedWindowAssigner<T, P, W, S> assigner,
      final Form<P> partForm,
      final Form<W> windowForm,
      final Sampling sampling) {
    return window(assigner, partForm, windowForm, sampling, false);
  }

  /**
   * Divides the values by partition and temporal window simultaneously using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more partitions and windows.
   * @param partForm   The form of the partitions.
   * @param windowForm The form of the windows.
   * @param <P>        The type of the partitions.
   * @param <W>        The type of the windows.
   * @param <S>        The type of the state managing the open partitions and windows.
   * @return The partitioned and windowed stream.
   */
  default <P, W, S extends CombinedState<P, W, S>> MapWindowedSwimStream<P, T, W> window(
      final CombinedWindowAssigner<T, P, W, S> assigner,
      final Form<P> partForm,
      final Form<W> windowForm,
      final boolean isTransient) {
    return window(assigner, partForm, windowForm, Sampling.eager(), isTransient);
  }

  /**
   * Divides the values by partition and temporal window simultaneously using a configurable strategy.
   *
   * @param assigner   Assigns each value to one or more partitions and windows.
   * @param partForm   The form of the partitions.
   * @param windowForm The form of the windows.
   * @param <P>        The type of the partitions.
   * @param <W>        The type of the windows.
   * @param <S>        The type of the state managing the open partitions and windows.
   * @return The partitioned and windowed stream.
   */
  default <P, W, S extends CombinedState<P, W, S>> MapWindowedSwimStream<P, T, W> window(
      final CombinedWindowAssigner<T, P, W, S> assigner,
      final Form<P> partForm,
      final Form<W> windowForm) {
    return window(assigner, partForm, windowForm, Sampling.eager());
  }

  /**
   * Divides the values into (possibly overlapping) windows, using a configurable strategy.
   *
   * @param spec The specification of the windows.
   * @param <W>  The type of the windows.
   * @param <S>  The type of the state tracking open windows.
   * @return The windowed stream.
   */
  default <W, S extends WindowState<W, S>> WindowedSwimStream<T, W> window(final WindowSpec<T, W, S> spec) {
    return window(spec.getAssigner(), spec.getWindowForm())
        .withTrigger(spec.getTrigger())
        .withEviction(spec.getEvictionStrategy())
        .setTransient(spec.isTransient());
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
  default <W, S extends WindowState<W, S>> WindowedSwimStream<T, W> window(final WindowSpec<T, W, S> spec,
                                                                           final Sampling sampling) {
    return window(spec.getAssigner(), spec.getWindowForm(), sampling)
        .withTrigger(spec.getTrigger())
        .withEviction(spec.getEvictionStrategy())
        .setTransient(spec.isTransient());
  }

  /**
   * Join together two streams using a common windowing strategy. If there are duplicate values for a key in a
   * window the value that is chosen is not defined.
   *
   * @param other       The other stream.
   * @param assigner    Assigns items in both streams to one or more windows.
   * @param trigger     Determines when a window is complete.
   * @param kform       The form of the type of the join keys.
   * @param vform       The form of the type of the joined values.
   * @param windowForm  The form of the type of the windows.
   * @param sampling    The sampling strategy for the links.
   * @param firstToKey  Gets the keys for the first type.
   * @param secondToKey Gets the keys for the second type.
   * @param combine     Combines pairs of records to for a single output.
   * @param <W>         The type of the windows.
   * @param <K>         The type of the keys.
   * @param <T2>        The type of the values in the other stream.
   * @param <U>         The type of the combined values.
   * @return The joined stream.
   */
  <W, K, T2, U, S extends WindowState<W, S>> MapSwimStream<K, U> windowJoin(SwimStream<T2> other,
                                                                            TemporalWindowAssigner<Either<T, T2>, W, S> assigner,
                                                                            Trigger<Either<T, T2>, W> trigger,
                                                                            Form<K> kform, Form<U> vform,
                                                                            Form<W> windowForm,
                                                                            Sampling sampling,
                                                                            Function<T, K> firstToKey,
                                                                            Function<T2, K> secondToKey,
                                                                            BiFunction<T, T2, U> combine);

  /**
   * Combine together stream of the same type.
   *
   * @param others The other streams.
   * @return The combined stream.
   */
  SwimStream<T> union(Iterable<SwimStream<? extends T>> others);

  /**
   * Combine this stream with another of the same type.
   *
   * @param other The other stream.
   * @return The combined stream.
   */
  SwimStream<T> union(SwimStream<? extends T> other);

  /**
   * Create a stream that will always hold the first value received by this stream.
   *
   * @param isTransient Whether to store the first value persistently.
   * @return The first value stream.
   */
  SwimStream<T> first(boolean isTransient);

  /**
   * Create a stream that will always hold the first value received by this stream.
   *
   * @return The first value stream.
   */
  default SwimStream<T> first() {
    return first(false);
  }

  /**
   * Interpreting this stream as a sequence of discrete samples, create a stream which contains the value
   * received by this stream {@code n} steps before the current value.
   *
   * @param n           The number of steps back (must be at least 1).
   * @param isTransient Whether to store the history persistently.
   * @return The delayed stream.
   */
  SwimStream<T> delayed(int n, boolean isTransient);

  /**
   * Interpreting this stream as a sequence of discrete samples, create a stream which contains the value
   * received by this stream {@code n} steps before the current value.
   *
   * @param ns          Stream of the number of steps back (must be at least 1).
   * @param isTransient Whether to store the history persistently.
   * @param init        Initial delay.
   * @return The delayed stream.
   */
  SwimStream<T> delayed(SwimStream<Integer> ns, int init, boolean isTransient);

  /**
   * Interpreting this stream as a sequence of discrete samples, create a stream which contains the value
   * received by this stream {@code n} steps before the current value.
   *
   * @param n The number of steps back (must be at least 1).
   * @return The delayed stream.
   */
  default SwimStream<T> delayed(final int n) {
    return delayed(n, false);
  }

  /**
   * Interpreting this stream as a sequence of discrete samples, create a stream which contains the value
   * received by this stream {@code n} steps before the current value.
   *
   * @param ns   Stream of the number of steps back (must be at least 1).
   * @param init Initial delay.
   * @return The delayed stream.
   */
  default SwimStream<T> delayed(final SwimStream<Integer> ns, final int init) {
    return delayed(ns, init, false);
  }

  /**
   * Interpreting this stream as a sequence of discrete samples, create a stream which contains the previous value of
   * this stream.
   *
   * @param isTransient Whether to store the history persistently.
   * @return The delayed stream.
   */
  default SwimStream<T> previous(final boolean isTransient) {
    return delayed(1, isTransient);
  }

  /**
   * Interpreting this stream as a sequence of discrete samples, create a stream which contains the previous value of
   * this stream.
   *
   * @return The delayed stream.
   */
  default SwimStream<T> previous() {
    return delayed(1, false);
  }

  /**
   * Key this stream.
   *
   * @param keys        Function to extract the keys.
   * @param kform       The form of the key type.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param <K>         The type of the keys.
   * @return A copy of this stream with keys.
   */
  <K> MapSwimStream<K, T> keyBy(Function<T, K> keys, Form<K> kform, boolean isTransient);

  /**
   * Key this stream.
   *
   * @param keys  Function to extract the keys.
   * @param kform The form of the key type.
   * @param <K>   The type of the keys.
   * @return A copy of this stream with keys.
   */
  default <K> MapSwimStream<K, T> keyBy(final Function<T, K> keys, final Form<K> kform) {
    return keyBy(keys, kform, false);
  }

  /**
   * Attach this stream to a sink.
   *
   * @param sink Descriptor of the sink.
   * @return Handle for the graph leaf represented by this sink.
   */
  SinkHandle<Unit, T> bind(Sink<T> sink);

  /**
   * Instantiate this stream as a node in a flow graph as a {@link Junction}.
   *
   * @param context Initialization context to keep track of nodes in the graph.
   * @return The junction corresponding to this node.
   */
  Junction<T> instantiate(SwimStreamContext.InitContext context);

}
