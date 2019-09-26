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
import swim.collections.FingerTrieSeq;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.impl.windows.DefaultPaneManager;
import swim.dataflow.graph.impl.windows.KeyedWindowConduit;
import swim.dataflow.graph.impl.windows.NoOpEvictor;
import swim.dataflow.graph.impl.windows.PaneEvictor;
import swim.dataflow.graph.impl.windows.PaneManager;
import swim.dataflow.graph.impl.windows.SequencePaneUpdater;
import swim.dataflow.graph.impl.windows.WindowAccumulators;
import swim.dataflow.graph.impl.windows.WindowFunctionEvaluator;
import swim.dataflow.graph.sampling.Sampling;
import swim.dataflow.graph.timestamps.TimestampAssigner;
import swim.dataflow.graph.timestamps.WithTimestamp;
import swim.dataflow.graph.windows.KeyedWindowFunction;
import swim.dataflow.graph.windows.KeyedWindowSpec;
import swim.dataflow.graph.windows.WindowFunction;
import swim.dataflow.graph.windows.WindowState;
import swim.streamlet.MapJunction;
import swim.streamlet.StreamInterpretation;
import swim.streamlet.persistence.PersistenceProvider;
import swim.streamlet.persistence.SetPersister;
import swim.structure.Form;

/**
 * Stream formed by applying a function across the contents of each window for each key of a windowed map stream.
 *
 * @param <K> The type of the keys of the stream.
 * @param <T> The input value type (type of the window contents).
 * @param <U> The output value type.
 * @param <W> The type of the windows.
 */
class TransformedMapWindowedStream<K, T, U, W, S extends WindowState<W, S>> extends AbstractMapStream<K, U> {

  private final MapSwimStream<K, T> in;
  private final KeyedWindowFunction<K, T, W, U> winFun;
  private final KeyedWindowSpec<K, T, W, S> spec;
  private final Sampling sampling;

  /**
   * @param stream        The source stream.
   * @param context       The instantiation context.
   * @param winSpec       Specification for the window.
   * @param form          The form of the type of the outputs.
   * @param fun           The function to apply to the window.
   * @param samplingStrat      The sampling strategy for the link.
   */
  TransformedMapWindowedStream(final MapSwimStream<K, T> stream,
                               final BindingContext context,
                               final KeyedWindowSpec<K, T, W, S> winSpec,
                               final Form<U> form,
                               final KeyedWindowFunction<K, T, W, U> fun,
                               final Sampling samplingStrat) {
    super(stream.keyForm(), form, context);
    in = stream;
    winFun = fun;
    spec = winSpec;
    sampling = samplingStrat;
  }

  /**
   * @param stream   The source stream.
   * @param context  The instantiation context.
   * @param winSpec  Specification for the window.
   * @param form     The form of the type of the outputs.
   * @param fun      The function to apply to the window.
   * @param samplingStrat The sampling strategy for the link.
   * @param ts       Timestamp assignment for the values.
   */
  TransformedMapWindowedStream(final MapSwimStream<K, T> stream,
                               final BindingContext context,
                               final KeyedWindowSpec<K, T, W, S> winSpec,
                               final Form<U> form,
                               final KeyedWindowFunction<K, T, W, U> fun,
                               final Sampling samplingStrat,
                               final ToLongFunction<U> ts) {
    super(stream.keyForm(), form, context, ts);
    in = stream;
    winFun = fun;
    spec = winSpec;
    sampling = samplingStrat;
  }

  private Function<K, PaneManager<T, W, U>> createManagerFactory(final PersistenceProvider persistence) {
    return k -> {
      final SequencePaneUpdater<T, W> updater = new SequencePaneUpdater<>();
      final PaneEvictor<T, W, FingerTrieSeq<WithTimestamp<T>>> evictor = spec.getEvictionStrategy().apply(k).match(
          none -> NoOpEvictor.instance(),
          EvictionUtil::createEvictor
      );

      final WindowFunction<T, W, U> keyFun = (w, contents) -> winFun.apply(k, w, contents);
      final WindowFunctionEvaluator<T, W, U> evaluator = new WindowFunctionEvaluator<>(keyFun);

      final WindowAccumulators<W, FingerTrieSeq<WithTimestamp<T>>> accumulators = WindowStates.forSequencesState(
          spec.isTransient(),
          StateTags.keyedStateTag(id(), keyForm().mold(k).toValue()),
          persistence,
          spec.getWindowForm(),
          in.valueForm()
      );
      return new DefaultPaneManager<>(accumulators,
          spec.getAssigner().apply(k), spec.getTrigger().apply(k), updater, evictor, evaluator);
    };
  }

  @Override
  public MapJunction<K, U> instantiate(final SwimStreamContext.InitContext context) {

    final Function<K, PaneManager<T, W, U>> managerFactory = createManagerFactory(context.getPersistenceProvider());

    final MapJunction<K, T> source = StreamDecoupling.sampleMapStream(id(), context, context.createFor(in),
        sampling, StreamInterpretation.DISCRETE);

    final ToLongFunction<T> ts = in.getTimestamps();
    final TimestampAssigner<T> timestamps =
        ts == null ? TimestampAssigner.fromClock() : TimestampAssigner.fromData(ts);

    final KeyedWindowConduit<K, T, W, U> conduit;
    if (spec.isTransient()) {
      conduit = new KeyedWindowConduit<>(
          context.getSchedule(), managerFactory, timestamps);
    } else {
      final SetPersister<K> keysPersister = context.getPersistenceProvider().forSet(
          StateTags.stateTag(id()), keyForm());
      conduit = new KeyedWindowConduit<>(
          context.getSchedule(), keysPersister, managerFactory, timestamps);
    }

    source.subscribe(conduit);
    return conduit;
  }

  @Override
  public MapSwimStream<K, U> updateTimestamps(final ToLongFunction<U> datation) {
    return new TransformedMapWindowedStream<>(in, getContext(), spec, valueForm(), winFun, sampling, datation);
  }
}
