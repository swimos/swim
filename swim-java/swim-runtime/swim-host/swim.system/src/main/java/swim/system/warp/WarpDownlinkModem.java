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
import swim.concurrent.Cont;
import swim.structure.Value;
import swim.system.CellContext;
import swim.system.DownlinkModel;
import swim.system.DownlinkView;
import swim.system.LinkBinding;
import swim.system.LinkContext;
import swim.system.Metric;
import swim.system.NodeBinding;
import swim.system.Push;
import swim.system.WarpBinding;
import swim.system.WarpContext;
import swim.system.profile.WarpDownlinkProfile;
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

public abstract class WarpDownlinkModem<View extends DownlinkView> extends DownlinkModel<View> implements WarpBinding {

  protected final float prio;
  protected final float rate;
  protected final Value body;
  protected WarpContext linkContext;
  protected CellContext cellContext;
  protected volatile int status;

  volatile long execDelta;
  volatile long execTime;
  volatile int openDelta;
  volatile int openCount;
  volatile int closeDelta;
  volatile int closeCount;
  volatile int eventDelta;
  volatile int commandDelta;
  volatile long eventCount;
  volatile long commandCount;
  volatile long lastReportTime;

  public WarpDownlinkModem(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                           float prio, float rate, Value body) {
    super(meshUri, hostUri, nodeUri, laneUri);
    this.prio = prio;
    this.rate = rate;
    this.body = body;
    this.linkContext = null;
    this.cellContext = null;
    this.status = 0;

    this.execDelta = 0L;
    this.execTime = 0L;
    this.openDelta = 0;
    this.openCount = 0;
    this.closeDelta = 0;
    this.closeCount = 0;
    this.eventDelta = 0;
    this.commandDelta = 0;
    this.eventCount = 0L;
    this.commandCount = 0L;
    this.lastReportTime = 0L;
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
  public final CellContext cellContext() {
    return this.cellContext;
  }

  @Override
  public void setCellContext(CellContext cellContext) {
    this.cellContext = cellContext;
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

  public void cueDown() {
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & WarpDownlinkModem.FEEDING_DOWN) != 0) {
        newStatus = oldStatus & ~WarpDownlinkModem.FEEDING_DOWN | WarpDownlinkModem.PULLING_DOWN;
        if (WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.linkContext.pullDown();
          break;
        }
      } else {
        newStatus = oldStatus & ~WarpDownlinkModem.PULLING_DOWN;
        if (oldStatus == newStatus || WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      }
    } while (true);
  }

  @Override
  public void feedDown() {
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & WarpDownlinkModem.PULLING_DOWN) == 0) {
        newStatus = oldStatus & ~WarpDownlinkModem.FEEDING_DOWN | WarpDownlinkModem.PULLING_DOWN;
        if (WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.linkContext.pullDown();
          break;
        }
      } else {
        newStatus = oldStatus | WarpDownlinkModem.FEEDING_DOWN;
        if (oldStatus == newStatus || WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  @Override
  public void pushDown(Push<?> push) {
    final Object message = push.message();
    if (message instanceof EventMessage) {
      this.pushDownEvent((Push<EventMessage>) push);
    } else if (message instanceof LinkedResponse) {
      this.pushDownLinked((Push<LinkedResponse>) push);
    } else if (message instanceof SyncedResponse) {
      this.pushDownSynced((Push<SyncedResponse>) push);
    } else if (message instanceof UnlinkedResponse) {
      this.pushDownUnlinked((Push<UnlinkedResponse>) push);
    } else {
      this.pushDownUnknown(push);
    }
  }

  protected void pushDownEvent(Push<EventMessage> push) {
    try {
      this.onEvent(push.message());
    } finally {
      push.bind();
      this.cueDown();
    }
  }

  protected void pushDownLinked(Push<LinkedResponse> push) {
    try {
      this.didLink(push.message());
    } finally {
      push.bind();
      this.cueDown();
    }
  }

  protected void pushDownSynced(Push<SyncedResponse> push) {
    try {
      this.didSync(push.message());
    } finally {
      push.bind();
      this.cueDown();
    }
  }

  protected void pushDownUnlinked(Push<UnlinkedResponse> push) {
    try {
      this.didUnlink(push.message());
    } finally {
      push.bind();
      // Don't cueDown
    }
  }

  protected void pushDownUnknown(Push<?> push) {
    push.bind();
  }

  @Override
  public void skipDown() {
    this.cueDown();
  }

  protected boolean upQueueIsEmpty() {
    return true;
  }

  protected void queueUp(Value body, Cont<CommandMessage> cont) {
    throw new UnsupportedOperationException();
  }

  protected Push<CommandMessage> nextUpQueue() {
    return null;
  }

  protected Push<CommandMessage> nextUpCue() {
    return null;
  }

  public void pushUp(Value body) {
    this.queueUp(body, null);
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      final int newStatus = oldStatus | WarpDownlinkModem.FEEDING_UP;
      if (oldStatus != newStatus) {
        if (WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          this.linkContext.feedUp();
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  public void cueUp() {
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      final int newStatus = oldStatus | (WarpDownlinkModem.FEEDING_UP | WarpDownlinkModem.CUED_UP);
      if (oldStatus != newStatus) {
        if (WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          if ((oldStatus & WarpDownlinkModem.FEEDING_UP) == 0) {
            this.linkContext.feedUp();
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  protected void feedUp() {
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      if ((oldStatus & WarpDownlinkModem.CUED_UP) != 0 || !this.upQueueIsEmpty()) {
        final int newStatus = oldStatus | WarpDownlinkModem.FEEDING_UP;
        if (oldStatus != newStatus) {
          if (WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
            this.linkContext.feedUp();
            break;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  @Override
  public void pullUp() {
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & WarpDownlinkModem.UNLINK) != 0) {
        newStatus = oldStatus & ~(WarpDownlinkModem.UNLINK | WarpDownlinkModem.FEEDING_UP);
        if (WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          final UnlinkRequest request = this.unlinkRequest();
          this.pullUpUnlink(request);
          this.pushUp(request);
          break;
        }
      } else if ((oldStatus & WarpDownlinkModem.SYNC) != 0) {
        newStatus = oldStatus & ~(WarpDownlinkModem.LINK | WarpDownlinkModem.SYNC | WarpDownlinkModem.FEEDING_UP);
        if (WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          final SyncRequest request = this.syncRequest();
          this.pullUpSync(request);
          this.pushUp(request);
          this.feedUp();
          break;
        }
      } else if ((oldStatus & WarpDownlinkModem.LINK) != 0) {
        newStatus = oldStatus & ~(WarpDownlinkModem.LINK | WarpDownlinkModem.FEEDING_UP);
        if (WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          final LinkRequest request = this.linkRequest();
          this.pullUpLink(request);
          this.pushUp(request);
          this.feedUp();
          break;
        }
      } else {
        newStatus = oldStatus & ~(WarpDownlinkModem.CUED_UP | WarpDownlinkModem.FEEDING_UP);
        if (oldStatus == newStatus || WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          Push<CommandMessage> push = this.nextUpQueue();
          if (push == null && (oldStatus & WarpDownlinkModem.CUED_UP) != 0) {
            push = this.nextUpCue();
          }
          if (push != null) {
            this.pullUpCommand(push.message());
            this.linkContext.pushUp(push);
            this.feedUp();
          } else {
            this.linkContext.skipUp();
          }
          break;
        }
      }
    } while (true);
  }

  protected void pullUpCommand(CommandMessage message) {
    this.onCommand(message);
  }

  protected void pullUpLink(LinkRequest request) {
    this.willLink(request);
  }

  protected void pullUpSync(SyncRequest request) {
    this.willSync(request);
  }

  protected void pullUpUnlink(UnlinkRequest request) {
    this.willUnlink(request);
  }

  protected void pushUp(Envelope envelope) {
    this.linkContext.pushUp(new Push<Envelope>(Uri.empty(), this.hostUri(), this.nodeUri(),
                                               this.laneUri(), this.prio(), null, envelope, null));
  }

  public void link() {
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & (WarpDownlinkModem.LINKED | WarpDownlinkModem.OPENED)) == WarpDownlinkModem.OPENED) {
        newStatus = oldStatus | (WarpDownlinkModem.FEEDING_UP | WarpDownlinkModem.LINKING | WarpDownlinkModem.LINK | WarpDownlinkModem.LINKED);
        if (WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          if ((oldStatus & WarpDownlinkModem.FEEDING_UP) == 0 && this.linkContext != null) {
            this.linkContext.feedUp();
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  public void sync() {
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & (WarpDownlinkModem.LINKED | WarpDownlinkModem.OPENED)) == WarpDownlinkModem.OPENED) {
        newStatus = oldStatus | (WarpDownlinkModem.FEEDING_UP | WarpDownlinkModem.SYNCING | WarpDownlinkModem.SYNC | WarpDownlinkModem.LINKING | WarpDownlinkModem.LINK | WarpDownlinkModem.LINKED);
        if (WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          if ((oldStatus & WarpDownlinkModem.FEEDING_UP) == 0 && this.linkContext != null) {
            this.linkContext.feedUp();
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  public void unlink() {
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      final int newStatus;
      if ((oldStatus & WarpDownlinkModem.LINK) != 0) {
        newStatus = oldStatus & ~(WarpDownlinkModem.FEEDING_UP | WarpDownlinkModem.SYNCING | WarpDownlinkModem.SYNC | WarpDownlinkModem.LINKING | WarpDownlinkModem.LINK | WarpDownlinkModem.LINKED);
        if (WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          break;
        }
      } else if ((oldStatus & (WarpDownlinkModem.UNLINKING | WarpDownlinkModem.LINKED)) == WarpDownlinkModem.LINKED) {
        newStatus = oldStatus & ~(WarpDownlinkModem.SYNCING | WarpDownlinkModem.SYNC | WarpDownlinkModem.LINKING | WarpDownlinkModem.LINK) | (WarpDownlinkModem.FEEDING_UP | WarpDownlinkModem.UNLINKING | WarpDownlinkModem.UNLINK);
        if (WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
          if ((oldStatus & WarpDownlinkModem.FEEDING_UP) == 0 && this.linkContext != null) {
            this.linkContext.feedUp();
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  public void command(float prio, Value body, Cont<CommandMessage> cont) {
    this.queueUp(body, cont);
  }

  public void command(Value body, Cont<CommandMessage> cont) {
    this.queueUp(body, cont);
  }

  public void command(float prio, Value body) {
    this.queueUp(body, null);
  }

  public void command(Value body) {
    this.queueUp(body, null);
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

  protected void didAddDownlink(View view) {
    super.didAddDownlink(view);
    WarpDownlinkModem.OPEN_DELTA.incrementAndGet(this);
    this.flushMetrics();
  }

  protected void didRemoveDownlink(View view) {
    super.didRemoveDownlink(view);
    WarpDownlinkModem.CLOSE_DELTA.incrementAndGet(this);
  }

  @Override
  public void openDown() {
    this.didOpen();
    this.linkContext.didOpenDown();
    if ((WarpDownlinkModem.STATUS.get(this) & WarpDownlinkModem.FEEDING_UP) != 0) {
      this.linkContext.feedUp();
    }
  }

  protected void didOpen() {
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      final int newStatus = oldStatus | WarpDownlinkModem.OPENED;
      if (oldStatus == newStatus || WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        break;
      }
    } while (true);
    if (this.keepLinked()) {
      if (this.keepSynced()) {
        this.sync();
      } else {
        this.link();
      }
    }
  }

  @Override
  public void closeDown() {
    final CellContext cellContext = this.cellContext;
    if (cellContext != null) {
      cellContext.closeDownlink(this);
    }
    this.didClose();
    this.linkContext.didCloseDown();
  }

  protected void didClose() {
    WarpDownlinkModem.STATUS.set(this, 0);
    this.removeDownlinks();
    this.flushMetrics();
  }

  protected void onEvent(EventMessage message) {
    EVENT_DELTA.incrementAndGet(this);
    this.didUpdateMetrics();
  }

  protected void onCommand(CommandMessage message) {
    COMMAND_DELTA.incrementAndGet(this);
    this.didUpdateMetrics();
  }

  protected void willLink(LinkRequest request) {
    // hook
  }

  protected void didLink(LinkedResponse response) {
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      final int newStatus = oldStatus & ~WarpDownlinkModem.LINKING;
      if (oldStatus == newStatus || WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        break;
      }
    } while (true);
  }

  protected void willSync(SyncRequest request) {
    // hook
  }

  protected void didSync(SyncedResponse response) {
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      final int newStatus = oldStatus & ~WarpDownlinkModem.SYNCING;
      if (oldStatus == newStatus || WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        break;
      }
    } while (true);
  }

  protected void willUnlink(UnlinkRequest request) {
    // hook
  }

  protected void didUnlink(UnlinkedResponse response) {
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      final int newStatus = oldStatus & ~(WarpDownlinkModem.PULLING_DOWN | WarpDownlinkModem.UNLINKING | WarpDownlinkModem.UNLINK | WarpDownlinkModem.SYNCING | WarpDownlinkModem.SYNC | WarpDownlinkModem.LINKING | WarpDownlinkModem.LINK | WarpDownlinkModem.LINKED);
      if (oldStatus == newStatus || WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        break;
      }
    } while (true);
  }

  @Override
  public void didConnect() {
    if (this.keepLinked()) {
      if (this.keepSynced()) {
        this.sync();
      } else {
        this.link();
      }
    }
    super.didConnect();
  }

  @Override
  public void didDisconnect() {
    do {
      final int oldStatus = WarpDownlinkModem.STATUS.get(this);
      final int newStatus = oldStatus & ~(WarpDownlinkModem.FEEDING_UP | WarpDownlinkModem.UNLINKING | WarpDownlinkModem.UNLINK | WarpDownlinkModem.SYNCING | WarpDownlinkModem.SYNC | WarpDownlinkModem.LINKING | WarpDownlinkModem.LINK | WarpDownlinkModem.LINKED);
      if (oldStatus == newStatus || WarpDownlinkModem.STATUS.compareAndSet(this, oldStatus, newStatus)) {
        break;
      }
    } while (true);
    super.didDisconnect();
  }

  @Override
  public void didCloseUp() {
    this.didClose();
    super.didCloseUp();
  }

  @Override
  public void didFailUp(Throwable error) {
    this.didFail(error);
    if (Cont.isNonFatal(error)) {
      this.reopen();
    }
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
    super.didFail(error);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    final CellContext cellContext = this.cellContext;
    if (cellContext != null) {
      cellContext.openMetaDownlink(downlink, metaDownlink);
    }
  }

  @Override
  public void accumulateExecTime(long execDelta) {
    WarpDownlinkModem.EXEC_DELTA.addAndGet(this, execDelta);
    this.didUpdateMetrics();
  }

  protected void didUpdateMetrics() {
    do {
      final long oldReportTime = WarpDownlinkModem.LAST_REPORT_TIME.get(this);
      final long newReportTime = System.currentTimeMillis();
      final long dt = newReportTime - oldReportTime;
      if (dt >= Metric.REPORT_INTERVAL) {
        if (WarpDownlinkModem.LAST_REPORT_TIME.compareAndSet(this, oldReportTime, newReportTime)) {
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
    final long oldReportTime = LAST_REPORT_TIME.getAndSet(this, newReportTime);
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
    final CellContext cellContext = this.cellContext;
    if (cellContext != null) {
      final WarpDownlinkProfile profile = this.collectProfile(dt);
      cellContext.reportDown(profile);
    }
  }

  protected WarpDownlinkProfile collectProfile(long dt) {
    final long execDelta = WarpDownlinkModem.EXEC_DELTA.getAndSet(this, 0L);
    final long execRate = (long) Math.ceil((1000.0 * (double) execDelta) / (double) dt);
    final long execTime = WarpDownlinkModem.EXEC_TIME.addAndGet(this, execDelta);

    final int openDelta = WarpDownlinkModem.OPEN_DELTA.getAndSet(this, 0);
    final int openCount = WarpDownlinkModem.OPEN_COUNT.addAndGet(this, openDelta);
    final int closeDelta = WarpDownlinkModem.CLOSE_DELTA.getAndSet(this, 0);
    final int closeCount = WarpDownlinkModem.CLOSE_COUNT.addAndGet(this, closeDelta);
    final int eventDelta = WarpDownlinkModem.EVENT_DELTA.getAndSet(this, 0);
    final int eventRate = (int) Math.ceil((1000.0 * (double) eventDelta) / (double) dt);
    final long eventCount = WarpDownlinkModem.EVENT_COUNT.addAndGet(this, (long) eventDelta);
    final int commandDelta = WarpDownlinkModem.COMMAND_DELTA.getAndSet(this, 0);
    final int commandRate = (int) Math.ceil((1000.0 * (double) commandDelta) / (double) dt);
    final long commandCount = WarpDownlinkModem.COMMAND_COUNT.addAndGet(this, (long) commandDelta);

    return new WarpDownlinkProfile(this.cellAddressDown(), execDelta, execRate, execTime,
                                   openDelta, openCount, closeDelta, closeCount,
                                   eventDelta, eventRate, eventCount,
                                   commandDelta, commandRate, commandCount);
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

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpDownlinkModem<?>> STATUS =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpDownlinkModem<?>>) (Class<?>) WarpDownlinkModem.class, "status");

  @SuppressWarnings("unchecked")
  protected static final AtomicLongFieldUpdater<WarpDownlinkModem<?>> EXEC_DELTA =
      AtomicLongFieldUpdater.newUpdater((Class<WarpDownlinkModem<?>>) (Class<?>) WarpDownlinkModem.class, "execDelta");
  @SuppressWarnings("unchecked")
  protected static final AtomicLongFieldUpdater<WarpDownlinkModem<?>> EXEC_TIME =
      AtomicLongFieldUpdater.newUpdater((Class<WarpDownlinkModem<?>>) (Class<?>) WarpDownlinkModem.class, "execTime");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpDownlinkModem<?>> OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpDownlinkModem<?>>) (Class<?>) WarpDownlinkModem.class, "openDelta");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpDownlinkModem<?>> OPEN_COUNT =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpDownlinkModem<?>>) (Class<?>) WarpDownlinkModem.class, "openCount");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpDownlinkModem<?>> CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpDownlinkModem<?>>) (Class<?>) WarpDownlinkModem.class, "closeDelta");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpDownlinkModem<?>> CLOSE_COUNT =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpDownlinkModem<?>>) (Class<?>) WarpDownlinkModem.class, "closeCount");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpDownlinkModem<?>> EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpDownlinkModem<?>>) (Class<?>) WarpDownlinkModem.class, "eventDelta");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<WarpDownlinkModem<?>> EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater((Class<WarpDownlinkModem<?>>) (Class<?>) WarpDownlinkModem.class, "eventCount");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpDownlinkModem<?>> COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpDownlinkModem<?>>) (Class<?>) WarpDownlinkModem.class, "commandDelta");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<WarpDownlinkModem<?>> COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater((Class<WarpDownlinkModem<?>>) (Class<?>) WarpDownlinkModem.class, "commandCount");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<WarpDownlinkModem<?>> LAST_REPORT_TIME =
      AtomicLongFieldUpdater.newUpdater((Class<WarpDownlinkModem<?>>) (Class<?>) WarpDownlinkModem.class, "lastReportTime");

}
