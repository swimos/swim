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

package swim.api.agent;

import swim.uri.UriPattern;

public abstract class AbstractAgentType<A extends Agent> implements AgentType<A> {
  protected AgentTypeContext context;

  @Override
  public AgentTypeContext getAgentTypeContext() {
    return context;
  }

  @Override
  public void setAgentTypeContext(AgentTypeContext context) {
    this.context = context;
  }

  @Override
  public String name() {
    return context.name();
  }

  @Override
  public UriPattern route() {
    return context.route();
  }

  @Override
  public abstract Class<? extends A> type();

  @Override
  public abstract A createAgent(AgentContext context);
}
