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

import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.testng.TestException;

class TestTheater extends Theater {
  TestTheater() {
    super();
  }

  TestTheater(int parallelism) {
    super(parallelism);
  }

  @Override
  protected void didFail(Throwable error) {
    if (error instanceof Error) {
      error.printStackTrace();
      throw (Error) error;
    } else if (error instanceof RuntimeException) {
      throw (RuntimeException) error;
    } else {
      error.printStackTrace();
      throw new RuntimeException(error);
    }
  }

  @Override
  protected void taskDidFail(TaskFunction task, Throwable error) {
    if (error instanceof Error) {
      error.printStackTrace();
      throw (Error) error;
    } else if (error instanceof RuntimeException) {
      throw (RuntimeException) error;
    } else {
      error.printStackTrace();
      throw new RuntimeException(error);
    }
  }

  @Override
  protected void callDidFail(Cont<?> cont, Throwable error) {
    if (error instanceof Error) {
      error.printStackTrace();
      throw (Error) error;
    } else if (error instanceof RuntimeException) {
      throw (RuntimeException) error;
    } else {
      error.printStackTrace();
      throw new RuntimeException(error);
    }
  }

  void await(CountDownLatch latch, int millis) {
    try {
      if (!latch.await(millis, TimeUnit.MILLISECONDS)) {
        throw new TestException("await timeout");
      }
    } catch (InterruptedException error) {
      throw new TestException(error);
    }
  }

  void await(CountDownLatch latch) {
    await(latch, 1000);
  }

  void await(CyclicBarrier barrier, int millis) {
    try {
      barrier.await(millis, TimeUnit.MILLISECONDS);
    } catch (BrokenBarrierException | InterruptedException | TimeoutException error) {
      throw new TestException(error);
    }
  }

  void await(CyclicBarrier barrier) {
    await(barrier, 1000);
  }

  <T> T await(Sync<T> sync, long millis) {
    try {
      return sync.await(millis);
    } catch (InterruptedException error) {
      throw new TestException(error);
    }
  }

  <T> T await(Sync<T> sync) {
    return await(sync, 1000L);
  }
}
