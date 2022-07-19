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

package swim.auth;

import java.util.Arrays;
import java.util.List;
import swim.api.auth.AbstractAuthenticator;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.policy.PolicyDirective;
import swim.collections.FingerTrieSeq;
import swim.concurrent.AbstractTimer;
import swim.concurrent.TimerFunction;
import swim.concurrent.TimerRef;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.header.HostHeader;
import swim.io.http.AbstractHttpClient;
import swim.io.http.AbstractHttpRequester;
import swim.io.http.HttpInterface;
import swim.io.http.HttpSettings;
import swim.security.JsonWebKey;
import swim.security.JsonWebSignature;
import swim.security.OpenIdToken;
import swim.security.PublicKeyDef;
import swim.structure.Item;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriAuthority;

public class OpenIdAuthenticator extends AbstractAuthenticator implements HttpInterface {

  protected final FingerTrieSeq<String> issuers;
  protected final FingerTrieSeq<String> audiences;
  protected List<FingerTrieSeq<PublicKeyDef>> publicKeyDefs;
  protected final Uri publicKeyUri;
  protected final HttpSettings httpSettings;
  TimerRef publicKeyRefreshTimer;

  public OpenIdAuthenticator(FingerTrieSeq<String> issuers, FingerTrieSeq<String> audiences,
                             FingerTrieSeq<PublicKeyDef> publicKeyDefs, Uri publicKeyUri,
                             HttpSettings httpSettings) {
    this.issuers = issuers;
    this.audiences = audiences;
    this.publicKeyDefs = Arrays.asList(publicKeyDefs, FingerTrieSeq.empty());
    this.publicKeyUri = publicKeyUri;
    this.httpSettings = httpSettings;
    this.publicKeyRefreshTimer = null;
  }

  public OpenIdAuthenticator(OpenIdAuthenticatorDef authenticatorDef) {
    this(authenticatorDef.issuers, authenticatorDef.audiences, authenticatorDef.publicKeyDefs,
         authenticatorDef.publicKeyUri, authenticatorDef.httpSettings);
  }

  public final FingerTrieSeq<String> issuers() {
    return this.issuers;
  }

  public final FingerTrieSeq<String> audiences() {
    return this.audiences;
  }

  public void setPublicKeyDefsFromUri(FingerTrieSeq<PublicKeyDef> publicKeyDefs) {
    this.publicKeyDefs.set(1, publicKeyDefs);
  }

  public final Uri publicKeyUri() {
    return this.publicKeyUri;
  }

  @Override
  public final HttpSettings httpSettings() {
    return this.httpSettings;
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    String compactJws = credentials.claims().get("idToken").stringValue(null);
    if (compactJws == null) {
      compactJws = credentials.claims().get("openIdToken").stringValue(null);
    }
    if (compactJws != null) {
      final JsonWebSignature jws = JsonWebSignature.parse(compactJws);
      if (jws != null) {
        return this.authenticate(credentials.requestUri(), credentials.fromUri(), jws);
      }
    }
    return null;
  }

  public PolicyDirective<Identity> authenticate(Uri requestUri, Uri fromUri, JsonWebSignature jws) {
    final Value payloadValue = jws.payload();
    if (payloadValue.isDefined()) {
      final OpenIdToken idToken = new OpenIdToken(payloadValue);
      // TODO: check payload
      for (FingerTrieSeq<PublicKeyDef> publicKeyDefs : this.publicKeyDefs) {
        for (PublicKeyDef publicKeyDef : publicKeyDefs) {
          if (jws.verifySignature(publicKeyDef.publicKey())) {
            return PolicyDirective.allow(new Authenticated(requestUri, fromUri, idToken.toValue()));
          }
        }
      }
    }
    return null;
  }

  public void refreshPublicKeys() {
    final UriAuthority authority = this.publicKeyUri.authority();
    final String address = authority.hostAddress();
    int port = authority.portNumber();
    if (port == 0) {
      port = 443;
    }
    this.connectHttps(address, port, new OpenIdAuthenticatorPublicKeyClient(this), this.httpSettings);
  }

  @Override
  public void didStart() {
    if (this.publicKeyUri != null) {
        this.refreshPublicKeys();
        final TimerRef publicKeyRefreshTimer = this.publicKeyRefreshTimer;
        if (publicKeyRefreshTimer != null) {
          publicKeyRefreshTimer.cancel();
        }
        this.publicKeyRefreshTimer = this.schedule().setTimer(OpenIdAuthenticator.PUBLIC_KEY_REFRESH_INTERVAL,
                new OpenIdAuthenticatorPublicKeyRefreshTimer(this));
    }
  }

  @Override
  public void willStop() {
    final TimerRef publicKeyRefreshTimer = this.publicKeyRefreshTimer;
    if (publicKeyRefreshTimer != null) {
      publicKeyRefreshTimer.cancel();
      this.publicKeyRefreshTimer = null;
    }
  }

  static final long PUBLIC_KEY_REFRESH_INTERVAL;

  static {
    long publicKeyRefreshInterval;
    try {
      publicKeyRefreshInterval = Long.parseLong(System.getProperty("swim.auth.openid.public.key.refresh.interval"));
    } catch (NumberFormatException error) {
      publicKeyRefreshInterval = (long) (60 * 60 * 1000);
    }
    PUBLIC_KEY_REFRESH_INTERVAL = publicKeyRefreshInterval;
  }

}

final class OpenIdAuthenticatorPublicKeyRefreshTimer extends AbstractTimer implements TimerFunction {

  final OpenIdAuthenticator authenticator;

  OpenIdAuthenticatorPublicKeyRefreshTimer(OpenIdAuthenticator authenticator) {
    this.authenticator = authenticator;
  }

  @Override
  public void runTimer() {
    this.authenticator.refreshPublicKeys();
    this.reschedule(OpenIdAuthenticator.PUBLIC_KEY_REFRESH_INTERVAL);
  }

}

final class OpenIdAuthenticatorPublicKeyClient extends AbstractHttpClient {

  final OpenIdAuthenticator authenticator;

  OpenIdAuthenticatorPublicKeyClient(OpenIdAuthenticator authenticator) {
    this.authenticator = authenticator;
  }

  @Override
  public void didConnect() {
    super.didConnect();
    this.doRequest(new OpenIdAuthenticatorPublicKeyRequester(this.authenticator));
  }

}

final class OpenIdAuthenticatorPublicKeyRequester extends AbstractHttpRequester<Value> {

  final OpenIdAuthenticator authenticator;

  OpenIdAuthenticatorPublicKeyRequester(OpenIdAuthenticator authenticator) {
    this.authenticator = authenticator;
  }

  @Override
  public void doRequest() {
    final Uri publicKeyUri = this.authenticator.publicKeyUri;
    final Uri requestUri = Uri.create(publicKeyUri.path());
    final HttpRequest<?> request = HttpRequest.get(requestUri, HostHeader.create(publicKeyUri.authority()));
    this.writeRequest(request);
  }

  @Override
  public void didRespond(HttpResponse<Value> response) {
    FingerTrieSeq<PublicKeyDef> publicKeyDefs = FingerTrieSeq.empty();
    try {
      for (Item item : response.payload().get().get("keys")) {
        final PublicKeyDef publicKeyDef = JsonWebKey.from(item.toValue()).publicKeyDef();
        if (publicKeyDef != null) {
          publicKeyDefs = publicKeyDefs.appended(publicKeyDef);
        }
      }
      this.authenticator.setPublicKeyDefsFromUri(publicKeyDefs);
    } finally {
      this.close();
    }
  }

}

