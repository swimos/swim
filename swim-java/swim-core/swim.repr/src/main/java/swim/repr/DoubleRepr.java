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

import java.math.BigDecimal;
import java.math.BigInteger;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class DoubleRepr implements NumberRepr, ToSource {

  final Attrs attrs;
  final double value;

  DoubleRepr(Attrs attrs, double value) {
    this.attrs = attrs.commit();
    this.value = value;
  }

  @Override
  public Attrs attrs() {
    return this.attrs;
  }

  @Override
  public void setAttrs(Attrs attrs) {
    throw new UnsupportedOperationException("immutable");
  }

  @Override
  public DoubleRepr letAttrs(Attrs attrs) {
    return this.withAttrs(attrs);
  }

  @Override
  public DoubleRepr letAttr(String key, Repr value) {
    return this.letAttrs(this.attrs.let(key, value));
  }

  @Override
  public DoubleRepr letAttr(String key) {
    return this.letAttr(key, Repr.unit());
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public DoubleRepr withAttrs(Attrs attrs) {
    if (attrs == this.attrs) {
      return this;
    } else if (attrs == Attrs.empty()) {
      return DoubleRepr.of(this.value);
    } else {
      return new DoubleRepr(attrs, this.value);
    }
  }

  @Override
  public DoubleRepr withAttr(String key, Repr value) {
    return this.withAttrs(this.attrs.updated(key, value));
  }

  @Override
  public DoubleRepr withAttr(String key) {
    return this.withAttr(key, Repr.unit());
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
  public boolean isTruthy() {
    return this.value != 0.0;
  }

  @Override
  public boolean isFalsey() {
    return this.value == 0.0;
  }

  @Override
  public boolean booleanValue() {
    return this.value != 0.0;
  }

  @Override
  public boolean isValidByte() {
    return (byte) this.value == this.value;
  }

  @Override
  public byte byteValue() {
    return (byte) this.value;
  }

  @Override
  public boolean isValidShort() {
    return (short) this.value == this.value;
  }

  @Override
  public short shortValue() {
    return (short) this.value;
  }

  @Override
  public boolean isValidInt() {
    return (int) this.value == this.value;
  }

  @Override
  public int intValue() {
    return (int) this.value;
  }

  @Override
  public boolean isValidLong() {
    return (long) this.value == this.value;
  }

  @Override
  public long longValue() {
    return (long) this.value;
  }

  @Override
  public boolean isValidFloat() {
    return (float) this.value == this.value;
  }

  @Override
  public float floatValue() {
    return (float) this.value;
  }

  @Override
  public boolean isValidDouble() {
    return true;
  }

  @Override
  public double doubleValue() {
    return this.value;
  }

  @Override
  public boolean isValidBigInteger() {
    return this.bigIntegerValue().doubleValue() == this.value;
  }

  @Override
  public BigInteger bigIntegerValue() {
    return BigDecimal.valueOf(this.value).toBigInteger();
  }

  @Override
  public boolean isValidNumber() {
    return !Double.isNaN(this.value);
  }

  @Override
  public Number numberValue() {
    return Double.valueOf(this.value);
  }

  @Override
  public boolean isValidChar() {
    return this.value == (double) (char) this.value;
  }

  @Override
  public char charValue() {
    return (char) this.value;
  }

  @Override
  public boolean isValidString() {
    return true;
  }

  @Override
  public String stringValue() {
    return Double.toString(this.value);
  }

  @Override
  public String formatValue() {
    return Double.toString(this.value);
  }

  @Override
  public NumberRepr negative() {
    return DoubleRepr.of(-this.value);
  }

  @Override
  public NumberRepr inverse() {
    return DoubleRepr.of(1.0 / this.value);
  }

  @Override
  public NumberRepr abs() {
    return DoubleRepr.of(Math.abs(this.value));
  }

  @Override
  public NumberRepr ceil() {
    return DoubleRepr.of(Math.ceil(this.value));
  }

  @Override
  public NumberRepr floor() {
    return DoubleRepr.of(Math.floor(this.value));
  }

  @Override
  public NumberRepr round() {
    return DoubleRepr.of(Math.rint(this.value));
  }

  @Override
  public NumberRepr sqrt() {
    return DoubleRepr.of(Math.sqrt(this.value));
  }

  @Override
  public NumberRepr pow(NumberRepr that) {
    return DoubleRepr.of(Math.pow(this.value, that.doubleValue()));
  }

  @Override
  public boolean isMutable() {
    return false;
  }

  @Override
  public DoubleRepr commit() {
    return this;
  }

  @Override
  public int compareTo(NumberRepr that) {
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
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof NumberRepr) {
      final NumberRepr that = (NumberRepr) other;
      if (this.attrs().equals(that.attrs())) {
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
          return x == y || (Float.isNaN(x) && Float.isNaN(y));
        } else if (this.isValidDouble() && that.isValidDouble()) {
          final double x = this.doubleValue();
          final double y = that.doubleValue();
          return x == y || (Double.isNaN(x) && Double.isNaN(y));
        } else {
          return this.stringValue().equals(that.stringValue());
        }
      }
    }
    return false;
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
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("DoubleRepr", "of")
            .appendArgument(this.value)
            .endInvoke();
    if (!this.attrs.isEmpty()) {
      this.attrs.writeWithAttrs(notation);
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final DoubleRepr POSITIVE_ZERO = new DoubleRepr(Attrs.empty(), 0.0);

  static DoubleRepr positiveZero() {
    return POSITIVE_ZERO;
  }

  private static final DoubleRepr NEGATIVE_ZERO = new DoubleRepr(Attrs.empty(), -0.0);

  static DoubleRepr negativeZero() {
    return NEGATIVE_ZERO;
  }

  private static final DoubleRepr POSITIVE_ONE = new DoubleRepr(Attrs.empty(), 1.0);

  static DoubleRepr positiveOne() {
    return POSITIVE_ONE;
  }

  private static final DoubleRepr NEGATIVE_ONE = new DoubleRepr(Attrs.empty(), -1.0);

  static DoubleRepr negativeOne() {
    return NEGATIVE_ONE;
  }

  private static final DoubleRepr NAN = new DoubleRepr(Attrs.empty(), Double.NaN);

  static DoubleRepr nan() {
    return NAN;
  }

  public static DoubleRepr of(double value) {
    if (value == 0.0) {
      if (Math.copySign(1.0f, value) == 1.0f) {
        return POSITIVE_ZERO;
      } else {
        return NEGATIVE_ZERO;
      }
    } else if (value == 1.0) {
      return POSITIVE_ONE;
    } else if (value == -1.0) {
      return NEGATIVE_ONE;
    } else if (Double.isNaN(value)) {
      return NAN;
    } else {
      return new DoubleRepr(Attrs.empty(), value);
    }
  }

}
