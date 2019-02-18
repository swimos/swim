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

import java.math.BigInteger;
import java.security.GeneralSecurityException;
import java.security.Key;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.RSAPublicKeySpec;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class RsaPublicKeyDef extends PublicKeyDef implements RsaKeyDef {
  protected final BigInteger modulus;
  protected final BigInteger publicExponent;
  protected RSAPublicKey publicKey;

  RsaPublicKeyDef(BigInteger modulus, BigInteger publicExponent, RSAPublicKey publicKey) {
    this.modulus = modulus;
    this.publicExponent = publicExponent;
    this.publicKey = publicKey;
  }

  public RsaPublicKeyDef(BigInteger modulus, BigInteger publicExponent) {
    this(modulus, publicExponent, null);
  }

  @Override
  public final BigInteger modulus() {
    return this.modulus;
  }

  public final BigInteger publicExponent() {
    return this.publicExponent;
  }

  @Override
  public RSAPublicKey publicKey() {
    RSAPublicKey publicKey = this.publicKey;
    if (publicKey == null) {
      try {
        final RSAPublicKeySpec keySpec = new RSAPublicKeySpec(this.modulus, this.publicExponent);
        final KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        publicKey = (RSAPublicKey) keyFactory.generatePublic(keySpec);
        this.publicKey = publicKey;
      } catch (GeneralSecurityException cause) {
        throw new RuntimeException(cause);
      }
    }
    return publicKey;
  }

  @Override
  public Key key() {
    return publicKey();
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof RsaPublicKeyDef) {
      final RsaPublicKeyDef that = (RsaPublicKeyDef) other;
      return this.modulus.equals(that.modulus) && this.publicExponent.equals(that.publicExponent);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(RsaPublicKeyDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.modulus.hashCode()), this.publicExponent.hashCode()));
  }

  private static int hashSeed;

  private static Form<RsaPublicKeyDef> form;

  public static RsaPublicKeyDef from(RSAPublicKey key) {
    return new RsaPublicKeyDef(key.getModulus(), key.getPublicExponent(), key);
  }

  @Kind
  public static Form<RsaPublicKeyDef> form() {
    if (form == null) {
      form = new RsaPublicKeyForm();
    }
    return form;
  }
}

final class RsaPublicKeyForm extends Form<RsaPublicKeyDef> {
  @Override
  public String tag() {
    return "RSAPublicKey";
  }

  @Override
  public Class<?> type() {
    return RsaPublicKeyDef.class;
  }

  @Override
  public Item mold(RsaPublicKeyDef keyDef) {
    return Record.create(3)
        .attr(tag())
        .slot("modulus", Num.from(keyDef.modulus))
        .slot("publicExponent", Num.from(keyDef.publicExponent));
  }

  @Override
  public RsaPublicKeyDef cast(Item item) {
    final Value value = item.toValue();
    if (value.getAttr(tag()).isDefined()) {
      final BigInteger modulus = value.get("modulus").integerValue(null);
      final BigInteger publicExponent = value.get("publicExponent").integerValue(null);
      if (modulus != null && publicExponent != null) {
        return new RsaPublicKeyDef(modulus, publicExponent);
      }
    }
    return null;
  }
}
