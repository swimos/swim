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
import swim.api.downlink.ValueDownlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.lane.ValueLane;
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
import swim.observable.function.WillSet;
import swim.recon.Recon;
import swim.service.web.WebServiceDef;
import swim.structure.Text;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class TraitSpec {
  static class TestGraphAgent extends AbstractAgent {
    @SwimLane("info")
    ValueLane<String> info = valueLane()
        .valueClass(String.class)
        .observe(new InfoController());

    class InfoController implements WillSet<String>, DidSet<String> {
      @Override
      public String willSet(String newValue) {
        System.out.println(nodeUri() + " willSet newInfo: " + Format.debug(newValue));
        return newValue + "!";
      }
      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println(nodeUri() + " didSet newInfo: " + Format.debug(newValue) + "; oldInfo: " + Format.debug(oldValue));
      }
    }

    @Override
    public void willOpen() {
      context.openAgent(Text.from("test"), TestGraphAgentTrait.class);
    }
  }

  static class TestGraphAgentTrait extends AbstractAgent {
    @SwimLane("info")
    ValueLane<String> info = valueLane()
        .valueClass(String.class)
        .observe(new InfoController());

    class InfoController implements WillSet<String>, DidSet<String> {
      @Override
      public String willSet(String newValue) {
        System.out.println(nodeUri() + " trait willSet newInfo: " + Format.debug(newValue));
        return newValue;
      }
      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println(nodeUri() + " trait didSet newInfo: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
      }
    }

    @SwimLane("value")
    ValueLane<String> value = valueLane()
        .valueClass(String.class)
        .observe(new ValueController());

    class ValueController implements WillSet<String>, DidSet<String> {
      @Override
      public String willSet(String newValue) {
        System.out.println(nodeUri() + " trait willSet newValue: " + Format.debug(newValue));
        return newValue;
      }
      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println(nodeUri() + " trait didSet newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
      }
    }
  }

  static class TestGraphPlane extends AbstractPlane {
    @SwimRoute("/node/:name")
    AgentRoute<TestGraphAgent> graph;
  }

  @Test
  public void testExtensionLane() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestGraphPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
                                       .openPlane("test", TestGraphPlane.class);

    final String testValue = "Hello, world!";
    final CountDownLatch valueDidReceive = new CountDownLatch(1);
    final CountDownLatch valueDidSet = new CountDownLatch(2);
    class ValueLinkController implements WillSet<String>, DidSet<String>,
        WillReceive, DidReceive, WillLink, DidLink, WillSync, DidSync,
        WillUnlink, DidUnlink, DidConnect, DidDisconnect, DidClose {
      @Override
      public String willSet(String newValue) {
        System.out.println("link willSet newValue: " + Format.debug(newValue));
        return newValue;
      }
      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println("link didSet newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        if (testValue.equals(newValue)) {
          valueDidSet.countDown();
        }
      }
      @Override
      public void willReceive(Value body) {
        System.out.println("link willReceive body: " + Recon.toString(body));
      }
      @Override
      public void didReceive(Value body) {
        System.out.println("link didReceive body: " + Recon.toString(body));
        if (testValue.equals(body.stringValue(null))) {
          valueDidReceive.countDown();
        }
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
      final ValueDownlink<String> valueLink = plane.downlinkValue()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/node/root")
          .laneUri("value")
          .observe(new ValueLinkController())
          .open();
      valueLink.set(testValue);
      valueDidReceive.await(1, TimeUnit.SECONDS);
      valueDidSet.await(1, TimeUnit.SECONDS);
      assertEquals(valueDidReceive.getCount(), 0);
      assertEquals(valueDidSet.getCount(), 0);
      assertEquals(valueLink.get(), testValue);
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testOverloadedLane() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestGraphPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
                                       .openPlane("test", TestGraphPlane.class);

    final String testValue = "Hello, world";
    final String testInfo = testValue + "!";
    final CountDownLatch infoDidReceive = new CountDownLatch(1);
    final CountDownLatch infoDidSet = new CountDownLatch(1);
    final CountDownLatch valueDidSet = new CountDownLatch(1);
    class InfoLinkController implements WillSet<String>, DidSet<String>,
        WillReceive, DidReceive, WillLink, DidLink, WillSync, DidSync,
        WillUnlink, DidUnlink, DidConnect, DidDisconnect, DidClose {
      @Override
      public String willSet(String newValue) {
        System.out.println("link willSet newValue: " + Format.debug(newValue));
        return newValue;
      }
      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println("link didSet newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
        if (testValue.equals(newValue)) {
          valueDidSet.countDown();
        } else if (testInfo.equals(newValue)) {
          infoDidSet.countDown();
        }
      }
      @Override
      public void willReceive(Value body) {
        System.out.println("link willReceive body: " + Recon.toString(body));
      }
      @Override
      public void didReceive(Value body) {
        System.out.println("link didReceive body: " + Recon.toString(body));
        if (testInfo.equals(body.stringValue(null))) {
          infoDidReceive.countDown();
        }
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
      final ValueDownlink<String> infoLink = plane.downlinkValue()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/node/root")
          .laneUri("info")
          .observe(new InfoLinkController())
          .open();
      infoLink.set(testValue);
      valueDidSet.await(1, TimeUnit.SECONDS);
      infoDidReceive.await(1, TimeUnit.SECONDS);
      infoDidSet.await(1, TimeUnit.SECONDS);
      assertEquals(valueDidSet.getCount(), 0);
      assertEquals(infoDidReceive.getCount(), 0);
      assertEquals(infoDidSet.getCount(), 0);
      assertEquals(infoLink.get(), testInfo);
    } finally {
      kernel.stop();
    }
  }
}
