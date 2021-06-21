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
import static swim.web.WebRoute.respond;

public class ExtractDirectivesSpec {

  @Test
  public void testExtractHost() {

    final WebRoute route = extractHost(host ->
        host.equals(UriHost.parse("192.168.10.1")) ? respond(HttpResponse.from(HttpStatus.OK)) : WebRequest::reject
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
