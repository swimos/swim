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
public abstract class AbstractHttpClient implements HttpClient {

  protected @Nullable HttpClientContext context;

  protected AbstractHttpClient() {
    this.context = null;
  }

  @Override
  public final @Nullable HttpClientContext clientContext() {
    return this.context;
  }

  @Override
  public void setClientContext(@Nullable HttpClientContext context) {
    this.context = context;
  }

  public HttpOptions options() {
    final HttpClientContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.options();
  }

  public boolean connect(InetSocketAddress remoteAddress) {
    final HttpClientContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.connect(remoteAddress);
  }

  public boolean connect(String address, int port) {
    final HttpClientContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.connect(address, port);
  }

  public boolean isConnecting() {
    final HttpClientContext context = this.context;
    return context != null && context.isConnecting();
  }

  public boolean isOpening() {
    final HttpClientContext context = this.context;
    return context != null && context.isOpening();
  }

  public boolean isOpen() {
    final HttpClientContext context = this.context;
    return context != null && context.isOpen();
  }

  public @Nullable InetSocketAddress localAddress() {
    final HttpClientContext context = this.context;
    return context != null ? context.localAddress() : null;
  }

  public @Nullable InetSocketAddress remoteAddress() {
    final HttpClientContext context = this.context;
    return context != null ? context.remoteAddress() : null;
  }

  public @Nullable SSLSession sslSession() {
    final HttpClientContext context = this.context;
    return context != null ? context.sslSession() : null;
  }

  public boolean isRequesting() {
    final HttpClientContext context = this.context;
    return context != null && context.isRequesting();
  }

  public boolean isResponding() {
    final HttpClientContext context = this.context;
    return context != null && context.isResponding();
  }

  protected boolean enqueueRequester(HttpRequester requester) {
    final HttpClientContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.enqueueRequester(requester);
  }

  protected void become(NetSocket socket) {
    final HttpClientContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    context.become(socket);
  }

  public boolean isDoneReading() {
    final HttpClientContext context = this.context;
    return context != null && context.isDoneReading();
  }

  protected boolean doneReading() {
    final HttpClientContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.doneReading();
  }

  public boolean isDoneWriting() {
    final HttpClientContext context = this.context;
    return context != null && context.isDoneWriting();
  }

  protected boolean doneWriting() {
    final HttpClientContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.doneWriting();
  }

  public void close() {
    final HttpClientContext context = this.context;
    if (context != null) {
      context.close();
    }
  }

}
