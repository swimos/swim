// Copyright 2015-2023 Swim.inc
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

package swim.math;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Kind;
import swim.structure.Value;
import swim.util.Murmur3;

public class Z2Vector implements Debug {

  public final long x;
  public final long y;

  public Z2Vector(long x, long y) {
    this.x = x;
    this.y = y;
  }

  public final Z2Vector plus(Z2Vector that) {
    return new Z2Vector(this.x + that.x, this.y + that.y);
  }

  public final Z2Vector opposite() {
    return new Z2Vector(-this.x, -this.y);
  }

  public final Z2Vector minus(Z2Vector that) {
    return new Z2Vector(this.x - that.x, this.y - that.y);
  }

  public final Z2Vector times(long scalar) {
    return new Z2Vector(this.x * scalar, this.y * scalar);
  }

  public R2Vector transform(Z2ToR2Function f) {
    return new R2Vector(f.transformX(this.x, this.y), f.transformY(this.x, this.y));
  }

  public Value toValue() {
    return Z2Vector.form().mold(this).toValue();
  }

  protected boolean canEqual(Z2Vector that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Z2Vector) {
      final Z2Vector that = (Z2Vector) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Z2Vector.hashSeed == 0) {
      Z2Vector.hashSeed = Murmur3.seed(Z2Vector.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Z2Vector.hashSeed,
        Murmur3.hash(this.x)), Murmur3.hash(this.y)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output.write("Z2Vector").write('.').write("of").write('(')
          .debug(this.x).write(", ").debug(this.y).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static Z2Vector zero;

  public static Z2Vector zero() {
    if (Z2Vector.zero == null) {
      Z2Vector.zero = new Z2Vector(0L, 0L);
    }
    return Z2Vector.zero;
  }

  public static Z2Vector of(long x, long y) {
    return new Z2Vector(x, y);
  }

  private static TensorForm<Z2Vector> form;

  @Kind
  public static TensorForm<Z2Vector> form() {
    if (Z2Vector.form == null) {
      Z2Vector.form = new Z2VectorForm();
    }
    return Z2Vector.form;
  }

}
