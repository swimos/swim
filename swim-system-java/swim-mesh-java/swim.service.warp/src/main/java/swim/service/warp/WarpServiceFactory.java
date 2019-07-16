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

import swim.api.service.ServiceContext;
import swim.api.service.ServiceFactory;
import swim.kernel.KernelContext;

public class WarpServiceFactory implements ServiceFactory<WarpServicePort> {
  protected final KernelContext kernel;
  protected final WarpServiceDef serviceDef;

  WarpServiceFactory(KernelContext kernel, WarpServiceDef serviceDef) {
    this.kernel = kernel;
    this.serviceDef = serviceDef;
  }

  public final KernelContext kernel() {
    return this.kernel;
  }

  public final WarpServiceDef serviceDef() {
    return this.serviceDef;
  }

  @Override
  public WarpServicePort createService(ServiceContext context) {
    return new WarpServicePort(this.kernel, context, this.serviceDef);
  }
}
