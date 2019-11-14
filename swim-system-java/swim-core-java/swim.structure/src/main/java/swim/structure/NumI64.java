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

package swim.structure;

import java.math.BigInteger;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.HashGenCacheSet;

final class NumI64 extends Num {
  final long value;
  int flags;

  NumI64(long value, int flags) {
    this.value = value;
    this.flags = flags;
  }

  NumI64(long value) {
    this(value, 0);
  }

  @Override
  public boolean isUint64() {
    return (this.flags & UINT64) != 0;
  }

  @Override
  public boolean isNaN() {
    return false;
  }

  @Override
  public boolean isInfinite() {
    return false;
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
    return true;
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
    return true;
  }

  @Override
  public String stringValue() {
    return Long.toString(this.value);
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
    return this.value;
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
    return BigInteger.valueOf(this.value);
  }

  @Override
  public Number numberValue() {
    return Long.valueOf(this.value);
  }

  @Override
  public char charValue() {
    return (char) this.value;
  }

  @Override
  public boolean booleanValue() {
    return this.value != 0L;
  }

  @Override
  public Value bitwiseOr(Num that) {
    if (that instanceof NumI32) {
      return NumI64.from(this.value | (long) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from(this.value | ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return Value.absent();
    } else if (that instanceof NumF64) {
      return Value.absent();
    } else if (that instanceof NumInt) {
      return NumInt.from(BigInteger.valueOf(this.value).or(((NumInt) that).value));
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Value bitwiseXor(Num that) {
    if (that instanceof NumI32) {
      return NumI64.from(this.value ^ (long) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from(this.value ^ ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return Value.absent();
    } else if (that instanceof NumF64) {
      return Value.absent();
    } else if (that instanceof NumInt) {
      return NumInt.from(BigInteger.valueOf(this.value).xor(((NumInt) that).value));
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Value bitwiseAnd(Num that) {
    if (that instanceof NumI32) {
      return NumI64.from(this.value & (long) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from(this.value & ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return Value.absent();
    } else if (that instanceof NumF64) {
      return Value.absent();
    } else if (that instanceof NumInt) {
      return NumInt.from(BigInteger.valueOf(this.value).and(((NumInt) that).value));
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num plus(Num that) {
    if (that instanceof NumI32) {
      return NumI64.from(this.value + (long) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from(this.value + ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF32.from((float) this.value + ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from((double) this.value + ((NumF64) that).value);
    } else if (that instanceof NumInt) {
      return NumInt.from(BigInteger.valueOf(this.value).add(((NumInt) that).value));
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num minus(Num that) {
    if (that instanceof NumI32) {
      return NumI64.from(this.value - (long) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from(this.value - ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF32.from((float) this.value - ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from((double) this.value - ((NumF64) that).value);
    } else if (that instanceof NumInt) {
      return NumInt.from(BigInteger.valueOf(this.value).subtract(((NumInt) that).value));
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num times(Num that) {
    if (that instanceof NumI32) {
      return NumI64.from(this.value * (long) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from(this.value * ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF32.from((float) this.value * ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from((double) this.value * ((NumF64) that).value);
    } else if (that instanceof NumInt) {
      return NumInt.from(BigInteger.valueOf(this.value).multiply(((NumInt) that).value));
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
    } else if (that instanceof NumInt) {
      return NumF64.from((double) this.value / ((NumInt) that).value.doubleValue());
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num modulo(Num that) {
    if (that instanceof NumI32) {
      return NumI64.from(this.value % (long) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from(this.value % ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF32.from((float) this.value % ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from((double) this.value % ((NumF64) that).value);
    } else if (that instanceof NumInt) {
      return NumInt.from(BigInteger.valueOf(this.value).mod(((NumInt) that).value));
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Value bitwiseNot() {
    return NumI64.from(~this.value);
  }

  @Override
  public Num negative() {
    return NumI64.from(-this.value);
  }

  @Override
  public Num inverse() {
    return NumF64.from(1.0 / (double) this.value);
  }

  @Override
  public Num abs() {
    return NumI64.from(Math.abs(this.value));
  }

  @Override
  public Num ceil() {
    return this;
  }

  @Override
  public Num floor() {
    return this;
  }

  @Override
  public Num round() {
    return this;
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
  public void display(Output<?> output) {
    Format.debugLong(this.value, output);
  }

  static final int UINT64 = 1 << 0;

  private static NumI64 zero;

  private static NumI64 positiveOne;

  private static NumI64 negativeOne;

  private static ThreadLocal<HashGenCacheSet<NumI64>> cache = new ThreadLocal<>();

  static NumI64 zero() {
    if (zero == null) {
      zero = new NumI64(0L);
    }
    return zero;
  }

  static NumI64 positiveOne() {
    if (positiveOne == null) {
      positiveOne = new NumI64(1L);
    }
    return positiveOne;
  }

  static NumI64 negativeOne() {
    if (negativeOne == null) {
      negativeOne = new NumI64(-1L);
    }
    return negativeOne;
  }

  public static NumI64 from(long value) {
    if (value == 0L) {
      return zero();
    } else if (value == 1L) {
      return positiveOne();
    } else if (value == -1L) {
      return negativeOne();
    } else {
      return cache().put(new NumI64(value));
    }
  }

  public static NumI64 uint64(long value) {
    return new NumI64(value, UINT64);
  }

  static HashGenCacheSet<NumI64> cache() {
    HashGenCacheSet<NumI64> cache = NumI64.cache.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.structure.num.i64.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 16;
      }
      cache = new HashGenCacheSet<NumI64>(cacheSize);
      NumI64.cache.set(cache);
    }
    return cache;
  }
}
