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

public class Z2 implements F2<Z2Vector, Long>, Debug {

  protected Z2() {
    // singleton
  }

  @Override
  public final Z scalar() {
    return Z.ring();
  }

  @Override
  public final Z2Vector zero() {
    return Z2Vector.zero();
  }

  @Override
  public final Z2Vector of(Long x, Long y) {
    return new Z2Vector(x, y);
  }

  @Override
  public final Long getX(Z2Vector v) {
    return v.x;
  }

  @Override
  public final Long getY(Z2Vector v) {
    return v.y;
  }

  @Override
  public final Z2Vector add(Z2Vector u, Z2Vector v) {
    return u.plus(v);
  }

  @Override
  public final Z2Vector opposite(Z2Vector v) {
    return v.opposite();
  }

  @Override
  public final Z2Vector subtract(Z2Vector u, Z2Vector v) {
    return u.minus(v);
  }

  @Override
  public final Z2Vector multiply(Z2Vector u, Long a) {
    return u.times(a);
  }

  @Override
  public final Z2Vector combine(Long a, Z2Vector u, Long b, Z2Vector v) {
    return new Z2Vector(a * u.x + b * v.x, a * u.y + b * v.y);
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Z2").write('.').write("module").write('(').write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static Z2 module;

  public static Z2 module() {
    if (Z2.module == null) {
      Z2.module = new Z2();
    }
    return Z2.module;
  }

}
