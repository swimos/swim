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
import swim.runtime.LinkKeys;
import swim.runtime.WarpBinding;
import swim.runtime.WarpContext;
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
  protected final Value linkKey;

  protected volatile int status;

  protected WarpUplinkModem(WarpBinding linkBinding, Value linkKey) {
    this.linkBinding = linkBinding;
    this.linkKey = linkKey.commit();
  }

  protected WarpUplinkModem(WarpBinding linkBinding) {
    this(linkBinding, LinkKeys.generateLinkKey());
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
      stage().execute(new WarpUplinkModemOnCommand(this, message));
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
      stage().execute(new WarpUplinkModemOnLink(this, request));
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
      stage().execute(new WarpUplinkModemOnSync(this, request));
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
      stage().execute(new WarpUplinkModemOnUnlink(this, request));
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

  protected LinkedResponse linkedResponse() {
    return new LinkedResponse(nodeUri(), laneUri(), prio(), rate(), body());
  }

  protected SyncedResponse syncedResponse() {
    return new SyncedResponse(nodeUri(), laneUri());
  }

  protected UnlinkedResponse unlinkedResponse() {
    return new UnlinkedResponse(nodeUri(), laneUri());
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
  final CommandMessage message;

  WarpUplinkModemOnCommand(WarpUplinkModem uplink, CommandMessage message) {
    this.uplink = uplink;
    this.message = message;
  }

  @Override
  public void run() {
    uplink.runOnCommand(message);
  }
}

final class WarpUplinkModemOnLink implements Runnable {
  final WarpUplinkModem uplink;
  final LinkRequest request;

  WarpUplinkModemOnLink(WarpUplinkModem uplink, LinkRequest request) {
    this.uplink = uplink;
    this.request = request;
  }

  @Override
  public void run() {
    uplink.runOnLink(request);
  }
}

final class WarpUplinkModemOnSync implements Runnable {
  final WarpUplinkModem uplink;
  final SyncRequest request;

  WarpUplinkModemOnSync(WarpUplinkModem uplink, SyncRequest request) {
    this.uplink = uplink;
    this.request = request;
  }

  @Override
  public void run() {
    uplink.runOnSync(request);
  }
}

final class WarpUplinkModemOnUnlink implements Runnable {
  final WarpUplinkModem uplink;
  final UnlinkRequest request;

  WarpUplinkModemOnUnlink(WarpUplinkModem uplink, UnlinkRequest request) {
    this.uplink = uplink;
    this.request = request;
  }

  @Override
  public void run() {
    uplink.runOnUnlink(request);
  }
}
