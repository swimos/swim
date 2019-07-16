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

package swim.agent;

import swim.api.auth.Identity;
import swim.api.downlink.Downlink;
import swim.api.policy.Policy;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.HttpBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LaneContext;
import swim.runtime.LinkBinding;
import swim.runtime.NodeBinding;
import swim.runtime.PushRequest;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class AgentLane implements LaneContext {
  protected final AgentNode node;

  protected final LaneBinding lane;

  protected final Uri laneUri;

  public AgentLane(AgentNode node, LaneBinding lane, Uri laneUri) {
    this.node = node;
    this.lane = lane;
    this.laneUri = laneUri;
  }

  @Override
  public final NodeBinding node() {
    return this.node;
  }

  @Override
  public final LaneBinding laneWrapper() {
    return this.lane.laneWrapper();
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapLane(Class<T> laneClass) {
    if (laneClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public final Uri meshUri() {
    return this.node.meshUri();
  }

  @Override
  public final Value partKey() {
    return this.node.partKey();
  }

  @Override
  public final Uri hostUri() {
    return this.node.hostUri();
  }

  @Override
  public final Uri nodeUri() {
    return this.node.nodeUri();
  }

  @Override
  public final Uri laneUri() {
    return this.laneUri;
  }

  @Override
  public final Identity identity() {
    return this.node.nodeContext().identity();
  }

  @Override
  public Policy policy() {
    return this.node.policy();
  }

  @Override
  public Schedule schedule() {
    return this.node;
  }

  @Override
  public Stage stage() {
    return this.node;
  }

  @Override
  public StoreBinding store() {
    return this.node.store();
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.node.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.node.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void httpDownlink(HttpBinding http) {
    this.node.httpDownlink(http);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.node.pushDown(pushRequest);
  }

  @Override
  public void trace(Object message) {
    this.node.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.node.debug(message);
  }

  @Override
  public void info(Object message) {
    this.node.info(message);
  }

  @Override
  public void warn(Object message) {
    this.node.warn(message);
  }

  @Override
  public void error(Object message) {
    this.node.error(message);
  }

  @Override
  public void close() {
    this.node.closeLane(this.laneUri);
  }

  @Override
  public void willOpen() {
    this.lane.open();
  }

  @Override
  public void didOpen() {
    // nop
  }

  @Override
  public void willLoad() {
    this.lane.load();
  }

  @Override
  public void didLoad() {
    // nop
  }

  @Override
  public void willStart() {
    this.lane.start();
  }

  @Override
  public void didStart() {
    // nop
  }

  @Override
  public void willStop() {
    this.lane.stop();
  }

  @Override
  public void didStop() {
    // nop
  }

  @Override
  public void willUnload() {
    this.lane.unload();
  }

  @Override
  public void didUnload() {
    // nop
  }

  @Override
  public void willClose() {
    this.lane.close();
  }
}
