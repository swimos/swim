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

package swim.server;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.testng.annotations.Test;
import swim.actor.ActorSpaceDef;
import swim.api.SwimLane;
import swim.api.SwimRoute;
import swim.api.agent.AbstractAgent;
import swim.api.agent.AgentRoute;
import swim.api.http.HttpLane;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.api.plane.AbstractPlane;
import swim.codec.Format;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.io.http.AbstractHttpClient;
import swim.io.http.AbstractHttpRequester;
import swim.kernel.Kernel;
import swim.service.web.WebService;
import swim.service.web.WebServiceDef;
import swim.uri.Uri;
import static org.testng.Assert.assertEquals;

public class HttpLaneSpec {
  static class TestHttpLaneAgent extends AbstractAgent {
    @SwimLane("http")
    HttpLane<Object> testHttp = httpLane()
        .observe(new TestHttpLaneController());

    class TestHttpLaneController implements WillRequestHttp<Object>, DidRequestHttp<Object>,
        DoRespondHttp<Object>, WillRespondHttp<Object>, DidRespondHttp<Object> {
      @Override
      public void willRequest(HttpRequest<Object> request) {
        System.out.println("lane willRequest: " + Format.debug(request.toHttp()));
      }
      @Override
      public void didRequest(HttpRequest<Object> request) {
        System.out.println("lane didRequest: " + Format.debug(request.toHttp()));
      }
      @Override
      public HttpResponse<?> doRespond(HttpRequest<Object> request) {
        System.out.println("lane doRespond: " + Format.debug(request.toHttp()));
        assertEquals(request.entity().get(), "Hello, swim!");
        return HttpResponse.from(HttpStatus.OK).body("Hello, world!");
      }
      @Override
      public void willRespond(HttpResponse<Object> response) {
        System.out.println("lane willRespond: " + Format.debug(response.toHttp()));
      }
      @Override
      public void didRespond(HttpResponse<Object> response) {
        System.out.println("lane didRespond: " + Format.debug(response.toHttp()));
      }
    }
  }

  static class TestHttpPlane extends AbstractPlane {
    @SwimRoute("/http/:name")
    AgentRoute<TestHttpLaneAgent> valueRoute;
  }

  @Test
  public void testLinkToValueLane() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestHttpPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
                                       .openPlane("test", TestHttpPlane.class);

    final CountDownLatch clientRequest = new CountDownLatch(1);
    final CountDownLatch clientResponse = new CountDownLatch(1);
    final AbstractHttpRequester<String> requester = new AbstractHttpRequester<String>() {
      @Override
      public void doRequest() {
        final HttpRequest<?> request = HttpRequest.post(Uri.parse("/http/test?lane=http")).body("Hello, swim!");
        System.out.println("client doRequest: " + Format.debug(request.toHttp()));
        writeRequest(request);
      }
      @Override
      public void didRequest(HttpRequest<?> request) {
        System.out.println("client didRequest: " + Format.debug(request.toHttp()));
        clientRequest.countDown();
      }
      @Override
      public void didRespond(HttpResponse<String> response) {
        System.out.println("client didRespond: " + Format.debug(response.toHttp()));
        assertEquals(response.entity().get(), "Hello, world!");
        clientResponse.countDown();
      }
    };
    final AbstractHttpClient client = new AbstractHttpClient() {
      @Override
      public void didConnect() {
        System.out.println("client didConnect");
        super.didConnect();
        doRequest(requester);
      }
    };

    try {
      final WebService service = (WebService) kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      service.connectHttp("127.0.0.1", 53556, client);
      clientRequest.await(1, TimeUnit.SECONDS);
      clientResponse.await(1, TimeUnit.SECONDS);
      assertEquals(clientRequest.getCount(), 0);
      assertEquals(clientResponse.getCount(), 0);
    } finally {
      client.close();
      kernel.stop();
    }
  }
}
