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

import swim.http.HttpRequest;
import swim.uri.UriPath;

public class WebServerRequest extends WebRequest {
  final HttpRequest<?> httpRequest;
  final UriPath routePath;

  public WebServerRequest(HttpRequest<?> httpRequest, UriPath routePath) {
    this.httpRequest = httpRequest;
    this.routePath = routePath;
  }

  public WebServerRequest(HttpRequest<?> httpRequest) {
    this(httpRequest, httpRequest.uri().path());
  }

  @Override
  public final HttpRequest<?> httpRequest() {
    return this.httpRequest;
  }

  @Override
  public final UriPath routePath() {
    return this.routePath;
  }

  @Override
  public WebRequest routePath(UriPath routePath) {
    return new WebServerRequest(this.httpRequest, routePath);
  }
}
