// Copyright 2015-2023 Nstream, inc.
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

package swim.system.router;

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
import swim.concurrent.Cont;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.system.AbstractTierBinding;
import swim.system.HostAddress;
import swim.system.HostBinding;
import swim.system.HostContext;
import swim.system.HttpBinding;
import swim.system.LaneBinding;
import swim.system.LinkBinding;
import swim.system.MeshBinding;
import swim.system.Metric;
import swim.system.NodeBinding;
import swim.system.PartAddress;
import swim.system.PartBinding;
import swim.system.PartContext;
import swim.system.PartException;
import swim.system.PartPredicate;
import swim.system.Push;
import swim.system.TierContext;
import swim.system.UplinkError;
import swim.system.WarpBinding;
import swim.system.agent.AgentNode;
import swim.system.profile.HostProfile;
import swim.system.profile.PartProfile;
import swim.system.profile.WarpDownlinkProfile;
import swim.system.reflect.AgentPulse;
import swim.system.reflect.HostInfo;
import swim.system.reflect.LogEntry;
import swim.system.reflect.PartPulse;
import swim.system.reflect.SystemPulse;
import swim.system.reflect.WarpDownlinkPulse;
import swim.system.reflect.WarpUplinkPulse;
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
    this.predicate = predicate;
    this.partContext = null;
    this.hosts = HashTrieMap.empty();
    this.uplinks = HashTrieMap.empty();
    this.master = null;

    this.hostOpenDelta = 0;
    this.hostOpenCount = 0L;
    this.hostCloseDelta = 0;
    this.hostCloseCount = 0L;
    this.nodeOpenDelta = 0;
    this.nodeOpenCount = 0L;
    this.nodeCloseDelta = 0;
    this.nodeCloseCount = 0L;
    this.agentOpenDelta = 0;
    this.agentOpenCount = 0L;
    this.agentCloseDelta = 0;
    this.agentCloseCount = 0L;
    this.agentExecDelta = 0L;
    this.agentExecRate = 0L;
    this.agentExecTime = 0L;
    this.timerEventDelta = 0;
    this.timerEventRate = 0;
    this.timerEventCount = 0L;
    this.downlinkOpenDelta = 0;
    this.downlinkOpenCount = 0L;
    this.downlinkCloseDelta = 0;
    this.downlinkCloseCount = 0L;
    this.downlinkEventDelta = 0;
    this.downlinkEventRate = 0;
    this.downlinkEventCount = 0L;
    this.downlinkCommandDelta = 0;
    this.downlinkCommandRate = 0;
    this.downlinkCommandCount = 0L;
    this.uplinkOpenDelta = 0;
    this.uplinkOpenCount = 0L;
    this.uplinkCloseDelta = 0;
    this.uplinkCloseCount = 0L;
    this.uplinkEventDelta = 0;
    this.uplinkEventRate = 0;
    this.uplinkEventCount = 0L;
    this.uplinkCommandDelta = 0;
    this.uplinkCommandRate = 0;
    this.uplinkCommandCount = 0L;
    this.lastReportTime = 0L;

    this.pulse = null;
    this.metaNode = null;
    this.metaHosts = null;
    this.metaPulse = null;
    this.metaTraceLog = null;
    this.metaDebugLog = null;
    this.metaInfoLog = null;
    this.metaWarnLog = null;
    this.metaErrorLog = null;
    this.metaFailLog = null;
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
    if (partClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return this.partContext.unwrapPart(partClass);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomPart(Class<T> partClass) {
    T part = this.partContext.bottomPart(partClass);
    if (part == null && partClass.isAssignableFrom(this.getClass())) {
      part = (T) this;
    }
    return part;
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
      this.openMetaLanes(part, (AgentNode) metaPart);
    }
    this.partContext.openMetaPart(part, metaPart);
  }

  protected void openMetaLanes(PartBinding part, AgentNode metaPart) {
    this.openReflectLanes(part, metaPart);
    this.openLogLanes(part, metaPart);
  }

  protected void openReflectLanes(PartBinding part, AgentNode metaPart) {
    this.metaHosts = metaPart.demandMapLane()
                             .keyForm(Uri.form())
                             .valueForm(HostInfo.form())
                             .observe(new PartTableHostsController(part));
    metaPart.openLane(PartTable.HOSTS_URI, this.metaHosts);

    this.metaPulse = this.metaNode.demandLane()
                                  .valueForm(PartPulse.form())
                                  .observe(new PartTablePulseController(this));
    this.metaNode.openLane(PartPulse.PULSE_URI, this.metaPulse);
  }

  protected void openLogLanes(PartBinding part, AgentNode metaPart) {
    this.metaTraceLog = metaPart.supplyLane().valueForm(LogEntry.form());
    metaPart.openLane(LogEntry.TRACE_LOG_URI, this.metaTraceLog);

    this.metaDebugLog = metaPart.supplyLane().valueForm(LogEntry.form());
    metaPart.openLane(LogEntry.DEBUG_LOG_URI, this.metaDebugLog);

    this.metaInfoLog = metaPart.supplyLane().valueForm(LogEntry.form());
    metaPart.openLane(LogEntry.INFO_LOG_URI, this.metaInfoLog);

    this.metaWarnLog = metaPart.supplyLane().valueForm(LogEntry.form());
    metaPart.openLane(LogEntry.WARN_LOG_URI, this.metaWarnLog);

    this.metaErrorLog = metaPart.supplyLane().valueForm(LogEntry.form());
    metaPart.openLane(LogEntry.ERROR_LOG_URI, this.metaErrorLog);

    this.metaFailLog = metaPart.supplyLane().valueForm(LogEntry.form());
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
    return PartTable.HOSTS.get(this);
  }

  @Override
  public HostBinding getHost(Uri hostUri) {
    return PartTable.HOSTS.get(this).get(hostUri);
  }

  @Override
  public HostBinding openHost(Uri hostUri) {
    HostBinding hostBinding = null;
    do {
      final HashTrieMap<Uri, HostBinding> oldHosts = PartTable.HOSTS.get(this);
      final HostBinding host = oldHosts.get(hostUri);
      if (host != null) {
        if (hostBinding != null) {
          // Lost creation race.
          hostBinding.close();
        }
        hostBinding = host;
        break;
      } else {
        if (hostBinding == null) {
          final HostAddress hostAddress = this.cellAddress().hostUri(hostUri);
          hostBinding = this.partContext.createHost(hostAddress);
          if (hostBinding != null) {
            hostBinding = this.partContext.injectHost(hostAddress, hostBinding);
            final HostContext hostContext = this.createHostContext(hostAddress, hostBinding);
            hostBinding.setHostContext(hostContext);
            hostBinding = hostBinding.hostWrapper();
          } else {
            break;
          }
        }
        final HashTrieMap<Uri, HostBinding> newHosts = oldHosts.updated(hostUri, hostBinding);
        if (PartTable.HOSTS.compareAndSet(this, oldHosts, newHosts)) {
          this.activate(hostBinding);
          this.didOpenHost(hostBinding);
          break;
        }
      }
    } while (true);
    return hostBinding;
  }

  @Override
  public HostBinding openHost(Uri hostUri, HostBinding host) {
    HostBinding hostBinding = null;
    do {
      final HashTrieMap<Uri, HostBinding> oldHosts = PartTable.HOSTS.get(this);
      if (oldHosts.containsKey(hostUri) && host.hostContext() != null) {
        hostBinding = null;
        break;
      } else {
        if (hostBinding == null) {
          final HostAddress hostAddress = this.cellAddress().hostUri(hostUri);
          hostBinding = this.partContext.injectHost(hostAddress, host);
          final HostContext hostContext = this.createHostContext(hostAddress, hostBinding);
          hostBinding.setHostContext(hostContext);
          hostBinding = hostBinding.hostWrapper();
        }
        final HashTrieMap<Uri, HostBinding> newHosts = oldHosts.updated(hostUri, hostBinding);
        if (PartTable.HOSTS.compareAndSet(this, oldHosts, newHosts)) {
          this.activate(hostBinding);
          this.didOpenHost(hostBinding);
          break;
        }
      }
    } while (true);
    return hostBinding;
  }

  public void closeHost(Uri hostUri) {
    do {
      final HashTrieMap<Uri, HostBinding> oldHosts = PartTable.HOSTS.get(this);
      final HostBinding hostBinding = oldHosts.get(hostUri);
      if (hostBinding != null) {
        final HashTrieMap<Uri, HostBinding> newHosts = oldHosts.removed(hostUri);
        if (PartTable.HOSTS.compareAndSet(this, oldHosts, newHosts)) {
          if (this.master == hostBinding) {
            this.master = null;
          }
          hostBinding.didClose();
          this.didCloseHost(hostBinding);
          if (newHosts.isEmpty()) {
            this.close();
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  protected void didOpenHost(HostBinding host) {
    final DemandMapLane<Uri, HostInfo> metaHosts = this.metaHosts;
    if (metaHosts != null) {
      metaHosts.cue(host.hostUri());
    }
    PartTable.HOST_OPEN_DELTA.incrementAndGet(this);
    this.flushMetrics();
  }

  protected void didCloseHost(HostBinding host) {
    final DemandMapLane<Uri, HostInfo> metaHosts = this.metaHosts;
    if (metaHosts != null) {
      metaHosts.remove(host.hostUri());
    }
    PartTable.HOST_CLOSE_DELTA.incrementAndGet(this);
    this.flushMetrics();
  }

  public void hostDidConnect(Uri hostUri) {
    this.partContext.hostDidConnect(hostUri);
  }

  public void hostDidDisconnect(Uri hostUri) {
    this.partContext.hostDidDisconnect(hostUri);
  }

  @Override
  public void reopenUplinks() {
    for (LinkBinding uplink : PartTable.UPLINKS.get(this).values()) {
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
      hostBinding = this.openHost(hostUri);
    }
    if (hostBinding != null) {
      hostBinding = hostBinding.bottomHost(HostBinding.class);
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
    do {
      final HashTrieMap<Value, LinkBinding> oldUplinks = PartTable.UPLINKS.get(this);
      final HashTrieMap<Value, LinkBinding> newUplinks = oldUplinks.updated(uplink.linkKey(), uplink);
      if (PartTable.UPLINKS.compareAndSet(this, oldUplinks, newUplinks)) {
        break;
      }
    } while (true);
  }

  void didCloseUplink(LinkBinding uplink) {
    do {
      final HashTrieMap<Value, LinkBinding> oldUplinks = PartTable.UPLINKS.get(this);
      final HashTrieMap<Value, LinkBinding> newUplinks = oldUplinks.removed(uplink.linkKey());
      if (PartTable.UPLINKS.compareAndSet(this, oldUplinks, newUplinks)) {
        break;
      }
    } while (true);
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
      hostBinding = this.openHost(hostUri);
    }
    if (hostBinding != null) {
      hostBinding = hostBinding.bottomHost(HostBinding.class);
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
    final Iterator<HostBinding> hostsIterator = PartTable.HOSTS.get(this).valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().open();
    }
  }

  @Override
  protected void willLoad() {
    super.willLoad();
    final Iterator<HostBinding> hostsIterator = PartTable.HOSTS.get(this).valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().load();
    }
  }

  @Override
  protected void willStart() {
    super.willStart();
    final Iterator<HostBinding> hostsIterator = PartTable.HOSTS.get(this).valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().start();
    }
  }

  @Override
  protected void willStop() {
    super.willStop();
    final Iterator<HostBinding> hostsIterator = PartTable.HOSTS.get(this).valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().stop();
    }
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    final Iterator<HostBinding> hostsIterator = PartTable.HOSTS.get(this).valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().unload();
    }
  }

  @Override
  protected void willClose() {
    super.willClose();
    final Iterator<HostBinding> hostsIterator = PartTable.HOSTS.get(this).valueIterator();
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
    this.flushMetrics();
  }

  @Override
  public void didFail(Throwable error) {
    if (Cont.isNonFatal(error)) {
      this.fail(error);
    } else {
      error.printStackTrace();
    }
  }

  @Override
  public void reportDown(Metric metric) {
    if (metric instanceof HostProfile) {
      this.accumulateHostProfile((HostProfile) metric);
    } else if (metric instanceof WarpDownlinkProfile) {
      this.accumulateWarpDownlinkProfile((WarpDownlinkProfile) metric);
    } else {
      this.partContext.reportDown(metric);
    }
  }

  protected void accumulateHostProfile(HostProfile profile) {
    PartTable.NODE_OPEN_DELTA.addAndGet(this, profile.nodeOpenDelta());
    PartTable.NODE_CLOSE_DELTA.addAndGet(this, profile.nodeCloseDelta());
    PartTable.AGENT_OPEN_DELTA.addAndGet(this, profile.agentOpenDelta());
    PartTable.AGENT_CLOSE_DELTA.addAndGet(this, profile.agentCloseDelta());
    PartTable.AGENT_EXEC_DELTA.addAndGet(this, profile.agentExecDelta());
    PartTable.AGENT_EXEC_RATE.addAndGet(this, profile.agentExecRate());
    PartTable.TIMER_EVENT_DELTA.addAndGet(this, profile.timerEventDelta());
    PartTable.TIMER_EVENT_RATE.addAndGet(this, profile.timerEventRate());
    PartTable.DOWNLINK_OPEN_DELTA.addAndGet(this, profile.downlinkOpenDelta());
    PartTable.DOWNLINK_CLOSE_DELTA.addAndGet(this, profile.downlinkCloseDelta());
    PartTable.DOWNLINK_EVENT_DELTA.addAndGet(this, profile.downlinkEventDelta());
    PartTable.DOWNLINK_EVENT_RATE.addAndGet(this, profile.downlinkEventRate());
    PartTable.DOWNLINK_COMMAND_DELTA.addAndGet(this, profile.downlinkCommandDelta());
    PartTable.DOWNLINK_COMMAND_RATE.addAndGet(this, profile.downlinkCommandRate());
    PartTable.UPLINK_OPEN_DELTA.addAndGet(this, profile.uplinkOpenDelta());
    PartTable.UPLINK_CLOSE_DELTA.addAndGet(this, profile.uplinkCloseDelta());
    PartTable.UPLINK_EVENT_DELTA.addAndGet(this, profile.uplinkEventDelta());
    PartTable.UPLINK_EVENT_RATE.addAndGet(this, profile.uplinkEventRate());
    PartTable.UPLINK_COMMAND_DELTA.addAndGet(this, profile.uplinkCommandDelta());
    PartTable.UPLINK_COMMAND_RATE.addAndGet(this, profile.uplinkCommandRate());
    this.didUpdateMetrics();
  }

  protected void accumulateWarpDownlinkProfile(WarpDownlinkProfile profile) {
    PartTable.DOWNLINK_OPEN_DELTA.addAndGet(this, profile.openDelta());
    PartTable.DOWNLINK_CLOSE_DELTA.addAndGet(this, profile.closeDelta());
    PartTable.DOWNLINK_EVENT_DELTA.addAndGet(this, profile.eventDelta());
    PartTable.DOWNLINK_EVENT_RATE.addAndGet(this, profile.eventRate());
    PartTable.DOWNLINK_COMMAND_DELTA.addAndGet(this, profile.commandDelta());
    PartTable.DOWNLINK_COMMAND_RATE.addAndGet(this, profile.commandRate());
    this.didUpdateMetrics();
  }

  protected void didUpdateMetrics() {
    do {
      final long newReportTime = System.currentTimeMillis();
      final long oldReportTime = PartTable.LAST_REPORT_TIME.get(this);
      final long dt = newReportTime - oldReportTime;
      if (dt >= Metric.REPORT_INTERVAL) {
        if (PartTable.LAST_REPORT_TIME.compareAndSet(this, oldReportTime, newReportTime)) {
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
    final long oldReportTime = PartTable.LAST_REPORT_TIME.getAndSet(this, newReportTime);
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
    final PartProfile profile = this.collectProfile(dt);
    this.partContext.reportDown(profile);
  }

  protected PartProfile collectProfile(long dt) {
    final int hostOpenDelta = PartTable.HOST_OPEN_DELTA.getAndSet(this, 0);
    final long hostOpenCount = PartTable.HOST_OPEN_COUNT.addAndGet(this, (long) hostOpenDelta);
    final int hostCloseDelta = PartTable.HOST_CLOSE_DELTA.getAndSet(this, 0);
    final long hostCloseCount = PartTable.HOST_CLOSE_COUNT.addAndGet(this, (long) hostCloseDelta);

    final int nodeOpenDelta = PartTable.NODE_OPEN_DELTA.getAndSet(this, 0);
    final long nodeOpenCount = PartTable.NODE_OPEN_COUNT.addAndGet(this, (long) nodeOpenDelta);
    final int nodeCloseDelta = PartTable.NODE_CLOSE_DELTA.getAndSet(this, 0);
    final long nodeCloseCount = PartTable.NODE_CLOSE_COUNT.addAndGet(this, (long) nodeCloseDelta);

    final int agentOpenDelta = PartTable.AGENT_OPEN_DELTA.getAndSet(this, 0);
    final long agentOpenCount = PartTable.AGENT_OPEN_COUNT.addAndGet(this, (long) agentOpenDelta);
    final int agentCloseDelta = PartTable.AGENT_CLOSE_DELTA.getAndSet(this, 0);
    final long agentCloseCount = PartTable.AGENT_CLOSE_COUNT.addAndGet(this, (long) agentCloseDelta);
    final long agentExecDelta = PartTable.AGENT_EXEC_DELTA.getAndSet(this, 0L);
    final long agentExecRate = PartTable.AGENT_EXEC_RATE.getAndSet(this, 0L);
    final long agentExecTime = PartTable.AGENT_EXEC_TIME.addAndGet(this, agentExecDelta);

    final int timerEventDelta = PartTable.TIMER_EVENT_DELTA.getAndSet(this, 0);
    final int timerEventRate = PartTable.TIMER_EVENT_RATE.getAndSet(this, 0);
    final long timerEventCount = PartTable.TIMER_EVENT_COUNT.addAndGet(this, (long) timerEventDelta);

    final int downlinkOpenDelta = PartTable.DOWNLINK_OPEN_DELTA.getAndSet(this, 0);
    final long downlinkOpenCount = PartTable.DOWNLINK_OPEN_COUNT.addAndGet(this, (long) downlinkOpenDelta);
    final int downlinkCloseDelta = PartTable.DOWNLINK_CLOSE_DELTA.getAndSet(this, 0);
    final long downlinkCloseCount = PartTable.DOWNLINK_CLOSE_COUNT.addAndGet(this, (long) downlinkCloseDelta);
    final int downlinkEventDelta = PartTable.DOWNLINK_EVENT_DELTA.getAndSet(this, 0);
    final int downlinkEventRate = PartTable.DOWNLINK_EVENT_RATE.getAndSet(this, 0);
    final long downlinkEventCount = PartTable.DOWNLINK_EVENT_COUNT.addAndGet(this, (long) downlinkEventDelta);
    final int downlinkCommandDelta = PartTable.DOWNLINK_COMMAND_DELTA.getAndSet(this, 0);
    final int downlinkCommandRate = PartTable.DOWNLINK_COMMAND_RATE.getAndSet(this, 0);
    final long downlinkCommandCount = PartTable.DOWNLINK_COMMAND_COUNT.addAndGet(this, (long) downlinkCommandDelta);

    final int uplinkOpenDelta = PartTable.UPLINK_OPEN_DELTA.getAndSet(this, 0);
    final long uplinkOpenCount = PartTable.UPLINK_OPEN_COUNT.addAndGet(this, (long) uplinkOpenDelta);
    final int uplinkCloseDelta = PartTable.UPLINK_CLOSE_DELTA.getAndSet(this, 0);
    final long uplinkCloseCount = PartTable.UPLINK_CLOSE_COUNT.addAndGet(this, (long) uplinkCloseDelta);
    final int uplinkEventDelta = PartTable.UPLINK_EVENT_DELTA.getAndSet(this, 0);
    final int uplinkEventRate = PartTable.UPLINK_EVENT_RATE.getAndSet(this, 0);
    final long uplinkEventCount = PartTable.UPLINK_EVENT_COUNT.addAndGet(this, (long) uplinkEventDelta);
    final int uplinkCommandDelta = PartTable.UPLINK_COMMAND_DELTA.getAndSet(this, 0);
    final int uplinkCommandRate = PartTable.UPLINK_COMMAND_RATE.getAndSet(this, 0);
    final long uplinkCommandCount = PartTable.UPLINK_COMMAND_COUNT.addAndGet(this, (long) uplinkCommandDelta);

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
    this.pulse = new PartPulse(hostCount, nodeCount, agentPulse, downlinkPulse, uplinkPulse, SystemPulse.latest());
    final DemandLane<PartPulse> metaPulse = this.metaPulse;
    if (metaPulse != null) {
      metaPulse.cue();
    }

    return new PartProfile(this.cellAddress(),
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
      return HostInfo.create(hostBinding);
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

