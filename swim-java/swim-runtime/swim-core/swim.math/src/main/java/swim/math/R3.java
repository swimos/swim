// Copyright 2015-2023 Nstream, inc.
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

public class R3 implements AffineSpace<R3Point, R3Vector, Double>, VectorSpace<R3Vector, Double>, F3<R3Vector, Double>, Debug {

  protected R3() {
    // singleton
  }

  @Override
  public final R3 vector() {
    return this;
  }

  @Override
  public final R scalar() {
    return R.field();
  }

  @Override
  public TensorDims dimensions() {
    return TensorDims.d3();
  }

  @Override
  public final R3Point origin() {
    return R3Point.origin();
  }

  @Override
  public final R3Vector zero() {
    return R3Vector.zero();
  }

  @Override
  public final R3Vector of(Double x, Double y, Double z) {
    return new R3Vector(x, y, z);
  }

  @Override
  public final Double getX(R3Vector v) {
    return v.x;
  }

  @Override
  public final Double getY(R3Vector v) {
    return v.y;
  }

  @Override
  public final Double getZ(R3Vector v) {
    return v.z;
  }

  @Override
  public final R3Vector add(R3Vector u, R3Vector v) {
    return u.plus(v);
  }

  @Override
  public final R3Vector opposite(R3Vector v) {
    return v.opposite();
  }

  @Override
  public final R3Vector subtract(R3Vector u, R3Vector v) {
    return u.minus(v);
  }

  @Override
  public final R3Vector multiply(R3Vector u, Double a) {
    return u.times(a);
  }

  @Override
  public final R3Vector combine(Double a, R3Vector u, Double b, R3Vector v) {
    return new R3Vector(a * u.x + b * v.x, a * u.y + b * v.y, a * u.z + b * v.z);
  }

  @Override
  public final R3Point translate(R3Point p, R3Vector v) {
    return p.plus(v);
  }

  @Override
  public final R3Vector difference(R3Point p, R3Point q) {
    return p.minus(q);
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("R3").write('.').write("space").write('(').write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static R3 space;

  public static R3 space() {
    if (R3.space == null) {
      R3.space = new R3();
    }
    return R3.space;
  }

}
