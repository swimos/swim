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

package swim.dataflow.graph.sampling;

import java.time.Duration;
import java.util.function.Function;
import java.util.function.Supplier;
import swim.dataflow.graph.SwimStream;

/**
 * Sampling strategy for the links between to nodes in a flow graph. Instances can be compared for equality but dynamic
 * sampling instances will only be equal if they are the same object (due to the difficulty of checking equality
 * of streams).
 */
public interface Sampling {

  /**
   * Eager sampling: data is consumed as soon as it is available.
   *
   * @return The eager sampling strategy.
   */
  static Sampling eager() {
    return Eager.INSTANCE;
  }

  /**
   * Periodic sampling with a constant time interval.
   *
   * @param interval The time interval.
   * @return Periodic sampling.
   */
  static Sampling constant(final Duration interval) {
    return DelaySpecifier.constant(interval);
  }

  /**
   * Periodic sampling with a dynamic time interval.
   *
   * @param initial The initial time interval.
   * @param after   Stream of new intervals.
   * @param isTransient Whether the current value of the delay should be persisted durably.
   * @return Dynamic sampling instance.
   */
  static Sampling dynamic(final Duration initial, final SwimStream<Duration> after, final boolean isTransient) {
    return DelaySpecifier.dynamic(initial, after, isTransient);
  }

  /**
   * Distinguish between different sampling strategies.
   *
   * @param onEager   Called for the eager strategy.
   * @param onStatic  Called for a static strategy.
   * @param onDynamic Called for a dynamic strategy.
   * @param <T>       The type of the result.
   * @return The result.
   */
  <T> T match(Supplier<T> onEager,
              Function<StaticSampling, T> onStatic,
              Function<DynamicSampling, T> onDynamic);

}








