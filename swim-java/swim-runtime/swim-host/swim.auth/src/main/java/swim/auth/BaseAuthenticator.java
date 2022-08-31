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

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import swim.api.auth.AbstractAuthenticator;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.policy.PolicyDirective;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
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
import swim.security.*;
import swim.structure.Item;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriAuthority;

public class BaseAuthenticator extends AbstractAuthenticator implements HttpInterface {

  protected final String tokenName;
  protected final String expiration;
  protected final HashTrieMap<String, FingerTrieSeq<String>> claims;
  protected List<FingerTrieSeq<PublicKeyDef>> publicKeyDefs;
  protected final Uri publicKeyUri;
  protected final HttpSettings httpSettings;
  TimerRef publicKeyRefreshTimer;

  public BaseAuthenticator(String token, String expiration, HashTrieMap<String,
       FingerTrieSeq<String>> claims, FingerTrieSeq<PublicKeyDef> publicKeyDefs,
                           Uri publicKeyUri, HttpSettings httpSettings) {
    this.tokenName = Objects.requireNonNullElse(token, "access_token");
    this.expiration = Objects.requireNonNullElse(expiration, "exp");
    this.claims = claims;
    this.publicKeyDefs = Arrays.asList(publicKeyDefs, FingerTrieSeq.empty());
    this.publicKeyUri = publicKeyUri;
    this.httpSettings = httpSettings;
    this.publicKeyRefreshTimer = null;
  }

  public BaseAuthenticator(BaseAuthenticatorDef authenticatorDef) {
    this(authenticatorDef.tokenName, authenticatorDef.expiration, authenticatorDef.claims, authenticatorDef.publicKeyDefs,
         authenticatorDef.publicKeyUri, authenticatorDef.httpSettings);
  }

  public BaseAuthenticator(GoogleIdAuthenticatorDef authenticatorDef) {
    this.tokenName = "idToken";
    this.expiration = "exp";
    this.publicKeyDefs = Arrays.asList(FingerTrieSeq.empty(), FingerTrieSeq.empty());
    this.publicKeyUri = authenticatorDef.publicKeyUri;
    this.httpSettings = authenticatorDef.httpSettings;
    this.publicKeyRefreshTimer = null;

    HashTrieMap<String, FingerTrieSeq<String>> claims = HashTrieMap.empty();

    if (!authenticatorDef.emails.isEmpty()) {
      claims = claims.updated("email", FingerTrieSeq.from(authenticatorDef.emails));
    }

    if (!authenticatorDef.audiences.isEmpty()) {
      claims = claims.updated("aud", authenticatorDef.audiences);
    }

    this.claims = claims;
  }

  public BaseAuthenticator(OpenIdAuthenticatorDef authenticatorDef) {
    this.tokenName = "idToken";
    this.expiration = "exp";
    this.publicKeyDefs = Arrays.asList(authenticatorDef.publicKeyDefs, FingerTrieSeq.empty());
    this.publicKeyUri = authenticatorDef.publicKeyUri;
    this.httpSettings = authenticatorDef.httpSettings;
    this.publicKeyRefreshTimer = null;

    HashTrieMap<String, FingerTrieSeq<String>> claims = HashTrieMap.empty();

    if (!authenticatorDef.issuers.isEmpty()) {
      claims = claims.updated("iss", authenticatorDef.issuers);
    }

    if (!authenticatorDef.audiences.isEmpty()) {
      claims = claims.updated("aud", authenticatorDef.audiences);
    }

    this.claims = claims;
  }

  public final String expiration() {
    return this.expiration;
  }

  public final HashTrieMap<String, FingerTrieSeq<String>> claims() {
    return this.claims;
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
    String compactJws = credentials.claims().get(this.tokenName).stringValue(null);
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
      final JsonWebToken token = new JsonWebToken(payloadValue);

      Value expiration = token.get(this.expiration);
      if (!hasExpired(expiration)) {

        for (Map.Entry<String, FingerTrieSeq<String>> claim : this.claims) {
          Value tokenClaim = token.get(claim.getKey());

          if (!tokenClaim.isDefinite()) {
            return null;
          }
          if (!claim.getValue().contains(tokenClaim.stringValue())) {
            return null;
          }
        }

        for (FingerTrieSeq<PublicKeyDef> publicKeyDefs : this.publicKeyDefs) {
          for (PublicKeyDef publicKeyDef : publicKeyDefs) {
            if (jws.verifySignature(publicKeyDef.publicKey())) {
              return PolicyDirective.allow(new Authenticated(requestUri, fromUri, token.toValue()));
            }
          }
        }
      }
    }
    return null;
  }

  private boolean hasExpired(Value expiration) {
    if (expiration != null) {
      try {
        Instant expirationInstant = Instant.ofEpochSecond(expiration.longValue());
        if (expirationInstant.isAfter(Instant.now())) {
          return false;
        }
      } catch (Exception exception) {
        return true;
      }
    }

    return true;
  }

  public void refreshPublicKeys() {
    final UriAuthority authority = this.publicKeyUri.authority();
    final String address = authority.hostAddress();
    int port = authority.portNumber();
    if (port == 0) {
      port = 443;
    }
    this.connectHttps(address, port, new BaseAuthenticatorPublicKeyClient(this), this.httpSettings);
  }

  @Override
  public void didStart() {
    if (this.publicKeyUri != null) {
      this.refreshPublicKeys();
      final TimerRef publicKeyRefreshTimer = this.publicKeyRefreshTimer;
      if (publicKeyRefreshTimer != null) {
        publicKeyRefreshTimer.cancel();
      }
      this.publicKeyRefreshTimer = this.schedule().setTimer(BaseAuthenticator.PUBLIC_KEY_REFRESH_INTERVAL,
           new BaseAuthenticatorPublicKeyRefreshTimer(this));
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
      publicKeyRefreshInterval = Long.parseLong(System.getProperty("swim.auth.public.key.refresh.interval"));
    } catch (NumberFormatException error) {
      publicKeyRefreshInterval = 60 * 60 * 1000;
    }
    PUBLIC_KEY_REFRESH_INTERVAL = publicKeyRefreshInterval;
  }

}

final class BaseAuthenticatorPublicKeyRefreshTimer extends AbstractTimer implements TimerFunction {

  final BaseAuthenticator authenticator;

  BaseAuthenticatorPublicKeyRefreshTimer(BaseAuthenticator authenticator) {
    this.authenticator = authenticator;
  }

  @Override
  public void runTimer() {
    this.authenticator.refreshPublicKeys();
    this.reschedule(BaseAuthenticator.PUBLIC_KEY_REFRESH_INTERVAL);
  }

}

final class BaseAuthenticatorPublicKeyClient extends AbstractHttpClient {

  final BaseAuthenticator authenticator;

  BaseAuthenticatorPublicKeyClient(BaseAuthenticator authenticator) {
    this.authenticator = authenticator;
  }

  @Override
  public void didConnect() {
    super.didConnect();
    this.doRequest(new BaseAuthenticatorPublicKeyRequester(this.authenticator));
  }

}

final class BaseAuthenticatorPublicKeyRequester extends AbstractHttpRequester<Value> {

  final BaseAuthenticator authenticator;

  BaseAuthenticatorPublicKeyRequester(BaseAuthenticator authenticator) {
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

