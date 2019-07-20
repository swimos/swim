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
import swim.collections.HashTrieMap;
import swim.concurrent.Stage;
import swim.concurrent.StageDef;
import swim.runtime.CellBinding;
import swim.runtime.CellContext;
import swim.runtime.HostBinding;
import swim.runtime.HostDef;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LogDef;
import swim.runtime.MeshBinding;
import swim.runtime.NodeBinding;
import swim.runtime.NodeDef;
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

public class FabricPart extends FabricTier implements PartBinding, PartContext {
  final PartBinding partBinding;
  PartContext partContext;
  PartDef partDef;

  public FabricPart(PartBinding partBinding, PartDef partDef) {
    this.partBinding = partBinding;
    this.partDef = partDef;
  }

  public final PartDef partDef() {
    return this.partDef;
  }

  public final FabricMesh fabricMesh() {
    return mesh().unwrapMesh(FabricMesh.class);
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
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.createLog(logDef) : null;
  }

  public Log injectLog(Log log) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.injectLog(log) : log;
  }

  @Override
  protected Log openLog() {
    Log log;
    if (this.partDef != null && this.partDef.logDef() != null) {
      log = createLog(this.partDef.logDef());
    } else {
      log = openPartLog();
    }
    if (log != null) {
      log = injectLog(log);
    }
    return log;
  }

  public Policy createPolicy(PolicyDef policyDef) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.createPolicy(policyDef) : null;
  }

  public Policy injectPolicy(Policy policy) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.injectPolicy(policy) : policy;
  }

  @Override
  protected Policy openPolicy() {
    Policy policy;
    if (this.partDef != null && this.partDef.policyDef() != null) {
      policy = createPolicy(this.partDef.policyDef());
    } else {
      policy = openPartPolicy();
    }
    if (policy != null) {
      policy = injectPolicy(policy);
    }
    return policy;
  }

  public Stage createStage(StageDef stageDef) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.createStage(stageDef) : null;
  }

  public Stage injectStage(Stage stage) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.injectStage(stage) : stage;
  }

  @Override
  protected Stage openStage() {
    Stage stage;
    if (this.partDef != null && this.partDef.stageDef() != null) {
      stage = createStage(this.partDef.stageDef());
    } else {
      stage = openPartStage();
    }
    if (stage != null) {
      stage = injectStage(stage);
    }
    return stage;
  }

  public StoreBinding createStore(StoreDef storeDef) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.createStore(storeDef) : null;
  }

  public StoreBinding injectStore(StoreBinding store) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.injectStore(store) : store;
  }

  @Override
  protected StoreBinding openStore() {
    StoreBinding store = null;
    if (this.partDef != null && this.partDef.storeDef() != null) {
      store = createStore(this.partDef.storeDef());
    } else {
      store = openPartStore();
    }
    if (store != null) {
      store = injectStore(store);
    }
    return store;
  }

  protected Log openPartLog() {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openPartLog(partKey()) : null;
  }

  protected Policy openPartPolicy() {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openPartPolicy(partKey()) : null;
  }

  protected Stage openPartStage() {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openPartStage(partKey()) : null;
  }

  protected StoreBinding openPartStore() {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openPartStore(partKey()) : null;
  }

  public HostDef getHostDef(Uri hostUri) {
    final PartDef partDef = this.partDef;
    HostDef hostDef = partDef != null ? partDef.getHostDef(hostUri) : null;
    if (hostDef == null) {
      final FabricMesh mesh = fabricMesh();
      hostDef = mesh != null ? mesh.getHostDef(partKey(), hostUri) : null;
    }
    return hostDef;
  }

  @Override
  public HostBinding createHost(Uri hostUri) {
    return this.partContext.createHost(hostUri);
  }

  @Override
  public HostBinding injectHost(Uri hostUri, HostBinding host) {
    final HostDef hostDef = getHostDef(hostUri);
    return new FabricHost(this.partContext.injectHost(hostUri, host), hostDef);
  }

  public Log openHostLog(Uri hostUri) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openHostLog(partKey(), hostUri) : null;
  }

  public Policy openHostPolicy(Uri hostUri) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openHostPolicy(partKey(), hostUri) : null;
  }

  public Stage openHostStage(Uri hostUri) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openHostStage(partKey(), hostUri) : null;
  }

  public StoreBinding openHostStore(Uri hostUri) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openHostStore(partKey(), hostUri) : null;
  }

  public NodeDef getNodeDef(Uri hostUri, Uri nodeUri) {
    final PartDef partDef = this.partDef;
    NodeDef nodeDef = partDef != null ? partDef.getNodeDef(nodeUri) : null;
    if (nodeDef == null) {
      final FabricMesh mesh = fabricMesh();
      nodeDef = mesh != null ? mesh.getNodeDef(partKey(), hostUri, nodeUri) : null;
    }
    return nodeDef;
  }

  @Override
  public NodeBinding createNode(Uri hostUri, Uri nodeUri) {
    NodeBinding node = this.partContext.createNode(hostUri, nodeUri);
    if (node == null && !meshUri().isDefined()) {
      final PartDef partDef = this.partDef;
      final NodeDef nodeDef = partDef != null ? partDef.getNodeDef(nodeUri) : null;
      if (nodeDef != null) {
        final Value props = nodeDef.props(nodeUri);
        node = new AgentModel(props);
      }
    }
    return node;
  }

  @Override
  public NodeBinding injectNode(Uri hostUri, Uri nodeUri, NodeBinding node) {
    return this.partContext.injectNode(hostUri, nodeUri, node);
  }

  public Log openNodeLog(Uri hostUri, Uri nodeUri) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openNodeLog(partKey(), hostUri, nodeUri) : null;
  }

  public Policy openNodePolicy(Uri hostUri, Uri nodeUri) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openNodePolicy(partKey(), hostUri, nodeUri) : null;
  }

  public Stage openNodeStage(Uri hostUri, Uri nodeUri) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openNodeStage(partKey(), hostUri, nodeUri) : null;
  }

  public StoreBinding openNodeStore(Uri hostUri, Uri nodeUri) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openNodeStore(partKey(), hostUri, nodeUri) : null;
  }

  public LaneDef getLaneDef(Uri hostUri, Uri nodeUri, Uri laneUri) {
    final PartDef partDef = this.partDef;
    LaneDef laneDef = partDef != null ? partDef.getLaneDef(laneUri) : null;
    if (laneDef == null) {
      final FabricMesh mesh = fabricMesh();
      laneDef = mesh != null ? mesh.getLaneDef(partKey(), hostUri, nodeUri, laneUri) : null;
    }
    return laneDef;
  }

  @Override
  public LaneBinding createLane(Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    return this.partContext.createLane(hostUri, nodeUri, laneDef);
  }

  @Override
  public LaneBinding createLane(Uri hostUri, Uri nodeUri, Uri laneUri) {
    return this.partContext.createLane(hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneBinding injectLane(Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return this.partContext.injectLane(hostUri, nodeUri, laneUri, lane);
  }

  @Override
  public void openLanes(Uri hostUri, Uri nodeUri, NodeBinding node) {
    this.partContext.openLanes(hostUri, nodeUri, node);
  }

  public Log openLaneLog(Uri hostUri, Uri nodeUri, Uri laneUri) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openLaneLog(partKey(), hostUri, nodeUri, laneUri) : null;
  }

  public Policy openLanePolicy(Uri hostUri, Uri nodeUri, Uri laneUri) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openLanePolicy(partKey(), hostUri, nodeUri, laneUri) : null;
  }

  public Stage openLaneStage(Uri hostUri, Uri nodeUri, Uri laneUri) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openLaneStage(partKey(), hostUri, nodeUri, laneUri) : null;
  }

  public StoreBinding openLaneStore(Uri hostUri, Uri nodeUri, Uri laneUri) {
    final FabricMesh mesh = fabricMesh();
    return mesh != null ? mesh.openLaneStore(partKey(), hostUri, nodeUri, laneUri) : null;
  }

  @Override
  public AgentFactory<?> createAgentFactory(Uri hostUri, Uri nodeUri, AgentDef agentDef) {
    return this.partContext.createAgentFactory(hostUri, nodeUri, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(Uri hostUri, Uri nodeUri,
                                                              Class<? extends A> agentClass) {
    return this.partContext.createAgentFactory(hostUri, nodeUri, agentClass);
  }

  @Override
  public void openAgents(Uri hostUri, Uri nodeUri, NodeBinding node) {
    this.partContext.openAgents(hostUri, nodeUri, node);
    if (!meshUri().isDefined()) {
      final PartDef partDef = this.partDef;
      final NodeDef nodeDef = partDef != null ? partDef.getNodeDef(nodeUri) : null;
      if (nodeDef != null && node instanceof AgentModel) {
        final AgentModel agentModel = (AgentModel) node;
        for (AgentDef agentDef : nodeDef.agentDefs()) {
          final AgentFactory<?> agentFactory = createAgentFactory(hostUri, nodeUri, agentDef);
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
