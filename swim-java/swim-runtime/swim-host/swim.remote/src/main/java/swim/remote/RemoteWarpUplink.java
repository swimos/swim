// Copyright 2015-2022 Swim.inc
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
import java.util.concurrent.atomic.AtomicLongFieldUpdater;
import swim.api.LinkException;
import swim.api.auth.Identity;
import swim.concurrent.Cont;
import swim.concurrent.PullContext;
import swim.concurrent.PullRequest;
import swim.concurrent.StayContext;
import swim.io.warp.WarpSocketContext;
import swim.structure.Value;
import swim.system.DownlinkAddress;
import swim.system.LinkAddress;
import swim.system.LinkBinding;
import swim.system.LinkKeys;
import swim.system.NodeBinding;
import swim.system.Push;
import swim.system.WarpBinding;
import swim.system.WarpContext;
import swim.uri.Uri;
import swim.warp.CommandMessage;
import swim.warp.Envelope;

class RemoteWarpUplink implements WarpContext, PullRequest<Envelope> {

  final RemoteHost host;
  final WarpBinding link;
  final Uri remoteNodeUri;
  final Value linkKey;
  final ConcurrentLinkedQueue<Push<Envelope>> downQueue;
  PullContext<? super Envelope> pullContext;
  volatile long lastFeedDownTime;
  volatile int status;

  RemoteWarpUplink(RemoteHost host, WarpBinding link, Uri remoteNodeUri, Value linkKey) {
    this.host = host;
    this.link = link;
    this.remoteNodeUri = remoteNodeUri;
    this.linkKey = linkKey.commit();
    this.downQueue = new ConcurrentLinkedQueue<Push<Envelope>>();
    this.pullContext = null;
    this.lastFeedDownTime = 0L;
    this.status = 0;
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
    if (linkClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomLink(Class<T> linkClass) {
    if (linkClass.isAssignableFrom(this.getClass())) {
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
    return new DownlinkAddress(this.host.cellAddress(), this.linkKey());
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

  public void queueDown(Push<Envelope> push) {
    this.downQueue.add(push);
    do {
      final int oldStatus = RemoteWarpUplink.STATUS.get(this);
      final int newStatus = oldStatus | RemoteWarpUplink.FEEDING_DOWN;
      if (RemoteWarpUplink.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if (oldStatus != newStatus) {
          RemoteWarpUplink.LAST_FEED_DOWN_TIME.set(this, System.currentTimeMillis());
          this.link.feedDown();
        } else {
          final long lastFeedDownTime = RemoteWarpUplink.LAST_FEED_DOWN_TIME.get(this);
          if (lastFeedDownTime != 0L) {
            final long pullDownDelay = System.currentTimeMillis() - lastFeedDownTime;
            if (pullDownDelay >= RemoteWarpUplink.MAX_PULL_DOWN_DELAY) {
              this.link.didFailUp(new RemoteHostException("exceeded maximum pull down delay"));
            }
          }
        }
        break;
      }
    } while (true);
  }

  @Override
  public void pullDown() {
    final Push<Envelope> push = this.downQueue.poll();
    do {
      final int oldStatus = RemoteWarpUplink.STATUS.get(this);
      final int newStatus = oldStatus & ~RemoteWarpUplink.FEEDING_DOWN;
      if (RemoteWarpUplink.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        try {
          if (push != null) {
            this.link.pushDown(push);
            final long feedDownTime = RemoteWarpUplink.LAST_FEED_DOWN_TIME.getAndSet(this, 0L);
            this.didPullDown(System.currentTimeMillis() - feedDownTime);
          }
          this.feedDownQueue();
        } catch (Throwable error) {
          if (Cont.isNonFatal(error)) {
            this.link.didFailUp(error);
          } else {
            throw error;
          }
        }
        break;
      }
    } while (true);
  }

  void didPullDown(long pullDownLatency) {
    // TODO: report processing latency metric
  }

  void feedDownQueue() {
    do {
      final int oldStatus = RemoteWarpUplink.STATUS.get(this);
      final int newStatus;
      if (!this.downQueue.isEmpty()) {
        newStatus = oldStatus | RemoteWarpUplink.FEEDING_DOWN;
      } else {
        newStatus = oldStatus;
      }
      if (RemoteWarpUplink.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if (oldStatus != newStatus) {
          RemoteWarpUplink.LAST_FEED_DOWN_TIME.set(this, System.currentTimeMillis());
          try {
            this.link.feedDown();
          } catch (Throwable error) {
            if (Cont.isNonFatal(error)) {
              this.link.didFailUp(error);
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
  public void feedUp() {
    do {
      final int oldStatus = RemoteWarpUplink.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & RemoteWarpUplink.PULLING_UP) == 0) {
        newStatus = oldStatus & ~RemoteWarpUplink.FEEDING_UP | RemoteWarpUplink.PULLING_UP;
      } else {
        newStatus = oldStatus | RemoteWarpUplink.FEEDING_UP;
      }
      if (RemoteWarpUplink.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if ((oldStatus & RemoteWarpUplink.PULLING_UP) == 0) {
          final long t0 = System.currentTimeMillis();
          do {
            final WarpSocketContext warpSocketContext = this.host.warpSocketContext;
            if (warpSocketContext != null) {
              warpSocketContext.feed(this);
              break;
            } else if (System.currentTimeMillis() - t0 > RemoteWarpUplink.MAX_FEED_UP_DELAY) {
              throw new RemoteHostException("exceeded maximum feed up delay");
            }
          } while (true);
        }
        break;
      }
    } while (true);
  }

  @Override
  public void pull(PullContext<? super Envelope> pullContext) {
    this.pullContext = pullContext;
    this.link.pullUp();
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
  public void pushUp(Push<?> push) {
    final Object message = push.message();
    if (message instanceof Envelope) {
      do {
        final int oldStatus = RemoteWarpUplink.STATUS.get(this);
        final int newStatus = oldStatus & ~RemoteWarpUplink.PULLING_UP;
        if (RemoteWarpUplink.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          if (oldStatus != newStatus && this.pullContext != null) {
            final Envelope remoteEnvelope = ((Envelope) message).nodeUri(this.remoteNodeUri);
            this.pullContext.push(remoteEnvelope);
            this.pullContext = null;
            push.bind();
            if (remoteEnvelope instanceof CommandMessage) {
              RemoteHost.UPLINK_COMMAND_DELTA.incrementAndGet(this.host);
              this.host.didUpdateMetrics();
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
  public void skipUp() {
    do {
      final int oldStatus = RemoteWarpUplink.STATUS.get(this);
      final int newStatus = oldStatus & ~RemoteWarpUplink.PULLING_UP;
      if (RemoteWarpUplink.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if (oldStatus != newStatus && this.pullContext != null) {
          this.pullContext.skip();
          this.pullContext = null;
        }
        break;
      }
    } while (true);
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
    // hook
  }

  public void didConnect() {
    this.link.didConnect();
  }

  public void didDisconnect() {
    this.link.didDisconnect();
    RemoteWarpUplink.STATUS.set(this, 0);
    RemoteWarpUplink.LAST_FEED_DOWN_TIME.set(this, 0L);
  }

  @Override
  public void didCloseDown() {
    this.host.closeUplink(this);
  }

  public void didCloseUp() {
    this.downQueue.clear();
    this.link.didCloseUp();
  }

  @Override
  public void didFailDown(Throwable error) {
    this.closeUp();
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

  static final long MAX_PULL_DOWN_DELAY;
  static final long MAX_FEED_UP_DELAY;

  static final AtomicLongFieldUpdater<RemoteWarpUplink> LAST_FEED_DOWN_TIME =
      AtomicLongFieldUpdater.newUpdater(RemoteWarpUplink.class, "lastFeedDownTime");

  static final AtomicIntegerFieldUpdater<RemoteWarpUplink> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(RemoteWarpUplink.class, "status");

  static {
    long maxPullDownDelay;
    try {
      maxPullDownDelay = Long.parseLong(System.getProperty("swim.remote.max.pull.down.delay"));
    } catch (NumberFormatException e) {
      maxPullDownDelay = 60L * 1000L;
    }
    MAX_PULL_DOWN_DELAY = maxPullDownDelay;

    long maxFeedUpDelay;
    try {
      maxFeedUpDelay = Long.parseLong(System.getProperty("swim.remote.max.feed.up.delay"));
    } catch (NumberFormatException e) {
      maxFeedUpDelay = 1000L;
    }
    MAX_FEED_UP_DELAY = maxFeedUpDelay;
  }

}
