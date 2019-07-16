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

package swim.auth;

import swim.api.auth.AbstractAuthenticator;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.policy.PolicyDirective;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieSet;
import swim.concurrent.AbstractTimer;
import swim.concurrent.TimerFunction;
import swim.concurrent.TimerRef;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.header.Host;
import swim.io.http.AbstractHttpClient;
import swim.io.http.AbstractHttpRequester;
import swim.io.http.HttpInterface;
import swim.io.http.HttpSettings;
import swim.security.GoogleIdToken;
import swim.security.JsonWebKey;
import swim.security.PublicKeyDef;
import swim.structure.Item;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriAuthority;

public class GoogleIdAuthenticator extends AbstractAuthenticator implements HttpInterface {
  protected final FingerTrieSeq<String> audiences;
  protected HashTrieSet<String> emails;
  protected final Uri publicKeyUri;
  protected final HttpSettings httpSettings;
  FingerTrieSeq<PublicKeyDef> publicKeyDefs;
  TimerRef publicKeyRefreshTimer;

  public GoogleIdAuthenticator(FingerTrieSeq<String> audiences, HashTrieSet<String> emails,
                               Uri publicKeyUri, HttpSettings httpSettings) {
    this.audiences = audiences;
    this.emails = emails;
    this.publicKeyUri = publicKeyUri;
    this.httpSettings = httpSettings;
    this.publicKeyDefs = FingerTrieSeq.empty();
  }

  public GoogleIdAuthenticator(GoogleIdAuthenticatorDef authenticatorDef) {
    this(authenticatorDef.audiences, authenticatorDef.emails,
         authenticatorDef.publicKeyUri, authenticatorDef.httpSettings);
  }

  public final FingerTrieSeq<String> audiences() {
    return this.audiences;
  }

  public final HashTrieSet<String> emails() {
    return this.emails;
  }

  public void addEmail(String email) {
    this.emails = emails.added(email);
  }

  public void removeEmail(String email) {
    this.emails = emails.removed(email);
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
      compactJws = credentials.claims().get("googleIdToken").stringValue(null);
    }
    if (compactJws != null) {
      final GoogleIdToken idToken = GoogleIdToken.verify(compactJws, this.publicKeyDefs);
      if (idToken != null) {
        if (this.emails .isEmpty() || this.emails .contains(idToken.email())) {
          return PolicyDirective.<Identity>allow(new Authenticated(
              credentials.requestUri(), credentials.fromUri(), idToken.toValue()));
        }
      }
    }
    return null;
  }

  public final FingerTrieSeq<PublicKeyDef> publicKeyDefs() {
    return this.publicKeyDefs;
  }

  public void setPublicKeyDefs(FingerTrieSeq<PublicKeyDef> publicKeyDefs) {
    this.publicKeyDefs = publicKeyDefs;
  }

  public void refreshPublicKeys() {
    final UriAuthority authority = this.publicKeyUri.authority();
    final String address = authority.hostAddress();
    int port = authority.portNumber();
    if (port == 0) {
      port = 443;
    }
    connectHttps(address, port, new GoogleIdAuthenticatorPublicKeyClient(this), this.httpSettings);
  }

  @Override
  public void didStart() {
    refreshPublicKeys();
    final TimerRef publicKeyRefreshTimer = this.publicKeyRefreshTimer;
    if (publicKeyRefreshTimer != null) {
      publicKeyRefreshTimer.cancel();
    }
    this.publicKeyRefreshTimer = schedule().setTimer(PUBLIC_KEY_REFRESH_INTERVAL,
                                                     new GoogleIdAuthenticatorPublicKeyRefreshTimer(this));
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
      publicKeyRefreshInterval = Long.parseLong(System.getProperty("swim.auth.google.public.key.refresh.interval"));
    } catch (NumberFormatException error) {
      publicKeyRefreshInterval = (long) (60 * 60 * 1000);
    }
    PUBLIC_KEY_REFRESH_INTERVAL = publicKeyRefreshInterval;
  }
}

final class GoogleIdAuthenticatorPublicKeyRefreshTimer extends AbstractTimer implements TimerFunction {
  final GoogleIdAuthenticator authenticator;

  GoogleIdAuthenticatorPublicKeyRefreshTimer(GoogleIdAuthenticator authenticator) {
    this.authenticator = authenticator;
  }

  @Override
  public void runTimer() {
    this.authenticator.refreshPublicKeys();
    this.reschedule(GoogleIdAuthenticator.PUBLIC_KEY_REFRESH_INTERVAL);
  }
}

final class GoogleIdAuthenticatorPublicKeyClient extends AbstractHttpClient {
  final GoogleIdAuthenticator authenticator;

  GoogleIdAuthenticatorPublicKeyClient(GoogleIdAuthenticator authenticator) {
    this.authenticator = authenticator;
  }

  @Override
  public void didConnect() {
    super.didConnect();
    doRequest(new GoogleIdAuthenticatorPublicKeyRequester(this.authenticator));
  }
}

final class GoogleIdAuthenticatorPublicKeyRequester extends AbstractHttpRequester<Value> {
  final GoogleIdAuthenticator authenticator;

  GoogleIdAuthenticatorPublicKeyRequester(GoogleIdAuthenticator authenticator) {
    this.authenticator = authenticator;
  }

  @Override
  public void doRequest() {
    final Uri publicKeyUri = this.authenticator.publicKeyUri;
    final Uri requestUri = Uri.from(publicKeyUri.path());
    final HttpRequest<?> request = HttpRequest.get(requestUri, Host.from(publicKeyUri.authority()));
    writeRequest(request);
  }

  @Override
  public void didRespond(HttpResponse<Value> response) {
    FingerTrieSeq<PublicKeyDef> publicKeyDefs = FingerTrieSeq.empty();
    try {
      for (Item item : response.entity().get().get("keys")) {
        final PublicKeyDef publicKeyDef = JsonWebKey.from(item.toValue()).publicKeyDef();
        if (publicKeyDef != null) {
          publicKeyDefs = publicKeyDefs.appended(publicKeyDef);
        }
      }
      this.authenticator.setPublicKeyDefs(publicKeyDefs);
    } finally {
      close();
    }
  }
}
