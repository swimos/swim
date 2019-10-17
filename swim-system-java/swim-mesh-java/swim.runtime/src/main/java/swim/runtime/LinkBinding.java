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
import swim.uri.Uri;

public interface LinkBinding {
  LinkBinding linkWrapper();

  LinkContext linkContext();

  void setLinkContext(LinkContext linkContext);

  CellContext cellContext();

  void setCellContext(CellContext cellContext);

  <T> T unwrapLink(Class<T> linkClass);

  Uri meshUri();

  Uri hostUri();

  Uri nodeUri();

  Uri laneUri();

  Value linkKey();

  LinkAddress cellAddressDown();

  boolean isConnectedDown();

  boolean isRemoteDown();

  boolean isSecureDown();

  String securityProtocolDown();

  String cipherSuiteDown();

  InetSocketAddress localAddressDown();

  Identity localIdentityDown();

  Principal localPrincipalDown();

  Collection<Certificate> localCertificatesDown();

  InetSocketAddress remoteAddressDown();

  Identity remoteIdentityDown();

  Principal remotePrincipalDown();

  Collection<Certificate> remoteCertificatesDown();

  void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink);

  void reopen();

  void openDown();

  void closeDown();

  void didConnect();

  void didDisconnect();

  void didCloseUp();

  void didFail(Throwable error);

  void traceDown(Object message);

  void debugDown(Object message);

  void infoDown(Object message);

  void warnDown(Object message);

  void errorDown(Object message);

  void failDown(Object message);
}
