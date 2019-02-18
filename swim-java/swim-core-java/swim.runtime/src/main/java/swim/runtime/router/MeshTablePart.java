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
import swim.api.data.DataFactory;
import swim.api.downlink.Downlink;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.math.Z2Form;
import swim.runtime.HostBinding;
import swim.runtime.HttpBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.runtime.PartContext;
import swim.runtime.PushRequest;
import swim.store.ListDataBinding;
import swim.store.MapDataBinding;
import swim.store.SpatialDataBinding;
import swim.store.ValueDataBinding;
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
  public DataFactory data() {
    return this.mesh.data();
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
  public LaneBinding injectLane(Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return this.mesh.meshContext().injectLane(this.partKey, hostUri, nodeUri, laneUri, lane);
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
  public ListDataBinding openListData(Value name) {
    return this.mesh.openListData(name);
  }

  @Override
  public ListDataBinding injectListData(ListDataBinding dataBinding) {
    return this.mesh.injectListData(dataBinding);
  }

  @Override
  public MapDataBinding openMapData(Value name) {
    return this.mesh.openMapData(name);
  }

  @Override
  public MapDataBinding injectMapData(MapDataBinding dataBinding) {
    return this.mesh.injectMapData(dataBinding);
  }

  @Override
  public <S> SpatialDataBinding<S> openSpatialData(Value name, Z2Form<S> shapeForm) {
    return this.mesh.openSpatialData(name, shapeForm);
  }

  @Override
  public <S> SpatialDataBinding<S> injectSpatialData(SpatialDataBinding<S> dataBinding) {
    return this.mesh.injectSpatialData(dataBinding);
  }

  @Override
  public ValueDataBinding openValueData(Value name) {
    return this.mesh.openValueData(name);
  }

  @Override
  public ValueDataBinding injectValueData(ValueDataBinding dataBinding) {
    return this.mesh.injectValueData(dataBinding);
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
  public void httpDownlink(HttpBinding http) {
    // TODO
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
