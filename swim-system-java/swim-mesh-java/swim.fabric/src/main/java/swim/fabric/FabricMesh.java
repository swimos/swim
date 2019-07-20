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

package swim.fabric;

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
import swim.runtime.CellBinding;
import swim.runtime.CellContext;
import swim.runtime.EdgeBinding;
import swim.runtime.HostBinding;
import swim.runtime.HostDef;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LogDef;
import swim.runtime.MeshBinding;
import swim.runtime.MeshContext;
import swim.runtime.MeshDef;
import swim.runtime.NodeBinding;
import swim.runtime.NodeDef;
import swim.runtime.PartBinding;
import swim.runtime.PartDef;
import swim.runtime.PolicyDef;
import swim.runtime.agent.AgentModel;
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;

public class FabricMesh extends FabricTier implements MeshBinding, MeshContext {
  final MeshBinding meshBinding;
  MeshContext meshContext;
  MeshDef meshDef;

  public FabricMesh(MeshBinding meshBinding, MeshDef meshDef) {
    this.meshBinding = meshBinding;
    this.meshDef = meshDef;
  }

  public final MeshDef meshDef() {
    return this.meshDef;
  }

  public final Fabric fabricEdge() {
    return edge().unwrapEdge(Fabric.class);
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
    if (meshClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.meshContext.unwrapMesh(meshClass);
    }
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
    final Fabric edge = fabricEdge();
    return edge != null ? edge.createLog(logDef) : null;
  }

  public Log injectLog(Log log) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.injectLog(log) : log;
  }

  @Override
  protected Log openLog() {
    Log log;
    if (this.meshDef != null && this.meshDef.logDef() != null) {
      log = createLog(this.meshDef.logDef());
    } else {
      log = openMeshLog();
    }
    if (log != null) {
      log = injectLog(log);
    }
    return log;
  }

  public Policy createPolicy(PolicyDef policyDef) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.createPolicy(policyDef) : null;
  }

  public Policy injectPolicy(Policy policy) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.injectPolicy(policy) : policy;
  }

  @Override
  protected Policy openPolicy() {
    Policy policy;
    if (this.meshDef != null && this.meshDef.policyDef() != null) {
      policy = createPolicy(this.meshDef.policyDef());
    } else {
      policy = openMeshPolicy();
    }
    if (policy != null) {
      policy = injectPolicy(policy);
    }
    return policy;
  }

  public Stage createStage(StageDef stageDef) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.createStage(stageDef) : null;
  }

  public Stage injectStage(Stage stage) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.injectStage(stage) : stage;
  }

  @Override
  protected Stage openStage() {
    Stage stage;
    if (this.meshDef != null && this.meshDef.stageDef() != null) {
      stage = createStage(this.meshDef.stageDef());
    } else {
      stage = openMeshStage();
    }
    if (stage != null) {
      stage = injectStage(stage);
    }
    return stage;
  }

  public StoreBinding createStore(StoreDef storeDef) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.createStore(storeDef) : null;
  }

  public StoreBinding injectStore(StoreBinding store) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.injectStore(store) : store;
  }

  @Override
  protected StoreBinding openStore() {
    StoreBinding store = null;
    if (this.meshDef != null && this.meshDef.storeDef() != null) {
      store = createStore(this.meshDef.storeDef());
    } else {
      store = openMeshStore();
    }
    if (store != null) {
      store = injectStore(store);
    }
    return store;
  }

  protected Log openMeshLog() {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openMeshLog(meshUri()) : null;
  }

  protected Policy openMeshPolicy() {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openMeshPolicy(meshUri()) : null;
  }

  protected Stage openMeshStage() {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openMeshStage(meshUri()) : null;
  }

  protected StoreBinding openMeshStore() {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openMeshStore(meshUri()) : null;
  }

  public PartDef getPartDef(Value partKey) {
    final MeshDef meshDef = this.meshDef;
    PartDef partDef = meshDef != null ? meshDef.getPartDef(partKey) : null;
    if (partDef == null) {
      final Fabric edge = fabricEdge();
      partDef = edge != null ? edge.getPartDef(meshUri(), partKey) : null;
    }
    return partDef;
  }

  @Override
  public PartBinding createPart(Value partKey) {
    return this.meshContext.createPart(partKey);
  }

  @Override
  public PartBinding injectPart(Value partKey, PartBinding part) {
    final PartDef partDef = getPartDef(partKey);
    return new FabricPart(this.meshContext.injectPart(partKey, part), partDef);
  }

  public Log openPartLog(Value partKey) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openPartLog(meshUri(), partKey) : null;
  }

  public Policy openPartPolicy(Value partKey) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openPartPolicy(meshUri(), partKey) : null;
  }

  public Stage openPartStage(Value partKey) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openPartStage(meshUri(), partKey) : null;
  }

  public StoreBinding openPartStore(Value partKey) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openPartStore(meshUri(), partKey) : null;
  }

  public HostDef getHostDef(Value partKey, Uri hostUri) {
    final MeshDef meshDef = this.meshDef;
    HostDef hostDef = meshDef != null ? meshDef.getHostDef(hostUri) : null;
    if (hostDef == null) {
      final Fabric edge = fabricEdge();
      hostDef = edge != null ? edge.getHostDef(meshUri(), partKey, hostUri) : null;
    }
    return hostDef;
  }

  @Override
  public HostBinding createHost(Value partKey, Uri hostUri) {
    return this.meshContext.createHost(partKey, hostUri);
  }

  @Override
  public HostBinding injectHost(Value partKey, Uri hostUri, HostBinding host) {
    return this.meshContext.injectHost(partKey, hostUri, host);
  }

  public Log openHostLog(Value partKey, Uri hostUri) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openHostLog(meshUri(), partKey, hostUri) : null;
  }

  public Policy openHostPolicy(Value partKey, Uri hostUri) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openHostPolicy(meshUri(), partKey, hostUri) : null;
  }

  public Stage openHostStage(Value partKey, Uri hostUri) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openHostStage(meshUri(), partKey, hostUri) : null;
  }

  public StoreBinding openHostStore(Value partKey, Uri hostUri) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openHostStore(meshUri(), partKey, hostUri) : null;
  }

  public NodeDef getNodeDef(Value partKey, Uri hostUri, Uri nodeUri) {
    final MeshDef meshDef = this.meshDef;
    NodeDef nodeDef = meshDef != null ? meshDef.getNodeDef(nodeUri) : null;
    if (nodeDef == null) {
      final Fabric edge = fabricEdge();
      nodeDef = edge != null ? edge.getNodeDef(meshUri(), partKey, hostUri, nodeUri) : null;
    }
    return nodeDef;
  }

  @Override
  public NodeBinding createNode(Value partKey, Uri hostUri, Uri nodeUri) {
    NodeBinding node = this.meshContext.createNode(partKey, hostUri, nodeUri);
    if (node == null && !meshUri().isDefined()) {
      final MeshDef meshDef = this.meshDef;
      final NodeDef nodeDef = meshDef != null ? meshDef.getNodeDef(nodeUri) : null;
      if (nodeDef != null) {
        final Value props = nodeDef.props(nodeUri);
        node = new AgentModel(props);
      }
    }
    return node;
  }

  @Override
  public NodeBinding injectNode(Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    return this.meshContext.injectNode(partKey, hostUri, nodeUri, node);
  }

  public Log openNodeLog(Value partKey, Uri hostUri, Uri nodeUri) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openNodeLog(meshUri(), partKey, hostUri, nodeUri) : null;
  }

  public Policy openNodePolicy(Value partKey, Uri hostUri, Uri nodeUri) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openNodePolicy(meshUri(), partKey, hostUri, nodeUri) : null;
  }

  public Stage openNodeStage(Value partKey, Uri hostUri, Uri nodeUri) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openNodeStage(meshUri(), partKey, hostUri, nodeUri) : null;
  }

  public StoreBinding openNodeStore(Value partKey, Uri hostUri, Uri nodeUri) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openNodeStore(meshUri(), partKey, hostUri, nodeUri) : null;
  }

  public LaneDef getLaneDef(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    final MeshDef meshDef = this.meshDef;
    LaneDef laneDef = meshDef != null ? meshDef.getLaneDef(laneUri) : null;
    if (laneDef == null) {
      final Fabric edge = fabricEdge();
      laneDef = edge != null ? edge.getLaneDef(meshUri(), partKey, hostUri, nodeUri, laneUri) : null;
    }
    return laneDef;
  }

  @Override
  public LaneBinding createLane(Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    return this.meshContext.createLane(partKey, hostUri, nodeUri, laneDef);
  }

  @Override
  public LaneBinding createLane(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    return this.meshContext.createLane(partKey, hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneBinding injectLane(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return this.meshContext.injectLane(partKey, hostUri, nodeUri, laneUri, lane);
  }

  @Override
  public void openLanes(Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    this.meshContext.openLanes(partKey, hostUri, nodeUri, node);
  }

  public Log openLaneLog(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openLaneLog(meshUri(), partKey, hostUri, nodeUri, laneUri) : null;
  }

  public Policy openLanePolicy(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openLanePolicy(meshUri(), partKey, hostUri, nodeUri, laneUri) : null;
  }

  public Stage openLaneStage(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openLaneStage(meshUri(), partKey, hostUri, nodeUri, laneUri) : null;
  }

  public StoreBinding openLaneStore(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    final Fabric edge = fabricEdge();
    return edge != null ? edge.openLaneStore(meshUri(), partKey, hostUri, nodeUri, laneUri) : null;
  }

  @Override
  public AgentFactory<?> createAgentFactory(Value partKey, Uri hostUri, Uri nodeUri, AgentDef agentDef) {
    return this.meshContext.createAgentFactory(partKey, hostUri, nodeUri, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(Value partKey, Uri hostUri, Uri nodeUri,
                                                              Class<? extends A> agentClass) {
    return this.meshContext.createAgentFactory(partKey, hostUri, nodeUri, agentClass);
  }

  @Override
  public void openAgents(Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    this.meshContext.openAgents(partKey, hostUri, nodeUri, node);
    if (!meshUri().isDefined()) {
      final MeshDef meshDef = this.meshDef;
      final NodeDef nodeDef = meshDef != null ? meshDef.getNodeDef(nodeUri) : null;
      if (nodeDef != null && node instanceof AgentModel) {
        final AgentModel agentModel = (AgentModel) node;
        for (AgentDef agentDef : nodeDef.agentDefs()) {
          final AgentFactory<?> agentFactory = createAgentFactory(partKey, hostUri, nodeUri, agentDef);
          if (agentDef != null) {
            Value props = agentDef.props();
            if (!props.isDefined()) {
              props = agentModel.props();
            }
            agentModel.addAgentView(agentModel.createAgent(agentFactory, props));
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
