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

public class R3 implements AffineSpace<PointR3, VectorR3, Double>, VectorSpace<VectorR3, Double>, F3<VectorR3, Double>, Debug {
  protected R3() {
    // stub
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
  public final PointR3 origin() {
    return PointR3.origin();
  }

  @Override
  public final VectorR3 zero() {
    return VectorR3.zero();
  }

  @Override
  public final VectorR3 of(Double x, Double y, Double z) {
    return VectorR3.of(x, y, z);
  }

  @Override
  public final Double getX(VectorR3 v) {
    return v.x;
  }

  @Override
  public final Double getY(VectorR3 v) {
    return v.y;
  }

  @Override
  public final Double getZ(VectorR3 v) {
    return v.z;
  }

  @Override
  public final VectorR3 add(VectorR3 u, VectorR3 v) {
    return u.plus(v);
  }

  @Override
  public final VectorR3 opposite(VectorR3 v) {
    return v.opposite();
  }

  @Override
  public final VectorR3 subtract(VectorR3 u, VectorR3 v) {
    return u.minus(v);
  }

  @Override
  public final VectorR3 multiply(VectorR3 u, Double a) {
    return u.times(a);
  }

  @Override
  public final VectorR3 combine(Double a, VectorR3 u, Double b, VectorR3 v) {
    return new VectorR3(a * u.x + b * v.x, a * u.y + b * v.y, a * u.z + b * v.z);
  }

  @Override
  public final PointR3 translate(PointR3 p, VectorR3 v) {
    return p.plus(v);
  }

  @Override
  public final VectorR3 difference(PointR3 p, PointR3 q) {
    return p.minus(q);
  }

  @Override
  public void debug(Output<?> output) {
    output.write("R3").write('.').write("space").write('(').write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static R3 space;

  public static R3 space() {
    if (space == null) {
      space = new R3();
    }
    return space;
  }
}
