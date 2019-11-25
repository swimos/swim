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

package swim.remote;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import swim.api.LinkException;
import swim.api.auth.Identity;
import swim.concurrent.PullContext;
import swim.concurrent.PullRequest;
import swim.runtime.DownlinkAddress;
import swim.runtime.LinkAddress;
import swim.runtime.LinkBinding;
import swim.runtime.LinkKeys;
import swim.runtime.NodeBinding;
import swim.runtime.Push;
import swim.runtime.WarpBinding;
import swim.runtime.WarpContext;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.Envelope;

class RemoteWarpUplink implements WarpContext, PullRequest<Envelope> {
  final RemoteHost host;
  final WarpBinding link;
  final Uri remoteNodeUri;
  final Value linkKey;
  final ConcurrentLinkedQueue<Envelope> downQueue;
  PullContext<? super Envelope> pullContext;
  volatile int status;

  RemoteWarpUplink(RemoteHost host, WarpBinding link, Uri remoteNodeUri, Value linkKey) {
    this.host = host;
    this.link = link;
    this.remoteNodeUri = remoteNodeUri;
    this.linkKey = linkKey.commit();
    this.downQueue = new ConcurrentLinkedQueue<Envelope>();
  }

  RemoteWarpUplink(RemoteHost host, WarpBinding link, Uri remoteNodeUri) {
    this(host, link, remoteNodeUri, LinkKeys.generateLinkKey());
  }

  @Override
  public final WarpBinding linkWrapper() {
    return this.link.linkWrapper();
  }

  public final WarpBinding linkBinding() {
    return this.link;
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

  public final Uri nodeUri() {
    return this.link.nodeUri();
  }

  public final Uri laneUri() {
    return this.link.laneUri();
  }

  public final Value linkKey() {
    return this.linkKey;
  }

  @Override
  public LinkAddress cellAddressUp() {
    return new DownlinkAddress(this.host.cellAddress(), linkKey());
  }

  public final float prio() {
    return this.link.prio();
  }

  @Override
  public boolean isConnectedUp() {
    return this.host.isConnected();
  }

  @Override
  public boolean isRemoteUp() {
    return this.host.isRemote();
  }

  @Override
  public boolean isSecureUp() {
    return this.host.isSecure();
  }

  @Override
  public String securityProtocolUp() {
    return this.host.securityProtocol();
  }

  @Override
  public String cipherSuiteUp() {
    return this.host.cipherSuite();
  }

  @Override
  public InetSocketAddress localAddressUp() {
    return this.host.localAddress();
  }

  @Override
  public Identity localIdentityUp() {
    return this.host.localIdentity();
  }

  @Override
  public Principal localPrincipalUp() {
    return this.host.localPrincipal();
  }

  @Override
  public Collection<Certificate> localCertificatesUp() {
    return this.host.localCertificates();
  }

  @Override
  public InetSocketAddress remoteAddressUp() {
    return this.host.remoteAddress();
  }

  @Override
  public Identity remoteIdentityUp() {
    return this.host.remoteIdentity();
  }

  @Override
  public Principal remotePrincipalUp() {
    return this.host.remotePrincipal();
  }

  @Override
  public Collection<Certificate> remoteCertificatesUp() {
    return this.host.remoteCertificates();
  }

  public void queueDown(Envelope envelope) {
    this.downQueue.add(envelope);
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus | FEEDING_DOWN;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      this.link.feedDown();
    }
  }

  @Override
  public void pullDown() {
    final Envelope envelope = this.downQueue.poll();
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~FEEDING_DOWN;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (envelope != null) {
      this.link.pushDown(new Push<Envelope>(Uri.empty(), Uri.empty(), this.link.nodeUri(), this.link.laneUri(),
                                            this.link.prio(), this.host.remoteIdentity(), envelope, null));
    }
    feedDownQueue();
  }

  void feedDownQueue() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if (!this.downQueue.isEmpty()) {
        newStatus = oldStatus | FEEDING_DOWN;
      } else {
        newStatus = oldStatus;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      this.link.feedDown();
    }
  }

  @Override
  public void feedUp() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & PULLING_UP) == 0) {
        newStatus = oldStatus & ~FEEDING_UP | PULLING_UP;
      } else {
        newStatus = oldStatus | FEEDING_UP;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & PULLING_UP) == 0) {
      this.host.warpSocketContext.feed(this);
    }
  }

  @Override
  public void pull(PullContext<? super Envelope> pullContext) {
    this.pullContext = pullContext;
    this.link.pullUp();
  }

  @Override
  public void pushUp(Push<?> push) {
    final Object message = push.message();
    if (message instanceof Envelope) {
      int oldStatus;
      int newStatus;
      do {
        oldStatus = this.status;
        newStatus = oldStatus & ~PULLING_UP;
      } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
      if (oldStatus != newStatus && this.pullContext != null) {
        final Envelope remoteEnvelope = ((Envelope) message).nodeUri(this.remoteNodeUri);
        this.pullContext.push(remoteEnvelope);
        this.pullContext = null;
        push.bind();
      }
    } else {
      push.trap(new LinkException("unsupported message: " + message));
    }
  }

  @Override
  public void skipUp() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~PULLING_UP;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus && this.pullContext != null) {
      this.pullContext.skip();
      this.pullContext = null;
    }
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.host.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void closeUp() {
    this.host.closeUplink(this);
  }

  @Override
  public void didOpenDown() {
    // nop
  }

  public void didConnect() {
    this.link.didConnect();
  }

  public void didDisconnect() {
    this.link.didDisconnect();
    STATUS.set(this, 0);
  }

  @Override
  public void didCloseDown() {
    this.host.closeUplink(this);
  }

  public void didCloseUp() {
    this.link.didCloseUp();
  }

  @Override
  public void traceUp(Object message) {
    this.host.trace(message);
  }

  @Override
  public void debugUp(Object message) {
    this.host.debug(message);
  }

  @Override
  public void infoUp(Object message) {
    this.host.info(message);
  }

  @Override
  public void warnUp(Object message) {
    this.host.warn(message);
  }

  @Override
  public void errorUp(Object message) {
    this.host.error(message);
  }

  @Override
  public void failUp(Object message) {
    this.host.fail(message);
  }

  static final int FEEDING_DOWN = 1 << 0;
  static final int FEEDING_UP = 1 << 1;
  static final int PULLING_UP = 1 << 2;

  static final AtomicIntegerFieldUpdater<RemoteWarpUplink> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(RemoteWarpUplink.class, "status");
}
