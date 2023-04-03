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
public abstract class AbstractHttpRequester implements HttpRequester {

  protected @Nullable HttpRequesterContext context;

  protected AbstractHttpRequester() {
    this.context = null;
  }

  @Override
  public final @Nullable HttpRequesterContext requesterContext() {
    return this.context;
  }

  @Override
  public void setRequesterContext(@Nullable HttpRequesterContext context) {
    this.context = context;
  }

  public HttpClientContext clientContext() {
    final HttpRequesterContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound requester");
    }
    return context.clientContext();
  }

  public HttpOptions options() {
    final HttpRequesterContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound requester");
    }
    return context.options();
  }

  public boolean isConnecting() {
    final HttpRequesterContext context = this.context;
    return context != null && context.isConnecting();
  }

  public boolean isOpening() {
    final HttpRequesterContext context = this.context;
    return context != null && context.isOpening();
  }

  public boolean isOpen() {
    final HttpRequesterContext context = this.context;
    return context != null && context.isOpen();
  }

  public @Nullable InetSocketAddress localAddress() {
    final HttpRequesterContext context = this.context;
    return context != null ? context.localAddress() : null;
  }

  public @Nullable InetSocketAddress remoteAddress() {
    final HttpRequesterContext context = this.context;
    return context != null ? context.remoteAddress() : null;
  }

  public @Nullable SSLSession sslSession() {
    final HttpRequesterContext context = this.context;
    return context != null ? context.sslSession() : null;
  }

  public boolean isWriting() {
    final HttpRequesterContext context = this.context;
    return context != null && context.isWriting();
  }

  public boolean isDoneWriting() {
    final HttpRequesterContext context = this.context;
    return context != null && context.isDoneWriting();
  }

  protected boolean writeRequest(HttpRequest<?> request) {
    final HttpRequesterContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound requester");
    }
    return context.writeRequest(request);
  }

  public HttpRequest<?> request() {
    final HttpRequesterContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound requester");
    }
    return context.request();
  }

  public Result<HttpRequest<?>> requestResult() {
    final HttpRequesterContext context = this.context;
    if (context == null) {
      return Result.error(new IllegalStateException("unbound requester"));
    }
    return context.requestResult();
  }

  public boolean isReading() {
    final HttpRequesterContext context = this.context;
    return context != null && context.isReading();
  }

  public boolean isDoneReading() {
    final HttpRequesterContext context = this.context;
    return context != null && context.isDoneReading();
  }

  protected boolean readResponse() {
    final HttpRequesterContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound requester");
    }
    return context.readResponse();
  }

  public Result<HttpResponse<?>> responseResult() {
    final HttpRequesterContext context = this.context;
    if (context == null) {
      return Result.error(new IllegalStateException("unbound requester"));
    }
    return context.responseResult();
  }

  protected void become(HttpRequester requester) {
    final HttpRequesterContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound requester");
    }
    context.become(requester);
  }

  protected void become(NetSocket socket) {
    final HttpRequesterContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound requester");
    }
    context.become(socket);
  }

  public void close() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      context.close();
    }
  }

}
