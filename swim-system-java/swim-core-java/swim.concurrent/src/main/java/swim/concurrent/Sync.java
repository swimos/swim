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
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;

/**
 * A {@link Cont}inuation whose completion can be synchronously awaited.  A
 * {@code Sync} continuation is used to await the completion of an asynchronous
 * operation.
 */
public class Sync<T> implements Cont<T>, ForkJoinPool.ManagedBlocker {
  /**
   * Atomic completion status of this {@code Sync} continuation.
   */
  volatile int status;

  /**
   * Completed result of this {@code Sync} continuation; either the bound value
   * of type {@code T}, or the trapped error of type {@code Throwable}.  The
   * type of {@code result} is decided by the flags of the {@code status} field.
   */
  volatile Object result;

  /**
   * Constructs a new {@code Sync} continuation that awaits a value of type
   * {@code T}.
   */
  public Sync() {
    // nop
  }

  @Override
  public boolean isReleasable() {
    return this.status != 0;
  }

  @Override
  public synchronized boolean block() throws InterruptedException {
    if (this.status == 0) {
      wait(TIMEOUT.get());
    }
    return true;
  }

  @Override
  public synchronized void bind(T value) {
    // Set the resulting value before updating the completion status.
    this.result = value;
    // Atomically set the status; linearization point for sync completion.
    STATUS.set(this, BIND);
    // Release all waiting threads.
    notifyAll();
  }

  @Override
  public synchronized void trap(Throwable error) {
    // Set the resulting error before updating the completion status.
    this.result = error;
    // Atomically set the status; linearization point for sync completion.
    STATUS.set(this, TRAP);
    // Release all waiting threads.
    notifyAll();
  }

  /**
   * Waits a maximum of {@code timeout} milliseconds for this {@code Sync}
   * continuation to complete.  Performs a managed block to avoid thread
   * starvation while waiting.
   *
   * @throws SyncException if the {@code timeout} milliseconds elapses and this
   *         {@code Sync} continuation still hasn't been completed.
   */
  @SuppressWarnings("unchecked")
  public T await(final long timeout) throws InterruptedException {
    // Capture the monotonic system time at which the await began.
    final long t0 = System.nanoTime();
    // The remaining number milliseconds to wait for continuation completion.
    long waitMillis = timeout;
    // Loop until the continuation has been completed, or the timeout has elapsed.
    do {
      // Check if the continuation is uncompleted.
      if (this.status == 0) {
        // Set the thread local timeout variable to preserve it through the
        // call to ForkJoinPool.managedBlock.
        TIMEOUT.set(timeout);
        // Perform a managed block so as not to starve the thread pool, if
        // we're running in one.
        ForkJoinPool.managedBlock(this);
      }
      // Recheck the status after waiting.
      if (this.status != 0) {
        // Non-zero status indicates that the continuation has completed.
        break;
      }
      // Check if we're performing a timed wait.
      if (timeout > 0L) {
        // Update the remaining number of milliseconds to wait.
        final long t1 = System.nanoTime();
        final long elapsedMillis = (t1 - t0) / 1000000L;
        waitMillis = timeout - elapsedMillis;
        // Check if the timeout period has elapsed.
        if (waitMillis <= 0L) {
          throw new SyncException("timed out");
        }
      }
    } while (true);

    // Load the continuation completion status.
    final int status = this.status;
    // Load the completed result.
    final Object result = this.result;
    if (status == BIND) {
      // Continuation completed with a value; return it.
      return (T) result;
    } else if (status == TRAP) {
      // Continuation failed with an exception; throw it.
      if (result instanceof Error) {
        // Throw unchecked Error.
        throw (Error) result;
      } else if (result instanceof RuntimeException) {
        // Throw unchecked RuntimeException.
        throw (RuntimeException) result;
      } else {
        // Wrap checked exception in an unchecked ContException.
        throw new ContException((Throwable) result);
      }
    } else {
      // Unreachable.
      throw new IllegalStateException();
    }
  }

  /**
   * Waits an unbounded amount of time for this {@code Sync} continuation to
   * complete.  Performs a managed block to avoid thread starvation while
   * waiting.
   */
  public T await() throws InterruptedException {
    return await(0L);
  }

  /**
   * {@link #status} value indicating the continuation completed with a value.
   */
  static final int BIND = 1;

  /**
   * {@link #status} value indicating the continuation failed with an exception.
   */
  static final int TRAP = 2;

  /**
   * Atomic {@link #status} field updater, used to linearize continuation completion.
   */
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<Sync<?>> STATUS =
      AtomicIntegerFieldUpdater.newUpdater((Class<Sync<?>>) (Class<?>) Sync.class, "status");

  /**
   * Thread-local variable used to pass the await timeout through calls to
   * {@code ForkJoinPool.managedBlock}.
   */
  static final ThreadLocal<Long> TIMEOUT = new ThreadLocal<Long>();
}
