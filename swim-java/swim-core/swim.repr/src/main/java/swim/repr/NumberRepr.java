// Copyright 2015-2022 Swim.inc
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

package swim.repr;

import java.math.BigInteger;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public interface NumberRepr extends Repr, Comparable<NumberRepr> {

  @Override
  NumberRepr letAttrs(Attrs attrs);

  @Override
  NumberRepr letAttr(String key, Repr value);

  @Override
  NumberRepr letAttr(String key);

  @Override
  NumberRepr withAttrs(Attrs attrs);

  @Override
  NumberRepr withAttr(String key, Repr value);

  @Override
  NumberRepr withAttr(String key);

  boolean isNaN();

  boolean isInfinite();

  @Override
  boolean isValidByte();

  /**
   * Converts this {@code NumberRepr} into a primitive {@code byte} value.
   */
  @Override
  byte byteValue();

  /**
   * Converts this {@code NumberRepr} into a primitive {@code byte} value;
   * equivalent to {@link #byteValue()}.
   */
  @Override
  default byte byteValueOr(byte orElse) {
    return this.isValidByte() ? this.byteValue() : orElse;
  }

  @Override
  boolean isValidShort();

  /**
   * Converts this {@code NumberRepr} into a primitive {@code short} value.
   */
  @Override
  short shortValue();

  /**
   * Converts this {@code NumberRepr} into a primitive {@code short} value;
   * equivalent {@link #shortValue()}.
   */
  @Override
  default short shortValueOr(short orElse) {
    return this.isValidShort() ? this.shortValue() : orElse;
  }

  @Override
  boolean isValidInt();

  /**
   * Converts this {@code NumberRepr} into a primitive {@code int} value.
   */
  @Override
  int intValue();

  /**
   * Converts this {@code NumberRepr} into a primitive {@code int} value;
   * equivalent to {@link #intValue()}.
   */
  @Override
  default int intValueOr(int orElse) {
    return this.isValidInt() ? this.intValue() : orElse;
  }

  @Override
  boolean isValidLong();

  /**
   * Converts this {@code NumberRepr} into a primitive {@code long} value.
   */
  @Override
  long longValue();

  /**
   * Converts this {@code NumberRepr} into a primitive {@code long} value;
   * equivalent to {@link #longValue()}.
   */
  @Override
  default long longValueOr(long orElse) {
    return this.isValidLong() ? this.longValue() : orElse;
  }

  @Override
  boolean isValidFloat();

  /**
   * Converts this {@code NumberRepr} into a primitive {@code float} value.
   */
  @Override
  float floatValue();

  /**
   * Converts this {@code NumberRepr} into a primitive {@code float} value;
   * equivalent to {@link #floatValue()}.
   */
  @Override
  default float floatValueOr(float orElse) {
    return this.isValidFloat() ? this.floatValue() : orElse;
  }

  @Override
  boolean isValidDouble();

  /**
   * Converts this {@code NumberRepr} into a primitive {@code double} value.
   */
  @Override
  double doubleValue();

  /**
   * Converts this {@code NumberRepr} into a primitive {@code double} value;
   * equivalent to {@link #doubleValue()}.
   */
  @Override
  default double doubleValueOr(double orElse) {
    return this.isValidDouble() ? this.doubleValue() : orElse;
  }

  @Override
  boolean isValidBigInteger();

  /**
   * Converts this {@code NumberRepr} into a {@code BigInteger} value.
   */
  @Override
  BigInteger bigIntegerValue();

  /**
   * Converts this {@code NumberRepr} into a {@code BigInteger} value;
   * equivalent to {@link #bigIntegerValue()}.
   */
  @Override
  default BigInteger bigIntegerValueOr(BigInteger orElse) {
    return this.isValidBigInteger() ? this.bigIntegerValue() : orElse;
  }

  @Override
  default boolean isValidNumber() {
    return true;
  }

  /**
   * Converts this {@code NumberRepr} into a {@code Number} object.
   */
  @Override
  Number numberValue();

  /**
   * Converts this {@code NumberRepr} into a {@code Number} object;
   * equivalent to {@link #numberValue()}.
   */
  @Override
  default Number numberValueOr(Number orElse) {
    return this.isValidNumber() ? this.numberValue() : orElse;
  }

  @Override
  boolean isValidChar();

  /**
   * Converts this {@code Repr} into a primitive {@code char} value.
   */
  @Override
  char charValue();

  /**
   * Converts this {@code Repr} into a primitive {@code char} value; equivalent
   * to {@link #charValue()}.
   */
  @Override
  default char charValueOr(char orElse) {
    return this.isValidChar() ? this.charValue() : orElse;
  }

  @Override
  boolean isValidString();

  /**
   * Converts this {@code NumberRepr} into a {@code String} value.
   */
  @Override
  String stringValue();

  /**
   * Converts this {@code NumberRepr} into a {@code String} value;
   * equivalent to {@link #stringValue()}.
   */
  @Override
  default @Nullable String stringValueOr(@Nullable String orElse) {
    return this.isValidString() ? this.stringValue() : orElse;
  }

  @Override
  NumberRepr negative();

  @Override
  NumberRepr inverse();

  NumberRepr abs();

  NumberRepr ceil();

  NumberRepr floor();

  NumberRepr round();

  NumberRepr sqrt();

  NumberRepr pow(NumberRepr that);

  default NumberRepr max(NumberRepr that) {
    return this.compareTo(that) >= 0 ? this : that;
  }

  default NumberRepr min(NumberRepr that) {
    return this.compareTo(that) <= 0 ? this : that;
  }

  @Override
  NumberRepr commit();

  static NumberRepr of(int value) {
    return IntRepr.of(value);
  }

  static NumberRepr of(long value) {
    return LongRepr.of(value);
  }

  static NumberRepr of(float value) {
    return FloatRepr.of(value);
  }

  static NumberRepr of(double value) {
    return DoubleRepr.of(value);
  }

  static NumberRepr of(BigInteger value) {
    return BigIntegerRepr.of(value);
  }

  static NumberRepr of(Number value) {
    if (value instanceof Byte) {
      return NumberRepr.of(value.byteValue());
    } else if (value instanceof Short) {
      return NumberRepr.of(value.shortValue());
    } else if (value instanceof Integer) {
      return NumberRepr.of(value.intValue());
    } else if (value instanceof Long) {
      return NumberRepr.of(value.longValue());
    } else if (value instanceof Float) {
      return NumberRepr.of(value.floatValue());
    } else if (value instanceof Double) {
      return NumberRepr.of(value.doubleValue());
    } else if (value instanceof BigInteger) {
      return NumberRepr.of((BigInteger) value);
    } else {
      return NumberRepr.of(value.doubleValue());
    }
  }

  static NumberRepr of(char value) {
    return IntRepr.of((int) value);
  }

  static NumberRepr parse(String value) {
    if ("NaN".equals(value)) {
      return DoubleRepr.nan();
    } else {
      try {
        final long longValue = Long.parseLong(value);
        if ((int) longValue == longValue) {
          return NumberRepr.of((int) longValue);
        } else {
          return NumberRepr.of(longValue);
        }
      } catch (NumberFormatException cause1) {
        try {
          final double doubleValue = Double.parseDouble(value);
          if ((float) doubleValue == doubleValue) {
            return NumberRepr.of((float) doubleValue);
          } else {
            return NumberRepr.of(doubleValue);
          }
        } catch (NumberFormatException cause2) {
          return NumberRepr.of(new BigInteger(value));
        }
      }
    }
  }

}
