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

package swim.service.warp;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import swim.api.auth.Identity;
import swim.codec.Decoder;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.IpSocket;
import swim.io.http.HttpResponder;
import swim.io.http.HttpResponderContext;
import swim.runtime.HttpBinding;
import swim.runtime.HttpContext;
import swim.uri.Uri;

public class WarpServiceHttpResponder implements HttpBinding, HttpResponder<Object> {
  final Uri meshUri;
  final Uri hostUri;
  final Uri nodeUri;
  final Uri laneUri;
  final HttpRequest<?> request;
  HttpContext httpContext;
  HttpResponderContext httpResponderContext;

  WarpServiceHttpResponder(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri, HttpRequest<?> request) {
    this.meshUri = meshUri;
    this.hostUri = hostUri;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
    this.request = request;
  }

  @Override
  public HttpContext httpContext() {
    return this.httpContext;
  }

  @Override
  public void setHttpContext(HttpContext httpContext) {
    this.httpContext = httpContext;
  }

  @Override
  public HttpResponderContext httpResponderContext() {
    return this.httpResponderContext;
  }

  @Override
  public void setHttpResponderContext(HttpResponderContext httpResponderContext) {
    this.httpResponderContext = httpResponderContext;
  }

  @Override
  public Uri meshUri() {
    return this.meshUri;
  }

  @Override
  public Uri hostUri() {
    return this.hostUri;
  }

  @Override
  public Uri nodeUri() {
    return this.nodeUri;
  }

  @Override
  public Uri laneUri() {
    return this.laneUri;
  }

  @Override
  public Uri requestUri() {
    return this.request.uri();
  }

  @Override
  public HttpRequest<?> request() {
    return this.request;
  }

  @Override
  public boolean isConnectedDown() {
    return this.httpResponderContext.isConnected();
  }

  @Override
  public boolean isRemoteDown() {
    return true;
  }

  @Override
  public boolean isSecureDown() {
    return this.httpResponderContext.isSecure();
  }

  @Override
  public String securityProtocolDown() {
    return this.httpResponderContext.securityProtocol();
  }

  @Override
  public String cipherSuiteDown() {
    return this.httpResponderContext.cipherSuite();
  }

  @Override
  public InetSocketAddress localAddressDown() {
    return this.httpResponderContext.localAddress();
  }

  @Override
  public Identity localIdentityDown() {
    return null; // TODO
  }

  @Override
  public Principal localPrincipalDown() {
    return this.httpResponderContext.localPrincipal();
  }

  @Override
  public Collection<Certificate> localCertificatesDown() {
    return this.httpResponderContext.localCertificates();
  }

  @Override
  public InetSocketAddress remoteAddressDown() {
    return this.httpResponderContext.remoteAddress();
  }

  @Override
  public Identity remoteIdentityDown() {
    return null; // TODO
  }

  @Override
  public Principal remotePrincipalDown() {
    return this.httpResponderContext.remotePrincipal();
  }

  @Override
  public Collection<Certificate> remoteCertificatesDown() {
    return this.httpResponderContext.remoteCertificates();
  }

  @Override
  public HttpRequest<?> doRequest() {
    return this.request;
  }

  @SuppressWarnings("unchecked")
  @Override
  public Decoder<Object> contentDecoder(HttpRequest<?> request) {
    return this.httpContext.decodeRequest(request);
  }

  @Override
  public void willRequest(HttpRequest<?> request) {
    this.httpContext.willRequest(request);
  }

  @Override
  public void didRequest(HttpRequest<Object> request) {
    this.httpContext.didRequest(request);
  }

  @Override
  public void writeResponse(HttpResponse<?> response) {
    this.httpResponderContext.writeResponse(response);
  }

  @Override
  public void willRespond(HttpResponse<?> response) {
    this.httpContext.willRespond(response);
  }

  @Override
  public void didRespond(HttpResponse<?> response) {
    this.httpContext.didRespond(response);
  }

  @Override
  public void willBecome(IpSocket socket) {
    // nop
  }

  @Override
  public void didBecome(IpSocket socket) {
    // nop
  }

  @Override
  public void didTimeout() {
    // nop
  }

  @Override
  public void didDisconnect() {
    // nop
  }

  @Override
  public void closeDown() {
    this.httpResponderContext.close();
  }

  @Override
  public void didFail(Throwable error) {
    this.httpContext.closeUp();
    closeDown();
  }

  @Override
  public void traceDown(Object message) {
    // nop
  }

  @Override
  public void debugDown(Object message) {
    // nop
  }

  @Override
  public void infoDown(Object message) {
    // nop
  }

  @Override
  public void warnDown(Object message) {
    // nop
  }

  @Override
  public void errorDown(Object message) {
    // nop
  }
}
