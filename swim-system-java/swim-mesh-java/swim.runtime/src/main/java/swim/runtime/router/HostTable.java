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
import java.util.Map;
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
import swim.collections.FingerTrieSeq;
import swim.concurrent.Conts;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.AbstractTierBinding;
import swim.runtime.HostAddress;
import swim.runtime.HostBinding;
import swim.runtime.HostContext;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.Metric;
import swim.runtime.NodeAddress;
import swim.runtime.NodeBinding;
import swim.runtime.NodeContext;
import swim.runtime.PartBinding;
import swim.runtime.PushRequest;
import swim.runtime.TierContext;
import swim.runtime.UplinkError;
import swim.runtime.agent.AgentNode;
import swim.runtime.profile.HostProfile;
import swim.runtime.profile.NodeProfile;
import swim.runtime.profile.WarpDownlinkProfile;
import swim.runtime.reflect.AgentPulse;
import swim.runtime.reflect.HostPulse;
import swim.runtime.reflect.LogEntry;
import swim.runtime.reflect.NodeInfo;
import swim.runtime.reflect.WarpDownlinkPulse;
import swim.runtime.reflect.WarpUplinkPulse;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriFragment;
import swim.uri.UriMapper;
import swim.uri.UriPart;
import swim.uri.UriPath;
import swim.uri.UriPathBuilder;

public class HostTable extends AbstractTierBinding implements HostBinding {
  protected HostContext hostContext;
  volatile UriMapper<NodeBinding> nodes;
  volatile int flags;

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
  HostPulse pulse;

  AgentNode metaNode;
  DemandMapLane<Uri, NodeInfo> metaNodes;
  DemandLane<HostPulse> metaPulse;
  SupplyLane<LogEntry> metaTraceLog;
  SupplyLane<LogEntry> metaDebugLog;
  SupplyLane<LogEntry> metaInfoLog;
  SupplyLane<LogEntry> metaWarnLog;
  SupplyLane<LogEntry> metaErrorLog;
  SupplyLane<LogEntry> metaFailLog;

  public HostTable() {
    this.nodes = UriMapper.empty();
  }

  @Override
  public final TierContext tierContext() {
    return this.hostContext;
  }

  @Override
  public final PartBinding part() {
    return this.hostContext.part();
  }

  @Override
  public final HostBinding hostWrapper() {
    return this;
  }

  @Override
  public final HostContext hostContext() {
    return this.hostContext;
  }

  @Override
  public void setHostContext(HostContext hostContext) {
    this.hostContext = hostContext;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapHost(Class<T> hostClass) {
    if (hostClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.hostContext.unwrapHost(hostClass);
    }
  }

  protected NodeContext createNodeContext(NodeAddress nodeAddress, NodeBinding node) {
    return new HostTableNode(this, node, nodeAddress);
  }

  @Override
  public final HostAddress cellAddress() {
    return this.hostContext.cellAddress();
  }

  @Override
  public final String edgeName() {
    return this.hostContext.edgeName();
  }

  @Override
  public final Uri meshUri() {
    return this.hostContext.meshUri();
  }

  @Override
  public final Value partKey() {
    return this.hostContext.partKey();
  }

  @Override
  public final Uri hostUri() {
    return this.hostContext.hostUri();
  }

  @Override
  public Policy policy() {
    return this.hostContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.hostContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.hostContext.stage();
  }

  @Override
  public StoreBinding store() {
    return this.hostContext.store();
  }

  @Override
  public boolean isConnected() {
    return true;
  }

  @Override
  public boolean isRemote() {
    return false;
  }

  @Override
  public boolean isSecure() {
    return true;
  }

  @Override
  public boolean isPrimary() {
    return (this.flags & PRIMARY) != 0;
  }

  @Override
  public void setPrimary(boolean isPrimary) {
    int oldFlags;
    int newFlags;
    do {
      oldFlags = this.flags;
      newFlags = oldFlags | PRIMARY;
    } while (oldFlags != newFlags && !FLAGS.compareAndSet(this, oldFlags, newFlags));
  }

  @Override
  public boolean isReplica() {
    return (this.flags & REPLICA) != 0;
  }

  @Override
  public void setReplica(boolean isReplica) {
    int oldFlags;
    int newFlags;
    do {
      oldFlags = this.flags;
      newFlags = oldFlags | REPLICA;
    } while (oldFlags != newFlags && !FLAGS.compareAndSet(this, oldFlags, newFlags));
  }

  @Override
  public boolean isMaster() {
    return (this.flags & MASTER) != 0;
  }

  @Override
  public boolean isSlave() {
    return (this.flags & SLAVE) != 0;
  }

  @Override
  public void didBecomeMaster() {
    int oldFlags;
    int newFlags;
    do {
      oldFlags = this.flags;
      newFlags = oldFlags & ~SLAVE | MASTER;
    } while (oldFlags != newFlags && !FLAGS.compareAndSet(this, oldFlags, newFlags));
  }

  @Override
  public void didBecomeSlave() {
    int oldFlags;
    int newFlags;
    do {
      oldFlags = this.flags;
      newFlags = oldFlags & ~MASTER | SLAVE;
    } while (oldFlags != newFlags && !FLAGS.compareAndSet(this, oldFlags, newFlags));
    if (oldFlags != newFlags) {
      closeNodes();
    }
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    if (metaHost instanceof AgentNode) {
      this.metaNode = (AgentNode) metaHost;
      openMetaLanes(host, (AgentNode) metaHost);
    }
    this.hostContext.openMetaHost(host, metaHost);
  }

  protected void openMetaLanes(HostBinding host, AgentNode metaHost) {
    openReflectLanes(host, metaHost);
    openLogLanes(host, metaHost);
  }

  protected void openReflectLanes(HostBinding host, AgentNode metaHost) {
    this.metaNodes = metaHost.demandMapLane()
        .keyForm(Uri.form())
        .valueForm(NodeInfo.form())
        .observe(new HostTableNodesController(host));
    metaHost.openLane(NODES_URI, this.metaNodes);

    this.metaPulse = metaNode.demandLane()
        .valueForm(HostPulse.form())
        .observe(new HostTablePulseController(this));
    metaNode.openLane(HostPulse.PULSE_URI, this.metaPulse);
  }

  protected void openLogLanes(HostBinding host, AgentNode metaHost) {
    this.metaTraceLog = metaHost.supplyLane()
        .valueForm(LogEntry.form());
    metaHost.openLane(LogEntry.TRACE_LOG_URI, this.metaTraceLog);

    this.metaDebugLog = metaHost.supplyLane()
        .valueForm(LogEntry.form());
    metaHost.openLane(LogEntry.DEBUG_LOG_URI, this.metaDebugLog);

    this.metaInfoLog = metaHost.supplyLane()
        .valueForm(LogEntry.form());
    metaHost.openLane(LogEntry.INFO_LOG_URI, this.metaInfoLog);

    this.metaWarnLog = metaHost.supplyLane()
        .valueForm(LogEntry.form());
    metaHost.openLane(LogEntry.WARN_LOG_URI, this.metaWarnLog);

    this.metaErrorLog = metaHost.supplyLane()
        .valueForm(LogEntry.form());
    metaHost.openLane(LogEntry.ERROR_LOG_URI, this.metaErrorLog);

    this.metaFailLog = metaHost.supplyLane()
        .valueForm(LogEntry.form());
    metaHost.openLane(LogEntry.FAIL_LOG_URI, this.metaFailLog);
  }

  @Override
  public UriMapper<NodeBinding> nodes() {
    return this.nodes;
  }

  @Override
  public NodeBinding getNode(Uri nodeUri) {
    return this.nodes.get(nodeUri);
  }

  @Override
  public NodeBinding openNode(Uri nodeUri) {
    UriMapper<NodeBinding> oldNodes;
    UriMapper<NodeBinding> newNodes;
    NodeBinding nodeBinding = null;
    do {
      oldNodes = this.nodes;
      final NodeBinding node = oldNodes.get(nodeUri);
      if (node != null) {
        if (nodeBinding != null) {
          // Lost creation race.
          nodeBinding.close();
        }
        nodeBinding = node;
        newNodes = oldNodes;
        break;
      } else if (nodeBinding == null) {
        final NodeAddress nodeAddress = cellAddress().nodeUri(nodeUri);
        nodeBinding = this.hostContext.createNode(nodeAddress);
        if (nodeBinding != null) {
          nodeBinding = this.hostContext.injectNode(nodeAddress, nodeBinding);
          final NodeContext nodeContext = createNodeContext(nodeAddress, nodeBinding);
          nodeBinding.setNodeContext(nodeContext);
          nodeBinding = nodeBinding.nodeWrapper();
          nodeBinding.openLanes(nodeBinding);
          nodeBinding.openAgents(nodeBinding);
          newNodes = oldNodes.updated(nodeUri, nodeBinding);
        } else {
          newNodes = oldNodes;
          break;
        }
      } else {
        newNodes = oldNodes.updated(nodeUri, nodeBinding);
      }
    } while (oldNodes != newNodes && !NODES.compareAndSet(this, oldNodes, newNodes));
    if (oldNodes != newNodes) {
      activate(nodeBinding);
      didOpenNode(nodeBinding);
    }
    return nodeBinding;
  }

  @Override
  public NodeBinding openNode(Uri nodeUri, NodeBinding node) {
    UriMapper<NodeBinding> oldNodes;
    UriMapper<NodeBinding> newNodes;
    NodeBinding nodeBinding = null;
    do {
      oldNodes = this.nodes;
      if (oldNodes.containsKey(nodeUri)) {
        nodeBinding = null;
        newNodes = oldNodes;
        break;
      } else {
        if (nodeBinding == null) {
          final NodeAddress nodeAddress = cellAddress().nodeUri(nodeUri);
          nodeBinding = this.hostContext.injectNode(nodeAddress, node);
          final NodeContext nodeContext = createNodeContext(nodeAddress, nodeBinding);
          nodeBinding.setNodeContext(nodeContext);
          nodeBinding = nodeBinding.nodeWrapper();
          nodeBinding.openLanes(nodeBinding);
          nodeBinding.openAgents(nodeBinding);
        }
        newNodes = oldNodes.updated(nodeUri, nodeBinding);
      }
    } while (oldNodes != newNodes && !NODES.compareAndSet(this, oldNodes, newNodes));
    if (nodeBinding != null) {
      activate(nodeBinding);
      didOpenNode(nodeBinding);
    }
    return nodeBinding;
  }

  public void closeNode(Uri nodeUri) {
    UriMapper<NodeBinding> oldNodes;
    UriMapper<NodeBinding> newNodes;
    NodeBinding nodeBinding = null;
    do {
      oldNodes = this.nodes;
      final NodeBinding node = oldNodes.get(nodeUri);
      if (node != null) {
        nodeBinding = node;
        newNodes = oldNodes.removed(nodeUri);
      } else {
        nodeBinding = null;
        newNodes = oldNodes;
        break;
      }
    } while (oldNodes != newNodes && !NODES.compareAndSet(this, oldNodes, newNodes));
    if (nodeBinding != null) {
      nodeBinding.didClose();
      didCloseNode(nodeBinding);
    }
  }

  public void closeNodes() {
    UriMapper<NodeBinding> oldNodes;
    final UriMapper<NodeBinding> newNodes = UriMapper.empty();
    do {
      oldNodes = this.nodes;
    } while (oldNodes != newNodes && !NODES.compareAndSet(this, oldNodes, newNodes));
    if (!oldNodes.isEmpty()) {
      final DemandMapLane<Uri, NodeInfo> metaNodes = this.metaNodes;
      for (NodeBinding nodeBinding : oldNodes.values()) {
        nodeBinding.close();
        nodeBinding.didClose();
        if (metaNodes != null) {
          metaNodes.cue(nodeBinding.nodeUri());
        }
      }
      flushMetrics();
    }
  }

  protected void didOpenNode(NodeBinding node) {
    final DemandMapLane<Uri, NodeInfo> metaNodes = this.metaNodes;
    if (metaNodes != null) {
      final Uri nodeUri = node.nodeUri();
      metaNodes.cue(nodeUri);
      cueAncestorNodes(nodeUri);
    }
    NODE_OPEN_DELTA.incrementAndGet(this);
    flushMetrics();
  }

  protected void didCloseNode(NodeBinding node) {
    final DemandMapLane<Uri, NodeInfo> metaNodes = this.metaNodes;
    if (metaNodes != null) {
      final Uri nodeUri = node.nodeUri();
      metaNodes.remove(nodeUri);
      cueAncestorNodes(nodeUri);
    }
    NODE_CLOSE_DELTA.incrementAndGet(this);
    flushMetrics();
  }

  protected void cueAncestorNodes(Uri nodeUri) {
    final DemandMapLane<Uri, NodeInfo> metaNodes = this.metaNodes;
    if (metaNodes != null) {
      UriPath nodePath = nodeUri.path();
      final UriPathBuilder ancestorPathBuilder = UriPath.builder();
      while (!nodePath.isEmpty()) {
        if (nodePath.isAbsolute()) {
          ancestorPathBuilder.addSlash();
          nodePath = nodePath.tail();
        } else {
          ancestorPathBuilder.addSegment(nodePath.head());
          nodePath = nodePath.tail();
          if (nodePath.isAbsolute()) {
            final Uri ancestorUri = nodeUri.path(ancestorPathBuilder.bind());
            metaNodes.cue(ancestorUri);
            ancestorPathBuilder.addSlash();
            nodePath = nodePath.tail();
          }
        }
      }
    }
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.hostContext.openMetaNode(node, metaNode);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.hostContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.hostContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.hostContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    final LinkBinding link = this.hostContext.bindDownlink(downlink);
    link.setCellContext(this);
    return link;
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.hostContext.openDownlink(link);
    link.setCellContext(this);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    this.hostContext.closeDownlink(link);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.hostContext.pushDown(pushRequest);
  }

  @Override
  public void openUplink(LinkBinding link) {
    final NodeBinding nodeBinding = openNode(link.nodeUri());
    if (nodeBinding != null) {
      nodeBinding.openUplink(link);
    } else {
      UplinkError.rejectNodeNotFound(link);
    }
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    final NodeBinding nodeBinding = openNode(pushRequest.envelope().nodeUri());
    if (nodeBinding != null) {
      nodeBinding.pushUp(pushRequest);
    } else {
      pushRequest.didDecline();
    }
  }

  @Override
  public void trace(Object message) {
    final SupplyLane<LogEntry> metaTraceLog = this.metaTraceLog;
    if (metaTraceLog != null) {
      metaTraceLog.push(LogEntry.trace(message));
    }
    this.hostContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    final SupplyLane<LogEntry> metaDebugLog = this.metaDebugLog;
    if (metaDebugLog != null) {
      metaDebugLog.push(LogEntry.debug(message));
    }
    this.hostContext.debug(message);
  }

  @Override
  public void info(Object message) {
    final SupplyLane<LogEntry> metaInfoLog = this.metaInfoLog;
    if (metaInfoLog != null) {
      metaInfoLog.push(LogEntry.info(message));
    }
    this.hostContext.info(message);
  }

  @Override
  public void warn(Object message) {
    final SupplyLane<LogEntry> metaWarnLog = this.metaWarnLog;
    if (metaWarnLog != null) {
      metaWarnLog.push(LogEntry.warn(message));
    }
    this.hostContext.warn(message);
  }

  @Override
  public void error(Object message) {
    final SupplyLane<LogEntry> metaErrorLog = this.metaErrorLog;
    if (metaErrorLog != null) {
      metaErrorLog.push(LogEntry.error(message));
    }
    this.hostContext.error(message);
  }

  @Override
  public void fail(Object message) {
    final SupplyLane<LogEntry> metaFailLog = this.metaFailLog;
    if (metaFailLog != null) {
      metaFailLog.push(LogEntry.fail(message));
    }
    this.hostContext.fail(message);
  }

  @Override
  protected void willOpen() {
    super.willOpen();
    final Iterator<NodeBinding> nodesIterator = this.nodes.valueIterator();
    while (nodesIterator.hasNext()) {
      nodesIterator.next().open();
    }
  }

  @Override
  protected void willLoad() {
    super.willLoad();
    final Iterator<NodeBinding> nodesIterator = this.nodes.valueIterator();
    while (nodesIterator.hasNext()) {
      nodesIterator.next().load();
    }
  }

  @Override
  protected void willStart() {
    super.willStart();
    final Iterator<NodeBinding> nodesIterator = this.nodes.valueIterator();
    while (nodesIterator.hasNext()) {
      nodesIterator.next().start();
    }
  }

  @Override
  protected void willStop() {
    super.willStop();
    final Iterator<NodeBinding> nodesIterator = this.nodes.valueIterator();
    while (nodesIterator.hasNext()) {
      nodesIterator.next().stop();
    }
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    final Iterator<NodeBinding> nodesIterator = this.nodes.valueIterator();
    while (nodesIterator.hasNext()) {
      nodesIterator.next().unload();
    }
  }

  @Override
  protected void willClose() {
    super.willClose();
    final Iterator<NodeBinding> nodesIterator = this.nodes.valueIterator();
    while (nodesIterator.hasNext()) {
      nodesIterator.next().close();
    }
  }

  @Override
  public void didClose() {
    super.didClose();
    final AgentNode metaNode = this.metaNode;
    if (metaNode != null) {
      metaNode.close();
      this.metaNode = null;
      this.metaNodes = null;
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
    if (metric instanceof NodeProfile) {
      accumulateNodeProfile((NodeProfile) metric);
    } else if (metric instanceof WarpDownlinkProfile) {
      accumulateWarpDownlinkProfile((WarpDownlinkProfile) metric);
    } else {
      this.hostContext.reportDown(metric);
    }
  }

  protected void accumulateNodeProfile(NodeProfile profile) {
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
    final HostProfile profile = collectProfile(dt);
    this.hostContext.reportDown(profile);
  }

  protected HostProfile collectProfile(long dt) {
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

    final long nodeCount = nodeOpenCount - nodeCloseCount;
    final long agentCount = agentOpenCount - agentCloseCount;
    final AgentPulse agentPulse = new AgentPulse(agentCount, agentExecRate, agentExecTime, timerEventRate, timerEventCount);
    final long downlinkCount = downlinkOpenCount - downlinkCloseCount;
    final WarpDownlinkPulse downlinkPulse = new WarpDownlinkPulse(downlinkCount, downlinkEventRate, downlinkEventCount,
                                                                  downlinkCommandRate, downlinkCommandCount);
    final long uplinkCount = uplinkOpenCount - uplinkCloseCount;
    final WarpUplinkPulse uplinkPulse = new WarpUplinkPulse(uplinkCount, uplinkEventRate, uplinkEventCount,
                                                            uplinkCommandRate, uplinkCommandCount);
    this.pulse = new HostPulse(nodeCount, agentPulse, downlinkPulse, uplinkPulse);
    final DemandLane<HostPulse> metaPulse = this.metaPulse;
    if (metaPulse != null) {
      metaPulse.cue();
    }

    return new HostProfile(cellAddress(),
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

  static final int PRIMARY = 1 << 0;
  static final int REPLICA = 1 << 1;
  static final int MASTER = 1 << 2;
  static final int SLAVE = 1 << 3;

  static final Uri NODES_URI = Uri.parse("nodes");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<HostTable, UriMapper<NodeBinding>> NODES =
      AtomicReferenceFieldUpdater.newUpdater(HostTable.class, (Class<UriMapper<NodeBinding>>) (Class<?>) UriMapper.class, "nodes");

  static final AtomicIntegerFieldUpdater<HostTable> FLAGS =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "flags");

  static final AtomicIntegerFieldUpdater<HostTable> NODE_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "nodeOpenDelta");
  static final AtomicLongFieldUpdater<HostTable> NODE_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "nodeOpenCount");
  static final AtomicIntegerFieldUpdater<HostTable> NODE_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "nodeCloseDelta");
  static final AtomicLongFieldUpdater<HostTable> NODE_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "nodeCloseCount");
  static final AtomicIntegerFieldUpdater<HostTable> AGENT_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "agentOpenDelta");
  static final AtomicLongFieldUpdater<HostTable> AGENT_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "agentOpenCount");
  static final AtomicIntegerFieldUpdater<HostTable> AGENT_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "agentCloseDelta");
  static final AtomicLongFieldUpdater<HostTable> AGENT_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "agentCloseCount");
  static final AtomicLongFieldUpdater<HostTable> AGENT_EXEC_DELTA =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "agentExecDelta");
  static final AtomicLongFieldUpdater<HostTable> AGENT_EXEC_RATE =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "agentExecRate");
  static final AtomicLongFieldUpdater<HostTable> AGENT_EXEC_TIME =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "agentExecTime");
  static final AtomicIntegerFieldUpdater<HostTable> TIMER_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "timerEventDelta");
  static final AtomicIntegerFieldUpdater<HostTable> TIMER_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "timerEventRate");
  static final AtomicLongFieldUpdater<HostTable> TIMER_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "timerEventCount");
  static final AtomicIntegerFieldUpdater<HostTable> DOWNLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "downlinkOpenDelta");
  static final AtomicLongFieldUpdater<HostTable> DOWNLINK_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "downlinkOpenCount");
  static final AtomicIntegerFieldUpdater<HostTable> DOWNLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "downlinkCloseDelta");
  static final AtomicLongFieldUpdater<HostTable> DOWNLINK_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "downlinkCloseCount");
  static final AtomicIntegerFieldUpdater<HostTable> DOWNLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "downlinkEventDelta");
  static final AtomicIntegerFieldUpdater<HostTable> DOWNLINK_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "downlinkEventRate");
  static final AtomicLongFieldUpdater<HostTable> DOWNLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "downlinkEventCount");
  static final AtomicIntegerFieldUpdater<HostTable> DOWNLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "downlinkCommandDelta");
  static final AtomicIntegerFieldUpdater<HostTable> DOWNLINK_COMMAND_RATE =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "downlinkCommandRate");
  static final AtomicLongFieldUpdater<HostTable> DOWNLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "downlinkCommandCount");
  static final AtomicIntegerFieldUpdater<HostTable> UPLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "uplinkOpenDelta");
  static final AtomicLongFieldUpdater<HostTable> UPLINK_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "uplinkOpenCount");
  static final AtomicIntegerFieldUpdater<HostTable> UPLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "uplinkCloseDelta");
  static final AtomicLongFieldUpdater<HostTable> UPLINK_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "uplinkCloseCount");
  static final AtomicIntegerFieldUpdater<HostTable> UPLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "uplinkEventDelta");
  static final AtomicIntegerFieldUpdater<HostTable> UPLINK_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "uplinkEventRate");
  static final AtomicLongFieldUpdater<HostTable> UPLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "uplinkEventCount");
  static final AtomicIntegerFieldUpdater<HostTable> UPLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "uplinkCommandDelta");
  static final AtomicIntegerFieldUpdater<HostTable> UPLINK_COMMAND_RATE =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "uplinkCommandRate");
  static final AtomicLongFieldUpdater<HostTable> UPLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "uplinkCommandCount");
  static final AtomicLongFieldUpdater<HostTable> LAST_REPORT_TIME =
      AtomicLongFieldUpdater.newUpdater(HostTable.class, "lastReportTime");
}

final class HostTableNodesController implements OnCueKey<Uri, NodeInfo>, OnSyncKeys<Uri> {
  final HostBinding host;

  HostTableNodesController(HostBinding host) {
    this.host = host;
  }

  @Override
  public NodeInfo onCue(Uri nodeUri, WarpUplink uplink) {
    final NodeBinding nodeBinding;
    final String laneQuery = uplink.laneUri().query().get("q");
    final UriFragment laneFragment = uplink.laneUri().fragment();
    if (laneQuery != null) {
      if (nodeUri.toString().contains(laneQuery)) {
        nodeBinding = this.host.getNode(nodeUri);
        if (nodeBinding != null) {
          return NodeInfo.from(nodeBinding);
        }
      }
    } else if (laneFragment.isDefined()) {
      final Uri parentUri = Uri.parse(laneFragment.identifier());
      if (nodeUri.isChildOf(parentUri)) {
        nodeBinding = this.host.getNode(nodeUri);
        final Uri directoryUri = nodeUri.appendedSlash();
        final UriMapper<NodeBinding> directory = this.host.nodes().getSuffix(directoryUri);
        if (nodeBinding != null) {
          return NodeInfo.from(nodeBinding, directory.childCount());
        } else if (!directory.isEmpty()) {
          return new NodeInfo(nodeUri, 0L, FingerTrieSeq.empty(), directory.childCount()); // synthetic directory node
        }
      }
    } else {
      nodeBinding = this.host.getNode(nodeUri);
      if (nodeBinding != null) {
        return NodeInfo.from(nodeBinding);
      }
    }
    return null;
  }

  @Override
  public Iterator<Uri> onSync(WarpUplink uplink) {
    final String laneQuery = uplink.laneUri().query().get("q");
    final UriFragment laneFragment = uplink.laneUri().fragment();
    if (laneQuery != null) {
      return new HostTableNodesQueryIterator(laneQuery, this.host.nodes().iterator());
    } else if (laneFragment.isDefined()) {
      final Uri parentUri = Uri.parse(laneFragment.identifier());
      final UriMapper<NodeBinding> parentSuffix = this.host.nodes().getSuffix(parentUri);
      return new HostTableNodesChildIterator(parentUri, parentSuffix.childIterator());
    }
    return this.host.nodes().keyIterator();
  }
}

final class HostTableNodesQueryIterator implements Iterator<Uri> {
  final String query;
  final Iterator<Map.Entry<Uri, NodeBinding>> nodes;
  Uri nextNodeUri;

  HostTableNodesQueryIterator(String query, Iterator<Map.Entry<Uri, NodeBinding>> nodes) {
    this.query = query;
    this.nodes = nodes;
  }

  Uri nextNodeUri() {
    if (this.nextNodeUri == null) {
      while (this.nodes.hasNext()) {
        final Map.Entry<Uri, NodeBinding> entry = this.nodes.next();
        final Uri nodeUri = entry.getKey();
        if (nodeUri.toString().contains(this.query)) {
          this.nextNodeUri = nodeUri;
          break;
        }
      }
    }
    return this.nextNodeUri;
  }

  @Override
  public boolean hasNext() {
    return nextNodeUri() != null;
  }

  @Override
  public Uri next() {
    final Uri nextNodeUri = nextNodeUri();
    this.nextNodeUri = null;
    return nextNodeUri;
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}

final class HostTableNodesChildIterator implements Iterator<Uri> {
  final Uri parentUri;
  final Iterator<UriPart> childSegments;

  HostTableNodesChildIterator(Uri parentUri, Iterator<UriPart> childSegments) {
    this.parentUri = parentUri;
    this.childSegments = childSegments;
  }

  @Override
  public boolean hasNext() {
    return this.childSegments.hasNext();
  }

  @Override
  public Uri next() {
    final UriPart childSegment = this.childSegments.next();
    return this.parentUri.appendedPath((UriPath) childSegment);
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}

final class HostTablePulseController implements OnCue<HostPulse> {
  final HostTable host;

  HostTablePulseController(HostTable host) {
    this.host = host;
  }

  @Override
  public HostPulse onCue(WarpUplink uplink) {
    return this.host.pulse;
  }
}
