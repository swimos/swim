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

import org.testng.annotations.Test;
import swim.collections.HashTrieMap;
import swim.http.Cookie;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.HttpVersion;
import swim.http.UpgradeProtocol;
import swim.http.header.ConnectionHeader;
import swim.http.header.OriginHeader;
import swim.http.header.SecWebSocketAcceptHeader;
import swim.http.header.SecWebSocketExtensionsHeader;
import swim.http.header.SecWebSocketKeyHeader;
import swim.http.header.SecWebSocketVersionHeader;
import swim.http.header.UpgradeHeader;
import swim.io.warp.WarpSettings;
import swim.io.ws.WsSettings;
import swim.io.ws.WsUpgradeResponder;
import swim.remote.RemoteHost;
import swim.uri.Uri;
import static org.testng.Assert.assertEquals;

public class WebServerSpec {

  @Test
  public void testExtensions() {
    final WsSettings wsSettings = WsSettings.bestCompression();
    final WebServiceDef serviceDef = new WebServiceDef("web", "0.0.0.0", 80, false, null, null, null, null, WarpSettings.create(wsSettings));
    final WebServer server = new WebServer(new WebServiceKernel(), serviceDef, request -> request.respond(HttpResponse.create(HttpStatus.OK))) {
      @Override
      protected RemoteHost openHost(Uri requestUri, HashTrieMap<String, Cookie> cookies) {
        return new RemoteHost(requestUri);
      }
    };

    final HttpRequest<?> request = HttpRequest.get(Uri.empty(),
                                                   UpgradeHeader.create("websocket"),
                                                   ConnectionHeader.create("Upgrade"),
                                                   SecWebSocketKeyHeader.create("dGhlIHNhbXBsZSBub25jZQ=="),
                                                   OriginHeader.create("http://example.com"),
                                                   SecWebSocketExtensionsHeader.create("Sec-WebSocket-Extensions", "permessage-deflate"),
                                                   SecWebSocketVersionHeader.create(13));

    final WsUpgradeResponder responder = (WsUpgradeResponder) server.doRequest(request);
    final HttpResponse<?> response = responder.wsResponse().httpResponse();
    final HttpResponse<?> expected = HttpResponse.create(HttpVersion.HTTP_1_1, HttpStatus.SWITCHING_PROTOCOLS,
                                                         ConnectionHeader.create("Upgrade"),
                                                         UpgradeHeader.create(UpgradeProtocol.create("websocket")),
                                                         SecWebSocketAcceptHeader.create("s3pPLMBiTxaQ9kYGzzhZRbK+xOo="),
                                                         SecWebSocketExtensionsHeader.create("permessage-deflate"));

    assertEquals(response, expected);
  }

}
