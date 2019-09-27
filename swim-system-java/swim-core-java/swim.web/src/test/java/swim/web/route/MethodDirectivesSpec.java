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

import org.testng.annotations.Test;
import swim.http.HttpMethod;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.HttpVersion;
import swim.uri.Uri;
import swim.uri.UriPath;
import swim.web.WebRequest;
import swim.web.WebRoute;
import swim.web.WebServerRequest;
import static org.testng.Assert.assertEquals;
import static swim.web.WebRoute.delete;
import static swim.web.WebRoute.get;
import static swim.web.WebRoute.head;
import static swim.web.WebRoute.path;
import static swim.web.WebRoute.post;
import static swim.web.WebRoute.put;
import static swim.web.WebRoute.respond;

public class MethodDirectivesSpec {

  private static WebRequest methodRequest(HttpMethod method, Uri uri) {
    return new WebServerRequest(HttpRequest.from(method, uri, HttpVersion.HTTP_1_0));
  }

  private static HttpResponse<?> ok() {
    return HttpResponse.from(HttpStatus.OK);
  }

  @Test
  public void testMethodRoutes() {
    final WebRoute getRoute = get(respond(ok()));
    final WebRoute headRoute = head(respond(ok()));
    final WebRoute postRoute = post(respond(ok()));
    final WebRoute putRoute = put(respond(ok()));
    final WebRoute deleteRoute = delete(respond(ok()));
    assertEquals(getRoute.routeRequest(methodRequest(HttpMethod.GET, Uri.parse("/foo"))).isAccepted(), true);
    assertEquals(getRoute.routeRequest(methodRequest(HttpMethod.HEAD, Uri.parse("/foo"))).isAccepted(), false);
    assertEquals(headRoute.routeRequest(methodRequest(HttpMethod.HEAD, Uri.parse("/foo"))).isAccepted(), true);
    assertEquals(headRoute.routeRequest(methodRequest(HttpMethod.POST, Uri.parse("/foo"))).isAccepted(), false);
    assertEquals(postRoute.routeRequest(methodRequest(HttpMethod.POST, Uri.parse("/foo"))).isAccepted(), true);
    assertEquals(postRoute.routeRequest(methodRequest(HttpMethod.PUT, Uri.parse("/foo"))).isAccepted(), false);
    assertEquals(putRoute.routeRequest(methodRequest(HttpMethod.PUT, Uri.parse("/foo"))).isAccepted(), true);
    assertEquals(putRoute.routeRequest(methodRequest(HttpMethod.DELETE, Uri.parse("/foo"))).isAccepted(), false);
    assertEquals(deleteRoute.routeRequest(methodRequest(HttpMethod.DELETE, Uri.parse("/foo"))).isAccepted(), true);
    assertEquals(deleteRoute.routeRequest(methodRequest(HttpMethod.GET, Uri.parse("/foo"))).isAccepted(), false);
  }

  @Test
  public void testMethodDirectives() {
    final WebRoute directive = get(() -> path(UriPath.parse("/GET"), respond(ok())))
        .orElse(head(() -> path(UriPath.parse("/HEAD"), respond(ok()))))
        .orElse(post(() -> path(UriPath.parse("/POST"), respond(ok()))))
        .orElse(put(() -> path(UriPath.parse("/PUT"), respond(ok()))))
        .orElse(delete(() -> path(UriPath.parse("/DELETE"), respond(ok()))));
    for (HttpMethod m : new HttpMethod[]{HttpMethod.GET, HttpMethod.HEAD, HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE}) {
      final WebRequest req = methodRequest(m, Uri.parse("/" + m.name()));
      assertEquals(directive.routeRequest(req).isAccepted(), true);
    }
    assertEquals(directive.routeRequest(methodRequest(HttpMethod.HEAD, Uri.parse("/POST"))).isAccepted(), false);
  }
}
