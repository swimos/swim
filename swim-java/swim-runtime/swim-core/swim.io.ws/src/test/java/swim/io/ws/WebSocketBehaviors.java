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

package swim.io.ws;

import java.nio.charset.Charset;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.codec.Utf8;
import swim.concurrent.Theater;
import swim.deflate.Deflate;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.IpServiceRef;
import swim.io.IpSocketRef;
import swim.io.http.AbstractHttpService;
import swim.io.http.HttpEndpoint;
import swim.io.http.HttpResponder;
import swim.io.http.HttpServer;
import swim.io.http.HttpService;
import swim.structure.Data;
import swim.ws.WsCloseFrame;
import swim.ws.WsDataFrame;
import swim.ws.WsDeflateEncoder;
import swim.ws.WsEncoder;
import swim.ws.WsFragmentFrame;
import swim.ws.WsFrame;
import swim.ws.WsPingFrame;
import swim.ws.WsPongFrame;
import swim.ws.WsRequest;
import swim.ws.WsResponse;
import swim.ws.WsTextFrame;
import static org.testng.Assert.assertEquals;

public abstract class WebSocketBehaviors {

  protected final WsSettings wsSettings;

  public WebSocketBehaviors(WsSettings wsSettings) {
    this.wsSettings = wsSettings;
  }

  protected abstract IpServiceRef bind(HttpEndpoint endpoint, HttpService service);

  protected abstract IpSocketRef connect(HttpEndpoint endpoint, WebSocket<?, ?> socket);

  @Test
  public void testConnection() {
    final Theater stage = new Theater();
    final HttpEndpoint endpoint = new HttpEndpoint(stage);
    final CountDownLatch serverBind = new CountDownLatch(1);
    final CountDownLatch serverConnect = new CountDownLatch(1);
    final CountDownLatch clientConnect = new CountDownLatch(1);
    final CountDownLatch serverUpgrade = new CountDownLatch(1);
    final CountDownLatch clientUpgrade = new CountDownLatch(1);
    final AbstractWebSocket<Object, Object> clientSocket = new AbstractWebSocket<Object, Object>() {
      @Override
      public void didConnect() {
        clientConnect.countDown();
      }

      @Override
      public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
        clientUpgrade.countDown();
      }
    };
    final AbstractWebSocket<Object, Object> serverSocket = new AbstractWebSocket<Object, Object>() {
      @Override
      public void didConnect() {
        serverConnect.countDown();
      }

      @Override
      public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
        serverUpgrade.countDown();
      }
    };
    final AbstractWsServer server = new AbstractWsServer(WebSocketBehaviors.this.wsSettings) {
      @Override
      public HttpResponder<?> doRequest(HttpRequest<?> httpRequest) {
        final WsRequest wsRequest = WsRequest.create(httpRequest);
        final WsResponse wsResponse = wsRequest.accept(WebSocketBehaviors.this.wsSettings);
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
  public void testReadWrite() {
    final Theater stage = new Theater();
    final HttpEndpoint endpoint = new HttpEndpoint(stage);
    final CountDownLatch clientWrite = new CountDownLatch(1);
    final CountDownLatch serverWrite = new CountDownLatch(1);
    final CountDownLatch clientRead = new CountDownLatch(1);
    final CountDownLatch serverRead = new CountDownLatch(1);
    final AbstractWebSocket<String, String> clientSocket = new AbstractWebSocket<String, String>() {
      @Override
      public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
        this.read(Utf8.stringParser());
        this.write(WsTextFrame.create("@clientToServer"));
      }

      @Override
      public void didRead(WsFrame<? extends String> frame) {
        assertEquals(frame, WsTextFrame.create("@serverToClient"));
        clientRead.countDown();
      }

      @Override
      public void didWrite(WsFrame<? extends String> frame) {
        assertEquals(frame, WsTextFrame.create("@clientToServer"));
        clientWrite.countDown();
      }
    };
    final AbstractWebSocket<String, String> serverSocket = new AbstractWebSocket<String, String>() {
      @Override
      public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
        this.read(Utf8.stringParser());
        this.write(WsTextFrame.create("@serverToClient"));
      }

      @Override
      public void didRead(WsFrame<? extends String> frame) {
        assertEquals(frame, WsTextFrame.create("@clientToServer"));
        serverRead.countDown();
      }

      @Override
      public void didWrite(WsFrame<? extends String> frame) {
        assertEquals(frame, WsTextFrame.create("@serverToClient"));
        serverWrite.countDown();
      }
    };
    final AbstractWsServer server = new AbstractWsServer(WebSocketBehaviors.this.wsSettings) {
      @Override
      public HttpResponder<?> doRequest(HttpRequest<?> httpRequest) {
        final WsRequest wsRequest = WsRequest.create(httpRequest);
        final WsResponse wsResponse = wsRequest.accept(WebSocketBehaviors.this.wsSettings);
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
  public void testPingPong() {
    final Theater stage = new Theater();
    final HttpEndpoint endpoint = new HttpEndpoint(stage);
    final Data pingData = Data.wrap("@ping".getBytes(Charset.forName("UTF-8")));
    final Data pongData = Data.wrap("@pong".getBytes(Charset.forName("UTF-8")));
    final CountDownLatch clientWritePing = new CountDownLatch(1);
    final CountDownLatch serverReadPing = new CountDownLatch(1);
    final CountDownLatch serverWritePong = new CountDownLatch(1);
    final CountDownLatch clientReadPong = new CountDownLatch(1);
    final AbstractWebSocket<String, String> clientSocket = new AbstractWebSocket<String, String>() {
      @Override
      public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
        this.read(Utf8.stringParser());
        this.write(WsPingFrame.create(pingData));
      }

      @Override
      public void didRead(WsFrame<? extends String> frame) {
        assertEquals(frame, WsPongFrame.create(pongData));
        clientReadPong.countDown();
      }

      @Override
      public void didWrite(WsFrame<? extends String> frame) {
        assertEquals(frame, WsPingFrame.create(pingData));
        clientWritePing.countDown();
      }
    };
    final AbstractWebSocket<String, String> serverSocket = new AbstractWebSocket<String, String>() {
      @Override
      public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
        this.read(Utf8.stringParser());
      }

      @Override
      public void didRead(WsFrame<? extends String> frame) {
        assertEquals(frame, WsPingFrame.create(pingData));
        serverReadPing.countDown();
        this.write(WsPongFrame.create(pongData));
      }

      @Override
      public void didWrite(WsFrame<? extends String> frame) {
        assertEquals(frame, WsPongFrame.create(pongData));
        serverWritePong.countDown();
      }
    };
    final AbstractWsServer server = new AbstractWsServer(WebSocketBehaviors.this.wsSettings) {
      @Override
      public HttpResponder<?> doRequest(HttpRequest<?> httpRequest) {
        final WsRequest wsRequest = WsRequest.create(httpRequest);
        final WsResponse wsResponse = wsRequest.accept(WebSocketBehaviors.this.wsSettings);
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
      clientWritePing.await();
      serverReadPing.await();
      serverWritePong.await();
      clientReadPong.await();
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
  public void testCloseHandshake() {
    final Theater stage = new Theater();
    final HttpEndpoint endpoint = new HttpEndpoint(stage);
    final CountDownLatch clientWriteClose = new CountDownLatch(1);
    final CountDownLatch serverReadClose = new CountDownLatch(1);
    final CountDownLatch serverWriteClose = new CountDownLatch(1);
    final CountDownLatch clientReadClose = new CountDownLatch(1);
    final AbstractWebSocket<String, String> clientSocket = new AbstractWebSocket<String, String>() {
      @Override
      public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
        this.read(Utf8.stringParser());
        this.write(WsCloseFrame.create(1000, "close"));
      }

      @Override
      public void didRead(WsFrame<? extends String> frame) {
        assertEquals(frame, WsCloseFrame.create(1001, "gone"));
        clientReadClose.countDown();
      }

      @Override
      public void didWrite(WsFrame<? extends String> frame) {
        assertEquals(frame, WsCloseFrame.create(1000, "close"));
        clientWriteClose.countDown();
      }
    };
    final AbstractWebSocket<String, String> serverSocket = new AbstractWebSocket<String, String>() {
      @Override
      public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
        this.read(Utf8.stringParser());
      }

      @Override
      public void didRead(WsFrame<? extends String> frame) {
        assertEquals(frame, WsCloseFrame.create(1000, "close"));
        serverReadClose.countDown();
        this.write(WsCloseFrame.create(1001, "gone"));
      }

      @Override
      public void didWrite(WsFrame<? extends String> frame) {
        assertEquals(frame, WsCloseFrame.create(1001, "gone"));
        serverWriteClose.countDown();
      }
    };
    final AbstractWsServer server = new AbstractWsServer(WebSocketBehaviors.this.wsSettings) {
      @Override
      public HttpResponder<?> doRequest(HttpRequest<?> httpRequest) {
        final WsRequest wsRequest = WsRequest.create(httpRequest);
        final WsResponse wsResponse = wsRequest.accept(WebSocketBehaviors.this.wsSettings);
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
      clientWriteClose.await();
      serverReadClose.await();
      serverWriteClose.await();
      clientReadClose.await();
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

  protected void benchmark(int connections, final long duration, final String payload) {
    final Theater stage = new Theater();
    final HttpEndpoint endpoint = new HttpEndpoint(stage);
    final AtomicLong t0 = new AtomicLong();
    final AtomicLong dt = new AtomicLong();
    final AtomicInteger count = new AtomicInteger();
    final AtomicLong in = new AtomicLong();
    final AtomicLong out = new AtomicLong();
    final CountDownLatch clientDone = new CountDownLatch(connections);
    final CountDownLatch serverDone = new CountDownLatch(connections);

    try {
      stage.start();
      endpoint.start();
      System.out.println("Warming up for " + duration + " milliseconds...");
      this.bind(endpoint, new AbstractHttpService() {
        @Override
        public HttpServer createServer() {
          return new AbstractWsServer(WebSocketBehaviors.this.wsSettings) {
            @Override
            public HttpResponder<?> doRequest(HttpRequest<?> httpRequest) {
              final WsRequest wsRequest = WsRequest.create(httpRequest);
              final WsResponse wsResponse = wsRequest.accept(WebSocketBehaviors.this.wsSettings);
              return this.upgrade(new AbstractWebSocket<String, String>() {
                boolean closed;

                @Override
                public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
                  t0.compareAndSet(0L, System.currentTimeMillis());
                  this.read(Utf8.stringParser());
                  this.write(WsTextFrame.create(payload));
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
                    if (!this.closed) {
                      this.closed = true;
                      this.write(WsCloseFrame.create(1000));
                    }
                    return;
                  } else if (newDt >= duration) {
                    if (oldDt < duration) {
                      System.out.println("Benchmarking for " + duration + " milliseconds...");
                    }
                    count.incrementAndGet();
                  }
                  this.write(WsTextFrame.create(payload));
                }

                @Override
                public void didWrite(WsFrame<? extends String> frame) {
                  if (frame instanceof WsCloseFrame<?, ?>) {
                    final WsEncoder encoder = ((WebSocketModem) context).encoder;
                    if (encoder instanceof WsDeflateEncoder) {
                      final Deflate<?> deflate = ((WsDeflateEncoder) encoder).deflate();
                      in.addAndGet(deflate.total_in);
                      out.addAndGet(deflate.total_out);
                    }
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
        clients[connection] = this.connect(endpoint, new AbstractWebSocket<String, String>() {
          @Override
          public void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse) {
            this.read(Utf8.stringParser());
          }

          @Override
          public void didRead(WsFrame<? extends String> frame) {
            if (frame instanceof WsDataFrame<?>) {
              this.read(Utf8.stringParser());
            } else if (frame instanceof WsFragmentFrame<?>) {
              final WsFragmentFrame<? extends String> fragment = (WsFragmentFrame<? extends String>) frame;
              this.read(fragment.frameType(), fragment.payloadDecoder());
            } else if (frame instanceof WsCloseFrame<?, ?>) {
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
      System.out.println("Wrote " + count.get() + " messages over " + connections + " connections in " + duration + " milliseconds (" + rate + " per second)");
      if (in.get() > 0L && out.get() > 0L) {
        final int ratio = 100 - (int) (((double) out.get() / (double) in.get()) * 100.0);
        System.out.println("Compressed " + in.get() + " bytes into " + out.get() + " bytes (" + ratio + "% size reduction)");
      }
    } catch (InterruptedException cause) {
      throw new TestException(cause);
    } finally {
      endpoint.stop();
      stage.stop();
    }
  }

  @Test(groups = {"benchmark"})
  public void benchmarkSmallFrames() {
    final StringBuilder payload = new StringBuilder();
    for (int i = 0; i < 32; i += 1) {
      payload.append("test");
    }
    this.benchmark(2 * Runtime.getRuntime().availableProcessors(), 2000L, payload.toString());
  }

  @Test(groups = {"benchmark"})
  public void benchmarkLargeFrames() {
    final StringBuilder payload = new StringBuilder();
    for (int i = 0; i < 256; i += 1) {
      payload.append("test");
    }
    this.benchmark(2 * Runtime.getRuntime().availableProcessors(), 2000L, payload.toString());
  }

}
