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
import swim.api.downlink.MapDownlink;
import swim.api.downlink.ValueDownlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.lane.JoinValueLane;
import swim.api.lane.ValueLane;
import swim.api.lane.function.DidDownlinkValue;
import swim.api.lane.function.WillDownlinkValue;
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
import swim.observable.function.DidSet;
import swim.observable.function.DidUpdateKey;
import swim.observable.function.WillSet;
import swim.observable.function.WillUpdateKey;
import swim.recon.Recon;
import swim.service.web.WebServiceDef;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class JoinValueLaneSpec {
  static class TestValueLaneAgent extends AbstractAgent {
    @SwimLane("value")
    ValueLane<String> testValue = valueLane()
        .valueClass(String.class)
        .observe(new TestValueLaneController());

    class TestValueLaneController implements WillSet<String>, DidSet<String> {
      @Override
      public String willSet(String newValue) {
        System.out.println(nodeUri() + " willSet newValue: " + Format.debug(newValue));
        return newValue;
      }
      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println(nodeUri() + " didSet newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
      }
    }
  }

  static class TestJoinValueLaneAgent extends AbstractAgent {
    @SwimLane("join")
    JoinValueLane<String, String> testJoinValue = joinValueLane()
        .keyClass(String.class)
        .valueClass(String.class)
        .observe(new TestJoinValueLaneController());

    class TestJoinValueLaneController implements WillDownlinkValue<String>, DidDownlinkValue<String>,
        WillUpdateKey<String, String>, DidUpdateKey<String, String> {
      @Override
      public ValueDownlink<?> willDownlink(String key, ValueDownlink<?> downlink) {
        System.out.println(nodeUri() + " willDownlink key: " + Format.debug(key) + "; downlink: " + downlink);
        return downlink;
      }
      @Override
      public void didDownlink(String key, ValueDownlink<?> downlink) {
        System.out.println(nodeUri() + " didDownlink key: " + Format.debug(key) + "; downlink: " + downlink);
      }
      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println(nodeUri() + " willUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue));
        return newValue;
      }
      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println(nodeUri() + " didUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
      }
    }

    @Override
    public void didStart() {
      testJoinValue.downlink("x").hostUri("warp://localhost:53556").nodeUri("/value/x").laneUri("value").open();
      testJoinValue.downlink("y").hostUri("warp://localhost:53556").nodeUri("/value/y").laneUri("value").open();
    }
  }

  static class TestJoinValuePlane extends AbstractPlane {
    @SwimRoute("/value/:name")
    AgentRoute<TestValueLaneAgent> value;

    @SwimRoute("/join/value/:name")
    AgentRoute<TestJoinValueLaneAgent> joinValue;
  }

  @Test
  public void testLinkToJoinValueLane() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestJoinValuePlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
                                           .openPlane("test", TestJoinValuePlane.class);

    final CountDownLatch joinDidReceive = new CountDownLatch(2);
    final CountDownLatch joinDidUpdate = new CountDownLatch(2 * 2); // 1 for the initial link and 1 for update for x, same for y
    class JoinValueLinkController implements WillUpdateKey<String, String>,
        DidUpdateKey<String, String>, WillReceive, DidReceive, WillLink, DidLink,
        WillSync, DidSync, WillUnlink, DidUnlink, DidConnect, DidDisconnect, DidClose {
      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println("join link willUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue));
        return newValue;
      }
      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println("join link didUpdate key: " + Format.debug(key) + "; newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
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
      final ValueDownlink<String> x = plane.downlinkValue()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/value/x")
          .laneUri("value")
          .open();
      final ValueDownlink<String> y = plane.downlinkValue()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/value/y")
          .laneUri("value")
          .open();
      x.set("x0");
      y.set("y0");

      final MapDownlink<String, String> join = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/join/value/all")
          .laneUri("join")
          .observe(new JoinValueLinkController())
          .open();

      joinDidReceive.await(2, TimeUnit.SECONDS);
      joinDidUpdate.await(2, TimeUnit.SECONDS);
      assertEquals(joinDidReceive.getCount(), 0);
      assertEquals(joinDidUpdate.getCount(), 0);
      assertEquals(join.size(), 2);
      assertEquals(join.get("x"), "x0");
      assertEquals(join.get("y"), "y0");
    } finally {
      kernel.stop();
    }
  }
}
