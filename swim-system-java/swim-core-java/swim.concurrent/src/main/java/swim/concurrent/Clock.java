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

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;

/**
 * Hashed wheel timer {@link Schedule}.
 */
public class Clock implements Schedule {
  /**
   * Immutable array of {@link #tickCount} timer buckets, each containing a
   * lock-free queue of timer events to execute for a particular modulus of
   * clock ticks.
   */
  final ClockQueue[] dial;

  /**
   * Barrier used to sequence clock startup.
   */
  final CountDownLatch startLatch;

  /**
   * Barrier used to sequence clock shutdown.
   */
  final CountDownLatch stopLatch;

  /**
   * Thread that executes timer events at their scheduled times.
   */
  final ClockThread thread;

  /**
   * Time at which the clock started, in nanoseconds, with arbitrary origin.
   * Set exactly once when the clock thread starts.
   */
  volatile long startTime;

  /**
   * Number of nanoseconds between successive clock ticks.
   */
  final long tickNanos;

  /**
   * Number of ticks per clock revolution.
   */
  final int tickCount;

  /**
   * Atomic bit field with {@link #STARTED} and {@link #STOPPED} flags.
   */
  volatile int status;

  /**
   * Constructs a new {@code Clock} with a timer resolution of {@code
   * tickMillis} milliseconds, and a clock period of {@code tickCount} ticks
   * per revolution.
   */
  public Clock(int tickMillis, int tickCount) {
    // Initialize the number of nanoseconds between clock ticks.
    if (tickMillis <= 0) {
      throw new IllegalArgumentException(Long.toString(tickMillis));
    }
    this.tickNanos = (long) tickMillis * 1000000L;

    // Initialize the number of ticks per clock revolution.
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

    // Initialize the clock dial with one revolution worth of clock ticks.
    this.dial = new ClockQueue[tickCount];
    for (int i = 0; i < tickCount; i += 1) {
      this.dial[i] = new ClockQueue((long) i);
    }

    // Initialize the barrier used to sequence clock startup.
    this.startLatch = new CountDownLatch(1);

    // Initialize the barrier used to sequence clock shutdown.
    this.stopLatch = new CountDownLatch(1);

    // Initialize--but don't start--the clock thread.
    this.thread = new ClockThread(this);
  }

  /**
   * Constructs a new {@code Clock} with the timer resolution and clock period
   * specified by the given {@code clockDef}.
   */
  public Clock(ClockDef clockDef) {
    this(clockDef.tickMillis, clockDef.tickCount);
  }

  /**
   * Constructs a new {@code Clock} with a timer resolution of {@link
   * #TICK_MILLIS} milliseconds, and a clock period of {@link #TICK_COUNT}
   * ticks per revolution.
   */
  public Clock() {
    this(TICK_MILLIS, TICK_COUNT);
  }

  /**
   * Returns the tick sequence number of the lowest clock tick that has yet to
   * finish executing.
   */
  public final long tick() {
    return this.thread.tick;
  }

  /**
   * Ensures that this {@code Clock} is up and running, starting up the clock
   * thread if it has not yet been started.
   *
   * @throws ScheduleException if this {@code Clock} has been stopped.
   */
  public final void start() {
    do {
      final int oldStatus = STATUS.get(this);
      if ((oldStatus & STOPPED) == 0) {
        // Clock hasn't yet stopped; make sure it has started.
        if ((oldStatus & STARTED) == 0) {
          final int newStatus = oldStatus | STARTED;
          // Try to set the STARTED flag; linearization point for clock startup.
          if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
            // Initiate clock thread startup.
            willStart();
            this.thread.start();
            break;
          }
        } else {
          // Clock thread already started.
          break;
        }
      } else {
        throw new ScheduleException("Can't restart stopped clock");
      }
    } while (true);

    // Loop while the clock thread is not yet up and running.
    boolean interrupted = false;
    while (this.startLatch.getCount() != 0) {
      try {
        // Wait for clock thread startup to complete.
        this.startLatch.await();
      } catch (InterruptedException error) {
        interrupted = true;
      }
    }
    if (interrupted) {
      Thread.currentThread().interrupt();
    }
  }

  /**
   * Ensures that this {@code Clock} has been permanently stopped, shutting
   * down the clock thread, if it's currently running.  Upon return, this
   * {@code Clock} is guaranteed to be in the <em>stopped</em> state.
   */
  public final void stop() {
    boolean interrupted = false;
    do {
      final int oldStatus = STATUS.get(this);
      if ((oldStatus & STOPPED) == 0) {
        // Clock hasn't yet stopped; try to stop it.
        final int newStatus = oldStatus | STOPPED;
        // Try to set the STOPPED flag; linearization point for clock shutdown.
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          // Loop while the clock thread is still running.
          while (this.thread.isAlive()) {
            // Interrupt the clock thread so it will wakeup and die.
            this.thread.interrupt();
            try {
              // Wait for the clock thread to exit.
              this.thread.join(100);
            } catch (InterruptedException error) {
              interrupted = true;
            }
          }
        }
      } else {
        // Clock thread already stopped.
        break;
      }
    } while (true);

    // Loop while the clock thread is still running.
    while (this.stopLatch.getCount() != 0) {
      try {
        // Wait for clock thread shutdown to complete.
        this.stopLatch.await();
      } catch (InterruptedException e) {
        interrupted = true;
      }
    }
    if (interrupted) {
      Thread.currentThread().interrupt();
    }
  }

  @Override
  public TimerRef timer(TimerFunction timer) {
    // Ensure that the clock has started.
    start();

    // Create the context that binds the timer to this clock.
    final ClockTimer context = new ClockTimer(this, timer);
    if (timer instanceof Timer) {
      ((Timer) timer).setTimerContext(context);
    }

    // Return the timer context.
    return context;
  }

  @Override
  public TimerRef setTimer(long millis, TimerFunction timer) {
    if (millis < 0L) {
      throw new TimerException("negative timeout: " + Long.toString(millis));
    }

    // Ensure that the clock has started.
    start();

    // Create the context that binds the timer to this clock.
    final ClockTimer context = new ClockTimer(this, timer);
    if (timer instanceof Timer) {
      ((Timer) timer).setTimerContext(context);
    }

    // Schedule the timer for execution.
    schedule(millis, context);

    // Return the timer context.
    return context;
  }

  /**
   * Schedules a bound timer {@code context} for execution after {@code millis}
   * milliseconds has elapsed.
   */
  final void schedule(long millis, ClockTimer context) {
    // Invoke timer scheduling introspection callbacks.
    timerWillSchedule(context.timer, millis);
    if (context.timer instanceof Timer) {
      ((Timer) context.timer).timerWillSchedule(millis);
    }

    // Convert the timeout to nanoseconds.
    final long nanos = millis * 1000000L;
    // Compute the deadline for the timer in nanoseconds since clock start.
    final long deadline = Math.max(0L, nanoTime() + nanos - this.startTime);
    // Divide the deadline by the tick interval to get the tick sequence number
    // at which to fire the timer, rounding up to the next tick.
    long targetTick = (deadline + (this.tickNanos - 1L)) / this.tickNanos;
    // Take the modulus of the target tick with respect to to the number of
    // ticks per clock revolution, yielding the index in the dial at which to
    // insert the event.
    int targetHand = (int) (targetTick % (long) this.tickCount);

    // Create a timer event to insert into the clock.
    final ClockEvent newEvent = new ClockEvent(0L, targetTick, context, context.timer);
    // Atomically get the current timer event, and replace it with the
    // to-be-scheduled event; linearization point for timer un-cancellation.
    final ClockEvent oldEvent = ClockTimer.EVENT.getAndSet(context, newEvent);
    // Check if the timer had a previously scheduled event.
    if (oldEvent != null) {
      // Remove the timer from the previously scheduled event;
      // linearization point for timer cancellation.
      oldEvent.cancel();
    }

    // Get the event queue for the target hand of the clock.
    ClockQueue queue = this.dial[targetHand];
    // Capture the current foot of the queue.
    ClockEvent foot = queue.foot;
    // Search for the last event of in the queue, starting with foot.
    ClockEvent prev = foot;
    // Loop until the event is inserted into the first queue that will execute
    // after the timer deadline.
    do {
      // Load the next event after the currently referenced last event.
      final ClockEvent next = prev.next;
      if (next == null) {
        // prev is the last event in the queue.
        if (targetTick >= prev.insertTick) {
          // prev was inserted before the target tick, indicating that the
          // timer thread hasn't finished executing the target tick yet.
          // prev.insertTick is the next tick sequence number that the clock
          // thread will execute for the queue; set event.insertTick to match.
          newEvent.insertTick = prev.insertTick;
          // Try to insert the new event to the end of the queue;
          // linearization point for timer scheduling.
          if (ClockEvent.NEXT.compareAndSet(prev, null, newEvent)) {
            // Only update the foot reference if it lags at least two events
            // behind the last event in the queue.
            if (prev != foot) {
              // Try to update the foot reference; ok if this fails.
              ClockQueue.FOOT.compareAndSet(queue, foot, newEvent);
            }
            break;
          }
          // Lost insertion race to another thread; try again.
        } else {
          // The clock thread is currently executing, or has already executed,
          // the target tick; try the next hand of the clock.
          targetTick += 1L;
          targetHand = (int) (targetTick % (long) this.tickCount);
          queue = this.dial[targetHand];
          foot = queue.foot;
          prev = foot;
        }
      } else {
        // Jump to the new foot, if the previously loaded foot lags at least two
        // events behind the prev event; otherwise advance to the next event.
        final ClockEvent newFoot = queue.foot;
        if (foot != newFoot) {
          foot = newFoot;
          prev = foot;
        } else {
          prev = next;
        }
      }
    } while (true);
  }

  /**
   * Lifecycle callback invoked before the clock thread starts.
   */
  protected void willStart() {
    // stub
  }

  /**
   * Lifecycle callback invoked after the clock thread starts.
   */
  protected void didStart() {
    // stub
  }

  /**
   * Introspection callback invoked after each tick of the clock.  {@code tick}
   * is the sequence number of the tick that was executed; {@code waitedMillis}
   * is the number of milliseconds the clock thread slept before executing the
   * tick.  If {@code waitedMillis} is negative, then the clock thread didn't
   * start executing the tick until {@code -waitedMillis} milliseconds after
   * the scheduled tick deadline.
   */
  protected void didTick(long tick, long waitedMillis) {
    // stub
  }

  /**
   * Lifecycle callback invoked before the clock thread stops.
   */
  protected void willStop() {
    // stub
  }

  /**
   * Lifecycle callback invoked after the clock thread stops.
   */
  protected void didStop() {
    // stub
  }

  /**
   * Lifecycle callback invoked if the timer thread throws a fatal {@code
   * error}.  The clock thread will stop after invoking {@code didFail}.
   */
  protected void didFail(Throwable error) {
    error.printStackTrace();
  }

  /**
   * Introspection callback invoked before a {@code timer} is scheduled for
   * execution with a delay of {@code millis} milliseconds.
   */
  protected void timerWillSchedule(TimerFunction timer, long millis) {
    // stub
  }

  /**
   * Introspection callback invoked after a {@code timer} has been explicitly
   * cancelled; not invoked when a timer is implicitly cancelled, such as when
   * rescheduling an already scheduled timer.
   */
  protected void timerDidCancel(TimerFunction timer) {
    // stub
  }

  /**
   * Introspection callback invoked before a {@code timer} is executed.
   */
  protected void timerWillRun(TimerFunction timer) {
    // stub
  }

  /**
   * Invokes {@code timer.runTimer()}, or arranges for the asynchronous
   * execution of the provided {@code runnable}, which will itself invoke
   * {@code timer.runTimer()}.
   */
  protected void runTimer(TimerFunction timer, Runnable runnable) {
    timer.runTimer();
  }

  /**
   * Introspection callback invoked after a {@code timer} executes nominally.
   */
  protected void timerDidRun(TimerFunction timer) {
    // stub
  }

  /**
   * Introspection callback invoked after a {@code timer} execution fails by
   * throwing an {@code error}.
   */
  protected void timerDidFail(TimerFunction timer, Throwable error) {
    // stub
  }

  /**
   * Returns the current time, in nanoseconds, with arbitrary origin.
   * Used by the clock thread to determine the current time.  Defaults
   * to {@link System#nanoTime()}.  Can be overridden to substitute an
   * alternative time source.
   */
  protected long nanoTime() {
    return System.nanoTime();
  }

  /**
   * Parks the current thread for the specified number of {@code millis}.
   * Used by the clock thread to wait for the next clock tick.  Defaults
   * to {@link Thread#sleep(long)}.  Can be overridden to substitute an
   * alternative wait mechanism.
   */
  protected void sleep(long millis) throws InterruptedException {
    Thread.sleep(millis);
  }

  /**
   * Default number of milliseconds between clock ticks, used by the no-arg
   * {@link #Clock()} constructor.  Defaults to the value of the {@code
   * swim.clock.tick.millis} system property, if defined; otherwise defaults to
   * {@code 100} milliseconds.
   */
  public static final int TICK_MILLIS;

  /**
   * Default number of ticks per clock revolution, used by the no-arg {@link
   * #Clock()} constructor.  Defaults to the value of the {@code
   * swim.clock.tick.count} system property, if defined; otherwise defaults to
   * {@code 512} clock ticks per revolution.
   */
  public static final int TICK_COUNT;

  /**
   * Atomic {@link #status} bit flag indicating that the clock has started, and
   * is currently running.
   */
  static final int STARTED = 1 << 0;

  /**
   * Atomic {@link #status} bit flag indicating that the clock had previously
   * started, but is now permanently stopped.
   */
  static final int STOPPED = 1 << 1;

  /**
   * Atomic {@link #status} field updater, used to linearize clock startup and
   * shutdown.
   */
  static final AtomicIntegerFieldUpdater<Clock> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(Clock.class, "status");

  static {
    // Initializes the default number of milliseconds between clock ticks.
    int tickMillis;
    try {
      tickMillis = Integer.parseInt(System.getProperty("swim.clock.tick.millis"));
    } catch (NumberFormatException e) {
      tickMillis = 100;
    }
    TICK_MILLIS = tickMillis;

    // Initialize the default number of ticks per clock revolution.
    int tickCount;
    try {
      tickCount = Integer.parseInt(System.getProperty("swim.clock.tick.count"));
    } catch (NumberFormatException e) {
      tickCount = 512;
    }
    TICK_COUNT = tickCount;
  }
}

/**
 * Context that binds a {@code TimerFunction} to a {@code Clock}, and manages
 * the scheduling of at most one live {@code ClockEvent} at a time.
 */
final class ClockTimer implements TimerContext {
  /**
   * {@code Clock} to which the {@code timer} is bound.
   */
  final Clock clock;

  /**
   * {@code TimerFunction} to invoke when a scheduled event fires.
   */
  final TimerFunction timer;

  /**
   * Atomic reference to the currently scheduled event that will execute the
   * {@code timer} when fired; {@code null} when the {@code timer} is not
   * currently scheduled.
   */
  volatile ClockEvent event;

  /**
   * Constructs a new {@code ClockTimer} that binds the {@code timer} to the
   * {@code clock}.
   */
  ClockTimer(Clock clock, TimerFunction timer) {
    this.clock = clock;
    this.timer = timer;
  }

  @Override
  public Schedule schedule() {
    return this.clock;
  }

  @Override
  public boolean isScheduled() {
    final ClockEvent event = EVENT.get(this);
    return event != null && event.isScheduled();
  }

  @Override
  public void reschedule(long millis) {
    if (millis < 0L) {
      throw new TimerException("negative timeout: " + Long.toString(millis));
    }
    this.clock.schedule(millis, this);
  }

  @Override
  public boolean cancel() {
    // Atomically get the current timer event, and replace it with null.
    final ClockEvent event = EVENT.getAndSet(this, null);
    // Check if the timer has a previously scheduled event.
    if (event != null) {
      // Remove the timer from the previously scheduled timer event;
      // linearization point for timer cancellation.
      final TimerFunction timer = event.cancel();
      // Check if the timer event hadn't yet been fired or cancelled.
      if (timer != null) {
        // Invoke timer cancellation introspection callbacks.
        if (timer instanceof Timer) {
          ((Timer) timer).timerDidCancel();
        }
        clock.timerDidCancel(timer);
        return true;
      }
    }
    return false;
  }

  /**
   * Atomic {@link #event} field updater, used to linearize cancellation and
   * rescheduling of the {@code timer}.
   */
  static final AtomicReferenceFieldUpdater<ClockTimer, ClockEvent> EVENT =
      AtomicReferenceFieldUpdater.newUpdater(ClockTimer.class, ClockEvent.class, "event");
}

/**
 * Lock-free, multiple publisher, single consumer queue of linked {@code
 * ClockEvent} items.
 */
final class ClockQueue {
  /**
   * First {@code ClockEvent} in the queue, from which all live events in the
   * queue are reachable; always non-{@code null}.  Only the clock thread is
   * permitted to advance the head of the queue.
   */
  volatile ClockEvent head;

  /**
   * Atomic reference from which the last {@code ClockEvent} in the queue can
   * be reached in constant time; always non-{@code null}.
   */
  volatile ClockEvent foot;

  /**
   * Constructs a new {@code ClockQueue} that will next execute the {@code
   * insertTick} sequence number.
   */
  ClockQueue(long insertTick) {
    this.head = new ClockEvent(insertTick, insertTick, null, null);
    this.foot = head;
  }

  /**
   * Atomic {@link #foot} field updater, used to optimize event insertion.
   */
  static final AtomicReferenceFieldUpdater<ClockQueue, ClockEvent> FOOT =
      AtomicReferenceFieldUpdater.newUpdater(ClockQueue.class, ClockEvent.class, "foot");
}

/**
 * Linked {@code ClockQueue} item holding a {@code TimerFunction} to execute.
 */
final class ClockEvent implements Runnable {
  /**
   * Tick sequence number of the next tick that the clock thread will execute
   * at the time this {@code ClockEvent} was inserted into the queue.  {@code
   * insertTick} is non-decreasing over successive queued events, and the
   * {@code insertTick} of the last event in the queue always represents the
   * very next tick that the clock thread will execute.
   */
  long insertTick;

  /**
   * Tick sequence number during which to fire this event.
   */
  long targetTick;

  /**
   * {@code ClockTimer} on behalf of whom this {@code ClockEvent} is scheduled,
   * or {@code null} if this is a placeholder event.
   */
  final ClockTimer context;

  /**
   * Atomic reference to the {@code TimerFunction} to invoke when firing this
   * event; {@code null} when this event has been cancelled.
   */
  volatile TimerFunction timer;

  /**
   * Next {@code ClockEvent} in the linked queue; {@code null} if this is the
   * last event in the queue.
   */
  volatile ClockEvent next;

  /**
   * Constructs a new {@code ClockEvent} that will fire the {@code timer}
   * at the {@code targetTick} sequence number, and will be inserted into the
   * queue during the {@code insertTick} sequence number.
   */
  ClockEvent(long insertTick, long targetTick, ClockTimer context, TimerFunction timer) {
    this.insertTick = insertTick;
    this.targetTick = targetTick;
    this.context = context;
    this.timer = timer;
  }

  /**
   * Returns {@code true} if the {@link #timer} is non-{@code null}, indicating
   * that this {@code ClockEvent} is scheduled for execution.
   */
  boolean isScheduled() {
    return TIMER.get(this) != null;
  }

  /**
   * Atomically gets the scheduled {@link #timer}, and replaces it with {@code
   * null}, thereby preventing future execution, or concurrent cancellation.
   */
  TimerFunction cancel() {
    // Atomically get the scheduled timer, and replace it with null;
    // linearization point for timer execution and cancellation.
    return TIMER.getAndSet(this, null);
  }

  /**
   * Invokes the timer function of the associated timer context.
   */
  @Override
  public void run() {
    this.context.timer.runTimer();
  }

  /**
   * Atomic {@link #timer} field updater, used to linearize event cancellation.
   */
  static final AtomicReferenceFieldUpdater<ClockEvent, TimerFunction> TIMER =
      AtomicReferenceFieldUpdater.newUpdater(ClockEvent.class, TimerFunction.class, "timer");

  /**
   * Atomic {@link #next} field updater, used to linearize event scheduling.
   */
  static final AtomicReferenceFieldUpdater<ClockEvent, ClockEvent> NEXT =
      AtomicReferenceFieldUpdater.newUpdater(ClockEvent.class, ClockEvent.class, "next");
}

/**
 * Thread of execution that fires clock events at the appropriate times.
 */
final class ClockThread extends Thread {
  /**
   * {@code Clock} whose events this {@code ClockThread} fires.
   */
  final Clock clock;

  /**
   * Next tick sequence number that this {@code ClockThread} will execute.
   */
  long tick;

  /**
   * Constructs a new {@code ClockThread} that fires events for {@code clock}.
   */
  ClockThread(Clock clock) {
    setName("SwimClock" + THREAD_COUNT.getAndIncrement());
    setDaemon(true);
    this.clock = clock;
  }

  @Override
  public void run() {
    final Clock clock = this.clock;

    try {
      // Initialize the relative clock start time.
      long startTime = clock.nanoTime();
      if (startTime == 0L) {
        // Avoid clash with sentinel value that signifies an unstarted clock.
        startTime = 1L;
      }
      clock.startTime = startTime;

      // Linearization point for clock start.
      clock.startLatch.countDown();
      clock.didStart();

      // Loop while the clock has not been stopped.
      do {
        final long tick = this.tick;
        // Wait for the clock to reach the elapsed time of the next tick.
        final long waitedMillis = waitForTick(clock, tick);
        // Check if we had a nominal wakeup.
        if (waitedMillis != Long.MIN_VALUE) {
          // Execute the clock tick.
          executeTick(clock, tick);
          // Invoke the clock tick introspection callback, with a measure of the
          // clock latency.
          clock.didTick(tick, waitedMillis);
          // Increment the tick sequence number.
          this.tick = tick + 1L;
        }
      } while ((Clock.STATUS.get(clock) & Clock.STOPPED) == 0);

      clock.willStop();
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        // Report internal clock error.
        clock.didFail(error);
      } else {
        // Rethrow fatal error.
        throw error;
      }
    } finally {
      // Force the clock into the stopped state.
      Clock.STATUS.set(clock, Clock.STOPPED);
      // Linearization point for clock stop.
      clock.stopLatch.countDown();
      clock.didStop();
    }
  }

  /**
   * Parks the clock thread until the {@code clock} time has reached the
   * elapsed time of the taregt {@code tick}.  Returns the total number of
   * milliseconds waited; the returned wait time can be negative if it's
   * taking longer than the clock's tick interval to execute timers.
   * Returns {@code Long.MIN_VALUE} if the clock was stopped while waiting
   * for the target {@code tick}.
   */
  static long waitForTick(final Clock clock, final long tick) {
    // The clock elapsed time of the target tick.
    final long deadline = clock.tickNanos * tick;
    // The clock elapsed time of the first wait for the target tick.
    final long initialTime = clock.nanoTime() - clock.startTime;
    // The current clock elapsed time.
    long currentTime = initialTime;
    do {
      // Check for elapsed time overflow.
      if (currentTime < 0L) {
        // Can't run for longer than about 292 years.
        throw new InternalError("Clock elapsed time overflow");
      }
      // Calculate the number of milliseconds until the deadline for the target
      // tick, rounding up to the next millisecond.
      final long sleepMillis = ((deadline - currentTime) + 999999L) / 1000000L;
      // Check if the deadline for the target tick is in the future.
      if (sleepMillis > 0L) {
        // Park the timer thread for the number of milliseconds until the
        // deadline for the target tick.
        try {
          clock.sleep(sleepMillis);
        } catch (InterruptedException e) {
          // Interrupted while waiting for the target tick; check if the clock
          // has been stopped.
          if ((Clock.STATUS.get(clock) & Clock.STOPPED) != 0) {
            // Return a sentinel value to signal that the clock stopped.
            return Long.MIN_VALUE;
          }
        }
        // Recompute the current clock elapsed time.
        currentTime = clock.nanoTime() - clock.startTime;
      } else {
        // We've reached the deadline for the target tick; recompute the
        // current clock elapsed time.
        currentTime = clock.nanoTime() - clock.startTime;
        // Compute the total number of milliseconds we waited.
        return (currentTime - initialTime) / 1000000L;
      }
    } while (true);
  }

  /**
   * Executes all {@code clock} timers set to fire at the target {@code tick}.
   */
  static void executeTick(final Clock clock, final long tick) {
    // Compute the tick sequence number for the next revolution of the clock.
    final long nextTick = tick + (long) clock.tickCount;
    // Compute the index in the clock dial of the target clock tick.
    final int hand = (int) (tick % (long) clock.tickCount);

    // Get the event queue for the target hand of the clock dial.
    final ClockQueue queue = clock.dial[hand];
    // The first known still scheduled event to keep in the queue.
    ClockEvent head = null;
    // The last known still scheduled event to keep in the queue.
    ClockEvent prev = null;
    // The next queued event to process.
    ClockEvent next = queue.head;
    // The sentinel event that will be inserted at the end of the queue to
    // complete the execution of this tick.
    final ClockEvent nextFoot = new ClockEvent(nextTick, nextTick, null, null);
    // Loop until no events scheduled for this tick remain in the queue.
    do {
      if (next.targetTick <= tick) {
        // The next event is scheduled for this tick; remove its timer.
        final TimerFunction timer = next.cancel();
        // Clear the event from the associated timer context.
        if (next.context != null) {
          ClockTimer.EVENT.compareAndSet(next.context, next, null);
        }
        if (timer != null) {
          // The timer wasn't cancelled; fire the event.
          try {
            clock.timerWillRun(timer);
            clock.runTimer(timer, next);
            clock.timerDidRun(timer);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              // The timer failed with a non-fatal error.
              clock.timerDidFail(timer, error);
            } else {
              // The timer failed with a fatal error.
              throw error;
            }
          }
        }
      } else if (next.isScheduled()) {
        // The next event is scheduled for a future revolution of the clock.
        if (prev != null) {
          // Insert the next event after the last kept event in the queue,
          // bypassing any fired or cancelled events.
          prev.next = next;
        } else {
          // The next event is the first event to keep in the queue.
          head = next;
        }
        // The next event is now the last known event to keep in the queue.
        prev = next;
      }
      // Check if the next event is the last in the queue.
      if (next.next == null) {
        // Try to finish tick execution by appending a cancelled event to the
        // end of the queue, whose insertTick is the next tick sequence number
        // that the clock thread will execute for this queue, preventing
        // further scheduling of events for the current tick.
        if (ClockEvent.NEXT.compareAndSet(next, null, nextFoot)) {
          // All events that will ever be scheduled for this tick have now been
          // cancelled or fired; update the foot of the queue to reference the
          // new foot event.
          ClockQueue.FOOT.set(queue, nextFoot);
          // Check if no events were kept in the queue.
          if (head == null) {
            // In which case the new foot is also the new head.
            head = nextFoot;
          }
          // Update the head of the queue.
          queue.head = head;
          break;
        }
      }
      // Advance to the next event in the queue.
      next = next.next;
    } while (true);
  }

  /**
   * Total number of clock threads that have ever been instantiated.  Used to
   * uniquely name clock threads.
   */
  static final AtomicInteger THREAD_COUNT = new AtomicInteger(0);
}
