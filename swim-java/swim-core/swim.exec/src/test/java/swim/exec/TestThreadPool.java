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
import java.util.concurrent.TimeoutException;
import org.junit.platform.commons.JUnitException;

public class TestThreadPool extends ThreadPool {

  TestThreadPool(int parallelism) {
    super(parallelism);
  }

  TestThreadPool() {
    super();
  }

  public void await(CountDownLatch latch, int millis) {
    try {
      if (!latch.await(millis, TimeUnit.MILLISECONDS)) {
        throw new JUnitException("await timeout");
      }
    } catch (InterruptedException cause) {
      throw new JUnitException("interrupted", cause);
    }
  }

  public void await(CountDownLatch latch) {
    this.await(latch, 1000);
  }

  public void await(CyclicBarrier barrier, int millis) {
    try {
      barrier.await(millis, TimeUnit.MILLISECONDS);
    } catch (TimeoutException cause) {
      throw new JUnitException("await timeout", cause);
    } catch (BrokenBarrierException | InterruptedException cause) {
      throw new JUnitException("interrupted", cause);
    }
  }

  public void await(CyclicBarrier barrier) {
    this.await(barrier, 1000);
  }

}
