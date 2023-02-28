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
import swim.codec.Decode;
import swim.codec.Encode;
import swim.http.HttpPayload;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.net.NetSocket;

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

  public HttpOptions options() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.options();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public boolean isConnecting() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.isConnecting();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public boolean isOpening() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.isOpening();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public boolean isOpen() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.isOpen();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public @Nullable InetSocketAddress localAddress() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.localAddress();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public @Nullable InetSocketAddress remoteAddress() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.remoteAddress();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public @Nullable SSLSession sslSession() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.sslSession();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public boolean isWriting() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.isWriting();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public boolean isDoneWriting() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.isDoneWriting();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  protected boolean writeRequest(HttpRequest<?> request) {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.writeRequest(request);
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  protected HttpRequest<?> request() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.request();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public Encode<? extends HttpRequest<?>> requestMessage() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.requestMessage();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public Encode<? extends HttpPayload<?>> requestPayload() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.requestPayload();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public boolean isReading() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.isReading();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public boolean isDoneReading() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.isDoneReading();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  protected boolean readResponse() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.readResponse();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  protected HttpResponse<?> response() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.response();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public Decode<? extends HttpResponse<?>> responseMessage() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.responseMessage();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public Decode<? extends HttpPayload<?>> responsePayload() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      return context.responsePayload();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  protected void become(HttpRequester requester) {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      context.become(requester);
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  protected void become(NetSocket socket) {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      context.become(socket);
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

  public void close() {
    final HttpRequesterContext context = this.context;
    if (context != null) {
      context.close();
    } else {
      throw new IllegalStateException("Unbound requester");
    }
  }

}
