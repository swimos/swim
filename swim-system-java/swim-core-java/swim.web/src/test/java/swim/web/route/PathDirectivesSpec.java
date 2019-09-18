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

public class PathDirectivesSpec {

  private static HttpResponse<?> ok() {
    return HttpResponse.from(HttpStatus.OK);
  }

  @Test
  public void testPathRoute() {
    final WebRoute route = pathPrefix(UriPath.parse("/foo"),
        request -> request.respond(ok()));
    final WebRequest exactMatch = new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/foo"), HttpVersion.HTTP_1_0));
    final WebRequest prefixMatch = new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/foo/1"), HttpVersion.HTTP_1_0));
    assertEquals(route.routeRequest(exactMatch).isAccepted(), true);
    assertEquals(route.routeRequest(prefixMatch).isAccepted(), true);
  }

  @Test
  public void testPrefixRoute() {
    final WebRoute route = pathPrefix(UriPath.parse("/foo"),
        request -> request.respond(ok()));
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
            request -> request.respond(ok()))
        .orElse(pathPrefix(UriPath.parse("/baz"),
            request -> request.respond(ok()))
          )
      );
    assertEquals(route.routeRequest(new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/foo/bar/1"), HttpVersion.HTTP_1_0))).isAccepted(), true);
    assertEquals(route.routeRequest(new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/foo/baz/1"), HttpVersion.HTTP_1_0))).isAccepted(), true);
    assertEquals(route.routeRequest(new WebServerRequest(HttpRequest.from(HttpMethod.GET, Uri.parse("/foo/qux/1"), HttpVersion.HTTP_1_0))).isRejected(), true);
  }
}
