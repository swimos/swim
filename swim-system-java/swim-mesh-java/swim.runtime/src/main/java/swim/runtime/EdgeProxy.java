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

import swim.api.agent.Agent;
import swim.api.agent.AgentFactory;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.downlink.Downlink;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.collections.HashTrieMap;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.store.StoreBinding;
import swim.structure.Value;
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
  public MeshBinding createMesh(Uri meshUri) {
    return this.edgeContext.createMesh(meshUri);
  }

  @Override
  public MeshBinding injectMesh(Uri meshUri, MeshBinding mesh) {
    return this.edgeContext.injectMesh(meshUri, mesh);
  }

  @Override
  public PartBinding createPart(Uri meshUri, Value partKey) {
    return this.edgeContext.createPart(meshUri, partKey);
  }

  @Override
  public PartBinding injectPart(Uri meshUri, Value partKey, PartBinding part) {
    return this.edgeContext.injectPart(meshUri, partKey, part);
  }

  @Override
  public HostBinding createHost(Uri meshUri, Value partKey, Uri hostUri) {
    return this.edgeContext.createHost(meshUri, partKey, hostUri);
  }

  @Override
  public HostBinding injectHost(Uri meshUri, Value partKey, Uri hostUri, HostBinding host) {
    return this.edgeContext.injectHost(meshUri, partKey, hostUri, host);
  }

  @Override
  public NodeBinding createNode(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    return this.edgeContext.createNode(meshUri, partKey, hostUri, nodeUri);
  }

  @Override
  public NodeBinding injectNode(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    return this.edgeContext.injectNode(meshUri, partKey, hostUri, nodeUri, node);
  }

  @Override
  public LaneBinding injectLane(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return this.edgeContext.injectLane(meshUri, partKey, hostUri, nodeUri, laneUri, lane);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri,
                                                              Class<? extends A> agentClass) {
    return this.edgeContext.createAgentFactory(meshUri, partKey, hostUri, nodeUri, agentClass);
  }

  @Override
  public void openAgents(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    this.edgeContext.openAgents(meshUri, partKey, hostUri, nodeUri, node);
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
  public void httpDownlink(HttpBinding http) {
    this.edgeBinding.httpDownlink(http);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.edgeBinding.pushDown(pushRequest);
  }

  @Override
  public void openUplink(LinkBinding link) {
    this.edgeBinding.openUplink(link);
  }

  @Override
  public void httpUplink(HttpBinding http) {
    this.edgeBinding.httpUplink(http);
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    this.edgeBinding.pushUp(pushRequest);
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
    this.edgeBinding.close();
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
