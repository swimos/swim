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

import java.security.Key;
import java.security.PrivateKey;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.collections.FingerTrieSeq;
import swim.json.Json;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.Builder;
import swim.util.Murmur3;

public class JsonWebToken implements Debug {
  protected final Value value;

  public JsonWebToken(Value value) {
    this.value = value.commit();
  }

  public JsonWebToken() {
    this(Value.absent());
  }

  public Value get(String name) {
    return this.value.get(name);
  }

  public String issuer() {
    return this.value.get("iss").stringValue(null);
  }

  public JsonWebToken issuer(String issuer) {
    return copy(this.value.updatedSlot("iss", issuer));
  }

  public String subject() {
    return this.value.get("sub").stringValue(null);
  }

  public JsonWebToken subject(String subject) {
    return copy(this.value.updatedSlot("sub", subject));
  }

  public String audience() {
    return this.value.get("aud").stringValue(null);
  }

  public JsonWebToken audience(String audience) {
    return copy(this.value.updatedSlot("aud", audience));
  }

  public FingerTrieSeq<String> audiences() {
    final Builder<String, FingerTrieSeq<String>> builder = FingerTrieSeq.builder();
    for (Item member : this.value.get("aud")) {
      final String audience = member.stringValue(null);
      if (audience != null) {
        builder.add(audience);
      }
    }
    return builder.bind();
  }

  public JsonWebToken audiences(String... audiences) {
    return copy(this.value.updatedSlot("aud", Record.of((Object[]) audiences)));
  }

  public long expiration() {
    return this.value.get("exp").longValue(Long.MAX_VALUE);
  }

  public JsonWebToken expiration(long expiration) {
    return copy(this.value.updatedSlot("exp", expiration));
  }

  public long notBefore() {
    return this.value.get("nbf").longValue(0L);
  }

  public JsonWebToken notBefore(long notBefore) {
    return copy(this.value.updatedSlot("nbf", notBefore));
  }

  public long issuedAt() {
    return this.value.get("iat").longValue(0L);
  }

  public JsonWebToken issuedAt(long issuedAt) {
    return copy(this.value.updatedSlot("iat", issuedAt));
  }

  public String jwtId() {
    return this.value.get("jti").stringValue(null);
  }

  public JsonWebToken jwtId(String jwtId) {
    return copy(this.value.updatedSlot("jti", jwtId));
  }

  public Record joseHeader() {
    return Record.of(Slot.of("typ", "JWT"));
  }

  public JsonWebSignature mac(Key symmetricKey) {
    return JsonWebSignature.mac(symmetricKey, joseHeader(), Json.toData(this.value));
  }

  public JsonWebSignature sign(PrivateKey privateKey) {
    return JsonWebSignature.sign(privateKey, joseHeader(), Json.toData(this.value));
  }

  public final Value toValue() {
    return this.value;
  }

  protected JsonWebToken copy(Value value) {
    return new JsonWebToken(value);
  }

  protected boolean canEqual(Object other) {
    return other instanceof JsonWebToken;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof JsonWebToken) {
      final JsonWebToken that = (JsonWebToken) other;
      return that.canEqual(this) && this.value.equals(that.value);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(JsonWebToken.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.value.hashCode()));
  }

  @Override
  public void debug(Output<?> output) {
    output.write(getClass().getSimpleName()).write('.').write("from").write('(')
        .debug(this.value).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  public static JsonWebToken from(Value value) {
    return new JsonWebToken(value);
  }

  public static JsonWebToken parse(String json) {
    return new JsonWebToken(Json.parse(json));
  }
}
