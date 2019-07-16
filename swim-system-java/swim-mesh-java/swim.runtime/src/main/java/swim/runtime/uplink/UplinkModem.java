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

package swim.runtime.uplink;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.auth.Identity;
import swim.api.function.DidClose;
import swim.api.uplink.Uplink;
import swim.api.uplink.function.OnCommand;
import swim.api.uplink.function.OnEvent;
import swim.api.uplink.function.OnLink;
import swim.api.uplink.function.OnLinked;
import swim.api.uplink.function.OnSync;
import swim.api.uplink.function.OnSynced;
import swim.api.uplink.function.OnUnlink;
import swim.api.uplink.function.OnUnlinked;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Conts;
import swim.concurrent.Stage;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.LinkContext;
import swim.runtime.LinkKeys;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;
import swim.warp.Envelope;
import swim.warp.EventMessage;
import swim.warp.LinkRequest;
import swim.warp.LinkedResponse;
import swim.warp.SyncRequest;
import swim.warp.SyncedResponse;
import swim.warp.UnlinkRequest;
import swim.warp.UnlinkedResponse;

public abstract class UplinkModem implements LinkContext, Uplink {
  protected final LinkBinding linkBinding;
  protected final Value linkKey;

  protected volatile int status;
  protected volatile Object observers; // Observer | Observer[]

  UplinkModem(LinkBinding linkBinding, Value linkKey) {
    this.linkBinding = linkBinding;
    this.linkKey = linkKey.commit();
  }

  UplinkModem(LinkBinding linkBinding) {
    this(linkBinding, LinkKeys.generateLinkKey());
  }

  public abstract LaneBinding laneBinding();

  @Override
  public final LinkBinding linkWrapper() {
    return this.linkBinding.linkWrapper();
  }

  public final LinkBinding linkBinding() {
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

  public abstract Stage stage();

  @Override
  public final Uri hostUri() {
    return this.linkBinding.hostUri();
  }

  @Override
  public final Uri nodeUri() {
    return this.linkBinding.nodeUri();
  }

  @Override
  public final Uri laneUri() {
    return this.linkBinding.laneUri();
  }

  @Override
  public final Value linkKey() {
    return this.linkKey;
  }

  @Override
  public final float prio() {
    return this.linkBinding.prio();
  }

  @Override
  public final float rate() {
    return this.linkBinding.rate();
  }

  @Override
  public final Value body() {
    return this.linkBinding.body();
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

  @Override
  public boolean isConnected() {
    return this.linkBinding.isConnectedDown();
  }

  @Override
  public boolean isRemote() {
    return this.linkBinding.isRemoteDown();
  }

  @Override
  public boolean isSecure() {
    return this.linkBinding.isSecureDown();
  }

  @Override
  public String securityProtocol() {
    return this.linkBinding.securityProtocolDown();
  }

  @Override
  public String cipherSuite() {
    return this.linkBinding.cipherSuiteDown();
  }

  @Override
  public InetSocketAddress localAddress() {
    return this.linkBinding.localAddressDown();
  }

  @Override
  public Identity localIdentity() {
    return this.linkBinding.localIdentityDown();
  }

  @Override
  public Principal localPrincipal() {
    return this.linkBinding.localPrincipalDown();
  }

  @Override
  public Collection<Certificate> localCertificates() {
    return this.linkBinding.localCertificatesDown();
  }

  @Override
  public InetSocketAddress remoteAddress() {
    return this.linkBinding.remoteAddressDown();
  }

  @Override
  public Identity remoteIdentity() {
    return this.linkBinding.remoteIdentityDown();
  }

  @Override
  public Principal remotePrincipal() {
    return this.linkBinding.remotePrincipalDown();
  }

  @Override
  public Collection<Certificate> remoteCertificates() {
    return this.linkBinding.remoteCertificatesDown();
  }

  @Override
  public UplinkModem observe(Object newObserver) {
    do {
      final Object oldObservers = this.observers;
      final Object newObservers;
      if (oldObservers == null) {
        newObservers = newObserver;
      } else if (!(oldObservers instanceof Object[])) {
        final Object[] newArray = new Object[2];
        newArray[0] = oldObservers;
        newArray[1] = newObserver;
        newObservers = newArray;
      } else {
        final Object[] oldArray = (Object[]) oldObservers;
        final int oldCount = oldArray.length;
        final Object[] newArray = new Object[oldCount + 1];
        System.arraycopy(oldArray, 0, newArray, 0, oldCount);
        newArray[oldCount] = newObserver;
        newObservers = newArray;
      }
      if (OBSERVERS.compareAndSet(this, oldObservers, newObservers)) {
        break;
      }
    } while (true);
    return this;
  }

  @Override
  public UplinkModem unobserve(Object oldObserver) {
    do {
      final Object oldObservers = this.observers;
      final Object newObservers;
      if (oldObservers == null) {
        break;
      } else if (!(oldObservers instanceof Object[])) {
        if (oldObservers == oldObserver) { // found as sole observer
          newObservers = null;
        } else {
          break; // not found
        }
      } else {
        final Object[] oldArray = (Object[]) oldObservers;
        final int oldCount = oldArray.length;
        if (oldCount == 2) {
          if (oldArray[0] == oldObserver) { // found at index 0
            newObservers = oldArray[1];
          } else if (oldArray[1] == oldObserver) { // found at index 1
            newObservers = oldArray[0];
          } else {
            break; // not found
          }
        } else {
          int i = 0;
          while (i < oldCount) {
            if (oldArray[i] == oldObserver) { // found at index i
              break;
            }
            i += 1;
          }
          if (i < oldCount) {
            final Object[] newArray = new Object[oldCount - 1];
            System.arraycopy(oldArray, 0, newArray, 0, i);
            System.arraycopy(oldArray, i + 1, newArray, i, oldCount - 1 - i);
            newObservers = newArray;
          } else {
            break; // not found
          }
        }
      }
      if (OBSERVERS.compareAndSet(this, oldObservers, newObservers)) {
        break;
      }
    } while (true);
    return this;
  }

  @Override
  public UplinkModem onEvent(OnEvent onEvent) {
    observe(onEvent);
    return this;
  }

  @Override
  public UplinkModem onCommand(OnCommand onCommand) {
    observe(onCommand);
    return this;
  }

  @Override
  public UplinkModem onLink(OnLink onLink) {
    observe(onLink);
    return this;
  }

  @Override
  public UplinkModem onLinked(OnLinked onLinked) {
    observe(onLinked);
    return this;
  }

  @Override
  public UplinkModem onSync(OnSync onSync) {
    observe(onSync);
    return this;
  }

  @Override
  public UplinkModem onSynced(OnSynced onSynced) {
    observe(onSynced);
    return this;
  }

  @Override
  public UplinkModem onUnlink(OnUnlink onUnlink) {
    observe(onUnlink);
    return this;
  }

  @Override
  public UplinkModem onUnlinked(OnUnlinked onUnlinked) {
    observe(onUnlinked);
    return this;
  }

  @Override
  public UplinkModem didClose(DidClose didClose) {
    observe(didClose);
    return this;
  }

  protected void dispatchOnEvent(EventMessage message) {
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLink(this);
    try {
      final Object observers = this.observers;
      if (observers instanceof OnEvent) {
        try {
          ((OnEvent) observers).onEvent(message);
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            didFail(error);
          } else {
            throw error;
          }
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof OnEvent) {
            try {
              ((OnEvent) observer).onEvent(message);
            } catch (Throwable error) {
              if (Conts.isNonFatal(error)) {
                didFail(error);
              } else {
                throw error;
              }
            }
          }
        }
      }
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  protected boolean dispatchOnCommand(CommandMessage message, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLink(this);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof OnCommand) {
        if (((OnCommand) observers).isPreemptive() == preemptive) {
          try {
            ((OnCommand) observers).onCommand(message);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              didFail(error);
            } else {
              throw error;
            }
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof OnCommand) {
            if (((OnCommand) observer).isPreemptive() == preemptive) {
              try {
                ((OnCommand) observer).onCommand(message);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  didFail(error);
                } else {
                  throw error;
                }
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  protected boolean dispatchOnLink(LinkRequest request, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLink(this);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof OnLink) {
        if (((OnLink) observers).isPreemptive() == preemptive) {
          try {
            ((OnLink) observers).onLink(request);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              didFail(error);
            } else {
              throw error;
            }
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof OnLink) {
            if (((OnLink) observer).isPreemptive() == preemptive) {
              try {
                ((OnLink) observer).onLink(request);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  didFail(error);
                } else {
                  throw error;
                }
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  protected void dispatchOnLinked(LinkedResponse response) {
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLink(this);
    try {
      final Object observers = this.observers;
      if (observers instanceof OnLinked) {
        try {
          ((OnLinked) observers).onLinked(response);
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            didFail(error);
          } else {
            throw error;
          }
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof OnLinked) {
            try {
              ((OnLinked) observer).onLinked(response);
            } catch (Throwable error) {
              if (Conts.isNonFatal(error)) {
                didFail(error);
              } else {
                throw error;
              }
            }
          }
        }
      }
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  protected boolean dispatchOnSync(SyncRequest request, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLink(this);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof OnSync) {
        if (((OnSync) observers).isPreemptive() == preemptive) {
          try {
            ((OnSync) observers).onSync(request);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              didFail(error);
            } else {
              throw error;
            }
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof OnSync) {
            if (((OnSync) observer).isPreemptive() == preemptive) {
              try {
                ((OnSync) observer).onSync(request);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  didFail(error);
                } else {
                  throw error;
                }
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  protected void dispatchOnSynced(SyncedResponse response) {
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLink(this);
    try {
      final Object observers = this.observers;
      if (observers instanceof OnSynced) {
        try {
          ((OnSynced) observers).onSynced(response);
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            didFail(error);
          } else {
            throw error;
          }
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof OnSynced) {
            try {
              ((OnSynced) observer).onSynced(response);
            } catch (Throwable error) {
              if (Conts.isNonFatal(error)) {
                didFail(error);
              } else {
                throw error;
              }
            }
          }
        }
      }
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  protected boolean dispatchOnUnlink(UnlinkRequest request, boolean preemptive) {
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLink(this);
    try {
      final Object observers = this.observers;
      boolean complete = true;
      if (observers instanceof OnUnlink) {
        if (((OnUnlink) observers).isPreemptive() == preemptive) {
          try {
            ((OnUnlink) observers).onUnlink(request);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              didFail(error);
            } else {
              throw error;
            }
          }
        } else if (preemptive) {
          complete = false;
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof OnUnlink) {
            if (((OnUnlink) observer).isPreemptive() == preemptive) {
              try {
                ((OnUnlink) observer).onUnlink(request);
              } catch (Throwable error) {
                if (Conts.isNonFatal(error)) {
                  didFail(error);
                } else {
                  throw error;
                }
              }
            } else if (preemptive) {
              complete = false;
            }
          }
        }
      }
      return complete;
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  protected void dispatchOnUnlinked(UnlinkedResponse response) {
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLink(this);
    try {
      final Object observers = this.observers;
      if (observers instanceof OnUnlinked) {
        try {
          ((OnUnlinked) observers).onUnlinked(response);
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            didFail(error);
          } else {
            throw error;
          }
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof OnUnlinked) {
            try {
              ((OnUnlinked) observer).onUnlinked(response);
            } catch (Throwable error) {
              if (Conts.isNonFatal(error)) {
                didFail(error);
              } else {
                throw error;
              }
            }
          }
        }
      }
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  protected void dispatchDidClose() {
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLink(this);
    try {
      final Object observers = this.observers;
      if (observers instanceof DidClose) {
        try {
          ((DidClose) observers).didClose();
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            didFail(error);
          } else {
            throw error;
          }
        }
      } else if (observers instanceof Object[]) {
        final Object[] array = (Object[]) observers;
        for (int i = 0, n = array.length; i < n; i += 1) {
          final Object observer = array[i];
          if (observer instanceof DidClose) {
            try {
              ((DidClose) observer).didClose();
            } catch (Throwable error) {
              if (Conts.isNonFatal(error)) {
                didFail(error);
              } else {
                throw error;
              }
            }
          }
        }
      }
    } finally {
      SwimContext.setLink(oldLink);
    }
  }

  protected boolean downQueueIsEmpty() {
    return true;
  }

  protected void queueDown(Value body) {
    throw new UnsupportedOperationException();
  }

  protected Value nextDownQueue() {
    return null;
  }

  protected EventMessage nextDownQueueEvent() {
    final Value body = nextDownQueue();
    if (body != null) {
      return new EventMessage(nodeUri(), laneUri(), body);
    } else {
      return null;
    }
  }

  protected Value nextDownCue() {
    return null;
  }

  protected EventMessage nextDownCueEvent() {
    final Value body = nextDownCue();
    if (body != null) {
      return new EventMessage(nodeUri(), laneUri(), body);
    } else {
      return null;
    }
  }

  public void sendDown(Value body) {
    queueDown(body);
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

  public void cueDown() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & LINKED) != 0) {
        newStatus = oldStatus | FEEDING_DOWN | CUED_DOWN;
      } else {
        newStatus = oldStatus | CUED_DOWN;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & FEEDING_DOWN) != (newStatus & FEEDING_DOWN)) {
      this.linkBinding.feedDown();
    }
  }

  @Override
  public void pullDown() {
    stage().execute(new UplinkModemPullDown(this));
  }

  protected void runPullDown() {
    try {
      pullDownEnvelope();
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        didFail(error);
      } else {
        throw error;
      }
    }
  }

  protected void pullDownEnvelope() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & UNLINKING) != 0) {
        newStatus = oldStatus & ~UNLINKING;
      } else if ((oldStatus & LINKING) != 0) {
        newStatus = oldStatus & ~LINKING;
      } else {
        newStatus = oldStatus;
        break;
      }
    } while (!STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & UNLINKING) != (newStatus & UNLINKING)) {
      final UnlinkedResponse response = unlinkedResponse();
      pullDownUnlinked(response);
      this.linkBinding.pushDown(response);
    } else if ((oldStatus & LINKING) != (newStatus & LINKING)) {
      final LinkedResponse response = linkedResponse();
      pullDownLinked(response);
      this.linkBinding.pushDown(response);
      if ((newStatus & SYNCING) != 0) {
        this.linkBinding.feedDown();
      } else {
        do {
          oldStatus = this.status;
          if ((oldStatus & CUED_DOWN) == 0 && downQueueIsEmpty()) {
            newStatus = oldStatus & ~FEEDING_DOWN;
          } else {
            newStatus = oldStatus;
            break;
          }
        } while (!STATUS.compareAndSet(this, oldStatus, newStatus));
        if (oldStatus == newStatus) {
          this.linkBinding.feedDown();
        }
      }
    } else {
      EventMessage message = nextDownQueueEvent();
      if (message == null && (oldStatus & CUED_DOWN) != 0) {
        do {
          oldStatus = this.status;
          newStatus = oldStatus & ~CUED_DOWN;
        } while (!STATUS.compareAndSet(this, oldStatus, newStatus));
        message = nextDownCueEvent();
      }
      if (message != null) {
        pullDownEvent(message);
        this.linkBinding.pushDown(message);
        do {
          oldStatus = this.status;
          if ((oldStatus & (SYNCING | CUED_DOWN)) == 0 && downQueueIsEmpty()) {
            newStatus = oldStatus & ~FEEDING_DOWN;
          } else {
            newStatus = oldStatus | FEEDING_DOWN;
          }
        } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
        if ((newStatus & FEEDING_DOWN) != 0) {
          this.linkBinding.feedDown();
        }
      } else if ((oldStatus & SYNCING) != 0) {
        final SyncedResponse response = syncedResponse();
        pullDownSynced(response);
        this.linkBinding.pushDown(response);
        do {
          oldStatus = this.status;
          if ((oldStatus & CUED_DOWN) == 0 && downQueueIsEmpty()) {
            newStatus = oldStatus & ~(SYNCING | FEEDING_DOWN);
          } else {
            newStatus = oldStatus & ~SYNCING;
          }
        } while (!STATUS.compareAndSet(this, oldStatus, newStatus));
        if ((newStatus & FEEDING_DOWN) != 0) {
          this.linkBinding.feedDown();
        }
      } else {
        this.linkBinding.skipDown();
        do {
          oldStatus = this.status;
          if ((oldStatus & CUED_DOWN) == 0 && downQueueIsEmpty()) {
            newStatus = oldStatus & ~FEEDING_DOWN;
          } else {
            newStatus = oldStatus;
            break;
          }
        } while (!STATUS.compareAndSet(this, oldStatus, newStatus));
        if ((newStatus & FEEDING_DOWN) != 0) {
          this.linkBinding.feedDown();
        }
      }
    }
  }

  protected void pullDownEvent(EventMessage message) {
    onEvent(message);
    dispatchOnEvent(message);
  }

  protected void pullDownLinked(LinkedResponse response) {
    didLink(response);
    dispatchOnLinked(response);
  }

  protected void pullDownSynced(SyncedResponse response) {
    didSync(response);
    dispatchOnSynced(response);
  }

  protected void pullDownUnlinked(UnlinkedResponse response) {
    didUnlink(response);
    dispatchOnUnlinked(response);
  }

  public void cueUp() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & FEEDING_UP) != 0) {
        newStatus = oldStatus & ~FEEDING_UP | PULLING_UP;
      } else {
        newStatus = oldStatus & ~PULLING_UP;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & FEEDING_UP) != 0) {
      this.linkBinding.pullUp();
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
      this.linkBinding.pullUp();
    }
  }

  @Override
  public void pushUp(Envelope envelope) {
    if (envelope instanceof CommandMessage) {
      pushUpCommand((CommandMessage) envelope);
    } else if (envelope instanceof LinkRequest) {
      pushUpLink((LinkRequest) envelope);
    } else if (envelope instanceof SyncRequest) {
      pushUpSync((SyncRequest) envelope);
    } else if (envelope instanceof UnlinkRequest) {
      pushUpUnlink((UnlinkRequest) envelope);
    } else {
      pushUpEnvelope(envelope);
    }
  }

  protected void pushUpCommand(CommandMessage message) {
    onCommand(message);
    laneBinding().pushUpCommand(message);
    if (!dispatchOnCommand(message, true)) {
      stage().execute(new UplinkModemOnCommand(this, message));
    } else {
      cueUp();
    }
  }

  protected void runOnCommand(CommandMessage message) {
    try {
      dispatchOnCommand(message, false);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        didFail(error);
      } else {
        throw error;
      }
    } finally {
      cueUp();
    }
  }

  protected void pushUpLink(LinkRequest request) {
    willLink(request);
    if (!dispatchOnLink(request, true)) {
      stage().execute(new UplinkModemOnLink(this, request));
    } else {
      cueUp();
    }
  }

  protected void runOnLink(LinkRequest request) {
    try {
      dispatchOnLink(request, false);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        didFail(error);
      } else {
        throw error;
      }
    } finally {
      cueUp();
    }
  }

  protected void pushUpSync(SyncRequest request) {
    willSync(request);
    if (!dispatchOnSync(request, true)) {
      stage().execute(new UplinkModemOnSync(this, request));
    } else {
      cueUp();
    }
  }

  protected void runOnSync(SyncRequest request) {
    try {
      dispatchOnSync(request, false);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        didFail(error);
      } else {
        throw error;
      }
    } finally {
      cueUp();
    }
  }

  protected void pushUpUnlink(UnlinkRequest request) {
    willUnlink(request);
    if (!dispatchOnUnlink(request, true)) {
      stage().execute(new UplinkModemOnUnlink(this, request));
    }
  }

  protected void runOnUnlink(UnlinkRequest request) {
    try {
      dispatchOnUnlink(request, false);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        didFail(error);
      } else {
        throw error;
      }
    }
  }

  protected void pushUpEnvelope(Envelope envelope) {
    cueUp();
  }

  @Override
  public void skipUp() {
    cueUp();
  }

  public void unlink() {
    int oldStatus;
    int newStatus;
    do  {
      oldStatus = this.status;
      newStatus = oldStatus & ~(SYNCING | LINKING | LINKED) | FEEDING_DOWN | UNLINKING;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & FEEDING_DOWN) == 0) {
      this.linkBinding.feedDown();
    }
    if ((oldStatus & FEEDING_UP) != 0) {
      this.linkBinding.pullUp();
    }
  }

  @Override
  public void closeUp() {
    laneBinding().closeUplink(this.linkKey);
  }

  @Override
  public void close() {
    closeUp();
  }

  @Override
  public void didOpenDown() {
  }

  @Override
  public void didCloseDown() {
  }

  protected void onEvent(EventMessage message) {
    // stub
  }

  protected void onCommand(CommandMessage message) {
    // stub
  }

  protected void willLink(LinkRequest request) {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & FEEDING_UP) == 0) {
        newStatus = oldStatus & ~PULLING_UP | FEEDING_DOWN | LINKING | LINKED;
      } else {
        newStatus = oldStatus | FEEDING_DOWN | LINKING | LINKED;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & FEEDING_DOWN) == 0) {
      this.linkBinding.feedDown();
    }
    if ((oldStatus & FEEDING_UP) != 0) {
      this.linkBinding.pullUp();
    }
  }

  protected void didLink(LinkedResponse response) {
    // stub
  }

  protected void willSync(SyncRequest request) {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & LINKED) == 0) {
        if ((oldStatus & FEEDING_UP) == 0) {
          newStatus = oldStatus & ~PULLING_UP | FEEDING_DOWN | SYNCING | LINKING | LINKED;
        } else {
          newStatus = oldStatus | FEEDING_DOWN | SYNCING | LINKING | LINKED;
        }
      } else {
        if ((oldStatus & FEEDING_UP) == 0) {
          newStatus = oldStatus & ~PULLING_UP | FEEDING_DOWN | SYNCING;
        } else {
          newStatus = oldStatus | FEEDING_DOWN | SYNCING;
        }
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & FEEDING_DOWN) == 0) {
      this.linkBinding.feedDown();
    }
    if ((oldStatus & FEEDING_UP) != 0) {
      this.linkBinding.pullUp();
    }
  }

  protected void didSync(SyncedResponse response) {
    // stub
  }

  protected void willUnlink(UnlinkRequest request) {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      if ((oldStatus & FEEDING_UP) == 0) {
        newStatus = oldStatus & ~(PULLING_UP | SYNCING | LINKING | LINKED) | FEEDING_DOWN | UNLINKING;
      } else {
        newStatus = oldStatus & ~(SYNCING | LINKING | LINKED) | FEEDING_DOWN | UNLINKING;
      }
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & FEEDING_DOWN) == 0) {
      this.linkBinding.feedDown();
    }
    if ((oldStatus & FEEDING_UP) != 0) {
      this.linkBinding.pullUp();
    }
  }

  protected void didUnlink(UnlinkedResponse response) {
    close();
  }

  protected void didFail(Throwable error) {
    laneBinding().didFail(error);
  }

  protected LinkedResponse linkedResponse() {
    return new LinkedResponse(nodeUri(), laneUri(), prio(), rate(), body());
  }

  protected SyncedResponse syncedResponse() {
    return new SyncedResponse(nodeUri(), laneUri());
  }

  protected UnlinkedResponse unlinkedResponse() {
    return new UnlinkedResponse(nodeUri(), laneUri());
  }

  @Override
  public void traceUp(Object message) {
    laneBinding().trace(message);
  }

  @Override
  public void debugUp(Object message) {
    laneBinding().debug(message);
  }

  @Override
  public void infoUp(Object message) {
    laneBinding().info(message);
  }

  @Override
  public void warnUp(Object message) {
    laneBinding().warn(message);
  }

  @Override
  public void errorUp(Object message) {
    laneBinding().error(message);
  }

  @Override
  public void trace(Object message) {
    this.linkBinding.traceDown(message);
  }

  @Override
  public void debug(Object message) {
    this.linkBinding.debugDown(message);
  }

  @Override
  public void info(Object message) {
    this.linkBinding.infoDown(message);
  }

  @Override
  public void warn(Object message) {
    this.linkBinding.warnDown(message);
  }

  @Override
  public void error(Object message) {
    this.linkBinding.errorDown(message);
  }

  static final int LINKED = 1 << 0;
  static final int LINKING = 1 << 1;
  static final int SYNCING = 1 << 2;
  static final int UNLINKING = 1 << 3;
  static final int CUED_DOWN = 1 << 4;
  static final int FEEDING_DOWN = 1 << 5;
  static final int FEEDING_UP = 1 << 6;
  static final int PULLING_UP = 1 << 7;

  static final AtomicIntegerFieldUpdater<UplinkModem> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(UplinkModem.class, "status");

  static final AtomicReferenceFieldUpdater<UplinkModem, Object> OBSERVERS =
      AtomicReferenceFieldUpdater.newUpdater(UplinkModem.class, Object.class, "observers");
}

final class UplinkModemPullDown implements Runnable {
  final UplinkModem uplink;

  UplinkModemPullDown(UplinkModem uplink) {
    this.uplink = uplink;
  }

  @Override
  public void run() {
    uplink.runPullDown();
  }
}

final class UplinkModemOnCommand implements Runnable {
  final UplinkModem uplink;
  final CommandMessage message;

  UplinkModemOnCommand(UplinkModem uplink, CommandMessage message) {
    this.uplink = uplink;
    this.message = message;
  }

  @Override
  public void run() {
    uplink.runOnCommand(message);
  }
}

final class UplinkModemOnLink implements Runnable {
  final UplinkModem uplink;
  final LinkRequest request;

  UplinkModemOnLink(UplinkModem uplink, LinkRequest request) {
    this.uplink = uplink;
    this.request = request;
  }

  @Override
  public void run() {
    uplink.runOnLink(request);
  }
}

final class UplinkModemOnSync implements Runnable {
  final UplinkModem uplink;
  final SyncRequest request;

  UplinkModemOnSync(UplinkModem uplink, SyncRequest request) {
    this.uplink = uplink;
    this.request = request;
  }

  @Override
  public void run() {
    uplink.runOnSync(request);
  }
}

final class UplinkModemOnUnlink implements Runnable {
  final UplinkModem uplink;
  final UnlinkRequest request;

  UplinkModemOnUnlink(UplinkModem uplink, UnlinkRequest request) {
    this.uplink = uplink;
    this.request = request;
  }

  @Override
  public void run() {
    uplink.runOnUnlink(request);
  }
}
