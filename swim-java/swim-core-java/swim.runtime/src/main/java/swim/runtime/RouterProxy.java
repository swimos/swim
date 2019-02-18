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

package swim.runtime;

import swim.api.router.Router;

public abstract class RouterProxy implements RouterBinding, RouterContext {
  protected RouterContext routerContext;

  @Override
  public final RouterContext routerContext() {
    return this.routerContext;
  }

  @Override
  public void setRouterContext(RouterContext routerContext) {
    this.routerContext = routerContext;
  }

  @Override
  public abstract double routerPriority();

  @Override
  public Router injectRouter(Router router) {
    if (routerPriority() < router.routerPriority()) {
      if (router instanceof RouterBinding) {
        ((RouterBinding) router).setRouterContext(this);
        return router;
      }
    } else {
      if (router instanceof RouterContext) {
        setRouterContext((RouterContext) router);
        return this;
      }
    }
    throw new IllegalArgumentException(router.toString());
  }

  @Override
  public RootBinding createRoot() {
    return this.routerContext.createRoot();
  }

  @Override
  public MeshBinding createMesh() {
    return this.routerContext.createMesh();
  }

  @Override
  public HostBinding createHost() {
    return this.routerContext.createHost();
  }
}
