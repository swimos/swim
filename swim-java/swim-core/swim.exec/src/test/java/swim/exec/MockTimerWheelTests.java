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

import java.util.concurrent.CountDownLatch;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public class MockTimerWheelTests {

  @Test
  public void scheduleAnImmediateTimer() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch runLatch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.halfTick();
      scheduler.setTimer(0L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          runLatch.countDown();
        }
      });
      scheduler.halfTick();
      scheduler.tick(1);
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void scheduleMultipleImmediateTimers() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch runLatch = new CountDownLatch(2);
    try {
      scheduler.start();
      scheduler.halfTick();
      scheduler.setTimer(0L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          assertEquals(2, runLatch.getCount());
          runLatch.countDown();
        }
      });
      scheduler.setTimer(0L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          assertEquals(1, runLatch.getCount());
          runLatch.countDown();
        }
      });
      scheduler.halfTick();
      scheduler.tick(1);
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void scheduleATimerForShorterThanOneTick() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch runLatch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.setTimer(90L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          runLatch.countDown();
        }
      });
      scheduler.tick(1);
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void scheduleATimerForExactlyOneTick() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch runLatch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.setTimer(100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          runLatch.countDown();
        }
      });
      scheduler.tick(1);
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void scheduleATimerForLongerThanOneTick() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch runLatch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.setTimer(110L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(2L, scheduler.currentTick());
          assertEquals(1, runLatch.getCount());
          runLatch.countDown();
        }
      });
      scheduler.tick(2);
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void scheduleMultipleTimersForSequentialTicks() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch run1Latch = new CountDownLatch(1);
    final CountDownLatch run2Latch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.setTimer(100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          assertEquals(1, run1Latch.getCount());
          run1Latch.countDown();
        }
      });
      scheduler.setTimer(200L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(2L, scheduler.currentTick());
          assertEquals(1, run2Latch.getCount());
          run2Latch.countDown();
        }
      });

      scheduler.tick(1);
      scheduler.await(run1Latch);
      assertEquals(1, run2Latch.getCount());

      scheduler.tick(1);
      scheduler.await(run2Latch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void scheduleATimerForTheNextRevolution() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch runLatch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.setTimer(512L * 100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(512L, scheduler.currentTick());
          assertEquals(1, runLatch.getCount());
          runLatch.countDown();
        }
      });

      scheduler.tick(511);
      assertEquals(1, runLatch.getCount());

      scheduler.tick(1);
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void scheduleLaterTimerAfterSoonerTimerForSameTickOfDifferentRevolutions() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch run1Latch = new CountDownLatch(1);
    final CountDownLatch run2Latch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.setTimer(100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          assertEquals(1, run1Latch.getCount());
          run1Latch.countDown();
        }
      });
      scheduler.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(513L, scheduler.currentTick());
          assertEquals(1, run2Latch.getCount());
          run2Latch.countDown();
        }
      });

      scheduler.tick(1);
      scheduler.await(run1Latch);
      assertEquals(1, run2Latch.getCount());

      scheduler.tick(511);
      assertEquals(1, run2Latch.getCount());

      scheduler.tick(1);
      scheduler.await(run2Latch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void scheduleSoonerTimerAfterLaterTimerForSameTickOfDifferentRevolutions() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch run1Latch = new CountDownLatch(1);
    final CountDownLatch run2Latch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(513L, scheduler.currentTick());
          assertEquals(1, run1Latch.getCount());
          run1Latch.countDown();
        }
      });
      scheduler.setTimer(100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          assertEquals(1, run2Latch.getCount());
          run2Latch.countDown();
        }
      });

      scheduler.tick(1);
      scheduler.await(run2Latch);
      assertEquals(1, run1Latch.getCount());

      scheduler.tick(511);
      assertEquals(1, run1Latch.getCount());

      scheduler.tick(1);
      scheduler.await(run1Latch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void scheduleTimersForSameTickOfSequentialRevolutions() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch run1Latch = new CountDownLatch(1);
    final CountDownLatch run2Latch = new CountDownLatch(1);
    final CountDownLatch run3Latch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(513L, scheduler.currentTick());
          assertEquals(1, run1Latch.getCount());
          run1Latch.countDown();
        }
      });
      scheduler.setTimer(100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          assertEquals(1, run2Latch.getCount());
          run2Latch.countDown();
        }
      });
      scheduler.setTimer(1025L * 100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1025L, scheduler.currentTick());
          assertEquals(1, run3Latch.getCount());
          run3Latch.countDown();
        }
      });

      scheduler.tick(1);
      scheduler.await(run2Latch);
      assertEquals(1, run1Latch.getCount());
      assertEquals(1, run3Latch.getCount());

      scheduler.tick(511);
      assertEquals(1, run1Latch.getCount());
      assertEquals(1, run3Latch.getCount());

      scheduler.tick(1);
      scheduler.await(run1Latch);
      assertEquals(1, run3Latch.getCount());

      scheduler.tick(511);
      assertEquals(1, run3Latch.getCount());

      scheduler.tick(1);
      scheduler.await(run3Latch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void scheduleATimerForPastTime() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch runLatch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.tick(10);
      scheduler.halfTick();
      scheduler.nanos -= 400000000L;
      scheduler.setTimer(90L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(11L, scheduler.currentTick());
          assertEquals(1, runLatch.getCount());
          runLatch.countDown();
        }
      });
      scheduler.nanos += 400000000L;
      scheduler.halfTick();
      scheduler.tick(1);
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void rescheduleATimerBeforeItFires() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch runLatch = new CountDownLatch(1);
    try {
      scheduler.start();
      final TimerRef timer = scheduler.setTimer(100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(2L, scheduler.currentTick());
          assertEquals(1, runLatch.getCount());
          runLatch.countDown();
        }
      });
      timer.debounce(200L);

      scheduler.tick(1);
      assertEquals(1, runLatch.getCount());

      scheduler.tick(1);
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void rescheduleARunningTimer() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch run1Latch = new CountDownLatch(1);
    final CountDownLatch run2Latch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.setTimer(100L, new AbstractTimer() {
        private boolean rescheduled = false;

        @Override
        public void run() {
          if (!this.rescheduled) {
            assertEquals(1L, scheduler.currentTick());
            assertEquals(1, run1Latch.getCount());
            assertEquals(1, run2Latch.getCount());
            run1Latch.countDown();
            this.rescheduled = true;
            this.debounce(100L);
          } else {
            assertEquals(2L, scheduler.currentTick());
            assertEquals(0, run1Latch.getCount());
            assertEquals(1, run2Latch.getCount());
            run2Latch.countDown();
          }
        }
      });

      scheduler.tick(1);
      scheduler.await(run1Latch);
      assertEquals(1, run2Latch.getCount());

      scheduler.tick(1);
      scheduler.await(run2Latch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void cancelATimerBeforeItFires() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch cancelLatch = new CountDownLatch(1);
    try {
      scheduler.start();
      final TimerRef timer = scheduler.setTimer(50L, new AbstractTimer() {
        @Override
        public void run() {
          fail();
        }

        @Override
        public void didCancel() {
          assertEquals(1, cancelLatch.getCount());
          cancelLatch.countDown();
        }
      });
      assertTrue(timer.isScheduled());
      timer.cancel();

      scheduler.tick(1);
      scheduler.await(cancelLatch);
      assertFalse(timer.isScheduled());

      scheduler.tick(1);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void cancelFirstOfTwoScheduledTimersForTheSameTick() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch cancel1Latch = new CountDownLatch(1);
    final CountDownLatch run2Latch = new CountDownLatch(1);
    try {
      scheduler.start();
      final TimerRef timer1 = scheduler.setTimer(60L, new AbstractTimer() {
        @Override
        public void run() {
          fail();
        }

        @Override
        public void didCancel() {
          assertEquals(1, cancel1Latch.getCount());
          cancel1Latch.countDown();
        }
      });
      scheduler.setTimer(40L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          assertEquals(1, run2Latch.getCount());
          run2Latch.countDown();
        }
      });
      assertTrue(timer1.isScheduled());
      timer1.cancel();
      assertFalse(timer1.isScheduled());

      scheduler.tick(1);
      scheduler.await(cancel1Latch);
      scheduler.await(run2Latch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void cancelLastOfTwoScheduledTimersForTheSameTick() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch run1Latch = new CountDownLatch(1);
    final CountDownLatch cancel2Latch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.setTimer(60L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          assertEquals(1, run1Latch.getCount());
          run1Latch.countDown();
        }
      });
      final TimerRef timer2 = scheduler.setTimer(40L, new AbstractTimer() {
        @Override
        public void run() {
          fail();
        }

        @Override
        public void didCancel() {
          assertEquals(1, cancel2Latch.getCount());
          cancel2Latch.countDown();
        }
      });
      assertTrue(timer2.isScheduled());
      timer2.cancel();
      assertFalse(timer2.isScheduled());

      scheduler.tick(1);
      scheduler.await(run1Latch);
      scheduler.await(cancel2Latch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void cancelFirstScheduledAndSoonerOfTwoTimersForSameTickOfDifferentRevolutions() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch cancel1Latch = new CountDownLatch(1);
    final CountDownLatch run2Latch = new CountDownLatch(1);
    try {
      scheduler.start();
      final TimerRef timer1 = scheduler.setTimer(100L, new AbstractTimer() {
        @Override
        public void run() {
          fail();
        }

        @Override
        public void didCancel() {
          assertEquals(1, cancel1Latch.getCount());
          cancel1Latch.countDown();
        }
      });
      scheduler.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(513L, scheduler.currentTick());
          assertEquals(1, run2Latch.getCount());
          run2Latch.countDown();
        }
      });
      timer1.cancel();

      scheduler.tick(1);
      scheduler.await(cancel1Latch);

      scheduler.tick(512);
      scheduler.await(run2Latch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void cancelLastScheduledAndSoonerOfTwoTimersForSameTickOfDifferentRevolutions() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch run1Latch = new CountDownLatch(1);
    final CountDownLatch cancel2Latch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(513L, scheduler.currentTick());
          assertEquals(1, run1Latch.getCount());
          run1Latch.countDown();
        }
      });
      final TimerRef timer2 = scheduler.setTimer(100L, new AbstractTimer() {
        @Override
        public void run() {
          fail();
        }

        @Override
        public void didCancel() {
          assertEquals(1, cancel2Latch.getCount());
          cancel2Latch.countDown();
        }
      });
      timer2.cancel();

      scheduler.tick(1);
      scheduler.await(cancel2Latch);

      scheduler.tick(512);
      scheduler.await(run1Latch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void cancelFirstScheduledAndLaterOfTwoTimersForSameTickOfDifferentRevolutions() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch cancel1Latch = new CountDownLatch(1);
    final CountDownLatch run2Latch = new CountDownLatch(1);
    try {
      scheduler.start();
      final TimerRef timer1 = scheduler.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void run() {
          fail();
        }

        @Override
        public void didCancel() {
          assertEquals(1, cancel1Latch.getCount());
          cancel1Latch.countDown();
        }
      });
      scheduler.setTimer(100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          assertEquals(1, run2Latch.getCount());
          run2Latch.countDown();
        }
      });
      timer1.cancel();

      scheduler.tick(1);
      scheduler.await(run2Latch);

      scheduler.tick(512);
      scheduler.await(cancel1Latch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void cancelLastScheduledAndLaterOfTwoTimersForSameTickOfDifferentRevolutions() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch run1Latch = new CountDownLatch(1);
    final CountDownLatch cancel2Latch = new CountDownLatch(1);
    try {
      scheduler.start();
      scheduler.setTimer(100L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          assertEquals(1, run1Latch.getCount());
          run1Latch.countDown();
        }
      });
      final TimerRef timer2 = scheduler.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void run() {
          fail();
        }

        @Override
        public void didCancel() {
          assertEquals(1, cancel2Latch.getCount());
          cancel2Latch.countDown();
        }
      });
      timer2.cancel();

      scheduler.tick(1);
      scheduler.await(run1Latch);

      scheduler.tick(512);
      scheduler.await(cancel2Latch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void invokeTimerTaskCallbacks() {
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512);
    final CountDownLatch willScheduleLatch = new CountDownLatch(1);
    final CountDownLatch didCancelLatch = new CountDownLatch(1);
    try {
      scheduler.start();
      final TimerRef timer = scheduler.setTimer(50L, new AbstractTimer() {
        @Override
        public void run() {
          fail();
        }

        @Override
        public void willSchedule(long millis) {
          assertEquals(1, willScheduleLatch.getCount());
          assertEquals(50L, millis);
          willScheduleLatch.countDown();
        }

        @Override
        public void didCancel() {
          assertEquals(1, didCancelLatch.getCount());
          didCancelLatch.countDown();
        }
      });
      scheduler.await(willScheduleLatch);
      assertTrue(timer.isScheduled());

      timer.cancel();
      assertFalse(timer.isScheduled());

      scheduler.tick(1);
      scheduler.await(didCancelLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void reportTimerErrors() {
    final CountDownLatch didAbortLatch = new CountDownLatch(1);
    final RuntimeException error = new RuntimeException("fail");
    final Timer problem = new AbstractTimer() {
      @Override
      public void run() {
        throw error;
      }
    };
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512) {
      @Override
      protected void didAbortTimer(TimerContext handle, Throwable cause) {
        assertEquals(1, didAbortLatch.getCount());
        assertEquals(problem, handle.timer());
        assertEquals(error, cause);
        didAbortLatch.countDown();
      }
    };
    try {
      scheduler.start();
      scheduler.setTimer(0L, problem);

      scheduler.tick(1);
      scheduler.await(didAbortLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void continueRunningAfterTimerError() {
    final CountDownLatch runLatch = new CountDownLatch(3);
    final CountDownLatch didAbortLatch = new CountDownLatch(1);
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512) {
      @Override
      protected void didAbortTimer(TimerContext handle, Throwable cause) {
        assertEquals(1, didAbortLatch.getCount());
        didAbortLatch.countDown();
      }
    };
    try {
      scheduler.start();
      scheduler.halfTick();
      scheduler.setTimer(0L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          assertEquals(3, runLatch.getCount());
          assertEquals(1, didAbortLatch.getCount());
          runLatch.countDown();
        }
      });
      scheduler.setTimer(0L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          assertEquals(2, runLatch.getCount());
          assertEquals(1, didAbortLatch.getCount());
          runLatch.countDown();
          throw new RuntimeException();
        }
      });
      scheduler.setTimer(0L, new AbstractTimer() {
        @Override
        public void run() {
          assertEquals(1L, scheduler.currentTick());
          assertEquals(1, runLatch.getCount());
          assertEquals(0, didAbortLatch.getCount());
          runLatch.countDown();
        }
      });
      scheduler.halfTick();
      scheduler.tick(1);
      scheduler.await(runLatch);
      scheduler.await(didAbortLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void invokeIntrospectionCallbacks() {
    final CountDownLatch startLatch = new CountDownLatch(2);
    final CountDownLatch stopLatch = new CountDownLatch(2);
    final CountDownLatch didTickLatch = new CountDownLatch(4);
    final CountDownLatch willScheduleTimerLatch = new CountDownLatch(3);
    final CountDownLatch didCancelTimerLatch = new CountDownLatch(1);
    final CountDownLatch willRunTimerLatch = new CountDownLatch(2);
    final CountDownLatch didRunTimerLatch = new CountDownLatch(1);
    final CountDownLatch didAbortTimerLatch = new CountDownLatch(1);
    final MockTimerWheel scheduler = new MockTimerWheel(100, 512) {
      @Override
      protected void willStart() {
        assertEquals(2, startLatch.getCount());
        startLatch.countDown();
      }

      @Override
      protected void didStart() {
        assertEquals(1, startLatch.getCount());
        startLatch.countDown();
      }

      @Override
      protected void willStop() {
        assertEquals(2, stopLatch.getCount());
        stopLatch.countDown();
      }

      @Override
      protected void didStop() {
        assertEquals(1, stopLatch.getCount());
        stopLatch.countDown();
      }

      @Override
      protected void didTick(long tick) {
        assertTrue(didTickLatch.getCount() > 0);
        didTickLatch.countDown();
      }

      @Override
      protected void willScheduleTimer(long millis, TimerContext handle) {
        assertTrue(willScheduleTimerLatch.getCount() > 0);
        willScheduleTimerLatch.countDown();
      }

      @Override
      protected void didCancelTimer(TimerContext handle) {
        assertTrue(didCancelTimerLatch.getCount() > 0);
        didCancelTimerLatch.countDown();
      }

      @Override
      protected void willRunTimer(TimerContext handle) {
        assertTrue(willRunTimerLatch.getCount() > 0);
        willRunTimerLatch.countDown();
      }

      @Override
      protected void didRunTimer(TimerContext handle) {
        assertTrue(didRunTimerLatch.getCount() > 0);
        didRunTimerLatch.countDown();
      }

      @Override
      protected void didAbortTimer(TimerContext handle, Throwable exception) {
        assertEquals(1, didAbortTimerLatch.getCount());
        didAbortTimerLatch.countDown();
      }
    };
    try {
      scheduler.start();
      scheduler.await(startLatch);

      scheduler.setTimer(0L, new AbstractTimer() {
        @Override
        public void run() {
        }
      });
      scheduler.tick(1);
      final TimerRef timer2 = scheduler.setTimer(0L, new AbstractTimer() {
        @Override
        public void run() {
        }
      });
      timer2.cancel();
      scheduler.tick(1);
      scheduler.await(didCancelTimerLatch);

      scheduler.setTimer(0L, new AbstractTimer() {
        @Override
        public void run() {
          throw new RuntimeException("fail");
        }
      });
      scheduler.await(willScheduleTimerLatch);
      scheduler.tick(1);
      scheduler.await(willRunTimerLatch);
      scheduler.await(didTickLatch);
      scheduler.await(didRunTimerLatch);
      scheduler.await(didAbortTimerLatch);
    } finally {
      scheduler.stop();
      scheduler.await(stopLatch);
    }
  }

}
