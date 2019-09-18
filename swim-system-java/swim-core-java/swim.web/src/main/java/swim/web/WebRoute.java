// Copyright 2015-2020 SWIM.AI inc.
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

import java.util.function.Function;
import java.util.function.Supplier;
import swim.http.HttpMethod;
import swim.uri.UriHost;
import swim.uri.UriPath;
import swim.web.route.AlternativeRoute;
import swim.web.route.ExtractHostDirective;
import swim.web.route.ExtractPathDirective;
import swim.web.route.MethodDirective;
import swim.web.route.MethodRoute;
import swim.web.route.PathDirective;
import swim.web.route.PathPrefixDirective;
import swim.web.route.PathPrefixRoute;
import swim.web.route.PathRoute;

@FunctionalInterface
public interface WebRoute {

  WebResponse routeRequest(WebRequest request);

  static WebRoute pathPrefix(UriPath pathPrefix, WebRoute route) {
    return new PathPrefixRoute(pathPrefix, route);
  }

  static WebRoute pathPrefix(UriPath pathPrefix, Supplier<WebRoute> then) {
    return new PathPrefixDirective(pathPrefix, then);
  }

  static WebRoute path(UriPath path, WebRoute route) {
    return new PathRoute(path, route);
  }

  static WebRoute path(UriPath path, Supplier<WebRoute> then) {
    return new PathDirective(path, then);
  }

  static WebRoute pathEnd(WebRoute route) {
    return path(UriPath.empty(), route);
  }

  static WebRoute pathEnd(Supplier<WebRoute> then) {
    return path(UriPath.empty(), then);
  }

  static WebRoute method(HttpMethod method, WebRoute route) {
    return new MethodRoute(method, route);
  }

  static WebRoute get(WebRoute route) {
    return method(HttpMethod.GET, route);
  }

  static WebRoute head(WebRoute route) {
    return method(HttpMethod.HEAD, route);
  }

  static WebRoute post(WebRoute route) {
    return method(HttpMethod.POST, route);
  }

  static WebRoute put(WebRoute route) {
    return method(HttpMethod.PUT, route);
  }

  static WebRoute delete(WebRoute route) {
    return method(HttpMethod.DELETE, route);
  }

  static WebRoute method(HttpMethod method, Supplier<WebRoute> then) {
    return new MethodDirective(method, then);
  }

  static WebRoute get(Supplier<WebRoute> then) {
    return method(HttpMethod.GET, then);
  }

  static WebRoute head(Supplier<WebRoute> then) {
    return method(HttpMethod.HEAD, then);
  }

  static WebRoute post(Supplier<WebRoute> then) {
    return method(HttpMethod.POST, then);
  }

  static WebRoute put(Supplier<WebRoute> then) {
    return method(HttpMethod.PUT, then);
  }

  static WebRoute delete(Supplier<WebRoute> then) {
    return method(HttpMethod.DELETE, then);
  }

  static WebRoute extractHost(Function<UriHost, WebRoute> eval) {
    return new ExtractHostDirective(eval);
  }

  static WebRoute extractPath(Function<UriPath, WebRoute> eval) {
    return new ExtractPathDirective(eval);
  }

  default WebRoute orElse(WebRoute alternative) {
    return new AlternativeRoute(this, alternative);
  }

}
