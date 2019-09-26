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

package swim.runtime.scope;

import swim.api.downlink.EventDownlink;
import swim.api.downlink.ListDownlink;
import swim.api.downlink.MapDownlink;
import swim.api.downlink.ValueDownlink;
import swim.api.http.HttpDownlink;
import swim.api.ref.HostRef;
import swim.api.ref.LaneRef;
import swim.api.ref.NodeRef;
import swim.api.ws.WsDownlink;
import swim.concurrent.Stage;
import swim.runtime.CellContext;
import swim.runtime.downlink.EventDownlinkView;
import swim.runtime.downlink.MapDownlinkView;
import swim.runtime.downlink.ValueDownlinkView;
import swim.structure.Form;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public class HostScope extends Scope implements HostRef {
  protected final Uri meshUri;
  protected final Uri hostUri;

  public HostScope(CellContext cellContext, Stage stage, Uri meshUri, Uri hostUri) {
    super(cellContext, stage);
    this.meshUri = meshUri;
    this.hostUri = hostUri;
  }

  @Override
  public final Uri meshUri() {
    return this.meshUri;
  }

  @Override
  public final Uri hostUri() {
    return this.hostUri;
  }

  @Override
  public NodeRef nodeRef(Uri nodeUri) {
    return new NodeScope(cellContext, stage, this.meshUri, this.hostUri, nodeUri);
  }

  @Override
  public NodeRef nodeRef(String nodeUri) {
    return nodeRef(Uri.parse(nodeUri));
  }

  @Override
  public LaneRef laneRef(Uri nodeUri, Uri laneUri) {
    return new LaneScope(cellContext, stage, this.meshUri, this.hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneRef laneRef(String nodeUri, String laneUri) {
    return laneRef(Uri.parse(nodeUri), Uri.parse(laneUri));
  }

  @Override
  public EventDownlink<Value> downlink() {
    return new EventDownlinkView<Value>(this, stage, this.meshUri, this.hostUri,
        Uri.empty(), Uri.empty(), 0.0f, 0.0f, Value.absent(), Form.forValue());
  }

  @Override
  public ListDownlink<Value> downlinkList() {
    return null; // TODO
  }

  @Override
  public MapDownlink<Value, Value> downlinkMap() {
    return new MapDownlinkView<Value, Value>(this, stage, this.meshUri, this.hostUri,
        Uri.empty(), Uri.empty(), 0.0f, 0.0f, Value.absent(), Form.forValue(), Form.forValue());
  }

  @Override
  public ValueDownlink<Value> downlinkValue() {
    return new ValueDownlinkView<Value>(this, stage, this.meshUri, this.hostUri,
        Uri.empty(), Uri.empty(), 0.0f, 0.0f, Value.absent(), Form.forValue());
  }

  @Override
  public <V> HttpDownlink<V> downlinkHttp() {
    return null; // TODO
  }

  @Override
  public <I, O> WsDownlink<I, O> downlinkWs() {
    return null; // TODO
  }

  @Override
  public void command(Uri nodeUri, Uri laneUri, float prio, Value body) {
    final CommandMessage message = new CommandMessage(nodeUri, laneUri, body);
    pushDown(new ScopePushRequest(this.meshUri, this.hostUri, null, message, prio));
  }

  @Override
  public void command(String nodeUri, String laneUri, float prio, Value body) {
    command(Uri.parse(nodeUri), Uri.parse(laneUri), prio, body);
  }

  @Override
  public void command(Uri nodeUri, Uri laneUri, Value body) {
    command(nodeUri, laneUri, 0.0f, body);
  }

  @Override
  public void command(String nodeUri, String laneUri, Value body) {
    command(Uri.parse(nodeUri), Uri.parse(laneUri), body);
  }
}
