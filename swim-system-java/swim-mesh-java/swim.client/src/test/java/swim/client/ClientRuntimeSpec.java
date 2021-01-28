// Copyright 2015-2020 Swim inc.
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
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.OnEvent;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.concurrent.Stage;
import swim.concurrent.Theater;
import swim.io.TlsSettings;
import swim.io.http.HttpEndpoint;
import swim.io.http.HttpSettings;
import swim.structure.Value;
import static org.testng.Assert.fail;

public class ClientRuntimeSpec {

  @Test
  public void testLink() throws InterruptedException {
    final Object[] failure = {null};

    final HttpSettings httpSettings = HttpSettings.standard().tlsSettings(TlsSettings.standard());
    final Stage stage = new Theater();
    final SwimClientRef swimClientRef = new SwimClientRef(stage, new HttpEndpoint(stage, httpSettings)) {
      @Override
      public void fail(Object cause) {
        super.fail(cause);
        failure[0] = cause;
      }
    };

    final ClientRuntime client = new ClientRuntime(swimClientRef);
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

      if (failure[0] != null) {
        final Object cause = failure[0];
        if (cause instanceof Throwable) {
          final Throwable throwable = (Throwable) cause;
          fail("Unexpected exception", throwable);
        } else {
          fail();
        }
      }
    }
  }

}
