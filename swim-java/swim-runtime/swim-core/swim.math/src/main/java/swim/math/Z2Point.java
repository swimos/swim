// Copyright 2015-2022 Swim.inc
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

public class Z2Point extends Z2Shape implements Debug {

  public final long x;
  public final long y;

  public Z2Point(long x, long y) {
    this.x = x;
    this.y = y;
  }

  public final Z2Point plus(Z2Vector vector) {
    return new Z2Point(this.x + vector.x, this.y + vector.y);
  }

  public final Z2Point minux(Z2Vector vector) {
    return new Z2Point(this.x - vector.x, this.y - vector.y);
  }

  public final Z2Vector minus(Z2Point that) {
    return new Z2Vector(this.x - that.x, this.y - that.y);
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
  public final long xMax() {
    return this.x;
  }

  @Override
  public final long yMax() {
    return this.y;
  }

  @Override
  public boolean contains(Z2Shape shape) {
    return this.x <= shape.xMin() && shape.xMax() <= this.x
        && this.y <= shape.yMin() && shape.yMax() <= this.y;
  }

  @Override
  public boolean intersects(Z2Shape shape) {
    return shape.intersects(this);
  }

  @Override
  public R2Point transform(Z2ToR2Function f) {
    return new R2Point(f.transformX(this.x, this.y), f.transformY(this.x, this.y));
  }

  @Override
  public Value toValue() {
    return Z2Point.form().mold(this).toValue();
  }

  protected boolean canEqual(Z2Point that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Z2Point) {
      final Z2Point that = (Z2Point) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Z2Point.hashSeed == 0) {
      Z2Point.hashSeed = Murmur3.seed(Z2Point.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Z2Point.hashSeed,
        Murmur3.hash(this.x)), Murmur3.hash(this.y)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Z2Point").write('.').write("of").write('(')
                   .debug(this.x).write(", ").debug(this.y).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static Z2Point origin;

  public static Z2Point origin() {
    if (Z2Point.origin == null) {
      Z2Point.origin = new Z2Point(0L, 0L);
    }
    return Z2Point.origin;
  }

  public static Z2Point of(long x, long y) {
    return new Z2Point(x, y);
  }

  private static Z2Form<Z2Point> form;

  @Kind
  public static Z2Form<Z2Point> form() {
    if (Z2Point.form == null) {
      Z2Point.form = new Z2PointForm();
    }
    return Z2Point.form;
  }

}
