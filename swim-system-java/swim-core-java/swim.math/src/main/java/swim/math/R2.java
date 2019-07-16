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

public class R2 implements AffineSpace<PointR2, VectorR2, Double>, VectorSpace<VectorR2, Double>, F2<VectorR2, Double>, Debug {
  protected R2() {
    // stub
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
  public final PointR2 origin() {
    return PointR2.origin();
  }

  @Override
  public final VectorR2 zero() {
    return VectorR2.zero();
  }

  @Override
  public final VectorR2 of(Double x, Double y) {
    return VectorR2.of(x, y);
  }

  @Override
  public final Double getX(VectorR2 v) {
    return v.x;
  }

  @Override
  public final Double getY(VectorR2 v) {
    return v.y;
  }

  @Override
  public final VectorR2 add(VectorR2 u, VectorR2 v) {
    return u.plus(v);
  }

  @Override
  public final VectorR2 opposite(VectorR2 v) {
    return v.opposite();
  }

  @Override
  public final VectorR2 subtract(VectorR2 u, VectorR2 v) {
    return u.minus(v);
  }

  @Override
  public final VectorR2 multiply(VectorR2 u, Double a) {
    return u.times(a);
  }

  @Override
  public final VectorR2 combine(Double a, VectorR2 u, Double b, VectorR2 v) {
    return new VectorR2(a * u.x + b * v.x, a * u.y + b * v.y);
  }

  @Override
  public final PointR2 translate(PointR2 p, VectorR2 v) {
    return p.plus(v);
  }

  @Override
  public final VectorR2 difference(PointR2 p, PointR2 q) {
    return p.minus(q);
  }

  @Override
  public void debug(Output<?> output) {
    output.write("R2").write('.').write("space").write('(').write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static R2 space;

  public static R2 space() {
    if (space == null) {
      space = new R2();
    }
    return space;
  }
}
