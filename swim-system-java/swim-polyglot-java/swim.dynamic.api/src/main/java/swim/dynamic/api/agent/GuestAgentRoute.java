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
import swim.api.agent.AgentRoute;
import swim.api.agent.AgentRouteContext;
import swim.dynamic.Bridge;
import swim.dynamic.BridgeGuest;
import swim.structure.Text;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriPattern;

public class GuestAgentRoute extends BridgeGuest implements AgentRoute<Agent> {
  protected AgentRouteContext context;

  public GuestAgentRoute(Bridge bridge, Object guest) {
    super(bridge, guest);
  }

  @Override
  public AgentRouteContext agentRouteContext() {
    return this.context;
  }

  @Override
  public void setAgentRouteContext(AgentRouteContext context) {
    this.context = context;
  }

  @Override
  public String routeName() {
    return this.context.routeName();
  }

  @Override
  public UriPattern pattern() {
    return this.context.pattern();
  }

  @Override
  public Agent createAgent(AgentContext context) {
    if (this.bridge.guestCanInvokeMember(this.guest, "createAgent")) {
      final Object agent = this.bridge.guestInvokeMember(this.guest, "createAgent", context);
      if (agent instanceof Agent) {
        return (Agent) agent;
      } else if (agent != null) {
        return new GuestAgent(this.bridge, agent, context);
      }
    }
    return null;
  }

  @Override
  public Value id(Uri nodeUri) {
    if (this.bridge.guestCanInvokeMember(this.guest, "id")) {
      final Object id = this.bridge.guestInvokeMember(this.guest, "id", nodeUri);
      if (id instanceof Value) {
        return (Value) id;
      }
    }
    return Text.from(this.context.routeName());
  }

  @Override
  public Value props(Uri nodeUri) {
    if (this.bridge.guestCanInvokeMember(this.guest, "props")) {
      final Object props = this.bridge.guestInvokeMember(this.guest, "props", nodeUri);
      if (props instanceof Value) {
        return (Value) props;
      }
    }
    return Value.absent();
  }
}
