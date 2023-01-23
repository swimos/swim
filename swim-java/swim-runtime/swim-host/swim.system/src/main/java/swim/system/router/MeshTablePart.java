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

package swim.system.router;

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
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.system.HostAddress;
import swim.system.HostBinding;
import swim.system.LaneAddress;
import swim.system.LaneBinding;
import swim.system.LaneDef;
import swim.system.LinkBinding;
import swim.system.MeshBinding;
import swim.system.Metric;
import swim.system.NodeAddress;
import swim.system.NodeBinding;
import swim.system.PartAddress;
import swim.system.PartBinding;
import swim.system.PartContext;
import swim.system.Push;
import swim.uri.Uri;

public class MeshTablePart implements PartContext {

  protected final MeshTable mesh;
  protected final PartBinding part;
  protected final PartAddress partAddress;

  public MeshTablePart(MeshTable mesh, PartBinding part, PartAddress partAddress) {
    this.mesh = mesh;
    this.part = part;
    this.partAddress = partAddress;
  }

  @Override
  public final MeshBinding mesh() {
    return this.mesh;
  }

  @Override
  public final PartBinding partWrapper() {
    return this.part.partWrapper();
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapPart(Class<T> partClass) {
    if (partClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomPart(Class<T> partClass) {
    if (partClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public final PartAddress cellAddress() {
    return this.partAddress;
  }

  @Override
  public final String edgeName() {
    return this.partAddress.edgeName();
  }

  @Override
  public final Uri meshUri() {
    return this.partAddress.meshUri();
  }

  @Override
  public final Value partKey() {
    return this.partAddress.partKey();
  }

  @Override
  public Policy policy() {
    return this.mesh.policy();
  }

  @Override
  public Schedule schedule() {
    return this.mesh.schedule();
  }

  @Override
  public Stage stage() {
    return this.mesh.stage();
  }

  @Override
  public StoreBinding store() {
    return this.mesh.store();
  }

  @Override
  public void openMetaPart(PartBinding part, NodeBinding metaPart) {
    this.mesh.openMetaPart(part, metaPart);
  }

  @Override
  public HostBinding createHost(HostAddress hostAddress) {
    return this.mesh.meshContext().createHost(hostAddress);
  }

  @Override
  public HostBinding injectHost(HostAddress hostAddress, HostBinding host) {
    return this.mesh.meshContext().injectHost(hostAddress, host);
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    this.mesh.openMetaHost(host, metaHost);
  }

  @Override
  public NodeBinding createNode(NodeAddress nodeAddress) {
    return this.mesh.meshContext().createNode(nodeAddress);
  }

  @Override
  public NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node) {
    return this.mesh.meshContext().injectNode(nodeAddress, node);
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.mesh.openMetaNode(node, metaNode);
  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    return this.mesh.meshContext().createLane(laneAddress);
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    return this.mesh.meshContext().injectLane(laneAddress, lane);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.mesh.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.mesh.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.mesh.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return this.mesh.meshContext().createLane(node, laneDef);
  }

  @Override
  public void openLanes(NodeBinding node) {
    this.mesh.meshContext().openLanes(node);
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return this.mesh.meshContext().createAgentFactory(node, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return this.mesh.meshContext().createAgentFactory(node, agentClass);
  }

  @Override
  public void openAgents(NodeBinding node) {
    this.mesh.meshContext().openAgents(node);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return this.mesh.meshContext().authenticate(credentials);
  }

  @Override
  public void hostDidConnect(Uri hostUri) {
    // hook
  }

  @Override
  public void hostDidDisconnect(Uri hostUri) {
    // hook
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.mesh.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.mesh.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void pushDown(Push<?> push) {
    this.mesh.pushDown(push);
  }

  @Override
  public void reportDown(Metric metric) {
    this.mesh.reportDown(metric);
  }

  @Override
  public void trace(Object message) {
    this.mesh.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.mesh.debug(message);
  }

  @Override
  public void info(Object message) {
    this.mesh.info(message);
  }

  @Override
  public void warn(Object message) {
    this.mesh.warn(message);
  }

  @Override
  public void error(Object message) {
    this.mesh.error(message);
  }

  @Override
  public void fail(Object message) {
    this.mesh.fail(message);
  }

  @Override
  public void close() {
    this.mesh.closePart(this.partAddress.partKey());
  }

  @Override
  public void willOpen() {
    // hook
  }

  @Override
  public void didOpen() {
    // hook
  }

  @Override
  public void willLoad() {
    // hook
  }

  @Override
  public void didLoad() {
    // hook
  }

  @Override
  public void willStart() {
    // hook
  }

  @Override
  public void didStart() {
    // hook
  }

  @Override
  public void willStop() {
    // hook
  }

  @Override
  public void didStop() {
    // hook
  }

  @Override
  public void willUnload() {
    // hook
  }

  @Override
  public void didUnload() {
    // hook
  }

  @Override
  public void willClose() {
    // hook
  }

}
