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
import swim.runtime.HostAddress;
import swim.runtime.HostBinding;
import swim.runtime.HostContext;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.NodeAddress;
import swim.runtime.NodeBinding;
import swim.runtime.NodeContext;
import swim.runtime.PartBinding;
import swim.runtime.PushRequest;
import swim.runtime.TierContext;
import swim.runtime.UplinkError;
import swim.runtime.agent.AgentNode;
import swim.runtime.reflect.LogEntry;
import swim.runtime.reflect.NodeInfo;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class HostTable extends AbstractTierBinding implements HostBinding {
  protected HostContext hostContext;
  volatile HashTrieMap<Uri, NodeBinding> nodes;
  volatile int flags;

  DemandMapLane<Uri, NodeInfo> metaNodes;
  SupplyLane<LogEntry> metaTraceLog;
  SupplyLane<LogEntry> metaDebugLog;
  SupplyLane<LogEntry> metaInfoLog;
  SupplyLane<LogEntry> metaWarnLog;
  SupplyLane<LogEntry> metaErrorLog;
  SupplyLane<LogEntry> metaFailLog;

  public HostTable() {
    this.nodes = HashTrieMap.empty();
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
    openMetaLanes(host, (AgentNode) metaHost);
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
  public HashTrieMap<Uri, NodeBinding> nodes() {
    return this.nodes;
  }

  @Override
  public NodeBinding getNode(Uri nodeUri) {
    return this.nodes.get(nodeUri);
  }

  @Override
  public NodeBinding openNode(Uri nodeUri) {
    HashTrieMap<Uri, NodeBinding> oldNodes;
    HashTrieMap<Uri, NodeBinding> newNodes;
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
      final DemandMapLane<Uri, NodeInfo> metaNodes = this.metaNodes;
      if (metaNodes != null) {
        metaNodes.cue(nodeUri);
      }
    }
    return nodeBinding;
  }

  @Override
  public NodeBinding openNode(Uri nodeUri, NodeBinding node) {
    HashTrieMap<Uri, NodeBinding> oldNodes;
    HashTrieMap<Uri, NodeBinding> newNodes;
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
      final DemandMapLane<Uri, NodeInfo> metaNodes = this.metaNodes;
      if (metaNodes != null) {
        metaNodes.cue(nodeUri);
      }
    }
    return nodeBinding;
  }

  public void closeNode(Uri nodeUri) {
    HashTrieMap<Uri, NodeBinding> oldNodes;
    HashTrieMap<Uri, NodeBinding> newNodes;
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
      final DemandMapLane<Uri, NodeInfo> metaNodes = this.metaNodes;
      if (metaNodes != null) {
        metaNodes.remove(nodeUri);
      }
    }
  }

  public void closeNodes() {
    HashTrieMap<Uri, NodeBinding> oldNodes;
    final HashTrieMap<Uri, NodeBinding> newNodes = HashTrieMap.empty();
    do {
      oldNodes = this.nodes;
    } while (oldNodes != newNodes && !NODES.compareAndSet(this, oldNodes, newNodes));
    for (NodeBinding nodeBinding : oldNodes.values()) {
      nodeBinding.close();
      nodeBinding.didClose();
      final DemandMapLane<Uri, NodeInfo> metaNodes = this.metaNodes;
      if (metaNodes != null) {
        metaNodes.remove(nodeBinding.nodeUri());
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
    return this.hostContext.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.hostContext.openDownlink(link);
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

  static final int PRIMARY = 1 << 0;
  static final int REPLICA = 1 << 1;
  static final int MASTER = 1 << 2;
  static final int SLAVE = 1 << 3;

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<HostTable, HashTrieMap<Uri, NodeBinding>> NODES =
      AtomicReferenceFieldUpdater.newUpdater(HostTable.class, (Class<HashTrieMap<Uri, NodeBinding>>) (Class<?>) HashTrieMap.class, "nodes");

  static final AtomicIntegerFieldUpdater<HostTable> FLAGS =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "flags");

  static final Uri NODES_URI = Uri.parse("nodes");
}

final class HostTableNodesController implements OnCueKey<Uri, NodeInfo>, OnSyncMap<Uri, NodeInfo> {
  final HostBinding host;

  HostTableNodesController(HostBinding host) {
    this.host = host;
  }

  @Override
  public NodeInfo onCue(Uri nodeUri, WarpUplink uplink) {
    final NodeBinding nodeBinding = this.host.getNode(nodeUri);
    if (nodeBinding == null) {
      return null;
    }
    return NodeInfo.from(nodeBinding);
  }

  @Override
  public Iterator<Map.Entry<Uri, NodeInfo>> onSync(WarpUplink uplink) {
    return NodeInfo.iterator(this.host.nodes().iterator());
  }
}
