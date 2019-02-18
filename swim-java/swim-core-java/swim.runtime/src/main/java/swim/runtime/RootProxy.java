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

import java.util.Iterator;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.data.DataFactory;
import swim.api.downlink.Downlink;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.collections.HashTrieMap;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.math.Z2Form;
import swim.store.DataBinding;
import swim.store.ListDataBinding;
import swim.store.MapDataBinding;
import swim.store.SpatialDataBinding;
import swim.store.ValueDataBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class RootProxy implements RootBinding, RootContext {
  protected final RootBinding rootBinding;
  protected RootContext rootContext;

  public RootProxy(RootBinding rootBinding) {
    this.rootBinding = rootBinding;
  }

  public final RootBinding rootBinding() {
    return this.rootBinding;
  }

  @Override
  public final RootContext rootContext() {
    return this.rootContext;
  }

  @Override
  public void setRootContext(RootContext rootContext) {
    this.rootContext = rootContext;
    this.rootBinding.setRootContext(this);
  }

  @Override
  public final TierContext tierContext() {
    return this;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapRoot(Class<T> rootClass) {
    if (rootClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.rootBinding.unwrapRoot(rootClass);
    }
  }

  @Override
  public Uri meshUri() {
    return this.rootContext.meshUri();
  }

  @Override
  public Policy policy() {
    return this.rootContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.rootContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.rootContext.stage();
  }

  @Override
  public DataFactory data() {
    return this.rootContext.data();
  }

  @Override
  public MeshBinding getNetwork() {
    return this.rootBinding.getNetwork();
  }

  @Override
  public void setNetwork(MeshBinding network) {
    this.rootBinding.setNetwork(network);
  }

  @Override
  public HashTrieMap<Uri, MeshBinding> getMeshes() {
    return this.rootBinding.getMeshes();
  }

  @Override
  public MeshBinding getMesh(Uri meshUri) {
    return this.rootBinding.getMesh(meshUri);
  }

  @Override
  public MeshBinding openMesh(Uri meshUri) {
    return this.rootBinding.openMesh(meshUri);
  }

  @Override
  public MeshBinding openMesh(Uri meshUri, MeshBinding mesh) {
    return this.rootBinding.openMesh(meshUri, mesh);
  }

  @Override
  public MeshBinding createMesh(Uri meshUri) {
    return this.rootContext.createMesh(meshUri);
  }

  @Override
  public MeshBinding injectMesh(Uri meshUri, MeshBinding mesh) {
    return this.rootContext.injectMesh(meshUri, mesh);
  }

  @Override
  public PartBinding createPart(Uri meshUri, Value partKey) {
    return this.rootContext.createPart(meshUri, partKey);
  }

  @Override
  public PartBinding injectPart(Uri meshUri, Value partKey, PartBinding part) {
    return this.rootContext.injectPart(meshUri, partKey, part);
  }

  @Override
  public HostBinding createHost(Uri meshUri, Value partKey, Uri hostUri) {
    return this.rootContext.createHost(meshUri, partKey, hostUri);
  }

  @Override
  public HostBinding injectHost(Uri meshUri, Value partKey, Uri hostUri, HostBinding host) {
    return this.rootContext.injectHost(meshUri, partKey, hostUri, host);
  }

  @Override
  public NodeBinding createNode(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    return this.rootContext.createNode(meshUri, partKey, hostUri, nodeUri);
  }

  @Override
  public NodeBinding injectNode(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    return this.rootContext.injectNode(meshUri, partKey, hostUri, nodeUri, node);
  }

  @Override
  public LaneBinding injectLane(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return this.rootContext.injectLane(meshUri, partKey, hostUri, nodeUri, laneUri, lane);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return this.rootContext.authenticate(credentials);
  }

  @Override
  public Iterator<DataBinding> dataBindings() {
    return this.rootBinding.dataBindings();
  }

  @Override
  public void closeData(Value name) {
    this.rootBinding.closeData(name);
  }

  @Override
  public ListDataBinding openListData(Value name) {
    return this.rootContext.openListData(name);
  }

  @Override
  public ListDataBinding injectListData(ListDataBinding dataBinding) {
    return this.rootContext.injectListData(dataBinding);
  }

  @Override
  public MapDataBinding openMapData(Value name) {
    return this.rootContext.openMapData(name);
  }

  @Override
  public MapDataBinding injectMapData(MapDataBinding dataBinding) {
    return this.rootContext.injectMapData(dataBinding);
  }

  @Override
  public <S> SpatialDataBinding<S> openSpatialData(Value name, Z2Form<S> shapeForm) {
    return this.rootContext.openSpatialData(name, shapeForm);
  }

  @Override
  public <S> SpatialDataBinding<S> injectSpatialData(SpatialDataBinding<S> dataBinding) {
    return this.rootContext.injectSpatialData(dataBinding);
  }

  @Override
  public ValueDataBinding openValueData(Value name) {
    return this.rootContext.openValueData(name);
  }

  @Override
  public ValueDataBinding injectValueData(ValueDataBinding dataBinding) {
    return this.rootContext.injectValueData(dataBinding);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.rootBinding.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.rootBinding.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    this.rootBinding.closeDownlink(link);
  }

  @Override
  public void httpDownlink(HttpBinding http) {
    this.rootBinding.httpDownlink(http);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.rootBinding.pushDown(pushRequest);
  }

  @Override
  public void openUplink(LinkBinding link) {
    this.rootBinding.openUplink(link);
  }

  @Override
  public void httpUplink(HttpBinding http) {
    this.rootBinding.httpUplink(http);
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    this.rootBinding.pushUp(pushRequest);
  }

  @Override
  public void trace(Object message) {
    this.rootContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.rootContext.debug(message);
  }

  @Override
  public void info(Object message) {
    this.rootContext.info(message);
  }

  @Override
  public void warn(Object message) {
    this.rootContext.warn(message);
  }

  @Override
  public void error(Object message) {
    this.rootContext.error(message);
  }

  @Override
  public boolean isClosed() {
    return this.rootBinding.isClosed();
  }

  @Override
  public boolean isOpened() {
    return this.rootBinding.isOpened();
  }

  @Override
  public boolean isLoaded() {
    return this.rootBinding.isLoaded();
  }

  @Override
  public boolean isStarted() {
    return this.rootBinding.isStarted();
  }

  @Override
  public void open() {
    this.rootBinding.open();
  }

  @Override
  public void load() {
    this.rootBinding.load();
  }

  @Override
  public void start() {
    this.rootBinding.start();
  }

  @Override
  public void stop() {
    this.rootBinding.stop();
  }

  @Override
  public void unload() {
    this.rootBinding.unload();
  }

  @Override
  public void close() {
    this.rootBinding.close();
  }

  @Override
  public void willOpen() {
    this.rootContext.willOpen();
  }

  @Override
  public void didOpen() {
    this.rootContext.didOpen();
  }

  @Override
  public void willLoad() {
    this.rootContext.willLoad();
  }

  @Override
  public void didLoad() {
    this.rootContext.didLoad();
  }

  @Override
  public void willStart() {
    this.rootContext.willStart();
  }

  @Override
  public void didStart() {
    this.rootContext.didStart();
  }

  @Override
  public void willStop() {
    this.rootContext.willStop();
  }

  @Override
  public void didStop() {
    this.rootContext.didStop();
  }

  @Override
  public void willUnload() {
    this.rootContext.willUnload();
  }

  @Override
  public void didUnload() {
    this.rootContext.didUnload();
  }

  @Override
  public void willClose() {
    this.rootContext.willClose();
  }

  @Override
  public void didClose() {
    this.rootBinding.didClose();
  }

  @Override
  public void didFail(Throwable error) {
    this.rootBinding.didFail(error);
  }
}
