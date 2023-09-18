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

package swim.concurrent;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.CyclicBarrier;
import org.testng.TestException;
import org.testng.annotations.Test;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;

public class SyncSpec {

  @Test
  public void awaitBind() throws InterruptedException {
    final Object result = new Object();
    final Sync<Object> sync = new Sync<Object>();
    sync.bind(result);
    assertEquals(sync.await(), result);
  }

  @Test
  public void awaitTrap() throws InterruptedException {
    final Throwable result = new RuntimeException("trap");
    final Sync<String> sync = new Sync<String>();
    sync.trap(result);
    try {
      sync.await();
      fail();
    } catch (Throwable error) {
      assertEquals(error, result);
    }
  }

  @Test
  public void awaitTimeout() throws InterruptedException {
    long timeout = 200L;
    final Sync<Object> sync = new Sync<>();
    final long t0 = System.nanoTime();

    try {
      sync.await(timeout);
      fail();
    } catch (SyncException e) {
      final long dt = System.nanoTime() - t0;

      timeout *= 1e6;

      assertTrue(dt > timeout, "Timeout too soon: dt: " + dt);
      assertTrue(dt < 3L * timeout, "long too soon: dt: " + dt);
    }
  }

  @Test
  public void concurrentAwait() throws InterruptedException {
    final int awaitCount = 1000;
    final int threadCount = 8;
    for (int i = 0; i < awaitCount; i += 1) {
      final Object result = new Object();
      final Sync<Object> sync = new Sync<Object>();
      final CyclicBarrier barrier = new CyclicBarrier(threadCount);
      final CountDownLatch startup = new CountDownLatch(threadCount);
      final CountDownLatch shutdown = new CountDownLatch(threadCount);
      for (int j = 0; j < threadCount; j += 1) {
        final Thread thread = new Thread() {
          @Override
          public void run() {
            try {
              startup.countDown();
              assertEquals(sync.await(), result);
              shutdown.countDown();
            } catch (InterruptedException cause) {
              throw new TestException(cause);
            }
          }
        };
        thread.start();
      }
      startup.await();
      sync.bind(result);
      shutdown.await();
    }
  }

}
