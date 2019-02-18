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

public class Z3 implements F3<VectorZ3, Long>, Debug {
  protected Z3() {
    // stub
  }

  @Override
  public final Z scalar() {
    return Z.ring();
  }

  @Override
  public final VectorZ3 zero() {
    return VectorZ3.zero();
  }

  @Override
  public final VectorZ3 of(Long x, Long y, Long z) {
    return VectorZ3.of(x, y, z);
  }

  @Override
  public final Long getX(VectorZ3 v) {
    return v.x;
  }

  @Override
  public final Long getY(VectorZ3 v) {
    return v.y;
  }

  @Override
  public final Long getZ(VectorZ3 v) {
    return v.z;
  }

  @Override
  public final VectorZ3 add(VectorZ3 u, VectorZ3 v) {
    return u.plus(v);
  }

  @Override
  public final VectorZ3 opposite(VectorZ3 v) {
    return v.opposite();
  }

  @Override
  public final VectorZ3 subtract(VectorZ3 u, VectorZ3 v) {
    return u.minus(v);
  }

  @Override
  public final VectorZ3 multiply(VectorZ3 u, Long a) {
    return u.times(a);
  }

  @Override
  public final VectorZ3 combine(Long a, VectorZ3 u, Long b, VectorZ3 v) {
    return new VectorZ3(a * u.x + b * v.x, a * u.y + b * v.y, a * u.z + b * v.z);
  }

  @Override
  public void debug(Output<?> output) {
    output.write("Z3").write('.').write("module").write('(').write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static Z3 module;

  public static Z3 module() {
    if (module == null) {
      module = new Z3();
    }
    return module;
  }
}
