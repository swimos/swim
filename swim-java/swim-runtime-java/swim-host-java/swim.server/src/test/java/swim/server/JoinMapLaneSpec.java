// Copyright 2015-2021 Swim Inc.
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
import swim.api.downlink.MapDownlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.lane.JoinMapLane;
import swim.api.lane.MapLane;
import swim.api.lane.function.DidDownlinkMap;
import swim.api.lane.function.WillDownlinkMap;
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
import swim.kernel.Kernel;
import swim.observable.function.DidRemoveKey;
import swim.observable.function.DidUpdateKey;
import swim.observable.function.WillRemoveKey;
import swim.observable.function.WillUpdateKey;
import swim.recon.Recon;
import swim.service.web.WebServiceDef;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class JoinMapLaneSpec {

  @Test
  public void testLinkToJoinMapLane() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestJoinMapPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
                                         .openPlane("test", TestJoinMapPlane.class);

    final CountDownLatch joinDidReceive = new CountDownLatch(4);
    final CountDownLatch joinDidUpdate = new CountDownLatch(4);
    class JoinMapLinkController implements WillUpdateKey<String, String>,
        DidUpdateKey<String, String>, WillReceive, DidReceive, WillLink, DidLink,
        WillSync, DidSync, WillUnlink, DidUnlink, DidConnect, DidDisconnect, DidClose {

      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println("join link willUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue));
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println("join link didUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue));
        joinDidUpdate.countDown();
      }

      @Override
      public void willReceive(Value body) {
        System.out.println("join link willReceive body: " + Recon.toString(body));
      }

      @Override
      public void didReceive(Value body) {
        System.out.println("join link didReceive body: " + Recon.toString(body));
        joinDidReceive.countDown();
      }

      @Override
      public void willLink() {
        System.out.println("join link willLink");
      }

      @Override
      public void didLink() {
        System.out.println("join link didLink");
      }

      @Override
      public void willSync() {
        System.out.println("join link willSync");
      }

      @Override
      public void didSync() {
        System.out.println("join link didSync");
      }

      @Override
      public void willUnlink() {
        System.out.println("join link willUnlink");
      }

      @Override
      public void didUnlink() {
        System.out.println("join link didUnlink");
      }

      @Override
      public void didConnect() {
        System.out.println("join link didConnect");
      }

      @Override
      public void didDisconnect() {
        System.out.println("join link didDisconnect");
      }

      @Override
      public void didClose() {
        System.out.println("join link didClose");
      }

    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> xs = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556/")
          .nodeUri("/map/xs")
          .laneUri("map")
          .open();
      final MapDownlink<String, String> ys = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556/")
          .nodeUri("/map/ys")
          .laneUri("map")
          .open();
      xs.put("x0", "a");
      xs.put("x1", "b");
      ys.put("y0", "c");
      ys.put("y1", "d");

      final MapDownlink<String, String> join = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556/")
          .nodeUri("/join/mapA/all")
          .laneUri("join")
          .observe(new JoinMapLinkController())
          .open();

      joinDidReceive.await(3, TimeUnit.SECONDS);
      joinDidUpdate.await(3, TimeUnit.SECONDS);
      assertEquals(joinDidReceive.getCount(), 0);
      assertEquals(joinDidUpdate.getCount(), 0);
      assertEquals(join.size(), 4);
      assertEquals(join.get("x0"), "a");
      assertEquals(join.get("x1"), "b");
      assertEquals(join.get("y0"), "c");
      assertEquals(join.get("y1"), "d");
    } finally {
      kernel.stop();
    }
  }

  private static CountDownLatch laneWillDownlink = new CountDownLatch(2);
  private static CountDownLatch laneDidDownlink = new CountDownLatch(2);
  private static CountDownLatch laneWillUpdate = new CountDownLatch(4);
  private static CountDownLatch laneDidUpdate0 = new CountDownLatch(2);
  private static CountDownLatch laneDidUpdate1 = new CountDownLatch(2);
  private static CountDownLatch laneWillRemove = new CountDownLatch(1);
  private static CountDownLatch laneDidRemove = new CountDownLatch(1);

  @Test
  public void testJoinMapLaneCallback() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestJoinMapPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
            .openPlane("test", TestJoinMapPlane.class);

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final MapDownlink<String, String> xs = plane.downlinkMap()
              .keyClass(String.class)
              .valueClass(String.class)
              .hostUri("warp://localhost:53556/")
              .nodeUri("/map/xs")
              .laneUri("map")
              .open();
      xs.didSync(() -> {
        xs.put("x0", "a");
        xs.put("x1", "b");
      });

      final MapDownlink<String, String> join = plane.downlinkMap()
              .keyClass(String.class)
              .valueClass(String.class)
              .hostUri("warp://localhost:53556/")
              .nodeUri("/join/mapB/all")
              .laneUri("join")
              .open();

      laneDidUpdate0.await(3, TimeUnit.SECONDS);
      assertEquals(laneWillDownlink.getCount(), 0);
      assertEquals(laneDidDownlink.getCount(), 0);
      assertEquals(laneWillUpdate.getCount(), 2);
      assertEquals(laneDidUpdate0.getCount(), 0);

      xs.put("x0", "aa");
      xs.put("x1", "bb");

      laneDidUpdate1.await(3, TimeUnit.SECONDS);
      assertEquals(laneWillDownlink.getCount(), 0);
      assertEquals(laneDidDownlink.getCount(), 0);
      assertEquals(laneWillUpdate.getCount(), 0);
      assertEquals(laneDidUpdate1.getCount(), 0);

    } finally {
      kernel.stop();
    }
  }

  static class TestMapLaneAgent extends AbstractAgent {

    @SwimLane("map")
    MapLane<String, String> testMap = this.<String, String>mapLane()
        .observe(new TestMapLaneController());

    class TestMapLaneController implements WillUpdateKey<String, String>, DidUpdateKey<String, String>,
        WillRemoveKey<String>, DidRemoveKey<String, String> {

      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println(nodeUri() + " willUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue));
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println(nodeUri() + " didUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
      }

      @Override
      public void willRemove(String key) {
        System.out.println(nodeUri() + " willRemove key: " + Format.debug(key));
      }

      @Override
      public void didRemove(String key, String oldValue) {
        System.out.println(nodeUri() + " didRemove key: " + Format.debug(key) + "; oldValue: " + Format.debug(oldValue));
      }

    }

  }

  static class TestJoinMapLaneAgentA extends AbstractAgent {

    @SwimLane("join")
    JoinMapLane<String, String, String> testJoinMap = this.<String, String, String>joinMapLane();

    @Override
    public void didStart() {
      this.testJoinMap.downlink("xs").hostUri("warp://localhost:53556").nodeUri("/map/xs").laneUri("map").open();
      this.testJoinMap.downlink("ys").hostUri("warp://localhost:53556").nodeUri("/map/ys").laneUri("map").open();
    }

  }

  static class TestJoinMapLaneAgentB extends AbstractAgent {

    @SwimLane("join")
    JoinMapLane<String, String, String> testJoinMap = this.<String, String, String>joinMapLane()
        .observe(new TestJoinMapLaneController());

    @Override
    public void didStart() {
      this.testJoinMap.downlink("xs").hostUri("warp://localhost:53556").nodeUri("/map/xs").laneUri("map").open();
      this.testJoinMap.downlink("ys").hostUri("warp://localhost:53556").nodeUri("/map/ys").laneUri("map").open();
    }

    class TestJoinMapLaneController implements WillDownlinkMap<String>, DidDownlinkMap<String>,
        WillUpdateKey<String, String>, DidUpdateKey<String, String>,
        WillRemoveKey<String>, DidRemoveKey<String, String> {

      @Override
      public MapDownlink<?, ?> willDownlink(String key, MapDownlink<?, ?> downlink) {
        System.out.println(nodeUri() + " willDownlink key: " + Format.debug(key) + "; downlink: " + downlink);
        laneWillDownlink.countDown();
        return downlink;
      }

      @Override
      public void didDownlink(String key, MapDownlink<?, ?> downlink) {
        System.out.println(nodeUri() + " didDownlink key: " + Format.debug(key) + "; downlink: " + downlink);
        laneDidDownlink.countDown();
      }

      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println(nodeUri() + " willUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue));
        laneWillUpdate.countDown();
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println(nodeUri() + " didUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        if (key.equals("x0") && newValue.equals("a")) {
          //assertEquals(oldValue, "");
          laneDidUpdate0.countDown();
        } else if (key.equals("x0") && newValue.equals("aa")) {
          assertEquals(oldValue, "a");
          laneDidUpdate1.countDown();
        } else if (key.equals("x1") && newValue.equals("b")) {
          assertEquals(oldValue, "");
          laneDidUpdate0.countDown();
        } else if (key.equals("x1") && newValue.equals("bb")) {
          //assertEquals(oldValue, "b");
          laneDidUpdate1.countDown();
        }
      }

      @Override
      public void willRemove(String key) {
        System.out.println(nodeUri() + " willRemove key: " + Format.debug(key));
        laneWillRemove.countDown();
      }

      @Override
      public void didRemove(String key, String oldValue) {
        System.out.println(nodeUri() + " didRemove key: " + Format.debug(key) + "; oldValue: " + Format.debug(oldValue));
        laneDidRemove.countDown();
      }

    }

  }

  static class TestJoinMapPlane extends AbstractPlane {

    @SwimRoute("/map/:name")
    AgentRoute<TestMapLaneAgent> mapRoute;

    @SwimRoute("/join/mapA/:name")
    AgentRoute<TestJoinMapLaneAgentA> joinMapA;

    @SwimRoute("/join/mapB/:name")
    AgentRoute<TestJoinMapLaneAgentB> joinMapB;

  }

}
