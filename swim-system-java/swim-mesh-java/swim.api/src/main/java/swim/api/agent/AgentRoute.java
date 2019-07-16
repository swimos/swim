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

/**
 * Factory for {@link Agent agents} that are lazily instantiated when a node
 * URI route pattern is accessed.
 */
public interface AgentRoute<A extends Agent> extends AgentFactory<A> {
  /**
   * The internal context used to provide concrete implementations to most
   * {@code AgentRoute} methods.
   */
  AgentRouteContext agentRouteContext();

  /**
   * Updates the internal context used to provide concrete implementations to
   * most {@code AgentRoute} methods.
   */
  void setAgentRouteContext(AgentRouteContext context);

  /**
   * Returns a plane-unique identifier for this agent route.
   */
  String routeName();

  /**
   * The {@code UriPattern} that every {@code nodeUri} corresponding to an
   * instance of {@code A} must match.
   */
  UriPattern pattern();
}
