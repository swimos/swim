// Copyright 2015-2021 Swim Inc.
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

package swim.io.http;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.codec.Decoder;
import swim.codec.Utf8;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Cont;
import swim.http.Http;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.FlowControl;
import swim.io.FlowModifier;
import swim.io.IpModem;
import swim.io.IpModemContext;
import swim.io.IpSocket;

public class HttpServerModem implements IpModem<HttpRequest<?>, HttpResponse<?>>, HttpServerContext {

  protected final HttpServer server;
  protected final HttpSettings httpSettings;
  protected IpModemContext<HttpRequest<?>, HttpResponse<?>> context;
  volatile HttpServerResponder<?> requesting;
  volatile FingerTrieSeq<HttpServerResponder<?>> responders;

  public HttpServerModem(HttpServer server, HttpSettings httpSettings) {
    this.server = server;
    this.httpSettings = httpSettings;
    this.responders = FingerTrieSeq.empty();
  }

  @Override
  public IpModemContext<HttpRequest<?>, HttpResponse<?>> ipModemContext() {
    return this.context;
  }

  @Override
  public void setIpModemContext(IpModemContext<HttpRequest<?>, HttpResponse<?>> context) {
    this.context = context;
    this.server.setHttpServerContext(this);
  }

  @Override
  public long idleTimeout() {
    return this.server.idleTimeout();
  }

  @Override
  public void doRead() {
    // nop
  }

  @Override
  public void didRead(HttpRequest<?> request) {
    if (HttpServerModem.REQUESTING.get(this) == null) {
      this.willRequest(request);
    } else {
      this.didRequest(request);
    }
  }

  @Override
  public void doWrite() {
    // nop
  }

  @Override
  public void didWrite(HttpResponse<?> response) {
    this.didRespond(response);
  }

  @Override
  public void willConnect() {
    // nop
  }

  @Override
  public void didConnect() {
    this.server.didConnect();
  }

  @Override
  public void willSecure() {
    this.server.willSecure();
  }

  @Override
  public void didSecure() {
    this.server.didSecure();
  }

  @Override
  public void willBecome(IpSocket socket) {
    this.server.willBecome(socket);
  }

  @Override
  public void didBecome(IpSocket socket) {
    this.server.didBecome(socket);
  }

  @Override
  public void didTimeout() {
    Throwable failure = null;
    for (HttpServerResponder<?> responderContext : HttpServerModem.RESPONDERS.get(this)) {
      try {
        responderContext.didTimeout();
      } catch (Throwable cause) {
        if (!Cont.isNonFatal(cause)) {
          throw cause;
        }
        failure = cause;
      }
    }
    this.server.didTimeout();
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  @Override
  public void didDisconnect() {
    Throwable failure = null;
    do {
      final FingerTrieSeq<HttpServerResponder<?>> oldResponders = HttpServerModem.RESPONDERS.get(this);
      final FingerTrieSeq<HttpServerResponder<?>> newResponders = FingerTrieSeq.empty();
      if (oldResponders != newResponders) {
        if (HttpServerModem.RESPONDERS.compareAndSet(this, oldResponders, newResponders)) {
          for (HttpServerResponder<?> responderContext : oldResponders) {
            try {
              responderContext.didDisconnect();
            } catch (Throwable cause) {
              if (!Cont.isNonFatal(cause)) {
                throw cause;
              }
              failure = cause;
            }
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
    try {
      this.server.didDisconnect();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    this.close();
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  @Override
  public void didFail(Throwable error) {
    Throwable failure = null;
    do {
      final FingerTrieSeq<HttpServerResponder<?>> oldResponders = HttpServerModem.RESPONDERS.get(this);
      final FingerTrieSeq<HttpServerResponder<?>> newResponders = FingerTrieSeq.empty();
      if (oldResponders != newResponders) {
        if (HttpServerModem.RESPONDERS.compareAndSet(this, oldResponders, newResponders)) {
          for (HttpServerResponder<?> responderContext : oldResponders) {
            try {
              responderContext.didFail(error);
            } catch (Throwable cause) {
              if (!Cont.isNonFatal(cause)) {
                throw cause;
              }
              failure = cause;
            }
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
    try {
      this.server.didFail(error);
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    this.close();
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  @Override
  public boolean isConnected() {
    final IpModemContext<HttpRequest<?>, HttpResponse<?>> context = this.context;
    return context != null && context.isConnected();
  }

  @Override
  public boolean isClient() {
    return false;
  }

  @Override
  public boolean isServer() {
    return true;
  }

  @Override
  public boolean isSecure() {
    final IpModemContext<HttpRequest<?>, HttpResponse<?>> context = this.context;
    return context != null && context.isSecure();
  }

  @Override
  public String securityProtocol() {
    return this.context.securityProtocol();
  }

  @Override
  public String cipherSuite() {
    return this.context.cipherSuite();
  }

  @Override
  public InetSocketAddress localAddress() {
    return this.context.localAddress();
  }

  @Override
  public Principal localPrincipal() {
    return this.context.localPrincipal();
  }

  @Override
  public Collection<Certificate> localCertificates() {
    return this.context.localCertificates();
  }

  @Override
  public InetSocketAddress remoteAddress() {
    return this.context.remoteAddress();
  }

  @Override
  public Principal remotePrincipal() {
    return this.context.remotePrincipal();
  }

  @Override
  public Collection<Certificate> remoteCertificates() {
    return this.context.remoteCertificates();
  }

  @Override
  public FlowControl flowControl() {
    return this.context.flowControl();
  }

  @Override
  public void flowControl(FlowControl flowControl) {
    this.context.flowControl(flowControl);
  }

  @Override
  public FlowControl flowControl(FlowModifier flowModifier) {
    return this.context.flowControl(flowModifier);
  }

  @Override
  public HttpSettings httpSettings() {
    return this.httpSettings;
  }

  @Override
  public void readRequest() {
    this.doReadRequestMessage();
  }

  @Override
  public void become(IpSocket socket) {
    this.context.become(socket);
  }

  @Override
  public void close() {
    this.context.close();
  }

  void doReadRequestMessage() {
    this.context.read(Utf8.decodedParser(Http.standardParser().requestParser()));
  }

  void doReadRequestEntity(Decoder<HttpRequest<?>> entityDecoder) {
    if (entityDecoder.isCont()) {
      this.context.read(entityDecoder);
    } else {
      this.didRead(entityDecoder.bind());
    }
  }

  @SuppressWarnings("unchecked")
  void willRequest(HttpRequest<?> request) {
    final HttpResponder<?> responder = this.server.doRequest(request);
    final HttpServerResponder<?> responderContext = new HttpServerResponder<Object>(this, (HttpResponder<Object>) responder);
    responder.setHttpResponderContext(responderContext);
    if (!HttpServerModem.REQUESTING.compareAndSet(this, null, responderContext)) {
      throw new AssertionError();
    }
    do {
      final FingerTrieSeq<HttpServerResponder<?>> oldResponders = HttpServerModem.RESPONDERS.get(this);
      final FingerTrieSeq<HttpServerResponder<?>> newResponders = oldResponders.appended(responderContext);
      if (HttpServerModem.RESPONDERS.compareAndSet(this, oldResponders, newResponders)) {
        this.server.willRequest(request);
        responderContext.willRequest(request);
        if (oldResponders.isEmpty()) {
          responderContext.doRespond();
        }
        break;
      }
    } while (true);
  }

  void didRequest(HttpRequest<?> request) {
    final HttpServerResponder<?> responderContext = HttpServerModem.REQUESTING.getAndSet(this, null);
    responderContext.didRequest(request);
    this.server.didRequest(request);
    responderContext.doRespond(request);
  }

  void doWriteResponse(HttpResponse<?> response) {
    this.willRespond(response);
    this.context.write(response.httpEncoder());
  }

  void willRespond(HttpResponse<?> response) {
    this.server.willRespond(response);
    HttpServerModem.RESPONDERS.get(this).head().willRespond(response);
  }

  void didRespond(HttpResponse<?> response) {
    do {
      final FingerTrieSeq<HttpServerResponder<?>> oldResponders = HttpServerModem.RESPONDERS.get(this);
      final FingerTrieSeq<HttpServerResponder<?>> newResponders = oldResponders.tail();
      if (HttpServerModem.RESPONDERS.compareAndSet(this, oldResponders, newResponders)) {
        final HttpServerResponder<?> responderContext = oldResponders.head();
        responderContext.didRespond(response);
        this.server.didRespond(response);
        if (!newResponders.isEmpty()) {
          newResponders.head().doRespond();
        }
        break;
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<HttpServerModem, HttpServerResponder<?>> REQUESTING =
      AtomicReferenceFieldUpdater.newUpdater(HttpServerModem.class, (Class<HttpServerResponder<?>>) (Class<?>) HttpServerResponder.class, "requesting");
  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<HttpServerModem, FingerTrieSeq<HttpServerResponder<?>>> RESPONDERS =
      AtomicReferenceFieldUpdater.newUpdater(HttpServerModem.class, (Class<FingerTrieSeq<HttpServerResponder<?>>>) (Class<?>) FingerTrieSeq.class, "responders");

}
