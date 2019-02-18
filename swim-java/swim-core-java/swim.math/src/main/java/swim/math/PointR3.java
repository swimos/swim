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

package swim.math;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.Kind;
import swim.structure.Value;
import swim.util.Murmur3;

public class PointR3 extends R3Shape implements Debug {
  public final double x;
  public final double y;
  public final double z;

  public PointR3(double x, double y, double z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public final PointR3 plus(VectorR3 vector) {
    return new PointR3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
  }

  public final PointR3 minux(VectorR3 vector) {
    return new PointR3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
  }

  public final VectorR3 minus(PointR3 that) {
    return new VectorR3(this.x - that.x, this.y - that.y, this.z - that.z);
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
  public PointZ3 transform(R3ToZ3Function f) {
    return new PointZ3(f.transformX(this.x, this.y, this.z),
                       f.transformY(this.x, this.y, this.z),
                       f.transformZ(this.x, this.y, this.z));
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  protected boolean canEqual(PointR3 that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof PointR3) {
      final PointR3 that = (PointR3) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y && this.z == that.z;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(PointR3.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.x)), Murmur3.hash(this.y)), Murmur3.hash(this.z)));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("PointR3").write('.').write("of").write('(')
        .debug(this.x).write(", ").debug(this.y).write(", ").debug(this.z).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static PointR3 origin;

  private static R3Form<PointR3> form;

  public static PointR3 origin() {
    if (origin == null) {
      origin = new PointR3(0.0, 0.0, 0.0);
    }
    return origin;
  }

  public static PointR3 of(double x, double y, double z) {
    return new PointR3(x, y, z);
  }

  @Kind
  public static R3Form<PointR3> form() {
    if (form == null) {
      form = new PointR3Form();
    }
    return form;
  }
}
