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
import java.util.concurrent.CyclicBarrier;
import org.testng.TestException;
import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;

public class TestClockSpec {
  @Test
  public void scheduleAnImmediateTimer() {
    final TestClock clock = new TestClock(10, 512);
    final CountDownLatch fire = new CountDownLatch(1);
    try {
      clock.start();
      clock.setTimer(0L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(fire.getCount(), 1);
          fire.countDown();
        }
      });
      clock.await(fire);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void scheduleMultipleImmediateTimers() {
    final TestClock clock = new TestClock(10, 512);
    final CountDownLatch fire = new CountDownLatch(2);
    try {
      clock.start();
      clock.setTimer(0L, new AbstractTimer() {
        @Override
        public void runTimer() {
          fire.countDown();
        }
      });
      clock.setTimer(0L, new AbstractTimer() {
        @Override
        public void runTimer() {
          fire.countDown();
        }
      });
      clock.await(fire);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void scheduleTimersForOneTickInTheFuture() {
    final TestClock clock = new TestClock(10, 8);
    try {
      clock.start();
      for (int i = 0; i < 16; i += 1) {
        final CountDownLatch fire = new CountDownLatch(1);
        final long t0 = System.currentTimeMillis();
        clock.setTimer(100L, new AbstractTimer() {
          @Override
          public void runTimer() {
            final long dt = System.currentTimeMillis() - t0;
            assertTrue(dt >= 99L); // Disregard nanoTime skew between threads.
            assertTrue(fire.getCount() > 0);
            fire.countDown();
          }
        });
        clock.await(fire);
      }
    } finally {
      clock.stop();
    }
  }

  @Test
  public void scheduleTimersForOneRevolutionInTheFuture() {
    final TestClock clock = new TestClock(10, 4);
    try {
      clock.start();
      for (int i = 0; i < 4; i += 1) {
        final CountDownLatch fire = new CountDownLatch(1);
        final long t0 = System.currentTimeMillis();
        clock.setTimer(80L, new AbstractTimer() {
          @Override
          public void runTimer() {
            final long dt = System.currentTimeMillis() - t0;
            assertTrue(dt >= 79L); // Disregard nanoTime skew between threads.
            assertTrue(fire.getCount() > 0);
            fire.countDown();
          }
        });
        clock.await(fire);
      }
    } finally {
      clock.stop();
    }
  }

  @Test
  public void rescheduleATimerBeforeItFires() {
    final TestClock clock = new TestClock(10, 512);
    final CountDownLatch fire = new CountDownLatch(1);
    try {
      clock.start();
      final TimerRef timer = clock.setTimer(10L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(fire.getCount(), 1);
          fire.countDown();
        }
      });
      timer.reschedule(20L);
      clock.await(fire);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void rescheduleARunningTimer() {
    final TestClock clock = new TestClock(10, 512);
    final CountDownLatch fire = new CountDownLatch(2);
    try {
      clock.start();
      clock.setTimer(10L, new AbstractTimer() {
        private boolean rescheduled = false;
        @Override
        public void runTimer() {
          if (!rescheduled) {
            assertEquals(fire.getCount(), 2);
            rescheduled = true;
            reschedule(10L);
          } else {
            assertEquals(fire.getCount(), 1);
          }
          fire.countDown();
        }
      });
      clock.await(fire);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void concurrentlyScheduleTimers() {
    final int threadCount = 8;
    final int timerCount = 1000;
    final TestClock clock = new TestClock(1, 2);
    final CyclicBarrier barrier = new CyclicBarrier(threadCount);
    final CountDownLatch shutdown = new CountDownLatch(threadCount);
    try {
      clock.start();
      for (int i = 0; i < threadCount; i += 1) {
        final Thread thread = new Thread() {
          @Override
          public void run() {
            try {
              final CountDownLatch fire = new CountDownLatch(timerCount);
              barrier.await();
              for (int j = 0; j < timerCount; j += 1) {
                final int k = j;
                // A 1ms timer deadline will usually round up to 2ms, which equals
                // one full revolution of the clock.  By continually setting timers
                // for several clock revolutions, it becomes highly likely that
                // we will add a timer to a clock phase while the clock thread
                // concurrently executes the same phase.
                clock.setTimer(1L, new AbstractTimer() {
                  @Override
                  public void runTimer() {
                    assertEquals(timerCount - fire.getCount(), k);
                    fire.countDown();
                  }
                });
              }
              clock.await(fire, 5000);
              shutdown.countDown();
            } catch (Throwable error) {
              throw new TestException(error);
            }
          }
        };
        thread.start();
      }
      clock.await(shutdown, 5000);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void concurrentlyCancelTimers() {
    final int threadCount = 8;
    final int timerCount = 1000;
    final TestClock clock = new TestClock(1, 2);
    final CyclicBarrier barrier = new CyclicBarrier(threadCount);
    final CountDownLatch shutdown = new CountDownLatch(threadCount);
    try {
      clock.start();
      for (int i = 0; i < threadCount; i += 1) {
        final Thread thread = new Thread() {
          @Override
          public void run() {
            try {
              final CountDownLatch fire = new CountDownLatch(timerCount / 2);
              final CountDownLatch cancel = new CountDownLatch(timerCount / 2);
              barrier.await();
              for (int j = 0; j < timerCount; j += 1) {
                final int k = j;
                final TimerRef timer = clock.setTimer(10L, new AbstractTimer() {
                  @Override
                  public void runTimer() {
                    if (k % 2 == 0) {
                      assertEquals(timerCount / 2 - fire.getCount(), k / 2);
                      fire.countDown();
                    } else {
                      fail();
                    }
                  }
                  @Override
                  public void timerDidCancel() {
                    if (k % 2 != 0) {
                      assertEquals(timerCount / 2 - cancel.getCount(), k / 2);
                      cancel.countDown();
                    } else {
                      fail();
                    }
                  }
                });
                if (j % 2 == 1) {
                  timer.cancel();
                }
              }
              clock.await(fire, 5000);
              clock.await(cancel, 5000);
              shutdown.countDown();
            } catch (Throwable error) {
              throw new TestException(error);
            }
          }
        };
        thread.start();
      }
      clock.await(shutdown, 5000);
    } finally {
      clock.stop();
    }
  }

  @Test(groups = {"slow"})
  public void concurrentSchedulingLongevity() {
    final int threadCount = 8;
    final int timerCount = 10000000;
    final int batchSize = 1000;
    final TestClock clock = new TestClock(1, 2);
    final CyclicBarrier barrier = new CyclicBarrier(threadCount);
    final CountDownLatch shutdown = new CountDownLatch(threadCount);
    try {
      clock.start();
      for (int i = 0; i < threadCount; i += 1) {
        final int threadId = i;
        final Thread thread = new Thread() {
          @Override
          public void run() {
            try {
              for (int j = 0; j < timerCount;) {
                final CountDownLatch fire = new CountDownLatch(batchSize);
                barrier.await();
                for (int k = 0; k < batchSize; j += 1, k += 1) {
                  final int l = k;
                  clock.setTimer(1L, new AbstractTimer() {
                    @Override
                    public void runTimer() {
                      assertEquals(batchSize - fire.getCount(), l);
                      fire.countDown();
                    }
                  });
                }
                clock.await(fire, Integer.MAX_VALUE);
                if (j % 1000000 == 0) {
                  System.out.println("thread " + threadId + "; timers: " + j);
                }
              }
              shutdown.countDown();
            } catch (Throwable error) {
              throw new TestException(error);
            }
          }
        };
        thread.start();
      }
      clock.await(shutdown, Integer.MAX_VALUE);
    } finally {
      clock.stop();
    }
  }
}
