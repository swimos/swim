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
import java.security.spec.EllipticCurve;
import swim.structure.Data;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class EcDef {
  protected final String name;
  protected final EcFieldDef field;
  protected final BigInteger a;
  protected final BigInteger b;
  protected final byte[] seed;

  public EcDef(String name, EcFieldDef field, BigInteger a, BigInteger b, byte[] seed) {
    this.name = name;
    this.field = field;
    this.a = a;
    this.b = b;
    this.seed = seed;
  }

  public EcDef(EcFieldDef field, BigInteger a, BigInteger b, byte[] seed) {
    this(null, field, a, b, seed);
  }

  public EcDef(EcFieldDef field, BigInteger a, BigInteger b) {
    this(null, field, a, b, null);
  }

  public final String name() {
    return this.name;
  }

  public final EcFieldDef field() {
    return this.field;
  }

  public final BigInteger a() {
    return this.a;
  }

  public final BigInteger b() {
    return this.b;
  }

  public EllipticCurve toEllipticCurve() {
    return new EllipticCurve(this.field.toECField(), this.a, this.b, this.seed);
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof EcDef) {
      final EcDef that = (EcDef) other;
      return this.field.equals(that.field) && this.a.equals(that.a) && this.b.equals(that.b);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(EcDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.field.hashCode()), this.a.hashCode()), this.b.hashCode()));
  }

  private static int hashSeed;

  private static Form<EcDef> form;

  public static EcDef from(EllipticCurve curve) {
    return new EcDef(EcFieldDef.from(curve.getField()), curve.getA(),
                     curve.getB(), curve.getSeed());
  }

  @Kind
  public static Form<EcDef> form() {
    if (form == null) {
      form = new EcForm();
    }
    return form;
  }
}

final class EcForm extends Form<EcDef> {
  @Override
  public String tag() {
    return "EC";
  }

  @Override
  public Class<?> type() {
    return EcDef.class;
  }

  @Override
  public Item mold(EcDef curveDef) {
    final Record header = Record.create(curveDef.seed != null ? 4 : 3)
        .slot("field", curveDef.field.toValue())
        .slot("a", Num.from(curveDef.a))
        .slot("b", Num.from(curveDef.b));
    if (curveDef.seed != null) {
      header.slot("seed", Data.wrap(curveDef.seed));
    }
    return Record.create(1).attr(tag(), header);
  }

  @Override
  public EcDef cast(Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final EcFieldDef field = EcFieldDef.form().cast(header.get("field"));
      final BigInteger a = header.get("a").integerValue(null);
      final BigInteger b = header.get("b").integerValue(null);
      final Value seedValue = header.get("seed");
      final byte[] data = seedValue instanceof Data ? ((Data) seedValue).toByteArray() : null;
      if (field != null && a != null && b != null) {
        return new EcDef(field, a, b, data);
      }
    }
    return null;
  }
}
