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

package swim.security;

import swim.json.Json;
import swim.structure.Data;
import swim.structure.Value;

public class GoogleIdToken extends OpenIdToken {
  public GoogleIdToken(Value value) {
    super(value);
  }

  public GoogleIdToken() {
    super();
  }

  @Override
  public GoogleIdToken issuer(String issuer) {
    return (GoogleIdToken) super.issuer(issuer);
  }

  @Override
  public GoogleIdToken subject(String subject) {
    return (GoogleIdToken) super.subject(subject);
  }

  @Override
  public GoogleIdToken audience(String audience) {
    return (GoogleIdToken) super.audience(audience);
  }

  @Override
  public GoogleIdToken audiences(String... audiences) {
    return (GoogleIdToken) super.audiences(audiences);
  }

  @Override
  public GoogleIdToken expiration(long expiration) {
    return (GoogleIdToken) super.expiration(expiration);
  }

  @Override
  public GoogleIdToken notBefore(long notBefore) {
    return (GoogleIdToken) super.notBefore(notBefore);
  }

  @Override
  public GoogleIdToken issuedAt(long issuedAt) {
    return (GoogleIdToken) super.issuedAt(issuedAt);
  }

  @Override
  public GoogleIdToken jwtId(String jwtId) {
    return (GoogleIdToken) super.jwtId(jwtId);
  }

  public GoogleIdToken authTime(long authTime) {
    return (GoogleIdToken) super.authTime(authTime);
  }

  public GoogleIdToken nonce(String nonce) {
    return (GoogleIdToken) super.nonce(nonce);
  }

  public GoogleIdToken accessTokenHash(Data accessTokenHash) {
    return (GoogleIdToken) super.accessTokenHash(accessTokenHash);
  }

  public GoogleIdToken authenticationContextClass(String authenticationContextClass) {
    return (GoogleIdToken) super.authenticationContextClass(authenticationContextClass);
  }

  public GoogleIdToken authenticationMethods(String... authenticationMethods) {
    return (GoogleIdToken) super.authenticationMethods(authenticationMethods);
  }

  public GoogleIdToken authorizedParty(String authorizedParty) {
    return (GoogleIdToken) super.authorizedParty(authorizedParty);
  }

  public String hostedDomain() {
    return this.value.get("hd").stringValue(null);
  }

  public GoogleIdToken hostedDomain(String hostedDomain) {
    return copy(this.value.updatedSlot("hd", hostedDomain));
  }

  public String email() {
    return this.value.get("email").stringValue(null);
  }

  public GoogleIdToken email(String email) {
    return copy(this.value.updatedSlot("email", email));
  }

  public boolean emailVerified() {
    return this.value.get("email_verified").booleanValue(false);
  }

  public GoogleIdToken emailVerified(boolean emailVerified) {
    return copy(this.value.updatedSlot("email_verified", emailVerified));
  }

  public String name() {
    return this.value.get("name").stringValue(null);
  }

  public GoogleIdToken name(String name) {
    return copy(this.value.updatedSlot("name", name));
  }

  public String picture() {
    return this.value.get("picture").stringValue(null);
  }

  public GoogleIdToken picture(String picture) {
    return copy(this.value.updatedSlot("picture", picture));
  }

  public String givenName() {
    return this.value.get("given_name").stringValue(null);
  }

  public GoogleIdToken givenName(String givenName) {
    return copy(this.value.updatedSlot("given_name", givenName));
  }

  public String familyName() {
    return this.value.get("family_name").stringValue(null);
  }

  public GoogleIdToken familyName(String familyName) {
    return copy(this.value.updatedSlot("family_name", familyName));
  }

  public String locale() {
    return this.value.get("locale").stringValue(null);
  }

  public GoogleIdToken locale(String locale) {
    return copy(this.value.updatedSlot("locale", locale));
  }

  @Override
  protected GoogleIdToken copy(Value value) {
    return new GoogleIdToken(value);
  }

  public static GoogleIdToken from(Value value) {
    return new GoogleIdToken(value);
  }

  public static GoogleIdToken parse(String json) {
    return new GoogleIdToken(Json.parse(json));
  }

  public static GoogleIdToken verify(JsonWebSignature jws, Iterable<PublicKeyDef> publicKeyDefs) {
    final Value payload = jws.payload();
    final GoogleIdToken idToken = new GoogleIdToken(payload);
    // TODO: check payload
    for (PublicKeyDef publicKeyDef : publicKeyDefs) {
      if (jws.verifySignature(publicKeyDef.publicKey())) {
        return idToken;
      }
    }
    return null;
  }

  public static GoogleIdToken verify(String compactJws, Iterable<PublicKeyDef> publicKeyDefs) {
    final JsonWebSignature jws = JsonWebSignature.parse(compactJws);
    if (jws != null) {
      return verify(jws, publicKeyDefs);
    }
    return null;
  }
}
