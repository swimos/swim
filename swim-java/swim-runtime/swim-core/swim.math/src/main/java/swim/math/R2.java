// Copyright 2015-2023 Swim.inc
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

public class R2 implements AffineSpace<R2Point, R2Vector, Double>, VectorSpace<R2Vector, Double>, F2<R2Vector, Double>, Debug {

  protected R2() {
    // singleton
  }

  @Override
  public final R2 vector() {
    return this;
  }

  @Override
  public final R scalar() {
    return R.field();
  }

  @Override
  public TensorDims dimensions() {
    return TensorDims.d2();
  }

  @Override
  public final R2Point origin() {
    return R2Point.origin();
  }

  @Override
  public final R2Vector zero() {
    return R2Vector.zero();
  }

  @Override
  public final R2Vector of(Double x, Double y) {
    return new R2Vector(x, y);
  }

  @Override
  public final Double getX(R2Vector v) {
    return v.x;
  }

  @Override
  public final Double getY(R2Vector v) {
    return v.y;
  }

  @Override
  public final R2Vector add(R2Vector u, R2Vector v) {
    return u.plus(v);
  }

  @Override
  public final R2Vector opposite(R2Vector v) {
    return v.opposite();
  }

  @Override
  public final R2Vector subtract(R2Vector u, R2Vector v) {
    return u.minus(v);
  }

  @Override
  public final R2Vector multiply(R2Vector u, Double a) {
    return u.times(a);
  }

  @Override
  public final R2Vector combine(Double a, R2Vector u, Double b, R2Vector v) {
    return new R2Vector(a * u.x + b * v.x, a * u.y + b * v.y);
  }

  @Override
  public final R2Point translate(R2Point p, R2Vector v) {
    return p.plus(v);
  }

  @Override
  public final R2Vector difference(R2Point p, R2Point q) {
    return p.minus(q);
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("R2").write('.').write("space").write('(').write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static R2 space;

  public static R2 space() {
    if (R2.space == null) {
      R2.space = new R2();
    }
    return R2.space;
  }

}
