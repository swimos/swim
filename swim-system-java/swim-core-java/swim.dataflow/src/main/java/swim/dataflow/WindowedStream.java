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
import swim.streaming.SwimStream;
import swim.streaming.WindowedSwimStream;
import swim.streaming.sampling.Sampling;
import swim.streaming.windows.TemporalWindowAssigner;
import swim.streaming.windows.WindowBinOp;
import swim.streaming.windows.WindowFoldFunction;
import swim.streaming.windows.WindowFunction;
import swim.streaming.windows.WindowSpec;
import swim.streaming.windows.WindowState;
import swim.streaming.windows.eviction.EvictionStrategy;
import swim.streaming.windows.eviction.NoEviction;
import swim.streaming.windows.triggers.Trigger;
import swim.streaming.windows.triggers.UnboundedTrigger;
import swim.structure.Form;

/**
 * A stream split into a sequence of windows.
 *
 * @param <T> The type of the stream.
 * @param <W> The type of the windows.
 */
class WindowedStream<T, W, S extends WindowState<W, S>> implements WindowedSwimStream<T, W> {

  private final Form<W> winForm;
  private final SwimStream<T> underlying;
  private final TemporalWindowAssigner<T, W, S> assigner;
  private final Trigger<T, W> trigger;
  private final EvictionStrategy<T, W> evictionStrategy;
  private final Sampling sampling;
  private final BindingContext context;
  private final boolean isTransient;

  /**
   * @param stream        The source stream.
   * @param con           The instantiation context.
   * @param form          The form of the type of the windows.
   * @param winAssigner   Assigns values to windows.
   * @param winTrigger    Determines when windows close.
   * @param samplingStrat The sampling strategy for the link.
   * @param isTransient   Whether the state of this stream is stored persistently.
   */
  WindowedStream(final SwimStream<T> stream,
                 final BindingContext con,
                 final Form<W> form,
                 final TemporalWindowAssigner<T, W, S> winAssigner,
                 final Trigger<T, W> winTrigger,
                 final EvictionStrategy<T, W> eviction,
                 final Sampling samplingStrat,
                 final boolean isTransient) {
    winForm = form;
    underlying = stream;
    assigner = winAssigner;
    trigger = winTrigger;
    evictionStrategy = eviction;
    sampling = samplingStrat;
    context = con;
    this.isTransient = isTransient;
  }

  @Override
  public Form<T> form() {
    return underlying.form();
  }

  @Override
  public Form<W> windowForm() {
    return winForm;
  }

  @Override
  public <U> SwimStream<U> mapWindow(final WindowFunction<T, W, U> winFun, final Form<U> form) {
    return new TransformedWindowedStream<>(underlying, createSpec(), context, winFun, form, sampling);
  }

  private WindowSpec<T, W, S> createSpec() {
    return new WindowSpec<>(
        assigner,
        trigger == null ? new UnboundedTrigger<>() : trigger,
        evictionStrategy == null ? NoEviction.instance() : evictionStrategy,
        winForm,
        isTransient
    );
  }

  @Override
  public <U> SwimStream<U> fold(final U seed, final WindowFoldFunction<T, W, U> winFun, final Form<U> form) {
    return new FoldedWindowedStream<>(underlying, createSpec(), context, w -> seed, winFun,
        form, sampling);
  }

  @Override
  public <U> SwimStream<U> fold(final U seed, final WindowFoldFunction<T, W, U> winFun,
                                final WindowBinOp<U, W> combiner, final Form<U> form) {
    return new FoldedWindowedStream<>(underlying, createSpec(), context, w -> seed, winFun,
        combiner, form, sampling);
  }

  @Override
  public <U> SwimStream<U> foldBy(final Function<W, U> seed, final WindowFoldFunction<T, W, U> winFun, final Form<U> form) {
    return new FoldedWindowedStream<>(underlying, createSpec(), context, seed, winFun, form, sampling);
  }

  @Override
  public <U> SwimStream<U> foldWithCombiner(final Function<W, U> seed, final WindowFoldFunction<T, W, U> winFun, final WindowBinOp<U, W> combiner, final Form<U> form) {
    return new FoldedWindowedStream<>(underlying, createSpec(), context, seed, winFun, combiner,
        form, sampling);
  }

  @Override
  public SwimStream<T> reduce(final WindowBinOp<T, W> op) {
    return new ReducedWindowedStream<>(underlying, createSpec(), context, op, sampling);
  }

  @Override
  public WindowedSwimStream<T, W> withTrigger(final Trigger<T, W> trigger) {
    return new WindowedStream<>(this.underlying, context, winForm, assigner, trigger,
        evictionStrategy, sampling, isTransient);
  }

  @Override
  public WindowedSwimStream<T, W> withEviction(final EvictionStrategy<T, W> strategy) {
    return new WindowedStream<>(this.underlying, context, winForm, assigner, trigger, strategy, sampling, isTransient);
  }

  @Override
  public WindowedSwimStream<T, W> setTransient(final boolean isTransient) {
    return new WindowedStream<>(this.underlying, context, winForm, assigner, trigger,
        evictionStrategy, sampling, isTransient);
  }
}
