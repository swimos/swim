// Copyright 2015-2022 Swim.inc
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

package swim.exec;

import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A scheduler for arranging future execution of {@linkplain
 * TimerFunction timers}. {@code TimerScheduler} is thread safe.
 *
 * @see TimerService
 * @see TimerWheel
 */
@Public
@Since("5.0")
public interface TimerScheduler {

  /**
   * Binds a {@code timer} to this scheduler, and returns an unscheduled
   * {@code TimerRef} that can be used to {@link TimerRef#debounce(long)
   * debounce}, {@link TimerRef#throttle(long) throttle}, and {@link
   * TimerRef#cancel() cancel} the timer.
   */
  TimerRef bindTimer(Runnable timer);

  /**
   * Binds and schedules a {@code timer} to execute after {@code delay}
   * milliseconds, and returns a {@code TimerRef} that can be used to
   * {@link TimerRef#debounce(long) debounce}, {@link TimerRef#throttle(long)
   * throttle}, and {@link TimerRef#cancel() cancel} the timer.
   *
   * @throws IllegalArgumentException if {@code delay} is negative.
   */
  TimerRef setTimer(long delay, Runnable timer);

}
