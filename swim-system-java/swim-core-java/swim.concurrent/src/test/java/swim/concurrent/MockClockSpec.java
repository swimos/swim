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
import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;

public class MockClockSpec {
  @Test
  public void scheduleAnImmediateTimer() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire = new CountDownLatch(1);
    try {
      clock.start();
      clock.halfTick();
      clock.setTimer(0L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          fire.countDown();
        }
      });
      clock.halfTick();
      clock.tick(1);
      clock.await(fire);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void scheduleMultipleImmediateTimers() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire = new CountDownLatch(2);
    try {
      clock.start();
      clock.halfTick();
      clock.setTimer(0L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          assertEquals(fire.getCount(), 2);
          fire.countDown();
        }
      });
      clock.setTimer(0L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          assertEquals(fire.getCount(), 1);
          fire.countDown();
        }
      });
      clock.halfTick();
      clock.tick(1);
      clock.await(fire);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void scheduleATimerForShorterThanOneTick() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire = new CountDownLatch(1);
    try {
      clock.start();
      clock.setTimer(90L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          fire.countDown();
        }
      });
      clock.tick(1);
      clock.await(fire);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void scheduleATimerForExactlyOneTick() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire = new CountDownLatch(1);
    try {
      clock.start();
      clock.setTimer(100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          fire.countDown();
        }
      });
      clock.tick(1);
      clock.await(fire);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void scheduleATimerForLongerThanOneTick() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire = new CountDownLatch(1);
    try {
      clock.start();
      clock.setTimer(110L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 2L);
          assertEquals(fire.getCount(), 1);
          fire.countDown();
        }
      });
      clock.tick(2);
      clock.await(fire);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void scheduleMultipleTimersForSequentialTicks() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire1 = new CountDownLatch(1);
    final CountDownLatch fire2 = new CountDownLatch(1);
    try {
      clock.start();
      clock.setTimer(100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          assertEquals(fire1.getCount(), 1);
          fire1.countDown();
        }
      });
      clock.setTimer(200L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 2L);
          assertEquals(fire2.getCount(), 1);
          fire2.countDown();
        }
      });

      clock.tick(1);
      clock.await(fire1);
      assertEquals(fire2.getCount(), 1);

      clock.tick(1);
      clock.await(fire2);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void scheduleATimerForTheNextRevolution() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire = new CountDownLatch(1);
    try {
      clock.start();
      clock.setTimer(512L * 100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 512L);
          assertEquals(fire.getCount(), 1);
          fire.countDown();
        }
      });

      clock.tick(511);
      assertEquals(fire.getCount(), 1);

      clock.tick(1);
      clock.await(fire);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void scheduleLaterTimerAfterSoonerTimerForSameTickOfDifferentRevolutions() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire1 = new CountDownLatch(1);
    final CountDownLatch fire2 = new CountDownLatch(1);
    try {
      clock.start();
      clock.setTimer(100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          assertEquals(fire1.getCount(), 1);
          fire1.countDown();
        }
      });
      clock.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 513L);
          assertEquals(fire2.getCount(), 1);
          fire2.countDown();
        }
      });

      clock.tick(1);
      clock.await(fire1);
      assertEquals(fire2.getCount(), 1);

      clock.tick(511);
      assertEquals(fire2.getCount(), 1);

      clock.tick(1);
      clock.await(fire2);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void scheduleSoonerTimerAfterLaterTimerForSameTickOfDifferentRevolutions() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire1 = new CountDownLatch(1);
    final CountDownLatch fire2 = new CountDownLatch(1);
    try {
      clock.start();
      clock.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 513L);
          assertEquals(fire1.getCount(), 1);
          fire1.countDown();
        }
      });
      clock.setTimer(100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          assertEquals(fire2.getCount(), 1);
          fire2.countDown();
        }
      });

      clock.tick(1);
      clock.await(fire2);
      assertEquals(fire1.getCount(), 1);

      clock.tick(511);
      assertEquals(fire1.getCount(), 1);

      clock.tick(1);
      clock.await(fire1);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void scheduleTimersForSameTickOfSequentialRevolutions() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire1 = new CountDownLatch(1);
    final CountDownLatch fire2 = new CountDownLatch(1);
    final CountDownLatch fire3 = new CountDownLatch(1);
    try {
      clock.start();
      clock.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 513L);
          assertEquals(fire1.getCount(), 1);
          fire1.countDown();
        }
      });
      clock.setTimer(100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          assertEquals(fire2.getCount(), 1);
          fire2.countDown();
        }
      });
      clock.setTimer(1025L * 100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1025L);
          assertEquals(fire3.getCount(), 1);
          fire3.countDown();
        }
      });

      clock.tick(1);
      clock.await(fire2);
      assertEquals(fire1.getCount(), 1);
      assertEquals(fire3.getCount(), 1);

      clock.tick(511);
      assertEquals(fire1.getCount(), 1);
      assertEquals(fire3.getCount(), 1);

      clock.tick(1);
      clock.await(fire1);
      assertEquals(fire3.getCount(), 1);

      clock.tick(511);
      assertEquals(fire3.getCount(), 1);

      clock.tick(1);
      clock.await(fire3);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void scheduleATimerForPastTime() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire = new CountDownLatch(1);
    try {
      clock.start();
      clock.tick(10);
      clock.halfTick();
      clock.nanos -= 400000000L;
      clock.setTimer(90L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 11L);
          assertEquals(fire.getCount(), 1);
          fire.countDown();
        }
      });
      clock.nanos += 400000000L;
      clock.halfTick();
      clock.tick(1);
      clock.await(fire);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void rescheduleATimerBeforeItFires() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire = new CountDownLatch(1);
    try {
      clock.start();
      final TimerRef timer = clock.setTimer(100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 2L);
          assertEquals(fire.getCount(), 1);
          fire.countDown();
        }
      });
      timer.reschedule(200L);

      clock.tick(1);
      assertEquals(fire.getCount(), 1);

      clock.tick(1);
      clock.await(fire);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void rescheduleARunningTimer() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire1 = new CountDownLatch(1);
    final CountDownLatch fire2 = new CountDownLatch(1);
    try {
      clock.start();
      clock.setTimer(100L, new AbstractTimer() {
        private boolean rescheduled = false;
        @Override
        public void runTimer() {
          if (!rescheduled) {
            assertEquals(clock.tick(), 1L);
            assertEquals(fire1.getCount(), 1);
            assertEquals(fire2.getCount(), 1);
            fire1.countDown();
            rescheduled = true;
            reschedule(100L);
          } else {
            assertEquals(clock.tick(), 2L);
            assertEquals(fire1.getCount(), 0);
            assertEquals(fire2.getCount(), 1);
            fire2.countDown();
          }
        }
      });

      clock.tick(1);
      clock.await(fire1);
      assertEquals(fire2.getCount(), 1);

      clock.tick(1);
      clock.await(fire2);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void cancelATimerBeforeItFires() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch cancel = new CountDownLatch(1);
    try {
      clock.start();
      final TimerRef timer = clock.setTimer(50L, new AbstractTimer() {
        @Override
        public void runTimer() {
          fail();
        }
        @Override
        public void timerDidCancel() {
          assertEquals(cancel.getCount(), 1);
          cancel.countDown();
        }
      });
      assertTrue(timer.isScheduled());
      timer.cancel();

      clock.tick(1);
      clock.await(cancel);
      assertFalse(timer.isScheduled());

      clock.tick(1);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void cancelFirstOfTwoScheduledTimersForTheSameTick() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch cancel1 = new CountDownLatch(1);
    final CountDownLatch fire2 = new CountDownLatch(1);
    try {
      clock.start();
      final TimerRef timer1 = clock.setTimer(60L, new AbstractTimer() {
        @Override
        public void runTimer() {
          fail();
        }
        @Override
        public void timerDidCancel() {
          assertEquals(cancel1.getCount(), 1);
          cancel1.countDown();
        }
      });
      clock.setTimer(40L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          assertEquals(fire2.getCount(), 1);
          fire2.countDown();
        }
      });
      assertTrue(timer1.isScheduled());
      timer1.cancel();
      assertFalse(timer1.isScheduled());

      clock.tick(1);
      clock.await(cancel1);
      clock.await(fire2);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void cancelLastOfTwoScheduledTimersForTheSameTick() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire1 = new CountDownLatch(1);
    final CountDownLatch cancel2 = new CountDownLatch(1);
    try {
      clock.start();
      clock.setTimer(60L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          assertEquals(fire1.getCount(), 1);
          fire1.countDown();
        }
      });
      final TimerRef timer2 = clock.setTimer(40L, new AbstractTimer() {
        @Override
        public void runTimer() {
          fail();
        }
        @Override
        public void timerDidCancel() {
          assertEquals(cancel2.getCount(), 1);
          cancel2.countDown();
        }
      });
      assertTrue(timer2.isScheduled());
      timer2.cancel();
      assertFalse(timer2.isScheduled());

      clock.tick(1);
      clock.await(fire1);
      clock.await(cancel2);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void cancelFirstScheduledAndSoonerOfTwoTimersForSameTickOfDifferentRevolutions() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch cancel1 = new CountDownLatch(1);
    final CountDownLatch fire2 = new CountDownLatch(1);
    try {
      clock.start();
      final TimerRef timer1 = clock.setTimer(100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          fail();
        }
        @Override
        public void timerDidCancel() {
          assertEquals(cancel1.getCount(), 1);
          cancel1.countDown();
        }
      });
      clock.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 513L);
          assertEquals(fire2.getCount(), 1);
          fire2.countDown();
        }
      });
      timer1.cancel();

      clock.tick(1);
      clock.await(cancel1);

      clock.tick(512);
      clock.await(fire2);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void cancelLastScheduledAndSoonerOfTwoTimersForSameTickOfDifferentRevolutions() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire1 = new CountDownLatch(1);
    final CountDownLatch cancel2 = new CountDownLatch(1);
    try {
      clock.start();
      clock.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 513L);
          assertEquals(fire1.getCount(), 1);
          fire1.countDown();
        }
      });
      final TimerRef timer2 = clock.setTimer(100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          fail();
        }
        @Override
        public void timerDidCancel() {
          assertEquals(cancel2.getCount(), 1);
          cancel2.countDown();
        }
      });
      timer2.cancel();

      clock.tick(1);
      clock.await(cancel2);

      clock.tick(512);
      clock.await(fire1);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void cancelFirstScheduledAndLaterOfTwoTimersForSameTickOfDifferentRevolutions() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch cancel1 = new CountDownLatch(1);
    final CountDownLatch fire2 = new CountDownLatch(1);
    try {
      clock.start();
      final TimerRef timer1 = clock.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          fail();
        }
        @Override
        public void timerDidCancel() {
          assertEquals(cancel1.getCount(), 1);
          cancel1.countDown();
        }
      });
      clock.setTimer(100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          assertEquals(fire2.getCount(), 1);
          fire2.countDown();
        }
      });
      timer1.cancel();

      clock.tick(1);
      clock.await(fire2);

      clock.tick(512);
      clock.await(cancel1);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void cancelLastScheduledAndLaterOfTwoTimersForSameTickOfDifferentRevolutions() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch fire1 = new CountDownLatch(1);
    final CountDownLatch cancel2 = new CountDownLatch(1);
    try {
      clock.start();
      clock.setTimer(100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          assertEquals(fire1.getCount(), 1);
          fire1.countDown();
        }
      });
      final TimerRef timer2 = clock.setTimer(513L * 100L, new AbstractTimer() {
        @Override
        public void runTimer() {
          fail();
        }
        @Override
        public void timerDidCancel() {
          assertEquals(cancel2.getCount(), 1);
          cancel2.countDown();
        }
      });
      timer2.cancel();

      clock.tick(1);
      clock.await(fire1);

      clock.tick(512);
      clock.await(cancel2);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void invokeTimerTaskCallbacks() {
    final MockClock clock = new MockClock(100, 512);
    final CountDownLatch willSchedule = new CountDownLatch(1);
    final CountDownLatch didCancel = new CountDownLatch(1);
    try {
      clock.start();
      final TimerRef timer = clock.setTimer(50L, new AbstractTimer() {
        @Override
        public void runTimer() {
          fail();
        }
        @Override
        public void timerWillSchedule(long millis) {
          assertEquals(willSchedule.getCount(), 1);
          assertEquals(millis, 50L);
          willSchedule.countDown();
        }
        @Override
        public void timerDidCancel() {
          assertEquals(didCancel.getCount(), 1);
          didCancel.countDown();
        }
      });
      clock.await(willSchedule);
      assertTrue(timer.isScheduled());

      timer.cancel();
      assertFalse(timer.isScheduled());

      clock.tick(1);
      clock.await(didCancel);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void reportTimerErrors() {
    final CountDownLatch failure = new CountDownLatch(1);
    final RuntimeException error = new RuntimeException("fail");
    final Timer problem = new AbstractTimer() {
      @Override
      public void runTimer() {
        throw error;
      }
    };
    final MockClock clock = new MockClock(100, 512) {
      @Override
      protected void timerDidFail(TimerFunction timer, Throwable cause) {
        assertEquals(failure.getCount(), 1);
        assertEquals(timer, problem);
        assertEquals(cause, error);
        failure.countDown();
      }
    };
    try {
      clock.start();
      clock.setTimer(0L, problem);

      clock.tick(1);
      clock.await(failure);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void continueRunningAfterTimerError() {
    final CountDownLatch fire = new CountDownLatch(3);
    final CountDownLatch failure = new CountDownLatch(1);
    final MockClock clock = new MockClock(100, 512) {
      @Override
      protected void timerDidFail(TimerFunction timer, Throwable cause) {
        assertEquals(failure.getCount(), 1);
        failure.countDown();
      }
    };
    try {
      clock.start();
      clock.halfTick();
      clock.setTimer(0L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          assertEquals(fire.getCount(), 3);
          assertEquals(failure.getCount(), 1);
          fire.countDown();
        }
      });
      clock.setTimer(0L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          assertEquals(fire.getCount(), 2);
          assertEquals(failure.getCount(), 1);
          fire.countDown();
          throw new RuntimeException();
        }
      });
      clock.setTimer(0L, new AbstractTimer() {
        @Override
        public void runTimer() {
          assertEquals(clock.tick(), 1L);
          assertEquals(fire.getCount(), 1);
          assertEquals(failure.getCount(), 0);
          fire.countDown();
        }
      });
      clock.halfTick();
      clock.tick(1);
      clock.await(fire);
      clock.await(failure);
    } finally {
      clock.stop();
    }
  }

  @Test
  public void invokeIntrospectionCallbacks() {
    final CountDownLatch start = new CountDownLatch(2);
    final CountDownLatch stop = new CountDownLatch(2);
    final CountDownLatch didTick = new CountDownLatch(4);
    final CountDownLatch timerWillSchedule = new CountDownLatch(3);
    final CountDownLatch timerDidCancel = new CountDownLatch(1);
    final CountDownLatch timerWillRun = new CountDownLatch(2);
    final CountDownLatch timerDidRun = new CountDownLatch(1);
    final CountDownLatch timerDidFail = new CountDownLatch(1);
    final MockClock clock = new MockClock(100, 512) {
      @Override
      protected void willStart() {
        assertEquals(start.getCount(), 2);
        start.countDown();
      }
      @Override
      protected void didStart() {
        assertEquals(start.getCount(), 1);
        start.countDown();
      }
      @Override
      protected void willStop() {
        assertEquals(stop.getCount(), 2);
        stop.countDown();
      }
      @Override
      protected void didStop() {
        assertEquals(stop.getCount(), 1);
        stop.countDown();
      }
      @Override
      protected void didFail(Throwable error) {
        fail("didFail", error);
      }
      @Override
      protected void didTick(long tick, long waitedMillis) {
        assertTrue(didTick.getCount() > 0);
        didTick.countDown();
      }
      @Override
      protected void timerWillSchedule(TimerFunction timer, long millis) {
        assertTrue(timerWillSchedule.getCount() > 0);
        timerWillSchedule.countDown();
      }
      @Override
      protected void timerDidCancel(TimerFunction timer) {
        assertTrue(timerDidCancel.getCount() > 0);
        timerDidCancel.countDown();
      }
      @Override
      protected void timerWillRun(TimerFunction timer) {
        assertTrue(timerWillRun.getCount() > 0);
        timerWillRun.countDown();
      }
      @Override
      protected void timerDidRun(TimerFunction timer) {
        assertTrue(timerDidRun.getCount() > 0);
        timerDidRun.countDown();
      }
      @Override
      protected void timerDidFail(TimerFunction timer, Throwable cause) {
        assertEquals(timerDidFail.getCount(), 1);
        timerDidFail.countDown();
      }
    };
    try {
      clock.start();
      clock.await(start);

      clock.setTimer(0L, new AbstractTimer() {
        @Override
        public void runTimer() {
        }
      });
      clock.tick(1);
      final TimerRef timer2 = clock.setTimer(0L, new AbstractTimer() {
        @Override
        public void runTimer() {
        }
      });
      timer2.cancel();
      clock.tick(1);
      clock.await(timerDidCancel);

      clock.setTimer(0L, new AbstractTimer() {
        @Override
        public void runTimer() {
          throw new RuntimeException("fail");
        }
      });
      clock.await(timerWillSchedule);
      clock.tick(1);
      clock.await(timerWillRun);
      clock.await(didTick);
      clock.await(timerDidRun);
      clock.await(timerDidFail);
    } finally {
      clock.stop();
      clock.await(stop);
    }
  }
}
