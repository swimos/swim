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
import swim.structure.Value;
import swim.uri.Uri;

public class PartProxy implements PartBinding, PartContext {
  protected final PartBinding partBinding;
  protected PartContext partContext;

  public PartProxy(PartBinding partBinding) {
    this.partBinding = partBinding;
  }

  @Override
  public final TierContext tierContext() {
    return this;
  }

  @Override
  public final MeshBinding mesh() {
    return this.partContext.mesh();
  }

  @Override
  public final PartBinding partWrapper() {
    return this.partBinding.partWrapper();
  }

  public final PartBinding partBinding() {
    return this.partBinding;
  }

  @Override
  public final PartContext partContext() {
    return this.partContext;
  }

  @Override
  public void setPartContext(PartContext partContext) {
    this.partContext = partContext;
    this.partBinding.setPartContext(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapPart(Class<T> partClass) {
    if (partClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.partContext.unwrapPart(partClass);
    }
  }

  @Override
  public PartAddress cellAddress() {
    return this.partContext.cellAddress();
  }

  @Override
  public String edgeName() {
    return this.partContext.edgeName();
  }

  @Override
  public Uri meshUri() {
    return this.partContext.meshUri();
  }

  @Override
  public Policy policy() {
    return this.partContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.partContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.partContext.stage();
  }

  @Override
  public StoreBinding store() {
    return this.partContext.store();
  }

  @Override
  public Value partKey() {
    return this.partContext.partKey();
  }

  @Override
  public PartPredicate predicate() {
    return this.partBinding.predicate();
  }

  @Override
  public void openMetaPart(PartBinding part, NodeBinding metaPart) {
    this.partContext.openMetaPart(part, metaPart);
  }

  @Override
  public HostBinding master() {
    return this.partBinding.master();
  }

  @Override
  public void setMaster(HostBinding master) {
    this.partBinding.setMaster(master);
  }

  @Override
  public HashTrieMap<Uri, HostBinding> hosts() {
    return this.partBinding.hosts();
  }

  @Override
  public HostBinding getHost(Uri hostUri) {
    return this.partBinding.getHost(hostUri);
  }

  @Override
  public HostBinding openHost(Uri hostUri) {
    return this.partBinding.openHost(hostUri);
  }

  @Override
  public HostBinding openHost(Uri hostUri, HostBinding host) {
    return this.partBinding.openHost(hostUri, host);
  }

  @Override
  public void hostDidConnect(Uri hostUri) {
    this.partContext.hostDidConnect(hostUri);
  }

  @Override
  public void hostDidDisconnect(Uri hostUri) {
    this.partContext.hostDidDisconnect(hostUri);
  }

  @Override
  public void reopenUplinks() {
    this.partBinding.reopenUplinks();
  }

  @Override
  public HostBinding createHost(HostAddress hostAddress) {
    return this.partContext.createHost(hostAddress);
  }

  @Override
  public HostBinding injectHost(HostAddress hostAddress, HostBinding host) {
    return this.partContext.injectHost(hostAddress, host);
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    this.partContext.openMetaHost(host, metaHost);
  }

  @Override
  public NodeBinding createNode(NodeAddress nodeAddress) {
    return this.partContext.createNode(nodeAddress);
  }

  @Override
  public NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node) {
    return this.partContext.injectNode(nodeAddress, node);
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.partContext.openMetaNode(node, metaNode);
  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    return this.partContext.createLane(laneAddress);
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    return this.partContext.injectLane(laneAddress, lane);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.partContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.partContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.partContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return this.partContext.createLane(node, laneDef);
  }

  @Override
  public void openLanes(NodeBinding node) {
    this.partContext.openLanes(node);
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return this.partContext.createAgentFactory(node, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return this.partContext.createAgentFactory(node, agentClass);
  }

  @Override
  public void openAgents(NodeBinding node) {
    this.partContext.openAgents(node);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return this.partContext.authenticate(credentials);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.partContext.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.partContext.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    this.partContext.closeDownlink(link);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.partContext.pushDown(pushRequest);
  }

  @Override
  public void reportDown(Metric metric) {
    this.partContext.reportDown(metric);
  }

  @Override
  public void openUplink(LinkBinding link) {
    this.partBinding.openUplink(link);
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    this.partBinding.pushUp(pushRequest);
  }

  @Override
  public void trace(Object message) {
    this.partContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.partContext.debug(message);
  }

  @Override
  public void info(Object message) {
    this.partContext.info(message);
  }

  @Override
  public void warn(Object message) {
    this.partContext.warn(message);
  }

  @Override
  public void error(Object message) {
    this.partContext.error(message);
  }

  @Override
  public void fail(Object message) {
    this.partContext.fail(message);
  }

  @Override
  public boolean isClosed() {
    return this.partBinding.isClosed();
  }

  @Override
  public boolean isOpened() {
    return this.partBinding.isOpened();
  }

  @Override
  public boolean isLoaded() {
    return this.partBinding.isLoaded();
  }

  @Override
  public boolean isStarted() {
    return this.partBinding.isStarted();
  }

  @Override
  public void open() {
    this.partBinding.open();
  }

  @Override
  public void load() {
    this.partBinding.load();
  }

  @Override
  public void start() {
    this.partBinding.start();
  }

  @Override
  public void stop() {
    this.partBinding.stop();
  }

  @Override
  public void unload() {
    this.partBinding.unload();
  }

  @Override
  public void close() {
    this.partContext.close();
  }

  @Override
  public void willOpen() {
    this.partContext.willOpen();
  }

  @Override
  public void didOpen() {
    this.partContext.didOpen();
  }

  @Override
  public void willLoad() {
    this.partContext.willLoad();
  }

  @Override
  public void didLoad() {
    this.partContext.didLoad();
  }

  @Override
  public void willStart() {
    this.partContext.willStart();
  }

  @Override
  public void didStart() {
    this.partContext.didStart();
  }

  @Override
  public void willStop() {
    this.partContext.willStop();
  }

  @Override
  public void didStop() {
    this.partContext.didStop();
  }

  @Override
  public void willUnload() {
    this.partContext.willUnload();
  }

  @Override
  public void didUnload() {
    this.partContext.didUnload();
  }

  @Override
  public void willClose() {
    this.partContext.willClose();
  }

  @Override
  public void didClose() {
    this.partBinding.didClose();
  }

  @Override
  public void didFail(Throwable error) {
    this.partBinding.didFail(error);
  }
}
