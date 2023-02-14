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
 * A {@link Scheduler} with management methods for configuring, starting,
 * and stopping the service. {@code SchedulerService} is thread safe.
 */
@Public
@Since("5.0")
public interface SchedulerService extends Scheduler, TaskService {

  /**
   * Returns the {@code TimerService} used to schedule timers.
   * Lazily instantiates a new {@link TimerService} if one has
   * not been previously configured.
   */
  TimerService timerService();

  /**
   * Provides a new {@code timerService} to use to schedule timers.
   *
   * @throws IllegalStateException if the service has already been started
   *         and thus is no longer configurable.
   */
  void setTimerService(TimerService timerService);

  /**
   * Attempts to provide a new {@code timerService} to use to schedule timers.
   *
   * @return {@code true} if the {@code timerService} was assigned; otherwise
   *         returns {@code false} if the service has already been started
   *         and thus is no longer configurable.
   */
  boolean tryTimerService(TimerService timerService);

}
