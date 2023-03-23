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
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.net.NetSocket;
import swim.util.Result;

@Public
@Since("5.0")
public abstract class AbstractHttpResponder implements HttpResponder {

  protected @Nullable HttpResponderContext context;

  protected AbstractHttpResponder() {
    this.context = null;
  }

  @Override
  public final @Nullable HttpResponderContext responderContext() {
    return this.context;
  }

  @Override
  public void setResponderContext(@Nullable HttpResponderContext context) {
    this.context = context;
  }

  public HttpServerContext serverContext() {
    final HttpResponderContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound responder");
    }
    return context.serverContext();
  }

  public HttpOptions options() {
    final HttpResponderContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound responder");
    }
    return context.options();
  }

  public boolean isOpening() {
    final HttpResponderContext context = this.context;
    return context != null && context.isOpening();
  }

  public boolean isOpen() {
    final HttpResponderContext context = this.context;
    return context != null && context.isOpen();
  }

  public @Nullable InetSocketAddress localAddress() {
    final HttpResponderContext context = this.context;
    return context != null ? context.localAddress() : null;
  }

  public @Nullable InetSocketAddress remoteAddress() {
    final HttpResponderContext context = this.context;
    return context != null ? context.remoteAddress() : null;
  }

  public @Nullable SSLSession sslSession() {
    final HttpResponderContext context = this.context;
    return context != null ? context.sslSession() : null;
  }

  public boolean isReading() {
    final HttpResponderContext context = this.context;
    return context != null && context.isReading();
  }

  public boolean isDoneReading() {
    final HttpResponderContext context = this.context;
    return context != null && context.isDoneReading();
  }

  protected boolean readRequest() {
    final HttpResponderContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound responder");
    }
    return context.readRequest();
  }

  public Result<HttpRequest<?>> requestResult() {
    final HttpResponderContext context = this.context;
    if (context == null) {
      return Result.error(new IllegalStateException("Unbound responder"));
    }
    return context.requestResult();
  }

  public boolean isWriting() {
    final HttpResponderContext context = this.context;
    return context != null && context.isWriting();
  }

  public boolean isDoneWriting() {
    final HttpResponderContext context = this.context;
    return context != null && context.isDoneWriting();
  }

  protected boolean writeResponse(HttpResponse<?> response) {
    final HttpResponderContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound responder");
    }
    return context.writeResponse(response);
  }

  public Result<HttpResponse<?>> responseResult() {
    final HttpResponderContext context = this.context;
    if (context == null) {
      return Result.error(new IllegalStateException("Unbound responder"));
    }
    return context.responseResult();
  }

  protected void become(HttpResponder responder) {
    final HttpResponderContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound responder");
    }
    context.become(responder);
  }

  protected void become(NetSocket socket) {
    final HttpResponderContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound responder");
    }
    context.become(socket);
  }

  public void close() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      context.close();
    }
  }

}
