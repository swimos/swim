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

package swim.api.uplink;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import swim.api.Link;
import swim.api.auth.Identity;
import swim.api.function.DidClose;
import swim.api.uplink.function.OnCommand;
import swim.api.uplink.function.OnEvent;
import swim.api.uplink.function.OnLink;
import swim.api.uplink.function.OnLinked;
import swim.api.uplink.function.OnSync;
import swim.api.uplink.function.OnSynced;
import swim.api.uplink.function.OnUnlink;
import swim.api.uplink.function.OnUnlinked;
import swim.structure.Value;
import swim.uri.Uri;

public interface Uplink extends Link {
  @Override
  Uri hostUri();

  @Override
  Uri nodeUri();

  @Override
  Uri laneUri();

  float prio();

  float rate();

  Value body();

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
  Uplink observe(Object observer);

  @Override
  Uplink unobserve(Object observer);

  Uplink onEvent(OnEvent onEvent);

  Uplink onCommand(OnCommand onCommand);

  Uplink onLink(OnLink onLink);

  Uplink onLinked(OnLinked onLinked);

  Uplink onSync(OnSync onSync);

  Uplink onSynced(OnSynced onSynced);

  Uplink onUnlink(OnUnlink onUnlink);

  Uplink onUnlinked(OnUnlinked onUnlinked);

  Uplink didClose(DidClose didClose);

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
