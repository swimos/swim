// Copyright 2015-2022 Swim.inc
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

package swim.net.ws;

import swim.annotations.Public;
import swim.annotations.Since;
import swim.http.HttpException;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.net.http.AbstractHttpRequester;
import swim.util.Result;
import swim.ws.WsEngine;

@Public
@Since("5.0")
public class WebSocketRequester extends AbstractHttpRequester {

  protected final WebSocket webSocket;
  protected final WsEngine engine;
  protected final HttpRequest<?> handshakeRequest;

  public WebSocketRequester(WebSocket webSocket, WsEngine engine,
                            HttpRequest<?> handshakeRequest) {
    this.webSocket = webSocket;
    this.engine = engine;
    this.handshakeRequest = handshakeRequest;
  }

  public final WebSocket webSocket() {
    return this.webSocket;
  }

  public final WsEngine engine() {
    return this.engine;
  }

  public final HttpRequest<?> handshakeRequest() {
    return this.handshakeRequest;
  }

  @Override
  public void willWriteRequestMessage() throws HttpException {
    this.writeRequest(this.handshakeRequest);
  }

  @Override
  public void didReadResponseMessage(Result<HttpResponse<?>> responseResult) throws HttpException {
    if (responseResult.isError()) {
      this.close();
      return;
    }

    final HttpRequest<?> request = this.handshakeRequest;
    final HttpResponse<?> response = responseResult.getNonNull();
    final WsEngine engine = this.engine.acceptHandshakeResponse(request, response);
    if (engine == null) {
      this.close();
      return;
    }

    this.become(new WebSocketStream(this.webSocket, request, response,
                                    engine, this.clientContext()));
  }

}
