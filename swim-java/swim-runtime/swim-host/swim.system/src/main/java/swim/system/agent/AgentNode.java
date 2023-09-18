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

package swim.system.agent;

import java.util.Iterator;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Downlink;
import swim.api.Lane;
import swim.api.agent.Agent;
import swim.api.agent.AgentDef;
import swim.api.agent.AgentFactory;
import swim.api.auth.Identity;
import swim.api.http.HttpLane;
import swim.api.lane.CommandLane;
import swim.api.lane.DemandLane;
import swim.api.lane.DemandMapLane;
import swim.api.lane.JoinMapLane;
import swim.api.lane.JoinValueLane;
import swim.api.lane.LaneFactory;
import swim.api.lane.ListLane;
import swim.api.lane.MapLane;
import swim.api.lane.SpatialLane;
import swim.api.lane.SupplyLane;
import swim.api.lane.ValueLane;
import swim.api.policy.Policy;
import swim.api.ws.WsLane;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.concurrent.Call;
import swim.concurrent.Cont;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.concurrent.Task;
import swim.concurrent.TaskContext;
import swim.concurrent.TaskFunction;
import swim.concurrent.TaskRef;
import swim.concurrent.TimerFunction;
import swim.concurrent.TimerRef;
import swim.math.R2Shape;
import swim.math.Z2Form;
import swim.spatial.GeoProjection;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.system.AbstractTierBinding;
import swim.system.CellContext;
import swim.system.HostBinding;
import swim.system.LaneAddress;
import swim.system.LaneBinding;
import swim.system.LaneContext;
import swim.system.LaneView;
import swim.system.LinkBinding;
import swim.system.Metric;
import swim.system.NodeAddress;
import swim.system.NodeBinding;
import swim.system.NodeContext;
import swim.system.NodeException;
import swim.system.Push;
import swim.system.TierContext;
import swim.system.UplinkError;
import swim.system.WarpBinding;
import swim.system.http.RestLaneView;
import swim.system.lane.CommandLaneView;
import swim.system.lane.DemandLaneView;
import swim.system.lane.DemandMapLaneView;
import swim.system.lane.JoinMapLaneView;
import swim.system.lane.JoinValueLaneView;
import swim.system.lane.ListLaneView;
import swim.system.lane.MapLaneView;
import swim.system.lane.SpatialLaneView;
import swim.system.lane.SupplyLaneView;
import swim.system.lane.ValueLaneView;
import swim.uri.Uri;

public class AgentNode extends AbstractTierBinding implements NodeBinding, CellContext, LaneFactory, Schedule, Stage, Task {

  final ConcurrentLinkedQueue<Runnable> mailbox;
  final long createdTime;
  protected NodeContext nodeContext;
  protected TaskContext taskContext;
  volatile HashTrieMap<Uri, LaneBinding> lanes;

  public AgentNode() {
    this.mailbox = new ConcurrentLinkedQueue<Runnable>();
    this.createdTime = System.currentTimeMillis();
    this.nodeContext = null;
    this.taskContext = null;
    this.lanes = HashTrieMap.empty();
  }

  @Override
  public final TierContext tierContext() {
    return this.nodeContext;
  }

  @Override
  public final HostBinding host() {
    return this.nodeContext.host();
  }

  @Override
  public final NodeBinding nodeWrapper() {
    return this;
  }

  @Override
  public final NodeContext nodeContext() {
    return this.nodeContext;
  }

  @Override
  public void setNodeContext(NodeContext nodeContext) {
    this.nodeContext = nodeContext;
    nodeContext.stage().task(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapNode(Class<T> nodeClass) {
    if (nodeClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return this.nodeContext.unwrapNode(nodeClass);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomNode(Class<T> nodeClass) {
    T node = this.nodeContext.bottomNode(nodeClass);
    if (node == null && nodeClass.isAssignableFrom(this.getClass())) {
      node = (T) this;
    }
    return node;
  }

  @Override
  public final TaskContext taskContext() {
    return this.taskContext;
  }

  @Override
  public void setTaskContext(TaskContext taskContext) {
    this.taskContext = taskContext;
  }

  protected LaneContext createLaneContext(LaneAddress laneAddress, LaneBinding lane) {
    return new AgentLane(this, lane, laneAddress);
  }

  @Override
  public NodeAddress cellAddress() {
    return this.nodeContext.cellAddress();
  }

  @Override
  public final String edgeName() {
    return this.nodeContext.edgeName();
  }

  @Override
  public final Uri meshUri() {
    return this.nodeContext.meshUri();
  }

  @Override
  public final Value partKey() {
    return this.nodeContext.partKey();
  }

  @Override
  public final Uri hostUri() {
    return this.nodeContext.hostUri();
  }

  @Override
  public final Uri nodeUri() {
    return this.nodeContext.nodeUri();
  }

  @Override
  public long createdTime() {
    return this.createdTime;
  }

  public final Identity identity() {
    return this.nodeContext.identity();
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.nodeContext.openMetaNode(node, metaNode);
  }

  @Override
  public void openLanes(NodeBinding node) {
    this.nodeContext.openLanes(node);
  }

  @Override
  public FingerTrieSeq<Value> agentIds() {
    return FingerTrieSeq.empty();
  }

  @Override
  public FingerTrieSeq<Agent> agents() {
    return FingerTrieSeq.empty();
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return this.nodeContext.createAgentFactory(node, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return this.nodeContext.createAgentFactory(node, agentClass);
  }

  @Override
  public void openAgents(NodeBinding node) {
    this.nodeContext.openAgents(node);
  }

  @Override
  public HashTrieMap<Uri, LaneBinding> lanes() {
    return AgentNode.LANES.get(this);
  }

  @Override
  public LaneBinding getLane(Uri laneUri) {
    laneUri = AgentNode.normalizedLaneUri(laneUri);
    return AgentNode.LANES.get(this).get(laneUri);
  }

  public LaneBinding openLaneView(Uri laneUri, LaneView laneView) {
    laneUri = AgentNode.normalizedLaneUri(laneUri);
    LaneBinding laneBinding = null;
    do {
      final HashTrieMap<Uri, LaneBinding> oldLanes = AgentNode.LANES.get(this);
      final LaneBinding lane = oldLanes.get(laneUri);
      if (lane != null) {
        laneBinding = lane;
        laneBinding.openLaneView(laneView);
        break;
      } else {
        if (laneBinding == null) {
          final LaneAddress laneAddress = this.cellAddress().laneUri(laneUri);
          laneBinding = this.nodeContext.injectLane(laneAddress, laneView.createLaneBinding());
          final LaneContext laneContext = this.createLaneContext(laneAddress, laneBinding);
          laneBinding.setLaneContext(laneContext);
          laneBinding = laneBinding.laneWrapper();
        }
        final HashTrieMap<Uri, LaneBinding> newLanes = oldLanes.updated(laneUri, laneBinding);
        if (AgentNode.LANES.compareAndSet(this, oldLanes, newLanes)) {
          laneBinding.openLaneView(laneView);
          this.activate(laneBinding);
          this.didOpenLane(laneBinding);
          break;
        }
      }
    } while (true);
    return laneBinding;
  }

  public LaneBinding openLane(Uri laneUri, Lane lane) {
    return this.openLaneView(laneUri, (LaneView) lane);
  }

  @Override
  public LaneBinding openLane(Uri laneUri) {
    laneUri = AgentNode.normalizedLaneUri(laneUri);
    LaneBinding laneBinding = null;
    do {
      final HashTrieMap<Uri, LaneBinding> oldLanes = AgentNode.LANES.get(this);
      final LaneBinding lane = oldLanes.get(laneUri);
      if (lane != null) {
        if (laneBinding != null) {
          // Lost creation race.
          laneBinding.close();
        }
        laneBinding = lane;
        break;
      } else {
        if (laneBinding == null) {
          final LaneAddress laneAddress = this.cellAddress().laneUri(laneUri);
          laneBinding = this.nodeContext.createLane(laneAddress);
          if (laneBinding != null) {
            laneBinding = this.nodeContext.injectLane(laneAddress, laneBinding);
            final LaneContext laneContext = this.createLaneContext(laneAddress, laneBinding);
            laneBinding.setLaneContext(laneContext);
            laneBinding = laneBinding.laneWrapper();
          } else {
            break;
          }
        }
        final HashTrieMap<Uri, LaneBinding> newLanes = oldLanes.updated(laneUri, laneBinding);
        if (AgentNode.LANES.compareAndSet(this, oldLanes, newLanes)) {
          this.activate(laneBinding);
          this.didOpenLane(laneBinding);
          break;
        }
      }
    } while (true);
    return laneBinding;
  }

  @Override
  public LaneBinding openLane(Uri laneUri, LaneBinding lane) {
    laneUri = AgentNode.normalizedLaneUri(laneUri);
    LaneBinding laneBinding = null;
    do {
      final HashTrieMap<Uri, LaneBinding> oldLanes = AgentNode.LANES.get(this);
      if (oldLanes.containsKey(laneUri)) {
        laneBinding = null;
        break;
      } else {
        if (laneBinding == null) {
          final LaneAddress laneAddress = this.cellAddress().laneUri(laneUri);
          laneBinding = this.nodeContext.injectLane(laneAddress, lane);
          final LaneContext laneContext = this.createLaneContext(laneAddress, laneBinding);
          laneBinding.setLaneContext(laneContext);
          laneBinding = laneBinding.laneWrapper();
        }
        final HashTrieMap<Uri, LaneBinding> newLanes = oldLanes.updated(laneUri, laneBinding);
        if (AgentNode.LANES.compareAndSet(this, oldLanes, newLanes)) {
          this.activate(laneBinding);
          this.didOpenLane(laneBinding);
          break;
        }
      }
    } while (true);
    return laneBinding;
  }

  public void closeLane(Uri laneUri) {
    laneUri = AgentNode.normalizedLaneUri(laneUri);
    LaneBinding laneBinding = null;
    do {
      final HashTrieMap<Uri, LaneBinding> oldLanes = AgentNode.LANES.get(this);
      laneBinding = oldLanes.get(laneUri);
      if (laneBinding != null) {
        final HashTrieMap<Uri, LaneBinding> newLanes = oldLanes.removed(laneUri);
        if (AgentNode.LANES.compareAndSet(this, oldLanes, newLanes)) {
          laneBinding.didClose();
          this.didCloseLane(laneBinding);
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  protected void didOpenLane(LaneBinding lane) {
    // hook
  }

  protected void didCloseLane(LaneBinding lane) {
    // hook
  }

  @Override
  public <V> CommandLane<V> commandLane() {
    return new CommandLaneView<V>(null, null);
  }

  @Override
  public <V> DemandLane<V> demandLane() {
    return new DemandLaneView<V>(null, null);
  }

  @Override
  public <K, V> DemandMapLane<K, V> demandMapLane() {
    return new DemandMapLaneView<K, V>(null, null, null);
  }

  @Override
  public <V> HttpLane<V> httpLane() {
    return new RestLaneView<V>(null, null);
  }

  @Override
  public <L, K, V> JoinMapLane<L, K, V> joinMapLane() {
    return new JoinMapLaneView<L, K, V>(null, null, null, null);
  }

  @Override
  public <K, V> JoinValueLane<K, V> joinValueLane() {
    return new JoinValueLaneView<K, V>(null, null, null);
  }

  @Override
  public <V> ListLane<V> listLane() {
    return new ListLaneView<V>(null, null);
  }

  @Override
  public <K, V> MapLane<K, V> mapLane() {
    return new MapLaneView<K, V>(null, null, null);
  }

  @Override
  public <K, S, V> SpatialLane<K, S, V> spatialLane(Z2Form<S> shapeForm) {
    return new SpatialLaneView<K, S, V>(null, null, shapeForm, null);
  }

  @Override
  public <K, V> SpatialLane<K, R2Shape, V> geospatialLane() {
    return new SpatialLaneView<K, R2Shape, V>(null, null, GeoProjection.wgs84Form(), null);
  }

  @Override
  public <V> SupplyLane<V> supplyLane() {
    return new SupplyLaneView<V>(null, null);
  }

  @Override
  public <V> ValueLane<V> valueLane() {
    return new ValueLaneView<V>(null, null);
  }

  @Override
  public <I, O> WsLane<I, O> wsLane() {
    throw new UnsupportedOperationException(); // TODO
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.nodeContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.nodeContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.nodeContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public void openUplink(LinkBinding link) {
    final Uri laneUri = AgentNode.normalizedLaneUri(link.laneUri());
    LaneBinding laneBinding = this.getLane(laneUri);
    if (laneBinding != null) {
      laneBinding = laneBinding.bottomLane(LaneBinding.class);
    }
    if (laneBinding != null) {
      laneBinding.openUplink(link);
    } else if (link instanceof WarpBinding) {
      this.openUnknownUplink(laneUri, link);
    }
  }

  protected void openUnknownUplink(Uri laneUri, LinkBinding link) {
    UplinkError.rejectLaneNotFound(link);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    final LinkBinding link = this.nodeContext.bindDownlink(downlink);
    link.setCellContext(this);
    return link;
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.nodeContext.openDownlink(link);
    link.setCellContext(this);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void pushUp(Push<?> push) {
    final Uri laneUri = push.laneUri();
    LaneBinding laneBinding = this.getLane(laneUri);
    if (laneBinding != null) {
      laneBinding = laneBinding.bottomLane(LaneBinding.class);
    }
    if (laneBinding != null) {
      laneBinding.pushUp(push);
    } else {
      push.trap(new NodeException("unknown lane: " + laneUri));
    }
  }

  @Override
  public void pushDown(Push<?> push) {
    this.nodeContext.pushDown(push);
  }

  @Override
  public void reportDown(Metric metric) {
    this.nodeContext.reportDown(metric);
  }

  @Override
  public void trace(Object message) {
    this.nodeContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.nodeContext.debug(message);
  }

  @Override
  public void info(Object message) {
    this.nodeContext.info(message);
  }

  @Override
  public void warn(Object message) {
    this.nodeContext.warn(message);
  }

  @Override
  public void error(Object message) {
    this.nodeContext.error(message);
  }

  @Override
  public void fail(Object message) {
    this.nodeContext.fail(message);
  }

  @Override
  protected void willOpen() {
    super.willOpen();
    final Iterator<LaneBinding> lanesIterator = AgentNode.LANES.get(this).valueIterator();
    while (lanesIterator.hasNext()) {
      lanesIterator.next().open();
    }
  }

  @Override
  protected void willLoad() {
    super.willLoad();
    final Iterator<LaneBinding> lanesIterator = AgentNode.LANES.get(this).valueIterator();
    while (lanesIterator.hasNext()) {
      lanesIterator.next().load();
    }
  }

  @Override
  protected void willStart() {
    super.willStart();
    final Iterator<LaneBinding> lanesIterator = AgentNode.LANES.get(this).valueIterator();
    while (lanesIterator.hasNext()) {
      lanesIterator.next().start();
    }
  }

  @Override
  protected void willStop() {
    super.willStop();
    final Iterator<LaneBinding> lanesIterator = AgentNode.LANES.get(this).valueIterator();
    while (lanesIterator.hasNext()) {
      lanesIterator.next().stop();
    }
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    final Iterator<LaneBinding> lanesIterator = AgentNode.LANES.get(this).valueIterator();
    while (lanesIterator.hasNext()) {
      lanesIterator.next().unload();
    }
  }

  @Override
  protected void willClose() {
    super.willClose();
    final Iterator<LaneBinding> lanesIterator = AgentNode.LANES.get(this).valueIterator();
    while (lanesIterator.hasNext()) {
      lanesIterator.next().close();
    }
  }

  @Override
  public void didClose() {
    // hook
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
  public Policy policy() {
    return this.nodeContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this;
  }

  @Override
  public Stage stage() {
    return this;
  }

  public Stage asyncStage() {
    return this.nodeContext.stage();
  }

  @Override
  public StoreBinding store() {
    return this.nodeContext.store();
  }

  @Override
  public TimerRef timer(TimerFunction timer) {
    final Schedule schedule = this.nodeContext.schedule();
    final AgentTimer agentTimer = new AgentTimer(this, timer);
    schedule.timer(timer);
    return agentTimer;
  }

  @Override
  public TimerRef setTimer(long millis, TimerFunction timer) {
    final Schedule schedule = this.nodeContext.schedule();
    final AgentTimer agentTimer = new AgentTimer(this, timer);
    schedule.setTimer(millis, agentTimer);
    return agentTimer;
  }

  @Override
  public TaskRef task(TaskFunction task) {
    return this.nodeContext.stage().task(task);
  }

  @Override
  public <T> Call<T> call(Cont<T> future) {
    return this.nodeContext.stage().call(future);
  }

  @Override
  public void execute(Runnable command) {
    this.mailbox.add(command);
    this.taskContext.cue();
  }

  @Override
  public boolean taskWillBlock() {
    return false;
  }

  @Override
  public void runTask() {
    do {
      final Runnable command = this.mailbox.poll();
      if (command != null) {
        try {
          command.run();
        } catch (Throwable error) {
          if (Cont.isNonFatal(error)) {
            this.didFail(error);
          } else {
            throw error;
          }
        }
      } else {
        break;
      }
    } while (true);
  }

  @Override
  public void taskWillCue() {
    // hook
  }

  @Override
  public void taskDidCancel() {
    // hook
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<AgentNode, HashTrieMap<Uri, LaneBinding>> LANES =
      AtomicReferenceFieldUpdater.newUpdater(AgentNode.class, (Class<HashTrieMap<Uri, LaneBinding>>) (Class<?>) HashTrieMap.class, "lanes");

  static final Uri LANES_URI = Uri.parse("lanes");

  protected static Uri normalizedLaneUri(Uri laneUri) {
    if (laneUri.query().isDefined() || laneUri.fragment().isDefined()) {
      laneUri = Uri.create(laneUri.scheme(), laneUri.authority(), laneUri.path());
    }
    return laneUri;
  }

}
