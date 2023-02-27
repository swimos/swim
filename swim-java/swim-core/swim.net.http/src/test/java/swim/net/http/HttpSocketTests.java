// Copyright 2015-2022 Swim.inc
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
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.platform.commons.JUnitException;
import swim.codec.Text;
import swim.exec.ThreadScheduler;
import swim.http.HttpBody;
import swim.http.HttpHeaders;
import swim.http.HttpMethod;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.header.ContentLengthHeader;
import swim.http.header.HostHeader;
import swim.net.AbstractNetListener;
import swim.net.TransportDriver;
import swim.util.Assume;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class HttpSocketTests {

  void testRequestResponsePipeline(int requestCount, HttpOptions httpOptions) {
    final CountDownLatch clientRequestLatch = new CountDownLatch(requestCount);
    final CountDownLatch clientResponseLatch = new CountDownLatch(requestCount);
    final CountDownLatch serverRequestLatch = new CountDownLatch(requestCount);
    final CountDownLatch serverResponseLatch = new CountDownLatch(requestCount);

    final TransportDriver driver = new TransportDriver();
    final ThreadScheduler scheduler = new ThreadScheduler();
    driver.setScheduler(scheduler);

    class TestRequester extends AbstractHttpRequester {

      @Override
      public void willWriteRequest() {
        final HttpBody<String> payload = HttpBody.of("clientToServer", Text.transcoder());
        final HttpHeaders headers = payload.headers().prepended(HostHeader.of("localhost"));
        final HttpRequest<?> request = HttpRequest.of(HttpMethod.POST, "/test", headers, payload);
        this.writeRequestMessage(request.write());
        this.writeRequestPayload(payload.encode());
      }

      @Override
      public void didWriteRequest() {
        clientRequestLatch.countDown();
      }

      @Override
      public void willReadResponseMessage() {
        this.readResponseMessage(HttpResponse.parse());
      }

      @Override
      public void willReadResponsePayload() {
        final HttpResponse<?> response = this.responseMessage().getNonNull();
        final long contentLength = Assume.nonNull(response.headers().getValue(ContentLengthHeader.TYPE)).longValue();
        this.readResponsePayload(HttpBody.decode(Text.transcoder(), contentLength));
      }

      @Override
      public void didReadResponse() {
        final HttpResponse<?> response = this.responseMessage().getNonNull();
        assertEquals(HttpStatus.OK, response.status());
        assertEquals("serverToClient", response.payload().get());
        clientResponseLatch.countDown();
      }

    }

    class TestClient extends AbstractHttpClient {

      @Override
      public void didOpen() {
        this.enqueueRequester(new TestRequester());
      }

      @Override
      public void didWriteRequest(HttpRequesterContext handler) {
        if (clientRequestLatch.getCount() != 0L) {
          this.enqueueRequester(new TestRequester());
        }
      }

      @Override
      public void didReadResponse(HttpRequesterContext handler) {
        if (clientRequestLatch.getCount() != 0L) {
          this.enqueueRequester(new TestRequester());
        } else {
          this.doneWriting();
        }
      }

    }

    class TestResponder extends AbstractHttpResponder {

      @Override
      public void willReadRequestMessage() {
        this.readRequestMessage(HttpRequest.parse());
      }

      @Override
      public void willReadRequestPayload() {
        final HttpRequest<?> request = this.requestMessage().getNonNull();
        final long contentLength = Assume.nonNull(request.headers().getValue(ContentLengthHeader.TYPE)).longValue();
        this.readRequestPayload(HttpBody.decode(Text.transcoder(), contentLength));
      }

      @Override
      public void didReadRequest() {
        final HttpRequest<?> request = this.requestMessage().getNonNull();
        assertEquals("/test", request.target());
        assertEquals("clientToServer", request.payload().get());
        serverRequestLatch.countDown();
      }

      @Override
      public void willWriteResponse() {
        final HttpBody<String> payload = HttpBody.of("serverToClient", Text.transcoder());
        final HttpResponse<String> response = HttpResponse.of(HttpStatus.OK, payload.headers(), payload);
        this.writeResponseMessage(response.write());
        this.writeResponsePayload(payload.encode());
      }

      @Override
      public void didWriteResponse() {
        serverResponseLatch.countDown();
      }

    }

    class TestServer extends AbstractHttpServer {

      @Override
      public void didOpen() {
        this.enqueueRequester(new TestResponder());
      }

      @Override
      public void didReadRequest(HttpResponderContext handler) {
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
        final HttpServerSocket serverSocket = new HttpServerSocket(server, httpOptions);
        this.accept(serverSocket);
        this.requestAccept();
      }

    }

    try {
      scheduler.start();
      driver.start();

      final TestListener listener = new TestListener();
      driver.bindTcpListener(listener).listen("127.0.0.1", 33556);

      final TestClient client = new TestClient();
      final HttpClientSocket clientSocket = new HttpClientSocket(client, httpOptions);
      driver.bindTcpSocket(clientSocket).connect("127.0.0.1", 33556);

      clientRequestLatch.await();
      clientResponseLatch.await();
      serverRequestLatch.await();
      serverResponseLatch.await();
    } catch (InterruptedException cause) {
      throw new JUnitException("Interrupted", cause);
    } finally {
      driver.stop();
      scheduler.stop();
    }
  }

  @Test
  public void testSingleRequestResponse() {
    this.testRequestResponsePipeline(1, HttpOptions.standard());
  }

  @Test
  public void testPipelinedRequestResponse() {
    this.testRequestResponsePipeline(1000, HttpOptions.standard());
  }

  @Test
  @Tag("benchmark")
  public void benchmarkRequestResponses() {
    final int requestCount = 1000000;
    final HttpOptions httpOptions =
        HttpOptions.standard().clientPipelineLength(32)
                              .serverPipelineLength(32);

    System.out.println("Warming up ...");
    this.testRequestResponsePipeline(requestCount, httpOptions);

    System.out.println("Benchmarking ...");
    final long t0 = System.currentTimeMillis();
    this.testRequestResponsePipeline(requestCount, httpOptions);
    final long dt = System.currentTimeMillis() - t0;
    final long rate = Math.round((double) requestCount * 1000.0 / (double) dt);
    System.out.println("Processed " + requestCount + " requests in " + dt + "ms (" + rate + " requests per second)");
  }

}
