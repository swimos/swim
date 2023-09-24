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

package swim.net.ws;

import swim.annotations.Public;
import swim.annotations.Since;
import swim.http.HttpException;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.header.ConnectionHeader;
import swim.net.http.AbstractHttpResponder;
import swim.util.Result;
import swim.ws.WsEngine;

@Public
@Since("5.0")
public class WebSocketResponder extends AbstractHttpResponder {

  protected final WebSocket webSocket;
  protected WsEngine engine;

  public WebSocketResponder(WebSocket webSocket, WsEngine engine) {
    this.webSocket = webSocket;
    this.engine = engine;
  }

  public final WebSocket webSocket() {
    return this.webSocket;
  }

  public final WsEngine engine() {
    return this.engine;
  }

  @Override
  public void didReadRequestMessage(Result<HttpRequest<?>> requestResult) throws HttpException {
    if (requestResult.isError()) {
      this.writeResponse(HttpResponse.of(HttpStatus.NOT_FOUND, ConnectionHeader.CLOSE));
      return;
    }

    final HttpRequest<?> request = requestResult.getNonNull();
    final WsEngine engine = this.engine.acceptHandshakeRequest(request);
    if (engine == null) {
      this.writeResponse(HttpResponse.of(HttpStatus.NOT_FOUND, ConnectionHeader.CLOSE));
      return;
    }

    this.engine = engine;
    this.writeResponse(engine.handshakeResponse(request));
  }

  @Override
  public void didWriteResponseMessage(Result<HttpResponse<?>> responseResult) throws HttpException {
    if (responseResult.isError()) {
      this.close();
      return;
    }

    final HttpRequest<?> request = this.requestResult().getNonNull();
    final HttpResponse<?> response = responseResult.getNonNull();
    if (response.status().code() != HttpStatus.SWITCHING_PROTOCOLS.code()) {
      this.close();
      return;
    }

    this.become(new WebSocketStream(this.webSocket, request, response,
                                    this.engine, this.serverContext()));
  }

}
