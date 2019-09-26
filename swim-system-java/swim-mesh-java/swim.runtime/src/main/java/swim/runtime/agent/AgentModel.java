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

package swim.runtime.agent;

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.SwimContext;
import swim.api.agent.Agent;
import swim.api.agent.AgentFactory;
import swim.api.lane.SupplyLane;
import swim.concurrent.Conts;
import swim.runtime.LaneBinding;
import swim.runtime.NodeBinding;
import swim.runtime.NodeContext;
import swim.runtime.PushRequest;
import swim.runtime.reflect.LogEntry;
import swim.structure.Value;

public class AgentModel extends AgentNode {
  protected final Value props;
  volatile Object views; // AgentView | AgentView[]

  SupplyLane<LogEntry> metaTraceLog;
  SupplyLane<LogEntry> metaDebugLog;
  SupplyLane<LogEntry> metaInfoLog;
  SupplyLane<LogEntry> metaWarnLog;
  SupplyLane<LogEntry> metaErrorLog;
  SupplyLane<LogEntry> metaFailLog;

  public AgentModel(Value props) {
    this.props = props.commit();
  }

  @Override
  public void setNodeContext(NodeContext nodeContext) {
    super.setNodeContext(nodeContext);
  }

  public Value props() {
    return this.props;
  }

  @Override
  protected void openMetaLanes(NodeBinding node, AgentNode metaNode) {
    super.openMetaLanes(node, metaNode);
    openLogLanes(node, metaNode);
  }

  protected void openLogLanes(NodeBinding node, AgentNode metaNode) {
    this.metaTraceLog = metaNode.supplyLane()
        .valueForm(LogEntry.form());
    metaNode.openLane(LogEntry.TRACE_LOG_URI, this.metaTraceLog);

    this.metaDebugLog = metaNode.supplyLane()
        .valueForm(LogEntry.form());
    metaNode.openLane(LogEntry.DEBUG_LOG_URI, this.metaDebugLog);

    this.metaInfoLog = metaNode.supplyLane()
        .valueForm(LogEntry.form());
    metaNode.openLane(LogEntry.INFO_LOG_URI, this.metaInfoLog);

    this.metaWarnLog = metaNode.supplyLane()
        .valueForm(LogEntry.form());
    metaNode.openLane(LogEntry.WARN_LOG_URI, this.metaWarnLog);

    this.metaErrorLog = metaNode.supplyLane()
        .valueForm(LogEntry.form());
    metaNode.openLane(LogEntry.ERROR_LOG_URI, this.metaErrorLog);

    this.metaFailLog = metaNode.supplyLane()
        .valueForm(LogEntry.form());
    metaNode.openLane(LogEntry.FAIL_LOG_URI, this.metaFailLog);
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

  public AgentView getAgentView(Value id) {
    final Object views = this.views;
    AgentView view;
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
    Object oldViews;
    Object newViews;
    AgentView oldView;
    do {
      oldViews = this.views;
      if (oldViews instanceof AgentView) {
        oldView = (AgentView) oldViews;
        if (view.id.equals(oldView.id)) {
          return oldView;
        } else {
          newViews = new AgentView[]{oldView, view};
        }
      } else if (oldViews instanceof AgentView[]) {
        final AgentView[] oldViewArray = (AgentView[]) oldViews;
        final int n = oldViewArray.length;
        final AgentView[] newViewArray = new AgentView[n + 1];
        for (int i = 0; i < n; i += 1) {
          oldView = oldViewArray[i];
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
    } while (!VIEWS.compareAndSet(this, oldViews, newViews));
    activate(view);
    didAddAgentView(view);
    return view;
  }

  @SuppressWarnings("unchecked")
  public <S extends Agent> S addAgent(Value id, Value props, AgentFactory<S> agentFactory) {
    Object oldViews;
    Object newViews;
    AgentView oldView;
    AgentView view = null;
    do {
      oldViews = this.views;
      if (oldViews instanceof AgentView) {
        oldView = (AgentView) oldViews;
        if (id.equals(oldView.id)) {
          return (S) oldView.agent;
        } else {
          if (view == null) {
            view = createAgent(agentFactory, id, props);
          }
          newViews = new AgentView[]{oldView, view};
        }
      } else if (oldViews instanceof AgentView[]) {
        final AgentView[] oldViewArray = (AgentView[]) oldViews;
        final int n = oldViewArray.length;
        final AgentView[] newViewArray = new AgentView[n + 1];
        for (int i = 0; i < n; i += 1) {
          oldView = oldViewArray[i];
          if (id.equals(oldView.id)) {
            return (S) oldView.agent;
          }
          newViewArray[i] = oldViewArray[i];
        }
        if (view == null) {
          view = createAgent(agentFactory, id, props);
        }
        newViewArray[n] = view;
        newViews = newViewArray;
      } else {
        if (view == null) {
          view = createAgent(agentFactory, id, props);
        }
        newViews = view;
      }
    } while (!VIEWS.compareAndSet(this, oldViews, newViews));
    activate(view);
    didAddAgentView(view);
    return (S) view.agent;
  }

  public void removeAgentView(AgentView view) {
    Object oldViews;
    Object newViews;
    do {
      oldViews = this.views;
      if (oldViews instanceof AgentView) {
        if (oldViews == view) {
          newViews = null;
          continue;
        }
      } else if (oldViews instanceof AgentView[]) {
        final AgentView[] oldViewArray = (AgentView[]) oldViews;
        final int n = oldViewArray.length;
        if (n == 2) {
          if (oldViewArray[0] == view) {
            newViews = oldViewArray[1];
            continue;
          } else if (oldViewArray[1] == view) {
            newViews = oldViewArray[0];
            continue;
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
            continue;
          }
        }
      }
      newViews = oldViews;
      break;
    } while (!VIEWS.compareAndSet(this, oldViews, newViews));
    if (oldViews != newViews) {
      didRemoveAgentView(view);
    }
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    execute(new AgentModelPushUp(this, pushRequest));
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

  protected void didAddAgentView(AgentView view) {
    // stub
  }

  protected void didRemoveAgentView(AgentView view) {
    // stub
  }

  @Override
  protected void willOpen() {
    super.willOpen();
    final Object views = this.views;
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
    final Object views = this.views;
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
    execute(new AgentModelWillLoad(this));
  }

  @Override
  protected void didLoad() {
    super.didLoad();
    execute(new AgentModelDidLoad(this));
  }

  @Override
  protected void willStart() {
    super.willStart();
    execute(new AgentModelWillStart(this));
  }

  @Override
  protected void didStart() {
    super.didStart();
    execute(new AgentModelDidStart(this));
  }

  @Override
  protected void willStop() {
    super.willStop();
    execute(new AgentModelWillStop(this));
  }

  @Override
  protected void didStop() {
    super.didStop();
    execute(new AgentModelDidStop(this));
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    execute(new AgentModelWillUnload(this));
  }

  @Override
  protected void didUnload() {
    super.didUnload();
    execute(new AgentModelDidUnload(this));
  }

  @Override
  public void willClose() {
    super.willClose();
    execute(new AgentModelWillClose(this));
  }

  @Override
  public void didClose() {
    super.didClose();
    execute(new AgentModelDidClose(this));
  }

  @Override
  public void didFail(Throwable error) {
    super.didFail(error);
    final Object views = this.views;
    if (views instanceof AgentView) {
      try {
        ((AgentView) views).didFail(error);
      } catch (Throwable cause) {
        if (Conts.isNonFatal(cause)) {
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
          if (Conts.isNonFatal(cause)) {
            cause.printStackTrace();
          } else {
            throw cause;
          }
        }
      }
    }
  }

  static final AtomicReferenceFieldUpdater<AgentModel, Object> VIEWS =
      AtomicReferenceFieldUpdater.newUpdater(AgentModel.class, Object.class, "views");
}

final class AgentModelPushUp implements Runnable {
  final AgentNode node;
  final PushRequest pushRequest;

  AgentModelPushUp(AgentNode node, PushRequest pushRequest) {
    this.node = node;
    this.pushRequest = pushRequest;
  }

  @Override
  public void run() {
    try {
      final LaneBinding laneBinding = this.node.getLane(this.pushRequest.envelope().laneUri());
      if (laneBinding != null) {
        laneBinding.pushUp(this.pushRequest);
      } else {
        this.pushRequest.didDecline();
      }
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
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
    final Object views = this.model.views;
    if (views instanceof AgentView) {
      try {
        call((AgentView) views);
      } catch (Throwable error) {
        if (Conts.isNonFatal(error)) {
          ((AgentView) views).didFail(error);
        } else {
          throw error;
        }
      }
    } else if (views instanceof AgentView[]) {
      final AgentView[] viewArray = (AgentView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        try {
          call(viewArray[i]);
        } catch (Throwable error) {
          if (Conts.isNonFatal(error)) {
            viewArray[i].didFail(error);
          } else {
            throw error;
          }
        }
      }
    }
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
