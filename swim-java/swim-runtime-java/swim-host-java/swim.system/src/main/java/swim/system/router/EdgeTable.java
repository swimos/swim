// Copyright 2015-2021 Swim Inc.
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
import swim.system.AbstractTierBinding;
import swim.system.DownlinkView;
import swim.system.EdgeAddress;
import swim.system.EdgeBinding;
import swim.system.EdgeContext;
import swim.system.EdgeException;
import swim.system.HostBinding;
import swim.system.LaneBinding;
import swim.system.LinkBinding;
import swim.system.MeshAddress;
import swim.system.MeshBinding;
import swim.system.MeshContext;
import swim.system.Metric;
import swim.system.NodeBinding;
import swim.system.PartBinding;
import swim.system.Push;
import swim.system.TierContext;
import swim.system.UplinkError;
import swim.system.agent.AgentNode;
import swim.system.profile.EdgeProfile;
import swim.system.profile.MeshProfile;
import swim.system.profile.WarpDownlinkProfile;
import swim.system.reflect.AgentPulse;
import swim.system.reflect.EdgePulse;
import swim.system.reflect.LogEntry;
import swim.system.reflect.MeshInfo;
import swim.system.reflect.WarpDownlinkPulse;
import swim.system.reflect.WarpUplinkPulse;
import swim.uri.Uri;

public class EdgeTable extends AbstractTierBinding implements EdgeBinding {

  protected EdgeContext edgeContext;
  volatile HashTrieMap<Uri, MeshBinding> meshes;
  volatile MeshBinding network;

  volatile int meshOpenDelta;
  volatile long meshOpenCount;
  volatile int meshCloseDelta;
  volatile long meshCloseCount;
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

  EdgePulse pulse;
  AgentNode metaNode;
  DemandMapLane<Uri, MeshInfo> metaMeshes;
  DemandLane<EdgePulse> metaPulse;
  SupplyLane<LogEntry> metaTraceLog;
  SupplyLane<LogEntry> metaDebugLog;
  SupplyLane<LogEntry> metaInfoLog;
  SupplyLane<LogEntry> metaWarnLog;
  SupplyLane<LogEntry> metaErrorLog;
  SupplyLane<LogEntry> metaFailLog;

  public EdgeTable() {
    this.edgeContext = null;
    this.meshes = HashTrieMap.empty();
    this.network = null;

    this.meshOpenDelta = 0;
    this.meshOpenCount = 0L;
    this.meshCloseDelta = 0;
    this.meshCloseCount = 0L;
    this.partOpenDelta = 0;
    this.partOpenCount = 0L;
    this.partCloseDelta = 0;
    this.partCloseCount = 0L;
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
    this.metaMeshes = null;
    this.metaPulse = null;
    this.metaTraceLog = null;
    this.metaDebugLog = null;
    this.metaInfoLog = null;
    this.metaWarnLog = null;
    this.metaErrorLog = null;
    this.metaFailLog = null;
  }

  @Override
  public final TierContext tierContext() {
    return this.edgeContext;
  }

  @Override
  public final EdgeBinding edgeWrapper() {
    return this;
  }

  @Override
  public final EdgeContext edgeContext() {
    return this.edgeContext;
  }

  @Override
  public void setEdgeContext(EdgeContext edgeContext) {
    this.edgeContext = edgeContext;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapEdge(Class<T> edgeClass) {
    if (edgeClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return this.edgeContext.unwrapEdge(edgeClass);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomEdge(Class<T> edgeClass) {
    T edge = this.edgeContext.bottomEdge(edgeClass);
    if (edge == null && edgeClass.isAssignableFrom(this.getClass())) {
      edge = (T) this;
    }
    return edge;
  }

  protected MeshContext createMeshContext(MeshAddress meshAddress, MeshBinding mesh) {
    return new EdgeTableMesh(this, mesh, meshAddress);
  }

  @Override
  public final EdgeAddress cellAddress() {
    return this.edgeContext.cellAddress();
  }

  @Override
  public final String edgeName() {
    return this.edgeContext.edgeName();
  }

  @Override
  public final Uri meshUri() {
    return Uri.empty();
  }

  @Override
  public Policy policy() {
    return this.edgeContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.edgeContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.edgeContext.stage();
  }

  @Override
  public StoreBinding store() {
    return this.edgeContext.store();
  }

  @Override
  public void openMetaEdge(EdgeBinding edge, NodeBinding metaEdge) {
    if (metaEdge instanceof AgentNode) {
      this.metaNode = (AgentNode) metaEdge;
      this.openMetaLanes(edge, (AgentNode) metaEdge);
    }
    this.edgeContext.openMetaEdge(edge, metaEdge);
  }

  protected void openMetaLanes(EdgeBinding edge, AgentNode metaEdge) {
    this.openReflectLanes(edge, metaEdge);
    this.openLogLanes(edge, metaEdge);
  }

  protected void openReflectLanes(EdgeBinding edge, AgentNode metaEdge) {
    this.metaMeshes = metaEdge.demandMapLane()
                              .keyForm(Uri.form())
                              .valueForm(MeshInfo.form())
                              .observe(new EdgeTableMeshesController(edge));
    metaEdge.openLane(EdgeTable.MESHES_URI, this.metaMeshes);

    this.metaPulse = this.metaNode.demandLane()
                                  .valueForm(EdgePulse.form())
                                  .observe(new EdgeTablePulseController(this));
    this.metaNode.openLane(EdgePulse.PULSE_URI, this.metaPulse);
  }

  protected void openLogLanes(EdgeBinding edge, AgentNode metaEdge) {
    this.metaTraceLog = metaEdge.supplyLane().valueForm(LogEntry.form());
    metaEdge.openLane(LogEntry.TRACE_LOG_URI, this.metaTraceLog);

    this.metaDebugLog = metaEdge.supplyLane().valueForm(LogEntry.form());
    metaEdge.openLane(LogEntry.DEBUG_LOG_URI, this.metaDebugLog);

    this.metaInfoLog = metaEdge.supplyLane().valueForm(LogEntry.form());
    metaEdge.openLane(LogEntry.INFO_LOG_URI, this.metaInfoLog);

    this.metaWarnLog = metaEdge.supplyLane().valueForm(LogEntry.form());
    metaEdge.openLane(LogEntry.WARN_LOG_URI, this.metaWarnLog);

    this.metaErrorLog = metaEdge.supplyLane().valueForm(LogEntry.form());
    metaEdge.openLane(LogEntry.ERROR_LOG_URI, this.metaErrorLog);

    this.metaFailLog = metaEdge.supplyLane().valueForm(LogEntry.form());
    metaEdge.openLane(LogEntry.FAIL_LOG_URI, this.metaFailLog);
  }

  @Override
  public MeshBinding network() {
    return this.network;
  }

  @Override
  public void setNetwork(MeshBinding network) {
    this.network = network;
  }

  @Override
  public HashTrieMap<Uri, MeshBinding> meshes() {
    return EdgeTable.MESHES.get(this);
  }

  @Override
  public MeshBinding getMesh(Uri meshUri) {
    return EdgeTable.MESHES.get(this).get(meshUri);
  }

  @Override
  public MeshBinding openMesh(Uri meshUri) {
    MeshBinding meshBinding = null;
    do {
      final HashTrieMap<Uri, MeshBinding> oldMeshes = EdgeTable.MESHES.get(this);
      final MeshBinding mesh = oldMeshes.get(meshUri);
      if (mesh != null) {
        if (meshBinding != null) {
          // Lost creation race.
          meshBinding.close();
        }
        meshBinding = mesh;
        break;
      } else {
        if (meshBinding == null) {
          final MeshAddress meshAddress = this.cellAddress().meshUri(meshUri);
          meshBinding = this.edgeContext.createMesh(meshAddress);
          if (meshBinding != null) {
            meshBinding = this.edgeContext.injectMesh(meshAddress, meshBinding);
            final MeshContext meshContext = this.createMeshContext(meshAddress, meshBinding);
            meshBinding.setMeshContext(meshContext);
            meshBinding = meshBinding.meshWrapper();
          } else {
            break;
          }
        }
        final HashTrieMap<Uri, MeshBinding> newMeshes = oldMeshes.updated(meshUri, meshBinding);
        if (EdgeTable.MESHES.compareAndSet(this, oldMeshes, newMeshes)) {
          this.activate(meshBinding);
          this.didOpenMesh(meshBinding);
          break;
        }
      }
    } while (true);
    return meshBinding;
  }

  @Override
  public MeshBinding openMesh(Uri meshUri, MeshBinding mesh) {
    MeshBinding meshBinding = null;
    do {
      final HashTrieMap<Uri, MeshBinding> oldMeshes = EdgeTable.MESHES.get(this);
      if (oldMeshes.containsKey(meshUri)) {
        meshBinding = null;
        break;
      } else {
        if (meshBinding == null) {
          final MeshAddress meshAddress = this.cellAddress().meshUri(meshUri);
          meshBinding = this.edgeContext.injectMesh(meshAddress, mesh);
          final MeshContext meshContext = this.createMeshContext(meshAddress, meshBinding);
          meshBinding.setMeshContext(meshContext);
          meshBinding = meshBinding.meshWrapper();
        }
        final HashTrieMap<Uri, MeshBinding> newMeshes = oldMeshes.updated(meshUri, meshBinding);
        if (EdgeTable.MESHES.compareAndSet(this, oldMeshes, newMeshes)) {
          this.activate(meshBinding);
          this.didOpenMesh(meshBinding);
          break;
        }
      }
    } while (true);
    return meshBinding;
  }

  public void closeMesh(Uri meshUri) {
    do {
      final HashTrieMap<Uri, MeshBinding> oldMeshes = EdgeTable.MESHES.get(this);
      final MeshBinding meshBinding = oldMeshes.get(meshUri);
      if (meshBinding != null) {
        final HashTrieMap<Uri, MeshBinding> newMeshes = oldMeshes.removed(meshUri);
        if (EdgeTable.MESHES.compareAndSet(this, oldMeshes, newMeshes)) {
          if (this.network == meshBinding) {
            this.network = null;
          }
          meshBinding.didClose();
          this.didCloseMesh(meshBinding);
          if (newMeshes.isEmpty()) {
            this.close();
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  protected void didOpenMesh(MeshBinding mesh) {
    final DemandMapLane<Uri, MeshInfo> metaMeshes = this.metaMeshes;
    if (metaMeshes != null) {
      metaMeshes.cue(mesh.meshUri());
    }
    EdgeTable.MESH_OPEN_DELTA.incrementAndGet(this);
    this.flushMetrics();
  }

  protected void didCloseMesh(MeshBinding mesh) {
    final DemandMapLane<Uri, MeshInfo> metaMeshes = this.metaMeshes;
    if (metaMeshes != null) {
      metaMeshes.remove(mesh.meshUri());
    }
    EdgeTable.MESH_CLOSE_DELTA.incrementAndGet(this);
    this.flushMetrics();
  }

  @Override
  public void openMetaMesh(MeshBinding mesh, NodeBinding metaMesh) {
    this.edgeContext.openMetaMesh(mesh, metaMesh);
  }

  @Override
  public void openMetaPart(PartBinding part, NodeBinding metaPart) {
    this.edgeContext.openMetaPart(part, metaPart);
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    this.edgeContext.openMetaHost(host, metaHost);
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.edgeContext.openMetaNode(node, metaNode);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.edgeContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.edgeContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.edgeContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    final LinkBinding link = ((DownlinkView) downlink).createDownlinkModel();
    link.setCellContext(this);
    final EdgeBinding edgeBinding = this.bottomEdge(EdgeBinding.class);
    edgeBinding.openUplink(link);
    return link;
  }

  @Override
  public void openDownlink(LinkBinding link) {
    final EdgeBinding edgeBinding = this.bottomEdge(EdgeBinding.class);
    edgeBinding.openUplink(link);
    link.setCellContext(this);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void openUplink(LinkBinding link) {
    MeshBinding meshBinding = this.openMesh(link.meshUri());
    if (meshBinding != null) {
      meshBinding = meshBinding.bottomMesh(MeshBinding.class);
    }
    if (meshBinding != null) {
      meshBinding.openUplink(link);
    } else {
      UplinkError.rejectMeshNotFound(link);
    }
  }

  @Override
  public void pushDown(Push<?> push) {
    this.pushUp(push);
  }

  @Override
  public void pushUp(Push<?> push) {
    final Uri meshUri = push.meshUri();
    MeshBinding meshBinding = this.openMesh(meshUri);
    if (meshBinding != null) {
      meshBinding = meshBinding.bottomMesh(MeshBinding.class);
    }
    if (meshBinding != null) {
      meshBinding.pushUp(push);
    } else {
      push.trap(new EdgeException("unknown mesh: " + meshUri));
    }
  }

  @Override
  public void trace(Object message) {
    final SupplyLane<LogEntry> metaTraceLog = this.metaTraceLog;
    if (metaTraceLog != null) {
      metaTraceLog.push(LogEntry.trace(message));
    }
    this.edgeContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    final SupplyLane<LogEntry> metaDebugLog = this.metaDebugLog;
    if (metaDebugLog != null) {
      metaDebugLog.push(LogEntry.debug(message));
    }
    this.edgeContext.debug(message);
  }

  @Override
  public void info(Object message) {
    final SupplyLane<LogEntry> metaInfoLog = this.metaInfoLog;
    if (metaInfoLog != null) {
      metaInfoLog.push(LogEntry.info(message));
    }
    this.edgeContext.info(message);
  }

  @Override
  public void warn(Object message) {
    final SupplyLane<LogEntry> metaWarnLog = this.metaWarnLog;
    if (metaWarnLog != null) {
      metaWarnLog.push(LogEntry.warn(message));
    }
    this.edgeContext.warn(message);
  }

  @Override
  public void error(Object message) {
    final SupplyLane<LogEntry> metaErrorLog = this.metaErrorLog;
    if (metaErrorLog != null) {
      metaErrorLog.push(LogEntry.error(message));
    }
    this.edgeContext.error(message);
  }

  @Override
  public void fail(Object message) {
    final SupplyLane<LogEntry> metaFailLog = this.metaFailLog;
    if (metaFailLog != null) {
      metaFailLog.push(LogEntry.fail(message));
    }
    this.edgeContext.fail(message);
  }

  @Override
  protected void willOpen() {
    super.willOpen();
    final Iterator<MeshBinding> meshesIterator = EdgeTable.MESHES.get(this).valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().open();
    }
  }

  @Override
  protected void willLoad() {
    super.willLoad();
    final Iterator<MeshBinding> meshesIterator = EdgeTable.MESHES.get(this).valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().load();
    }
  }

  @Override
  protected void willStart() {
    super.willStart();
    final Iterator<MeshBinding> meshesIterator = EdgeTable.MESHES.get(this).valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().start();
    }
  }

  @Override
  protected void willStop() {
    super.willStop();
    final Iterator<MeshBinding> meshesIterator = EdgeTable.MESHES.get(this).valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().stop();
    }
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    final Iterator<MeshBinding> meshesIterator = EdgeTable.MESHES.get(this).valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().unload();
    }
  }

  @Override
  protected void willClose() {
    super.willClose();
    final Iterator<MeshBinding> meshesIterator = EdgeTable.MESHES.get(this).valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().close();
    }
  }

  @Override
  public void didClose() {
    super.didClose();
    final AgentNode metaNode = this.metaNode;
    if (metaNode != null) {
      metaNode.close();
      this.metaNode = null;
      this.metaMeshes = null;
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
    if (metric instanceof MeshProfile) {
      this.accumulateMeshProfile((MeshProfile) metric);
    } else if (metric instanceof WarpDownlinkProfile) {
      this.accumulateWarpDownlinkProfile((WarpDownlinkProfile) metric);
    } else {
      this.edgeContext.reportDown(metric);
    }
  }

  protected void accumulateMeshProfile(MeshProfile profile) {
    EdgeTable.PART_OPEN_DELTA.addAndGet(this, profile.partOpenDelta());
    EdgeTable.PART_CLOSE_DELTA.addAndGet(this, profile.partCloseDelta());
    EdgeTable.HOST_OPEN_DELTA.addAndGet(this, profile.hostOpenDelta());
    EdgeTable.HOST_CLOSE_DELTA.addAndGet(this, profile.hostCloseDelta());
    EdgeTable.NODE_OPEN_DELTA.addAndGet(this, profile.nodeOpenDelta());
    EdgeTable.NODE_CLOSE_DELTA.addAndGet(this, profile.nodeCloseDelta());
    EdgeTable.AGENT_OPEN_DELTA.addAndGet(this, profile.agentOpenDelta());
    EdgeTable.AGENT_CLOSE_DELTA.addAndGet(this, profile.agentCloseDelta());
    EdgeTable.AGENT_EXEC_DELTA.addAndGet(this, profile.agentExecDelta());
    EdgeTable.AGENT_EXEC_RATE.addAndGet(this, profile.agentExecRate());
    EdgeTable.TIMER_EVENT_DELTA.addAndGet(this, profile.timerEventDelta());
    EdgeTable.TIMER_EVENT_RATE.addAndGet(this, profile.timerEventRate());
    EdgeTable.DOWNLINK_OPEN_DELTA.addAndGet(this, profile.downlinkOpenDelta());
    EdgeTable.DOWNLINK_CLOSE_DELTA.addAndGet(this, profile.downlinkCloseDelta());
    EdgeTable.DOWNLINK_EVENT_DELTA.addAndGet(this, profile.downlinkEventDelta());
    EdgeTable.DOWNLINK_EVENT_RATE.addAndGet(this, profile.downlinkEventRate());
    EdgeTable.DOWNLINK_COMMAND_DELTA.addAndGet(this, profile.downlinkCommandDelta());
    EdgeTable.DOWNLINK_COMMAND_RATE.addAndGet(this, profile.downlinkCommandRate());
    EdgeTable.UPLINK_OPEN_DELTA.addAndGet(this, profile.uplinkOpenDelta());
    EdgeTable.UPLINK_CLOSE_DELTA.addAndGet(this, profile.uplinkCloseDelta());
    EdgeTable.UPLINK_EVENT_DELTA.addAndGet(this, profile.uplinkEventDelta());
    EdgeTable.UPLINK_EVENT_RATE.addAndGet(this, profile.uplinkEventRate());
    EdgeTable.UPLINK_COMMAND_DELTA.addAndGet(this, profile.uplinkCommandDelta());
    EdgeTable.UPLINK_COMMAND_RATE.addAndGet(this, profile.uplinkCommandRate());
    this.didUpdateMetrics();
  }

  protected void accumulateWarpDownlinkProfile(WarpDownlinkProfile profile) {
    EdgeTable.DOWNLINK_OPEN_DELTA.addAndGet(this, profile.openDelta());
    EdgeTable.DOWNLINK_CLOSE_DELTA.addAndGet(this, profile.closeDelta());
    EdgeTable.DOWNLINK_EVENT_DELTA.addAndGet(this, profile.eventDelta());
    EdgeTable.DOWNLINK_EVENT_RATE.addAndGet(this, profile.eventRate());
    EdgeTable.DOWNLINK_COMMAND_DELTA.addAndGet(this, profile.commandDelta());
    EdgeTable.DOWNLINK_COMMAND_RATE.addAndGet(this, profile.commandRate());
    this.didUpdateMetrics();
  }

  protected void didUpdateMetrics() {
    do {
      final long newReportTime = System.currentTimeMillis();
      final long oldReportTime = EdgeTable.LAST_REPORT_TIME.get(this);
      final long dt = newReportTime - oldReportTime;
      if (dt >= Metric.REPORT_INTERVAL) {
        if (EdgeTable.LAST_REPORT_TIME.compareAndSet(this, oldReportTime, newReportTime)) {
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
    final long oldReportTime = EdgeTable.LAST_REPORT_TIME.getAndSet(this, newReportTime);
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
    final EdgeProfile profile = this.collectProfile(dt);
    this.edgeContext.reportDown(profile);
  }

  protected EdgeProfile collectProfile(long dt) {
    final int meshOpenDelta = EdgeTable.MESH_OPEN_DELTA.getAndSet(this, 0);
    final long meshOpenCount = EdgeTable.MESH_OPEN_COUNT.addAndGet(this, (long) meshOpenDelta);
    final int meshCloseDelta = EdgeTable.MESH_CLOSE_DELTA.getAndSet(this, 0);
    final long meshCloseCount = EdgeTable.MESH_CLOSE_COUNT.addAndGet(this, (long) meshCloseDelta);

    final int partOpenDelta = EdgeTable.PART_OPEN_DELTA.getAndSet(this, 0);
    final long partOpenCount = EdgeTable.PART_OPEN_COUNT.addAndGet(this, (long) partOpenDelta);
    final int partCloseDelta = EdgeTable.PART_CLOSE_DELTA.getAndSet(this, 0);
    final long partCloseCount = EdgeTable.PART_CLOSE_COUNT.addAndGet(this, (long) partCloseDelta);

    final int hostOpenDelta = EdgeTable.HOST_OPEN_DELTA.getAndSet(this, 0);
    final long hostOpenCount = EdgeTable.HOST_OPEN_COUNT.addAndGet(this, (long) hostOpenDelta);
    final int hostCloseDelta = EdgeTable.HOST_CLOSE_DELTA.getAndSet(this, 0);
    final long hostCloseCount = EdgeTable.HOST_CLOSE_COUNT.addAndGet(this, (long) hostCloseDelta);

    final int nodeOpenDelta = EdgeTable.NODE_OPEN_DELTA.getAndSet(this, 0);
    final long nodeOpenCount = EdgeTable.NODE_OPEN_COUNT.addAndGet(this, (long) nodeOpenDelta);
    final int nodeCloseDelta = EdgeTable.NODE_CLOSE_DELTA.getAndSet(this, 0);
    final long nodeCloseCount = EdgeTable.NODE_CLOSE_COUNT.addAndGet(this, (long) nodeCloseDelta);

    final int agentOpenDelta = EdgeTable.AGENT_OPEN_DELTA.getAndSet(this, 0);
    final long agentOpenCount = EdgeTable.AGENT_OPEN_COUNT.addAndGet(this, (long) agentOpenDelta);
    final int agentCloseDelta = EdgeTable.AGENT_CLOSE_DELTA.getAndSet(this, 0);
    final long agentCloseCount = EdgeTable.AGENT_CLOSE_COUNT.addAndGet(this, (long) agentCloseDelta);
    final long agentExecDelta = EdgeTable.AGENT_EXEC_DELTA.getAndSet(this, 0L);
    final long agentExecRate = EdgeTable.AGENT_EXEC_RATE.getAndSet(this, 0L);
    final long agentExecTime = EdgeTable.AGENT_EXEC_TIME.addAndGet(this, agentExecDelta);

    final int timerEventDelta = EdgeTable.TIMER_EVENT_DELTA.getAndSet(this, 0);
    final int timerEventRate = EdgeTable.TIMER_EVENT_RATE.getAndSet(this, 0);
    final long timerEventCount = EdgeTable.TIMER_EVENT_COUNT.addAndGet(this, (long) timerEventDelta);

    final int downlinkOpenDelta = EdgeTable.DOWNLINK_OPEN_DELTA.getAndSet(this, 0);
    final long downlinkOpenCount = EdgeTable.DOWNLINK_OPEN_COUNT.addAndGet(this, (long) downlinkOpenDelta);
    final int downlinkCloseDelta = EdgeTable.DOWNLINK_CLOSE_DELTA.getAndSet(this, 0);
    final long downlinkCloseCount = EdgeTable.DOWNLINK_CLOSE_COUNT.addAndGet(this, (long) downlinkCloseDelta);
    final int downlinkEventDelta = EdgeTable.DOWNLINK_EVENT_DELTA.getAndSet(this, 0);
    final int downlinkEventRate = EdgeTable.DOWNLINK_EVENT_RATE.getAndSet(this, 0);
    final long downlinkEventCount = EdgeTable.DOWNLINK_EVENT_COUNT.addAndGet(this, (long) downlinkEventDelta);
    final int downlinkCommandDelta = EdgeTable.DOWNLINK_COMMAND_DELTA.getAndSet(this, 0);
    final int downlinkCommandRate = EdgeTable.DOWNLINK_COMMAND_RATE.getAndSet(this, 0);
    final long downlinkCommandCount = EdgeTable.DOWNLINK_COMMAND_COUNT.addAndGet(this, (long) downlinkCommandDelta);

    final int uplinkOpenDelta = EdgeTable.UPLINK_OPEN_DELTA.getAndSet(this, 0);
    final long uplinkOpenCount = EdgeTable.UPLINK_OPEN_COUNT.addAndGet(this, (long) uplinkOpenDelta);
    final int uplinkCloseDelta = EdgeTable.UPLINK_CLOSE_DELTA.getAndSet(this, 0);
    final long uplinkCloseCount = EdgeTable.UPLINK_CLOSE_COUNT.addAndGet(this, (long) uplinkCloseDelta);
    final int uplinkEventDelta = EdgeTable.UPLINK_EVENT_DELTA.getAndSet(this, 0);
    final int uplinkEventRate = EdgeTable.UPLINK_EVENT_RATE.getAndSet(this, 0);
    final long uplinkEventCount = EdgeTable.UPLINK_EVENT_COUNT.addAndGet(this, (long) uplinkEventDelta);
    final int uplinkCommandDelta = EdgeTable.UPLINK_COMMAND_DELTA.getAndSet(this, 0);
    final int uplinkCommandRate = EdgeTable.UPLINK_COMMAND_RATE.getAndSet(this, 0);
    final long uplinkCommandCount = EdgeTable.UPLINK_COMMAND_COUNT.addAndGet(this, (long) uplinkCommandDelta);

    final int meshCount = (int) (meshOpenCount - meshCloseCount);
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
    this.pulse = new EdgePulse(meshCount, partCount, hostCount, nodeCount, agentPulse, downlinkPulse, uplinkPulse);
    final DemandLane<EdgePulse> metaPulse = this.metaPulse;
    if (metaPulse != null) {
      metaPulse.cue();
    }

    return new EdgeProfile(this.cellAddress(),
                           meshOpenDelta, meshOpenCount, meshCloseDelta, meshCloseCount,
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

  static final Uri MESHES_URI = Uri.parse("meshes");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<EdgeTable, HashTrieMap<Uri, MeshBinding>> MESHES =
      AtomicReferenceFieldUpdater.newUpdater(EdgeTable.class, (Class<HashTrieMap<Uri, MeshBinding>>) (Class<?>) HashTrieMap.class, "meshes");

  static final AtomicIntegerFieldUpdater<EdgeTable> MESH_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "meshOpenDelta");
  static final AtomicLongFieldUpdater<EdgeTable> MESH_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "meshOpenCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> MESH_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "meshCloseDelta");
  static final AtomicLongFieldUpdater<EdgeTable> MESH_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "meshCloseCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> PART_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "partOpenDelta");
  static final AtomicLongFieldUpdater<EdgeTable> PART_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "partOpenCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> PART_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "partCloseDelta");
  static final AtomicLongFieldUpdater<EdgeTable> PART_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "partCloseCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> HOST_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "hostOpenDelta");
  static final AtomicLongFieldUpdater<EdgeTable> HOST_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "hostOpenCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> HOST_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "hostCloseDelta");
  static final AtomicLongFieldUpdater<EdgeTable> HOST_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "hostCloseCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> NODE_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "nodeOpenDelta");
  static final AtomicLongFieldUpdater<EdgeTable> NODE_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "nodeOpenCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> NODE_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "nodeCloseDelta");
  static final AtomicLongFieldUpdater<EdgeTable> NODE_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "nodeCloseCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> AGENT_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "agentOpenDelta");
  static final AtomicLongFieldUpdater<EdgeTable> AGENT_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "agentOpenCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> AGENT_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "agentCloseDelta");
  static final AtomicLongFieldUpdater<EdgeTable> AGENT_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "agentCloseCount");
  static final AtomicLongFieldUpdater<EdgeTable> AGENT_EXEC_DELTA =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "agentExecDelta");
  static final AtomicLongFieldUpdater<EdgeTable> AGENT_EXEC_RATE =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "agentExecRate");
  static final AtomicLongFieldUpdater<EdgeTable> AGENT_EXEC_TIME =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "agentExecTime");
  static final AtomicIntegerFieldUpdater<EdgeTable> TIMER_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "timerEventDelta");
  static final AtomicIntegerFieldUpdater<EdgeTable> TIMER_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "timerEventRate");
  static final AtomicLongFieldUpdater<EdgeTable> TIMER_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "timerEventCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> DOWNLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "downlinkOpenDelta");
  static final AtomicLongFieldUpdater<EdgeTable> DOWNLINK_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "downlinkOpenCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> DOWNLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "downlinkCloseDelta");
  static final AtomicLongFieldUpdater<EdgeTable> DOWNLINK_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "downlinkCloseCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> DOWNLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "downlinkEventDelta");
  static final AtomicIntegerFieldUpdater<EdgeTable> DOWNLINK_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "downlinkEventRate");
  static final AtomicLongFieldUpdater<EdgeTable> DOWNLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "downlinkEventCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> DOWNLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "downlinkCommandDelta");
  static final AtomicIntegerFieldUpdater<EdgeTable> DOWNLINK_COMMAND_RATE =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "downlinkCommandRate");
  static final AtomicLongFieldUpdater<EdgeTable> DOWNLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "downlinkCommandCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> UPLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "uplinkOpenDelta");
  static final AtomicLongFieldUpdater<EdgeTable> UPLINK_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "uplinkOpenCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> UPLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "uplinkCloseDelta");
  static final AtomicLongFieldUpdater<EdgeTable> UPLINK_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "uplinkCloseCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> UPLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "uplinkEventDelta");
  static final AtomicIntegerFieldUpdater<EdgeTable> UPLINK_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "uplinkEventRate");
  static final AtomicLongFieldUpdater<EdgeTable> UPLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "uplinkEventCount");
  static final AtomicIntegerFieldUpdater<EdgeTable> UPLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "uplinkCommandDelta");
  static final AtomicIntegerFieldUpdater<EdgeTable> UPLINK_COMMAND_RATE =
      AtomicIntegerFieldUpdater.newUpdater(EdgeTable.class, "uplinkCommandRate");
  static final AtomicLongFieldUpdater<EdgeTable> UPLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "uplinkCommandCount");
  static final AtomicLongFieldUpdater<EdgeTable> LAST_REPORT_TIME =
      AtomicLongFieldUpdater.newUpdater(EdgeTable.class, "lastReportTime");

}

final class EdgeTableMeshesController implements OnCueKey<Uri, MeshInfo>, OnSyncKeys<Uri> {

  final EdgeBinding edge;

  EdgeTableMeshesController(EdgeBinding edge) {
    this.edge = edge;
  }

  @Override
  public MeshInfo onCue(Uri meshUri, WarpUplink uplink) {
    final MeshBinding meshBinding = this.edge.getMesh(meshUri);
    if (meshBinding != null) {
      return MeshInfo.create(meshBinding);
    }
    return null;
  }

  @Override
  public Iterator<Uri> onSync(WarpUplink uplink) {
    return this.edge.meshes().keyIterator();
  }

}

final class EdgeTablePulseController implements OnCue<EdgePulse> {

  final EdgeTable edge;

  EdgeTablePulseController(EdgeTable edge) {
    this.edge = edge;
  }

  @Override
  public EdgePulse onCue(WarpUplink uplink) {
    return this.edge.pulse;
  }

}
