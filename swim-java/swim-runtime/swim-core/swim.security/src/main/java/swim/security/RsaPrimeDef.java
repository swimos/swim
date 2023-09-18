// Copyright 2015-2023 Nstream, inc.
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
import java.security.spec.RSAOtherPrimeInfo;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Kind;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class RsaPrimeDef {

  protected final BigInteger factor;
  protected final BigInteger exponent;
  protected final BigInteger coefficient;

  public RsaPrimeDef(BigInteger factor, BigInteger exponent, BigInteger coefficient) {
    this.factor = factor;
    this.exponent = exponent;
    this.coefficient = coefficient;
  }

  public RsaPrimeDef(BigInteger factor, BigInteger exponent) {
    this(factor, exponent, null);
  }

  public final BigInteger factor() {
    return this.factor;
  }

  public final BigInteger exponent() {
    return this.exponent;
  }

  public final BigInteger coefficient() {
    return this.coefficient;
  }

  public final RSAOtherPrimeInfo toRSAOtherPrimeInfo() {
    return new RSAOtherPrimeInfo(this.factor, this.exponent, this.coefficient);
  }

  public Value toValue() {
    return RsaPrimeDef.form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof RsaPrimeDef) {
      final RsaPrimeDef that = (RsaPrimeDef) other;
      return this.factor.equals(that.factor) && this.exponent.equals(that.exponent)
          && (this.coefficient == null ? that.coefficient == null : this.coefficient.equals(that.coefficient));
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (RsaPrimeDef.hashSeed == 0) {
      RsaPrimeDef.hashSeed = Murmur3.seed(RsaPrimeDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(RsaPrimeDef.hashSeed,
        this.factor.hashCode()), this.exponent.hashCode()), Murmur3.hash(this.coefficient)));
  }

  public static RsaPrimeDef from(RSAOtherPrimeInfo info) {
    return new RsaPrimeDef(info.getPrime(), info.getExponent(), info.getCrtCoefficient());
  }

  private static Form<RsaPrimeDef> form;

  @Kind
  public static Form<RsaPrimeDef> form() {
    if (RsaPrimeDef.form == null) {
      RsaPrimeDef.form = new RsaPrimeForm();
    }
    return RsaPrimeDef.form;
  }

}

final class RsaPrimeForm extends Form<RsaPrimeDef> {

  @Override
  public String tag() {
    return "prime";
  }

  @Override
  public Class<?> type() {
    return RsaPrimeDef.class;
  }

  @Override
  public Item mold(RsaPrimeDef primeDef) {
    final Record header = Record.create(primeDef.coefficient != null ? 3 : 2)
                                .slot("factor", Num.from(primeDef.factor))
                                .slot("exponent", Num.from(primeDef.exponent));
    if (primeDef.coefficient != null) {
      header.slot("coefficient", Num.from(primeDef.coefficient));
    }
    return Record.create(1).attr(this.tag(), header);
  }

  @Override
  public RsaPrimeDef cast(Item item) {
    final Value header = item.toValue().header(this.tag());
    if (header.isDefined()) {
      final BigInteger factor = header.get("factor").integerValue(null);
      final BigInteger exponent = header.get("exponent").integerValue(null);
      final BigInteger coefficient = header.get("coefficient").integerValue(null);
      if (factor != null && exponent != null) {
        return new RsaPrimeDef(factor, exponent, coefficient);
      }
    }
    return null;
  }

}
