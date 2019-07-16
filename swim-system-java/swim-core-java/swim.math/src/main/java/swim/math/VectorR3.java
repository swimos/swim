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

public class VectorR3 implements Debug {
  public final double x;
  public final double y;
  public final double z;

  public VectorR3(double x, double y, double z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public final VectorR3 plus(VectorR3 that) {
    return new VectorR3(this.x + that.x, this.y + that.y, this.z + that.z);
  }

  public final VectorR3 opposite() {
    return new VectorR3(-this.x, -this.y, -this.z);
  }

  public final VectorR3 minus(VectorR3 that) {
    return new VectorR3(this.x - that.x, this.y - that.y, this.z - that.z);
  }

  public final VectorR3 times(double scalar) {
    return new VectorR3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  public VectorZ3 transform(R3ToZ3Function f) {
    return new VectorZ3(f.transformX(this.x, this.y, this.z),
                        f.transformY(this.x, this.y, this.z),
                        f.transformZ(this.x, this.y, this.z));
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  protected boolean canEqual(VectorR3 that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof VectorR3) {
      final VectorR3 that = (VectorR3) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y && this.z == that.z;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(VectorR3.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.x)), Murmur3.hash(this.y)), Murmur3.hash(this.z)));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("VectorR3").write('.').write("of").write('(')
        .debug(this.x).write(", ").debug(this.y).write(", ").debug(this.z).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static VectorR3 zero;

  private static TensorForm<VectorR3> form;

  public static VectorR3 zero() {
    if (zero == null) {
      zero = new VectorR3(0.0, 0.0, 0.0);
    }
    return zero;
  }

  public static VectorR3 of(double x, double y, double z) {
    return new VectorR3(x, y, z);
  }

  @Kind
  public static TensorForm<VectorR3> form() {
    if (form == null) {
      form = new VectorR3Form();
    }
    return form;
  }
}
