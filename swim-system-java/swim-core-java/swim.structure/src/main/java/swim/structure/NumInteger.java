// Copyright 2015-2021 Swim inc.
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
import swim.codec.Output;
import swim.util.HashGenCacheSet;

final class NumInteger extends Num {

  final BigInteger value;

  NumInteger(BigInteger value) {
    this.value = value;
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
    return BigInteger.valueOf(this.value.byteValue()).equals(this.value);
  }

  @Override
  public boolean isValidShort() {
    return BigInteger.valueOf(this.value.shortValue()).equals(this.value);
  }

  @Override
  public boolean isValidInt() {
    return BigInteger.valueOf(this.value.intValue()).equals(this.value);
  }

  @Override
  public boolean isValidLong() {
    return BigInteger.valueOf(this.value.longValue()).equals(this.value);
  }

  @Override
  public boolean isValidFloat() {
    return BigInteger.valueOf((long) this.value.floatValue()).equals(this.value);
  }

  @Override
  public boolean isValidDouble() {
    return BigInteger.valueOf((long) this.value.doubleValue()).equals(this.value);
  }

  @Override
  public boolean isValidInteger() {
    return true;
  }

  @Override
  public String stringValue() {
    return this.value.toString();
  }

  @Override
  public byte byteValue() {
    return this.value.byteValue();
  }

  @Override
  public short shortValue() {
    return this.value.shortValue();
  }

  @Override
  public int intValue() {
    return this.value.intValue();
  }

  @Override
  public long longValue() {
    return this.value.longValue();
  }

  @Override
  public float floatValue() {
    return this.value.floatValue();
  }

  @Override
  public double doubleValue() {
    return this.value.doubleValue();
  }

  @Override
  public BigInteger integerValue() {
    return this.value;
  }

  @Override
  public Number numberValue() {
    return this.value;
  }

  @Override
  public char charValue() {
    return (char) this.value.longValue();
  }

  @Override
  public boolean booleanValue() {
    return !BigInteger.ZERO.equals(this.value);
  }

  @Override
  public Value bitwiseOr(Num that) {
    if (that instanceof NumI32) {
      return NumInteger.from(this.value.or(BigInteger.valueOf(((NumI32) that).value)));
    } else if (that instanceof NumI64) {
      return NumInteger.from(this.value.or(BigInteger.valueOf(((NumI64) that).value)));
    } else if (that instanceof NumF32) {
      return Value.absent();
    } else if (that instanceof NumF64) {
      return Value.absent();
    } else if (that instanceof NumInteger) {
      return NumInteger.from(this.value.or(((NumInteger) that).value));
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Value bitwiseXor(Num that) {
    if (that instanceof NumI32) {
      return NumInteger.from(this.value.xor(BigInteger.valueOf(((NumI32) that).value)));
    } else if (that instanceof NumI64) {
      return NumInteger.from(this.value.xor(BigInteger.valueOf(((NumI64) that).value)));
    } else if (that instanceof NumF32) {
      return Value.absent();
    } else if (that instanceof NumF64) {
      return Value.absent();
    } else if (that instanceof NumInteger) {
      return NumInteger.from(this.value.xor(((NumInteger) that).value));
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Value bitwiseAnd(Num that) {
    if (that instanceof NumI32) {
      return NumInteger.from(this.value.and(BigInteger.valueOf(((NumI32) that).value)));
    } else if (that instanceof NumI64) {
      return NumInteger.from(this.value.and(BigInteger.valueOf(((NumI64) that).value)));
    } else if (that instanceof NumF32) {
      return Value.absent();
    } else if (that instanceof NumF64) {
      return Value.absent();
    } else if (that instanceof NumInteger) {
      return NumInteger.from(this.value.and(((NumInteger) that).value));
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num plus(Num that) {
    if (that instanceof NumI32) {
      return NumInteger.from(this.value.add(BigInteger.valueOf(((NumI32) that).value)));
    } else if (that instanceof NumI64) {
      return NumInteger.from(this.value.add(BigInteger.valueOf(((NumI64) that).value)));
    } else if (that instanceof NumF32) {
      return NumF64.from(this.value.doubleValue() + (double) ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from(this.value.doubleValue() + ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumInteger.from(this.value.add(((NumInteger) that).value));
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num minus(Num that) {
    if (that instanceof NumI32) {
      return NumInteger.from(this.value.subtract(BigInteger.valueOf(((NumI32) that).value)));
    } else if (that instanceof NumI64) {
      return NumInteger.from(this.value.subtract(BigInteger.valueOf(((NumI64) that).value)));
    } else if (that instanceof NumF32) {
      return NumF64.from(this.value.doubleValue() - (double) ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from(this.value.doubleValue() - ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumInteger.from(this.value.subtract(((NumInteger) that).value));
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num times(Num that) {
    if (that instanceof NumI32) {
      return NumInteger.from(this.value.multiply(BigInteger.valueOf(((NumI32) that).value)));
    } else if (that instanceof NumI64) {
      return NumInteger.from(this.value.multiply(BigInteger.valueOf(((NumI64) that).value)));
    } else if (that instanceof NumF32) {
      return NumF64.from(this.value.doubleValue() * (double) ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from(this.value.doubleValue() * ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumInteger.from(this.value.multiply(((NumInteger) that).value));
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num divide(Num that) {
    if (that instanceof NumI32) {
      return NumF64.from(this.value.doubleValue() / (double) ((NumI32) that).value);
    } else if (that instanceof NumI64) {
      return NumF64.from(this.value.doubleValue() / (double) ((NumI64) that).value);
    } else if (that instanceof NumF32) {
      return NumF64.from(this.value.doubleValue() / (double) ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from(this.value.doubleValue() / ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumF64.from(this.value.doubleValue() / ((NumInteger) that).value.doubleValue());
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Num modulo(Num that) {
    if (that instanceof NumI32) {
      return NumInteger.from(this.value.mod(BigInteger.valueOf(((NumI32) that).value)));
    } else if (that instanceof NumI64) {
      return NumInteger.from(this.value.mod(BigInteger.valueOf(((NumI64) that).value)));
    } else if (that instanceof NumF32) {
      return NumF64.from(this.value.doubleValue() % (double) ((NumF32) that).value);
    } else if (that instanceof NumF64) {
      return NumF64.from(this.value.doubleValue() % ((NumF64) that).value);
    } else if (that instanceof NumInteger) {
      return NumInteger.from(this.value.mod(((NumInteger) that).value));
    } else {
      throw new AssertionError();
    }
  }

  @Override
  public Value bitwiseNot() {
    return NumInteger.from(this.value.not());
  }

  @Override
  public Num negative() {
    return NumInteger.from(this.value.negate());
  }

  @Override
  public Num inverse() {
    return NumF64.from(1.0 / this.value.doubleValue());
  }

  @Override
  public Num abs() {
    return NumInteger.from(this.value.abs());
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
    return NumF64.from(Math.sqrt(this.value.doubleValue()));
  }

  @Override
  public Num pow(Num that) {
    return NumF64.from(Math.pow(this.value.doubleValue(), that.doubleValue()));
  }

  @Override
  public <T> Output<T> display(Output<T> output) {
    output = output.debug(this.value.toString());
    return output;
  }

  private static NumInteger zero;
  private static NumInteger positiveOne;
  private static NumInteger negativeOne;

  static NumInteger zero() {
    if (NumInteger.zero == null) {
      NumInteger.zero = new NumInteger(BigInteger.ZERO);
    }
    return NumInteger.zero;
  }

  static NumInteger positiveOne() {
    if (NumInteger.positiveOne == null) {
      NumInteger.positiveOne = new NumInteger(BigInteger.ONE);
    }
    return NumInteger.positiveOne;
  }

  static NumInteger negativeOne() {
    if (NumInteger.negativeOne == null) {
      NumInteger.negativeOne = new NumInteger(BigInteger.ONE.negate());
    }
    return NumInteger.negativeOne;
  }

  public static NumInteger from(BigInteger value) {
    final double doubleValue = value.doubleValue();
    if (doubleValue == 0.0) {
      return NumInteger.zero();
    } else if (doubleValue == 1.0) {
      return NumInteger.positiveOne();
    } else if (doubleValue == -1.0) {
      return NumInteger.negativeOne();
    } else {
      return NumInteger.cache().put(new NumInteger(value));
    }
  }

  private static ThreadLocal<HashGenCacheSet<NumInteger>> cache = new ThreadLocal<>();

  static HashGenCacheSet<NumInteger> cache() {
    HashGenCacheSet<NumInteger> cache = NumInteger.cache.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.structure.num.integer.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 16;
      }
      cache = new HashGenCacheSet<NumInteger>(cacheSize);
      NumInteger.cache.set(cache);
    }
    return cache;
  }

}
