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

package swim.net.ws;

import java.io.IOException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Semaphore;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import swim.exec.ThreadScheduler;
import swim.http.HttpRequest;
import swim.net.AbstractNetListener;
import swim.net.TransportDriver;
import swim.net.http.AbstractHttpClient;
import swim.net.http.AbstractHttpServer;
import swim.net.http.HttpClientSocket;
import swim.net.http.HttpOptions;
import swim.net.http.HttpResponderContext;
import swim.net.http.HttpServerSocket;
import swim.uri.Uri;
import swim.util.Result;
import swim.ws.Ws;
import swim.ws.WsCloseFrame;
import swim.ws.WsContinuation;
import swim.ws.WsEngine;
import swim.ws.WsFrame;
import swim.ws.WsOptions;
import swim.ws.WsTextFrame;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class WebSocketTests {

  @Test
  public void testWebSocketConnection() throws InterruptedException {
    final HttpOptions httpOptions = HttpOptions.standard();
    final WsEngine clientEngine = Ws.clientEngine();
    final WsEngine serverEngine = Ws.serverEngine();

    final CountDownLatch clientCloseLatch = new CountDownLatch(1);
    final CountDownLatch serverCloseLatch = new CountDownLatch(1);

    final TransportDriver driver = new TransportDriver();
    final ThreadScheduler scheduler = new ThreadScheduler();
    driver.setScheduler(scheduler);

    class TestClientSocket extends AbstractWebSocket {

      @Override
      public void didOpen() {
        this.writeFrame(WsTextFrame.of("clientToServer"));
      }

      @Override
      public void didReadFrame(Result<? extends WsFrame<?>> result) {
        final WsFrame<?> frame = result.getNonNull();
        if (frame instanceof WsTextFrame<?>) {
          assertEquals("serverToClient", frame.get());
          this.writeFrame(WsCloseFrame.empty());
        } else if (frame instanceof WsCloseFrame<?>) {
          clientCloseLatch.countDown();
        }
      }

    }

    class TestClient extends AbstractHttpClient {

      final WsEngine engine;
      final HttpRequest<?> handshakeRequest;

      TestClient(WsEngine engine, HttpRequest<?> handshakeRequest) {
        this.engine = engine;
        this.handshakeRequest = handshakeRequest;
      }

      @Override
      public void didOpen() {
        this.enqueueRequester(new WebSocketRequester(new TestClientSocket(),
                                                     this.engine,
                                                     this.handshakeRequest));
      }

    }

    class TestServerSocket extends AbstractWebSocket {

      @Override
      public void didOpen() {
        this.writeFrame(WsTextFrame.of("serverToClient"));
      }

      @Override
      public void didReadFrame(Result<? extends WsFrame<?>> result) {
        final WsFrame<?> frame = result.getNonNull();
        if (frame instanceof WsTextFrame<?>) {
          assertEquals("clientToServer", frame.get());
          this.writeFrame(WsCloseFrame.empty());
        } else if (frame instanceof WsCloseFrame<?>) {
          serverCloseLatch.countDown();
        }
      }

    }

    class TestServer extends AbstractHttpServer {

      final WsEngine engine;

      TestServer(WsEngine engine) {
        this.engine = engine;
      }

      @Override
      public void didOpen() {
        this.enqueueRequester(new WebSocketResponder(new TestServerSocket(), this.engine));
      }

      @Override
      public void didReadRequest(Result<HttpRequest<?>> requestResult, HttpResponderContext handler) {
        this.enqueueRequester(new WebSocketResponder(new TestServerSocket(), this.engine));
      }

    }

    class TestListener extends AbstractNetListener {

      final WsEngine engine;

      TestListener(WsEngine engine) {
        this.engine = engine;
      }

      @Override
      public void didListen() {
        this.requestAccept();
      }

      @Override
      public void doAccept() throws IOException {
        final TestServer server = new TestServer(this.engine);
        final HttpServerSocket serverSocket = new HttpServerSocket(server, httpOptions);
        this.accept(serverSocket);
        this.requestAccept();
      }

    }

    try {
      scheduler.start();
      driver.start();

      final TestListener listener = new TestListener(serverEngine);
      driver.bindTcpListener(listener).listen("127.0.0.1", 33556);

      final Uri uri = Uri.hostName("localhost").withPortNumber(33556).withPath("/");
      final TestClient client = new TestClient(clientEngine, clientEngine.handshakeRequest(uri));
      final HttpClientSocket clientSocket = new HttpClientSocket(client, httpOptions);
      driver.bindTcpSocket(clientSocket).connect("127.0.0.1", 33556);

      clientCloseLatch.await();
      serverCloseLatch.await();
    } finally {
      driver.stop();
      scheduler.stop();
    }
  }

  public long testThroughput(int messageCount, int clientCount,
                             HttpOptions httpOptions, WsEngine clientEngine,
                             WsEngine serverEngine, String payload) throws InterruptedException {
    final Semaphore messageSemaphore = new Semaphore(messageCount);
    final CountDownLatch clientCloseLatch = new CountDownLatch(clientCount);
    final CountDownLatch serverCloseLatch = new CountDownLatch(clientCount);

    final TransportDriver driver = new TransportDriver();
    final ThreadScheduler scheduler = new ThreadScheduler();
    driver.setScheduler(scheduler);

    class TestClientSocket extends AbstractWebSocket {

      @Override
      public void didReadFrame(Result<? extends WsFrame<?>> result) {
        final WsFrame<?> frame = result.getNonNull();
        if (frame instanceof WsTextFrame<?>) {
          // received
        } else if (frame instanceof WsCloseFrame<?>) {
          clientCloseLatch.countDown();
        } else {
          throw new AssertionError("unreachable");
        }
      }

    }

    class TestClient extends AbstractHttpClient {

      final WsEngine engine;
      final HttpRequest<?> handshakeRequest;

      TestClient(WsEngine engine, HttpRequest<?> handshakeRequest) {
        this.engine = engine;
        this.handshakeRequest = handshakeRequest;
      }

      @Override
      public void didOpen() {
        this.enqueueRequester(new WebSocketRequester(new TestClientSocket(),
                                                     this.engine,
                                                     this.handshakeRequest));
      }

    }

    class TestServerSocket extends AbstractWebSocket {

      @Override
      public void didOpen() {
        this.writeFrame(WsTextFrame.of(payload));
      }

      @Override
      public void didWriteFrame(Result<? extends WsFrame<?>> result) {
        final WsFrame<?> frame = result.getNonNull();
        if (frame instanceof WsContinuation<?>) {
          this.writeContinuation();
        } else if (frame instanceof WsTextFrame<?>) {
          if (messageSemaphore.tryAcquire()) {
            this.writeFrame(WsTextFrame.of(payload));
          } else {
            this.writeFrame(WsCloseFrame.empty());
          }
        } else if (frame instanceof WsCloseFrame<?>) {
          serverCloseLatch.countDown();
        } else {
          throw new AssertionError("unreachable");
        }
      }

    }

    class TestServer extends AbstractHttpServer {

      final WsEngine engine;

      TestServer(WsEngine engine) {
        this.engine = engine;
      }

      @Override
      public void didOpen() {
        this.enqueueRequester(new WebSocketResponder(new TestServerSocket(), this.engine));
      }

      @Override
      public void didReadRequest(Result<HttpRequest<?>> requestResult, HttpResponderContext handler) {
        this.enqueueRequester(new WebSocketResponder(new TestServerSocket(), this.engine));
      }

    }

    class TestListener extends AbstractNetListener {

      final WsEngine engine;

      TestListener(WsEngine engine) {
        this.engine = engine;
      }

      @Override
      public void didListen() {
        this.requestAccept();
      }

      @Override
      public void doAccept() throws IOException {
        final TestServer server = new TestServer(this.engine);
        final HttpServerSocket serverSocket = new HttpServerSocket(server, httpOptions);
        this.accept(serverSocket);
        this.requestAccept();
      }

    }

    try {
      scheduler.start();
      driver.start();

      final long t0 = System.currentTimeMillis();

      final TestListener listener = new TestListener(serverEngine);
      driver.bindTcpListener(listener).listen("127.0.0.1", 33556);

      final Uri uri = Uri.hostName("localhost").withPortNumber(33556).withPath("/");
      for (int i = 0; i < clientCount; i += 1) {
        final TestClient client = new TestClient(clientEngine, clientEngine.handshakeRequest(uri));
        final HttpClientSocket clientSocket = new HttpClientSocket(client, httpOptions);
        driver.bindTcpSocket(clientSocket).connect("127.0.0.1", 33556);
      }

      clientCloseLatch.await();
      serverCloseLatch.await();

      return System.currentTimeMillis() - t0;
    } finally {
      driver.stop();
      scheduler.stop();
    }
  }

  @Test
  @Tag("benchmark")
  public void benchmarkWebSocketThroughput() throws InterruptedException {
    final int messageCount = 1000000;
    final int clientCount = 2;
    final HttpOptions httpOptions = HttpOptions.standard();
    final WsOptions wsOptions = WsOptions.noCompression();
    final WsEngine clientEngine = Ws.clientEngine(wsOptions);
    final WsEngine serverEngine = Ws.serverEngine(wsOptions);

    System.out.println("Warming up ...");
    this.testThroughput(messageCount, clientCount, httpOptions, clientEngine, serverEngine, "echoechoechoecho");

    System.out.println("Benchmarking ...");
    final long dt = this.testThroughput(messageCount, clientCount, httpOptions, clientEngine, serverEngine, "echoechoechoecho");
    final long rate = Math.round((double) messageCount * 1000.0 / (double) dt);
    System.out.println("Processed " + messageCount + " messages across " + clientCount + " clients in " + dt + "ms (" + rate + " messages per second)");
  }

  @Test
  @Tag("benchmark")
  public void benchmarkWebSocketPermessageDeflateThroughput() throws InterruptedException {
    final int messageCount = 1000000;
    final int clientCount = Runtime.getRuntime().availableProcessors();
    final HttpOptions httpOptions = HttpOptions.standard();
    final WsOptions wsOptions = WsOptions.defaultCompression();
    final WsEngine clientEngine = Ws.clientEngine(wsOptions);
    final WsEngine serverEngine = Ws.serverEngine(wsOptions);

    System.out.println("Warming up ...");
    this.testThroughput(messageCount, clientCount, httpOptions, clientEngine, serverEngine, "echoechoechoecho");

    System.out.println("Benchmarking ...");
    final long dt = this.testThroughput(messageCount, clientCount, httpOptions, clientEngine, serverEngine, "echoechoechoecho");
    final long rate = Math.round((double) messageCount * 1000.0 / (double) dt);
    System.out.println("Processed " + messageCount + " messages across " + clientCount + " clients in " + dt + "ms (" + rate + " messages per second)");
  }

}
