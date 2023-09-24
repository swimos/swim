// Copyright 2015-2023 Nstream, inc.
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
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.log.Log;
import swim.log.LogEntity;
import swim.log.LogScope;
import swim.repr.Repr;
import swim.repr.TupleRepr;
import swim.util.Result;
import swim.util.Severity;

/**
 * A hashed wheel {@link TimerService}.
 */
@Public
@Since("5.0")
public class TimerWheel implements TimerService {

  /**
   * Number of nanoseconds between successive timer ticks.
   */
  final long tickNanos;

  /**
   * Number of timer ticks per timer wheel revolution.
   */
  final int tickCount;

  /**
   * Immutable array of {@link #tickCount} timer buckets, each containing
   * a lock-free MPSC queue of timer events to execute for a particular
   * modulus of the timer wheel.
   */
  final TimerQueue[] wheel;

  /**
   * Atomic bit field containing the service run state in {@link #STATE_MASK}.
   */
  volatile int status;

  /**
   * Time at which the service started, in nanoseconds, with arbitrary origin.
   * Set exactly once when the timer thread starts.
   */
  volatile long startTime;

  /**
   * Service lifecycle and error log.
   */
  Log log;

  /**
   * Thread that dispatches timer events at their scheduled times.
   */
  final TimerThread thread;

  /**
   * Constructs a new {@code TimerWheel} with a timer resolution of
   * {@code tickMillis} milliseconds, and a cycle period of
   * {@code tickCount} ticks per wheel revolution.
   */
  public TimerWheel(int tickMillis, int tickCount) {
    // Initialize the number of nanoseconds between timer ticks.
    if (tickMillis <= 0) {
      throw new IllegalArgumentException(Long.toString(tickMillis));
    }
    this.tickNanos = (long) tickMillis * 1000000L;

    // Initialize the number of ticks per wheel revolution.
    if (tickCount <= 0) {
      throw new IllegalArgumentException(Integer.toString(tickCount));
    }
    // Round the tick count up to the next power of two.
    tickCount = tickCount - 1;
    tickCount |= tickCount >> 1;
    tickCount |= tickCount >> 2;
    tickCount |= tickCount >> 4;
    tickCount |= tickCount >> 8;
    tickCount |= tickCount >> 16;
    tickCount = tickCount + 1;
    this.tickCount = tickCount;

    // Initialize the timer wheel with one revolution worth of timer ticks.
    this.wheel = new TimerQueue[tickCount];
    // Initialize a timer queue for each bucket in the timer wheel.
    for (int i = 0; i < tickCount; i += 1) {
      this.wheel[i] = new TimerQueue((long) i);
    }

    // Initialize service status fields.
    this.status = 0;
    this.startTime = 0L;

    // Initialize the service log.
    this.log = this.initLog();

    // Initialize--but don't start--the timer thread.
    this.thread = new TimerThread(this);
    // Set the timer thread name to the log topic
    // concatenated with the service ID.
    this.thread.setName(this.log.topic() + '-' + Log.uniqueId(this));
  }

  /**
   * Constructs a new {@code TimerWheel} with the default timer resolution of
   * {@link #TICK_MILLIS} milliseconds, and the default cycle period of
   * {@link #TICK_COUNT} ticks per wheel revolution.
   */
  public TimerWheel() {
    this(TimerWheel.TICK_MILLIS, TimerWheel.TICK_COUNT);
  }

  public Log log() {
    return this.log;
  }

  protected String logFocus() {
    return Log.uniqueFocus(this);
  }

  protected Log initLog() {
    return Log.forTopic("swim.exec.timer.scheduler").withFocus(this.logFocus());
  }

  public void setLog(Log log) {
    Objects.requireNonNull(log);
    this.log = log.withFocus(this.logFocus());
    // Update the timer thread name to match the log topic
    // concatenated with the service ID.
    this.thread.setName(this.log.topic() + '-' + Log.uniqueId(this));
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
        if (status != oldStatus) {
          // CAS failed; try again.
          continue;
        }
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
      }
      // The service has already been started; to ensure consistent operation,
      // configuration is no longer permitted.
      break;
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
            // Invoke didStart callback now that the timer thread has started.
            this.didStart();
          } catch (Throwable cause) {
            if (Result.isFatal(cause)) {
              throw cause;
            }
            this.log.error("didStart callback failed", cause);
            // Stop the service on lifecycle callback failure.
            this.stop();
            // Reload service status after stop.
            status = (int) STATUS.getOpaque(this);
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
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~STATE_MASK) | STARTING_STATE;
        // Try to transition the service into the starting state;
        // must happen before initiating service startup.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status != oldStatus) {
          // CAS failed; try again.
          continue;
        }
        // The service has transitioned into the starting state.
        status = newStatus;
        causedStart = true;
        try {
          // Invoke willStart callback prior to starting the timer thread.
          this.willStart();
        } catch (Throwable cause) {
          if (Result.isFatal(cause)) {
            throw cause;
          }
          this.log.error("willStart callback failed", cause);
          // Stop the service on lifecycle callback failure.
          this.stop();
          // Reload service status after stop.
          status = (int) STATUS.getOpaque(this);
        }
        // Start the timer thread.
        this.thread.start();
        // Continue startup sequence.
        continue;
      } else if ((status & STATE_MASK) == STOPPING_STATE
              || (status & STATE_MASK) == STOPPED_STATE) {
        // The service is concurrently stopping, or has permanently stopped.
        break;
      }
      throw new AssertionError("unreachable");
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
   * the time thread has been started. {@code willStart} is invoked from the
   * thread context of the caller that causes the service to start. If {@code
   * willStart} throws an exception, the service will be immediately stopped.
   */
  protected void willStart() {
    this.log.debug("starting timer service");
  }

  /**
   * Lifecycle callback invoked after the timer thread is up and running,
   * and the service has entered the started state. {@code didStart} is
   * invoked from the thread context of the caller that causes the service
   * to stop. If {@code didStart} throws an exception, the service will be
   * immediately stopped.
   */
  protected void didStart() {
    this.log.notice("started timer service");
  }

  /**
   * Lifecycle callback invoked by the timer thread right when it starts.
   * If {@code didStartThread} throws an exception, the timer thread
   * will exit and the service will be stopped.
   */
  protected void didStartThread() {
    this.log.debug("started timer thread");
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
            // Invoke didStop callback now that the timer thread has shutdown.
            this.didStop();
          } catch (Throwable cause) {
            if (Result.isFatal(cause)) {
              throw cause;
            }
            this.log.error("didStop callback failed", cause);
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
        final int oldStatus = status;
        final int newStatus = (oldStatus & ~STATE_MASK) | STOPPING_STATE;
        // Try to transition the service into the stopping state;
        // must happen before initiating service shutdown.
        status = (int) STATUS.compareAndExchangeAcquire(this, oldStatus, newStatus);
        if (status != oldStatus) {
          // CAS failed; try again.
          continue;
        }
        // The service has transitioned into the stopping state.
        status = newStatus;
        causedStop = true;
        try {
          // Invoke willStop callback prior to stopping the timer thread.
          this.willStop();
        } catch (Throwable cause) {
          if (Result.isFatal(cause)) {
            throw cause;
          }
          this.log.error("willStop callback failed", cause);
        }
        // Stop the timer thread.
        while (this.thread.isAlive()) {
          // Interrupt the timer thread so it will wakeup and die.
          this.thread.interrupt();
          try {
            // Wait for the timer thread to exit.
            this.thread.join(100);
          } catch (InterruptedException cause) {
            // Defer thread interrupt.
            interrupted = true;
          }
        }
        // Continue shutdown sequence.
        continue;
      }
      throw new AssertionError("unreachable");
    } while (true);
    if (interrupted) {
      // Resume thread interrupt that occurred during service shutdown.
      Thread.currentThread().interrupt();
    }
    return causedStop;
  }

  /**
   * Lifecycle callback invoked after entering the stopping state, but before
   * the timer thread has been stopped. {@code willStop} is invoked from the
   * thread context of the caller that causes the service to stop.
   */
  protected void willStop() {
    this.log.debug("stopping timer service");
  }

  /**
   * Lifecycle callback invoked after the timer thread has been stopped,
   * and the service has entered the stopped state. {@code didStop} is
   * invoked from the thread context of the caller that causes the service
   * to stop.
   */
  protected void didStop() {
    this.log.notice("stopped timer service");
  }

  /**
   * Lifecycle callback invoked by the timer thread right before it exits.
   * If {@code didStartThread} throws an exception, the timer thread
   * will continue existing and the service will still be stopped.
   */
  protected void didStopThread() {
    this.log.debug("stopped timer thread");
  }

  @Override
  public TimerRef bindTimer(Runnable timer) {
    Objects.requireNonNull(timer);
    // Create a handle to bind the timer to the service.
    final TimerHandle handle = new TimerHandle(this, timer);
    if (timer instanceof Timer) {
      // Assign the timer context to the timer.
      ((Timer) timer).setTimerContext(handle);
    }
    // Return the bound timer context.
    return handle;
  }

  @Override
  public TimerRef setTimer(long delay, Runnable timer) {
    Objects.requireNonNull(timer);
    // Create a handle to bind the timer to the service.
    final TimerHandle handle = new TimerHandle(this, timer);
    if (timer instanceof Timer) {
      // Assign the timer context to the timer.
      ((Timer) timer).setTimerContext(handle);
    }
    // Schedule the timer for future execution.
    this.throttle(delay, handle);
    // Return the bound timer context.
    return handle;
  }

  /**
   * Unconditionally schedules a timer {@code handle} for execution after
   * {@code delayMillis} milliseconds has elapsed. Returns {@code true}
   * if the timer was successfully scheduled.
   */
  final boolean debounce(long delayMillis, TimerHandle handle) {
    if (delayMillis < 0L) {
      throw new IllegalArgumentException("negative timer delay: " + delayMillis);
    }

    // Ensure the service has started.
    this.start();

    // Convert the timer delay from milliseconds to nanoseconds.
    long delayNanos = delayMillis * 1000000L;
    if (delayNanos < 0L) {
      // Clamp delay overflow.
      delayNanos = Long.MAX_VALUE;
    }
    // Get the start time of the service.
    final long startTime = (long) START_TIME.getOpaque(this);
    // Compute the deadline for the timer in nanoseconds since service start.
    final long deadline = Math.max(0L, this.nanoTime() + delayNanos - startTime);
    // Divide the deadline by the tick interval to get the tick sequence number
    // at which to execute the timer, rounding up to the next tick.
    final long targetTick = (deadline + (this.tickNanos - 1L)) / this.tickNanos;

    // Create a new timer event to insert into the timer wheel.
    final TimerEvent newEvent = new TimerEvent(0L, targetTick, handle);
    // Atomically get the currently scheduled event and replace it with
    // the to-be-scheduled event; must happen before scheduling the event.
    final TimerEvent oldEvent = (TimerEvent) TimerHandle.EVENT.getAndSetAcquire(handle, newEvent);
    // Check if the timer had a previously scheduled event.
    if (oldEvent != null) {
      // Cancel the previously scheduled event by atomically clearing its
      // reference to the timer handle, ensuring a sequentially consistent
      // total ordering of timer executions and cancellations.
      TimerEvent.HANDLE.setVolatile(oldEvent, null);
    }

    try {
      // Invoke service introspection callback.
      this.willScheduleTimer(delayMillis, handle);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("willScheduleTimer callback failed", handle, cause);
    }

    if (handle.timer instanceof TimerFunction) {
      try {
        // Invoke timer lifecycle callback.
        ((TimerFunction) handle.timer).willSchedule(delayMillis);
      } catch (Throwable cause) {
        if (Result.isFatal(cause)) {
          throw cause;
        }
        this.log.errorStatus("willSchedule callback failed", handle, cause);
      }
    }

    // Insert the new event into the timer wheel.
    this.insertEvent(newEvent);
    // The timer was successfully scheduled.
    return true;
  }

  /**
   * Atomically schedules a timer {@code handle} for execution after
   * {@code delayMillis} milliseconds has elapsed, if and only if the
   * timer is not currently scheduled. Returns {@code true} if the timer
   * was successfully scheduled; otherwise returns {@code false} if the
   * timer was already scheduled.
   */
  final boolean throttle(long delayMillis, TimerHandle handle) {
    if (delayMillis < 0L) {
      throw new IllegalArgumentException("negative timer delay: " + delayMillis);
    }

    // Ensure the service has started.
    this.start();

    // Convert the timer delay from milliseconds to nanoseconds.
    long delayNanos = delayMillis * 1000000L;
    if (delayNanos < 0L) {
      // Clamp delay overflow.
      delayNanos = Long.MAX_VALUE;
    }
    // Get the start time of the service.
    final long startTime = (long) START_TIME.getOpaque(this);
    // Compute the deadline for the timer in nanoseconds since service start.
    final long deadline = Math.max(0L, this.nanoTime() + delayNanos - startTime);
    // Divide the deadline by the tick interval to get the tick sequence number
    // at which to execute the timer, rounding up to the next tick.
    final long targetTick = (deadline + (this.tickNanos - 1L)) / this.tickNanos;

    // Create a new timer event to insert into the timer wheel.
    final TimerEvent newEvent = new TimerEvent(0L, targetTick, handle);
    // Atomically set the current timer event, if and only if the handle
    // does not have a currently scheduled event; must happen before
    // scheduling the event.
    final TimerEvent oldEvent = (TimerEvent) TimerHandle.EVENT.compareAndExchangeAcquire(handle, null, newEvent);
    // Check if the timer had a previously scheduled event.
    if (oldEvent != null) {
      // The timer had a previously scheduled event,
      // so the new event does not need to be scheduled.
      return false;
    }

    // The timer did not have a previously scheduled event,
    // so the new event can be scheduled.
    try {
      // Invoke service introspection callback.
      this.willScheduleTimer(delayMillis, handle);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("willScheduleTimer callback failed", handle, cause);
    }

    if (handle.timer instanceof TimerFunction) {
      try {
        // Invoke timer lifecycle callback.
        ((TimerFunction) handle.timer).willSchedule(delayMillis);
      } catch (Throwable cause) {
        if (Result.isFatal(cause)) {
          throw cause;
        }
        this.log.errorStatus("willSchedule callback failed", handle, cause);
      }
    }

    // Insert the new event into the timer wheel.
    this.insertEvent(newEvent);
    // The timer was successfully scheduled.
    return true;
  }

  /**
   * Inserts a timer {@code event} into the timer wheel.
   */
  final void insertEvent(TimerEvent event) {
    // Get the tick sequence number at which to execute the event.
    long targetTick = event.targetTick;
    // Take the modulus of the target tick with respect to to the number of
    // ticks per timer wheel revolution, yielding the index in the wheel at
    // which to insert the event.
    int bucketIndex = (int) (targetTick % (long) this.tickCount);

    // Get the event queue for the target bucket of the timer wheel.
    TimerQueue queue = this.wheel[bucketIndex];
    // Capture the current foot of the queue.
    TimerEvent foot = (TimerEvent) TimerQueue.FOOT.getOpaque(queue);
    // Search for the last event in the queue, starting from the foot.
    TimerEvent prev = foot;
    // Loop until the new event is inserted into the first queue that will
    // execute after the timer deadline.
    do {
      // Load the next event after the currently known last event;
      // must happen before the event is modified.
      final TimerEvent next = (TimerEvent) TimerEvent.NEXT.getAcquire(prev);
      if (next != null) {
        // Reload the foot of the queue.
        final TimerEvent newFoot = (TimerEvent) TimerQueue.FOOT.getAcquire(queue);
        if (foot != newFoot) {
          // The foot of the queue has been updated; jump to the new foot.
          foot = newFoot;
          // Continue searching from the foot of the queue.
          prev = foot;
        } else {
          // The foot of the queue has not changed; advance to the next event.
          prev = next;
        }
      }
      // prev is the last event in the queue.

      // Check for stale insertion.
      if (targetTick < prev.insertTick) {
        // The timer thread is currently executing, or has already executed,
        // the target tick; try the next tick of the timer wheel.
        targetTick += 1L;
        // Compute the bucket index for the next timer tick.
        bucketIndex = (int) (targetTick % (long) this.tickCount);
        // Get the event queue for the next timer bucket.
        queue = this.wheel[bucketIndex];
        // Reload the foot of the queue.
        foot = (TimerEvent) TimerQueue.FOOT.getAcquire(queue);
        // Continue searching from the foot of the next queue.
        prev = foot;
        continue;
      }

      // prev was inserted before the target tick, indicating that
      // the timer thread hasn't yet finished executing the tick.
      // prev.insertTick is the next tick sequence number that the timer
      // thread will execute for this queue; set event.insertTick to match.
      event.insertTick = prev.insertTick;
      // Try to insert the new event at the end of the queue;
      // must happen after the event.nsertTick is updated.
      if (!TimerEvent.NEXT.weakCompareAndSetRelease(prev, null, event)) {
        // Lost insertion race to another thread; try again.
        continue;
      }

      // To reduce contention, only update the foot of the queue if it
      // lags at least two events behind the last event in the queue.
      if (prev != foot) {
        // Update the foot of the queue; safely races with other threads
        // because the event is already reachable from the previous foot
        // of the queue.
        TimerQueue.FOOT.setRelease(queue, event);
      }

      // The event is now scheduled.
      break;
    } while (true);
  }

  /**
   * Introspection callback invoked before each tick of the timer thread.
   * {@code tick} is the sequence number of the executed tick;
   * {@code waitedMillis} is the number of milliseconds the timer thread slept
   * before executing the tick. If {@code waitedMillis} is negative, then the
   * timer thread didn't start executing the tick until {@code -waitedMillis}
   * milliseconds after the scheduled tick deadline.
   */
  protected void willTick(long tick, long waitedMillis) {
    if (this.log.handles(Severity.TRACE)) {
      this.log.trace("tick", TupleRepr.of("seq", Repr.of(tick),
                                          "waited", Repr.of(waitedMillis)));
    }
  }

  /**
   * Introspection callback invoked after each tick of the timer thread.
   * {@code tick} is the sequence number of the executed tick.
   */
  protected void didTick(long tick) {
    if (this.log.handles(Severity.TRACE)) {
      this.log.trace("tock", TupleRepr.of("seq", Repr.of(tick)));
    }
  }

  /**
   * Introspection callback invoked before a timer {@code handle} is scheduled
   * for future execution with a delay of {@code delay} milliseconds.
   */
  protected void willScheduleTimer(long delay, TimerContext handle) {
    if (this.log.handles(Severity.TRACE)) {
      this.log.traceEntity("scheduling timer for " + delay + "ms", handle);
    }
  }

  /**
   * Introspection callback invoked after a timer {@code handle} has been
   * explicitly cancelled; not invoked when a timer is implicitly cancelled,
   * such as when a timer is rescheduled, or when timers are cancelled due
   * to service stop.
   */
  protected void didCancelTimer(TimerContext handle) {
    this.log.traceEntity("cancelling timer", handle);
  }

  /**
   * Invokes the timer function associated with a timer {@code handle},
   * either by directly invoking {@code timer.run()}, or by scheduling
   * asynchronous execution of the runnable task.
   */
  protected void runTimer(TimerContext handle) {
    // Resolve the timer handle into a Runnable timer function,
    // guarding against aberrant subclasses that could theoretically
    // pass in a bogus timer handle.
    final Runnable timer;
    try {
      timer = handle.timer();
    } catch (Throwable cause) {
      // `handle.timer()` should never throw; but in case it does,
      // don't let it take down the timer thread.
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.error("invalid timer handle: " + handle, cause);
      return;
    }
    if (timer == null) {
      // `handle.timer()` should never be null; but if it is,
      // don't let it take down the timer thread.
      this.log.error("unbound timer handle: " + handle);
      return;
    }

    try {
      // Invoke service introspection callback.
      this.willRunTimer(handle);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("willRunTimer callback failed", handle, cause);
    }

    try {
      final TaskContext taskContext = handle.taskContext();
      if (taskContext != null) {
        // Schedule the timer task for asynchronous execution.
        taskContext.schedule();
      } else {
        // Directly execute the timer function.
        timer.run();
      }
    } catch (Throwable exception) {
      if (Result.isFatal(exception)) {
        throw exception;
      }
      try {
        // Invoke service introspection callback.
        this.didAbortTimer(handle, exception);
        return;
      } catch (Throwable cause) {
        if (Result.isFatal(cause)) {
          throw cause;
        }
        this.log.errorStatus("didAbortTimer callback failed", handle, cause);
        return;
      }
    }

    try {
      // Invoke service introspection callback.
      this.didRunTimer(handle);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.log.errorStatus("didRunTimer callback failed", handle, cause);
    }
  }

  /**
   * Introspection callback invoked before the timer function bound to a timer
   * {@code handle} is executed.
   */
  protected void willRunTimer(TimerContext handle) {
    this.log.traceEntity("firing timer", handle);
  }

  /**
   * Introspection callback invoked after the timer function bound to a timer
   * {@code handle} executes nominally.
   */
  protected void didRunTimer(TimerContext handle) {
    this.log.traceEntity("fired timer", handle);
  }

  /**
   * Introspection callback invoked when execution of the timer function bound
   * to a timer {@code handle} fails by throwing a non-fatal {@code exception}.
   */
  protected void didAbortTimer(TimerContext handle, Throwable exception) {
    this.log.errorStatus("aborted timer", handle, exception);
  }

  /**
   * Returns the lowest tick sequence number that the timer thread has yet
   * to fully execute.
   */
  public final long currentTick() {
    return (long) TimerThread.TICK.getOpaque(this.thread);
  }

  /**
   * Returns the current time, in nanoseconds, with arbitrary origin.
   * Used by the timer thread to determine the current time. Defaults
   * to {@link System#nanoTime()}. Can be overridden to substitute an
   * alternative time source.
   */
  protected long nanoTime() {
    return System.nanoTime();
  }

  /**
   * Parks the current thread for the specified {@code delay}, in milliseconds.
   * Used by the timer thread to wait for the next timer tick. Defaults to
   * {@link Thread#sleep(long)}. Can be overridden to substitute an
   * alternative sleep mechanism.
   */
  protected void sleep(long delay) throws InterruptedException {
    Thread.sleep(delay);
  }

  /**
   * Default number of milliseconds between timer ticks; used by the no-arg
   * {@link #TimerWheel()} constructor. Defaults to the value of the {@code
   * swim.timer.tick.millis} system property, if defined; otherwise defaults
   * to {@code 100} milliseconds.
   */
  static final int TICK_MILLIS;

  /**
   * Default number of ticks per timer wheel revolution; used by the no-arg
   * {@link #TimerWheel()} constructor. Defaults to the value of the {@code
   * swim.timer.tick.count} system property, if defined; otherwise defaults
   * to {@code 512} ticks.
   */
  static final int TICK_COUNT;

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

  /**
   * {@code VarHandle} for atomically accessing the {@link #startTime} field.
   */
  static final VarHandle START_TIME;

  static {
    // Initializes the default number of milliseconds between timer ticks.
    int tickMillis;
    try {
      tickMillis = Integer.parseInt(System.getProperty("swim.exec.timer.wheel.tick.millis"));
    } catch (NumberFormatException cause) {
      tickMillis = 100;
    }
    TICK_MILLIS = tickMillis;

    // Initialize the default number of ticks per timer wheel revolution.
    int tickCount;
    try {
      tickCount = Integer.parseInt(System.getProperty("swim.exec.timer.wheel.tick.count"));
    } catch (NumberFormatException cause) {
      tickCount = 512;
    }
    TICK_COUNT = tickCount;

    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      STATUS = lookup.findVarHandle(TimerWheel.class, "status", Integer.TYPE);
      START_TIME = lookup.findVarHandle(TimerWheel.class, "startTime", Long.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}

/**
 * A {@link TimerContext} that binds a timer function to a {@code TimerWheel},
 * and associates at most one scheduled {@code TimerEvent} at a time.
 */
final class TimerHandle implements TimerContext, LogEntity {

  /**
   * The timer service to which this timer handle is bound.
   */
  final TimerWheel service;

  /**
   * The timer function to invoke when a scheduled event occurs;
   * atomically set to {@code null} when the event is executed or cancelled.
   */
  final Runnable timer;

  /**
   * The event that is currently scheduled to execute the timer function,
   * or {@code null} if the timer is not currently scheduled.
   */
  volatile @Nullable TimerEvent event;

  /**
   * Management context that binds this timer task to a {@code TaskScheduler}.
   */
  @Nullable TaskContext taskContext;

  /**
   * Constructs a new {@code TimerHandle} that binds a {@code timer} function
   * to the timer {@code service}.
   */
  TimerHandle(TimerWheel service, Runnable timer) {
    this.service = service;
    this.timer = timer;
    this.event = null;
    this.taskContext = null;
  }

  @Override
  public Runnable timer() {
    return this.timer;
  }

  @Override
  public TimerScheduler scheduler() {
    return this.service;
  }

  @Override
  public boolean isScheduled() {
    final TimerEvent event = (TimerEvent) EVENT.getOpaque(this);
    return event != null && event.isScheduled();
  }

  @Override
  public boolean debounce(long delay) {
    return this.service.debounce(delay, this);
  }

  @Override
  public boolean throttle(long delay) {
    return this.service.throttle(delay, this);
  }

  @Override
  public boolean cancel() {
    // Atomically get the currently scheduled timer event and replace it
    // with null; must happen before cancelling the event.
    final TimerEvent event = (TimerEvent) EVENT.getAndSetAcquire(this, null);
    // Check if the timer handle had a previously scheduled event.
    if (event == null) {
      // The timer is not currently scheduled.
      return false;
    }

    // Cancel the previously scheduled event by atomically clearing its
    // reference to the timer handle, ensuring a sequentially consistent
    // total ordering of timer executions and cancellations.
    final TimerHandle handle = (TimerHandle) TimerEvent.HANDLE.getAndSet(event, null);
    // Check if the previous event was successfully cancelled.
    if (handle == null) {
      // The timer handle was not returned, indicating that the previously
      // scheduled event has already been executed or cancelled.
      return false;
    }

    // The timer handle was returned, indicating that the previously
    // scheduled event was successfully cancelled.
    if (handle.timer instanceof TimerFunction) {
      try {
        // Invoke timer lifecycle callback.
        ((TimerFunction) handle.timer).didCancel();
      } catch (Throwable cause) {
        if (Result.isFatal(cause)) {
          throw cause;
        }
        this.service.log.errorStatus("didCancel callback failed", handle, cause);
      }
    }

    try {
      // Invoke service introspection callback.
      this.service.didCancelTimer(handle);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      this.service.log.errorStatus("didCancelTimer callback failed", handle, cause);
    }

    // Timer successfully cancelled.
    return true;
  }

  @Override
  public @Nullable TaskContext taskContext() {
    return this.taskContext;
  }

  @Override
  public void setTaskContext(@Nullable TaskContext taskContext) {
    this.taskContext = taskContext;
  }

  @Override
  public void run() {
    this.timer.run();
  }

  @Override
  public @Nullable Object toLogEntity(Severity level) {
    final Object timerDetail = LogEntity.of(this.timer, level);
    if (timerDetail != null) {
      return timerDetail;
    }
    final TupleRepr detail = TupleRepr.of();
    detail.put("id", Repr.of(Log.uniqueFocus(this)));
    return detail;
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #event} field.
   */
  static final VarHandle EVENT;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      EVENT = lookup.findVarHandle(TimerHandle.class, "event", TimerEvent.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}

/**
 * A lock-free, multiple publisher single consumer queue of linked
 * {@linkplain TimerEvent timer events}.
 */
final class TimerQueue {

  /**
   * The first {@code TimerEvent} in the queue. All enqueued events are
   * reachable from the head of the queue. Only the timer thread is
   * permitted to modify the queue head.
   */
  volatile TimerEvent head;

  /**
   * The (close to) last {@code TimerEvent} in the queue.
   */
  volatile TimerEvent foot;

  /**
   * Constructs a new {@code TimerQueue} that will next execute
   * the {@code insertTick} sequence number.
   */
  TimerQueue(long insertTick) {
    this.head = new TimerEvent(insertTick, insertTick, null);
    this.foot = this.head;
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #foot} field.
   */
  static final VarHandle FOOT;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      FOOT = lookup.findVarHandle(TimerQueue.class, "foot", TimerEvent.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}

/**
 * A timer function enqueued in a {@link TimerQueue}.
 */
final class TimerEvent {

  /**
   * Tick sequence number of the next tick that the timer thread will execute
   * at the time this event was inserted into the queue. {@code insertTick}
   * is non-decreasing over successively queued events, and the {@code
   * insertTick} of the last event in a queue always represents the very next
   * tick that the timer thread will execute after traversing the queue.
   */
  long insertTick;

  /**
   * Tick sequence number during which to execute the event.
   */
  final long targetTick;

  /**
   * Handle to the timer function to invoke when executing this event;
   * atomically set to {@code null} when this event is executed or cancelled.
   */
  volatile @Nullable TimerHandle handle;

  /**
   * The next event in the timer queue, or {@code null} if this is the last
   * event in the queue.
   */
  volatile @Nullable TimerEvent next;

  /**
   * Constructs a new {@code TimerEvent} bound to a timer {@code handle} for
   * insertion into a timer queue during the {@code insertTick} cycle of the
   * timer thread, and for execution by the timer thread during its {@code
   * targetTick} cycle.
   */
  TimerEvent(long insertTick, long targetTick, @Nullable TimerHandle handle) {
    this.insertTick = insertTick;
    this.targetTick = targetTick;
    this.handle = handle;
    this.next = null;
  }

  /**
   * Returns {@code true} if this event is currently scheduled for execution.
   */
  boolean isScheduled() {
    // Check if the handle field is non-null, indicating that the event
    // is currently scheduled for execution.
    return HANDLE.getOpaque(this) != null;
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #handle} field.
   */
  static final VarHandle HANDLE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #next} field.
   */
  static final VarHandle NEXT;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      HANDLE = lookup.findVarHandle(TimerEvent.class, "handle", TimerHandle.class);
      NEXT = lookup.findVarHandle(TimerEvent.class, "next", TimerEvent.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}

/**
 * Thread that executes timer events at their scheduled times.
 */
final class TimerThread extends Thread {

  /**
   * The timer service whose events this thread executes.
   */
  final TimerWheel service;

  /**
   * The next tick sequence number that this timer thread will execute.
   */
  volatile long tick;

  /**
   * Constructs a new {@code TimerThread} that executes events
   * for the given timer {@code service}.
   */
  TimerThread(TimerWheel service) {
    this.service = service;
    this.tick = 0L;
    this.setDaemon(true);
  }

  /**
   * Parks the timer thread until the deadline of the target {@code tick}
   * is reached. Returns the total number of milliseconds waited, which
   * may be negative if the target deadline is in the past. Returns
   * {@code Long.MIN_VALUE} if the service was signaled to stop while
   * waiting for the target {@code tick}.
   */
  long waitForTick(final TimerWheel service, final long tick) {
    // Get the (now immutable) start time of the service.
    final long startTime = (long) TimerWheel.START_TIME.getOpaque(service);
    // Compute the service-elapsed time of the target tick.
    final long deadline = service.tickNanos * tick;
    // Capture the service-elapsed time of the first wait for the target tick.
    final long initialTime = service.nanoTime() - startTime;
    // Track the current service-elapsed time.
    long currentTime = initialTime;
    do {
      // Check for overflow of the current service-elapsed time.
      if (currentTime < 0L) {
        // Can't run for longer than about 292 years.
        throw new InternalError("elapsed time overflow");
      }
      // Calculate the number of milliseconds until the deadline
      // for the target tick, rounding up to the next millisecond.
      final long sleepMillis = ((deadline - currentTime) + 999999L) / 1000000L;
      // Check if the deadline for the target tick is in the future.
      if (sleepMillis > 0L) {
        // Park the timer thread for the number of milliseconds
        // until the deadline for the target tick.
        try {
          service.sleep(sleepMillis);
        } catch (InterruptedException cause) {
          // Interrupted while waiting for the target tick; re-check service status.
          final int status = (int) TimerWheel.STATUS.getOpaque(service);
          // Check if the service has exited the started state.
          if ((status & TimerWheel.STATE_MASK) != TimerWheel.STARTED_STATE) {
            // Return a sentinel value to signal that the timer thread should exit.
            return Long.MIN_VALUE;
          }
        }
        // Recompute the current service elapsed time.
        currentTime = service.nanoTime() - startTime;
      }
      // We've reached the deadline for the target tick;
      // recompute the current service elapsed time.
      currentTime = service.nanoTime() - startTime;
      // And return the total number of milliseconds we waited.
      return (currentTime - initialTime) / 1000000L;
    } while (true);
  }

  /**
   * Executes all timers scheduled for the target {@code tick}.
   */
  void executeTick(final TimerWheel service, final long tick) {
    // Compute the tick sequence number for the next revolution of the timer wheel.
    final long nextRevolution = tick + (long) service.tickCount;
    // Compute the index in the timer wheel of the target tick.
    final int bucketIndex = (int) (tick % (long) service.tickCount);

    // Get the event queue for the target bucket of the timer wheel.
    final TimerQueue queue = service.wheel[bucketIndex];
    // The first known scheduled event to keep in the queue.
    TimerEvent head = null;
    // The last known scheduled event to keep in the queue.
    TimerEvent prev = null;
    // The next enqueued event to process.
    TimerEvent next = queue.head;
    // The sentinel event that will be inserted at the end of the queue
    // to complete the execution of this tick.
    final TimerEvent sentinel = new TimerEvent(nextRevolution, nextRevolution, null);

    // Loop until no events scheduled for this tick remain in the queue.
    do {
      if (next.targetTick <= tick) {
        // The next event is scheduled for this tick; atomically fetch
        // and clear its timer handle to prevent concurrent cancellation,
        // ensuring a sequentially consistent total ordering of timer
        // executions and cancellations.
        final TimerHandle handle = (TimerHandle) TimerEvent.HANDLE.getAndSet(next, null);
        // Check if a timer handle was atomically acquired from the event.
        if (handle != null) {
          // Clear the event associated with the timer handle, if and only if
          // the handle has not been concurrently rescheduled; must happen
          // before executing to the timer.
          TimerHandle.EVENT.compareAndExchangeAcquire(handle, next, null);
          // Tell the service to execute the timer.
          service.runTimer(handle);
        }
      } else if (next.isScheduled()) {
        // The next event is scheduled for a future revolution of the timer wheel.
        if (prev != null) {
          // Re-insert the event after the last scheduled event kept
          // in the queue, bypassing any executed or cancelled events.
          TimerEvent.NEXT.setRelease(prev, next);
        } else {
          // The next event is the first event to keep in the queue.
          head = next;
        }
        // The next event is now the last known event to keep in the queue.
        prev = next;
      }

      // Check if the next event is the last in the queue.
      if (TimerEvent.NEXT.getOpaque(next) == null) {
        // Try to finish tick execution by appending a cancelled event to the
        // end of the queue whose insertTick is the next tick sequence number
        // that the timer thread will execute for this queue, thereby
        // preventing further scheduling of events for the current tick;
        // must happen before updating the foot of the queue.
        if (TimerEvent.NEXT.weakCompareAndSetAcquire(next, null, sentinel)) {
          // All events that will ever be scheduled for this tick have now been
          // cancelled or executed; update the foot of the queue to reference
          // the new sentinel event.
          TimerQueue.FOOT.setRelease(queue, sentinel);
          // Check if no events were kept in the queue.
          if (head == null) {
            // In which case the new foot is also the new head.
            head = sentinel;
          }
          // Update the head of the queue.
          queue.head = head;
          break;
        }
      }

      // Advance to the next event in the queue.
      next = (TimerEvent) TimerEvent.NEXT.getAcquire(next);
    } while (true);
  }

  @Override
  public void run() {
    final TimerWheel service = this.service;
    LogScope.reset();
    try {
      LogScope.push("timer");

      // Initialize the relative service start time.
      long startTime = service.nanoTime();
      if (startTime == 0L) {
        // Avoid clash with sentinel value that signifies an unstarted service.
        startTime = 1L;
      }
      // Initialize the service start time.
      TimerWheel.START_TIME.setOpaque(service, startTime);

      // Prepare to complete service startup.
      synchronized (service) {
        // Set the service status to started; must happen before notifying waiters.
        final int status = (int) TimerWheel.STATUS.compareAndExchangeAcquire(service, TimerWheel.STARTING_STATE, TimerWheel.STARTED_STATE);
        assert status == TimerWheel.STARTING_STATE;
        // Notify waiters of service startup completion.
        service.notifyAll();
      }

      // Invoke service introspection callback.
      service.didStartThread();

      // Loop while the service has not been stopped.
      do {
        final long tick = (long) TICK.getOpaque(this);
        // Wait for the service to reach the elapsed time of the next tick.
        final long waitedMillis = this.waitForTick(service, tick);
        // Check if we had a nominal wakeup.
        if (waitedMillis != Long.MIN_VALUE) {
          // Invoke the service's willTick introspection callback
          // with the tick number and a measure of timer latency.
          service.willTick(tick, waitedMillis);
          // Execute the timer tick.
          this.executeTick(service, tick);
          // Invoke the service's didTick introspection callback.
          service.didTick(tick);
          // Increment the tick sequence number.
          TICK.setOpaque(this, tick + 1L);
        }
        // Re-check service status.
        final int status = (int) TimerWheel.STATUS.getAcquire(service);
        // Check if the service has exited the started state.
        if ((status & TimerWheel.STATE_MASK) != TimerWheel.STARTED_STATE) {
          break;
        }
      } while (true);
    } catch (Throwable cause) {
      if (Result.isFatal(cause)) {
        throw cause;
      }
      service.log.fatal("timer thread failed", cause);
    } finally {
      synchronized (service) {
        // Set the service state to stopped.
        TimerWheel.STATUS.setRelease(service, TimerWheel.STOPPED_STATE);
        // Notify waiters of service shutdown completion.
        service.notifyAll();
      }
      // Invoke service introspection callback.
      service.didStopThread();
      LogScope.pop();
    }
  }

  /**
   * {@code VarHandle} for atomically accessing the {@link #tick} field.
   */
  static final VarHandle TICK;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      TICK = lookup.findVarHandle(TimerThread.class, "tick", Long.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
