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
import swim.runtime.EdgeBinding;
import swim.runtime.HostBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LinkBinding;
import swim.runtime.MeshBinding;
import swim.runtime.MeshContext;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.runtime.PushRequest;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class EdgeTableMesh implements MeshContext {
  protected final EdgeTable edge;

  protected final MeshBinding mesh;

  protected final Uri meshUri;

  public EdgeTableMesh(EdgeTable edge, MeshBinding mesh, Uri meshUri) {
    this.edge = edge;
    this.mesh = mesh;
    this.meshUri = meshUri;
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
    if (meshClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public final Uri meshUri() {
    return this.meshUri;
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
  public PartBinding createPart(Value partKey) {
    return this.edge.edgeContext().createPart(this.meshUri, partKey);
  }

  @Override
  public PartBinding injectPart(Value partKey, PartBinding part) {
    return this.edge.edgeContext().injectPart(this.meshUri, partKey, part);
  }

  @Override
  public HostBinding createHost(Value partKey, Uri hostUri) {
    return this.edge.edgeContext().createHost(this.meshUri, partKey, hostUri);
  }

  @Override
  public HostBinding injectHost(Value partKey, Uri hostUri, HostBinding host) {
    return this.edge.edgeContext().injectHost(this.meshUri, partKey, hostUri, host);
  }

  @Override
  public NodeBinding createNode(Value partKey, Uri hostUri, Uri nodeUri) {
    return this.edge.edgeContext().createNode(this.meshUri, partKey, hostUri, nodeUri);
  }

  @Override
  public NodeBinding injectNode(Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    return this.edge.edgeContext().injectNode(this.meshUri, partKey, hostUri, nodeUri, node);
  }

  @Override
  public LaneBinding createLane(Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    return this.edge.edgeContext().createLane(this.meshUri, partKey, hostUri, nodeUri, laneDef);
  }

  @Override
  public LaneBinding createLane(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    return this.edge.edgeContext().createLane(this.meshUri, partKey, hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneBinding injectLane(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return this.edge.edgeContext().injectLane(this.meshUri, partKey, hostUri, nodeUri, laneUri, lane);
  }

  @Override
  public void openLanes(Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    this.edge.edgeContext().openLanes(this.meshUri, partKey, hostUri, nodeUri, node);
  }

  @Override
  public AgentFactory<?> createAgentFactory(Value partKey, Uri hostUri, Uri nodeUri, AgentDef agentDef) {
    return this.edge.edgeContext().createAgentFactory(this.meshUri, partKey, hostUri, nodeUri, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(Value partKey, Uri hostUri, Uri nodeUri,
                                                              Class<? extends A> agentClass) {
    return this.edge.edgeContext().createAgentFactory(this.meshUri, partKey, hostUri, nodeUri, agentClass);
  }

  @Override
  public void openAgents(Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    this.edge.edgeContext().openAgents(this.meshUri, partKey, hostUri, nodeUri, node);
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
  public void pushDown(PushRequest pushRequest) {
    this.edge.pushDown(pushRequest);
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
  public void close() {
    this.edge.closeMesh(this.meshUri);
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
