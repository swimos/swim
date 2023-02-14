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
import java.nio.ByteBuffer;
import java.util.concurrent.CountDownLatch;
import org.junit.jupiter.api.Test;
import org.junit.platform.commons.JUnitException;
import swim.annotations.Nullable;
import swim.codec.Text;
import swim.exec.ThreadScheduler;
import swim.http.HttpBody;
import swim.http.HttpChunked;
import swim.http.HttpEmpty;
import swim.http.HttpPayload;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.net.AbstractNetListener;
import swim.net.TransportDriver;
import swim.util.Assume;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class HttpServerTests {

  @Test
  public void testServer() {
    final CountDownLatch finishedLatch = new CountDownLatch(1);

    final TransportDriver driver = new TransportDriver();
    final ThreadScheduler scheduler = new ThreadScheduler();
    driver.setScheduler(scheduler);

    class TestResponder extends AbstractHttpResponder {

      //@Override
      //public void willReadRequest() {
      //  // hook
      //}

      @Override
      public void willReadRequestMessage() {
        this.readRequestMessage(HttpRequest.parse());
      }

      //@Override
      //public void didReadRequestMessage(HttpRequest<?> request) {
      //  // hook
      //}

      @Override
      public void willReadRequestPayload(HttpRequest<?> request) {
        this.readRequestPayload(HttpEmpty.decode());
      }

      //@Override
      //public void didReadRequestPayload(HttpRequest<?> request) {
      //  // hook
      //}

      //@Override
      //public void didReadRequest(HttpRequest<?> request) {
      //  final HttpBody<String> payload = HttpBody.create("Hello, world!\n", Text.transcoder());
      //  final HttpResponse<String> message = HttpResponse.create(HttpStatus.OK, payload.headers(), payload);
      //  this.writeResponseMessage(message.write());
      //  this.writeResponsePayload(payload.encode());
      //}

      @Override
      public void willWriteResponse(HttpRequest<?> request) {
        final HttpBody<String> payload = HttpBody.create("Hello, world!\n", Text.transcoder());
        //final HttpChunked<String> payload = HttpChunked.create("Hello, world!\n", Text.transcoder());
        final HttpResponse<String> message = HttpResponse.create(HttpStatus.OK, payload.headers(), payload);
        this.writeResponseMessage(message.write());
        this.writeResponsePayload(payload.encode());
      }

      //@Override
      //public void willWriteResponseMessage(HttpRequest<?> request) {
      //  // hook
      //}

      //@Override
      //public void didWriteResponseMessage(HttpRequest<?> request, HttpResponse<?> response) {
      //  // hook
      //}

      //@Override
      //public void willWriteResponsePayload(HttpRequest<?> request, HttpResponse<?> response) {
      //  // hook
      //}

      //@Override
      //public void didWriteResponsePayload(HttpRequest<?> request, HttpResponse<?> response) {
      //  // hook
      //}

      //@Override
      //public void didWriteResponse(HttpRequest<?> request, HttpResponse<?> response) {
      //  // hook
      //}

      //@Override
      //public void willClose() {
      //  // hook
      //}

      //@Override
      //public void didClose() {
      //  // hook
      //}

    }

    class TestServer extends AbstractHttpServer {

      //@Override
      //public void willOpen() {
      //  // hook
      //}

      @Override
      public void didOpen() {
        this.enqueueRequest(new TestResponder());
      }

      //@Override
      //public void willReadRequest(HttpResponder responder) {
      //  // hook
      //}

      //@Override
      //public void willReadRequestMessage(HttpResponder responder) {
      //  // hook
      //}

      //@Override
      //public void didReadRequestMessage(HttpRequest<?> request, HttpResponder responder) {
      //  // hook
      //}

      //@Override
      //public void willReadRequestPayload(HttpRequest<?> request, HttpResponder responder) {
      //  // hook
      //}

      //@Override
      //public void didReadRequestPayload(HttpRequest<?> request, HttpResponder responder) {
      //  // hook
      //}

      @Override
      public void didReadRequest(HttpRequest<?> request, HttpResponder responder) {
        this.enqueueRequest(new TestResponder());
      }

      //@Override
      //public void willWriteResponse(HttpRequest<?> request, HttpResponder responder) {
      //  // hook
      //}

      //@Override
      //public void willWriteResponseMessage(HttpRequest<?> request, HttpResponder responder) {
      //  // hook
      //}

      //@Override
      //public void didWriteResponseMessage(HttpRequest<?> request, HttpResponse<?> response, HttpResponder responder) {
      //  // hook
      //}

      //@Override
      //public void willWriteResponsePayload(HttpRequest<?> request, HttpResponse<?> response, HttpResponder responder) {
      //  // hook
      //}

      //@Override
      //public void didWriteResponsePayload(HttpRequest<?> request, HttpResponse<?> response, HttpResponder responder) {
      //  // hook
      //}

      //@Override
      //public void didWriteResponse(HttpRequest<?> request, HttpResponse<?> response, HttpResponder responder) {
      //  // hook
      //}

      //@Override
      //public void willBecome(NetSocket socket) {
      //  // hook
      //}

      //@Override
      //public void didBecome(NetSocket socket) {
      //  // hook
      //}

      //@Override
      //public void doTimeout() {
      //  // hook
      //}

      //@Override
      //public void willClose() {
      //  // hook
      //}

      //@Override
      //public void didClose() {
      //  // hook
      //}

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
    } catch (InterruptedException cause) {
      throw new JUnitException("Interrupted", cause);
    } finally {
      driver.stop();
      scheduler.stop();
    }

  }

}
