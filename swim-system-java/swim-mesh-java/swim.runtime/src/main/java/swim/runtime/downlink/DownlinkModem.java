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

package swim.runtime.downlink;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import swim.api.auth.Identity;
import swim.collections.FingerTrieSeq;
import swim.runtime.CellContext;
import swim.runtime.LinkBinding;
import swim.runtime.LinkContext;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;
import swim.warp.CommandMessage;
import swim.warp.Envelope;
import swim.warp.EventMessage;
import swim.warp.LinkRequest;
import swim.warp.LinkedResponse;
import swim.warp.SyncRequest;
import swim.warp.SyncedResponse;
import swim.warp.UnlinkRequest;
import swim.warp.UnlinkedResponse;

public abstract class DownlinkModem implements LinkBinding, Log {
  protected LinkContext linkContext;

  protected CellContext cellContext;

  protected final Uri meshUri;

  protected final Uri hostUri;

  protected final Uri nodeUri;

  protected final Uri laneUri;

  protected final float prio;

  protected final float rate;

  protected final Value body;

  protected volatile int status;

  public DownlinkModem(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                       float prio, float rate, Value body) {
    this.meshUri = meshUri;
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
    this.prio = prio;
    this.rate = rate;
    this.body = body;
  }

  @Override
  public final LinkBinding linkWrapper() {
    return this;
  }

  @Override
  public final LinkContext linkContext() {
    return this.linkContext;
  }

  @Override
  public void setLinkContext(LinkContext linkContext) {
    this.linkContext = linkContext;
  }

  @Override
  public final CellContext cellContext() {
    return this.cellContext;
  }

  @Override
  public void setCellContext(CellContext cellContext) {
    this.cellContext = cellContext;
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
  public abstract boolean keepLinked();

  @Override
  public abstract boolean keepSynced();

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
    return this.linkContext.isConnectedUp();
  }

  public boolean isRemote() {
    return this.linkContext.isRemoteUp();
  }

  public boolean isSecure() {
    return this.linkContext.isSecureUp();
  }

  public String securityProtocol() {
    return this.linkContext.securityProtocolUp();
  }

  public String cipherSuite() {
    return this.linkContext.cipherSuiteUp();
  }

  public InetSocketAddress localAddress() {
    return this.linkContext.localAddressUp();
  }

  public Identity localIdentity() {
    return this.linkContext.localIdentityUp();
  }

  public Principal localPrincipal() {
    return this.linkContext.localPrincipalUp();
  }

  public Collection<Certificate> localCertificates() {
    return this.linkContext.localCertificatesUp();
  }

  public InetSocketAddress remoteAddress() {
    return this.linkContext.remoteAddressUp();
  }

  public Identity remoteIdentity() {
    return this.linkContext.remoteIdentityUp();
  }

  public Principal remotePrincipal() {
    return this.linkContext.remotePrincipalUp();
  }

  public Collection<Certificate> remoteCertificates() {
    return this.linkContext.remoteCertificatesUp();
  }

  public void cueDown() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & FEEDING_DOWN) != 0) {
        newStatus = oldStatus & ~FEEDING_DOWN | PULLING_DOWN;
      } else {
        newStatus = oldStatus & ~PULLING_DOWN;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & FEEDING_DOWN) != 0) {
      this.linkContext.pullDown();
    }
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
      this.linkContext.pullDown();
    }
  }

  @Override
  public void pushDown(Envelope envelope) {
    if (envelope instanceof EventMessage) {
      pushDownEvent((EventMessage) envelope);
    } else if (envelope instanceof LinkedResponse) {
      pushDownLinked((LinkedResponse) envelope);
    } else if (envelope instanceof SyncedResponse) {
      pushDownSynced((SyncedResponse) envelope);
    } else if (envelope instanceof UnlinkedResponse) {
      pushDownUnlinked((UnlinkedResponse) envelope);
    } else {
      pushDownEnvelope(envelope);
    }
  }

  protected void pushDownEvent(EventMessage message) {
    try {
      onEvent(message);
    } finally {
      cueDown();
    }
  }

  protected void pushDownLinked(LinkedResponse response) {
    try {
      didLink(response);
    } finally {
      cueDown();
    }
  }

  protected void pushDownSynced(SyncedResponse response) {
    try {
      didSync(response);
    } finally {
      cueDown();
    }
  }

  protected void pushDownUnlinked(UnlinkedResponse response) {
    didUnlink(response);
    // Don't cueDown
  }

  protected void pushDownEnvelope(Envelope envelope) {
    // nop
  }

  @Override
  public void skipDown() {
    cueDown();
  }

  protected boolean upQueueIsEmpty() {
    return true;
  }

  protected void queueUp(Value body) {
    throw new UnsupportedOperationException();
  }

  protected Value nextUpQueue() {
    return null;
  }

  protected CommandMessage nextUpQueueCommand() {
    final Value body = nextUpQueue();
    if (body != null) {
      return new CommandMessage(this.nodeUri, this.laneUri, body);
    } else {
      return null;
    }
  }

  protected Value nextUpCue() {
    return null;
  }

  protected CommandMessage nextUpCueCommand() {
    final Value body = nextUpCue();
    if (body != null) {
      return new CommandMessage(this.nodeUri, this.laneUri, body);
    } else {
      return null;
    }
  }

  public void pushUp(Value body) {
    queueUp(body);
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus | FEEDING_UP;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      this.linkContext.feedUp();
    }
  }

  public void cueUp() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus | FEEDING_UP | CUED_UP;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & FEEDING_UP) == 0) {
      this.linkContext.feedUp();
    }
  }

  protected void feedUp() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & CUED_UP) != 0 || !upQueueIsEmpty()) {
        newStatus = oldStatus | FEEDING_UP;
      } else {
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (oldStatus != newStatus) {
      this.linkContext.feedUp();
    }
  }

  @Override
  public void pullUp() {
    int oldStatus;
    int newStatus;
    do  {
      oldStatus = this.status;
      if ((oldStatus & UNLINK) != 0) {
        newStatus = oldStatus & ~(UNLINK | FEEDING_UP);
      } else if ((oldStatus & SYNC) != 0) {
        newStatus = oldStatus & ~(LINK | SYNC | FEEDING_UP);
      } else if ((oldStatus & LINK) != 0) {
        newStatus = oldStatus & ~(LINK | FEEDING_UP);
      } else {
        newStatus = oldStatus & ~(CUED_UP | FEEDING_UP);
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & UNLINK) != 0) {
      final UnlinkRequest request = unlinkRequest();
      pullUpUnlink(request);
      this.linkContext.pushUp(request);
    } else if ((oldStatus & SYNC) != 0) {
      final SyncRequest request = syncRequest();
      pullUpSync(request);
      this.linkContext.pushUp(request);
      feedUp();
    } else if ((oldStatus & LINK) != 0) {
      final LinkRequest request = linkRequest();
      pullUpLink(request);
      this.linkContext.pushUp(request);
      feedUp();
    } else {
      CommandMessage message = nextUpQueueCommand();
      if (message == null && (oldStatus & CUED_UP) != 0) {
        message = nextUpCueCommand();
      }
      if (message != null) {
        pullUpCommand(message);
        this.linkContext.pushUp(message);
        feedUp();
      } else {
        this.linkContext.skipUp();
      }
    }
  }

  protected void pullUpCommand(CommandMessage message) {
    onCommand(message);
  }

  protected void pullUpLink(LinkRequest request) {
    willLink(request);
  }

  protected void pullUpSync(SyncRequest request) {
    willSync(request);
  }

  protected void pullUpUnlink(UnlinkRequest request) {
    willUnlink(request);
  }

  public void link() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & (LINKED | OPENED)) == OPENED) {
        newStatus = oldStatus | FEEDING_UP | LINKING | LINK | LINKED;
      } else {
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & FEEDING_UP) == 0 && (newStatus & FEEDING_UP) != 0 && this.linkContext != null) {
      this.linkContext.feedUp();
    }
  }

  public void sync() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & (LINKED | OPENED)) == OPENED) {
        newStatus = oldStatus | FEEDING_UP | SYNCING | SYNC | LINKING | LINK | LINKED;
      } else {
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & FEEDING_UP) == 0 && (newStatus & FEEDING_UP) != 0 && this.linkContext != null) {
      this.linkContext.feedUp();
    }
  }

  public void unlink() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & LINK) != 0) {
        newStatus = oldStatus & ~(FEEDING_UP | SYNCING | SYNC | LINKING | LINK | LINKED);
      } else if ((oldStatus & (UNLINKING | LINKED)) == LINKED) {
        newStatus = (oldStatus | FEEDING_UP | UNLINKING | UNLINK) & ~(SYNCING | SYNC | LINKING | LINK);
      } else {
        newStatus = oldStatus;
        break;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & FEEDING_UP) == 0 && (newStatus & FEEDING_UP) != 0 && this.linkContext != null) {
      this.linkContext.feedUp();
    }
  }

  public void command(float prio, Value body) {
    queueUp(body);
  }

  public void command(Value body) {
    queueUp(body);
  }

  protected LinkRequest linkRequest() {
    return new LinkRequest(this.nodeUri, this.laneUri, this.prio, this.rate, this.body);
  }

  protected SyncRequest syncRequest() {
    return new SyncRequest(this.nodeUri, this.laneUri, this.prio, this.rate, this.body);
  }

  protected UnlinkRequest unlinkRequest() {
    return new UnlinkRequest(this.nodeUri, this.laneUri, this.body);
  }

  @Override
  public void reopen() {
    // nop
  }

  @Override
  public void openDown() {
    didOpen();
    this.linkContext.didOpenDown();
    if ((this.status & FEEDING_UP) != 0) {
      this.linkContext.feedUp();
    }
  }

  protected void didOpen() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus | OPENED;
    } while (oldStatus != newStatus & !STATUS.compareAndSet(this, oldStatus, newStatus));
    if (keepLinked()) {
      if (keepSynced()) {
        sync();
      } else {
        link();
      }
    }
  }

  @Override
  public void closeDown() {
    final CellContext cellContext = this.cellContext;
    if (cellContext != null) {
      cellContext.closeDownlink(this);
    }
    didClose();
    this.linkContext.didCloseDown();
  }

  protected void didClose() {
    STATUS.set(this, 0);
  }

  protected void onEvent(EventMessage message) {
    // stub
  }

  protected void onCommand(CommandMessage message) {
    // stub
  }

  protected void willLink(LinkRequest request) {
    // stub
  }

  protected void didLink(LinkedResponse response) {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~LINKING;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
  }

  protected void willSync(SyncRequest request) {
    // stub
  }

  protected void didSync(SyncedResponse response) {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~SYNCING;
    } while (oldStatus != newStatus & !STATUS.compareAndSet(this, oldStatus, newStatus));
  }

  protected void willUnlink(UnlinkRequest request) {
    // stub
  }

  protected void didUnlink(UnlinkedResponse response) {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~(PULLING_DOWN | UNLINKING | UNLINK | SYNCING | SYNC | LINKING | LINK | LINKED);
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
  }

  @Override
  public void didConnect() {
    if (keepLinked()) {
      if (keepSynced()) {
        sync();
      } else {
        link();
      }
    }
  }

  @Override
  public void didDisconnect() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~(FEEDING_UP | UNLINKING | UNLINK | SYNCING | SYNC | LINKING | LINK | LINKED);
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
  }

  @Override
  public void didCloseUp() {
    didClose();
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
  }

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
  public void trace(Object message) {
    this.linkContext.traceUp(message);
  }

  @Override
  public void debug(Object message) {
    this.linkContext.debugUp(message);
  }

  @Override
  public void info(Object message) {
    this.linkContext.infoUp(message);
  }

  @Override
  public void warn(Object message) {
    this.linkContext.warnUp(message);
  }

  @Override
  public void error(Object message) {
    this.linkContext.errorUp(message);
  }

  static final int OPENED = 1 << 0;
  static final int LINKED = 1 << 1;
  static final int LINK = 1 << 2;
  static final int LINKING = 1 << 3;
  static final int SYNC = 1 << 4;
  static final int SYNCING = 1 << 5;
  static final int UNLINK = 1 << 6;
  static final int UNLINKING = 1 << 7;
  static final int FEEDING_DOWN = 1 << 8;
  static final int PULLING_DOWN = 1 << 9;
  static final int CUED_UP = 1 << 10;
  static final int FEEDING_UP = 1 << 11;

  static final AtomicIntegerFieldUpdater<DownlinkModem> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(DownlinkModem.class, "status");
}
