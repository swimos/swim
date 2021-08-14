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

public class RN implements VectorSpace<RNVector, Double>, FN<RNVector, Double>, Debug {

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
  public RNVector zero() {
    return new RNVector(new double[this.dims.size]);
  }

  @Override
  public RNVector of(Object... array) {
    final int n = array.length;
    if (n != this.dims.size) {
      throw new DimensionException();
    }
    final double[] us = new double[n];
    for (int i = 0; i < n; i += 1) {
      us[i] = (Double) array[i];
    }
    return new RNVector(us);
  }

  public RNVector of(double... array) {
    return new RNVector(array);
  }

  @Override
  public final Double get(RNVector v, int i) {
    return v.get(i);
  }

  @Override
  public final RNVector add(RNVector u, RNVector v) {
    return u.plus(v);
  }

  @Override
  public final RNVector opposite(RNVector v) {
    return v.opposite();
  }

  @Override
  public final RNVector subtract(RNVector u, RNVector v) {
    return u.minus(v);
  }

  @Override
  public final RNVector multiply(RNVector u, Double a) {
    return u.times(a);
  }

  @Override
  public final RNVector combine(Double a, RNVector u, Double b, RNVector v) {
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
    return new RNVector(ws);
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("RN").write('.').write("space").write('(').debug(this.dims).write(')');
    return output;
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
