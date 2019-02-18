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
import swim.codec.Decoder;
import swim.collections.FingerTrieSeq;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.runtime.HttpBinding;
import swim.runtime.HttpContext;

public class HttpErrorUplinkModem implements HttpContext {
  protected final HttpBinding httpBinding;

  public HttpErrorUplinkModem(HttpBinding httpBinding) {
    this.httpBinding = httpBinding;
  }

  public HttpBinding getHttpBinding() {
    return this.httpBinding;
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
  public Decoder<Object> decodeRequest(HttpRequest<?> request) {
    return request.contentDecoder();
  }

  @Override
  public void willRequest(HttpRequest<?> request) {
    // nop
  }

  @Override
  public void didRequest(HttpRequest<Object> request) {
    this.httpBinding.writeResponse(HttpResponse.from(HttpStatus.NOT_FOUND));
  }

  @Override
  public void willRespond(HttpResponse<?> response) {
    // nop
  }

  @Override
  public void didRespond(HttpResponse<?> response) {
    // nop
  }

  public void close() {
    this.httpBinding.closeDown();
  }

  @Override
  public void closeUp() {
    // nop
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
}
