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

public class Z3 implements F3<Z3Vector, Long>, Debug {

  protected Z3() {
    // singleton
  }

  @Override
  public final Z scalar() {
    return Z.ring();
  }

  @Override
  public final Z3Vector zero() {
    return Z3Vector.zero();
  }

  @Override
  public final Z3Vector of(Long x, Long y, Long z) {
    return new Z3Vector(x, y, z);
  }

  @Override
  public final Long getX(Z3Vector v) {
    return v.x;
  }

  @Override
  public final Long getY(Z3Vector v) {
    return v.y;
  }

  @Override
  public final Long getZ(Z3Vector v) {
    return v.z;
  }

  @Override
  public final Z3Vector add(Z3Vector u, Z3Vector v) {
    return u.plus(v);
  }

  @Override
  public final Z3Vector opposite(Z3Vector v) {
    return v.opposite();
  }

  @Override
  public final Z3Vector subtract(Z3Vector u, Z3Vector v) {
    return u.minus(v);
  }

  @Override
  public final Z3Vector multiply(Z3Vector u, Long a) {
    return u.times(a);
  }

  @Override
  public final Z3Vector combine(Long a, Z3Vector u, Long b, Z3Vector v) {
    return new Z3Vector(a * u.x + b * v.x, a * u.y + b * v.y, a * u.z + b * v.z);
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Z3").write('.').write("module").write('(').write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static Z3 module;

  public static Z3 module() {
    if (Z3.module == null) {
      Z3.module = new Z3();
    }
    return Z3.module;
  }

}
