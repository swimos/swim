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
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.java.lang.HostObject;

public final class HostAgent {
  private HostAgent() {
    // static
  }

  public static final HostObjectType<Agent> TYPE;

  static {
    final JavaHostObjectType<Agent> type = new JavaHostObjectType<>(Agent.class);
    TYPE = type;
    type.inheritType(HostObject.TYPE);
    type.addMember(new HostAgentAgentContext());
  }
}

final class HostAgentAgentContext implements HostMethod<Agent> {
  @Override
  public String key() {
    return "agentContext";
  }

  @Override
  public Object invoke(Bridge bridge, Agent agent, Object... arguments) {
    return agent.agentContext();
  }
}
