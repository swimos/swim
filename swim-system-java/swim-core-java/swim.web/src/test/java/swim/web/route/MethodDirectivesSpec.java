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
import static swim.web.WebRoute.*;

public class MethodDirectivesSpec {

  private static WebRequest methodRequest(HttpMethod method, Uri uri) {
    return new WebServerRequest(HttpRequest.from(method, uri, HttpVersion.HTTP_1_0));
  }

  private static HttpResponse ok() {
    return HttpResponse.from(HttpStatus.OK);
  }

  @Test
  public void testMethodRoutes() {
    final WebRoute getRoute = get(request -> request.respond(HttpResponse.from(HttpStatus.OK)));
    final WebRoute headRoute = head(request -> request.respond(HttpResponse.from(HttpStatus.OK)));
    final WebRoute postRoute = post(request -> request.respond(HttpResponse.from(HttpStatus.OK)));
    final WebRoute putRoute = put(request -> request.respond(HttpResponse.from(HttpStatus.OK)));
    final WebRoute deleteRoute = delete(request -> request.respond(HttpResponse.from(HttpStatus.OK)));
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
    final WebRoute directive = get(() -> path(UriPath.parse("/GET"), request -> request.respond(ok())))
      .orElse(head(() -> path(UriPath.parse("/HEAD"), request -> request.respond(ok()))))
      .orElse(post(() -> path(UriPath.parse("/POST"), request -> request.respond(ok()))))
      .orElse(put(() -> path(UriPath.parse("/PUT"), request -> request.respond(ok()))))
      .orElse(delete(() -> path(UriPath.parse("/DELETE"), request -> request.respond(ok()))));
    for (HttpMethod m : new HttpMethod[]{HttpMethod.GET, HttpMethod.HEAD, HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE}) {
      final WebRequest req = methodRequest(m, Uri.parse("/"+m.name()));
      assertEquals(directive.routeRequest(req).isAccepted(), true);
    }
    assertEquals(directive.routeRequest(methodRequest(HttpMethod.HEAD, Uri.parse("/POST"))).isAccepted(), false);
  }
}
