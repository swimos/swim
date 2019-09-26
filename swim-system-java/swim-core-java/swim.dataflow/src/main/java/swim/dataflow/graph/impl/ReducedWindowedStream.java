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

import java.util.function.ToLongFunction;
import swim.collections.BTreeMap;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.impl.windows.DefaultPaneManager;
import swim.dataflow.graph.impl.windows.MapPaneUpdater;
import swim.dataflow.graph.impl.windows.NoOpEvictor;
import swim.dataflow.graph.impl.windows.PaneEvaluator;
import swim.dataflow.graph.impl.windows.PaneManager;
import swim.dataflow.graph.impl.windows.ReducePaneUpdater;
import swim.dataflow.graph.impl.windows.ReducingEvaluator;
import swim.dataflow.graph.impl.windows.ThresholdEvictor;
import swim.dataflow.graph.impl.windows.WindowAccumulators;
import swim.dataflow.graph.impl.windows.WindowConduit;
import swim.dataflow.graph.sampling.Sampling;
import swim.dataflow.graph.timestamps.TimestampAssigner;
import swim.dataflow.graph.windows.WindowBinOp;
import swim.dataflow.graph.windows.WindowFoldFunction;
import swim.dataflow.graph.windows.WindowSpec;
import swim.dataflow.graph.windows.WindowState;
import swim.dataflow.graph.windows.eviction.ThresholdEviction;
import swim.streamlet.Junction;
import swim.streamlet.StreamInterpretation;
import swim.streamlet.persistence.PersistenceProvider;

/**
 * Stream of the reductions of another stream over a window.
 *
 * @param <T> The type of the inputs.
 * @param <W> The type of the windows.
 */
class ReducedWindowedStream<T, W, S extends WindowState<W, S>> extends AbstractSwimStream<T> {

  private final SwimStream<T> in;
  private final WindowSpec<T, W, S> spec;
  private final WindowBinOp<T, W> operator;
  private final Sampling sampling;

  /**
   * @param input         The source stream.
   * @param windowSpec    The specification of the windows.
   * @param context       The instantiation context.
   * @param op            The binary operator to apply.
   * @param samplingStrat The sampling strategy for the link.
   */
  ReducedWindowedStream(final SwimStream<T> input,
                        final WindowSpec<T, W, S> windowSpec,
                        final BindingContext context,
                        final WindowBinOp<T, W> op,
                        final Sampling samplingStrat) {
    super(input.form(), context);
    in = input;
    spec = windowSpec;
    operator = op;
    sampling = samplingStrat;
  }

  /**
   * @param input         The source stream.
   * @param windowSpec    The specification of the windows.
   * @param context       The instantiation context.
   * @param op            The binary operator to apply.
   * @param samplingStrat The sampling strategy for the link.
   * @param ts            Timestamp assignment for the values.
   */
  ReducedWindowedStream(final SwimStream<T> input,
                        final WindowSpec<T, W, S> windowSpec,
                        final BindingContext context,
                        final WindowBinOp<T, W> op,
                        final Sampling samplingStrat,
                        final ToLongFunction<T> ts) {
    super(input.form(), context);
    in = input;
    spec = windowSpec;
    operator = op;
    sampling = samplingStrat;
  }

  @Override
  public SwimStream<T> updateTimestamps(final ToLongFunction<T> datation) {
    return new ReducedWindowedStream<>(in, spec, getContext(), operator, sampling, datation);
  }

  @Override
  public Junction<T> instantiate(final SwimStreamContext.InitContext context) {
    final PersistenceProvider persistence = context.getPersistenceProvider();
    final PaneManager<T, W, T> paneManager = spec.getEvictionStrategy().match(
        none -> createWithoutEviction(persistence), eviction -> createWithEviction(persistence, eviction));

    final ToLongFunction<T> ts = in.getTimestamps();
    final TimestampAssigner<T> timestamps =
        ts == null ? TimestampAssigner.fromClock() : TimestampAssigner.fromData(ts);


    final WindowConduit<T, W, T> conduit = new WindowConduit<>(context.getSchedule(), paneManager, timestamps);

    final Junction<T> source = StreamDecoupling.sampleStream(id(), context, context.createFor(in), sampling, StreamInterpretation.DISCRETE);

    source.subscribe(conduit);
    return conduit;
  }

  //When we have eviction it is necessary to maintain all of the data in the window.
  private <K extends Comparable<K>> PaneManager<T, W, T> createWithEviction(final PersistenceProvider persistence,
                                                                            final ThresholdEviction<T, K, W> eviction) {
    final MapPaneUpdater<T, W, K, T> updater = new MapPaneUpdater<>(eviction.getCriterion());
    final ThresholdEvictor<T, K, W, T> evictor = new ThresholdEvictor<>(eviction.getThreshold());

    final WindowFoldFunction<T, W, T> accFun = (w, acc, value) -> acc == null ? value : operator.apply(w, acc, value);

    final ReducingEvaluator<K, T, W, T> evaluator = new ReducingEvaluator<>(w -> null, accFun, operator);

    final WindowAccumulators<W, BTreeMap<K, T, T>> accumulators = WindowStates.forMapState(
        spec.isTransient(), StateTags.stateTag(id()), persistence, spec.getWindowForm(), eviction.getCriterionForm(), form());

    return new DefaultPaneManager<>(accumulators,
        spec.getAssigner(), spec.getTrigger(), updater, evictor, evaluator);
  }

  //Without eviction we only need to store the state of the operation.
  private PaneManager<T, W, T> createWithoutEviction(final PersistenceProvider persistence) {
    final ReducePaneUpdater<T, W> updater = new ReducePaneUpdater<>(operator);
    final NoOpEvictor<T, W, T> evictor = NoOpEvictor.instance();
    final PaneEvaluator<T, W, T> evaluator = PaneEvaluator.identity();
    final WindowAccumulators<W, T> accumulators = WindowStates.forSimpleState(
        spec.isTransient(), StateTags.stateTag(id()), persistence, spec.getWindowForm(), form());

    return new DefaultPaneManager<>(accumulators,
        spec.getAssigner(), spec.getTrigger(), updater, evictor, evaluator);
  }

}
