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

package swim.log;

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Severity;

@Public
@Since("5.0")
public class LogService implements LogHandler {

  final LogHandler handler;

  final LogEvent[] queue;

  int readIndex;

  int writeIndex;

  int dropCount;

  int status;

  final LogThread thread;

  public LogService(LogHandler handler, int queueLength) {
    if (queueLength < 2) {
      throw new IllegalArgumentException("invalid log event queue length: " + Integer.toString(queueLength));
    }

    // Round the queue length up to the next power of two.
    queueLength = queueLength - 1;
    queueLength |= queueLength >> 1;
    queueLength |= queueLength >> 2;
    queueLength |= queueLength >> 4;
    queueLength |= queueLength >> 8;
    queueLength |= queueLength >> 16;
    queueLength = queueLength + 1;

    // Initialize the underlying log handler.
    this.handler = handler;

    // Initialize the log event queue.
    this.queue = new LogEvent[queueLength];
    this.readIndex = 0;
    this.writeIndex = 0;
    this.dropCount = 0;

    // Initialize the service status.
    this.status = 0;

    // Initialize--but don't start--the log thread.
    this.thread = new LogThread(this);
    this.thread.setName("swim.log.service" + '-' + Log.uniqueId(this));
  }

  public final LogHandler handler() {
    return this.handler;
  }

  @Override
  public final Severity threshold() {
    return this.handler.threshold();
  }

  public final boolean start() {
    int status = (int) STATUS.getOpaque(this);
    boolean causedStart = false;
    boolean interrupted = false;
    do {
      if ((status & STATE_MASK) == STARTED_STATE) {
        // The service has already started.
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

  public final boolean stop() {
    int status = (int) STATUS.getOpaque(this);
    boolean causedStop = false;
    boolean interrupted = false;
    do {
      if ((status & STATE_MASK) == STOPPED_STATE) {
        // The service has already stopped.
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

  @Override
  public void publish(LogEvent event) {
    this.enqueue(event);
  }

  protected final boolean enqueue(LogEvent event) {
    this.start();
    // Try to enqueue the event into the MPSC log event queue.
    int writeIndex = (int) WRITE_INDEX.getOpaque(this);
    do {
      final int oldWriteIndex = writeIndex;
      final int newWriteIndex = (oldWriteIndex + 1) % this.queue.length;
      final int readIndex = (int) READ_INDEX.getAcquire(this);
      if (newWriteIndex == readIndex) {
        // The event queue appears to be full; count and drop the event.
        DROP_COUNT.getAndAddRelease(this, 1);
        return false;
      }
      writeIndex = (int) WRITE_INDEX.compareAndExchangeAcquire(this, oldWriteIndex, newWriteIndex);
      if (writeIndex != oldWriteIndex) {
        // CAS failed; try again.
        continue;
      }
      // Successfully acquired a slot in the event queue;
      // release the event into the queue.
      QUEUE.setRelease(this.queue, oldWriteIndex, event);
      // Notify the log thread of the new event.
      synchronized (this.thread) {
        this.thread.notifyAll();
      }
      return true;
    } while (true);
  }

  final @Nullable LogEvent dequeue() {
    // Try to dequeue an event from the MPSC log event queue.
    // Only the log thread is permitted to dequeue events.
    final int readIndex = (int) READ_INDEX.getOpaque(this);
    final int writeIndex = (int) WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The event queue is empty.
      return null;
    }

    do {
      // Try to atomically acquire and clear the event at the head of the queue.
      final LogEvent event = (LogEvent) QUEUE.getAndSetAcquire(this.queue, readIndex, null);
      if (event == null) {
        // The next event is being concurrently enqueue; spin and try again.
        Thread.onSpinWait();
        continue;
      }
      // Increment the read index to free up the dequeued event's old slot.
      READ_INDEX.setRelease(this, (readIndex + 1) % this.queue.length);
      return event;
    } while (true);
  }

  protected void await() throws InterruptedException {
    // Prepare to wait for another event.
    synchronized (this.thread) {
      // Ensure the service is still running before waiting.
      final int status = (int) STATUS.getOpaque(this);
      if ((status & STATE_MASK) == STARTED_STATE) {
        this.thread.wait(1000L);
      }
    }
  }

  @Override
  public final void flush() {
    int status = (int) STATUS.getOpaque(this);
    do {
      final int oldStatus = status;
      final int newStatus = oldStatus | FLUSH_REQUEST;
      status = (int) STATUS.compareAndExchangeRelease(this, oldStatus, newStatus);
      if (status != oldStatus) {
        // CAS failed; try again.
        continue;
      }
      if (oldStatus != newStatus) {
        synchronized (this.thread) {
          this.thread.notifyAll();
        }
      }
      break;
    } while (true);
  }

  @Override
  public final void close() {
    this.stop();
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
   * {@link #status} bit indicating a request to flush the log.
   */
  static final int FLUSH_REQUEST = 1 << STATE_BITS;

  /**
   * {@code VarHandle} for atomically accessing elements of a {@link LogEvent} array.
   */
  static final VarHandle QUEUE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #readIndex} field.
   */
  static final VarHandle READ_INDEX;

  /**
   * {@code VarHandle} for atomically accessing the {@link #writeIndex} field.
   */
  static final VarHandle WRITE_INDEX;

  /**
   * {@code VarHandle} for atomically accessing the {@link #dropCount} field.
   */
  static final VarHandle DROP_COUNT;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    QUEUE = MethodHandles.arrayElementVarHandle(LogEvent.class.arrayType());
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      READ_INDEX = lookup.findVarHandle(LogService.class, "readIndex", Integer.TYPE);
      WRITE_INDEX = lookup.findVarHandle(LogService.class, "writeIndex", Integer.TYPE);
      DROP_COUNT = lookup.findVarHandle(LogService.class, "dropCount", Integer.TYPE);
      STATUS = lookup.findVarHandle(LogService.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}

final class LogThread extends Thread {

  final LogService service;

  LogThread(LogService service) {
    this.setDaemon(true);
    this.service = service;
  }

  @Override
  public void run() {
    final LogService service = this.service;
    final LogHandler handler = service.handler;

    try {
      // Prepare to complete service startup.
      synchronized (service) {
        // Set the service status to started; must happen before notifying waiters.
        final int status = (int) LogService.STATUS.compareAndExchangeAcquire(service, LogService.STARTING_STATE, LogService.STARTED_STATE);
        assert status == LogService.STARTING_STATE;
        // Notify waiters of service startup completion.
        service.notifyAll();
      }

      // Loop while the service has not been stopped.
      do {
        // Try to dequeue an event.
        final LogEvent event = service.dequeue();
        if (event != null) {
          // Publish the dequeued event to the service handler.
          handler.publish(event);
          continue;
        }
        // Queue is empty; re-check service status.
        int status = (int) LogService.STATUS.getAcquire(service);
        do {
          // Check if a flush has been requested.
          if ((status & LogService.FLUSH_REQUEST) == 0) {
            // No flush requested.
            break;
          }
          // A flush has been requested.
          final int oldStatus = status;
          final int newStatus = oldStatus & ~LogService.FLUSH_REQUEST;
          // Clear the flush request flag.
          status = (int) LogService.STATUS.compareAndExchangeRelease(service, oldStatus, newStatus);
          if (status != oldStatus) {
            // CAS failed; try again.
            continue;
          }
          status = newStatus;
          // Flush the service handler.
          handler.flush();
          break;
        } while (true);
        // Check if the service has exited the started state.
        if ((status & LogService.STATE_MASK) != LogService.STARTED_STATE) {
          // The service is shutting down; terminate the thread.
          break;
        }
        // Wait for another event.
        try {
          service.await();
        } catch (InterruptedException cause) {
          // Don't terminate the thread until the queue has been drained.
        }
      } while (true);
    } finally {
      try {
        handler.close();
      } finally {
        synchronized (service) {
          // Set the service state to stopped.
          LogService.STATUS.setRelease(service, LogService.STOPPED_STATE);
          // Notify waiters of service shutdown completion.
          service.notifyAll();
        }
      }
    }
  }

}
