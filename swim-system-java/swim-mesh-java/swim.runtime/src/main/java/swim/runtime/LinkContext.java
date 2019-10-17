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

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import swim.api.auth.Identity;
import swim.structure.Value;

public interface LinkContext {
  LinkBinding linkWrapper();

  <T> T unwrapLink(Class<T> linkClass);

  Value linkKey();

  LinkAddress cellAddressUp();

  boolean isConnectedUp();

  boolean isRemoteUp();

  boolean isSecureUp();

  String securityProtocolUp();

  String cipherSuiteUp();

  InetSocketAddress localAddressUp();

  Identity localIdentityUp();

  Principal localPrincipalUp();

  Collection<Certificate> localCertificatesUp();

  InetSocketAddress remoteAddressUp();

  Identity remoteIdentityUp();

  Principal remotePrincipalUp();

  Collection<Certificate> remoteCertificatesUp();

  void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink);

  void closeUp();

  void didOpenDown();

  void didCloseDown();

  void traceUp(Object message);

  void debugUp(Object message);

  void infoUp(Object message);

  void warnUp(Object message);

  void errorUp(Object message);

  void failUp(Object message);
}
