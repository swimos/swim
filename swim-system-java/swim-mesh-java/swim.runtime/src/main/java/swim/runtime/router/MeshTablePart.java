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

package swim.runtime.router;

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
import swim.runtime.HostBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LinkBinding;
import swim.runtime.MeshBinding;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.runtime.PartContext;
import swim.runtime.PushRequest;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class MeshTablePart implements PartContext {
  protected final MeshTable mesh;

  protected final PartBinding part;

  protected final Value partKey;

  public MeshTablePart(MeshTable mesh, PartBinding part, Value partKey) {
    this.mesh = mesh;
    this.part = part;
    this.partKey = partKey.commit();
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
    if (partClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public final Uri meshUri() {
    return this.mesh.meshUri();
  }

  @Override
  public final Value partKey() {
    return this.partKey;
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
  public HostBinding createHost(Uri hostUri) {
    return this.mesh.meshContext().createHost(this.partKey, hostUri);
  }

  @Override
  public HostBinding injectHost(Uri hostUri, HostBinding host) {
    return this.mesh.meshContext().injectHost(this.partKey, hostUri, host);
  }

  @Override
  public NodeBinding createNode(Uri hostUri, Uri nodeUri) {
    return this.mesh.meshContext().createNode(this.partKey, hostUri, nodeUri);
  }

  @Override
  public NodeBinding injectNode(Uri hostUri, Uri nodeUri, NodeBinding node) {
    return this.mesh.meshContext().injectNode(this.partKey, hostUri, nodeUri, node);
  }

  @Override
  public LaneBinding createLane(Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    return this.mesh.meshContext().createLane(this.partKey, hostUri, nodeUri, laneDef);
  }

  @Override
  public LaneBinding createLane(Uri hostUri, Uri nodeUri, Uri laneUri) {
    return this.mesh.meshContext().createLane(this.partKey, hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneBinding injectLane(Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return this.mesh.meshContext().injectLane(this.partKey, hostUri, nodeUri, laneUri, lane);
  }

  @Override
  public void openLanes(Uri hostUri, Uri nodeUri, NodeBinding node) {
    this.mesh.meshContext().openLanes(this.partKey, hostUri, nodeUri, node);
  }

  @Override
  public AgentFactory<?> createAgentFactory(Uri hostUri, Uri nodeUri, AgentDef agentDef) {
    return this.mesh.meshContext().createAgentFactory(this.partKey, hostUri, nodeUri, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(Uri hostUri, Uri nodeUri,
                                                              Class<? extends A> agentClass) {
    return this.mesh.meshContext().createAgentFactory(this.partKey, hostUri, nodeUri, agentClass);
  }

  @Override
  public void openAgents(Uri hostUri, Uri nodeUri, NodeBinding node) {
    this.mesh.meshContext().openAgents(this.partKey, hostUri, nodeUri, node);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return this.mesh.meshContext().authenticate(credentials);
  }

  @Override
  public void hostDidConnect(Uri hostUri) {
    // nop
  }

  @Override
  public void hostDidDisconnect(Uri hostUri) {
    // nop
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
  public void pushDown(PushRequest pushRequest) {
    this.mesh.pushDown(pushRequest);
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
  public void close() {
    this.mesh.closePart(this.partKey);
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
