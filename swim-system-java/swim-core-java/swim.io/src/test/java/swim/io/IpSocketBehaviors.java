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

package swim.io;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.codec.Binary;
import swim.concurrent.Theater;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.fail;

public abstract class IpSocketBehaviors {
  protected abstract IpServiceRef bind(IpEndpoint endpoint, IpService service);

  protected abstract IpSocketRef connect(IpEndpoint endpoint, IpSocket socket);

  @Test
  public void testConnection() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch clientConnect = new CountDownLatch(1);
    final CountDownLatch serverConnect = new CountDownLatch(1);
    final CountDownLatch serverBind = new CountDownLatch(1);
    final AbstractIpSocket client = new AbstractIpSocket() {
      @Override
      public void didConnect() {
        clientConnect.countDown();
      }
    };
    final AbstractIpSocket server = new AbstractIpSocket() {
      @Override
      public void didConnect() {
        serverConnect.countDown();
      }
    };
    final AbstractIpService service = new AbstractIpService() {
      @Override
      public IpSocket createSocket() {
        return server;
      }
      @Override
      public void didBind() {
        serverBind.countDown();
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      serverBind.await();
      connect(endpoint, client);
      serverConnect.await();
      clientConnect.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      client.close();
      server.close();
      service.unbind();
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testClientConnectError() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch clientDisconnect = new CountDownLatch(1);
    final AbstractIpSocket client = new AbstractIpSocket() {
      @Override
      public void didDisconnect() {
        clientDisconnect.countDown();
      }
    };

    try {
      stage.start();
      endpoint.start();
      connect(endpoint, client);
      clientDisconnect.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      client.close();
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testClientCloseOnConnect() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch clientConnect = new CountDownLatch(1);
    final CountDownLatch clientDisconnect = new CountDownLatch(1);
    final CountDownLatch serverConnect = new CountDownLatch(1);
    final CountDownLatch serverDisconnect = new CountDownLatch(1);
    final AbstractIpSocket client = new AbstractIpSocket() {
      @Override
      public void didConnect() {
        clientConnect.countDown();
        close();
      }
      @Override
      public void didDisconnect() {
        clientDisconnect.countDown();
      }
      @Override
      public void didFail(Throwable error) {
        throw new TestException(error);
      }
    };
    final AbstractIpSocket server = new AbstractIpSocket() {
      @Override
      public void didConnect() {
        flowControl(FlowModifier.ENABLE_READ);
        serverConnect.countDown();
      }
      @Override
      public void didDisconnect() {
        serverDisconnect.countDown();
      }
      @Override
      public void didFail(Throwable error) {
        throw new TestException(error);
      }
    };
    final AbstractIpService service = new AbstractIpService() {
      @Override
      public IpSocket createSocket() {
        return server;
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      clientConnect.await();
      clientDisconnect.await();
      serverConnect.await();
      serverDisconnect.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      client.close();
      server.close();
      service.unbind();
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testServerCloseOnConnect() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch clientConnect = new CountDownLatch(1);
    final CountDownLatch clientDisconnect = new CountDownLatch(1);
    final CountDownLatch serverConnect = new CountDownLatch(1);
    final CountDownLatch serverDisconnect = new CountDownLatch(1);
    final AbstractIpSocket client = new AbstractIpSocket() {
      @Override
      public void didConnect() {
        clientConnect.countDown();
        close();
      }
      @Override
      public void didDisconnect() {
        flowControl(FlowModifier.ENABLE_READ);
        clientDisconnect.countDown();
      }
      @Override
      public void didFail(Throwable error) {
        throw new TestException(error);
      }
    };
    final AbstractIpSocket server = new AbstractIpSocket() {
      @Override
      public void didConnect() {
        serverConnect.countDown();
        close();
      }
      @Override
      public void didDisconnect() {
        serverDisconnect.countDown();
      }
      @Override
      public void didFail(Throwable error) {
        throw new TestException(error);
      }
    };
    final AbstractIpService service = new AbstractIpService() {
      @Override
      public IpSocket createSocket() {
        return server;
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      serverConnect.await();
      serverDisconnect.await();
      clientConnect.await();
      clientDisconnect.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      client.close();
      server.close();
      service.unbind();
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testSendFromWritableToReadableSocket() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch serverWrite = new CountDownLatch(1);
    final CountDownLatch clientRead = new CountDownLatch(1);
    final AbstractIpSocket client = new AbstractIpSocket() {
      @Override
      public void didConnect() {
        flowControl(FlowModifier.ENABLE_READ);
      }
      @Override
      public void doRead() {
        final byte[] data = new byte[5];
        for (int i = 0; i < 5; i += 1) {
          data[i] = (byte) inputBuffer().head();
          inputBuffer().step();
        }
        final String text;
        try {
          text = new String(data, "UTF-8");
        } catch (Throwable cause) {
          throw new TestException(cause);
        }
        assertEquals(text, "@test");
        clientRead.countDown();
      }
    };
    final AbstractIpSocket server = new AbstractIpSocket() {
      @Override
      public void didConnect() {
        flowControl(FlowModifier.ENABLE_READ_WRITE);
      }
      @Override
      public void doWrite() {
        final byte[] data;
        try {
          data = "@test".getBytes("UTF-8");
        } catch (Throwable cause) {
          throw new TestException(cause);
        }
        Binary.writeByteArray(data, outputBuffer());
      }
      @Override
      public void didWrite() {
        flowControl(FlowModifier.DISABLE_WRITE);
        serverWrite.countDown();
      }
    };
    final AbstractIpService service = new AbstractIpService() {
      @Override
      public IpSocket createSocket() {
        return server;
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      serverWrite.await();
      clientRead.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      client.close();
      server.close();
      service.unbind();
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testDoNotSendFromWritableToUnreadableSocket() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch connect = new CountDownLatch(2);
    final CountDownLatch serverWrite = new CountDownLatch(1);
    final CountDownLatch disconnect = new CountDownLatch(2);
    final AbstractIpSocket client = new AbstractIpSocket() {
      @Override
      public void didConnect() {
        connect.countDown();
      }
      @Override
      public void doRead() {
        fail();
      }
      @Override
      public void didDisconnect() {
        disconnect.countDown();
      }
    };
    final AbstractIpSocket server = new AbstractIpSocket() {
      @Override
      public void didConnect() {
        flowControl(FlowModifier.ENABLE_READ_WRITE);
        connect.countDown();
      }
      @Override
      public void doWrite() {
        final byte[] data;
        try {
          data = "@test".getBytes("UTF-8");
        } catch (Throwable cause) {
          throw new TestException(cause);
        }
        Binary.writeByteArray(data, outputBuffer());
      }
      @Override
      public void didWrite() {
        flowControl(FlowModifier.DISABLE_WRITE);
        serverWrite.countDown();
      }
      @Override
      public void didDisconnect() {
        disconnect.countDown();
      }
    };
    final AbstractIpService service = new AbstractIpService() {
      @Override
      public IpSocket createSocket() {
        return server;
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      connect.await();
      serverWrite.await();
      endpoint.stop();
      disconnect.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      client.close();
      server.close();
      service.unbind();
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testWriteBackoff() {
    final Theater stage = new Theater();
    final IpEndpoint endpoint = new IpEndpoint(stage);
    final CountDownLatch connect = new CountDownLatch(2);
    final CountDownLatch disconnect = new CountDownLatch(2);
    final AtomicLong t0 = new AtomicLong();
    final AtomicLong t1 = new AtomicLong();
    final AtomicInteger writes = new AtomicInteger();
    final AbstractIpSocket client = new AbstractIpSocket() {
      @Override
      public void didConnect() {
        connect.countDown();
      }
      @Override
      public void doRead() {
        fail();
      }
      @Override
      public void didDisconnect() {
        disconnect.countDown();
      }
    };
    final AbstractIpSocket server = new AbstractIpSocket() {
      @Override
      public void didConnect() {
        t0.set(System.currentTimeMillis());
        flowControl(FlowModifier.ENABLE_READ_WRITE);
        connect.countDown();
      }
      @Override
      public void doWrite() {
        writes.incrementAndGet();
        final byte[] data;
        try {
          data = "@test".getBytes("UTF-8");
        } catch (Throwable cause) {
          throw new TestException(cause);
        }
        Binary.writeByteArray(data, outputBuffer());
      }
      @Override
      public void didWrite() {
        t1.set(System.currentTimeMillis());
      }
      @Override
      public void didDisconnect() {
        disconnect.countDown();
      }
    };
    final AbstractIpService service = new AbstractIpService() {
      @Override
      public IpSocket createSocket() {
        return server;
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      final long ta = System.currentTimeMillis();
      connect.await();
      Thread.sleep(1000);
      endpoint.stop();
      disconnect.await();
      final long tb = System.currentTimeMillis();
      final long dt = t1.get() - t0.get();
      assertTrue(dt <= tb - ta, "never stopped writing");
      final int size = 5 * writes.get();
      System.out.println("stopped after writing " + size + " bytes in " + dt + " milliseconds");
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      client.close();
      server.close();
      service.unbind();
      endpoint.stop();
      stage.stop();
    }
  }
}
