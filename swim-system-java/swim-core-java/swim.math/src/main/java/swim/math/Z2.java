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

public class Z2 implements F2<VectorZ2, Long>, Debug {
  protected Z2() {
    // stub
  }

  @Override
  public final Z scalar() {
    return Z.ring();
  }

  @Override
  public final VectorZ2 zero() {
    return VectorZ2.zero();
  }

  @Override
  public final VectorZ2 of(Long x, Long y) {
    return VectorZ2.of(x, y);
  }

  @Override
  public final Long getX(VectorZ2 v) {
    return v.x;
  }

  @Override
  public final Long getY(VectorZ2 v) {
    return v.y;
  }

  @Override
  public final VectorZ2 add(VectorZ2 u, VectorZ2 v) {
    return u.plus(v);
  }

  @Override
  public final VectorZ2 opposite(VectorZ2 v) {
    return v.opposite();
  }

  @Override
  public final VectorZ2 subtract(VectorZ2 u, VectorZ2 v) {
    return u.minus(v);
  }

  @Override
  public final VectorZ2 multiply(VectorZ2 u, Long a) {
    return u.times(a);
  }

  @Override
  public final VectorZ2 combine(Long a, VectorZ2 u, Long b, VectorZ2 v) {
    return new VectorZ2(a * u.x + b * v.x, a * u.y + b * v.y);
  }

  @Override
  public void debug(Output<?> output) {
    output.write("Z2").write('.').write("module").write('(').write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static Z2 module;

  public static Z2 module() {
    if (module == null) {
      module = new Z2();
    }
    return module;
  }
}
