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

package swim.dataflow.graph.impl;

import java.util.Map;
import java.util.Set;
import java.util.function.BiFunction;
import java.util.function.BiPredicate;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.ToLongFunction;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.CollectionSwimStream;
import swim.dataflow.graph.MapSink;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.MapWindowedSwimStream;
import swim.dataflow.graph.Pair;
import swim.dataflow.graph.SinkHandle;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.sampling.Sampling;
import swim.dataflow.graph.windows.TemporalWindowAssigner;
import swim.dataflow.graph.windows.WindowState;
import swim.structure.Form;

/**
 * Provides standard implementations of combinator builder methods.
 *
 * @param <K> The key type of the stream.
 * @param <V> The value type of the stream.
 */
public abstract class AbstractMapStream<K, V> implements MapSwimStream<K, V> {

  private final Form<K> keyForm;
  private final Form<V> valForm;
  private final ToLongFunction<V> timestamps;
  private final BindingContext context;

  private String id;

  @Override
  public final String id() {
    return id;
  }

  @Override
  public final AbstractMapStream<K, V> setId(final String id) {
    context.claimId(id);
    this.id = id;
    return this;
  }

  /**
   * @return Context use to instantiate the graph.
   */
  protected BindingContext getContext() {
    return context;
  }

  /**
   * @param kform Form of the type of the keys.
   * @param vform Form of the type of the values.
   * @param con   Context used to instantiate the graph.
   */
  protected AbstractMapStream(final Form<K> kform, final Form<V> vform,
                    final BindingContext con) {

    this(kform, vform, con, null);
  }

  /**
   * @param kform Form of the type of the keys.
   * @param vform Form of the type of the values.
   * @param con   Context used to instantiate the graph.
   * @param ts    Timestamp assignment for the values.
   */
  protected AbstractMapStream(final Form<K> kform, final Form<V> vform,
                    final BindingContext con, final ToLongFunction<V> ts) {

    keyForm = kform;
    valForm = vform;
    context = con;
    timestamps = ts;
    id = con.createId();
  }


  @Override
  public final ToLongFunction<V> getTimestamps() {
    return timestamps;
  }

  @Override
  public final Form<K> keyForm() {
    return keyForm;
  }

  @Override
  public final Form<V> valueForm() {
    return valForm;
  }

  @Override
  public CollectionSwimStream<K, Set<K>> keys() {
    return new KeyStream<>(this, context);
  }

  @Override
  public MapSwimStream<K, V> filter(final BiPredicate<K, V> predicate) {
    return new FilteredMapStream<>(this, context, predicate);
  }

  @Override
  public <M> MapSwimStream<K, V> filterModal(final M initialMode, final Function<M, BiPredicate<K, V>> modalPredicate,
                                             final SwimStream<M> controlStream, final boolean isTransient) {
    return new ModalFilteredMapStream<>(this, context, initialMode, modalPredicate, controlStream, isTransient);
  }

  @Override
  public <M> MapSwimStream<K, V> filterKeysModal(final M initialMode,
                                                 final Function<M, Predicate<K>> modalPredicate,
                                                 final SwimStream<M> controlStream,
                                                 final boolean isTransient) {
    return new ModalFilteredKeysMapStream<>(this, context, initialMode, modalPredicate, controlStream, isTransient);
  }

  @Override
  public <U> SwimStream<U> reduceKeyed(final U seed, final BiFunction<U, ? super V, U> op,
                                       final BinaryOperator<U> combine, final Form<U> form, final Sampling sampling) {
    return new ReducedByEntriesMapStream<>(this, context, seed, op, combine, form, sampling);
  }

  @Override
  public <K2> MapSwimStream<K2, V> mapKeys(final BiFunction<K, V, ? extends K2> f,
                                           final Function<K, Set<K2>> onRem, final Form<K2> kform) {
    final BiFunction<K, V, Pair<K2, V>> toPair = (k, v) -> new Pair<>(f.apply(k, v), v);
    return new TransformedMapStream<>(this, context, toPair, onRem, kform, valForm);
  }

  @Override
  public <V2> MapSwimStream<K, V2> mapValues(final BiFunction<K, V, ? extends V2> f, final boolean memoize, final Form<V2> vform) {
    return new TransformedValuesMapStream<>(this, context, f, memoize, vform);
  }

  @Override
  public <K2, V2> MapSwimStream<K2, V2> map(final BiFunction<K, V, Pair<K2, V2>> f,
                                            final Function<K, Set<K2>> onRem, final Form<K2> kform, final Form<V2> vform) {
    return new TransformedMapStream<>(this, context, f, onRem, kform, vform);
  }

  @Override
  public <K2, V2> MapSwimStream<K2, V2> flatMap(final BiFunction<K, V, Iterable<Pair<K2, V2>>> f,
                                                final Function<K, Set<K2>> onRem,
                                                final Form<K2> kform, final Form<V2> vform) {
    return new FlatMappedMapStream<>(this, context, f, onRem, kform, vform);
  }

  @Override
  public SwimStream<V> get(final K key, final Sampling sampling) {
    return new KeyFetch<>(this, context, key, sampling);
  }

  @Override
  public SwimStream<V> get(final SwimStream<K> keys, final Sampling sampling, final boolean isTransient) {
    return new ModalKeyFetch<>(this, context, keys, sampling, isTransient);
  }

  @Override
  public SwimStream<Map<K, V>> stream() {
    return new KeyValueStream<>(this, getContext());
  }

  @Override
  public <U> MapSwimStream<K, U> fold(final U seed, final BiFunction<U, V, U> op, final Form<U> form,
                                      final Sampling sampling, final boolean isTransient) {
    return new FoldedMapStream<>(this, context, form, seed, op, sampling, isTransient);
  }

  @Override
  public <U, M> MapSwimStream<K, U> foldModal(final M initialMode, final U seed, final Function<M, BiFunction<U, V, U>> op,
                                              final Form<U> form, final Sampling sampling,
                                              final SwimStream<M> controlStream, final boolean isTransient) {
    return new ModalFoldedMapStream<>(this, context, form, seed, initialMode, op, controlStream, sampling, isTransient);
  }

  @Override
  public MapSwimStream<K, V> reduce(final BinaryOperator<V> op, final Sampling sampling, final boolean isTransient) {
    return new ReducedMapStream<>(this, context, op, sampling, isTransient);
  }

  @Override
  public <M> MapSwimStream<K, V> reduceModal(final M initialMode,
                                             final Function<M, BinaryOperator<V>> op, final Sampling sampling,
                                             final SwimStream<M> controlStream, final boolean isTransient) {
    return new ModalReducedMapStream<>(this, context, op, initialMode, controlStream, sampling, isTransient);
  }

  @Override
  public <W, S extends WindowState<W, S>> MapWindowedSwimStream<K, V, W> window(
      final Function<K, TemporalWindowAssigner<V, W, S>> assigner,
      final Form<W> windowForm,
      final Sampling sampling,
      final boolean isTransient) {
    return new MapWindowedStream<>(this, context, windowForm, assigner, null, null,
        sampling, isTransient);
  }

  @Override
  public <V2, U> MapSwimStream<K, U> join(final MapSwimStream<K, V2> other, final BiFunction<V, V2, U> combiner,
                                          final Form<U> form, final Sampling sampling) {
    return new JoinedStream<>(this, other, context, form, combiner, null, null, sampling);
  }

  @Override
  public <V2, U> MapSwimStream<K, U> leftJoin(final MapSwimStream<K, V2> other, final BiFunction<V, V2, U> combiner, final Function<V, U> leftOnly,
                                              final Form<U> form, final Sampling sampling) {
    return new JoinedStream<>(this, other, context, form, combiner, leftOnly, null, sampling);
  }

  @Override
  public <V2, U> MapSwimStream<K, U> rightJoin(final MapSwimStream<K, V2> other, final BiFunction<V, V2, U> combiner,
                                               final Function<V2, U> rightOnly, final Form<U> form, final Sampling sampling) {
    return new JoinedStream<>(this, other, context, form, combiner, null, rightOnly, sampling);
  }

  @Override
  public <V2, U> MapSwimStream<K, U> fullJoin(final MapSwimStream<K, V2> other, final BiFunction<V, V2, U> combiner,
                                              final Function<V, U> leftOnly, final Function<V2, U> rightOnly,
                                              final Form<U> form, final Sampling sampling) {
    return new JoinedStream<>(this, other, context, form, combiner, leftOnly, rightOnly, sampling);
  }

  @Override
  public MapSwimStream<K, V> first(final boolean resetOnRemoval, final boolean isTransient) {
    return new FirstMapStream<>(this, context, resetOnRemoval, isTransient);
  }

  @Override
  public MapSwimStream<K, V> delayed(final int n, final boolean isTransient) {
    return new DelayedMapStream<>(this, context, n, isTransient);
  }

  @Override
  public MapSwimStream<K, V> delayed(final SwimStream<Integer> ns, final int init, final boolean isTransient) {
    return new VariableDelayedMapStream<>(this, context, ns, init, isTransient);
  }

  public SinkHandle<K, V> bind(final MapSink<K, V> sink) {
    return context.bindSink(this, sink);
  }


}
