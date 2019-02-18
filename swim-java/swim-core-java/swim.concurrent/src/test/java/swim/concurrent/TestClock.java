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
import java.util.concurrent.TimeUnit;
import org.testng.TestException;

class TestClock extends Clock {
  TestClock(int tickMillis, int tickCount) {
    super(tickMillis, tickCount);
  }

  TestClock() {
    super();
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
  protected void timerDidFail(TimerFunction timer, Throwable error) {
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
}
