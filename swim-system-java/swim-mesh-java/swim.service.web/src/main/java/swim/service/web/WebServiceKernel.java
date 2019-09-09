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

package swim.service.web;

import swim.api.service.ServiceDef;
import swim.api.service.ServiceFactory;
import swim.io.warp.WarpSettings;
import swim.kernel.KernelContext;
import swim.kernel.KernelProxy;
import swim.structure.Item;
import swim.structure.Value;
import swim.uri.UriPath;
import swim.web.WebRoute;
import swim.web.route.RejectRoute;

public class WebServiceKernel extends KernelProxy {
  final double kernelPriority;

  public WebServiceKernel(double kernelPriority) {
    this.kernelPriority = kernelPriority;
  }

  public WebServiceKernel() {
    this(KERNEL_PRIORITY);
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  @Override
  public ServiceDef defineService(Item serviceConfig) {
    final ServiceDef serviceDef = defineWebService(serviceConfig);
    return serviceDef != null ? serviceDef : super.defineService(serviceConfig);
  }

  public WebServiceDef defineWebService(Item serviceConfig) {
    final Value value = serviceConfig.toValue();
    Value header = value.getAttr("web");
    boolean isSecure = false;
    if (!header.isDefined()) {
      header = value.getAttr("warp"); // deprecated
    }
    if (!header.isDefined()) {
      header = value.getAttr("warps"); // deprecated
      isSecure = true;
    }
    if (header.isDefined()) {
      final String webProvider = header.get("provider").stringValue(null);
      if (webProvider == null || WebServiceKernel.class.getName().equals(webProvider)) {
        final String serviceName = serviceConfig.key().stringValue("web");
        final String address = header.get("address").stringValue("0.0.0.0");
        final int port = header.get("port").intValue(443);
        isSecure = header.get("secure").booleanValue(isSecure);
        String spaceName = value.get("space").stringValue(null);
        if (spaceName == null) {
          spaceName = value.get("plane").stringValue(null); // deprecated
        }
        final UriPath documentRoot = value.get("documentRoot").cast(UriPath.pathForm());
        final UriPath resourceRoot = value.get("resourceRoot").cast(UriPath.pathForm());
        final WarpSettings warpSettings = WarpSettings.form().cast(value);
        return new WebServiceDef(serviceName, address, port, isSecure, spaceName,
                                 documentRoot, resourceRoot, warpSettings);
      }
    }
    return null;
  }

  @Override
  public ServiceFactory<?> createServiceFactory(ServiceDef serviceDef, ClassLoader classLoader) {
    if (serviceDef instanceof WebServiceDef) {
      return createWebServiceFactory((WebServiceDef) serviceDef);
    } else {
      return super.createServiceFactory(serviceDef, classLoader);
    }
  }

  public WebServiceFactory createWebServiceFactory(WebServiceDef serviceDef) {
    final WebRoute router = createWebRouter(serviceDef);
    final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
    return new WebServiceFactory(kernel, serviceDef, router);
  }

  protected WebRoute createWebRouter(WebServiceDef serviceDef) {
    return new RejectRoute(); // TODO: parse from config
  }

  private static final double KERNEL_PRIORITY = 0.75;

  public static WebServiceKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || WebServiceKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(KERNEL_PRIORITY);
      return new WebServiceKernel(kernelPriority);
    }
    return null;
  }
}
