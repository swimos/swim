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

public class R2Point extends R2Shape implements Debug {

  public final double x;
  public final double y;

  public R2Point(double x, double y) {
    this.x = x;
    this.y = y;
  }

  public final R2Point plus(R2Vector vector) {
    return new R2Point(this.x + vector.x, this.y + vector.y);
  }

  public final R2Point minux(R2Vector vector) {
    return new R2Point(this.x - vector.x, this.y - vector.y);
  }

  public final R2Vector minus(R2Point that) {
    return new R2Vector(this.x - that.x, this.y - that.y);
  }

  @Override
  public final double xMin() {
    return this.x;
  }

  @Override
  public final double yMin() {
    return this.y;
  }

  @Override
  public final double xMax() {
    return this.x;
  }

  @Override
  public final double yMax() {
    return this.y;
  }

  @Override
  public boolean contains(R2Shape shape) {
    return this.x <= shape.xMin() && shape.xMax() <= this.x
        && this.y <= shape.yMin() && shape.yMax() <= this.y;
  }

  @Override
  public boolean intersects(R2Shape shape) {
    return shape.intersects(this);
  }

  @Override
  public Z2Point transform(R2ToZ2Function f) {
    return new Z2Point(f.transformX(this.x, this.y), f.transformY(this.x, this.y));
  }

  @Override
  public Value toValue() {
    return R2Point.form().mold(this).toValue();
  }

  protected boolean canEqual(R2Point that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof R2Point) {
      final R2Point that = (R2Point) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (R2Point.hashSeed == 0) {
      R2Point.hashSeed = Murmur3.seed(R2Point.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(R2Point.hashSeed,
        Murmur3.hash(this.x)), Murmur3.hash(this.y)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("R2Point").write('.').write("of").write('(')
                   .debug(this.x).write(", ").debug(this.y).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static R2Point origin;

  public static R2Point origin() {
    if (R2Point.origin == null) {
      R2Point.origin = new R2Point(0.0, 0.0);
    }
    return R2Point.origin;
  }

  public static R2Point of(double x, double y) {
    return new R2Point(x, y);
  }

  private static R2Form<R2Point> form;

  @Kind
  public static R2Form<R2Point> form() {
    if (R2Point.form == null) {
      R2Point.form = new R2PointForm();
    }
    return R2Point.form;
  }

}
