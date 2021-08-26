// Copyright 2015-2021 Swim Inc.
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

public class R2Vector implements Debug {

  public final double x;
  public final double y;

  public R2Vector(double x, double y) {
    this.x = x;
    this.y = y;
  }

  public final R2Vector plus(R2Vector that) {
    return new R2Vector(this.x + that.x, this.y + that.y);
  }

  public final R2Vector opposite() {
    return new R2Vector(-this.x, -this.y);
  }

  public final R2Vector minus(R2Vector that) {
    return new R2Vector(this.x - that.x, this.y - that.y);
  }

  public final R2Vector times(double scalar) {
    return new R2Vector(this.x * scalar, this.y * scalar);
  }

  public Z2Vector transform(R2ToZ2Function f) {
    return new Z2Vector(f.transformX(this.x, this.y), f.transformY(this.x, this.y));
  }

  public Value toValue() {
    return R2Vector.form().mold(this).toValue();
  }

  protected boolean canEqual(R2Vector that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof R2Vector) {
      final R2Vector that = (R2Vector) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (R2Vector.hashSeed == 0) {
      R2Vector.hashSeed = Murmur3.seed(R2Vector.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(R2Vector.hashSeed,
        Murmur3.hash(this.x)), Murmur3.hash(this.y)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("R2Vector").write('.').write("of").write('(')
                   .debug(this.x).write(", ").debug(this.y).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static R2Vector zero;

  public static R2Vector zero() {
    if (R2Vector.zero == null) {
      R2Vector.zero = new R2Vector(0.0, 0.0);
    }
    return R2Vector.zero;
  }

  public static R2Vector of(double x, double y) {
    return new R2Vector(x, y);
  }

  private static TensorForm<R2Vector> form;

  @Kind
  public static TensorForm<R2Vector> form() {
    if (R2Vector.form == null) {
      R2Vector.form = new R2VectorForm();
    }
    return R2Vector.form;
  }

}
