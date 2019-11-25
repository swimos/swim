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
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.HostAddress;
import swim.runtime.HostBinding;
import swim.runtime.HostContext;
import swim.runtime.LaneAddress;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LinkBinding;
import swim.runtime.Metric;
import swim.runtime.NodeAddress;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.runtime.Push;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class PartTableHost implements HostContext {
  protected final PartTable part;
  protected final HostBinding host;
  protected final HostAddress hostAddress;

  public PartTableHost(PartTable part, HostBinding host, HostAddress hostAddress) {
    this.part = part;
    this.host = host;
    this.hostAddress = hostAddress;
  }

  @Override
  public final PartBinding part() {
    return this.part;
  }

  @Override
  public final HostBinding hostWrapper() {
    return this.host.hostWrapper();
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapHost(Class<T> hostClass) {
    if (hostClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public final HostAddress cellAddress() {
    return this.hostAddress;
  }

  @Override
  public final String edgeName() {
    return this.hostAddress.edgeName();
  }

  @Override
  public final Uri meshUri() {
    return this.hostAddress.meshUri();
  }

  @Override
  public final Value partKey() {
    return this.hostAddress.partKey();
  }

  @Override
  public final Uri hostUri() {
    return this.hostAddress.hostUri();
  }

  @Override
  public Policy policy() {
    return this.part.policy();
  }

  @Override
  public Schedule schedule() {
    return this.part.schedule();
  }

  @Override
  public Stage stage() {
    return this.part.stage();
  }

  @Override
  public StoreBinding store() {
    return this.part.store();
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    this.part.openMetaHost(host, metaHost);
  }

  @Override
  public NodeBinding createNode(NodeAddress nodeAddress) {
    return this.part.partContext().createNode(nodeAddress);
  }

  @Override
  public NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node) {
    return this.part.partContext().injectNode(nodeAddress, node);
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.part.openMetaNode(node, metaNode);
  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    return this.part.partContext().createLane(laneAddress);
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    return this.part.partContext().injectLane(laneAddress, lane);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.part.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.part.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.part.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return this.part.partContext().createLane(node, laneDef);
  }

  @Override
  public void openLanes(NodeBinding node) {
    this.part.partContext().openLanes(node);
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return this.part.partContext().createAgentFactory(node, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return this.part.partContext().createAgentFactory(node, agentClass);
  }

  @Override
  public void openAgents(NodeBinding node) {
    this.part.partContext().openAgents(node);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return this.part.partContext().authenticate(credentials);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.part.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.part.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void pushDown(Push<?> push) {
    this.part.pushDown(push);
  }

  @Override
  public void reportDown(Metric metric) {
    this.part.reportDown(metric);
  }

  @Override
  public void trace(Object message) {
    this.part.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.part.debug(message);
  }

  @Override
  public void info(Object message) {
    this.part.info(message);
  }

  @Override
  public void warn(Object message) {
    this.part.warn(message);
  }

  @Override
  public void error(Object message) {
    this.part.error(message);
  }

  @Override
  public void fail(Object message) {
    this.part.fail(message);
  }

  @Override
  public void close() {
    this.part.closeHost(this.hostAddress.hostUri());
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
  public void didConnect() {
    this.part.hostDidConnect(this.hostAddress.hostUri());
  }

  @Override
  public void didDisconnect() {
    this.part.hostDidDisconnect(this.hostAddress.hostUri());
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
