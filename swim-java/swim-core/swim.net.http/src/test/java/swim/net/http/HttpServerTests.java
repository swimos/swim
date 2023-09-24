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
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import swim.codec.Text;
import swim.exec.ThreadScheduler;
import swim.http.HttpBody;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.net.AbstractNetListener;
import swim.net.TransportDriver;
import swim.util.Result;

public class HttpServerTests {

  @Test
  @Tag("manual")
  public void testServer() throws InterruptedException {
    final CountDownLatch finishedLatch = new CountDownLatch(1);

    final TransportDriver driver = new TransportDriver();
    final ThreadScheduler scheduler = new ThreadScheduler();
    driver.setScheduler(scheduler);

    class TestResponder extends AbstractHttpResponder {

      @Override
      public void willWriteResponse() {
        final HttpBody<String> payload = HttpBody.of("Hello, world!\n", Text.stringCodec());
        //final HttpChunked<String> payload = HttpChunked.of("Hello, world!\n", Text.stringCodec());
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
        final HttpServerSocket socket = new HttpServerSocket(server, HttpOptions.standard());
        this.accept(socket);
        this.requestAccept();
      }

    }

    try {
      scheduler.start();
      driver.start();

      final TestListener listener = new TestListener();
      driver.bindTcpListener(listener).listen("127.0.0.1", 33556);
      finishedLatch.await();
    } finally {
      driver.stop();
      scheduler.stop();
    }
  }

}
