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

import org.testng.annotations.Test;
import swim.actor.ActorSpaceDef;
import swim.api.SwimAgent;
import swim.api.SwimRoute;
import swim.api.agent.AbstractAgent;
import swim.api.agent.AgentRoute;
import swim.api.plane.AbstractPlane;
import swim.kernel.Kernel;
import swim.uri.Uri;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNotNull;
import static org.testng.Assert.assertNull;

public class ServerKernelSpec {
  static class TestAgent extends AbstractAgent {
  }

  static class TestPlane extends AbstractPlane {
    @SwimAgent("test")
    @SwimRoute("/test/:name")
    AgentRoute<TestAgent> testRoute;
  }

  @Test
  public void testAgentRouteReflection() {
    final Kernel kernel = ServerLoader.loadServerStack();

    final TestPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
                                  .openPlane("test", TestPlane.class);
    assertNotNull(plane);

    final AgentRoute<?> nopRoute = plane.getAgentRoute("test");
    assertNotNull(nopRoute);
    assertEquals(plane.getAgentFactory(Uri.parse("/test/foo")), nopRoute);
    assertEquals(plane.getAgentFactory(Uri.parse("/test/bar")), nopRoute);
    assertNull(plane.getAgentFactory(Uri.parse("/test/")));
  }
}
