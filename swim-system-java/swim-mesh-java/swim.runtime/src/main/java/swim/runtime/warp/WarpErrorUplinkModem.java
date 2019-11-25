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

package swim.runtime.warp;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import swim.api.auth.Identity;
import swim.collections.FingerTrieSeq;
import swim.runtime.LinkAddress;
import swim.runtime.LinkBinding;
import swim.runtime.NodeBinding;
import swim.runtime.Push;
import swim.runtime.WarpBinding;
import swim.runtime.WarpContext;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.UnlinkedResponse;

public class WarpErrorUplinkModem implements WarpContext {
  protected final WarpBinding linkBinding;
  protected final Value body;
  volatile int status;

  public WarpErrorUplinkModem(WarpBinding linkBinding, Value body) {
    this.linkBinding = linkBinding;
    this.body = body;
  }

  @Override
  public final WarpBinding linkWrapper() {
    return this.linkBinding.linkWrapper();
  }

  public final WarpBinding linkBinding() {
    return this.linkBinding;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapLink(Class<T> linkClass) {
    if (linkClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public Value linkKey() {
    return Value.absent(); // never opened
  }

  @Override
  public LinkAddress cellAddressUp() {
    return null;
  }

  @Override
  public boolean isConnectedUp() {
    return true;
  }

  @Override
  public boolean isRemoteUp() {
    return false;
  }

  @Override
  public boolean isSecureUp() {
    return true;
  }

  @Override
  public String securityProtocolUp() {
    return null;
  }

  @Override
  public String cipherSuiteUp() {
    return null;
  }

  @Override
  public InetSocketAddress localAddressUp() {
    return null;
  }

  @Override
  public Identity localIdentityUp() {
    return null;
  }

  @Override
  public Principal localPrincipalUp() {
    return null;
  }

  @Override
  public Collection<Certificate> localCertificatesUp() {
    return FingerTrieSeq.empty();
  }

  @Override
  public InetSocketAddress remoteAddressUp() {
    return null;
  }

  @Override
  public Identity remoteIdentityUp() {
    return null;
  }

  @Override
  public Principal remotePrincipalUp() {
    return null;
  }

  @Override
  public Collection<Certificate> remoteCertificatesUp() {
    return FingerTrieSeq.empty();
  }

  public void cueDown() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus | FEEDING_DOWN;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      this.linkBinding.feedDown();
    }
  }

  @Override
  public void pullDown() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~FEEDING_DOWN;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      final UnlinkedResponse response = getUnlinkedResponse();
      this.linkBinding.pushDown(new Push<UnlinkedResponse>(Uri.empty(), this.linkBinding.hostUri(), this.linkBinding.nodeUri(),
                                                           this.linkBinding.laneUri(), this.linkBinding.prio(), null, response, null));
    } else {
      this.linkBinding.skipDown();
    }
  }

  @Override
  public void feedUp() {
    // nop
  }

  @Override
  public void pushUp(Push<?> push) {
    // nop
  }

  @Override
  public void skipUp() {
    // nop
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    // nop
  }

  @Override
  public void closeUp() {
    // nop
  }

  @Override
  public void didOpenDown() {
    // nop
  }

  @Override
  public void didCloseDown() {
    // nop
  }

  protected UnlinkedResponse getUnlinkedResponse() {
    return new UnlinkedResponse(this.linkBinding.nodeUri(), this.linkBinding.laneUri(), this.body);
  }

  @Override
  public void traceUp(Object message) {
    // nop
  }

  @Override
  public void debugUp(Object message) {
    // nop
  }

  @Override
  public void infoUp(Object message) {
    // nop
  }

  @Override
  public void warnUp(Object message) {
    // nop
  }

  @Override
  public void errorUp(Object message) {
    // nop
  }

  @Override
  public void failUp(Object message) {
    // nop
  }

  static final int FEEDING_DOWN = 1 << 0;

  static final AtomicIntegerFieldUpdater<WarpErrorUplinkModem> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(WarpErrorUplinkModem.class, "status");
}
