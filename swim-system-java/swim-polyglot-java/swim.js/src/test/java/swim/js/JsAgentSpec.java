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

package swim.js;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.testng.annotations.Test;
import swim.actor.ActorNodeDef;
import swim.actor.ActorSpace;
import swim.actor.ActorSpaceDef;
import swim.api.downlink.EventDownlink;
import swim.api.warp.function.OnEvent;
import swim.kernel.Kernel;
import swim.server.ServerLoader;
import swim.service.web.WebServiceDef;
import swim.structure.Text;
import swim.uri.UriPath;

public class JsAgentSpec {
  @Test
  public void testJsAgentCommands() throws InterruptedException {
    final JsKernel jsKernel = new JsKernel();
    jsKernel.setRootPath(UriPath.parse(System.getProperty("project.dir")));
    final Kernel kernel = ServerLoader.loadServerStack().injectKernel(jsKernel);

    final ActorSpaceDef spaceDef = ActorSpaceDef.fromName("test")
        .nodeDef(ActorNodeDef.fromNodePattern("/command/:name")
                             .agentDef(JsAgentDef.fromModulePath("./src/test/js/TestCommandAgent")));
    final ActorSpace space = (ActorSpace) kernel.openSpace(spaceDef);

    final CountDownLatch linkOnEvent = new CountDownLatch(1);
    class CommandLinkController implements OnEvent<String> {
      @Override
      public void onEvent(String value) {
        System.out.println("link onEvent value: " + value);
        linkOnEvent.countDown();
      }
    }

    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();
      final EventDownlink<String> commandLink = space.downlink()
          .valueClass(String.class)
          .hostUri("warp://localhost:53556")
          .nodeUri("/command/hello")
          .laneUri("command")
          .observe(new CommandLinkController())
          .open();
      commandLink.command(Text.from("Hello, world!"));
      linkOnEvent.await(1, TimeUnit.SECONDS);
    } finally {
      kernel.stop();
    }
  }
}
