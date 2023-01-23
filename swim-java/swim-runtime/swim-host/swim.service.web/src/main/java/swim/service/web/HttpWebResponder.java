// Copyright 2015-2023 Swim.inc
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

import swim.http.HttpRequest;
import swim.io.http.AbstractHttpResponder;
import swim.io.http.HttpResponder;
import swim.kernel.KernelContext;
import swim.web.WebRequest;
import swim.web.WebResponse;
import swim.web.WebRoute;
import swim.web.WebServerRequest;

public class HttpWebResponder<T> extends AbstractHttpResponder<T> {

  WebRoute router;
  KernelContext kernel;

  public HttpWebResponder(WebRoute router, KernelContext kernel) {
    this.router = router;
    this.kernel = kernel;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void doRespond(HttpRequest<T> request) {

    final WebRequest webRequest = new WebServerRequest(request);
    // Route application requests.
    WebResponse webResponse = this.router.routeRequest(webRequest);
    if (webResponse.isRejected()) {
      // Route kernel module requests.
      webResponse = this.kernel.routeRequest(webRequest);
    }

    final HttpResponder<T> responder =  (HttpResponder<T>) webResponse.httpResponder();
    responder.setHttpResponderContext(this.context);
    responder.doRespond(request);

  }

}
