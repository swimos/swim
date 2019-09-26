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

package swim.streaming.windows;

import java.math.BigInteger;
import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import swim.collections.FingerTrieSeq;
import swim.util.Iterables;

/**
 * Assigns tumbling, mutually exclusive windows of a fixed length. A given value will belong to exactly one window.
 *
 * @param <T> The type of the values.
 */
public class TumblingWindows<T> implements TemporalWindowAssigner<T, TimeInterval, SeqWindowStore<TimeInterval>> {

  private final Instant origin;
  private final Duration length;

  /**
   * @param origin Origin for the windows (all windows will be aligned to this point).
   * @param length The length of the windows.
   */
  public TumblingWindows(final Instant origin, final Duration length) {
    this.origin = origin;
    this.length = length;
  }


  @Override
  public Function<Set<TimeInterval>, SeqWindowStore<TimeInterval>> stateInitializer() {
    return windows -> {
      for (final TimeInterval window : windows) {
        validateWindow(window);
      }
      return new SeqWindowStore<>(FingerTrieSeq.from(windows));
    };
  }

  private void validateWindow(final TimeInterval window) {
    final TimeInterval aligned = alignWindow(origin, length, window.getStart());
    if (!window.equals(aligned)) {
      throw new IllegalStateException(String.format(
          "Window %s is not compatible with this assignment strategy.", window));
    }
  }

  @Override
  public Assignment<TimeInterval, SeqWindowStore<TimeInterval>> windowsFor(final T value,
                                                                           final long timestamp,
                                                                           final SeqWindowStore<TimeInterval> openWindows) {

    final Optional<TimeInterval> selected = Iterables.findFirst(openWindows.getWindows(), w -> w.contains(timestamp));

    final TimeInterval window;
    final SeqWindowStore<TimeInterval> newStore;
    if (selected.isPresent()) {
      window = selected.get();
      newStore = openWindows;
    } else {
      window = alignWindow(origin, length, timestamp);
      newStore = openWindows.addWindow(window);
    }

    return new Assignment<TimeInterval, SeqWindowStore<TimeInterval>>() {
      @Override
      public Set<TimeInterval> windows() {
        return Collections.singleton(window);
      }

      @Override
      public SeqWindowStore<TimeInterval> updatedState() {
        return newStore;
      }
    };
  }

  /**
   * Find the correctly aligned window containing a timestamp.
   *
   * @param origin Origin for the windows (all windows will be aligned to this point).
   * @param length The length of the windows.
   * @param timestamp The timestamp.
   * @return The window containing the timestamp.
   */
  static TimeInterval alignWindow(final Instant origin, final Duration length, final long timestamp) {
    final TimeInterval window;
    final Instant time = Instant.ofEpochMilli(timestamp);
    final Duration sinceOrigin = Duration.between(origin, time);

    final long numDurations = dividedBy(sinceOrigin, length);

    Instant windowStart = origin.plus(length.multipliedBy(numDurations));
    //Handle case for negative offsets where rounding is in the wrong direction.
    if (windowStart.isAfter(time)) {
      windowStart = windowStart.minus(length);
    }

    final Instant windowEnd = windowStart.plus(length);
    window = new TimeInterval(windowStart.toEpochMilli(), windowEnd.toEpochMilli());
    return window;
  }

  private static long dividedBy(final Duration dur, final Duration divisor) {

    final BigInteger num = BigInteger.valueOf(dur.toNanos());
    final BigInteger div = BigInteger.valueOf(divisor.toNanos());
    return num.divide(div).longValueExact();
  }
}
