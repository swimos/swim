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

public class Z3Box extends Z3Shape implements Debug {

  public final long xMin;
  public final long yMin;
  public final long zMin;
  public final long xMax;
  public final long yMax;
  public final long zMax;

  public Z3Box(long xMin, long yMin, long zMin, long xMax, long yMax, long zMax) {
    this.xMin = xMin <= xMax ? xMin : xMax;
    this.yMin = yMin <= yMax ? yMin : yMax;
    this.zMin = zMin <= zMax ? zMin : zMax;
    this.xMax = xMin <= xMax ? xMax : xMin;
    this.yMax = yMin <= yMax ? yMax : yMin;
    this.zMax = zMin <= zMax ? zMax : zMin;
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
  public final long zMin() {
    return this.zMin;
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
  public final long zMax() {
    return this.zMax;
  }

  @Override
  public boolean contains(Z3Shape shape) {
    if (shape instanceof Z3Point) {
      return this.contains((Z3Point) shape);
    } else if (shape instanceof Z3Box) {
      return this.contains((Z3Box) shape);
    } else {
      return this.xMin <= shape.xMin() && shape.xMax() <= this.xMax
          && this.yMin <= shape.yMin() && shape.yMax() <= this.yMax
          && this.zMin <= shape.zMin() && shape.zMax() <= this.zMax;
    }
  }

  public boolean contains(Z3Point point) {
    return this.xMin <= point.x && point.x <= this.xMax
        && this.yMin <= point.y && point.y <= this.yMax
        && this.zMin <= point.z && point.z <= this.zMax;
  }

  public boolean contains(Z3Box box) {
    return this.xMin <= box.xMin && box.xMax <= this.xMax
        && this.yMin <= box.yMin && box.yMax <= this.yMax
        && this.zMin <= box.zMin && box.zMax <= this.zMax;
  }

  @Override
  public boolean intersects(Z3Shape shape) {
    if (shape instanceof Z3Point) {
      return this.intersects((Z3Point) shape);
    } else if (shape instanceof Z3Box) {
      return this.intersects((Z3Box) shape);
    } else {
      return shape.intersects(this);
    }
  }

  public boolean intersects(Z3Point point) {
    return this.xMin <= point.x && point.x <= this.xMax
        && this.yMin <= point.y && point.y <= this.yMax
        && this.zMin <= point.z && point.z <= this.zMax;
  }

  public boolean intersects(Z3Box box) {
    return this.xMin <= box.xMax && box.xMin <= this.xMax
        && this.yMin <= box.yMax && box.yMin <= this.yMax
        && this.zMin <= box.zMax && box.zMin <= this.zMax;
  }

  @Override
  public R3Box transform(Z3ToR3Function f) {
    return new R3Box(f.transformX(this.xMin, this.yMin, this.zMin),
                     f.transformY(this.xMin, this.yMin, this.zMin),
                     f.transformZ(this.xMin, this.yMin, this.zMin),
                     f.transformX(this.xMax, this.yMax, this.zMax),
                     f.transformY(this.xMax, this.yMax, this.zMax),
                     f.transformZ(this.xMax, this.yMax, this.zMax));
  }

  @Override
  public Value toValue() {
    return Z3Box.form().mold(this).toValue();
  }

  protected boolean canEqual(Z3Box that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Z3Box) {
      final Z3Box that = (Z3Box) other;
      return that.canEqual(this)
          && this.xMin == that.xMin && this.yMin == that.yMin && this.zMin == that.zMin
          && this.xMax == that.xMax && this.yMax == that.yMax && this.zMax == that.zMax;
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Z3Box.hashSeed == 0) {
      Z3Box.hashSeed = Murmur3.seed(Z3Box.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Z3Box.hashSeed,
        Murmur3.hash(this.xMin)), Murmur3.hash(this.yMin)), Murmur3.hash(this.zMin)),
        Murmur3.hash(this.xMax)), Murmur3.hash(this.yMax)), Murmur3.hash(this.zMax)));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Z3Box").write('.').write("of").write('(')
                   .debug(this.xMin).write(", ").debug(this.yMin).write(", ").debug(this.zMin).write(", ")
                   .debug(this.xMax).write(", ").debug(this.yMax).write(", ").debug(this.zMax).write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static Z3Box of(long xMin, long yMin, long zMin,
                         long xMax, long yMax, long zMax) {
    return new Z3Box(xMin, yMin, zMin, xMax, yMax, zMax);
  }

  private static Z3Form<Z3Box> form;

  @Kind
  public static Z3Form<Z3Box> form() {
    if (Z3Box.form == null) {
      Z3Box.form = new Z3BoxForm();
    }
    return Z3Box.form;
  }

}
