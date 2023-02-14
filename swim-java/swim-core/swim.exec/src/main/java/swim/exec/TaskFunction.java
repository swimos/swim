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

import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.ForkJoinPool.ManagedBlocker;
import swim.annotations.Public;
import swim.annotations.Since;

/**
 * A cooperatively scheduled {@link Runnable} process that can be
 * {@linkplain #run() executed} many times by a {@link TaskScheduler},
 * but only ever executes on a single thread at a time.
 *
 * <h2>Scheduling</h2>
 * <p>
 * Before a task can be scheduled for concurrent execution, it must first
 * be bound to a {@code TaskScheduler}. Once bound, the {@link TaskRef}
 * returned by {@link TaskScheduler#bindTask(TaskFunction)} can be used to
 * {@link TaskRef#schedule() schedule} and {@link TaskRef#cancel() cancel}
 * the concurrent execution of the task.
 *
 * <h2>Lifecycle</h2>
 * <p>
 * Task lifecycle methods are provided to facilitate debugging, performance
 * monitoring, and other task-specific bookkeeping functions. These methods
 * are invoked from the thread context of calls to {@code TaskScheduler} APIs,
 * which may execute concurrently to the task function. Care must be taken to
 * not perform expensive, blocking, failable, or thread-unsafe operations from
 * within lifecycle callbacks.
 * <p>
 * When a {@code TaskScheduler} is about to schedule a task for concurrent
 * execution, the scheduler first invokes the task's {@link #willSchedule()}
 * callback in the thread context of the caller that causes the scheduling of
 * the task. Immediately after a {@code TaskScheduler} cancels the scheduled
 * execution of a task, the scheduler invokes the task's {@link #didCancel()}
 * callback in the thread context of the caller that causes the cancellation
 * of the task.
 * <p>
 * A {@code TaskScheduler} invokes a task's {@link #run()} method when a
 * thread is available to execute the scheduled task, and the task has not
 * been cancelled. The {@code willSchedule} and {@code didCancel} callbacks
 * may execute concurrently to the task's {@code run} method.
 *
 * <h2>Blocking</h2>
 * <p>
 * Cooperatively scheduled tasks should strive to avoid executing long running
 * or blocking operations, where possible. Tasks should arrange for I/O and
 * other potentially blocking operations to execute asynchronously, and then
 * reschedule the task for execution once the operation can be completed
 * without blocking. This approach requires that tasks carefully track their
 * internal state so that they know how to resume when re-run.
 * <p>
 * Sometimes a task can't avoid performing a blocking operation. Other times,
 * blocking occurs rarely enough, and with sufficiently low average latency,
 * that the overhead of an asynchronous operations isn't warranted. If a task
 * must block, it should wrap any blocking operation in a call to
 * {@link ForkJoinPool#managedBlock(ManagedBlocker)}.
 *
 * @see Task
 * @see TaskScheduler
 */
@Public
@Since("5.0")
@FunctionalInterface
public interface TaskFunction extends Runnable {

  /**
   * Invoked by a bound {@link TaskScheduler} when a thread is available to
   * execute a scheduled task, and the task hasn't been cancelled in the
   * interim between the time the task was scheduled, and the time the
   * scheduler became ready to execute the task.
   */
  @Override
  void run();

  /**
   * Invoked by a bound {@link TaskScheduler} immediately prior to scheduling
   * the task for concurrent execution. {@code willSchedule} is invoked from
   * the thread context of the caller that causes the scheduling of the task,
   * and therefore may execute concurrently to the task's {@link #run()}
   * method, if the task is rescheduled by another thread during a
   * concurrent {@code run}.
   */
  default void willSchedule() {
    // hook
  }

  /**
   * Invoked by a bound {@link TaskScheduler} immediately after cancelling
   * the scheduled execution of a task. {@code didCancel} is invoked from
   * the thread context of the caller that causes the cancellation of the
   * task, and therefore may execute concurrently to the task's {@link #run()}
   * method, if the task is rescheduled and then cancelled by another thread
   * during a concurrent {@code run}.
   */
  default void didCancel() {
    // hook
  }

}
