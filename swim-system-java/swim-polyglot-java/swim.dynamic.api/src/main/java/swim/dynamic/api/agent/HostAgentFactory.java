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
import swim.api.agent.AgentContext;
import swim.api.agent.AgentFactory;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.java.lang.HostObject;

public final class HostAgentFactory {
  private HostAgentFactory() {
    // static
  }

  public static final HostObjectType<AgentFactory<Agent>> TYPE;

  static {
    final JavaHostObjectType<AgentFactory<Agent>> type = new JavaHostObjectType<>(AgentFactory.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE);
    type.addMember(new HostAgentFactoryCreateAgent());
  }
}

final class HostAgentFactoryCreateAgent implements HostMethod<AgentFactory<Agent>> {
  @Override
  public String key() {
    return "createAgent";
  }

  @Override
  public Object invoke(Bridge bridge, AgentFactory<Agent> agentFactory, Object... arguments) {
    final AgentContext agentContext = (AgentContext) arguments[0];
    return agentFactory.createAgent(agentContext);
  }
}
