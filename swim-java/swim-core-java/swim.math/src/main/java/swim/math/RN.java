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

public class RN implements VectorSpace<VectorRN, Double>, FN<VectorRN, Double>, Debug {
  protected final TensorDims dims;

  protected RN(TensorDims dims) {
    this.dims = dims;
  }

  @Override
  public final R scalar() {
    return R.field();
  }

  @Override
  public final TensorDims dimensions() {
    return this.dims;
  }

  @Override
  public final int size() {
    return this.dims.size;
  }

  @Override
  public VectorRN zero() {
    return new VectorRN(new double[this.dims.size]);
  }

  @Override
  public VectorRN of(Object... array) {
    final int n = array.length;
    if (n != dims.size) {
      throw new DimensionException();
    }
    final double[] us = new double[n];
    for (int i = 0; i < n; i += 1) {
      us[i] = (Double) array[i];
    }
    return new VectorRN(us);
  }

  public VectorRN of(double... array) {
    return VectorRN.of(array);
  }

  @Override
  public final Double get(VectorRN v, int i) {
    return v.get(i);
  }

  @Override
  public final VectorRN add(VectorRN u, VectorRN v) {
    return u.plus(v);
  }

  @Override
  public final VectorRN opposite(VectorRN v) {
    return v.opposite();
  }

  @Override
  public final VectorRN subtract(VectorRN u, VectorRN v) {
    return u.minus(v);
  }

  @Override
  public final VectorRN multiply(VectorRN u, Double a) {
    return u.times(a);
  }

  @Override
  public final VectorRN combine(Double a, VectorRN u, Double b, VectorRN v) {
    final double[] us = u.array;
    final double[] vs = v.array;
    final int n = this.dims.size;
    if (us.length != n || vs.length != n) {
      throw new DimensionException();
    }
    final double[] ws = new double[n];
    for (int i = 0; i < n; i += 1) {
      ws[i] = a * us[i] + b * vs[i];
    }
    return new VectorRN(ws);
  }

  @Override
  public void debug(Output<?> output) {
    output.write("RN").write('.').write("space").write('(').debug(this.dims).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static RN space(TensorDims dims) {
    return new RN(dims);
  }

  public static RN space(int n) {
    return new RN(TensorDims.of(n));
  }
}
