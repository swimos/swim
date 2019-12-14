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

import java.util.Collection;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.ToLongFunction;
import swim.collections.FingerTrieSeq;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.CollectionSwimStream;
import swim.dataflow.graph.Either;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.MapWindowedSwimStream;
import swim.dataflow.graph.Pair;
import swim.dataflow.graph.Sink;
import swim.dataflow.graph.SinkHandle;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.Unit;
import swim.dataflow.graph.WindowedSwimStream;
import swim.dataflow.graph.sampling.DelaySpecifier;
import swim.dataflow.graph.sampling.Sampling;
import swim.dataflow.graph.windows.CombinedState;
import swim.dataflow.graph.windows.CombinedWindowAssigner;
import swim.dataflow.graph.windows.PartitionAssigner;
import swim.dataflow.graph.windows.PartitionState;
import swim.dataflow.graph.windows.TemporalWindowAssigner;
import swim.dataflow.graph.windows.WindowState;
import swim.dataflow.graph.windows.triggers.Trigger;
import swim.structure.Form;
import swim.util.Builder;

/**
 * Provides standard implementations of combinator builder methods.
 *
 * @param <T> The type of the values.
 */
public abstract class AbstractSwimStream<T> implements SwimStream<T> {

  private final Form<T> form;
  private final ToLongFunction<T> timestamps;
  private final BindingContext context;
  private String id;

  @Override
  public final String id() {
    return id;
  }

  @Override
  public final AbstractSwimStream<T> setId(final String id) {
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
   * @param valForm The form of the type of the values.
   * @param con     Context used to instantiate the graph.
   */
  protected AbstractSwimStream(final Form<T> valForm, final BindingContext con) {
    this.id = con.createId();
    form = valForm;
    timestamps = null;
    context = con;
  }

  /**
   * @param valForm The form of the type of the values.
   * @param con     Context used to instantiate the graph.
   * @param ts      Assigns timestamps.
   */
  protected AbstractSwimStream(final Form<T> valForm, final BindingContext con, final ToLongFunction<T> ts) {
    this.id = con.createId();
    form = valForm;
    timestamps = ts;
    context = con;
  }

  @Override
  public ToLongFunction<T> getTimestamps() {
    return timestamps;
  }

  @Override
  public final Form<T> form() {
    return form;
  }

  @Override
  public <U> SwimStream<U> map(final Function<T, ? extends U> f, final boolean memoize, final Form<U> form) {
    return new TransformedStream<>(this, context, f, memoize, form);
  }

  @Override
  public <U, C extends Collection<U>> CollectionSwimStream<U, C> mapToCollection(final Function<T, C> f,
                                                                                 final boolean memoize,
                                                                                 final Form<C> form) {
    return new TransformedColStream<>(this, context, f, memoize, form);
  }

  @Override
  public SwimStream<T> filter(final Predicate<T> predicate) {
    return new FilteredStream<>(this, context, predicate);
  }


  @Override
  public <M> SwimStream<T> filterModal(final M initialMode,
                                       final Function<M, Predicate<T>> predicate, final SwimStream<M> controlStream,
                                       final boolean isTransient) {
    return new ModalFilteredStream<>(this, context, initialMode, predicate, controlStream, isTransient);
  }

  @Override
  public Pair<SwimStream<T>, SwimStream<T>> split(final Predicate<T> predicate) {
    return new Pair<>(filter(predicate), filter(predicate.negate()));
  }

  @Override
  public <E extends Enum<E>> Map<E, SwimStream<T>> categorize(final Function<T, E> categories, final Class<E> enumType) {
    final EnumMap<E, SwimStream<T>> streamMap = new EnumMap<>(enumType);
    for (final E enumConst : enumType.getEnumConstants()) {
      streamMap.put(enumConst, filter(x -> categories.apply(x) == enumConst));
    }
    return streamMap;
  }

  @Override
  public <U> SwimStream<U> flatMap(final Function<T, Iterable<U>> f, final Form<U> form, final DelaySpecifier delay) {

    return new FlatMapStream<>(this, context, form, f, delay);
  }

  @Override
  public <U, M2> SwimStream<U> mapModal(final M2 initialMode,
                                        final Function<M2, Function<T, ? extends U>> f,
                                        final boolean memoize,
                                        final Form<U> form,
                                        final SwimStream<M2> controlStream,
                                        final boolean isTransient) {
    return new ModalTransformedStream<>(this, context, initialMode, f, memoize, controlStream, form, isTransient);
  }

  @Override
  public <U, M> SwimStream<U> flatMapModal(final M initialMode, final Function<M, Function<T, Iterable<U>>> f,
                                           final Form<U> form, final DelaySpecifier delay,
                                           final SwimStream<M> controlStream, final boolean isTransient) {
    return new ModalFlatMapStream<>(this, context, form, initialMode, f, delay, controlStream, isTransient);
  }

  @Override
  public <U> SwimStream<U> fold(final U seed, final BiFunction<U, T, U> op, final Form<U> form,
                                final Sampling sampling, final boolean isTransient) {
    return new FoldedStream<>(this, context, form, seed, op, sampling, isTransient);
  }

  @Override
  public SwimStream<T> reduce(final BinaryOperator<T> op, final Sampling sampling, final boolean isTransient) {
    return new ReducedStream<>(this, context, op, sampling, isTransient);
  }

  @Override
  public <U, M> SwimStream<U> foldModal(final M initialMode, final U seed, final Function<M, BiFunction<U, T, U>> op,
                                        final Form<U> form, final Sampling sampling, final SwimStream<M> controlStream,
                                        final boolean isTransient) {
    return new ModalFoldedStream<>(this, context, initialMode, form, seed, op,
        sampling, controlStream, isTransient);
  }

  @Override
  public <M> SwimStream<T> reduceModal(final M initialMode, final Function<M, BinaryOperator<T>> op,
                                       final Sampling sampling, final SwimStream<M> controlStream,
                                       final boolean isTransient) {
    return new ModalReducedStream<>(this, context, initialMode, op, sampling, controlStream, isTransient);
  }

  @Override
  public SwimStream<T> union(final Iterable<SwimStream<? extends T>> others) {
    final Builder<SwimStream<? extends T>, FingerTrieSeq<SwimStream<? extends T>>> builder = FingerTrieSeq.builder();
    builder.add(this);
    for (final SwimStream<? extends T> other : others) {
      builder.add(other);
    }
    final FingerTrieSeq<SwimStream<? extends T>> seq = builder.bind();
    if (seq.isEmpty()) {
      return this;
    } else {
      return new UnionStream<>(form(), seq, context);
    }
  }

  @Override
  public SwimStream<T> union(final SwimStream<? extends T> other) {
    final Builder<SwimStream<? extends T>, FingerTrieSeq<SwimStream<? extends T>>> builder = FingerTrieSeq.builder();
    builder.add(this);
    builder.add(other);
    return new UnionStream<>(form(), builder.bind(), context);
  }


  @Override
  public <W, K, T2, U, S extends WindowState<W, S>> MapSwimStream<K, U> windowJoin(
      final SwimStream<T2> other,
      final TemporalWindowAssigner<Either<T, T2>, W, S> assigner,
      final Trigger<Either<T, T2>, W> trigger,
      final Form<K> kform, final Form<U> vform, final Form<W> windowForm,
      final Sampling sampling,
      final Function<T, K> firstToKey,
      final Function<T2, K> secondToKey,
      final BiFunction<T, T2, U> combine) {
    final Form<Either<T, T2>> eitherForm = Either.form(form, other.form());
    final SwimStream<Either<T, T2>> combined = map(Either::left, eitherForm)
            .union(other.map(Either::right, eitherForm));
    final WindowedSwimStream<Either<T, T2>, W> windowed = combined.window(assigner, windowForm, sampling)
            .withTrigger(trigger);
    final WindowJoinFunction<T, T2, K, U, W> joinFunction = new WindowJoinFunction<>(firstToKey, secondToKey, combine);

    final Form<List<Pair<K, U>>> listForm = Form.forCollection(List.class, Pair.form(kform, vform));
    return windowed.mapWindow(joinFunction, listForm)
            .mapToCollection(c -> c, listForm)
            .toMapStream(Pair::getFirst, Pair::getSecond, kform, vform);

  }

  public final <K> MapSwimStream<K, T> keyBy(final Function<T, K> keys, final Form<K> kform, final boolean isTransient) {

    return new WrappedMapStream<>(this, context, keys, kform, isTransient);
  }

  @Override
  public <W, S extends WindowState<W, S>> WindowedSwimStream<T, W> window(final TemporalWindowAssigner<T, W, S> assigner,
                                                                          final Form<W> windowForm,
                                                                          final Sampling sampling,
                                                                          final boolean isTransient) {
    return new WindowedStream<>(this, context, windowForm, assigner,
        null, null, sampling, isTransient);
  }

  @Override
  public <P, S extends PartitionState<P, S>> MapSwimStream<P, T> partition(final PartitionAssigner<T, P, S> assigner,
                                                                           final Form<P> partForm,
                                                                           final Sampling sampling,
                                                                           final boolean isTransient) {
    return new PartitionedStream<>(this, context, assigner, partForm, sampling, isTransient);
  }

  @Override
  public SwimStream<T> first(final boolean isTransient) {
    return new FirstStream<>(this, context, isTransient);
  }

  @Override
  public SwimStream<T> delayed(final int n, final boolean isTransient) {
    return new DelayedStream<>(this, context, n, isTransient);
  }

  @Override
  public SwimStream<T> delayed(final SwimStream<Integer> ns, final int init, final boolean isTransient) {
    return new VariableDelayedStream<>(this, context, ns, init, isTransient);
  }

  @Override
  public <P, W, S extends CombinedState<P, W, S>> MapWindowedSwimStream<P, T, W> window(
      final CombinedWindowAssigner<T, P, W, S> assigner,
      final Form<P> partForm,
      final Form<W> windowForm, final Sampling sampling, final boolean isTransient) {
    return new PartAndWinStream<>(this, context, assigner, null, null,
        partForm, windowForm, sampling, isTransient);
  }

  public SinkHandle<Unit, T> bind(final Sink<T> sink) {
    return context.bindSink(this, sink);
  }

}
