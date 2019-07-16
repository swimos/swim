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

import swim.api.agent.Agent;
import swim.api.agent.AgentException;
import swim.api.agent.AgentFactory;
import swim.api.agent.AgentRoute;
import swim.api.plane.Plane;
import swim.api.plane.PlaneException;
import swim.api.plane.PlaneFactory;
import swim.kernel.AgentRouteDef;
import swim.kernel.KernelContext;
import swim.kernel.KernelProxy;
import swim.kernel.PlaneDef;
import swim.structure.Item;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriPattern;

public class JavaKernel extends KernelProxy {
  final double kernelPriority;

  public JavaKernel(double kernelPriority) {
    this.kernelPriority = kernelPriority;
  }

  public JavaKernel() {
    this(KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  @Override
  public PlaneDef definePlane(Item planeConfig) {
    final PlaneDef planeDef = defineJavaPlane(planeConfig);
    return planeDef != null ? planeDef : super.definePlane(planeConfig);
  }

  public JavaPlaneDef defineJavaPlane(Item planeConfig) {
    final Value value = planeConfig.toValue();
    final Value header = value.getAttr("plane");
    if (header.isDefined()) {
      final String planeClassName = header.get("class").stringValue(null);
      if (planeClassName != null) {
        final String planeName = planeConfig.key().stringValue(planeClassName);
        return new JavaPlaneDef(planeName, planeClassName);
      }
    }
    return null;
  }

  @Override
  public PlaneFactory<?> createPlaneFactory(PlaneDef planeDef, ClassLoader classLoader) {
    if (planeDef instanceof JavaPlaneDef) {
      return createJavaPlaneFactory((JavaPlaneDef) planeDef, classLoader);
    } else {
      return super.createPlaneFactory(planeDef, classLoader);
    }
  }

  public JavaPlaneFactory<?> createJavaPlaneFactory(JavaPlaneDef planeDef, ClassLoader classLoader) {
    final String planeClassName = planeDef.className;
    final Class<? extends Plane> planeClass = loadPlaneClass(planeClassName, classLoader);
    final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
    return new JavaPlaneFactory<Plane>(kernel, planeDef, planeClass);
  }

  @SuppressWarnings("unchecked")
  protected Class<? extends Plane> loadPlaneClass(String planeClassName, ClassLoader classLoader) {
    if (classLoader == null) {
      classLoader = getClass().getClassLoader();
    }
    try {
      return (Class<? extends Plane>) Class.forName(planeClassName, true, classLoader);
    } catch (ClassNotFoundException cause) {
      throw new PlaneException(cause);
    }
  }

  @Override
  public <P extends Plane> PlaneFactory<P> createPlaneFactory(Class<? extends P> planeClass) {
    PlaneFactory<P> planeFactory = super.createPlaneFactory(planeClass);
    if (planeFactory == null) {
      final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
      planeFactory = new JavaPlaneFactory<P>(kernel, null, planeClass);
    }
    return planeFactory;
  }

  @Override
  public AgentRouteDef defineAgentRoute(Item agentRouteConfig) {
    final AgentRouteDef agentRouteDef = defineJavaAgentRoute(agentRouteConfig);
    return agentRouteDef != null ? agentRouteDef : super.defineAgentRoute(agentRouteConfig);
  }

  public JavaAgentRouteDef defineJavaAgentRoute(Item agentRouteConfig) {
    final Value value = agentRouteConfig.toValue();
    final Value header = value.getAttr("route");
    if (header.isDefined()) {
      final String agentProvider = header.get("provider").stringValue(null);
      final String agentClassName = value.get("class").stringValue(null);
      if (agentProvider != null && JavaKernel.class.getName().equals(agentProvider)
          || agentProvider == null && agentClassName != null) {
        final String routeName = agentRouteConfig.key().stringValue(agentClassName);
        final UriPattern pattern = value.get("pattern").cast(UriPattern.form());
        return new JavaAgentRouteDef(routeName, agentClassName, pattern);
      }
    }
    return null;
  }

  @Override
  public AgentRoute<?> createAgentRoute(AgentRouteDef agentRouteDef, ClassLoader classLoader) {
    if (agentRouteDef instanceof JavaAgentRouteDef) {
      return createJavaAgentRoute((JavaAgentRouteDef) agentRouteDef, classLoader);
    } else {
      return super.createAgentRoute(agentRouteDef, classLoader);
    }
  }

  public JavaAgentFactory<?> createJavaAgentRoute(JavaAgentRouteDef agentRouteDef, ClassLoader classLoader) {
    final String agentClassName = agentRouteDef.className;
    final Class<? extends Agent> agentClass = loadAgentClass(agentClassName, classLoader);
    return new JavaAgentFactory<Agent>(agentRouteDef, agentClass);
  }

  @Override
  public <A extends Agent> AgentRoute<A> createAgentRoute(String edgeName, Class<? extends A> agentClass) {
    AgentRoute<A> agentRoute = super.createAgentRoute(edgeName, agentClass);
    if (agentRoute == null) {
      agentRoute = new JavaAgentFactory<A>(agentClass);
    }
    return agentRoute;
  }

  @SuppressWarnings("unchecked")
  protected Class<? extends Agent> loadAgentClass(String agentClassName, ClassLoader classLoader) {
    if (classLoader == null) {
      classLoader = getClass().getClassLoader();
    }
    try {
      return (Class<? extends Agent>) Class.forName(agentClassName, true, classLoader);
    } catch (ClassNotFoundException cause) {
      throw new AgentException(cause);
    }
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri,
                                                              Class<? extends A> agentClass) {
    AgentFactory<A> agentFactory = super.createAgentFactory(edgeName, meshUri, partKey, hostUri, nodeUri, agentClass);
    if (agentFactory == null) {
      agentFactory = new JavaAgentFactory<A>(agentClass);
    }
    return agentFactory;
  }

  private static final double KERNEL_PRIORITY = 1.5;

  public static JavaKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || JavaKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(KERNEL_PRIORITY);
      return new JavaKernel(kernelPriority);
    }
    return null;
  }
}
