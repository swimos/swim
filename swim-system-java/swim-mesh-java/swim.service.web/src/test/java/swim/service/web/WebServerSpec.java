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
import swim.http.header.SecWebSocketProtocol;
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
    WsSettings wsSettings = WsSettings.bestCompression();
    WebServiceDef serviceDef = new WebServiceDef("web", "0.0.0.0", 80, false, null, null, null, WarpSettings.from(wsSettings));
    WebServer server = new WebServer(new WebServiceKernel(), serviceDef, request -> request.respond(HttpResponse.from(HttpStatus.OK))) {
      @Override
      protected RemoteHost openHost(Uri requestUri) {
        return new RemoteHost(requestUri);
      }
    };

    HttpRequest<?> request = HttpRequest.get(Uri.empty(),
        Upgrade.from("websocket"),
        Connection.from("Upgrade"),
        SecWebSocketKey.from("dGhlIHNhbXBsZSBub25jZQ=="),
        Origin.from("http://example.com"),
        SecWebSocketExtensions.from("Sec-WebSocket-Extensions", "permessage-deflate"),
        SecWebSocketVersion.from(13));

    WsUpgradeResponder responder = (WsUpgradeResponder) server.doRequest(request);
    HttpResponse<?> response = responder.wsResponse().httpResponse();
    HttpResponse<?> expected = HttpResponse.from(HttpVersion.HTTP_1_1, HttpStatus.SWITCHING_PROTOCOLS,
        FingerTrieSeq.of(
            Connection.from("Upgrade"),
            Upgrade.from(UpgradeProtocol.from("websocket")),
            SecWebSocketAccept.from("s3pPLMBiTxaQ9kYGzzhZRbK+xOo="),
            SecWebSocketExtensions.from("permessage-deflate")
        )
    );

    assertEquals(response, expected);
  }

}
