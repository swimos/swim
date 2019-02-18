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
 * External handle to a {@link TaskFunction} bound to an execution {@link
 * Stage}.  A {@code TaskRef} is used to cue a task for execution, and to
 * cancel the execution of a cued task.  {@code TaskRef} is thread safe.
 *
 * @see Stage
 */
public interface TaskRef {
  /**
   * Returns {@code true} if the task is currently scheduled for execution.
   */
  boolean isCued();

  /**
   * Schedules the task to execute as a sequential process.  Returns {@code
   * true} if this operation caused the scheduling of the task; returns {@code
   * false} if the task was already scheduled to execute.  {@link
   * TaskFunction#runTask()} will be concurrently invoked exactly once for
   * each time {@code cue()} returns {@code true}, minus the number of times
   * {@code cancel()} returns {@code true}.  The task becomes uncued prior to
   * the invocation of {@code runTask()}, enabling the task to re-cue itself
   * while running.
   */
  boolean cue();

  /**
   * Cancels the task to prevent it from executing.  Returns {@code true} if
   * this operation caused the cancellation of the task; returns {@code false}
   * if the task was not scheduled to execute.
   */
  boolean cancel();
}
