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
import java.security.interfaces.ECPrivateKey;
import java.security.spec.ECPrivateKeySpec;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class EcPrivateKeyDef extends PrivateKeyDef implements EcKeyDef {
  protected final EcDomainDef domain;
  protected final BigInteger secret;
  protected ECPrivateKey privateKey;

  EcPrivateKeyDef(EcDomainDef domain, BigInteger secret, ECPrivateKey privateKey) {
    this.domain = domain;
    this.secret = secret;
    this.privateKey = privateKey;
  }

  public EcPrivateKeyDef(EcDomainDef domain, BigInteger secret) {
    this(domain, secret, null);
  }

  @Override
  public final EcDomainDef domain() {
    return this.domain;
  }

  public final BigInteger secret() {
    return this.secret;
  }

  @Override
  public ECPrivateKey privateKey() {
    ECPrivateKey privateKey = this.privateKey;
    if (privateKey == null) {
      try {
        final ECPrivateKeySpec keySpec = new ECPrivateKeySpec(this.secret, this.domain.toECParameterSpec());
        final KeyFactory keyFactory = KeyFactory.getInstance("EC");
        privateKey = (ECPrivateKey) keyFactory.generatePrivate(keySpec);
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
    } else if (other instanceof EcPrivateKeyDef) {
      final EcPrivateKeyDef that = (EcPrivateKeyDef) other;
      return this.domain.equals(that.domain) && this.secret.equals(that.secret);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(EcPrivateKeyDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.domain.hashCode()), this.secret.hashCode()));
  }

  private static int hashSeed;

  private static Form<EcPrivateKeyDef> form;

  public static EcPrivateKeyDef from(ECPrivateKey key) {
    return new EcPrivateKeyDef(EcDomainDef.from(key.getParams()), key.getS(), key);
  }

  @Kind
  public static Form<EcPrivateKeyDef> form() {
    if (form == null) {
      form = new EcPrivateKeyForm();
    }
    return form;
  }
}

final class EcPrivateKeyForm extends Form<EcPrivateKeyDef> {
  @Override
  public String tag() {
    return "ECPrivateKey";
  }

  @Override
  public Class<?> type() {
    return EcPrivateKeyDef.class;
  }

  @Override
  public Item mold(EcPrivateKeyDef keyDef) {
    return Record.create(3)
        .attr(tag())
        .slot("domain", keyDef.domain.toValue())
        .slot("secret", Num.from(keyDef.secret));
  }

  @Override
  public EcPrivateKeyDef cast(Item item) {
    final Value value = item.toValue();
    if (value.getAttr(tag()).isDefined()) {
      final EcDomainDef domain = EcDomainDef.form().cast(value.get("domain"));
      final BigInteger secret = value.get("secret").integerValue(null);
      if (domain != null && secret != null) {
        return new EcPrivateKeyDef(domain, secret);
      }
    }
    return null;
  }
}
