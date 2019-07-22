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

package swim.web.route;

import swim.web.WebRequest;
import swim.web.WebResponse;
import swim.web.WebRoute;

public final class AlternativeRoute implements WebRoute {
  final WebRoute[] routes;

  public AlternativeRoute(WebRoute... routes) {
    this.routes = routes;
  }

  @Override
  public WebResponse routeRequest(WebRequest request) {
    final WebRoute[] routes = this.routes;
    for (int i = 0, n = routes.length; i < n; i += 1) {
      final WebRoute route = routes[i];
      final WebResponse response = route.routeRequest(request);
      if (response.isAccepted()) {
        return response;
      }
    }
    return request.reject();
  }

  @Override
  public WebRoute orElse(WebRoute alternative) {
    final WebRoute[] oldRoutes = this.routes;
    final int n = oldRoutes.length;
    final WebRoute[] newRoutes = new WebRoute[n + 1];
    System.arraycopy(oldRoutes, 0, newRoutes, 0, n);
    newRoutes[n] = alternative;
    return new AlternativeRoute(newRoutes);
  }
}
