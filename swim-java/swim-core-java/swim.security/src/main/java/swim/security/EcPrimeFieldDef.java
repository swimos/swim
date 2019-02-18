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
import java.security.spec.ECFieldFp;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class EcPrimeFieldDef extends EcFieldDef {
  protected final BigInteger prime;

  public EcPrimeFieldDef(BigInteger prime) {
    this.prime = prime;
  }

  public final BigInteger prime() {
    return this.prime;
  }

  @Override
  public ECFieldFp toECField() {
    return new ECFieldFp(this.prime);
  }

  @Override
  public Value toValue() {
    return Record.create(2)
        .attr("ECField")
        .slot("prime", Num.from(prime));
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof EcPrimeFieldDef) {
      final EcPrimeFieldDef that = (EcPrimeFieldDef) other;
      return this.prime.equals(that.prime);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(EcPrimeFieldDef.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.prime.hashCode()));
  }

  private static int hashSeed;

  public static EcPrimeFieldDef from(ECFieldFp field) {
    return new EcPrimeFieldDef(field.getP());
  }
}
