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

final class NumF64 extends Num {

  final double value;

  NumF64(double value) {
    this.value = value;
  }

  @Override
  public boolean isNaN() {
    return Double.isNaN(this.value);
  }

  @Override
  public boolean isInfinite() {
    return Double.isInfinite(this.value);
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
    return (float) this.value == this.value;
  }

  @Override
  public boolean isValidDouble() {
    return true;
  }

  @Override
  public boolean isValidInteger() {
    return this.integerValue().doubleValue() == this.value;
  }

  @Override
  public String stringValue() {
    return Double.toString(this.value);
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
    return (float) this.value;
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
    return Double.valueOf(this.value);
  }

  @Override
  public char charValue() {
    return (char) this.value;
  }

  @Override
  public boolean booleanValue() {
    return this.value != 0.0;
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
      return NumF64.from(this.value + (double) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumF64.from(this.value + (double) ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF64.from(this.value + (double) ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from(this.value + ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumF64.from(this.value + ((NumInteger) that).value.doubleValue());
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num minus(Num that) {
    if (that instanceof NumI32) {
      return NumF64.from(this.value - (double) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumF64.from(this.value - (double) ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF64.from(this.value - (double) ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from(this.value - ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumF64.from(this.value - ((NumInteger) that).value.doubleValue());
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num times(Num that) {
    if (that instanceof NumI32) {
      return NumF64.from(this.value * (double) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumF64.from(this.value * (double) ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF64.from(this.value * (double) ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from(this.value * ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumF64.from(this.value * ((NumInteger) that).value.doubleValue());
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num divide(Num that) {
    if (that instanceof NumI32) {
      return NumF64.from(this.value / (double) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumF64.from(this.value / (double) ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF64.from(this.value / (double) ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from(this.value / ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumF64.from(this.value / ((NumInteger) that).value.doubleValue());
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num modulo(Num that) {
    if (that instanceof NumI32) {
      return NumF64.from(this.value % (double) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumF64.from(this.value % (double) ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF64.from(this.value % (double) ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from(this.value % ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumF64.from(this.value % ((NumInteger) that).value.doubleValue());
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
    return NumF64.from(-this.value);
  }

  @Override
  public Num inverse() {
    return NumF64.from(1.0 / this.value);
  }

  @Override
  public Num abs() {
    return NumF64.from(Math.abs(this.value));
  }

  @Override
  public Num ceil() {
    return NumF64.from(Math.ceil(this.value));
  }

  @Override
  public Num floor() {
    return NumF64.from(Math.floor(this.value));
  }

  @Override
  public Num round() {
    return NumF64.from(Math.round(this.value));
  }

  @Override
  public Num sqrt() {
    return NumF64.from(Math.sqrt(this.value));
  }

  @Override
  public Num pow(Num that) {
    return NumF64.from(Math.pow(this.value, that.doubleValue()));
  }

  @Override
  public <T> Output<T> display(Output<T> output) {
    output = Format.debugDouble(output, this.value);
    return output;
  }

  private static NumF64 positiveZero;
  private static NumF64 negativeZero;
  private static NumF64 positiveOne;
  private static NumF64 negativeOne;
  private static NumF64 nan;

  static NumF64 positiveZero() {
    if (NumF64.positiveZero == null) {
      NumF64.positiveZero = new NumF64(0.0);
    }
    return NumF64.positiveZero;
  }

  static NumF64 negativeZero() {
    if (NumF64.negativeZero == null) {
      NumF64.negativeZero = new NumF64(-0.0);
    }
    return NumF64.negativeZero;
  }

  static NumF64 positiveOne() {
    if (NumF64.positiveOne == null) {
      NumF64.positiveOne = new NumF64(1.0);
    }
    return NumF64.positiveOne;
  }

  static NumF64 negativeOne() {
    if (NumF64.negativeOne == null) {
      NumF64.negativeOne = new NumF64(-1.0);
    }
    return NumF64.negativeOne;
  }

  static NumF64 nan() {
    if (NumF64.nan == null) {
      NumF64.nan = new NumF64(Double.NaN);
    }
    return NumF64.nan;
  }

  public static NumF64 from(double value) {
    if (value == 0.0) {
      if (Math.copySign(1.0f, value) == 1.0f) {
        return NumF64.positiveZero();
      } else {
        return NumF64.negativeZero();
      }
    } else if (value == 1.0) {
      return NumF64.positiveOne();
    } else if (value == -1.0) {
      return NumF64.negativeOne();
    } else if (Double.isNaN(value)) {
      return NumF64.nan();
    } else {
      return NumF64.cache().put(new NumF64(value));
    }
  }

  private static ThreadLocal<HashGenCacheSet<NumF64>> cache = new ThreadLocal<>();

  static HashGenCacheSet<NumF64> cache() {
    HashGenCacheSet<NumF64> cache = NumF64.cache.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.structure.num.f64.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 16;
      }
      cache = new HashGenCacheSet<NumF64>(cacheSize);
      NumF64.cache.set(cache);
    }
    return cache;
  }

}
