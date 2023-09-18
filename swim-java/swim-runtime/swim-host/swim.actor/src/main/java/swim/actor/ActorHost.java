// Copyright 2015-2023 Nstream, inc.
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
import swim.concurrent.Stage;
import swim.concurrent.StageDef;
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Value;
import swim.system.CellAddress;
import swim.system.CellBinding;
import swim.system.CellContext;
import swim.system.HostAddress;
import swim.system.HostBinding;
import swim.system.HostContext;
import swim.system.HostDef;
import swim.system.LaneAddress;
import swim.system.LaneBinding;
import swim.system.LaneDef;
import swim.system.LinkBinding;
import swim.system.LogDef;
import swim.system.NodeAddress;
import swim.system.NodeBinding;
import swim.system.NodeDef;
import swim.system.PartBinding;
import swim.system.PolicyDef;
import swim.system.agent.AgentModel;
import swim.uri.Uri;
import swim.uri.UriMapper;
import swim.util.Log;

public class ActorHost extends ActorTier implements HostBinding, HostContext {

  final HostBinding hostBinding;
  HostContext hostContext;
  HostDef hostDef;

  public ActorHost(HostBinding hostBinding, HostDef hostDef) {
    this.hostBinding = hostBinding;
    this.hostContext = null;
    this.hostDef = hostDef;
  }

  public final HostDef hostDef() {
    return this.hostDef;
  }

  public final ActorPart actorPart() {
    return this.part().unwrapPart(ActorPart.class);
  }

  @Override
  public final PartBinding part() {
    return this.hostContext.part();
  }

  @Override
  public final HostBinding hostWrapper() {
    return this.hostBinding.hostWrapper();
  }

  public final HostBinding hostBinding() {
    return this.hostBinding;
  }

  @Override
  public final HostContext hostContext() {
    return this.hostContext;
  }

  @Override
  public void setHostContext(HostContext hostContext) {
    this.hostContext = hostContext;
    this.hostBinding.setHostContext(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapHost(Class<T> hostClass) {
    if (hostClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return this.hostContext.unwrapHost(hostClass);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomHost(Class<T> hostClass) {
    T host = this.hostContext.bottomHost(hostClass);
    if (host == null && hostClass.isAssignableFrom(this.getClass())) {
      host = (T) this;
    }
    return host;
  }

  @Override
  public final CellBinding cellBinding() {
    return this.hostBinding;
  }

  @Override
  public final CellContext cellContext() {
    return this.hostContext;
  }

  @Override
  public final HostAddress cellAddress() {
    return this.hostContext.cellAddress();
  }

  @Override
  public Value partKey() {
    return this.hostContext.partKey();
  }

  @Override
  public Uri hostUri() {
    return this.hostContext.hostUri();
  }

  @Override
  public boolean isConnected() {
    return this.hostBinding.isConnected();
  }

  @Override
  public boolean isRemote() {
    return this.hostBinding.isRemote();
  }

  @Override
  public boolean isSecure() {
    return this.hostBinding.isSecure();
  }

  @Override
  public boolean isPrimary() {
    return this.hostBinding.isPrimary();
  }

  @Override
  public void setPrimary(boolean isPrimary) {
    this.hostBinding.setPrimary(isPrimary);
  }

  @Override
  public boolean isReplica() {
    return this.hostBinding.isReplica();
  }

  @Override
  public void setReplica(boolean isReplica) {
    this.hostBinding.setReplica(isReplica);
  }

  @Override
  public boolean isMaster() {
    return this.hostBinding.isMaster();
  }

  @Override
  public boolean isSlave() {
    return this.hostBinding.isSlave();
  }

  @Override
  public void didBecomeMaster() {
    this.hostBinding.didBecomeMaster();
  }

  @Override
  public void didBecomeSlave() {
    this.hostBinding.didBecomeSlave();
  }

  @Override
  public UriMapper<NodeBinding> nodes() {
    return this.hostBinding.nodes();
  }

  @Override
  public NodeBinding getNode(Uri nodeUri) {
    return this.hostBinding.getNode(nodeUri);
  }

  @Override
  public NodeBinding openNode(Uri nodeUri) {
    return this.hostBinding.openNode(nodeUri);
  }

  @Override
  public NodeBinding openNode(Uri nodeUri, NodeBinding node) {
    return this.hostBinding.openNode(nodeUri, node);
  }

  public Log createLog(LogDef logDef) {
    final ActorPart part = this.actorPart();
    return part != null ? part.createLog(logDef) : null;
  }

  public Log createLog(CellAddress cellAddress) {
    final ActorPart part = this.actorPart();
    return part != null ? part.createLog(cellAddress) : null;
  }

  public Log injectLog(Log log) {
    final ActorPart part = this.actorPart();
    return part != null ? part.injectLog(log) : log;
  }

  @Override
  protected Log openLog() {
    Log log;
    if (this.hostDef != null && this.hostDef.logDef() != null) {
      log = this.createLog(this.hostDef.logDef());
    } else {
      log = this.createLog(this.cellAddress());
    }
    if (log != null) {
      log = this.injectLog(log);
    }
    return log;
  }

  public Policy createPolicy(PolicyDef policyDef) {
    final ActorPart part = this.actorPart();
    return part != null ? part.createPolicy(policyDef) : null;
  }

  public Policy createPolicy(CellAddress cellAddress) {
    final ActorPart part = this.actorPart();
    return part != null ? part.createPolicy(cellAddress) : null;
  }

  public Policy injectPolicy(Policy policy) {
    final ActorPart part = this.actorPart();
    return part != null ? part.injectPolicy(policy) : policy;
  }

  @Override
  protected Policy openPolicy() {
    Policy policy;
    if (this.hostDef != null && this.hostDef.policyDef() != null) {
      policy = this.createPolicy(this.hostDef.policyDef());
    } else {
      policy = this.createPolicy(this.cellAddress());
    }
    if (policy != null) {
      policy = this.injectPolicy(policy);
    }
    return policy;
  }

  public Stage createStage(StageDef stageDef) {
    final ActorPart part = this.actorPart();
    return part != null ? part.createStage(stageDef) : null;
  }

  public Stage createStage(CellAddress cellAddress) {
    final ActorPart part = this.actorPart();
    return part != null ? part.createStage(cellAddress) : null;
  }

  public Stage injectStage(Stage stage) {
    final ActorPart part = this.actorPart();
    return part != null ? part.injectStage(stage) : stage;
  }

  @Override
  protected Stage openStage() {
    Stage stage;
    if (this.hostDef != null && this.hostDef.stageDef() != null) {
      stage = this.createStage(this.hostDef.stageDef());
    } else {
      stage = this.createStage(this.cellAddress());
    }
    if (stage != null) {
      stage = this.injectStage(stage);
    }
    return stage;
  }

  public StoreBinding createStore(StoreDef storeDef) {
    final ActorPart part = this.actorPart();
    return part != null ? part.createStore(storeDef) : null;
  }

  public StoreBinding createStore(CellAddress cellAddress) {
    final ActorPart part = this.actorPart();
    return part != null ? part.createStore(cellAddress) : null;
  }

  public StoreBinding injectStore(StoreBinding store) {
    final ActorPart part = this.actorPart();
    return part != null ? part.injectStore(store) : store;
  }

  @Override
  protected StoreBinding openStore() {
    StoreBinding store = null;
    if (this.hostDef != null && this.hostDef.storeDef() != null) {
      store = this.createStore(this.hostDef.storeDef());
    } else {
      store = this.createStore(this.cellAddress());
    }
    if (store != null) {
      store = this.injectStore(store);
    }
    return store;
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    this.hostContext.openMetaHost(host, metaHost);
  }

  public NodeDef getNodeDef(NodeAddress nodeAddress) {
    final HostDef hostDef = this.hostDef;
    NodeDef nodeDef = hostDef != null ? hostDef.getNodeDef(nodeAddress.nodeUri()) : null;
    if (nodeDef == null) {
      final ActorPart part = this.actorPart();
      nodeDef = part != null ? part.getNodeDef(nodeAddress) : null;
    }
    return nodeDef;
  }

  @Override
  public NodeBinding createNode(NodeAddress nodeAddress) {
    NodeBinding node = this.hostContext.createNode(nodeAddress);
    if (node == null && !this.meshUri().isDefined()) {
      final HostDef hostDef = this.hostDef;
      final NodeDef nodeDef = hostDef != null ? hostDef.getNodeDef(nodeAddress.nodeUri()) : null;
      if (nodeDef != null) {
        final Value props = nodeDef.props(nodeAddress.nodeUri());
        node = new AgentModel(props);
      }
    }
    return node;
  }

  @Override
  public NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node) {
    final NodeDef nodeDef = this.getNodeDef(nodeAddress);
    return new ActorNode(this.hostContext.injectNode(nodeAddress, node), nodeDef);
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.hostContext.openMetaNode(node, metaNode);
  }

  public LaneDef getLaneDef(LaneAddress laneAddress) {
    final HostDef hostDef = this.hostDef;
    LaneDef laneDef = hostDef != null ? hostDef.getLaneDef(laneAddress.laneUri()) : null;
    if (laneDef == null) {
      final ActorPart part = this.actorPart();
      laneDef = part != null ? part.getLaneDef(laneAddress) : null;
    }
    return laneDef;
  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    return this.hostContext.createLane(laneAddress);
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    return this.hostContext.injectLane(laneAddress, lane);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.hostContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.hostContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.hostContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return this.hostContext.createLane(node, laneDef);
  }

  @Override
  public void openLanes(NodeBinding node) {
    this.hostContext.openLanes(node);
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return this.hostContext.createAgentFactory(node, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return this.hostContext.createAgentFactory(node, agentClass);
  }

  @Override
  public void openAgents(NodeBinding node) {
    this.hostContext.openAgents(node);
    if (!this.meshUri().isDefined()) {
      final HostDef hostDef = this.hostDef;
      final NodeDef nodeDef = hostDef != null ? hostDef.getNodeDef(node.nodeUri()) : null;
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
    return this.hostContext.authenticate(credentials);
  }

  @Override
  public void didConnect() {
    this.hostContext.didConnect();
  }

  @Override
  public void didDisconnect() {
    this.hostContext.didDisconnect();
  }

  @Override
  public void didClose() {
    this.hostBinding.didClose();
  }

  @Override
  public void didFail(Throwable error) {
    this.hostBinding.didFail(error);
  }

}
