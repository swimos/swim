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

package swim.runtime;

import swim.api.agent.Agent;
import swim.api.agent.AgentDef;
import swim.api.agent.AgentFactory;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.policy.PolicyDirective;
import swim.structure.Value;
import swim.uri.Uri;

public interface MeshContext extends TierContext, CellContext {
  EdgeBinding edge();

  MeshBinding meshWrapper();

  <T> T unwrapMesh(Class<T> meshClass);

  @Override
  Uri meshUri();

  PartBinding createPart(Value partKey);

  PartBinding injectPart(Value partKey, PartBinding part);

  HostBinding createHost(Value partKey, Uri hostUri);

  HostBinding injectHost(Value partKey, Uri hostUri, HostBinding host);

  NodeBinding createNode(Value partKey, Uri hostUri, Uri nodeUri);

  NodeBinding injectNode(Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node);

  LaneBinding createLane(Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef);

  LaneBinding createLane(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri);

  LaneBinding injectLane(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane);

  void openLanes(Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node);

  AgentFactory<?> createAgentFactory(Value partKey, Uri hostUri, Uri nodeUri, AgentDef agentDef);

  <A extends Agent> AgentFactory<A> createAgentFactory(Value partKey, Uri hostUri, Uri nodeUri,
                                                       Class<? extends A> agentClass);

  void openAgents(Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node);

  PolicyDirective<Identity> authenticate(Credentials credentials);
}
