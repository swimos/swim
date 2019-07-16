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
 * Skeletal implementation of a stateful {@link Task}.
 */
public abstract class AbstractTask implements Task {
  /**
   * Context used to manage this {@code Task}; {@code null} if this {@code
   * Task} is not bound to an execution {@link Stage}.
   */
  protected TaskContext taskContext;

  @Override
  public final TaskContext taskContext() {
    return this.taskContext;
  }

  @Override
  public void setTaskContext(TaskContext taskContext) {
    this.taskContext = taskContext;
  }

  @Override
  public abstract void runTask();

  @Override
  public boolean taskWillBlock() {
    return false;
  }

  @Override
  public void taskWillCue() {
    // stub
  }

  @Override
  public void taskDidCancel() {
    // stub
  }

  /**
   * Returns the execution {@code Stage} to which this task is bound.
   * Delegates to the assigned {@link #taskContext}.
   *
   * @throws TaskException if {@link #taskContext} is {@code null}.
   */
  public Stage stage() {
    final TaskContext taskContext = this.taskContext;
    if (taskContext == null) {
      throw new TaskException("Unbound Task");
    }
    return taskContext.stage();
  }

  /**
   * Returns {@code true} if the task is currently scheduled for execution.
   * Delegates to the assigned {@link #taskContext}, if set; otherwise returns
   * {@code false}.
   */
  public boolean isCued() {
    final TaskContext taskContext = this.taskContext;
    return taskContext != null && taskContext.isCued();
  }

  /**
   * Schedules this task to execute as a sequential process.  Returns {@code
   * true} if this operation caused the scheduling of this task; returns {@code
   * false} if this task was already scheduled to execute.  This task becomes
   * uncued prior to the the invocation of {@code runTask()}, enabling this
   * task to re-cue itself while running.  Delegates to the assigned {@link
   * #taskContext}.
   *
   * @throws TaskException if {@link #taskContext} is {@code null}.
   */
  public boolean cue() {
    final TaskContext taskContext = this.taskContext;
    if (taskContext == null) {
      throw new TaskException("Unbound Task");
    }
    return taskContext.cue();
  }

  /**
   * Cancels this task to prevent it from executing.  Returns {@code true} if
   * this operation caused the cancellation of this task; returns {@code false}
   * if this task was not scheduled to execute.  Delegates to the assigned
   * {@link #taskContext}.
   */
  public boolean cancel() {
    final TaskContext taskContext = this.taskContext;
    if (taskContext == null) {
      return false;
    }
    return taskContext.cancel();
  }
}
