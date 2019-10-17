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
import swim.api.auth.Identity;
import swim.concurrent.PullContext;
import swim.concurrent.PullRequest;
import swim.runtime.CellContext;
import swim.runtime.LinkAddress;
import swim.runtime.LinkBinding;
import swim.runtime.LinkContext;
import swim.runtime.NodeBinding;
import swim.runtime.WarpBinding;
import swim.runtime.WarpContext;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.Envelope;
import swim.warp.LinkRequest;
import swim.warp.SyncRequest;

class RemoteWarpDownlink implements WarpBinding, PullRequest<Envelope> {
  final RemoteHost host;
  final Uri remoteNodeUri;
  final Uri nodeUri;
  final Uri laneUri;
  final float prio;
  final float rate;
  final Value body;

  final ConcurrentLinkedQueue<Envelope> upQueue;
  WarpContext linkContext;
  PullContext<? super Envelope> pullContext;
  volatile int status;

  RemoteWarpDownlink(RemoteHost host, Uri remoteNodeUri, Uri nodeUri,
                     Uri laneUri, float prio, float rate, Value body) {
    this.host = host;
    this.remoteNodeUri = remoteNodeUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
    this.prio = prio;
    this.rate = rate;
    this.body = body;
    this.upQueue = new ConcurrentLinkedQueue<Envelope>();
  }

  @Override
  public final WarpBinding linkWrapper() {
    return this;
  }

  @Override
  public final WarpContext linkContext() {
    return this.linkContext;
  }

  @Override
  public void setLinkContext(LinkContext linkContext) {
    this.linkContext = (WarpContext) linkContext;
  }

  @Override
  public CellContext cellContext() {
    return null;
  }

  @Override
  public void setCellContext(CellContext cellContext) {
    // nop
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapLink(Class<T> linkClass) {
    if (linkClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else if (this.linkContext != null) {
      return this.linkContext.unwrapLink(linkClass);
    } else {
      return null;
    }
  }

  @Override
  public final Uri meshUri() {
    return Uri.empty();
  }

  @Override
  public final Uri hostUri() {
    return Uri.empty();
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
  public Value linkKey() {
    return this.linkContext.linkKey();
  }

  @Override
  public LinkAddress cellAddressDown() {
    return this.host.cellAddress().nodeUri(this.nodeUri).laneUri(this.laneUri).linkKey(linkKey());
  }

  @Override
  public final float prio() {
    return this.prio;
  }

  @Override
  public final float rate() {
    return this.rate;
  }

  @Override
  public final Value body() {
    return this.body;
  }

  @Override
  public boolean keepLinked() {
    return false;
  }

  @Override
  public boolean keepSynced() {
    return false;
  }

  @Override
  public boolean isConnectedDown() {
    return this.host.isConnected();
  }

  @Override
  public boolean isRemoteDown() {
    return this.host.isRemote();
  }

  @Override
  public boolean isSecureDown() {
    return this.host.isSecure();
  }

  @Override
  public String securityProtocolDown() {
    return this.host.securityProtocol();
  }

  @Override
  public String cipherSuiteDown() {
    return this.host.cipherSuite();
  }

  @Override
  public InetSocketAddress localAddressDown() {
    return this.host.localAddress();
  }

  @Override
  public Identity localIdentityDown() {
    return this.host.localIdentity();
  }

  @Override
  public Principal localPrincipalDown() {
    return this.host.localPrincipal();
  }

  @Override
  public Collection<Certificate> localCertificatesDown() {
    return this.host.localCertificates();
  }

  @Override
  public InetSocketAddress remoteAddressDown() {
    return this.host.remoteAddress();
  }

  @Override
  public Identity remoteIdentityDown() {
    return this.host.remoteIdentity();
  }

  @Override
  public Principal remotePrincipalDown() {
    return this.host.remotePrincipal();
  }

  @Override
  public Collection<Certificate> remoteCertificatesDown() {
    return this.host.remoteCertificates();
  }

  @Override
  public void feedDown() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & PULLING_DOWN) == 0) {
        newStatus = oldStatus & ~FEEDING_DOWN | PULLING_DOWN;
      } else {
        newStatus = oldStatus | FEEDING_DOWN;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & PULLING_DOWN) == 0) {
      this.host.warpSocketContext.feed(this);
    }
  }

  @Override
  public void pull(PullContext<? super Envelope> pullContext) {
    this.pullContext = pullContext;
    this.linkContext.pullDown();
  }

  @Override
  public void pushDown(Envelope envelope) {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~PULLING_DOWN;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      final Envelope remoteEnvelope = envelope.nodeUri(this.remoteNodeUri);
      this.pullContext.push(remoteEnvelope);
      this.pullContext = null;
    }
  }

  @Override
  public void skipDown() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~PULLING_DOWN;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      this.pullContext.skip();
      this.pullContext = null;
    }
  }

  public void queueUp(Envelope envelope) {
    this.upQueue.add(envelope);
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus | FEEDING_UP;
      if (envelope instanceof SyncRequest) {
        newStatus |= SYNC;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & FEEDING_UP) != (newStatus & FEEDING_UP)) {
      this.linkContext.feedUp();
    }
  }

  @Override
  public void pullUp() {
    final Envelope envelope = this.upQueue.poll();
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~FEEDING_UP;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (envelope != null) {
      this.linkContext.pushUp(envelope);
    }
    feedUpQueue();
  }

  void feedUpQueue() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if (!this.upQueue.isEmpty()) {
        newStatus = oldStatus | FEEDING_UP;
      } else {
        newStatus = oldStatus;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      this.linkContext.feedUp();
    }
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.host.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public void reopen() {
    this.linkContext.closeUp();
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~FEEDING_UP;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));

    this.host.hostContext.openDownlink(this);
    this.linkContext.didOpenDown();
    final Envelope request;
    if ((oldStatus & SYNC) != 0) {
      request = new SyncRequest(this.nodeUri, this.laneUri, this.prio, this.rate, this.body);
    } else {
      request = new LinkRequest(this.nodeUri, this.laneUri, this.prio, this.rate, this.body);
    }
    queueUp(request);
  }

  @Override
  public void openDown() {
    this.linkContext.didOpenDown();
  }

  @Override
  public void closeDown() {
    this.linkContext.didCloseDown();
  }

  @Override
  public void didConnect() {
    // nop
  }

  @Override
  public void didDisconnect() {
    // nop
  }

  @Override
  public void didCloseUp() {
    // nop
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
  }

  @Override
  public void traceDown(Object message) {
    this.host.trace(message);
  }

  @Override
  public void debugDown(Object message) {
    this.host.debug(message);
  }

  @Override
  public void infoDown(Object message) {
    this.host.info(message);
  }

  @Override
  public void warnDown(Object message) {
    this.host.warn(message);
  }

  @Override
  public void errorDown(Object message) {
    this.host.error(message);
  }

  @Override
  public void failDown(Object message) {
    this.host.fail(message);
  }

  static final int FEEDING_DOWN = 1 << 0;
  static final int PULLING_DOWN = 1 << 1;
  static final int FEEDING_UP = 1 << 2;
  static final int SYNC = 1 << 3;

  static final AtomicIntegerFieldUpdater<RemoteWarpDownlink> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(RemoteWarpDownlink.class, "status");
}
