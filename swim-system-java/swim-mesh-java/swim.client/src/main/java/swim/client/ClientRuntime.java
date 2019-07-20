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

import swim.api.agent.Agent;
import swim.api.agent.AgentDef;
import swim.api.agent.AgentFactory;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.client.Client;
import swim.api.downlink.Downlink;
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
import swim.runtime.EdgeBinding;
import swim.runtime.EdgeContext;
import swim.runtime.HostBinding;
import swim.runtime.HttpBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LinkBinding;
import swim.runtime.MeshBinding;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.runtime.PushRequest;
import swim.runtime.router.EdgeTable;
import swim.runtime.router.MeshTable;
import swim.runtime.router.PartTable;
import swim.store.StoreBinding;
import swim.structure.Value;
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
  public MeshBinding createMesh(Uri meshUri) {
    return new MeshTable();
  }

  @Override
  public MeshBinding injectMesh(Uri meshUri, MeshBinding mesh) {
    return mesh;
  }

  @Override
  public PartBinding createPart(Uri meshUri, Value partKey) {
    return new PartTable();
  }

  @Override
  public PartBinding injectPart(Uri meshUri, Value partKey, PartBinding part) {
    return part;
  }

  @Override
  public HostBinding createHost(Uri meshUri, Value partKey, Uri hostUri) {
    return new RemoteHostClient(hostUri, this.endpoint);
  }

  @Override
  public HostBinding injectHost(Uri meshUri, Value partKey, Uri hostUri, HostBinding host) {
    return host;
  }

  @Override
  public NodeBinding createNode(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    return null;
  }

  @Override
  public NodeBinding injectNode(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    return node;
  }

  @Override
  public LaneBinding createLane(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    return null;
  }

  @Override
  public LaneBinding createLane(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    return null;
  }

  @Override
  public LaneBinding injectLane(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return lane;
  }

  @Override
  public void openLanes(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    // nop
  }

  @Override
  public AgentFactory<?> createAgentFactory(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, AgentDef agentDef) {
    return null;
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri,
                                                              Class<? extends A> agentClass) {
    return null;
  }

  @Override
  public void openAgents(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
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
  public void httpDownlink(HttpBinding http) {
    this.edge.httpDownlink(http);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.edge.pushDown(pushRequest);
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
