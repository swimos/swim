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

import swim.api.Lane;
import swim.api.agent.AgentContext;
import swim.api.auth.Identity;
import swim.api.policy.Policy;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Stage;
import swim.concurrent.StageDef;
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Value;
import swim.system.CellAddress;
import swim.system.CellBinding;
import swim.system.CellContext;
import swim.system.LaneAddress;
import swim.system.LaneBinding;
import swim.system.LaneContext;
import swim.system.LaneDef;
import swim.system.LinkBinding;
import swim.system.LinkContext;
import swim.system.LogDef;
import swim.system.NodeBinding;
import swim.system.PolicyDef;
import swim.system.Push;
import swim.uri.Uri;
import swim.util.Log;
import swim.warp.CommandMessage;

public class ActorLane extends ActorTier implements LaneBinding, LaneContext {

  final LaneBinding laneBinding;
  LaneContext laneContext;
  LaneDef laneDef;

  public ActorLane(LaneBinding laneBinding, LaneDef laneDef) {
    this.laneBinding = laneBinding;
    this.laneContext = null;
    this.laneDef = laneDef;
  }

  public final LaneDef laneDef() {
    return this.laneDef;
  }

  public final ActorNode actorNode() {
    return this.node().unwrapNode(ActorNode.class);
  }

  @Override
  public final NodeBinding node() {
    return this.laneContext.node();
  }

  @Override
  public final LaneBinding laneWrapper() {
    return this.laneBinding.laneWrapper();
  }

  public final LaneBinding laneBinding() {
    return this.laneBinding;
  }

  @Override
  public final LaneContext laneContext() {
    return this.laneContext;
  }

  @Override
  public void setLaneContext(LaneContext laneContext) {
    this.laneContext = laneContext;
    this.laneBinding.setLaneContext(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapLane(Class<T> laneClass) {
    if (laneClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return this.laneContext.unwrapLane(laneClass);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomLane(Class<T> laneClass) {
    T lane = this.laneContext.bottomLane(laneClass);
    if (lane == null && laneClass.isAssignableFrom(this.getClass())) {
      lane = (T) this;
    }
    return lane;
  }

  @Override
  public final CellBinding cellBinding() {
    return this.laneBinding;
  }

  @Override
  public final CellContext cellContext() {
    return this.laneContext;
  }

  @Override
  public final LaneAddress cellAddress() {
    return this.laneContext.cellAddress();
  }

  @Override
  public Value partKey() {
    return this.laneContext.partKey();
  }

  @Override
  public Uri hostUri() {
    return this.laneContext.hostUri();
  }

  @Override
  public Uri nodeUri() {
    return this.laneContext.nodeUri();
  }

  @Override
  public Uri laneUri() {
    return this.laneContext.laneUri();
  }

  @Override
  public String laneType() {
    return this.laneBinding.laneType();
  }

  @Override
  public Identity identity() {
    return this.laneContext.identity();
  }

  @Override
  public Lane getLaneView(AgentContext agentContext) {
    return this.laneBinding.getLaneView(agentContext);
  }

  @Override
  public void openLaneView(Lane lane) {
    this.laneBinding.openLaneView(lane);
  }

  @Override
  public void closeLaneView(Lane lane) {
    this.laneBinding.closeLaneView(lane);
  }

  @Override
  public boolean isLinked() {
    return this.laneBinding.isLinked();
  }

  @Override
  public FingerTrieSeq<LinkContext> uplinks() {
    return this.laneBinding.uplinks();
  }

  @Override
  public LinkContext getUplink(Value linkKey) {
    return this.laneBinding.getUplink(linkKey);
  }

  @Override
  public void closeUplink(Value linkKey) {
    this.laneBinding.closeUplink(linkKey);
  }

  @Override
  public void pushUpCommand(Push<CommandMessage> push) {
    this.laneBinding.pushUpCommand(push);
  }

  public Log createLog(LogDef logDef) {
    final ActorNode node = this.actorNode();
    return node != null ? node.createLog(logDef) : null;
  }

  public Log createLog(CellAddress cellAddress) {
    final ActorNode node = this.actorNode();
    return node != null ? node.createLog(cellAddress) : null;
  }

  public Log injectLog(Log log) {
    final ActorNode node = this.actorNode();
    return node != null ? node.injectLog(log) : log;
  }

  @Override
  protected Log openLog() {
    Log log;
    if (this.laneDef != null && this.laneDef.logDef() != null) {
      log = this.createLog(this.laneDef.logDef());
    } else {
      log = this.createLog(this.cellAddress());
    }
    if (log != null) {
      log = this.injectLog(log);
    }
    return log;
  }

  public Policy createPolicy(PolicyDef policyDef) {
    final ActorNode node = this.actorNode();
    return node != null ? node.createPolicy(policyDef) : null;
  }

  public Policy createPolicy(CellAddress cellAddress) {
    final ActorNode node = this.actorNode();
    return node != null ? node.createPolicy(cellAddress) : null;
  }

  public Policy injectPolicy(Policy policy) {
    final ActorNode node = this.actorNode();
    return node != null ? node.injectPolicy(policy) : policy;
  }

  @Override
  protected Policy openPolicy() {
    Policy policy;
    if (this.laneDef != null && this.laneDef.policyDef() != null) {
      policy = this.createPolicy(this.laneDef.policyDef());
    } else {
      policy = this.createPolicy(this.cellAddress());
    }
    if (policy != null) {
      policy = this.injectPolicy(policy);
    }
    return policy;
  }

  public Stage createStage(StageDef stageDef) {
    final ActorNode node = this.actorNode();
    return node != null ? node.createStage(stageDef) : null;
  }

  public Stage createStage(CellAddress cellAddress) {
    final ActorNode node = this.actorNode();
    return node != null ? node.createStage(cellAddress) : null;
  }

  public Stage injectStage(Stage stage) {
    final ActorNode node = this.actorNode();
    return node != null ? node.injectStage(stage) : stage;
  }

  @Override
  protected Stage openStage() {
    Stage stage;
    if (this.laneDef != null && this.laneDef.stageDef() != null) {
      stage = this.createStage(this.laneDef.stageDef());
    } else {
      stage = this.createStage(this.cellAddress());
    }
    if (stage != null) {
      stage = this.injectStage(stage);
    }
    return stage;
  }

  public StoreBinding createStore(StoreDef storeDef) {
    final ActorNode node = this.actorNode();
    return node != null ? node.createStore(storeDef) : null;
  }

  public StoreBinding createStore(CellAddress cellAddress) {
    final ActorNode node = this.actorNode();
    return node != null ? node.createStore(cellAddress) : null;
  }

  public StoreBinding injectStore(StoreBinding store) {
    final ActorNode node = this.actorNode();
    return node != null ? node.injectStore(store) : store;
  }

  @Override
  protected StoreBinding openStore() {
    StoreBinding store = null;
    if (this.laneDef != null && this.laneDef.storeDef() != null) {
      store = this.createStore(this.laneDef.storeDef());
    } else {
      store = this.createStore(this.cellAddress());
    }
    if (store != null) {
      store = this.injectStore(store);
    }
    return store;
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.laneContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.laneContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.laneContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public void didClose() {
    this.laneBinding.didClose();
  }

  @Override
  public void didFail(Throwable error) {
    this.laneBinding.didFail(error);
  }

}
