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

import swim.api.auth.Identity;
import swim.api.data.DataFactory;
import swim.api.downlink.Downlink;
import swim.api.policy.Policy;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.math.Z2Form;
import swim.runtime.HttpBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.NodeBinding;
import swim.runtime.NodeContext;
import swim.runtime.PushRequest;
import swim.store.ListDataBinding;
import swim.store.MapDataBinding;
import swim.store.SpatialDataBinding;
import swim.store.ValueDataBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class HostTableNode implements NodeContext {
  protected final HostTable host;

  protected final NodeBinding node;

  protected final Uri nodeUri;

  public HostTableNode(HostTable host, NodeBinding node, Uri nodeUri) {
    this.host = host;
    this.node = node;
    this.nodeUri = nodeUri;
  }

  @Override
  public final Uri meshUri() {
    return this.host.meshUri();
  }

  @Override
  public final Value partKey() {
    return this.host.partKey();
  }

  @Override
  public final Uri hostUri() {
    return this.host.hostUri();
  }

  @Override
  public final Uri nodeUri() {
    return nodeUri;
  }

  @Override
  public Value agentKey() {
    return this.node.agentKey();
  }

  @Override
  public final Identity identity() {
    return null; // TODO
  }

  @Override
  public Policy policy() {
    return this.host.policy();
  }

  @Override
  public Schedule schedule() {
    return this.host.schedule();
  }

  @Override
  public Stage stage() {
    return this.host.stage();
  }

  @Override
  public DataFactory data() {
    return this.host.data();
  }

  @Override
  public LaneBinding injectLane(Uri laneUri, LaneBinding lane) {
    return this.host.hostContext().injectLane(nodeUri, laneUri, lane);
  }

  @Override
  public ListDataBinding openListData(Value name) {
    return this.host.openListData(name);
  }

  @Override
  public ListDataBinding injectListData(ListDataBinding dataBinding) {
    return this.host.injectListData(dataBinding);
  }

  @Override
  public MapDataBinding openMapData(Value name) {
    return this.host.openMapData(name);
  }

  @Override
  public MapDataBinding injectMapData(MapDataBinding dataBinding) {
    return this.host.injectMapData(dataBinding);
  }

  @Override
  public <S> SpatialDataBinding<S> openSpatialData(Value name, Z2Form<S> shapeForm) {
    return this.host.openSpatialData(name, shapeForm);
  }

  @Override
  public <S> SpatialDataBinding<S> injectSpatialData(SpatialDataBinding<S> dataBinding) {
    return this.host.injectSpatialData(dataBinding);
  }

  @Override
  public ValueDataBinding openValueData(Value name) {
    return this.host.openValueData(name);
  }

  @Override
  public ValueDataBinding injectValueData(ValueDataBinding dataBinding) {
    return this.host.injectValueData(dataBinding);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.host.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.host.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
  }

  @Override
  public void httpDownlink(HttpBinding http) {
    this.host.httpDownlink(http);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.host.pushDown(pushRequest);
  }

  @Override
  public void trace(Object message) {
    this.host.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.host.debug(message);
  }

  @Override
  public void info(Object message) {
    this.host.info(message);
  }

  @Override
  public void warn(Object message) {
    this.host.warn(message);
  }

  @Override
  public void error(Object message) {
    this.host.error(message);
  }

  @Override
  public void close() {
    this.host.closeNode(nodeUri);
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
