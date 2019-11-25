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
import swim.runtime.HostAddress;
import swim.runtime.HostBinding;
import swim.runtime.HostContext;
import swim.runtime.LaneAddress;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LinkBinding;
import swim.runtime.NodeAddress;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.runtime.Push;
import swim.store.StoreBinding;
import swim.structure.Value;
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
    if (hostClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public HostAddress cellAddress() {
    return new HostAddress(edgeName(), meshUri(), partKey(), hostUri());
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
    return hostUri;
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
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
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return null;
  }

  @Override
  public void openLanes(NodeBinding node) {
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
  }

  @Override
  public void closeDownlink(LinkBinding link) {
  }

  @Override
  public void pushDown(Push<?> push) {
  }

  @Override
  public void didConnect() {
  }

  @Override
  public void didDisconnect() {
  }

  @Override
  public void close() {
  }

  @Override
  public void willOpen() {
  }

  @Override
  public void didOpen() {
  }

  @Override
  public void willLoad() {
  }

  @Override
  public void didLoad() {
  }

  @Override
  public void willStart() {
  }

  @Override
  public void didStart() {
  }

  @Override
  public void willStop() {
  }

  @Override
  public void didStop() {
  }

  @Override
  public void willUnload() {
  }

  @Override
  public void didUnload() {
  }

  @Override
  public void willClose() {
  }
}
