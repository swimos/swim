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
import swim.security.JsonWebSignature;
import swim.security.OpenIdToken;
import swim.security.PublicKeyDef;
import swim.structure.Value;
import swim.uri.Uri;

public class OpenIdAuthenticator extends AbstractAuthenticator {
  protected final FingerTrieSeq<String> issuers;
  protected final FingerTrieSeq<String> audiences;
  protected final FingerTrieSeq<PublicKeyDef> publicKeyDefs;

  public OpenIdAuthenticator(FingerTrieSeq<String> issuers, FingerTrieSeq<String> audiences,
                             FingerTrieSeq<PublicKeyDef> publicKeyDefs) {
    this.issuers = issuers;
    this.audiences = audiences;
    this.publicKeyDefs = publicKeyDefs;
  }

  public OpenIdAuthenticator(OpenIdAuthenticatorDef authenticatorDef) {
    this(authenticatorDef.issuers, authenticatorDef.audiences, authenticatorDef.publicKeyDefs);
  }

  public final FingerTrieSeq<String> issuers() {
    return this.issuers;
  }

  public final FingerTrieSeq<String> audiences() {
    return this.audiences;
  }

  public final FingerTrieSeq<PublicKeyDef> publicKeyDefs() {
    return this.publicKeyDefs;
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
        return authenticate(credentials.requestUri(), credentials.fromUri(), jws);
      }
    }
    return null;
  }

  public PolicyDirective<Identity> authenticate(Uri requestUri, Uri fromUri, JsonWebSignature jws) {
    final Value payloadValue = jws.payload();
    if (payloadValue.isDefined()) {
      final OpenIdToken idToken = new OpenIdToken(payloadValue);
      // TODO: check payload
      for (int i = 0, n = this.publicKeyDefs.size(); i < n; i += 1) {
        if (jws.verifySignature(this.publicKeyDefs.get(i).publicKey())) {
          return PolicyDirective.<Identity>allow(new Authenticated(requestUri, fromUri, idToken.toValue()));
        }
      }
    }
    return null;
  }
}
