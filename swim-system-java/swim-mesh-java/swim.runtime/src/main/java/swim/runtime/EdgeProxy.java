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

package swim.runtime;

import swim.api.Downlink;
import swim.api.agent.Agent;
import swim.api.agent.AgentDef;
import swim.api.agent.AgentFactory;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.collections.HashTrieMap;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.store.StoreBinding;
import swim.uri.Uri;

public class EdgeProxy implements EdgeBinding, EdgeContext {
  protected final EdgeBinding edgeBinding;
  protected EdgeContext edgeContext;

  public EdgeProxy(EdgeBinding edgeBinding) {
    this.edgeBinding = edgeBinding;
  }

  @Override
  public final TierContext tierContext() {
    return this;
  }

  @Override
  public final EdgeBinding edgeWrapper() {
    return this.edgeBinding.edgeWrapper();
  }

  public final EdgeBinding edgeBinding() {
    return this.edgeBinding;
  }

  @Override
  public final EdgeContext edgeContext() {
    return this.edgeContext;
  }

  @Override
  public void setEdgeContext(EdgeContext edgeContext) {
    this.edgeContext = edgeContext;
    this.edgeBinding.setEdgeContext(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapEdge(Class<T> edgeClass) {
    if (edgeClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.edgeContext.unwrapEdge(edgeClass);
    }
  }

  @Override
  public EdgeAddress cellAddress() {
    return this.edgeContext.cellAddress();
  }

  @Override
  public String edgeName() {
    return this.edgeContext.edgeName();
  }

  @Override
  public Uri meshUri() {
    return this.edgeContext.meshUri();
  }

  @Override
  public Policy policy() {
    return this.edgeContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.edgeContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.edgeContext.stage();
  }

  @Override
  public StoreBinding store() {
    return this.edgeContext.store();
  }

  @Override
  public void openMetaEdge(EdgeBinding edge, NodeBinding metaEdge) {
    this.edgeContext.openMetaEdge(edge, metaEdge);
  }

  @Override
  public MeshBinding network() {
    return this.edgeBinding.network();
  }

  @Override
  public void setNetwork(MeshBinding network) {
    this.edgeBinding.setNetwork(network);
  }

  @Override
  public HashTrieMap<Uri, MeshBinding> meshes() {
    return this.edgeBinding.meshes();
  }

  @Override
  public MeshBinding getMesh(Uri meshUri) {
    return this.edgeBinding.getMesh(meshUri);
  }

  @Override
  public MeshBinding openMesh(Uri meshUri) {
    return this.edgeBinding.openMesh(meshUri);
  }

  @Override
  public MeshBinding openMesh(Uri meshUri, MeshBinding mesh) {
    return this.edgeBinding.openMesh(meshUri, mesh);
  }

  @Override
  public MeshBinding createMesh(MeshAddress meshAddress) {
    return this.edgeContext.createMesh(meshAddress);
  }

  @Override
  public MeshBinding injectMesh(MeshAddress meshAddress, MeshBinding mesh) {
    return this.edgeContext.injectMesh(meshAddress, mesh);
  }

  @Override
  public void openMetaMesh(MeshBinding mesh, NodeBinding metaMesh) {
    this.edgeContext.openMetaMesh(mesh, metaMesh);
  }

  @Override
  public PartBinding createPart(PartAddress partAddress) {
    return this.edgeContext.createPart(partAddress);
  }

  @Override
  public PartBinding injectPart(PartAddress partAddress, PartBinding part) {
    return this.edgeContext.injectPart(partAddress, part);
  }

  @Override
  public void openMetaPart(PartBinding part, NodeBinding metaPart) {
    this.edgeContext.openMetaPart(part, metaPart);
  }

  @Override
  public HostBinding createHost(HostAddress hostAddress) {
    return this.edgeContext.createHost(hostAddress);
  }

  @Override
  public HostBinding injectHost(HostAddress hostAddress, HostBinding host) {
    return this.edgeContext.injectHost(hostAddress, host);
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    this.edgeContext.openMetaHost(host, metaHost);
  }

  @Override
  public NodeBinding createNode(NodeAddress nodeAddress) {
    return this.edgeContext.createNode(nodeAddress);
  }

  @Override
  public NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node) {
    return this.edgeContext.injectNode(nodeAddress, node);
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.edgeContext.openMetaNode(node, metaNode);
  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    return this.edgeContext.createLane(laneAddress);
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    return this.edgeContext.injectLane(laneAddress, lane);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.edgeContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.edgeContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.edgeContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return this.edgeContext.createLane(node, laneDef);
  }

  @Override
  public void openLanes(NodeBinding node) {
    this.edgeContext.openLanes(node);
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return this.edgeContext.createAgentFactory(node, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return this.edgeContext.createAgentFactory(node, agentClass);
  }

  @Override
  public void openAgents(NodeBinding node) {
    this.edgeContext.openAgents(node);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return this.edgeContext.authenticate(credentials);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.edgeBinding.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.edgeBinding.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    this.edgeBinding.closeDownlink(link);
  }

  @Override
  public void pushDown(Push<?> push) {
    this.edgeBinding.pushDown(push);
  }

  @Override
  public void reportDown(Metric metric) {
    this.edgeContext.reportDown(metric);
  }

  @Override
  public void openUplink(LinkBinding link) {
    this.edgeBinding.openUplink(link);
  }

  @Override
  public void pushUp(Push<?> push) {
    this.edgeBinding.pushUp(push);
  }

  @Override
  public void trace(Object message) {
    this.edgeContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.edgeContext.debug(message);
  }

  @Override
  public void info(Object message) {
    this.edgeContext.info(message);
  }

  @Override
  public void warn(Object message) {
    this.edgeContext.warn(message);
  }

  @Override
  public void error(Object message) {
    this.edgeContext.error(message);
  }

  @Override
  public void fail(Object message) {
    this.edgeContext.fail(message);
  }

  @Override
  public boolean isClosed() {
    return this.edgeBinding.isClosed();
  }

  @Override
  public boolean isOpened() {
    return this.edgeBinding.isOpened();
  }

  @Override
  public boolean isLoaded() {
    return this.edgeBinding.isLoaded();
  }

  @Override
  public boolean isStarted() {
    return this.edgeBinding.isStarted();
  }

  @Override
  public void open() {
    this.edgeBinding.open();
  }

  @Override
  public void load() {
    this.edgeBinding.load();
  }

  @Override
  public void start() {
    this.edgeBinding.start();
  }

  @Override
  public void stop() {
    this.edgeBinding.stop();
  }

  @Override
  public void unload() {
    this.edgeBinding.unload();
  }

  @Override
  public void close() {
    this.edgeContext.close();
  }

  @Override
  public void willOpen() {
    this.edgeContext.willOpen();
  }

  @Override
  public void didOpen() {
    this.edgeContext.didOpen();
  }

  @Override
  public void willLoad() {
    this.edgeContext.willLoad();
  }

  @Override
  public void didLoad() {
    this.edgeContext.didLoad();
  }

  @Override
  public void willStart() {
    this.edgeContext.willStart();
  }

  @Override
  public void didStart() {
    this.edgeContext.didStart();
  }

  @Override
  public void willStop() {
    this.edgeContext.willStop();
  }

  @Override
  public void didStop() {
    this.edgeContext.didStop();
  }

  @Override
  public void willUnload() {
    this.edgeContext.willUnload();
  }

  @Override
  public void didUnload() {
    this.edgeContext.didUnload();
  }

  @Override
  public void willClose() {
    this.edgeContext.willClose();
  }

  @Override
  public void didClose() {
    this.edgeBinding.didClose();
  }

  @Override
  public void didFail(Throwable error) {
    this.edgeBinding.didFail(error);
  }
}
