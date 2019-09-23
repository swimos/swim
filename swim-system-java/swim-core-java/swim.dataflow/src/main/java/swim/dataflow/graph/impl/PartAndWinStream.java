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
import java.util.function.BinaryOperator;
import java.util.function.Function;
import swim.dataflow.graph.MapSwimStream;
import swim.dataflow.graph.MapWindowedSwimStream;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.sampling.Sampling;
import swim.dataflow.graph.windows.CombinedState;
import swim.dataflow.graph.windows.CombinedWindowAssigner;
import swim.dataflow.graph.windows.KeyedWindowBinOp;
import swim.dataflow.graph.windows.KeyedWindowFoldFunction;
import swim.dataflow.graph.windows.KeyedWindowFunction;
import swim.dataflow.graph.windows.eviction.EvictionStrategy;
import swim.dataflow.graph.windows.triggers.Trigger;
import swim.structure.Form;

/**
 * A stream that has been simultaneously partitioned and temporally windowed.
 *
 * @param <T> The type of the values.
 * @param <P> The type of the partitions.
 * @param <W> The type of the windows.
 * @param <S> The type of the state store tracking open partitions and windows.
 */
class PartAndWinStream<Con, T, P, W, S extends CombinedState<P, W, S>> implements MapWindowedSwimStream<P, T, W> {

  private final SwimStream<T> in;
  private final Con context;
  private final CombinedWindowAssigner<T, P, W, S> assigner;
  private final Function<P, Trigger<T, W>> trigger;
  private final Function<P, EvictionStrategy<T, W>> eviction;
  private final Form<P> partForm;
  private final Form<W> winForm;
  private final Sampling sampling;
  private final boolean isTransient;

  PartAndWinStream(final SwimStream<T> input,
                   final Con con,
                   final CombinedWindowAssigner<T, P, W, S> winAssigner,
                   final Function<P, Trigger<T, W>> winTrigger,
                   final Function<P, EvictionStrategy<T, W>> evictionStrat,
                   final Form<P> pform, final Form<W> wform,
                   final Sampling samplingStrat,
                   final boolean isTransient) {
    in = input;
    context = con;
    assigner = winAssigner;
    trigger = winTrigger;
    eviction = evictionStrat;
    partForm = pform;
    winForm = wform;
    sampling = samplingStrat;
    this.isTransient = isTransient;
  }

  @Override
  public Form<P> keyForm() {
    return partForm;
  }

  @Override
  public Form<T> valueForm() {
    return in.form();
  }

  @Override
  public Form<W> windowForm() {
    return winForm;
  }

  @Override
  public <U> MapSwimStream<P, U> mapWindow(final KeyedWindowFunction<P, T, W, U> winFun, final Form<U> form) {
    throw new UnsupportedOperationException();
  }

  @Override
  public <U> MapSwimStream<P, U> fold(final U seed, final KeyedWindowFoldFunction<P, T, W, U> winFun,
                                      final BinaryOperator<U> combiner, final Form<U> form) {
    throw new UnsupportedOperationException();
  }

  @Override
  public <U> MapSwimStream<P, U> fold(final U seed,
                                      final KeyedWindowFoldFunction<P, T, W, U> winFun,
                                      final Form<U> form) {
    throw new UnsupportedOperationException();
  }

  @Override
  public <U> MapSwimStream<P, U> foldByKeyWithCombiner(final BiFunction<P, W, U> seed, final KeyedWindowFoldFunction<P, T, W, U> winFun, final KeyedWindowBinOp<P, U, W> combiner, final Form<U> form) {
    return null;
  }

  @Override
  public <U> MapSwimStream<P, U> foldByKey(final BiFunction<P, W, U> seed,
                                           final KeyedWindowFoldFunction<P, T, W, U> winFun,
                                           final Form<U> form) {
    throw new UnsupportedOperationException();
  }

  @Override
  public MapSwimStream<P, T> reduceByKey(final KeyedWindowBinOp<P, T, W> op) {
    throw new UnsupportedOperationException();
  }


  @Override
  public MapWindowedSwimStream<P, T, W> withTrigger(final Function<P, Trigger<T, W>> trigger) {
    return new PartAndWinStream<>(in, context, assigner, trigger, eviction, partForm, winForm, sampling, isTransient);
  }

  @Override
  public MapWindowedSwimStream<P, T, W> withEviction(final Function<P, EvictionStrategy<T, W>> eviction) {
    return new PartAndWinStream<>(in, context, assigner, trigger, eviction, partForm, winForm, sampling, isTransient);
  }

  @Override
  public MapWindowedSwimStream<P, T, W> setIsTransient(final boolean isTransient) {
    if (this.isTransient == isTransient) {
      return this;
    } else {
      return new PartAndWinStream<>(in, context, assigner, trigger, eviction, partForm, winForm, sampling, isTransient);
    }
  }
}
