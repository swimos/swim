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

package swim.remote;

import swim.runtime.AbstractTierBinding;
import swim.runtime.HostAddress;
import swim.runtime.HostBinding;
import swim.runtime.HostContext;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.runtime.PushRequest;
import swim.runtime.TierContext;
import swim.runtime.agent.AgentNode;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriMapper;

public abstract class RemoteHost extends AbstractTierBinding implements HostBinding {

  private HostContext hostContext;

  @Override
  public final PartBinding part() {
    return this.hostContext.part();
  }

  @Override
  public final HostBinding hostWrapper() {
    return this;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapHost(Class<T> hostClass) {
    if (hostClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.hostContext.unwrapHost(hostClass);
    }
  }

  @Override
  public final HostContext hostContext() {
    return this.hostContext;
  }

  @Override
  public void setHostContext(HostContext hostContext) {
    this.hostContext = hostContext;
  }

  @Override
  public Value partKey() {
    return this.hostContext.partKey();
  }

  @Override
  public Uri hostUri() {
    return this.hostContext.hostUri();
  }

  @Override
  public boolean isConnected() {
    // TODO
    return false;
  }

  @Override
  public boolean isRemote() {
    return true;
  }

  public boolean isSecure() {
    // TODO
    return false;
  }

  @Override
  public HostAddress cellAddress() {
    return this.hostContext.cellAddress();
  }

  @Override
  public String edgeName() {
    return this.hostContext.edgeName();
  }

  @Override
  public Uri meshUri() {
    return this.hostContext.meshUri();
  }

  @Override
  public boolean isPrimary() {
    // TODO
    return false;
  }

  @Override
  public void setPrimary(boolean isPrimary) {
    // TODO
  }

  @Override
  public boolean isReplica() {
    // TODO
    return false;
  }

  @Override
  public void setReplica(boolean isReplica) {
    // TODO
  }

  @Override
  public boolean isMaster() {
    // TODO
    return false;
  }

  @Override
  public boolean isSlave() {
    // TODO
    return false;
  }

  @Override
  public void didBecomeMaster() {
    // TODO
  }

  @Override
  public void didBecomeSlave() {
    // TODO
  }

  @Override
  public UriMapper<NodeBinding> nodes() {
    return UriMapper.<NodeBinding>empty();
  }

  @Override
  public NodeBinding getNode(Uri nodeUri) {
    return null;
  }

  @Override
  public NodeBinding openNode(Uri nodeUri) {
    return null;
  }

  @Override
  public NodeBinding openNode(Uri nodeUri, NodeBinding node) {
    return null;
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    // TODO
  }

  @Override
  public TierContext tierContext() {
    return this.hostContext;
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    openMetaLanes(host, (AgentNode) metaHost);
    this.hostContext.openMetaHost(host, metaHost);
  }

  protected void openMetaLanes(HostBinding host, AgentNode metaHost) {
    // TODO
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.hostContext.openMetaNode(node, metaNode);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.hostContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.hostContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.hostContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public boolean isClosed() {
    // TODO
    return false;
  }

  @Override
  public boolean isOpened() {
    // TODO
    return false;
  }

  @Override
  public boolean isLoaded() {
    // TODO
    return false;
  }

  @Override
  public boolean isStarted() {
    // TODO
    return false;
  }

  @Override
  public void open() {
    // TODO
    super.open();
  }

  @Override
  public void load() {
    // TODO
    super.load();
  }

  @Override
  public void start() {
    // TODO
    super.start();
  }

  @Override
  public void stop() {
    // TODO
    super.stop();
  }

  @Override
  public void unload() {
    // TODO
    super.unload();
  }

  @Override
  public void close() {
    // TODO
    super.close();
  }

  @Override
  public void didClose() {
    // TODO
    super.didClose();
  }

  @Override
  public void didFail(Throwable error) {
    // TODO
    super.didFail(error);
  }
}
