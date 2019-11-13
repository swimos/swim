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
    this.name = theaterDef.name != null ? theaterDef.name : "SwimStage" + THEATER_COUNT.getAndIncrement() + ".";
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
    this.name = name != null ? name : "SwimStage" + THEATER_COUNT.getAndIncrement() + ".";
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
    int oldStatus;
    int newStatus;
    do {
      oldStatus = STATUS.get(this);
      if ((oldStatus & STOPPED) == 0) {
        newStatus = oldStatus | STARTED;
      } else {
        newStatus = oldStatus;
      }
    } while (!STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      didStart();
    } else if ((oldStatus & STOPPED) != 0) {
      throw new IllegalStateException("Can't restart stopped theater");
    }
  }

  /**
   * Ensures that this {@code Theater} has been permanently stopped, shutting
   * down the thread pool, if it's currently running.  Upon return, this
   * {@code Theater} is guaranteed to be in the <em>stopped</em> state.
   */
  public void stop() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = STATUS.get(this);
      newStatus = oldStatus | STOPPED;
    } while (!STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      this.pool.shutdown();
      boolean interrupted = false;
      while (!this.pool.isTerminated()) {
        try {
          this.pool.awaitTermination(100, TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
          interrupted = true;
        }
      }
      didStop();
      if (interrupted) {
        Thread.currentThread().interrupt();
      }
    }
  }

  @Override
  public void execute(Runnable runnable) {
    start();
    this.pool.execute(runnable);
  }

  @Override
  public TaskRef task(TaskFunction task) {
    start();
    final TheaterTask context = new TheaterTask(this, task);
    if (task instanceof Task) {
      ((Task) task).setTaskContext(context);
    }
    return context;
  }

  @Override
  public <T> Call<T> call(Cont<T> cont) {
    start();
    return new TheaterCall<T>(this, cont);
  }

  @Override
  public TimerRef timer(TimerFunction timer) {
    start();
    return this.schedule.timer(timer);
  }

  @Override
  public TimerRef setTimer(long millis, TimerFunction timer) {
    start();
    return this.schedule.setTimer(millis, timer);
  }

  /**
   * Lifecycle callback invoked before the thread pool starts up.
   */
  protected void didStart() {
    // stub
  }

  /**
   * Lifecycle callback invoked after the thread pool shuts down.
   */
  protected void didStop() {
    // stub
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
    // stub
  }

  /**
   * Introspection callback invoked after a cued {@code task} is canceled.
   */
  protected void taskDidCancel(TaskFunction task) {
    // stub
  }

  /**
   * Introspection callback invoked immediately before {@code task.runTask()}
   * is executed.
   */
  protected void taskWillRun(TaskFunction task) {
    // stub
  }

  /**
   * Introspection callback invoked immediately after {@code task.runTask()}
   * returns nominally.
   */
  protected void taskDidRun(TaskFunction task) {
    // stub
  }

  /**
   * Introspection callback invoked immediately after {@code task.runTask()}
   * fails by throwing an {@code error}.
   */
  protected void taskDidFail(TaskFunction task, Throwable error) {
    // stub
  }

  /**
   * Introspection callback invoked before a {@code cont} call is cued for
   * execution.
   */
  protected void callWillCue(Cont<?> cont) {
    // stub
  }

  /**
   * Introspection callback invoked immediately before a call to {@code
   * cont.bind(value)}.
   */
  protected <T> void callWillBind(Cont<T> cont, T value) {
    // stub
  }

  /**
   * Introspection callback invoked immediately after a call to {@code
   * cont.bind(value)} returns nominally.
   */
  protected <T> void callDidBind(Cont<?> cont, T value) {
    // stub
  }

  /**
   * Introspection callback invoked immediately before a call to {@code
   * cont.trap(error)}.
   */
  protected void callWillTrap(Cont<?> cont, Throwable error) {
    // stub
  }

  /**
   * Introspection callback invoked immediately after a call to {@code
   * cont.trap(error)} returns nominally.
   */
  protected void callDidTrap(Cont<?> cont, Throwable error) {
    // stub
  }

  /**
   * Introspection callback invoked immediately after a call to {@code
   * cont.bind(T)} fails by throwing an {@code error}.
   */
  protected void callDidFail(Cont<?> cont, Throwable error) {
    // stub
  }

  @Override
  public void uncaughtException(Thread thead, Throwable error) {
    didFail(error);
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
   * Total number of theaters that have ever been instantiated.  Used to
   * uniquely name theater threads.
   */
  static final AtomicInteger THEATER_COUNT = new AtomicInteger(0);

  /**
   * Atomic {@link #status} field updater, used to linearize theater startup
   * and shutdown.
   */
  static final AtomicIntegerFieldUpdater<Theater> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(Theater.class, "status");
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
  }

  @Override
  public Stage stage() {
    return this.theater;
  }

  @Override
  public boolean isCued() {
    return (this.status & CUED) != 0;
  }

  @Override
  public boolean isReleasable() {
    return (this.status & RUNNING) == 0;
  }

  @Override
  public boolean cue() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & CUED) == 0) {
        newStatus = oldStatus | CUED;
      } else {
        newStatus = oldStatus;
      }
    } while (!STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus && (newStatus & RUNNING) == 0) {
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

  @Override
  public boolean cancel() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~CUED;
    } while (!STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus && (newStatus & RUNNING) == 0) {
      if (this.task instanceof Task) {
        ((Task) this.task).taskDidCancel();
      }
      this.theater.taskDidCancel(this.task);
      return true;
    } else {
      return false;
    }
  }

  @Override
  public void run() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = (oldStatus | RUNNING) & ~CUED;
    } while (!STATUS.compareAndSet(this, oldStatus, newStatus));

    if ((oldStatus & CUED) != 0) {
      this.theater.taskWillRun(this.task);
      try {
        if (this.task instanceof Task && ((Task) this.task).taskWillBlock()) {
          ForkJoinPool.managedBlock(this);
        } else {
          this.task.runTask();
        }
        this.theater.taskDidRun(this.task);
      } catch (Throwable error) {
        this.theater.taskDidFail(this.task, error);
      }
    }

    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~RUNNING;
    } while (!STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((newStatus & CUED) != 0) {
      this.theater.taskWillCue(this.task);
      if (this.task instanceof Task) {
        ((Task) this.task).taskWillCue();
      }
      this.theater.execute(this);
    }
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
   * or the trapped error of type {@code Throwable}.  The type of {@code result}
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
  }

  @Override
  public Cont<T> cont() {
    return this.cont;
  }

  @Override
  public void bind(T value) {
    if (!tryBind(value)) {
      throw new ContException("continuation already completed");
    }
  }

  @Override
  public void trap(Throwable error) {
    if (!tryTrap(error)) {
      throw new ContException("continuation already completed");
    }
  }

  @Override
  public boolean tryBind(T value) {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if (oldStatus == 0) {
        newStatus = oldStatus | BIND | CUED;
      } else {
        newStatus = oldStatus;
      }
    } while (!STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      this.result = value;
      this.theater.callWillCue(this.cont);
      this.theater.execute(this);
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean tryTrap(Throwable error) {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if (oldStatus == 0) {
        newStatus = oldStatus | TRAP | CUED;
      } else {
        newStatus = oldStatus;
      }
    } while (!STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      this.result = error;
      this.theater.callWillCue(this.cont);
      this.theater.execute(this);
      return true;
    } else {
      return false;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void run() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & CUED) != 0) {
        newStatus = oldStatus & ~CUED;
      } else {
        newStatus = oldStatus;
      }
    } while (!STATUS.compareAndSet(this, oldStatus, newStatus));

    if (oldStatus != newStatus) {
      if ((newStatus & BIND) != 0) {
        final T result = (T) this.result;
        this.theater.callWillBind(this.cont, result);
        try {
          this.cont.bind(result);
          this.theater.callDidBind(this.cont, result);
        } catch (Throwable error) {
          this.theater.callDidFail(this.cont, error);
          this.cont.trap(error);
        }
      } else if ((newStatus & TRAP) != 0) {
        final Throwable result = (Throwable) this.result;
        this.theater.callWillTrap(this.cont, result);
        try {
          this.cont.trap(result);
          this.theater.callDidTrap(this.cont, result);
        } catch (Throwable error) {
          this.theater.callDidFail(this.cont, error);
        }
      }
    }

    do {
      oldStatus = this.status;
      newStatus = oldStatus | DONE;
    } while (!STATUS.compareAndSet(this, oldStatus, newStatus));
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
  }

  @Override
  public ForkJoinWorkerThread newThread(ForkJoinPool pool) {
    return new TheaterWorker(pool, this.theater, WORKER_COUNT.getAndIncrement(this));
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
    setName(theater.name + workerId);
  }
}
