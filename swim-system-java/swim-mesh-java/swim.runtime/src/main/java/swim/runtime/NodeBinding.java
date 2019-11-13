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
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.structure.Value;
import swim.uri.Uri;

public interface NodeBinding extends TierBinding, CellBinding {
  HostBinding host();

  NodeBinding nodeWrapper();

  NodeContext nodeContext();

  void setNodeContext(NodeContext nodeContext);

  <T> T unwrapNode(Class<T> nodeClass);

  NodeAddress cellAddress();

  Uri meshUri();

  Value partKey();

  Uri hostUri();

  Uri nodeUri();

  long createdTime();

  void openMetaNode(NodeBinding node, NodeBinding metaNode);

  FingerTrieSeq<Value> agentIds();

  FingerTrieSeq<Agent> agents();

  AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef);

  <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass);

  void openAgents(NodeBinding node);

  HashTrieMap<Uri, LaneBinding> lanes();

  LaneBinding getLane(Uri laneUri);

  LaneBinding openLane(Uri laneUri);

  LaneBinding openLane(Uri laneUri, LaneBinding lane);

  void openLanes(NodeBinding node);

  void openMetaLane(LaneBinding lane, NodeBinding metaLane);

  void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink);
}
