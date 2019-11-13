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

import swim.api.auth.Identity;
import swim.api.downlink.EventDownlink;
import swim.api.downlink.ListDownlink;
import swim.api.downlink.MapDownlink;
import swim.api.downlink.ValueDownlink;
import swim.api.http.HttpDownlink;
import swim.api.ref.HostRef;
import swim.api.ref.LaneRef;
import swim.api.ref.NodeRef;
import swim.api.ref.SwimRef;
import swim.api.ws.WsDownlink;
import swim.runtime.downlink.EventDownlinkView;
import swim.runtime.downlink.ListDownlinkView;
import swim.runtime.downlink.MapDownlinkView;
import swim.runtime.downlink.ValueDownlinkView;
import swim.runtime.scope.HostScope;
import swim.runtime.scope.LaneScope;
import swim.runtime.scope.NodeScope;
import swim.runtime.scope.ScopePushRequest;
import swim.structure.Form;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.warp.CommandMessage;

public abstract class AbstractSwimRef implements SwimRef, CellContext {
  @Override
  public HostRef hostRef(Uri hostUri) {
    return new HostScope(this, stage(), meshUri(), hostUri);
  }

  @Override
  public HostRef hostRef(String hostUri) {
    return hostRef(Uri.parse(hostUri));
  }

  @Override
  public NodeRef nodeRef(Uri hostUri, Uri nodeUri) {
    if (nodeUri.authority().isDefined()) {
      nodeUri = Uri.from(nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    }
    return new NodeScope(this, stage(), meshUri(), hostUri, nodeUri);
  }

  @Override
  public NodeRef nodeRef(String hostUri, String nodeUri) {
    return nodeRef(Uri.parse(hostUri), Uri.parse(nodeUri));
  }

  @Override
  public NodeRef nodeRef(Uri nodeUri) {
    final Uri hostUri;
    if (nodeUri.authority().isDefined()) {
      hostUri = Uri.from(nodeUri.scheme(), nodeUri.authority());
      nodeUri = Uri.from(nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    } else {
      hostUri = Uri.empty();
      nodeUri = Uri.from(nodeUri.scheme(), UriAuthority.undefined(),
                         nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    }
    return new NodeScope(this, stage(), meshUri(), hostUri, nodeUri);
  }

  @Override
  public NodeRef nodeRef(String nodeUri) {
    return nodeRef(Uri.parse(nodeUri));
  }

  @Override
  public LaneRef laneRef(Uri hostUri, Uri nodeUri, Uri laneUri) {
    if (nodeUri.authority().isDefined()) {
      nodeUri = Uri.from(nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    }
    return new LaneScope(this, stage(), meshUri(), hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneRef laneRef(String hostUri, String nodeUri, String laneUri) {
    return laneRef(Uri.parse(hostUri), Uri.parse(nodeUri), Uri.parse(laneUri));
  }

  @Override
  public LaneRef laneRef(Uri nodeUri, Uri laneUri) {
    final Uri hostUri;
    if (nodeUri.authority().isDefined()) {
      hostUri = Uri.from(nodeUri.scheme(), nodeUri.authority());
      nodeUri = Uri.from(nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    } else {
      hostUri = Uri.empty();
      nodeUri = Uri.from(nodeUri.scheme(), UriAuthority.undefined(),
                         nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    }
    return new LaneScope(this, stage(), meshUri(), hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneRef laneRef(String nodeUri, String laneUri) {
    return laneRef(Uri.parse(nodeUri), Uri.parse(laneUri));
  }

  @Override
  public EventDownlink<Value> downlink() {
    return new EventDownlinkView<>(this, stage(), meshUri(), Uri.empty(),
        Uri.empty(), Uri.empty(), 0.0f, 0.0f, Value.absent(), Form.forValue());
  }

  @Override
  public ListDownlink<Value> downlinkList() {
    return new ListDownlinkView<>(this, stage(), meshUri(), Uri.empty(), Uri.empty(),
        Uri.empty(), 0.0f, 0.0f, Value.absent(), Form.forValue());
  }

  @Override
  public MapDownlink<Value, Value> downlinkMap() {
    return new MapDownlinkView<>(this, stage(), meshUri(), Uri.empty(), Uri.empty(),
        Uri.empty(), 0.0f, 0.0f, Value.absent(), Form.forValue(), Form.forValue());
  }

  @Override
  public ValueDownlink<Value> downlinkValue() {
    return new ValueDownlinkView<>(this, stage(), meshUri(), Uri.empty(),
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
  public void command(Uri hostUri, Uri nodeUri, Uri laneUri, float prio, Value body) {
    if (nodeUri.authority().isDefined()) {
      nodeUri = Uri.from(nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    }
    final Identity identity = null;
    final CommandMessage message = new CommandMessage(nodeUri, laneUri, body);
    pushDown(new ScopePushRequest(meshUri(), hostUri, identity, message, prio));
  }

  @Override
  public void command(String hostUri, String nodeUri, String laneUri, float prio, Value body) {
    command(Uri.parse(hostUri), Uri.parse(nodeUri), Uri.parse(laneUri), prio, body);
  }

  @Override
  public void command(Uri hostUri, Uri nodeUri, Uri laneUri, Value body) {
    command(hostUri, nodeUri, laneUri, 0.0f, body);
  }

  @Override
  public void command(String hostUri, String nodeUri, String laneUri, Value body) {
    command(Uri.parse(hostUri), Uri.parse(nodeUri), Uri.parse(laneUri), body);
  }

  @Override
  public void command(Uri nodeUri, Uri laneUri, float prio, Value body) {
    final Uri hostUri;
    if (nodeUri.authority().isDefined()) {
      hostUri = Uri.from(nodeUri.scheme(), nodeUri.authority());
      nodeUri = Uri.from(nodeUri.path(), nodeUri.query(), nodeUri.fragment());
    } else {
      hostUri = Uri.empty();
    }
    final Identity identity = null;
    final CommandMessage message = new CommandMessage(nodeUri, laneUri, body);
    pushDown(new ScopePushRequest(meshUri(), hostUri, identity, message, prio));
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

  @Override
  public abstract void close();
}
