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
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.platform.commons.JUnitException;
import swim.codec.Decode;
import swim.codec.InputBuffer;
import swim.codec.Text;
import swim.exec.ThreadScheduler;
import swim.http.HttpMethod;
import swim.http.HttpPayload;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.header.HostHeader;
import swim.net.TransportDriver;
import swim.util.Result;

public class HttpClientTests {

  @Test
  @Tag("manual")
  public void testClient() {
    final CountDownLatch finishedLatch = new CountDownLatch(1);

    final TransportDriver driver = new TransportDriver();
    final ThreadScheduler scheduler = new ThreadScheduler();
    driver.setScheduler(scheduler);

    class TestRequester extends AbstractHttpRequester {

      @Override
      public void willWriteRequest() {
        this.writeRequest(HttpRequest.of(HttpMethod.GET, "/", HostHeader.of("www.google.com")));
      }

      @Override
      public Decode<? extends HttpPayload<?>> decodeResponsePayload(InputBuffer input, HttpResponse<?> response) {
        return response.decodePayload(input, Text.transcoder());
      }

      @Override
      public void didReadResponse(Result<HttpResponse<?>> result) {
        final HttpResponse<?> response = result.getNonNull();
        System.out.println(response);
        System.out.println(response.payload());
      }

    }

    class TestClient extends AbstractHttpClient {

      @Override
      public void didOpen() {
        this.enqueueRequester(new TestRequester());
        //this.enqueueRequester(new TestRequester());
      }

      @Override
      public void didWriteRequest(Result<HttpRequest<?>> request, HttpRequesterContext handler) {
        if (!this.isRequesting()) {
          this.doneWriting();
        }
      }

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
