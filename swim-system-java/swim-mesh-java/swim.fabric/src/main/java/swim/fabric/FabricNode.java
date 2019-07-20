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
import swim.api.auth.Identity;
import swim.api.policy.Policy;
import swim.collections.HashTrieMap;
import swim.concurrent.Stage;
import swim.concurrent.StageDef;
import swim.runtime.CellBinding;
import swim.runtime.CellContext;
import swim.runtime.HostBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LogDef;
import swim.runtime.NodeBinding;
import swim.runtime.NodeContext;
import swim.runtime.NodeDef;
import swim.runtime.PolicyDef;
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;

public class FabricNode extends FabricTier implements NodeBinding, NodeContext {
  final NodeBinding nodeBinding;
  NodeContext nodeContext;
  NodeDef nodeDef;

  public FabricNode(NodeBinding nodeBinding, NodeDef nodeDef) {
    this.nodeBinding = nodeBinding;
    this.nodeDef = nodeDef;
  }

  public final NodeDef nodeDef() {
    return this.nodeDef;
  }

  public final FabricHost fabricHost() {
    return host().unwrapHost(FabricHost.class);
  }

  @Override
  public final HostBinding host() {
    return this.nodeContext.host();
  }

  @Override
  public final NodeBinding nodeWrapper() {
    return this.nodeBinding.nodeWrapper();
  }

  public final NodeBinding nodeBinding() {
    return this.nodeBinding;
  }

  @Override
  public final NodeContext nodeContext() {
    return this.nodeContext;
  }

  @Override
  public void setNodeContext(NodeContext nodeContext) {
    this.nodeContext = nodeContext;
    this.nodeBinding.setNodeContext(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapNode(Class<T> nodeClass) {
    if (nodeClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.nodeContext.unwrapNode(nodeClass);
    }
  }

  @Override
  public final CellBinding cellBinding() {
    return this.nodeBinding;
  }

  @Override
  public final CellContext cellContext() {
    return this.nodeContext;
  }

  @Override
  public Value partKey() {
    return this.nodeContext.partKey();
  }

  @Override
  public Uri hostUri() {
    return this.nodeContext.hostUri();
  }

  @Override
  public Uri nodeUri() {
    return this.nodeContext.nodeUri();
  }

  @Override
  public long createdTime() {
    return this.nodeBinding.createdTime();
  }

  @Override
  public Identity identity() {
    return this.nodeContext.identity();
  }

  @Override
  public HashTrieMap<Uri, LaneBinding> lanes() {
    return this.nodeBinding.lanes();
  }

  @Override
  public LaneBinding getLane(Uri laneUri) {
    return this.nodeBinding.getLane(laneUri);
  }

  public Log createLog(LogDef logDef) {
    final FabricHost host = fabricHost();
    return host != null ? host.createLog(logDef) : null;
  }

  public Log injectLog(Log log) {
    final FabricHost host = fabricHost();
    return host != null ? host.injectLog(log) : log;
  }

  @Override
  protected Log openLog() {
    Log log;
    if (this.nodeDef != null && this.nodeDef.logDef() != null) {
      log = createLog(this.nodeDef.logDef());
    } else {
      log = openNodeLog();
    }
    if (log != null) {
      log = injectLog(log);
    }
    return log;
  }

  public Policy createPolicy(PolicyDef policyDef) {
    final FabricHost host = fabricHost();
    return host != null ? host.createPolicy(policyDef) : null;
  }

  public Policy injectPolicy(Policy policy) {
    final FabricHost host = fabricHost();
    return host != null ? host.injectPolicy(policy) : policy;
  }

  @Override
  protected Policy openPolicy() {
    Policy policy;
    if (this.nodeDef != null && this.nodeDef.policyDef() != null) {
      policy = createPolicy(this.nodeDef.policyDef());
    } else {
      policy = openNodePolicy();
    }
    if (policy != null) {
      policy = injectPolicy(policy);
    }
    return policy;
  }

  public Stage createStage(StageDef stageDef) {
    final FabricHost host = fabricHost();
    return host != null ? host.createStage(stageDef) : null;
  }

  public Stage injectStage(Stage stage) {
    final FabricHost host = fabricHost();
    return host != null ? host.injectStage(stage) : stage;
  }

  @Override
  protected Stage openStage() {
    Stage stage;
    if (this.nodeDef != null && this.nodeDef.stageDef() != null) {
      stage = createStage(this.nodeDef.stageDef());
    } else {
      stage = openNodeStage();
    }
    if (stage != null) {
      stage = injectStage(stage);
    }
    return stage;
  }

  public StoreBinding createStore(StoreDef storeDef) {
    final FabricHost host = fabricHost();
    return host != null ? host.createStore(storeDef) : null;
  }

  public StoreBinding injectStore(StoreBinding store) {
    final FabricHost host = fabricHost();
    return host != null ? host.injectStore(store) : store;
  }

  @Override
  protected StoreBinding openStore() {
    StoreBinding store = null;
    if (this.nodeDef != null && this.nodeDef.storeDef() != null) {
      store = createStore(this.nodeDef.storeDef());
    } else {
      store = openNodeStore();
    }
    if (store == null) {
      final StoreBinding hostStore = host().hostContext().store();
      if (hostStore != null) {
        store = hostStore.storeContext().openStore(Record.create(1).slot("node", nodeUri().toString()));
      }
    }
    if (store != null) {
      store = injectStore(store);
    }
    return store;
  }

  protected Log openNodeLog() {
    final FabricHost host = fabricHost();
    return host != null ? host.openNodeLog(nodeUri()) : null;
  }

  protected Policy openNodePolicy() {
    final FabricHost host = fabricHost();
    return host != null ? host.openNodePolicy(nodeUri()) : null;
  }

  protected Stage openNodeStage() {
    final FabricHost host = fabricHost();
    return host != null ? host.openNodeStage(nodeUri()) : null;
  }

  protected StoreBinding openNodeStore() {
    final FabricHost host = fabricHost();
    return host != null ? host.openNodeStore(nodeUri()) : null;
  }

  @Override
  public LaneBinding openLane(Uri laneUri) {
    return this.nodeBinding.openLane(laneUri);
  }

  @Override
  public LaneBinding openLane(Uri laneUri, LaneBinding lane) {
    return this.nodeBinding.openLane(laneUri, lane);
  }

  public LaneDef getLaneDef(Uri laneUri) {
    final NodeDef nodeDef = this.nodeDef;
    LaneDef laneDef = nodeDef != null ? nodeDef.getLaneDef(laneUri) : null;
    if (laneDef == null) {
      final FabricHost host = fabricHost();
      laneDef = host != null ? host.getLaneDef(nodeUri(), laneUri) : null;
    }
    return laneDef;
  }

  @Override
  public LaneBinding createLane(LaneDef laneDef) {
    return this.nodeContext.createLane(laneDef);
  }

  @Override
  public LaneBinding createLane(Uri laneUri) {
    return this.nodeContext.createLane(laneUri);
  }

  @Override
  public LaneBinding injectLane(Uri laneUri, LaneBinding lane) {
    final LaneDef laneDef = getLaneDef(laneUri);
    return new FabricLane(this.nodeContext.injectLane(laneUri, lane), laneDef);
  }

  @Override
  public void openLanes(NodeBinding node) {
    this.nodeContext.openLanes(node);
    final NodeDef nodeDef = this.nodeDef;
    if (nodeDef != null) {
      for (LaneDef laneDef : nodeDef.laneDefs()) {
        final Uri laneUri = laneDef.laneUri();
        final LaneBinding lane = createLane(laneDef);
        if (laneDef != null) {
          node.openLane(laneUri, lane);
        }
      }
    }
  }

  public Log openLaneLog(Uri laneUri) {
    final FabricHost host = fabricHost();
    return host != null ? host.openLaneLog(nodeUri(), laneUri) : null;
  }

  public Policy openLanePolicy(Uri laneUri) {
    final FabricHost host = fabricHost();
    return host != null ? host.openLanePolicy(nodeUri(), laneUri) : null;
  }

  public Stage openLaneStage(Uri laneUri) {
    final FabricHost host = fabricHost();
    return host != null ? host.openLaneStage(nodeUri(), laneUri) : null;
  }

  public StoreBinding openLaneStore(Uri laneUri) {
    final FabricHost host = fabricHost();
    return host != null ? host.openLaneStore(nodeUri(), laneUri) : null;
  }

  @Override
  public AgentFactory<?> createAgentFactory(AgentDef agentDef) {
    return this.nodeContext.createAgentFactory(agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(Class<? extends A> agentClass) {
    return this.nodeContext.createAgentFactory(agentClass);
  }

  @Override
  public void openAgents(NodeBinding node) {
    this.nodeContext.openAgents(node);
  }

  @Override
  public void didClose() {
    this.nodeBinding.didClose();
  }

  @Override
  public void didFail(Throwable error) {
    this.nodeBinding.didFail(error);
  }
}
