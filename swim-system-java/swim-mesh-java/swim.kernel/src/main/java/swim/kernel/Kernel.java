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

package swim.kernel;

import swim.api.agent.Agent;
import swim.api.agent.AgentDef;
import swim.api.agent.AgentFactory;
import swim.api.plane.Plane;
import swim.api.plane.PlaneDef;
import swim.api.plane.PlaneFactory;
import swim.api.service.Service;
import swim.api.service.ServiceDef;
import swim.api.service.ServiceFactory;
import swim.api.space.Space;
import swim.api.space.SpaceDef;
import swim.structure.Item;

public interface Kernel {
  /**
   * Returns the relative priority of this {@code Kernel} implementation.
   * Kernel implementations with greater priority inject into kernel stacks
   * before implementations with lower priority.
   */
  double kernelPriority();

  /**
   * Returns a {@code Kernel} implementation with the combined capabilities
   * of this {@code Kernel} implementation and the given {@code kernel}
   * implementation.
   */
  Kernel injectKernel(Kernel kernel);

  <T> T unwrapKernel(Class<T> kernelClass);

  ServiceDef defineService(Item serviceConfig);

  ServiceFactory<?> createServiceFactory(ServiceDef serviceDef, ClassLoader classLoader);

  <S extends Service> S openService(String serviceName, ServiceFactory<S> serviceFactory);

  default Service openService(ServiceDef serviceDef, ClassLoader classLoader) {
    final String serviceName = serviceDef.serviceName();
    Service service = getService(serviceName);
    if (service == null) {
      final ServiceFactory<?> serviceFactory = createServiceFactory(serviceDef, classLoader);
      if (serviceFactory != null) {
        service = openService(serviceName, serviceFactory);
      }
    }
    return service;
  }

  default Service openService(ServiceDef serviceDef) {
    return openService(serviceDef, null);
  }

  Service getService(String serviceName);

  SpaceDef defineSpace(Item spaceConfig);

  Space openSpace(SpaceDef spaceDef);

  Space getSpace(String spaceName);

  PlaneDef definePlane(Item planeConfig);

  PlaneFactory<?> createPlaneFactory(PlaneDef planeDef, ClassLoader classLoader);

  <P extends Plane> PlaneFactory<P> createPlaneFactory(Class<? extends P> planeClass);

  AgentDef defineAgent(Item agentConfig);

  AgentFactory<?> createAgentFactory(AgentDef agentDef, ClassLoader classLoader);

  <A extends Agent> AgentFactory<A> createAgentFactory(Class<? extends A> agentClass);

  boolean isStarted();

  void start();

  void stop();

  void run();
}
