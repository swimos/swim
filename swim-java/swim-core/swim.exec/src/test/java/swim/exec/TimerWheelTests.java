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

import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.platform.commons.JUnitException;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public class TimerWheelTests {

  @Test
  public void scheduleAnImmediateTimer() {
    final TestTimerWheel scheduler = new TestTimerWheel(10, 512);
    final CountDownLatch runLatch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.setTimer(0L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1, runLatch.getCount());
          runLatch.countDown();
        }
      });
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void scheduleMultipleImmediateTimers() {
    final TestTimerWheel scheduler = new TestTimerWheel(10, 512);
    final CountDownLatch runLatch = new CountDownLatch(2);
    try {
      scheduler.start();
      scheduler.setTimer(0L, new AbstractTimer() {
        @Override
        public void run() {
          runLatch.countDown();
        }
      });
      scheduler.setTimer(0L, new AbstractTimer() {
        @Override
        public void run() {
          runLatch.countDown();
        }
      });
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void scheduleTimersForOneTickInTheFuture() {
    final TestTimerWheel scheduler = new TestTimerWheel(10, 8);
    try {
      scheduler.start();
      for (int i = 0; i < 16; i += 1) {
        final CountDownLatch runLatch = new CountDownLatch(1);
        final long t0 = System.currentTimeMillis();
        scheduler.setTimer(100L, new AbstractTimer() {
          @Override
          public void run() {
            final long dt = System.currentTimeMillis() - t0;
            assertTrue(dt >= 99L); // Disregard nanoTime skew between threads.
            assertTrue(runLatch.getCount() > 0);
            runLatch.countDown();
          }
        });
        scheduler.await(runLatch);
      }
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void scheduleTimersForOneRevolutionInTheFuture() {
    final TestTimerWheel scheduler = new TestTimerWheel(10, 4);
    try {
      scheduler.start();
      for (int i = 0; i < 4; i += 1) {
        final CountDownLatch runLatch = new CountDownLatch(1);
        final long t0 = System.currentTimeMillis();
        scheduler.setTimer(80L, new AbstractTimer() {
          @Override
          public void run() {
            final long dt = System.currentTimeMillis() - t0;
            assertTrue(dt >= 79L); // Disregard nanoTime skew between threads.
            assertTrue(runLatch.getCount() > 0);
            runLatch.countDown();
          }
        });
        scheduler.await(runLatch);
      }
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void rescheduleATimerBeforeItFires() {
    final TestTimerWheel scheduler = new TestTimerWheel(10, 512);
    final CountDownLatch runLatch = new CountDownLatch(1);
    try {
      scheduler.start();
      final TimerRef timer = scheduler.setTimer(10L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1, runLatch.getCount());
          runLatch.countDown();
        }
      });
      timer.debounce(20L);
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void rescheduleARunningTimer() {
    final TestTimerWheel scheduler = new TestTimerWheel(10, 512);
    final CountDownLatch runLatch = new CountDownLatch(2);
    try {
      scheduler.start();
      scheduler.setTimer(10L, new AbstractTimer() {
        private boolean rescheduled = false;

        @Override
        public void run() {
          if (!this.rescheduled) {
            assertEquals(2, runLatch.getCount());
            this.rescheduled = true;
            this.debounce(10L);
          } else {
            assertEquals(1, runLatch.getCount());
          }
          runLatch.countDown();
        }
      });
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void concurrentlyScheduleTimers() {
    final int threadCount = Runtime.getRuntime().availableProcessors();
    final int timerCount = 10000;
    final TestTimerWheel scheduler = new TestTimerWheel(1, 2);
    final CyclicBarrier barrier = new CyclicBarrier(threadCount);
    final CountDownLatch shutdownLatch = new CountDownLatch(threadCount);
    try {
      scheduler.start();
      for (int i = 0; i < threadCount; i += 1) {
        final Thread thread = new Thread() {
          @Override
          public void run() {
            try {
              final CountDownLatch runLatch = new CountDownLatch(timerCount);
              barrier.await();
              for (int j = 0; j < timerCount; j += 1) {
                final int k = j;
                // A 1ms timer deadline will usually round up to 2ms,
                // which equals one full revolution of the timer wheel.
                // By continually setting timers for several timer wheel
                // revolutions, it becomes highly likely that we will add
                // a timer to a timer wheel bucket while the timer thread
                // concurrently executes the same bucket.
                scheduler.setTimer(1L, new AbstractTimer() {
                  @Override
                  public void run() {
                    assertEquals(k, timerCount - runLatch.getCount());
                    runLatch.countDown();
                  }
                });
              }
              scheduler.await(runLatch, 5000);
              shutdownLatch.countDown();
            } catch (BrokenBarrierException | InterruptedException cause) {
              throw new JUnitException("timer error", cause);
            }
          }
        };
        thread.start();
      }
      scheduler.await(shutdownLatch, 5000);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void concurrentlyCancelTimers() {
    final int threadCount = Runtime.getRuntime().availableProcessors();
    final int timerCount = 10000;
    final TestTimerWheel scheduler = new TestTimerWheel(1, 2);
    final CyclicBarrier barrier = new CyclicBarrier(threadCount);
    final CountDownLatch shutdownLatch = new CountDownLatch(threadCount);
    try {
      scheduler.start();
      for (int i = 0; i < threadCount; i += 1) {
        final Thread thread = new Thread() {
          @Override
          public void run() {
            try {
              final CountDownLatch runLatch = new CountDownLatch(timerCount / 2);
              final CountDownLatch cancelLatch = new CountDownLatch(timerCount / 2);
              barrier.await();
              for (int j = 0; j < timerCount; j += 1) {
                final int k = j;
                final TimerRef timer = scheduler.setTimer(10L, new AbstractTimer() {
                  @Override
                  public void run() {
                    if (k % 2 == 0) {
                      assertEquals(k / 2, timerCount / 2 - runLatch.getCount());
                      runLatch.countDown();
                    } else {
                      fail();
                    }
                  }

                  @Override
                  public void didCancel() {
                    if (k % 2 != 0) {
                      assertEquals(k / 2, timerCount / 2 - cancelLatch.getCount());
                      cancelLatch.countDown();
                    } else {
                      fail();
                    }
                  }
                });
                if (j % 2 == 1) {
                  timer.cancel();
                }
              }
              scheduler.await(runLatch, 5000);
              scheduler.await(cancelLatch, 5000);
              shutdownLatch.countDown();
            } catch (BrokenBarrierException | InterruptedException cause) {
              throw new JUnitException("timer error", cause);
            }
          }
        };
        thread.start();
      }
      scheduler.await(shutdownLatch, 5000);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  @Tag("slow")
  public void concurrentSchedulingLongevity() {
    final int threadCount = Runtime.getRuntime().availableProcessors();
    final int timerCount = 10000000;
    final int batchSize = 1000;
    final TestTimerWheel scheduler = new TestTimerWheel(1, 2);
    final CyclicBarrier barrier = new CyclicBarrier(threadCount);
    final CountDownLatch shutdownLatch = new CountDownLatch(threadCount);
    try {
      scheduler.start();
      for (int i = 0; i < threadCount; i += 1) {
        final int threadId = i;
        final Thread thread = new Thread() {
          @Override
          public void run() {
            try {
              int j = 0;
              while (j < timerCount) {
                final CountDownLatch runLatch = new CountDownLatch(batchSize);
                barrier.await();
                for (int k = 0; k < batchSize; j += 1, k += 1) {
                  final int l = k;
                  scheduler.setTimer(1L, new AbstractTimer() {
                    @Override
                    public void run() {
                      assertEquals(l, batchSize - runLatch.getCount());
                      runLatch.countDown();
                    }
                  });
                }
                scheduler.await(runLatch, Integer.MAX_VALUE);
                if (j % 1000000 == 0) {
                  System.out.println("thread " + threadId + "; timers: " + j);
                }
              }
              shutdownLatch.countDown();
            } catch (BrokenBarrierException | InterruptedException cause) {
              throw new JUnitException("timer error", cause);
            }
          }
        };
        thread.start();
      }
      scheduler.await(shutdownLatch, Integer.MAX_VALUE);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  @Tag("benchmark")
  public void benchmarkTimers() throws InterruptedException {
    final int threadCount = Runtime.getRuntime().availableProcessors();
    final int timerCount = 1000000;
    final int iterations = 10;
    long adt1 = 0L;
    long arate1 = 0L;
    long adt2 = 0L;
    long arate2 = 0L;
    for (int k = 0; k < iterations; k += 1) {
      final TimerWheel scheduler = new TimerWheel(10, 512);
      final AtomicInteger scheduleCount = new AtomicInteger(0);
      final CountDownLatch runLatch = new CountDownLatch(timerCount);
      final CountDownLatch exitLatch = new CountDownLatch(threadCount);
      final CyclicBarrier barrier = new CyclicBarrier(threadCount);
      final AtomicLong t0 = new AtomicLong();
      final AtomicLong t1 = new AtomicLong();
      for (int i = 0; i < threadCount; i += 1) {
        new Thread() {
          @Override
          public void run() {
            boolean interrupted = false;
            try {
              barrier.await();
              scheduler.start();
              t0.compareAndSet(0L, System.currentTimeMillis());
              do {
                final int count = scheduleCount.getAndIncrement();
                if (count < timerCount) {
                  scheduler.setTimer(0L, new AbstractTimer() {
                    @Override
                    public void run() {
                      runLatch.countDown();
                    }
                  });
                } else {
                  if (count == timerCount) {
                    t1.set(System.currentTimeMillis());
                  }
                  runLatch.await();
                  break;
                }
              } while (true);
              barrier.await();
            } catch (InterruptedException cause) {
              interrupted = true;
            } catch (BrokenBarrierException cause) {
              throw new AssertionError(cause);
            } finally {
              scheduler.stop();
              exitLatch.countDown();
            }
            if (interrupted) {
              this.interrupt();
            }
          }
        }.start();
      }
      exitLatch.await();
      final long t2 = System.currentTimeMillis();
      final long dt1 = t1.get() - t0.get();
      final long rate1 = (1000L * timerCount) / dt1;
      System.out.println("Scheduled " + timerCount + " timers in " + dt1 + "ms (" + rate1 + "/s)");
      final long dt2 = t2 - t0.get();
      final long rate2 = (1000L * timerCount) / dt2;
      System.out.println("Executed " + timerCount + " timers in " + dt2 + "ms (" + rate2 + "/s)");
      adt1 += dt1;
      arate1 += rate1;
      adt2 += dt2;
      arate2 += rate2;
    }
    adt1 /= iterations;
    arate1 /= iterations;
    adt2 /= iterations;
    arate2 /= iterations;
    System.out.println();
    System.out.println("Scheduled " + timerCount + " timers every " + adt1 + "ms (" + arate1 + "/s) on average from " + threadCount + " threads over " + iterations + " iterations");
    System.out.println("Executed " + timerCount + " timers every " + adt2 + "ms (" + arate2 + "/s) on average from " + threadCount + " threads over " + iterations + " iterations");
  }

}
