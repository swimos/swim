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

package swim.runtime.router;

import java.util.Iterator;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicLongFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Downlink;
import swim.api.lane.DemandLane;
import swim.api.lane.DemandMapLane;
import swim.api.lane.SupplyLane;
import swim.api.lane.function.OnCue;
import swim.api.lane.function.OnCueKey;
import swim.api.lane.function.OnSyncKeys;
import swim.api.policy.Policy;
import swim.api.warp.WarpUplink;
import swim.collections.HashTrieMap;
import swim.concurrent.Conts;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.AbstractTierBinding;
import swim.runtime.HostAddress;
import swim.runtime.HostBinding;
import swim.runtime.HostContext;
import swim.runtime.HttpBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.MeshBinding;
import swim.runtime.Metric;
import swim.runtime.NodeBinding;
import swim.runtime.PartAddress;
import swim.runtime.PartBinding;
import swim.runtime.PartContext;
import swim.runtime.PartException;
import swim.runtime.PartPredicate;
import swim.runtime.Push;
import swim.runtime.TierContext;
import swim.runtime.UplinkError;
import swim.runtime.WarpBinding;
import swim.runtime.agent.AgentNode;
import swim.runtime.profile.HostProfile;
import swim.runtime.profile.PartProfile;
import swim.runtime.profile.WarpDownlinkProfile;
import swim.runtime.reflect.AgentPulse;
import swim.runtime.reflect.HostInfo;
import swim.runtime.reflect.LogEntry;
import swim.runtime.reflect.PartPulse;
import swim.runtime.reflect.WarpDownlinkPulse;
import swim.runtime.reflect.WarpUplinkPulse;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class PartTable extends AbstractTierBinding implements PartBinding {
  final PartPredicate predicate;
  protected PartContext partContext;
  volatile HashTrieMap<Uri, HostBinding> hosts;
  volatile HashTrieMap<Value, LinkBinding> uplinks;
  volatile HostBinding master;

  volatile int hostOpenDelta;
  volatile long hostOpenCount;
  volatile int hostCloseDelta;
  volatile long hostCloseCount;
  volatile int nodeOpenDelta;
  volatile long nodeOpenCount;
  volatile int nodeCloseDelta;
  volatile long nodeCloseCount;
  volatile int agentOpenDelta;
  volatile long agentOpenCount;
  volatile int agentCloseDelta;
  volatile long agentCloseCount;
  volatile long agentExecDelta;
  volatile long agentExecRate;
  volatile long agentExecTime;
  volatile int timerEventDelta;
  volatile int timerEventRate;
  volatile long timerEventCount;
  volatile int downlinkOpenDelta;
  volatile long downlinkOpenCount;
  volatile int downlinkCloseDelta;
  volatile long downlinkCloseCount;
  volatile int downlinkEventDelta;
  volatile int downlinkEventRate;
  volatile long downlinkEventCount;
  volatile int downlinkCommandDelta;
  volatile int downlinkCommandRate;
  volatile long downlinkCommandCount;
  volatile int uplinkOpenDelta;
  volatile long uplinkOpenCount;
  volatile int uplinkCloseDelta;
  volatile long uplinkCloseCount;
  volatile int uplinkEventDelta;
  volatile int uplinkEventRate;
  volatile long uplinkEventCount;
  volatile int uplinkCommandDelta;
  volatile int uplinkCommandRate;
  volatile long uplinkCommandCount;
  volatile long lastReportTime;
  PartPulse pulse;

  AgentNode metaNode;
  DemandMapLane<Uri, HostInfo> metaHosts;
  DemandLane<PartPulse> metaPulse;
  SupplyLane<LogEntry> metaTraceLog;
  SupplyLane<LogEntry> metaDebugLog;
  SupplyLane<LogEntry> metaInfoLog;
  SupplyLane<LogEntry> metaWarnLog;
  SupplyLane<LogEntry> metaErrorLog;
  SupplyLane<LogEntry> metaFailLog;

  public PartTable(PartPredicate predicate) {
    this.hosts = HashTrieMap.empty();
    this.uplinks = HashTrieMap.empty();
    this.predicate = predicate;
  }

  public PartTable() {
    this(PartPredicate.any());
  }

  @Override
  public final TierContext tierContext() {
    return this.partContext;
  }

  @Override
  public final MeshBinding mesh() {
    return this.partContext.mesh();
  }

  @Override
  public final PartBinding partWrapper() {
    return this;
  }

  @Override
  public final PartContext partContext() {
    return this.partContext;
  }

  @Override
  public void setPartContext(PartContext partContext) {
    this.partContext = partContext;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapPart(Class<T> partClass) {
    if (partClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.partContext.unwrapPart(partClass);
    }
  }

  protected HostContext createHostContext(HostAddress hostAddress, HostBinding host) {
    return new PartTableHost(this, host, hostAddress);
  }

  @Override
  public final PartAddress cellAddress() {
    return this.partContext.cellAddress();
  }

  @Override
  public final String edgeName() {
    return this.partContext.edgeName();
  }

  @Override
  public final Uri meshUri() {
    return this.partContext.meshUri();
  }

  @Override
  public final Value partKey() {
    return this.partContext.partKey();
  }

  @Override
  public Policy policy() {
    return this.partContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.partContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.partContext.stage();
  }

  @Override
  public StoreBinding store() {
    return this.partContext.store();
  }

  @Override
  public PartPredicate predicate() {
    return this.predicate;
  }

  @Override
  public void openMetaPart(PartBinding part, NodeBinding metaPart) {
    if (metaPart instanceof AgentNode) {
      this.metaNode = (AgentNode) metaPart;
      openMetaLanes(part, (AgentNode) metaPart);
    }
    this.partContext.openMetaPart(part, metaPart);
  }

  protected void openMetaLanes(PartBinding part, AgentNode metaPart) {
    openReflectLanes(part, metaPart);
    openLogLanes(part, metaPart);
  }

  protected void openReflectLanes(PartBinding part, AgentNode metaPart) {
    this.metaHosts = metaPart.demandMapLane()
        .keyForm(Uri.form())
        .valueForm(HostInfo.form())
        .observe(new PartTableHostsController(part));
    metaPart.openLane(HOSTS_URI, this.metaHosts);

    this.metaPulse = metaNode.demandLane()
        .valueForm(PartPulse.form())
        .observe(new PartTablePulseController(this));
    metaNode.openLane(PartPulse.PULSE_URI, this.metaPulse);
  }

  protected void openLogLanes(PartBinding part, AgentNode metaPart) {
    this.metaTraceLog = metaPart.supplyLane()
        .valueForm(LogEntry.form());
    metaPart.openLane(LogEntry.TRACE_LOG_URI, this.metaTraceLog);

    this.metaDebugLog = metaPart.supplyLane()
        .valueForm(LogEntry.form());
    metaPart.openLane(LogEntry.DEBUG_LOG_URI, this.metaDebugLog);

    this.metaInfoLog = metaPart.supplyLane()
        .valueForm(LogEntry.form());
    metaPart.openLane(LogEntry.INFO_LOG_URI, this.metaInfoLog);

    this.metaWarnLog = metaPart.supplyLane()
        .valueForm(LogEntry.form());
    metaPart.openLane(LogEntry.WARN_LOG_URI, this.metaWarnLog);

    this.metaErrorLog = metaPart.supplyLane()
        .valueForm(LogEntry.form());
    metaPart.openLane(LogEntry.ERROR_LOG_URI, this.metaErrorLog);

    this.metaFailLog = metaPart.supplyLane()
        .valueForm(LogEntry.form());
    metaPart.openLane(LogEntry.FAIL_LOG_URI, this.metaFailLog);
  }

  @Override
  public HostBinding master() {
    return this.master;
  }

  @Override
  public void setMaster(HostBinding master) {
    this.master = master;
  }

  @Override
  public HashTrieMap<Uri, HostBinding> hosts() {
    return this.hosts;
  }

  @Override
  public HostBinding getHost(Uri hostUri) {
    return this.hosts.get(hostUri);
  }

  @Override
  public HostBinding openHost(Uri hostUri) {
    HashTrieMap<Uri, HostBinding> oldHosts;
    HashTrieMap<Uri, HostBinding> newHosts;
    HostBinding hostBinding = null;
    do {
      oldHosts = this.hosts;
      final HostBinding host = oldHosts.get(hostUri);
      if (host != null) {
        if (hostBinding != null) {
          // Lost creation race.
          hostBinding.close();
        }
        hostBinding = host;
        newHosts = oldHosts;
        break;
      } else if (hostBinding == null) {
        final HostAddress hostAddress = cellAddress().hostUri(hostUri);
        hostBinding = this.partContext.createHost(hostAddress);
        if (hostBinding != null) {
          hostBinding = this.partContext.injectHost(hostAddress, hostBinding);
          final HostContext hostContext = createHostContext(hostAddress, hostBinding);
          hostBinding.setHostContext(hostContext);
          hostBinding = hostBinding.hostWrapper();
          newHosts = oldHosts.updated(hostUri, hostBinding);
        } else {
          newHosts = oldHosts;
          break;
        }
      } else {
        newHosts = oldHosts.updated(hostUri, hostBinding);
      }
    } while (oldHosts != newHosts && !HOSTS.compareAndSet(this, oldHosts, newHosts));
    if (oldHosts != newHosts) {
      activate(hostBinding);
      didOpenHost(hostBinding);
    }
    return hostBinding;
  }

  @Override
  public HostBinding openHost(Uri hostUri, HostBinding host) {
    HashTrieMap<Uri, HostBinding> oldHosts;
    HashTrieMap<Uri, HostBinding> newHosts;
    HostBinding hostBinding = null;
    do {
      oldHosts = this.hosts;
      if (oldHosts.containsKey(hostUri) && host.hostContext() != null) {
        hostBinding = null;
        newHosts = oldHosts;
        break;
      } else {
        if (hostBinding == null) {
          final HostAddress hostAddress = cellAddress().hostUri(hostUri);
          hostBinding = this.partContext.injectHost(hostAddress, host);
          final HostContext hostContext = createHostContext(hostAddress, hostBinding);
          hostBinding.setHostContext(hostContext);
          hostBinding = hostBinding.hostWrapper();
        }
        newHosts = oldHosts.updated(hostUri, hostBinding);
      }
    } while (oldHosts != newHosts && !HOSTS.compareAndSet(this, oldHosts, newHosts));
    if (hostBinding != null) {
      activate(hostBinding);
      didOpenHost(hostBinding);
    }
    return hostBinding;
  }

  public void closeHost(Uri hostUri) {
    HashTrieMap<Uri, HostBinding> oldHosts;
    HashTrieMap<Uri, HostBinding> newHosts;
    HostBinding hostBinding = null;
    do {
      oldHosts = this.hosts;
      final HostBinding host = oldHosts.get(hostUri);
      if (host != null) {
        hostBinding = host;
        newHosts = oldHosts.removed(hostUri);
      } else {
        hostBinding = null;
        newHosts = oldHosts;
        break;
      }
    } while (oldHosts != newHosts && !HOSTS.compareAndSet(this, oldHosts, newHosts));
    if (hostBinding != null) {
      if (this.master == hostBinding) {
        this.master = null;
      }
      hostBinding.didClose();
      didCloseHost(hostBinding);
      if (newHosts.isEmpty()) {
        close();
      }
    }
  }

  protected void didOpenHost(HostBinding host) {
    final DemandMapLane<Uri, HostInfo> metaHosts = this.metaHosts;
    if (metaHosts != null) {
      metaHosts.cue(host.hostUri());
    }
    HOST_OPEN_DELTA.incrementAndGet(this);
    flushMetrics();
  }

  protected void didCloseHost(HostBinding host) {
    final DemandMapLane<Uri, HostInfo> metaHosts = this.metaHosts;
    if (metaHosts != null) {
      metaHosts.remove(host.hostUri());
    }
    HOST_CLOSE_DELTA.incrementAndGet(this);
    flushMetrics();
  }

  public void hostDidConnect(Uri hostUri) {
    this.partContext.hostDidConnect(hostUri);
  }

  public void hostDidDisconnect(Uri hostUri) {
    this.partContext.hostDidDisconnect(hostUri);
  }

  @Override
  public void reopenUplinks() {
    for (LinkBinding uplink : this.uplinks.values()) {
      uplink.reopen();
    }
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    this.partContext.openMetaHost(host, metaHost);
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.partContext.openMetaNode(node, metaNode);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.partContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.partContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.partContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    final LinkBinding link = this.partContext.bindDownlink(downlink);
    link.setCellContext(this);
    return link;
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.partContext.openDownlink(link);
    link.setCellContext(this);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void openUplink(LinkBinding link) {
    final Uri hostUri = link.hostUri();
    HostBinding hostBinding = null;
    if (!hostUri.isDefined() || hostUri.equals(link.meshUri())) {
      hostBinding = this.master;
    }
    if (hostBinding == null) {
      hostBinding = openHost(hostUri);
    }
    if (hostBinding != null) {
      if (link instanceof WarpBinding) {
        hostBinding.openUplink(new PartTableWarpUplink(this, (WarpBinding) link));
      } else if (link instanceof HttpBinding) {
        hostBinding.openUplink(new PartTableHttpUplink(this, (HttpBinding) link));
      } else {
        UplinkError.rejectUnsupported(link);
      }
    } else {
      UplinkError.rejectHostNotFound(link);
    }
  }

  void didOpenUplink(LinkBinding uplink) {
    HashTrieMap<Value, LinkBinding> oldUplinks;
    HashTrieMap<Value, LinkBinding> newUplinks;
    do {
      oldUplinks = this.uplinks;
      newUplinks = oldUplinks.updated(uplink.linkKey(), uplink);
    } while (oldUplinks != newUplinks && !UPLINKS.compareAndSet(this, oldUplinks, newUplinks));
  }

  void didCloseUplink(LinkBinding uplink) {
    HashTrieMap<Value, LinkBinding> oldUplinks;
    HashTrieMap<Value, LinkBinding> newUplinks;
    do {
      oldUplinks = this.uplinks;
      newUplinks = oldUplinks.removed(uplink.linkKey());
    } while (oldUplinks != newUplinks && !UPLINKS.compareAndSet(this, oldUplinks, newUplinks));
  }

  @Override
  public void pushDown(Push<?> push) {
    this.partContext.pushDown(push);
  }

  @Override
  public void pushUp(Push<?> push) {
    final Uri hostUri = push.hostUri();
    HostBinding hostBinding = null;
    if (!hostUri.isDefined() || hostUri.equals(push.meshUri())) {
      hostBinding = this.master;
    }
    if (hostBinding == null) {
      hostBinding = openHost(hostUri);
    }
    if (hostBinding != null) {
      hostBinding.pushUp(push);
    } else {
      push.trap(new PartException("unknown host: " + hostUri));
    }
  }

  @Override
  public void trace(Object message) {
    final SupplyLane<LogEntry> metaTraceLog = this.metaTraceLog;
    if (metaTraceLog != null) {
      metaTraceLog.push(LogEntry.trace(message));
    }
    this.partContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    final SupplyLane<LogEntry> metaDebugLog = this.metaDebugLog;
    if (metaDebugLog != null) {
      metaDebugLog.push(LogEntry.debug(message));
    }
    this.partContext.debug(message);
  }

  @Override
  public void info(Object message) {
    final SupplyLane<LogEntry> metaInfoLog = this.metaInfoLog;
    if (metaInfoLog != null) {
      metaInfoLog.push(LogEntry.info(message));
    }
    this.partContext.info(message);
  }

  @Override
  public void warn(Object message) {
    final SupplyLane<LogEntry> metaWarnLog = this.metaWarnLog;
    if (metaWarnLog != null) {
      metaWarnLog.push(LogEntry.warn(message));
    }
    this.partContext.warn(message);
  }

  @Override
  public void error(Object message) {
    final SupplyLane<LogEntry> metaErrorLog = this.metaErrorLog;
    if (metaErrorLog != null) {
      metaErrorLog.push(LogEntry.error(message));
    }
    this.partContext.error(message);
  }

  @Override
  public void fail(Object message) {
    final SupplyLane<LogEntry> metaFailLog = this.metaFailLog;
    if (metaFailLog != null) {
      metaFailLog.push(LogEntry.fail(message));
    }
    this.partContext.fail(message);
  }

  @Override
  protected void willOpen() {
    super.willOpen();
    final Iterator<HostBinding> hostsIterator = this.hosts.valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().open();
    }
  }

  @Override
  protected void willLoad() {
    super.willLoad();
    final Iterator<HostBinding> hostsIterator = this.hosts.valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().load();
    }
  }

  @Override
  protected void willStart() {
    super.willStart();
    final Iterator<HostBinding> hostsIterator = this.hosts.valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().start();
    }
  }

  @Override
  protected void willStop() {
    super.willStop();
    final Iterator<HostBinding> hostsIterator = this.hosts.valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().stop();
    }
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    final Iterator<HostBinding> hostsIterator = this.hosts.valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().unload();
    }
  }

  @Override
  protected void willClose() {
    super.willClose();
    final Iterator<HostBinding> hostsIterator = this.hosts.valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().close();
    }
  }

  @Override
  public void didClose() {
    super.didClose();
    final AgentNode metaNode = this.metaNode;
    if (metaNode != null) {
      metaNode.close();
      this.metaNode = null;
      this.metaHosts = null;
      this.metaTraceLog = null;
      this.metaDebugLog = null;
      this.metaInfoLog = null;
      this.metaWarnLog = null;
      this.metaErrorLog = null;
      this.metaFailLog = null;
    } 
    flushMetrics();
  }

  @Override
  public void didFail(Throwable error) {
    if (Conts.isNonFatal(error)) {
      fail(error);
    } else {
      error.printStackTrace();
    }
  }

  @Override
  public void reportDown(Metric metric) {
    if (metric instanceof HostProfile) {
      accumulateHostProfile((HostProfile) metric);
    } else if (metric instanceof WarpDownlinkProfile) {
      accumulateWarpDownlinkProfile((WarpDownlinkProfile) metric);
    } else {
      this.partContext.reportDown(metric);
    }
  }

  protected void accumulateHostProfile(HostProfile profile) {
    NODE_OPEN_DELTA.addAndGet(this, profile.nodeOpenDelta());
    NODE_CLOSE_DELTA.addAndGet(this, profile.nodeCloseDelta());
    AGENT_OPEN_DELTA.addAndGet(this, profile.agentOpenDelta());
    AGENT_CLOSE_DELTA.addAndGet(this, profile.agentCloseDelta());
    AGENT_EXEC_DELTA.addAndGet(this, profile.agentExecDelta());
    AGENT_EXEC_RATE.addAndGet(this, profile.agentExecRate());
    TIMER_EVENT_DELTA.addAndGet(this, profile.timerEventDelta());
    TIMER_EVENT_RATE.addAndGet(this, profile.timerEventRate());
    DOWNLINK_OPEN_DELTA.addAndGet(this, profile.downlinkOpenDelta());
    DOWNLINK_CLOSE_DELTA.addAndGet(this, profile.downlinkCloseDelta());
    DOWNLINK_EVENT_DELTA.addAndGet(this, profile.downlinkEventDelta());
    DOWNLINK_EVENT_RATE.addAndGet(this, profile.downlinkEventRate());
    DOWNLINK_COMMAND_DELTA.addAndGet(this, profile.downlinkCommandDelta());
    DOWNLINK_COMMAND_RATE.addAndGet(this, profile.downlinkCommandRate());
    UPLINK_OPEN_DELTA.addAndGet(this, profile.uplinkOpenDelta());
    UPLINK_CLOSE_DELTA.addAndGet(this, profile.uplinkCloseDelta());
    UPLINK_EVENT_DELTA.addAndGet(this, profile.uplinkEventDelta());
    UPLINK_EVENT_RATE.addAndGet(this, profile.uplinkEventRate());
    UPLINK_COMMAND_DELTA.addAndGet(this, profile.uplinkCommandDelta());
    UPLINK_COMMAND_RATE.addAndGet(this, profile.uplinkCommandRate());
    didUpdateMetrics();
  }

  protected void accumulateWarpDownlinkProfile(WarpDownlinkProfile profile) {
    DOWNLINK_OPEN_DELTA.addAndGet(this, profile.openDelta());
    DOWNLINK_CLOSE_DELTA.addAndGet(this, profile.closeDelta());
    DOWNLINK_EVENT_DELTA.addAndGet(this, profile.eventDelta());
    DOWNLINK_EVENT_RATE.addAndGet(this, profile.eventRate());
    DOWNLINK_COMMAND_DELTA.addAndGet(this, profile.commandDelta());
    DOWNLINK_COMMAND_RATE.addAndGet(this, profile.commandRate());
    didUpdateMetrics();
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
    final PartProfile profile = collectProfile(dt);
    this.partContext.reportDown(profile);
  }

  protected PartProfile collectProfile(long dt) {
    final int hostOpenDelta = HOST_OPEN_DELTA.getAndSet(this, 0);
    final long hostOpenCount = HOST_OPEN_COUNT.addAndGet(this, (long) hostOpenDelta);
    final int hostCloseDelta = HOST_CLOSE_DELTA.getAndSet(this, 0);
    final long hostCloseCount = HOST_CLOSE_COUNT.addAndGet(this, (long) hostCloseDelta);

    final int nodeOpenDelta = NODE_OPEN_DELTA.getAndSet(this, 0);
    final long nodeOpenCount = NODE_OPEN_COUNT.addAndGet(this, (long) nodeOpenDelta);
    final int nodeCloseDelta = NODE_CLOSE_DELTA.getAndSet(this, 0);
    final long nodeCloseCount = NODE_CLOSE_COUNT.addAndGet(this, (long) nodeCloseDelta);

    final int agentOpenDelta = AGENT_OPEN_DELTA.getAndSet(this, 0);
    final long agentOpenCount = AGENT_OPEN_COUNT.addAndGet(this, (long) agentOpenDelta);
    final int agentCloseDelta = AGENT_CLOSE_DELTA.getAndSet(this, 0);
    final long agentCloseCount = AGENT_CLOSE_COUNT.addAndGet(this, (long) agentCloseDelta);
    final long agentExecDelta = AGENT_EXEC_DELTA.getAndSet(this, 0L);
    final long agentExecRate = AGENT_EXEC_RATE.getAndSet(this, 0L);
    final long agentExecTime = AGENT_EXEC_TIME.addAndGet(this, agentExecDelta);

    final int timerEventDelta = TIMER_EVENT_DELTA.getAndSet(this, 0);
    final int timerEventRate = TIMER_EVENT_RATE.getAndSet(this, 0);
    final long timerEventCount = TIMER_EVENT_COUNT.addAndGet(this, (long) timerEventDelta);

    final int downlinkOpenDelta = DOWNLINK_OPEN_DELTA.getAndSet(this, 0);
    final long downlinkOpenCount = DOWNLINK_OPEN_COUNT.addAndGet(this, (long) downlinkOpenDelta);
    final int downlinkCloseDelta = DOWNLINK_CLOSE_DELTA.getAndSet(this, 0);
    final long downlinkCloseCount = DOWNLINK_CLOSE_COUNT.addAndGet(this, (long) downlinkCloseDelta);
    final int downlinkEventDelta = DOWNLINK_EVENT_DELTA.getAndSet(this, 0);
    final int downlinkEventRate = DOWNLINK_EVENT_RATE.getAndSet(this, 0);
    final long downlinkEventCount = DOWNLINK_EVENT_COUNT.addAndGet(this, (long) downlinkEventDelta);
    final int downlinkCommandDelta = DOWNLINK_COMMAND_DELTA.getAndSet(this, 0);
    final int downlinkCommandRate = DOWNLINK_COMMAND_RATE.getAndSet(this, 0);
    final long downlinkCommandCount = DOWNLINK_COMMAND_COUNT.addAndGet(this, (long) downlinkCommandDelta);

    final int uplinkOpenDelta = UPLINK_OPEN_DELTA.getAndSet(this, 0);
    final long uplinkOpenCount = UPLINK_OPEN_COUNT.addAndGet(this, (long) uplinkOpenDelta);
    final int uplinkCloseDelta = UPLINK_CLOSE_DELTA.getAndSet(this, 0);
    final long uplinkCloseCount = UPLINK_CLOSE_COUNT.addAndGet(this, (long) uplinkCloseDelta);
    final int uplinkEventDelta = UPLINK_EVENT_DELTA.getAndSet(this, 0);
    final int uplinkEventRate = UPLINK_EVENT_RATE.getAndSet(this, 0);
    final long uplinkEventCount = UPLINK_EVENT_COUNT.addAndGet(this, (long) uplinkEventDelta);
    final int uplinkCommandDelta = UPLINK_COMMAND_DELTA.getAndSet(this, 0);
    final int uplinkCommandRate = UPLINK_COMMAND_RATE.getAndSet(this, 0);
    final long uplinkCommandCount = UPLINK_COMMAND_COUNT.addAndGet(this, (long) uplinkCommandDelta);

    final int hostCount = (int) (hostOpenCount - hostCloseCount);
    final long nodeCount = nodeOpenCount - nodeCloseCount;
    final long agentCount = agentOpenCount - agentCloseCount;
    final AgentPulse agentPulse = new AgentPulse(agentCount, agentExecRate, agentExecTime, timerEventRate, timerEventCount);
    final long downlinkCount = downlinkOpenCount - downlinkCloseCount;
    final WarpDownlinkPulse downlinkPulse = new WarpDownlinkPulse(downlinkCount, downlinkEventRate, downlinkEventCount,
                                                                  downlinkCommandRate, downlinkCommandCount);
    final long uplinkCount = uplinkOpenCount - uplinkCloseCount;
    final WarpUplinkPulse uplinkPulse = new WarpUplinkPulse(uplinkCount, uplinkEventRate, uplinkEventCount,
                                                            uplinkCommandRate, uplinkCommandCount);
    this.pulse = new PartPulse(hostCount, nodeCount, agentPulse, downlinkPulse, uplinkPulse);
    final DemandLane<PartPulse> metaPulse = this.metaPulse;
    if (metaPulse != null) {
      metaPulse.cue();
    }

    return new PartProfile(cellAddress(),
                           hostOpenDelta, hostOpenCount, hostCloseDelta, hostCloseCount,
                           nodeOpenDelta, nodeOpenCount, nodeCloseDelta, nodeCloseCount,
                           agentOpenDelta, agentOpenCount, agentCloseDelta, agentCloseCount,
                           agentExecDelta, agentExecRate, agentExecTime,
                           timerEventDelta, timerEventRate, timerEventCount,
                           downlinkOpenDelta, downlinkOpenCount, downlinkCloseDelta, downlinkCloseCount,
                           downlinkEventDelta, downlinkEventRate, downlinkEventCount,
                           downlinkCommandDelta, downlinkCommandRate, downlinkCommandCount,
                           uplinkOpenDelta, uplinkOpenCount, uplinkCloseDelta, uplinkCloseCount,
                           uplinkEventDelta, uplinkEventRate, uplinkEventCount,
                           uplinkCommandDelta, uplinkCommandRate, uplinkCommandCount);
  }

  static final Uri HOSTS_URI = Uri.parse("hosts");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<PartTable, HashTrieMap<Uri, HostBinding>> HOSTS =
      AtomicReferenceFieldUpdater.newUpdater(PartTable.class, (Class<HashTrieMap<Uri, HostBinding>>) (Class<?>) HashTrieMap.class, "hosts");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<PartTable, HashTrieMap<Value, LinkBinding>> UPLINKS =
      AtomicReferenceFieldUpdater.newUpdater(PartTable.class, (Class<HashTrieMap<Value, LinkBinding>>) (Class<?>) HashTrieMap.class, "uplinks");

  static final AtomicIntegerFieldUpdater<PartTable> HOST_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "hostOpenDelta");
  static final AtomicLongFieldUpdater<PartTable> HOST_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "hostOpenCount");
  static final AtomicIntegerFieldUpdater<PartTable> HOST_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "hostCloseDelta");
  static final AtomicLongFieldUpdater<PartTable> HOST_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "hostCloseCount");
  static final AtomicIntegerFieldUpdater<PartTable> NODE_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "nodeOpenDelta");
  static final AtomicLongFieldUpdater<PartTable> NODE_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "nodeOpenCount");
  static final AtomicIntegerFieldUpdater<PartTable> NODE_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "nodeCloseDelta");
  static final AtomicLongFieldUpdater<PartTable> NODE_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "nodeCloseCount");
  static final AtomicIntegerFieldUpdater<PartTable> AGENT_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "agentOpenDelta");
  static final AtomicLongFieldUpdater<PartTable> AGENT_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "agentOpenCount");
  static final AtomicIntegerFieldUpdater<PartTable> AGENT_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "agentCloseDelta");
  static final AtomicLongFieldUpdater<PartTable> AGENT_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "agentCloseCount");
  static final AtomicLongFieldUpdater<PartTable> AGENT_EXEC_DELTA =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "agentExecDelta");
  static final AtomicLongFieldUpdater<PartTable> AGENT_EXEC_RATE =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "agentExecRate");
  static final AtomicLongFieldUpdater<PartTable> AGENT_EXEC_TIME =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "agentExecTime");
  static final AtomicIntegerFieldUpdater<PartTable> TIMER_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "timerEventDelta");
  static final AtomicIntegerFieldUpdater<PartTable> TIMER_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "timerEventRate");
  static final AtomicLongFieldUpdater<PartTable> TIMER_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "timerEventCount");
  static final AtomicIntegerFieldUpdater<PartTable> DOWNLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "downlinkOpenDelta");
  static final AtomicLongFieldUpdater<PartTable> DOWNLINK_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "downlinkOpenCount");
  static final AtomicIntegerFieldUpdater<PartTable> DOWNLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "downlinkCloseDelta");
  static final AtomicLongFieldUpdater<PartTable> DOWNLINK_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "downlinkCloseCount");
  static final AtomicIntegerFieldUpdater<PartTable> DOWNLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "downlinkEventDelta");
  static final AtomicIntegerFieldUpdater<PartTable> DOWNLINK_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "downlinkEventRate");
  static final AtomicLongFieldUpdater<PartTable> DOWNLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "downlinkEventCount");
  static final AtomicIntegerFieldUpdater<PartTable> DOWNLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "downlinkCommandDelta");
  static final AtomicIntegerFieldUpdater<PartTable> DOWNLINK_COMMAND_RATE =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "downlinkCommandRate");
  static final AtomicLongFieldUpdater<PartTable> DOWNLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "downlinkCommandCount");
  static final AtomicIntegerFieldUpdater<PartTable> UPLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "uplinkOpenDelta");
  static final AtomicLongFieldUpdater<PartTable> UPLINK_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "uplinkOpenCount");
  static final AtomicIntegerFieldUpdater<PartTable> UPLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "uplinkCloseDelta");
  static final AtomicLongFieldUpdater<PartTable> UPLINK_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "uplinkCloseCount");
  static final AtomicIntegerFieldUpdater<PartTable> UPLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "uplinkEventDelta");
  static final AtomicIntegerFieldUpdater<PartTable> UPLINK_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "uplinkEventRate");
  static final AtomicLongFieldUpdater<PartTable> UPLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "uplinkEventCount");
  static final AtomicIntegerFieldUpdater<PartTable> UPLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "uplinkCommandDelta");
  static final AtomicIntegerFieldUpdater<PartTable> UPLINK_COMMAND_RATE =
      AtomicIntegerFieldUpdater.newUpdater(PartTable.class, "uplinkCommandRate");
  static final AtomicLongFieldUpdater<PartTable> UPLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "uplinkCommandCount");
  static final AtomicLongFieldUpdater<PartTable> LAST_REPORT_TIME =
      AtomicLongFieldUpdater.newUpdater(PartTable.class, "lastReportTime");
}

final class PartTableHostsController implements OnCueKey<Uri, HostInfo>, OnSyncKeys<Uri> {
  final PartBinding part;

  PartTableHostsController(PartBinding part) {
    this.part = part;
  }

  @Override
  public HostInfo onCue(Uri hostUri, WarpUplink uplink) {
    final HostBinding hostBinding = this.part.getHost(hostUri);
    if (hostBinding != null) {
      return HostInfo.from(hostBinding);
    }
    return null;
  }

  @Override
  public Iterator<Uri> onSync(WarpUplink uplink) {
    return this.part.hosts().keyIterator();
  }
}

final class PartTablePulseController implements OnCue<PartPulse> {
  final PartTable part;

  PartTablePulseController(PartTable part) {
    this.part = part;
  }

  @Override
  public PartPulse onCue(WarpUplink uplink) {
    return this.part.pulse;
  }
}
