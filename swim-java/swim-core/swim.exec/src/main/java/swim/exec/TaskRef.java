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
 * An external handle to a {@link TaskFunction} bound to a {@link
 * TaskScheduler}. A {@code TaskRef} can be used to {@link #schedule()
 * schedule} and {@link #cancel() cancel} the concurrent execution of
 * a task. {@code TaskRef} is thread safe.
 * <p>
 * The associated {@link TaskScheduler} will invoke {@link TaskFunction#run()}
 * exactly once for each time {@code schedule} returns {@code true}, minus
 * the number of times {@code cancel} returns {@code true}. The task becomes
 * unscheduled immediately prior to the invocation of {@code run}, enabling
 * the task to be rescheduled while executing.
 *
 * @see TaskScheduler
 */
@Public
@Since("5.0")
public interface TaskRef {

  /**
   * Returns the bound task function.
   */
  Runnable task();

  /**
   * Returns the scheduler to which the task is bound.
   */
  TaskScheduler scheduler();

  /**
   * Returns {@code true} if the bound task is currently scheduled
   * for concurrent execution, otherwise returns {@code false}.
   */
  boolean isScheduled();

  /**
   * Schedules the bound task for concurrent execution by the associated
   * {@link TaskScheduler}; has no effect if the task was already scheduled.
   * Returns {@code true} if this call causes the scheduling of the task;
   * otherwise returns {@code false} if the task was already scheduled.
   */
  boolean schedule();

  /**
   * Prevents the bound task from being executed by the associated {@link
   * TaskScheduler}, if the task is currently scheduled; has no effect
   * if the task was not currently scheduled. Returns {@code true} if
   * this call causes the cancellation of the task; otherwise returns
   * {@code false} if the task was not currently scheduled.
   */
  boolean cancel();

}
