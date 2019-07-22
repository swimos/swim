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
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.OnEvent;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.structure.Value;

public class ClientRuntimeSpec {
  @Test
  public void testLink() throws InterruptedException {
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
}
