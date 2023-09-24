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

package swim.net.http;

import java.io.IOException;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Semaphore;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import swim.codec.Text;
import swim.exec.ThreadScheduler;
import swim.http.HttpBody;
import swim.http.HttpHeaders;
import swim.http.HttpMethod;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.header.HostHeader;
import swim.net.AbstractNetListener;
import swim.net.TransportDriver;
import swim.util.Result;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class HttpSocketTests {

  long testRequestResponsePipeline(int requestCount, int clientCount, HttpOptions options) throws InterruptedException {
    final Semaphore requestSemaphore = new Semaphore(requestCount);
    final CountDownLatch clientCloseLatch = new CountDownLatch(clientCount);

    final TransportDriver driver = new TransportDriver();
    final ThreadScheduler scheduler = new ThreadScheduler();
    driver.setScheduler(scheduler);

    class TestRequester extends AbstractHttpRequester {

      @Override
      public void willWriteRequest() {
        final HttpBody<String> payload = HttpBody.of("clientToServer", Text.stringCodec());
        final HttpHeaders headers = payload.headers().prepended(HostHeader.of("localhost"));
        final HttpRequest<?> request = HttpRequest.of(HttpMethod.POST, "/test", headers, payload);
        this.writeRequest(request);
      }

      @Override
      public void didReadResponse(Result<HttpResponse<?>> responseResult) {
        final HttpResponse<?> response = responseResult.getNonNull();
        assertEquals(HttpStatus.OK, response.status());
        assertEquals("serverToClient", response.payload().get());
      }

    }

    class TestClient extends AbstractHttpClient {

      boolean backoff = false;

      void enqueueRequest() {
        if (requestSemaphore.tryAcquire()) {
          if (this.enqueueRequester(new TestRequester())) {
            this.backoff = false;
          } else {
            requestSemaphore.release();
            this.backoff = true;
          }
        } else {
          this.backoff = false;
        }
      }

      @Override
      public void didOpen() {
        this.enqueueRequest();
      }

      @Override
      public void didWriteRequest(Result<HttpRequest<?>> requestResult, HttpRequesterContext handler) {
        this.enqueueRequest();
      }

      @Override
      public void didReadResponse(Result<HttpResponse<?>> responseResult, HttpRequesterContext handler) {
        if (this.backoff) {
          this.enqueueRequest();
        }
        if (!this.isRequesting() && !this.isResponding()) {
          this.doneWriting();
        }
      }

      @Override
      public void didClose() {
        clientCloseLatch.countDown();
      }

    }

    class TestResponder extends AbstractHttpResponder {

      @Override
      public void didReadRequest(Result<HttpRequest<?>> requestResult) {
        final HttpRequest<?> request = requestResult.getNonNull();
        assertEquals("/test", request.target());
        assertEquals("clientToServer", request.payload().get());
      }

      @Override
      public void willWriteResponse() {
        final HttpBody<String> payload = HttpBody.of("serverToClient", Text.stringCodec());
        final HttpResponse<String> response = HttpResponse.of(HttpStatus.OK, payload.headers(), payload);
        this.writeResponse(response);
      }

    }

    class TestServer extends AbstractHttpServer {

      @Override
      public void didOpen() {
        this.enqueueRequester(new TestResponder());
      }

      @Override
      public void didReadRequest(Result<HttpRequest<?>> requestResult, HttpResponderContext handler) {
        this.enqueueRequester(new TestResponder());
      }

    }

    class TestListener extends AbstractNetListener {

      @Override
      public void didListen() {
        this.requestAccept();
      }

      @Override
      public void doAccept() throws IOException {
        final TestServer server = new TestServer();
        final HttpServerSocket serverSocket = new HttpServerSocket(server, options);
        this.accept(serverSocket);
        this.requestAccept();
      }

    }

    try {
      scheduler.start();
      driver.start();

      final long t0 = System.currentTimeMillis();

      final TestListener listener = new TestListener();
      driver.bindTcpListener(listener).listen("127.0.0.1", 33556);

      for (int i = 0; i < clientCount; i += 1) {
        final TestClient client = new TestClient();
        final HttpClientSocket clientSocket = new HttpClientSocket(client, options);
        driver.bindTcpSocket(clientSocket).connect("127.0.0.1", 33556);
      }

      clientCloseLatch.await();

      return System.currentTimeMillis() - t0;
    } finally {
      driver.stop();
      scheduler.stop();
    }
  }

  @Test
  public void testSingleRequestResponse() throws InterruptedException {
    this.testRequestResponsePipeline(1, 1, HttpOptions.standard());
  }

  @Test
  public void testPipelinedRequestResponse() throws InterruptedException {
    this.testRequestResponsePipeline(1000, 1, HttpOptions.standard());
  }

  @Test
  @Tag("benchmark")
  public void benchmarkRequestResponses() throws InterruptedException {
    final int requestCount = 1000000;
    final int clientCount = Runtime.getRuntime().availableProcessors();
    final HttpOptions options =
        HttpOptions.standard().clientPipelineLength(128)
                              .serverPipelineLength(128);

    System.out.println("Warming up ...");
    this.testRequestResponsePipeline(requestCount, clientCount, options);

    System.out.println("Benchmarking ...");
    final long dt = this.testRequestResponsePipeline(requestCount, clientCount, options);
    final long rate = Math.round((double) requestCount * 1000.0 / (double) dt);
    System.out.println("Responded to " + requestCount + " requests across " + clientCount + " clients in " + dt + "ms (" + rate + " requests per second)");
  }

}
