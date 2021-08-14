// Copyright 2015-2021 Swim inc.
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

public class R3Vector implements Debug {

  public final double x;
  public final double y;
  public final double z;

  public R3Vector(double x, double y, double z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public final R3Vector plus(R3Vector that) {
    return new R3Vector(this.x + that.x, this.y + that.y, this.z + that.z);
  }

  public final R3Vector opposite() {
    return new R3Vector(-this.x, -this.y, -this.z);
  }

  public final R3Vector minus(R3Vector that) {
    return new R3Vector(this.x - that.x, this.y - that.y, this.z - that.z);
  }

  public final R3Vector times(double scalar) {
    return new R3Vector(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  public Z3Vector transform(R3ToZ3Function f) {
    return new Z3Vector(f.transformX(this.x, this.y, this.z),
                        f.transformY(this.x, this.y, this.z),
                        f.transformZ(this.x, this.y, this.z));
  }

  public Value toValue() {
    return R3Vector.form().mold(this).toValue();
  }

  protected boolean canEqual(R3Vector that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof R3Vector) {
      final R3Vector that = (R3Vector) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y && this.z == that.z;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (R3Vector.hashSeed == 0) {
      R3Vector.hashSeed = Murmur3.seed(R3Vector.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(R3Vector.hashSeed,
        Murmur3.hash(this.x)), Murmur3.hash(this.y)), Murmur3.hash(this.z)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("R3Vector").write('.').write("of").write('(')
                   .debug(this.x).write(", ").debug(this.y).write(", ").debug(this.z).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static R3Vector zero;

  public static R3Vector zero() {
    if (R3Vector.zero == null) {
      R3Vector.zero = new R3Vector(0.0, 0.0, 0.0);
    }
    return R3Vector.zero;
  }

  public static R3Vector of(double x, double y, double z) {
    return new R3Vector(x, y, z);
  }

  private static TensorForm<R3Vector> form;

  @Kind
  public static TensorForm<R3Vector> form() {
    if (R3Vector.form == null) {
      R3Vector.form = new R3VectorForm();
    }
    return R3Vector.form;
  }

}
