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

public interface PartContext extends TierContext, CellContext {
  MeshBinding mesh();

  PartBinding partWrapper();

  <T> T unwrapPart(Class<T> partClass);

  @Override
  PartAddress cellAddress();

  @Override
  String edgeName();

  @Override
  Uri meshUri();

  Value partKey();

  void openMetaPart(PartBinding part, NodeBinding metaPart);

  HostBinding createHost(HostAddress hostAddress);

  HostBinding injectHost(HostAddress hostAddress, HostBinding host);

  void openMetaHost(HostBinding host, NodeBinding metaHost);

  NodeBinding createNode(NodeAddress nodeAddress);

  NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node);

  void openMetaNode(NodeBinding node, NodeBinding metaNode);

  LaneBinding createLane(LaneAddress laneAddress);

  LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane);

  void openMetaLane(LaneBinding lane, NodeBinding metaLane);

  void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink);

  LaneBinding createLane(NodeBinding node, LaneDef laneDef);

  void openLanes(NodeBinding node);

  AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef);

  <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass);

  void openAgents(NodeBinding node);

  PolicyDirective<Identity> authenticate(Credentials credentials);

  void hostDidConnect(Uri hostUri);

  void hostDidDisconnect(Uri hostUri);
}
