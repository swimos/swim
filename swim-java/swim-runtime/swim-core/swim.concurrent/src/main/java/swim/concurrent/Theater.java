// Copyright 2015-2023 Swim.inc
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

import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.ForkJoinWorkerThread;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;

/**
 * {@link Stage} that executes timers, tasks, and continuations on a {@code
 * ForkJoinPool}.
 */
public class Theater implements MainStage, Thread.UncaughtExceptionHandler {

  /**
   * Prefix for worker thread names.
   */
  final String name;
  /**
   * Thread pool on which to execute timers, tasks, and continuations.
   */
  final ForkJoinPool pool;
  /**
   * Schedule used to set timers.
   */
  Schedule schedule;
  /**
   * Atomic bit field with {@link #STARTED} and {@link #STOPPED} flags.
   */
  volatile int status;

  public Theater(TheaterDef theaterDef) {
    this.name = theaterDef.name != null ? theaterDef.name : "SwimStage" + Theater.THEATER_COUNT.getAndIncrement() + ".";
    int parallelism = theaterDef.parallelism;
    if (parallelism == 0) {
      parallelism = 2 * Runtime.getRuntime().availableProcessors();
    }
    this.pool = new ForkJoinPool(parallelism, new TheaterWorkerFactory(this), this, true);
    if (theaterDef.scheduleDef instanceof ClockDef) {
      this.schedule = new StageClock(this, (ClockDef) theaterDef.scheduleDef);
    } else {
      this.schedule = new StageClock(this);
    }
  }

  public Theater(String name, int parallelism, Schedule schedule) {
    this.name = name != null ? name : "SwimStage" + Theater.THEATER_COUNT.getAndIncrement() + ".";
    this.pool = new ForkJoinPool(parallelism, new TheaterWorkerFactory(this), this, true);
    this.schedule = schedule != null ? schedule : new StageClock(this);
  }

  public Theater(String name, int parallelism) {
    this(name, parallelism, null);
  }

  public Theater(String name, Schedule schedule) {
    this(name, 2 * Runtime.getRuntime().availableProcessors(), schedule);
  }

  public Theater(String name) {
    this(name, 2 * Runtime.getRuntime().availableProcessors(), null);
  }

  public Theater(int parallelism, Schedule schedule) {
    this(null, parallelism, schedule);
  }

  public Theater(int parallelism) {
    this(null, parallelism, null);
  }

  public Theater(Schedule schedule) {
    this(null, 2 * Runtime.getRuntime().availableProcessors(), schedule);
  }

  public Theater() {
    this(null, 2 * Runtime.getRuntime().availableProcessors(), null);
  }

  public final String name() {
    return this.name;
  }

  public final int parallelism() {
    return this.pool.getParallelism();
  }

  public final Schedule schedule() {
    return this.schedule;
  }

  public void setSchedule(Schedule schedule) {
    this.schedule = schedule;
  }

  /**
   * Ensures that this {@code Theater} is up and running.
   *
   * @throws IllegalStateException if this {@code Theater} has been stopped.
   */
  public void start() {
    do {
      final int oldStatus = Theater.STATUS.get(this);
      if ((oldStatus & Theater.STOPPED) != 0) {
        throw new IllegalStateException("Can't restart stopped theater");
      } else {
        final int newStatus = oldStatus | Theater.STARTED;
        if (oldStatus != newStatus) {
          if (Theater.STATUS.compareAndSet(this, oldStatus, newStatus)) {
            this.didStart();
            break;
          }
        } else {
          break;
        }
      }
    } while (true);
  }

  /**
   * Ensures that this {@code Theater} has been permanently stopped, shutting
   * down the thread pool, if it's currently running. Upon return, this
   * {@code Theater} is guaranteed to be in the <em>stopped</em> state.
   */
  public void stop() {
    do {
      final int oldStatus = Theater.STATUS.get(this);
      final int newStatus = oldStatus | Theater.STOPPED;
      if (oldStatus != newStatus) {
        if (Theater.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          try {
            // Stop the clock.
            if (this.schedule instanceof Clock) {
              ((Clock) this.schedule).stop();
            }
          } finally {
            // Shut down the thread pool.
            this.pool.shutdown();
          }
          boolean interrupted = false;
          while (!this.pool.isTerminated()) {
            try {
              this.pool.awaitTermination(100, TimeUnit.MILLISECONDS);
            } catch (InterruptedException e) {
              interrupted = true;
            }
          }
          this.didStop();
          if (interrupted) {
            Thread.currentThread().interrupt();
          }
          break;
        }
      } else {
        break;
      }
    } while (true);

  }

  @Override
  public void execute(Runnable runnable) {
    this.start();
    this.pool.execute(runnable);
  }

  @Override
  public TaskRef task(TaskFunction task) {
    this.start();
    final TheaterTask context = new TheaterTask(this, task);
    if (task instanceof Task) {
      ((Task) task).setTaskContext(context);
    }
    return context;
  }

  @Override
  public <T> Call<T> call(Cont<T> cont) {
    this.start();
    return new TheaterCall<T>(this, cont);
  }

  @Override
  public TimerRef timer(TimerFunction timer) {
    this.start();
    return this.schedule.timer(timer);
  }

  @Override
  public TimerRef setTimer(long millis, TimerFunction timer) {
    this.start();
    return this.schedule.setTimer(millis, timer);
  }

  /**
   * Lifecycle callback invoked before the thread pool starts up.
   */
  protected void didStart() {
    // hook
  }

  /**
   * Lifecycle callback invoked after the thread pool shuts down.
   */
  protected void didStop() {
    // hook
  }

  /**
   * Lifecycle callback invoked if this {@code Theater} encounters
   * an internal {@code error}.
   */
  protected void didFail(Throwable error) {
    error.printStackTrace();
  }

  /**
   * Introspection callback invoked before a {@code task} is cued for execution.
   */
  protected void taskWillCue(TaskFunction task) {
    // hook
  }

  /**
   * Introspection callback invoked after a cued {@code task} is canceled.
   */
  protected void taskDidCancel(TaskFunction task) {
    // hook
  }

  /**
   * Introspection callback invoked immediately before {@code task.runTask()}
   * is executed.
   */
  protected void taskWillRun(TaskFunction task) {
    // hook
  }

  /**
   * Introspection callback invoked immediately after {@code task.runTask()}
   * returns nominally.
   */
  protected void taskDidRun(TaskFunction task) {
    // hook
  }

  /**
   * Introspection callback invoked immediately after {@code task.runTask()}
   * fails by throwing an {@code error}.
   */
  protected void taskDidFail(TaskFunction task, Throwable error) {
    // hook
  }

  /**
   * Introspection callback invoked before a {@code cont} call is cued for
   * execution.
   */
  protected void callWillCue(Cont<?> cont) {
    // hook
  }

  /**
   * Introspection callback invoked immediately before a call to {@code
   * cont.bind(value)}.
   */
  protected <T> void callWillBind(Cont<T> cont, T value) {
    // hook
  }

  /**
   * Introspection callback invoked immediately after a call to {@code
   * cont.bind(value)} returns nominally.
   */
  protected <T> void callDidBind(Cont<?> cont, T value) {
    // hook
  }

  /**
   * Introspection callback invoked immediately before a call to {@code
   * cont.trap(error)}.
   */
  protected void callWillTrap(Cont<?> cont, Throwable error) {
    // hook
  }

  /**
   * Introspection callback invoked immediately after a call to {@code
   * cont.trap(error)} returns nominally.
   */
  protected void callDidTrap(Cont<?> cont, Throwable error) {
    // hook
  }

  /**
   * Introspection callback invoked immediately after a call to {@code
   * cont.bind(T)} fails by throwing an {@code error}.
   */
  protected void callDidFail(Cont<?> cont, Throwable error) {
    // hook
  }

  @Override
  public void uncaughtException(Thread thead, Throwable error) {
    this.didFail(error);
  }

  /**
   * Atomic {@link #status} bit flag indicating that the theater has started,
   * and is currently running.
   */
  static final int STARTED = 1 << 0;
  /**
   * Atomic {@link #status} bit flag indicating that the theater had previously
   * started, but is now permanently stopped.
   */
  static final int STOPPED = 1 << 1;

  /**
   * Atomic {@link #status} field updater, used to linearize theater startup
   * and shutdown.
   */
  static final AtomicIntegerFieldUpdater<Theater> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(Theater.class, "status");

  /**
   * Total number of theaters that have ever been instantiated. Used to
   * uniquely name theater threads.
   */
  static final AtomicInteger THEATER_COUNT = new AtomicInteger(0);

}

/**
 * {@code TaskContext} that executes its sequential process on a {@code
 * Theater} stage.
 */
class TheaterTask implements TaskContext, Runnable, ForkJoinPool.ManagedBlocker {

  /**
   * {@code Theater} to which the {@code task} is bound.
   */
  final Theater theater;
  /**
   * {@code TaskFunction} to invoke when the cued task executes.
   */
  final TaskFunction task;
  /**
   * Atomic bit field with {@link #CUED} and {@link #RUNNING} flags.
   */
  volatile int status;

  TheaterTask(Theater theater, TaskFunction task) {
    this.theater = theater;
    this.task = task;
    this.status = 0;
  }

  @Override
  public Stage stage() {
    return this.theater;
  }

  @Override
  public boolean isCued() {
    return (TheaterTask.STATUS.get(this) & TheaterTask.CUED) != 0;
  }

  @Override
  public boolean isReleasable() {
    return (TheaterTask.STATUS.get(this) & TheaterTask.RUNNING) == 0;
  }

  @Override
  public boolean cue() {
    do {
      final int oldStatus = TheaterTask.STATUS.get(this);
      final int newStatus = oldStatus | TheaterTask.CUED;
      if (TheaterTask.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if (oldStatus != newStatus && (newStatus & TheaterTask.RUNNING) == 0) {
          this.theater.taskWillCue(this.task);
          if (this.task instanceof Task) {
            ((Task) this.task).taskWillCue();
          }
          this.theater.execute(this);
          return true;
        } else {
          return false;
        }
      }
    } while (true);
  }

  @Override
  public boolean cancel() {
    do {
      final int oldStatus = TheaterTask.STATUS.get(this);
      final int newStatus = oldStatus & ~TheaterTask.CUED;
      if (TheaterTask.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if (oldStatus != newStatus && (newStatus & TheaterTask.RUNNING) == 0) {
          if (this.task instanceof Task) {
            ((Task) this.task).taskDidCancel();
          }
          this.theater.taskDidCancel(this.task);
          return true;
        } else {
          return false;
        }
      }
    } while (true);
  }

  @Override
  public void run() {
    do {
      final int oldStatus = TheaterTask.STATUS.get(this);
      final int newStatus = (oldStatus | TheaterTask.RUNNING) & ~TheaterTask.CUED;
      if (TheaterTask.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if ((oldStatus & TheaterTask.CUED) != 0) {
          this.theater.taskWillRun(this.task);
          try {
            if (this.task instanceof Task && ((Task) this.task).taskWillBlock()) {
              ForkJoinPool.managedBlock(this);
            } else {
              this.task.runTask();
            }
            this.theater.taskDidRun(this.task);
          } catch (InterruptedException error) {
            this.theater.taskDidFail(this.task, error);
          } catch (Throwable error) {
            if (Cont.isNonFatal(error)) {
              this.theater.taskDidFail(this.task, error);
            } else {
              throw error;
            }
          }
        }
        break;
      }
    } while (true);

    do {
      final int oldStatus = TheaterTask.STATUS.get(this);
      final int newStatus = oldStatus & ~TheaterTask.RUNNING;
      if (TheaterTask.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if ((newStatus & TheaterTask.CUED) != 0) {
          this.theater.taskWillCue(this.task);
          if (this.task instanceof Task) {
            ((Task) this.task).taskWillCue();
          }
          this.theater.execute(this);
        }
        break;
      }
    } while (true);
  }

  @Override
  public boolean block() {
    this.task.runTask();
    return true;
  }

  /**
   * Atomic {@link #status} bit flag indicating that the task is currently
   * cued for execution.
   */
  static final int CUED = 1 << 0;
  /**
   * Atomic {@link #status} bit flag indicating that the task is currently
   * executing.
   */
  static final int RUNNING = 1 << 1;

  /**
   * Atomic {@link #status} field updater, used to linearize task cueing.
   */
  static final AtomicIntegerFieldUpdater<TheaterTask> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(TheaterTask.class, "status");

}

/**
 * {@code Call} that executes its {@code Cont}inuation on a {@code Theater}
 * stage.
 */
final class TheaterCall<T> implements Call<T>, Runnable {

  /**
   * {@code Theater} stage on which the {@code cont}inuation executes.
   */
  final Theater theater;
  /**
   * {@code Cont}inuation to invoke when the call is completed.
   */
  final Cont<T> cont;
  /**
   * Completed result of this call; either the bound value of type {@code T},
   * or the trapped error of type {@code Throwable}. The type of {@code result}
   * is decided by the flags of the {@code status} field.
   */
  volatile Object result;
  /**
   * Atomic bit field with {@link #BIND}, {@link #TRAP}, {@link #CUED}, and
   * {@link #DONE} flags.
   */
  volatile int status;

  TheaterCall(Theater theater, Cont<T> cont) {
    this.theater = theater;
    this.cont = cont;
    this.result = null;
    this.status = 0;
  }

  @Override
  public Cont<T> cont() {
    return this.cont;
  }

  @Override
  public void bind(T value) {
    if (!this.tryBind(value)) {
      throw new ContException("continuation already completed");
    }
  }

  @Override
  public void trap(Throwable error) {
    if (!this.tryTrap(error)) {
      throw new ContException("continuation already completed");
    }
  }

  @Override
  public boolean tryBind(T value) {
    do {
      final int oldStatus = TheaterCall.STATUS.get(this);
      if (oldStatus == 0) {
        final int newStatus = TheaterCall.BIND | TheaterCall.CUED;
        if (TheaterCall.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.result = value;
          this.theater.callWillCue(this.cont);
          this.theater.execute(this);
          return true;
        }
      } else {
        return false;
      }
    } while (true);
  }

  @Override
  public boolean tryTrap(Throwable error) {
    do {
      final int oldStatus = TheaterCall.STATUS.get(this);
      if (oldStatus == 0) {
        final int newStatus = TheaterCall.TRAP | TheaterCall.CUED;
        if (TheaterCall.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.result = error;
          this.theater.callWillCue(this.cont);
          this.theater.execute(this);
          return true;
        }
      } else {
        return false;
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  @Override
  public void run() {
    do {
      final int oldStatus = TheaterCall.STATUS.get(this);
      final int newStatus = oldStatus & ~TheaterCall.CUED;
      if (TheaterCall.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if (oldStatus != newStatus) {
          if ((newStatus & TheaterCall.BIND) != 0) {
            final T result = (T) this.result;
            this.theater.callWillBind(this.cont, result);
            try {
              this.cont.bind(result);
              this.theater.callDidBind(this.cont, result);
            } catch (Throwable error) {
              if (Cont.isNonFatal(error)) {
                this.theater.callDidFail(this.cont, error);
                this.cont.trap(error);
              } else {
                throw error;
              }
            }
          } else if ((newStatus & TheaterCall.TRAP) != 0) {
            final Throwable result = (Throwable) this.result;
            this.theater.callWillTrap(this.cont, result);
            try {
              this.cont.trap(result);
              this.theater.callDidTrap(this.cont, result);
            } catch (Throwable error) {
              if (Cont.isNonFatal(error)) {
                this.theater.callDidFail(this.cont, error);
              } else {
                throw error;
              }
            }
          }
        }
        break;
      }
    } while (true);
    do {
      final int oldStatus = TheaterCall.STATUS.get(this);
      final int newStatus = oldStatus | TheaterCall.DONE;
      if (TheaterCall.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        break;
      }
    } while (true);
  }

  /**
   * Atomic {@link #status} bit flag indicating that the call has completed
   * with a value.
   */
  static final int BIND = 1 << 0;
  /**
   * Atomic {@link #status} bit flag indicating that the call has failed with
   * an error.
   */
  static final int TRAP = 1 << 1;
  /**
   * Atomic {@link #status} bit flag indicating that the continuation has been
   * cued for execution.
   */
  static final int CUED = 1 << 2;
  /**
   * Atomic {@link #status} bit flag indicating that the continuation has
   * finished executing, completing the continuation.
   */
  static final int DONE = 1 << 3;

  /**
   * Atomic {@link #status} field updater, used to linearize cont completion.
   */
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<TheaterCall<?>> STATUS =
      AtomicIntegerFieldUpdater.newUpdater((Class<TheaterCall<?>>) (Class<?>) TheaterCall.class, "status");

}

/**
 * Factory for {@code TheaterWorker} threads.
 */
final class TheaterWorkerFactory implements ForkJoinPool.ForkJoinWorkerThreadFactory {

  /**
   * {@code Theater} for which this factory instantiates workers.
   */
  final Theater theater;
  /**
   * Total number of worker threads ever started by this factory.
   */
  volatile int workerCount;

  TheaterWorkerFactory(Theater theater) {
    this.theater = theater;
    this.workerCount = 0;
  }

  @Override
  public ForkJoinWorkerThread newThread(ForkJoinPool pool) {
    return new TheaterWorker(pool, this.theater, TheaterWorkerFactory.WORKER_COUNT.getAndIncrement(this));
  }

  /**
   * Atomic {@link #workerCount} field updater, used to count instantiated
   * worker threads.
   */
  static final AtomicIntegerFieldUpdater<TheaterWorkerFactory> WORKER_COUNT =
      AtomicIntegerFieldUpdater.newUpdater(TheaterWorkerFactory.class, "workerCount");

}

/**
 * {@code Theater} worker thread.
 */
final class TheaterWorker extends ForkJoinWorkerThread {

  TheaterWorker(ForkJoinPool pool, Theater theater, int workerId) {
    super(pool);
    this.setName(theater.name + workerId);
  }

}
