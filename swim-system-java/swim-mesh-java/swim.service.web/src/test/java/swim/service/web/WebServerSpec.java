package swim.service.web;

import org.testng.annotations.Test;
import swim.collections.FingerTrieSeq;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.HttpVersion;
import swim.http.UpgradeProtocol;
import swim.http.header.Connection;
import swim.http.header.Origin;
import swim.http.header.SecWebSocketAccept;
import swim.http.header.SecWebSocketExtensions;
import swim.http.header.SecWebSocketKey;
import swim.http.header.SecWebSocketVersion;
import swim.http.header.Upgrade;
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
    final WebServiceDef serviceDef = new WebServiceDef("web", "0.0.0.0", 80, false, null, null, null, WarpSettings.create(wsSettings));
    final WebServer server = new WebServer(new WebServiceKernel(), serviceDef, request -> request.respond(HttpResponse.create(HttpStatus.OK))) {
      @Override
      protected RemoteHost openHost(Uri requestUri) {
        return new RemoteHost(requestUri);
      }
    };


    final HttpRequest<?> request = HttpRequest.get(Uri.empty(),
                                                   Upgrade.create("websocket"),
                                                   Connection.create("Upgrade"),
                                                   SecWebSocketKey.create("dGhlIHNhbXBsZSBub25jZQ=="),
                                                   Origin.create("http://example.com"),
                                                   SecWebSocketExtensions.create("Sec-WebSocket-Extensions", "permessage-deflate"),
                                                   SecWebSocketVersion.create(13));

    final WsUpgradeResponder responder = (WsUpgradeResponder) server.doRequest(request);
    final HttpResponse<?> response = responder.wsResponse().httpResponse();
    final HttpResponse<?> expected = HttpResponse.create(HttpVersion.HTTP_1_1, HttpStatus.SWITCHING_PROTOCOLS,
                                                         FingerTrieSeq.of(Connection.create("Upgrade"),
                                                                          Upgrade.create(UpgradeProtocol.create("websocket")),
                                                                          SecWebSocketAccept.create("s3pPLMBiTxaQ9kYGzzhZRbK+xOo="),
                                                                          SecWebSocketExtensions.create("permessage-deflate")));

    assertEquals(response, expected);
  }

}
