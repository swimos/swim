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
import java.security.interfaces.RSAMultiPrimePrivateCrtKey;
import java.security.interfaces.RSAPrivateCrtKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.RSAMultiPrimePrivateCrtKeySpec;
import java.security.spec.RSAOtherPrimeInfo;
import java.security.spec.RSAPrivateCrtKeySpec;
import java.security.spec.RSAPrivateKeySpec;
import swim.collections.FingerTrieSeq;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Builder;
import swim.util.Murmur3;

public class RsaPrivateKeyDef extends PrivateKeyDef implements RsaKeyDef {
  protected final BigInteger modulus;
  protected final BigInteger publicExponent;
  protected final BigInteger privateExponent;
  protected final FingerTrieSeq<RsaPrimeDef> primeDefs;
  protected RSAPrivateKey privateKey;

  RsaPrivateKeyDef(BigInteger modulus, BigInteger publicExponent, BigInteger privateExponent,
                   FingerTrieSeq<RsaPrimeDef> primeDefs, RSAPrivateKey privateKey) {
    this.modulus = modulus;
    this.publicExponent = publicExponent;
    this.privateExponent = privateExponent;
    this.primeDefs = primeDefs;
    this.privateKey = privateKey;
  }

  public RsaPrivateKeyDef(BigInteger modulus, BigInteger publicExponent, BigInteger privateExponent,
                          FingerTrieSeq<RsaPrimeDef> primeDefs) {
    this(modulus, publicExponent, privateExponent, primeDefs, null);
  }

  public RsaPrivateKeyDef(BigInteger modulus, BigInteger publicExponent, BigInteger privateExponent,
                          RsaPrimeDef... primeDefs) {
    this(modulus, publicExponent, privateExponent, FingerTrieSeq.of(primeDefs));
  }

  RsaPrivateKeyDef(BigInteger modulus, BigInteger privateExponent, RSAPrivateKey privateKey) {
    this(modulus, null, privateExponent, FingerTrieSeq.<RsaPrimeDef>empty(), privateKey);
  }

  public RsaPrivateKeyDef(BigInteger modulus, BigInteger privateExponent) {
    this(modulus, null, privateExponent, FingerTrieSeq.<RsaPrimeDef>empty());
  }

  @Override
  public final BigInteger modulus() {
    return this.modulus;
  }

  public final BigInteger publicExponent() {
    return this.publicExponent;
  }

  public final BigInteger privateExponent() {
    return this.privateExponent;
  }

  public final FingerTrieSeq<RsaPrimeDef> primeDefs() {
    return this.primeDefs;
  }

  @Override
  public RSAPrivateKey privateKey() {
    RSAPrivateKey privateKey = this.privateKey;
    if (privateKey == null) {
      try {
        final int primeCount = this.primeDefs.size();
        final RSAPrivateKeySpec keySpec;
        if (primeCount < 2 || this.publicExponent == null) {
          keySpec = new RSAPrivateKeySpec(this.modulus, this.privateExponent);
        } else {
          final RsaPrimeDef p = this.primeDefs.get(0);
          final RsaPrimeDef q = this.primeDefs.get(1);
          if (primeCount == 2) {
            keySpec = new RSAPrivateCrtKeySpec(this.modulus, this.publicExponent, this.privateExponent,
                                               p.factor, q.factor, p.exponent, q.exponent, q.coefficient);
          } else {
            final RSAOtherPrimeInfo[] otherPrimes = new RSAOtherPrimeInfo[primeCount - 2];
            for (int i = 2; i < primeCount; i += 1) {
              otherPrimes[i - 2] = this.primeDefs.get(i).toRSAOtherPrimeInfo();
            }
            keySpec = new RSAMultiPrimePrivateCrtKeySpec(this.modulus, this.publicExponent, this.privateExponent,
                                                         p.factor, q.factor, p.exponent, q.exponent, q.coefficient,
                                                         otherPrimes);
          }
        }
        final KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        privateKey = (RSAPrivateKey) keyFactory.generatePrivate(keySpec);
        this.privateKey = privateKey;
      } catch (GeneralSecurityException cause) {
        throw new RuntimeException(cause);
      }
    }
    return privateKey;
  }

  @Override
  public Key key() {
    return privateKey();
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof RsaPrivateKeyDef) {
      final RsaPrivateKeyDef that = (RsaPrivateKeyDef) other;
      return this.modulus.equals(that.modulus)
          && (this.publicExponent == null ? that.publicExponent == null : this.publicExponent.equals(that.publicExponent))
          && this.privateExponent.equals(that.privateExponent)
          && this.primeDefs.equals(that.primeDefs);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(RsaPrivateKeyDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.modulus.hashCode()), this.privateExponent.hashCode()));
  }

  private static int hashSeed;

  private static Form<RsaPrivateKeyDef> form;

  public static RsaPrivateKeyDef from(RSAPrivateKey key) {
    if (key instanceof RSAMultiPrimePrivateCrtKey) {
      return from((RSAMultiPrimePrivateCrtKey) key);
    } else if (key instanceof RSAPrivateCrtKey) {
      return from((RSAPrivateCrtKey) key);
    } else {
      return new RsaPrivateKeyDef(key.getModulus(), key.getPrivateExponent(), key);
    }
  }

  private static RsaPrivateKeyDef from(RSAMultiPrimePrivateCrtKey key) {
    FingerTrieSeq<RsaPrimeDef> primeDefs = FingerTrieSeq.empty();
    primeDefs = primeDefs.appended(new RsaPrimeDef(key.getPrimeP(), key.getPrimeExponentP()));
    primeDefs = primeDefs.appended(new RsaPrimeDef(key.getPrimeQ(), key.getPrimeExponentQ(), key.getCrtCoefficient()));
    final RSAOtherPrimeInfo[] otherPrimes = key.getOtherPrimeInfo();
    for (int i = 0, n = otherPrimes.length; i < n; i += 1) {
      primeDefs = primeDefs.appended(RsaPrimeDef.from(otherPrimes[i]));
    }
    return new RsaPrivateKeyDef(key.getModulus(), key.getPublicExponent(), key.getPrivateExponent(), primeDefs, key);
  }

  private static RsaPrivateKeyDef from(RSAPrivateCrtKey key) {
    FingerTrieSeq<RsaPrimeDef> primeDefs = FingerTrieSeq.empty();
    primeDefs = primeDefs.appended(new RsaPrimeDef(key.getPrimeP(), key.getPrimeExponentP()));
    primeDefs = primeDefs.appended(new RsaPrimeDef(key.getPrimeQ(), key.getPrimeExponentQ(), key.getCrtCoefficient()));
    return new RsaPrivateKeyDef(key.getModulus(), key.getPublicExponent(), key.getPrivateExponent(), primeDefs, key);
  }

  @Kind
  public static Form<RsaPrivateKeyDef> form() {
    if (form == null) {
      form = new RsaPrivateKeyForm();
    }
    return form;
  }
}

final class RsaPrivateKeyForm extends Form<RsaPrivateKeyDef> {
  @Override
  public String tag() {
    return "RSAPrivateKey";
  }

  @Override
  public Class<?> type() {
    return RsaPrivateKeyDef.class;
  }

  @Override
  public Item mold(RsaPrivateKeyDef keyDef) {
    final FingerTrieSeq<RsaPrimeDef> primeDefs = keyDef.primeDefs;
    final int n = primeDefs.size();
    final Record record = Record.create((keyDef.publicExponent != null ? 4 : 3) + n)
        .attr(tag())
        .slot("modulus", Num.from(keyDef.modulus));
    if (keyDef.publicExponent != null) {
      record.slot("publicExponent", Num.from(keyDef.publicExponent));
    }
    record.slot("privateExponent", Num.from(keyDef.privateExponent));
    for (int i = 0; i < n; i += 1) {
      record.add(primeDefs.get(i).toValue());
    }
    return record;
  }

  @Override
  public RsaPrivateKeyDef cast(Item item) {
    final Value value = item.toValue();
    if (value.getAttr(tag()).isDefined()) {
      BigInteger modulus = null;
      BigInteger publicExponent = null;
      BigInteger privateExponent = null;
      Builder<RsaPrimeDef, FingerTrieSeq<RsaPrimeDef>> primeDefs = null;
      for (int i = 0, n = value.length(); i < n; i += 1) {
        final Item member = value.getItem(i);
        final String name = member.key().stringValue();
        if ("modulus".equals(name)) {
          modulus = member.toValue().integerValue(null);
        } else if ("publicExponent".equals(name)) {
          publicExponent = member.toValue().integerValue(null);
        } else if ("privateExponent".equals(name)) {
          privateExponent = member.toValue().integerValue(null);
        } else {
          final RsaPrimeDef primeDef = RsaPrimeDef.form().cast(member.toValue());
          if (primeDef != null) {
            if (primeDefs == null) {
              primeDefs = FingerTrieSeq.builder();
            }
            primeDefs.add(primeDef);
          }
        }
      }
      if (modulus != null && privateExponent != null) {
        return new RsaPrivateKeyDef(modulus, publicExponent, privateExponent,
                                    primeDefs != null ? primeDefs.bind() : FingerTrieSeq.<RsaPrimeDef>empty());
      }
    }
    return null;
  }
}
