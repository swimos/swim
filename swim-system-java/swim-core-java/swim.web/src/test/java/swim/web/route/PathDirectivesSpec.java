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
import static swim.web.WebRoute.pathPrefix;
import static swim.web.WebRoute.respond;

public class PathDirectivesSpec {

  private static HttpResponse<?> ok() {
    return HttpResponse.from(HttpStatus.OK);
  }

  @Test
  public void testPathRoute() {
    final WebRoute route = pathPrefix(UriPath.parse("/foo"),
        respond(ok()));
    final WebRequest exactMatch = new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/foo"), HttpVersion.HTTP_1_0));
    final WebRequest prefixMatch = new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/foo/1"), HttpVersion.HTTP_1_0));
    assertEquals(route.routeRequest(exactMatch).isAccepted(), true);
    assertEquals(route.routeRequest(prefixMatch).isAccepted(), true);
  }

  @Test
  public void testPrefixRoute() {
    final WebRoute route = pathPrefix(UriPath.parse("/foo"),
        respond(ok()));
    final WebRequest exactMatch = new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/foo"), HttpVersion.HTTP_1_0));
    final WebRequest truePrefixMatch = new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/foot"), HttpVersion.HTTP_1_0));
    final WebRequest prefixMatch = new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/foo/cat"), HttpVersion.HTTP_1_0));
    final WebRequest prefixMismatch = new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/bar/1"), HttpVersion.HTTP_1_0));
    assertEquals(route.routeRequest(exactMatch).isAccepted(), true);
    assertEquals(route.routeRequest(truePrefixMatch).isRejected(), true);
    assertEquals(route.routeRequest(prefixMatch).isAccepted(), true);
    assertEquals(route.routeRequest(prefixMismatch).isRejected(), true);
  }

  @Test
  public void testPrefixDirective() {
    final WebRoute route = pathPrefix(UriPath.parse("/foo"),
        () -> pathPrefix(UriPath.parse("/bar"),
            respond(ok()))
        .orElse(pathPrefix(UriPath.parse("/baz"),
            respond(ok()))
          )
      );
    assertEquals(route.routeRequest(new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/foo/bar/1"), HttpVersion.HTTP_1_0))).isAccepted(), true);
    assertEquals(route.routeRequest(new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/foo/baz/1"), HttpVersion.HTTP_1_0))).isAccepted(), true);
    assertEquals(route.routeRequest(new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/foo/qux/1"), HttpVersion.HTTP_1_0))).isRejected(), true);
  }
}
