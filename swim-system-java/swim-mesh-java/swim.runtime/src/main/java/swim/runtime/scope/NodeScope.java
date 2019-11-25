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
import swim.api.ref.LaneRef;
import swim.api.ref.NodeRef;
import swim.api.ws.WsDownlink;
import swim.concurrent.Cont;
import swim.concurrent.Stage;
import swim.runtime.CellContext;
import swim.runtime.Push;
import swim.runtime.downlink.EventDownlinkView;
import swim.runtime.downlink.MapDownlinkView;
import swim.runtime.downlink.ValueDownlinkView;
import swim.structure.Form;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public class NodeScope extends Scope implements NodeRef {
  protected final Uri meshUri;
  protected final Uri hostUri;
  protected final Uri nodeUri;

  public NodeScope(CellContext cellContext, Stage stage, Uri meshUri,
                   Uri hostUri, Uri nodeUri) {
    super(cellContext, stage);
    this.meshUri = meshUri;
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
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
  public final Uri nodeUri() {
    return this.nodeUri;
  }

  @Override
  public LaneRef laneRef(Uri laneUri) {
    return new LaneScope(cellContext, stage, this.meshUri, this.hostUri, this.nodeUri, laneUri);
  }

  @Override
  public LaneRef laneRef(String laneUri) {
    return laneRef(Uri.parse(laneUri));
  }

  @Override
  public EventDownlink<Value> downlink() {
    return new EventDownlinkView<Value>(this, stage, this.meshUri, this.hostUri, this.nodeUri,
        Uri.empty(), 0.0f, 0.0f, Value.absent(), Form.forValue());
  }

  @Override
  public ListDownlink<Value> downlinkList() {
    return null; // TODO
  }

  @Override
  public MapDownlink<Value, Value> downlinkMap() {
    return new MapDownlinkView<Value, Value>(this, stage, this.meshUri, this.hostUri,
        this.nodeUri, Uri.empty(), 0.0f, 0.0f, Value.absent(), Form.forValue(), Form.forValue());
  }

  @Override
  public ValueDownlink<Value> downlinkValue() {
    return new ValueDownlinkView<Value>(this, stage, this.meshUri, this.hostUri, this.nodeUri,
        Uri.empty(), 0.0f, 0.0f, Value.absent(), Form.forValue());
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
  public void command(Uri laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    Uri meshUri = this.meshUri;
    final Uri hostUri = this.hostUri;
    if (!meshUri.isDefined()) {
      meshUri = hostUri;
    }
    final Uri nodeUri = this.nodeUri;
    final CommandMessage message = new CommandMessage(nodeUri, laneUri, body);
    pushDown(new Push<CommandMessage>(meshUri, hostUri, nodeUri, laneUri, prio, null, message, cont));
  }

  @Override
  public void command(String laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    command(Uri.parse(laneUri), prio, body, cont);
  }

  @Override
  public void command(Uri laneUri, Value body, Cont<CommandMessage> cont) {
    command(laneUri, 0.0f, body, cont);
  }

  @Override
  public void command(String laneUri, Value body, Cont<CommandMessage> cont) {
    command(Uri.parse(laneUri), body, cont);
  }

  @Override
  public void command(Uri laneUri, float prio, Value body) {
    command(laneUri, prio, body, null);
  }

  @Override
  public void command(String laneUri, float prio, Value body) {
    command(Uri.parse(laneUri), prio, body, null);
  }

  @Override
  public void command(Uri laneUri, Value body) {
    command(laneUri, 0.0f, body, null);
  }

  @Override
  public void command(String laneUri, Value body) {
    command(Uri.parse(laneUri), body, null);
  }
}
