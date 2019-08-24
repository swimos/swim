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

package swim.io.mqtt;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.codec.Utf8;
import swim.concurrent.Theater;
import swim.io.IpServiceRef;
import swim.io.IpSocketRef;
import swim.mqtt.MqttPacket;
import swim.mqtt.MqttPublish;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public abstract class MqttSocketBehaviors {
  protected abstract IpServiceRef bind(MqttEndpoint endpoint, MqttService service);

  protected abstract IpSocketRef connect(MqttEndpoint endpoint, MqttSocket<?, ?> socket);

  @Test
  public void testConnection() {
    final Theater stage = new Theater();
    final MqttEndpoint endpoint = new MqttEndpoint(stage);
    final CountDownLatch serverBind = new CountDownLatch(1);
    final CountDownLatch serverConnect = new CountDownLatch(1);
    final CountDownLatch clientConnect = new CountDownLatch(1);
    final AbstractMqttSocket<Object, Object> client = new AbstractMqttSocket<Object, Object>() {
      @Override
      public void didConnect() {
        clientConnect.countDown();
      }
    };
    final AbstractMqttSocket<Object, Object> server = new AbstractMqttSocket<Object, Object>() {
      @Override
      public void didConnect() {
        serverConnect.countDown();
      }
    };
    final AbstractMqttService service = new AbstractMqttService() {
      @Override
      public MqttSocket<?, ?> createSocket() {
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
  public void testReadWrite() {
    final Theater stage = new Theater();
    final MqttEndpoint endpoint = new MqttEndpoint(stage);
    final CountDownLatch clientWrite = new CountDownLatch(1);
    final CountDownLatch serverWrite = new CountDownLatch(1);
    final CountDownLatch clientRead = new CountDownLatch(1);
    final CountDownLatch serverRead = new CountDownLatch(1);
    final AbstractMqttSocket<String, String> client = new AbstractMqttSocket<String, String>() {
      @Override
      public void didConnect() {
        read(Utf8.stringParser());
        write(MqttPublish.from("test").payload("@clientToServer"));
      }
      @Override
      public void didRead(MqttPacket<? extends String> packet) {
        assertTrue(packet instanceof MqttPublish<?>);
        assertEquals(((MqttPublish<? extends String>) packet).payload().get(), "@serverToClient");
        clientRead.countDown();
      }
      @Override
      public void didWrite(MqttPacket<? extends String> packet) {
        assertEquals(((MqttPublish<? extends String>) packet).payload().get(), "@clientToServer");
        clientWrite.countDown();
      }
    };
    final AbstractMqttSocket<String, String> server = new AbstractMqttSocket<String, String>() {
      @Override
      public void didConnect() {
        read(Utf8.stringParser());
        write(MqttPublish.from("test").payload("@serverToClient"));
      }
      @Override
      public void didRead(MqttPacket<? extends String> packet) {
        assertTrue(packet instanceof MqttPublish<?>);
        assertEquals(((MqttPublish<? extends String>) packet).payload().get(), "@clientToServer");
        serverRead.countDown();
      }
      @Override
      public void didWrite(MqttPacket<? extends String> packet) {
        assertEquals(((MqttPublish<? extends String>) packet).payload().get(), "@serverToClient");
        serverWrite.countDown();
      }
    };
    final AbstractMqttService service = new AbstractMqttService() {
      @Override
      public MqttSocket<?, ?> createSocket() {
        return server;
      }
    };

    try {
      stage.start();
      endpoint.start();
      bind(endpoint, service);
      connect(endpoint, client);
      clientWrite.await();
      serverWrite.await();
      clientRead.await();
      serverRead.await();
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

  protected void benchmark(int connections, final long duration, final String payload) {
    final Theater stage = new Theater();
    final MqttEndpoint endpoint = new MqttEndpoint(stage);
    final AtomicLong t0 = new AtomicLong();
    final AtomicLong dt = new AtomicLong();
    final AtomicInteger count = new AtomicInteger();
    final CountDownLatch clientDone = new CountDownLatch(connections);
    final CountDownLatch serverDone = new CountDownLatch(connections);

    try {
      stage.start();
      endpoint.start();
      System.out.println("Warming up for " + duration + " milliseconds...");
      bind(endpoint, new AbstractMqttService() {
        @Override
        public MqttSocket<?, ?> createSocket() {
          return new AbstractMqttSocket<String, String>() {
            boolean closed;
            @Override
            public void didConnect() {
              t0.compareAndSet(0L, System.currentTimeMillis());
              read(Utf8.stringParser());
              write(MqttPublish.from("test").payload(payload));
            }
            @Override
            public void doWrite() {
              long oldDt;
              long newDt;
              do {
                oldDt = dt.get();
                newDt = System.currentTimeMillis() - t0.get();
              } while ((oldDt < 2L * duration || newDt < 2L * duration) && !dt.compareAndSet(oldDt, newDt));
              if (newDt >= 2L * duration) {
                if (!closed) {
                  closed = true;
                  close();
                }
                return;
              } else if (newDt >= duration) {
                if (oldDt < duration) {
                  System.out.println("Benchmarking for " + duration + " milliseconds...");
                }
                count.incrementAndGet();
              }
              write(MqttPublish.from("test").payload(payload));
            }
            @Override
            public void didDisconnect() {
              serverDone.countDown();
            }
          };
        }
      });
      final IpSocketRef[] clients = new IpSocketRef[connections];
      for (int connection = 0; connection < connections; connection += 1) {
        clients[connection] = connect(endpoint, new AbstractMqttSocket<String, String>() {
          @Override
          public void didConnect() {
            read(Utf8.stringParser());
          }
          @Override
          public void didRead(MqttPacket<? extends String> packet) {
            read(Utf8.stringParser());
          }
          @Override
          public void didDisconnect() {
            clientDone.countDown();
          }
        });
      }
      clientDone.await();
      serverDone.await();
      for (int connection = 0; connection < connections; connection += 1) {
        clients[connection].close();
      }
      final int rate = (int) (1000L * count.get() / duration);
      System.out.println("Wrote " + count.get() + " messages over " + connections + " connections in " + duration + " milliseconds (" + rate + " per second)");
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      endpoint.stop();
      stage.stop();
    }
  }

  @Test(groups = {"benchmark"})
  public void benchmarkSmallPayloads() {
    final StringBuilder payload = new StringBuilder();
    for (int i = 0; i < 32; i += 1) {
      payload.append("test");
    }
    benchmark(2 * Runtime.getRuntime().availableProcessors(), 2000L, payload.toString());
  }

  @Test(groups = {"benchmark"})
  public void benchmarkLargePayloads() {
    final StringBuilder payload = new StringBuilder();
    for (int i = 0; i < 256; i += 1) {
      payload.append("test");
    }
    benchmark(2 * Runtime.getRuntime().availableProcessors(), 2000L, payload.toString());
  }
}
