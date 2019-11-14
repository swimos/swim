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

final class NumI32 extends Num {
  final int value;
  int flags;

  NumI32(int value, int flags) {
    this.value = value;
    this.flags = flags;
  }

  NumI32(int value) {
    this(value, 0);
  }

  @Override
  public boolean isUint32() {
    return (this.flags & UINT32) != 0;
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
    return true;
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
    return Integer.toString(this.value);
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
    return this.value;
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
    return Integer.valueOf(this.value);
  }

  @Override
  public char charValue() {
    return (char) this.value;
  }

  @Override
  public boolean booleanValue() {
    return this.value != 0;
  }

  @Override
  public Value bitwiseOr(Num that) {
    if (that instanceof NumI32) {
      return NumI32.from(this.value | ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from((long) this.value | ((NumI64) that).value);
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
      return NumI32.from(this.value ^ ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from((long) this.value ^ ((NumI64) that).value);
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
      return NumI32.from(this.value & ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from((long) this.value & ((NumI64) that).value);
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
      return NumI32.from(this.value + ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from((long) this.value + ((NumI64) that).value);
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
      return NumI32.from(this.value - ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from((long) this.value - ((NumI64) that).value);
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
      return NumI32.from(this.value * ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from((long) this.value * ((NumI64) that).value);
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
      return NumI32.from(this.value % ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumI64.from((long) this.value % ((NumI64) that).value);
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
    return NumI32.from(~this.value);
  }

  @Override
  public Num negative() {
    return NumI32.from(-this.value);
  }

  @Override
  public Num inverse() {
    return NumF64.from(1.0 / (double) this.value);
  }

  @Override
  public Num abs() {
    return NumI32.from(Math.abs(this.value));
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
    Format.debugInt(this.value, output);
  }

  static final int UINT32 = 1 << 0;

  private static NumI32 zero;

  private static NumI32 positiveOne;

  private static NumI32 negativeOne;

  private static ThreadLocal<HashGenCacheSet<NumI32>> cache = new ThreadLocal<>();

  static NumI32 zero() {
    if (zero == null) {
      zero = new NumI32(0);
    }
    return zero;
  }

  static NumI32 positiveOne() {
    if (positiveOne == null) {
      positiveOne = new NumI32(1);
    }
    return positiveOne;
  }

  static NumI32 negativeOne() {
    if (negativeOne == null) {
      negativeOne = new NumI32(-1);
    }
    return negativeOne;
  }

  public static NumI32 from(int value) {
    if (value == 0) {
      return zero();
    } else if (value == 1) {
      return positiveOne();
    } else if (value == -1) {
      return negativeOne();
    } else {
      return cache().put(new NumI32(value));
    }
  }

  public static NumI32 uint32(int value) {
    return new NumI32(value, UINT32);
  }

  static HashGenCacheSet<NumI32> cache() {
    HashGenCacheSet<NumI32> cache = NumI32.cache.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.structure.num.i32.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 16;
      }
      cache = new HashGenCacheSet<NumI32>(cacheSize);
      NumI32.cache.set(cache);
    }
    return cache;
  }
}
