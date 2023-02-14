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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A combined {@link TaskScheduler} and {@link TimerScheduler} for
 * scheduling the execution of {@linkplain TaskFunction tasks} and
 * {@linkplain TimerFunction timers}. {@code Scheduler} is thread safe.
 *
 * @see SchedulerService
 * @see ThreadScheduler
 */
@Public
@Since("5.0")
public interface Scheduler extends TaskScheduler, TimerScheduler {

  /**
   * Returns the current thread local task scheduler.
   */
  static @Nullable Scheduler current() {
    return Schedulers.CURRENT.get();
  }

  /**
   * Sets the current thread local task scheduler.
   */
  static void setCurrent(@Nullable Scheduler current) {
    Schedulers.CURRENT.set(current);
  }

}

final class Schedulers {

  private Schedulers() {
    // static
  }

  static final ThreadLocal<Scheduler> CURRENT = new ThreadLocal<Scheduler>();

}
