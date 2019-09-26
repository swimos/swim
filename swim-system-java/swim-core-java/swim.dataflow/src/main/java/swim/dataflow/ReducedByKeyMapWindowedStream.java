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

import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.collections.BTreeMap;
import swim.dataflow.windows.DefaultPaneManager;
import swim.dataflow.windows.KeyedWindowStreamlet;
import swim.dataflow.windows.MapPaneUpdater;
import swim.dataflow.windows.NoOpEvictor;
import swim.dataflow.windows.PaneEvaluator;
import swim.dataflow.windows.PaneManager;
import swim.dataflow.windows.ReducePaneUpdater;
import swim.dataflow.windows.ReducingEvaluator;
import swim.dataflow.windows.ThresholdEvictor;
import swim.dataflow.windows.WindowAccumulators;
import swim.streaming.MapJunction;
import swim.streaming.MapSwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.persistence.PersistenceProvider;
import swim.streaming.persistence.SetPersister;
import swim.streaming.sampling.Sampling;
import swim.streaming.timestamps.TimestampAssigner;
import swim.streaming.windows.KeyedWindowBinOp;
import swim.streaming.windows.KeyedWindowSpec;
import swim.streaming.windows.WindowBinOp;
import swim.streaming.windows.WindowFoldFunction;
import swim.streaming.windows.WindowState;
import swim.streaming.windows.eviction.ThresholdEviction;
import swim.streamlet.StreamInterpretation;

/**
 * Map stream of the reductions of the values over a window for each key of a mapped stream.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 * @param <W> The type of the windows.
 */
class ReducedByKeyMapWindowedStream<K, V, W, S extends WindowState<W, S>> extends AbstractMapStream<K, V> {

  private final MapSwimStream<K, V> in;
  private final KeyedWindowSpec<K, V, W, S> spec;
  private final KeyedWindowBinOp<K, V, W> operator;
  private final Sampling sampling;

  /**
   * @param stream   The source map stream.
   * @param context  The instantiation context.
   * @param reduceOp The reduction operation.
   * @param samplingStrat The sampling strategy for the link.
   */
  ReducedByKeyMapWindowedStream(final MapSwimStream<K, V> stream,
                                final BindingContext context,
                                final KeyedWindowSpec<K, V, W, S> winSpec,
                                final KeyedWindowBinOp<K, V, W> reduceOp,
                                final Sampling samplingStrat) {
    super(stream.keyForm(), stream.valueForm(), context);
    in = stream;
    operator = reduceOp;
    spec = winSpec;
    sampling = samplingStrat;
  }

  /**
   * @param stream   The source map stream.
   * @param context  The instantiation context.
   * @param reduceOp The reduction operation.
   * @param ts       Timestamp assignment for the values.
   * @param samplingStrat The sampling strategy for the link.
   */
  ReducedByKeyMapWindowedStream(final MapSwimStream<K, V> stream,
                                final BindingContext context,
                                final KeyedWindowSpec<K, V, W, S> winSpec,
                                final KeyedWindowBinOp<K, V, W> reduceOp,
                                final Sampling samplingStrat,
                                final ToLongFunction<V> ts) {
    super(stream.keyForm(), stream.valueForm(), context, ts);
    in = stream;
    operator = reduceOp;
    spec = winSpec;
    sampling = samplingStrat;
  }

  @Override
  public MapJunction<K, V> instantiate(final SwimStreamContext.InitContext context) {
    final PersistenceProvider persistence = context.getPersistenceProvider();

    final Function<K, PaneManager<V, W, V>> paneManagers = k -> spec.getEvictionStrategy().apply(k).match(
        none -> createWithoutEviction(k, persistence), threshold -> createWithEviction(k, persistence, threshold));
    final MapJunction<K, V> source = StreamDecoupling.sampleMapStream(id(), context, context.createFor(in),
        sampling, StreamInterpretation.DISCRETE);

    final ToLongFunction<V> ts = in.getTimestamps();
    final TimestampAssigner<V> timestamps =
        ts == null ? TimestampAssigner.fromClock() : TimestampAssigner.fromData(ts);

    final KeyedWindowStreamlet<K, V, W, V> streamlet;
    if (spec.isTransient()) {
      streamlet = new KeyedWindowStreamlet<>(
          context.getSchedule(), paneManagers, timestamps);
    } else {
      final SetPersister<K> keysPersister = context.getPersistenceProvider().forSet(
          StateTags.stateTag(id()), keyForm());
      streamlet = new KeyedWindowStreamlet<>(
          context.getSchedule(), keysPersister, paneManagers, timestamps);
    }
    source.subscribe(streamlet);
    return streamlet;
  }

  //When we have eviction it is necessary to maintain all of the data in the window.
  private <C extends Comparable<C>> PaneManager<V, W, V> createWithEviction(
      final K k,
      final PersistenceProvider persistence,
      final ThresholdEviction<V, C, W> eviction) {
    final MapPaneUpdater<V, W, C, V> updater = new MapPaneUpdater<>(eviction.getCriterion());
    final ThresholdEvictor<V, C, W, V> evictor = new ThresholdEvictor<>(eviction.getThreshold());

    final WindowBinOp<V, W> keyedOp = (w, v1, v2) -> operator.apply(k, w, v1, v2);
    final WindowFoldFunction<V, W, V> accFun = (w, acc, value) -> acc == null ? value : operator.apply(k, w, acc, value);

    final ReducingEvaluator<C, V, W, V> evaluator = new ReducingEvaluator<>(w -> null, accFun, keyedOp);

    final WindowAccumulators<W, BTreeMap<C, V, V>> accumulators = WindowStates.forMapState(
        spec.isTransient(),
        StateTags.keyedStateTag(id(), keyForm().mold(k).toValue()),
        persistence,
        spec.getWindowForm(),
        eviction.getCriterionForm(),
        valueForm()
    );

    return new DefaultPaneManager<>(accumulators,
        spec.getAssigner().apply(k), spec.getTrigger().apply(k), updater, evictor, evaluator);
  }

  //Without eviction we only need to store the state of the operation.
  private PaneManager<V, W, V> createWithoutEviction(final K k, final PersistenceProvider persistence) {

    final WindowBinOp<V, W> keyedOp = (w, v1, v2) -> operator.apply(k, w, v1, v2);
    final ReducePaneUpdater<V, W> updater = new ReducePaneUpdater<>(keyedOp);
    final NoOpEvictor<V, W, V> evictor = NoOpEvictor.instance();
    final PaneEvaluator<V, W, V> evaluator = PaneEvaluator.identity();


    final WindowAccumulators<W, V> accumulators = WindowStates.forSimpleState(
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
  public MapSwimStream<K, V> updateTimestamps(final ToLongFunction<V> datation) {
    return new ReducedByKeyMapWindowedStream<>(in, getContext(), spec, operator, sampling, datation);
  }
}
