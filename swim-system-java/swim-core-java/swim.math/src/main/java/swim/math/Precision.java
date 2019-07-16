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
import swim.structure.Form;
import swim.structure.Kind;
import swim.structure.Value;
import swim.util.Murmur3;

public final class Precision implements Debug {
  final int bits;

  Precision(int bits) {
    this.bits = bits;
  }

  public boolean isDefined() {
    return this.bits != 0;
  }

  public boolean isHalf() {
    return this.bits == 16;
  }

  public boolean isSingle() {
    return this.bits == 32;
  }

  public boolean isDouble() {
    return this.bits == 64;
  }

  public int bits() {
    return this.bits;
  }

  public int bytes() {
    return (this.bits + 7) / 8;
  }

  public Precision min(Precision that) {
    return fromBits(Math.min(this.bits, that.bits));
  }

  public Precision max(Precision that) {
    return fromBits(Math.max(this.bits, that.bits));
  }

  public Value toValue() {
    return form().mold(this).toValue();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Precision) {
      final Precision that = (Precision) other;
      return this.bits == that.bits;
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Precision.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.bits));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Precision").write('.');
    if (this.bits == 0) {
      output = output.write("undefined").write('(').write(')');
    } else if (this.bits == 16) {
      output = output.write("f16").write('(').write(')');
    } else if (this.bits == 32) {
      output = output.write("f32").write('(').write(')');
    } else if (this.bits == 64) {
      output = output.write("f64").write('(').write(')');
    } else {
      output = output.write("fromBits").write('(').debug(this.bits).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  private static Precision undefined;
  private static Precision f16;
  private static Precision f32;
  private static Precision f64;

  private static Form<Precision> form;

  public static Precision undefined() {
    if (undefined == null) {
      undefined = new Precision(0);
    }
    return undefined;
  }

  public static Precision f16() {
    if (f16 == null) {
      f16 = new Precision(16);
    }
    return f16;
  }

  public static Precision f32() {
    if (f32 == null) {
      f32 = new Precision(32);
    }
    return f32;
  }

  public static Precision f64() {
    if (f64 == null) {
      f64 = new Precision(64);
    }
    return f64;
  }

  public static Precision fromBits(int bits) {
    if (bits < 0) {
      throw new IllegalArgumentException();
    } else if (bits == 0) {
      return undefined();
    } else if (bits == 16) {
      return f16();
    } else if (bits == 32) {
      return f32();
    } else if (bits == 64) {
      return f64();
    } else {
      return new Precision(bits);
    }
  }

  @Kind
  public static Form<Precision> form() {
    if (form == null) {
      form = new PrecisionForm();
    }
    return form;
  }
}
