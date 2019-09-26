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

import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.collections.BTreeMap;
import swim.collections.FingerTrieSeq;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext.InitContext;
import swim.dataflow.graph.impl.windows.DefaultPaneManager;
import swim.dataflow.graph.impl.windows.FoldPaneUpdater;
import swim.dataflow.graph.impl.windows.FoldingEvaluator;
import swim.dataflow.graph.impl.windows.MapPaneUpdater;
import swim.dataflow.graph.impl.windows.NoOpEvictor;
import swim.dataflow.graph.impl.windows.PaneEvaluator;
import swim.dataflow.graph.impl.windows.PaneManager;
import swim.dataflow.graph.impl.windows.ReducingEvaluator;
import swim.dataflow.graph.impl.windows.SequencePaneUpdater;
import swim.dataflow.graph.impl.windows.SequenceThresholdEvictor;
import swim.dataflow.graph.impl.windows.ThresholdEvictor;
import swim.dataflow.graph.impl.windows.WindowAccumulators;
import swim.dataflow.graph.impl.windows.WindowConduit;
import swim.dataflow.graph.sampling.Sampling;
import swim.dataflow.graph.timestamps.TimestampAssigner;
import swim.dataflow.graph.timestamps.WithTimestamp;
import swim.dataflow.graph.windows.WindowBinOp;
import swim.dataflow.graph.windows.WindowFoldFunction;
import swim.dataflow.graph.windows.WindowSpec;
import swim.dataflow.graph.windows.WindowState;
import swim.dataflow.graph.windows.eviction.ThresholdEviction;
import swim.streamlet.Junction;
import swim.streamlet.StreamInterpretation;
import swim.streamlet.persistence.PersistenceProvider;
import swim.structure.Form;

/**
 * A stream that results from a fold operation applied across the windows of a windowed stream.
 *
 * @param <T> The type of the input values.
 * @param <W> The type of the windows.
 * @param <U> The type of the outputs.
 */
public class FoldedWindowedStream<T, W, S extends WindowState<W, S>, U> extends AbstractSwimStream<U> {

  private final SwimStream<T> in;
  private final WindowSpec<T, W, S> spec;
  private final Function<W, U> seedFun;
  private final WindowFoldFunction<T, W, U> winFun;
  private final WindowBinOp<U, W> combiner;
  private final Sampling sampling;

  /**
   * @param input         The source stream.
   * @param windowSpec    The specification of the windows.
   * @param context       The instantiation context.
   * @param seed          The seed for the operation.
   * @param fun           The window function.
   * @param combineFun    A function to combine intermediate results.
   * @param form          The form of the type of the outputs.
   * @param samplingStrat The sampling strategy for the link.
   */
  FoldedWindowedStream(final SwimStream<T> input,
                       final WindowSpec<T, W, S> windowSpec,
                       final BindingContext context,
                       final Function<W, U> seed,
                       final WindowFoldFunction<T, W, U> fun,
                       final WindowBinOp<U, W> combineFun,
                       final Form<U> form,
                       final Sampling samplingStrat) {
    super(form, context);
    in = input;
    spec = windowSpec;
    seedFun = seed;
    winFun = fun;
    combiner = combineFun;
    sampling = samplingStrat;
  }

  /**
   * @param input         The source stream.
   * @param windowSpec    The specification of the windows.
   * @param context       The instantiation context.
   * @param seed          The seed for the operation.
   * @param fun           The window function.
   * @param form          The form of the type of the outputs.
   * @param samplingStrat The sampling strategy for the link.
   */
  FoldedWindowedStream(final SwimStream<T> input,
                       final WindowSpec<T, W, S> windowSpec,
                       final BindingContext context,
                       final Function<W, U> seed,
                       final WindowFoldFunction<T, W, U> fun,
                       final Form<U> form,
                       final Sampling samplingStrat) {
    this(input, windowSpec, context, seed, fun, null, form, samplingStrat);
  }

  /**
   * @param input         The source stream.
   * @param windowSpec    The specification of the windows.
   * @param context       The instantiation context.
   * @param seed          The seed for the operation.
   * @param fun           The window function.
   * @param form          The form of the type of the outputs.
   * @param samplingStrat The sampling strategy for the link.
   * @param ts            The timestamp assignment for the values.
   */
  FoldedWindowedStream(final SwimStream<T> input,
                       final WindowSpec<T, W, S> windowSpec,
                       final BindingContext context,
                       final Function<W, U> seed,
                       final WindowFoldFunction<T, W, U> fun,
                       final WindowBinOp<U, W> combineFun,
                       final Form<U> form,
                       final Sampling samplingStrat,
                       final ToLongFunction<U> ts) {
    super(form, context, ts);
    in = input;
    spec = windowSpec;
    seedFun = seed;
    winFun = fun;
    combiner = combineFun;
    sampling = samplingStrat;
  }

  @Override
  public SwimStream<U> updateTimestamps(final ToLongFunction<U> datation) {
    return new FoldedWindowedStream<>(in, spec, getContext(), seedFun, winFun, combiner, form(),
        sampling, datation);
  }

  @Override
  public Junction<U> instantiate(final InitContext context) {
    final PersistenceProvider persistence = context.getPersistenceProvider();
    final PaneManager<T, W, U> paneManager = spec.getEvictionStrategy().match(
        none -> createWithoutEviction(persistence), eviction -> createWithEviction(persistence, eviction));

    final ToLongFunction<T> ts = in.getTimestamps();
    final TimestampAssigner<T> timestamps =
        ts == null ? TimestampAssigner.fromClock() : TimestampAssigner.fromData(ts);

    final WindowConduit<T, W, U> conduit = new WindowConduit<>(
        context.getSchedule(), paneManager, timestamps);

    final Junction<T> source = StreamDecoupling.sampleStream(id(), context, context.createFor(in),
        sampling, StreamInterpretation.DISCRETE);

    source.subscribe(conduit);
    return conduit;
  }

  //When we have eviction it is necessary to maintain all of the data in the window.
  private <K extends Comparable<K>> PaneManager<T, W, U> createWithEviction(
      final PersistenceProvider persistence,
      final ThresholdEviction<T, K, W> eviction) {

    if (combiner == null) {
      final SequencePaneUpdater<T, W> updater = new SequencePaneUpdater<>();
      final SequenceThresholdEvictor<T, K, W> evictor = new SequenceThresholdEvictor<>(
          eviction.getCriterion(), eviction.getThreshold(), eviction.assumeStateOrdered());
      final FoldingEvaluator<T, W, U> evaluator = new FoldingEvaluator<>(seedFun, winFun);

      final WindowAccumulators<W, FingerTrieSeq<WithTimestamp<T>>> accumulators = WindowStates.forSequencesState(
          spec.isTransient(), StateTags.stateTag(id()), persistence, spec.getWindowForm(), in.form());

      return new DefaultPaneManager<>(accumulators,
          spec.getAssigner(), spec.getTrigger(), updater, evictor, evaluator);
    } else {
      final MapPaneUpdater<T, W, K, U> updater = new MapPaneUpdater<>(eviction.getCriterion());
      final ThresholdEvictor<T, K, W, U> evictor = new ThresholdEvictor<>(eviction.getThreshold());

      final ReducingEvaluator<K, T, W, U> evaluator = new ReducingEvaluator<>(seedFun, winFun, combiner);

      final WindowAccumulators<W, BTreeMap<K, T, U>> accumulators = WindowStates.forMapState(
          spec.isTransient(), StateTags.stateTag(id()), persistence, spec.getWindowForm(), eviction.getCriterionForm(), in.form());
      return new DefaultPaneManager<>(accumulators,
          spec.getAssigner(), spec.getTrigger(), updater, evictor, evaluator);
    }
  }

  //Without eviction we only need to store the state of the operation.
  private PaneManager<T, W, U> createWithoutEviction(final PersistenceProvider persistence) {
    final FoldPaneUpdater<T, W, U> updater = new FoldPaneUpdater<>(seedFun, winFun);
    final NoOpEvictor<T, W, U> evictor = NoOpEvictor.instance();
    final PaneEvaluator<U, W, U> evaluator = PaneEvaluator.identity();
    final WindowAccumulators<W, U> accumulators = WindowStates.forSimpleState(
        spec.isTransient(), StateTags.stateTag(id()), persistence, spec.getWindowForm(), form());
    return new DefaultPaneManager<>(accumulators,
        spec.getAssigner(), spec.getTrigger(), updater, evictor, evaluator);
  }

}
