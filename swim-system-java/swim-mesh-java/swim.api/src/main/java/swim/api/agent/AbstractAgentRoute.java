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

import swim.collections.HashTrieMap;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriPattern;

public abstract class AbstractAgentRoute<A extends Agent> implements AgentRoute<A> {
  protected AgentRouteContext context;

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
    final AgentRouteContext context = this.context;
    return context != null ? context.routeName() : null;
  }

  @Override
  public UriPattern pattern() {
    final AgentRouteContext context = this.context;
    return context != null ? context.pattern() : null;
  }

  @Override
  public abstract A createAgent(AgentContext context);

  @Override
  public Value props(Uri nodeUri) {
    final Record props = Record.create();
    final UriPattern pattern = pattern();
    if (pattern != null) {
      final HashTrieMap<String, String> params = pattern.unapply(nodeUri);
      for (HashTrieMap.Entry<String, String> param : params) {
        props.slot(param.getKey(), param.getValue());
      }
    }
    return props;
  }
}
