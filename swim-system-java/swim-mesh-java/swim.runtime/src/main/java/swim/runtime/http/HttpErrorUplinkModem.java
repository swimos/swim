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

package swim.runtime.http;

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
import swim.runtime.LinkAddress;
import swim.runtime.LinkBinding;
import swim.runtime.NodeBinding;
import swim.structure.Value;

public class HttpErrorUplinkModem implements HttpContext {
  protected final HttpBinding linkBinding;

  public HttpErrorUplinkModem(HttpBinding linkBinding) {
    this.linkBinding = linkBinding;
  }

  @Override
  public final HttpBinding linkWrapper() {
    return this.linkBinding.linkWrapper();
  }

  public final HttpBinding linkBinding() {
    return this.linkBinding;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapLink(Class<T> linkClass) {
    if (linkClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public Value linkKey() {
    return Value.absent(); // never opened
  }

  @Override
  public LinkAddress cellAddressUp() {
    return null;
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
    // nop
  }

  @Override
  public void doRespond(HttpRequest<Object> request) {
    this.linkBinding.writeResponse(HttpResponse.from(HttpStatus.NOT_FOUND));
  }

  @Override
  public void willRespond(HttpResponse<?> response) {
    // nop
  }

  @Override
  public void didRespond(HttpResponse<?> response) {
    // nop
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    // nop
  }

  public void close() {
    this.linkBinding.closeDown();
  }

  @Override
  public void closeUp() {
    // nop
  }

  @Override
  public void didOpenDown() {
    // nop
  }

  @Override
  public void didCloseDown() {
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

  @Override
  public void failUp(Object message) {
    // nop
  }
}
