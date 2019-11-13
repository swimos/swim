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
import swim.api.auth.Identity;
import swim.api.warp.WarpUplink;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Conts;
import swim.runtime.LaneModel;
import swim.runtime.LaneRelay;
import swim.runtime.LinkBinding;
import swim.runtime.Metric;
import swim.runtime.PushRequest;
import swim.runtime.WarpBinding;
import swim.runtime.profile.WarpDownlinkProfile;
import swim.runtime.profile.WarpLaneProfile;
import swim.runtime.profile.WarpUplinkProfile;
import swim.structure.Value;
import swim.warp.CommandMessage;
import swim.warp.Envelope;

public abstract class WarpLaneModel<View extends WarpLaneView, U extends WarpUplinkModem> extends LaneModel<View, U> {
  volatile long execDelta;
  volatile long execTime;
  volatile int commandDelta;
  volatile int downlinkOpenDelta;
  volatile int downlinkOpenCount;
  volatile int downlinkCloseDelta;
  volatile int downlinkCloseCount;
  volatile long downlinkExecDelta;
  volatile long downlinkExecRate;
  volatile int downlinkEventDelta;
  volatile int downlinkEventRate;
  volatile long downlinkEventCount;
  volatile int downlinkCommandDelta;
  volatile int downlinkCommandRate;
  volatile long downlinkCommandCount;
  volatile int uplinkOpenDelta;
  volatile int uplinkOpenCount;
  volatile int uplinkCloseDelta;
  volatile int uplinkCloseCount;
  volatile int uplinkEventDelta;
  volatile int uplinkEventRate;
  volatile long uplinkEventCount;
  volatile int uplinkCommandDelta;
  volatile int uplinkCommandRate;
  volatile long uplinkCommandCount;
  volatile long lastReportTime;

  @Override
  protected U createUplink(LinkBinding link) {
    if (link instanceof WarpBinding) {
      return createWarpUplink((WarpBinding) link);
    }
    return null;
  }

  protected abstract U createWarpUplink(WarpBinding link);

  @SuppressWarnings("unchecked")
  public void cueDown() {
    FingerTrieSeq<U> uplinks;
    FingerTrieSeq<Value> closedLinks = FingerTrieSeq.empty();
    do {
      uplinks = (FingerTrieSeq<U>) (FingerTrieSeq<?>) this.uplinks;
      for (int i = 0, n = uplinks.size(); i < n; i += 1) {
        final U uplink = uplinks.get(i);
        if (uplink.isConnected()) {
          uplink.cueDown();
        } else {
          closedLinks = closedLinks.appended(uplink.linkKey());
        }
      }
    } while (uplinks != this.uplinks);

    for (Value linkKey : closedLinks) {
      closeUplink(linkKey);
    }
  }

  @SuppressWarnings("unchecked")
  public void sendDown(Value body) {
    FingerTrieSeq<U> uplinks;
    FingerTrieSeq<Value> closedLinks = FingerTrieSeq.empty();
    do {
      uplinks = (FingerTrieSeq<U>) (FingerTrieSeq<?>) this.uplinks;
      for (int i = 0, n = uplinks.size(); i < n; i += 1) {
        final U uplink = uplinks.get(i);
        if (uplink.isConnected()) {
          uplink.sendDown(body);
        } else {
          closedLinks = closedLinks.appended(uplink.linkKey());
        }
      }
    } while (uplinks != this.uplinks);

    for (Value linkKey : closedLinks) {
      closeUplink(linkKey);
    }
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    final Envelope envelope = pushRequest.envelope();
    if (envelope instanceof CommandMessage) {
      try {
        onCommand((CommandMessage) envelope);
      } finally {
        pushRequest.didDeliver();
      }
    } else {
      pushRequest.didDecline();
    }
  }

  @Override
  public void pushUpCommand(CommandMessage message) {
    onCommand(message);
    COMMAND_DELTA.incrementAndGet(this);
    didUpdateMetrics();
  }

  protected void onCommand(CommandMessage message) {
    new WarpLaneRelayOnCommand<View>(this, message).run();
  }

  @Override
  protected void didOpenUplink(U uplink) {
    new WarpLaneRelayDidUplink<View>(this, uplink).run();
    UPLINK_OPEN_DELTA.incrementAndGet(this);
    flushMetrics();
  }

  @Override
  protected void didCloseUplink(U uplink) {
    UPLINK_CLOSE_DELTA.incrementAndGet(this);
    flushMetrics();
  }

  protected void didEnter(Identity identity) {
    new WarpLaneRelayDidEnter<View>(this, identity).run();
  }

  protected void didLeave(Identity identity) {
    new WarpLaneRelayDidLeave<View>(this, identity).run();
  }

  @Override
  public void didClose() {
    super.didClose();
    flushMetrics();
  }

  @Override
  public void reportDown(Metric metric) {
    if (metric instanceof WarpUplinkProfile) {
      accumulateWarpUplinkProfile((WarpUplinkProfile) metric);
    } else if (metric instanceof WarpDownlinkProfile) {
      accumulateWarpDownlinkProfile((WarpDownlinkProfile) metric);
    } else {
      super.reportDown(metric);
    }
  }

  @Override
  public void accumulateExecTime(long execDelta) {
    EXEC_DELTA.addAndGet(this, execDelta);
    didUpdateMetrics();
  }

  protected void accumulateWarpUplinkProfile(WarpUplinkProfile profile) {
    UPLINK_EVENT_DELTA.addAndGet(this, profile.eventDelta());
    UPLINK_EVENT_RATE.addAndGet(this, profile.eventRate());
    UPLINK_COMMAND_DELTA.addAndGet(this, profile.commandDelta());
    UPLINK_COMMAND_RATE.addAndGet(this, profile.commandRate());
    didUpdateMetrics();
  }

  protected void accumulateWarpDownlinkProfile(WarpDownlinkProfile profile) {
    DOWNLINK_OPEN_DELTA.addAndGet(this, profile.openDelta());
    DOWNLINK_CLOSE_DELTA.addAndGet(this, profile.closeDelta());
    DOWNLINK_EXEC_DELTA.addAndGet(this, profile.execDelta());
    DOWNLINK_EXEC_RATE.addAndGet(this, profile.execRate());
    DOWNLINK_EVENT_DELTA.addAndGet(this, profile.eventDelta());
    DOWNLINK_EVENT_RATE.addAndGet(this, profile.eventRate());
    DOWNLINK_COMMAND_DELTA.addAndGet(this, profile.commandDelta());
    DOWNLINK_COMMAND_RATE.addAndGet(this, profile.commandRate());
    didUpdateMetrics();
  }

  protected void didUpdateMetrics() {
    do {
      final long oldReportTime = this.lastReportTime;
      final long newReportTime = System.currentTimeMillis();
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
    final WarpLaneProfile profile = collectProfile(dt);
    this.laneContext.reportDown(profile);
  }

  protected WarpLaneProfile collectProfile(long dt) {
    final int commandDelta = COMMAND_DELTA.getAndSet(this, 0);
    final int commandRate = (int) Math.ceil((1000.0 * (double) commandDelta) / (double) dt);

    final int downlinkOpenDelta = DOWNLINK_OPEN_DELTA.getAndSet(this, 0);
    final int downlinkOpenCount = DOWNLINK_OPEN_COUNT.addAndGet(this, downlinkOpenDelta);
    final int downlinkCloseDelta = DOWNLINK_CLOSE_DELTA.getAndSet(this, 0);
    final int downlinkCloseCount = DOWNLINK_CLOSE_COUNT.addAndGet(this, downlinkCloseDelta);
    final long downlinkExecDelta = DOWNLINK_EXEC_DELTA.getAndSet(this, 0L);
    final long downlinkExecRate = DOWNLINK_EXEC_RATE.getAndSet(this, 0L);
    final int downlinkEventDelta = DOWNLINK_EVENT_DELTA.getAndSet(this, 0);
    final int downlinkEventRate = DOWNLINK_EVENT_RATE.getAndSet(this, 0);
    final long downlinkEventCount = DOWNLINK_EVENT_COUNT.addAndGet(this, (long) downlinkEventDelta);
    final int downlinkCommandDelta = DOWNLINK_COMMAND_DELTA.getAndSet(this, 0);
    final int downlinkCommandRate = DOWNLINK_COMMAND_RATE.getAndSet(this, 0);
    final long downlinkCommandCount = DOWNLINK_COMMAND_COUNT.addAndGet(this, (long) downlinkCommandDelta);

    final int uplinkOpenDelta = UPLINK_OPEN_DELTA.getAndSet(this, 0);
    final int uplinkOpenCount = UPLINK_OPEN_COUNT.addAndGet(this, uplinkOpenDelta);
    final int uplinkCloseDelta = UPLINK_CLOSE_DELTA.getAndSet(this, 0);
    final int uplinkCloseCount = UPLINK_CLOSE_COUNT.addAndGet(this, uplinkCloseDelta);
    final int uplinkEventDelta = UPLINK_EVENT_DELTA.getAndSet(this, 0);
    final int uplinkEventRate = UPLINK_EVENT_RATE.getAndSet(this, 0);
    final long uplinkEventCount = UPLINK_EVENT_COUNT.addAndGet(this, (long) uplinkEventDelta);
    final int uplinkCommandDelta = UPLINK_COMMAND_DELTA.getAndSet(this, 0) + commandDelta;
    final int uplinkCommandRate = UPLINK_COMMAND_RATE.getAndSet(this, 0) + commandRate;
    final long uplinkCommandCount = UPLINK_COMMAND_COUNT.addAndGet(this, (long) uplinkCommandDelta);

    final long execDelta = EXEC_DELTA.getAndSet(this, 0L) + downlinkExecDelta;
    final long execRate = (long) Math.ceil((1000.0 * (double) execDelta) / (double) dt) + downlinkExecRate;
    final long execTime = EXEC_TIME.addAndGet(this, execDelta);

    return new WarpLaneProfile(cellAddress(), execDelta, execRate, execTime,
                               downlinkOpenDelta, downlinkOpenCount, downlinkCloseDelta, downlinkCloseCount,
                               downlinkEventDelta, downlinkEventRate, downlinkEventCount,
                               downlinkCommandDelta, downlinkCommandRate, downlinkCommandCount,
                               uplinkOpenDelta, uplinkOpenCount, uplinkCloseDelta, uplinkCloseCount,
                               uplinkEventDelta, uplinkEventRate, uplinkEventCount,
                               uplinkCommandDelta, uplinkCommandRate, uplinkCommandCount);
  }

  @SuppressWarnings("unchecked")
  protected static final AtomicLongFieldUpdater<WarpLaneModel<?, ?>> EXEC_DELTA =
      AtomicLongFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "execDelta");
  @SuppressWarnings("unchecked")
  protected static final AtomicLongFieldUpdater<WarpLaneModel<?, ?>> EXEC_TIME =
      AtomicLongFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "execTime");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "commandDelta");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> DOWNLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "downlinkOpenDelta");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> DOWNLINK_OPEN_COUNT =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "downlinkOpenCount");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> DOWNLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "downlinkCloseDelta");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> DOWNLINK_CLOSE_COUNT =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "downlinkCloseCount");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<WarpLaneModel<?, ?>> DOWNLINK_EXEC_DELTA =
      AtomicLongFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "downlinkExecDelta");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<WarpLaneModel<?, ?>> DOWNLINK_EXEC_RATE =
      AtomicLongFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "downlinkExecRate");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> DOWNLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "downlinkEventDelta");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> DOWNLINK_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "downlinkEventRate");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<WarpLaneModel<?, ?>> DOWNLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "downlinkEventCount");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> DOWNLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "downlinkCommandDelta");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> DOWNLINK_COMMAND_RATE =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "downlinkCommandRate");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<WarpLaneModel<?, ?>> DOWNLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "downlinkCommandCount");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> UPLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "uplinkOpenDelta");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> UPLINK_OPEN_COUNT =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "uplinkOpenCount");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> UPLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "uplinkCloseDelta");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> UPLINK_CLOSE_COUNT =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "uplinkCloseCount");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> UPLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "uplinkEventDelta");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> UPLINK_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "uplinkEventRate");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<WarpLaneModel<?, ?>> UPLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "uplinkEventCount");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> UPLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "uplinkCommandDelta");
  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<WarpLaneModel<?, ?>> UPLINK_COMMAND_RATE =
      AtomicIntegerFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "uplinkCommandRate");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<WarpLaneModel<?, ?>> UPLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "uplinkCommandCount");
  @SuppressWarnings("unchecked")
  static final AtomicLongFieldUpdater<WarpLaneModel<?, ?>> LAST_REPORT_TIME =
      AtomicLongFieldUpdater.newUpdater((Class<WarpLaneModel<?, ?>>) (Class<?>) WarpLaneModel.class, "lastReportTime");
}

final class WarpLaneRelayOnCommand<View extends WarpLaneView> extends LaneRelay<WarpLaneModel<View, ?>, View> {
  final CommandMessage message;

  WarpLaneRelayOnCommand(WarpLaneModel<View, ?> model, CommandMessage message) {
    super(model, 2);
    this.message = message;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else if (phase == 1) {
      if (preemptive) {
        view.laneDidCommand(this.message);
      }
      return view.dispatchDidCommand(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class WarpLaneRelayDidUplink<View extends WarpLaneView> extends LaneRelay<LaneModel<View, ?>, View> {
  final WarpUplink uplink;

  WarpLaneRelayDidUplink(LaneModel<View, ?> model, WarpUplink uplink) {
    super(model);
    this.uplink = uplink;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneDidUplink(this.uplink);
      }
      return view.dispatchDidUplink(this.uplink, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class WarpLaneRelayDidEnter<View extends WarpLaneView> extends LaneRelay<WarpLaneModel<View, ?>, View> {
  final Identity identity;

  WarpLaneRelayDidEnter(WarpLaneModel<View, ?> model, Identity identity) {
    super(model);
    this.identity = identity;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneDidEnter(this.identity);
      }
      return view.dispatchDidEnter(this.identity, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}

final class WarpLaneRelayDidLeave<View extends WarpLaneView> extends LaneRelay<WarpLaneModel<View, ?>, View> {
  final Identity identity;

  WarpLaneRelayDidLeave(WarpLaneModel<View, ?> model, Identity identity) {
    super(model);
    this.identity = identity;
  }

  @Override
  protected boolean runPhase(View view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneDidLeave(this.identity);
      }
      return view.dispatchDidLeave(this.identity, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}
