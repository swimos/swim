// Copyright 2015-2023 Nstream, inc.
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

package swim.structure;

import java.math.BigDecimal;
import java.math.BigInteger;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.HashGenCacheSet;

final class NumF32 extends Num {

  final float value;

  NumF32(float value) {
    this.value = value;
  }

  @Override
  public boolean isNaN() {
    return Float.isNaN(this.value);
  }

  @Override
  public boolean isInfinite() {
    return Float.isInfinite(this.value);
  }

  @Override
  public boolean isValidByte() {
    return (byte) this.value == this.value;
  }

  @Override
  public boolean isValidShort() {
    return (short) this.value == this.value;
  }

  @Override
  public boolean isValidInt() {
    return (int) this.value == this.value;
  }

  @Override
  public boolean isValidLong() {
    return (long) this.value == this.value;
  }

  @Override
  public boolean isValidFloat() {
    return true;
  }

  @Override
  public boolean isValidDouble() {
    return true;
  }

  @Override
  public boolean isValidInteger() {
    return this.integerValue().floatValue() == this.value;
  }

  @Override
  public String stringValue() {
    return Float.toString(this.value);
  }

  @Override
  public byte byteValue() {
    return (byte) this.value;
  }

  @Override
  public short shortValue() {
    return (short) this.value;
  }

  @Override
  public int intValue() {
    return (int) this.value;
  }

  @Override
  public long longValue() {
    return (long) this.value;
  }

  @Override
  public float floatValue() {
    return this.value;
  }

  @Override
  public double doubleValue() {
    return this.value;
  }

  @Override
  public BigInteger integerValue() {
    return BigDecimal.valueOf(this.value).toBigInteger();
  }

  @Override
  public Number numberValue() {
    return Float.valueOf(this.value);
  }

  @Override
  public char charValue() {
    return (char) this.value;
  }

  @Override
  public boolean booleanValue() {
    return this.value != 0.0f;
  }

  @Override
  public Value bitwiseOr(Num that) {
    return Value.absent();
  }

  @Override
  public Value bitwiseXor(Num that) {
    return Value.absent();
  }

  @Override
  public Value bitwiseAnd(Num that) {
    return Value.absent();
  }

  @Override
  public Num plus(Num that) {
    if (that instanceof NumI32) {
      return NumF32.from(this.value + (float) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumF32.from(this.value + (float) ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF32.from(this.value + ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from((double) this.value + ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumF64.from((double) this.value + ((NumInteger) that).value.doubleValue());
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num minus(Num that) {
    if (that instanceof NumI32) {
      return NumF32.from(this.value - (float) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumF32.from(this.value - (float) ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF32.from(this.value - ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from((double) this.value - ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumF64.from((double) this.value - ((NumInteger) that).value.doubleValue());
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num times(Num that) {
    if (that instanceof NumI32) {
      return NumF32.from(this.value * (float) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumF32.from(this.value * (float) ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF32.from(this.value * ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from((double) this.value * ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumF64.from((double) this.value * ((NumInteger) that).value.doubleValue());
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num divide(Num that) {
    if (that instanceof NumI32) {
      return NumF64.from((double) this.value / (double) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumF64.from((double) this.value / (double) ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF64.from((double) this.value / (double) ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from((double) this.value / ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumF64.from((double) this.value / ((NumInteger) that).value.doubleValue());
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num modulo(Num that) {
    if (that instanceof NumI32) {
      return NumF32.from(this.value % (float) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumF32.from(this.value % (float) ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF32.from(this.value % ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from((double) this.value % ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumF64.from((double) this.value % ((NumInteger) that).value.doubleValue());
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Value bitwiseNot() {
    return Value.absent();
  }

  @Override
  public Num negative() {
    return NumF32.from(-this.value);
  }

  @Override
  public Num inverse() {
    return NumF64.from(1.0 / (double) this.value);
  }

  @Override
  public Num abs() {
    return NumF32.from(Math.abs(this.value));
  }

  @Override
  public Num ceil() {
    return NumF32.from(Math.ceil(this.value));
  }

  @Override
  public Num floor() {
    return NumF32.from(Math.floor(this.value));
  }

  @Override
  public Num round() {
    return NumF32.from(Math.round(this.value));
  }

  @Override
  public Num sqrt() {
    return NumF64.from(Math.sqrt((double) this.value));
  }

  @Override
  public Num pow(Num that) {
    return NumF64.from(Math.pow((double) this.value, that.doubleValue()));
  }

  @Override
  public <T> Output<T> display(Output<T> output) {
    output = Format.debugFloat(output, this.value);
    return output;
  }

  private static NumF32 positiveZero;
  private static NumF32 negativeZero;
  private static NumF32 positiveOne;
  private static NumF32 negativeOne;
  private static NumF32 nan;

  static NumF32 positiveZero() {
    if (NumF32.positiveZero == null) {
      NumF32.positiveZero = new NumF32(0.0f);
    }
    return NumF32.positiveZero;
  }

  static NumF32 negativeZero() {
    if (NumF32.negativeZero == null) {
      NumF32.negativeZero = new NumF32(-0.0f);
    }
    return NumF32.negativeZero;
  }

  static NumF32 positiveOne() {
    if (NumF32.positiveOne == null) {
      NumF32.positiveOne = new NumF32(1.0f);
    }
    return NumF32.positiveOne;
  }

  static NumF32 negativeOne() {
    if (NumF32.negativeOne == null) {
      NumF32.negativeOne = new NumF32(-1.0f);
    }
    return NumF32.negativeOne;
  }

  static NumF32 nan() {
    if (NumF32.nan == null) {
      NumF32.nan = new NumF32(Float.NaN);
    }
    return NumF32.nan;
  }

  public static NumF32 from(float value) {
    if (value == 0.0f) {
      if (Math.copySign(1.0f, value) == 1.0f) {
        return NumF32.positiveZero();
      } else {
        return NumF32.negativeZero();
      }
    } else if (value == 1.0f) {
      return NumF32.positiveOne();
    } else if (value == -1.0f) {
      return NumF32.negativeOne();
    } else if (Float.isNaN(value)) {
      return NumF32.nan();
    } else {
      return NumF32.cache().put(new NumF32(value));
    }
  }

  private static ThreadLocal<HashGenCacheSet<NumF32>> cache = new ThreadLocal<>();

  static HashGenCacheSet<NumF32> cache() {
    HashGenCacheSet<NumF32> cache = NumF32.cache.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.structure.num.f32.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 16;
      }
      cache = new HashGenCacheSet<NumF32>(cacheSize);
      NumF32.cache.set(cache);
    }
    return cache;
  }

}
