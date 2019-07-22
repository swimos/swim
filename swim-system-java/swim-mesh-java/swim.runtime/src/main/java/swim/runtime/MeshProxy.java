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
import swim.collections.FingerTrieSeq;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class MeshProxy implements MeshBinding, MeshContext {
  protected final MeshBinding meshBinding;
  protected MeshContext meshContext;

  public MeshProxy(MeshBinding meshBinding) {
    this.meshBinding = meshBinding;
  }

  @Override
  public final TierContext tierContext() {
    return this;
  }

  @Override
  public final EdgeBinding edge() {
    return this.meshContext.edge();
  }

  @Override
  public final MeshBinding meshWrapper() {
    return this.meshBinding.meshWrapper();
  }

  public final MeshBinding meshBinding() {
    return this.meshBinding;
  }

  @Override
  public final MeshContext meshContext() {
    return this.meshContext;
  }

  @Override
  public void setMeshContext(MeshContext meshContext) {
    this.meshContext = meshContext;
    this.meshBinding.setMeshContext(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapMesh(Class<T> meshClass) {
    if (meshClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.meshContext.unwrapMesh(meshClass);
    }
  }

  @Override
  public Uri meshUri() {
    return this.meshContext.meshUri();
  }

  @Override
  public Policy policy() {
    return this.meshContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.meshContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.meshContext.stage();
  }

  @Override
  public StoreBinding store() {
    return this.meshContext.store();
  }

  @Override
  public PartBinding gateway() {
    return this.meshBinding.gateway();
  }

  @Override
  public void setGateway(PartBinding gateway) {
    this.meshBinding.setGateway(gateway);
  }

  @Override
  public PartBinding ourself() {
    return this.meshBinding.ourself();
  }

  @Override
  public void setOurself(PartBinding ourself) {
    this.meshBinding.setOurself(ourself);
  }

  @Override
  public FingerTrieSeq<PartBinding> parts() {
    return this.meshBinding.parts();
  }

  @Override
  public PartBinding getPart(Uri nodeUri) {
    return this.meshBinding.getPart(nodeUri);
  }

  @Override
  public PartBinding getPart(Value partKey) {
    return this.meshBinding.getPart(partKey);
  }

  @Override
  public PartBinding openPart(Uri nodeUri) {
    return this.meshBinding.openPart(nodeUri);
  }

  @Override
  public PartBinding openGateway() {
    return this.meshBinding.openGateway();
  }

  @Override
  public PartBinding addPart(Value partKey, PartBinding part) {
    return this.meshBinding.addPart(partKey, part);
  }

  @Override
  public PartBinding createPart(Value partKey) {
    return this.meshContext.createPart(partKey);
  }

  @Override
  public PartBinding injectPart(Value partKey, PartBinding part) {
    return this.meshContext.injectPart(partKey, part);
  }

  @Override
  public HostBinding createHost(Value partKey, Uri hostUri) {
    return this.meshContext.createHost(partKey, hostUri);
  }

  @Override
  public HostBinding injectHost(Value partKey, Uri hostUri, HostBinding host) {
    return this.meshContext.injectHost(partKey, hostUri, host);
  }

  @Override
  public NodeBinding createNode(Value partKey, Uri hostUri, Uri nodeUri) {
    return this.meshContext.createNode(partKey, hostUri, nodeUri);
  }

  @Override
  public NodeBinding injectNode(Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    return this.meshContext.injectNode(partKey, hostUri, nodeUri, node);
  }

  @Override
  public LaneBinding createLane(Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    return this.meshContext.createLane(partKey, hostUri, nodeUri, laneDef);
  }

  @Override
  public LaneBinding createLane(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    return this.meshContext.createLane(partKey, hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneBinding injectLane(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return this.meshContext.injectLane(partKey, hostUri, nodeUri, laneUri, lane);
  }

  @Override
  public void openLanes(Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    this.meshContext.openLanes(partKey, hostUri, nodeUri, node);
  }

  @Override
  public AgentFactory<?> createAgentFactory(Value partKey, Uri hostUri, Uri nodeUri, AgentDef agentDef) {
    return this.meshContext.createAgentFactory(partKey, hostUri, nodeUri, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(Value partKey, Uri hostUri, Uri nodeUri,
                                                              Class<? extends A> agentClass) {
    return this.meshContext.createAgentFactory(partKey, hostUri, nodeUri, agentClass);
  }

  @Override
  public void openAgents(Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    this.meshContext.openAgents(partKey, hostUri, nodeUri, node);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return this.meshContext.authenticate(credentials);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.meshContext.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.meshContext.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    this.meshContext.closeDownlink(link);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.meshContext.pushDown(pushRequest);
  }

  @Override
  public void openUplink(LinkBinding link) {
    this.meshBinding.openUplink(link);
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    this.meshBinding.pushUp(pushRequest);
  }

  @Override
  public void trace(Object message) {
    this.meshContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.meshContext.debug(message);
  }

  @Override
  public void info(Object message) {
    this.meshContext.info(message);
  }

  @Override
  public void warn(Object message) {
    this.meshContext.warn(message);
  }

  @Override
  public void error(Object message) {
    this.meshContext.error(message);
  }

  @Override
  public boolean isClosed() {
    return this.meshBinding.isClosed();
  }

  @Override
  public boolean isOpened() {
    return this.meshBinding.isOpened();
  }

  @Override
  public boolean isLoaded() {
    return this.meshBinding.isLoaded();
  }

  @Override
  public boolean isStarted() {
    return this.meshBinding.isStarted();
  }

  @Override
  public void open() {
    this.meshBinding.open();
  }

  @Override
  public void load() {
    this.meshBinding.load();
  }

  @Override
  public void start() {
    this.meshBinding.start();
  }

  @Override
  public void stop() {
    this.meshBinding.stop();
  }

  @Override
  public void unload() {
    this.meshBinding.unload();
  }

  @Override
  public void close() {
    this.meshBinding.close();
  }

  @Override
  public void willOpen() {
    this.meshContext.willOpen();
  }

  @Override
  public void didOpen() {
    this.meshContext.didOpen();
  }

  @Override
  public void willLoad() {
    this.meshContext.willLoad();
  }

  @Override
  public void didLoad() {
    this.meshContext.didLoad();
  }

  @Override
  public void willStart() {
    this.meshContext.willStart();
  }

  @Override
  public void didStart() {
    this.meshContext.didStart();
  }

  @Override
  public void willStop() {
    this.meshContext.willStop();
  }

  @Override
  public void didStop() {
    this.meshContext.didStop();
  }

  @Override
  public void willUnload() {
    this.meshContext.willUnload();
  }

  @Override
  public void didUnload() {
    this.meshContext.didUnload();
  }

  @Override
  public void willClose() {
    this.meshContext.willClose();
  }

  @Override
  public void didClose() {
    this.meshBinding.didClose();
  }

  @Override
  public void didFail(Throwable error) {
    this.meshBinding.didFail(error);
  }
}
