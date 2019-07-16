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

public class PointZ3 extends Z3Shape implements Debug {
  public final long x;
  public final long y;
  public final long z;

  public PointZ3(long x, long y, long z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public final PointZ3 plus(VectorZ3 vector) {
    return new PointZ3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
  }

  public final PointZ3 minux(VectorZ3 vector) {
    return new PointZ3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
  }

  public final VectorZ3 minus(PointZ3 that) {
    return new VectorZ3(this.x - that.x, this.y - that.y, this.z - that.z);
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
  public PointR3 transform(Z3ToR3Function f) {
    return new PointR3(f.transformX(this.x, this.y, this.z),
                       f.transformY(this.x, this.y, this.z),
                       f.transformZ(this.x, this.y, this.z));
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  protected boolean canEqual(PointZ3 that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof PointZ3) {
      final PointZ3 that = (PointZ3) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y && this.z == that.z;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(PointZ3.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.x)), Murmur3.hash(this.y)), Murmur3.hash(this.z)));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("PointZ3").write('.').write("of").write('(')
        .debug(this.x).write(", ").debug(this.y).write(", ").debug(this.z).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static PointZ3 origin;

  private static Z3Form<PointZ3> form;

  public static PointZ3 origin() {
    if (origin == null) {
      origin = new PointZ3(0L, 0L, 0L);
    }
    return origin;
  }

  public static PointZ3 of(long x, long y, long z) {
    return new PointZ3(x, y, z);
  }

  @Kind
  public static Z3Form<PointZ3> form() {
    if (form == null) {
      form = new PointZ3Form();
    }
    return form;
  }
}
