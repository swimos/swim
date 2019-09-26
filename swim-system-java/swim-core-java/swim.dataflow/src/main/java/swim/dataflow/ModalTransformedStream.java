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
import swim.streaming.Junction;
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.persistence.ValuePersister;
import swim.streaming.sampling.DelaySpecifier;
import swim.streamlet.ModalTransformConduit;
import swim.structure.Form;

/**
 * Stream with a transformation applied to the values. The transformation can be modified by an independent control
 * stream.
 *
 * @param <S> The input type.
 * @param <T> The output type.
 * @param <M> The type of the control stream.
 */
class ModalTransformedStream<S, T, M> extends AbstractSwimStream<T> {

  private final SwimStream<S> in;
  private final M initialMode;
  private final Function<M, Function<S, ? extends T>> f;
  private final SwimStream<M> controlStream;
  private final boolean memoizeValue;
  private final boolean isTransient;

  /**
   * @param inputs  The source stream.
   * @param context The instantiation context.
   * @param initial The initial mode.
   * @param mapping The modal transformation.
   * @param memoize Whether to memoize the result.
   * @param control The control stream.
   * @param valForm The form of the type of the outputs.
   * @param isTransient Whether the state of this stream is stored persistently.
   */
  ModalTransformedStream(final SwimStream<S> inputs,
                         final BindingContext context,
                         final M initial,
                         final Function<M, Function<S, ? extends T>> mapping,
                         final boolean memoize,
                         final SwimStream<M> control,
                         final Form<T> valForm,
                         final boolean isTransient) {
    super(valForm, context);
    in = inputs;
    f = mapping;
    controlStream = control;
    initialMode = initial;
    memoizeValue = memoize;
    this.isTransient = isTransient;
  }

  /**
   * @param inputs  The source stream.
   * @param context The instantiation context.
   * @param initial The initial mode.
   * @param mapping The modal transformation.
   * @param memoize Whether to memoize the result.
   * @param control The control stream.
   * @param valForm The form of the type of the outputs.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param ts      Timestamp assigner.
   */
  ModalTransformedStream(final SwimStream<S> inputs,
                         final BindingContext context,
                         final M initial,
                         final Function<M, Function<S, ? extends T>> mapping,
                         final boolean memoize,
                         final SwimStream<M> control,
                         final Form<T> valForm,
                         final boolean isTransient,
                         final ToLongFunction<T> ts) {
    super(valForm, context, ts);
    in = inputs;
    f = mapping;
    controlStream = control;
    initialMode = initial;
    memoizeValue = memoize;
    this.isTransient = isTransient;
  }

  @Override
  public <U> SwimStream<U> map(final Function<T, ? extends U> f2, final Form<U> form) {
    final Function<M, Function<S, ? extends U>> composed = control -> f.apply(control).andThen(f2);
    return new ModalTransformedStream<>(in, getContext(), initialMode, composed, memoizeValue, controlStream,
        form, isTransient);
  }

  @Override
  public <U> SwimStream<U> flatMap(final Function<T, Iterable<U>> f2, final Form<U> form,
                                   final DelaySpecifier delaySpec) {
    final Function<M, Function<S, Iterable<U>>> composed = control -> f.apply(control).andThen(f2);
    return new ModalFlatMapStream<>(in, getContext(), form, initialMode, composed, delaySpec,
        controlStream, isTransient);
  }

  @Override
  public SwimStream<T> updateTimestamps(final ToLongFunction<T> datation) {
    return new ModalTransformedStream<>(in, getContext(), initialMode, f, memoizeValue, controlStream, form(),
        isTransient, datation);
  }

  @Override
  public Junction<T> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<S> source = context.createFor(in);
    final Junction<M> control = context.createFor(controlStream);
    final ModalTransformConduit<S, T, M> junction;
    if (isTransient) {
      junction = new ModalTransformConduit<>(initialMode, f);
    } else {
      final ValuePersister<M> persister = context.getPersistenceProvider().forValue(
          StateTags.modeTag(id()), controlStream.form(), initialMode);
      junction = new ModalTransformConduit<>(persister, f);
    }
    source.subscribe(junction.first());
    control.subscribe(junction.second());
    return junction;
  }

}
