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

import java.util.concurrent.CountDownLatch;
import org.junit.jupiter.api.Test;
import org.junit.platform.commons.JUnitException;
import swim.codec.Text;
import swim.collections.FingerTrieList;
import swim.exec.ThreadScheduler;
import swim.http.HttpBody;
import swim.http.HttpChunked;
import swim.http.HttpHeader;
import swim.http.HttpMethod;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpTransferCoding;
import swim.net.TransportDriver;
import swim.util.Assume;

public class HttpClientTests {

  @Test
  public void testClient() {
    final CountDownLatch finishedLatch = new CountDownLatch(1);

    final TransportDriver driver = new TransportDriver();
    final ThreadScheduler scheduler = new ThreadScheduler();
    driver.setScheduler(scheduler);

    class TestRequester extends AbstractHttpRequester {

      @Override
      public void willWriteRequest() {
        final HttpRequest<?> request = HttpRequest.create(HttpMethod.GET, "/", HttpHeader.HOST.of("www.google.com"));
        this.writeRequestMessage(request.write());
        this.writeRequestPayload(request.payload().encode());
      }

      //@Override
      //public void willWriteRequestMessage() {
      //  // hook
      //}

      //@Override
      //public void didWriteRequestMessage(HttpRequest<?> request) {
      //  // hook
      //}

      //@Override
      //public void willWriteRequestPayload(HttpRequest<?> request) {
      //  // hook
      //}

      //@Override
      //public void didWriteRequestPayload(HttpRequest<?> request) {
      //  // hook
      //}

      //@Override
      //public void didWriteRequest(HttpRequest<?> request) {
      //  // hook
      //}

      //@Override
      //public void willReadResponse(HttpRequest<?> request) {
      //  // hook
      //}

      @Override
      public void willReadResponseMessage(HttpRequest<?> request) {
        this.readResponseMessage(HttpResponse.parse());
      }

      //@Override
      //public void didReadResponseMessage(HttpRequest<?> request, HttpResponse<?> response) {
      //  // hook
      //}

      @Override
      public void willReadResponsePayload(HttpRequest<?> request, HttpResponse<?> response) {
        final FingerTrieList<HttpTransferCoding> transferCodings = response.headers().getValue(HttpHeader.TRANSFER_ENCODING);
        if (transferCodings != null && !transferCodings.isEmpty() && HttpTransferCoding.chunked().equals(transferCodings.head())) {
          this.readResponsePayload(HttpChunked.decode(Text.transcoder()));
        } else {
          final long contentLength = Assume.nonNull(response.headers().getValue(HttpHeader.CONTENT_LENGTH)).longValue();
          this.readResponsePayload(HttpBody.decode(Text.transcoder(), contentLength));
        }
      }

      //@Override
      //public void didReadResponsePayload(HttpRequest<?> request, HttpResponse<?> response) {
      //  // hook
      //}

      @Override
      public void didReadResponse(HttpRequest<?> request, HttpResponse<?> response) {
        System.out.println(response);
        System.out.println(response.payload());
      }

      //@Override
      //public void willClose() {
      //  // hook
      //}

      //@Override
      //public void didClose() {
      //  // hook
      //}

    }

    class TestClient extends AbstractHttpClient {

      //@Override
      //public void willOpen() {
      //  // hook
      //}

      @Override
      public void didOpen() {
        this.enqueueRequester(new TestRequester());
        //this.enqueueRequester(new TestRequester());
      }

      //@Override
      //public void willWriteRequest(HttpRequester requester) {
      //  // hook
      //}

      //@Override
      //public void willWriteRequestMessage(HttpRequester requester) {
      //  // hook
      //}

      //@Override
      //public void didWriteRequestMessage(HttpRequest<?> request, HttpRequester requester) {
      //  // hook
      //}

      //@Override
      //public void willWriteRequestPayload(HttpRequest<?> request, HttpRequester requester) {
      //  // hook
      //}

      //@Override
      //public void didWriteRequestPayload(HttpRequest<?> request, HttpRequester requester) {
      //  // hook
      //}

      @Override
      public void didWriteRequest(HttpRequest<?> request, HttpRequester requester) {
        if (!this.isRequesting()) {
          this.doneWriting();
        }
      }

      //@Override
      //public void willReadResponse(HttpRequest<?> request, HttpRequester requester) {
      //  // hook
      //}

      //@Override
      //public void willReadResponseMessage(HttpRequest<?> request, HttpRequester requester) {
      //  // hook
      //}

      //@Override
      //public void didReadResponseMessage(HttpRequest<?> request, HttpResponse<?> response, HttpRequester requester) {
      //  // hook
      //}

      //@Override
      //public void willReadResponsePayload(HttpRequest<?> request, HttpResponse<?> response, HttpRequester requester) {
      //  // hook
      //}

      //@Override
      //public void didReadResponsePayload(HttpRequest<?> request, HttpResponse<?> response, HttpRequester requester) {
      //  // hook
      //}

      //@Override
      //public void didReadResponse(HttpRequest<?> request, HttpResponse<?> response, HttpRequester requester) {
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

      @Override
      public void didClose() {
        finishedLatch.countDown();
      }

    }

    try {
      scheduler.start();
      driver.start();

      final TestClient client = new TestClient();
      final HttpClientSocket socket = new HttpClientSocket(client, HttpOptions.standard());
      driver.bindTcpSocket(socket).connect("www.google.com", 80);
      finishedLatch.await();
    } catch (InterruptedException cause) {
      throw new JUnitException("Interrupted", cause);
    } finally {
      driver.stop();
      scheduler.stop();
    }
  }

}
