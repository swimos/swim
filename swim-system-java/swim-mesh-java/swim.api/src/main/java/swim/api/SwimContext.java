// Copyright 2015-2021 Swim inc.
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
import swim.api.plane.PlaneContext;
import swim.api.service.ServiceContext;

/**
 * Thread-local context variables.
 */
public final class SwimContext {

  private SwimContext() {
    // static
  }

  private static final ThreadLocal<ServiceContext> SERVICE_CONTEXT = new ThreadLocal<>();

  public static ServiceContext getServiceContext() {
    return SwimContext.SERVICE_CONTEXT.get();
  }

  public static void setServiceContext(ServiceContext serviceContext) {
    SwimContext.SERVICE_CONTEXT.set(serviceContext);
  }

  private static final ThreadLocal<PlaneContext> PLANE_CONTEXT = new ThreadLocal<>();

  public static PlaneContext getPlaneContext() {
    return SwimContext.PLANE_CONTEXT.get();
  }

  public static void setPlaneContext(PlaneContext planeContext) {
    SwimContext.PLANE_CONTEXT.set(planeContext);
  }

  private static final ThreadLocal<AgentContext> AGENT_CONTEXT = new ThreadLocal<>();

  public static AgentContext getAgentContext() {
    return SwimContext.AGENT_CONTEXT.get();
  }

  public static void setAgentContext(AgentContext agentContext) {
    SwimContext.AGENT_CONTEXT.set(agentContext);
  }

  private static final ThreadLocal<Lane> LANE = new ThreadLocal<>();

  public static Lane getLane() {
    return SwimContext.LANE.get();
  }

  public static void setLane(Lane lane) {
    SwimContext.LANE.set(lane);
  }

  private static final ThreadLocal<Link> LINK = new ThreadLocal<>();

  public static Link getLink() {
    return SwimContext.LINK.get();
  }

  public static void setLink(Link link) {
    SwimContext.LINK.set(link);
  }

  public static void clear() {
    SwimContext.SERVICE_CONTEXT.remove();
    SwimContext.PLANE_CONTEXT.remove();
    SwimContext.AGENT_CONTEXT.remove();
    SwimContext.LANE.remove();
    SwimContext.LINK.remove();
  }

}
