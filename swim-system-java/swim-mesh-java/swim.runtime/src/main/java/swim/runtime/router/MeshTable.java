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
import swim.collections.FingerTrieSeq;
import swim.concurrent.Conts;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.AbstractTierBinding;
import swim.runtime.EdgeBinding;
import swim.runtime.HostBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.MeshAddress;
import swim.runtime.MeshBinding;
import swim.runtime.MeshContext;
import swim.runtime.Metric;
import swim.runtime.NodeBinding;
import swim.runtime.PartAddress;
import swim.runtime.PartBinding;
import swim.runtime.PartContext;
import swim.runtime.PushRequest;
import swim.runtime.TierContext;
import swim.runtime.UplinkError;
import swim.runtime.agent.AgentNode;
import swim.runtime.profile.MeshProfile;
import swim.runtime.profile.PartProfile;
import swim.runtime.profile.WarpDownlinkProfile;
import swim.runtime.reflect.AgentPulse;
import swim.runtime.reflect.LogEntry;
import swim.runtime.reflect.MeshPulse;
import swim.runtime.reflect.PartInfo;
import swim.runtime.reflect.WarpDownlinkPulse;
import swim.runtime.reflect.WarpUplinkPulse;
import swim.store.StoreBinding;
import swim.structure.Extant;
import swim.structure.Form;
import swim.structure.Text;
import swim.structure.Value;
import swim.uri.Uri;

public class MeshTable extends AbstractTierBinding implements MeshBinding {
  protected MeshContext meshContext;
  volatile FingerTrieSeq<PartBinding> parts;
  volatile PartBinding gateway;
  volatile PartBinding ourself;

  volatile int partOpenDelta;
  volatile long partOpenCount;
  volatile int partCloseDelta;
  volatile long partCloseCount;
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
  MeshPulse pulse;

  AgentNode metaNode;
  DemandMapLane<Value, PartInfo> metaParts;
  DemandLane<MeshPulse> metaPulse;
  SupplyLane<LogEntry> metaTraceLog;
  SupplyLane<LogEntry> metaDebugLog;
  SupplyLane<LogEntry> metaInfoLog;
  SupplyLane<LogEntry> metaWarnLog;
  SupplyLane<LogEntry> metaErrorLog;
  SupplyLane<LogEntry> metaFailLog;

  public MeshTable() {
    this.parts = FingerTrieSeq.empty();
  }

  @Override
  public final TierContext tierContext() {
    return this.meshContext;
  }

  @Override
  public final EdgeBinding edge() {
    return this.meshContext.edge();
  }

  @Override
  public final MeshBinding meshWrapper() {
    return this;
  }

  @Override
  public final MeshContext meshContext() {
    return this.meshContext;
  }

  @Override
  public void setMeshContext(MeshContext meshContext) {
    this.meshContext = meshContext;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapMesh(Class<T> meshClass) {
    if (meshClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.meshContext.unwrapMesh(meshClass);
    }
  }

  protected PartContext createPartContext(PartAddress partAddress, PartBinding part) {
    return new MeshTablePart(this, part, partAddress);
  }

  @Override
  public final MeshAddress cellAddress() {
    return this.meshContext.cellAddress();
  }

  @Override
  public final String edgeName() {
    return this.meshContext.edgeName();
  }

  @Override
  public final Uri meshUri() {
    return this.meshContext.meshUri();
  }

  @Override
  public Policy policy() {
    return this.meshContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.meshContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.meshContext.stage();
  }

  @Override
  public StoreBinding store() {
    return this.meshContext.store();
  }

  @Override
  public void openMetaMesh(MeshBinding mesh, NodeBinding metaMesh) {
    if (metaMesh instanceof AgentNode) {
      this.metaNode = (AgentNode) metaMesh;
      openMetaLanes(mesh, (AgentNode) metaMesh);
    }
    this.meshContext.openMetaMesh(mesh, metaMesh);
  }

  protected void openMetaLanes(MeshBinding mesh, AgentNode metaMesh) {
    openReflectLanes(mesh, metaMesh);
    openLogLanes(mesh, metaMesh);
  }

  protected void openReflectLanes(MeshBinding mesh, AgentNode metaMesh) {
    this.metaParts = metaMesh.demandMapLane()
        .keyForm(Form.forValue())
        .valueForm(PartInfo.form())
        .observe(new MeshTablePartsController(mesh));
    metaMesh.openLane(PARTS_URI, this.metaParts);

    this.metaPulse = metaNode.demandLane()
        .valueForm(MeshPulse.form())
        .observe(new MeshTablePulseController(this));
    metaNode.openLane(MeshPulse.PULSE_URI, this.metaPulse);
  }

  protected void openLogLanes(MeshBinding mesh, AgentNode metaMesh) {
    this.metaTraceLog = metaMesh.supplyLane()
        .valueForm(LogEntry.form());
    metaMesh.openLane(LogEntry.TRACE_LOG_URI, this.metaTraceLog);

    this.metaDebugLog = metaMesh.supplyLane()
        .valueForm(LogEntry.form());
    metaMesh.openLane(LogEntry.DEBUG_LOG_URI, this.metaDebugLog);

    this.metaInfoLog = metaMesh.supplyLane()
        .valueForm(LogEntry.form());
    metaMesh.openLane(LogEntry.INFO_LOG_URI, this.metaInfoLog);

    this.metaWarnLog = metaMesh.supplyLane()
        .valueForm(LogEntry.form());
    metaMesh.openLane(LogEntry.WARN_LOG_URI, this.metaWarnLog);

    this.metaErrorLog = metaMesh.supplyLane()
        .valueForm(LogEntry.form());
    metaMesh.openLane(LogEntry.ERROR_LOG_URI, this.metaErrorLog);

    this.metaFailLog = metaMesh.supplyLane()
        .valueForm(LogEntry.form());
    metaMesh.openLane(LogEntry.FAIL_LOG_URI, this.metaFailLog);
  }

  @Override
  public PartBinding gateway() {
    return this.gateway;
  }

  @Override
  public void setGateway(PartBinding gateway) {
    this.gateway = gateway;
  }

  @Override
  public PartBinding ourself() {
    return this.ourself;
  }

  @Override
  public void setOurself(PartBinding ourself) {
    this.ourself = ourself;
  }

  @Override
  public FingerTrieSeq<PartBinding> parts() {
    return this.parts;
  }

  boolean isMetaNode(Uri nodeUri) {
    return !meshUri().isDefined() && "swim".equals(nodeUri.schemeName());
  }

  @Override
  public PartBinding getPart(Uri nodeUri) {
    if (isMetaNode(nodeUri)) {
      return this.ourself;
    }
    final FingerTrieSeq<PartBinding> parts = this.parts;
    for (int i = 0, n = parts.size(); i < n; i += 1) {
      final PartBinding part = parts.get(i);
      if (part.predicate().test(nodeUri)) {
        return part;
      }
    }
    return this.gateway;
  }

  @Override
  public PartBinding getPart(Value partKey) {
    final FingerTrieSeq<PartBinding> parts = this.parts;
    for (int i = 0, n = parts.size(); i < n; i += 1) {
      final PartBinding part = parts.get(i);
      if (partKey.equals(part.partKey())) {
        return part;
      }
    }
    return null;
  }

  @Override
  public PartBinding openPart(Uri nodeUri) {
    FingerTrieSeq<PartBinding> oldParts;
    FingerTrieSeq<PartBinding> newParts;
    PartBinding partBinding = null;
    Value partKey = Value.extant();
    do {
      oldParts = this.parts;
      PartBinding part = null;
      if (isMetaNode(nodeUri)) {
        part = this.ourself;
      } else {
        for (int i = 0, n = oldParts.size(); i < n; i += 1) {
          final PartBinding oldPart = oldParts.get(i);
          if (oldPart.predicate().test(nodeUri)) {
            part = oldPart;
            break;
          }
        }
      }
      if (part != null) {
        if (partBinding != null) {
          // Lost creation race.
          partBinding.close();
        }
        partBinding = part;
        newParts = oldParts;
        break;
      } else if (partBinding == null) {
        if (isMetaNode(nodeUri)) {
          partKey = Text.from("swim");
        } else {
          partKey = Value.extant();
        }
        final PartAddress partAddress = cellAddress().partKey(partKey);
        partBinding = this.meshContext.createPart(partAddress);
        if (partBinding != null) {
          partBinding = this.meshContext.injectPart(partAddress, partBinding);
          final PartContext partContext = createPartContext(partAddress, partBinding);
          partBinding.setPartContext(partContext);
          partBinding = partBinding.partWrapper();
          newParts = oldParts.appended(partBinding);
        } else {
          newParts = oldParts;
          break;
        }
      } else {
        newParts = oldParts.appended(partBinding);
      }
    } while (oldParts != newParts && !PARTS.compareAndSet(this, oldParts, newParts));
    if (oldParts != newParts) {
      if (partKey instanceof Extant) {
        this.gateway = partBinding;
      } else if (isMetaNode(nodeUri)) {
        this.ourself = partBinding;
      }
      activate(partBinding);
      didOpenPart(partBinding);
    }
    return partBinding;
  }

  @Override
  public PartBinding openGateway() {
    final Value partKey = Value.extant();
    FingerTrieSeq<PartBinding> oldParts;
    FingerTrieSeq<PartBinding> newParts;
    PartBinding partBinding = null;
    do {
      oldParts = this.parts;
      final PartBinding part = this.gateway;
      if (part != null) {
        if (partBinding != null) {
          // Lost creation race.
          partBinding.close();
        }
        partBinding = part;
        newParts = oldParts;
        break;
      } else if (partBinding == null) {
        final PartAddress partAddress = cellAddress().partKey(partKey);
        partBinding = this.meshContext.createPart(partAddress);
        if (partBinding != null) {
          partBinding = this.meshContext.injectPart(partAddress, partBinding);
          final PartContext partContext = createPartContext(partAddress, partBinding);
          partBinding.setPartContext(partContext);
          partBinding = partBinding.partWrapper();
          newParts = oldParts.appended(partBinding);
        } else {
          newParts = oldParts;
          break;
        }
      } else {
        newParts = oldParts.appended(partBinding);
      }
    } while (oldParts != newParts && !PARTS.compareAndSet(this, oldParts, newParts));
    if (oldParts != newParts) {
      this.gateway = partBinding;
      activate(partBinding);
      didOpenPart(partBinding);
    }
    return partBinding;
  }

  @Override
  public PartBinding addPart(Value partKey, PartBinding part) {
    FingerTrieSeq<PartBinding> oldParts;
    FingerTrieSeq<PartBinding> newParts;
    PartBinding partBinding = null;
    do {
      oldParts = this.parts;
      for (int i = 0, n = oldParts.size(); i < n; i += 1) {
        final PartBinding oldPart = oldParts.get(i);
        if (partKey.equals(oldPart.partKey())) {
          break;
        }
      }
      if (partBinding == null) {
        final PartAddress partAddress = cellAddress().partKey(partKey);
        partBinding = this.meshContext.injectPart(partAddress, part);
        final PartContext partContext = createPartContext(partAddress, partBinding);
        partBinding.setPartContext(partContext);
        partBinding = partBinding.partWrapper();
      }
      newParts = oldParts.appended(partBinding);
    } while (oldParts != newParts && !PARTS.compareAndSet(this, oldParts, newParts));
    if (partBinding != null) {
      activate(partBinding);
      didOpenPart(partBinding);
    }
    return partBinding;
  }

  public void closePart(Value partKey) {
    FingerTrieSeq<PartBinding> oldParts;
    FingerTrieSeq<PartBinding> newParts;
    PartBinding partBinding;
    do {
      oldParts = this.parts;
      newParts = oldParts;
      partBinding = null;
      for (int i = 0, n = oldParts.size(); i < n; i += 1) {
        final PartBinding part = oldParts.get(i);
        if (partKey.equals(part.partKey())) {
          partBinding = part;
          newParts = oldParts.removed(i);
          break;
        }
      }
    } while (oldParts != newParts && !PARTS.compareAndSet(this, oldParts, newParts));
    if (partBinding != null) {
      if (this.gateway == partBinding) {
        this.gateway = null;
      } else if (this.ourself == partBinding) {
        this.ourself = null;
      }
      partBinding.didClose();
      didClosePart(partBinding);
      if (newParts.isEmpty()) {
        close();
      }
    }
  }

  protected void didOpenPart(PartBinding part) {
    final DemandMapLane<Value, PartInfo> metaParts = this.metaParts;
    if (metaParts != null) {
      metaParts.cue(part.partKey());
    }
    PART_OPEN_DELTA.incrementAndGet(this);
    flushMetrics();
  }

  protected void didClosePart(PartBinding part) {
    final DemandMapLane<Value, PartInfo> metaParts = this.metaParts;
    if (metaParts != null) {
      metaParts.remove(part.partKey());
    }
    PART_CLOSE_DELTA.incrementAndGet(this);
    flushMetrics();
  }

  @Override
  public void openMetaPart(PartBinding part, NodeBinding metaPart) {
    this.meshContext.openMetaPart(part, metaPart);
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    this.meshContext.openMetaHost(host, metaHost);
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.meshContext.openMetaNode(node, metaNode);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.meshContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.meshContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.meshContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    final LinkBinding link = this.meshContext.bindDownlink(downlink);
    link.setCellContext(this);
    return link;
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.meshContext.openDownlink(link);
    link.setCellContext(this);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
  }

  @Override
  public void openUplink(LinkBinding link) {
    final PartBinding partBinding = openPart(link.nodeUri());
    if (partBinding != null) {
      partBinding.openUplink(link);
    } else {
      UplinkError.rejectPartNotFound(link);
    }
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.meshContext.pushDown(pushRequest);
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    final PartBinding partBinding = openPart(pushRequest.nodeUri());
    if (partBinding != null) {
      partBinding.pushUp(pushRequest);
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
    this.meshContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    final SupplyLane<LogEntry> metaDebugLog = this.metaDebugLog;
    if (metaDebugLog != null) {
      metaDebugLog.push(LogEntry.debug(message));
    }
    this.meshContext.debug(message);
  }

  @Override
  public void info(Object message) {
    final SupplyLane<LogEntry> metaInfoLog = this.metaInfoLog;
    if (metaInfoLog != null) {
      metaInfoLog.push(LogEntry.info(message));
    }
    this.meshContext.info(message);
  }

  @Override
  public void warn(Object message) {
    final SupplyLane<LogEntry> metaWarnLog = this.metaWarnLog;
    if (metaWarnLog != null) {
      metaWarnLog.push(LogEntry.warn(message));
    }
    this.meshContext.warn(message);
  }

  @Override
  public void error(Object message) {
    final SupplyLane<LogEntry> metaErrorLog = this.metaErrorLog;
    if (metaErrorLog != null) {
      metaErrorLog.push(LogEntry.error(message));
    }
    this.meshContext.error(message);
  }

  @Override
  public void fail(Object message) {
    final SupplyLane<LogEntry> metaFailLog = this.metaFailLog;
    if (metaFailLog != null) {
      metaFailLog.push(LogEntry.fail(message));
    }
    this.meshContext.fail(message);
  }

  @Override
  protected void willOpen() {
    super.willOpen();
    final Iterator<PartBinding> partsIterator = this.parts.iterator();
    while (partsIterator.hasNext()) {
      partsIterator.next().open();
    }
  }

  @Override
  protected void willLoad() {
    super.willLoad();
    final Iterator<PartBinding> partsIterator = this.parts.iterator();
    while (partsIterator.hasNext()) {
      partsIterator.next().load();
    }
  }

  @Override
  protected void willStart() {
    super.willStart();
    final Iterator<PartBinding> partsIterator = this.parts.iterator();
    while (partsIterator.hasNext()) {
      partsIterator.next().start();
    }
  }

  @Override
  protected void willStop() {
    super.willStop();
    final Iterator<PartBinding> partsIterator = this.parts.iterator();
    while (partsIterator.hasNext()) {
      partsIterator.next().stop();
    }
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    final Iterator<PartBinding> partsIterator = this.parts.iterator();
    while (partsIterator.hasNext()) {
      partsIterator.next().unload();
    }
  }

  @Override
  protected void willClose() {
    super.willClose();
    final Iterator<PartBinding> partsIterator = this.parts.iterator();
    while (partsIterator.hasNext()) {
      partsIterator.next().close();
    }
  }

  @Override
  public void didClose() {
    super.didClose();
    final AgentNode metaNode = this.metaNode;
    if (metaNode != null) {
      metaNode.close();
      this.metaNode = null;
      this.metaParts = null;
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
    if (metric instanceof PartProfile) {
      accumulatePartProfile((PartProfile) metric);
    } else if (metric instanceof WarpDownlinkProfile) {
      accumulateWarpDownlinkProfile((WarpDownlinkProfile) metric);
    } else {
      this.meshContext.reportDown(metric);
    }
  }

  protected void accumulatePartProfile(PartProfile profile) {
    HOST_OPEN_DELTA.addAndGet(this, profile.hostOpenDelta());
    HOST_CLOSE_DELTA.addAndGet(this, profile.hostCloseDelta());
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
    final MeshProfile profile = collectProfile(dt);
    this.meshContext.reportDown(profile);
  }

  protected MeshProfile collectProfile(long dt) {
    final int partOpenDelta = PART_OPEN_DELTA.getAndSet(this, 0);
    final long partOpenCount = PART_OPEN_COUNT.addAndGet(this, (long) partOpenDelta);
    final int partCloseDelta = PART_CLOSE_DELTA.getAndSet(this, 0);
    final long partCloseCount = PART_CLOSE_COUNT.addAndGet(this, (long) partCloseDelta);

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

    final int partCount = (int) (partOpenCount - partCloseCount);
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
    this.pulse = new MeshPulse(partCount, hostCount, nodeCount, agentPulse, downlinkPulse, uplinkPulse);
    final DemandLane<MeshPulse> metaPulse = this.metaPulse;
    if (metaPulse != null) {
      metaPulse.cue();
    }

    return new MeshProfile(cellAddress(),
                           partOpenDelta, partOpenCount, partCloseDelta, partCloseCount,
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

  static final Uri PARTS_URI = Uri.parse("parts");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<MeshTable, FingerTrieSeq<PartBinding>> PARTS =
      AtomicReferenceFieldUpdater.newUpdater(MeshTable.class, (Class<FingerTrieSeq<PartBinding>>) (Class<?>) FingerTrieSeq.class, "parts");

  static final AtomicIntegerFieldUpdater<MeshTable> PART_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "partOpenDelta");
  static final AtomicLongFieldUpdater<MeshTable> PART_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "partOpenCount");
  static final AtomicIntegerFieldUpdater<MeshTable> PART_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "partCloseDelta");
  static final AtomicLongFieldUpdater<MeshTable> PART_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "partCloseCount");
  static final AtomicIntegerFieldUpdater<MeshTable> HOST_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "hostOpenDelta");
  static final AtomicLongFieldUpdater<MeshTable> HOST_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "hostOpenCount");
  static final AtomicIntegerFieldUpdater<MeshTable> HOST_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "hostCloseDelta");
  static final AtomicLongFieldUpdater<MeshTable> HOST_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "hostCloseCount");
  static final AtomicIntegerFieldUpdater<MeshTable> NODE_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "nodeOpenDelta");
  static final AtomicLongFieldUpdater<MeshTable> NODE_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "nodeOpenCount");
  static final AtomicIntegerFieldUpdater<MeshTable> NODE_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "nodeCloseDelta");
  static final AtomicLongFieldUpdater<MeshTable> NODE_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "nodeCloseCount");
  static final AtomicIntegerFieldUpdater<MeshTable> AGENT_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "agentOpenDelta");
  static final AtomicLongFieldUpdater<MeshTable> AGENT_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "agentOpenCount");
  static final AtomicIntegerFieldUpdater<MeshTable> AGENT_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "agentCloseDelta");
  static final AtomicLongFieldUpdater<MeshTable> AGENT_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "agentCloseCount");
  static final AtomicLongFieldUpdater<MeshTable> AGENT_EXEC_DELTA =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "agentExecDelta");
  static final AtomicLongFieldUpdater<MeshTable> AGENT_EXEC_RATE =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "agentExecRate");
  static final AtomicLongFieldUpdater<MeshTable> AGENT_EXEC_TIME =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "agentExecTime");
  static final AtomicIntegerFieldUpdater<MeshTable> TIMER_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "timerEventDelta");
  static final AtomicIntegerFieldUpdater<MeshTable> TIMER_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "timerEventRate");
  static final AtomicLongFieldUpdater<MeshTable> TIMER_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "timerEventCount");
  static final AtomicIntegerFieldUpdater<MeshTable> DOWNLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "downlinkOpenDelta");
  static final AtomicLongFieldUpdater<MeshTable> DOWNLINK_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "downlinkOpenCount");
  static final AtomicIntegerFieldUpdater<MeshTable> DOWNLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "downlinkCloseDelta");
  static final AtomicLongFieldUpdater<MeshTable> DOWNLINK_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "downlinkCloseCount");
  static final AtomicIntegerFieldUpdater<MeshTable> DOWNLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "downlinkEventDelta");
  static final AtomicIntegerFieldUpdater<MeshTable> DOWNLINK_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "downlinkEventRate");
  static final AtomicLongFieldUpdater<MeshTable> DOWNLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "downlinkEventCount");
  static final AtomicIntegerFieldUpdater<MeshTable> DOWNLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "downlinkCommandDelta");
  static final AtomicIntegerFieldUpdater<MeshTable> DOWNLINK_COMMAND_RATE =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "downlinkCommandRate");
  static final AtomicLongFieldUpdater<MeshTable> DOWNLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "downlinkCommandCount");
  static final AtomicIntegerFieldUpdater<MeshTable> UPLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "uplinkOpenDelta");
  static final AtomicLongFieldUpdater<MeshTable> UPLINK_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "uplinkOpenCount");
  static final AtomicIntegerFieldUpdater<MeshTable> UPLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "uplinkCloseDelta");
  static final AtomicLongFieldUpdater<MeshTable> UPLINK_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "uplinkCloseCount");
  static final AtomicIntegerFieldUpdater<MeshTable> UPLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "uplinkEventDelta");
  static final AtomicIntegerFieldUpdater<MeshTable> UPLINK_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "uplinkEventRate");
  static final AtomicLongFieldUpdater<MeshTable> UPLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "uplinkEventCount");
  static final AtomicIntegerFieldUpdater<MeshTable> UPLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "uplinkCommandDelta");
  static final AtomicIntegerFieldUpdater<MeshTable> UPLINK_COMMAND_RATE =
      AtomicIntegerFieldUpdater.newUpdater(MeshTable.class, "uplinkCommandRate");
  static final AtomicLongFieldUpdater<MeshTable> UPLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "uplinkCommandCount");
  static final AtomicLongFieldUpdater<MeshTable> LAST_REPORT_TIME =
      AtomicLongFieldUpdater.newUpdater(MeshTable.class, "lastReportTime");
}

final class MeshTablePartsController implements OnCueKey<Value, PartInfo>, OnSyncKeys<Value> {
  final MeshBinding mesh;

  MeshTablePartsController(MeshBinding mesh) {
    this.mesh = mesh;
  }

  @Override
  public PartInfo onCue(Value partKey, WarpUplink uplink) {
    final PartBinding partBinding = this.mesh.getPart(partKey);
    if (partBinding != null) {
      return PartInfo.from(partBinding);
    }
    return null;
  }

  @Override
  public Iterator<Value> onSync(WarpUplink uplink) {
    return new MeshTablePartsKeyIterator(this.mesh.parts().iterator());
  }
}

final class MeshTablePartsKeyIterator implements Iterator<Value> {
  final Iterator<PartBinding> parts;

  MeshTablePartsKeyIterator(Iterator<PartBinding> parts) {
    this.parts = parts;
  }

  @Override
  public boolean hasNext() {
    return this.parts.hasNext();
  }

  @Override
  public Value next() {
    return this.parts.next().partKey();
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}

final class MeshTablePulseController implements OnCue<MeshPulse> {
  final MeshTable mesh;

  MeshTablePulseController(MeshTable mesh) {
    this.mesh = mesh;
  }

  @Override
  public MeshPulse onCue(WarpUplink uplink) {
    return this.mesh.pulse;
  }
}
