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

import java.io.File;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.testng.annotations.Test;
import swim.api.SwimLane;
import swim.api.SwimRoute;
import swim.api.agent.AbstractAgent;
import swim.api.agent.AgentType;
import swim.api.downlink.EventDownlink;
import swim.api.downlink.MapDownlink;
import swim.api.downlink.ValueDownlink;
import swim.api.downlink.function.DidLink;
import swim.api.downlink.function.DidSync;
import swim.api.downlink.function.DidUnlink;
import swim.api.downlink.function.OnEvent;
import swim.api.downlink.function.WillLink;
import swim.api.downlink.function.WillReceive;
import swim.api.downlink.function.WillSync;
import swim.api.downlink.function.WillUnlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.lane.CommandLane;
import swim.api.lane.JoinValueLane;
import swim.api.lane.ValueLane;
import swim.api.lane.function.DidDownlinkValue;
import swim.api.lane.function.OnCommand;
import swim.api.lane.function.WillDownlinkValue;
import swim.api.plane.AbstractPlane;
import swim.collections.HashTrieMap;
import swim.linker.StoreDef;
import swim.observable.function.DidSet;
import swim.observable.function.DidUpdateKey;
import swim.observable.function.WillSet;
import swim.observable.function.WillUpdateKey;
import swim.recon.Recon;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNotEquals;
import static org.testng.Assert.assertNotNull;
import static org.testng.Assert.fail;

public class ServerRuntimeSpec {
  static class NopAgent extends AbstractAgent {
  }

  static class NopPlane extends AbstractPlane {
    @SwimRoute("/test/:name")
    final AgentType<?> nopAgent = agentClass(NopAgent.class);
  }

  @Test
  public void testAgentClassRegistration() {
    final ServerRuntime server = new ServerRuntime();
    final ServerPlane plane = server.materializePlane("nop", NopPlane.class);
    final AgentType<?> agentType = plane.getAgentType("swim.server.ServerRuntimeSpec$NopAgent");
    assertNotNull(agentType);
    assertEquals(plane.getAgentRoute(Uri.parse("/test/foo")), agentType);
    assertEquals(plane.getAgentRoute(Uri.parse("/test/bar")), agentType);
    assertNotEquals(plane.getAgentRoute(Uri.parse("/test/")), agentType);
  }


  @SwimRoute("/value/:name")
  static class TestValueLaneAgent extends AbstractAgent {
    @SwimLane("value")
    ValueLane<String> testValue = valueLane()
        .valueClass(String.class)
        .observe(new TestValueLaneController());

    class TestValueLaneController implements WillSet<String>, DidSet<String> {
      @Override
      public String willSet(String newValue) {
        System.out.println(testValue.nodeUri().toString() + " willSet newValue: " + newValue);
        return newValue;
      }

      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println(testValue.nodeUri().toString() + " didSet newValue: " + newValue + "; oldValue: " + oldValue);
      }
    }
  }

  static class TestValuePlane extends AbstractPlane {
    final AgentType<?> valueAgent = agentClass(TestValueLaneAgent.class);
  }

  @Test
  public void testLinkToValueLane() throws InterruptedException {
    final String name = "value";
    final CountDownLatch willReceive = new CountDownLatch(1);
    final ServerRuntime server = new ServerRuntime();
    final ServerPlane plane = server.materializePlane(name, TestValuePlane.class, storeDef(name));
    class ValueLinkController implements WillSet<String>, DidSet<String>,
        WillReceive, WillLink, DidLink, WillSync, DidSync, WillUnlink, DidUnlink,
        DidConnect, DidDisconnect, DidClose {
      @Override
      public String willSet(String newValue) {
        System.out.println("willSet: " + newValue);
        return newValue;
      }

      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println("didSet: " + newValue);
      }

      @Override
      public void willReceive(Value value) {
        System.out.println("willReceive: " + Recon.toString(value));
        willReceive.countDown();
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
      server.start();
      plane.bind("localhost", 53556);
      final ValueDownlink<String> valueLink = plane.downlinkValue()
          .valueClass(String.class)
          .hostUri("swim://localhost:53556/")
          .nodeUri("/value/hello")
          .laneUri("value")
          .observe(new ValueLinkController())
          .open();
      valueLink.set("Hello, world!");
      willReceive.await(2, TimeUnit.SECONDS);
      Thread.sleep(100);
    } finally {
      server.stop();
      delete(name);
    }
  }

  @Test
  public void testHalfOpenLinkToValueLane() throws InterruptedException {
    final String name = "halfOpenValue";
    final ServerRuntime server = new ServerRuntime();
    final ServerPlane plane = server.materializePlane(name, TestValuePlane.class, storeDef(name));
    class ValueLinkController implements WillSet<String>, DidSet<String>,
        WillReceive, WillLink, DidLink, WillSync, DidSync, WillUnlink, DidUnlink,
        DidConnect, DidDisconnect, DidClose {
      @Override
      public String willSet(String newValue) {
        System.out.println("willSet: " + newValue);
        return newValue;
      }

      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println("didSet: " + newValue);
      }

      @Override
      public void willReceive(Value value) {
        System.out.println("willReceive: " + Recon.toString(value));
        fail();
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
      server.start();
      plane.bind("localhost", 53556);
      final ValueDownlink<String> valueLink = plane.downlinkValue()
          .valueClass(String.class)
          .hostUri("swim://localhost:53556/")
          .nodeUri("/value/hello")
          .laneUri("value")
          .keepLinked(false)
          .observe(new ValueLinkController())
          .open();
      valueLink.set("Hello, world!");
      Thread.sleep(100);
    } finally {
      server.stop();
      delete(name);
    }
  }

  @SwimRoute("/join/value/:name")
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
        System.out.println(testJoinValue.nodeUri().toString() + " willDownlink key: " + key + "; downlink: " + downlink);
        return downlink;
      }

      @Override
      public void didDownlink(String key, ValueDownlink<?> downlink) {
        System.out.println(testJoinValue.nodeUri().toString() + " didDownlink key: " + key + "; downlink: " + downlink);
      }

      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println(testJoinValue.nodeUri().toString() + " willUpdate key: " + key + "; newValue: " + newValue);
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println(testJoinValue.nodeUri().toString() + " didUpdate key: " + key + "; newValue: " + newValue + "; oldValue: " + oldValue);
      }
    }

    @Override
    public void didStart() {
      testJoinValue.downlink("x").nodeUri("/value/x").laneUri("value").open();
      testJoinValue.downlink("y").nodeUri("/value/y").laneUri("value").open();
    }
  }

  static class TestJoinValuePlane extends AbstractPlane {
    final AgentType<?> valueAgent = agentClass(TestValueLaneAgent.class);
    final AgentType<?> joinValueAgent = agentClass(TestJoinValueLaneAgent.class);
  }

  @Test
  public void testLinkToJoinValueLane() throws InterruptedException {
    final String name = "joinValue";
    final CountDownLatch willReceive = new CountDownLatch(2);
    final ServerRuntime server = new ServerRuntime();
    final ServerPlane plane = server.materializePlane(name, TestJoinValuePlane.class, storeDef(name));
    class JoinValueLinkController implements WillUpdateKey<String, String>, DidUpdateKey<String, String>,
        WillReceive, WillLink, DidLink, WillSync, DidSync, WillUnlink, DidUnlink,
        DidConnect, DidDisconnect, DidClose {
      @Override
      public String willUpdate(String key, String newValue) {
        System.out.println("join willUpdate key: " + key + "; newValue: " + newValue);
        return newValue;
      }

      @Override
      public void didUpdate(String key, String newValue, String oldValue) {
        System.out.println("join didUpdate key: " + key + "; newValue: " + newValue);
      }

      @Override
      public void willReceive(Value value) {
        System.out.println("join willReceive: " + Recon.toString(value));
        willReceive.countDown();
      }

      @Override
      public void willLink() {
        System.out.println("join willLink");
      }

      @Override
      public void didLink() {
        System.out.println("join didLink");
      }

      @Override
      public void willSync() {
        System.out.println("join willSync");
      }

      @Override
      public void didSync() {
        System.out.println("join didSync");
      }

      @Override
      public void willUnlink() {
        System.out.println("join willUnlink");
      }

      @Override
      public void didUnlink() {
        System.out.println("join didUnlink");
      }

      @Override
      public void didConnect() {
        System.out.println("join didConnect");
      }

      @Override
      public void didDisconnect() {
        System.out.println("join didDisconnect");
      }

      @Override
      public void didClose() {
        System.out.println("join didClose");
      }
    }
    try {
      server.start();
      plane.bind("localhost", 53556);
      final ValueDownlink<String> x = plane.downlinkValue()
          .valueClass(String.class)
          .hostUri("swim://localhost:53556/")
          .nodeUri("/value/x")
          .laneUri("value")
          .open();
      x.set("x0");
      final ValueDownlink<String> y = plane.downlinkValue()
          .valueClass(String.class)
          .hostUri("swim://localhost:53556/")
          .nodeUri("/value/y")
          .laneUri("value")
          .open();
      y.set("y0");

      final MapDownlink<String, String> join = plane.downlinkMap()
          .keyClass(String.class)
          .valueClass(String.class)
          .hostUri("swim://localhost:53556/")
          .nodeUri("/join/value/all")
          .laneUri("join")
          .observe(new JoinValueLinkController())
          .open();

      willReceive.await(2, TimeUnit.SECONDS);
      Thread.sleep(100);

      final HashTrieMap<String, String> expected = HashTrieMap.of("x", "x0").updated("y", "y0");
      assertEquals(join.values(), expected.values());
      assertEquals(join.keySet(), expected.keySet());
    } finally {
      server.stop();
      delete(name);
    }
  }

  @SwimRoute("/command/:name")
  static class TestCommandLaneAgent extends AbstractAgent {
    @SwimLane("command")
    CommandLane<String> testValue = commandLane()
        .valueClass(String.class)
        .onCommand(new OnCommand<String>() {
          @Override
          public void onCommand(String value) {
            System.out.println(testValue.nodeUri().toString() + " onCommand: " + value);
          }
        });
  }

  static class TestCommandPlane extends AbstractPlane {
    final AgentType<?> commandAgent = agentClass(TestCommandLaneAgent.class);
  }

  @Test
  public void testLinkToCommandLane() throws InterruptedException {
    final String name = "command";
    final CountDownLatch onEvent = new CountDownLatch(1);
    final ServerRuntime server = new ServerRuntime();
    final ServerPlane plane = server.materializePlane(name, TestCommandPlane.class, storeDef(name));
    class CommandLinkController implements OnEvent<String>,
        WillLink, DidLink, WillSync, DidSync, WillUnlink, DidUnlink,
        DidConnect, DidDisconnect, DidClose {
      @Override
      public void onEvent(String value) {
        System.out.println("onEvent: " + value);
        onEvent.countDown();
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
      server.start();
      plane.bind("localhost", 53556);
      final EventDownlink<String> commandLink = plane.downlink()
          .valueClass(String.class)
          .hostUri("swim://localhost:53556/")
          .nodeUri("/command/hello")
          .laneUri("command")
          .observe(new CommandLinkController())
          .open();
      commandLink.command(Value.fromObject("Hello, world!"));
      onEvent.await(2, TimeUnit.SECONDS);
    } finally {
      server.stop();
      delete(name);
    }
  }


  @SwimRoute("/ping")
  static class TestPingAgent extends AbstractAgent {
    @SwimLane("ping")
    CommandLane<Value> ping = this.<Value>commandLane()
        .onCommand(new OnCommand<Value>() {
          @Override
          public void onCommand(Value value) {
            System.out.println(ping.nodeUri().toString() + " onPing: " + Recon.toString(value));
            context.command("/pong", "pong", Record.of().attr("pong"));
          }
        });
  }

  @SwimRoute("/pong")
  static class TestPongAgent extends AbstractAgent {
    @SwimLane("start")
    CommandLane<Value> start = commandLane();

    @SwimLane("pong")
    CommandLane<Value> pong = this.<Value>commandLane()
        .onCommand(new OnCommand<Value>() {
          @Override
          public void onCommand(Value value) {
            System.out.println(pong.nodeUri().toString() + " onPong: " + Recon.toString(value));
          }
        });

    @Override
    public void didStart() {
      context.command("/ping", "ping", Record.of().attr("ping"));
    }
  }

  static class TestPingPongPlane extends AbstractPlane {
    final AgentType<?> pingAgent = agentClass(TestPingAgent.class);
    final AgentType<?> pongAgent = agentClass(TestPongAgent.class);
  }

  @Test
  public void testCommandPingPong() throws InterruptedException {
    final String name = "pingpong";
    final CountDownLatch onPong = new CountDownLatch(1);
    final ServerRuntime server = new ServerRuntime();
    final ServerPlane plane = server.materializePlane(name, TestPingPongPlane.class, storeDef(name));
    try {
      server.start();
      plane.bind("localhost", 53556);
      final EventDownlink<String> pongLink = plane.downlink()
          .valueClass(String.class)
          .hostUri("swim://localhost:53556/")
          .nodeUri("/pong")
          .laneUri("pong")
          .onEvent(new OnEvent<String>() {
            @Override
            public void onEvent(String value) {
              onPong.countDown();
            }
          })
          .open();
      onPong.await(2, TimeUnit.SECONDS);
    } finally {
      server.stop();
      delete(name);
    }
  }


  @SwimRoute("/node/:name")
  static class TestGraphAgent extends AbstractAgent {
    @SwimLane("info")
    ValueLane<String> info = valueLane()
        .valueClass(String.class)
        .observe(new InfoController());

    class InfoController implements WillSet<String>, DidSet<String> {
      @Override
      public String willSet(String newValue) {
        System.out.println(info.nodeUri().toString() + " willSet newInfo: " + newValue);
        return newValue + "!";
      }

      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println(info.nodeUri().toString() + " didSet newInfo: " + newValue + "; oldValue: " + oldValue);
      }
    }

    @Override
    public void willOpen() {
      context.addTrait(Value.fromObject("test"), TestGraphAgentTrait.class);
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
        System.out.println(info.nodeUri().toString() + " trait willSet newInfo: " + newValue);
        return newValue;
      }

      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println(info.nodeUri().toString() + " trait didSet newInfo: " + newValue + "; oldValue: " + oldValue);
      }
    }

    @SwimLane("value")
    ValueLane<String> value = valueLane()
        .valueClass(String.class)
        .observe(new ValueController());

    class ValueController implements WillSet<String>, DidSet<String> {
      @Override
      public String willSet(String newValue) {
        System.out.println(value.nodeUri().toString() + " trait willSet newValue: " + newValue);
        return newValue;
      }

      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println(value.nodeUri().toString() + " trait didSet newValue: " + newValue + "; oldValue: " + oldValue);
      }
    }
  }

  static class TestGraphPlane extends AbstractPlane {
    final AgentType<?> valueAgent = agentClass(TestGraphAgent.class);
  }

  @Test
  public void testExtensionLane() throws InterruptedException {
    final String name = "ext";
    final CountDownLatch willReceive = new CountDownLatch(1);
    final ServerRuntime server = new ServerRuntime();
    final ServerPlane plane = server.materializePlane(name, TestGraphPlane.class, storeDef(name));
    class ValueLinkController implements WillSet<String>, DidSet<String>,
        WillReceive, WillLink, DidLink, WillSync, DidSync, WillUnlink, DidUnlink,
        DidConnect, DidDisconnect, DidClose {
      @Override
      public String willSet(String newValue) {
        System.out.println("willSet: " + newValue);
        return newValue;
      }

      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println("didSet: " + newValue);
      }

      @Override
      public void willReceive(Value value) {
        System.out.println("willReceive: " + Recon.toString(value));
        willReceive.countDown();
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
      server.start();
      plane.bind("localhost", 53556);
      final ValueDownlink<String> valueLink = plane.downlinkValue()
          .valueClass(String.class)
          .hostUri("swim://localhost:53556/")
          .nodeUri("/node/root")
          .laneUri("value")
          .observe(new ValueLinkController())
          .open();
      valueLink.set("Hello, world!");
      willReceive.await(2, TimeUnit.SECONDS);
      Thread.sleep(100);
    } finally {
      server.stop();
      delete(name);
    }
  }

  @Test
  public void testOverloadedLane() throws InterruptedException {
    final String name = "overload";
    final CountDownLatch willReceive = new CountDownLatch(1);
    final ServerRuntime server = new ServerRuntime();
    final ServerPlane plane = server.materializePlane(name, TestGraphPlane.class, storeDef(name));
    class InfoLinkController implements WillSet<String>, DidSet<String>,
        WillReceive, WillLink, DidLink, WillSync, DidSync, WillUnlink, DidUnlink,
        DidConnect, DidDisconnect, DidClose {
      @Override
      public String willSet(String newValue) {
        System.out.println("willSet: " + newValue);
        return newValue;
      }

      @Override
      public void didSet(String newValue, String oldValue) {
        System.out.println("didSet: " + newValue);
      }

      @Override
      public void willReceive(Value value) {
        System.out.println("willReceive: " + Recon.toString(value));
        willReceive.countDown();
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
      server.start();
      plane.bind("localhost", 53556);
      final ValueDownlink<String> infoLink = plane.downlinkValue()
          .valueClass(String.class)
          .hostUri("swim://localhost:53556/")
          .nodeUri("/node/root")
          .laneUri("info")
          .observe(new InfoLinkController())
          .open();
      infoLink.set("Hello, world");
      willReceive.await(2, TimeUnit.SECONDS);
      Thread.sleep(100);
    } finally {
      server.stop();
      delete(name);
    }
  }

  private StoreDef storeDef(String value) {
    return new StoreDef(System.getProperty("java.io.tmpdir") + "/swim/" + value);
  }

  private void delete(String name) {
    final String dirName = System.getProperty("java.io.tmpdir") + "/swim/" + name;
    deleteR(dirName);
  }

  private void deleteR(String name) {
    final File dir = new File(name);
    if (!dir.exists()) {
      return;
    }
    for (File file : dir.listFiles()) {
      if (file.isDirectory()) {
        deleteR(file.getAbsolutePath());
      }
      try {
        file.delete();
      } catch (Exception e) {
        System.out.println("WARNING: failed to remove from " + name);
      }
    }
    try {
      dir.delete();
    } catch (Exception swallow) {
    }
  }
}
