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
import swim.structure.Kind;
import swim.structure.Value;
import swim.util.Murmur3;

public class VectorZ3 implements Debug {
  public final long x;
  public final long y;
  public final long z;

  public VectorZ3(long x, long y, long z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public final VectorZ3 plus(VectorZ3 that) {
    return new VectorZ3(this.x + that.x, this.y + that.y, this.z + that.z);
  }

  public final VectorZ3 opposite() {
    return new VectorZ3(-this.x, -this.y, -this.z);
  }

  public final VectorZ3 minus(VectorZ3 that) {
    return new VectorZ3(this.x - that.x, this.y - that.y, this.z - that.z);
  }

  public final VectorZ3 times(long scalar) {
    return new VectorZ3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  public VectorR3 transform(Z3ToR3Function f) {
    return new VectorR3(f.transformX(this.x, this.y, this.z),
                        f.transformY(this.x, this.y, this.z),
                        f.transformZ(this.x, this.y, this.z));
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  protected boolean canEqual(VectorZ3 that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof VectorZ3) {
      final VectorZ3 that = (VectorZ3) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y && this.z == that.z;
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(0x42B7FBDF,
        Murmur3.hash(x)), Murmur3.hash(y)), Murmur3.hash(z)));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("VectorZ3").write('.').write("of").write('(')
        .debug(this.x).write(", ").debug(this.y).write(", ").debug(this.z).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static VectorZ3 zero;

  private static TensorForm<VectorZ3> form;

  public static VectorZ3 zero() {
    if (zero == null) {
      zero = new VectorZ3(0L, 0L, 0L);
    }
    return zero;
  }

  public static VectorZ3 of(long x, long y, long z) {
    return new VectorZ3(x, y, z);
  }

  @Kind
  public static TensorForm<VectorZ3> form() {
    if (form == null) {
      form = new VectorZ3Form();
    }
    return form;
  }
}
