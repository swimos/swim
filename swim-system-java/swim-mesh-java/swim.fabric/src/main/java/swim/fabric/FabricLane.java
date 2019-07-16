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

import swim.api.agent.AgentContext;
import swim.api.auth.Identity;
import swim.api.lane.Lane;
import swim.api.policy.Policy;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Stage;
import swim.kernel.LaneDef;
import swim.kernel.LogDef;
import swim.kernel.PolicyDef;
import swim.kernel.StageDef;
import swim.kernel.StoreDef;
import swim.runtime.CellBinding;
import swim.runtime.CellContext;
import swim.runtime.LaneBinding;
import swim.runtime.LaneContext;
import swim.runtime.LinkBinding;
import swim.runtime.LinkContext;
import swim.runtime.NodeBinding;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;
import swim.warp.CommandMessage;

public class FabricLane extends FabricTier implements LaneBinding, LaneContext {
  final LaneBinding laneBinding;
  LaneContext laneContext;
  LaneDef laneDef;

  public FabricLane(LaneBinding laneBinding, LaneDef laneDef) {
    this.laneBinding = laneBinding;
    this.laneDef = laneDef;
  }

  public final LaneDef laneDef() {
    return this.laneDef;
  }

  public final FabricNode fabricNode() {
    return node().unwrapNode(FabricNode.class);
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
    if (laneClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.laneContext.unwrapLane(laneClass);
    }
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
  public FingerTrieSeq<LinkContext> getUplinks() {
    return this.laneBinding.getUplinks();
  }

  @Override
  public LinkBinding getUplink(Value linkKey) {
    return this.laneBinding.getUplink(linkKey);
  }

  @Override
  public void closeUplink(Value linkKey) {
    this.laneBinding.closeUplink(linkKey);
  }

  @Override
  public void pushUpCommand(CommandMessage message) {
    this.laneBinding.pushUpCommand(message);
  }

  public Log createLog(LogDef logDef) {
    final FabricNode node = fabricNode();
    return node != null ? node.createLog(logDef) : null;
  }

  public Log injectLog(Log log) {
    final FabricNode node = fabricNode();
    return node != null ? node.injectLog(log) : log;
  }

  @Override
  protected Log openLog() {
    Log log;
    if (this.laneDef != null && this.laneDef.logDef() != null) {
      log = createLog(this.laneDef.logDef());
    } else {
      log = openLaneLog();
    }
    if (log != null) {
      log = injectLog(log);
    }
    return log;
  }

  public Policy createPolicy(PolicyDef policyDef) {
    final FabricNode node = fabricNode();
    return node != null ? node.createPolicy(policyDef) : null;
  }

  public Policy injectPolicy(Policy policy) {
    final FabricNode node = fabricNode();
    return node != null ? node.injectPolicy(policy) : policy;
  }

  @Override
  protected Policy openPolicy() {
    Policy policy;
    if (this.laneDef != null && this.laneDef.policyDef() != null) {
      policy = createPolicy(this.laneDef.policyDef());
    } else {
      policy = openLanePolicy();
    }
    if (policy != null) {
      policy = injectPolicy(policy);
    }
    return policy;
  }

  public Stage createStage(StageDef stageDef) {
    final FabricNode node = fabricNode();
    return node != null ? node.createStage(stageDef) : null;
  }

  public Stage injectStage(Stage stage) {
    final FabricNode node = fabricNode();
    return node != null ? node.injectStage(stage) : stage;
  }

  @Override
  protected Stage openStage() {
    Stage stage;
    if (this.laneDef != null && this.laneDef.stageDef() != null) {
      stage = createStage(this.laneDef.stageDef());
    } else {
      stage = openLaneStage();
    }
    if (stage != null) {
      stage = injectStage(stage);
    }
    return stage;
  }

  public StoreBinding createStore(StoreDef storeDef) {
    final FabricNode node = fabricNode();
    return node != null ? node.createStore(storeDef) : null;
  }

  public StoreBinding injectStore(StoreBinding store) {
    final FabricNode node = fabricNode();
    return node != null ? node.injectStore(store) : store;
  }

  @Override
  protected StoreBinding openStore() {
    StoreBinding store = null;
    if (this.laneDef != null && this.laneDef.storeDef() != null) {
      store = createStore(this.laneDef.storeDef());
    } else {
      store = openLaneStore();
    }
    if (store != null) {
      store = injectStore(store);
    }
    return store;
  }

  protected Log openLaneLog() {
    final FabricNode node = fabricNode();
    return node != null ? node.openLaneLog(laneUri()) : null;
  }

  protected Policy openLanePolicy() {
    final FabricNode node = fabricNode();
    return node != null ? node.openLanePolicy(laneUri()) : null;
  }

  protected Stage openLaneStage() {
    final FabricNode node = fabricNode();
    return node != null ? node.openLaneStage(laneUri()) : null;
  }

  protected StoreBinding openLaneStore() {
    final FabricNode node = fabricNode();
    return node != null ? node.openLaneStore(laneUri()) : null;
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
