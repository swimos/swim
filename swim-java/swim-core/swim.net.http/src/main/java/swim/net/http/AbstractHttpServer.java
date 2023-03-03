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

package swim.net.http;

import java.net.InetSocketAddress;
import javax.net.ssl.SSLSession;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.net.NetSocket;

@Public
@Since("5.0")
public abstract class AbstractHttpServer implements HttpServer {

  protected @Nullable HttpServerContext context;

  protected AbstractHttpServer() {
    this.context = null;
  }

  @Override
  public final @Nullable HttpServerContext serverContext() {
    return this.context;
  }

  @Override
  public void setServerContext(@Nullable HttpServerContext context) {
    this.context = context;
  }

  public HttpOptions options() {
    final HttpServerContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound server");
    }
    return context.options();
  }

  public boolean isOpening() {
    final HttpServerContext context = this.context;
    return context != null && context.isOpening();
  }

  public boolean isOpen() {
    final HttpServerContext context = this.context;
    return context != null && context.isOpen();
  }

  public @Nullable InetSocketAddress localAddress() {
    final HttpServerContext context = this.context;
    return context != null ? context.localAddress() : null;
  }

  public @Nullable InetSocketAddress remoteAddress() {
    final HttpServerContext context = this.context;
    return context != null ? context.remoteAddress() : null;
  }

  public @Nullable SSLSession sslSession() {
    final HttpServerContext context = this.context;
    return context != null ? context.sslSession() : null;
  }

  public boolean isRequesting() {
    final HttpServerContext context = this.context;
    return context != null && context.isRequesting();
  }

  public boolean isResponding() {
    final HttpServerContext context = this.context;
    return context != null && context.isResponding();
  }

  protected boolean enqueueRequester(HttpResponder responder) {
    final HttpServerContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound server");
    }
    return context.enqueueRequester(responder);
  }

  protected void become(NetSocket socket) {
    final HttpServerContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound server");
    }
    context.become(socket);
  }

  public boolean isDoneReading() {
    final HttpServerContext context = this.context;
    return context != null && context.isDoneReading();
  }

  protected boolean doneReading() {
    final HttpServerContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound server");
    }
    return context.doneReading();
  }

  public boolean isDoneWriting() {
    final HttpServerContext context = this.context;
    return context != null && context.isDoneWriting();
  }

  protected boolean doneWriting() {
    final HttpServerContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound server");
    }
    return context.doneWriting();
  }

  public void close() {
    final HttpServerContext context = this.context;
    if (context != null) {
      context.close();
    }
  }

}
