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

import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.platform.commons.JUnitException;

public class ThreadSchedulerTests {

  @Test
  @Tag("benchmark")
  public void benchmarkTimers() {
    final int threadCount = Runtime.getRuntime().availableProcessors();
    final int timerCount = 1000000;
    final int iterations = 10;
    try {
      long adt1 = 0L;
      long arate1 = 0L;
      long adt2 = 0L;
      long arate2 = 0L;
      for (int k = 0; k < iterations; k += 1) {
        final ThreadScheduler scheduler = new ThreadScheduler();
        scheduler.setTimerService(new TimerWheel(10, 512));
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
    } catch (InterruptedException cause) {
      throw new JUnitException("interrupted", cause);
    }
  }

}
