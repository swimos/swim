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

package swim.io.ws;

import swim.codec.Decoder;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.IpSocket;
import swim.io.IpSocketModem;
import swim.io.http.AbstractHttpResponder;
import swim.ws.WsDecoder;
import swim.ws.WsEncoder;
import swim.ws.WsEngine;
import swim.ws.WsResponse;

public class WsUpgradeResponder extends AbstractHttpResponder<Object> {
  final WebSocket<?, ?> webSocket;
  final WsResponse wsResponse;
  final WsSettings wsSettings;

  public WsUpgradeResponder(WebSocket<?, ?> webSocket, WsResponse wsResponse, WsSettings wsSettings) {
    this.webSocket = webSocket;
    this.wsResponse = wsResponse;
    this.wsSettings = wsSettings;
  }

  public final WebSocket<?, ?> webSocket() {
    return this.webSocket;
  }

  public final WsResponse wsResponse() {
    return this.wsResponse;
  }

  public final WsSettings wsSettings() {
    return this.wsSettings;
  }

  @SuppressWarnings("unchecked")
  public IpSocket createSocket(WsEngine engine) {
    final WebSocket<Object, Object> socket = (WebSocket<Object, Object>) this.webSocket;
    final WsDecoder decoder = engine.decoder();
    final WsEncoder encoder = engine.encoder();
    return new IpSocketModem<Object, Object>(new WebSocketModem<Object, Object>(socket, this.wsSettings,
                                                                                decoder, encoder));
  }

  @Override
  public Decoder<Object> contentDecoder(HttpRequest<?> httpRequest) {
    return Decoder.done();
  }

  @Override
  public void doRespond(HttpRequest<Object> httpRequest) {
    writeResponse(this.wsResponse.httpResponse());
  }

  @Override
  public void didRespond(HttpResponse<?> httpResponse) {
    final WsEngine engine = this.wsResponse.serverEngine(this.wsSettings);
    final IpSocket socket = createSocket(engine);
    become(socket);
    this.webSocket.didConnect();
    this.webSocket.didUpgrade(this.wsResponse.httpRequest(), httpResponse);
  }

  @Override
  public void didDisconnect() {
    this.webSocket.didDisconnect();
  }
}
