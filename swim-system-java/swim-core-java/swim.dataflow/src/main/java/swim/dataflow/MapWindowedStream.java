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

import java.util.function.BiFunction;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import swim.streaming.MapSwimStream;
import swim.streaming.MapWindowedSwimStream;
import swim.streaming.sampling.Sampling;
import swim.streaming.windows.KeyedWindowBinOp;
import swim.streaming.windows.KeyedWindowFoldFunction;
import swim.streaming.windows.KeyedWindowFunction;
import swim.streaming.windows.KeyedWindowSpec;
import swim.streaming.windows.TemporalWindowAssigner;
import swim.streaming.windows.WindowState;
import swim.streaming.windows.eviction.EvictionStrategy;
import swim.streaming.windows.triggers.Trigger;
import swim.structure.Form;

/**
 * A mapped stream with windows defined across the keys.
 *
 * @param <K> The type of th
 * @param <T>
 * @param <W>
 */
class MapWindowedStream<K, T, W, S extends WindowState<W, S>> implements MapWindowedSwimStream<K, T, W> {

  private final Form<W> winForm;
  private final MapSwimStream<K, T> underlying;
  private final Function<K, TemporalWindowAssigner<T, W, S>> assigner;
  private final Function<K, Trigger<T, W>> trigger;
  private final Function<K, EvictionStrategy<T, W>> eviction;
  private final Sampling sampling;
  private final BindingContext context;
  private final boolean isTransient;

  protected BindingContext getContext() {
    return context;
  }

  /**
   * @param stream        The underlying map stream.
   * @param con           The instantiation context.
   * @param form          The form of the windows.
   * @param winAssigner   Assigns windows to values.
   * @param winTrigger    Trigger to close windows.
   * @param evictionStrat Strategy for evicting expired values from the windows.
   * @param samplingStrat Sampling strategy for the link.
   * @param isTransient   Whether the state of this stream is stored persistently.
   */
  MapWindowedStream(final MapSwimStream<K, T> stream,
                    final BindingContext con,
                    final Form<W> form,
                    final Function<K, TemporalWindowAssigner<T, W, S>> winAssigner,
                    final Function<K, Trigger<T, W>> winTrigger,
                    final Function<K, EvictionStrategy<T, W>> evictionStrat,
                    final Sampling samplingStrat,
                    final boolean isTransient) {
    winForm = form;
    underlying = stream;
    assigner = winAssigner;
    trigger = winTrigger;
    sampling = samplingStrat;
    context = con;
    eviction = evictionStrat;
    this.isTransient = isTransient;
  }

  @Override
  public Form<K> keyForm() {
    return underlying.keyForm();
  }

  @Override
  public Form<T> valueForm() {
    return underlying.valueForm();
  }

  @Override
  public Form<W> windowForm() {
    return winForm;
  }

  @Override
  public <U> MapSwimStream<K, U> mapWindow(final KeyedWindowFunction<K, T, W, U> winFun, final Form<U> form) {
    return new TransformedMapWindowedStream<>(underlying, getContext(),
        new KeyedWindowSpec<>(assigner, trigger, eviction, winForm, isTransient), form, winFun, sampling);
  }

  @Override
  public <U> MapSwimStream<K, U> fold(final U seed, final KeyedWindowFoldFunction<K, T, W, U> winFun,
                                      final BinaryOperator<U> combiner, final Form<U> form) {
    return new FoldedMapWindowedStream<>(underlying, context,
        new KeyedWindowSpec<>(assigner, trigger, eviction, winForm, isTransient), form, (k, w) -> seed, winFun,
        (k, w, u1, u2) -> combiner.apply(u1, u2), sampling);
  }

  @Override
  public <U> MapSwimStream<K, U> foldByKeyWithCombiner(final BiFunction<K, W, U> seed,
                                                       final KeyedWindowFoldFunction<K, T, W, U> winFun,
                                                       final KeyedWindowBinOp<K, U, W> combiner,
                                                       final Form<U> form) {
    return new FoldedMapWindowedStream<>(underlying, context,
        new KeyedWindowSpec<>(assigner, trigger, eviction, winForm, isTransient), form, seed, winFun, combiner,
        sampling);
  }

  @Override
  public MapSwimStream<K, T> reduceByKey(final KeyedWindowBinOp<K, T, W> op) {
    return new ReducedByKeyMapWindowedStream<>(underlying, context,
        new KeyedWindowSpec<>(assigner, trigger, eviction, winForm, isTransient), op, sampling);
  }

  @Override
  public MapWindowedSwimStream<K, T, W> withTrigger(final Function<K, Trigger<T, W>> trigger) {
    return new MapWindowedStream<>(underlying, context, winForm, assigner, trigger, eviction, sampling, isTransient);
  }

  @Override
  public MapWindowedSwimStream<K, T, W> withEviction(final Function<K, EvictionStrategy<T, W>> eviction) {
    return new MapWindowedStream<>(underlying, context, winForm, assigner, trigger, eviction, sampling, isTransient);
  }

  /**
   * Set whether the stream state is transient.
   *
   * @param isTransient Whether the stream is transient.
   * @return Copy of this stream with the flag altered.
   */
  @Override
  public MapWindowedSwimStream<K, T, W> setIsTransient(final boolean isTransient) {
    if (this.isTransient == isTransient) {
      return this;
    } else {
      return new MapWindowedStream<>(underlying, context, winForm, assigner, trigger, eviction, sampling, isTransient);
    }
  }
}
