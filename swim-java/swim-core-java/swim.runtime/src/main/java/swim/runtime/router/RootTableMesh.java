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

import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.downlink.Downlink;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.HostBinding;
import swim.runtime.HttpBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.MeshBinding;
import swim.runtime.MeshContext;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.runtime.PushRequest;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class RootTableMesh implements MeshContext {
  protected final RootTable root;

  protected final MeshBinding mesh;

  protected final Uri meshUri;

  public RootTableMesh(RootTable root, MeshBinding mesh, Uri meshUri) {
    this.root = root;
    this.mesh = mesh;
    this.meshUri = meshUri;
  }

  @Override
  public final Uri meshUri() {
    return this.meshUri;
  }

  @Override
  public Policy policy() {
    return this.root.policy();
  }

  @Override
  public Schedule schedule() {
    return this.root.schedule();
  }

  @Override
  public Stage stage() {
    return this.root.stage();
  }

  @Override
  public StoreBinding store() {
    return this.root.store();
  }

  @Override
  public PartBinding createPart(Value partKey) {
    return this.root.rootContext().createPart(this.meshUri, partKey);
  }

  @Override
  public PartBinding injectPart(Value partKey, PartBinding part) {
    return this.root.rootContext().injectPart(this.meshUri, partKey, part);
  }

  @Override
  public HostBinding createHost(Value partKey, Uri hostUri) {
    return this.root.rootContext().createHost(this.meshUri, partKey, hostUri);
  }

  @Override
  public HostBinding injectHost(Value partKey, Uri hostUri, HostBinding host) {
    return this.root.rootContext().injectHost(this.meshUri, partKey, hostUri, host);
  }

  @Override
  public NodeBinding createNode(Value partKey, Uri hostUri, Uri nodeUri) {
    return this.root.rootContext().createNode(this.meshUri, partKey, hostUri, nodeUri);
  }

  @Override
  public NodeBinding injectNode(Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    return this.root.rootContext().injectNode(this.meshUri, partKey, hostUri, nodeUri, node);
  }

  @Override
  public LaneBinding injectLane(Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return this.root.rootContext().injectLane(this.meshUri, partKey, hostUri, nodeUri, laneUri, lane);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return this.root.rootContext().authenticate(credentials);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.root.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.root.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void httpDownlink(HttpBinding http) {
    // TODO
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.root.pushDown(pushRequest);
  }

  @Override
  public void trace(Object message) {
    this.root.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.root.debug(message);
  }

  @Override
  public void info(Object message) {
    this.root.info(message);
  }

  @Override
  public void warn(Object message) {
    this.root.warn(message);
  }

  @Override
  public void error(Object message) {
    this.root.error(message);
  }

  @Override
  public void close() {
    this.root.closeMesh(this.meshUri);
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
