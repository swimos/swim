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

public class R3Box extends R3Shape implements Debug {

  public final double xMin;
  public final double yMin;
  public final double zMin;
  public final double xMax;
  public final double yMax;
  public final double zMax;

  public R3Box(double xMin, double yMin, double zMin, double xMax, double yMax, double zMax) {
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
    if (shape instanceof R3Point) {
      return this.contains((R3Point) shape);
    } else if (shape instanceof R3Box) {
      return this.contains((R3Box) shape);
    } else if (shape instanceof R3Sphere) {
      return this.contains((R3Sphere) shape);
    } else {
      return this.xMin <= shape.xMin() && shape.xMax() <= this.xMax
          && this.yMin <= shape.yMin() && shape.yMax() <= this.yMax
          && this.zMin <= shape.zMin() && shape.zMax() <= this.zMax;
    }
  }

  public boolean contains(R3Point point) {
    return this.xMin <= point.x && point.x <= this.xMax
        && this.yMin <= point.y && point.y <= this.yMax
        && this.zMin <= point.z && point.z <= this.zMax;
  }

  public boolean contains(R3Box box) {
    return this.xMin <= box.xMin && box.xMax <= this.xMax
        && this.yMin <= box.yMin && box.yMax <= this.yMax
        && this.zMin <= box.zMin && box.zMax <= this.zMax;
  }

  public boolean contains(R3Sphere sphere) {
    return this.xMin <= sphere.cx - sphere.r && sphere.cx + sphere.r <= this.xMax
        && this.yMin <= sphere.cy - sphere.r && sphere.cy + sphere.r <= this.yMax
        && this.zMin <= sphere.cz - sphere.r && sphere.cz + sphere.r <= this.zMax;
  }

  @Override
  public boolean intersects(R3Shape shape) {
    if (shape instanceof R3Point) {
      return this.intersects((R3Point) shape);
    } else if (shape instanceof R3Box) {
      return this.intersects((R3Box) shape);
    } else if (shape instanceof R3Sphere) {
      return this.intersects((R3Sphere) shape);
    } else {
      return shape.intersects(this);
    }
  }

  public boolean intersects(R3Point point) {
    return this.xMin <= point.x && point.x <= this.xMax
        && this.yMin <= point.y && point.y <= this.yMax
        && this.zMin <= point.z && point.z <= this.zMax;
  }

  public boolean intersects(R3Box box) {
    return this.xMin <= box.xMax && box.xMin <= this.xMax
        && this.yMin <= box.yMax && box.yMin <= this.yMax
        && this.zMin <= box.zMax && box.zMin <= this.zMax;
  }

  public boolean intersects(R3Sphere sphere) {
    final double dx = (sphere.cx < this.xMin ? this.xMin : this.xMax < sphere.cx ? this.xMax : sphere.cx) - sphere.cx;
    final double dy = (sphere.cy < this.yMin ? this.yMin : this.yMax < sphere.cy ? this.yMax : sphere.cy) - sphere.cy;
    final double dz = (sphere.cz < this.zMin ? this.zMin : this.zMax < sphere.cz ? this.zMax : sphere.cz) - sphere.cz;
    return dx * dx + dy * dy + dz * dz <= sphere.r * sphere.r;
  }

  @Override
  public Z3Box transform(R3ToZ3Function f) {
    return new Z3Box(f.transformX(this.xMin, this.yMin, this.zMin),
                     f.transformY(this.xMin, this.yMin, this.zMin),
                     f.transformZ(this.xMin, this.yMin, this.zMin),
                     f.transformX(this.xMax, this.yMax, this.zMax),
                     f.transformY(this.xMax, this.yMax, this.zMax),
                     f.transformZ(this.zMax, this.zMax, this.zMax));
  }

  @Override
  public Value toValue() {
    return R3Box.form().mold(this).toValue();
  }

  protected boolean canEqual(R3Box that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof R3Box) {
      final R3Box that = (R3Box) other;
      return that.canEqual(this)
          && this.xMin == that.xMin && this.yMin == that.yMin && this.zMin == that.zMin
          && this.xMax == that.xMax && this.yMax == that.yMax && this.zMax == that.zMax;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (R3Box.hashSeed == 0) {
      R3Box.hashSeed = Murmur3.seed(R3Box.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(R3Box.hashSeed,
        Murmur3.hash(this.xMin)), Murmur3.hash(this.yMin)), Murmur3.hash(this.zMin)),
        Murmur3.hash(this.xMax)), Murmur3.hash(this.yMax)), Murmur3.hash(this.zMax)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("R3Box").write('.').write("of").write('(')
                   .debug(this.xMin).write(", ").debug(this.yMin).write(", ").debug(this.zMin).write(", ")
                   .debug(this.xMax).write(", ").debug(this.yMax).write(", ").debug(this.zMax).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static R3Box of(double xMin, double yMin, double zMin,
                         double xMax, double yMax, double zMax) {
    return new R3Box(xMin, yMin, zMin, xMax, yMax, zMax);
  }

  private static R3Form<R3Box> form;

  @Kind
  public static R3Form<R3Box> form() {
    if (R3Box.form == null) {
      R3Box.form = new R3BoxForm();
    }
    return R3Box.form;
  }

}
