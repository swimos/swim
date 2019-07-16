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

package swim.api.downlink;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import swim.api.Link;
import swim.api.auth.Identity;
import swim.api.downlink.function.DidLink;
import swim.api.downlink.function.DidReceive;
import swim.api.downlink.function.DidSync;
import swim.api.downlink.function.DidUnlink;
import swim.api.downlink.function.WillLink;
import swim.api.downlink.function.WillReceive;
import swim.api.downlink.function.WillSync;
import swim.api.downlink.function.WillUnlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.function.WillCommand;
import swim.structure.Value;
import swim.uri.Uri;

public interface Downlink extends Link {
  @Override
  Uri hostUri();

  Downlink hostUri(Uri hostUri);

  Downlink hostUri(String hostUri);

  @Override
  Uri nodeUri();

  Downlink nodeUri(Uri nodeUri);

  Downlink nodeUri(String nodeUri);

  @Override
  Uri laneUri();

  Downlink laneUri(Uri laneUri);

  Downlink laneUri(String laneUri);

  float prio();

  Downlink prio(float prio);

  float rate();

  Downlink rate(float rate);

  Value body();

  Downlink body(Value body);

  boolean keepLinked();

  Downlink keepLinked(boolean keepLinked);

  boolean keepSynced();

  Downlink keepSynced(boolean keepSynced);

  @Override
  boolean isConnected();

  @Override
  boolean isRemote();

  @Override
  boolean isSecure();

  @Override
  String securityProtocol();

  @Override
  String cipherSuite();

  @Override
  InetSocketAddress localAddress();

  @Override
  Identity localIdentity();

  @Override
  Principal localPrincipal();

  @Override
  Collection<Certificate> localCertificates();

  @Override
  InetSocketAddress remoteAddress();

  @Override
  Identity remoteIdentity();

  @Override
  Principal remotePrincipal();

  @Override
  Collection<Certificate> remoteCertificates();

  @Override
  Downlink observe(Object observer);

  @Override
  Downlink unobserve(Object observer);

  Downlink willReceive(WillReceive willReceive);

  Downlink didReceive(DidReceive didReceive);

  Downlink willCommand(WillCommand willCommand);

  Downlink willLink(WillLink willLink);

  Downlink didLink(DidLink didLink);

  Downlink willSync(WillSync willSync);

  Downlink didSync(DidSync didSync);

  Downlink willUnlink(WillUnlink willUnlink);

  Downlink didUnlink(DidUnlink didUnlink);

  Downlink didConnect(DidConnect didConnect);

  Downlink didDisconnect(DidDisconnect didDisconnect);

  Downlink didClose(DidClose didClose);

  Downlink didFail(DidFail didFail);

  Downlink open();

  void command(float prio, Value body);

  void command(Value body);

  @Override
  void close();

  @Override
  void trace(Object message);

  @Override
  void debug(Object message);

  @Override
  void info(Object message);

  @Override
  void warn(Object message);

  @Override
  void error(Object message);
}
