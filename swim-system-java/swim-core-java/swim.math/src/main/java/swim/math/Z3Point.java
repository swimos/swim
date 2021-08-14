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

public class Z3Point extends Z3Shape implements Debug {

  public final long x;
  public final long y;
  public final long z;

  public Z3Point(long x, long y, long z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public final Z3Point plus(Z3Vector vector) {
    return new Z3Point(this.x + vector.x, this.y + vector.y, this.z + vector.z);
  }

  public final Z3Point minux(Z3Vector vector) {
    return new Z3Point(this.x - vector.x, this.y - vector.y, this.z - vector.z);
  }

  public final Z3Vector minus(Z3Point that) {
    return new Z3Vector(this.x - that.x, this.y - that.y, this.z - that.z);
  }

  @Override
  public final long xMin() {
    return this.x;
  }

  @Override
  public final long yMin() {
    return this.y;
  }

  @Override
  public final long zMin() {
    return this.z;
  }

  @Override
  public final long xMax() {
    return this.x;
  }

  @Override
  public final long yMax() {
    return this.y;
  }

  @Override
  public final long zMax() {
    return this.z;
  }

  @Override
  public boolean contains(Z3Shape shape) {
    return this.x <= shape.xMin() && shape.xMax() <= this.x
        && this.y <= shape.yMin() && shape.yMax() <= this.y
        && this.z <= shape.zMin() && shape.zMax() <= this.z;
  }

  @Override
  public boolean intersects(Z3Shape shape) {
    return shape.intersects(this);
  }

  @Override
  public R3Point transform(Z3ToR3Function f) {
    return new R3Point(f.transformX(this.x, this.y, this.z),
                       f.transformY(this.x, this.y, this.z),
                       f.transformZ(this.x, this.y, this.z));
  }

  @Override
  public Value toValue() {
    return Z3Point.form().mold(this).toValue();
  }

  protected boolean canEqual(Z3Point that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Z3Point) {
      final Z3Point that = (Z3Point) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y && this.z == that.z;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Z3Point.hashSeed == 0) {
      Z3Point.hashSeed = Murmur3.seed(Z3Point.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Z3Point.hashSeed,
        Murmur3.hash(this.x)), Murmur3.hash(this.y)), Murmur3.hash(this.z)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Z3Point").write('.').write("of").write('(')
                   .debug(this.x).write(", ").debug(this.y).write(", ").debug(this.z).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static Z3Point origin;

  public static Z3Point origin() {
    if (Z3Point.origin == null) {
      Z3Point.origin = new Z3Point(0L, 0L, 0L);
    }
    return Z3Point.origin;
  }

  public static Z3Point of(long x, long y, long z) {
    return new Z3Point(x, y, z);
  }

  private static Z3Form<Z3Point> form;

  @Kind
  public static Z3Form<Z3Point> form() {
    if (Z3Point.form == null) {
      Z3Point.form = new Z3PointForm();
    }
    return Z3Point.form;
  }

}
