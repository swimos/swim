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

import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicLongFieldUpdater;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.function.DidClose;
import swim.api.warp.WarpUplink;
import swim.api.warp.function.OnCommandMessage;
import swim.api.warp.function.OnEventMessage;
import swim.api.warp.function.OnLinkRequest;
import swim.api.warp.function.OnLinkedResponse;
import swim.api.warp.function.OnSyncRequest;
import swim.api.warp.function.OnSyncedResponse;
import swim.api.warp.function.OnUnlinkRequest;
import swim.api.warp.function.OnUnlinkedResponse;
import swim.concurrent.Conts;
import swim.runtime.AbstractUplinkContext;
import swim.runtime.LinkBinding;
import swim.runtime.Metric;
import swim.runtime.NodeBinding;
import swim.runtime.Push;
import swim.runtime.UplinkAddress;
import swim.runtime.WarpBinding;
import swim.runtime.WarpContext;
import swim.runtime.profile.WarpUplinkProfile;
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

public abstract class WarpUplinkModem extends AbstractUplinkContext implements WarpContext, WarpUplink {
  protected final WarpBinding linkBinding;
  protected final UplinkAddress uplinkAddress;
  protected volatile int status;

  volatile int eventDelta;
  volatile long eventCount;
  volatile int commandDelta;
  volatile long commandCount;
  volatile long lastReportTime;

  protected WarpUplinkModem(WarpBinding linkBinding, UplinkAddress uplinkAddress) {
    this.linkBinding = linkBinding;
    this.uplinkAddress = uplinkAddress;
  }

  @Override
  public final WarpBinding linkWrapper() {
    return this.linkBinding.linkWrapper();
  }

  @Override
  public final WarpBinding linkBinding() {
    return this.linkBinding;
  }

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
    return this.uplinkAddress.linkKey();
  }

  @Override
  public final UplinkAddress cellAddressUp() {
    return this.uplinkAddress;
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
  public WarpUplinkModem observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public WarpUplinkModem unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public WarpUplinkModem onEvent(OnEventMessage onEvent) {
    observe(onEvent);
    return this;
  }

  @Override
  public WarpUplinkModem onCommand(OnCommandMessage onCommand) {
    observe(onCommand);
    return this;
  }

  @Override
  public WarpUplinkModem onLink(OnLinkRequest onLink) {
    observe(onLink);
    return this;
  }

  @Override
  public WarpUplinkModem onLinked(OnLinkedResponse onLinked) {
    observe(onLinked);
    return this;
  }

  @Override
  public WarpUplinkModem onSync(OnSyncRequest onSync) {
    observe(onSync);
    return this;
  }

  @Override
  public WarpUplinkModem onSynced(OnSyncedResponse onSynced) {
    observe(onSynced);
    return this;
  }

  @Override
  public WarpUplinkModem onUnlink(OnUnlinkRequest onUnlink) {
    observe(onUnlink);
    return this;
  }

  @Override
  public WarpUplinkModem onUnlinked(OnUnlinkedResponse onUnlinked) {
    observe(onUnlinked);
    return this;
  }

  @Override
  public WarpUplinkModem didClose(DidClose didClose) {
    observe(didClose);
    return this;
  }

  protected void dispatchOnEvent(EventMessage message) {
    final Link oldLink = SwimContext.getLink();
    SwimContext.setLink(this);
    try {
      final Object observers = this.observers;
      if (observers instanceof OnEventMessage) {
        try {
          ((OnEventMessage) observers).onEvent(message);
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
          if (observer instanceof OnEventMessage) {
            try {
              ((OnEventMessage) observer).onEvent(message);
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
      if (observers instanceof OnCommandMessage) {
        if (((OnCommandMessage) observers).isPreemptive() == preemptive) {
          try {
            ((OnCommandMessage) observers).onCommand(message);
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
          if (observer instanceof OnCommandMessage) {
            if (((OnCommandMessage) observer).isPreemptive() == preemptive) {
              try {
                ((OnCommandMessage) observer).onCommand(message);
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
      if (observers instanceof OnLinkRequest) {
        if (((OnLinkRequest) observers).isPreemptive() == preemptive) {
          try {
            ((OnLinkRequest) observers).onLink(request);
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
          if (observer instanceof OnLinkRequest) {
            if (((OnLinkRequest) observer).isPreemptive() == preemptive) {
              try {
                ((OnLinkRequest) observer).onLink(request);
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
      if (observers instanceof OnLinkedResponse) {
        try {
          ((OnLinkedResponse) observers).onLinked(response);
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
          if (observer instanceof OnLinkedResponse) {
            try {
              ((OnLinkedResponse) observer).onLinked(response);
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
      if (observers instanceof OnSyncRequest) {
        if (((OnSyncRequest) observers).isPreemptive() == preemptive) {
          try {
            ((OnSyncRequest) observers).onSync(request);
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
          if (observer instanceof OnSyncRequest) {
            if (((OnSyncRequest) observer).isPreemptive() == preemptive) {
              try {
                ((OnSyncRequest) observer).onSync(request);
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
      if (observers instanceof OnSyncedResponse) {
        try {
          ((OnSyncedResponse) observers).onSynced(response);
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
          if (observer instanceof OnSyncedResponse) {
            try {
              ((OnSyncedResponse) observer).onSynced(response);
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
      if (observers instanceof OnUnlinkRequest) {
        if (((OnUnlinkRequest) observers).isPreemptive() == preemptive) {
          try {
            ((OnUnlinkRequest) observers).onUnlink(request);
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
          if (observer instanceof OnUnlinkRequest) {
            if (((OnUnlinkRequest) observer).isPreemptive() == preemptive) {
              try {
                ((OnUnlinkRequest) observer).onUnlink(request);
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
      if (observers instanceof OnUnlinkedResponse) {
        try {
          ((OnUnlinkedResponse) observers).onUnlinked(response);
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
          if (observer instanceof OnUnlinkedResponse) {
            try {
              ((OnUnlinkedResponse) observer).onUnlinked(response);
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
    do {
      final int oldStatus = this.status;
      final int newStatus = oldStatus | FEEDING_DOWN;
      if (oldStatus != newStatus) {
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.linkBinding.feedDown();
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  public void cueDown() {
    do {
      final int oldStatus = this.status;
      final int newStatus;
      if ((oldStatus & LINKED) != 0) {
        newStatus = oldStatus | (FEEDING_DOWN | CUED_DOWN);
        if (oldStatus != newStatus) {
          if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
            if ((oldStatus & FEEDING_DOWN) == 0) {
              this.linkBinding.feedDown();
            }
            break;
          }
        } else {
          break;
        }
      } else {
        newStatus = oldStatus | CUED_DOWN;
        if (oldStatus == newStatus || STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      }
    } while (true);
  }

  @Override
  public void pullDown() {
    stage().execute(new WarpUplinkModemPullDown(this));
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
    do {
      int oldStatus = this.status;
      int newStatus;
      if ((oldStatus & UNLINKING) != 0) {
        newStatus = oldStatus & ~UNLINKING;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          final UnlinkedResponse response = unlinkedResponse();
          pullDownUnlinked(response);
          pushDown(response);
          break;
        }
      } else if ((oldStatus & LINKING) != 0) {
        newStatus = oldStatus & ~LINKING;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          final LinkedResponse response = linkedResponse();
          pullDownLinked(response);
          pushDown(response);
          if ((newStatus & SYNCING) != 0) {
            this.linkBinding.feedDown();
          } else {
            do {
              oldStatus = this.status;
              if ((oldStatus & CUED_DOWN) == 0 && downQueueIsEmpty()) {
                newStatus = oldStatus & ~FEEDING_DOWN;
                if (oldStatus == newStatus || STATUS.compareAndSet(this, oldStatus, newStatus)) {
                  break;
                }
              } else {
                this.linkBinding.feedDown();
                break;
              }
            } while (true);
          }
          break;
        }
      } else {
        EventMessage message = nextDownQueueEvent();
        if (message == null && (oldStatus & CUED_DOWN) != 0) {
          do {
            oldStatus = this.status;
            newStatus = oldStatus & ~CUED_DOWN;
            if (oldStatus == newStatus || STATUS.compareAndSet(this, oldStatus, newStatus)) {
              break;
            }
          } while (true);
          message = nextDownCueEvent();
        }
        if (message != null) {
          pullDownEvent(message);
          pushDown(message);
          do {
            oldStatus = this.status;
            if ((oldStatus & (SYNCING | CUED_DOWN)) == 0 && downQueueIsEmpty()) {
              newStatus = oldStatus & ~FEEDING_DOWN;
              if (oldStatus == newStatus || STATUS.compareAndSet(this, oldStatus, newStatus)) {
                break;
              }
            } else {
              newStatus = oldStatus | FEEDING_DOWN;
              if (oldStatus == newStatus || STATUS.compareAndSet(this, oldStatus, newStatus)) {
                this.linkBinding.feedDown();
                break;
              }
            }
          } while (true);
        } else if ((oldStatus & SYNCING) != 0) {
          final SyncedResponse response = syncedResponse();
          pullDownSynced(response);
          pushDown(response);
          do {
            oldStatus = this.status;
            if ((oldStatus & CUED_DOWN) == 0 && downQueueIsEmpty()) {
              newStatus = oldStatus & ~(SYNCING | FEEDING_DOWN);
            } else {
              newStatus = oldStatus & ~SYNCING;
            }
            if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
              break;
            }
          } while (true);
          if ((newStatus & FEEDING_DOWN) != 0) {
            this.linkBinding.feedDown();
          }
        } else {
          this.linkBinding.skipDown();
          do {
            oldStatus = this.status;
            if ((oldStatus & CUED_DOWN) == 0 && downQueueIsEmpty()) {
              newStatus = oldStatus & ~FEEDING_DOWN;
              if (oldStatus == newStatus || STATUS.compareAndSet(this, oldStatus, newStatus)) {
                break;
              }
            } else {
              if ((oldStatus & FEEDING_DOWN) != 0) {
                this.linkBinding.feedDown();
              }
              break;
            }
          } while (true);
        }
        break;
      }
    } while (true);
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

  protected void pushDown(Envelope envelope) {
    this.linkBinding.pushDown(new Push<Envelope>(Uri.empty(), hostUri(), nodeUri(), laneUri(),
                                                 prio(), null, envelope, null));
  }

  public void cueUp() {
    do {
      final int oldStatus = this.status;
      final int newStatus;
      if ((oldStatus & FEEDING_UP) != 0) {
        newStatus = oldStatus & ~FEEDING_UP | PULLING_UP;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.linkBinding.pullUp();
          break;
        }
      } else {
        newStatus = oldStatus & ~PULLING_UP;
        if (oldStatus == newStatus || STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      }
    } while (true);
  }

  @Override
  public void feedUp() {
    do {
      final int oldStatus = this.status;
      final int newStatus;
      if ((oldStatus & PULLING_UP) == 0) {
        newStatus = oldStatus & ~FEEDING_UP | PULLING_UP;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.linkBinding.pullUp();
          break;
        }
      } else {
        newStatus = oldStatus | FEEDING_UP;
        if (oldStatus == newStatus || STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  @Override
  public void pushUp(Push<?> push) {
    final Object message = push.message();
    if (message instanceof CommandMessage) {
      pushUpCommand((Push<CommandMessage>) push);
    } else if (message instanceof LinkRequest) {
      pushUpLink((Push<LinkRequest>) push);
    } else if (message instanceof SyncRequest) {
      pushUpSync((Push<SyncRequest>) push);
    } else if (message instanceof UnlinkRequest) {
      pushUpUnlink((Push<UnlinkRequest>) push);
    } else if (message instanceof Envelope) {
      pushUpUnknown(push);
    }
  }

  protected void pushUpCommand(Push<CommandMessage> push) {
    final CommandMessage message = push.message();
    onCommand(message);
    laneBinding().pushUpCommand(push);
    if (!dispatchOnCommand(message, true)) {
      stage().execute(new WarpUplinkModemOnCommand(this, push));
    } else {
      cueUp();
    }
  }

  protected void runOnCommand(Push<CommandMessage> push) {
    try {
      dispatchOnCommand(push.message(), false);
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

  protected void pushUpLink(Push<LinkRequest> push) {
    final LinkRequest request = push.message();
    willLink(request);
    if (!dispatchOnLink(request, true)) {
      stage().execute(new WarpUplinkModemOnLink(this, push));
    } else {
      push.bind();
      cueUp();
    }
  }

  protected void runOnLink(Push<LinkRequest> push) {
    try {
      dispatchOnLink(push.message(), false);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        didFail(error);
      } else {
        throw error;
      }
    } finally {
      push.bind();
      cueUp();
    }
  }

  protected void pushUpSync(Push<SyncRequest> push) {
    final SyncRequest request = push.message();
    willSync(request);
    if (!dispatchOnSync(request, true)) {
      stage().execute(new WarpUplinkModemOnSync(this, push));
    } else {
      push.bind();
      cueUp();
    }
  }

  protected void runOnSync(Push<SyncRequest> push) {
    try {
      dispatchOnSync(push.message(), false);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        didFail(error);
      } else {
        throw error;
      }
    } finally {
      push.bind();
      cueUp();
    }
  }

  protected void pushUpUnlink(Push<UnlinkRequest> push) {
    final UnlinkRequest request = push.message();
    willUnlink(request);
    if (!dispatchOnUnlink(request, true)) {
      stage().execute(new WarpUplinkModemOnUnlink(this, push));
    } else {
      push.bind();
    }
  }

  protected void runOnUnlink(Push<UnlinkRequest> push) {
    try {
      dispatchOnUnlink(push.message(), false);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        didFail(error);
      } else {
        throw error;
      }
    } finally {
      push.bind();
    }
  }

  protected void pushUpUnknown(Push<?> push) {
    push.bind();
    cueUp();
  }

  @Override
  public void skipUp() {
    cueUp();
  }

  public void unlink() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~(SYNCING | LINKING | LINKED) | (FEEDING_DOWN | UNLINKING);
      if (oldStatus != newStatus) {
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          if ((oldStatus & FEEDING_DOWN) == 0) {
            this.linkBinding.feedDown();
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
    if ((oldStatus & FEEDING_UP) != 0) {
      this.linkBinding.pullUp();
    }
  }

  protected void onEvent(EventMessage message) {
    EVENT_DELTA.incrementAndGet(this);
    didUpdateMetrics();
  }

  protected void onCommand(CommandMessage message) {
    COMMAND_DELTA.incrementAndGet(this);
    didUpdateMetrics();
  }

  protected void willLink(LinkRequest request) {
    do {
      final int oldStatus = this.status;
      final int newStatus;
      if ((oldStatus & FEEDING_UP) == 0) {
        newStatus = oldStatus & ~PULLING_UP | (FEEDING_DOWN | LINKING | LINKED);
      } else {
        newStatus = oldStatus | (FEEDING_DOWN | LINKING | LINKED);
      }
      if (oldStatus == newStatus || STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if ((oldStatus & FEEDING_DOWN) == 0) {
          this.linkBinding.feedDown();
        }
        if ((oldStatus & FEEDING_UP) != 0) {
          this.linkBinding.pullUp();
        }
        break;
      }
    } while (true);
  }

  protected void didLink(LinkedResponse response) {
    // stub
  }

  protected void willSync(SyncRequest request) {
    do {
      final int oldStatus = this.status;
      final int newStatus;
      if ((oldStatus & LINKED) == 0) {
        if ((oldStatus & FEEDING_UP) == 0) {
          newStatus = oldStatus & ~PULLING_UP | (FEEDING_DOWN | SYNCING | LINKING | LINKED);
        } else {
          newStatus = oldStatus | (FEEDING_DOWN | SYNCING | LINKING | LINKED);
        }
      } else {
        if ((oldStatus & FEEDING_UP) == 0) {
          newStatus = oldStatus & ~PULLING_UP | (FEEDING_DOWN | SYNCING);
        } else {
          newStatus = oldStatus | (FEEDING_DOWN | SYNCING);
        }
      }
      if (oldStatus == newStatus || STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if ((oldStatus & FEEDING_DOWN) == 0) {
          this.linkBinding.feedDown();
        }
        if ((oldStatus & FEEDING_UP) != 0) {
          this.linkBinding.pullUp();
        }
        break;
      }
    } while (true);
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
        newStatus = oldStatus & ~(PULLING_UP | SYNCING | LINKING | LINKED) | (FEEDING_DOWN | UNLINKING);
      } else {
        newStatus = oldStatus & ~(SYNCING | LINKING | LINKED) | (FEEDING_DOWN | UNLINKING);
      }
      if (oldStatus == newStatus || STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if ((oldStatus & FEEDING_DOWN) == 0) {
          this.linkBinding.feedDown();
        }
        if ((oldStatus & FEEDING_UP) != 0) {
          this.linkBinding.pullUp();
        }
        break;
      }
    } while (true);
  }

  protected void didUnlink(UnlinkedResponse response) {
    close();
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
  protected void didClose() {
    super.didClose();
    flushMetrics();
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    laneBinding().openMetaUplink(uplink, metaUplink);
  }

  protected void didUpdateMetrics() {
    do {
      final long newReportTime = System.currentTimeMillis();
      final long oldReportTime = this.lastReportTime;
      final long dt = newReportTime - oldReportTime;
      if (dt >= Metric.REPORT_INTERVAL) {
        if (LAST_REPORT_TIME.compareAndSet(this, oldReportTime, newReportTime)) {
          try {
            reportMetrics(dt);
          } catch (Throwable error) {
            if (Conts.isNonFatal(error)) {
              didFail(error);
            } else {
              throw error;
            }
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  protected void flushMetrics() {
    final long newReportTime = System.currentTimeMillis();
    final long oldReportTime = LAST_REPORT_TIME.getAndSet(this, newReportTime);
    final long dt = newReportTime - oldReportTime;
    try {
      reportMetrics(dt);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        didFail(error);
      } else {
        throw error;
      }
    }
  }

  protected void reportMetrics(long dt) {
    final WarpUplinkProfile profile = collectProfile(dt);
    laneBinding().reportDown(profile);
  }

  protected WarpUplinkProfile collectProfile(long dt) {
    final int eventDelta = EVENT_DELTA.getAndSet(this, 0);
    final int eventRate = (int) Math.ceil((1000.0 * (double) eventDelta) / (double) dt);
    final long eventCount = EVENT_COUNT.addAndGet(this, (long) eventDelta);
    final int commandDelta = COMMAND_DELTA.getAndSet(this, 0);
    final int commandRate = (int) Math.ceil((1000.0 * (double) commandDelta) / (double) dt);
    final long commandCount = COMMAND_TOTAL.addAndGet(this, (long) commandDelta);

    return new WarpUplinkProfile(this.uplinkAddress,
                                 eventDelta, eventRate, eventCount,
                                 commandDelta, commandRate, commandCount);
  }

  static final int LINKED = 1 << 0;
  static final int LINKING = 1 << 1;
  static final int SYNCING = 1 << 2;
  static final int UNLINKING = 1 << 3;
  static final int CUED_DOWN = 1 << 4;
  static final int FEEDING_DOWN = 1 << 5;
  static final int FEEDING_UP = 1 << 6;
  static final int PULLING_UP = 1 << 7;

  static final AtomicIntegerFieldUpdater<WarpUplinkModem> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(WarpUplinkModem.class, "status");

  static final AtomicIntegerFieldUpdater<WarpUplinkModem> EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(WarpUplinkModem.class, "eventDelta");
  static final AtomicLongFieldUpdater<WarpUplinkModem> EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(WarpUplinkModem.class, "eventCount");
  static final AtomicIntegerFieldUpdater<WarpUplinkModem> COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(WarpUplinkModem.class, "commandDelta");
  static final AtomicLongFieldUpdater<WarpUplinkModem> COMMAND_TOTAL =
      AtomicLongFieldUpdater.newUpdater(WarpUplinkModem.class, "commandCount");
  static final AtomicLongFieldUpdater<WarpUplinkModem> LAST_REPORT_TIME =
      AtomicLongFieldUpdater.newUpdater(WarpUplinkModem.class, "lastReportTime");
}

final class WarpUplinkModemPullDown implements Runnable {
  final WarpUplinkModem uplink;

  WarpUplinkModemPullDown(WarpUplinkModem uplink) {
    this.uplink = uplink;
  }

  @Override
  public void run() {
    uplink.runPullDown();
  }
}

final class WarpUplinkModemOnCommand implements Runnable {
  final WarpUplinkModem uplink;
  final Push<CommandMessage> push;

  WarpUplinkModemOnCommand(WarpUplinkModem uplink, Push<CommandMessage> push) {
    this.uplink = uplink;
    this.push = push;
  }

  @Override
  public void run() {
    this.uplink.runOnCommand(push);
  }
}

final class WarpUplinkModemOnLink implements Runnable {
  final WarpUplinkModem uplink;
  final Push<LinkRequest> push;

  WarpUplinkModemOnLink(WarpUplinkModem uplink, Push<LinkRequest> push) {
    this.uplink = uplink;
    this.push = push;
  }

  @Override
  public void run() {
    this.uplink.runOnLink(push);
  }
}

final class WarpUplinkModemOnSync implements Runnable {
  final WarpUplinkModem uplink;
  final Push<SyncRequest> push;

  WarpUplinkModemOnSync(WarpUplinkModem uplink, Push<SyncRequest> push) {
    this.uplink = uplink;
    this.push = push;
  }

  @Override
  public void run() {
    this.uplink.runOnSync(push);
  }
}

final class WarpUplinkModemOnUnlink implements Runnable {
  final WarpUplinkModem uplink;
  final Push<UnlinkRequest> push;

  WarpUplinkModemOnUnlink(WarpUplinkModem uplink, Push<UnlinkRequest> push) {
    this.uplink = uplink;
    this.push = push;
  }

  @Override
  public void run() {
    this.uplink.runOnUnlink(push);
  }
}
