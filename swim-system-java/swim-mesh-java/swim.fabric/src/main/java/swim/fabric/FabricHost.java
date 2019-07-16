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
import swim.api.agent.AgentFactory;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.collections.HashTrieMap;
import swim.concurrent.Stage;
import swim.kernel.HostDef;
import swim.kernel.LaneDef;
import swim.kernel.LogDef;
import swim.kernel.NodeDef;
import swim.kernel.PolicyDef;
import swim.kernel.StageDef;
import swim.kernel.StoreDef;
import swim.runtime.CellBinding;
import swim.runtime.CellContext;
import swim.runtime.HostBinding;
import swim.runtime.HostContext;
import swim.runtime.LaneBinding;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;

public class FabricHost extends FabricTier implements HostBinding, HostContext {
  final HostBinding hostBinding;
  HostContext hostContext;
  HostDef hostDef;

  public FabricHost(HostBinding hostBinding, HostDef hostDef) {
    this.hostBinding = hostBinding;
    this.hostDef = hostDef;
  }

  public final HostDef hostDef() {
    return this.hostDef;
  }

  public final FabricPart fabricPart() {
    return part().unwrapPart(FabricPart.class);
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
    final FabricPart part = fabricPart();
    return part != null ? part.createLog(logDef) : null;
  }

  public Log injectLog(Log log) {
    final FabricPart part = fabricPart();
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
    final FabricPart part = fabricPart();
    return part != null ? part.createPolicy(policyDef) : null;
  }

  public Policy injectPolicy(Policy policy) {
    final FabricPart part = fabricPart();
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
    final FabricPart part = fabricPart();
    return part != null ? part.createStage(stageDef) : null;
  }

  public Stage injectStage(Stage stage) {
    final FabricPart part = fabricPart();
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
    final FabricPart part = fabricPart();
    return part != null ? part.createStore(storeDef) : null;
  }

  public StoreBinding injectStore(StoreBinding store) {
    final FabricPart part = fabricPart();
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
    final FabricPart part = fabricPart();
    return part != null ? part.openHostLog(hostUri()) : null;
  }

  protected Policy openHostPolicy() {
    final FabricPart part = fabricPart();
    return part != null ? part.openHostPolicy(hostUri()) : null;
  }

  protected Stage openHostStage() {
    final FabricPart part = fabricPart();
    return part != null ? part.openHostStage(hostUri()) : null;
  }

  protected StoreBinding openHostStore() {
    final FabricPart part = fabricPart();
    return part != null ? part.openHostStore(hostUri()) : null;
  }

  public NodeDef getNodeDef(Uri nodeUri) {
    final HostDef hostDef = this.hostDef;
    NodeDef nodeDef = hostDef != null ? hostDef.getNodeDef(nodeUri) : null;
    if (nodeDef == null) {
      final FabricPart part = fabricPart();
      nodeDef = part != null ? part.getNodeDef(hostUri(), nodeUri) : null;
    }
    return nodeDef;
  }

  @Override
  public NodeBinding createNode(Uri nodeUri) {
    return this.hostContext.createNode(nodeUri);
  }

  @Override
  public NodeBinding injectNode(Uri nodeUri, NodeBinding node) {
    final NodeDef nodeDef = getNodeDef(nodeUri);
    return new FabricNode(this.hostContext.injectNode(nodeUri, node), nodeDef);
  }

  public Log openNodeLog(Uri nodeUri) {
    final FabricPart part = fabricPart();
    return part != null ? part.openNodeLog(hostUri(), nodeUri) : null;
  }

  public Policy openNodePolicy(Uri nodeUri) {
    final FabricPart part = fabricPart();
    return part != null ? part.openNodePolicy(hostUri(), nodeUri) : null;
  }

  public Stage openNodeStage(Uri nodeUri) {
    final FabricPart part = fabricPart();
    return part != null ? part.openNodeStage(hostUri(), nodeUri) : null;
  }

  public StoreBinding openNodeStore(Uri nodeUri) {
    final FabricPart part = fabricPart();
    return part != null ? part.openNodeStore(hostUri(), nodeUri) : null;
  }

  public LaneDef getLaneDef(Uri nodeUri, Uri laneUri) {
    final HostDef hostDef = this.hostDef;
    LaneDef laneDef = hostDef != null ? hostDef.getLaneDef(laneUri) : null;
    if (laneDef == null) {
      final FabricPart part = fabricPart();
      laneDef = part != null ? part.getLaneDef(hostUri(), nodeUri, laneUri) : null;
    }
    return laneDef;
  }

  @Override
  public LaneBinding injectLane(Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return this.hostContext.injectLane(nodeUri, laneUri, lane);
  }

  public Log openLaneLog(Uri nodeUri, Uri laneUri) {
    final FabricPart part = fabricPart();
    return part != null ? part.openLaneLog(hostUri(), nodeUri, laneUri) : null;
  }

  public Policy openLanePolicy(Uri nodeUri, Uri laneUri) {
    final FabricPart part = fabricPart();
    return part != null ? part.openLanePolicy(hostUri(), nodeUri, laneUri) : null;
  }

  public Stage openLaneStage(Uri nodeUri, Uri laneUri) {
    final FabricPart part = fabricPart();
    return part != null ? part.openLaneStage(hostUri(), nodeUri, laneUri) : null;
  }

  public StoreBinding openLaneStore(Uri nodeUri, Uri laneUri) {
    final FabricPart part = fabricPart();
    return part != null ? part.openLaneStore(hostUri(), nodeUri, laneUri) : null;
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(Uri nodeUri, Class<? extends A> agentClass) {
    return this.hostContext.createAgentFactory(nodeUri, agentClass);
  }

  @Override
  public void openAgents(Uri nodeUri, NodeBinding node) {
    this.hostContext.openAgents(nodeUri, node);
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
