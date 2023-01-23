// Copyright 2015-2023 Swim.inc
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
import swim.util.Murmur3;

public abstract class Num extends Value {

  Num() {
    // sealed
  }

  @Override
  public boolean isConstant() {
    return true;
  }

  public boolean isUint32() {
    return false;
  }

  public boolean isUint64() {
    return false;
  }

  public abstract boolean isNaN();

  public abstract boolean isInfinite();

  public abstract boolean isValidByte();

  public abstract boolean isValidShort();

  public abstract boolean isValidInt();

  public abstract boolean isValidLong();

  public abstract boolean isValidFloat();

  public abstract boolean isValidDouble();

  public abstract boolean isValidInteger();

  /**
   * Converts this {@code Num} into a {@code String} value.
   */
  @Override
  public abstract String stringValue();

  /**
   * Converts this {@code Num} into a {@code String} value; equivalent to
   * {@link #stringValue()}.
   */
  @Override
  public String stringValue(String orElse) {
    return this.stringValue();
  }

  /**
   * Converts this {@code Num} into a primitive {@code byte} value.
   */
  @Override
  public abstract byte byteValue();

  /**
   * Converts this {@code Num} into a primitive {@code byte} value; equivalent
   * to {@link #byteValue()}.
   */
  @Override
  public byte byteValue(byte orElse) {
    return this.byteValue();
  }

  /**
   * Converts this {@code Num} into a primitive {@code short} value.
   */
  @Override
  public abstract short shortValue();

  /**
   * Converts this {@code Num} into a primitive {@code short} value; equivalent
   * {@link #shortValue()}.
   */
  @Override
  public short shortValue(short orElse) {
    return this.shortValue();
  }

  /**
   * Converts this {@code Num} into a primitive {@code int} value.
   */
  @Override
  public abstract int intValue();

  /**
   * Converts this {@code Num} into a primitive {@code int} value; equivalent
   * to {@link #intValue()}.
   */
  @Override
  public int intValue(int orElse) {
    return this.intValue();
  }

  /**
   * Converts this {@code Num} into a primitive {@code long} value.
   */
  @Override
  public abstract long longValue();

  /**
   * Converts this {@code Num} into a primitive {@code long} value; equivalent
   * to {@link #longValue()}.
   */
  @Override
  public long longValue(long orElse) {
    return this.longValue();
  }

  /**
   * Converts this {@code Num} into a primitive {@code float} value.
   */
  @Override
  public abstract float floatValue();

  /**
   * Converts this {@code Num} into a primitive {@code float} value; equivalent
   * to {@link #floatValue()}.
   */
  @Override
  public float floatValue(float orElse) {
    return this.floatValue();
  }

  /**
   * Converts this {@code Num} into a primitive {@code double} value.
   */
  @Override
  public abstract double doubleValue();

  /**
   * Converts this {@code Num} into a primitive {@code double} value; equivalent
   * to {@link #doubleValue()}.
   */
  @Override
  public double doubleValue(double orElse) {
    return this.doubleValue();
  }

  /**
   * Converts this {@code Num} into a {@code BigInteger} value.
   */
  @Override
  public abstract BigInteger integerValue();

  /**
   * Converts this {@code Num} into a {@code BigInteger} value; equivalent
   * to {@link #integerValue()}.
   */
  @Override
  public BigInteger integerValue(BigInteger orElse) {
    return this.integerValue();
  }

  /**
   * Converts this {@code Num} into a {@code Number} object.
   */
  @Override
  public abstract Number numberValue();

  /**
   * Converts this {@code Num} into a {@code Number} object; equivalent to
   * {@link #numberValue()}.
   */
  @Override
  public Number numberValue(Number orElse) {
    return this.numberValue();
  }

  /**
   * Converts this {@code Value} into a primitive {@code char} value.
   */
  @Override
  public abstract char charValue();

  /**
   * Converts this {@code Value} into a primitive {@code char} value; equivalent
   * to {@link #charValue()}.
   */
  @Override
  public char charValue(char orElse) {
    return this.charValue();
  }

  /**
   * Converts this {@code Value} into a primitive {@code boolean} value.
   */
  @Override
  public abstract boolean booleanValue();

  /**
   * Converts this {@code Value} into a primitive {@code boolean} value;
   * equivalent to {@link #booleanValue()}.
   */
  @Override
  public boolean booleanValue(boolean orElse) {
    return this.booleanValue();
  }

  @Override
  public Value bitwiseOr(Value that) {
    if (that instanceof Num) {
      return this.bitwiseOr((Num) that);
    }
    return super.bitwiseOr(that);
  }

  public abstract Value bitwiseOr(Num that);

  @Override
  public Value bitwiseXor(Value that) {
    if (that instanceof Num) {
      return this.bitwiseXor((Num) that);
    }
    return super.bitwiseXor(that);
  }

  public abstract Value bitwiseXor(Num that);

  @Override
  public Value bitwiseAnd(Value that) {
    if (that instanceof Num) {
      return this.bitwiseAnd((Num) that);
    }
    return super.bitwiseAnd(that);
  }

  public abstract Value bitwiseAnd(Num that);

  @Override
  public Value plus(Value that) {
    if (that instanceof Num) {
      return this.plus((Num) that);
    }
    return super.plus(that);
  }

  public abstract Num plus(Num that);

  @Override
  public Value minus(Value that) {
    if (that instanceof Num) {
      return this.minus((Num) that);
    }
    return super.minus(that);
  }

  public abstract Num minus(Num that);

  @Override
  public Value times(Value that) {
    if (that instanceof Num) {
      return this.times((Num) that);
    }
    return super.times(that);
  }

  public abstract Num times(Num that);

  @Override
  public Value divide(Value that) {
    if (that instanceof Num) {
      return this.divide((Num) that);
    }
    return super.divide(that);
  }

  public abstract Num divide(Num that);

  @Override
  public Value modulo(Value that) {
    if (that instanceof Num) {
      return this.modulo((Num) that);
    }
    return super.modulo(that);
  }

  public abstract Num modulo(Num that);

  @Override
  public abstract Value bitwiseNot();

  @Override
  public abstract Num negative();

  @Override
  public Num positive() {
    return this;
  }

  @Override
  public abstract Num inverse();

  public abstract Num abs();

  public abstract Num ceil();

  public abstract Num floor();

  public abstract Num round();

  public abstract Num sqrt();

  public abstract Num pow(Num that);

  public Num max(Num that) {
    return this.compareTo(that) >= 0 ? this : that;
  }

  public Num min(Num that) {
    return this.compareTo(that) <= 0 ? this : that;
  }

  @Override
  public int typeOrder() {
    return 6;
  }

  @Override
  public int compareTo(Item other) {
    if (other instanceof Num) {
      return this.compareTo((Num) other);
    }
    return Integer.compare(this.typeOrder(), other.typeOrder());
  }

  public int compareTo(Num that) {
    if (this.isValidByte() && that.isValidByte()) {
      return Byte.compare(this.byteValue(), that.byteValue());
    } else if (this.isValidShort() && that.isValidShort()) {
      return Short.compare(this.shortValue(), that.shortValue());
    } else if (this.isValidInt() && that.isValidInt()) {
      return Integer.compare(this.intValue(), that.intValue());
    } else if (this.isValidLong() && that.isValidLong()) {
      return Long.compare(this.longValue(), that.longValue());
    } else if (this.isValidFloat() && that.isValidFloat()) {
      final float x = this.floatValue();
      final float y = that.floatValue();
      return x < y ? -1 : x > y ? 1 : Float.isNaN(y) ? (Float.isNaN(x) ? 0 : -1) : Float.isNaN(x) ? 1 : 0;
    } else if (this.isValidDouble() && that.isValidDouble()) {
      final double x = this.doubleValue();
      final double y = that.doubleValue();
      return x < y ? -1 : x > y ? 1 : Double.isNaN(y) ? (Double.isNaN(x) ? 0 : -1) : Double.isNaN(x) ? 1 : 0;
    } else {
      return this.stringValue().compareTo(that.stringValue());
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Num) {
      return this.equals((Num) other);
    } else {
      return false;
    }
  }

  boolean equals(Num that) {
    if (this.isValidByte() && that.isValidByte()) {
      return this.byteValue() == that.byteValue();
    } else if (this.isValidShort() && that.isValidShort()) {
      return this.shortValue() == that.shortValue();
    } else if (this.isValidInt() && that.isValidInt()) {
      return this.intValue() == that.intValue();
    } else if (this.isValidLong() && that.isValidLong()) {
      return this.longValue() == that.longValue();
    } else if (this.isValidFloat() && that.isValidFloat()) {
      final float x = this.floatValue();
      final float y = that.floatValue();
      return x == y || Float.isNaN(x) && Float.isNaN(y);
    } else if (this.isValidDouble() && that.isValidDouble()) {
      final double x = this.doubleValue();
      final double y = that.doubleValue();
      return x == y || Double.isNaN(x) && Double.isNaN(y);
    } else {
      return this.stringValue().equals(that.stringValue());
    }
  }

  @Override
  public int hashCode() {
    if (this.isValidByte()) {
      return Murmur3.hash(this.byteValue());
    } else if (this.isValidShort()) {
      return Murmur3.hash(this.shortValue());
    } else if (this.isValidInt()) {
      return Murmur3.hash(this.intValue());
    } else if (this.isValidLong()) {
      return Murmur3.hash(this.longValue());
    } else if (this.isValidFloat()) {
      return Murmur3.hash(this.floatValue());
    } else if (this.isValidDouble()) {
      return Murmur3.hash(this.doubleValue());
    } else {
      return this.stringValue().hashCode();
    }
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Num").write('.').write("from").write('(').display(this).write(')');
    return output;
  }

  @Override
  public abstract <T> Output<T> display(Output<T> output);

  public static Num from(int value) {
    return NumI32.from(value);
  }

  public static Num from(long value) {
    return NumI64.from(value);
  }

  public static Num from(float value) {
    return NumF32.from(value);
  }

  public static Num from(double value) {
    return NumF64.from(value);
  }

  public static Num from(BigInteger value) {
    return NumInteger.from(value);
  }

  public static Num from(Number value) {
    if (value instanceof Byte) {
      return Num.from(value.byteValue());
    } else if (value instanceof Short) {
      return Num.from(value.shortValue());
    } else if (value instanceof Integer) {
      return Num.from(value.intValue());
    } else if (value instanceof Long) {
      return Num.from(value.longValue());
    } else if (value instanceof Float) {
      return Num.from(value.floatValue());
    } else if (value instanceof Double) {
      return Num.from(value.doubleValue());
    } else if (value instanceof BigInteger) {
      return Num.from((BigInteger) value);
    } else {
      return Num.from(value.doubleValue());
    }
  }

  public static Num from(char value) {
    return NumI32.from((int) value);
  }

  public static Num from(String value) {
    if ("NaN".equals(value)) {
      return NumF64.nan();
    } else {
      try {
        final long longValue = Long.parseLong(value);
        if ((int) longValue == longValue) {
          return Num.from((int) longValue);
        } else {
          return Num.from(longValue);
        }
      } catch (NumberFormatException e1) {
        try {
          final double doubleValue = Double.parseDouble(value);
          if ((float) doubleValue == doubleValue) {
            return Num.from((float) doubleValue);
          } else {
            return Num.from(doubleValue);
          }
        } catch (NumberFormatException e2) {
          return Num.from(new BigInteger(value));
        }
      }
    }
  }

  public static Num uint32(int value) {
    return NumI32.uint32(value);
  }

  public static Num uint64(long value) {
    return NumI64.uint64(value);
  }

}
