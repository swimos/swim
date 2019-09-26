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
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.streaming.Junction;
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.sampling.Sampling;
import swim.streamlet.MemoizingConduit;
import swim.streamlet.TransformConduit;
import swim.structure.Form;

/**
 * A stream which transforms the values of another stream.
 *
 * @param <S> The type of the inputs.
 * @param <T> The type of the outputs.
 */
public class TransformedStream<S, T> extends AbstractSwimStream<T> {

  private final SwimStream<S> in;
  private final Function<S, ? extends T> f;
  private final boolean memoizeValue;

  /**
   * @param inputs  The source stream.
   * @param context The instantiation context.
   * @param mapping The transformation.
   * @param memoize Whether to memoize the result.
   * @param valForm The form of the type of the outputs.
   */
  TransformedStream(final SwimStream<S> inputs,
                    final BindingContext context,
                    final Function<S, ? extends T> mapping,
                    final boolean memoize,
                    final Form<T> valForm) {
    super(valForm, context);
    in = inputs;
    f = mapping;
    memoizeValue = memoize;
  }

  /**
   * @param inputs  The source stream.
   * @param context The instantiation context.
   * @param mapping The transformation.
   * @param memoize Whether to memoize the result.
   * @param valForm The form of the type of the outputs.
   * @param ts      Timestamp assigner for the stream.
   */
  TransformedStream(final SwimStream<S> inputs,
                    final BindingContext context,
                    final Function<S, ? extends T> mapping,
                    final boolean memoize,
                    final Form<T> valForm,
                    final ToLongFunction<T> ts) {
    super(valForm, context, ts);
    in = inputs;
    f = mapping;
    memoizeValue = memoize;
  }


  @Override
  public <U> SwimStream<U> map(final Function<T, ? extends U> f2, final Form<U> form) {
    return new TransformedStream<>(in, getContext(), f.andThen(f2), memoizeValue, form);
  }

  @Override
  public <U, M> SwimStream<U> mapModal(final M initialMode, final Function<M, Function<T, ? extends U>> f2,
                                       final Form<U> form,
                                       final SwimStream<M> controlStream,
                                       final boolean isTransient) {
    final Function<M, Function<S, ? extends U>> mapped = control -> f.andThen(f2.apply(control));
    return new ModalTransformedStream<>(in, getContext(), initialMode, mapped, memoizeValue, controlStream, form,
        isTransient);
  }


  @Override
  public SwimStream<T> updateTimestamps(final ToLongFunction<T> datation) {
    return new TransformedStream<>(in, getContext(), f, memoizeValue, form(), datation);
  }

  @Override
  public <U> SwimStream<U> fold(final U seed, final BiFunction<U, T, U> op, final Form<U> form,
                                final Sampling samplingStrat, final boolean isTransient) {
    final BiFunction<U, S, U> mappedOp = (U state, S value) -> op.apply(state, f.apply(value));
    return new FoldedStream<>(in, getContext(), form, seed, mappedOp, samplingStrat, isTransient);
  }

  @Override
  public Junction<T> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<S> source = context.createFor(in);
    final TransformConduit<S, T> conduit = new TransformConduit<>(f);
    source.subscribe(conduit);
    if (memoizeValue) {
      final MemoizingConduit<T> memoizer = new MemoizingConduit<>();
      conduit.subscribe(memoizer);
      return memoizer;
    } else {
      return conduit;
    }
  }
}
