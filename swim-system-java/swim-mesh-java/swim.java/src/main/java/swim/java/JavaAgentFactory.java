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

package swim.java;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import swim.api.Lane;
import swim.api.SwimContext;
import swim.api.SwimLane;
import swim.api.SwimResident;
import swim.api.SwimTransient;
import swim.api.agent.AbstractAgentRoute;
import swim.api.agent.Agent;
import swim.api.agent.AgentContext;
import swim.api.agent.AgentException;
import swim.api.http.HttpLane;
import swim.api.lane.CommandLane;
import swim.api.lane.DemandLane;
import swim.api.lane.DemandMapLane;
import swim.api.lane.JoinMapLane;
import swim.api.lane.JoinValueLane;
import swim.api.lane.ListLane;
import swim.api.lane.MapLane;
import swim.api.lane.SpatialLane;
import swim.api.lane.SupplyLane;
import swim.api.lane.ValueLane;
import swim.runtime.http.HttpLaneView;
import swim.runtime.lane.CommandLaneView;
import swim.runtime.lane.DemandLaneView;
import swim.runtime.lane.DemandMapLaneView;
import swim.runtime.lane.JoinMapLaneView;
import swim.runtime.lane.JoinValueLaneView;
import swim.runtime.lane.ListLaneView;
import swim.runtime.lane.MapLaneView;
import swim.runtime.lane.SpatialLaneView;
import swim.runtime.lane.SupplyLaneView;
import swim.runtime.lane.ValueLaneView;
import swim.structure.Form;
import swim.structure.Text;
import swim.structure.Value;
import swim.uri.Uri;

public class JavaAgentFactory<A extends Agent> extends AbstractAgentRoute<A> {
  protected final JavaAgentDef agentDef;
  protected final Class<? extends A> agentClass;
  protected final Constructor<? extends A> constructor;

  protected JavaAgentFactory(JavaAgentDef agentDef, Class<? extends A> agentClass,
                             Constructor<? extends A> constructor) {
    this.agentDef = agentDef;
    this.agentClass = agentClass;
    this.constructor = constructor;
  }

  public JavaAgentFactory(JavaAgentDef agentDef, Class<? extends A> agentClass) {
    this(agentDef, agentClass, reflectConstructor(agentClass));
  }

  public JavaAgentFactory(Class<? extends A> agentClass) {
    this(null, agentClass, reflectConstructor(agentClass));
  }

  public final JavaAgentDef agentDef() {
    return this.agentDef;
  }

  public final Class<? extends A> agentClass() {
    return this.agentClass;
  }

  @Override
  public A createAgent(AgentContext agentContext) {
    final A agent = constructAgent(agentContext);
    reflectLaneFields(this.agentClass, agentContext, agent);
    return agent;
  }

  @Override
  public Value id(Uri nodeUri) {
    final JavaAgentDef agentDef = this.agentDef;
    if (agentDef != null) {
      return this.agentDef.id();
    } else {
      return Text.from(this.agentClass.getName());
    }
  }

  protected A constructAgent(AgentContext agentContext) {
    final Constructor<? extends A> constructor = this.constructor;
    final int parameterCount = constructor.getParameterCount();
    if (parameterCount == 0) {
      return constructAgentWithNoArgs(agentContext, constructor);
    } else if (parameterCount == 1) {
      return constructAgentWithContext(agentContext, constructor);
    } else {
      throw new AgentException(constructor.toString());
    }
  }

  A constructAgentWithNoArgs(AgentContext agentContext, Constructor<? extends A> constructor) {
    SwimContext.setAgentContext(agentContext);
    try {
      constructor.setAccessible(true);
      return constructor.newInstance();
    } catch (ReflectiveOperationException cause) {
      throw new AgentException(cause);
    } finally {
      SwimContext.clear();
    }
  }

  A constructAgentWithContext(AgentContext agentContext, Constructor<? extends A> constructor) {
    SwimContext.setAgentContext(agentContext);
    try {
      constructor.setAccessible(true);
      return constructor.newInstance(agentContext);
    } catch (ReflectiveOperationException cause) {
      throw new AgentException(cause);
    } finally {
      SwimContext.clear();
    }
  }

  static <A extends Agent> Constructor<? extends A> reflectConstructor(Class<? extends A> agentClass) {
    try {
      return agentClass.getDeclaredConstructor(AgentContext.class);
    } catch (NoSuchMethodException error) {
      try {
        return agentClass.getDeclaredConstructor();
      } catch (NoSuchMethodException cause) {
        throw new AgentException(cause);
      }
    }
  }

  static void reflectLaneFields(Class<?> agentClass, AgentContext agentContext, Agent agent) {
    if (agentClass != null) {
      reflectLaneFields(agentClass.getSuperclass(), agentContext, agent);
      final Field[] fields = agentClass.getDeclaredFields();
      for (Field field : fields) {
        if (Lane.class.isAssignableFrom(field.getType())) {
          reflectLaneField(field, agentContext, agent);
        }
      }
    }
  }

  static void reflectLaneField(Field field, AgentContext agentContext, Agent agent) {
    final SwimLane swimLane = field.getAnnotation(SwimLane.class);
    if (swimLane != null) {
      final Lane lane = reflectLaneType(agent, field, field.getGenericType());
      final Uri laneUri = Uri.parse(swimLane.value());
      agentContext.openLane(laneUri, lane);
    }
  }

  static Lane reflectLaneType(Agent agent, Field field, Type type) {
    if (type instanceof ParameterizedType) {
      return reflectParameterizedLaneType(agent, field, (ParameterizedType) type);
    }
    return reflectOtherLaneType(agent, field, type);
  }

  static Lane reflectParameterizedLaneType(Agent agent, Field field, ParameterizedType type) {
    final Type rawType = type.getRawType();
    if (rawType instanceof Class<?>) {
      return reflectLaneTypeArguments(agent, field, (Class<?>) rawType, type.getActualTypeArguments());
    }
    return reflectOtherLaneType(agent, field, type);
  }

  static Lane reflectLaneTypeArguments(Agent agent, Field field, Class<?> type, Type[] arguments) {
    if (CommandLane.class.equals(type)) {
      return reflectCommandLaneType(agent, field, type, arguments);
    } else if (DemandLane.class.equals(type)) {
      return reflectDemandLaneType(agent, field, type, arguments);
    } else if (DemandMapLane.class.equals(type)) {
      return reflectDemandMapLaneType(agent, field, type, arguments);
    } else if (JoinMapLane.class.equals(type)) {
      return reflectJoinMapLaneType(agent, field, type, arguments);
    } else if (JoinValueLane.class.equals(type)) {
      return reflectJoinValueLaneType(agent, field, type, arguments);
    } else if (ListLane.class.equals(type)) {
      return reflectListLaneType(agent, field, type, arguments);
    } else if (MapLane.class.equals(type)) {
      return reflectMapLaneType(agent, field, type, arguments);
    } else if (SpatialLane.class.equals(type)) {
      return reflectSpatialLaneType(agent, field, type, arguments);
    } else if (SupplyLane.class.equals(type)) {
      return reflectSupplyLaneType(agent, field, type, arguments);
    } else if (ValueLane.class.equals(type)) {
      return reflectValueLaneType(agent, field, type, arguments);
    } else if (HttpLane.class.equals(type)) {
      return reflectHttpLaneType(agent, field, type, arguments);
    }
    return reflectOtherLaneType(agent, field, type);
  }

  @SuppressWarnings("unchecked")
  static Lane reflectCommandLaneType(Agent agent, Field field, Class<?> type, Type[] arguments) {
    try {
      field.setAccessible(true);
      Object object = field.get(agent);
      if (object == null) {
        object = agent.agentContext().commandLane();
        field.set(agent, object);
      }
      if (object instanceof CommandLaneView<?>) {
        final CommandLaneView<Object> lane = (CommandLaneView<Object>) object;
        Form<Object> valueForm = lane.valueForm();
        final Type valueType = arguments[0];
        if (valueForm == null && valueType instanceof Class<?>) {
          valueForm = Form.forClass((Class<?>) valueType);
          lane.setValueForm(valueForm);
        }
        return lane;
      }
      return reflectOtherLaneType(agent, field, type);
    } catch (IllegalAccessException cause) {
      throw new AgentException(cause);
    }
  }

  @SuppressWarnings("unchecked")
  static Lane reflectDemandLaneType(Agent agent, Field field, Class<?> type, Type[] arguments) {
    try {
      field.setAccessible(true);
      Object object = field.get(agent);
      if (object == null) {
        object = agent.agentContext().demandLane();
        field.set(agent, object);
      }
      if (object instanceof DemandLaneView<?>) {
        final DemandLaneView<Object> lane = (DemandLaneView<Object>) object;
        Form<Object> valueForm = lane.valueForm();
        final Type valueType = arguments[0];
        if (valueForm == null && valueType instanceof Class<?>) {
          valueForm = Form.forClass((Class<?>) valueType);
          lane.setValueForm(valueForm);
        }
        return lane;
      }
      return reflectOtherLaneType(agent, field, type);
    } catch (IllegalAccessException cause) {
      throw new AgentException(cause);
    }
  }

  @SuppressWarnings("unchecked")
  static Lane reflectDemandMapLaneType(Agent agent, Field field, Class<?> type, Type[] arguments) {
    try {
      field.setAccessible(true);
      Object object = field.get(agent);
      if (object == null) {
        object = agent.agentContext().demandMapLane();
        field.set(agent, object);
      }
      if (object instanceof DemandMapLaneView<?, ?>) {
        final DemandMapLaneView<Object, Object> lane = (DemandMapLaneView<Object, Object>) object;
        Form<Object> keyForm = lane.keyForm();
        final Type keyType = arguments[0];
        if (keyForm == null && keyType instanceof Class<?>) {
          keyForm = Form.forClass((Class<?>) keyType);
          lane.setKeyForm(keyForm);
        }
        Form<Object> valueForm = lane.valueForm();
        final Type valueType = arguments[1];
        if (valueForm == null && valueType instanceof Class<?>) {
          valueForm = Form.forClass((Class<?>) valueType);
          lane.setValueForm(valueForm);
        }
        return lane;
      }
      return reflectOtherLaneType(agent, field, type);
    } catch (IllegalAccessException cause) {
      throw new AgentException(cause);
    }
  }

  @SuppressWarnings("unchecked")
  static Lane reflectJoinMapLaneType(Agent agent, Field field, Class<?> type, Type[] arguments) {
    try {
      field.setAccessible(true);
      Object object = field.get(agent);
      if (object == null) {
        object = agent.agentContext().joinMapLane();
        field.set(agent, object);
      }
      if (object instanceof JoinMapLaneView<?, ?, ?>) {
        final JoinMapLaneView<Object, Object, Object> lane = (JoinMapLaneView<Object, Object, Object>) object;
        Form<Object> linkForm = lane.linkForm();
        final Type linkType = arguments[0];
        if (linkForm == null && linkType instanceof Class<?>) {
          linkForm = Form.forClass((Class<?>) linkType);
          lane.setLinkForm(linkForm);
        }
        Form<Object> keyForm = lane.keyForm();
        final Type keyType = arguments[1];
        if (keyForm == null && keyType instanceof Class<?>) {
          keyForm = Form.forClass((Class<?>) keyType);
          lane.setKeyForm(keyForm);
        }
        Form<Object> valueForm = lane.valueForm();
        final Type valueType = arguments[2];
        if (valueForm == null && valueType instanceof Class<?>) {
          valueForm = Form.forClass((Class<?>) valueType);
          lane.setValueForm(valueForm);
        }
        final SwimResident swimResident = field.getAnnotation(SwimResident.class);
        if (swimResident != null) {
          lane.isResident(swimResident.value());
        }
        final SwimTransient swimTransient = field.getAnnotation(SwimTransient.class);
        if (swimTransient != null) {
          lane.isTransient(swimTransient.value());
        }
        return lane;
      }
      return reflectOtherLaneType(agent, field, type);
    } catch (IllegalAccessException cause) {
      throw new AgentException(cause);
    }
  }

  @SuppressWarnings("unchecked")
  static Lane reflectJoinValueLaneType(Agent agent, Field field, Class<?> type, Type[] arguments) {
    try {
      field.setAccessible(true);
      Object object = field.get(agent);
      if (object == null) {
        object = agent.agentContext().joinValueLane();
        field.set(agent, object);
      }
      if (object instanceof JoinValueLaneView<?, ?>) {
        final JoinValueLaneView<Object, Object> lane = (JoinValueLaneView<Object, Object>) object;
        Form<Object> keyForm = lane.keyForm();
        final Type keyType = arguments[0];
        if (keyForm == null && keyType instanceof Class<?>) {
          keyForm = Form.forClass((Class<?>) keyType);
          lane.setKeyForm(keyForm);
        }
        Form<Object> valueForm = lane.valueForm();
        final Type valueType = arguments[1];
        if (valueForm == null && valueType instanceof Class<?>) {
          valueForm = Form.forClass((Class<?>) valueType);
          lane.setValueForm(valueForm);
        }
        final SwimResident swimResident = field.getAnnotation(SwimResident.class);
        if (swimResident != null) {
          lane.isResident(swimResident.value());
        }
        final SwimTransient swimTransient = field.getAnnotation(SwimTransient.class);
        if (swimTransient != null) {
          lane.isTransient(swimTransient.value());
        }
        return lane;
      }
      return reflectOtherLaneType(agent, field, type);
    } catch (IllegalAccessException cause) {
      throw new AgentException(cause);
    }
  }

  @SuppressWarnings("unchecked")
  static Lane reflectListLaneType(Agent agent, Field field, Class<?> type, Type[] arguments) {
    try {
      field.setAccessible(true);
      Object object = field.get(agent);
      if (object == null) {
        object = agent.agentContext().listLane();
        field.set(agent, object);
      }
      if (object instanceof ListLaneView<?>) {
        final ListLaneView<Object> lane = (ListLaneView<Object>) object;
        Form<Object> valueForm = lane.valueForm();
        final Type valueType = arguments[0];
        if (valueForm == null && valueType instanceof Class<?>) {
          valueForm = Form.forClass((Class<?>) valueType);
          lane.setValueForm(valueForm);
        }
        final SwimResident swimResident = field.getAnnotation(SwimResident.class);
        if (swimResident != null) {
          lane.isResident(swimResident.value());
        }
        final SwimTransient swimTransient = field.getAnnotation(SwimTransient.class);
        if (swimTransient != null) {
          lane.isTransient(swimTransient.value());
        }
        return lane;
      }
      return reflectOtherLaneType(agent, field, type);
    } catch (IllegalAccessException cause) {
      throw new AgentException(cause);
    }
  }

  @SuppressWarnings("unchecked")
  static Lane reflectMapLaneType(Agent agent, Field field, Class<?> type, Type[] arguments) {
    try {
      field.setAccessible(true);
      Object object = field.get(agent);
      if (object == null) {
        object = agent.agentContext().mapLane();
        field.set(agent, object);
      }
      if (object instanceof MapLaneView<?, ?>) {
        final MapLaneView<Object, Object> lane = (MapLaneView<Object, Object>) object;
        Form<Object> keyForm = lane.keyForm();
        final Type keyType = arguments[0];
        if (keyForm == null && keyType instanceof Class<?>) {
          keyForm = Form.forClass((Class<?>) keyType);
          lane.setKeyForm(keyForm);
        }
        Form<Object> valueForm = lane.valueForm();
        final Type valueType = arguments[1];
        if (valueForm == null && valueType instanceof Class<?>) {
          valueForm = Form.forClass((Class<?>) valueType);
          lane.setValueForm(valueForm);
        }
        final SwimResident swimResident = field.getAnnotation(SwimResident.class);
        if (swimResident != null) {
          lane.isResident(swimResident.value());
        }
        final SwimTransient swimTransient = field.getAnnotation(SwimTransient.class);
        if (swimTransient != null) {
          lane.isTransient(swimTransient.value());
        }
        return lane;
      }
      return reflectOtherLaneType(agent, field, type);
    } catch (IllegalAccessException cause) {
      throw new AgentException(cause);
    }
  }

  @SuppressWarnings("unchecked")
  static Lane reflectSpatialLaneType(Agent agent, Field field, Class<?> type, Type[] arguments) {
    try {
      field.setAccessible(true);
      Object object = field.get(agent);
      if (object == null) {
        object = agent.agentContext().geospatialLane();
        field.set(agent, object);
      }
      if (object instanceof SpatialLaneView<?, ?, ?>) {
        final SpatialLaneView<Object, ?, Object> lane = (SpatialLaneView<Object, ?, Object>) object;
        Form<Object> keyForm = lane.keyForm();
        final Type keyType = arguments[0];
        if (keyForm == null && keyType instanceof Class<?>) {
          keyForm = Form.forClass((Class<?>) keyType);
          lane.setKeyForm(keyForm);
        }
        Form<Object> valueForm = lane.valueForm();
        final Type valueType = arguments[2];
        if (valueForm == null && valueType instanceof Class<?>) {
          valueForm = Form.forClass((Class<?>) valueType);
          lane.setValueForm(valueForm);
        }
        final SwimResident swimResident = field.getAnnotation(SwimResident.class);
        if (swimResident != null) {
          lane.isResident(swimResident.value());
        }
        final SwimTransient swimTransient = field.getAnnotation(SwimTransient.class);
        if (swimTransient != null) {
          lane.isTransient(swimTransient.value());
        }
        return lane;
      }
      return reflectOtherLaneType(agent, field, type);
    } catch (IllegalAccessException cause) {
      throw new AgentException(cause);
    }
  }

  @SuppressWarnings("unchecked")
  static Lane reflectSupplyLaneType(Agent agent, Field field, Class<?> type, Type[] arguments) {
    try {
      field.setAccessible(true);
      Object object = field.get(agent);
      if (object == null) {
        object = agent.agentContext().supplyLane();
        field.set(agent, object);
      }
      if (object instanceof SupplyLaneView<?>) {
        final SupplyLaneView<Object> lane = (SupplyLaneView<Object>) object;
        Form<Object> valueForm = lane.valueForm();
        final Type valueType = arguments[0];
        if (valueForm == null && valueType instanceof Class<?>) {
          valueForm = Form.forClass((Class<?>) valueType);
          lane.setValueForm(valueForm);
        }
        return lane;
      }
      return reflectOtherLaneType(agent, field, type);
    } catch (IllegalAccessException cause) {
      throw new AgentException(cause);
    }
  }

  @SuppressWarnings("unchecked")
  static Lane reflectValueLaneType(Agent agent, Field field, Class<?> type, Type[] arguments) {
    try {
      field.setAccessible(true);
      Object object = field.get(agent);
      if (object == null) {
        object = agent.agentContext().valueLane();
        field.set(agent, object);
      }
      if (object instanceof ValueLaneView<?>) {
        final ValueLaneView<Object> lane = (ValueLaneView<Object>) object;
        Form<Object> valueForm = lane.valueForm();
        final Type valueType = arguments[0];
        if (valueForm == null && valueType instanceof Class<?>) {
          valueForm = Form.forClass((Class<?>) valueType);
          lane.setValueForm(valueForm);
        }
        final SwimResident swimResident = field.getAnnotation(SwimResident.class);
        if (swimResident != null) {
          lane.isResident(swimResident.value());
        }
        final SwimTransient swimTransient = field.getAnnotation(SwimTransient.class);
        if (swimTransient != null) {
          lane.isTransient(swimTransient.value());
        }
        return lane;
      }
      return reflectOtherLaneType(agent, field, type);
    } catch (IllegalAccessException cause) {
      throw new AgentException(cause);
    }
  }

  @SuppressWarnings("unchecked")
  static Lane reflectHttpLaneType(Agent agent, Field field, Class<?> type, Type[] arguments) {
    try {
      field.setAccessible(true);
      Object object = field.get(agent);
      if (object == null) {
        object = agent.agentContext().httpLane();
        field.set(agent, object);
      }
      if (object instanceof HttpLaneView<?>) {
        final HttpLaneView<Object> lane = (HttpLaneView<Object>) object;
        // TODO: infer request decoder
        return lane;
      }
      return reflectOtherLaneType(agent, field, type);
    } catch (IllegalAccessException cause) {
      throw new AgentException(cause);
    }
  }

  static Lane reflectOtherLaneType(Agent agent, Field field, Type type) {
    try {
      field.setAccessible(true);
      final Object object = field.get(agent);
      if (object instanceof Lane) {
        return (Lane) object;
      } else {
        throw new AgentException("unknown lane type: " + type);
      }
    } catch (IllegalAccessException cause) {
      throw new AgentException(cause);
    }
  }
}
