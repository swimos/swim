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

import java.net.InetSocketAddress;
import javax.net.ssl.SSLSession;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.ws.WsFrame;
import swim.ws.WsOptions;

@Public
@Since("5.0")
public abstract class AbstractWebSocket implements WebSocket {

  protected @Nullable WebSocketContext context;

  protected AbstractWebSocket() {
    this.context = null;
  }

  @Override
  public final @Nullable WebSocketContext webSocketContext() {
    return this.context;
  }

  @Override
  public void setWebSocketContext(@Nullable WebSocketContext context) {
    this.context = context;
  }

  public WsOptions options() {
    final WebSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound websocket");
    }
    return context.options();
  }

  public HttpRequest<?> handshakeRequest() {
    final WebSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound websocket");
    }
    return context.handshakeRequest();
  }

  public HttpResponse<?> handshakeResponse() {
    final WebSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound websocket");
    }
    return context.handshakeResponse();
  }

  public boolean isClient() {
    final WebSocketContext context = this.context;
    return context != null && context.isClient();
  }

  public boolean isServer() {
    final WebSocketContext context = this.context;
    return context != null && context.isServer();
  }

  public boolean isOpen() {
    final WebSocketContext context = this.context;
    return context != null && context.isOpen();
  }

  public @Nullable InetSocketAddress localAddress() {
    final WebSocketContext context = this.context;
    return context != null ? context.localAddress() : null;
  }

  public @Nullable InetSocketAddress remoteAddress() {
    final WebSocketContext context = this.context;
    return context != null ? context.remoteAddress() : null;
  }

  public @Nullable SSLSession sslSession() {
    final WebSocketContext context = this.context;
    return context != null ? context.sslSession() : null;
  }

  protected boolean readFrame() {
    final WebSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound websocket");
    }
    return context.readFrame();
  }

  protected boolean writeFrame(WsFrame<?> frame) {
    final WebSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound websocket");
    }
    return context.writeFrame(frame);
  }

  protected boolean writeContinuation() {
    final WebSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound websocket");
    }
    return context.writeContinuation();
  }

  public boolean isClosing() {
    final WebSocketContext context = this.context;
    return context != null && context.isClosing();
  }

  public boolean isDoneReading() {
    final WebSocketContext context = this.context;
    return context != null && context.isDoneReading();
  }

  public boolean isDoneWriting() {
    final WebSocketContext context = this.context;
    return context != null && context.isDoneWriting();
  }

  public void close() {
    final WebSocketContext context = this.context;
    if (context != null) {
      context.close();
    }
  }

}
