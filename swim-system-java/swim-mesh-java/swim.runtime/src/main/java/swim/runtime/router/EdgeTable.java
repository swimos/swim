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
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Downlink;
import swim.api.lane.DemandMapLane;
import swim.api.lane.SupplyLane;
import swim.api.lane.function.OnCueKey;
import swim.api.lane.function.OnSyncMap;
import swim.api.policy.Policy;
import swim.api.warp.WarpUplink;
import swim.collections.HashTrieMap;
import swim.concurrent.Conts;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.AbstractTierBinding;
import swim.runtime.DownlinkView;
import swim.runtime.EdgeAddress;
import swim.runtime.EdgeBinding;
import swim.runtime.EdgeContext;
import swim.runtime.HostBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.MeshAddress;
import swim.runtime.MeshBinding;
import swim.runtime.MeshContext;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.runtime.PushRequest;
import swim.runtime.TierContext;
import swim.runtime.UplinkError;
import swim.runtime.agent.AgentNode;
import swim.runtime.reflect.LogEntry;
import swim.runtime.reflect.MeshInfo;
import swim.store.StoreBinding;
import swim.uri.Uri;

public class EdgeTable extends AbstractTierBinding implements EdgeBinding {
  protected EdgeContext edgeContext;
  volatile HashTrieMap<Uri, MeshBinding> meshes;
  volatile MeshBinding network;

  DemandMapLane<Uri, MeshInfo> metaMeshes;
  SupplyLane<LogEntry> metaTraceLog;
  SupplyLane<LogEntry> metaDebugLog;
  SupplyLane<LogEntry> metaInfoLog;
  SupplyLane<LogEntry> metaWarnLog;
  SupplyLane<LogEntry> metaErrorLog;
  SupplyLane<LogEntry> metaFailLog;

  public EdgeTable() {
    this.meshes = HashTrieMap.empty();
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
    if (edgeClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.edgeContext.unwrapEdge(edgeClass);
    }
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
    openMetaLanes(edge, (AgentNode) metaEdge);
    this.edgeContext.openMetaEdge(edge, metaEdge);
  }

  protected void openMetaLanes(EdgeBinding edge, AgentNode metaEdge) {
    openReflectLanes(edge, metaEdge);
    openLogLanes(edge, metaEdge);
  }

  protected void openReflectLanes(EdgeBinding edge, AgentNode metaEdge) {
    this.metaMeshes = metaEdge.demandMapLane()
        .keyForm(Uri.form())
        .valueForm(MeshInfo.form())
        .observe(new EdgeTableMeshesController(edge));
    metaEdge.openLane(MESHES_URI, this.metaMeshes);
  }

  protected void openLogLanes(EdgeBinding edge, AgentNode metaEdge) {
    this.metaTraceLog = metaEdge.supplyLane()
        .valueForm(LogEntry.form());
    metaEdge.openLane(LogEntry.TRACE_LOG_URI, this.metaTraceLog);

    this.metaDebugLog = metaEdge.supplyLane()
        .valueForm(LogEntry.form());
    metaEdge.openLane(LogEntry.DEBUG_LOG_URI, this.metaDebugLog);

    this.metaInfoLog = metaEdge.supplyLane()
        .valueForm(LogEntry.form());
    metaEdge.openLane(LogEntry.INFO_LOG_URI, this.metaInfoLog);

    this.metaWarnLog = metaEdge.supplyLane()
        .valueForm(LogEntry.form());
    metaEdge.openLane(LogEntry.WARN_LOG_URI, this.metaWarnLog);

    this.metaErrorLog = metaEdge.supplyLane()
        .valueForm(LogEntry.form());
    metaEdge.openLane(LogEntry.ERROR_LOG_URI, this.metaErrorLog);

    this.metaFailLog = metaEdge.supplyLane()
        .valueForm(LogEntry.form());
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
    return this.meshes;
  }

  @Override
  public MeshBinding getMesh(Uri meshUri) {
    return this.meshes.get(meshUri);
  }

  @Override
  public MeshBinding openMesh(Uri meshUri) {
    HashTrieMap<Uri, MeshBinding> oldMeshes;
    HashTrieMap<Uri, MeshBinding> newMeshes;
    MeshBinding meshBinding = null;
    do {
      oldMeshes = this.meshes;
      final MeshBinding mesh = oldMeshes.get(meshUri);
      if (mesh != null) {
        if (meshBinding != null) {
          // Lost creation race.
          meshBinding.close();
        }
        meshBinding = mesh;
        newMeshes = oldMeshes;
        break;
      } else if (meshBinding == null) {
        final MeshAddress meshAddress = cellAddress().meshUri(meshUri);
        meshBinding = this.edgeContext.createMesh(meshAddress);
        if (meshBinding != null) {
          meshBinding = this.edgeContext.injectMesh(meshAddress, meshBinding);
          final MeshContext meshContext = createMeshContext(meshAddress, meshBinding);
          meshBinding.setMeshContext(meshContext);
          meshBinding = meshBinding.meshWrapper();
          newMeshes = oldMeshes.updated(meshUri, meshBinding);
        } else {
          newMeshes = oldMeshes;
          break;
        }
      } else {
        newMeshes = oldMeshes.updated(meshUri, meshBinding);
      }
    } while (oldMeshes != newMeshes && !MESHES.compareAndSet(this, oldMeshes, newMeshes));
    if (oldMeshes != newMeshes) {
      activate(meshBinding);
      final DemandMapLane<Uri, MeshInfo> metaMeshes = this.metaMeshes;
      if (metaMeshes != null) {
        metaMeshes.cue(meshUri);
      }
    }
    return meshBinding;
  }

  @Override
  public MeshBinding openMesh(Uri meshUri, MeshBinding mesh) {
    HashTrieMap<Uri, MeshBinding> oldMeshes;
    HashTrieMap<Uri, MeshBinding> newMeshes;
    MeshBinding meshBinding = null;
    do {
      oldMeshes = this.meshes;
      if (oldMeshes.containsKey(meshUri)) {
        meshBinding = null;
        newMeshes = oldMeshes;
        break;
      } else {
        if (meshBinding == null) {
          final MeshAddress meshAddress = cellAddress().meshUri(meshUri);
          meshBinding = this.edgeContext.injectMesh(meshAddress, mesh);
          final MeshContext meshContext = createMeshContext(meshAddress, meshBinding);
          meshBinding.setMeshContext(meshContext);
          meshBinding = meshBinding.meshWrapper();
        }
        newMeshes = oldMeshes.updated(meshUri, meshBinding);
      }
    } while (oldMeshes != newMeshes && !MESHES.compareAndSet(this, oldMeshes, newMeshes));
    if (meshBinding != null) {
      activate(meshBinding);
      final DemandMapLane<Uri, MeshInfo> metaMeshes = this.metaMeshes;
      if (metaMeshes != null) {
        metaMeshes.cue(meshUri);
      }
    }
    return meshBinding;
  }

  public void closeMesh(Uri meshUri) {
    HashTrieMap<Uri, MeshBinding> oldMeshes;
    HashTrieMap<Uri, MeshBinding> newMeshes;
    MeshBinding meshBinding = null;
    do {
      oldMeshes = this.meshes;
      final MeshBinding mesh = oldMeshes.get(meshUri);
      if (mesh != null) {
        meshBinding = mesh;
        newMeshes = oldMeshes.removed(meshUri);
      } else {
        meshBinding = null;
        newMeshes = oldMeshes;
        break;
      }
    } while (oldMeshes != newMeshes && !MESHES.compareAndSet(this, oldMeshes, newMeshes));
    if (meshBinding != null) {
      if (this.network == meshBinding) {
        this.network = null;
      }
      meshBinding.didClose();
      final DemandMapLane<Uri, MeshInfo> metaMeshes = this.metaMeshes;
      if (metaMeshes != null) {
        metaMeshes.remove(meshUri);
      }
    }
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
    openUplink(link);
    return link;
  }

  @Override
  public void openDownlink(LinkBinding link) {
    openUplink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void openUplink(LinkBinding link) {
    final MeshBinding meshBinding = openMesh(link.meshUri());
    if (meshBinding != null) {
      meshBinding.openUplink(link);
    } else {
      UplinkError.rejectMeshNotFound(link);
    }
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    pushUp(pushRequest);
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    final MeshBinding meshBinding = openMesh(pushRequest.meshUri());
    if (meshBinding != null) {
      meshBinding.pushUp(pushRequest);
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
    final Iterator<MeshBinding> meshesIterator = this.meshes.valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().open();
    }
  }

  @Override
  protected void willLoad() {
    super.willLoad();
    final Iterator<MeshBinding> meshesIterator = this.meshes.valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().load();
    }
  }

  @Override
  protected void willStart() {
    super.willStart();
    final Iterator<MeshBinding> meshesIterator = this.meshes.valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().start();
    }
  }

  @Override
  protected void willStop() {
    super.willStop();
    final Iterator<MeshBinding> meshesIterator = this.meshes.valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().stop();
    }
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    final Iterator<MeshBinding> meshesIterator = this.meshes.valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().unload();
    }
  }

  @Override
  protected void willClose() {
    super.willClose();
    final Iterator<MeshBinding> meshesIterator = this.meshes.valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().close();
    }
  }

  @Override
  public void didClose() {
    // nop
  }

  @Override
  public void didFail(Throwable error) {
    if (Conts.isNonFatal(error)) {
      fail(error);
    } else {
      error.printStackTrace();
    }
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<EdgeTable, HashTrieMap<Uri, MeshBinding>> MESHES =
      AtomicReferenceFieldUpdater.newUpdater(EdgeTable.class, (Class<HashTrieMap<Uri, MeshBinding>>) (Class<?>) HashTrieMap.class, "meshes");

  static final Uri MESHES_URI = Uri.parse("meshes");
}

final class EdgeTableMeshesController implements OnCueKey<Uri, MeshInfo>, OnSyncMap<Uri, MeshInfo> {
  final EdgeBinding edge;

  EdgeTableMeshesController(EdgeBinding edge) {
    this.edge = edge;
  }

  @Override
  public MeshInfo onCue(Uri meshUri, WarpUplink uplink) {
    final MeshBinding meshBinding = this.edge.getMesh(meshUri);
    if (meshBinding == null) {
      return null;
    }
    return MeshInfo.from(meshBinding);
  }

  @Override
  public Iterator<Map.Entry<Uri, MeshInfo>> onSync(WarpUplink uplink) {
    return MeshInfo.iterator(this.edge.meshes().iterator());
  }
}
