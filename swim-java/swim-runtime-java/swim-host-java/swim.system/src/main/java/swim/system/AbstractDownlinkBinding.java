// Copyright 2015-2021 Swim Inc.
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

package swim.system;

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
  protected Uri hostUri;
  protected Uri nodeUri;
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
    if (linkClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return this.linkContext().unwrapLink(linkClass);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomLink(Class<T> linkClass) {
    T link = this.linkContext().bottomLink(linkClass);
    if (link == null && linkClass.isAssignableFrom(this.getClass())) {
      link = (T) this;
    }
    return link;
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
  public void setHostUri(Uri hostUri) {
    this.hostUri = hostUri;
  }

  @Override
  public final Uri nodeUri() {
    return this.nodeUri;
  }

  @Override
  public void setNodeUri(Uri nodeUri) {
    this.nodeUri = nodeUri;
  }

  @Override
  public final Uri laneUri() {
    return this.laneUri;
  }

  @Override
  public final Value linkKey() {
    return this.linkContext().linkKey();
  }

  @Override
  public DownlinkAddress cellAddressDown() {
    final CellContext cellContext = this.cellContext();
    final CellAddress cellAddress = cellContext != null ? cellContext.cellAddress() : null;
    return new DownlinkAddress(cellAddress, this.linkKey());
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
    return this.linkContext().isConnectedUp();
  }

  public boolean isRemote() {
    return this.linkContext().isRemoteUp();
  }

  public boolean isSecure() {
    return this.linkContext().isSecureUp();
  }

  public String securityProtocol() {
    return this.linkContext().securityProtocolUp();
  }

  public String cipherSuite() {
    return this.linkContext().cipherSuiteUp();
  }

  public InetSocketAddress localAddress() {
    return this.linkContext().localAddressUp();
  }

  public Identity localIdentity() {
    return this.linkContext().localIdentityUp();
  }

  public Principal localPrincipal() {
    return this.linkContext().localPrincipalUp();
  }

  public Collection<Certificate> localCertificates() {
    return this.linkContext().localCertificatesUp();
  }

  public InetSocketAddress remoteAddress() {
    return this.linkContext().remoteAddressUp();
  }

  public Identity remoteIdentity() {
    return this.linkContext().remoteIdentityUp();
  }

  public Principal remotePrincipal() {
    return this.linkContext().remotePrincipalUp();
  }

  public Collection<Certificate> remoteCertificates() {
    return this.linkContext().remoteCertificatesUp();
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
  public abstract void didFailUp(Throwable error);

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
    this.linkContext().traceUp(message);
  }

  @Override
  public void debug(Object message) {
    this.linkContext().debugUp(message);
  }

  @Override
  public void info(Object message) {
    this.linkContext().infoUp(message);
  }

  @Override
  public void warn(Object message) {
    this.linkContext().warnUp(message);
  }

  @Override
  public void error(Object message) {
    this.linkContext().errorUp(message);
  }

  @Override
  public void fail(Object message) {
    this.linkContext().failUp(message);
  }

}
