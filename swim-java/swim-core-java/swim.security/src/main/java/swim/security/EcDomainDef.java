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
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECParameterSpec;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Text;
import swim.structure.Value;

public class EcDomainDef {
  protected final String name;
  protected final EcDef curve;
  protected final EcPointDef base;
  protected final BigInteger order;
  protected final int cofactor;
  protected ECParameterSpec params;

  EcDomainDef(String name, EcDef curve, EcPointDef base, BigInteger order, int cofactor, ECParameterSpec params) {
    this.name = name;
    this.curve = curve;
    this.base = base;
    this.order = order;
    this.cofactor = cofactor;
    this.params = params;
  }

  public EcDomainDef(String name, EcDef curve, EcPointDef base, BigInteger order, int cofactor) {
    this(name, curve, base, order, cofactor, null);
  }

  public EcDomainDef(EcDef curve, EcPointDef base, BigInteger order, int cofactor) {
    this(null, curve, base, order, cofactor, null);
  }

  public final String name() {
    return this.name;
  }

  public final EcDef curve() {
    return this.curve;
  }

  public final EcPointDef base() {
    return this.base;
  }

  public final BigInteger order() {
    return this.order;
  }

  public final int cofactor() {
    return this.cofactor;
  }

  public ECParameterSpec toECParameterSpec() {
    ECParameterSpec params = this.params;
    if (params == null) {
      params = new ECParameterSpec(this.curve.toEllipticCurve(), this.base.toECPoint(), this.order, this.cofactor);
      this.params = params;
    }
    return params;
  }

  public Value toValue() {
    if (this.name != null) {
      return Text.from(this.name);
    } else {
      return form().mold(this).toValue();
    }
  }

  private static Form<EcDomainDef> form;

  public static EcDomainDef from(String name, ECParameterSpec params) {
    return new EcDomainDef(name, EcDef.from(params.getCurve()), EcPointDef.from(params.getGenerator()),
                          params.getOrder(), params.getCofactor(), params);
  }

  public static EcDomainDef from(ECParameterSpec params) {
    return from(null, params);
  }

  public static EcDomainDef forName(String name) {
    try {
      final KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC");
      final ECGenParameterSpec parameterSpec = new ECGenParameterSpec(name);
      keyPairGenerator.initialize(parameterSpec);
      final KeyPair keyPair = keyPairGenerator.generateKeyPair();
      final ECPublicKey publicKey  = (ECPublicKey) keyPair.getPublic();
      return from(name, publicKey.getParams());
    } catch (GeneralSecurityException cause) {
      return null;
    }
  }

  @Kind
  public static Form<EcDomainDef> form() {
    if (form == null) {
      form = new EcDomainForm();
    }
    return form;
  }
}

final class EcDomainForm extends Form<EcDomainDef> {
  @Override
  public String tag() {
    return "ECDomain";
  }

  @Override
  public Class<?> type() {
    return EcDomainDef.class;
  }

  @Override
  public Item mold(EcDomainDef domainDef) {
    final Value header;
    if (domainDef.name != null) {
      header = Record.create(1).slot("name", domainDef.name);
    } else {
      header = Value.extant();
    }
    return Record.create(5)
        .attr(tag(), header)
        .slot("curve", domainDef.curve.toValue())
        .slot("base", domainDef.base.toValue())
        .slot("order", Num.from(domainDef.order))
        .slot("cofactor", domainDef.cofactor);
  }

  @Override
  public EcDomainDef cast(Item item) {
    final Value value = item.toValue();
    final Value header = value.getAttr(tag());
    if (header.isDefined()) {
      final String name = header.get("name").stringValue(null);
      final EcDef curve = EcDef.form().cast(value.get("curve"));
      final EcPointDef base = EcPointDef.form().cast(value.get("base"));
      final BigInteger order = value.get("order").integerValue(null);
      final int cofactor = value.get("cofactor").intValue(0);
      if (curve != null && base != null && order != null) {
        return new EcDomainDef(name, curve, base, order, cofactor);
      } else if (name != null) {
        return EcDomainDef.forName(name);
      }
    } else if (value instanceof Text) {
      return EcDomainDef.forName(value.stringValue());
    }
    return null;
  }
}
