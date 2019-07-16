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

package swim.dynamic.api.agent;

import swim.api.agent.Agent;
import swim.api.agent.AgentRoute;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;

public final class HostAgentRoute {
  private HostAgentRoute() {
    // static
  }

  public static final HostObjectType<AgentRoute<Agent>> TYPE;

  static {
    final JavaHostObjectType<AgentRoute<Agent>> type = new JavaHostObjectType<>(AgentRoute.class);
    TYPE = type;
    type.extendType(HostAgentFactory.TYPE);
    type.addMember(new HostAgentRouteAgentRouteContext());
    type.addMember(new HostAgentRouteRouteName());
    type.addMember(new HostAgentRoutePattern());
  }
}

final class HostAgentRouteAgentRouteContext implements HostMethod<AgentRoute<Agent>> {
  @Override
  public String key() {
    return "agentRouteContext";
  }

  @Override
  public Object invoke(Bridge bridge, AgentRoute<Agent> agentRoute, Object... arguments) {
    return agentRoute.agentRouteContext();
  }
}

final class HostAgentRouteRouteName implements HostMethod<AgentRoute<Agent>> {
  @Override
  public String key() {
    return "routeName";
  }

  @Override
  public Object invoke(Bridge bridge, AgentRoute<Agent> agentRoute, Object... arguments) {
    return agentRoute.routeName();
  }
}

final class HostAgentRoutePattern implements HostMethod<AgentRoute<Agent>> {
  @Override
  public String key() {
    return "pattern";
  }

  @Override
  public Object invoke(Bridge bridge, AgentRoute<Agent> agentRoute, Object... arguments) {
    return agentRoute.pattern();
  }
}
