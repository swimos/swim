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
import swim.structure.Form;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.fail;

public class ValueLaneSpec {

  @Test
  public void testLinkToValueLane() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestValuePlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
                                       .openPlane("test", TestValuePlane.class);

    final String testValue = "Hello, world!";
    final CountDownLatch linkDidReceive = new CountDownLatch(1);
    final CountDownLatch linkDidSet = new CountDownLatch(2);
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
          linkDidSet.countDown();
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
          linkDidReceive.countDown();
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
          .nodeUri("/value/hello")
          .laneUri("value")
          .observe(new ValueLinkController())
          .open();
      valueLink.set(testValue);
      linkDidReceive.await(1, TimeUnit.SECONDS);
      linkDidSet.await(1, TimeUnit.SECONDS);
      assertEquals(linkDidReceive.getCount(), 0);
      assertEquals(linkDidSet.getCount(), 0);
      assertEquals(valueLink.get(), testValue);
    } finally {
      kernel.stop();
    }
  }

  @Test
  public void testHalfOpenLinkToValueLane() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestValuePlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
                                       .openPlane("test", TestValuePlane.class);

    final String testValue = "Hello, world!";
    class HalfOpenValueLinkController implements WillSet<String>, DidSet<String>,
        WillReceive, WillLink, DidLink, WillSync, DidSync, WillUnlink, DidUnlink,
        DidConnect, DidDisconnect, DidClose {

      @Override
      public String willSet(String newValue) {
        System.out.println("half-open link willSet newValue: " + Format.debug(newValue));
        return newValue;
      }

      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println("half-open link didSet newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
      }

      @Override
      public void willReceive(Value value) {
        System.out.println("half-open link willReceive value: " + Recon.toString(value));
        fail();
      }

      @Override
      public void willLink() {
        System.out.println("half-open link willLink");
      }

      @Override
      public void didLink() {
        System.out.println("half-open link didLink");
      }

      @Override
      public void willSync() {
        System.out.println("half-open link willSync");
      }

      @Override
      public void didSync() {
        System.out.println("half-open link didSync");
      }

      @Override
      public void willUnlink() {
        System.out.println("half-open link willUnlink");
      }

      @Override
      public void didUnlink() {
        System.out.println("half-open link didUnlink");
      }

      @Override
      public void didConnect() {
        System.out.println("half-open link didConnect");
      }

      @Override
      public void didDisconnect() {
        System.out.println("half-open link didDisconnect");
      }

      @Override
      public void didClose() {
        System.out.println("half-open link didClose");
      }

    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final ValueDownlink<String> halfOpenValueLink = plane.downlinkValue()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/value/hello")
          .laneUri("value")
          .keepLinked(false)
          .observe(new HalfOpenValueLinkController())
          .open();
      halfOpenValueLink.set(testValue);
      Thread.sleep(100); // ensure lack of receive
      assertEquals(halfOpenValueLink.get(), testValue);
    } finally {
      kernel.stop();
    }
  }

  private static CountDownLatch willUplink;
  private static CountDownLatch didUplink;
  private static CountDownLatch willCommand;
  private static CountDownLatch willSet;
  private static CountDownLatch didSet;
  private static CountDownLatch didCommand;

  private static void resetLatches() {
    willUplink = new CountDownLatch(2);
    didUplink = new CountDownLatch(2);
    willCommand = new CountDownLatch(2);
    willSet = new CountDownLatch(2);
    didSet = new CountDownLatch(2);
    didCommand = new CountDownLatch(1);
  }
  
  private static final String TEST_STRING = "Hello";

  @Test
  public void testValueLaneCallbacks() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestValuePlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
            .openPlane("test", TestValuePlane.class);

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();

      resetLatches();

      final ValueDownlink<String> valueLink = plane.downlinkValue()
              .valueClass(String.class)
              .hostUri("warp://localhost:53556")
              .nodeUri("/valueLatched/hello")
              .laneUri("value")
              .open();
      valueLink.set(TEST_STRING);

      didCommand.await(2, TimeUnit.SECONDS);

      //assertEquals(willUplink.getCount(), 1);
      assertEquals(didUplink.getCount(), 1);
      assertEquals(willCommand.getCount(), 1);
      assertEquals(willSet.getCount(), 1);
      assertEquals(didSet.getCount(), 1);
      assertEquals(didCommand.getCount(), 0);

    } finally {
      kernel.stop();
    }
  }

  static class TestValueLaneAgent extends AbstractAgent {

    @SwimLane("value")
    ValueLane<String> testValue = valueLane()
        .valueClass(String.class)
        .observe(new TestValueLaneController());

    class TestValueLaneController implements WillSet<String>, DidSet<String> {

      @Override
      public String willSet(String newValue) {
        System.out.println("lane willSet newValue: " + Format.debug(newValue));
        return newValue;
      }

      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println("lane didSet newValue: " + Format.debug(newValue) + "; oldValue: " + Format.debug(oldValue));
      }

    }

  }

  static class TestValueLaneLatchedAgent extends AbstractAgent {

    @SwimLane("value")
    ValueLane<String> value = valueLane()
            .valueForm(Form.forString())
            .willSet(newValue -> {
              System.out.println(nodeUri() + " willSet: " + newValue);
              assertEquals(willCommand.getCount(), 1);
              assertEquals(newValue, TEST_STRING);
              willSet.countDown();
              return newValue;
            })
            .didSet((newValue, oldValue) -> {
              System.out.println(nodeUri() + " didSet: " + oldValue + " -> " + newValue);
              assertEquals(willSet.getCount(), 1);
              assertEquals(newValue, TEST_STRING);
              assertEquals(oldValue, "");
              didSet.countDown();
            })
            .willCommand(body -> {
              System.out.println(nodeUri() + " willCommand: " + body.stringValue());
              assertEquals(didUplink.getCount(), 1);
              assertEquals(body.stringValue(), TEST_STRING);
              willCommand.countDown();
            })
            .didCommand(body -> {
              System.out.println(nodeUri() + " didCommand: " + body.stringValue());
              assertEquals(didSet.getCount(), 1);
              assertEquals(body.stringValue(), TEST_STRING);
              didCommand.countDown();
            })
            .willUplink(uplink -> {
              System.out.println(nodeUri() + " willUplink");
              willUplink.countDown();
            })
            .didUplink(uplink -> {
              System.out.println(nodeUri() + " didUplink");
              //assertEquals(willUplink.getCount(), 1);
              didUplink.countDown();
            });
  }

  static class TestValuePlane extends AbstractPlane {

    @SwimRoute("/value/:name")
    AgentRoute<TestValueLaneAgent> valueRoute;

    @SwimRoute("/valueLatched/:name")
    AgentRoute<TestValueLaneLatchedAgent> latchedValueRoute;

  }

}
