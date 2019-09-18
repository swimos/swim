package swim.web.route;

import org.testng.annotations.Test;
import swim.collections.FingerTrieSeq;
import swim.http.HttpHeader;
import swim.http.HttpMethod;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.HttpVersion;
import swim.http.header.Host;
import swim.uri.Uri;
import swim.uri.UriHost;
import swim.web.WebRequest;
import swim.web.WebRoute;
import swim.web.WebServerRequest;
import static org.testng.Assert.assertEquals;
import static swim.web.WebRoute.extractHost;

public class ExtractDirectivesSpec {

  private static HttpResponse<?> ok() {
    return HttpResponse.from(HttpStatus.OK);
  }

  @Test
  public void testExtractHost() {

    final WebRoute route = extractHost(host ->
        host.equals(UriHost.parse("192.168.10.1")) ? request -> request.respond(ok()) : WebRequest::reject
      );

    final WebRequest acc = new WebServerRequest(HttpRequest.from(
        HttpMethod.GET,
        Uri.parse("http://www.swim.ai/resource.html"),
        HttpVersion.HTTP_1_0,
        FingerTrieSeq.<HttpHeader>of(Host.from("192.168.10.1"))
      ));
    final WebRequest rej = new WebServerRequest(HttpRequest.from(
        HttpMethod.GET,
        Uri.parse("http://www.swim.ai/resource.html"),
        HttpVersion.HTTP_1_0,
        FingerTrieSeq.<HttpHeader>of(Host.from("traffic.swim.ai"))
      ));
    assertEquals(route.routeRequest(acc).isAccepted(), true);
    assertEquals(route.routeRequest(rej).isAccepted(), false);
  }

  @Test
  public void testExtractPath() {

  }
}
