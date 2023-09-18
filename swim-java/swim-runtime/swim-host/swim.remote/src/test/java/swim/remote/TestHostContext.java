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

package swim.remote;

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
import swim.system.HostContext;
import swim.system.LaneAddress;
import swim.system.LaneBinding;
import swim.system.LaneDef;
import swim.system.LinkBinding;
import swim.system.NodeAddress;
import swim.system.NodeBinding;
import swim.system.PartBinding;
import swim.system.Push;
import swim.uri.Uri;

public class TestHostContext extends TestCellContext implements HostContext {

  protected final Uri hostUri;

  public TestHostContext(Uri hostUri, Policy policy, Schedule schedule, Stage stage, StoreBinding store) {
    super(policy, schedule, stage, store);
    this.hostUri = hostUri;
  }

  public TestHostContext(Uri hostUri, Stage stage) {
    this(hostUri, null, stage, stage, null);
  }

  public TestHostContext(Uri hostUri) {
    this(hostUri, null, null, null, null);
  }

  @Override
  public PartBinding part() {
    return null;
  }

  @Override
  public HostBinding hostWrapper() {
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapHost(Class<T> hostClass) {
    if (hostClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomHost(Class<T> hostClass) {
    if (hostClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public HostAddress cellAddress() {
    return new HostAddress(this.edgeName(), this.meshUri(), this.partKey(), this.hostUri());
  }

  @Override
  public Uri meshUri() {
    return Uri.empty();
  }

  @Override
  public Value partKey() {
    return Value.absent();
  }

  @Override
  public Uri hostUri() {
    return this.hostUri;
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    // hook
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
    // hook
  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    return null;
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    return lane;
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    // hook
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    // hook
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return null;
  }

  @Override
  public void openLanes(NodeBinding node) {
    // hook
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
    // hook
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return null;
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return null;
  }

  @Override
  public void openDownlink(LinkBinding link) {
    // hook
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // hook
  }

  @Override
  public void pushDown(Push<?> push) {
    // hook
  }

  @Override
  public void didConnect() {
    // hook
  }

  @Override
  public void didDisconnect() {
    // hook
  }

  @Override
  public void close() {
    // hook
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
