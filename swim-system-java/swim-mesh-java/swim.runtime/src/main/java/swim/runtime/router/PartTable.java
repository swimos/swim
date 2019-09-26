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
import swim.runtime.HostAddress;
import swim.runtime.HostBinding;
import swim.runtime.HostContext;
import swim.runtime.HttpBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.MeshBinding;
import swim.runtime.NodeBinding;
import swim.runtime.PartAddress;
import swim.runtime.PartBinding;
import swim.runtime.PartContext;
import swim.runtime.PartPredicate;
import swim.runtime.PushRequest;
import swim.runtime.TierContext;
import swim.runtime.UplinkError;
import swim.runtime.WarpBinding;
import swim.runtime.agent.AgentNode;
import swim.runtime.reflect.HostInfo;
import swim.runtime.reflect.LogEntry;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;

public class PartTable extends AbstractTierBinding implements PartBinding {
  final PartPredicate predicate;
  protected PartContext partContext;
  volatile HashTrieMap<Uri, HostBinding> hosts;
  volatile HashTrieMap<Value, LinkBinding> uplinks;
  volatile HostBinding master;

  DemandMapLane<Uri, HostInfo> metaHosts;
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
    openMetaLanes(part, (AgentNode) metaPart);
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
      final DemandMapLane<Uri, HostInfo> metaHosts = this.metaHosts;
      if (metaHosts != null) {
        metaHosts.cue(hostUri);
      }
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
      final DemandMapLane<Uri, HostInfo> metaHosts = this.metaHosts;
      if (metaHosts != null) {
        metaHosts.cue(hostUri);
      }
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
      final DemandMapLane<Uri, HostInfo> metaHosts = this.metaHosts;
      if (metaHosts != null) {
        metaHosts.remove(hostUri);
      }
    }
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
    return this.partContext.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.partContext.openDownlink(link);
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
  public void pushDown(PushRequest pushRequest) {
    this.partContext.pushDown(pushRequest);
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    final Uri hostUri = pushRequest.hostUri();
    HostBinding hostBinding = null;
    if (!hostUri.isDefined() || hostUri.equals(pushRequest.meshUri())) {
      hostBinding = this.master;
    }
    if (hostBinding == null) {
      hostBinding = openHost(hostUri);
    }
    if (hostBinding != null) {
      hostBinding.pushUp(pushRequest);
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
  static final AtomicReferenceFieldUpdater<PartTable, HashTrieMap<Uri, HostBinding>> HOSTS =
      AtomicReferenceFieldUpdater.newUpdater(PartTable.class, (Class<HashTrieMap<Uri, HostBinding>>) (Class<?>) HashTrieMap.class, "hosts");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<PartTable, HashTrieMap<Value, LinkBinding>> UPLINKS =
      AtomicReferenceFieldUpdater.newUpdater(PartTable.class, (Class<HashTrieMap<Value, LinkBinding>>) (Class<?>) HashTrieMap.class, "uplinks");

  static final Uri HOSTS_URI = Uri.parse("hosts");
}

final class PartTableHostsController implements OnCueKey<Uri, HostInfo>, OnSyncMap<Uri, HostInfo> {
  final PartBinding part;

  PartTableHostsController(PartBinding part) {
    this.part = part;
  }

  @Override
  public HostInfo onCue(Uri hostUri, WarpUplink uplink) {
    final HostBinding hostBinding = this.part.getHost(hostUri);
    if (hostBinding == null) {
      return null;
    }
    return HostInfo.from(hostBinding);
  }

  @Override
  public Iterator<Map.Entry<Uri, HostInfo>> onSync(WarpUplink uplink) {
    return HostInfo.iterator(this.part.hosts().iterator());
  }
}
