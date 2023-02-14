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
 * A stateful {@link TimerFunction} with an associated {@link TimerContext}
 * for scheduling and cancelling future execution of the timer with a bound
 * {@link TimerScheduler}.
 *
 * @see AbstractTimer
 * @see TimerScheduler
 */
@Public
@Since("5.0")
public interface Timer extends TimerFunction {

  /**
   * Returns the management context that binds this timer to a {@link
   * TimerScheduler}. Returns {@code null} if this timer is not currently
   * bound to a {@code TimerScheduler}.
   */
  @Nullable TimerContext timerContext();

  /**
   * Sets the {@link #timerContext()} that binds this timer to a {@link
   * TimerScheduler}. Invoked by {@link TimerScheduler#bindTimer(Runnable)
   * TimerScheduler.bindTimer}.
   */
  void setTimerContext(@Nullable TimerContext timerContext);

}
