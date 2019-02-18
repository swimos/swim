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

public class BoxZ2 extends Z2Shape implements Debug {
  public final long xMin;
  public final long yMin;
  public final long xMax;
  public final long yMax;

  public BoxZ2(long xMin, long yMin, long xMax, long yMax) {
    this.xMin = xMin <= xMax ? xMin : xMax;
    this.yMin = yMin <= yMax ? yMin : yMax;
    this.xMax = xMin <= xMax ? xMax : xMin;
    this.yMax = yMin <= yMax ? yMax : yMin;
  }

  @Override
  public final long xMin() {
    return this.xMin;
  }

  @Override
  public final long yMin() {
    return this.yMin;
  }

  @Override
  public final long xMax() {
    return this.xMax;
  }

  @Override
  public final long yMax() {
    return this.yMax;
  }

  @Override
  public boolean contains(Z2Shape shape) {
    if (shape instanceof PointZ2) {
      return contains((PointZ2) shape);
    } else if (shape instanceof BoxZ2) {
      return contains((BoxZ2) shape);
    } else {
      return this.xMin <= shape.xMin() && shape.xMax() <= this.xMax
          && this.yMin <= shape.yMin() && shape.yMax() <= this.yMax;
    }
  }

  public boolean contains(PointZ2 point) {
    return this.xMin <= point.x && point.x <= this.xMax
        && this.yMin <= point.y && point.y <= this.yMax;
  }

  public boolean contains(BoxZ2 box) {
    return this.xMin <= box.xMin && box.xMax <= this.xMax
        && this.yMin <= box.yMin && box.yMax <= this.yMax;
  }

  @Override
  public boolean intersects(Z2Shape shape) {
    if (shape instanceof PointZ2) {
      return intersects((PointZ2) shape);
    } else if (shape instanceof BoxZ2) {
      return intersects((BoxZ2) shape);
    } else {
      return shape.intersects(this);
    }
  }

  public boolean intersects(PointZ2 point) {
    return this.xMin <= point.x && point.x <= this.xMax
        && this.yMin <= point.y && point.y <= this.yMax;
  }

  public boolean intersects(BoxZ2 box) {
    return this.xMin <= box.xMax && box.xMin <= this.xMax
        && this.yMin <= box.yMax && box.yMin <= this.yMax;
  }

  @Override
  public BoxR2 transform(Z2ToR2Function f) {
    return new BoxR2(f.transformX(this.xMin, this.yMin), f.transformY(this.xMin, this.yMin),
                     f.transformX(this.xMax, this.yMax), f.transformY(this.xMax, this.yMax));
  }

  @Override
  public Value toValue() {
    return form().mold(this).toValue();
  }

  protected boolean canEqual(BoxZ2 that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof BoxZ2) {
      final BoxZ2 that = (BoxZ2) other;
      return that.canEqual(this) && this.xMin == that.xMin && this.yMin == that.yMin
          && this.xMax == that.xMax && this.yMax == that.yMax;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(BoxZ2.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.xMin)), Murmur3.hash(this.yMin)),
        Murmur3.hash(this.xMax)), Murmur3.hash(this.yMax)));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("BoxZ2").write('.').write("of").write('(')
        .debug(this.xMin).write(", ").debug(this.yMin).write(", ")
        .debug(this.xMax).write(", ").debug(this.yMax).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static Z2Form<BoxZ2> form;

  public static BoxZ2 of(long xMin, long yMin, long xMax, long yMax) {
    return new BoxZ2(xMin, yMin, xMax, yMax);
  }

  @Kind
  public static Z2Form<BoxZ2> form() {
    if (form == null) {
      form = new BoxZ2Form();
    }
    return form;
  }
}
