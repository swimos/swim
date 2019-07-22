// Copyright 2015-2019 SWIM.AI inc.
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
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import swim.codec.Decoder;
import swim.http.HttpException;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.FlowControl;
import swim.io.FlowModifier;
import swim.io.IpSocket;

public class HttpServerResponder<T> implements HttpResponderContext {
  protected final HttpServerModem modem;
  protected final HttpResponder<T> responder;
  volatile HttpResponse<?> response;
  volatile int status;

  public HttpServerResponder(HttpServerModem modem, HttpResponder<T> responder) {
    this.modem = modem;
    this.responder = responder;
  }

  @Override
  public boolean isConnected() {
    return this.modem.isConnected();
  }

  @Override
  public boolean isClient() {
    return this.modem.isClient();
  }

  @Override
  public boolean isServer() {
    return this.modem.isServer();
  }

  @Override
  public boolean isSecure() {
    return this.modem.isSecure();
  }

  @Override
  public String securityProtocol() {
    return this.modem.securityProtocol();
  }

  @Override
  public String cipherSuite() {
    return this.modem.cipherSuite();
  }

  @Override
  public InetSocketAddress localAddress() {
    return this.modem.localAddress();
  }

  @Override
  public Principal localPrincipal() {
    return this.modem.localPrincipal();
  }

  @Override
  public Collection<Certificate> localCertificates() {
    return this.modem.localCertificates();
  }

  @Override
  public InetSocketAddress remoteAddress() {
    return this.modem.remoteAddress();
  }

  @Override
  public Principal remotePrincipal() {
    return this.modem.remotePrincipal();
  }

  @Override
  public Collection<Certificate> remoteCertificates() {
    return this.modem.remoteCertificates();
  }

  @Override
  public FlowControl flowControl() {
    return this.modem.flowControl();
  }

  @Override
  public void flowControl(FlowControl flowControl) {
    this.modem.flowControl(flowControl);
  }

  @Override
  public FlowControl flowControl(FlowModifier flowModifier) {
    return this.modem.flowControl(flowModifier);
  }

  @Override
  public HttpSettings httpSettings() {
    return this.modem.httpSettings();
  }

  @Override
  public void writeResponse(HttpResponse<?> response) {
    this.response = response;
    do {
      final int oldStatus = STATUS.get(this);
      if ((oldStatus & RESPONDED) == 0) {
        final int newStatus = oldStatus | RESPONDED;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          if ((newStatus & RESPONDING) != 0) {
            this.modem.doWriteResponse(response);
          }
          break;
        }
      } else {
        throw new HttpException("already responded");
      }
    } while (true);
  }

  @Override
  public void become(IpSocket socket) {
    this.modem.become(socket);
  }

  @Override
  public void close() {
    this.modem.close();
  }

  @SuppressWarnings("unchecked")
  void willRequest(HttpRequest<?> request) {
    this.responder.willRequest(request);
    final Decoder<?> contentDecoder = this.responder.contentDecoder(request);
    final Decoder<HttpRequest<?>> entityDecoder = (Decoder<HttpRequest<?>>) request.entityDecoder(contentDecoder);
    this.modem.doReadRequestEntity(entityDecoder);
  }

  @SuppressWarnings("unchecked")
  void didRequest(HttpRequest<?> request) {
    this.responder.didRequest((HttpRequest<T>) request);
  }

  @SuppressWarnings("unchecked")
  void doRespond(HttpRequest<?> request) {
    this.responder.doRespond((HttpRequest<T>) request);
  }

  void doRespond() {
    do {
      final int oldStatus = STATUS.get(this);
      if ((oldStatus & RESPONDING) == 0) {
        final int newStatus = oldStatus | RESPONDING;
        if (STATUS.compareAndSet(this, oldStatus, newStatus)) {
          if ((newStatus & RESPONDED) != 0) {
            this.modem.doWriteResponse(this.response);
          }
          break;
        }
      } else {
        throw new AssertionError();
      }
    } while (true);
  }

  void willRespond(HttpResponse<?> response) {
    this.responder.willRespond(response);
  }

  void didRespond(HttpResponse<?> response) {
    this.responder.didRespond(response);
  }

  void willBecome(IpSocket socket) {
    this.responder.willBecome(socket);
  }

  void didBecome(IpSocket socket) {
    this.responder.didBecome(socket);
  }

  void didTimeout() {
    this.responder.didTimeout();
  }

  void didDisconnect() {
    this.responder.didDisconnect();
  }

  void didFail(Throwable error) {
    this.responder.didFail(error);
  }

  static final int RESPONDING = 1 << 0;
  static final int RESPONDED = 1 << 1;

  @SuppressWarnings("unchecked")
  static final AtomicIntegerFieldUpdater<HttpServerResponder<?>> STATUS =
      AtomicIntegerFieldUpdater.newUpdater((Class<HttpServerResponder<?>>) (Class<?>) HttpServerResponder.class, "status");
}
