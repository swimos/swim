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

import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.collections.BTreeMap;
import swim.collections.FingerTrieSeq;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.impl.windows.DefaultPaneManager;
import swim.dataflow.graph.impl.windows.FoldPaneUpdater;
import swim.dataflow.graph.impl.windows.FoldingEvaluator;
import swim.dataflow.graph.impl.windows.KeyedWindowConduit;
import swim.dataflow.graph.impl.windows.MapPaneUpdater;
import swim.dataflow.graph.impl.windows.NoOpEvictor;
import swim.dataflow.graph.impl.windows.PaneEvaluator;
import swim.dataflow.graph.impl.windows.PaneManager;
import swim.dataflow.graph.impl.windows.ReducingEvaluator;
import swim.dataflow.graph.impl.windows.SequencePaneUpdater;
import swim.dataflow.graph.impl.windows.SequenceThresholdEvictor;
import swim.dataflow.graph.impl.windows.ThresholdEvictor;
import swim.dataflow.graph.impl.windows.WindowAccumulators;
import swim.dataflow.graph.sampling.Sampling;
import swim.dataflow.graph.timestamps.TimestampAssigner;
import swim.dataflow.graph.timestamps.WithTimestamp;
import swim.dataflow.graph.windows.KeyedWindowBinOp;
import swim.dataflow.graph.windows.KeyedWindowFoldFunction;
import swim.dataflow.graph.windows.KeyedWindowSpec;
import swim.dataflow.graph.windows.WindowBinOp;
import swim.dataflow.graph.windows.WindowFoldFunction;
import swim.dataflow.graph.windows.WindowState;
import swim.dataflow.graph.windows.eviction.ThresholdEviction;
import swim.streamlet.MapJunction;
import swim.streamlet.StreamInterpretation;
import swim.streamlet.persistence.PersistenceProvider;
import swim.streamlet.persistence.SetPersister;
import swim.structure.Form;

/**
 * A stream that results from applying a fold operation across each key and window of a map stream.
 *
 * @param <K> The type of the keys of the map stream.
 * @param <T> The type of the values of the map stream.
 * @param <U> The type of the result of the fold operation.
 * @param <W> The type of the windows.
 */
class FoldedMapWindowedStream<K, T, U, W, S extends WindowState<W, S>> extends AbstractMapStream<K, U> {

  private final MapSwimStream<K, T> in;
  private final KeyedWindowSpec<K, T, W, S> spec;
  private final BiFunction<K, W, U> seedFun;
  private final KeyedWindowFoldFunction<K, T, W, U> winFun;
  private final KeyedWindowBinOp<K, U, W> combiner;
  private final Sampling sampling;

  /**
   * @param stream  The input map stream.
   * @param context The instantiation context.
   * @param form    The form of the type of the output values.
   * @param seed    The seed for the fold operation (which may depend on the key and window).
   * @param fun     The fold operation.
   * @param samplingStrat The sampling strategy for the link.
   */
  FoldedMapWindowedStream(final MapSwimStream<K, T> stream,
                          final BindingContext context,
                          final KeyedWindowSpec<K, T, W, S> windowSpec,
                          final Form<U> form,
                          final BiFunction<K, W, U> seed,
                          final KeyedWindowFoldFunction<K, T, W, U> fun,
                          final KeyedWindowBinOp<K, U, W> combOp,
                          final Sampling samplingStrat) {
    super(stream.keyForm(), form, context);
    in = stream;
    spec = windowSpec;
    seedFun = seed;
    winFun = fun;
    combiner = combOp;
    sampling = samplingStrat;
  }

  /**
   * @param stream  The input map stream.
   * @param context The instantiation context.
   * @param form    The form of the type of the output values.
   * @param seed    The seed for the fold operation (which may depend on the key and window).
   * @param fun     The fold operation.
   * @param ts      Timestamp assignment for the values.
   * @param samplingStrat The sampling strategy for the link.
   */
  FoldedMapWindowedStream(final MapSwimStream<K, T> stream,
                          final BindingContext context,
                          final KeyedWindowSpec<K, T, W, S> windowSpec,
                          final Form<U> form,
                          final BiFunction<K, W, U> seed,
                          final KeyedWindowFoldFunction<K, T, W, U> fun,
                          final KeyedWindowBinOp<K, U, W> combOp,
                          final Sampling samplingStrat,
                          final ToLongFunction<U> ts) {
    super(stream.keyForm(), form, context, ts);
    in = stream;
    spec = windowSpec;
    seedFun = seed;
    winFun = fun;
    combiner = combOp;
    sampling = samplingStrat;
  }

  @Override
  public MapJunction<K, U> instantiate(final SwimStreamContext.InitContext context) {
    final PersistenceProvider persistence = context.getPersistenceProvider();

    final Function<K, PaneManager<T, W, U>> paneManagers = k -> spec.getEvictionStrategy().apply(k).match(
        none -> createWithoutEviction(k, persistence), threshold -> createWithEviction(k, persistence, threshold));
    final MapJunction<K, T> source = StreamDecoupling.sampleMapStream(id(), context, context.createFor(in),
        sampling, StreamInterpretation.DISCRETE);

    final ToLongFunction<T> ts = in.getTimestamps();
    final TimestampAssigner<T> timestamps =
        ts == null ? TimestampAssigner.fromClock() : TimestampAssigner.fromData(ts);

    final KeyedWindowConduit<K, T, W, U> conduit;
    if (spec.isTransient()) {
      conduit = new KeyedWindowConduit<>(
          context.getSchedule(), paneManagers, timestamps);
    } else {
      final SetPersister<K> keysPersister = context.getPersistenceProvider().forSet(
          StateTags.stateTag(id()), keyForm());
      conduit = new KeyedWindowConduit<>(
          context.getSchedule(), keysPersister, paneManagers, timestamps);
    }

    source.subscribe(conduit);
    return conduit;
  }

  //When we have eviction it is necessary to maintain all of the data in the window.
  private <C extends Comparable<C>> PaneManager<T, W, U> createWithEviction(
      final K k,
      final PersistenceProvider persistence,
      final ThresholdEviction<T, C, W> eviction) {
    final Function<W, U> keySeedFun = w -> seedFun.apply(k, w);
    final WindowFoldFunction<T, W, U> keyedFun = (w, u, v) -> winFun.apply(k, w, u, v);
    if (combiner == null) {
      final SequencePaneUpdater<T, W> updater = new SequencePaneUpdater<>();
      final SequenceThresholdEvictor<T, C, W> evictor = new SequenceThresholdEvictor<>(
          eviction.getCriterion(), eviction.getThreshold(), eviction.assumeStateOrdered());

      final FoldingEvaluator<T, W, U> evaluator = new FoldingEvaluator<>(keySeedFun, keyedFun);

      final WindowAccumulators<W, FingerTrieSeq<WithTimestamp<T>>> accumulators = WindowStates.forSequencesState(
          spec.isTransient(),
          StateTags.keyedStateTag(id(), keyForm().mold(k).toValue()),
          persistence,
          spec.getWindowForm(),
          in.valueForm()
      );

      return new DefaultPaneManager<>(accumulators,
          spec.getAssigner().apply(k), spec.getTrigger().apply(k), updater, evictor, evaluator);
    } else {
      final MapPaneUpdater<T, W, C, U> updater = new MapPaneUpdater<>(eviction.getCriterion());
      final ThresholdEvictor<T, C, W, U> evictor = new ThresholdEvictor<>(eviction.getThreshold());

      final WindowBinOp<U, W> keyedCombine = (w, u1, u2) -> combiner.apply(k, w, u1, u2);

      final PaneEvaluator<BTreeMap<C, T, U>, W, U> evaluator = new ReducingEvaluator<>(keySeedFun, keyedFun, keyedCombine);

      final WindowAccumulators<W, BTreeMap<C, T, U>> accumulators = WindowStates.forMapState(
          spec.isTransient(),
          StateTags.keyedStateTag(id(), keyForm().mold(k).toValue()),
          persistence,
          spec.getWindowForm(),
          eviction.getCriterionForm(),
          in.valueForm()
      );
      return new DefaultPaneManager<>(accumulators,
          spec.getAssigner().apply(k), spec.getTrigger().apply(k), updater, evictor, evaluator);
    }
  }

  //Without eviction we only need to store the state of the operation.
  private PaneManager<T, W, U> createWithoutEviction(final K k, final PersistenceProvider persistence) {
    final Function<W, U> keySeedFun = w -> seedFun.apply(k, w);
    final WindowFoldFunction<T, W, U> keyedFun = (w, u, v) -> winFun.apply(k, w, u, v);
    final FoldPaneUpdater<T, W, U> updater = new FoldPaneUpdater<>(keySeedFun, keyedFun);
    final NoOpEvictor<T, W, U> evictor = NoOpEvictor.instance();
    final PaneEvaluator<U, W, U> evaluator = PaneEvaluator.identity();

    final WindowAccumulators<W, U> accumulators = WindowStates.forSimpleState(
        spec.isTransient(),
        StateTags.keyedStateTag(id(), keyForm().mold(k).toValue()),
        persistence,
        spec.getWindowForm(),
        valueForm()
    );

    return new DefaultPaneManager<>(accumulators,
        spec.getAssigner().apply(k), spec.getTrigger().apply(k), updater, evictor, evaluator);
  }

  @Override
  public MapSwimStream<K, U> updateTimestamps(final ToLongFunction<U> datation) {
    return new FoldedMapWindowedStream<>(in, getContext(), spec, valueForm(), seedFun, winFun, combiner, sampling, datation);
  }
}
