// Copyright 2015-2021 Swim Inc.
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

public class Z2Box extends Z2Shape implements Debug {

  public final long xMin;
  public final long yMin;
  public final long xMax;
  public final long yMax;

  public Z2Box(long xMin, long yMin, long xMax, long yMax) {
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
    if (shape instanceof Z2Point) {
      return this.contains((Z2Point) shape);
    } else if (shape instanceof Z2Box) {
      return this.contains((Z2Box) shape);
    } else {
      return this.xMin <= shape.xMin() && shape.xMax() <= this.xMax
          && this.yMin <= shape.yMin() && shape.yMax() <= this.yMax;
    }
  }

  public boolean contains(Z2Point point) {
    return this.xMin <= point.x && point.x <= this.xMax
        && this.yMin <= point.y && point.y <= this.yMax;
  }

  public boolean contains(Z2Box box) {
    return this.xMin <= box.xMin && box.xMax <= this.xMax
        && this.yMin <= box.yMin && box.yMax <= this.yMax;
  }

  @Override
  public boolean intersects(Z2Shape shape) {
    if (shape instanceof Z2Point) {
      return this.intersects((Z2Point) shape);
    } else if (shape instanceof Z2Box) {
      return this.intersects((Z2Box) shape);
    } else {
      return shape.intersects(this);
    }
  }

  public boolean intersects(Z2Point point) {
    return this.xMin <= point.x && point.x <= this.xMax
        && this.yMin <= point.y && point.y <= this.yMax;
  }

  public boolean intersects(Z2Box box) {
    return this.xMin <= box.xMax && box.xMin <= this.xMax
        && this.yMin <= box.yMax && box.yMin <= this.yMax;
  }

  @Override
  public R2Box transform(Z2ToR2Function f) {
    return new R2Box(f.transformX(this.xMin, this.yMin), f.transformY(this.xMin, this.yMin),
                     f.transformX(this.xMax, this.yMax), f.transformY(this.xMax, this.yMax));
  }

  @Override
  public Value toValue() {
    return Z2Box.form().mold(this).toValue();
  }

  protected boolean canEqual(Z2Box that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Z2Box) {
      final Z2Box that = (Z2Box) other;
      return that.canEqual(this) && this.xMin == that.xMin && this.yMin == that.yMin
          && this.xMax == that.xMax && this.yMax == that.yMax;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Z2Box.hashSeed == 0) {
      Z2Box.hashSeed = Murmur3.seed(Z2Box.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Z2Box.hashSeed,
        Murmur3.hash(this.xMin)), Murmur3.hash(this.yMin)),
        Murmur3.hash(this.xMax)), Murmur3.hash(this.yMax)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Z2Box").write('.').write("of").write('(')
                   .debug(this.xMin).write(", ").debug(this.yMin).write(", ")
                   .debug(this.xMax).write(", ").debug(this.yMax).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static Z2Box of(long xMin, long yMin, long xMax, long yMax) {
    return new Z2Box(xMin, yMin, xMax, yMax);
  }

  private static Z2Form<Z2Box> form;

  @Kind
  public static Z2Form<Z2Box> form() {
    if (Z2Box.form == null) {
      Z2Box.form = new Z2BoxForm();
    }
    return Z2Box.form;
  }

}
