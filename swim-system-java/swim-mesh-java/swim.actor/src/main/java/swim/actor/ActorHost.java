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
import swim.runtime.CellBinding;
import swim.runtime.CellContext;
import swim.runtime.HostBinding;
import swim.runtime.HostContext;
import swim.runtime.HostDef;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LogDef;
import swim.runtime.NodeBinding;
import swim.runtime.NodeDef;
import swim.runtime.PartBinding;
import swim.runtime.PolicyDef;
import swim.runtime.agent.AgentModel;
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;

public class ActorHost extends ActorTier implements HostBinding, HostContext {
  final HostBinding hostBinding;
  HostContext hostContext;
  HostDef hostDef;

  public ActorHost(HostBinding hostBinding, HostDef hostDef) {
    this.hostBinding = hostBinding;
    this.hostDef = hostDef;
  }

  public final HostDef hostDef() {
    return this.hostDef;
  }

  public final ActorPart actorPart() {
    return part().unwrapPart(ActorPart.class);
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
    if (hostClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.hostContext.unwrapHost(hostClass);
    }
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
  public HashTrieMap<Uri, NodeBinding> nodes() {
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
    final ActorPart part = actorPart();
    return part != null ? part.createLog(logDef) : null;
  }

  public Log injectLog(Log log) {
    final ActorPart part = actorPart();
    return part != null ? part.injectLog(log) : log;
  }

  @Override
  protected Log openLog() {
    Log log;
    if (this.hostDef != null && this.hostDef.logDef() != null) {
      log = createLog(this.hostDef.logDef());
    } else {
      log = openHostLog();
    }
    if (log != null) {
      log = injectLog(log);
    }
    return log;
  }

  public Policy createPolicy(PolicyDef policyDef) {
    final ActorPart part = actorPart();
    return part != null ? part.createPolicy(policyDef) : null;
  }

  public Policy injectPolicy(Policy policy) {
    final ActorPart part = actorPart();
    return part != null ? part.injectPolicy(policy) : policy;
  }

  @Override
  protected Policy openPolicy() {
    Policy policy;
    if (this.hostDef != null && this.hostDef.policyDef() != null) {
      policy = createPolicy(this.hostDef.policyDef());
    } else {
      policy = openHostPolicy();
    }
    if (policy != null) {
      policy = injectPolicy(policy);
    }
    return policy;
  }

  public Stage createStage(StageDef stageDef) {
    final ActorPart part = actorPart();
    return part != null ? part.createStage(stageDef) : null;
  }

  public Stage injectStage(Stage stage) {
    final ActorPart part = actorPart();
    return part != null ? part.injectStage(stage) : stage;
  }

  @Override
  protected Stage openStage() {
    Stage stage;
    if (this.hostDef != null && this.hostDef.stageDef() != null) {
      stage = createStage(this.hostDef.stageDef());
    } else {
      stage = openHostStage();
    }
    if (stage != null) {
      stage = injectStage(stage);
    }
    return stage;
  }

  public StoreBinding createStore(StoreDef storeDef) {
    final ActorPart part = actorPart();
    return part != null ? part.createStore(storeDef) : null;
  }

  public StoreBinding injectStore(StoreBinding store) {
    final ActorPart part = actorPart();
    return part != null ? part.injectStore(store) : store;
  }

  @Override
  protected StoreBinding openStore() {
    StoreBinding store = null;
    if (this.hostDef != null && this.hostDef.storeDef() != null) {
      store = createStore(this.hostDef.storeDef());
    } else {
      store = openHostStore();
    }
    if (store != null) {
      store = injectStore(store);
    }
    return store;
  }

  protected Log openHostLog() {
    final ActorPart part = actorPart();
    return part != null ? part.openHostLog(hostUri()) : null;
  }

  protected Policy openHostPolicy() {
    final ActorPart part = actorPart();
    return part != null ? part.openHostPolicy(hostUri()) : null;
  }

  protected Stage openHostStage() {
    final ActorPart part = actorPart();
    return part != null ? part.openHostStage(hostUri()) : null;
  }

  protected StoreBinding openHostStore() {
    final ActorPart part = actorPart();
    return part != null ? part.openHostStore(hostUri()) : null;
  }

  public NodeDef getNodeDef(Uri nodeUri) {
    final HostDef hostDef = this.hostDef;
    NodeDef nodeDef = hostDef != null ? hostDef.getNodeDef(nodeUri) : null;
    if (nodeDef == null) {
      final ActorPart part = actorPart();
      nodeDef = part != null ? part.getNodeDef(hostUri(), nodeUri) : null;
    }
    return nodeDef;
  }

  @Override
  public NodeBinding createNode(Uri nodeUri) {
    NodeBinding node = this.hostContext.createNode(nodeUri);
    if (node == null && !meshUri().isDefined()) {
      final HostDef hostDef = this.hostDef;
      final NodeDef nodeDef = hostDef != null ? hostDef.getNodeDef(nodeUri) : null;
      if (nodeDef != null) {
        final Value props = nodeDef.props(nodeUri);
        node = new AgentModel(props);
      }
    }
    return node;
  }

  @Override
  public NodeBinding injectNode(Uri nodeUri, NodeBinding node) {
    final NodeDef nodeDef = getNodeDef(nodeUri);
    return new ActorNode(this.hostContext.injectNode(nodeUri, node), nodeDef);
  }

  public Log openNodeLog(Uri nodeUri) {
    final ActorPart part = actorPart();
    return part != null ? part.openNodeLog(hostUri(), nodeUri) : null;
  }

  public Policy openNodePolicy(Uri nodeUri) {
    final ActorPart part = actorPart();
    return part != null ? part.openNodePolicy(hostUri(), nodeUri) : null;
  }

  public Stage openNodeStage(Uri nodeUri) {
    final ActorPart part = actorPart();
    return part != null ? part.openNodeStage(hostUri(), nodeUri) : null;
  }

  public StoreBinding openNodeStore(Uri nodeUri) {
    final ActorPart part = actorPart();
    return part != null ? part.openNodeStore(hostUri(), nodeUri) : null;
  }

  public LaneDef getLaneDef(Uri nodeUri, Uri laneUri) {
    final HostDef hostDef = this.hostDef;
    LaneDef laneDef = hostDef != null ? hostDef.getLaneDef(laneUri) : null;
    if (laneDef == null) {
      final ActorPart part = actorPart();
      laneDef = part != null ? part.getLaneDef(hostUri(), nodeUri, laneUri) : null;
    }
    return laneDef;
  }

  @Override
  public LaneBinding createLane(Uri nodeUri, LaneDef laneDef) {
    return this.hostContext.createLane(nodeUri, laneDef);
  }

  @Override
  public LaneBinding createLane(Uri nodeUri, Uri laneUri) {
    return this.hostContext.createLane(nodeUri, laneUri);
  }

  @Override
  public LaneBinding injectLane(Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return this.hostContext.injectLane(nodeUri, laneUri, lane);
  }

  @Override
  public void openLanes(Uri nodeUri, NodeBinding node) {
    this.hostContext.openLanes(nodeUri, node);
  }

  public Log openLaneLog(Uri nodeUri, Uri laneUri) {
    final ActorPart part = actorPart();
    return part != null ? part.openLaneLog(hostUri(), nodeUri, laneUri) : null;
  }

  public Policy openLanePolicy(Uri nodeUri, Uri laneUri) {
    final ActorPart part = actorPart();
    return part != null ? part.openLanePolicy(hostUri(), nodeUri, laneUri) : null;
  }

  public Stage openLaneStage(Uri nodeUri, Uri laneUri) {
    final ActorPart part = actorPart();
    return part != null ? part.openLaneStage(hostUri(), nodeUri, laneUri) : null;
  }

  public StoreBinding openLaneStore(Uri nodeUri, Uri laneUri) {
    final ActorPart part = actorPart();
    return part != null ? part.openLaneStore(hostUri(), nodeUri, laneUri) : null;
  }

  @Override
  public AgentFactory<?> createAgentFactory(Uri nodeUri, AgentDef agentDef) {
    return this.hostContext.createAgentFactory(nodeUri, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(Uri nodeUri, Class<? extends A> agentClass) {
    return this.hostContext.createAgentFactory(nodeUri, agentClass);
  }

  @Override
  public void openAgents(Uri nodeUri, NodeBinding node) {
    this.hostContext.openAgents(nodeUri, node);
    if (!meshUri().isDefined()) {
      final HostDef hostDef = this.hostDef;
      final NodeDef nodeDef = hostDef != null ? hostDef.getNodeDef(nodeUri) : null;
      if (nodeDef != null && node instanceof AgentModel) {
        final AgentModel agentModel = (AgentModel) node;
        for (AgentDef agentDef : nodeDef.agentDefs()) {
          final AgentFactory<?> agentFactory = createAgentFactory(nodeUri, agentDef);
          if (agentDef != null) {
            final Value id = agentDef.id();
            Value props = agentDef.props();
            if (!props.isDefined()) {
              props = agentModel.props();
            }
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
