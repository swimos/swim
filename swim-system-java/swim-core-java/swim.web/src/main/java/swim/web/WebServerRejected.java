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

package swim.web;

import swim.http.HttpBody;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.io.http.HttpResponder;
import swim.io.http.StaticHttpResponder;

final class WebServerRejected extends WebResponse {
  final HttpResponder<?> httpResponder;

  WebServerRejected(HttpResponder<?> httpResponder) {
    this.httpResponder = httpResponder;
  }

  @Override
  public boolean isAccepted() {
    return false;
  }

  @Override
  public boolean isRejected() {
    return true;
  }

  @Override
  public HttpResponder<?> httpResponder() {
    return this.httpResponder;
  }

  static WebServerRejected notFound() {
    final HttpResponse<Object> response = HttpResponse.from(HttpStatus.NOT_FOUND).content(HttpBody.empty());
    final HttpResponder<Object> responder = new StaticHttpResponder<Object>(response);
    return new WebServerRejected(responder);
  }
}
