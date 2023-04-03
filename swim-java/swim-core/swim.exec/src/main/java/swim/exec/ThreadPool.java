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

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.util.Objects;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.ForkJoinWorkerThread;
import java.util.concurrent.TimeUnit;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.log.Log;
import swim.log.LogEntity;
import swim.repr.Repr;
import swim.repr.TupleRepr;
import swim.util.Result;
import swim.util.Severity;

/**
 * A {@link TaskService} that executes tasks on a {@link ForkJoinPool}.
 */
@Public
@Since("5.0")
public class ThreadPool implements TaskService, Thread.UncaughtExceptionHandler {

  /**
   * Thread pool on which to execute tasks.
   */
  final ForkJoinPool pool;

  /**
   * Atomic bit field containing the service run state in {@link #STATE_MASK}.
   */
  volatile int status;

  /**
   * Service lifecycle and error log.
   */
  Log log;

  public ThreadPool(int parallelism) {
    // Initialize the ForkJoinPool.
    this.pool = new ForkJoinPool(parallelism, new TaskWorkerFactory(this), this, true);

    // Initialize service status.
    this.status = 0;

    // Initialize the service log.
    this.log = this.initLog();
  }

  public ThreadPool() {
    this(Runtime.getRuntime().availableProcessors());
  }

  public final int parallelism() {
    return this.pool.getParallelism();
  }

  public Log log() {
    return this.log;
  }

  protected String logFocus() {
    return Log.uniqueFocus(this);
  }

  protected Log initLog() {
    return Log.forTopic("swim.exec.task.scheduler").withFocus(this.logFocus());
  }

  public void setLog(Log log) {
    Objects.requireNonNull(log);
    this.log = log.withFocus(this.logFocus());
  }

  /**
   * Attempts to execute a {@code configuration} function. To ensure
   * consistent operation, configuration is not permitted once the service
   * has been started. Returns {@code true} if the {@code configuration}
   * function was executed; otherwise returns {@code false} if the service
   * has already been started, and thus can no longer be configured.
   * <p>
   * To prevent the service from concurrently starting while configuring,
   * the service temporarily enters a locked configuring state while it
   * executes the {@code configuration} function. This call may potentially
   * block if a concurrent configuration operation is being performed.
   */
  protected boolean tryConfigure(Runnable configuration) {
    Objects.requireNonNull(configuration);
    int status = (int) STATUS.getOpaque(this);
    boolean configured = false;
    boolean interrupted = false;
    do {
      if ((status & STATE_MASK) == INITIAL_STATE) {
        // The service has not yet been started; try to configure it.
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~STATE_MASK) | CONFIG_LOCK;
        // Try to acquire the config lock;
        // must happen before invoking the configuration function.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          // The config lock has been acquired.
          status = newStatus;
          configured = true;
          try {
            // Invoke the configuration function.
            configuration.run();
          } finally {
            // Prepare to notify waiters upon releasing the config lock.
            synchronized (this) {
              // Release the config lock; must happen before notifying waiters.
              status = (int) STATUS.compareAndExchangeAcquire(this, newStatus, oldStatus);
              // Verify that the service status didn't change while configuring.
              assert status == newStatus;
              status = oldStatus;
              // Notify waiters that the config lock has been released.
              this.notifyAll();
            }
          }
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else if ((status & STATE_MASK) == CONFIG_LOCK) {
        // Another thread currently holds the config lock;
        // prepare to wait for the config lock to be released.
        synchronized (this) {
          // Ensure the config lock is still held before waiting.
          status = (int) STATUS.getOpaque(this);
          if ((status & STATE_MASK) == CONFIG_LOCK) {
            try {
              this.wait(100L);
            } catch (InterruptedException cause) {
              // Defer thread interrupt.
              interrupted = true;
            }
            // Reload service status after waiting.
            status = (int) STATUS.getOpaque(this);
          }
        }
        // Continue trying to acquire the config lock.
        continue;
      } else {
        // The service has already been started; to ensure consistent operation,
        // configuration is no longer permitted.
        break;
      }
    } while (true);
    if (interrupted) {
      // Resume thread interrupt that occurred during service configuration.
      Thread.currentThread().interrupt();
    }
    // Return whether or not the configuration function was invoked.
    return configured;
  }

  @Override
  public final boolean start() {
    int status = (int) STATUS.getOpaque(this);
    boolean causedStart = false;
    boolean interrupted = false;
    do {
      if ((status & STATE_MASK) == STARTED_STATE) {
        // The service has already started.
        if (causedStart) {
          // This call caused the service to start.
          try {
            // Invoke didStart callback now that the thread pool has started.
            this.didStart();
          } catch (Throwable cause) {
            if (Result.isNonFatal(cause)) {
              // Report the non-fatal exception.
              this.log.error("didStart callback failed", cause);
              // Stop the service on lifecycle callback failure.
              this.stop();
              // Reload service status after stop.
              status = (int) STATUS.getOpaque(this);
            } else {
              // Rethrow the fatal exception.
              throw cause;
            }
          }
        }
        break;
      } else if ((status & STATE_MASK) == STARTING_STATE
              || (status & STATE_MASK) == CONFIG_LOCK) {
        // The service is concurrently starting or being configured;
        // prepare to wait for the concurrent operation to complete.
        synchronized (this) {
          // Ensure the concurrent operation is still ongoing before waiting.
          status = (int) STATUS.getOpaque(this);
          if ((status & STATE_MASK) == STARTING_STATE
              || (status & STATE_MASK) == CONFIG_LOCK) {
            try {
              this.wait(100L);
            } catch (InterruptedException cause) {
              // Defer thread interrupt.
              interrupted = true;
            }
            // Reload service status after waiting.
            status = (int) STATUS.getOpaque(this);
          }
        }
        // Continue trying to start the service.
        continue;
      } else if ((status & STATE_MASK) == INITIAL_STATE) {
        // The service has not yet been started.
        int oldStatus = status;
        int newStatus = (oldStatus & ~STATE_MASK) | STARTING_STATE;
        // Try to transition the service into the starting state;
        // must happen before initiating service startup.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          // The service has transitioned into the starting state.
          status = newStatus;
          causedStart = true;
          try {
            // Invoke willStart callback prior to starting the thread pool.
            this.willStart();
          } catch (Throwable cause) {
            if (Result.isNonFatal(cause)) {
              // Report the non-fatal exception.
              this.log.error("willStart callback failed", cause);
              // Stop the service on lifecycle callback failure.
              this.stop();
              // Reload service status after stop.
              status = (int) STATUS.getOpaque(this);
            } else {
              // Rethrow the fatal exception.
              throw cause;
            }
          }
          // No explicit action required to start the thread pool;
          // prepare to complete service startup.
          synchronized (this) {
            oldStatus = status;
            newStatus = (oldStatus & ~STATE_MASK) | STARTED_STATE;
            // Transition the service into the started state;
            // must happen before notifying waiters.
            status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
            // Verify that the service status didn't change while starting.
            assert status == oldStatus;
            status = newStatus;
            // Notify waiters of service startup completion.
            this.notifyAll();
          }
          // Continue startup sequence.
          continue;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else if ((status & STATE_MASK) == STOPPING_STATE
              || (status & STATE_MASK) == STOPPED_STATE) {
        // The service is concurrently stopping, or has permanently stopped.
        break;
      } else {
        throw new AssertionError("unreachable");
      }
    } while (true);
    if (interrupted) {
      // Resume thread interrupt that occurred during service startup.
      Thread.currentThread().interrupt();
    }
    // Return whether or not this call caused the service to start.
    return causedStart;
  }

  /**
   * Lifecycle callback invoked after entering the starting state, but before
   * the thread pool has been started. {@code willStart} is invoked from the
   * thread context of the caller that causes the service to start. If {@code
   * willStart} throws an exception, the service will be immediately stopped.
   */
  protected void willStart() {
    this.log.debug("starting task service");
  }

  /**
   * Lifecycle callback invoked after the thread pool is up and running,
   * and the service has entered the started state. {@code didStart} is
   * invoked from the thread context of the caller that causes the service
   * to stop. If {@code didStart} throws an exception, the service will be
   * immediately stopped.
   */
  protected void didStart() {
    this.log.notice("started task service");
  }

  /**
   * Lifecycle callback invoked by a worker thread right when it starts.
   */
  protected void didStartWorker(ForkJoinWorkerThread worker) {
    this.log.debugEntity("started task worker", worker);
  }

  @Override
  public final boolean stop() {
    int status = (int) STATUS.getOpaque(this);
    boolean causedStop = false;
    boolean interrupted = false;
    do {
      if ((status & STATE_MASK) == STOPPED_STATE) {
        // The service has already stopped.
        if (causedStop) {
          // This call caused the service to stop.
          try {
            // Invoke didStop callback now that the thread pool has shutdown.
            this.didStop();
          } catch (Throwable cause) {
            if (Result.isNonFatal(cause)) {
              // Report the non-fatal exception.
              this.log.error("didStop callback failed", cause);
            } else {
              // Rethrow the fatal exception.
              throw cause;
            }
          }
        }
        break;
      } else if ((status & STATE_MASK) == STOPPING_STATE
              || (status & STATE_MASK) == STARTING_STATE
              || (status & STATE_MASK) == CONFIG_LOCK) {
        // The service is concurrently starting, stopping, or being configured;
        // prepare to wait for the concurrent operation to complete.
        synchronized (this) {
          // Ensure the concurrent operation is still ongoing before waiting.
          status = (int) STATUS.getOpaque(this);
          if ((status & STATE_MASK) == STOPPING_STATE
              || (status & STATE_MASK) == STARTING_STATE
              || (status & STATE_MASK) == CONFIG_LOCK) {
            try {
              this.wait(100L);
            } catch (InterruptedException cause) {
              // Defer thread interrupt.
              interrupted = true;
            }
            // Reload service status after waiting.
            status = (int) STATUS.getOpaque(this);
          }
        }
        // Continue trying to stop the service.
        continue;
      } else if ((status & STATE_MASK) == STARTED_STATE
              || (status & STATE_MASK) == INITIAL_STATE) {
        // The service is running, or has never been started.
        int oldStatus = status;
        int newStatus = (oldStatus & ~STATE_MASK) | STOPPING_STATE;
        // Try to transition the service into the stopping state;
        // must happen before initiating service shutdown.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          // The service has transitioned into the stopping state.
          status = newStatus;
          causedStop = true;
          try {
            // Invoke willStop callback prior to stopping the thread pool.
            this.willStop();
          } catch (Throwable cause) {
            if (Result.isNonFatal(cause)) {
              // Report the non-fatal exception.
              this.log.error("willStop callback failed", cause);
            } else {
              // Rethrow the fatal exception.
              throw cause;
            }
          }
          // Stop the thread pool.
          this.pool.shutdown();
          while (!this.pool.isTerminated()) {
            try {
              // Wait for the thread pool to terminate.
              this.pool.awaitTermination(100, TimeUnit.MILLISECONDS);
            } catch (InterruptedException cause) {
              // Defer thread interrupt.
              interrupted = true;
            }
          }
          // Prepare to complete service shutdown.
          synchronized (this) {
            oldStatus = status;
            newStatus = (oldStatus & ~STATE_MASK) | STOPPED_STATE;
            // Transition the service into the stopped state;
            // must happen before notifying waiters.
            status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
            // Verify that the service status didn't change while stopping.
            assert status == oldStatus;
            status = newStatus;
            // Notify waiters of service shutdown completion.
            this.notifyAll();
          }
          // Continue shutdown sequence.
          continue;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else {
        throw new AssertionError("unreachable");
      }
    } while (true);
    if (interrupted) {
      // Resume thread interrupt that occurred during service shutdown.
      Thread.currentThread().interrupt();
    }
    return causedStop;
  }

  /**
   * Lifecycle callback invoked after entering the stopping state, but before
   * the thread pool has been stopped. {@code willStop} is invoked from the
   * thread context of the caller that causes the service to stop.
   */
  protected void willStop() {
    this.log.debug("stopping task service");
  }

  /**
   * Lifecycle callback invoked after the thread pool has been stopped,
   * and the service has entered the stopped state. {@code didStop} is
   * invoked from the thread context of the caller that causes the service
   * to stop.
   */
  protected void didStop() {
    this.log.notice("stopped task service");
  }

  /**
   * Lifecycle callback invoked by a worker thread right before it exits.
   */
  protected void didStopWorker(ForkJoinWorkerThread worker, @Nullable Throwable cause) {
    this.log.debugEntity("stopped task worker", worker);
  }

  @Override
  public void execute(Runnable runnable) {
    Objects.requireNonNull(runnable);
    this.start();
    this.pool.execute(runnable);
  }

  @Override
  public TaskRef bindTask(Runnable task) {
    Objects.requireNonNull(task);
    // Create a handle to bind the task to the service.
    final TaskHandle handle = new TaskHandle(this, task);
    if (task instanceof Task) {
      // Assign the task handle to the task.
      ((Task) task).setTaskContext(handle);
    }
    // Return the bound task handle.
    return handle;
  }

  /**
   * Introspection callback invoked before a task {@code handle}
   * is scheduled for execution.
   */
  protected void willScheduleTask(TaskContext handle) {
    this.log.traceEntity("scheduling task", handle);
  }

  /**
   * Introspection callback invoked after a scheduled task {@code handle}
   * is canceled.
   */
  protected void didCancelTask(TaskContext handle) {
    this.log.traceEntity("cancelling task", handle);
  }

  /**
   * Invokes the task function associated with a task {@code handle}.
   */
  protected void runTask(TaskContext handle) {
    // Resolve the task handle into a Runnable task function,
    // guarding against aberrant subclasses that could theoretically
    // pass in a bogus task handle.
    final Runnable task;
    try {
      task = handle.task();
    } catch (Throwable cause) {
      // `handle.task()` should never throw; but in case it does,
      // don't let it take down the worker thread.
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.error("invalid task handle: " + handle, cause);
        return;
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
    if (task == null) {
      // `handle.task()` should never be null; but if it is,
      // don't let it take down the worker thread.
      this.log.error("unbound task handle: " + handle);
      return;
    }

    try {
      // Invoke service introspection callback.
      this.willRunTask(handle);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willRunTask callback failed", handle, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }

    try {
      // Execute the task function.
      task.run();
    } catch (Throwable exception) {
      if (Result.isNonFatal(exception)) {
        try {
          // Invoke service introspection callback.
          this.didAbortTask(handle, exception);
          return;
        } catch (Throwable cause) {
          if (Result.isNonFatal(cause)) {
            // Report the non-fatal exception.
            this.log.errorStatus("didAbortTask callback failed", handle, cause);
            return;
          } else {
            // Rethrow the fatal exception.
            throw cause;
          }
        }
      } else {
        // Rethrow the fatal exception.
        throw exception;
      }
    }

    try {
      // Invoke service introspection callback.
      this.didRunTask(handle);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didRunTask callback failed", handle, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  /**
   * Introspection callback invoked before a task {@code handle} is executed.
   */
  protected void willRunTask(TaskContext handle) {
    this.log.traceEntity("executing task", handle);
  }

  /**
   * Introspection callback invoked after a task {@code handle} executes nominally.
   */
  protected void didRunTask(TaskContext handle) {
    this.log.traceEntity("executed task", handle);
  }

  /**
   * Introspection callback invoked when execution of the task function bound
   * to a task {@code handle} fails by throwing a non-fatal {@code exception}.
   */
  protected void didAbortTask(TaskContext handle, Throwable exception) {
    this.log.errorStatus("aborted task", handle, exception);
  }

  @Override
  public void uncaughtException(Thread thread, Throwable exception) {
    this.log.error("worker thread failed", exception);
  }

  /**
   * {@link #status} state indicating that the service has not yet been started.
   */
  static final int INITIAL_STATE = 0;

  /**
   * {@link #status} state indicating that the service is currently being started.
   */
  static final int STARTING_STATE = 1;

  /**
   * {@link #status} state indicating that the service has been started.
   */
  static final int STARTED_STATE = 2;

  /**
   * {@link #status} state indicating that the service is currently stopping.
   */
  static final int STOPPING_STATE = 3;

  /**
   * {@link #status} state indicating that the service has been permanently stopped.
   */
  static final int STOPPED_STATE = 4;

  /**
   * {@link #status} state indicating that the service has not yet been started,
   * but it is currently being configured.
   */
  static final int CONFIG_LOCK = 7;

  /**
   * Number of bits used by the state sub-field of the {@link #status} field.
   */
  static final int STATE_BITS = 3;

  /**
   * Bit mask for the state sub-field of the {@link #status} field.
   */
  static final int STATE_MASK = (1 << STATE_BITS) - 1;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      STATUS = lookup.findVarHandle(ThreadPool.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}

/**
 * A {@code TaskContext} that executes its task function on a
 * {@code ThreadPool} scheduler.
 */
class TaskHandle implements TaskContext, Runnable, LogEntity {

  /**
   * The task service to which this task handle is bound.
   */
  final ThreadPool service;

  /**
   * The task function to invoke when the scheduled task executes.
   */
  final Runnable task;

  /**
   * Atomic bit field with {@link #SCHEDULED} and {@link #RUNNING} flags.
   */
  volatile int status;

  TaskHandle(ThreadPool service, Runnable task) {
    this.service = service;
    this.task = task;
    this.status = 0;
  }

  @Override
  public Runnable task() {
    return this.task;
  }

  @Override
  public TaskScheduler scheduler() {
    return this.service;
  }

  @Override
  public boolean isScheduled() {
    final int status = (int) STATUS.getOpaque(this);
    return (status & SCHEDULED) != 0;
  }

  @Override
  public boolean schedule() {
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & SCHEDULED) == 0) {
        // The task isn't currently scheduled for execution.
        final int oldStatus = status;
        final int newStatus = oldStatus | SCHEDULED;
        // Try to set the scheduled flag; must happen before scheduling the task.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          // The scheduled flag has been set; the task is now ready to be scheduled.
          status = newStatus;
          try {
            // Invoke service introspection callback.
            this.service.willScheduleTask(this);
          } catch (Throwable cause) {
            if (Result.isNonFatal(cause)) {
              // Report the non-fatal exception.
              this.service.log.error("willScheduleTask callback failed", cause);
            } else {
              // Rethrow the fatal exception.
              throw cause;
            }
          }
          if (this.task instanceof TaskFunction) {
            try {
              // Invoke task lifecycle callback.
              ((TaskFunction) this.task).willSchedule();
            } catch (Throwable cause) {
              if (Result.isNonFatal(cause)) {
                // Report the non-fatal exception.
                this.service.log.error("willSchedule callback failed", cause);
              } else {
                // Rethrow the fatal exception.
                throw cause;
              }
            }
          }
          // Never enqueue the task while it's running; doing so could cause
          // multiple threads to concurrently execute the same task.
          if ((status & RUNNING) == 0) {
            // The task isn't currently running; enqueue it for execution
            // on the thread pool.
            this.service.pool.execute(this);
          } else {
            // The task will be re-enqueued for execution after the current
            // run completes.
          }
          return true;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else {
        // The task is already scheduled for execution.
        return false;
      }
    } while (true);
  }

  @Override
  public boolean cancel() {
    int status = (int) STATUS.getOpaque(this);
    do {
      if ((status & SCHEDULED) != 0) {
        // The task is currently scheduled for execution.
        final int oldStatus = status;
        final int newStatus = oldStatus & ~SCHEDULED;
        // Try to clear the scheduled flag; must happen before cancelling the task.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          // The scheduled flag has been cleared; the task is now cancelled.
          status = newStatus;
          try {
            // Invoke service introspection callback.
            this.service.didCancelTask(this);
          } catch (Throwable cause) {
            if (Result.isNonFatal(cause)) {
              // Report the non-fatal exception.
              this.service.log.error("didCancelTask callback failed", cause);
            } else {
              // Rethrow the fatal exception.
              throw cause;
            }
          }
          if (this.task instanceof TaskFunction) {
            try {
              // Invoke task lifecycle callback.
              ((TaskFunction) this.task).didCancel();
            } catch (Throwable cause) {
              if (Result.isNonFatal(cause)) {
                // Report the non-fatal exception.
                this.service.log.error("didCancel callback failed", cause);
              } else {
                // Rethrow the fatal exception.
                throw cause;
              }
            }
          }
          return true;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else {
        // The task isn't currently scheduled for execution.
        return false;
      }
    } while (true);
  }

  @Override
  public void run() {
    int status = (int) STATUS.getOpaque(this);
    do {
      // Verify that the task isn't concurrently running.
      assert (status & RUNNING) == 0;
      if ((status & SCHEDULED) != 0) {
        // The task is currently scheduled for execution.
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~SCHEDULED) | RUNNING;
        // Try to clear the scheduled flag; must happen before executing the task.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status == oldStatus) {
          // The scheduled flag has been cleared, and the running flag has been set;
          // the task is now ready to be executed.
          status = newStatus;
          // Run the task function.
          this.service.runTask(this);
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else {
        // The task isn't currently scheduled for execution.
        break;
      }
    } while (true);

    do {
      if ((status & RUNNING) != 0) {
        // The task is currently running.
        final int oldStatus = status;
        final int newStatus = oldStatus & ~RUNNING;
        // Try to clear the running flag; must happen after executing the task.
        status = (int) STATUS.compareAndExchangeRelease(this, oldStatus, newStatus);
        if (status == oldStatus) {
          status = newStatus;
          if ((status & SCHEDULED) != 0) {
            // The task was concurrently rescheduled while running. To prevent
            // concurrent execution, the task wasn't enqueued when at the time
            // of scheduling. Enqueue the task now that it's no longer running.
            this.service.pool.execute(this);
          }
          break;
        } else {
          // CAS failed; try again.
          continue;
        }
      } else {
        // The task isn't currently running.
        break;
      }
    } while (true);
  }

  @Override
  public @Nullable Object toLogEntity(Severity level) {
    final Object taskDetail = LogEntity.of(this.task, level);
    if (taskDetail != null) {
      return taskDetail;
    } else {
      final TupleRepr detail = TupleRepr.of();
      detail.put("id", Repr.of(Log.uniqueFocus(this)));
      return detail;
    }
  }

  /**
   * Atomic {@link #status} bit indicating that the task is scheduled for execution.
   */
  static final int SCHEDULED = 1 << 0;

  /**
   * Atomic {@link #status} bit indicating that the task is currently running.
   */
  static final int RUNNING = 1 << 1;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      STATUS = lookup.findVarHandle(TaskHandle.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}

/**
 * A factory for {@code TaskWorker} threads.
 */
final class TaskWorkerFactory implements ForkJoinPool.ForkJoinWorkerThreadFactory {

  /**
   * The task service for which this factory instantiates worker threads.
   */
  final ThreadPool service;

  /**
   * Atomic counter for the number worker threads instantiated in this pool.
   */
  volatile int workerCount;

  TaskWorkerFactory(ThreadPool service) {
    this.service = service;
  }

  @Override
  public ForkJoinWorkerThread newThread(ForkJoinPool pool) {
    // Get the next unique worker ID for this pool.
    final int workerId = (int) WORKER_COUNT.getAndAddAcquire(this, 1);

    // Instantiate a new worker thread.
    final TaskWorker worker = new TaskWorker(pool, this.service, workerId);

    // Set the worker thread name to a combination of the service log topic
    // concatenated with the service ID and worker ID.
    worker.setName(this.service.log.topic() + '-' + Log.uniqueId(this.service) + '.' + workerId);

    // Return the new worker thread.
    return worker;
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #workerCount} field.
   */
  static final VarHandle WORKER_COUNT;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      WORKER_COUNT = lookup.findVarHandle(TaskWorkerFactory.class, "workerCount", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}

/**
 * A {@code ThreadPool} worker thread.
 */
final class TaskWorker extends ForkJoinWorkerThread implements LogEntity {

  /**
   * The task service for which this worker thread runs tasks.
   */
  final ThreadPool service;

  /**
   * Unique ID of this worker in its pool.
   */
  final int workerId;

  TaskWorker(ForkJoinPool pool, ThreadPool service, int workerId) {
    super(pool);
    this.service = service;
    this.workerId = workerId;
  }

  @Override
  protected void onStart() {
    super.onStart();
    this.service.didStartWorker(this);
  }

  @Override
  protected void onTermination(@Nullable Throwable cause) {
    this.service.didStopWorker(this, cause);
    super.onTermination(cause);
  }

  @Override
  public @Nullable Object toLogEntity(Severity level) {
    final TupleRepr detail = TupleRepr.of();
    detail.put("name", Repr.of(this.getName()));
    return detail;
  }

}
