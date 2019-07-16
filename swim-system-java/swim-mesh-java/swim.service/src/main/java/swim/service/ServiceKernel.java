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

package swim.service;

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.SwimContext;
import swim.api.service.Service;
import swim.api.service.ServiceContext;
import swim.api.service.ServiceFactory;
import swim.collections.HashTrieMap;
import swim.kernel.KernelContext;
import swim.kernel.KernelProxy;
import swim.structure.Value;

public class ServiceKernel extends KernelProxy {
  final double kernelPriority;
  volatile HashTrieMap<String, Service> services;

  public ServiceKernel(double kernelPriority) {
    this.kernelPriority = kernelPriority;
    this.services = HashTrieMap.empty();
  }

  public ServiceKernel() {
    this(KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  protected ServiceContext createServiceContext(String serviceName) {
    final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
    return new ServicePort(serviceName, kernel);
  }

  protected <S extends Service> S createService(ServiceContext serviceContext, ServiceFactory<S> serviceFactory) {
    try {
      SwimContext.setServiceContext(serviceContext);
      return serviceFactory.createService(serviceContext);
    } finally {
      SwimContext.clear();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <S extends Service> S openService(String serviceName, ServiceFactory<S> serviceFactory) {
    ServiceContext serviceContext = null;
    S service = null;
    do {
      final HashTrieMap<String, Service> oldServices = this.services;
      final Service oldService = oldServices.get(serviceName);
      if (oldService == null) {
        if (service == null) {
          serviceContext = createServiceContext(serviceName);
          service = createService(serviceContext, serviceFactory);
          service = (S) kernelWrapper().unwrapKernel(KernelContext.class).injectService(service);
          if (serviceContext instanceof ServicePort) {
            ((ServicePort) serviceContext).setService(service);
          }
        }
        final HashTrieMap<String, Service> newServices = oldServices.updated(serviceName, service);
        if (SERVICES.compareAndSet(this, oldServices, newServices)) {
          if (serviceContext instanceof ServicePort && isStarted()) {
            ((ServicePort) serviceContext).start();
          }
          break;
        }
      } else {
        serviceContext = null;
        service = (S) oldService;
        break;
      }
    } while (true);
    return service;
  }

  @Override
  public Service getService(String serviceName) {
    return this.services.get(serviceName);
  }

  @Override
  public void didStart() {
    for (Service service : this.services.values()) {
      final ServiceContext serviceContext = service.serviceContext();
      if (serviceContext instanceof ServicePort) {
        ((ServicePort) serviceContext).start();
      }
    }
  }

  @Override
  public void willStop() {
    for (Service service : this.services.values()) {
      final ServiceContext serviceContext = service.serviceContext();
      if (serviceContext instanceof ServicePort) {
        ((ServicePort) serviceContext).stop();
      }
    }
  }

  private static final double KERNEL_PRIORITY = 0.5;

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<ServiceKernel, HashTrieMap<String, Service>> SERVICES =
      AtomicReferenceFieldUpdater.newUpdater(ServiceKernel.class, (Class<HashTrieMap<String, Service>>) (Class<?>) HashTrieMap.class, "services");

  public static ServiceKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || ServiceKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(KERNEL_PRIORITY);
      return new ServiceKernel(kernelPriority);
    }
    return null;
  }
}
