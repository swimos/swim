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
import swim.api.agent.AgentDef;
import swim.api.agent.AgentException;
import swim.api.agent.AgentFactory;
import swim.api.agent.AgentRoute;
import swim.api.plane.Plane;
import swim.api.plane.PlaneDef;
import swim.api.plane.PlaneException;
import swim.api.plane.PlaneFactory;
import swim.kernel.KernelContext;
import swim.kernel.KernelProxy;
import swim.runtime.EdgeBinding;
import swim.runtime.NodeBinding;
import swim.structure.Item;
import swim.structure.Text;
import swim.structure.Value;

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
  public AgentDef defineAgent(Item agentConfig) {
    final AgentDef agentDef = defineJavaAgent(agentConfig);
    return agentDef != null ? agentDef : super.defineAgent(agentConfig);
  }

  public JavaAgentDef defineJavaAgent(Item agentConfig) {
    final Value value = agentConfig.toValue();
    final Value header = value.getAttr("agent");
    if (header.isDefined()) {
      final String agentClassName = header.get("class").stringValue(null);
      if (agentClassName != null) {
        Value id = agentConfig.key();
        if (!id.isDefined()) {
          id = Text.from(agentClassName);
        }
        final Value props = value.removed("agent");
        return new JavaAgentDef(agentClassName, id, props);
      }
    }
    return null;
  }

  @Override
  public AgentFactory<?> createAgentFactory(AgentDef agentDef, ClassLoader classLoader) {
    if (agentDef instanceof JavaAgentDef) {
      return createJavaAgentFactory((JavaAgentDef) agentDef, classLoader);
    } else {
      return super.createAgentFactory(agentDef, classLoader);
    }
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    if (agentDef instanceof JavaAgentDef) {
      return createJavaAgentFactory((JavaAgentDef) agentDef, null);
    } else {
      return super.createAgentFactory(node, agentDef);
    }
  }

  public JavaAgentFactory<?> createJavaAgentFactory(JavaAgentDef agentDef, ClassLoader classLoader) {
    final String agentClassName = agentDef.className;
    final Class<? extends Agent> agentClass = loadAgentClass(agentClassName, classLoader);
    return new JavaAgentFactory<Agent>(agentDef, agentClass);
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
  public <A extends Agent> AgentFactory<A> createAgentFactory(Class<? extends A> agentClass) {
    AgentFactory<A> agentFactory = super.createAgentFactory(agentClass);
    if (agentFactory == null) {
      agentFactory = new JavaAgentFactory<A>(agentClass);
    }
    return agentFactory;
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    AgentFactory<A> agentFactory = super.createAgentFactory(node, agentClass);
    if (agentFactory == null) {
      agentFactory = new JavaAgentFactory<A>(agentClass);
    }
    return agentFactory;
  }

  @Override
  public <A extends Agent> AgentRoute<A> createAgentRoute(EdgeBinding edge, Class<? extends A> agentClass) {
    AgentRoute<A> agentRoute = super.createAgentRoute(edge, agentClass);
    if (agentRoute == null) {
      agentRoute = new JavaAgentFactory<A>(agentClass);
    }
    return agentRoute;
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
