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

package swim.dataflow.graph.windows;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import swim.dataflow.graph.windows.eviction.NoEviction;
import swim.dataflow.graph.windows.eviction.ThresholdEviction;
import swim.dataflow.graph.windows.triggers.TimeIntervalTrigger;
import swim.dataflow.graph.windows.triggers.UnboundedTrigger;

/**
 * Utility class to create window specifications.
 */
public final class Windows {

  private Windows() {
  }

  /**
   * Tumbling, mutually exclusive fixed length windows. Each window will only fire when the timestamp passes beyond its
   * end. Data will never be evicted and the window is purged after firing.
   *
   * @param length The length of the generated windows.
   * @param <T>    The type of the values.
   * @return The window specification.
   */
  public static <T> WindowSpec<T, TimeInterval, SeqWindowStore<TimeInterval>> tumbling(final Duration length) {
    return tumbling(defaultOrigin(length), length);
  }

  /**
   * Tumbling, mutually exclusive fixed length windows. Each window will only fire when the timestamp passes beyond its
   * end. Data will never be evicted and the window is purged after firing.
   *
   * @param origin The origin to which windows should be aligned.
   * @param length The length of the generated windows.
   * @param <T>    The type of the values.
   * @return The window specification.
   */
  public static <T> WindowSpec<T, TimeInterval, SeqWindowStore<TimeInterval>> tumbling(final Instant origin,
                                                                                       final Duration length) {
    return tumbling(origin, length, false);
  }

  /**
   * Tumbling, mutually exclusive fixed length windows. Each window will only fire when the timestamp passes beyond its
   * end. Data will never be evicted and the window is purged after firing.
   *
   * @param origin      The origin to which windows should be aligned.
   * @param length      The length of the generated windows.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param <T>         The type of the values.
   * @return The window specification.
   */
  public static <T> WindowSpec<T, TimeInterval, SeqWindowStore<TimeInterval>> tumbling(final Instant origin,
                                                                                       final Duration length,
                                                                                       final boolean isTransient) {
    return new WindowSpec<>(new TumblingWindows<>(origin, length),
        new TimeIntervalTrigger<>(),
        NoEviction.instance(),
        TimeInterval.FORM, isTransient);
  }

  /**
   * By default, windows will be aligned to 00:00 of the current day.
   *
   * @param length The length of the windows.
   * @return The default origin.
   */
  private static Instant defaultOrigin(final Duration length) {
    return Instant.now().truncatedTo(ChronoUnit.DAYS);
  }

  /**
   * Assigns all values to a single smoothly sliding window. The window will fire after every values is added and
   * data that has passed before the start of the window will be evicted. The window will never be purged.
   *
   * @param length The length of the window.
   * @param <T>    The type of the values.
   * @return The window specification.
   */
  public static <T> WindowSpec<T, SlidingInterval, SingletonWindowStore<SlidingInterval>> smoothSliding(final Duration length) {
    return smoothSliding(length, false);
  }

  /**
   * Assigns all values to a single smoothly sliding window. The window will fire after every values is added and
   * data that has passed before the start of the window will be evicted. The window will never be purged.
   *
   * @param length      The length of the window.
   * @param isTransient Whether the state of this stream is stored persistently.
   * @param <T>         The type of the values.
   * @return The window specification.
   */
  public static <T> WindowSpec<T, SlidingInterval, SingletonWindowStore<SlidingInterval>> smoothSliding(final Duration length,
                                                                                                        final boolean isTransient) {
    return new WindowSpec<>(new SmoothSlidingWindows<>(
        new SlidingInterval(length.toMillis())),
        new UnboundedTrigger<>(),
        ThresholdEviction.byTimestamp(),
        SlidingInterval.FORM,
        isTransient);
  }


}
