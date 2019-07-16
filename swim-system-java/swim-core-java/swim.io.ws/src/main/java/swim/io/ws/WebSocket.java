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

import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.IpSocket;
import swim.ws.WsFrame;

public interface WebSocket<I, O> {
  WebSocketContext<I, O> webSocketContext();

  void setWebSocketContext(WebSocketContext<I, O> context);

  long idleTimeout();

  void doRead();

  void didRead(WsFrame<? extends I> frame);

  void doWrite();

  void didWrite(WsFrame<? extends O> frame);

  void didUpgrade(HttpRequest<?> httpRequest, HttpResponse<?> httpResponse);

  void willConnect();

  void didConnect();

  void willSecure();

  void didSecure();

  void willBecome(IpSocket socket);

  void didBecome(IpSocket socket);

  void didTimeout();

  void didDisconnect();

  void didFail(Throwable error);
}
