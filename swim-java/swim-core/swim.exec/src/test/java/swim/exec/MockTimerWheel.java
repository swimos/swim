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
import java.util.concurrent.TimeUnit;
import org.junit.platform.commons.JUnitException;

public class MockTimerWheel extends TimerWheel {

  final CyclicBarrier tickBarrier;
  long nanos;

  MockTimerWheel(int tickMillis, int tickCount) {
    super(tickMillis, tickCount);
    this.tickBarrier = new CyclicBarrier(2);
    this.nanos = 100000L;
  }

  MockTimerWheel() {
    this(100, 512);
  }

  @Override
  protected long nanoTime() {
    return this.nanos;
  }

  @Override
  protected void sleep(long millis) throws InterruptedException {
    try {
      this.tickBarrier.await();
      this.tickBarrier.await();
    } catch (BrokenBarrierException cause) {
      throw new JUnitException("sleep error", cause);
    }
  }

  void tick(int count) {
    this.start();
    try {
      for (int n = count; n > 0; n -= 1) {
        this.tickBarrier.await();
        this.nanos += this.tickNanos;
        this.tickBarrier.await();
      }
    } catch (Throwable cause) {
      throw new JUnitException("tick error", cause);
    }
  }

  void halfTick() {
    try {
      this.tickBarrier.await();
    } catch (BrokenBarrierException | InterruptedException cause) {
      throw new JUnitException("half-tick error", cause);
    }
  }

  void await(CountDownLatch latch, int millis) {
    try {
      if (!latch.await(millis, TimeUnit.MILLISECONDS)) {
        throw new JUnitException("await timeout");
      }
    } catch (InterruptedException cause) {
      throw new JUnitException("await error", cause);
    }
  }

  void await(CountDownLatch latch) {
    this.await(latch, 1000);
  }

}
