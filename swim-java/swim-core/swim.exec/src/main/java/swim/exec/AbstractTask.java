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
 * Generic implementation of a stateful {@link Task}.
 */
@Public
@Since("5.0")
public abstract class AbstractTask implements Task {

  /**
   * The management context that binds this task to a {@link TaskScheduler},
   * or {@code null} if this task is not currently bound to a scheduler.
   */
  protected @Nullable TaskContext context;

  protected AbstractTask() {
    this.context = null;
  }

  @Override
  public final @Nullable TaskContext taskContext() {
    return this.context;
  }

  @Override
  public void setTaskContext(@Nullable TaskContext context) {
    this.context = context;
  }

  @Override
  public abstract void run();

  /**
   * Returns the execution scheduler to which this task is bound,
   * or {@code null} if this task is not currently bound to a task context.
   */
  public @Nullable TaskScheduler scheduler() {
    final TaskContext context = this.context;
    return context != null ? context.scheduler() : null;
  }

  /**
   * Returns {@code true} if this task is currently scheduled for
   * concurrent execution, otherwise returns {@code false} if the
   * task is not currently scheduled, or if the task is not currently
   * bound to a {@code TaskScheduler}.
   */
  public boolean isScheduled() {
    final TaskContext context = this.context;
    return context != null && context.isScheduled();
  }

  /**
   * Schedules this task for concurrent execution by the associated
   * {@link TaskScheduler}; has no effect if the task was already scheduled.
   * Returns {@code true} if this call causes the scheduling of the task;
   * otherwise returns {@code false} if the task was already scheduled.
   */
  public boolean schedule() {
    final TaskContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound task");
    }
    return context.schedule();
  }

  /**
   * Prevents this task from being executed by the associated {@link
   * TaskScheduler}, if the task is currently scheduled; has no effect
   * if the task was not currently scheduled. Returns {@code true} if
   * this call causes the cancellation of the task; otherwise returns
   * {@code false} if the task was not currently scheduled, or if the
   * task is not currently bound to a {@code TaskScheduler}.
   */
  public boolean cancel() {
    final TaskContext context = this.context;
    return context != null && context.cancel();
  }

}
