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

package swim.runtime.warp;

import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicLongFieldUpdater;
import swim.api.LaneException;
import swim.api.auth.Identity;
import swim.api.warp.WarpUplink;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Cont;
import swim.runtime.LaneModel;
import swim.runtime.LaneRelay;
import swim.runtime.LinkBinding;
import swim.runtime.Metric;
import swim.runtime.Push;
import swim.runtime.WarpBinding;
import swim.runtime.profile.WarpDownlinkProfile;
import swim.runtime.profile.WarpLaneProfile;
import swim.runtime.profile.WarpUplinkProfile;
import swim.structure.Value;
import swim.warp.CommandMessage;

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

  public WarpLaneModel() {
    this.execDelta = 0L;
    this.execTime = 0L;
    this.commandDelta = 0;
    this.downlinkOpenDelta = 0;
    this.downlinkOpenCount = 0;
    this.downlinkCloseDelta = 0;
    this.downlinkCloseCount = 0;
    this.downlinkExecDelta = 0L;
    this.downlinkExecRate = 0L;
    this.downlinkEventDelta = 0;
    this.downlinkEventRate = 0;
    this.downlinkEventCount = 0L;
    this.downlinkCommandDelta = 0;
    this.downlinkCommandRate = 0;
    this.downlinkCommandCount = 0L;
    this.uplinkOpenDelta = 0;
    this.uplinkOpenCount = 0;
    this.uplinkCloseDelta = 0;
    this.uplinkCloseCount = 0;
    this.uplinkEventDelta = 0;
    this.uplinkEventRate = 0;
    this.uplinkEventCount = 0L;
    this.uplinkCommandDelta = 0;
    this.uplinkCommandRate = 0;
    this.uplinkCommandCount = 0L;
    this.lastReportTime = 0L;
  }

  @Override
  protected U createUplink(LinkBinding link) {
    if (link instanceof WarpBinding) {
      return this.createWarpUplink((WarpBinding) link);
    }
    return null;
  }

  protected abstract U createWarpUplink(WarpBinding link);

  @SuppressWarnings("unchecked")
  public void cueDown() {
    FingerTrieSeq<U> uplinks;
    FingerTrieSeq<Value> closedLinks = FingerTrieSeq.empty();
    do {
      uplinks = (FingerTrieSeq<U>) (FingerTrieSeq<?>) LaneModel.UPLINKS.get(this);
      for (int i = 0, n = uplinks.size(); i < n; i += 1) {
        final U uplink = uplinks.get(i);
        if (uplink.isConnected()) {
          uplink.cueDown();
        } else {
          closedLinks = closedLinks.appended(uplink.linkKey());
        }
      }
    } while (uplinks != LaneModel.UPLINKS.get(this));

    for (Value linkKey : closedLinks) {
      this.closeUplink(linkKey);
    }
  }

  @SuppressWarnings("unchecked")
  public void sendDown(Value body) {
    FingerTrieSeq<U> uplinks;
    FingerTrieSeq<Value> closedLinks = FingerTrieSeq.empty();
    do {
      uplinks = (FingerTrieSeq<U>) (FingerTrieSeq<?>) LaneModel.UPLINKS.get(this);
      for (int i = 0, n = uplinks.size(); i < n; i += 1) {
        final U uplink = uplinks.get(i);
        if (uplink.isConnected()) {
          uplink.sendDown(body);
        } else {
          closedLinks = closedLinks.appended(uplink.linkKey());
        }
      }
    } while (uplinks != LaneModel.UPLINKS.get(this));

    for (Value linkKey : closedLinks) {
      this.closeUplink(linkKey);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void pushUp(Push<?> push) {
    final Object message = push.message();
    if (message instanceof CommandMessage) {
      this.onCommand((Push<CommandMessage>) push);
    } else {
      push.trap(new LaneException("unsupported message: " + message));
    }
  }

  @Override
  public void pushUpCommand(Push<CommandMessage> push) {
    this.onCommand(push);
    WarpLaneModel.COMMAND_DELTA.incrementAndGet(this);
    this.didUpdateMetrics();
  }

  protected void onCommand(Push<CommandMessage> push) {
    new WarpLaneRelayOnCommand<View>(this, push.message(), push.cont()).run();
  }

  @Override
  protected void didOpenUplink(U uplink) {
    new WarpLaneRelayDidUplink<View>(this, uplink).run();
    WarpLaneModel.UPLINK_OPEN_DELTA.incrementAndGet(this);
    this.flushMetrics();
  }

  @Override
  protected void didCloseUplink(U uplink) {
    WarpLaneModel.UPLINK_CLOSE_DELTA.incrementAndGet(this);
    this.flushMetrics();
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
    this.flushMetrics();
  }

  @Override
  public void reportDown(Metric metric) {
    if (metric instanceof WarpUplinkProfile) {
      this.accumulateWarpUplinkProfile((WarpUplinkProfile) metric);
    } else if (metric instanceof WarpDownlinkProfile) {
      this.accumulateWarpDownlinkProfile((WarpDownlinkProfile) metric);
    } else {
      super.reportDown(metric);
    }
  }

  @Override
  public void accumulateExecTime(long execDelta) {
    WarpLaneModel.EXEC_DELTA.addAndGet(this, execDelta);
    this.didUpdateMetrics();
  }

  protected void accumulateWarpUplinkProfile(WarpUplinkProfile profile) {
    WarpLaneModel.UPLINK_EVENT_DELTA.addAndGet(this, profile.eventDelta());
    WarpLaneModel.UPLINK_EVENT_RATE.addAndGet(this, profile.eventRate());
    WarpLaneModel.UPLINK_COMMAND_DELTA.addAndGet(this, profile.commandDelta());
    WarpLaneModel.UPLINK_COMMAND_RATE.addAndGet(this, profile.commandRate());
    this.didUpdateMetrics();
  }

  protected void accumulateWarpDownlinkProfile(WarpDownlinkProfile profile) {
    WarpLaneModel.DOWNLINK_OPEN_DELTA.addAndGet(this, profile.openDelta());
    WarpLaneModel.DOWNLINK_CLOSE_DELTA.addAndGet(this, profile.closeDelta());
    WarpLaneModel.DOWNLINK_EXEC_DELTA.addAndGet(this, profile.execDelta());
    WarpLaneModel.DOWNLINK_EXEC_RATE.addAndGet(this, profile.execRate());
    WarpLaneModel.DOWNLINK_EVENT_DELTA.addAndGet(this, profile.eventDelta());
    WarpLaneModel.DOWNLINK_EVENT_RATE.addAndGet(this, profile.eventRate());
    WarpLaneModel.DOWNLINK_COMMAND_DELTA.addAndGet(this, profile.commandDelta());
    WarpLaneModel.DOWNLINK_COMMAND_RATE.addAndGet(this, profile.commandRate());
    this.didUpdateMetrics();
  }

  protected void didUpdateMetrics() {
    do {
      final long oldReportTime = WarpLaneModel.LAST_REPORT_TIME.get(this);
      final long newReportTime = System.currentTimeMillis();
      final long dt = newReportTime - oldReportTime;
      if (dt >= Metric.REPORT_INTERVAL) {
        if (WarpLaneModel.LAST_REPORT_TIME.compareAndSet(this, oldReportTime, newReportTime)) {
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
    final long oldReportTime = WarpLaneModel.LAST_REPORT_TIME.getAndSet(this, newReportTime);
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
    final WarpLaneProfile profile = this.collectProfile(dt);
    this.laneContext.reportDown(profile);
  }

  protected WarpLaneProfile collectProfile(long dt) {
    final int commandDelta = WarpLaneModel.COMMAND_DELTA.getAndSet(this, 0);
    final int commandRate = (int) Math.ceil((1000.0 * (double) commandDelta) / (double) dt);

    final int downlinkOpenDelta = WarpLaneModel.DOWNLINK_OPEN_DELTA.getAndSet(this, 0);
    final int downlinkOpenCount = WarpLaneModel.DOWNLINK_OPEN_COUNT.addAndGet(this, downlinkOpenDelta);
    final int downlinkCloseDelta = WarpLaneModel.DOWNLINK_CLOSE_DELTA.getAndSet(this, 0);
    final int downlinkCloseCount = WarpLaneModel.DOWNLINK_CLOSE_COUNT.addAndGet(this, downlinkCloseDelta);
    final long downlinkExecDelta = WarpLaneModel.DOWNLINK_EXEC_DELTA.getAndSet(this, 0L);
    final long downlinkExecRate = WarpLaneModel.DOWNLINK_EXEC_RATE.getAndSet(this, 0L);
    final int downlinkEventDelta = WarpLaneModel.DOWNLINK_EVENT_DELTA.getAndSet(this, 0);
    final int downlinkEventRate = WarpLaneModel.DOWNLINK_EVENT_RATE.getAndSet(this, 0);
    final long downlinkEventCount = WarpLaneModel.DOWNLINK_EVENT_COUNT.addAndGet(this, (long) downlinkEventDelta);
    final int downlinkCommandDelta = WarpLaneModel.DOWNLINK_COMMAND_DELTA.getAndSet(this, 0);
    final int downlinkCommandRate = WarpLaneModel.DOWNLINK_COMMAND_RATE.getAndSet(this, 0);
    final long downlinkCommandCount = WarpLaneModel.DOWNLINK_COMMAND_COUNT.addAndGet(this, (long) downlinkCommandDelta);

    final int uplinkOpenDelta = WarpLaneModel.UPLINK_OPEN_DELTA.getAndSet(this, 0);
    final int uplinkOpenCount = WarpLaneModel.UPLINK_OPEN_COUNT.addAndGet(this, uplinkOpenDelta);
    final int uplinkCloseDelta = WarpLaneModel.UPLINK_CLOSE_DELTA.getAndSet(this, 0);
    final int uplinkCloseCount = WarpLaneModel.UPLINK_CLOSE_COUNT.addAndGet(this, uplinkCloseDelta);
    final int uplinkEventDelta = WarpLaneModel.UPLINK_EVENT_DELTA.getAndSet(this, 0);
    final int uplinkEventRate = WarpLaneModel.UPLINK_EVENT_RATE.getAndSet(this, 0);
    final long uplinkEventCount = WarpLaneModel.UPLINK_EVENT_COUNT.addAndGet(this, (long) uplinkEventDelta);
    final int uplinkCommandDelta = WarpLaneModel.UPLINK_COMMAND_DELTA.getAndSet(this, 0) + commandDelta;
    final int uplinkCommandRate = WarpLaneModel.UPLINK_COMMAND_RATE.getAndSet(this, 0) + commandRate;
    final long uplinkCommandCount = WarpLaneModel.UPLINK_COMMAND_COUNT.addAndGet(this, (long) uplinkCommandDelta);

    final long execDelta = WarpLaneModel.EXEC_DELTA.getAndSet(this, 0L) + downlinkExecDelta;
    final long execRate = (long) Math.ceil((1000.0 * (double) execDelta) / (double) dt) + downlinkExecRate;
    final long execTime = WarpLaneModel.EXEC_TIME.addAndGet(this, execDelta);

    return new WarpLaneProfile(this.cellAddress(), execDelta, execRate, execTime,
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
  final Cont<CommandMessage> cont;

  WarpLaneRelayOnCommand(WarpLaneModel<View, ?> model, CommandMessage message, Cont<CommandMessage> cont) {
    super(model, 2);
    this.message = message;
    this.cont = cont;
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

  @Override
  protected void done() {
    if (this.cont != null) {
      try {
        this.cont.bind(this.message);
      } catch (Throwable error) {
        if (Cont.isNonFatal(error)) {
          this.cont.trap(error);
        } else {
          throw error;
        }
      }
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
