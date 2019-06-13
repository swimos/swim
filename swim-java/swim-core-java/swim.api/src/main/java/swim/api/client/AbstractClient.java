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

package swim.api.client;

import swim.api.SwimContext;
import swim.api.downlink.EventDownlink;
import swim.api.downlink.ListDownlink;
import swim.api.downlink.MapDownlink;
import swim.api.downlink.ValueDownlink;
import swim.api.http.HttpDownlink;
import swim.api.ref.HostRef;
import swim.api.ref.LaneRef;
import swim.api.ref.NodeRef;
import swim.api.ref.SwimRef;
import swim.api.router.Router;
import swim.api.ws.WsDownlink;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;

public abstract class AbstractClient implements Client, Log, SwimRef {
  protected final ClientContext context;

  public AbstractClient(ClientContext context) {
    this.context = context;
  }

  public AbstractClient() {
    this(SwimContext.getClientContext());
  }

  @Override
  public ClientContext clientContext() {
    return this.context;
  }

  //@Override
  //public Credentials getCredentials(Uri hostUri) {
  //  return null;
  //}

  @Override
  public void willStart() {
    // stub
  }

  @Override
  public void didStart() {
    // stub
  }

  @Override
  public void willStop() {
    // stub
  }

  @Override
  public void didStop() {
    // stub
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
  }

  @Override
  public HostRef hostRef(Uri hostUri) {
    return this.context.hostRef(hostUri);
  }

  @Override
  public HostRef hostRef(String hostUri) {
    return this.context.hostRef(hostUri);
  }

  @Override
  public NodeRef nodeRef(Uri hostUri, Uri nodeUri) {
    return this.context.nodeRef(hostUri, nodeUri);
  }

  @Override
  public NodeRef nodeRef(String hostUri, String nodeUri) {
    return this.context.nodeRef(hostUri, nodeUri);
  }

  @Override
  public NodeRef nodeRef(Uri nodeUri) {
    return this.context.nodeRef(nodeUri);
  }

  @Override
  public NodeRef nodeRef(String nodeUri) {
    return this.context.nodeRef(nodeUri);
  }

  @Override
  public LaneRef laneRef(Uri hostUri, Uri nodeUri, Uri laneUri) {
    return this.context.laneRef(hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneRef laneRef(String hostUri, String nodeUri, String laneUri) {
    return this.context.laneRef(hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneRef laneRef(Uri nodeUri, Uri laneUri) {
    return this.context.laneRef(nodeUri, laneUri);
  }

  @Override
  public LaneRef laneRef(String nodeUri, String laneUri) {
    return this.context.laneRef(nodeUri, laneUri);
  }

  @Override
  public void command(Uri hostUri, Uri nodeUri, Uri laneUri, float prio, Value body) {
    this.context.command(hostUri, nodeUri, laneUri, prio, body);
  }

  @Override
  public void command(String hostUri, String nodeUri, String laneUri, float prio, Value body) {
    this.context.command(hostUri, nodeUri, laneUri, prio, body);
  }

  @Override
  public void command(Uri hostUri, Uri nodeUri, Uri laneUri, Value body) {
    this.context.command(hostUri, nodeUri, laneUri, body);
  }

  @Override
  public void command(String hostUri, String nodeUri, String laneUri, Value body) {
    this.context.command(hostUri, nodeUri, laneUri, body);
  }

  @Override
  public void command(Uri nodeUri, Uri laneUri, float prio, Value body) {
    this.context.command(nodeUri, laneUri, prio, body);
  }

  @Override
  public void command(String nodeUri, String laneUri, float prio, Value body) {
    this.context.command(nodeUri, laneUri, prio, body);
  }

  @Override
  public void command(Uri nodeUri, Uri laneUri, Value body) {
    this.context.command(nodeUri, laneUri, body);
  }

  @Override
  public void command(String nodeUri, String laneUri, Value body) {
    this.context.command(nodeUri, laneUri, body);
  }

  @Override
  public EventDownlink<Value> downlink() {
    return this.context.downlink();
  }

  @Override
  public ListDownlink<Value> downlinkList() {
    return this.context.downlinkList();
  }

  @Override
  public MapDownlink<Value, Value> downlinkMap() {
    return this.context.downlinkMap();
  }

  @Override
  public ValueDownlink<Value> downlinkValue() {
    return this.context.downlinkValue();
  }

  @Override
  public <V> HttpDownlink<V> downlinkHttp() {
    return this.context.downlinkHttp();
  }

  @Override
  public <I, O> WsDownlink<I, O> downlinkWs() {
    return this.context.downlinkWs();
  }

  @Override
  public void close() {
    // nop
  }

  public final Router router() {
    return this.context.router();
  }

  public void start() {
    this.context.start();
  }

  public void stop() {
    this.context.stop();
  }

  @Override
  public void trace(Object message) {
    this.context.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.context.debug(message);
  }

  @Override
  public void info(Object message) {
    this.context.info(message);
  }

  @Override
  public void warn(Object message) {
    this.context.warn(message);
  }

  @Override
  public void error(Object message) {
    this.context.error(message);
  }
}
