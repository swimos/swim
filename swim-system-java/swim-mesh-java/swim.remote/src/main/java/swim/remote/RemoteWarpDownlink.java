// Copyright 2015-2021 Swim inc.
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
import swim.concurrent.Cont;
import swim.concurrent.PullContext;
import swim.concurrent.PullRequest;
import swim.concurrent.StayContext;
import swim.io.warp.WarpSocketContext;
import swim.runtime.CellContext;
import swim.runtime.LinkAddress;
import swim.runtime.LinkBinding;
import swim.runtime.LinkContext;
import swim.runtime.NodeBinding;
import swim.runtime.Push;
import swim.runtime.WarpBinding;
import swim.runtime.WarpContext;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.Envelope;
import swim.warp.EventMessage;
import swim.warp.LinkRequest;
import swim.warp.SyncRequest;

class RemoteWarpDownlink implements WarpBinding, PullRequest<Envelope> {

  final RemoteHost host;
  Uri hostUri;
  final Uri remoteNodeUri;
  Uri nodeUri;
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
    this.hostUri = Uri.empty();
    this.remoteNodeUri = remoteNodeUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
    this.prio = prio;
    this.rate = rate;
    this.body = body;
    this.upQueue = new ConcurrentLinkedQueue<Envelope>();
    this.linkContext = null;
    this.pullContext = null;
    this.status = 0;
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
    if (linkClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else if (this.linkContext != null) {
      return this.linkContext.unwrapLink(linkClass);
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomLink(Class<T> linkClass) {
    T link = null;
    if (this.linkContext != null) {
      link = this.linkContext.bottomLink(linkClass);
    }
    if (link == null && linkClass.isAssignableFrom(this.getClass())) {
      link = (T) this;
    }
    return link;
  }

  @Override
  public final Uri meshUri() {
    return Uri.empty();
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
  public Value linkKey() {
    return this.linkContext.linkKey();
  }

  @Override
  public LinkAddress cellAddressDown() {
    return this.host.cellAddress().nodeUri(this.nodeUri).laneUri(this.laneUri).linkKey(this.linkKey());
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
    do {
      final int oldStatus = RemoteWarpDownlink.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & RemoteWarpDownlink.PULLING_DOWN) == 0) {
        newStatus = oldStatus & ~RemoteWarpDownlink.FEEDING_DOWN | RemoteWarpDownlink.PULLING_DOWN;
      } else {
        newStatus = oldStatus | RemoteWarpDownlink.FEEDING_DOWN;
      }
      if (RemoteWarpDownlink.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if ((oldStatus & RemoteWarpDownlink.PULLING_DOWN) == 0) {
          final WarpSocketContext warpSocketContext = this.host.warpSocketContext;
          if (warpSocketContext != null) {
            warpSocketContext.feed(this);
          }
        }
        break;
      }
    } while (true);
  }

  @Override
  public void pull(PullContext<? super Envelope> pullContext) {
    this.pullContext = pullContext;
    this.linkContext.pullDown();
  }

  @Override
  public void drop(Throwable reason) {
    // nop
  }

  @Override
  public boolean stay(StayContext context, int backlog) {
    return true;
  }

  @Override
  public void pushDown(Push<?> push) {
    final Object message = push.message();
    if (message instanceof Envelope) {
      do {
        final int oldStatus = RemoteWarpDownlink.STATUS.get(this);
        final int newStatus = oldStatus & ~RemoteWarpDownlink.PULLING_DOWN;
        if (RemoteWarpDownlink.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          if (oldStatus != newStatus) {
            final Envelope remoteEnvelope = ((Envelope) message).nodeUri(this.remoteNodeUri);
            final PullContext<? super Envelope> pullContext = this.pullContext;
            if (pullContext != null) {
              pullContext.push(remoteEnvelope);
              this.pullContext = null;
              if (remoteEnvelope instanceof EventMessage) {
                RemoteHost.DOWNLINK_EVENT_DELTA.incrementAndGet(this.host);
                this.host.didUpdateMetrics();
              }
            }
          }
          break;
        }
      } while (true);
    } else {
      push.trap(new LinkException("unsupported message: " + message));
    }
  }

  @Override
  public void skipDown() {
    do {
      final int oldStatus = RemoteWarpDownlink.STATUS.get(this);
      final int newStatus = oldStatus & ~RemoteWarpDownlink.PULLING_DOWN;
      if (RemoteWarpDownlink.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if (oldStatus != newStatus) {
          final PullContext<? super Envelope> pullContext = this.pullContext;
          if (pullContext != null) {
            pullContext.skip();
            this.pullContext = null;
          }
        }
        break;
      }
    } while (true);
  }

  public void queueUp(Envelope envelope) {
    this.upQueue.add(envelope);
    do {
      final int oldStatus = RemoteWarpDownlink.STATUS.get(this);
      int newStatus = oldStatus | RemoteWarpDownlink.FEEDING_UP;
      if (envelope instanceof SyncRequest) {
        newStatus |= RemoteWarpDownlink.SYNC;
      }
      if (RemoteWarpDownlink.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if ((oldStatus & RemoteWarpDownlink.FEEDING_UP) != (newStatus & RemoteWarpDownlink.FEEDING_UP)) {
          this.linkContext.feedUp();
        }
        break;
      }
    } while (true);
  }

  @Override
  public void pullUp() {
    final Envelope envelope = this.upQueue.poll();
    do {
      final int oldStatus = RemoteWarpDownlink.STATUS.get(this);
      final int newStatus = oldStatus & ~RemoteWarpDownlink.FEEDING_UP;
      if (RemoteWarpDownlink.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        try {
          if (envelope != null) {
            this.linkContext.pushUp(new Push<Envelope>(Uri.empty(), Uri.empty(), this.nodeUri, this.laneUri,
                                                       this.prio, this.host.remoteIdentity(), envelope, null));
          }
          this.feedUpQueue();
        } catch (Throwable error) {
          if (Cont.isNonFatal(error)) {
            this.linkContext.didFailDown(error);
          } else {
            throw error;
          }
        }
        break;
      }
    } while (true);
  }

  void feedUpQueue() {
    do {
      final int oldStatus = RemoteWarpDownlink.STATUS.get(this);
      final int newStatus;
      if (!this.upQueue.isEmpty()) {
        newStatus = oldStatus | RemoteWarpDownlink.FEEDING_UP;
      } else {
        newStatus = oldStatus;
      }
      if (RemoteWarpDownlink.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if (oldStatus != newStatus) {
          try {
            this.linkContext.feedUp();
          } catch (Throwable error) {
            if (Cont.isNonFatal(error)) {
              this.linkContext.didFailDown(error);
            } else {
              throw error;
            }
          }
        }
        break;
      }
    } while (true);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.host.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public void reopen() {
    this.linkContext.closeUp();
    do {
      final int oldStatus = RemoteWarpDownlink.STATUS.get(this);
      final int newStatus = oldStatus & ~RemoteWarpDownlink.FEEDING_UP;
      if (RemoteWarpDownlink.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        this.host.hostContext.openDownlink(this);
        this.linkContext.didOpenDown();
        final Envelope request;
        if ((oldStatus & RemoteWarpDownlink.SYNC) != 0) {
          request = new SyncRequest(this.nodeUri, this.laneUri, this.prio, this.rate, this.body);
        } else {
          request = new LinkRequest(this.nodeUri, this.laneUri, this.prio, this.rate, this.body);
        }
        this.queueUp(request);
        break;
      }
    } while (true);
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
    // hook
  }

  @Override
  public void didDisconnect() {
    // hook
  }

  @Override
  public void didCloseUp() {
    // hook
  }

  @Override
  public void didFailUp(Throwable error) {
    try {
      this.didFail(error);
    } finally {
      this.closeDown();
    }
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
