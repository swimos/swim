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

public class HttpClientModem implements IpModem<HttpResponse<?>, HttpRequest<?>>, HttpClientContext {

  protected final HttpClient client;
  protected final HttpSettings httpSettings;
  protected IpModemContext<HttpResponse<?>, HttpRequest<?>> context;
  volatile FingerTrieSeq<HttpClientRequester<?>> requesters;
  volatile FingerTrieSeq<HttpClientRequester<?>> responders;
  volatile HttpClientRequester<?> responding;

  public HttpClientModem(HttpClient client, HttpSettings httpSettings) {
    this.client = client;
    this.httpSettings = httpSettings;
    this.requesters = FingerTrieSeq.empty();
    this.responders = FingerTrieSeq.empty();
  }

  @Override
  public IpModemContext<HttpResponse<?>, HttpRequest<?>> ipModemContext() {
    return this.context;
  }

  @Override
  public void setIpModemContext(IpModemContext<HttpResponse<?>, HttpRequest<?>> context) {
    this.context = context;
    this.client.setHttpClientContext(this);
  }

  @Override
  public long idleTimeout() {
    return this.client.idleTimeout();
  }

  @Override
  public void doRead() {
    // nop
  }

  @Override
  public void didRead(HttpResponse<?> response) {
    if (HttpClientModem.RESPONDING.get(this) == null) {
      this.willRespond(response);
    } else {
      this.didRespond(response);
    }
  }

  @Override
  public void doWrite() {
    // nop
  }

  @Override
  public void didWrite(HttpRequest<?> request) {
    this.didRequest(request);
  }

  @Override
  public void willConnect() {
    this.client.willConnect();
  }

  @Override
  public void didConnect() {
    this.client.didConnect();
  }

  @Override
  public void willSecure() {
    this.client.willSecure();
  }

  @Override
  public void didSecure() {
    this.client.didSecure();
  }

  @Override
  public void willBecome(IpSocket socket) {
    this.client.willBecome(socket);
  }

  @Override
  public void didBecome(IpSocket socket) {
    this.client.didBecome(socket);
  }

  @Override
  public void didTimeout() {
    Throwable failure = null;
    for (HttpClientRequester<?> responderContext : HttpClientModem.RESPONDERS.get(this)) {
      try {
        responderContext.didTimeout();
      } catch (Throwable cause) {
        if (!Cont.isNonFatal(cause)) {
          throw cause;
        }
        failure = cause;
      }
    }
    this.client.didTimeout();
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  @Override
  public void didDisconnect() {
    Throwable failure = null;
    HttpClientModem.REQUESTERS.set(this, FingerTrieSeq.<HttpClientRequester<?>>empty());
    do {
      final FingerTrieSeq<HttpClientRequester<?>> oldResponders = HttpClientModem.RESPONDERS.get(this);
      final FingerTrieSeq<HttpClientRequester<?>> newResponders = FingerTrieSeq.empty();
      if (oldResponders != newResponders) {
        if (HttpClientModem.RESPONDERS.compareAndSet(this, oldResponders, newResponders)) {
          for (HttpClientRequester<?> responderContext : oldResponders) {
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
      this.client.didDisconnect();
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
    HttpClientModem.REQUESTERS.set(this, FingerTrieSeq.<HttpClientRequester<?>>empty());
    do {
      final FingerTrieSeq<HttpClientRequester<?>> oldResponders = HttpClientModem.RESPONDERS.get(this);
      final FingerTrieSeq<HttpClientRequester<?>> newResponders = FingerTrieSeq.empty();
      if (oldResponders != newResponders) {
        if (HttpClientModem.RESPONDERS.compareAndSet(this, oldResponders, newResponders)) {
          for (HttpClientRequester<?> responderContext : oldResponders) {
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
      this.client.didFail(error);
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
    final IpModemContext<HttpResponse<?>, HttpRequest<?>> context = this.context;
    return context != null && context.isConnected();
  }

  @Override
  public boolean isClient() {
    return true;
  }

  @Override
  public boolean isServer() {
    return false;
  }

  @Override
  public boolean isSecure() {
    final IpModemContext<HttpResponse<?>, HttpRequest<?>> context = this.context;
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

  @SuppressWarnings("unchecked")
  @Override
  public void doRequest(HttpRequester<?> requester) {
    final HttpClientRequester<?> requesterContext = new HttpClientRequester<Object>(this, (HttpRequester<Object>) requester);
    requester.setHttpRequesterContext(requesterContext);
    outer: do {
      final FingerTrieSeq<HttpClientRequester<?>> oldRequesters = HttpClientModem.REQUESTERS.get(this);
      final FingerTrieSeq<HttpClientRequester<?>> newRequesters = oldRequesters.appended(requesterContext);
      if (HttpClientModem.REQUESTERS.compareAndSet(this, oldRequesters, newRequesters)) {
        do {
          final FingerTrieSeq<HttpClientRequester<?>> oldResponders = HttpClientModem.RESPONDERS.get(this);
          final FingerTrieSeq<HttpClientRequester<?>> newResponders = oldResponders.appended(requesterContext);
          if (HttpClientModem.RESPONDERS.compareAndSet(this, oldResponders, newResponders)) {
            if (oldRequesters.isEmpty()) {
              requesterContext.doRequest();
            }
            break outer;
          }
        } while (true);
      }
    } while (true);
  }

  @Override
  public void readResponse() {
    this.doReadResponseMessage();
  }

  @Override
  public void become(IpSocket socket) {
    this.context.become(socket);
  }

  @Override
  public void close() {
    this.context.close();
  }

  void doWriteRequest(HttpRequest<?> request) {
    this.willRequest(request);
    this.context.write(request.httpEncoder());
  }

  void willRequest(HttpRequest<?> request) {
    this.client.willRequest(request);
    HttpClientModem.RESPONDERS.get(this).head().willRequest(request);
  }

  void didRequest(HttpRequest<?> request) {
    do {
      final FingerTrieSeq<HttpClientRequester<?>> oldRequesters = HttpClientModem.REQUESTERS.get(this);
      final FingerTrieSeq<HttpClientRequester<?>> newRequesters = oldRequesters.tail();
      if (HttpClientModem.REQUESTERS.compareAndSet(this, oldRequesters, newRequesters)) {
        final HttpClientRequester<?> requesterContext = oldRequesters.head();
        requesterContext.didRequest(request);
        this.client.didRequest(request);
        if (!newRequesters.isEmpty()) {
          newRequesters.head().doRequest();
        }
        break;
      }
    } while (true);
  }

  void doReadResponseMessage() {
    this.context.read(Utf8.decodedParser(Http.standardParser().responseParser()));
  }

  void doReadResponsePayload(Decoder<HttpResponse<?>> payloadDecoder) {
    if (payloadDecoder.isCont()) {
      this.context.read(payloadDecoder);
    } else {
      this.didRead(payloadDecoder.bind());
    }
  }

  void willRespond(HttpResponse<?> response) {
    do {
      final FingerTrieSeq<HttpClientRequester<?>> oldResponders = HttpClientModem.RESPONDERS.get(this);
      final FingerTrieSeq<HttpClientRequester<?>> newResponders = oldResponders.tail();
      if (HttpClientModem.RESPONDERS.compareAndSet(this, oldResponders, newResponders)) {
        final HttpClientRequester<?> requesterContext = oldResponders.head();
        if (!HttpClientModem.RESPONDING.compareAndSet(this, null, requesterContext)) {
          throw new AssertionError();
        }
        requesterContext.willRespond(response);
        this.client.willRespond(response);
        break;
      }
    } while (true);
  }

  void didRespond(HttpResponse<?> response) {
    final HttpClientRequester<?> requesterContext = HttpClientModem.RESPONDING.getAndSet(this, null);
    requesterContext.didRespond(response);
    this.client.didRespond(response);
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<HttpClientModem, FingerTrieSeq<HttpClientRequester<?>>> REQUESTERS =
      AtomicReferenceFieldUpdater.newUpdater(HttpClientModem.class, (Class<FingerTrieSeq<HttpClientRequester<?>>>) (Class<?>) FingerTrieSeq.class, "requesters");
  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<HttpClientModem, FingerTrieSeq<HttpClientRequester<?>>> RESPONDERS =
      AtomicReferenceFieldUpdater.newUpdater(HttpClientModem.class, (Class<FingerTrieSeq<HttpClientRequester<?>>>) (Class<?>) FingerTrieSeq.class, "responders");
  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<HttpClientModem, HttpClientRequester<?>> RESPONDING =
      AtomicReferenceFieldUpdater.newUpdater(HttpClientModem.class, (Class<HttpClientRequester<?>>) (Class<?>) HttpClientRequester.class, "responding");

}
