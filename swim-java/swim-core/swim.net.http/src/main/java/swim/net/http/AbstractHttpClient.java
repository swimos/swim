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

  public HttpOptions httpOptions() {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.httpOptions();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  public boolean connect(InetSocketAddress remoteAddress) {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.connect(remoteAddress);
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  public boolean connect(String address, int port) {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.connect(address, port);
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  public boolean isConnecting() {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.isConnecting();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  public boolean isOpening() {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.isOpening();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  public boolean isOpen() {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.isOpen();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  public @Nullable InetSocketAddress localAddress() {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.localAddress();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  public @Nullable InetSocketAddress remoteAddress() {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.remoteAddress();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  public @Nullable SSLSession sslSession() {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.sslSession();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  public boolean isRequesting() {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.isRequesting();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  public boolean isResponding() {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.isResponding();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  protected void enqueueRequester(HttpRequester requester) {
    final HttpClientContext context = this.context;
    if (context != null) {
      context.enqueueRequester(requester);
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  protected void become(NetSocket socket) {
    final HttpClientContext context = this.context;
    if (context != null) {
      context.become(socket);
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  protected boolean isDoneReading() {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.isDoneReading();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  protected boolean doneReading() {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.doneReading();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  protected boolean isDoneWriting() {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.isDoneWriting();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  protected boolean doneWriting() {
    final HttpClientContext context = this.context;
    if (context != null) {
      return context.doneWriting();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public void doTimeout() {
    this.close();
  }

  public void close() {
    final HttpClientContext context = this.context;
    if (context != null) {
      context.close();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

}
