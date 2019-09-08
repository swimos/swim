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

/**
 * Timer, task, and continuation passing style interfaces, with lightweight
 * scheduler and execution stage implementations.
 *
 * <h2>Timers</h2>
 *
 * <p>A {@link TimerFunction} represents a function to invoke at a scheduled
 * time.  Scheduling a timer yields a {@link TimerRef}, which can be used to
 * check the status of the timer, to reschedule it, and to cancel it.  A {@link
 * Timer} represents a stateful {@code TimerFunction}, with lifecycle callbacks,
 * and a {@link TimerContext} that enables self-management.</p>
 *
 * <h2>Tasks</h2>
 *
 * <p>A {@link TaskFunction} represents a function to invoke as a sequential
 * process in a concurrent environment.  Registering a task yields a {@link
 * TaskRef}, which is used to cue the task for execution.  A {@link Task}
 * represents a stateful {@code TaskFunction}, with lifecycle callbacks, and a
 * {@link TaskContext} that enables self-management.  A {@code Task} is like a
 * primitive <a href="https://en.wikipedia.org/wiki/Actor_model">actor</a> that
 * lacks a builtin mailbox.</p>
 *
 * <h2>Conts</h2>
 *
 * <p>A {@link Cont} represents the continuation of an asynchronous operation.
 * {@link Conts} has factory functions to construct various {@code Cont}inuation
 * combinators.  {@link Sync} implements a synchronous {@code Cont}inuation that
 * continues the current thread of execution after an asynchronous operation
 * completes.</p>
 *
 * <h2>Calls</h2>
 *
 * <p>A {@link Call} provides a handle used to eventually complete an
 * asynchronous operation by invoking a {@code Cont}inuation.  Although a
 * {@code Cont}inuation can be completed directly, by invoking {@link
 * Cont#bind(Object) bind(T)}, or {@link Cont#trap(Throwable)}, completeing a
 * {@code Cont}inuation through a {@code Call} abstracts over the execution
 * context in which the {@code Cont}inuation runs. For example, a {@code Call}
 * returned by {@link Stage#call(Cont)} invokes its bound {@code Cont}inuation
 * in an asynchronous task, preventing unbounded stack growth from occurring
 * when chaining large numbers of {@code Cont}inuations together.</p>
 *
 * <h2>Schedules</h2>
 *
 * <p>A {@link Schedule} arranges for the on-time execution of timers.  {@link
 * Clock} implements a {@code Schedule} algorithm that efficiently scales to
 * large numbers of timers.</p>
 *
 * <h2>Stages</h2>
 *
 * <p>A {@link Stage} concurrently executes sequential tasks.  {@link Theater}
 * implements an execution {@code Stage} backed by a {@code ForkJoinPool}.</p>
 */
package swim.concurrent;
