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

final class TensorObjectSpace implements TensorSpace<Tensor, Double>, Debug {
  final TensorSpace<Tensor, Double> next;
  final TensorDims dims;

  TensorObjectSpace(TensorSpace<Tensor, Double> next, TensorDims dims) {
    this.next = next;
    this.dims = dims;
  }

  TensorObjectSpace(TensorSpace<Tensor, Double> next, int n) {
    this(next, next.dimensions().by(n));
  }

  @Override
  public R scalar() {
    return R.field();
  }

  @Override
  public TensorDims dimensions() {
    return this.dims;
  }

  public TensorForm<Tensor> form() {
    return Tensor.form(this.dims);
  }

  @Override
  public Tensor zero() {
    return Tensor.zero(this.dims);
  }

  public Tensor of(double... array) {
    return new Tensor(this.dims, array);
  }

  public Tensor of(float... array) {
    return new Tensor(this.dims, array);
  }

  @Override
  public Tensor add(Tensor u, Tensor v) {
    return u.plus(v);
  }

  @Override
  public Tensor opposite(Tensor v) {
    return v.opposite();
  }

  @Override
  public Tensor subtract(Tensor u, Tensor v) {
    return u.minus(v);
  }

  @Override
  public Tensor multiply(Tensor u, Double a) {
    return u.times(a);
  }

  @Override
  public Tensor combine(Double a, Tensor u, Double b, Tensor v) {
    return Tensor.combine(a, u, b, v);
  }

  @Override
  public void debug(Output<?> output) {
    output.write("Tensor").write('.').write("space").write('(')
        .debug(this.next).write(", ").debug(this.dims).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }
}
