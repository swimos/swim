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
import swim.api.downlink.EventDownlink;
import swim.api.lane.CommandLane;
import swim.api.plane.AbstractPlane;
import swim.api.warp.function.OnCommand;
import swim.api.warp.function.OnEvent;
import swim.kernel.Kernel;
import swim.recon.Recon;
import swim.service.web.WebServiceDef;
import swim.structure.Attr;
import swim.structure.Record;
import swim.structure.Value;
import static org.testng.Assert.assertEquals;

public class PingPongSpec {
  static class TestPingAgent extends AbstractAgent {
    @SwimLane("ping")
    CommandLane<Value> ping = this.<Value>commandLane()
        .onCommand(new OnCommand<Value>() {
          @Override
          public void onCommand(Value value) {
            System.out.println(nodeUri() + " onPing: " + Recon.toString(value));
            context.command("warp://localhost:53556", "/pong", "pong", Record.of(Attr.of("pong")));
          }
        });
  }

  static class TestPongAgent extends AbstractAgent {
    @SwimLane("pong")
    CommandLane<Value> pong = this.<Value>commandLane()
        .onCommand(new OnCommand<Value>() {
          @Override
          public void onCommand(Value value) {
            System.out.println(nodeUri() + " onPong: " + Recon.toString(value));
          }
        });

    @Override
    public void didStart() {
      context.command("/ping", "ping", Record.of(Attr.of("ping")));
    }
  }

  static class TestPingPongPlane extends AbstractPlane {
    @SwimRoute("/ping")
    AgentRoute<TestPingAgent> ping;

    @SwimRoute("/pong")
    AgentRoute<TestPongAgent> pong;
  }

  @Test
  public void testCommandPingPong() throws InterruptedException {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestPingPongPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
                                          .openPlane("test", TestPingPongPlane.class);

    final CountDownLatch onPong = new CountDownLatch(1);
    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final EventDownlink<String> pongLink = plane.downlink()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/pong")
          .laneUri("pong")
          .onEvent(new OnEvent<String>() {
            @Override
            public void onEvent(String value) {
              onPong.countDown();
            }
          })
          .open();
      onPong.await(1, TimeUnit.SECONDS);
      assertEquals(onPong.getCount(), 0);
    } finally {
      kernel.stop();
    }
  }
}
