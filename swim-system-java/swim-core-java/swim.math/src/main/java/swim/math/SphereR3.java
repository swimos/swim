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

public class SphereR3 extends R3Shape implements Debug {
  public final double cx;
  public final double cy;
  public final double cz;
  public final double r;

  public SphereR3(double cx, double cy, double cz, double r) {
    this.cx = cx;
    this.cy = cy;
    this.cz = cz;
    this.r = r;
  }

  @Override
  public final double xMin() {
    return this.cx - this.r;
  }

  @Override
  public final double yMin() {
    return this.cy - this.r;
  }

  @Override
  public final double zMin() {
    return this.cz - this.r;
  }

  @Override
  public final double xMax() {
    return this.cx + this.r;
  }

  @Override
  public final double yMax() {
    return this.cy + this.r;
  }

  @Override
  public final double zMax() {
    return this.cz + this.r;
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
      return false;
    }
  }

  public boolean contains(PointR3 point) {
    final double dx = point.x - this.cx;
    final double dy = point.y - this.cy;
    final double dz = point.z - this.cz;
    return dx * dx + dy * dy + dz * dz <= this.r * this.r;
  }

  public boolean contains(BoxR3 box) {
    final double dxMin = box.xMin - this.cx;
    final double dyMin = box.yMin - this.cy;
    final double dzMin = box.zMin - this.cz;
    final double dxMax = box.xMax - this.cx;
    final double dyMax = box.yMax - this.cy;
    final double dzMax = box.zMax - this.cz;
    final double r2 = this.r * this.r;
    return dxMin * dxMin + dyMin * dyMin + dzMin * dzMin <= r2
        && dxMin * dxMin + dyMin * dyMin + dzMax * dzMax <= r2
        && dxMin * dxMin + dyMax * dyMax + dzMin * dzMin <= r2
        && dxMin * dxMin + dyMax * dyMax + dzMax * dzMax <= r2
        && dxMax * dxMax + dyMin * dyMin + dzMin * dzMin <= r2
        && dxMax * dxMax + dyMin * dyMin + dzMax * dzMax <= r2
        && dxMax * dxMax + dyMax * dyMax + dzMin * dzMin <= r2
        && dxMax * dxMax + dyMax * dyMax + dzMax * dzMax <= r2;
  }

  public boolean contains(SphereR3 sphere) {
    final double dx = sphere.cx - this.cx;
    final double dy = sphere.cy - this.cy;
    final double dz = sphere.cz - this.cz;
    return dx * dx + dy * dy + dz * dz + sphere.r * sphere.r <= this.r * this.r;
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
    final double dx = point.x - this.cx;
    final double dy = point.y - this.cy;
    final double dz = point.z - this.cz;
    return dx * dx + dy * dy + dz * dz <= this.r * this.r;
  }

  public boolean intersects(BoxR3 box) {
    final double dx = (this.cx < box.xMin ? box.xMin : box.xMax < this.cx ? box.xMax : this.cx) - this.cx;
    final double dy = (this.cy < box.yMin ? box.yMin : box.yMax < this.cy ? box.yMax : this.cy) - this.cy;
    final double dz = (this.cz < box.zMin ? box.zMin : box.zMax < this.cz ? box.xMax : this.cz) - this.cz;
    return dx * dx + dy * dy + dz * dz <= this.r * this.r;
  }

  public boolean intersects(SphereR3 sphere) {
    final double dx = sphere.cx - this.cx;
    final double dy = sphere.cy - this.cy;
    final double dz = sphere.cz - this.cz;
    final double rr = this.r + sphere.r;
    return dx * dx + dy * dy + dz * dz <= rr * rr;
  }

  @Override
  public BoxZ3 transform(R3ToZ3Function f) {
    final double xMin = this.cx - this.r;
    final double yMin = this.cy - this.r;
    final double zMin = this.cz - this.r;
    final double xMax = this.cx + this.r;
    final double yMax = this.cy + this.r;
    final double zMax = this.cz + this.r;
    return new BoxZ3(f.transformX(xMin, yMin, zMin),
                     f.transformY(xMin, yMin, zMin),
                     f.transformZ(xMin, yMin, zMin),
                     f.transformX(xMax, yMax, xMax),
                     f.transformY(xMax, yMax, xMax),
                     f.transformZ(xMax, yMax, xMax));
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  protected boolean canEqual(SphereR3 that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof SphereR3) {
      final SphereR3 that = (SphereR3) other;
      return that.canEqual(this) && this.cx == that.cx && this.cy == that.cy
          && this.cz == that.cz && this.r == that.r;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(SphereR3.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.cx)), Murmur3.hash(this.cy)),
        Murmur3.hash(this.cz)), Murmur3.hash(this.r)));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("SphereR3").write('.').write("of").write('(')
        .debug(this.cx).write(", ").debug(this.cy).write(", ")
        .debug(this.cz).write(", ").debug(this.r).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static R3Form<SphereR3> form;

  public static SphereR3 of(double cx, double cy, double cz, double r) {
    return new SphereR3(cx, cy, cz, r);
  }

  @Kind
  public static R3Form<SphereR3> form() {
    if (form == null) {
      form = new SphereR3Form();
    }
    return form;
  }
}
