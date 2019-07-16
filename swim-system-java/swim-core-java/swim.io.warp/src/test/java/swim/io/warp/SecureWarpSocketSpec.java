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

package swim.io.warp;

import swim.io.IpServiceRef;
import swim.io.IpSocketRef;
import swim.io.http.HttpClient;
import swim.io.http.HttpEndpoint;
import swim.io.http.HttpService;
import swim.uri.Uri;
import swim.ws.WsRequest;

public class SecureWarpSocketSpec extends WarpSocketBehaviors {
  final WarpSettings warpSettings = WarpSettings.standard().tlsSettings(TestTlsSettings.tlsSettings());
  final Uri wsUri = Uri.parse("ws://127.0.0.1:23555/");

  @Override
  protected IpServiceRef bind(HttpEndpoint endpoint, HttpService service) {
    return endpoint.bindHttps("127.0.0.1", 23555, service, this.warpSettings.httpSettings());
  }

  @Override
  protected IpSocketRef connect(HttpEndpoint endpoint, final WarpSocket socket) {
    final WsRequest wsRequest = this.warpSettings.wsSettings().handshakeRequest(this.wsUri);
    final HttpClient client = new AbstractWarpClient(this.warpSettings) {
      @Override
      public void didConnect() {
        super.didConnect();
        doRequest(upgrade(socket, wsRequest));
      }
    };
    return endpoint.connectHttps("127.0.0.1", 23555, client, this.warpSettings.httpSettings());
  }
}
