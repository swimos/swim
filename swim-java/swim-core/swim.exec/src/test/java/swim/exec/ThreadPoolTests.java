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

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.CyclicBarrier;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public class ThreadPoolTests {

  @Test
  public void runATaskWhenScheduled() {
    final TestThreadPool scheduler = new TestThreadPool();
    final CountDownLatch runLatch = new CountDownLatch(1);
    try {
      scheduler.start();
      final TaskRef task = scheduler.bindTask(new AbstractTask() {
        @Override
        public void run() {
          assertEquals(1, runLatch.getCount());
          runLatch.countDown();
        }
      });
      assertFalse(task.isScheduled());
      task.schedule();
      scheduler.await(runLatch);
      assertFalse(task.isScheduled());
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void rerunATaskAfterRescheduled() {
    final TestThreadPool scheduler = new TestThreadPool();
    final CountDownLatch run1Latch = new CountDownLatch(1);
    final CountDownLatch run2Latch = new CountDownLatch(1);
    try {
      scheduler.start();
      final TaskRef task = scheduler.bindTask(new AbstractTask() {
        int runs;

        @Override
        public void run() {
          this.runs += 1;
          if (this.runs == 1) {
            run1Latch.countDown();
          } else if (this.runs == 2) {
            run2Latch.countDown();
          } else {
            fail();
          }
        }
      });

      task.schedule();
      scheduler.await(run1Latch);
      assertEquals(1, run2Latch.getCount());

      task.schedule();
      scheduler.await(run2Latch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void rerunATaskAfterReschedulingItselfWhileRunning() {
    final TestThreadPool scheduler = new TestThreadPool();
    final CountDownLatch runLatch = new CountDownLatch(2);
    try {
      scheduler.start();
      final TaskRef task = scheduler.bindTask(new AbstractTask() {
        int runs;

        @Override
        public void run() {
          this.runs += 1;
          assertFalse(this.isScheduled());
          if (this.runs == 1) {
            this.schedule();
            assertTrue(this.isScheduled());
            runLatch.countDown();
          } else if (this.runs == 2) {
            runLatch.countDown();
          } else {
            fail();
          }
        }
      });
      task.schedule();
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void cancelAScheduledTaskBeforeItRuns() {
    final TestThreadPool scheduler = new TestThreadPool(1);
    final CyclicBarrier barrier = new CyclicBarrier(2);
    try {
      scheduler.start();
      final TaskRef blocker = scheduler.bindTask(new AbstractTask() {
        @Override
        public void run() {
          // Block thread to prevent test task from running.
          scheduler.await(barrier);
        }
      });
      blocker.schedule();

      final TaskRef task = scheduler.bindTask(new AbstractTask() {
        @Override
        public void run() {
          fail();
        }
      });
      task.schedule();
      assertTrue(task.isScheduled());
      task.cancel();
      assertFalse(task.isScheduled());
      scheduler.await(barrier);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void invokeTaskLifecycleCallbacks() {
    final TestThreadPool scheduler = new TestThreadPool();
    final CyclicBarrier barrier = new CyclicBarrier(2);
    final CountDownLatch willScheduleLatch = new CountDownLatch(1);
    final CountDownLatch didCancelLatch = new CountDownLatch(1);
    try {
      scheduler.start();
      final TaskRef blocker = scheduler.bindTask(new AbstractTask() {
        @Override
        public void run() {
          // Block thread to prevent test task from running.
          scheduler.await(barrier);
        }
      });
      blocker.schedule();

      final TaskRef task = scheduler.bindTask(new AbstractTask() {
        @Override
        public void run() {
          // nop
        }

        @Override
        public void willSchedule() {
          assertEquals(1, willScheduleLatch.getCount());
          willScheduleLatch.countDown();
        }

        @Override
        public void didCancel() {
          assertEquals(1, didCancelLatch.getCount());
          didCancelLatch.countDown();
        }
      });
      task.schedule();
      scheduler.await(willScheduleLatch);
      task.cancel();
      scheduler.await(didCancelLatch);
      scheduler.await(barrier);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void reportTaskErrors() {
    final CountDownLatch didAbortLatch = new CountDownLatch(1);
    final RuntimeException cause = new RuntimeException("fail");
    final Task problem = new AbstractTask() {
      @Override
      public void run() {
        throw cause;
      }
    };
    final TestThreadPool scheduler = new TestThreadPool() {
      @Override
      protected void didAbortTask(TaskContext handle, Throwable exception) {
        assertEquals(1, didAbortLatch.getCount());
        assertEquals(problem, handle.task());
        assertEquals(cause, exception);
        didAbortLatch.countDown();
      }
    };
    try {
      scheduler.start();
      scheduler.bindTask(problem).schedule();
      scheduler.await(didAbortLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void continueRunningAfterTaskFailure() {
    final CountDownLatch runLatch = new CountDownLatch(3);
    final CountDownLatch didAbortLatch = new CountDownLatch(1);
    final TestThreadPool scheduler = new TestThreadPool(1) {
      @Override
      protected void didAbortTask(TaskContext handle, Throwable exception) {
        assertEquals(1, didAbortLatch.getCount());
        didAbortLatch.countDown();
      }
    };
    try {
      scheduler.start();
      scheduler.bindTask(new AbstractTask() {
        @Override
        public void run() {
          assertEquals(3, runLatch.getCount());
          runLatch.countDown();
        }
      }).schedule();
      scheduler.bindTask(new AbstractTask() {
        @Override
        public void run() {
          assertEquals(2, runLatch.getCount());
          runLatch.countDown();
          throw new RuntimeException();
        }
      }).schedule();
      scheduler.bindTask(new AbstractTask() {
        @Override
        public void run() {
          assertEquals(1, runLatch.getCount());
          runLatch.countDown();
        }
      }).schedule();
      scheduler.await(didAbortLatch);
      scheduler.await(runLatch);
    } finally {
      scheduler.stop();
    }
  }

  @Test
  public void invokeIntrospectionCallbacks() {
    final CountDownLatch startLatch = new CountDownLatch(2);
    final CountDownLatch stopLatch = new CountDownLatch(2);
    final CountDownLatch willScheduleTaskLatch = new CountDownLatch(1);
    final CountDownLatch didCancelTaskLatch = new CountDownLatch(1);
    final CountDownLatch willRunTaskLatch = new CountDownLatch(1);
    final CountDownLatch didRunTaskLatch = new CountDownLatch(1);
    final CountDownLatch didAbortTaskLatch = new CountDownLatch(1);
    final TestThreadPool scheduler = new TestThreadPool(1) {
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
      protected void willScheduleTask(TaskContext handle) {
        willScheduleTaskLatch.countDown();
      }

      @Override
      protected void didCancelTask(TaskContext handle) {
        didCancelTaskLatch.countDown();
      }

      @Override
      protected void willRunTask(TaskContext handle) {
        willRunTaskLatch.countDown();
      }

      @Override
      protected void didRunTask(TaskContext handle) {
        didRunTaskLatch.countDown();
      }

      @Override
      protected void didAbortTask(TaskContext handle, Throwable exception) {
        didAbortTaskLatch.countDown();
      }
    };
    try {
      scheduler.start();
      scheduler.await(startLatch);

      scheduler.bindTask(new AbstractTask() {
        @Override
        public void run() {
          // nop
        }
      }).schedule();
      scheduler.await(willScheduleTaskLatch);
      scheduler.await(willRunTaskLatch);
      scheduler.await(didRunTaskLatch);

      final CyclicBarrier barrier = new CyclicBarrier(2);
      final TaskRef blocker = scheduler.bindTask(new AbstractTask() {
        @Override
        public void run() {
          // Block thread to prevent test task from running.
          scheduler.await(barrier);
        }
      });
      blocker.schedule();

      final TaskRef task2 = scheduler.bindTask(new AbstractTask() {
        @Override
        public void run() {
          // nop
        }
      });
      task2.schedule();
      task2.cancel();
      scheduler.await(didCancelTaskLatch);
      scheduler.await(barrier);

      scheduler.bindTask(new AbstractTask() {
        @Override
        public void run() {
          throw new RuntimeException("test");
        }
      }).schedule();
      scheduler.await(didAbortTaskLatch);

    } finally {
      scheduler.stop();
      scheduler.await(stopLatch);
    }
  }

}
