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

package swim.runtime.uplink;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import swim.api.auth.Identity;
import swim.api.http.HttpUplink;
import swim.codec.Decoder;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Stage;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.runtime.HttpBinding;
import swim.runtime.HttpContext;
import swim.uri.Uri;

public abstract class HttpUplinkModem implements HttpContext, HttpUplink {
  protected final HttpBinding httpBinding;

  public HttpUplinkModem(HttpBinding httpBinding) {
    this.httpBinding = httpBinding;
  }

  public HttpBinding getHttpBinding() {
    return this.httpBinding;
  }

  @Override
  public final Uri hostUri() {
    return this.httpBinding.hostUri();
  }

  @Override
  public final Uri nodeUri() {
    return this.httpBinding.nodeUri();
  }

  @Override
  public final Uri laneUri() {
    return this.httpBinding.laneUri();
  }

  @Override
  public final Uri requestUri() {
    return this.httpBinding.requestUri();
  }

  @Override
  public final HttpRequest<?> request() {
    return this.httpBinding.request();
  }

  @Override
  public boolean isConnectedUp() {
    return true;
  }

  @Override
  public boolean isRemoteUp() {
    return false;
  }

  @Override
  public boolean isSecureUp() {
    return true;
  }

  @Override
  public String securityProtocolUp() {
    return null;
  }

  @Override
  public String cipherSuiteUp() {
    return null;
  }

  @Override
  public InetSocketAddress localAddressUp() {
    return null;
  }

  @Override
  public Identity localIdentityUp() {
    return null;
  }

  @Override
  public Principal localPrincipalUp() {
    return null;
  }

  @Override
  public Collection<Certificate> localCertificatesUp() {
    return FingerTrieSeq.empty();
  }

  @Override
  public InetSocketAddress remoteAddressUp() {
    return null;
  }

  @Override
  public Identity remoteIdentityUp() {
    return null;
  }

  @Override
  public Principal remotePrincipalUp() {
    return null;
  }

  @Override
  public Collection<Certificate> remoteCertificatesUp() {
    return FingerTrieSeq.empty();
  }

  @Override
  public boolean isConnected() {
    return this.httpBinding.isConnectedDown();
  }

  @Override
  public boolean isRemote() {
    return this.httpBinding.isRemoteDown();
  }

  @Override
  public boolean isSecure() {
    return this.httpBinding.isSecureDown();
  }

  @Override
  public String securityProtocol() {
    return this.httpBinding.securityProtocolDown();
  }

  @Override
  public String cipherSuite() {
    return this.httpBinding.cipherSuiteDown();
  }

  @Override
  public InetSocketAddress localAddress() {
    return this.httpBinding.localAddressDown();
  }

  @Override
  public Identity localIdentity() {
    return this.httpBinding.localIdentityDown();
  }

  @Override
  public Principal localPrincipal() {
    return this.httpBinding.localPrincipalDown();
  }

  @Override
  public Collection<Certificate> localCertificates() {
    return this.httpBinding.localCertificatesDown();
  }

  @Override
  public InetSocketAddress remoteAddress() {
    return this.httpBinding.remoteAddressDown();
  }

  @Override
  public Identity remoteIdentity() {
    return this.httpBinding.remoteIdentityDown();
  }

  @Override
  public Principal remotePrincipal() {
    return this.httpBinding.remotePrincipalDown();
  }

  @Override
  public Collection<Certificate> remoteCertificates() {
    return this.httpBinding.remoteCertificatesDown();
  }

  public abstract Stage stage();

  @Override
  public HttpUplinkModem observe(Object observer) {
    return this;
  }

  @Override
  public HttpUplinkModem unobserve(Object observer) {
    return this;
  }

  @Override
  public abstract Decoder<Object> decodeRequest(HttpRequest<?> request);

  @Override
  public abstract void willRequest(HttpRequest<?> request);

  @Override
  public abstract void didRequest(HttpRequest<Object> request);

  @Override
  public abstract void willRespond(HttpResponse<?> response);

  public void writeResponse(HttpResponse<?> response) {
    this.httpBinding.writeResponse(response);
  }

  @Override
  public abstract void didRespond(HttpResponse<?> response);

  @Override
  public void closeUp() {
    // nop
  }

  @Override
  public void close() {
    this.httpBinding.closeDown();
  }

  @Override
  public void traceUp(Object message) {
    // nop
  }

  @Override
  public void debugUp(Object message) {
    // nop
  }

  @Override
  public void infoUp(Object message) {
    // nop
  }

  @Override
  public void warnUp(Object message) {
    // nop
  }

  @Override
  public void errorUp(Object message) {
    // nop
  }

  @Override
  public void trace(Object message) {
    this.httpBinding.traceDown(message);
  }

  @Override
  public void debug(Object message) {
    this.httpBinding.debugDown(message);
  }

  @Override
  public void info(Object message) {
    this.httpBinding.infoDown(message);
  }

  @Override
  public void warn(Object message) {
    this.httpBinding.warnDown(message);
  }

  @Override
  public void error(Object message) {
    this.httpBinding.errorDown(message);
  }
}
