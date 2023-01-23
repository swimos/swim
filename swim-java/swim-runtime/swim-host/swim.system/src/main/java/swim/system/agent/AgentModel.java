// Copyright 2015-2023 Swim.inc
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
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicLongFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.SwimContext;
import swim.api.agent.Agent;
import swim.api.agent.AgentFactory;
import swim.api.lane.DemandLane;
import swim.api.lane.DemandMapLane;
import swim.api.lane.SupplyLane;
import swim.api.lane.function.OnCue;
import swim.api.lane.function.OnCueKey;
import swim.api.lane.function.OnSyncKeys;
import swim.api.warp.WarpUplink;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Cont;
import swim.structure.Value;
import swim.system.LaneBinding;
import swim.system.LaneModel;
import swim.system.Metric;
import swim.system.NodeBinding;
import swim.system.NodeContext;
import swim.system.NodeException;
import swim.system.Push;
import swim.system.profile.NodeProfile;
import swim.system.profile.WarpDownlinkProfile;
import swim.system.profile.WarpLaneProfile;
import swim.system.reflect.AgentPulse;
import swim.system.reflect.LaneInfo;
import swim.system.reflect.LogEntry;
import swim.system.reflect.NodePulse;
import swim.system.reflect.WarpDownlinkPulse;
import swim.system.reflect.WarpUplinkPulse;
import swim.uri.Uri;
import swim.util.Builder;

public class AgentModel extends AgentNode {

  protected final Value props;
  volatile Object views; // AgentView | AgentView[]

  volatile int agentOpenDelta;
  volatile int agentOpenCount;
  volatile int agentCloseDelta;
  volatile int agentCloseCount;
  volatile long agentExecDelta;
  volatile long agentExecRate;
  volatile long agentExecTime;
  volatile int timerEventDelta;
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

  NodePulse pulse;
  AgentNode metaNode;
  DemandMapLane<Uri, LaneInfo> metaLanes;
  DemandLane<NodePulse> metaPulse;
  SupplyLane<LogEntry> metaTraceLog;
  SupplyLane<LogEntry> metaDebugLog;
  SupplyLane<LogEntry> metaInfoLog;
  SupplyLane<LogEntry> metaWarnLog;
  SupplyLane<LogEntry> metaErrorLog;
  SupplyLane<LogEntry> metaFailLog;

  public AgentModel(Value props) {
    this.props = props.commit();
    this.views = null;

    this.agentOpenDelta = 0;
    this.agentOpenCount = 0;
    this.agentCloseDelta = 0;
    this.agentCloseCount = 0;
    this.agentExecDelta = 0L;
    this.agentExecRate = 0L;
    this.agentExecTime = 0L;
    this.timerEventDelta = 0;
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
    this.metaLanes = null;
    this.metaPulse = null;
    this.metaTraceLog = null;
    this.metaDebugLog = null;
    this.metaInfoLog = null;
    this.metaWarnLog = null;
    this.metaErrorLog = null;
    this.metaFailLog = null;
  }

  @Override
  public void setNodeContext(NodeContext nodeContext) {
    super.setNodeContext(nodeContext);
  }

  public Value props() {
    return this.props;
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    if (metaNode instanceof AgentNode) {
      this.metaNode = (AgentNode) metaNode;
      this.openMetaLanes(node, (AgentNode) metaNode);
    }
    this.nodeContext.openMetaNode(node, metaNode);
  }

  protected void openMetaLanes(NodeBinding node, AgentNode metaNode) {
    this.openReflectLanes(node, metaNode);
    this.openLogLanes(node, metaNode);
  }

  protected void openReflectLanes(NodeBinding node, AgentNode metaNode) {
    this.metaLanes = metaNode.demandMapLane()
                             .keyForm(Uri.form())
                             .valueForm(LaneInfo.form())
                             .observe(new AgentModelLanesController(node));
    metaNode.openLane(AgentNode.LANES_URI, this.metaLanes);

    this.metaPulse = metaNode.demandLane()
                             .valueForm(NodePulse.form())
                             .observe(new AgentModelPulseController(this));
    metaNode.openLane(NodePulse.PULSE_URI, this.metaPulse);
  }

  protected void openLogLanes(NodeBinding node, AgentNode metaNode) {
    this.metaTraceLog = metaNode.supplyLane().valueForm(LogEntry.form());
    metaNode.openLane(LogEntry.TRACE_LOG_URI, this.metaTraceLog);

    this.metaDebugLog = metaNode.supplyLane().valueForm(LogEntry.form());
    metaNode.openLane(LogEntry.DEBUG_LOG_URI, this.metaDebugLog);

    this.metaInfoLog = metaNode.supplyLane().valueForm(LogEntry.form());
    metaNode.openLane(LogEntry.INFO_LOG_URI, this.metaInfoLog);

    this.metaWarnLog = metaNode.supplyLane().valueForm(LogEntry.form());
    metaNode.openLane(LogEntry.WARN_LOG_URI, this.metaWarnLog);

    this.metaErrorLog = metaNode.supplyLane().valueForm(LogEntry.form());
    metaNode.openLane(LogEntry.ERROR_LOG_URI, this.metaErrorLog);

    this.metaFailLog = metaNode.supplyLane().valueForm(LogEntry.form());
    metaNode.openLane(LogEntry.FAIL_LOG_URI, this.metaFailLog);
  }

  @Override
  public FingerTrieSeq<Value> agentIds() {
    final Builder<Value, FingerTrieSeq<Value>> builder = FingerTrieSeq.builder();
    final Object views = AgentModel.VIEWS.get(this);
    if (views instanceof AgentView) {
      builder.add(((AgentView) views).id);
    } else if (views instanceof AgentView[]) {
      final AgentView[] viewArray = (AgentView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        builder.add(viewArray[i].id);
      }
    }
    return builder.bind();
  }

  @Override
  public FingerTrieSeq<Agent> agents() {
    final Builder<Agent, FingerTrieSeq<Agent>> builder = FingerTrieSeq.builder();
    final Object views = AgentModel.VIEWS.get(this);
    if (views instanceof AgentView) {
      builder.add(((AgentView) views).agent);
    } else if (views instanceof AgentView[]) {
      final AgentView[] viewArray = (AgentView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        builder.add(viewArray[i].agent);
      }
    }
    return builder.bind();
  }

  public AgentView getAgentView(Value id) {
    AgentView view;
    final Object views = AgentModel.VIEWS.get(this);
    if (views instanceof AgentView) {
      view = (AgentView) views;
      if (id.equals(view.id)) {
        return view;
      }
    } else if (views instanceof AgentView[]) {
      final AgentView[] viewArray = (AgentView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        view = viewArray[i];
        if (id.equals(view.id)) {
          return view;
        }
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  public <S extends Agent> S getAgent(Class<S> agentClass) {
    Agent agent;
    final Object views = AgentModel.VIEWS.get(this);
    if (views instanceof AgentView) {
      agent = ((AgentView) views).agent;
      if (agentClass.isInstance(agent)) {
        return (S) agent;
      }
    } else if (views instanceof AgentView[]) {
      final AgentView[] viewArray = (AgentView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        agent = viewArray[i].agent;
        if (agentClass.isInstance(agent)) {
          return (S) agent;
        }
      }
    }
    return null;
  }

  public AgentView addAgentView(AgentView view) {
    do {
      final Object oldViews = AgentModel.VIEWS.get(this);
      final Object newViews;
      if (oldViews instanceof AgentView) {
        final AgentView oldView = (AgentView) oldViews;
        if (view.id.equals(oldView.id)) {
          return oldView;
        } else {
          newViews = new AgentView[] {oldView, view};
        }
      } else if (oldViews instanceof AgentView[]) {
        final AgentView[] oldViewArray = (AgentView[]) oldViews;
        final int n = oldViewArray.length;
        final AgentView[] newViewArray = new AgentView[n + 1];
        for (int i = 0; i < n; i += 1) {
          final AgentView oldView = oldViewArray[i];
          if (view.id.equals(oldView.id)) {
            return oldView;
          }
          newViewArray[i] = oldViewArray[i];
        }
        newViewArray[n] = view;
        newViews = newViewArray;
      } else {
        newViews = view;
      }
      if (AgentModel.VIEWS.compareAndSet(this, oldViews, newViews)) {
        this.activate(view);
        this.didOpenAgent(view);
        return view;
      }
    } while (true);
  }

  public AgentView createAgent(AgentFactory<?> agentFactory, Value id, Value props) {
    final AgentView view = new AgentView(this, id, props);
    final Agent agent;
    try {
      SwimContext.setAgentContext(view);
      agent = agentFactory.createAgent(view);
    } finally {
      SwimContext.clear();
    }
    view.setAgent(agent);
    return view;
  }

  @SuppressWarnings("unchecked")
  public <S extends Agent> S openAgent(Value id, Value props, AgentFactory<S> agentFactory) {
    AgentView view = null;
    do {
      final Object oldViews = AgentModel.VIEWS.get(this);
      final Object newViews;
      if (oldViews instanceof AgentView) {
        final AgentView oldView = (AgentView) oldViews;
        if (id.equals(oldView.id)) {
          return (S) oldView.agent;
        } else {
          if (view == null) {
            view = this.createAgent(agentFactory, id, props);
          }
          newViews = new AgentView[] {oldView, view};
        }
      } else if (oldViews instanceof AgentView[]) {
        final AgentView[] oldViewArray = (AgentView[]) oldViews;
        final int n = oldViewArray.length;
        final AgentView[] newViewArray = new AgentView[n + 1];
        for (int i = 0; i < n; i += 1) {
          final AgentView oldView = oldViewArray[i];
          if (id.equals(oldView.id)) {
            return (S) oldView.agent;
          }
          newViewArray[i] = oldViewArray[i];
        }
        if (view == null) {
          view = this.createAgent(agentFactory, id, props);
        }
        newViewArray[n] = view;
        newViews = newViewArray;
      } else {
        if (view == null) {
          view = this.createAgent(agentFactory, id, props);
        }
        newViews = view;
      }
      if (AgentModel.VIEWS.compareAndSet(this, oldViews, newViews)) {
        this.activate(view);
        this.didOpenAgent(view);
        return (S) view.agent;
      }
    } while (true);
  }

  public void removeAgentView(AgentView view) {
    do {
      final Object oldViews = AgentModel.VIEWS.get(this);
      final Object newViews;
      if (oldViews instanceof AgentView) {
        if (oldViews == view) {
          newViews = null;
        } else {
          break;
        }
      } else if (oldViews instanceof AgentView[]) {
        final AgentView[] oldViewArray = (AgentView[]) oldViews;
        final int n = oldViewArray.length;
        if (n == 2) {
          if (oldViewArray[0] == view) {
            newViews = oldViewArray[1];
          } else if (oldViewArray[1] == view) {
            newViews = oldViewArray[0];
          } else {
            break;
          }
        } else { // n > 2
          final AgentView[] newViewArray = new AgentView[n - 1];
          int i = 0;
          while (i < n) {
            if (oldViewArray[i] != view) {
              if (i < n - 1) {
                newViewArray[i] = oldViewArray[i];
              }
              i += 1;
            } else {
              break;
            }
          }
          if (i < n) {
            System.arraycopy(oldViewArray, i + 1, newViewArray, i, n - (i + 1));
            newViews = newViewArray;
          } else {
            break;
          }
        }
      } else {
        break;
      }
      if (AgentModel.VIEWS.compareAndSet(this, oldViews, newViews)) {
        this.didCloseAgentView(view);
        break;
      }
    } while (true);
  }

  @Override
  protected void didOpenLane(LaneBinding lane) {
    final DemandMapLane<Uri, LaneInfo> metaLanes = this.metaLanes;
    if (metaLanes != null) {
      metaLanes.cue(lane.laneUri());
    }
  }

  @Override
  protected void didCloseLane(LaneBinding lane) {
    final DemandMapLane<Uri, LaneInfo> metaLanes = this.metaLanes;
    if (metaLanes != null) {
      metaLanes.remove(lane.laneUri());
    }
  }

  @Override
  public void pushUp(Push<?> push) {
    this.execute(new AgentModelPushUp(this, push));
  }

  @Override
  public void trace(Object message) {
    final SupplyLane<LogEntry> metaTraceLog = this.metaTraceLog;
    if (metaTraceLog != null) {
      metaTraceLog.push(LogEntry.trace(message));
    }
    super.trace(message);
  }

  @Override
  public void debug(Object message) {
    final SupplyLane<LogEntry> metaDebugLog = this.metaDebugLog;
    if (metaDebugLog != null) {
      metaDebugLog.push(LogEntry.debug(message));
    }
    super.debug(message);
  }

  @Override
  public void info(Object message) {
    final SupplyLane<LogEntry> metaInfoLog = this.metaInfoLog;
    if (metaInfoLog != null) {
      metaInfoLog.push(LogEntry.info(message));
    }
    super.info(message);
  }

  @Override
  public void warn(Object message) {
    final SupplyLane<LogEntry> metaWarnLog = this.metaWarnLog;
    if (metaWarnLog != null) {
      metaWarnLog.push(LogEntry.warn(message));
    }
    super.warn(message);
  }

  @Override
  public void error(Object message) {
    final SupplyLane<LogEntry> metaErrorLog = this.metaErrorLog;
    if (metaErrorLog != null) {
      metaErrorLog.push(LogEntry.error(message));
    }
    super.error(message);
  }

  @Override
  public void fail(Object message) {
    final SupplyLane<LogEntry> metaFailLog = this.metaFailLog;
    if (metaFailLog != null) {
      metaFailLog.push(LogEntry.fail(message));
    }
    super.fail(message);
  }

  protected void didOpenAgent(AgentView view) {
    AgentModel.AGENT_OPEN_DELTA.incrementAndGet(this);
    this.flushMetrics();
  }

  protected void didCloseAgentView(AgentView view) {
    AGENT_CLOSE_DELTA.incrementAndGet(this);
    this.flushMetrics();
  }

  @Override
  protected void willOpen() {
    super.willOpen();
    final Object views = AgentModel.VIEWS.get(this);
    if (views instanceof AgentView) {
      ((AgentView) views).willOpen();
    } else if (views instanceof AgentView[]) {
      final AgentView[] viewArray = (AgentView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        (viewArray[i]).willOpen();
      }
    }
  }

  @Override
  protected void didOpen() {
    super.didOpen();
    final Object views = AgentModel.VIEWS.get(this);
    if (views instanceof AgentView) {
      ((AgentView) views).didOpen();
    } else if (views instanceof AgentView[]) {
      final AgentView[] viewArray = (AgentView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        (viewArray[i]).didOpen();
      }
    }
  }

  @Override
  protected void willLoad() {
    super.willLoad();
    this.execute(new AgentModelWillLoad(this));
  }

  @Override
  protected void didLoad() {
    super.didLoad();
    this.execute(new AgentModelDidLoad(this));
  }

  @Override
  protected void willStart() {
    super.willStart();
    this.execute(new AgentModelWillStart(this));
  }

  @Override
  protected void didStart() {
    super.didStart();
    this.execute(new AgentModelDidStart(this));
  }

  @Override
  protected void willStop() {
    super.willStop();
    this.execute(new AgentModelWillStop(this));
  }

  @Override
  protected void didStop() {
    super.didStop();
    this.execute(new AgentModelDidStop(this));
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    this.execute(new AgentModelWillUnload(this));
  }

  @Override
  protected void didUnload() {
    super.didUnload();
    this.execute(new AgentModelDidUnload(this));
  }

  @Override
  public void willClose() {
    super.willClose();
    this.execute(new AgentModelWillClose(this));
  }

  @Override
  public void didClose() {
    super.didClose();
    this.execute(new AgentModelDidClose(this));

    // Account for remaining agent closure.
    final Object views = AgentModel.VIEWS.get(this);
    if (views instanceof AgentView) {
      AgentModel.AGENT_CLOSE_DELTA.incrementAndGet(this);
    } else if (views instanceof AgentView[]) {
      AgentModel.AGENT_CLOSE_DELTA.addAndGet(this, ((AgentView[]) views).length);
    }

    final AgentNode metaNode = this.metaNode;
    if (metaNode != null) {
      metaNode.close();
      this.metaNode = null;
      this.metaLanes = null;
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
    super.didFail(error);
    final Object views = AgentModel.VIEWS.get(this);
    if (views instanceof AgentView) {
      try {
        ((AgentView) views).didFail(error);
      } catch (Throwable cause) {
        if (Cont.isNonFatal(cause)) {
          cause.printStackTrace();
        } else {
          throw cause;
        }
      }
    } else if (views instanceof AgentView[]) {
      final AgentView[] viewArray = (AgentView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        try {
          viewArray[i].didFail(error);
        } catch (Throwable cause) {
          if (Cont.isNonFatal(cause)) {
            cause.printStackTrace();
          } else {
            throw cause;
          }
        }
      }
    }
  }

  @Override
  public void reportDown(Metric metric) {
    if (metric instanceof WarpLaneProfile) {
      this.accumulateWarpLaneProfile((WarpLaneProfile) metric);
    } else if (metric instanceof WarpDownlinkProfile) {
      this.accumulateWarpDownlinkProfile((WarpDownlinkProfile) metric);
    } else {
      super.reportDown(metric);
    }
  }

  public void accumulateExecTime(long agentExecDelta) {
    AgentModel.AGENT_EXEC_DELTA.addAndGet(this, agentExecDelta);
    this.didUpdateMetrics();
  }

  protected void accumulateWarpLaneProfile(WarpLaneProfile profile) {
    AgentModel.AGENT_EXEC_DELTA.addAndGet(this, profile.execDelta());
    AgentModel.AGENT_EXEC_RATE.addAndGet(this, profile.execRate());
    AgentModel.DOWNLINK_OPEN_DELTA.addAndGet(this, profile.downlinkOpenDelta());
    AgentModel.DOWNLINK_CLOSE_DELTA.addAndGet(this, profile.downlinkCloseDelta());
    AgentModel.DOWNLINK_EVENT_DELTA.addAndGet(this, profile.downlinkEventDelta());
    AgentModel.DOWNLINK_EVENT_RATE.addAndGet(this, profile.downlinkEventRate());
    AgentModel.DOWNLINK_COMMAND_DELTA.addAndGet(this, profile.downlinkCommandDelta());
    AgentModel.DOWNLINK_COMMAND_RATE.addAndGet(this, profile.downlinkCommandRate());
    AgentModel.UPLINK_OPEN_DELTA.addAndGet(this, profile.uplinkOpenDelta());
    AgentModel.UPLINK_CLOSE_DELTA.addAndGet(this, profile.uplinkCloseDelta());
    AgentModel.UPLINK_EVENT_DELTA.addAndGet(this, profile.uplinkEventDelta());
    AgentModel.UPLINK_EVENT_RATE.addAndGet(this, profile.uplinkEventRate());
    AgentModel.UPLINK_COMMAND_DELTA.addAndGet(this, profile.uplinkCommandDelta());
    AgentModel.UPLINK_COMMAND_RATE.addAndGet(this, profile.uplinkCommandRate());
    this.didUpdateMetrics();
  }

  protected void accumulateWarpDownlinkProfile(WarpDownlinkProfile profile) {
    AgentModel.AGENT_EXEC_DELTA.addAndGet(this, profile.execDelta());
    AgentModel.AGENT_EXEC_RATE.addAndGet(this, profile.execRate());
    AgentModel.DOWNLINK_OPEN_DELTA.addAndGet(this, profile.openDelta());
    AgentModel.DOWNLINK_CLOSE_DELTA.addAndGet(this, profile.closeDelta());
    AgentModel.DOWNLINK_EVENT_DELTA.addAndGet(this, profile.eventDelta());
    AgentModel.DOWNLINK_EVENT_RATE.addAndGet(this, profile.eventRate());
    AgentModel.DOWNLINK_COMMAND_DELTA.addAndGet(this, profile.commandDelta());
    AgentModel.DOWNLINK_COMMAND_RATE.addAndGet(this, profile.commandRate());
    this.didUpdateMetrics();
  }

  protected void didUpdateMetrics() {
    do {
      final long newReportTime = System.currentTimeMillis();
      final long oldReportTime = AgentModel.LAST_REPORT_TIME.get(this);
      final long dt = newReportTime - oldReportTime;
      if (dt >= Metric.REPORT_INTERVAL) {
        if (AgentModel.LAST_REPORT_TIME.compareAndSet(this, oldReportTime, newReportTime)) {
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
    final long oldReportTime = AgentModel.LAST_REPORT_TIME.getAndSet(this, newReportTime);
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
    final NodeProfile profile = this.collectProfile(dt);
    this.nodeContext.reportDown(profile);
  }

  protected NodeProfile collectProfile(long dt) {
    final int agentOpenDelta = AgentModel.AGENT_OPEN_DELTA.getAndSet(this, 0);
    final int agentOpenCount = AgentModel.AGENT_OPEN_COUNT.addAndGet(this, agentOpenDelta);
    final int agentCloseDelta = AgentModel.AGENT_CLOSE_DELTA.getAndSet(this, 0);
    final int agentCloseCount = AgentModel.AGENT_CLOSE_COUNT.addAndGet(this, agentCloseDelta);
    final long agentExecDelta = AgentModel.AGENT_EXEC_DELTA.getAndSet(this, 0L);
    final long agentExecRate = AgentModel.AGENT_EXEC_RATE.getAndSet(this, 0L);
    final long agentExecTime = AgentModel.AGENT_EXEC_TIME.addAndGet(this, agentExecDelta);

    final int timerEventDelta = AgentModel.TIMER_EVENT_DELTA.getAndSet(this, 0);
    final int timerEventRate = (int) Math.ceil((1000.0 * (double) timerEventDelta) / (double) dt);
    final long timerEventCount = AgentModel.TIMER_EVENT_COUNT.addAndGet(this, (long) timerEventDelta);

    final int downlinkOpenDelta = AgentModel.DOWNLINK_OPEN_DELTA.getAndSet(this, 0);
    final long downlinkOpenCount = AgentModel.DOWNLINK_OPEN_COUNT.addAndGet(this, (long) downlinkOpenDelta);
    final int downlinkCloseDelta = AgentModel.DOWNLINK_CLOSE_DELTA.getAndSet(this, 0);
    final long downlinkCloseCount = AgentModel.DOWNLINK_CLOSE_COUNT.addAndGet(this, (long) downlinkCloseDelta);
    final int downlinkEventDelta = AgentModel.DOWNLINK_EVENT_DELTA.getAndSet(this, 0);
    final int downlinkEventRate = AgentModel.DOWNLINK_EVENT_RATE.getAndSet(this, 0);
    final long downlinkEventCount = AgentModel.DOWNLINK_EVENT_COUNT.addAndGet(this, (long) downlinkEventDelta);
    final int downlinkCommandDelta = AgentModel.DOWNLINK_COMMAND_DELTA.getAndSet(this, 0);
    final int downlinkCommandRate = AgentModel.DOWNLINK_COMMAND_RATE.getAndSet(this, 0);
    final long downlinkCommandCount = AgentModel.DOWNLINK_COMMAND_COUNT.addAndGet(this, (long) downlinkCommandDelta);

    final int uplinkOpenDelta = AgentModel.UPLINK_OPEN_DELTA.getAndSet(this, 0);
    final long uplinkOpenCount = AgentModel.UPLINK_OPEN_COUNT.addAndGet(this, (long) uplinkOpenDelta);
    final int uplinkCloseDelta = AgentModel.UPLINK_CLOSE_DELTA.getAndSet(this, 0);
    final long uplinkCloseCount = AgentModel.UPLINK_CLOSE_COUNT.addAndGet(this, (long) uplinkCloseDelta);
    final int uplinkEventDelta = AgentModel.UPLINK_EVENT_DELTA.getAndSet(this, 0);
    final int uplinkEventRate = AgentModel.UPLINK_EVENT_RATE.getAndSet(this, 0);
    final long uplinkEventCount = AgentModel.UPLINK_EVENT_COUNT.addAndGet(this, (long) uplinkEventDelta);
    final int uplinkCommandDelta = AgentModel.UPLINK_COMMAND_DELTA.getAndSet(this, 0);
    final int uplinkCommandRate = AgentModel.UPLINK_COMMAND_RATE.getAndSet(this, 0);
    final long uplinkCommandCount = AgentModel.UPLINK_COMMAND_COUNT.addAndGet(this, (long) uplinkCommandDelta);

    final long agentCount = agentOpenCount - agentCloseCount;
    final AgentPulse agentPulse = new AgentPulse(agentCount, agentExecRate, agentExecTime, timerEventRate, timerEventCount);
    final long downlinkCount = downlinkOpenCount - downlinkCloseCount;
    final WarpDownlinkPulse downlinkPulse = new WarpDownlinkPulse(downlinkCount, downlinkEventRate, downlinkEventCount,
                                                                  downlinkCommandRate, downlinkCommandCount);
    final long uplinkCount = uplinkOpenCount - uplinkCloseCount;
    final WarpUplinkPulse uplinkPulse = new WarpUplinkPulse(uplinkCount, uplinkEventRate, uplinkEventCount,
                                                            uplinkCommandRate, uplinkCommandCount);
    this.pulse = new NodePulse(agentPulse, downlinkPulse, uplinkPulse);
    final DemandLane<NodePulse> metaPulse = this.metaPulse;
    if (metaPulse != null) {
      metaPulse.cue();
    }

    return new NodeProfile(cellAddress(), agentOpenDelta, agentOpenCount, agentCloseDelta, agentCloseCount,
                           agentExecDelta, agentExecRate, agentExecTime,
                           timerEventDelta, timerEventRate, timerEventCount,
                           downlinkOpenDelta, downlinkOpenCount, downlinkCloseDelta, downlinkCloseCount,
                           downlinkEventDelta, downlinkEventRate, downlinkEventCount,
                           downlinkCommandDelta, downlinkCommandRate, downlinkCommandCount,
                           uplinkOpenDelta, uplinkOpenCount, uplinkCloseDelta, uplinkCloseCount,
                           uplinkEventDelta, uplinkEventRate, uplinkEventCount,
                           uplinkCommandDelta, uplinkCommandRate, uplinkCommandCount);
  }

  static final AtomicReferenceFieldUpdater<AgentModel, Object> VIEWS =
      AtomicReferenceFieldUpdater.newUpdater(AgentModel.class, Object.class, "views");

  static final AtomicIntegerFieldUpdater<AgentModel> AGENT_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "agentOpenDelta");
  static final AtomicIntegerFieldUpdater<AgentModel> AGENT_OPEN_COUNT =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "agentOpenCount");
  static final AtomicIntegerFieldUpdater<AgentModel> AGENT_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "agentCloseDelta");
  static final AtomicIntegerFieldUpdater<AgentModel> AGENT_CLOSE_COUNT =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "agentCloseCount");
  static final AtomicLongFieldUpdater<AgentModel> AGENT_EXEC_DELTA =
      AtomicLongFieldUpdater.newUpdater(AgentModel.class, "agentExecDelta");
  static final AtomicLongFieldUpdater<AgentModel> AGENT_EXEC_RATE =
      AtomicLongFieldUpdater.newUpdater(AgentModel.class, "agentExecRate");
  static final AtomicLongFieldUpdater<AgentModel> AGENT_EXEC_TIME =
      AtomicLongFieldUpdater.newUpdater(AgentModel.class, "agentExecTime");
  static final AtomicIntegerFieldUpdater<AgentModel> TIMER_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "timerEventDelta");
  static final AtomicLongFieldUpdater<AgentModel> TIMER_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(AgentModel.class, "timerEventCount");
  static final AtomicIntegerFieldUpdater<AgentModel> DOWNLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "downlinkOpenDelta");
  static final AtomicLongFieldUpdater<AgentModel> DOWNLINK_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(AgentModel.class, "downlinkOpenCount");
  static final AtomicIntegerFieldUpdater<AgentModel> DOWNLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "downlinkCloseDelta");
  static final AtomicLongFieldUpdater<AgentModel> DOWNLINK_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(AgentModel.class, "downlinkCloseCount");
  static final AtomicIntegerFieldUpdater<AgentModel> DOWNLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "downlinkEventDelta");
  static final AtomicIntegerFieldUpdater<AgentModel> DOWNLINK_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "downlinkEventRate");
  static final AtomicLongFieldUpdater<AgentModel> DOWNLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(AgentModel.class, "downlinkEventCount");
  static final AtomicIntegerFieldUpdater<AgentModel> DOWNLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "downlinkCommandDelta");
  static final AtomicIntegerFieldUpdater<AgentModel> DOWNLINK_COMMAND_RATE =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "downlinkCommandRate");
  static final AtomicLongFieldUpdater<AgentModel> DOWNLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater(AgentModel.class, "downlinkCommandCount");
  static final AtomicIntegerFieldUpdater<AgentModel> UPLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "uplinkOpenDelta");
  static final AtomicLongFieldUpdater<AgentModel> UPLINK_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(AgentModel.class, "uplinkOpenCount");
  static final AtomicIntegerFieldUpdater<AgentModel> UPLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "uplinkCloseDelta");
  static final AtomicLongFieldUpdater<AgentModel> UPLINK_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(AgentModel.class, "uplinkCloseCount");
  static final AtomicIntegerFieldUpdater<AgentModel> UPLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "uplinkEventDelta");
  static final AtomicIntegerFieldUpdater<AgentModel> UPLINK_EVENT_RATE =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "uplinkEventRate");
  static final AtomicLongFieldUpdater<AgentModel> UPLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(AgentModel.class, "uplinkEventCount");
  static final AtomicIntegerFieldUpdater<AgentModel> UPLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "uplinkCommandDelta");
  static final AtomicIntegerFieldUpdater<AgentModel> UPLINK_COMMAND_RATE =
      AtomicIntegerFieldUpdater.newUpdater(AgentModel.class, "uplinkCommandRate");
  static final AtomicLongFieldUpdater<AgentModel> UPLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater(AgentModel.class, "uplinkCommandCount");
  static final AtomicLongFieldUpdater<AgentModel> LAST_REPORT_TIME =
      AtomicLongFieldUpdater.newUpdater(AgentModel.class, "lastReportTime");

}

final class AgentModelLanesController implements OnCueKey<Uri, LaneInfo>, OnSyncKeys<Uri> {

  final NodeBinding node;

  AgentModelLanesController(NodeBinding node) {
    this.node = node;
  }

  @Override
  public LaneInfo onCue(Uri laneUri, WarpUplink uplink) {
    final LaneBinding laneBinding = this.node.getLane(laneUri);
    if (laneBinding == null) {
      return null;
    }
    return LaneInfo.create(laneBinding);
  }

  @Override
  public Iterator<Uri> onSync(WarpUplink uplink) {
    return this.node.lanes().keyIterator();
  }

}

final class AgentModelPulseController implements OnCue<NodePulse> {

  final AgentModel node;

  AgentModelPulseController(AgentModel node) {
    this.node = node;
  }

  @Override
  public NodePulse onCue(WarpUplink uplink) {
    return this.node.pulse;
  }

}

final class AgentModelPushUp implements Runnable {

  final AgentNode node;
  final Push<?> push;

  AgentModelPushUp(AgentNode node, Push<?> push) {
    this.node = node;
    this.push = push;
  }

  @Override
  public void run() {
    try {
      final Uri laneUri = this.push.laneUri();
      final LaneBinding laneBinding = this.node.getLane(laneUri);
      if (laneBinding != null) {
        final long t0 = System.nanoTime();
        laneBinding.pushUp(this.push);
        final long dt = System.nanoTime() - t0;
        if (laneBinding instanceof LaneModel<?, ?>) {
          ((LaneModel<?, ?>) laneBinding).accumulateExecTime(dt);
        }
      } else {
        this.push.trap(new NodeException("unknown lane: " + laneUri));
      }
    } catch (Throwable error) {
      if (Cont.isNonFatal(error)) {
        this.node.didFail(error);
      } else {
        throw error;
      }
    }
  }

}

abstract class AgentModelCallback implements Runnable {

  final AgentModel model;

  AgentModelCallback(AgentModel model) {
    this.model = model;
  }

  @Override
  public final void run() {
    final long t0 = System.nanoTime();
    final Object views = this.model.views;
    if (views instanceof AgentView) {
      try {
        this.call((AgentView) views);
      } catch (Throwable error) {
        if (Cont.isNonFatal(error)) {
          ((AgentView) views).didFail(error);
        } else {
          throw error;
        }
      }
    } else if (views instanceof AgentView[]) {
      final AgentView[] viewArray = (AgentView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        try {
          this.call(viewArray[i]);
        } catch (Throwable error) {
          if (Cont.isNonFatal(error)) {
            viewArray[i].didFail(error);
          } else {
            throw error;
          }
        }
      }
    }
    final long dt = System.nanoTime() - t0;
    this.model.accumulateExecTime(dt);
  }

  abstract void call(AgentView view);

}

final class AgentModelWillLoad extends AgentModelCallback {

  AgentModelWillLoad(AgentModel model) {
    super(model);
  }

  @Override
  void call(AgentView view) {
    view.willLoad();
  }

}

final class AgentModelDidLoad extends AgentModelCallback {

  AgentModelDidLoad(AgentModel model) {
    super(model);
  }

  @Override
  void call(AgentView view) {
    view.didLoad();
  }

}

final class AgentModelWillStart extends AgentModelCallback {

  AgentModelWillStart(AgentModel model) {
    super(model);
  }

  @Override
  void call(AgentView view) {
    view.willStart();
  }

}

final class AgentModelDidStart extends AgentModelCallback {

  AgentModelDidStart(AgentModel model) {
    super(model);
  }

  @Override
  void call(AgentView view) {
    view.didStart();
  }

}

final class AgentModelWillStop extends AgentModelCallback {

  AgentModelWillStop(AgentModel model) {
    super(model);
  }

  @Override
  void call(AgentView view) {
    view.willStop();
  }

}

final class AgentModelDidStop extends AgentModelCallback {

  AgentModelDidStop(AgentModel model) {
    super(model);
  }

  @Override
  void call(AgentView view) {
    view.didStop();
  }

}

final class AgentModelWillUnload extends AgentModelCallback {

  AgentModelWillUnload(AgentModel model) {
    super(model);
  }

  @Override
  void call(AgentView view) {
    view.willUnload();
  }

}

final class AgentModelDidUnload extends AgentModelCallback {

  AgentModelDidUnload(AgentModel model) {
    super(model);
  }

  @Override
  void call(AgentView view) {
    view.didUnload();
  }

}

final class AgentModelWillClose extends AgentModelCallback {

  AgentModelWillClose(AgentModel model) {
    super(model);
  }

  @Override
  void call(AgentView view) {
    view.willClose();
  }

}

final class AgentModelDidClose extends AgentModelCallback {

  AgentModelDidClose(AgentModel model) {
    super(model);
  }

  @Override
  void call(AgentView view) {
    view.didClose();
  }

}
