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

public class R implements AffineSpace<Double, Double, Double>, VectorSpace<Double, Double>, RealField<Double>, Debug {
  protected R() {
    // stub
  }

  @Override
  public R vector() {
    return this;
  }

  @Override
  public R scalar() {
    return this;
  }

  @Override
  public TensorDims dimensions() {
    return TensorDims.d1();
  }

  @Override
  public final Double origin() {
    return 0.0;
  }

  @Override
  public final Double zero() {
    return 0.0;
  }

  @Override
  public final Double unit() {
    return 1.0;
  }

  @Override
  public final Double add(Double a, Double b) {
    return a + b;
  }

  @Override
  public final Double opposite(Double a) {
    return -a;
  }

  @Override
  public final Double subtract(Double a, Double b) {
    return a - b;
  }

  @Override
  public final Double multiply(Double a, Double b) {
    return a * b;
  }

  @Override
  public final Double inverse(Double a) {
    return 1.0 / a;
  }

  @Override
  public final Double divide(Double a, Double b) {
    return a / b;
  }

  @Override
  public Double combine(Double a, Double u, Double b, Double v) {
    return a * u + b * v;
  }

  @Override
  public final Double translate(Double p, Double v) {
    return p + v;
  }

  @Override
  public final Double difference(Double p, Double q) {
    return p - q;
  }

  @Override
  public final Double pow(Double b, Double e) {
    return Math.pow(b, e);
  }

  @Override
  public final Double exp(Double a) {
    return Math.exp(a);
  }

  @Override
  public final Double log(Double a) {
    return Math.log(a);
  }

  @Override
  public final Double sqrt(Double a) {
    return Math.sqrt(a);
  }

  @Override
  public final Double hypot(Double x, Double y) {
    return Math.hypot(x, y);
  }

  @Override
  public final Double sin(Double a) {
    return Math.sin(a);
  }

  @Override
  public final Double cos(Double a) {
    return Math.cos(a);
  }

  @Override
  public final Double tan(Double a) {
    return Math.tan(a);
  }

  @Override
  public final Double asin(Double a) {
    return Math.asin(a);
  }

  @Override
  public final Double acos(Double a) {
    return Math.acos(a);
  }

  @Override
  public final Double atan(Double a) {
    return Math.atan(a);
  }

  @Override
  public final Double atan2(Double y, Double x) {
    return Math.atan2(y, x);
  }

  @Override
  public final Double sinh(Double x) {
    return Math.sinh(x);
  }

  @Override
  public final Double cosh(Double x) {
    return Math.cosh(x);
  }

  @Override
  public final Double tanh(Double x) {
    return Math.tanh(x);
  }

  @Override
  public final Double sigmoid(Double x) {
    return 1.0 / (1.0 + Math.exp(-x));
  }

  @Override
  public final Double rectify(Double x) {
    return Math.max(0.0, x);
  }

  @Override
  public final Double abs(Double a) {
    return Math.abs(a);
  }

  @Override
  public final Double ceil(Double a) {
    return Math.ceil(a);
  }

  @Override
  public final Double floor(Double a) {
    return Math.floor(a);
  }

  @Override
  public final Double round(Double a) {
    return Math.rint(a);
  }

  @Override
  public final Double min(Double a, Double b) {
    return Math.min(a, b);
  }

  @Override
  public final Double max(Double a, Double b) {
    return Math.max(a, b);
  }

  @Override
  public final int compare(Double a, Double b) {
    return Double.compare(a, b);
  }

  @Override
  public void debug(Output<?> output) {
    output.write('R').write('.').write("field").write('(').write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static R field;

  public static R field() {
    if (field == null) {
      field = new R();
    }
    return field;
  }
}
