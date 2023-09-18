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

package swim.io.warp;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.concurrent.PullContext;
import swim.concurrent.PullRequest;
import swim.concurrent.StayContext;
import swim.concurrent.Theater;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.IpServiceRef;
import swim.io.IpSocketRef;
import swim.io.http.AbstractHttpService;
import swim.io.http.HttpEndpoint;
import swim.io.http.HttpResponder;
import swim.io.http.HttpServer;
import swim.io.http.HttpService;
import swim.structure.Record;
import swim.structure.Value;
import swim.warp.CommandMessage;
import swim.warp.Envelope;
import swim.warp.LinkRequest;
import swim.warp.LinkedResponse;
import swim.ws.WsCloseFrame;
import swim.ws.WsControlFrame;
import swim.ws.WsRequest;
import swim.ws.WsResponse;
import static org.testng.Assert.assertEquals;

public abstract class WarpSocketBehaviors {

  protected final WarpSettings warpSettings;

  public WarpSocketBehaviors(WarpSettings warpSettings) {
    this.warpSettings = warpSettings;
  }

  protected abstract IpServiceRef bind(HttpEndpoint endpoint, HttpService service);

  protected abstract IpSocketRef connect(HttpEndpoint endpoint, WarpSocket socket);

  @Test
  public void testConnection() {
    final Theater stage = new Theater();
    final HttpEndpoint endpoint = new HttpEndpoint(stage);
    final CountDownLatch serverBind = new CountDownLatch(1);
    final CountDownLatch clientConnect = new CountDownLatch(1);
    final CountDownLatch clientUpgrade = new CountDownLatch(1);
    final CountDownLatch serverConnect = new CountDownLatch(1);
    final CountDownLatch serverUpgrade = new CountDownLatch(1);
    final AbstractWarpSocket clientSocket = new AbstractWarpSocket() {
      @Override
      public void didConnect() {
        clientConnect.countDown();
      }

      @Override
      public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
        clientUpgrade.countDown();
      }
    };
    final AbstractWarpSocket serverSocket = new AbstractWarpSocket() {
      @Override
      public void didConnect() {
        serverConnect.countDown();
      }

      @Override
      public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
        serverUpgrade.countDown();
      }
    };
    final AbstractWarpServer server = new AbstractWarpServer(WarpSocketBehaviors.this.warpSettings) {
      @Override
      public HttpResponder<?> doRequest(HttpRequest<?> httpRequest) {
        final WsRequest wsRequest = WsRequest.create(httpRequest);
        final WsResponse wsResponse = wsRequest.accept(WarpSocketBehaviors.this.warpSettings.wsSettings());
        return this.upgrade(serverSocket, wsResponse);
      }
    };
    final AbstractHttpService service = new AbstractHttpService() {
      @Override
      public HttpServer createServer() {
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
      this.bind(endpoint, service);
      serverBind.await();
      this.connect(endpoint, clientSocket);
      serverConnect.await();
      clientConnect.await();
      serverUpgrade.await();
      clientUpgrade.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      clientSocket.close();
      serverSocket.close();
      service.unbind();
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testSendReceive() {
    final Theater stage = new Theater();
    final HttpEndpoint endpoint = new HttpEndpoint(stage);
    final CountDownLatch clientWrite = new CountDownLatch(1);
    final CountDownLatch serverWrite = new CountDownLatch(1);
    final CountDownLatch clientRead = new CountDownLatch(1);
    final CountDownLatch serverRead = new CountDownLatch(1);
    final CommandMessage clientToServerCommand = new CommandMessage("a", "x");
    final CommandMessage serverToClientCommand = new CommandMessage("b", "y");
    final AbstractWarpSocket clientSocket = new AbstractWarpSocket() {
      @Override
      public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
        this.feed(clientToServerCommand);
      }

      @Override
      public void didRead(Envelope envelope) {
        assertEquals(envelope, serverToClientCommand);
        clientRead.countDown();
      }

      @Override
      public void didWrite(Envelope envelope) {
        assertEquals(envelope, clientToServerCommand);
        clientWrite.countDown();
      }
    };
    final AbstractWarpSocket serverSocket = new AbstractWarpSocket() {
      @Override
      public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
        this.feed(serverToClientCommand);
      }

      @Override
      public void didRead(Envelope envelope) {
        assertEquals(envelope, clientToServerCommand);
        serverRead.countDown();
      }

      @Override
      public void didWrite(Envelope envelope) {
        assertEquals(envelope, serverToClientCommand);
        serverWrite.countDown();
      }
    };
    final AbstractWarpServer server = new AbstractWarpServer(WarpSocketBehaviors.this.warpSettings) {
      @Override
      public HttpResponder<?> doRequest(HttpRequest<?> httpRequest) {
        final WsRequest wsRequest = WsRequest.create(httpRequest);
        final WsResponse wsResponse = wsRequest.accept(WarpSocketBehaviors.this.warpSettings.wsSettings());
        return this.upgrade(serverSocket, wsResponse);
      }
    };
    final AbstractHttpService service = new AbstractHttpService() {
      @Override
      public HttpServer createServer() {
        return server;
      }
    };

    try {
      stage.start();
      endpoint.start();
      this.bind(endpoint, service);
      this.connect(endpoint, clientSocket);
      clientWrite.await();
      serverWrite.await();
      clientRead.await();
      serverRead.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      clientSocket.close();
      serverSocket.close();
      service.unbind();
      endpoint.stop();
      stage.stop();
    }
  }

  @Test
  public void testRequestResponse() {
    final Theater stage = new Theater();
    final HttpEndpoint endpoint = new HttpEndpoint(stage);
    final CountDownLatch clientWrite = new CountDownLatch(1);
    final CountDownLatch serverWrite = new CountDownLatch(1);
    final CountDownLatch clientRead = new CountDownLatch(1);
    final CountDownLatch serverRead = new CountDownLatch(1);
    final LinkRequest linkRequest = new LinkRequest("node", "lane");
    final LinkedResponse linkedResponse = new LinkedResponse("node", "lane");
    final AbstractWarpSocket clientSocket = new AbstractWarpSocket() {
      @Override
      public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
        this.feed(linkRequest);
      }

      @Override
      public void didRead(Envelope envelope) {
        assertEquals(envelope, linkedResponse);
        clientRead.countDown();
      }

      @Override
      public void didWrite(Envelope envelope) {
        assertEquals(envelope, linkRequest);
        clientWrite.countDown();
      }
    };
    final AbstractWarpSocket serverSocket = new AbstractWarpSocket() {
      @Override
      public void didRead(Envelope envelope) {
        assertEquals(envelope, linkRequest);
        serverRead.countDown();
        this.feed(linkedResponse);
      }

      @Override
      public void didWrite(Envelope envelope) {
        assertEquals(envelope, linkedResponse);
        serverWrite.countDown();
      }
    };
    final AbstractWarpServer server = new AbstractWarpServer(WarpSocketBehaviors.this.warpSettings) {
      @Override
      public HttpResponder<?> doRequest(HttpRequest<?> httpRequest) {
        final WsRequest wsRequest = WsRequest.create(httpRequest);
        final WsResponse wsResponse = wsRequest.accept(WarpSocketBehaviors.this.warpSettings.wsSettings());
        return this.upgrade(serverSocket, wsResponse);
      }
    };
    final AbstractHttpService service = new AbstractHttpService() {
      @Override
      public HttpServer createServer() {
        return server;
      }
    };

    try {
      stage.start();
      endpoint.start();
      this.bind(endpoint, service);
      this.connect(endpoint, clientSocket);
      clientWrite.await();
      serverWrite.await();
      clientRead.await();
      serverRead.await();
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      clientSocket.close();
      serverSocket.close();
      service.unbind();
      endpoint.stop();
      stage.stop();
    }
  }

  protected void benchmark(int connections, final long duration, final Envelope envelope) {
    final Theater stage = new Theater();
    final HttpEndpoint endpoint = new HttpEndpoint(stage);
    final AtomicLong t0 = new AtomicLong();
    final AtomicLong dt = new AtomicLong();
    final AtomicLong count = new AtomicLong();
    final CountDownLatch clientDone = new CountDownLatch(connections);
    final CountDownLatch serverDone = new CountDownLatch(connections);
    final AtomicInteger permits = new AtomicInteger(1000);
    final long warmupDuration = 2000L;
    final long testDuration = warmupDuration + duration;

    try {
      stage.start();
      endpoint.start();
      System.out.println("Warming up for " + warmupDuration + " milliseconds...");
      this.bind(endpoint, new AbstractHttpService() {
        @Override
        public HttpServer createServer() {
          return new AbstractWarpServer(WarpSocketBehaviors.this.warpSettings) {
            @Override
            public HttpResponder<?> doRequest(HttpRequest<?> httpRequest) {
              final WsRequest wsRequest = WsRequest.create(httpRequest);
              final WsResponse wsResponse = wsRequest.accept(WarpSocketBehaviors.this.warpSettings.wsSettings());
              return this.upgrade(new AbstractWarpSocket() {
                boolean closed;

                @Override
                public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
                  t0.compareAndSet(0L, System.currentTimeMillis());
                  this.feed(envelope);
                }

                @Override
                public void doWrite() {
                  long oldDt;
                  long newDt;
                  do {
                    oldDt = dt.get();
                    newDt = System.currentTimeMillis() - t0.get();
                  } while ((oldDt < testDuration || newDt < testDuration) && !dt.compareAndSet(oldDt, newDt));
                  if (newDt >= testDuration) {
                    if (!this.closed) {
                      this.closed = true;
                      this.write(WsCloseFrame.create(1000));
                    }
                    return;
                  } else if (newDt >= warmupDuration) {
                    if (oldDt < warmupDuration) {
                      System.out.println("Benchmarking for " + warmupDuration + " milliseconds...");
                    }
                    final long newCount = count.incrementAndGet();
                    if (newCount % 1000000L == 0) {
                      final int rate = (int) (1000L * newCount / newDt);
                      System.out.println(newCount + " envelopes in " + newDt + " milliseconds (" + rate + " per second)");
                    }
                  }
                  int oldPermits;
                  int newPermits;
                  do {
                    oldPermits = permits.get();
                    newPermits = oldPermits - 1;
                    if (newPermits < 0) {
                      System.out.println("out of permits");
                      continue;
                    } else if (!permits.compareAndSet(oldPermits, newPermits)) {
                      continue;
                    }
                    break;
                  } while (true);
                  this.feed(new PullRequest<Envelope>() {
                    @Override
                    public float prio() {
                      return 0.0f;
                    }

                    @Override
                    public void pull(PullContext<? super Envelope> context) {
                      permits.incrementAndGet();
                      context.push(envelope);
                    }

                    @Override
                    public void drop(Throwable reason) {
                      permits.incrementAndGet();
                      throw new TestException("drop");
                    }

                    @Override
                    public boolean stay(StayContext context, int backlog) {
                      return true;
                    }
                  });
                }

                @Override
                public void didWrite(WsControlFrame<?, ?> frame) {
                  if (frame instanceof WsCloseFrame<?, ?>) {
                    serverDone.countDown();
                  }
                }
              }, wsResponse);
            }
          };
        }
      });
      final IpSocketRef[] clients = new IpSocketRef[connections];
      for (int connection = 0; connection < connections; connection += 1) {
        clients[connection] = this.connect(endpoint, new AbstractWarpSocket() {
          @Override
          public void didRead(WsControlFrame<?, ?> frame) {
            if (frame instanceof WsCloseFrame<?, ?>) {
              clientDone.countDown();
            }
          }
        });
      }
      clientDone.await();
      serverDone.await();
      for (int connection = 0; connection < connections; connection += 1) {
        clients[connection].close();
      }
      final int rate = (int) (1000L * count.get() / duration);
      System.out.println("Wrote " + count.get() + " envelopes over " + connections + " connections in " + duration + " milliseconds (" + rate + " per second)");
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      endpoint.stop();
      stage.stop();
    }
  }

  @Test(groups = {"benchmark"})
  public void benchmarkCommands() {
    final Value value = Record.create(1).attr("test");
    final CommandMessage envelope = new CommandMessage("node", "lane", value);
    this.benchmark(2 * Runtime.getRuntime().availableProcessors(), 2000L, envelope);
  }

}
