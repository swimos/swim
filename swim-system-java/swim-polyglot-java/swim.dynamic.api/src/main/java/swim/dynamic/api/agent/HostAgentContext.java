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

package swim.dynamic.api.agent;

import swim.api.Lane;
import swim.api.agent.AgentContext;
import swim.dynamic.Bridge;
import swim.dynamic.HostMethod;
import swim.dynamic.HostObjectType;
import swim.dynamic.JavaHostObjectType;
import swim.dynamic.api.lane.HostLaneFactory;
import swim.structure.Value;
import swim.uri.Uri;

public final class HostAgentContext {
  private HostAgentContext() {
    // static
  }

  public static final HostObjectType<AgentContext> TYPE;

  static {
    final JavaHostObjectType<AgentContext> type = new JavaHostObjectType<>(AgentContext.class);
    TYPE = type;
    // FIXME: type.inheritType(HostSwimRef.TYPE);
    type.extendType(HostLaneFactory.TYPE);
    // FIXME: type.inheritType(HostStore.TYPE);
    // FIXME: type.inheritType(HostLog.TYPE);
    type.addMember(new HostAgentContextHostUri());
    type.addMember(new HostAgentContextNodeUri());
    type.addMember(new HostAgentContextProps());
    type.addMember(new HostAgentContextGetProp());
    type.addMember(new HostAgentContextSchedule());
    type.addMember(new HostAgentContextStage());
    type.addMember(new HostAgentContextGetLane());
    type.addMember(new HostAgentContextOpenLane());
  }
}

final class HostAgentContextHostUri implements HostMethod<AgentContext> {
  @Override
  public String key() {
    return "hostUri";
  }

  @Override
  public Object invoke(Bridge bridge, AgentContext agentContext, Object... arguments) {
    return agentContext.hostUri();
  }
}

final class HostAgentContextNodeUri implements HostMethod<AgentContext> {
  @Override
  public String key() {
    return "nodeUri";
  }

  @Override
  public Object invoke(Bridge bridge, AgentContext agentContext, Object... arguments) {
    return agentContext.nodeUri();
  }
}

final class HostAgentContextProps implements HostMethod<AgentContext> {
  @Override
  public String key() {
    return "props";
  }

  @Override
  public Object invoke(Bridge bridge, AgentContext agentContext, Object... arguments) {
    return agentContext.props();
  }
}

final class HostAgentContextGetProp implements HostMethod<AgentContext> {
  @Override
  public String key() {
    return "getProp";
  }

  @Override
  public Object invoke(Bridge bridge, AgentContext agentContext, Object... arguments) {
    final Object key = arguments[0];
    if (key instanceof Value) {
      return agentContext.getProp((Value) key);
    } else if (key instanceof String) {
      return agentContext.getProp((String) key);
    } else {
      throw new ClassCastException(key.toString());
    }
  }
}

final class HostAgentContextSchedule implements HostMethod<AgentContext> {
  @Override
  public String key() {
    return "schedule";
  }

  @Override
  public Object invoke(Bridge bridge, AgentContext agentContext, Object... arguments) {
    return agentContext.schedule();
  }
}

final class HostAgentContextStage implements HostMethod<AgentContext> {
  @Override
  public String key() {
    return "stage";
  }

  @Override
  public Object invoke(Bridge bridge, AgentContext agentContext, Object... arguments) {
    return agentContext.stage();
  }
}

final class HostAgentContextGetLane implements HostMethod<AgentContext> {
  @Override
  public String key() {
    return "getLane";
  }

  @Override
  public Object invoke(Bridge bridge, AgentContext agentContext, Object... arguments) {
    Object laneUri = arguments[0];
    if (laneUri == null) {
      throw new NullPointerException();
    }
    if (laneUri instanceof String) {
      laneUri = Uri.parse((String) laneUri);
    }
    return agentContext.getLane((Uri) laneUri);
  }
}

final class HostAgentContextOpenLane implements HostMethod<AgentContext> {
  @Override
  public String key() {
    return "openLane";
  }

  @Override
  public Object invoke(Bridge bridge, AgentContext agentContext, Object... arguments) {
    Object laneUri = arguments[0];
    if (laneUri == null) {
      throw new NullPointerException();
    }
    if (laneUri instanceof String) {
      laneUri = Uri.parse((String) laneUri);
    }
    final Object lane = arguments[1];
    if (lane == null) {
      throw new NullPointerException();
    }
    return agentContext.openLane((Uri) laneUri, (Lane) lane);
  }
}
