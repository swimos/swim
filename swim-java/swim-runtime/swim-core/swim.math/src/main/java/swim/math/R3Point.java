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

public class R3Point extends R3Shape implements Debug {

  public final double x;
  public final double y;
  public final double z;

  public R3Point(double x, double y, double z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public final R3Point plus(R3Vector vector) {
    return new R3Point(this.x + vector.x, this.y + vector.y, this.z + vector.z);
  }

  public final R3Point minux(R3Vector vector) {
    return new R3Point(this.x - vector.x, this.y - vector.y, this.z - vector.z);
  }

  public final R3Vector minus(R3Point that) {
    return new R3Vector(this.x - that.x, this.y - that.y, this.z - that.z);
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
  public final double zMin() {
    return this.z;
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
  public final double zMax() {
    return this.z;
  }

  @Override
  public boolean contains(R3Shape shape) {
    return this.x <= shape.xMin() && shape.xMax() <= this.x
        && this.y <= shape.yMin() && shape.yMax() <= this.y
        && this.z <= shape.zMin() && shape.zMax() <= this.z;
  }

  @Override
  public boolean intersects(R3Shape shape) {
    return shape.intersects(this);
  }

  @Override
  public Z3Point transform(R3ToZ3Function f) {
    return new Z3Point(f.transformX(this.x, this.y, this.z),
                       f.transformY(this.x, this.y, this.z),
                       f.transformZ(this.x, this.y, this.z));
  }

  @Override
  public Value toValue() {
    return R3Point.form().mold(this).toValue();
  }

  protected boolean canEqual(R3Point that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof R3Point) {
      final R3Point that = (R3Point) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y && this.z == that.z;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (R3Point.hashSeed == 0) {
      R3Point.hashSeed = Murmur3.seed(R3Point.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(R3Point.hashSeed,
        Murmur3.hash(this.x)), Murmur3.hash(this.y)), Murmur3.hash(this.z)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("R3Point").write('.').write("of").write('(')
                   .debug(this.x).write(", ").debug(this.y).write(", ").debug(this.z).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static R3Point origin;

  public static R3Point origin() {
    if (R3Point.origin == null) {
      R3Point.origin = new R3Point(0.0, 0.0, 0.0);
    }
    return R3Point.origin;
  }

  public static R3Point of(double x, double y, double z) {
    return new R3Point(x, y, z);
  }

  private static R3Form<R3Point> form;

  @Kind
  public static R3Form<R3Point> form() {
    if (R3Point.form == null) {
      R3Point.form = new R3PointForm();
    }
    return R3Point.form;
  }

}
