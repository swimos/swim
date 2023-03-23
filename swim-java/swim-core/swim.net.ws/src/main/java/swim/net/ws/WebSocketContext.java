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

package swim.net.ws;

import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.InputFuture;
import swim.codec.OutputFuture;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.net.ConnectionContext;
import swim.ws.WsFrame;
import swim.ws.WsOptions;

@Public
@Since("5.0")
public interface WebSocketContext extends ConnectionContext, InputFuture, OutputFuture {

  /**
   * Returns the bound websocket.
   */
  WebSocket webSocket();

  WsOptions options();

  HttpRequest<?> handshakeRequest();

  HttpResponse<?> handshakeResponse();

  boolean readFrame();

  boolean writeFrame(WsFrame<?> frame);

  boolean writeContinuation();

  boolean isClosing();

  boolean isDoneReading();

  boolean isDoneWriting();

  /**
   * Closes the websocket connection.
   */
  void close();

}
