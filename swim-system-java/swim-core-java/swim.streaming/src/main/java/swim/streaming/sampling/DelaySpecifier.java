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

package swim.streaming.sampling;

import java.time.Duration;
import java.util.function.Function;
import swim.streaming.SwimStream;
import swim.util.Require;

public interface DelaySpecifier extends Sampling {

  /**
   * Periodic sampling with a constant time interval.
   *
   * @param interval The time interval.
   * @return Periodic sampling.
   */
  static Sampling constant(final Duration interval) {
    Require.that(interval != null, "Sample interval must be non-null.");
    return new StaticSampling(interval);
  }

  /**
   * Periodic sampling with a dynamic time interval.
   *
   * @param initial The initial time interval.
   * @param after   Stream of new intervals.
   * @param isTransient Whether the current duration is persisted durably.
   * @return Dynamic sampling instance.
   */
  static Sampling dynamic(final Duration initial, final SwimStream<Duration> after, final boolean isTransient) {
    Require.that(initial != null, "Initial interval must be non-null.");
    Require.that(after != null, "Interval stream must be non-null.");
    return new DynamicSampling(initial, after, isTransient);
  }

  /**
   * Distinguish between different sampling strategies.
   *
   * @param onStatic  Called for a static strategy.
   * @param onDynamic Called for a dynamic strategy.
   * @param <T>       The type of the result.
   * @return The result.
   */
  <T> T matchDelay(Function<StaticSampling, T> onStatic,
                   Function<DynamicSampling, T> onDynamic);
}
