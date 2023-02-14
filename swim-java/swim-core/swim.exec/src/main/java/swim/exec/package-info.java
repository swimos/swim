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

/**
 * Execution exceptions.
 *
 * <h2>Timers</h2>
 * <p>
 * {@linkplain TimerFunction Timer function} and {@linkplain Timer stateful
 * timer} APIs. Any {@link Runnable} instance can be scheduled for future
 * execution by a {@link TimerScheduler}.
 * <p>
 * The {@link TimerFunction} interface extends {@code Runnable} with additional
 * lifecycle hooks for observing the scheduling and cancelling of a timer.
 * The {@link Timer} interface further extends {@code TimerFunction} with
 * a stateful {@link TimerContext} that enables a timer to schedule and
 * cancel itself.
 * <p>
 * A {@link TimerScheduler} is used to arrange the future execution of timers.
 * {@code TimerScheduler} returns a {@link TimerRef} when a timer is first
 * bound to a scheduler. A {@code TimerRef} can be used to {@link
 * TimerRef#throttle(long) throttle}, {@link TimerRef#debounce(long) debounce},
 * and {@link TimerRef#cancel() cancel} the future execution of a timer.
 * <p>
 * {@link TimerService} extends {@code TimerScheduler} with management methods
 * to configure, start, and stop the service. {@link TimerWheel} implements a
 * hashed wheel {@code TimerService}.
 *
 * <h2>Tasks</h2>
 * <p>
 * {@linkplain TaskFunction Task function} and {@linkplain Task stateful task}
 * APIs. A <em>task</em> is a cooperatively scheduled process that can be
 * executed many times, but only ever executes on a single thread at a time.
 * Any {@link Runnable} instance can be scheduled for concurrent execution
 * by a {@link TaskScheduler}.
 * <p>
 * The {@link TaskFunction} interface extends {@code Runnable} with additional
 * lifecycle hooks for observing the scheduling and cancelling of a task.
 * The {@link Task} interface further extends {@code TaskFunction} with
 * a stateful {@link TaskContext} that enables a task to schedule and
 * cancel itself.
 * <p>
 * A {@link TaskScheduler} is used to arrange the concurrent execution
 * of tasks. {@code TaskScheduler} returns a {@link TaskRef} when a task
 * is first bound to a scheduler. A {@code TaskRef} can be used to
 * {@link TaskRef#schedule() schedule} and {@link TaskRef#cancel() cancel}
 * the concurrent execution of a task.
 * <p>
 * {@link TaskService} extends {@code TaskScheduler} with management
 * methods to configure, start, and stop the service. {@link ThreadPool}
 * implements a {@code TaskService} backed by a {@code ForkJoinPool}.
 *
 * <h2>Schedulers</h2>
 * <p>
 * Combined task and timer {@linkplain Scheduler schedulers}.
 * <p>
 * A {@link Scheduler} is used to schedule execution of {@linkplain
 * swim.exec.TaskFunction tasks} and {@linkplain
 * swim.exec.TimerFunction timers}. {@link SchedulerService}
 * extends {@code Scheduler} with management methods to configure,
 * start, and stop the service. {@link ThreadScheduler} implements
 * a {@code SchedulerService} backed by a {@code ForkJoinPool}.
 */
@Public
@Since("5.0")
package swim.exec;

import swim.annotations.Public;
import swim.annotations.Since;
