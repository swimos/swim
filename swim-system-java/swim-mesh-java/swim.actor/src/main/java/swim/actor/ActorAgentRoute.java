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

package swim.actor;

import swim.api.agent.AgentRouteContext;
import swim.uri.UriPattern;

public class ActorAgentRoute implements AgentRouteContext {
  final String routeName;
  final UriPattern pattern;

  public ActorAgentRoute(String routeName, UriPattern pattern) {
    this.routeName = routeName;
    this.pattern = pattern;
  }

  @Override
  public final String routeName() {
    return this.routeName;
  }

  @Override
  public final UriPattern pattern() {
    return this.pattern;
  }
}
