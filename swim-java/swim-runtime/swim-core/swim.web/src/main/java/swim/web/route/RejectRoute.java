// Copyright 2015-2023 Nstream, inc.
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

public final class RejectRoute implements WebRoute {

  public RejectRoute() {
    // nop
  }

  @Override
  public WebResponse routeRequest(WebRequest request) {
    return request.reject();
  }

  @Override
  public WebRoute orElse(WebRoute alternative) {
    return alternative;
  }

}
