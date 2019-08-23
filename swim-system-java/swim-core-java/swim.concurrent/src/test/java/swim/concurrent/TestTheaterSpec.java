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
import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;

public class TestTheaterSpec {
  @Test
  public void runATaskWhenCued() {
    final TestTheater theater = new TestTheater();
    final CountDownLatch execute = new CountDownLatch(1);
    try {
      theater.start();
      final TaskRef task = theater.task(new AbstractTask() {
        @Override
        public void runTask() {
          assertEquals(execute.getCount(), 1);
          execute.countDown();
        }
      });
      assertFalse(task.isCued());
      task.cue();
      theater.await(execute);
      assertFalse(task.isCued());
    } finally {
      theater.stop();
    }
  }

  @Test
  public void runABlockingTaskWhenCued() {
    final TestTheater theater = new TestTheater();
    final CountDownLatch execute = new CountDownLatch(1);
    try {
      theater.start();
      final TaskRef task = theater.task(new AbstractTask() {
        @Override
        public void runTask() {
          assertEquals(execute.getCount(), 1);
          execute.countDown();
        }
        @Override
        public boolean taskWillBlock() {
          return true;
        }
      });
      assertFalse(task.isCued());
      task.cue();
      theater.await(execute);
      assertFalse(task.isCued());
    } finally {
      theater.stop();
    }
  }

  @Test
  public void rerunATaskAfterRecued() {
    final TestTheater theater = new TestTheater();
    final CountDownLatch execute1 = new CountDownLatch(1);
    final CountDownLatch execute2 = new CountDownLatch(1);
    try {
      theater.start();
      final TaskRef task = theater.task(new AbstractTask() {
        int runs;
        @Override
        public void runTask() {
          runs += 1;
          if (runs == 1) {
            execute1.countDown();
          } else if (runs == 2) {
            execute2.countDown();
          } else {
            fail();
          }
        }
      });

      task.cue();
      theater.await(execute1);
      assertEquals(execute2.getCount(), 1);

      task.cue();
      theater.await(execute2);
    } finally {
      theater.stop();
    }
  }

  @Test
  public void rerunATaskAfterRecueingItselfWhileRunning() {
    final TestTheater theater = new TestTheater();
    final CountDownLatch execute = new CountDownLatch(2);
    try {
      theater.start();
      final TaskRef task = theater.task(new AbstractTask() {
        int runs;
        @Override
        public void runTask() {
          runs += 1;
          assertFalse(isCued());
          if (runs == 1) {
            cue();
            assertTrue(isCued());
            execute.countDown();
          } else if (runs == 2) {
            execute.countDown();
          } else {
            fail();
          }
        }
      });
      task.cue();
      theater.await(execute);
    } finally {
      theater.stop();
    }
  }

  @Test
  public void cancelACuedTaskBeforeItRuns() {
    final TestTheater theater = new TestTheater(1);
    final CyclicBarrier barrier = new CyclicBarrier(2);
    try {
      theater.start();
      final TaskRef blocker = theater.task(new AbstractTask() {
        @Override
        public void runTask() {
          // Block thread to prevent test task from running.
          theater.await(barrier);
        }
      });
      blocker.cue();

      final TaskRef task = theater.task(new AbstractTask() {
        @Override
        public void runTask() {
          fail();
        }
      });
      task.cue();
      assertTrue(task.isCued());
      task.cancel();
      assertFalse(task.isCued());
      theater.await(barrier);
    } finally {
      theater.stop();
    }
  }

  @Test
  public void invokeTaskLifecycleCallbacks() {
    final TestTheater theater = new TestTheater();
    final CountDownLatch taskWillCue = new CountDownLatch(1);
    try {
      theater.start();
      final TaskRef task = theater.task(new AbstractTask() {
        @Override
        public void runTask() {
          // nop
        }
        @Override
        public void taskWillCue() {
          assertEquals(taskWillCue.getCount(), 1);
          taskWillCue.countDown();
        }
      });
      task.cue();
      theater.await(taskWillCue);
    } finally {
      theater.stop();
    }
  }

  @Test
  public void reportTaskErrors() {
    final CountDownLatch failure = new CountDownLatch(1);
    final RuntimeException cause = new RuntimeException("fail");
    final Task problem = new AbstractTask() {
      @Override
      public void runTask() {
        throw cause;
      }
    };
    final TestTheater theater = new TestTheater() {
      @Override
      protected void taskDidFail(TaskFunction task, Throwable error) {
        assertEquals(failure.getCount(), 1);
        assertEquals(task, problem);
        assertEquals(error, cause);
        failure.countDown();
      }
    };
    try {
      theater.start();
      theater.task(problem).cue();
      theater.await(failure);
    } finally {
      theater.stop();
    }
  }

  @Test
  public void continueRunningAfterTaskError()  {
    final CountDownLatch execute = new CountDownLatch(3);
    final CountDownLatch failure = new CountDownLatch(1);
    final TestTheater theater = new TestTheater(1) {
      @Override
      protected void taskDidFail(TaskFunction task, Throwable error) {
        assertEquals(failure.getCount(), 1);
        failure.countDown();
      }
    };
    try {
      theater.start();
      theater.task(new AbstractTask() {
        @Override
        public void runTask() {
          assertEquals(execute.getCount(), 3);
          execute.countDown();
        }
      }).cue();
      theater.task(new AbstractTask() {
        @Override
        public void runTask() {
          assertEquals(execute.getCount(), 2);
          execute.countDown();
          throw new RuntimeException();
        }
      }).cue();
      theater.task(new AbstractTask() {
        @Override
        public void runTask() {
          assertEquals(execute.getCount(), 1);
          execute.countDown();
        }
      }).cue();
      theater.await(failure);
      theater.await(execute);
    } finally {
      theater.stop();
    }
  }

  @Test
  public void bindContCall() {
    final TestTheater theater = new TestTheater();
    final CountDownLatch bind = new CountDownLatch(1);
    final Object result = new Object();
    try {
      theater.start();
      theater.call(new Cont<Object>() {
        @Override
        public void bind(Object value) {
          assertEquals(bind.getCount(), 1);
          assertEquals(value, result);
          bind.countDown();
        }
        @Override
        public void trap(Throwable error) {
          fail();
        }
      }).bind(result);
      theater.await(bind);
    } finally {
      theater.stop();
    }
  }

  @Test
  public void trapContCall() {
    final TestTheater theater = new TestTheater();
    final CountDownLatch trap = new CountDownLatch(1);
    final Throwable result = new RuntimeException();
    try {
      theater.start();
      theater.call(new Cont<Object>() {
        @Override
        public void bind(Object value) {
          fail();
        }
        @Override
        public void trap(Throwable error) {
          assertEquals(trap.getCount(), 1);
          assertEquals(error, result);
          trap.countDown();
        }
      }).trap(result);
      theater.await(trap);
    } finally {
      theater.stop();
    }
  }

  @Test
  public void constantCont() {
    final TestTheater theater = new TestTheater();
    final CountDownLatch bind = new CountDownLatch(1);
    try {
      theater.start();
      theater.call(Conts.constant(new Cont<String>() {
        @Override
        public void bind(String value) {
          assertEquals(value, "test");
          bind.countDown();
        }
        @Override
        public void trap(Throwable error) {
          fail();
        }
      }, "test")).bind("foo");
      theater.await(bind);
    } finally {
      theater.stop();
    }
  }

  @Test
  public void awaitSyncCont() {
    final TestTheater theater = new TestTheater();
    try {
      theater.start();
      final Sync<String> sync = new Sync<String>();
      theater.call(sync).bind("test");
      assertEquals(theater.await(sync), "test");
    } finally {
      theater.stop();
    }
  }

  @Test
  public void awaitSyncContTimeout() {
    final TestTheater theater = new TestTheater();
    final long timeout = 1000L;
    final long t0 = System.currentTimeMillis();
    try {
      theater.start();
      final Sync<String> sync = new Sync<String>();
      theater.await(sync, timeout);
    } catch (SyncException e) {
      final long dt = System.currentTimeMillis() - t0;
      assertTrue(dt >= timeout, "timeout too soon");
      assertTrue(dt <= 2L * timeout, "timeout too long");
    } finally {
      theater.stop();
    }
  }

  @Test
  public void invokeIntrospectionCallbacks() {
    final CountDownLatch didStart = new CountDownLatch(1);
    final CountDownLatch didStop = new CountDownLatch(1);
    final CountDownLatch taskWillCue = new CountDownLatch(1);
    final CountDownLatch taskDidCancel = new CountDownLatch(1);
    final CountDownLatch taskWillRun = new CountDownLatch(1);
    final CountDownLatch taskDidRun = new CountDownLatch(1);
    final CountDownLatch taskDidFail = new CountDownLatch(1);
    final CountDownLatch callWillCue = new CountDownLatch(1);
    final CountDownLatch callWillBind = new CountDownLatch(1);
    final CountDownLatch callDidBind = new CountDownLatch(1);
    final CountDownLatch callWillTrap = new CountDownLatch(1);
    final CountDownLatch callDidTrap = new CountDownLatch(1);
    final CountDownLatch callDidFail = new CountDownLatch(1);
    final TestTheater theater = new TestTheater() {
      @Override
      protected void didStart() {
        assertEquals(didStart.getCount(), 1);
        didStart.countDown();
      }
      @Override
      protected void didStop() {
        assertEquals(didStop.getCount(), 1);
        didStop.countDown();
      }
      @Override
      protected void taskWillCue(TaskFunction task) {
        taskWillCue.countDown();
      }
      @Override
      protected void taskDidCancel(TaskFunction task) {
        taskDidCancel.countDown();
      }
      @Override
      protected void taskWillRun(TaskFunction task) {
        taskWillRun.countDown();
      }
      @Override
      protected void taskDidRun(TaskFunction task) {
        taskDidRun.countDown();
      }
      @Override
      protected void taskDidFail(TaskFunction task, Throwable error) {
        taskDidFail.countDown();
      }
      @Override
      protected void callWillCue(Cont<?> cont) {
        callWillCue.countDown();
      }
      @Override
      protected <T> void callWillBind(Cont<T> cont, T value) {
        callWillBind.countDown();
      }
      @Override
      protected <T> void callDidBind(Cont<?> cont, T value) {
        callDidBind.countDown();
      }
      @Override
      protected void callWillTrap(Cont<?> cont, Throwable error) {
        callWillTrap.countDown();
      }
      @Override
      protected void callDidTrap(Cont<?> cont, Throwable error) {
        callDidTrap.countDown();
      }
      @Override
      protected void callDidFail(Cont<?> cont, Throwable error) {
        callDidFail.countDown();
      }
    };
    try {
      theater.start();
      theater.await(didStart);

      theater.task(new AbstractTask() {
        @Override
        public void runTask() {
          // nop
        }
      }).cue();
      theater.await(taskWillCue);
      theater.await(taskWillRun);
      theater.await(taskDidRun);

      final CyclicBarrier barrier = new CyclicBarrier(2);
      final TaskRef blocker = theater.task(new AbstractTask() {
        @Override
        public void runTask() {
          // Block thread to prevent test task from running.
          theater.await(barrier);
        }
      });
      blocker.cue();

      final TaskRef task2 = theater.task(new AbstractTask() {
        @Override
        public void runTask() {
          // nop
        }
      });
      task2.cue();
      task2.cancel();
      theater.await(taskDidCancel);
      theater.await(barrier);

      theater.task(new AbstractTask() {
        @Override
        public void runTask() {
          throw new RuntimeException("test");
        }
      }).cue();
      theater.await(taskDidFail);

      theater.call(new Cont<Object>() {
        @Override
        public void bind(Object value) {
          // nop
        }
        @Override
        public void trap(Throwable error) {
          // nop
        }
      }).bind(null);
      theater.await(callWillCue);
      theater.await(callWillBind);
      theater.await(callDidBind);

      theater.call(new Cont<Object>() {
        @Override
        public void bind(Object value) {
          // nop
        }
        @Override
        public void trap(Throwable error) {
          // nop
        }
      }).trap(new Exception());
      theater.await(callWillTrap);
      theater.await(callDidTrap);

      theater.call(new Cont<Object>() {
        @Override
        public void bind(Object value) {
          throw new RuntimeException("test");
        }
        @Override
        public void trap(Throwable error) {
          // nop
        }
      }).bind(null);
      theater.await(callDidFail);

    } finally {
      theater.stop();
      theater.await(didStop);
    }
  }
}
