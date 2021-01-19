// Copyright 2015-2020 Swim inc.
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

package swim.client;

import swim.api.client.Client;
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
import swim.concurrent.Theater;
import swim.io.TlsSettings;
import swim.io.http.HttpEndpoint;
import swim.io.http.HttpSettings;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public class ClientRuntime implements Client {

  private final SwimClientRef clientRef;

  public ClientRuntime(Stage stage, HttpSettings settings) {
    this.clientRef = new SwimClientRef(stage, new HttpEndpoint(stage, settings));
  }

  public ClientRuntime(Stage stage) {
    this(stage, HttpSettings.standard().tlsSettings(TlsSettings.standard()));
  }

  public ClientRuntime() {
    this(new Theater());
  }

  @Override
  public void start() {
    this.clientRef.start();
  }

  @Override
  public void stop() {
    this.clientRef.stop();
  }

  @Override
  public HostRef hostRef(Uri hostUri) {
    return this.clientRef.hostRef(hostUri);
  }

  @Override
  public HostRef hostRef(String hostUri) {
    return this.clientRef.hostRef(hostUri);
  }

  @Override
  public NodeRef nodeRef(Uri hostUri, Uri nodeUri) {
    return this.clientRef.nodeRef(hostUri, nodeUri);
  }

  @Override
  public NodeRef nodeRef(String hostUri, String nodeUri) {
    return this.clientRef.nodeRef(hostUri, nodeUri);
  }

  @Override
  public NodeRef nodeRef(Uri nodeUri) {
    return this.clientRef.nodeRef(nodeUri);
  }

  @Override
  public NodeRef nodeRef(String nodeUri) {
    return this.clientRef.nodeRef(nodeUri);
  }

  @Override
  public LaneRef laneRef(Uri hostUri, Uri nodeUri, Uri laneUri) {
    return this.clientRef.laneRef(hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneRef laneRef(String hostUri, String nodeUri, String laneUri) {
    return this.clientRef.laneRef(hostUri, nodeUri, laneUri);
  }

  @Override
  public LaneRef laneRef(Uri nodeUri, Uri laneUri) {
    return this.clientRef.laneRef(nodeUri, laneUri);
  }

  @Override
  public LaneRef laneRef(String nodeUri, String laneUri) {
    return this.clientRef.laneRef(nodeUri, laneUri);
  }

  @Override
  public void command(Uri hostUri, Uri nodeUri, Uri laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    this.clientRef.command(hostUri, nodeUri, laneUri, prio, body, cont);
  }

  @Override
  public void command(String hostUri, String nodeUri, String laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    this.clientRef.command(hostUri, nodeUri, laneUri, prio, body, cont);
  }

  @Override
  public void command(Uri hostUri, Uri nodeUri, Uri laneUri, Value body, Cont<CommandMessage> cont) {
    this.clientRef.command(hostUri, nodeUri, laneUri, body, cont);
  }

  @Override
  public void command(String hostUri, String nodeUri, String laneUri, Value body, Cont<CommandMessage> cont) {
    this.clientRef.command(hostUri, nodeUri, laneUri, body, cont);
  }

  @Override
  public void command(Uri nodeUri, Uri laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    this.clientRef.command(nodeUri, laneUri, prio, body, cont);
  }

  @Override
  public void command(String nodeUri, String laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    this.clientRef.command(nodeUri, laneUri, prio, body, cont);
  }

  @Override
  public void command(Uri nodeUri, Uri laneUri, Value body, Cont<CommandMessage> cont) {
    this.clientRef.command(nodeUri, laneUri, body, cont);
  }

  @Override
  public void command(String nodeUri, String laneUri, Value body, Cont<CommandMessage> cont) {
    this.clientRef.command(nodeUri, laneUri, body, cont);
  }

  @Override
  public void command(Uri hostUri, Uri nodeUri, Uri laneUri, float prio, Value body) {
    this.clientRef.command(hostUri, nodeUri, laneUri, prio, body);
  }

  @Override
  public void command(String hostUri, String nodeUri, String laneUri, float prio, Value body) {
    this.clientRef.command(hostUri, nodeUri, laneUri, prio, body);
  }

  @Override
  public void command(Uri hostUri, Uri nodeUri, Uri laneUri, Value body) {
    this.clientRef.command(hostUri, nodeUri, laneUri, body);
  }

  @Override
  public void command(String hostUri, String nodeUri, String laneUri, Value body) {
    this.clientRef.command(hostUri, nodeUri, laneUri, body);
  }

  @Override
  public void command(Uri nodeUri, Uri laneUri, float prio, Value body) {
    this.clientRef.command(nodeUri, laneUri, prio, body);
  }

  @Override
  public void command(String nodeUri, String laneUri, float prio, Value body) {
    this.clientRef.command(nodeUri, laneUri, prio, body);
  }

  @Override
  public void command(Uri nodeUri, Uri laneUri, Value body) {
    this.clientRef.command(nodeUri, laneUri, body);
  }

  @Override
  public void command(String nodeUri, String laneUri, Value body) {
    this.clientRef.command(nodeUri, laneUri, body);
  }

  @Override
  public void close() {
    this.clientRef.close();
  }

  @Override
  public EventDownlink<Value> downlink() {
    return this.clientRef.downlink();
  }

  @Override
  public ListDownlink<Value> downlinkList() {
    return this.clientRef.downlinkList();
  }

  @Override
  public MapDownlink<Value, Value> downlinkMap() {
    return this.clientRef.downlinkMap();
  }

  @Override
  public ValueDownlink<Value> downlinkValue() {
    return this.clientRef.downlinkValue();
  }

  @Override
  public <V> HttpDownlink<V> downlinkHttp() {
    return this.clientRef.downlinkHttp();
  }

  @Override
  public <I, O> WsDownlink<I, O> downlinkWs() {
    return this.clientRef.downlinkWs();
  }

}
