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
import org.testng.TestException;
import org.testng.annotations.Test;
import swim.actor.ActorSpaceDef;
import swim.api.SwimLane;
import swim.api.SwimRoute;
import swim.api.agent.AbstractAgent;
import swim.api.agent.AgentRoute;
import swim.api.downlink.EventDownlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.lane.CommandLane;
import swim.api.plane.AbstractPlane;
import swim.api.warp.WarpUplink;
import swim.api.warp.function.DidCommand;
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidReceive;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.DidUplink;
import swim.api.warp.function.OnCommand;
import swim.api.warp.function.OnEvent;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillReceive;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.api.warp.function.WillUplink;
import swim.codec.Format;
import swim.concurrent.Cont;
import swim.kernel.Kernel;
import swim.service.web.WebServiceDef;
import swim.structure.Form;
import swim.structure.Text;
import swim.structure.Value;
import swim.warp.CommandMessage;
import static org.testng.Assert.assertEquals;

public class CommandLaneSpec {

  @Test
  public void testLinkToCommandLane() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestCommandPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
                                         .openPlane("test", TestCommandPlane.class);

    final CountDownLatch commandDidSend = new CountDownLatch(2);
    final CountDownLatch linkOnEvent = new CountDownLatch(2);

    final CountDownLatch didConnect = new CountDownLatch(2);
    final CountDownLatch willLink = new CountDownLatch(2);
    final CountDownLatch didLink = new CountDownLatch(2);
    final CountDownLatch didDisconnect = new CountDownLatch(2);

    final CountDownLatch willReceiveLink = new CountDownLatch(2);
    final CountDownLatch didReceiveLink = new CountDownLatch(1);
    final CountDownLatch willReceivePlane = new CountDownLatch(2);
    final CountDownLatch didReceivePlane = new CountDownLatch(1);

    class CommandLinkController implements OnEvent<String>,
        WillLink, DidLink, WillSync, DidSync, WillUnlink, DidUnlink,
        DidConnect, DidDisconnect, DidClose, WillReceive, DidReceive {

      @Override
      public void onEvent(String value) {
        System.out.println("link onEvent value: " + Format.debug(value));
        linkOnEvent.countDown();
      }

      @Override
      public void willReceive(Value body) {
        System.out.println("link willReceive: " + body.stringValue());
        if ("Hello, link!".equals(body.stringValue())) {
          willReceiveLink.countDown();
        }
        if ("Hello, plane!".equals(body.stringValue())) {
          willReceivePlane.countDown();
        }
      }

      @Override
      public void didReceive(Value body) {
        System.out.println("link didReceive: " + body.stringValue());
        if ("Hello, link!".equals(body.stringValue())) {
          assertEquals(willReceiveLink.getCount(), 1);
          didReceiveLink.countDown();
        }
        if ("Hello, plane!".equals(body.stringValue())) {
          assertEquals(willReceivePlane.getCount(), 1);
          didReceivePlane.countDown();
        }
      }

      @Override
      public void willLink() {
        System.out.println("link willLink");
        //assertEquals(didConnect.getCount(), 1);
        willLink.countDown();
      }

      @Override
      public void didLink() {
        System.out.println("link didLink");
        assertEquals(willLink.getCount(), 1);
        didLink.countDown();
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
        didConnect.countDown();
      }

      @Override
      public void didDisconnect() {
        System.out.println("link didDisconnect");
        didDisconnect.countDown();
      }

      @Override
      public void didClose() {
        System.out.println("link didClose");
      }

    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final EventDownlink<String> commandLink = plane.downlink()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/command/hello")
          .laneUri("command")
          .observe(new CommandLinkController())
          .open();
      commandLink.command(Text.from("Hello, link!"), new Cont<CommandMessage>() {
        @Override
        public void bind(CommandMessage message) {
          commandDidSend.countDown();
        }

        @Override
        public void trap(Throwable error) {
          throw new TestException(error);
        }
      });
      plane.command("warp://localhost:53556", "/command/hello", "command", Text.from("Hello, plane!"), new Cont<CommandMessage>() {
        @Override
        public void bind(CommandMessage message) {
          commandDidSend.countDown();
        }

        @Override
        public void trap(Throwable error) {
          throw new TestException(error);
        }
      });

      didReceivePlane.await(1, TimeUnit.SECONDS);
      didReceiveLink.await(1, TimeUnit.SECONDS);

      //TODO: Why do EventDownlinks have access to willCommand but not onCommand/didCommand?

      //assertEquals(didConnect.getCount(), 1); //TODO: Duplicate didConnect calls
      assertEquals(willLink.getCount(), 1);
      assertEquals(didLink.getCount(), 1);
      assertEquals(commandDidSend.getCount(), 0);
      assertEquals(linkOnEvent.getCount(), 0);
      assertEquals(willReceiveLink.getCount(), 1);
      assertEquals(didReceiveLink.getCount(), 0);
      assertEquals(willReceivePlane.getCount(), 1);
      assertEquals(didReceivePlane.getCount(), 0);
    } finally {
      kernel.stop();
      assertEquals(didDisconnect.getCount(), 1);
    }
  }

  private static CountDownLatch willCommand;
  private static CountDownLatch onCommand;
  private static CountDownLatch didCommand;
  private static CountDownLatch willUplink;
  private static CountDownLatch didUplink;

  private static void resetLatches() {
    willCommand = new CountDownLatch(2);
    onCommand = new CountDownLatch(2);
    didCommand = new CountDownLatch(1);
    willUplink = new CountDownLatch(2);
    didUplink = new CountDownLatch(1);
  }

  @Test
  public void testCommandLaneCallbacks() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestCommandPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
            .openPlane("test", TestCommandPlane.class);

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();

      resetLatches();

      final EventDownlink<String> commandLink = plane.downlink()
              .valueForm(Form.forString())
              .hostUri("warp://localhost:53556")
              .nodeUri("/commandLatched/hello")
              .laneUri("command")
              .open();
      commandLink.command(Text.from("Hi"));

      didUplink.await(2, TimeUnit.SECONDS);
      didCommand.await(2, TimeUnit.SECONDS);
      assertEquals(willCommand.getCount(), 1);
      assertEquals(onCommand.getCount(), 1);
      assertEquals(didCommand.getCount(), 0);
      //assertEquals(willUplink.getCount(), 1); //TODO: wilUplink not implemented
      assertEquals(didUplink.getCount(), 0);

    } finally {
      kernel.stop();
    }
  }

  static class TestCommandLaneAgent extends AbstractAgent {

    @SwimLane("command")
    CommandLane<String> testValue = commandLane()
        .valueClass(String.class)
        .onCommand(new OnCommand<String>() {
          @Override
          public void onCommand(String value) {
            System.out.println("lane onCommand value: " + Format.debug(value));
          }
        });

  }

  static class TestLatchedCommandLaneAgent extends AbstractAgent {

    @SwimLane("command")
    CommandLane<String> testValue = commandLane()
            .valueForm(Form.forString())
            .observe(new TestCommandLaneControllerLatched());

    class TestCommandLaneControllerLatched implements WillCommand, OnCommand<String>, DidCommand,
            WillUplink, DidUplink {

      @Override
      public void willCommand(Value body) {
        System.out.println(nodeUri() + " willCommand: " + body.stringValue());
        assertEquals(didUplink.getCount(), 0);
        willCommand.countDown();
      }

      @Override
      public void onCommand(String value) {
        System.out.println(nodeUri() + " onCommand: " + value);
        assertEquals(willCommand.getCount(), 1);
        onCommand.countDown();
      }

      @Override
      public void didCommand(Value body) {
        System.out.println(nodeUri() + " onCommand: " + body.stringValue());
        assertEquals(onCommand.getCount(), 1);
        didCommand.countDown();
      }

      @Override
      public void willUplink(WarpUplink uplink) {
        System.out.println(nodeUri() + " willUplink: " + uplink.toString());
        willUplink.countDown();
      }

      @Override
      public void didUplink(WarpUplink uplink) {
        System.out.println(nodeUri() + " didUplink: " + uplink.toString());
        //assertEquals(willUplink.getCount(), 1);
        didUplink.countDown();
      }

    }

  }

  static class TestCommandPlane extends AbstractPlane {

    @SwimRoute("/command/:name")
    AgentRoute<TestCommandLaneAgent> commandAgent;

    @SwimRoute("/commandLatched/:name")
    AgentRoute<TestLatchedCommandLaneAgent> latchedCommandAgent;

  }

}
