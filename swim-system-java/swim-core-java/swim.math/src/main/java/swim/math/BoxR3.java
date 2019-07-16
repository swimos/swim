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

public class BoxR3 extends R3Shape implements Debug {
  public final double xMin;
  public final double yMin;
  public final double zMin;
  public final double xMax;
  public final double yMax;
  public final double zMax;

  public BoxR3(double xMin, double yMin, double zMin, double xMax, double yMax, double zMax) {
    this.xMin = xMin <= xMax ? xMin : xMax;
    this.yMin = yMin <= yMax ? yMin : yMax;
    this.zMin = zMin <= zMax ? zMin : zMax;
    this.xMax = xMin <= xMax ? xMax : xMin;
    this.yMax = yMin <= yMax ? yMax : yMin;
    this.zMax = zMin <= zMax ? zMax : zMin;
  }

  @Override
  public final double xMin() {
    return this.xMin;
  }

  @Override
  public final double yMin() {
    return this.yMin;
  }

  @Override
  public final double zMin() {
    return this.zMin;
  }

  @Override
  public final double xMax() {
    return this.xMax;
  }

  @Override
  public final double yMax() {
    return this.yMax;
  }

  @Override
  public final double zMax() {
    return this.zMax;
  }

  @Override
  public boolean contains(R3Shape shape) {
    if (shape instanceof PointR3) {
      return contains((PointR3) shape);
    } else if (shape instanceof BoxR3) {
      return contains((BoxR3) shape);
    } else if (shape instanceof SphereR3) {
      return contains((SphereR3) shape);
    } else {
      return this.xMin <= shape.xMin() && shape.xMax() <= this.xMax
          && this.yMin <= shape.yMin() && shape.yMax() <= this.yMax
          && this.zMin <= shape.zMin() && shape.zMax() <= this.zMax;
    }
  }

  public boolean contains(PointR3 point) {
    return this.xMin <= point.x && point.x <= this.xMax
        && this.yMin <= point.y && point.y <= this.yMax
        && this.zMin <= point.z && point.z <= this.zMax;
  }

  public boolean contains(BoxR3 box) {
    return this.xMin <= box.xMin && box.xMax <= this.xMax
        && this.yMin <= box.yMin && box.yMax <= this.yMax
        && this.zMin <= box.zMin && box.zMax <= this.zMax;
  }

  public boolean contains(SphereR3 sphere) {
    return this.xMin <= sphere.cx - sphere.r && sphere.cx + sphere.r <= this.xMax
        && this.yMin <= sphere.cy - sphere.r && sphere.cy + sphere.r <= this.yMax
        && this.zMin <= sphere.cz - sphere.r && sphere.cz + sphere.r <= this.zMax;
  }

  @Override
  public boolean intersects(R3Shape shape) {
    if (shape instanceof PointR3) {
      return intersects((PointR3) shape);
    } else if (shape instanceof BoxR3) {
      return intersects((BoxR3) shape);
    } else if (shape instanceof SphereR3) {
      return intersects((SphereR3) shape);
    } else {
      return shape.intersects(this);
    }
  }

  public boolean intersects(PointR3 point) {
    return this.xMin <= point.x && point.x <= this.xMax
        && this.yMin <= point.y && point.y <= this.yMax
        && this.zMin <= point.z && point.z <= this.zMax;
  }

  public boolean intersects(BoxR3 box) {
    return this.xMin <= box.xMax && box.xMin <= this.xMax
        && this.yMin <= box.yMax && box.yMin <= this.yMax
        && this.zMin <= box.zMax && box.zMin <= this.zMax;
  }

  public boolean intersects(SphereR3 sphere) {
    final double dx = (sphere.cx < this.xMin ? this.xMin : this.xMax < sphere.cx ? this.xMax : sphere.cx) - sphere.cx;
    final double dy = (sphere.cy < this.yMin ? this.yMin : this.yMax < sphere.cy ? this.yMax : sphere.cy) - sphere.cy;
    final double dz = (sphere.cz < this.zMin ? this.zMin : this.zMax < sphere.cz ? this.zMax : sphere.cz) - sphere.cz;
    return dx * dx + dy * dy + dz * dz <= sphere.r * sphere.r;
  }

  @Override
  public BoxZ3 transform(R3ToZ3Function f) {
    return new BoxZ3(f.transformX(this.xMin, this.yMin, this.zMin),
                     f.transformY(this.xMin, this.yMin, this.zMin),
                     f.transformZ(this.xMin, this.yMin, this.zMin),
                     f.transformX(this.xMax, this.yMax, this.zMax),
                     f.transformY(this.xMax, this.yMax, this.zMax),
                     f.transformZ(this.zMax, this.zMax, this.zMax));
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  protected boolean canEqual(BoxR3 that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof BoxR3) {
      final BoxR3 that = (BoxR3) other;
      return that.canEqual(this)
          && this.xMin == that.xMin && this.yMin == that.yMin && this.zMin == that.zMin
          && this.xMax == that.xMax && this.yMax == that.yMax && this.zMax == that.zMax;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(BoxR3.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.xMin)), Murmur3.hash(this.yMin)), Murmur3.hash(this.zMin)),
        Murmur3.hash(this.xMax)), Murmur3.hash(this.yMax)), Murmur3.hash(this.zMax)));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("BoxR3").write('.').write("of").write('(')
        .debug(this.xMin).write(", ").debug(this.yMin).write(", ").debug(this.zMin).write(", ")
        .debug(this.xMax).write(", ").debug(this.yMax).write(", ").debug(this.zMax).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static R3Form<BoxR3> form;

  public static BoxR3 of(double xMin, double yMin, double zMin,
                         double xMax, double yMax, double zMax) {
    return new BoxR3(xMin, yMin, zMin, xMax, yMax, zMax);
  }

  @Kind
  public static R3Form<BoxR3> form() {
    if (form == null) {
      form = new BoxR3Form();
    }
    return form;
  }
}
