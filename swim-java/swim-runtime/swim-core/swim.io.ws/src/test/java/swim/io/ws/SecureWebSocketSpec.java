// Copyright 2015-2023 Nstream, inc.
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

package swim.io.ws;

import swim.io.IpServiceRef;
import swim.io.IpSocketRef;
import swim.io.http.HttpClient;
import swim.io.http.HttpEndpoint;
import swim.io.http.HttpService;
import swim.uri.Uri;
import swim.ws.WsRequest;

public class SecureWebSocketSpec extends WebSocketBehaviors {

  final Uri wsUri = Uri.parse("ws://127.0.0.1:33555/");

  public SecureWebSocketSpec() {
    super(WsSettings.noCompression().tlsSettings(TestTlsSettings.tlsSettings()));
  }

  @Override
  protected IpServiceRef bind(HttpEndpoint endpoint, HttpService service) {
    return endpoint.bindHttps("127.0.0.1", 33555, service, this.wsSettings.httpSettings());
  }

  @Override
  protected IpSocketRef connect(HttpEndpoint endpoint, final WebSocket<?, ?> socket) {
    final WsRequest wsRequest = this.wsSettings.handshakeRequest(this.wsUri);
    final HttpClient client = new AbstractWsClient(this.wsSettings) {
      @Override
      public void didConnect() {
        super.didConnect();
        this.doRequest(this.upgrade(socket, wsRequest));
      }
    };
    return endpoint.connectHttps("127.0.0.1", 33555, client, this.wsSettings.httpSettings());
  }

}
