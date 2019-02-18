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
import java.security.spec.ECFieldF2m;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Murmur3;

public class EcCharacteristic2FieldDef extends EcFieldDef {
  protected final int size;
  protected final BigInteger basis;

  public EcCharacteristic2FieldDef(int size, BigInteger basis) {
    this.size = size;
    this.basis = basis;
  }

  public final int size() {
    return this.size;
  }

  public final BigInteger basis() {
    return this.basis;
  }

  @Override
  public ECFieldF2m toECField() {
    if (this.basis != null) {
      return new ECFieldF2m(this.size, this.basis);
    } else {
      return new ECFieldF2m(this.size);
    }
  }

  @Override
  public Value toValue() {
    return Record.create(2)
        .attr("ECField", Record.create(1).slot("size", this.size))
        .slot("basis", Num.from(this.basis));
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof EcCharacteristic2FieldDef) {
      final EcCharacteristic2FieldDef that = (EcCharacteristic2FieldDef) other;
      return this.size == that.size && this.basis.equals(that.basis);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(EcCharacteristic2FieldDef.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
          this.size), this.basis.hashCode()));
  }

  private static int hashSeed;

  public static EcCharacteristic2FieldDef from(ECFieldF2m field) {
    return new EcCharacteristic2FieldDef(field.getM(), field.getReductionPolynomial());
  }
}
