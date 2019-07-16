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

public class VectorZ2 implements Debug {
  public final long x;
  public final long y;

  public VectorZ2(long x, long y) {
    this.x = x;
    this.y = y;
  }

  public final VectorZ2 plus(VectorZ2 that) {
    return new VectorZ2(this.x + that.x, this.y + that.y);
  }

  public final VectorZ2 opposite() {
    return new VectorZ2(-this.x, -this.y);
  }

  public final VectorZ2 minus(VectorZ2 that) {
    return new VectorZ2(this.x - that.x, this.y - that.y);
  }

  public final VectorZ2 times(long scalar) {
    return new VectorZ2(this.x * scalar, this.y * scalar);
  }

  public VectorR2 transform(Z2ToR2Function f) {
    return new VectorR2(f.transformX(this.x, this.y), f.transformY(this.x, this.y));
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  protected boolean canEqual(VectorZ2 that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof VectorZ2) {
      final VectorZ2 that = (VectorZ2) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(VectorZ2.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.x)), Murmur3.hash(this.y)));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("VectorZ2").write('.').write("of").write('(')
        .debug(this.x).write(", ").debug(this.y).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static VectorZ2 zero;

  private static TensorForm<VectorZ2> form;

  public static VectorZ2 zero() {
    if (zero == null) {
      zero = new VectorZ2(0L, 0L);
    }
    return zero;
  }

  public static VectorZ2 of(long x, long y) {
    return new VectorZ2(x, y);
  }

  @Kind
  public static TensorForm<VectorZ2> form() {
    if (form == null) {
      form = new VectorZ2Form();
    }
    return form;
  }
}
