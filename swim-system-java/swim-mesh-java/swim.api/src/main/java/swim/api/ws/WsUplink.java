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

package swim.api.ws;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import swim.api.Link;
import swim.api.auth.Identity;
import swim.uri.Uri;
import swim.ws.WsRequest;

public interface WsUplink extends Link {
  @Override
  Uri hostUri();

  @Override
  Uri nodeUri();

  @Override
  Uri laneUri();

  Uri requestUri();

  WsRequest request();

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
  void close();

  @Override
  WsUplink observe(Object observer);

  @Override
  WsUplink unobserve(Object observer);

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
