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

public class BoxR2 extends R2Shape implements Debug {
  public final double xMin;
  public final double yMin;
  public final double xMax;
  public final double yMax;

  public BoxR2(double xMin, double yMin, double xMax, double yMax) {
    this.xMin = xMin <= xMax ? xMin : xMax;
    this.yMin = yMin <= yMax ? yMin : yMax;
    this.xMax = xMin <= xMax ? xMax : xMin;
    this.yMax = yMin <= yMax ? yMax : yMin;
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
  public final double xMax() {
    return this.xMax;
  }

  @Override
  public final double yMax() {
    return this.yMax;
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
      return this.xMin <= shape.xMin() && shape.xMax() <= this.xMax
          && this.yMin <= shape.yMin() && shape.yMax() <= this.yMax;
    }
  }

  public boolean contains(PointR2 point) {
    return this.xMin <= point.x && point.x <= this.xMax
        && this.yMin <= point.y && point.y <= this.yMax;
  }

  public boolean contains(BoxR2 box) {
    return this.xMin <= box.xMin && box.xMax <= this.xMax
        && this.yMin <= box.yMin && box.yMax <= this.yMax;
  }

  public boolean contains(CircleR2 circle) {
    return this.xMin <= circle.cx - circle.r && circle.cx + circle.r <= this.xMax
        && this.yMin <= circle.cy - circle.r && circle.cy + circle.r <= this.yMax;
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
    return this.xMin <= point.x && point.x <= this.xMax
        && this.yMin <= point.y && point.y <= this.yMax;
  }

  public boolean intersects(BoxR2 box) {
    return this.xMin <= box.xMax && box.xMin <= this.xMax
        && this.yMin <= box.yMax && box.yMin <= this.yMax;
  }

  public boolean intersects(CircleR2 circle) {
    final double dx = (circle.cx < this.xMin ? this.xMin : this.xMax < circle.cx ? this.xMax : circle.cx) - circle.cx;
    final double dy = (circle.cy < this.yMin ? this.yMin : this.yMax < circle.cy ? this.yMax : circle.cy) - circle.cy;
    return dx * dx + dy * dy <= circle.r * circle.r;
  }

  @Override
  public BoxZ2 transform(R2ToZ2Function f) {
    return new BoxZ2(f.transformX(this.xMin, this.yMin), f.transformY(this.xMin, this.yMin),
                     f.transformX(this.xMax, this.yMax), f.transformY(this.xMax, this.yMax));
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  protected boolean canEqual(BoxR2 that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof BoxR2) {
      final BoxR2 that = (BoxR2) other;
      return that.canEqual(this) && this.xMin == that.xMin && this.yMin == that.yMin
          && this.xMax == that.xMax && this.yMax == that.yMax;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(BoxR2.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.xMin)), Murmur3.hash(this.yMin)),
        Murmur3.hash(this.xMax)), Murmur3.hash(this.yMax)));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("BoxR2").write('.').write("of").write('(')
        .debug(this.xMin).write(", ").debug(this.yMin).write(", ")
        .debug(this.xMax).write(", ").debug(this.yMax).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static R2Form<BoxR2> form;

  public static BoxR2 of(double xMin, double yMin, double xMax, double yMax) {
    return new BoxR2(xMin, yMin, xMax, yMax);
  }

  @Kind
  public static R2Form<BoxR2> form() {
    if (form == null) {
      form = new BoxR2Form();
    }
    return form;
  }
}
