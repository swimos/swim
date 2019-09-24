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

import swim.api.service.ServiceContext;
import swim.api.service.ServiceFactory;
import swim.kernel.KernelContext;
import swim.web.WebRoute;

public class WebServiceFactory implements ServiceFactory<WebService> {
  final KernelContext kernel;
  final WebServiceDef serviceDef;
  final WebRoute router;

  WebServiceFactory(KernelContext kernel, WebServiceDef serviceDef, WebRoute router) {
    this.kernel = kernel;
    this.serviceDef = serviceDef;
    this.router = router;
  }

  public final KernelContext kernel() {
    return this.kernel;
  }

  public final WebServiceDef serviceDef() {
    return this.serviceDef;
  }

  public final WebRoute router() {
    return this.router;
  }

  @Override
  public WebService createService(ServiceContext context) {
    return new WebService(this.kernel, context, this.serviceDef, this.router);
  }
}
