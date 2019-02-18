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

public class PartProxy implements PartBinding, PartContext {
  protected final PartBinding partBinding;
  protected PartContext partContext;

  public PartProxy(PartBinding partBinding) {
    this.partBinding = partBinding;
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
      return this.partBinding.unwrapPart(partClass);
    }
  }

  @Override
  public final TierContext tierContext() {
    return this;
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
  public DataFactory data() {
    return this.partContext.data();
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
  public HostBinding getMaster() {
    return this.partBinding.getMaster();
  }

  @Override
  public void setMaster(HostBinding master) {
    this.partBinding.setMaster(master);
  }

  @Override
  public HashTrieMap<Uri, HostBinding> getHosts() {
    return this.partBinding.getHosts();
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
  public HostBinding createHost(Uri hostUri) {
    return this.partContext.createHost(hostUri);
  }

  @Override
  public HostBinding injectHost(Uri hostUri, HostBinding host) {
    return this.partContext.injectHost(hostUri, host);
  }

  @Override
  public NodeBinding createNode(Uri hostUri, Uri nodeUri) {
    return this.partContext.createNode(hostUri, nodeUri);
  }

  @Override
  public NodeBinding injectNode(Uri hostUri, Uri nodeUri, NodeBinding node) {
    return this.partContext.injectNode(hostUri, nodeUri, node);
  }

  @Override
  public LaneBinding injectLane(Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return this.partContext.injectLane(hostUri, nodeUri, laneUri, lane);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return this.partContext.authenticate(credentials);
  }

  @Override
  public Iterator<DataBinding> dataBindings() {
    return this.partBinding.dataBindings();
  }

  @Override
  public void closeData(Value name) {
    this.partBinding.closeData(name);
  }

  @Override
  public ListDataBinding openListData(Value name) {
    return this.partContext.openListData(name);
  }

  @Override
  public ListDataBinding injectListData(ListDataBinding dataBinding) {
    return this.partContext.injectListData(dataBinding);
  }

  @Override
  public MapDataBinding openMapData(Value name) {
    return this.partContext.openMapData(name);
  }

  @Override
  public MapDataBinding injectMapData(MapDataBinding dataBinding) {
    return this.partContext.injectMapData(dataBinding);
  }

  @Override
  public <S> SpatialDataBinding<S> openSpatialData(Value name, Z2Form<S> shapeForm) {
    return this.partContext.openSpatialData(name, shapeForm);
  }

  @Override
  public <S> SpatialDataBinding<S> injectSpatialData(SpatialDataBinding<S> dataBinding) {
    return this.partContext.injectSpatialData(dataBinding);
  }

  @Override
  public ValueDataBinding openValueData(Value name) {
    return this.partContext.openValueData(name);
  }

  @Override
  public ValueDataBinding injectValueData(ValueDataBinding dataBinding) {
    return this.partContext.injectValueData(dataBinding);
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
  public void httpDownlink(HttpBinding http) {
    this.partContext.httpDownlink(http);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.partContext.pushDown(pushRequest);
  }

  @Override
  public void openUplink(LinkBinding link) {
    this.partBinding.openUplink(link);
  }

  @Override
  public void httpUplink(HttpBinding http) {
    this.partBinding.httpUplink(http);
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
    this.partBinding.close();
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
