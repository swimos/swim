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

public class Z3Vector implements Debug {

  public final long x;
  public final long y;
  public final long z;

  public Z3Vector(long x, long y, long z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public final Z3Vector plus(Z3Vector that) {
    return new Z3Vector(this.x + that.x, this.y + that.y, this.z + that.z);
  }

  public final Z3Vector opposite() {
    return new Z3Vector(-this.x, -this.y, -this.z);
  }

  public final Z3Vector minus(Z3Vector that) {
    return new Z3Vector(this.x - that.x, this.y - that.y, this.z - that.z);
  }

  public final Z3Vector times(long scalar) {
    return new Z3Vector(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  public R3Vector transform(Z3ToR3Function f) {
    return new R3Vector(f.transformX(this.x, this.y, this.z),
                        f.transformY(this.x, this.y, this.z),
                        f.transformZ(this.x, this.y, this.z));
  }

  public Value toValue() {
    return Z3Vector.form().mold(this).toValue();
  }

  protected boolean canEqual(Z3Vector that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Z3Vector) {
      final Z3Vector that = (Z3Vector) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y && this.z == that.z;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Z3Vector.hashSeed == 0) {
      Z3Vector.hashSeed = Murmur3.seed(Z3Vector.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Z3Vector.hashSeed,
        Murmur3.hash(this.x)), Murmur3.hash(this.y)), Murmur3.hash(this.z)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Z3Vector").write('.').write("of").write('(')
                   .debug(this.x).write(", ").debug(this.y).write(", ").debug(this.z).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static Z3Vector zero;

  private static TensorForm<Z3Vector> form;

  public static Z3Vector zero() {
    if (Z3Vector.zero == null) {
      Z3Vector.zero = new Z3Vector(0L, 0L, 0L);
    }
    return Z3Vector.zero;
  }

  public static Z3Vector of(long x, long y, long z) {
    return new Z3Vector(x, y, z);
  }

  @Kind
  public static TensorForm<Z3Vector> form() {
    if (Z3Vector.form == null) {
      Z3Vector.form = new Z3VectorForm();
    }
    return Z3Vector.form;
  }

}
