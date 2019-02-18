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
import java.security.spec.ECPoint;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class EcPointDef {
  protected final BigInteger x;
  protected final BigInteger y;

  public EcPointDef(BigInteger x, BigInteger y) {
    this.x = x;
    this.y = y;
  }

  public final BigInteger x() {
    return this.x;
  }

  public final BigInteger y() {
    return this.y;
  }

  public final ECPoint toECPoint() {
    return new ECPoint(this.x, this.y);
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof EcPointDef) {
      final EcPointDef that = (EcPointDef) other;
      return this.x.equals(that.x) && this.y.equals(that.y);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(EcPointDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        this.x.hashCode()), this.y.hashCode()));
  }

  private static int hashSeed;

  private static Form<EcPointDef> form;

  public static EcPointDef from(ECPoint point) {
    return new EcPointDef(point.getAffineX(), point.getAffineY());
  }

  @Kind
  public static Form<EcPointDef> form() {
    if (form == null) {
      form = new EcPointForm();
    }
    return form;
  }
}

final class EcPointForm extends Form<EcPointDef> {
  @Override
  public String tag() {
    return "ECPoint";
  }

  @Override
  public Class<?> type() {
    return EcPointDef.class;
  }

  @Override
  public Item mold(EcPointDef pointDef) {
    final Record header = Record.create(2)
        .slot("x", Num.from(pointDef.x))
        .slot("y", Num.from(pointDef.y));
    return Record.create(1).attr(tag(), header);
  }

  @Override
  public EcPointDef cast(Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final BigInteger x = header.get("x").integerValue(null);
      final BigInteger y = header.get("y").integerValue(null);
      if (x != null && y != null) {
        return new EcPointDef(x, y);
      }
    }
    return null;
  }
}
