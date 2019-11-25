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

public class WarpProxy implements WarpBinding, WarpContext {
  protected final WarpBinding linkBinding;
  protected WarpContext linkContext;

  public WarpProxy(WarpBinding linkBinding) {
    this.linkBinding = linkBinding;
  }

  @Override
  public final WarpBinding linkWrapper() {
    return this.linkBinding.linkWrapper();
  }

  public final WarpBinding linkBinding() {
    return this.linkBinding;
  }

  @Override
  public final WarpContext linkContext() {
    return this.linkContext;
  }

  @Override
  public void setLinkContext(LinkContext linkContext) {
    this.linkContext = (WarpContext) linkContext;
    this.linkBinding.setLinkContext(this);
  }

  @Override
  public CellContext cellContext() {
    return this.linkBinding.cellContext();
  }

  @Override
  public void setCellContext(CellContext cellContext) {
    this.linkBinding.setCellContext(cellContext);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapLink(Class<T> linkClass) {
    if (linkClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.linkContext.unwrapLink(linkClass);
    }
  }

  @Override
  public Uri meshUri() {
    return this.linkBinding.meshUri();
  }

  @Override
  public Uri hostUri() {
    return this.linkBinding.hostUri();
  }

  @Override
  public Uri nodeUri() {
    return this.linkBinding.nodeUri();
  }

  @Override
  public Uri laneUri() {
    return this.linkBinding.laneUri();
  }

  @Override
  public Value linkKey() {
    return this.linkContext.linkKey();
  }

  @Override
  public LinkAddress cellAddressDown() {
    return this.linkBinding.cellAddressDown();
  }

  @Override
  public LinkAddress cellAddressUp() {
    return this.linkContext.cellAddressUp();
  }

  @Override
  public float prio() {
    return this.linkBinding.prio();
  }

  @Override
  public float rate() {
    return this.linkBinding.rate();
  }

  @Override
  public Value body() {
    return this.linkBinding.body();
  }

  @Override
  public boolean keepLinked() {
    return this.linkBinding.keepLinked();
  }

  @Override
  public boolean keepSynced() {
    return this.linkBinding.keepSynced();
  }

  @Override
  public boolean isConnectedDown() {
    return this.linkBinding.isConnectedDown();
  }

  @Override
  public boolean isRemoteDown() {
    return this.linkBinding.isRemoteDown();
  }

  @Override
  public boolean isSecureDown() {
    return this.linkBinding.isSecureDown();
  }

  @Override
  public String securityProtocolDown() {
    return this.linkBinding.securityProtocolDown();
  }

  @Override
  public String cipherSuiteDown() {
    return this.linkBinding.cipherSuiteDown();
  }

  @Override
  public InetSocketAddress localAddressDown() {
    return this.linkBinding.localAddressDown();
  }

  @Override
  public Identity localIdentityDown() {
    return this.linkBinding.localIdentityDown();
  }

  @Override
  public Principal localPrincipalDown() {
    return this.linkBinding.localPrincipalDown();
  }

  @Override
  public Collection<Certificate> localCertificatesDown() {
    return this.linkBinding.localCertificatesDown();
  }

  @Override
  public InetSocketAddress remoteAddressDown() {
    return this.linkBinding.remoteAddressDown();
  }

  @Override
  public Identity remoteIdentityDown() {
    return this.linkBinding.remoteIdentityDown();
  }

  @Override
  public Principal remotePrincipalDown() {
    return this.linkBinding.remotePrincipalDown();
  }

  @Override
  public Collection<Certificate> remoteCertificatesDown() {
    return this.linkBinding.remoteCertificatesDown();
  }

  @Override
  public boolean isConnectedUp() {
    return this.linkContext.isConnectedUp();
  }

  @Override
  public boolean isRemoteUp() {
    return this.linkContext.isRemoteUp();
  }

  @Override
  public boolean isSecureUp() {
    return this.linkContext.isSecureUp();
  }

  @Override
  public String securityProtocolUp() {
    return this.linkContext.securityProtocolUp();
  }

  @Override
  public String cipherSuiteUp() {
    return this.linkContext.cipherSuiteUp();
  }

  @Override
  public InetSocketAddress localAddressUp() {
    return this.linkContext.localAddressUp();
  }

  @Override
  public Identity localIdentityUp() {
    return this.linkContext.localIdentityUp();
  }

  @Override
  public Principal localPrincipalUp() {
    return this.linkContext.localPrincipalUp();
  }

  @Override
  public Collection<Certificate> localCertificatesUp() {
    return this.linkContext.localCertificatesUp();
  }

  @Override
  public InetSocketAddress remoteAddressUp() {
    return this.linkContext.remoteAddressUp();
  }

  @Override
  public Identity remoteIdentityUp() {
    return this.linkContext.remoteIdentityUp();
  }

  @Override
  public Principal remotePrincipalUp() {
    return this.linkContext.remotePrincipalUp();
  }

  @Override
  public Collection<Certificate> remoteCertificatesUp() {
    return this.linkContext.remoteCertificatesUp();
  }

  @Override
  public void feedDown() {
    this.linkBinding.feedDown();
  }

  @Override
  public void pullDown() {
    this.linkContext.pullDown();
  }

  @Override
  public void pushDown(Push<?> push) {
    this.linkBinding.pushDown(push);
  }

  @Override
  public void skipDown() {
    this.linkBinding.skipDown();
  }

  @Override
  public void openDown() {
    this.linkBinding.openDown();
  }

  @Override
  public void closeDown() {
    this.linkBinding.closeDown();
  }

  @Override
  public void feedUp() {
    this.linkContext.feedUp();
  }

  @Override
  public void pullUp() {
    this.linkBinding.pullUp();
  }

  @Override
  public void pushUp(Push<?> push) {
    this.linkContext.pushUp(push);
  }

  @Override
  public void skipUp() {
    this.linkContext.skipUp();
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.linkContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.linkBinding.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public void closeUp() {
    this.linkContext.closeUp();
  }

  @Override
  public void reopen() {
    this.linkBinding.reopen();
  }

  @Override
  public void didOpenDown() {
    this.linkContext.didOpenDown();
  }

  @Override
  public void didConnect() {
    this.linkBinding.didConnect();
  }

  @Override
  public void didDisconnect() {
    this.linkBinding.didDisconnect();
  }

  @Override
  public void didCloseDown() {
    this.linkContext.didCloseDown();
  }

  @Override
  public void didCloseUp() {
    this.linkBinding.didCloseUp();
  }

  @Override
  public void didFail(Throwable error) {
    this.linkBinding.didFail(error);
  }

  @Override
  public void traceDown(Object message) {
    this.linkBinding.traceDown(message);
  }

  @Override
  public void debugDown(Object message) {
    this.linkBinding.debugDown(message);
  }

  @Override
  public void infoDown(Object message) {
    this.linkBinding.infoDown(message);
  }

  @Override
  public void warnDown(Object message) {
    this.linkBinding.warnDown(message);
  }

  @Override
  public void errorDown(Object message) {
    this.linkBinding.errorDown(message);
  }

  @Override
  public void failDown(Object message) {
    this.linkBinding.failDown(message);
  }

  @Override
  public void traceUp(Object message) {
    this.linkContext.traceUp(message);
  }

  @Override
  public void debugUp(Object message) {
    this.linkContext.debugUp(message);
  }

  @Override
  public void infoUp(Object message) {
    this.linkContext.infoUp(message);
  }

  @Override
  public void warnUp(Object message) {
    this.linkContext.warnUp(message);
  }

  @Override
  public void errorUp(Object message) {
    this.linkContext.errorUp(message);
  }

  @Override
  public void failUp(Object message) {
    this.linkContext.failUp(message);
  }
}
