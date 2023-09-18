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
import swim.system.EdgeBinding;
import swim.system.HostAddress;
import swim.system.HostBinding;
import swim.system.LaneAddress;
import swim.system.LaneBinding;
import swim.system.LaneDef;
import swim.system.LinkBinding;
import swim.system.MeshAddress;
import swim.system.MeshBinding;
import swim.system.MeshContext;
import swim.system.Metric;
import swim.system.NodeAddress;
import swim.system.NodeBinding;
import swim.system.PartAddress;
import swim.system.PartBinding;
import swim.system.Push;
import swim.uri.Uri;

public class EdgeTableMesh implements MeshContext {

  protected final EdgeTable edge;
  protected final MeshBinding mesh;
  protected final MeshAddress meshAddress;

  public EdgeTableMesh(EdgeTable edge, MeshBinding mesh, MeshAddress meshAddress) {
    this.edge = edge;
    this.mesh = mesh;
    this.meshAddress = meshAddress;
  }

  @Override
  public final EdgeBinding edge() {
    return this.edge;
  }

  @Override
  public final MeshBinding meshWrapper() {
    return this.mesh.meshWrapper();
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapMesh(Class<T> meshClass) {
    if (meshClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomMesh(Class<T> meshClass) {
    if (meshClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public final MeshAddress cellAddress() {
    return this.meshAddress;
  }

  @Override
  public final String edgeName() {
    return this.meshAddress.edgeName();
  }

  @Override
  public final Uri meshUri() {
    return this.meshAddress.meshUri();
  }

  @Override
  public Policy policy() {
    return this.edge.policy();
  }

  @Override
  public Schedule schedule() {
    return this.edge.schedule();
  }

  @Override
  public Stage stage() {
    return this.edge.stage();
  }

  @Override
  public StoreBinding store() {
    return this.edge.store();
  }

  @Override
  public void openMetaMesh(MeshBinding mesh, NodeBinding metaMesh) {
    this.edge.openMetaMesh(mesh, metaMesh);
  }

  @Override
  public PartBinding createPart(PartAddress partAddress) {
    return this.edge.edgeContext().createPart(partAddress);
  }

  @Override
  public PartBinding injectPart(PartAddress partAddress, PartBinding part) {
    return this.edge.edgeContext().injectPart(partAddress, part);
  }

  @Override
  public void openMetaPart(PartBinding part, NodeBinding metaPart) {
    this.edge.openMetaPart(part, metaPart);
  }

  @Override
  public HostBinding createHost(HostAddress hostAddress) {
    return this.edge.edgeContext().createHost(hostAddress);
  }

  @Override
  public HostBinding injectHost(HostAddress hostAddress, HostBinding host) {
    return this.edge.edgeContext().injectHost(hostAddress, host);
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    this.edge.openMetaHost(host, metaHost);
  }

  @Override
  public NodeBinding createNode(NodeAddress nodeAddress) {
    return this.edge.edgeContext().createNode(nodeAddress);
  }

  @Override
  public NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node) {
    return this.edge.edgeContext().injectNode(nodeAddress, node);
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.edge.openMetaNode(node, metaNode);
  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    return this.edge.edgeContext().createLane(laneAddress);
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    return this.edge.edgeContext().injectLane(laneAddress, lane);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.edge.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.edge.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.edge.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return this.edge.edgeContext().createLane(node, laneDef);
  }

  @Override
  public void openLanes(NodeBinding node) {
    this.edge.edgeContext().openLanes(node);
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return this.edge.edgeContext().createAgentFactory(node, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return this.edge.edgeContext().createAgentFactory(node, agentClass);
  }

  @Override
  public void openAgents(NodeBinding node) {
    this.edge.edgeContext().openAgents(node);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return this.edge.edgeContext().authenticate(credentials);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.edge.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.edge.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void pushDown(Push<?> push) {
    this.edge.pushDown(push);
  }

  @Override
  public void reportDown(Metric metric) {
    this.edge.reportDown(metric);
  }

  @Override
  public void trace(Object message) {
    this.edge.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.edge.debug(message);
  }

  @Override
  public void info(Object message) {
    this.edge.info(message);
  }

  @Override
  public void warn(Object message) {
    this.edge.warn(message);
  }

  @Override
  public void error(Object message) {
    this.edge.error(message);
  }

  @Override
  public void fail(Object message) {
    this.edge.fail(message);
  }

  @Override
  public void close() {
    this.edge.closeMesh(this.meshAddress.meshUri());
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
