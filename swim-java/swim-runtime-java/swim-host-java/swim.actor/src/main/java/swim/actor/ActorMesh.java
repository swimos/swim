// Copyright 2015-2021 Swim Inc.
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
import swim.collections.FingerTrieSeq;
import swim.concurrent.Stage;
import swim.concurrent.StageDef;
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Value;
import swim.system.CellAddress;
import swim.system.CellBinding;
import swim.system.CellContext;
import swim.system.EdgeBinding;
import swim.system.HostAddress;
import swim.system.HostBinding;
import swim.system.HostDef;
import swim.system.LaneAddress;
import swim.system.LaneBinding;
import swim.system.LaneDef;
import swim.system.LinkBinding;
import swim.system.LogDef;
import swim.system.MeshAddress;
import swim.system.MeshBinding;
import swim.system.MeshContext;
import swim.system.MeshDef;
import swim.system.NodeAddress;
import swim.system.NodeBinding;
import swim.system.NodeDef;
import swim.system.PartAddress;
import swim.system.PartBinding;
import swim.system.PartDef;
import swim.system.PolicyDef;
import swim.system.agent.AgentModel;
import swim.uri.Uri;
import swim.util.Log;

public class ActorMesh extends ActorTier implements MeshBinding, MeshContext {

  final MeshBinding meshBinding;
  MeshContext meshContext;
  MeshDef meshDef;

  public ActorMesh(MeshBinding meshBinding, MeshDef meshDef) {
    this.meshBinding = meshBinding;
    this.meshContext = null;
    this.meshDef = meshDef;
  }

  public final MeshDef meshDef() {
    return this.meshDef;
  }

  public final ActorSpace actorEdge() {
    return this.edge().unwrapEdge(ActorSpace.class);
  }

  @Override
  public final EdgeBinding edge() {
    return this.meshContext.edge();
  }

  @Override
  public final MeshBinding meshWrapper() {
    return this.meshBinding.meshWrapper();
  }

  public final MeshBinding meshBinding() {
    return this.meshBinding;
  }

  @Override
  public final MeshContext meshContext() {
    return this.meshContext;
  }

  @Override
  public void setMeshContext(MeshContext meshContext) {
    this.meshContext = meshContext;
    this.meshBinding.setMeshContext(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapMesh(Class<T> meshClass) {
    if (meshClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return this.meshContext.unwrapMesh(meshClass);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomMesh(Class<T> meshClass) {
    T mesh = this.meshContext.bottomMesh(meshClass);
    if (mesh == null && meshClass.isAssignableFrom(this.getClass())) {
      mesh = (T) this;
    }
    return mesh;
  }

  @Override
  public final CellBinding cellBinding() {
    return this.meshBinding;
  }

  @Override
  public final CellContext cellContext() {
    return this.meshContext;
  }

  @Override
  public final MeshAddress cellAddress() {
    return this.meshContext.cellAddress();
  }

  @Override
  public PartBinding gateway() {
    return this.meshBinding.gateway();
  }

  @Override
  public void setGateway(PartBinding gateway) {
    this.meshBinding.setGateway(gateway);
  }

  @Override
  public PartBinding ourself() {
    return this.meshBinding.ourself();
  }

  @Override
  public void setOurself(PartBinding ourself) {
    this.meshBinding.setOurself(ourself);
  }

  @Override
  public FingerTrieSeq<PartBinding> parts() {
    return this.meshBinding.parts();
  }

  @Override
  public PartBinding getPart(Uri nodeUri) {
    return this.meshBinding.getPart(nodeUri);
  }

  @Override
  public PartBinding getPart(Value partKey) {
    return this.meshBinding.getPart(partKey);
  }

  @Override
  public PartBinding openPart(Uri nodeUri) {
    return this.meshBinding.openPart(nodeUri);
  }

  @Override
  public PartBinding openGateway() {
    return this.meshBinding.openGateway();
  }

  @Override
  public PartBinding addPart(Value partKey, PartBinding part) {
    return this.meshBinding.addPart(partKey, part);
  }

  public Log createLog(LogDef logDef) {
    final ActorSpace edge = this.actorEdge();
    return edge != null ? edge.createLog(logDef) : null;
  }

  public Log createLog(CellAddress cellAddress) {
    final ActorSpace edge = this.actorEdge();
    return edge != null ? edge.createLog(cellAddress) : null;
  }

  public Log injectLog(Log log) {
    final ActorSpace edge = this.actorEdge();
    return edge != null ? edge.injectLog(log) : log;
  }

  @Override
  protected Log openLog() {
    Log log;
    if (this.meshDef != null && this.meshDef.logDef() != null) {
      log = this.createLog(this.meshDef.logDef());
    } else {
      log = this.createLog(this.cellAddress());
    }
    if (log != null) {
      log = this.injectLog(log);
    }
    return log;
  }

  public Policy createPolicy(PolicyDef policyDef) {
    final ActorSpace edge = this.actorEdge();
    return edge != null ? edge.createPolicy(policyDef) : null;
  }

  public Policy createPolicy(CellAddress cellAddress) {
    final ActorSpace edge = this.actorEdge();
    return edge != null ? edge.createPolicy(cellAddress) : null;
  }

  public Policy injectPolicy(Policy policy) {
    final ActorSpace edge = this.actorEdge();
    return edge != null ? edge.injectPolicy(policy) : policy;
  }

  @Override
  protected Policy openPolicy() {
    Policy policy;
    if (this.meshDef != null && this.meshDef.policyDef() != null) {
      policy = this.createPolicy(this.meshDef.policyDef());
    } else {
      policy = this.createPolicy(this.cellAddress());
    }
    if (policy != null) {
      policy = this.injectPolicy(policy);
    }
    return policy;
  }

  public Stage createStage(StageDef stageDef) {
    final ActorSpace edge = this.actorEdge();
    return edge != null ? edge.createStage(stageDef) : null;
  }

  public Stage createStage(CellAddress cellAddress) {
    final ActorSpace edge = this.actorEdge();
    return edge != null ? edge.createStage(cellAddress) : null;
  }

  public Stage injectStage(Stage stage) {
    final ActorSpace edge = this.actorEdge();
    return edge != null ? edge.injectStage(stage) : stage;
  }

  @Override
  protected Stage openStage() {
    Stage stage;
    if (this.meshDef != null && this.meshDef.stageDef() != null) {
      stage = this.createStage(this.meshDef.stageDef());
    } else {
      stage = this.createStage(this.cellAddress());
    }
    if (stage != null) {
      stage = this.injectStage(stage);
    }
    return stage;
  }

  public StoreBinding createStore(StoreDef storeDef) {
    final ActorSpace edge = this.actorEdge();
    return edge != null ? edge.createStore(storeDef) : null;
  }

  public StoreBinding createStore(CellAddress cellAddress) {
    final ActorSpace edge = this.actorEdge();
    return edge != null ? edge.createStore(cellAddress) : null;
  }

  public StoreBinding injectStore(StoreBinding store) {
    final ActorSpace edge = this.actorEdge();
    return edge != null ? edge.injectStore(store) : store;
  }

  @Override
  protected StoreBinding openStore() {
    StoreBinding store = null;
    if (this.meshDef != null && this.meshDef.storeDef() != null) {
      store = this.createStore(this.meshDef.storeDef());
    } else {
      store = this.createStore(this.cellAddress());
    }
    if (store != null) {
      store = this.injectStore(store);
    }
    return store;
  }

  @Override
  public void openMetaMesh(MeshBinding mesh, NodeBinding metaMesh) {
    this.meshContext.openMetaMesh(mesh, metaMesh);
  }

  public PartDef getPartDef(PartAddress partAddress) {
    final MeshDef meshDef = this.meshDef;
    PartDef partDef = meshDef != null ? meshDef.getPartDef(partAddress.partKey()) : null;
    if (partDef == null) {
      final ActorSpace edge = this.actorEdge();
      partDef = edge != null ? edge.getPartDef(partAddress) : null;
    }
    return partDef;
  }

  @Override
  public PartBinding createPart(PartAddress partAddress) {
    return this.meshContext.createPart(partAddress);
  }

  @Override
  public PartBinding injectPart(PartAddress partAddress, PartBinding part) {
    final PartDef partDef = this.getPartDef(partAddress);
    return new ActorPart(this.meshContext.injectPart(partAddress, part), partDef);
  }

  @Override
  public void openMetaPart(PartBinding part, NodeBinding metaPart) {
    this.meshContext.openMetaPart(part, metaPart);
  }

  public HostDef getHostDef(HostAddress hostAddress) {
    final MeshDef meshDef = this.meshDef;
    HostDef hostDef = meshDef != null ? meshDef.getHostDef(hostAddress.hostUri()) : null;
    if (hostDef == null) {
      final ActorSpace edge = this.actorEdge();
      hostDef = edge != null ? edge.getHostDef(hostAddress) : null;
    }
    return hostDef;
  }

  @Override
  public HostBinding createHost(HostAddress hostAddress) {
    return this.meshContext.createHost(hostAddress);
  }

  @Override
  public HostBinding injectHost(HostAddress hostAddress, HostBinding host) {
    return this.meshContext.injectHost(hostAddress, host);
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    this.meshContext.openMetaHost(host, metaHost);
  }

  public NodeDef getNodeDef(NodeAddress nodeAddress) {
    final MeshDef meshDef = this.meshDef;
    NodeDef nodeDef = meshDef != null ? meshDef.getNodeDef(nodeAddress.nodeUri()) : null;
    if (nodeDef == null) {
      final ActorSpace edge = this.actorEdge();
      nodeDef = edge != null ? edge.getNodeDef(nodeAddress) : null;
    }
    return nodeDef;
  }

  @Override
  public NodeBinding createNode(NodeAddress nodeAddress) {
    NodeBinding node = this.meshContext.createNode(nodeAddress);
    if (node == null && !this.meshUri().isDefined()) {
      final MeshDef meshDef = this.meshDef;
      final NodeDef nodeDef = meshDef != null ? meshDef.getNodeDef(nodeAddress.nodeUri()) : null;
      if (nodeDef != null) {
        final Value props = nodeDef.props(nodeAddress.nodeUri());
        node = new AgentModel(props);
      }
    }
    return node;
  }

  @Override
  public NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node) {
    return this.meshContext.injectNode(nodeAddress, node);
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.meshContext.openMetaNode(node, metaNode);
  }

  public LaneDef getLaneDef(LaneAddress laneAddress) {
    final MeshDef meshDef = this.meshDef;
    LaneDef laneDef = meshDef != null ? meshDef.getLaneDef(laneAddress.laneUri()) : null;
    if (laneDef == null) {
      final ActorSpace edge = this.actorEdge();
      laneDef = edge != null ? edge.getLaneDef(laneAddress) : null;
    }
    return laneDef;
  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    return this.meshContext.createLane(laneAddress);
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    return this.meshContext.injectLane(laneAddress, lane);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.meshContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.meshContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.meshContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return this.meshContext.createLane(node, laneDef);
  }

  @Override
  public void openLanes(NodeBinding node) {
    this.meshContext.openLanes(node);
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return this.meshContext.createAgentFactory(node, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return this.meshContext.createAgentFactory(node, agentClass);
  }

  @Override
  public void openAgents(NodeBinding node) {
    this.meshContext.openAgents(node);
    if (!this.meshUri().isDefined()) {
      final MeshDef meshDef = this.meshDef;
      final NodeDef nodeDef = meshDef != null ? meshDef.getNodeDef(node.nodeUri()) : null;
      if (nodeDef != null && node instanceof AgentModel) {
        final AgentModel agentModel = (AgentModel) node;
        for (AgentDef agentDef : nodeDef.agentDefs()) {
          final AgentFactory<?> agentFactory = this.createAgentFactory(node, agentDef);
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
    return this.meshContext.authenticate(credentials);
  }

  @Override
  public void didClose() {
    this.meshBinding.didClose();
  }

  @Override
  public void didFail(Throwable error) {
    this.meshBinding.didFail(error);
  }

}
