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

import swim.codec.Base64;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.collections.FingerTrieSeq;
import swim.json.Json;
import swim.structure.Data;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Builder;

// http://openid.net/specs/openid-connect-basic-1_0-27.html#id_token
public class OpenIdToken extends JsonWebToken {
  public OpenIdToken(Value value) {
    super(value);
  }

  public OpenIdToken() {
    super();
  }

  @Override
  public OpenIdToken issuer(String issuer) {
    return (OpenIdToken) super.issuer(issuer);
  }

  @Override
  public OpenIdToken subject(String subject) {
    return (OpenIdToken) super.subject(subject);
  }

  @Override
  public OpenIdToken audience(String audience) {
    return (OpenIdToken) super.audience(audience);
  }

  @Override
  public OpenIdToken audiences(String... audiences) {
    return (OpenIdToken) super.audiences(audiences);
  }

  @Override
  public OpenIdToken expiration(long expiration) {
    return (OpenIdToken) super.expiration(expiration);
  }

  @Override
  public OpenIdToken notBefore(long notBefore) {
    return (OpenIdToken) super.notBefore(notBefore);
  }

  @Override
  public OpenIdToken issuedAt(long issuedAt) {
    return (OpenIdToken) super.issuedAt(issuedAt);
  }

  @Override
  public OpenIdToken jwtId(String jwtId) {
    return (OpenIdToken) super.jwtId(jwtId);
  }

  public long authTime() {
    return this.value.get("auth_time").longValue(0L);
  }

  public OpenIdToken authTime(long authTime) {
    return copy(this.value.updatedSlot("auth_time", authTime));
  }

  public String nonce() {
    return this.value.get("nonce").stringValue(null);
  }

  public OpenIdToken nonce(String nonce) {
    return copy(this.value.updatedSlot("nonce", nonce));
  }

  public Data accessTokenHash() {
    final String atHash = this.value.get("at_hash").stringValue(null);
    if (atHash != null) {
      final Parser<Data> parser = Base64.urlUnpadded().parse(Unicode.stringInput(atHash), Data.output());
      if (parser.isDone()) {
        return parser.bind();
      } else {
        final Throwable trap = parser.trap();
        if (trap instanceof RuntimeException) {
          throw (RuntimeException) trap;
        } else {
          throw new RuntimeException(trap);
        }
      }
    }
    return null;
  }

  public OpenIdToken accessTokenHash(Data accessTokenHash) {
    final Output<String> atHash = Unicode.stringOutput();
    Base64.urlUnpadded().writeByteBuffer(accessTokenHash.asByteBuffer(), atHash);
    return copy(this.value.updatedSlot("at_hash", atHash.bind()));
  }

  public String authenticationContextClass() {
    return this.value.get("acr").stringValue(null);
  }

  public OpenIdToken authenticationContextClass(String authenticationContextClass) {
    return copy(this.value.updatedSlot("acr", authenticationContextClass));
  }

  public FingerTrieSeq<String> authenticationMethods() {
    final Builder<String, FingerTrieSeq<String>> builder = FingerTrieSeq.builder();
    for (Item member : this.value.get("amr")) {
      final String authenticationMethod = member.stringValue(null);
      if (authenticationMethod != null) {
        builder.add(authenticationMethod);
      }
    }
    return builder.bind();
  }

  public OpenIdToken authenticationMethods(String... authenticationMethods) {
    return copy(this.value.updatedSlot("amr", Record.of((Object[]) authenticationMethods)));
  }

  public String authorizedParty() {
    return this.value.get("azp").stringValue(null);
  }

  public OpenIdToken authorizedParty(String authorizedParty) {
    return copy(this.value.updatedSlot("azp", authorizedParty));
  }

  @Override
  protected OpenIdToken copy(Value value) {
    return new OpenIdToken(value);
  }

  public static OpenIdToken from(Value value) {
    return new OpenIdToken(value);
  }

  public static OpenIdToken parse(String json) {
    return new OpenIdToken(Json.parse(json));
  }

  public static OpenIdToken verify(JsonWebSignature jws, Iterable<PublicKeyDef> publicKeyDefs) {
    final Value payload = jws.payload();
    final OpenIdToken idToken = new OpenIdToken(payload);
    // TODO: check payload
    for (PublicKeyDef publicKeyDef : publicKeyDefs) {
      if (jws.verifySignature(publicKeyDef.publicKey())) {
        return idToken;
      }
    }
    return null;
  }

  public static OpenIdToken verify(String compactJws, Iterable<PublicKeyDef> publicKeyDefs) {
    final JsonWebSignature jws = JsonWebSignature.parse(compactJws);
    if (jws != null) {
      return verify(jws, publicKeyDefs);
    }
    return null;
  }
}
