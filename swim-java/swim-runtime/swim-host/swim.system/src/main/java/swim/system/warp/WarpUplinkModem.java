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

package swim.system.warp;

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
import swim.concurrent.Cont;
import swim.structure.Value;
import swim.system.AbstractUplinkContext;
import swim.system.LinkBinding;
import swim.system.Metric;
import swim.system.NodeBinding;
import swim.system.Push;
import swim.system.UplinkAddress;
import swim.system.WarpBinding;
import swim.system.WarpContext;
import swim.system.profile.WarpUplinkProfile;
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
    this.status = 0;

    this.eventDelta = 0;
    this.eventCount = 0L;
    this.commandDelta = 0;
    this.commandCount = 0L;
    this.lastReportTime = 0L;
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
    return this.observe(onEvent);
  }

  @Override
  public WarpUplinkModem onCommand(OnCommandMessage onCommand) {
    return this.observe(onCommand);
  }

  @Override
  public WarpUplinkModem onLink(OnLinkRequest onLink) {
    return this.observe(onLink);
  }

  @Override
  public WarpUplinkModem onLinked(OnLinkedResponse onLinked) {
    return this.observe(onLinked);
  }

  @Override
  public WarpUplinkModem onSync(OnSyncRequest onSync) {
    return this.observe(onSync);
  }

  @Override
  public WarpUplinkModem onSynced(OnSyncedResponse onSynced) {
    return this.observe(onSynced);
  }

  @Override
  public WarpUplinkModem onUnlink(OnUnlinkRequest onUnlink) {
    return this.observe(onUnlink);
  }

  @Override
  public WarpUplinkModem onUnlinked(OnUnlinkedResponse onUnlinked) {
    return this.observe(onUnlinked);
  }

  @Override
  public WarpUplinkModem didClose(DidClose didClose) {
    return this.observe(didClose);
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
          if (Cont.isNonFatal(error)) {
            this.didFail(error);
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
              if (Cont.isNonFatal(error)) {
                this.didFail(error);
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
            if (Cont.isNonFatal(error)) {
              this.didFail(error);
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
                if (Cont.isNonFatal(error)) {
                  this.didFail(error);
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
            if (Cont.isNonFatal(error)) {
              this.didFail(error);
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
                if (Cont.isNonFatal(error)) {
                  this.didFail(error);
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
          if (Cont.isNonFatal(error)) {
            this.didFail(error);
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
              if (Cont.isNonFatal(error)) {
                this.didFail(error);
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
            if (Cont.isNonFatal(error)) {
              this.didFail(error);
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
                if (Cont.isNonFatal(error)) {
                  this.didFail(error);
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
          if (Cont.isNonFatal(error)) {
            this.didFail(error);
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
              if (Cont.isNonFatal(error)) {
                this.didFail(error);
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
            if (Cont.isNonFatal(error)) {
              this.didFail(error);
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
                if (Cont.isNonFatal(error)) {
                  this.didFail(error);
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
          if (Cont.isNonFatal(error)) {
            this.didFail(error);
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
              if (Cont.isNonFatal(error)) {
                this.didFail(error);
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
          if (Cont.isNonFatal(error)) {
            this.didFail(error);
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
              if (Cont.isNonFatal(error)) {
                this.didFail(error);
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
    final Value body = this.nextDownQueue();
    if (body != null) {
      return new EventMessage(this.nodeUri(), this.laneUri(), body);
    } else {
      return null;
    }
  }

  protected Value nextDownCue() {
    return null;
  }

  protected EventMessage nextDownCueEvent() {
    final Value body = this.nextDownCue();
    if (body != null) {
      return new EventMessage(this.nodeUri(), this.laneUri(), body);
    } else {
      return null;
    }
  }

  public void sendDown(Value body) {
    this.queueDown(body);
    do {
      final int oldStatus = WarpUplinkModem.STATUS.get(this);
      final int newStatus = oldStatus | WarpUplinkModem.FEEDING_DOWN;
      if (oldStatus != newStatus) {
        if (WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
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
      final int oldStatus = WarpUplinkModem.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & WarpUplinkModem.LINKED) != 0) {
        newStatus = oldStatus | (WarpUplinkModem.FEEDING_DOWN | WarpUplinkModem.CUED_DOWN);
        if (oldStatus != newStatus) {
          if (WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
            if ((oldStatus & WarpUplinkModem.FEEDING_DOWN) == 0) {
              this.linkBinding.feedDown();
            }
            break;
          }
        } else {
          break;
        }
      } else {
        newStatus = oldStatus | WarpUplinkModem.CUED_DOWN;
        if (oldStatus == newStatus || WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      }
    } while (true);
  }

  @Override
  public void pullDown() {
    this.stage().execute(new WarpUplinkModemPullDown(this));
  }

  protected void runPullDown() {
    try {
      this.pullDownEnvelope();
    } catch (Throwable error) {
      if (Cont.isNonFatal(error)) {
        this.didFail(error);
      } else {
        throw error;
      }
    }
  }

  protected void pullDownEnvelope() {
    do {
      int oldStatus = WarpUplinkModem.STATUS.get(this);
      int newStatus;
      if ((oldStatus & WarpUplinkModem.UNLINKING) != 0) {
        newStatus = oldStatus & ~WarpUplinkModem.UNLINKING;
        if (WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          final UnlinkedResponse response = this.unlinkedResponse();
          this.pullDownUnlinked(response);
          this.pushDown(response);
          break;
        }
      } else if ((oldStatus & WarpUplinkModem.LINKING) != 0) {
        newStatus = oldStatus & ~WarpUplinkModem.LINKING;
        if (WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          final LinkedResponse response = this.linkedResponse();
          this.pullDownLinked(response);
          this.pushDown(response);
          if ((newStatus & WarpUplinkModem.SYNCING) != 0) {
            this.linkBinding.feedDown();
          } else {
            do {
              oldStatus = WarpUplinkModem.STATUS.get(this);
              if ((oldStatus & WarpUplinkModem.CUED_DOWN) == 0 && this.downQueueIsEmpty()) {
                newStatus = oldStatus & ~WarpUplinkModem.FEEDING_DOWN;
                if (oldStatus == newStatus || WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
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
        EventMessage message = this.nextDownQueueEvent();
        if (message == null && (oldStatus & WarpUplinkModem.CUED_DOWN) != 0) {
          do {
            oldStatus = WarpUplinkModem.STATUS.get(this);
            newStatus = oldStatus & ~WarpUplinkModem.CUED_DOWN;
            if (oldStatus == newStatus || WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
              break;
            }
          } while (true);
          message = this.nextDownCueEvent();
        }
        if (message != null) {
          this.pullDownEvent(message);
          this.pushDown(message);
          do {
            oldStatus = WarpUplinkModem.STATUS.get(this);
            if ((oldStatus & (WarpUplinkModem.SYNCING | WarpUplinkModem.CUED_DOWN)) == 0 && this.downQueueIsEmpty()) {
              newStatus = oldStatus & ~WarpUplinkModem.FEEDING_DOWN;
              final boolean statusHasChanged = WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus);
              if (this.downQueueIsEmpty() && (oldStatus == newStatus || statusHasChanged)) {
                break;
              }
            } else {
              newStatus = oldStatus | WarpUplinkModem.FEEDING_DOWN;
              if (oldStatus == newStatus || WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
                this.linkBinding.feedDown();
                break;
              }
            }
          } while (true);
        } else if ((oldStatus & WarpUplinkModem.SYNCING) != 0) {
          final SyncedResponse response = this.syncedResponse();
          this.pullDownSynced(response);
          this.pushDown(response);
          do {
            oldStatus = WarpUplinkModem.STATUS.get(this);
            if ((oldStatus & WarpUplinkModem.CUED_DOWN) == 0 && this.downQueueIsEmpty()) {
              newStatus = oldStatus & ~(WarpUplinkModem.SYNCING | WarpUplinkModem.FEEDING_DOWN);
            } else {
              newStatus = oldStatus & ~WarpUplinkModem.SYNCING;
            }
            if (WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
              break;
            }
          } while (true);
          if ((newStatus & WarpUplinkModem.FEEDING_DOWN) != 0) {
            this.linkBinding.feedDown();
          }
        } else {
          this.linkBinding.skipDown();
          do {
            oldStatus = WarpUplinkModem.STATUS.get(this);
            if ((oldStatus & WarpUplinkModem.CUED_DOWN) == 0 && this.downQueueIsEmpty()) {
              newStatus = oldStatus & ~WarpUplinkModem.FEEDING_DOWN;
              if (oldStatus == newStatus || WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
                break;
              }
            } else {
              if ((oldStatus & WarpUplinkModem.FEEDING_DOWN) != 0) {
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
    this.onEvent(message);
    this.dispatchOnEvent(message);
  }

  protected void pullDownLinked(LinkedResponse response) {
    this.didLink(response);
    this.dispatchOnLinked(response);
  }

  protected void pullDownSynced(SyncedResponse response) {
    this.didSync(response);
    this.dispatchOnSynced(response);
  }

  protected void pullDownUnlinked(UnlinkedResponse response) {
    this.didUnlink(response);
    this.dispatchOnUnlinked(response);
  }

  protected void pushDown(Envelope envelope) {
    this.linkBinding.pushDown(new Push<Envelope>(Uri.empty(), this.hostUri(), this.nodeUri(),
                                                 this.laneUri(), this.prio(), null, envelope, null));
  }

  public void cueUp() {
    do {
      final int oldStatus = WarpUplinkModem.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & WarpUplinkModem.FEEDING_UP) != 0) {
        newStatus = oldStatus & ~WarpUplinkModem.FEEDING_UP | WarpUplinkModem.PULLING_UP;
        if (WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.linkBinding.pullUp();
          break;
        }
      } else {
        newStatus = oldStatus & ~WarpUplinkModem.PULLING_UP;
        if (oldStatus == newStatus || WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      }
    } while (true);
  }

  @Override
  public void feedUp() {
    do {
      final int oldStatus = WarpUplinkModem.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & WarpUplinkModem.PULLING_UP) == 0) {
        newStatus = oldStatus & ~WarpUplinkModem.FEEDING_UP | WarpUplinkModem.PULLING_UP;
        if (WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.linkBinding.pullUp();
          break;
        }
      } else {
        newStatus = oldStatus | WarpUplinkModem.FEEDING_UP;
        if (oldStatus == newStatus || WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
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
      this.pushUpCommand((Push<CommandMessage>) push);
    } else if (message instanceof LinkRequest) {
      this.pushUpLink((Push<LinkRequest>) push);
    } else if (message instanceof SyncRequest) {
      this.pushUpSync((Push<SyncRequest>) push);
    } else if (message instanceof UnlinkRequest) {
      this.pushUpUnlink((Push<UnlinkRequest>) push);
    } else if (message instanceof Envelope) {
      this.pushUpUnknown(push);
    }
  }

  protected void pushUpCommand(Push<CommandMessage> push) {
    final CommandMessage message = push.message();
    this.onCommand(message);
    this.laneBinding().pushUpCommand(push);
    if (!this.dispatchOnCommand(message, true)) {
      this.stage().execute(new WarpUplinkModemOnCommand(this, push));
    } else {
      this.cueUp();
    }
  }

  protected void runOnCommand(Push<CommandMessage> push) {
    try {
      this.dispatchOnCommand(push.message(), false);
    } catch (Throwable error) {
      if (Cont.isNonFatal(error)) {
        this.didFail(error);
      } else {
        throw error;
      }
    } finally {
      this.cueUp();
    }
  }

  protected void pushUpLink(Push<LinkRequest> push) {
    final LinkRequest request = push.message();
    this.willLink(request);
    if (!this.dispatchOnLink(request, true)) {
      this.stage().execute(new WarpUplinkModemOnLink(this, push));
    } else {
      push.bind();
      this.cueUp();
    }
  }

  protected void runOnLink(Push<LinkRequest> push) {
    try {
      this.dispatchOnLink(push.message(), false);
    } catch (Throwable error) {
      if (Cont.isNonFatal(error)) {
        this.didFail(error);
      } else {
        throw error;
      }
    } finally {
      push.bind();
      this.cueUp();
    }
  }

  protected void pushUpSync(Push<SyncRequest> push) {
    final SyncRequest request = push.message();
    this.willSync(request);
    if (!this.dispatchOnSync(request, true)) {
      this.stage().execute(new WarpUplinkModemOnSync(this, push));
    } else {
      push.bind();
      this.cueUp();
    }
  }

  protected void runOnSync(Push<SyncRequest> push) {
    try {
      this.dispatchOnSync(push.message(), false);
    } catch (Throwable error) {
      if (Cont.isNonFatal(error)) {
        this.didFail(error);
      } else {
        throw error;
      }
    } finally {
      push.bind();
      this.cueUp();
    }
  }

  protected void pushUpUnlink(Push<UnlinkRequest> push) {
    final UnlinkRequest request = push.message();
    this.willUnlink(request);
    if (!this.dispatchOnUnlink(request, true)) {
      this.stage().execute(new WarpUplinkModemOnUnlink(this, push));
    } else {
      push.bind();
    }
  }

  protected void runOnUnlink(Push<UnlinkRequest> push) {
    try {
      this.dispatchOnUnlink(push.message(), false);
    } catch (Throwable error) {
      if (Cont.isNonFatal(error)) {
        this.didFail(error);
      } else {
        throw error;
      }
    } finally {
      push.bind();
    }
  }

  protected void pushUpUnknown(Push<?> push) {
    push.bind();
    this.cueUp();
  }

  @Override
  public void skipUp() {
    this.cueUp();
  }

  public void unlink() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = WarpUplinkModem.STATUS.get(this);
      newStatus = oldStatus & ~(WarpUplinkModem.SYNCING | WarpUplinkModem.LINKING | WarpUplinkModem.LINKED) | (WarpUplinkModem.FEEDING_DOWN | WarpUplinkModem.UNLINKING);
      if (oldStatus != newStatus) {
        if (WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          if ((oldStatus & WarpUplinkModem.FEEDING_DOWN) == 0) {
            this.linkBinding.feedDown();
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
    if ((oldStatus & WarpUplinkModem.FEEDING_UP) != 0) {
      this.linkBinding.pullUp();
    }
  }

  protected void onEvent(EventMessage message) {
    WarpUplinkModem.EVENT_DELTA.incrementAndGet(this);
    this.didUpdateMetrics();
  }

  protected void onCommand(CommandMessage message) {
    WarpUplinkModem.COMMAND_DELTA.incrementAndGet(this);
    this.didUpdateMetrics();
  }

  protected void willLink(LinkRequest request) {
    do {
      final int oldStatus = WarpUplinkModem.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & WarpUplinkModem.FEEDING_UP) == 0) {
        newStatus = oldStatus & ~WarpUplinkModem.PULLING_UP | (WarpUplinkModem.FEEDING_DOWN | WarpUplinkModem.LINKING | WarpUplinkModem.LINKED);
      } else {
        newStatus = oldStatus | (WarpUplinkModem.FEEDING_DOWN | WarpUplinkModem.LINKING | WarpUplinkModem.LINKED);
      }
      if (oldStatus == newStatus || WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if ((oldStatus & WarpUplinkModem.FEEDING_DOWN) == 0) {
          this.linkBinding.feedDown();
        }
        if ((oldStatus & WarpUplinkModem.FEEDING_UP) != 0) {
          this.linkBinding.pullUp();
        }
        break;
      }
    } while (true);
  }

  protected void didLink(LinkedResponse response) {
    // hook
  }

  protected void willSync(SyncRequest request) {
    do {
      final int oldStatus = WarpUplinkModem.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & WarpUplinkModem.LINKED) == 0) {
        if ((oldStatus & WarpUplinkModem.FEEDING_UP) == 0) {
          newStatus = oldStatus & ~WarpUplinkModem.PULLING_UP | (WarpUplinkModem.FEEDING_DOWN | WarpUplinkModem.SYNCING | WarpUplinkModem.LINKING | WarpUplinkModem.LINKED);
        } else {
          newStatus = oldStatus | (WarpUplinkModem.FEEDING_DOWN | WarpUplinkModem.SYNCING | WarpUplinkModem.LINKING | WarpUplinkModem.LINKED);
        }
      } else {
        if ((oldStatus & WarpUplinkModem.FEEDING_UP) == 0) {
          newStatus = oldStatus & ~WarpUplinkModem.PULLING_UP | (WarpUplinkModem.FEEDING_DOWN | WarpUplinkModem.SYNCING);
        } else {
          newStatus = oldStatus | (WarpUplinkModem.FEEDING_DOWN | WarpUplinkModem.SYNCING);
        }
      }
      if (oldStatus == newStatus || WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if ((oldStatus & WarpUplinkModem.FEEDING_DOWN) == 0) {
          this.linkBinding.feedDown();
        }
        if ((oldStatus & WarpUplinkModem.FEEDING_UP) != 0) {
          this.linkBinding.pullUp();
        }
        break;
      }
    } while (true);
  }

  protected void didSync(SyncedResponse response) {
    // hook
  }

  protected void willUnlink(UnlinkRequest request) {
    do {
      final int oldStatus = WarpUplinkModem.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & WarpUplinkModem.FEEDING_UP) == 0) {
        newStatus = oldStatus & ~(WarpUplinkModem.PULLING_UP | WarpUplinkModem.SYNCING | WarpUplinkModem.LINKING | WarpUplinkModem.LINKED) | (WarpUplinkModem.FEEDING_DOWN | WarpUplinkModem.UNLINKING);
      } else {
        newStatus = oldStatus & ~(WarpUplinkModem.SYNCING | WarpUplinkModem.LINKING | WarpUplinkModem.LINKED) | (WarpUplinkModem.FEEDING_DOWN | WarpUplinkModem.UNLINKING);
      }
      if (oldStatus == newStatus || WarpUplinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        if ((oldStatus & WarpUplinkModem.FEEDING_DOWN) == 0) {
          this.linkBinding.feedDown();
        }
        if ((oldStatus & WarpUplinkModem.FEEDING_UP) != 0) {
          this.linkBinding.pullUp();
        }
        break;
      }
    } while (true);
  }

  protected void didUnlink(UnlinkedResponse response) {
    this.close();
  }

  protected LinkedResponse linkedResponse() {
    return new LinkedResponse(this.nodeUri(), this.laneUri(), this.prio(), this.rate(), this.body());
  }

  protected SyncedResponse syncedResponse() {
    return new SyncedResponse(this.nodeUri(), this.laneUri());
  }

  protected UnlinkedResponse unlinkedResponse() {
    return new UnlinkedResponse(this.nodeUri(), this.laneUri());
  }

  @Override
  protected void didClose() {
    super.didClose();
    this.dispatchDidClose();
    this.flushMetrics();
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.laneBinding().openMetaUplink(uplink, metaUplink);
  }

  protected void didUpdateMetrics() {
    do {
      final long newReportTime = System.currentTimeMillis();
      final long oldReportTime = WarpUplinkModem.LAST_REPORT_TIME.get(this);
      final long dt = newReportTime - oldReportTime;
      if (dt >= Metric.REPORT_INTERVAL) {
        if (WarpUplinkModem.LAST_REPORT_TIME.compareAndSet(this, oldReportTime, newReportTime)) {
          try {
            this.reportMetrics(dt);
          } catch (Throwable error) {
            if (Cont.isNonFatal(error)) {
              this.didFail(error);
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
    final long oldReportTime = WarpUplinkModem.LAST_REPORT_TIME.getAndSet(this, newReportTime);
    final long dt = newReportTime - oldReportTime;
    try {
      this.reportMetrics(dt);
    } catch (Throwable error) {
      if (Cont.isNonFatal(error)) {
        this.didFail(error);
      } else {
        throw error;
      }
    }
  }

  protected void reportMetrics(long dt) {
    final WarpUplinkProfile profile = this.collectProfile(dt);
    this.laneBinding().reportDown(profile);
  }

  protected WarpUplinkProfile collectProfile(long dt) {
    final int eventDelta = WarpUplinkModem.EVENT_DELTA.getAndSet(this, 0);
    final int eventRate = (int) Math.ceil((1000.0 * (double) eventDelta) / (double) dt);
    final long eventCount = WarpUplinkModem.EVENT_COUNT.addAndGet(this, (long) eventDelta);
    final int commandDelta = WarpUplinkModem.COMMAND_DELTA.getAndSet(this, 0);
    final int commandRate = (int) Math.ceil((1000.0 * (double) commandDelta) / (double) dt);
    final long commandCount = WarpUplinkModem.COMMAND_TOTAL.addAndGet(this, (long) commandDelta);

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
    this.uplink.runPullDown();
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
    this.uplink.runOnCommand(this.push);
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
    this.uplink.runOnLink(this.push);
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
    this.uplink.runOnSync(this.push);
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
    this.uplink.runOnUnlink(this.push);
  }

}
