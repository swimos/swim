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

package swim.server;

import java.io.IOException;
import swim.actor.ActorKernel;
import swim.api.service.ServiceDef;
import swim.api.service.ServiceFactory;
import swim.api.space.SpaceDef;
import swim.auth.AuthenticatorKernel;
import swim.java.JavaKernel;
import swim.kernel.BootKernel;
import swim.kernel.Kernel;
import swim.kernel.KernelException;
import swim.kernel.KernelLoader;
import swim.remote.RemoteKernel;
import swim.service.ServiceKernel;
import swim.service.web.WebServiceKernel;
import swim.store.db.DbStoreKernel;
import swim.store.mem.MemStoreKernel;
import swim.structure.Item;
import swim.structure.Value;

public final class ServerLoader {
  private ServerLoader() {
    // static
  }

  public static Kernel loadServer() {
    return loadServer(KernelLoader.class.getClassLoader());
  }

  public static Kernel loadServer(ClassLoader classLoader) {
    try {
      Value kernelConfig = KernelLoader.loadConfig(classLoader);
      if (kernelConfig == null) {
        kernelConfig = KernelLoader.loadConfigResource(classLoader, "server.recon");
      }
      if (kernelConfig == null) {
        kernelConfig = Value.absent();
      }
      final Kernel kernel = loadServerStack(classLoader, kernelConfig);
      loadSpaces(kernel, kernelConfig, classLoader);
      loadServices(kernel, kernelConfig, classLoader);
      return kernel;
    } catch (IOException cause) {
      throw new KernelException(cause);
    }
  }

  public static Kernel loadServerStack() {
    return loadServerStack(KernelLoader.class.getClassLoader());
  }

  public static Kernel loadServerStack(ClassLoader classLoader) {
    return injectServerStack(classLoader, null);
  }

  public static Kernel loadServerStack(ClassLoader classLoader, Value kernelConfig) {
    Kernel kernel = KernelLoader.loadKernelStack(classLoader, kernelConfig);
    kernel = injectServerStack(classLoader, kernel);
    return kernel;
  }

  public static Kernel injectServerStack(ClassLoader classLoader, Kernel kernel) {
    if (kernel == null) {
      kernel = new BootKernel();
    } else if (kernel.unwrapKernel(BootKernel.class) == null) {
      kernel = kernel.injectKernel(new BootKernel());
    }
    if (kernel.unwrapKernel(MemStoreKernel.class) == null) {
      kernel = kernel.injectKernel(new MemStoreKernel());
    }
    if (kernel.unwrapKernel(DbStoreKernel.class) == null) {
      kernel = kernel.injectKernel(new DbStoreKernel());
    }
    if (kernel.unwrapKernel(RemoteKernel.class) == null) {
      kernel = kernel.injectKernel(new RemoteKernel());
    }
    if (kernel.unwrapKernel(ServiceKernel.class) == null) {
      kernel = kernel.injectKernel(new ServiceKernel());
    }
    if (kernel.unwrapKernel(WebServiceKernel.class) == null) {
      kernel = kernel.injectKernel(new WebServiceKernel());
    }
    if (kernel.unwrapKernel(AuthenticatorKernel.class) == null) {
      kernel = kernel.injectKernel(new AuthenticatorKernel());
    }
    if (kernel.unwrapKernel(ActorKernel.class) == null) {
      kernel = kernel.injectKernel(new ActorKernel());
    }
    if (kernel.unwrapKernel(JavaKernel.class) == null) {
      kernel = kernel.injectKernel(new JavaKernel());
    }
    return kernel;
  }

  public static void loadSpaces(Kernel kernel, Value kernelConfig, ClassLoader classLoader) {
    for (int i = 0, n = kernelConfig.length(); i < n; i += 1) {
      final Item item = kernelConfig.getItem(i);
      final SpaceDef spaceDef = kernel.defineSpace(item);
      if (spaceDef != null) {
        kernel.openSpace(spaceDef);
      }
    }
  }

  public static void loadServices(Kernel kernel, Value kernelConfig, ClassLoader classLoader) {
    for (int i = 0, n = kernelConfig.length(); i < n; i += 1) {
      final Item item = kernelConfig.getItem(i);
      final ServiceDef serviceDef = kernel.defineService(item);
      if (serviceDef != null) {
        final ServiceFactory<?> serviceFactory = kernel.createServiceFactory(serviceDef, classLoader);
        kernel.openService(serviceDef.serviceName(), serviceFactory);
      }
    }
  }
}
