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

import swim.api.agent.Agent;
import swim.api.agent.AgentDef;
import swim.api.agent.AgentFactory;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.collections.HashTrieMap;
import swim.concurrent.Stage;
import swim.concurrent.StageDef;
import swim.runtime.CellAddress;
import swim.runtime.CellBinding;
import swim.runtime.CellContext;
import swim.runtime.HostAddress;
import swim.runtime.HostBinding;
import swim.runtime.HostDef;
import swim.runtime.LaneAddress;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LinkBinding;
import swim.runtime.LogDef;
import swim.runtime.MeshBinding;
import swim.runtime.NodeAddress;
import swim.runtime.NodeBinding;
import swim.runtime.NodeDef;
import swim.runtime.PartAddress;
import swim.runtime.PartBinding;
import swim.runtime.PartContext;
import swim.runtime.PartDef;
import swim.runtime.PartPredicate;
import swim.runtime.PolicyDef;
import swim.runtime.agent.AgentModel;
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;

public class ActorPart extends ActorTier implements PartBinding, PartContext {
  final PartBinding partBinding;
  PartContext partContext;
  PartDef partDef;

  public ActorPart(PartBinding partBinding, PartDef partDef) {
    this.partBinding = partBinding;
    this.partDef = partDef;
  }

  public final PartDef partDef() {
    return this.partDef;
  }

  public final ActorMesh actorMesh() {
    return mesh().unwrapMesh(ActorMesh.class);
  }

  @Override
  public final MeshBinding mesh() {
    return this.partContext.mesh();
  }

  @Override
  public final PartBinding partWrapper() {
    return this.partBinding.partWrapper();
  }

  public final PartBinding partBinding() {
    return this.partBinding;
  }

  @Override
  public final PartContext partContext() {
    return this.partContext;
  }

  @Override
  public void setPartContext(PartContext partContext) {
    this.partContext = partContext;
    this.partBinding.setPartContext(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapPart(Class<T> partClass) {
    if (partClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.partContext.unwrapPart(partClass);
    }
  }

  @Override
  public final CellBinding cellBinding() {
    return this.partBinding;
  }

  @Override
  public final CellContext cellContext() {
    return this.partContext;
  }

  @Override
  public final PartAddress cellAddress() {
    return this.partContext.cellAddress();
  }

  @Override
  public Value partKey() {
    return this.partContext.partKey();
  }

  @Override
  public PartPredicate predicate() {
    return this.partBinding.predicate();
  }

  @Override
  public HostBinding master() {
    return this.partBinding.master();
  }

  @Override
  public void setMaster(HostBinding master) {
    this.partBinding.setMaster(master);
  }

  @Override
  public HashTrieMap<Uri, HostBinding> hosts() {
    return this.partBinding.hosts();
  }

  @Override
  public HostBinding getHost(Uri hostUri) {
    return this.partBinding.getHost(hostUri);
  }

  @Override
  public HostBinding openHost(Uri hostUri) {
    return this.partBinding.openHost(hostUri);
  }

  @Override
  public HostBinding openHost(Uri hostUri, HostBinding host) {
    return this.partBinding.openHost(hostUri, host);
  }

  @Override
  public void hostDidConnect(Uri hostUri) {
    this.partContext.hostDidConnect(hostUri);
  }

  @Override
  public void hostDidDisconnect(Uri hostUri) {
    this.partContext.hostDidDisconnect(hostUri);
  }

  @Override
  public void reopenUplinks() {
    this.partBinding.reopenUplinks();
  }

  public Log createLog(LogDef logDef) {
    final ActorMesh mesh = actorMesh();
    return mesh != null ? mesh.createLog(logDef) : null;
  }

  public Log createLog(CellAddress cellAddress) {
    final ActorMesh mesh = actorMesh();
    return mesh != null ? mesh.createLog(cellAddress) : null;
  }

  public Log injectLog(Log log) {
    final ActorMesh mesh = actorMesh();
    return mesh != null ? mesh.injectLog(log) : log;
  }

  @Override
  protected Log openLog() {
    Log log;
    if (this.partDef != null && this.partDef.logDef() != null) {
      log = createLog(this.partDef.logDef());
    } else {
      log = createLog(cellAddress());
    }
    if (log != null) {
      log = injectLog(log);
    }
    return log;
  }

  public Policy createPolicy(PolicyDef policyDef) {
    final ActorMesh mesh = actorMesh();
    return mesh != null ? mesh.createPolicy(policyDef) : null;
  }

  public Policy createPolicy(CellAddress cellAddress) {
    final ActorMesh mesh = actorMesh();
    return mesh != null ? mesh.createPolicy(cellAddress) : null;
  }

  public Policy injectPolicy(Policy policy) {
    final ActorMesh mesh = actorMesh();
    return mesh != null ? mesh.injectPolicy(policy) : policy;
  }

  @Override
  protected Policy openPolicy() {
    Policy policy;
    if (this.partDef != null && this.partDef.policyDef() != null) {
      policy = createPolicy(this.partDef.policyDef());
    } else {
      policy = createPolicy(cellAddress());
    }
    if (policy != null) {
      policy = injectPolicy(policy);
    }
    return policy;
  }

  public Stage createStage(StageDef stageDef) {
    final ActorMesh mesh = actorMesh();
    return mesh != null ? mesh.createStage(stageDef) : null;
  }

  public Stage createStage(CellAddress cellAddress) {
    final ActorMesh mesh = actorMesh();
    return mesh != null ? mesh.createStage(cellAddress) : null;
  }

  public Stage injectStage(Stage stage) {
    final ActorMesh mesh = actorMesh();
    return mesh != null ? mesh.injectStage(stage) : stage;
  }

  @Override
  protected Stage openStage() {
    Stage stage;
    if (this.partDef != null && this.partDef.stageDef() != null) {
      stage = createStage(this.partDef.stageDef());
    } else {
      stage = createStage(cellAddress());
    }
    if (stage != null) {
      stage = injectStage(stage);
    }
    return stage;
  }

  public StoreBinding createStore(StoreDef storeDef) {
    final ActorMesh mesh = actorMesh();
    return mesh != null ? mesh.createStore(storeDef) : null;
  }

  public StoreBinding createStore(CellAddress cellAddress) {
    final ActorMesh mesh = actorMesh();
    return mesh != null ? mesh.createStore(cellAddress) : null;
  }

  public StoreBinding injectStore(StoreBinding store) {
    final ActorMesh mesh = actorMesh();
    return mesh != null ? mesh.injectStore(store) : store;
  }

  @Override
  protected StoreBinding openStore() {
    StoreBinding store = null;
    if (this.partDef != null && this.partDef.storeDef() != null) {
      store = createStore(this.partDef.storeDef());
    } else {
      store = createStore(cellAddress());
    }
    if (store != null) {
      store = injectStore(store);
    }
    return store;
  }

  @Override
  public void openMetaPart(PartBinding part, NodeBinding metaPart) {
    final ActorMesh mesh = actorMesh();
    if (mesh != null) {
      mesh.openMetaPart(part, metaPart);
    }
  }

  public HostDef getHostDef(HostAddress hostAddress) {
    final PartDef partDef = this.partDef;
    HostDef hostDef = partDef != null ? partDef.getHostDef(hostAddress.hostUri()) : null;
    if (hostDef == null) {
      final ActorMesh mesh = actorMesh();
      hostDef = mesh != null ? mesh.getHostDef(hostAddress) : null;
    }
    return hostDef;
  }

  @Override
  public HostBinding createHost(HostAddress hostAddress) {
    return this.partContext.createHost(hostAddress);
  }

  @Override
  public HostBinding injectHost(HostAddress hostAddress, HostBinding host) {
    final HostDef hostDef = getHostDef(hostAddress);
    return new ActorHost(this.partContext.injectHost(hostAddress, host), hostDef);
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    final ActorMesh mesh = actorMesh();
    if (mesh != null) {
      mesh.openMetaHost(host, metaHost);
    }
  }

  public NodeDef getNodeDef(NodeAddress nodeAddress) {
    final PartDef partDef = this.partDef;
    NodeDef nodeDef = partDef != null ? partDef.getNodeDef(nodeAddress.nodeUri()) : null;
    if (nodeDef == null) {
      final ActorMesh mesh = actorMesh();
      nodeDef = mesh != null ? mesh.getNodeDef(nodeAddress) : null;
    }
    return nodeDef;
  }

  @Override
  public NodeBinding createNode(NodeAddress nodeAddress) {
    NodeBinding node = this.partContext.createNode(nodeAddress);
    if (node == null && !meshUri().isDefined()) {
      final PartDef partDef = this.partDef;
      final NodeDef nodeDef = partDef != null ? partDef.getNodeDef(nodeAddress.nodeUri()) : null;
      if (nodeDef != null) {
        final Value props = nodeDef.props(nodeAddress.nodeUri());
        node = new AgentModel(props);
      }
    }
    return node;
  }

  @Override
  public NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node) {
    return this.partContext.injectNode(nodeAddress, node);
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    final ActorMesh mesh = actorMesh();
    if (mesh != null) {
      mesh.openMetaNode(node, metaNode);
    }
  }

  public LaneDef getLaneDef(LaneAddress laneAddress) {
    final PartDef partDef = this.partDef;
    LaneDef laneDef = partDef != null ? partDef.getLaneDef(laneAddress.laneUri()) : null;
    if (laneDef == null) {
      final ActorMesh mesh = actorMesh();
      laneDef = mesh != null ? mesh.getLaneDef(laneAddress) : null;
    }
    return laneDef;
  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    return this.partContext.createLane(laneAddress);
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    return this.partContext.injectLane(laneAddress, lane);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    final ActorMesh mesh = actorMesh();
    if (mesh != null) {
      mesh.openMetaLane(lane, metaLane);
    }
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    final ActorMesh mesh = actorMesh();
    if (mesh != null) {
      mesh.openMetaUplink(uplink, metaUplink);
    }
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    final ActorMesh mesh = actorMesh();
    if (mesh != null) {
      mesh.openMetaDownlink(downlink, metaDownlink);
    }
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return this.partContext.createLane(node, laneDef);
  }

  @Override
  public void openLanes(NodeBinding node) {
    this.partContext.openLanes(node);
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return this.partContext.createAgentFactory(node, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return this.partContext.createAgentFactory(node, agentClass);
  }

  @Override
  public void openAgents(NodeBinding node) {
    this.partContext.openAgents(node);
    if (!meshUri().isDefined()) {
      final PartDef partDef = this.partDef;
      final NodeDef nodeDef = partDef != null ? partDef.getNodeDef(node.nodeUri()) : null;
      if (nodeDef != null && node instanceof AgentModel) {
        final AgentModel agentModel = (AgentModel) node;
        for (AgentDef agentDef : nodeDef.agentDefs()) {
          final AgentFactory<?> agentFactory = createAgentFactory(node, agentDef);
          if (agentDef != null) {
            final Value id = agentDef.id();
            final Value props = agentModel.props().concat(agentDef.props());
            agentModel.addAgentView(agentModel.createAgent(agentFactory, id, props));
          }
        }
      }
    }
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return this.partContext.authenticate(credentials);
  }

  @Override
  public void didClose() {
    this.partBinding.didClose();
  }

  @Override
  public void didFail(Throwable error) {
    this.partBinding.didFail(error);
  }
}
