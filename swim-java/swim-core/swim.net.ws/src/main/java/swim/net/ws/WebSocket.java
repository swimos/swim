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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Result;
import swim.ws.WsContinuation;
import swim.ws.WsException;
import swim.ws.WsFrame;
import swim.ws.WsSubprotocol;

@Public
@Since("5.0")
public interface WebSocket {

  @Nullable WebSocketContext webSocketContext();

  void setWebSocketContext(@Nullable WebSocketContext webSocketContext);

  /**
   * Returns the number of idle milliseconds after which this socket should
   * be closed due to inactivity. Returns {@code -1} if a default idle timeout
   * should be used. Returns {@code 0} if the socket should not time out.
   */
  default long idleTimeout() {
    return -1;
  }

  default void didOpen() {
    // hook
  }

  default WsSubprotocol<?> subprotocol() {
    return WsSubprotocol.generic();
  }

  default void willReadFrame() throws WsException {
    final WebSocketContext context = this.webSocketContext();
    if (context == null) {
      throw new IllegalStateException("unbound websocket");
    }
    context.readFrame();
  }

  default void didReadFrame(Result<? extends WsFrame<?>> frameResult) throws WsException {
    // hook
  }

  default void willWriteFrame() throws WsException {
    // hook
  }

  default void didWriteFrame(Result<? extends WsFrame<?>> frameResult) throws WsException {
    final WebSocketContext context = this.webSocketContext();
    if (context == null) {
      throw new IllegalStateException("unbound websocket");
    }

    if (frameResult.isOk()) {
      final WsFrame<?> frame = frameResult.getNonNull();
      if (frame instanceof WsContinuation<?>) {
        context.writeContinuation();
      }
    }
  }

  default void doTimeout() {
    final WebSocketContext context = this.webSocketContext();
    if (context != null) {
      context.close();
    }
  }

  default void willClose() {
    // hook
  }

  default void didClose() {
    // hook
  }

}
