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

package swim.java;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import swim.api.SwimAgent;
import swim.api.SwimContext;
import swim.api.SwimRoute;
import swim.api.agent.Agent;
import swim.api.agent.AgentRoute;
import swim.api.plane.Plane;
import swim.api.plane.PlaneContext;
import swim.api.plane.PlaneException;
import swim.api.plane.PlaneFactory;
import swim.kernel.KernelContext;
import swim.uri.UriPattern;

public class JavaPlaneFactory<P extends Plane> implements PlaneFactory<P> {

  protected final KernelContext kernel;
  protected final JavaPlaneDef planeDef;
  protected final Class<? extends P> planeClass;

  public JavaPlaneFactory(KernelContext kernel, JavaPlaneDef planeDef, Class<? extends P> planeClass) {
    this.kernel = kernel;
    this.planeDef = planeDef;
    this.planeClass = planeClass;
  }

  public final KernelContext kernel() {
    return this.kernel;
  }

  public final JavaPlaneDef planeDef() {
    return this.planeDef;
  }

  public final Class<? extends P> planeClass() {
    return this.planeClass;
  }

  @Override
  public P createPlane(PlaneContext planeContext) {
    final P plane = this.constructPlane(planeContext);
    this.reflectAgentRouteFields(planeContext, this.planeClass, plane);
    return plane;
  }

  protected P constructPlane(PlaneContext planeContext) {
    try {
      return this.constructPlaneWithContext(planeContext, this.planeClass.getDeclaredConstructor(PlaneContext.class));
    } catch (NoSuchMethodException error) {
      try {
        return this.constructPlaneWithNoArgs(planeContext, this.planeClass.getDeclaredConstructor());
      } catch (NoSuchMethodException cause) {
        throw new PlaneException(cause);
      }
    }
  }

  P constructPlaneWithContext(PlaneContext planeContext, Constructor<? extends P> constructor) {
    SwimContext.setPlaneContext(planeContext);
    try {
      constructor.setAccessible(true);
      return constructor.newInstance(planeContext);
    } catch (ReflectiveOperationException cause) {
      throw new PlaneException(cause);
    } finally {
      SwimContext.clear();
    }
  }

  P constructPlaneWithNoArgs(PlaneContext planeContext, Constructor<? extends P> constructor) {
    SwimContext.setPlaneContext(planeContext);
    try {
      constructor.setAccessible(true);
      return constructor.newInstance();
    } catch (ReflectiveOperationException cause) {
      throw new PlaneException(cause);
    } finally {
      SwimContext.clear();
    }
  }

  protected void reflectAgentRouteFields(PlaneContext planeContext, Class<?> planeClass, P plane) {
    if (planeClass != null) {
      this.reflectAgentRouteFields(planeContext, planeClass.getSuperclass(), plane);
      final Field[] fields = planeClass.getDeclaredFields();
      for (Field field : fields) {
        if (AgentRoute.class.isAssignableFrom(field.getType())) {
          this.reflectAgentRouteField(planeContext, plane, field);
        }
      }
    }
  }

  protected void reflectAgentRouteField(PlaneContext planeContext, P plane, Field field) {
    final SwimAgent agentAnnotation = field.getAnnotation(SwimAgent.class);
    final SwimRoute routeAnnotation = field.getAnnotation(SwimRoute.class);
    if (agentAnnotation != null || routeAnnotation != null) {
      this.reflectAgentRouteFieldType(planeContext, plane, field, field.getGenericType());
    }
  }

  void reflectAgentRouteFieldType(PlaneContext planeContext, P plane, Field field, Type type) {
    if (type instanceof ParameterizedType) {
      this.reflectAgentRouteFieldTypeParameters(planeContext, plane, field, (ParameterizedType) type);
    } else {
      this.reflectOtherAgentRouteFieldType(planeContext, plane, field, type);
    }
  }

  void reflectAgentRouteFieldTypeParameters(PlaneContext planeContext, P plane, Field field, ParameterizedType type) {
    final Type rawType = type.getRawType();
    if (rawType instanceof Class<?>) {
      this.reflectAgentRouteFieldTypeArguments(planeContext, plane, field, (Class<?>) rawType, type.getActualTypeArguments());
    } else {
      this.reflectOtherAgentRouteFieldType(planeContext, plane, field, type);
    }
  }

  void reflectAgentRouteFieldTypeArguments(PlaneContext planeContext, P plane, Field field, Class<?> type, Type[] arguments) {
    if (AgentRoute.class.equals(type)) {
      this.reflectBaseAgentRouteFieldTypeArgumemnts(planeContext, plane, field, type, arguments);
    } else {
      this.reflectOtherAgentRouteFieldType(planeContext, plane, field, type);
    }
  }

  @SuppressWarnings("unchecked")
  void reflectBaseAgentRouteFieldTypeArgumemnts(PlaneContext planeContext, P plane, Field field, Class<?> type, Type[] arguments) {
    final Type agentType = arguments[0];
    if (agentType instanceof Class<?>) {
      this.reflectBaseAgentRouteFieldReifiedType(planeContext, plane, field, type, (Class<? extends Agent>) agentType);
    } else {
      this.reflectOtherAgentRouteFieldType(planeContext, plane, field, type);
    }
  }

  void reflectBaseAgentRouteFieldReifiedType(PlaneContext planeContext, P plane, Field field, Class<?> type, Class<? extends Agent> agentClass) {
    try {
      field.setAccessible(true);
      Object object = field.get(plane);
      if (object == null) {
        object = planeContext.createAgentRoute(agentClass);
        field.set(plane, object);
      }

      if (object instanceof AgentRoute<?>) {
        final AgentRoute<?> agentRoute = (AgentRoute<?>) object;

        String routeName = null;
        SwimAgent agentAnnotation = field.getAnnotation(SwimAgent.class);
        if (agentAnnotation == null) {
          agentAnnotation = agentClass.getAnnotation(SwimAgent.class);
        }
        if (agentAnnotation != null) {
          routeName = agentAnnotation.value();
        }
        if (routeName == null || routeName.length() == 0) {
          routeName = field.getName();
        }

        UriPattern pattern = null;
        SwimRoute routeAnnotation = field.getAnnotation(SwimRoute.class);
        if (routeAnnotation == null) {
          routeAnnotation = agentClass.getAnnotation(SwimRoute.class);
        }
        if (routeAnnotation != null) {
          pattern = UriPattern.parse(routeAnnotation.value());
        }

        if (pattern != null) {
          planeContext.addAgentRoute(routeName, pattern, agentRoute);
        } else {
          throw new PlaneException("No URI pattern for route: " + routeName);
        }
      } else {
        this.reflectOtherAgentRouteFieldType(planeContext, plane, field, type);
      }
    } catch (IllegalAccessException cause) {
      throw new PlaneException(cause);
    }
  }

  void reflectOtherAgentRouteFieldType(PlaneContext planeContext, P plane, Field field, Type type) {
    try {
      field.setAccessible(true);
      final Object object = field.get(plane);
      if (object instanceof AgentRoute<?>) {
        final AgentRoute<?> agentRoute = (AgentRoute<?>) object;

        String routeName = null;
        final SwimAgent agentAnnotation = field.getAnnotation(SwimAgent.class);
        if (agentAnnotation != null) {
          routeName = agentAnnotation.value();
        }
        if (routeName == null || routeName.length() == 0) {
          routeName = field.getName();
        }

        UriPattern pattern = null;
        final SwimRoute routeAnnotation = field.getAnnotation(SwimRoute.class);
        if (routeAnnotation != null) {
          pattern = UriPattern.parse(routeAnnotation.value());
        }

        if (pattern != null) {
          planeContext.addAgentRoute(routeName, pattern, agentRoute);
        } else {
          throw new PlaneException("No URI pattern for route: " + routeName);
        }
      } else {
        throw new PlaneException("unknown agent route type: " + type);
      }
    } catch (IllegalAccessException cause) {
      throw new PlaneException(cause);
    }
  }

}
