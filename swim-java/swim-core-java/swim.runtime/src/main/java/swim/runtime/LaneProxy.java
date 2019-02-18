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
import swim.api.agent.AgentContext;
import swim.api.auth.Identity;
import swim.api.data.DataFactory;
import swim.api.downlink.Downlink;
import swim.api.lane.Lane;
import swim.api.policy.Policy;
import swim.collections.FingerTrieSeq;
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
import swim.warp.CommandMessage;

public class LaneProxy implements LaneBinding, LaneContext {
  protected final LaneBinding laneBinding;
  protected LaneContext laneContext;

  public LaneProxy(LaneBinding laneBinding) {
    this.laneBinding = laneBinding;
  }

  public final LaneBinding laneBinding() {
    return this.laneBinding;
  }

  @Override
  public final LaneContext laneContext() {
    return this.laneContext;
  }

  @Override
  public void setLaneContext(LaneContext laneContext) {
    this.laneContext = laneContext;
    this.laneBinding.setLaneContext(this);
  }

  @Override
  public final TierContext tierContext() {
    return this;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapLane(Class<T> laneClass) {
    if (laneClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.laneBinding.unwrapLane(laneClass);
    }
  }

  @Override
  public Uri meshUri() {
    return this.laneContext.meshUri();
  }

  @Override
  public Value partKey() {
    return this.laneContext.partKey();
  }

  @Override
  public Uri hostUri() {
    return this.laneContext.hostUri();
  }

  @Override
  public Uri nodeUri() {
    return this.laneContext.nodeUri();
  }

  @Override
  public Uri laneUri() {
    return this.laneContext.laneUri();
  }

  @Override
  public Value agentKey() {
    return this.laneContext.agentKey();
  }

  @Override
  public Identity identity() {
    return this.laneContext.identity();
  }

  @Override
  public Policy policy() {
    return this.laneContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.laneContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.laneContext.stage();
  }

  @Override
  public DataFactory data() {
    return this.laneContext.data();
  }

  @Override
  public Lane getLaneView(AgentContext agentContext) {
    return this.laneBinding.getLaneView(agentContext);
  }

  @Override
  public void openLaneView(Lane lane) {
    this.laneBinding.openLaneView(lane);
  }

  @Override
  public void closeLaneView(Lane lane) {
    this.laneBinding.closeLaneView(lane);
  }

  @Override
  public FingerTrieSeq<LinkContext> getUplinks() {
    return this.laneBinding.getUplinks();
  }

  @Override
  public LinkBinding getUplink(Value linkKey) {
    return this.laneBinding.getUplink(linkKey);
  }

  @Override
  public void closeUplink(Value linkKey) {
    this.laneBinding.closeUplink(linkKey);
  }

  @Override
  public void pushUpCommand(CommandMessage message) {
    this.laneBinding.pushUpCommand(message);
  }

  @Override
  public Iterator<DataBinding> dataBindings() {
    return this.laneBinding.dataBindings();
  }

  @Override
  public void closeData(Value name) {
    this.laneBinding.closeData(name);
  }

  @Override
  public ListDataBinding openListData(Value name) {
    return this.laneContext.openListData(name);
  }

  @Override
  public ListDataBinding injectListData(ListDataBinding dataBinding) {
    return this.laneContext.injectListData(dataBinding);
  }

  @Override
  public MapDataBinding openMapData(Value name) {
    return this.laneContext.openMapData(name);
  }

  @Override
  public MapDataBinding injectMapData(MapDataBinding dataBinding) {
    return this.laneContext.injectMapData(dataBinding);
  }

  @Override
  public <S> SpatialDataBinding<S> openSpatialData(Value name, Z2Form<S> shapeForm) {
    return this.laneContext.openSpatialData(name, shapeForm);
  }

  @Override
  public <S> SpatialDataBinding<S> injectSpatialData(SpatialDataBinding<S> dataBinding) {
    return this.laneContext.injectSpatialData(dataBinding);
  }

  @Override
  public ValueDataBinding openValueData(Value name) {
    return this.laneContext.openValueData(name);
  }

  @Override
  public ValueDataBinding injectValueData(ValueDataBinding dataBinding) {
    return this.laneContext.injectValueData(dataBinding);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.laneContext.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.laneContext.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    this.laneContext.closeDownlink(link);
  }

  @Override
  public void httpDownlink(HttpBinding http) {
    this.laneContext.httpDownlink(http);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.laneContext.pushDown(pushRequest);
  }

  @Override
  public void openUplink(LinkBinding link) {
    this.laneBinding.openUplink(link);
  }

  @Override
  public void httpUplink(HttpBinding http) {
    this.laneBinding.httpUplink(http);
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    this.laneBinding.pushUp(pushRequest);
  }

  @Override
  public void trace(Object message) {
    this.laneContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.laneContext.debug(message);
  }

  @Override
  public void info(Object message) {
    this.laneContext.info(message);
  }

  @Override
  public void warn(Object message) {
    this.laneContext.warn(message);
  }

  @Override
  public void error(Object message) {
    this.laneContext.error(message);
  }

  @Override
  public boolean isClosed() {
    return this.laneBinding.isClosed();
  }

  @Override
  public boolean isOpened() {
    return this.laneBinding.isOpened();
  }

  @Override
  public boolean isLoaded() {
    return this.laneBinding.isLoaded();
  }

  @Override
  public boolean isStarted() {
    return this.laneBinding.isStarted();
  }

  @Override
  public void open() {
    this.laneBinding.open();
  }

  @Override
  public void load() {
    this.laneBinding.load();
  }

  @Override
  public void start() {
    this.laneBinding.start();
  }

  @Override
  public void stop() {
    this.laneBinding.stop();
  }

  @Override
  public void unload() {
    this.laneBinding.unload();
  }

  @Override
  public void close() {
    this.laneBinding.close();
  }

  @Override
  public void willOpen() {
    this.laneContext.willOpen();
  }

  @Override
  public void didOpen() {
    this.laneContext.didOpen();
  }

  @Override
  public void willLoad() {
    this.laneContext.willLoad();
  }

  @Override
  public void didLoad() {
    this.laneContext.didLoad();
  }

  @Override
  public void willStart() {
    this.laneContext.willStart();
  }

  @Override
  public void didStart() {
    this.laneContext.didStart();
  }

  @Override
  public void willStop() {
    this.laneContext.willStop();
  }

  @Override
  public void didStop() {
    this.laneContext.didStop();
  }

  @Override
  public void willUnload() {
    this.laneContext.willUnload();
  }

  @Override
  public void didUnload() {
    this.laneContext.didUnload();
  }

  @Override
  public void willClose() {
    this.laneContext.willClose();
  }

  @Override
  public void didClose() {
    this.laneBinding.didClose();
  }

  @Override
  public void didFail(Throwable error) {
    this.laneBinding.didFail(error);
  }
}
