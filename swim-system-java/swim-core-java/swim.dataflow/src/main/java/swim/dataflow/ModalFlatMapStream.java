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

import java.time.Duration;
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.streaming.Junction;
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.persistence.ValuePersister;
import swim.streaming.sampling.DelaySpecifier;
import swim.streamlet.ModalFlatMapStreamlet;
import swim.structure.Form;
import swim.structure.form.DurationForm;
import swim.util.Iterables;

/**
 * Stream with a flat-map operation applied across its values. The sequences of values produced for each change is
 * emitted sequentially with a specified delay. The operation used to update the accumulation can be controlled by a
 * separate control stream.
 *
 * @param <S> The input type.
 * @param <T> The output type.
 * @param <M> The control stream.
 */
public class ModalFlatMapStream<S, T, M> extends AbstractSwimStream<T> {

  private final SwimStream<S> in;
  private final Function<M, Function<S, Iterable<T>>> f;
  private final M initial;
  private final DelaySpecifier delay;
  private final SwimStream<M> controlStream;
  private final boolean isTransient;

  /**
   * @param inputs    The source stream.
   * @param context   The instantiation context.
   * @param valForm   The form of the outputs.
   * @param init      The initial mode.
   * @param mapping   The modal flat-map operation.
   * @param delaySpec The specifier for the delay on the outputs.
   * @param control   The control stream.
   * @param isTransient Whether the state of this stream is stored persistently.
   */
  ModalFlatMapStream(final SwimStream<S> inputs,
                     final BindingContext context,
                     final Form<T> valForm,
                     final M init,
                     final Function<M, Function<S, Iterable<T>>> mapping,
                     final DelaySpecifier delaySpec,
                     final SwimStream<M> control,
                     final boolean isTransient) {
    super(valForm, context);
    in = inputs;
    f = mapping;
    delay = delaySpec;
    controlStream = control;
    initial = init;
    this.isTransient = isTransient;
  }

  /**
   * @param inputs    The source stream.
   * @param context   The instantiation context.
   * @param valForm   The form of the outputs.
   * @param init      The initial mode.
   * @param mapping   The modal flat-map operation.
   * @param delaySpec The specifier for the delay on the outputs.
   * @param control   The control stream.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param ts        Timestamp assigner for the stream.
   */
  ModalFlatMapStream(final SwimStream<S> inputs,
                     final BindingContext context,
                     final Form<T> valForm,
                     final M init,
                     final Function<M, Function<S, Iterable<T>>> mapping,
                     final DelaySpecifier delaySpec,
                     final SwimStream<M> control,
                     final boolean isTransient,
                     final ToLongFunction<T> ts) {
    super(valForm, context, ts);
    in = inputs;
    f = mapping;
    delay = delaySpec;
    controlStream = control;
    initial = init;
    this.isTransient = isTransient;
  }

  @Override
  public <U> SwimStream<U> map(final Function<T, ? extends U> f2, final Form<U> form) {
    final Function<M, Function<S, Iterable<U>>> composed =
        control -> f.apply(control).andThen(it -> Iterables.mapIterable(it, f2));
    return new ModalFlatMapStream<>(in, getContext(), form, initial, composed, delay, controlStream, isTransient);
  }

  @Override
  public <U> SwimStream<U> flatMap(final Function<T, Iterable<U>> f2, final Form<U> form, final DelaySpecifier delaySpec) {
    if (delay.equals(delaySpec)) {
      final Function<M, Function<S, Iterable<U>>> composed =
          control -> f.apply(control).andThen(it -> Iterables.flatMapIterable(it, f2));
      return new ModalFlatMapStream<>(in, getContext(), form, initial, composed, delay, controlStream, isTransient);
    } else {
      return super.flatMap(f2, form, delaySpec);
    }
  }

  @Override
  public SwimStream<T> updateTimestamps(final ToLongFunction<T> datation) {
    return new ModalFlatMapStream<>(in, getContext(), form(), initial, f, delay, controlStream, isTransient, datation);
  }

  @Override
  public Junction<T> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<S> source = context.createFor(in);
    final Junction<M> modes = context.createFor(controlStream);
    final ModalFlatMapStreamlet<S, T, M> junction;
    if (isTransient) {
      junction = delay.matchDelay(dur -> new ModalFlatMapStreamlet<>(
              initial, f, context.getSchedule(), dur.getInterval()),
          dyn -> dynamicDelay(context, dyn.getInitial(), dyn.getIntervalStream(), dyn.isTransient()));
    } else {
      final ValuePersister<M> modePersister = context.getPersistenceProvider().forValue(
          StateTags.modeTag(id()), controlStream.form(), initial);
      junction = delay.matchDelay(dur -> new ModalFlatMapStreamlet<>(
              modePersister, f, context.getSchedule(), dur.getInterval()),
          dyn -> dynamicDelay(context, dyn.getInitial(), dyn.getIntervalStream(), modePersister, dyn.isTransient()));
    }
    source.subscribe(junction.first());
    modes.subscribe(junction.third());
    return junction;
  }

  private ModalFlatMapStreamlet<S, T, M> dynamicDelay(final SwimStreamContext.InitContext context,
                                                      final Duration initDur,
                                                      final SwimStream<Duration> durStr,
                                                      final boolean delayIsTransient) {

    final ModalFlatMapStreamlet<S, T, M> streamlet;
    if (delayIsTransient) {
      streamlet = new ModalFlatMapStreamlet<>(
          initial, f, context.getSchedule(), initDur);
    } else {
      final ValuePersister<Duration> periodPersister = context.getPersistenceProvider().forValue(
          StateTags.stateTag(id()), new DurationForm(initDur));
      streamlet = new ModalFlatMapStreamlet<>(
          initial, f, context.getSchedule(), periodPersister);
    }
    final Junction<Duration> durations = context.createFor(durStr);
    durations.subscribe(streamlet.second());
    return streamlet;
  }

  private ModalFlatMapStreamlet<S, T, M> dynamicDelay(final SwimStreamContext.InitContext context,
                                                      final Duration initDur,
                                                      final SwimStream<Duration> durStr,
                                                      final ValuePersister<M> modePersister,
                                                      final boolean delayIsTransient) {
    final ModalFlatMapStreamlet<S, T, M> streamlet;
    if (delayIsTransient) {
      streamlet = new ModalFlatMapStreamlet<>(
          modePersister, f, context.getSchedule(), initDur);
    } else {
      final ValuePersister<Duration> periodPersister = context.getPersistenceProvider().forValue(
          StateTags.stateTag(id()), new DurationForm(initDur));
      streamlet = new ModalFlatMapStreamlet<>(
          modePersister, f, context.getSchedule(), periodPersister);
    }
    final Junction<Duration> durations = context.createFor(durStr);
    durations.subscribe(streamlet.second());
    return streamlet;
  }
}
