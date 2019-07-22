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
import swim.api.SwimLane;
import swim.api.SwimRoute;
import swim.api.agent.AbstractAgent;
import swim.api.agent.AgentRoute;
import swim.api.downlink.MapDownlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.lane.MapLane;
import swim.api.plane.AbstractPlane;
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidReceive;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillReceive;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.codec.Format;
import swim.fabric.FabricDef;
import swim.kernel.Kernel;
import swim.observable.function.DidClear;
import swim.observable.function.DidDrop;
import swim.observable.function.DidRemoveKey;
import swim.observable.function.DidTake;
import swim.observable.function.DidUpdateKey;
import swim.observable.function.WillClear;
import swim.observable.function.WillDrop;
import swim.observable.function.WillRemoveKey;
import swim.observable.function.WillTake;
import swim.observable.function.WillUpdateKey;
import swim.recon.Recon;
import swim.service.web.WebServiceDef;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class MapLaneSpec {
  static class TestMapLaneAgent extends AbstractAgent {
    @SwimLane("map")
    MapLane<String, String> testMap = this.<String, String>mapLane()
        .keyClass(String.class)
        .valueClass(String.class)
        .observe(new TestMapLaneController());

    class TestMapLaneController implements WillUpdateKey<String, String>,
        DidUpdateKey<String, String>, WillRemoveKey<String>, DidRemoveKey<String, String>,
        WillClear, DidClear, WillDrop, DidDrop, WillTake, DidTake {
      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println("lane willUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue));
        return newValue;
      }
      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println("lane didUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
      }
      @Override
      public void willRemove(String key) {
        System.out.println("lane willRemove key: " + Format.debug(key));
      }
      @Override
      public void didRemove(String key, String oldValue) {
        System.out.println("lane didRemove key: " + Format.debug(key) + "; oldValue: " + Format.debug(oldValue));
      }
      @Override
      public void willClear() {
        System.out.println("lane willClear");
      }
      @Override
      public void didClear() {
        System.out.println("lane didClear");
      }
      @Override
      public void willDrop(int lower) {
        System.out.println("lane willDrop " + lower);
      }
      @Override
      public void didDrop(int lower) {
        System.out.println("lane didDrop " + lower);
      }
      @Override
      public void willTake(int upper) {
        System.out.println("lane willTake " + upper);
      }
      @Override
      public void didTake(int upper) {
        System.out.println("lane didTake " + upper);
      }
    }
  }

  static class TestMapPlane extends AbstractPlane {
    @SwimRoute("/map/:name")
    AgentRoute<TestMapLaneAgent> mapRoute;
  }

  @Test
  public void testUpdate() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestMapPlane plane = kernel.openSpace(FabricDef.fromName("test"))
                                     .openPlane("test", TestMapPlane.class);

    final CountDownLatch linkDidReceive = new CountDownLatch(2);
    final CountDownLatch linkDidUpdate = new CountDownLatch(4);
    class MapLinkController implements WillUpdateKey<String, String>,
        DidUpdateKey<String, String>, WillReceive, DidReceive, WillLink, DidLink,
        WillSync, DidSync, WillUnlink, DidUnlink, DidConnect, DidDisconnect, DidClose {
      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println("link willUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue));
        return newValue;
      }
      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println("link didUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue));
        linkDidUpdate.countDown();
      }
      @Override
      public void willReceive(Value body) {
        System.out.println("link willReceive body: " + Recon.toString(body));
      }
      @Override
      public void didReceive(Value body) {
        System.out.println("link didReceive body: " + Recon.toString(body));
        linkDidReceive.countDown();
      }
      @Override
      public void willLink() {
        System.out.println("link willLink");
      }
      @Override
      public void didLink() {
        System.out.println("link didLink");
      }
      @Override
      public void willSync() {
        System.out.println("link willSync");
      }
      @Override
      public void didSync() {
        System.out.println("link didSync");
      }
      @Override
      public void willUnlink() {
        System.out.println("link willUnlink");
      }
      @Override
      public void didUnlink() {
        System.out.println("link didUnlink");
      }
      @Override
      public void didConnect() {
        System.out.println("link didConnect");
      }
      @Override
      public void didDisconnect() {
        System.out.println("link didDisconnect");
      }
      @Override
      public void didClose() {
        System.out.println("link didClose");
      }
    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> mapLink = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/map/words")
          .laneUri("map")
          .observe(new MapLinkController())
          .open();
      mapLink.put("a", "indefinite article");
      mapLink.put("the", "definite article");
      linkDidReceive.await(1, TimeUnit.SECONDS);
      linkDidUpdate.await(1, TimeUnit.SECONDS);
      assertEquals(linkDidReceive.getCount(), 0);
      assertEquals(linkDidUpdate.getCount(), 0);
      assertEquals(mapLink.size(), 2);
      assertEquals(mapLink.get("a"), "indefinite article");
      assertEquals(mapLink.get("the"), "definite article");
    } finally {
      kernel.stop();
    }
  }
}
