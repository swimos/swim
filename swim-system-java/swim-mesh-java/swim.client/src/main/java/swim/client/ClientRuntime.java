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

package swim.client;

import swim.api.Downlink;
import swim.api.agent.Agent;
import swim.api.agent.AgentDef;
import swim.api.agent.AgentFactory;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.client.Client;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.concurrent.MainStage;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.concurrent.Theater;
import swim.io.TlsSettings;
import swim.io.http.HttpEndpoint;
import swim.io.http.HttpSettings;
import swim.remote.RemoteHostClient;
import swim.runtime.AbstractSwimRef;
import swim.runtime.EdgeAddress;
import swim.runtime.EdgeBinding;
import swim.runtime.EdgeContext;
import swim.runtime.HostAddress;
import swim.runtime.HostBinding;
import swim.runtime.LaneAddress;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LinkBinding;
import swim.runtime.MeshAddress;
import swim.runtime.MeshBinding;
import swim.runtime.Metric;
import swim.runtime.NodeAddress;
import swim.runtime.NodeBinding;
import swim.runtime.PartAddress;
import swim.runtime.PartBinding;
import swim.runtime.Push;
import swim.runtime.router.EdgeTable;
import swim.runtime.router.MeshTable;
import swim.runtime.router.PartTable;
import swim.store.StoreBinding;
import swim.uri.Uri;

public class ClientRuntime extends AbstractSwimRef implements Client, EdgeContext {
  final Stage stage;
  final HttpEndpoint endpoint;
  final EdgeBinding edge;
  StoreBinding store;

  public ClientRuntime(Stage stage, HttpSettings settings) {
    this.stage = stage;
    this.endpoint = new HttpEndpoint(stage, settings);
    this.edge = new EdgeTable();
    this.edge.setEdgeContext(this);
  }

  public ClientRuntime(Stage stage) {
    this(stage, HttpSettings.standard().tlsSettings(TlsSettings.standard()));
  }

  public ClientRuntime() {
    this(new Theater());
  }

  @Override
  public void start() {
    if (this.stage instanceof MainStage) {
      ((MainStage) this.stage).start();
    }
    this.endpoint.start();
    this.edge.start();
  }

  @Override
  public void stop() {
    this.endpoint.stop();
    if (this.stage instanceof MainStage) {
      ((MainStage) this.stage).stop();
    }
  }

  @Override
  public final EdgeBinding edgeWrapper() {
    return this.edge.edgeWrapper();
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapEdge(Class<T> edgeClass) {
    if (edgeClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public EdgeAddress cellAddress() {
    return new EdgeAddress(edgeName());
  }

  @Override
  public String edgeName() {
    return "";
  }

  @Override
  public Uri meshUri() {
    return Uri.empty();
  }

  @Override
  public Policy policy() {
    return null; // TODO
  }

  @Override
  public Schedule schedule() {
    return this.stage;
  }

  @Override
  public final Stage stage() {
    return this.stage;
  }

  @Override
  public final StoreBinding store() {
    return this.store;
  }

  public final HttpEndpoint endpoint() {
    return this.endpoint;
  }

  @Override
  public void openMetaEdge(EdgeBinding edge, NodeBinding metaEdge) {
    // nop
  }

  @Override
  public MeshBinding createMesh(MeshAddress meshAddress) {
    return new MeshTable();
  }

  @Override
  public MeshBinding injectMesh(MeshAddress meshAddress, MeshBinding mesh) {
    return mesh;
  }

  @Override
  public void openMetaMesh(MeshBinding mesh, NodeBinding metaMesh) {
    // nop
  }

  @Override
  public PartBinding createPart(PartAddress partAddress) {
    return new PartTable();
  }

  @Override
  public PartBinding injectPart(PartAddress partAddress, PartBinding part) {
    return part;
  }

  @Override
  public void openMetaPart(PartBinding part, NodeBinding metaPart) {
    // nop
  }

  @Override
  public HostBinding createHost(HostAddress hostAddress) {
    return new RemoteHostClient(hostAddress.hostUri(), this.endpoint);
  }

  @Override
  public HostBinding injectHost(HostAddress hostAddress, HostBinding host) {
    return host;
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    // nop
  }

  @Override
  public NodeBinding createNode(NodeAddress nodeAddress) {
    return null;
  }

  @Override
  public NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node) {
    return node;
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    // nop
  }

  @Override
  public LaneBinding createLane(LaneAddress lane) {
    return null;
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    return lane;
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    // nop
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    // nop
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    // nop
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return null;
  }

  @Override
  public void openLanes(NodeBinding node) {
    // nop
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return null;
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return null;
  }

  @Override
  public void openAgents(NodeBinding node) {
    // nop
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return null; // TODO
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
    // TODO
  }

  @Override
  public void debug(Object message) {
    // TODO
  }

  @Override
  public void info(Object message) {
    // TODO
  }

  @Override
  public void warn(Object message) {
    // TODO
  }

  @Override
  public void error(Object message) {
    // TODO
  }

  @Override
  public void fail(Object message) {
    // TODO
  }

  @Override
  public void close() {
    // TODO
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
