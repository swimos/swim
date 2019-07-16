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
 * Internal context that binds a {@link Task} to an execution {@link Stage}.
 * A {@code TaskContext} is used by a {@code Task} to re-cue itself for
 * execution, to spawn child tasks, and to set timers.  {@code TaskContext} is
 * thread safe.
 *
 * @see Task
 */
public interface TaskContext extends TaskRef {
  /**
   * Returns the execution {@code Stage} to which the task is bound.
   */
  Stage stage();

  /**
   * Returns {@code true} if the task is currently scheduled for execution.
   */
  @Override
  boolean isCued();

  /**
   * Schedules the task to execute as a sequential process.  Returns {@code
   * true} if this operation caused the scheduling of the task; returns {@code
   * false} if the task was already scheduled to execute.  {@link
   * Task#runTask()} will be concurrently invoked exactly once for each time
   * {@code cue()} returns {@code true}, minus the number of times {@code
   * cancel()} returns {@code true}.  The task becomes uncued prior to the the
   * invocation of {@code runTask()}, enabling the task to re-cue itself while
   * running.
   */
  @Override
  boolean cue();

  /**
   * Cancels the task to prevent it from executing.  Returns {@code true} if
   * this operation caused the cancellation of the task; returns {@code false}
   * if the task was not scheduled to execute.
   */
  @Override
  boolean cancel();
}
