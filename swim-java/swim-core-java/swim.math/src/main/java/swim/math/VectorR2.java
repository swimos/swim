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

public class VectorR2 implements Debug {
  public final double x;
  public final double y;

  public VectorR2(double x, double y) {
    this.x = x;
    this.y = y;
  }

  public final VectorR2 plus(VectorR2 that) {
    return new VectorR2(this.x + that.x, this.y + that.y);
  }

  public final VectorR2 opposite() {
    return new VectorR2(-this.x, -this.y);
  }

  public final VectorR2 minus(VectorR2 that) {
    return new VectorR2(this.x - that.x, this.y - that.y);
  }

  public final VectorR2 times(double scalar) {
    return new VectorR2(this.x * scalar, this.y * scalar);
  }

  public VectorZ2 transform(R2ToZ2Function f) {
    return new VectorZ2(f.transformX(this.x, this.y), f.transformY(this.x, this.y));
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  protected boolean canEqual(VectorR2 that) {
    return true;
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof VectorR2) {
      final VectorR2 that = (VectorR2) other;
      return that.canEqual(this) && this.x == that.x && this.y == that.y;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(VectorR2.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.x)), Murmur3.hash(this.y)));
  }

  @Override
  public void debug(Output<?> output) {
    output.write("VectorR2").write('.').write("of").write('(')
        .debug(this.x).write(", ").debug(this.y).write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static VectorR2 zero;

  private static TensorForm<VectorR2> form;

  public static VectorR2 zero() {
    if (zero == null) {
      zero = new VectorR2(0.0, 0.0);
    }
    return zero;
  }

  public static VectorR2 of(double x, double y) {
    return new VectorR2(x, y);
  }

  @Kind
  public static TensorForm<VectorR2> form() {
    if (form == null) {
      form = new VectorR2Form();
    }
    return form;
  }
}
