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

public class CircleR2 extends R2Shape implements Debug {
  public final double cx;
  public final double cy;
  public final double r;

  public CircleR2(double cx, double cy, double r) {
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
    if (shape instanceof PointR2) {
      return contains((PointR2) shape);
    } else if (shape instanceof BoxR2) {
      return contains((BoxR2) shape);
    } else if (shape instanceof CircleR2) {
      return contains((CircleR2) shape);
    } else {
      return false;
    }
  }

  public boolean contains(PointR2 point) {
    final double dx = point.x - this.cx;
    final double dy = point.y - this.cy;
    return dx * dx + dy * dy <= this.r * this.r;
  }

  public boolean contains(BoxR2 box) {
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

  public boolean contains(CircleR2 circle) {
    final double dx = circle.cx - this.cx;
    final double dy = circle.cy - this.cy;
    return dx * dx + dy * dy + circle.r * circle.r <= this.r * this.r;
  }

  @Override
  public boolean intersects(R2Shape shape) {
    if (shape instanceof PointR2) {
      return intersects((PointR2) shape);
    } else if (shape instanceof BoxR2) {
      return intersects((BoxR2) shape);
    } else if (shape instanceof CircleR2) {
      return intersects((CircleR2) shape);
    } else {
      return shape.intersects(this);
    }
  }

  public boolean intersects(PointR2 point) {
    final double dx = point.x - this.cx;
    final double dy = point.y - this.cy;
    return dx * dx + dy * dy <= this.r * this.r;
  }

  public boolean intersects(BoxR2 box) {
    final double dx = (this.cx < box.xMin ? box.xMin : box.xMax < this.cx ? box.xMax : this.cx) - this.cx;
    final double dy = (this.cy < box.yMin ? box.yMin : box.yMax < this.cy ? box.yMax : this.cy) - this.cy;
    return dx * dx + dy * dy <= this.r * this.r;
  }

  public boolean intersects(CircleR2 circle) {
    final double dx = circle.cx - this.cx;
    final double dy = circle.cy - this.cy;
    final double rr = this.r + circle.r;
    return dx * dx + dy * dy <= rr * rr;
  }

  @Override
  public BoxZ2 transform(R2ToZ2Function f) {
    final double xMin = this.cx - this.r;
    final double yMin = this.cy - this.r;
    final double xMax = this.cx + this.r;
    final double yMax = this.cy + this.r;
    return new BoxZ2(f.transformX(xMin, yMin), f.transformY(xMin, yMin),
                     f.transformX(xMax, yMax), f.transformY(xMax, yMax));
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  protected boolean canEqual(CircleR2 that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof CircleR2) {
      final CircleR2 that = (CircleR2) other;
      return that.canEqual(this) && this.cx == that.cx && this.cy == that.cy && this.r == that.r;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(CircleR2.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.cx)), Murmur3.hash(this.cy)), Murmur3.hash(this.r)));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("CircleR2").write('.').write("of").write('(')
        .debug(this.cx).write(", ").debug(this.cy).write(", ").debug(this.r).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static R2Form<CircleR2> form;

  public static CircleR2 of(double cx, double cy, double r) {
    return new CircleR2(cx, cy, r);
  }

  @Kind
  public static R2Form<CircleR2> form() {
    if (form == null) {
      form = new CircleR2Form();
    }
    return form;
  }
}
