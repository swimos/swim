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

public class R2Circle extends R2Shape implements Debug {

  public final double cx;
  public final double cy;
  public final double r;

  public R2Circle(double cx, double cy, double r) {
    this.cx = cx;
    this.cy = cy;
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
  public final double xMax() {
    return this.cx + this.r;
  }

  @Override
  public final double yMax() {
    return this.cy + this.r;
  }

  @Override
  public boolean contains(R2Shape shape) {
    if (shape instanceof R2Point) {
      return this.contains((R2Point) shape);
    } else if (shape instanceof R2Box) {
      return this.contains((R2Box) shape);
    } else if (shape instanceof R2Circle) {
      return this.contains((R2Circle) shape);
    } else {
      return false;
    }
  }

  public boolean contains(R2Point point) {
    final double dx = point.x - this.cx;
    final double dy = point.y - this.cy;
    return dx * dx + dy * dy <= this.r * this.r;
  }

  public boolean contains(R2Box box) {
    final double dxMin = box.xMin - this.cx;
    final double dyMin = box.yMin - this.cy;
    final double dxMax = box.xMax - this.cx;
    final double dyMax = box.yMax - this.cy;
    final double r2 = this.r * this.r;
    return dxMin * dxMin + dyMin * dyMin <= r2
        && dxMin * dxMin + dyMax * dyMax <= r2
        && dxMax * dxMax + dyMin * dyMin <= r2
        && dxMax * dxMax + dyMax * dyMax <= r2;
  }

  public boolean contains(R2Circle circle) {
    final double dx = circle.cx - this.cx;
    final double dy = circle.cy - this.cy;
    return dx * dx + dy * dy + circle.r * circle.r <= this.r * this.r;
  }

  @Override
  public boolean intersects(R2Shape shape) {
    if (shape instanceof R2Point) {
      return this.intersects((R2Point) shape);
    } else if (shape instanceof R2Box) {
      return this.intersects((R2Box) shape);
    } else if (shape instanceof R2Circle) {
      return this.intersects((R2Circle) shape);
    } else {
      return shape.intersects(this);
    }
  }

  public boolean intersects(R2Point point) {
    final double dx = point.x - this.cx;
    final double dy = point.y - this.cy;
    return dx * dx + dy * dy <= this.r * this.r;
  }

  public boolean intersects(R2Box box) {
    final double dx = (this.cx < box.xMin ? box.xMin : box.xMax < this.cx ? box.xMax : this.cx) - this.cx;
    final double dy = (this.cy < box.yMin ? box.yMin : box.yMax < this.cy ? box.yMax : this.cy) - this.cy;
    return dx * dx + dy * dy <= this.r * this.r;
  }

  public boolean intersects(R2Circle circle) {
    final double dx = circle.cx - this.cx;
    final double dy = circle.cy - this.cy;
    final double rr = this.r + circle.r;
    return dx * dx + dy * dy <= rr * rr;
  }

  @Override
  public Z2Box transform(R2ToZ2Function f) {
    final double xMin = this.cx - this.r;
    final double yMin = this.cy - this.r;
    final double xMax = this.cx + this.r;
    final double yMax = this.cy + this.r;
    return new Z2Box(f.transformX(xMin, yMin), f.transformY(xMin, yMin),
                     f.transformX(xMax, yMax), f.transformY(xMax, yMax));
  }

  @Override
  public Value toValue() {
    return R2Circle.form().mold(this).toValue();
  }

  protected boolean canEqual(R2Circle that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof R2Circle) {
      final R2Circle that = (R2Circle) other;
      return that.canEqual(this) && this.cx == that.cx && this.cy == that.cy && this.r == that.r;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (R2Circle.hashSeed == 0) {
      R2Circle.hashSeed = Murmur3.seed(R2Circle.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(R2Circle.hashSeed,
        Murmur3.hash(this.cx)), Murmur3.hash(this.cy)), Murmur3.hash(this.r)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("R2Circle").write('.').write("of").write('(')
                   .debug(this.cx).write(", ").debug(this.cy).write(", ").debug(this.r).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static R2Circle of(double cx, double cy, double r) {
    return new R2Circle(cx, cy, r);
  }

  private static R2Form<R2Circle> form;

  @Kind
  public static R2Form<R2Circle> form() {
    if (R2Circle.form == null) {
      R2Circle.form = new R2CircleForm();
    }
    return R2Circle.form;
  }

}
