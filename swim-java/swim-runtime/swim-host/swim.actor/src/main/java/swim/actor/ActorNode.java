// Copyright 2015-2023 Swim.inc
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
import swim.api.auth.Identity;
import swim.api.policy.Policy;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.concurrent.Stage;
import swim.concurrent.StageDef;
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Record;
import swim.structure.Value;
import swim.system.CellAddress;
import swim.system.CellBinding;
import swim.system.CellContext;
import swim.system.HostBinding;
import swim.system.LaneAddress;
import swim.system.LaneBinding;
import swim.system.LaneDef;
import swim.system.LinkBinding;
import swim.system.LogDef;
import swim.system.NodeAddress;
import swim.system.NodeBinding;
import swim.system.NodeContext;
import swim.system.NodeDef;
import swim.system.PolicyDef;
import swim.uri.Uri;
import swim.util.Log;

public class ActorNode extends ActorTier implements NodeBinding, NodeContext {

  final NodeBinding nodeBinding;
  NodeContext nodeContext;
  NodeDef nodeDef;

  public ActorNode(NodeBinding nodeBinding, NodeDef nodeDef) {
    this.nodeBinding = nodeBinding;
    this.nodeContext = null;
    this.nodeDef = nodeDef;
  }

  public final NodeDef nodeDef() {
    return this.nodeDef;
  }

  public final ActorHost actorHost() {
    return this.host().unwrapHost(ActorHost.class);
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
    if (nodeClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return this.nodeContext.unwrapNode(nodeClass);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomNode(Class<T> nodeClass) {
    T node = this.nodeContext.bottomNode(nodeClass);
    if (node == null && nodeClass.isAssignableFrom(this.getClass())) {
      node = (T) this;
    }
    return node;
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
  public final NodeAddress cellAddress() {
    return this.nodeContext.cellAddress();
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
    final ActorHost host = this.actorHost();
    return host != null ? host.createLog(logDef) : null;
  }

  public Log createLog(CellAddress cellAddress) {
    final ActorHost host = this.actorHost();
    return host != null ? host.createLog(cellAddress) : null;
  }

  public Log injectLog(Log log) {
    final ActorHost host = this.actorHost();
    return host != null ? host.injectLog(log) : log;
  }

  @Override
  protected Log openLog() {
    Log log;
    if (this.nodeDef != null && this.nodeDef.logDef() != null) {
      log = this.createLog(this.nodeDef.logDef());
    } else {
      log = this.createLog(this.cellAddress());
    }
    if (log != null) {
      log = this.injectLog(log);
    }
    return log;
  }

  public Policy createPolicy(PolicyDef policyDef) {
    final ActorHost host = this.actorHost();
    return host != null ? host.createPolicy(policyDef) : null;
  }

  public Policy createPolicy(CellAddress cellAddress) {
    final ActorHost host = this.actorHost();
    return host != null ? host.createPolicy(cellAddress) : null;
  }

  public Policy injectPolicy(Policy policy) {
    final ActorHost host = this.actorHost();
    return host != null ? host.injectPolicy(policy) : policy;
  }

  @Override
  protected Policy openPolicy() {
    Policy policy;
    if (this.nodeDef != null && this.nodeDef.policyDef() != null) {
      policy = this.createPolicy(this.nodeDef.policyDef());
    } else {
      policy = this.createPolicy(this.cellAddress());
    }
    if (policy != null) {
      policy = this.injectPolicy(policy);
    }
    return policy;
  }

  public Stage createStage(StageDef stageDef) {
    final ActorHost host = this.actorHost();
    return host != null ? host.createStage(stageDef) : null;
  }

  public Stage createStage(CellAddress cellAddress) {
    final ActorHost host = this.actorHost();
    return host != null ? host.createStage(cellAddress) : null;
  }

  public Stage injectStage(Stage stage) {
    final ActorHost host = this.actorHost();
    return host != null ? host.injectStage(stage) : stage;
  }

  @Override
  protected Stage openStage() {
    Stage stage;
    if (this.nodeDef != null && this.nodeDef.stageDef() != null) {
      stage = this.createStage(this.nodeDef.stageDef());
    } else {
      stage = this.createStage(this.cellAddress());
    }
    if (stage != null) {
      stage = this.injectStage(stage);
    }
    return stage;
  }

  public StoreBinding createStore(StoreDef storeDef) {
    final ActorHost host = this.actorHost();
    return host != null ? host.createStore(storeDef) : null;
  }

  public StoreBinding createStore(CellAddress cellAddress) {
    final ActorHost host = this.actorHost();
    return host != null ? host.createStore(cellAddress) : null;
  }

  public StoreBinding injectStore(StoreBinding store) {
    final ActorHost host = this.actorHost();
    return host != null ? host.injectStore(store) : store;
  }

  @Override
  protected StoreBinding openStore() {
    StoreBinding store = null;
    if (this.nodeDef != null && this.nodeDef.storeDef() != null) {
      store = this.createStore(this.nodeDef.storeDef());
    } else {
      store = this.createStore(this.cellAddress());
    }
    if (store == null) {
      final StoreBinding hostStore = this.host().hostContext().store();
      if (hostStore != null) {
        store = hostStore.storeContext().openStore(Record.create(1).slot("node", this.nodeUri().toString()));
      }
    }
    if (store != null) {
      store = this.injectStore(store);
    }
    return store;
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.nodeContext.openMetaNode(node, metaNode);
  }

  public LaneDef getLaneDef(LaneAddress laneAddress) {
    final NodeDef nodeDef = this.nodeDef;
    LaneDef laneDef = nodeDef != null ? nodeDef.getLaneDef(laneAddress.laneUri()) : null;
    if (laneDef == null) {
      final ActorHost host = this.actorHost();
      laneDef = host != null ? host.getLaneDef(laneAddress) : null;
    }
    return laneDef;
  }

  @Override
  public LaneBinding openLane(Uri laneUri) {
    return this.nodeBinding.openLane(laneUri);
  }

  @Override
  public LaneBinding openLane(Uri laneUri, LaneBinding lane) {
    return this.nodeBinding.openLane(laneUri, lane);
  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    return this.nodeContext.createLane(laneAddress);
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    final LaneDef laneDef = this.getLaneDef(laneAddress);
    return new ActorLane(this.nodeContext.injectLane(laneAddress, lane), laneDef);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.nodeContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.nodeContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.nodeContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return this.nodeContext.createLane(node, laneDef);
  }

  @Override
  public void openLanes(NodeBinding node) {
    this.nodeContext.openLanes(node);
    final NodeDef nodeDef = this.nodeDef;
    if (nodeDef != null) {
      for (LaneDef laneDef : nodeDef.laneDefs()) {
        final Uri laneUri = laneDef.laneUri();
        final LaneBinding lane = this.createLane(node, laneDef);
        if (laneDef != null) {
          node.openLane(laneUri, lane);
        }
      }
    }
  }

  @Override
  public FingerTrieSeq<Value> agentIds() {
    return this.nodeBinding.agentIds();
  }

  @Override
  public FingerTrieSeq<Agent> agents() {
    return this.nodeBinding.agents();
  }

  @Override
  public void openAgents(NodeBinding node) {
    this.nodeContext.openAgents(node);
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return this.nodeContext.createAgentFactory(node, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return this.nodeContext.createAgentFactory(node, agentClass);
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
