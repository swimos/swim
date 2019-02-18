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

package swim.api;

import swim.api.agent.AgentContext;
import swim.api.client.ClientContext;
import swim.api.lane.Lane;
import swim.api.plane.PlaneContext;
import swim.api.server.ServerContext;

/**
 * Thread-local context variables.
 */
public final class SwimContext {
  private SwimContext() {
    // nop
  }

  private static final ThreadLocal<ClientContext> CLIENT_CONTEXT = new ThreadLocal<>();
  private static final ThreadLocal<ServerContext> SERVER_CONTEXT = new ThreadLocal<>();
  private static final ThreadLocal<PlaneContext> PLANE_CONTEXT = new ThreadLocal<>();
  private static final ThreadLocal<AgentContext> AGENT_CONTEXT = new ThreadLocal<>();
  private static final ThreadLocal<Lane> LANE = new ThreadLocal<>();
  private static final ThreadLocal<Link> LINK = new ThreadLocal<>();

  public static ClientContext getClientContext() {
    return CLIENT_CONTEXT.get();
  }

  public static void setClientContext(ClientContext clientContext) {
    CLIENT_CONTEXT.set(clientContext);
  }

  public static ServerContext getServerContext() {
    return SERVER_CONTEXT.get();
  }

  public static void setServerContext(ServerContext serverContext) {
    SERVER_CONTEXT.set(serverContext);
  }

  public static PlaneContext getPlaneContext() {
    return PLANE_CONTEXT.get();
  }

  public static void setPlaneContext(PlaneContext planeContext) {
    PLANE_CONTEXT.set(planeContext);
  }

  public static AgentContext getAgentContext() {
    return AGENT_CONTEXT.get();
  }

  public static void setAgentContext(AgentContext agentContext) {
    AGENT_CONTEXT.set(agentContext);
  }

  public static Lane getLane() {
    return LANE.get();
  }

  public static void setLane(Lane lane) {
    LANE.set(lane);
  }

  public static Link getLink() {
    return LINK.get();
  }

  public static void setLink(Link link) {
    LINK.set(link);
  }

  public static void clear() {
    CLIENT_CONTEXT.remove();
    SERVER_CONTEXT.remove();
    PLANE_CONTEXT.remove();
    AGENT_CONTEXT.remove();
    LANE.remove();
    LINK.remove();
  }
}
