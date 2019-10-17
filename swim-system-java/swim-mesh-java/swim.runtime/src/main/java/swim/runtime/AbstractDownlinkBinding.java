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
import swim.collections.FingerTrieSeq;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;

public abstract class AbstractDownlinkBinding implements LinkBinding, Log {
  protected final Uri meshUri;
  protected final Uri hostUri;
  protected final Uri nodeUri;
  protected final Uri laneUri;

  public AbstractDownlinkBinding(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri) {
    this.meshUri = meshUri;
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
  }

  @Override
  public abstract LinkBinding linkWrapper();

  @Override
  public abstract LinkContext linkContext();

  @Override
  public abstract CellContext cellContext();

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapLink(Class<T> linkClass) {
    if (linkClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return linkContext().unwrapLink(linkClass);
    }
  }

  @Override
  public final Uri meshUri() {
    return this.meshUri;
  }

  @Override
  public final Uri hostUri() {
    return this.hostUri;
  }

  @Override
  public final Uri nodeUri() {
    return this.nodeUri;
  }

  @Override
  public final Uri laneUri() {
    return this.laneUri;
  }

  @Override
  public final Value linkKey() {
    return linkContext().linkKey();
  }

  @Override
  public DownlinkAddress cellAddressDown() {
    final CellContext cellContext = cellContext();
    final CellAddress cellAddress = cellContext != null ? cellContext.cellAddress() : null;
    return new DownlinkAddress(cellAddress, linkKey());
  }

  @Override
  public boolean isConnectedDown() {
    return true;
  }

  @Override
  public boolean isRemoteDown() {
    return false;
  }

  @Override
  public boolean isSecureDown() {
    return true;
  }

  @Override
  public String securityProtocolDown() {
    return null;
  }

  @Override
  public String cipherSuiteDown() {
    return null;
  }

  @Override
  public InetSocketAddress localAddressDown() {
    return null;
  }

  @Override
  public final Identity localIdentityDown() {
    return null;
  }

  @Override
  public Principal localPrincipalDown() {
    return null;
  }

  public Collection<Certificate> localCertificatesDown() {
    return FingerTrieSeq.empty();
  }

  @Override
  public InetSocketAddress remoteAddressDown() {
    return null;
  }

  @Override
  public final Identity remoteIdentityDown() {
    return null;
  }

  @Override
  public Principal remotePrincipalDown() {
    return null;
  }

  public Collection<Certificate> remoteCertificatesDown() {
    return FingerTrieSeq.empty();
  }

  public boolean isConnected() {
    return linkContext().isConnectedUp();
  }

  public boolean isRemote() {
    return linkContext().isRemoteUp();
  }

  public boolean isSecure() {
    return linkContext().isSecureUp();
  }

  public String securityProtocol() {
    return linkContext().securityProtocolUp();
  }

  public String cipherSuite() {
    return linkContext().cipherSuiteUp();
  }

  public InetSocketAddress localAddress() {
    return linkContext().localAddressUp();
  }

  public Identity localIdentity() {
    return linkContext().localIdentityUp();
  }

  public Principal localPrincipal() {
    return linkContext().localPrincipalUp();
  }

  public Collection<Certificate> localCertificates() {
    return linkContext().localCertificatesUp();
  }

  public InetSocketAddress remoteAddress() {
    return linkContext().remoteAddressUp();
  }

  public Identity remoteIdentity() {
    return linkContext().remoteIdentityUp();
  }

  public Principal remotePrincipal() {
    return linkContext().remotePrincipalUp();
  }

  public Collection<Certificate> remoteCertificates() {
    return linkContext().remoteCertificatesUp();
  }

  @Override
  public abstract void reopen();

  @Override
  public abstract void openDown();

  @Override
  public abstract void closeDown();

  @Override
  public abstract void didConnect();

  @Override
  public abstract void didDisconnect();

  @Override
  public abstract void didCloseUp();

  @Override
  public abstract void didFail(Throwable error);

  @Override
  public void traceDown(Object message) {
    // nop
  }

  @Override
  public void debugDown(Object message) {
    // nop
  }

  @Override
  public void infoDown(Object message) {
    // nop
  }

  @Override
  public void warnDown(Object message) {
    // nop
  }

  @Override
  public void errorDown(Object message) {
    // nop
  }

  @Override
  public void failDown(Object message) {
    // nop
  }

  @Override
  public void trace(Object message) {
    linkContext().traceUp(message);
  }

  @Override
  public void debug(Object message) {
    linkContext().debugUp(message);
  }

  @Override
  public void info(Object message) {
    linkContext().infoUp(message);
  }

  @Override
  public void warn(Object message) {
    linkContext().warnUp(message);
  }

  @Override
  public void error(Object message) {
    linkContext().errorUp(message);
  }

  @Override
  public void fail(Object message) {
    linkContext().failUp(message);
  }
}
