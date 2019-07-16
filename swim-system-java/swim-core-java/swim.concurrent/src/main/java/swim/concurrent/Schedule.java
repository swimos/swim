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

package swim.concurrent;

/**
 * Timetable for executing timers at their scheduled times.  {@code Schedule}
 * is thread safe.
 *
 * @see Clock
 */
public interface Schedule {
  /**
   * Returns an unscheduled {@code TimerRef} bound to {@code timer}, which
   * can later be used to schedule {@code timer}.
   */
  TimerRef timer(TimerFunction timer);

  /**
   * Schedules {@code timer} to execute after {@code millis} milliseconds
   * have elapsed.  Returns a {@code TimerRef} that can be used to check the
   * status of, reschedule, and cancel {@code timer}.
   */
  TimerRef setTimer(long millis, TimerFunction timer);
}
