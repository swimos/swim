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

import java.util.function.Supplier;
import swim.http.HttpMethod;
import swim.web.WebRequest;
import swim.web.WebResponse;
import swim.web.WebRoute;

public final class MethodDirective implements WebRoute {

  final HttpMethod method;
  final Supplier<WebRoute> then;

  public MethodDirective(HttpMethod method, Supplier<WebRoute> then) {
    this.method = method;
    this.then = then;
  }

  @Override
  public WebResponse routeRequest(WebRequest request) {
    if (this.method != request.httpMethod()) {
      return request.reject();
    }
    return this.then.get().routeRequest(request);
  }
}
