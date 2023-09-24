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

import java.util.concurrent.ForkJoinWorkerThread;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;

/**
 * A {@link SchedulerService} that executes {@linkplain TaskFunction tasks}
 * and {@linkplain TimerFunction timers} on a {@code ForkJoinPool}.
 * {@code ThreadScheduler} is thread safe.
 */
@Public
@Since("5.0")
public class ThreadScheduler extends ThreadPool implements SchedulerService {

  @Nullable TimerService timerService;

  public ThreadScheduler(int parallelism) {
    super(parallelism);
  }

  public ThreadScheduler() {
    this(Runtime.getRuntime().availableProcessors());
  }

  /**
   * Returns a default {@code TimerService} to be used when one has not been
   * explicitly configured.
   */
  protected TimerService createTimerService() {
    return new TimerWheel();
  }

  @Override
  public TimerService timerService() {
    // Get the associated timer service.
    TimerService timerService = this.timerService;
    // Lazily instantiate a default timer service, if not yet configured.
    if (timerService == null) {
      // If the timer service is null, then the scheduler hasn't started yet,
      // so configuration is still possible.
      this.tryConfigure(() -> {
        // Re-check the timer service now that we hold the config lock
        // to ensure that it wasn't concurrently assigned.
        if (this.timerService == null) {
          // Lazily instantiate and assign a default timer service.
          this.timerService = this.createTimerService();
        }
      });
      // Reload the timer service assigned by the configuration function.
      // The timer service should never be null once configured.
      timerService = Assume.nonNull(this.timerService);
    }
    // Return the configured timer service.
    return timerService;
  }

  @Override
  public void setTimerService(TimerService timerService) {
    final boolean configured = this.tryTimerService(timerService);
    if (!configured) {
      throw new IllegalStateException("can't configure task service once started");
    }
  }

  @Override
  public boolean tryTimerService(TimerService timerService) {
    return this.tryConfigure(() -> {
      this.timerService = timerService;
    });
  }

  @Override
  public TimerRef bindTimer(Runnable timer) {
    // Start the scheduler so that the associated timer service
    // is guaranteed to be initialized and immutable.
    this.start();
    // Bind the timer function to the timer service.
    final TimerRef handle = Assume.nonNull(this.timerService).bindTimer(timer);
    // Configure the timer task to execute on the thread pool.
    this.bindTask(handle);
    // Return the unscheduled timer handle.
    return handle;
  }

  @Override
  public TimerRef setTimer(long delay, Runnable timer) {
    // Start the scheduler so that the associated timer service
    // is guaranteed to be initialized and immutable.
    this.start();
    // Bind the timer function with the timer service.
    final TimerRef handle = Assume.nonNull(this.timerService).setTimer(delay, timer);
    // Configure the timer task to execute on the thread pool.
    this.bindTask(handle);
    // Return the scheduled timer handle.
    return handle;
  }

  @Override
  protected void willStart() {
    super.willStart();
    // Ensure that the scheduler has an associated timer service.
    if (this.timerService == null) {
      // Lazily instantiate and assign a default timer service.
      this.timerService = this.createTimerService();
    }
  }

  @Override
  protected void didStart() {
    // Start the associated timer service.
    Assume.nonNull(this.timerService).start();
    super.didStart();
  }

  @Override
  protected void didStartWorker(ForkJoinWorkerThread worker) {
    // Initialize the thread local scheduler.
    Scheduler.setCurrent(this);
    super.didStartWorker(worker);
  }

  @Override
  protected void willStop() {
    super.willStop();
    // Stop the associated timer service.
    Assume.nonNull(this.timerService).stop();
  }

}
