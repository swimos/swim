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

  public HttpOptions options() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.options();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public boolean isOpening() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.isOpening();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public boolean isOpen() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.isOpen();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public @Nullable InetSocketAddress localAddress() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.localAddress();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public @Nullable InetSocketAddress remoteAddress() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.remoteAddress();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public @Nullable SSLSession sslSession() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.sslSession();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public boolean isReading() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.isReading();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public boolean isDoneReading() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.isDoneReading();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  protected boolean readRequest() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.readRequest();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  protected HttpRequest<?> request() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.request();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public Decode<? extends HttpRequest<?>> requestMessage() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.requestMessage();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public Decode<? extends HttpPayload<?>> requestPayload() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.requestPayload();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public boolean isWriting() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.isWriting();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public boolean isDoneWriting() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.isDoneWriting();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  protected boolean writeResponse(HttpResponse<?> response) {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.writeResponse(response);
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  protected HttpResponse<?> response() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.response();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public Encode<? extends HttpResponse<?>> responseMessage() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.responseMessage();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public Encode<? extends HttpPayload<?>> responsePayload() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      return context.responsePayload();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  protected void become(HttpResponder responder) {
    final HttpResponderContext context = this.context;
    if (context != null) {
      context.become(responder);
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  protected void become(NetSocket socket) {
    final HttpResponderContext context = this.context;
    if (context != null) {
      context.become(socket);
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

  public void close() {
    final HttpResponderContext context = this.context;
    if (context != null) {
      context.close();
    } else {
      throw new IllegalStateException("Unbound responder");
    }
  }

}
