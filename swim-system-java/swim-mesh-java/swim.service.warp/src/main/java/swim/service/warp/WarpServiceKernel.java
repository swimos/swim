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

package swim.service.warp;

import swim.api.service.ServiceDef;
import swim.api.service.ServiceFactory;
import swim.kernel.KernelContext;
import swim.kernel.KernelProxy;
import swim.structure.Item;
import swim.structure.Value;

public class WarpServiceKernel extends KernelProxy {
  final double kernelPriority;

  public WarpServiceKernel(double kernelPriority) {
    this.kernelPriority = kernelPriority;
  }

  public WarpServiceKernel() {
    this(KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  @Override
  public ServiceDef defineService(Item serviceConfig) {
    WarpServiceDef serviceDef = WarpServiceDef.warpForm().cast(serviceConfig);
    if (serviceDef == null) {
      serviceDef = WarpServiceDef.warpsForm().cast(serviceConfig);
    }
    return serviceDef != null ? serviceDef : super.defineService(serviceConfig);
  }

  @Override
  public ServiceFactory<?> createServiceFactory(ServiceDef serviceDef, ClassLoader classLoader) {
    if (serviceDef instanceof WarpServiceDef) {
      return createWarpServiceFactory((WarpServiceDef) serviceDef);
    } else {
      return super.createServiceFactory(serviceDef, classLoader);
    }
  }

  public WarpServiceFactory createWarpServiceFactory(WarpServiceDef serviceDef) {
    final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
    return new WarpServiceFactory(kernel, serviceDef);
  }

  private static final double KERNEL_PRIORITY = 0.75;

  public static WarpServiceKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || WarpServiceKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(KERNEL_PRIORITY);
      return new WarpServiceKernel(kernelPriority);
    }
    return null;
  }
}
