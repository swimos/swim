// Copyright 2015-2022 Swim.inc
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

package swim.system;

import swim.api.auth.Identity;
import swim.api.downlink.EventDownlink;
import swim.api.downlink.ListDownlink;
import swim.api.downlink.MapDownlink;
import swim.api.downlink.ValueDownlink;
import swim.api.http.HttpDownlink;
import swim.api.ref.HostRef;
import swim.api.ref.LaneRef;
import swim.api.ref.NodeRef;
import swim.api.ref.WarpRef;
import swim.api.ws.WsDownlink;
import swim.concurrent.Cont;
import swim.structure.Form;
import swim.structure.Value;
import swim.system.downlink.EventDownlinkView;
import swim.system.downlink.ListDownlinkView;
import swim.system.downlink.MapDownlinkView;
import swim.system.downlink.ValueDownlinkView;
import swim.system.scope.HostScope;
import swim.system.scope.LaneScope;
import swim.system.scope.NodeScope;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.warp.CommandMessage;

public abstract class AbstractWarpRef implements WarpRef, CellContext {

  public AbstractWarpRef() {
    // nop
  }

  @Override
  public HostRef hostRef(Uri hostUri) {
    return new HostScope(this, this.stage(), this.meshUri(), hostUri);
  }

  @Override
  public HostRef hostRef(String hostUri) {
    return this.hostRef(Uri.parse(hostUri));
  }

  @Override
  public NodeRef nodeRef(Uri hostUri, Uri nodeUri) {
    if (nodeUri.authority().isDefined()) {
      nodeUri = Uri.create(nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    }
    return new NodeScope(this, this.stage(), this.meshUri(), hostUri, nodeUri);
  }

  @Override
  public NodeRef nodeRef(String hostUri, String nodeUri) {
    return this.nodeRef(Uri.parse(hostUri), Uri.parse(nodeUri));
  }

  @Override
  public NodeRef nodeRef(Uri nodeUri) {
    final Uri hostUri;
    if (nodeUri.authority().isDefined()) {
      hostUri = Uri.create(nodeUri.scheme(), nodeUri.authority());
      nodeUri = Uri.create(nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    } else {
      hostUri = Uri.empty();
      nodeUri = Uri.create(nodeUri.scheme(), UriAuthority.undefined(),
                           nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    }
    return new NodeScope(this, this.stage(), this.meshUri(), hostUri, nodeUri);
  }

  @Override
  public NodeRef nodeRef(String nodeUri) {
    return this.nodeRef(Uri.parse(nodeUri));
  }

  @Override
  public LaneRef laneRef(Uri hostUri, Uri nodeUri, Uri laneUri) {
    if (nodeUri.authority().isDefined()) {
      nodeUri = Uri.create(nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    }
    return new LaneScope(this, this.stage(), this.meshUri(), hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneRef laneRef(String hostUri, String nodeUri, String laneUri) {
    return this.laneRef(Uri.parse(hostUri), Uri.parse(nodeUri), Uri.parse(laneUri));
  }

  @Override
  public LaneRef laneRef(Uri nodeUri, Uri laneUri) {
    final Uri hostUri;
    if (nodeUri.authority().isDefined()) {
      hostUri = Uri.create(nodeUri.scheme(), nodeUri.authority());
      nodeUri = Uri.create(nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    } else {
      hostUri = Uri.empty();
      nodeUri = Uri.create(nodeUri.scheme(), UriAuthority.undefined(),
                           nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    }
    return new LaneScope(this, this.stage(), this.meshUri(), hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneRef laneRef(String nodeUri, String laneUri) {
    return this.laneRef(Uri.parse(nodeUri), Uri.parse(laneUri));
  }

  @Override
  public EventDownlink<Value> downlink() {
    return new EventDownlinkView<Value>(this, this.stage(), this.meshUri(), Uri.empty(),
                                        Uri.empty(), Uri.empty(), 0.0f, 0.0f, Value.absent(), Form.forValue());
  }

  @Override
  public ListDownlink<Value> downlinkList() {
    return new ListDownlinkView<Value>(this, this.stage(), this.meshUri(), Uri.empty(), Uri.empty(),
                                       Uri.empty(), 0.0f, 0.0f, Value.absent(), Form.forValue());
  }

  @Override
  public MapDownlink<Value, Value> downlinkMap() {
    return new MapDownlinkView<Value, Value>(this, this.stage(), this.meshUri(), Uri.empty(), Uri.empty(),
                                             Uri.empty(), 0.0f, 0.0f, Value.absent(), Form.forValue(), Form.forValue());
  }

  @Override
  public ValueDownlink<Value> downlinkValue() {
    return new ValueDownlinkView<Value>(this, this.stage(), this.meshUri(), Uri.empty(),
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
  public void command(Uri hostUri, Uri nodeUri, Uri laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    Uri meshUri = this.meshUri();
    if (!meshUri.isDefined()) {
      meshUri = hostUri;
    }
    if (nodeUri.authority().isDefined()) {
      nodeUri = Uri.create(nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    }
    final Identity identity = null;
    final CommandMessage message = new CommandMessage(nodeUri, laneUri, body);
    this.pushDown(new Push<CommandMessage>(meshUri, hostUri, nodeUri, laneUri, prio, identity, message, cont));
  }

  @Override
  public void command(String hostUri, String nodeUri, String laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    this.command(Uri.parse(hostUri), Uri.parse(nodeUri), Uri.parse(laneUri), prio, body, cont);
  }

  @Override
  public void command(Uri hostUri, Uri nodeUri, Uri laneUri, Value body, Cont<CommandMessage> cont) {
    this.command(hostUri, nodeUri, laneUri, 0.0f, body, cont);
  }

  @Override
  public void command(String hostUri, String nodeUri, String laneUri, Value body, Cont<CommandMessage> cont) {
    this.command(Uri.parse(hostUri), Uri.parse(nodeUri), Uri.parse(laneUri), body, cont);
  }

  @Override
  public void command(Uri nodeUri, Uri laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    Uri meshUri = this.meshUri();
    final Uri hostUri;
    if (nodeUri.authority().isDefined()) {
      hostUri = Uri.create(nodeUri.scheme(), nodeUri.authority());
      nodeUri = Uri.create(nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    } else {
      hostUri = Uri.empty();
    }
    if (!meshUri.isDefined()) {
      meshUri = hostUri;
    }
    final Identity identity = null;
    final CommandMessage message = new CommandMessage(nodeUri, laneUri, body);
    this.pushDown(new Push<CommandMessage>(meshUri, hostUri, nodeUri, laneUri, prio, identity, message, cont));
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
  public void command(Uri hostUri, Uri nodeUri, Uri laneUri, float prio, Value body) {
    this.command(hostUri, nodeUri, laneUri, prio, body, null);
  }

  @Override
  public void command(String hostUri, String nodeUri, String laneUri, float prio, Value body) {
    this.command(Uri.parse(hostUri), Uri.parse(nodeUri), Uri.parse(laneUri), prio, body, null);
  }

  @Override
  public void command(Uri hostUri, Uri nodeUri, Uri laneUri, Value body) {
    this.command(hostUri, nodeUri, laneUri, 0.0f, body, null);
  }

  @Override
  public void command(String hostUri, String nodeUri, String laneUri, Value body) {
    this.command(Uri.parse(hostUri), Uri.parse(nodeUri), Uri.parse(laneUri), body, null);
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

  @Override
  public abstract void close();

}
