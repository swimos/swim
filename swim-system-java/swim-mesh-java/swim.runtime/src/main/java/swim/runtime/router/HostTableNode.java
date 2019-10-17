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

package swim.runtime.router;

import swim.api.Downlink;
import swim.api.agent.Agent;
import swim.api.agent.AgentDef;
import swim.api.agent.AgentFactory;
import swim.api.auth.Identity;
import swim.api.policy.Policy;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.HostBinding;
import swim.runtime.LaneAddress;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LinkBinding;
import swim.runtime.Metric;
import swim.runtime.NodeAddress;
import swim.runtime.NodeBinding;
import swim.runtime.NodeContext;
import swim.runtime.PushRequest;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class HostTableNode implements NodeContext {
  protected final HostTable host;
  protected final NodeBinding node;
  protected final NodeAddress nodeAddress;

  public HostTableNode(HostTable host, NodeBinding node, NodeAddress nodeAddress) {
    this.host = host;
    this.node = node;
    this.nodeAddress = nodeAddress;
  }

  @Override
  public final HostBinding host() {
    return this.host;
  }

  @Override
  public final NodeBinding nodeWrapper() {
    return this.node.nodeWrapper();
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapNode(Class<T> nodeClass) {
    if (nodeClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public final NodeAddress cellAddress() {
    return this.nodeAddress;
  }

  @Override
  public final String edgeName() {
    return this.nodeAddress.edgeName();
  }

  @Override
  public final Uri meshUri() {
    return this.nodeAddress.meshUri();
  }

  @Override
  public final Value partKey() {
    return this.nodeAddress.partKey();
  }

  @Override
  public final Uri hostUri() {
    return this.nodeAddress.hostUri();
  }

  @Override
  public final Uri nodeUri() {
    return this.nodeAddress.nodeUri();
  }

  @Override
  public long createdTime() {
    return this.node.createdTime();
  }

  @Override
  public final Identity identity() {
    return null; // TODO
  }

  @Override
  public Policy policy() {
    return this.host.policy();
  }

  @Override
  public Schedule schedule() {
    return this.host.schedule();
  }

  @Override
  public Stage stage() {
    return this.host.stage();
  }

  @Override
  public StoreBinding store() {
    return this.host.store();
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.host.openMetaNode(node, metaNode);
  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    return this.host.hostContext().createLane(laneAddress);
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    return this.host.hostContext().injectLane(laneAddress, lane);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.host.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.host.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.host.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return this.host.hostContext().createLane(node, laneDef);
  }

  @Override
  public void openLanes(NodeBinding node) {
    this.host.hostContext().openLanes(node);
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return this.host.hostContext().createAgentFactory(node, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return this.host.hostContext().createAgentFactory(node, agentClass);
  }

  @Override
  public void openAgents(NodeBinding node) {
    this.host.hostContext().openAgents(node);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.host.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.host.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.host.pushDown(pushRequest);
  }

  @Override
  public void reportDown(Metric metric) {
    this.host.reportDown(metric);
  }

  @Override
  public void trace(Object message) {
    this.host.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.host.debug(message);
  }

  @Override
  public void info(Object message) {
    this.host.info(message);
  }

  @Override
  public void warn(Object message) {
    this.host.warn(message);
  }

  @Override
  public void error(Object message) {
    this.host.error(message);
  }

  @Override
  public void fail(Object message) {
    this.host.fail(message);
  }

  @Override
  public void close() {
    this.host.closeNode(this.nodeAddress.nodeUri());
  }

  @Override
  public void willOpen() {
    // nop
  }

  @Override
  public void didOpen() {
    // nop
  }

  @Override
  public void willLoad() {
    // nop
  }

  @Override
  public void didLoad() {
    // nop
  }

  @Override
  public void willStart() {
    // nop
  }

  @Override
  public void didStart() {
    // nop
  }

  @Override
  public void willStop() {
    // nop
  }

  @Override
  public void didStop() {
    // nop
  }

  @Override
  public void willUnload() {
    // nop
  }

  @Override
  public void didUnload() {
    // nop
  }

  @Override
  public void willClose() {
    // nop
  }
}
