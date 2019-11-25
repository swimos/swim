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
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.OnCommand;
import swim.api.warp.function.OnEvent;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.codec.Format;
import swim.concurrent.Cont;
import swim.kernel.Kernel;
import swim.service.web.WebServiceDef;
import swim.structure.Text;
import swim.warp.CommandMessage;
import static org.testng.Assert.assertEquals;

public class CommandLaneSpec {
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

  static class TestCommandPlane extends AbstractPlane {
    @SwimRoute("/command/:name")
    AgentRoute<TestCommandLaneAgent> commandAgent;
  }

  @Test
  public void testLinkToCommandLane() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestCommandPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
                                         .openPlane("test", TestCommandPlane.class);

    final CountDownLatch commandDidSend = new CountDownLatch(2);
    final CountDownLatch linkOnEvent = new CountDownLatch(2);
    class CommandLinkController implements OnEvent<String>,
        WillLink, DidLink, WillSync, DidSync, WillUnlink, DidUnlink,
        DidConnect, DidDisconnect, DidClose {
      @Override
      public void onEvent(String value) {
        System.out.println("link onEvent value: " + Format.debug(value));
        linkOnEvent.countDown();
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
      commandDidSend.await(1, TimeUnit.SECONDS);
      linkOnEvent.await(1, TimeUnit.SECONDS);
      assertEquals(commandDidSend.getCount(), 0);
      assertEquals(linkOnEvent.getCount(), 0);
    } finally {
      kernel.stop();
    }
  }
}
