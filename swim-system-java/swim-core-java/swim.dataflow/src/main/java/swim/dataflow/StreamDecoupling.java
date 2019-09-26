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
import swim.streaming.Junction;
import swim.streaming.MapJunction;
import swim.streaming.SwimStream;
import swim.streaming.SwimStreamContext;
import swim.streaming.persistence.ValuePersister;
import swim.streaming.sampling.Sampling;
import swim.streamlet.MapJunction2;
import swim.streamlet.PeriodicConduit;
import swim.streamlet.RateLimitedMapConduit;
import swim.streamlet.SamplingMapConduit;
import swim.streamlet.StreamInterpretation;
import swim.streamlet.VariablePeriodicConduit;

/**
 * Static methods to temporally decouple a stream (the rate at which the stream emits data becomes different from
 * the rate at which it receives it).
 */
final class StreamDecoupling {

  private StreamDecoupling() {
  }

  /**
   * Sample from a junction, producing another junction.
   *
   * @param id             The ID of the stream component.
   * @param context        The stream initialization context.
   * @param in             The input junction.
   * @param sampling       The sampling strategy.
   * @param interpretation Semantic interpretation of the stream.
   * @param <T>            The type of the stream.
   * @return Junection producing the sampled data.
   */
  public static <T> Junction<T> sampleStream(final String id,
                                             final SwimStreamContext.InitContext context,
                                             final Junction<T> in,
                                             final Sampling sampling,
                                             final StreamInterpretation interpretation) {

    return sampling.match(() -> in,
        dur -> constantSampling(context, in, dur.getInterval(), interpretation),
        dyn -> dynamicSampling(id, context, in, dyn.getInitial(), dyn.getIntervalStream(), dyn.isTransient(), interpretation));
  }

  /**
   * Sample from a map junction, producing another map junction.
   *
   * @param id             The ID of the stream component.
   * @param context        The stream initialization context.
   * @param in             The input junction.
   * @param sampling       The sampling strategy.
   * @param interpretation Semantic interpretation of the stream.
   * @param <K>            The type of the keys.
   * @param <V>            The type of the values.
   * @return Junction emitting the sampled data.
   */
  public static <K, V> MapJunction<K, V> sampleMapStream(final String id,
                                                         final SwimStreamContext.InitContext context,
                                                         final MapJunction<K, V> in,
                                                         final Sampling sampling,
                                                         final StreamInterpretation interpretation) {
    return sampling.match(() -> in,
        dur -> constantSamplingMap(context, in, dur.getInterval(), interpretation),
        dyn -> dynamicSamplingMap(id, context, in, dyn.getInitial(), dyn.getIntervalStream(), dyn.isTransient(), interpretation));
  }

  private static <T> Junction<T> dynamicSampling(final String id,
                                                 final SwimStreamContext.InitContext context,
                                                 final Junction<T> in,
                                                 final Duration dur0,
                                                 final SwimStream<Duration> durs,
                                                 final boolean isTransient,
                                                 final StreamInterpretation interpretation) {
    final Junction<Duration> control = context.createFor(durs);
    final VariablePeriodicConduit<T> conduit;
    if (isTransient) {
      conduit = new VariablePeriodicConduit<>(
          context.getSchedule(), dur0, interpretation);
    } else {
      final ValuePersister<Duration> persister = context.getPersistenceProvider().forValue(
          StateTags.periodTag(id), durs.form(), dur0);
      conduit = new VariablePeriodicConduit<>(
          context.getSchedule(), persister, interpretation);
    }
    control.subscribe(conduit.second());
    in.subscribe(conduit.first());
    return conduit;
  }

  private static <K, V> MapJunction<K, V> dynamicSamplingMap(final String id,
                                                             final SwimStreamContext.InitContext context,
                                                             final MapJunction<K, V> in,
                                                             final Duration dur0,
                                                             final SwimStream<Duration> durs,
                                                             final boolean isTransient,
                                                             final StreamInterpretation interpretation) {
    final MapJunction2<K, K, V, V, Duration> conduit;
    if (isTransient) {
      if (interpretation == StreamInterpretation.DISCRETE) {
        conduit = new RateLimitedMapConduit<>(context.getSchedule(), dur0);
      } else {
        conduit = new SamplingMapConduit<>(context.getSchedule(), dur0);
      }
    } else {
      final ValuePersister<Duration> persister = context.getPersistenceProvider().forValue(
          StateTags.periodTag(id), durs.form(), dur0);
      if (interpretation == StreamInterpretation.DISCRETE) {
        conduit = new RateLimitedMapConduit<>(context.getSchedule(), persister);
      } else {
        conduit = new SamplingMapConduit<>(context.getSchedule(), persister);
      }
    }

    in.subscribe(conduit.first());

    final Junction<Duration> periods = context.createFor(durs);
    periods.subscribe(conduit.second());
    return conduit;
  }

  private static <T> Junction<T> constantSampling(final SwimStreamContext.InitContext context,
                                                  final Junction<T> in,
                                                  final Duration dur,
                                                  final StreamInterpretation interpretation) {
    final PeriodicConduit<T> conduit = new PeriodicConduit<>(
        context.getSchedule(), dur, interpretation);
    in.subscribe(conduit);
    return conduit;
  }

  private static <K, V> MapJunction2<K, K, V, V, Duration> constantSamplingMap(final SwimStreamContext.InitContext context,
                                                                               final MapJunction<K, V> in, final Duration dur,
                                                                               final StreamInterpretation interpretation) {
    final MapJunction2<K, K, V, V, Duration> conduit;
    if (interpretation == StreamInterpretation.DISCRETE) {
      conduit = new RateLimitedMapConduit<>(context.getSchedule(), dur);
    } else {
      conduit = new SamplingMapConduit<>(context.getSchedule(), dur);
    }
    in.subscribe(conduit.first());
    return conduit;
  }

}
