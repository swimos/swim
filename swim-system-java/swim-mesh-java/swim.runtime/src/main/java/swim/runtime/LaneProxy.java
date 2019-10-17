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

import swim.api.Downlink;
import swim.api.Lane;
import swim.api.agent.AgentContext;
import swim.api.auth.Identity;
import swim.api.policy.Policy;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public class LaneProxy implements LaneBinding, LaneContext {
  protected final LaneBinding laneBinding;
  protected LaneContext laneContext;

  public LaneProxy(LaneBinding laneBinding) {
    this.laneBinding = laneBinding;
  }

  @Override
  public final TierContext tierContext() {
    return this;
  }

  @Override
  public final NodeBinding node() {
    return this.laneContext.node();
  }

  @Override
  public final LaneBinding laneWrapper() {
    return this.laneBinding.laneWrapper();
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

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapLane(Class<T> laneClass) {
    if (laneClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.laneContext.unwrapLane(laneClass);
    }
  }

  @Override
  public LaneAddress cellAddress() {
    return this.laneContext.cellAddress();
  }

  @Override
  public String edgeName() {
    return this.laneContext.edgeName();
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
  public String laneType() {
    return this.laneBinding.laneType();
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
  public StoreBinding store() {
    return this.laneContext.store();
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
  public FingerTrieSeq<LinkContext> uplinks() {
    return this.laneBinding.uplinks();
  }

  @Override
  public LinkContext getUplink(Value linkKey) {
    return this.laneBinding.getUplink(linkKey);
  }

  @Override
  public void closeUplink(Value linkKey) {
    this.laneBinding.closeUplink(linkKey);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.laneContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.laneContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.laneContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public void pushUpCommand(CommandMessage message) {
    this.laneBinding.pushUpCommand(message);
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
  public void pushDown(PushRequest pushRequest) {
    this.laneContext.pushDown(pushRequest);
  }

  @Override
  public void reportDown(Metric metric) {
    this.laneContext.reportDown(metric);
  }

  @Override
  public void openUplink(LinkBinding link) {
    this.laneBinding.openUplink(link);
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
  public void fail(Object message) {
    this.laneContext.fail(message);
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
    this.laneContext.close();
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
