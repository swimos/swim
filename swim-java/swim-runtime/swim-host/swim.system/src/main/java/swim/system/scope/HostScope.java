// Copyright 2015-2023 Nstream, inc.
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

package swim.system.scope;

import swim.api.downlink.EventDownlink;
import swim.api.downlink.ListDownlink;
import swim.api.downlink.MapDownlink;
import swim.api.downlink.ValueDownlink;
import swim.api.http.HttpDownlink;
import swim.api.ref.HostRef;
import swim.api.ref.LaneRef;
import swim.api.ref.NodeRef;
import swim.api.ws.WsDownlink;
import swim.concurrent.Cont;
import swim.concurrent.Stage;
import swim.structure.Form;
import swim.structure.Value;
import swim.system.CellContext;
import swim.system.Push;
import swim.system.downlink.EventDownlinkView;
import swim.system.downlink.MapDownlinkView;
import swim.system.downlink.ValueDownlinkView;
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
    return this.nodeRef(Uri.parse(nodeUri));
  }

  @Override
  public LaneRef laneRef(Uri nodeUri, Uri laneUri) {
    return new LaneScope(cellContext, stage, this.meshUri, this.hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneRef laneRef(String nodeUri, String laneUri) {
    return this.laneRef(Uri.parse(nodeUri), Uri.parse(laneUri));
  }

  @Override
  public EventDownlink<Value> downlink() {
    return new EventDownlinkView<Value>(this, stage, this.meshUri, this.hostUri,
                                        Uri.empty(), Uri.empty(), 0.0f, 0.0f,
                                        Value.absent(), Form.forValue());
  }

  @Override
  public ListDownlink<Value> downlinkList() {
    return null; // TODO
  }

  @Override
  public MapDownlink<Value, Value> downlinkMap() {
    return new MapDownlinkView<Value, Value>(this, stage, this.meshUri, this.hostUri,
                                             Uri.empty(), Uri.empty(), 0.0f, 0.0f,
                                             Value.absent(), Form.forValue(), Form.forValue());
  }

  @Override
  public ValueDownlink<Value> downlinkValue() {
    return new ValueDownlinkView<Value>(this, stage, this.meshUri, this.hostUri,
                                        Uri.empty(), Uri.empty(), 0.0f, 0.0f,
                                        Value.absent(), Form.forValue());
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
  public void command(Uri nodeUri, Uri laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    Uri meshUri = this.meshUri;
    final Uri hostUri = this.hostUri;
    if (!meshUri.isDefined()) {
      meshUri = hostUri;
    }
    final CommandMessage message = new CommandMessage(nodeUri, laneUri, body);
    this.pushDown(new Push<CommandMessage>(meshUri, hostUri, nodeUri, laneUri, prio, null, message, cont));
  }

  @Override
  public void command(String nodeUri, String laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    this.command(Uri.parse(nodeUri), Uri.parse(laneUri), prio, body, cont);
  }

  @Override
  public void command(Uri nodeUri, Uri laneUri, Value body, Cont<CommandMessage> cont) {
    this.command(nodeUri, laneUri, 0.0f, body, cont);
  }

  @Override
  public void command(String nodeUri, String laneUri, Value body, Cont<CommandMessage> cont) {
    this.command(Uri.parse(nodeUri), Uri.parse(laneUri), body, cont);
  }

  @Override
  public void command(Uri nodeUri, Uri laneUri, float prio, Value body) {
    this.command(nodeUri, laneUri, prio, body, null);
  }

  @Override
  public void command(String nodeUri, String laneUri, float prio, Value body) {
    this.command(Uri.parse(nodeUri), Uri.parse(laneUri), prio, body, null);
  }

  @Override
  public void command(Uri nodeUri, Uri laneUri, Value body) {
    this.command(nodeUri, laneUri, 0.0f, body, null);
  }

  @Override
  public void command(String nodeUri, String laneUri, Value body) {
    this.command(Uri.parse(nodeUri), Uri.parse(laneUri), body, null);
  }

}
