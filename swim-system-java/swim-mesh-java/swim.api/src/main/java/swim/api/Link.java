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

package swim.api;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import swim.api.auth.Identity;
import swim.observable.Observable;
import swim.uri.Uri;
import swim.util.Log;

public interface Link extends Observable<Object>, Log {
  Uri hostUri();

  Uri nodeUri();

  Uri laneUri();

  boolean isConnected();

  boolean isRemote();

  boolean isSecure();

  String securityProtocol();

  String cipherSuite();

  InetSocketAddress localAddress();

  Identity localIdentity();

  Principal localPrincipal();

  Collection<Certificate> localCertificates();

  InetSocketAddress remoteAddress();

  Identity remoteIdentity();

  Principal remotePrincipal();

  Collection<Certificate> remoteCertificates();

  void close();

  @Override
  Link observe(Object observer);

  @Override
  Link unobserve(Object observer);
}
