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

import java.security.GeneralSecurityException;
import java.security.Key;
import java.security.KeyFactory;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECPublicKeySpec;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class EcPublicKeyDef extends PublicKeyDef implements EcKeyDef {
  protected final EcDomainDef domain;
  protected final EcPointDef point;
  protected ECPublicKey publicKey;

  EcPublicKeyDef(EcDomainDef domain, EcPointDef point, ECPublicKey publicKey) {
    this.domain = domain;
    this.point = point;
    this.publicKey = publicKey;
  }

  public EcPublicKeyDef(EcDomainDef domain, EcPointDef point) {
    this(domain, point, null);
  }

  @Override
  public final EcDomainDef domain() {
    return this.domain;
  }

  public final EcPointDef point() {
    return this.point;
  }

  @Override
  public ECPublicKey publicKey() {
    ECPublicKey publicKey = this.publicKey;
    if (publicKey == null) {
      try {
        final ECPublicKeySpec keySpec = new ECPublicKeySpec(this.point.toECPoint(),
                                                            this.domain.toECParameterSpec());
        final KeyFactory keyFactory = KeyFactory.getInstance("EC");
        publicKey = (ECPublicKey) keyFactory.generatePublic(keySpec);
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
    } else if (other instanceof EcPublicKeyDef) {
      final EcPublicKeyDef that = (EcPublicKeyDef) other;
      return this.domain.equals(that.domain) && this.point.equals(that.point);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(EcPublicKeyDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.domain.hashCode()), this.point.hashCode()));
  }

  private static int hashSeed;

  private static Form<EcPublicKeyDef> form;

  public static EcPublicKeyDef from(ECPublicKey key) {
    return new EcPublicKeyDef(EcDomainDef.from(key.getParams()),
                              EcPointDef.from(key.getW()), key);
  }

  @Kind
  public static Form<EcPublicKeyDef> form() {
    if (form == null) {
      form = new EcPublicKeyForm();
    }
    return form;
  }
}

final class EcPublicKeyForm extends Form<EcPublicKeyDef> {
  @Override
  public String tag() {
    return "ECPublicKey";
  }

  @Override
  public Class<?> type() {
    return EcPublicKeyDef.class;
  }

  @Override
  public Item mold(EcPublicKeyDef keyDef) {
    return Record.create(3)
        .attr(tag())
        .slot("domain", keyDef.domain.toValue())
        .slot("point", keyDef.point.toValue());
  }

  @Override
  public EcPublicKeyDef cast(Item item) {
    final Value value = item.toValue();
    if (value.getAttr(tag()).isDefined()) {
      final EcDomainDef domain = EcDomainDef.form().cast(value.get("domain"));
      final EcPointDef point = EcPointDef.form().cast(value.get("point"));
      if (domain != null && point != null) {
        return new EcPublicKeyDef(domain, point);
      }
    }
    return null;
  }
}
