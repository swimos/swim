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

import java.time.Duration;
import java.util.function.Function;
import java.util.function.ToLongFunction;
import swim.concurrent.Schedule;
import swim.dataflow.connector.AbstractJunction;
import swim.dataflow.connector.FlatMapConduit;
import swim.dataflow.connector.Junction;
import swim.dataflow.connector.VariableFlatMapConduit;
import swim.dataflow.graph.BindingContext;
import swim.dataflow.graph.Iterables;
import swim.dataflow.graph.SwimStream;
import swim.dataflow.graph.SwimStreamContext;
import swim.dataflow.graph.persistence.ValuePersister;
import swim.dataflow.graph.sampling.DelaySpecifier;
import swim.structure.Form;
import swim.structure.form.DurationForm;

/**
 * Stream with a flat-map operation applied across its values. The sequences of values produced for each change is
 * emitted sequentially with a specified delay.
 *
 * @param <S> The input type.
 * @param <T> The output type.
 */
class FlatMapStream<S, T> extends AbstractSwimStream<T> {

  private final SwimStream<S> in;
  private final Function<S, Iterable<T>> f;
  private final DelaySpecifier delay;

  /**
   * @param inputs     The input stream.
   * @param context    The instantiation context.
   * @param valForm    The form of the type of the output values.
   * @param mapping    The flat-map operation.
   * @param delayStrat Specification for the delay.
   */
  FlatMapStream(final SwimStream<S> inputs,
                final BindingContext context,
                final Form<T> valForm, final Function<S, Iterable<T>> mapping,
                final DelaySpecifier delayStrat) {
    super(valForm, context);
    in = inputs;
    f = mapping;
    delay = delayStrat;
  }

  FlatMapStream(final SwimStream<S> inputs,
                final BindingContext context,
                final Form<T> valForm, final Function<S, Iterable<T>> mapping,
                final DelaySpecifier delayStrat, final ToLongFunction<T> ts) {
    super(valForm, context, ts);
    in = inputs;
    f = mapping;
    delay = delayStrat;
  }

  @Override
  public <U> SwimStream<U> map(final Function<T, ? extends U> f2, final Form<U> form) {
    final Function<S, Iterable<U>> composed = f.andThen(it -> Iterables.mapIterable(it, f2));
    return new FlatMapStream<>(in, getContext(), form, composed, delay);
  }

  @Override
  public <U> SwimStream<U> flatMap(final Function<T, Iterable<U>> f2, final Form<U> form, final DelaySpecifier delayStrat) {
    if (delay.equals(delayStrat)) {
      final Function<S, Iterable<U>> composed = f.andThen(it -> Iterables.flatMapIterable(it, f2));
      return new FlatMapStream<>(in, getContext(), form, composed, delay);
    } else {
      return super.flatMap(f2, form, delayStrat);
    }
  }

  @Override
  public SwimStream<T> updateTimestamps(final ToLongFunction<T> datation) {
    return new FlatMapStream<>(in, getContext(), form(), f, delay, datation);
  }

  @Override
  public Junction<T> instantiate(final SwimStreamContext.InitContext context) {
    final Junction<S> source = context.createFor(in);
    final Schedule schedule = context.getSchedule();
    return delay.matchDelay(dur -> simpleFlatMap(source, schedule, dur.getInterval()),
        dyn -> dynamicFlatMap(context, source, schedule, dyn.getInitial(),
            dyn.getIntervalStream(), dyn.isTransient()));
  }

  private AbstractJunction<T> dynamicFlatMap(final SwimStreamContext.InitContext context,
                                             final Junction<S> source,
                                             final Schedule schedule,
                                             final Duration init,
                                             final SwimStream<Duration> delays,
                                             final boolean isTransient) {
    final Junction<Duration> delayJunction = context.createFor(delays);
    final VariableFlatMapConduit<S, T> junction;
    if (isTransient) {
      junction = new VariableFlatMapConduit<>(f, schedule, init);
    } else {
      final ValuePersister<Duration> persister = context.getPersistenceProvider().forValue(
          StateTags.stateTag(id()), new DurationForm(init));
      junction = new VariableFlatMapConduit<>(f, schedule, persister);
    }
    delayJunction.subscribe(junction.second());
    source.subscribe(junction.first());
    return junction;
  }

  private AbstractJunction<T> simpleFlatMap(final Junction<S> source, final Schedule schedule, final Duration dur) {
    final FlatMapConduit<S, T> conduit = new FlatMapConduit<>(f, schedule, dur);
    source.subscribe(conduit);
    return conduit;
  }

}
