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

import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.client.ClientContext;
import swim.api.data.DataFactory;
import swim.api.downlink.Downlink;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.api.router.Router;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.concurrent.Theater;
import swim.io.TlsSettings;
import swim.io.http.HttpEndpoint;
import swim.io.http.HttpSettings;
import swim.math.Z2Form;
import swim.remote.RemoteHostClient;
import swim.runtime.AbstractSwimRef;
import swim.runtime.HostBinding;
import swim.runtime.HttpBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.MeshBinding;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.runtime.PushRequest;
import swim.runtime.RootBinding;
import swim.runtime.RootContext;
import swim.runtime.RouterContext;
import swim.runtime.router.MeshTable;
import swim.runtime.router.PartTable;
import swim.runtime.router.RootTable;
import swim.store.ListDataBinding;
import swim.store.MapDataBinding;
import swim.store.SpatialDataBinding;
import swim.store.ValueDataBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class ClientRuntime extends AbstractSwimRef implements ClientContext, RootContext {
  protected final Theater stage;
  protected final HttpEndpoint endpoint;
  protected final RootBinding root;
  RouterContext router;

  public ClientRuntime(Theater stage, HttpSettings settings) {
    this.stage = stage;
    this.endpoint = new HttpEndpoint(stage, settings);
    this.root = new RootTable();
    this.root.setRootContext(this);
  }

  public ClientRuntime(Theater stage) {
    this(stage, HttpSettings.standard().tlsSettings(TlsSettings.standard()));
  }

  public ClientRuntime() {
    this(new Theater());
  }

  @Override
  public final RouterContext router() {
    return this.router;
  }

  @Override
  public void setRouter(Router router) {
    if (router instanceof RouterContext) {
      this.router = (RouterContext) router;
    } else {
      throw new IllegalArgumentException(router.toString());
    }
  }

  @Override
  public void start() {
    this.stage.start();
    this.endpoint.start();
    this.root.start();
  }

  @Override
  public void stop() {
    this.endpoint.stop();
    this.stage.stop();
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

  public final HttpEndpoint endpoint() {
    return this.endpoint;
  }

  @Override
  public DataFactory data() {
    return null; // TODO
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
  public LaneBinding injectLane(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return lane;
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return null; // TODO
  }

  @Override
  public ListDataBinding openListData(Value name) {
    throw new UnsupportedOperationException();
  }

  @Override
  public ListDataBinding injectListData(ListDataBinding dataBinding) {
    return dataBinding;
  }

  @Override
  public MapDataBinding openMapData(Value name) {
    throw new UnsupportedOperationException();
  }

  @Override
  public MapDataBinding injectMapData(MapDataBinding dataBinding) {
    return dataBinding;
  }

  @Override
  public <S> SpatialDataBinding<S> openSpatialData(Value name, Z2Form<S> shapeForm) {
    throw new UnsupportedOperationException();
  }

  @Override
  public <S> SpatialDataBinding<S> injectSpatialData(SpatialDataBinding<S> dataBinding) {
    return dataBinding;
  }

  @Override
  public ValueDataBinding openValueData(Value name) {
    throw new UnsupportedOperationException();
  }

  @Override
  public ValueDataBinding injectValueData(ValueDataBinding dataBinding) {
    return dataBinding;
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
    this.root.httpDownlink(http);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.root.pushDown(pushRequest);
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
