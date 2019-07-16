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

import swim.api.agent.AgentRouteContext;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.java.lang.HostObject;

public final class HostAgentRouteContext {
  private HostAgentRouteContext() {
    // static
  }

  public static final HostObjectType<AgentRouteContext> TYPE;

  static {
    final JavaHostObjectType<AgentRouteContext> type = new JavaHostObjectType<>(AgentRouteContext.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE);
    type.addMember(new HostAgentRouteContextRouteName());
    type.addMember(new HostAgentRouteContextPattern());
  }
}

final class HostAgentRouteContextRouteName implements HostMethod<AgentRouteContext> {
  @Override
  public String key() {
    return "routeName";
  }

  @Override
  public Object invoke(Bridge bridge, AgentRouteContext agentRouteContext, Object... arguments) {
    return agentRouteContext.routeName();
  }
}

final class HostAgentRouteContextPattern implements HostMethod<AgentRouteContext> {
  @Override
  public String key() {
    return "pattern";
  }

  @Override
  public Object invoke(Bridge bridge, AgentRouteContext agentRouteContext, Object... arguments) {
    return agentRouteContext.pattern();
  }
}
