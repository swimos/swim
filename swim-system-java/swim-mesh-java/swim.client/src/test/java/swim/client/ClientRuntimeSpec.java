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

package swim.client;

import java.util.concurrent.CountDownLatch;
import org.testng.annotations.Test;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.OnEvent;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.codec.Format;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.structure.Value;
import swim.uri.Uri;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class ClientRuntimeSpec {
  @Test
  public void testWarpLink() throws InterruptedException {
    final ClientRuntime client = new ClientRuntime();
    final CountDownLatch didSync = new CountDownLatch(1);
    class IntersectionsController implements OnEvent<Value>, WillLink, DidLink,
        WillSync, DidSync, WillUnlink, DidUnlink, DidConnect, DidDisconnect, DidClose {
      @Override
      public void onEvent(Value value) {
        System.out.println("onEvent city/intersection: " + value);
      }
      @Override
      public void willLink() {
        System.out.println("willLink");
      }
      @Override
      public void didLink() {
        System.out.println("didLink");
      }
      @Override
      public void willSync() {
        System.out.println("willSync");
      }
      @Override
      public void didSync() {
        System.out.println("didSync");
        didSync.countDown();
      }
      @Override
      public void willUnlink() {
        System.out.println("willUnlink");
      }
      @Override
      public void didUnlink() {
        System.out.println("didUnlink");
      }
      @Override
      public void didConnect() {
        System.out.println("didConnect");
      }
      @Override
      public void didDisconnect() {
        System.out.println("didDisconnect");
      }
      @Override
      public void didClose() {
        System.out.println("didClose");
      }
    }
    try {
      client.start();
      client.downlink()
          .hostUri("swim://traffic.swim.services")
          .nodeUri("city/PaloAlto_CA_US")
          .laneUri("intersections")
          .keepSynced(true)
          .observe(new IntersectionsController())
          .open();
      didSync.await();
    } finally {
      client.stop();
    }
  }

  @Test
  public void testHttpLinkGet() throws InterruptedException {
    final ClientRuntime client = new ClientRuntime();

    final CountDownLatch willRespond = new CountDownLatch(1);
    final CountDownLatch didRespond = new CountDownLatch(1);

    class GetController implements WillRespondHttp<String>, DidRespondHttp<String> {

      @Override
      public void willRespond(HttpResponse<String> response) {
        assertEquals(HttpStatus.OK, response.status());
        willRespond.countDown();
      }

      @Override
      public void didRespond(HttpResponse<String> response) {
        assertTrue(response.entity().get().length() > 0);
        didRespond.countDown();
      }

    }
    try {
      client.start();
      final Uri reqUri = Uri.parse("http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=tahoe&t=0");
      client.downlinkHttp()
          .requestUri(reqUri)
          .observe(new GetController())
          .open();
      didRespond.await();
      assertEquals(willRespond.getCount(), 0);
    } finally {
      client.stop();
    }
  }

  @Test
  public void testHttpLinkDelete() throws InterruptedException {
    final ClientRuntime client = new ClientRuntime();

    final CountDownLatch willRespond = new CountDownLatch(1);
    final CountDownLatch didRespond = new CountDownLatch(1);

    class DeleteController implements WillRespondHttp<String>, DidRespondHttp<String> {

      @Override
      public void willRespond(HttpResponse<String> response) {
        assertEquals(HttpStatus.OK, response.status());
        willRespond.countDown();
      }

      @Override
      public void didRespond(HttpResponse<String> response) {
        assertTrue(response.entity().isDefined());
        didRespond.countDown();
      }
    }
    try {
      client.start();
      client.downlinkHttp()
          .request(HttpRequest.delete(Uri.parse("http://jsonplaceholder.typicode.com/posts/1")))
          .observe(new DeleteController())
          .open();
      didRespond.await();
      assertEquals(willRespond.getCount(), 0);
    } finally {
      client.stop();
    }
  }

  @Test
  public void testHttpLinkCallback() throws InterruptedException {
    final ClientRuntime client = new ClientRuntime();
    final CountDownLatch didConnect = new CountDownLatch(1);
    final CountDownLatch didRequest = new CountDownLatch(1);
    final CountDownLatch willRequest = new CountDownLatch(1);
    final CountDownLatch didRespond = new CountDownLatch(1);
    final CountDownLatch willRespond = new CountDownLatch(1);

    class CallbackController implements DidConnect, WillRequestHttp<String>, DidRequestHttp<String>, WillRespondHttp<String>, DidRespondHttp<String> {
      @Override
      public void willRequest(HttpRequest<String> request) {
        System.out.println("CallbackController.willRequest: " + Format.debug(request.toHttp()));
        willRequest.countDown();
      }

      @Override
      public void didRequest(HttpRequest<String> request) {
        System.out.println("CallbackController.didRequest: " + Format.debug(request.toHttp()));
        didRequest.countDown();
      }

      @Override
      public void willRespond(HttpResponse<String> response) {
        System.out.println("CallbackController.willRespond: " + response);
        willRespond.countDown();
      }

      @Override
      public void didRespond(HttpResponse<String> response) {
        System.out.println("CallbackController.didRespond: " + response.toString());
        didRespond.countDown();
      }

      @Override
      public void didConnect() {
        System.out.println("CallbackController.didConnect");
        didConnect.countDown();
      }
    }
    try {
      client.start();
      final Uri reqUri = Uri.parse("http://webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=tahoe&t=0");
      client.downlinkHttp()
          .requestUri(reqUri)
          .observe(new CallbackController())
          .open();
      didRespond.await();
      assertEquals(willRequest.getCount(), 0);
      assertEquals(didRequest.getCount(), 0);
      assertEquals(willRespond.getCount(), 0);
      assertEquals(didConnect.getCount(), 0);
    } finally {
      client.stop();
    }
  }
}
