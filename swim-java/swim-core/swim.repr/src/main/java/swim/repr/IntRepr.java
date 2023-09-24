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

package swim.repr;

import java.math.BigInteger;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class IntRepr implements NumberRepr, WriteSource {

  final Attrs attrs;
  final int value;

  IntRepr(Attrs attrs, int value) {
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
  public IntRepr letAttrs(Attrs attrs) {
    return this.withAttrs(attrs);
  }

  @Override
  public IntRepr letAttr(String key, Repr value) {
    return this.letAttrs(this.attrs.let(key, value));
  }

  @Override
  public IntRepr letAttr(String key) {
    return this.letAttr(key, Repr.unit());
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public IntRepr withAttrs(Attrs attrs) {
    if (attrs == this.attrs) {
      return this;
    } else if (attrs == Attrs.empty()) {
      return IntRepr.of(this.value);
    }
    return new IntRepr(attrs, this.value);
  }

  @Override
  public IntRepr withAttr(String key, Repr value) {
    return this.withAttrs(this.attrs.updated(key, value));
  }

  @Override
  public IntRepr withAttr(String key) {
    return this.withAttr(key, Repr.unit());
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
  public boolean isTruthy() {
    return this.value != 0;
  }

  @Override
  public boolean isFalsey() {
    return this.value == 0;
  }

  @Override
  public boolean booleanValue() {
    return this.value != 0;
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
    return true;
  }

  @Override
  public int intValue() {
    return this.value;
  }

  @Override
  public boolean isValidLong() {
    return true;
  }

  @Override
  public long longValue() {
    return this.value;
  }

  @Override
  public boolean isValidFloat() {
    return true;
  }

  @Override
  public float floatValue() {
    return this.value;
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
    return true;
  }

  @Override
  public BigInteger bigIntegerValue() {
    return BigInteger.valueOf(this.value);
  }

  @Override
  public boolean isValidNumber() {
    return true;
  }

  @Override
  public Number numberValue() {
    return Integer.valueOf(this.value);
  }

  @Override
  public boolean isValidChar() {
    return this.value == (int) (char) this.value;
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
    return Integer.toString(this.value);
  }

  @Override
  public String formatValue() {
    return Integer.toString(this.value);
  }

  @Override
  public NumberRepr negative() {
    return IntRepr.of(-this.value);
  }

  @Override
  public NumberRepr inverse() {
    return DoubleRepr.of(1.0 / (double) this.value);
  }

  @Override
  public NumberRepr abs() {
    return IntRepr.of(Math.abs(this.value));
  }

  @Override
  public NumberRepr ceil() {
    return this;
  }

  @Override
  public NumberRepr floor() {
    return this;
  }

  @Override
  public NumberRepr round() {
    return this;
  }

  @Override
  public NumberRepr sqrt() {
    return DoubleRepr.of(Math.sqrt((double) this.value));
  }

  @Override
  public NumberRepr pow(NumberRepr that) {
    return DoubleRepr.of(Math.pow((double) this.value, that.doubleValue()));
  }

  @Override
  public boolean isMutable() {
    return false;
  }

  @Override
  public IntRepr commit() {
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
    } else if (other instanceof NumberRepr that && this.attrs().equals(that.attrs())) {
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
    notation.beginInvoke("IntRepr", "of")
            .appendArgument(this.value)
            .endInvoke();
    if (!this.attrs.isEmpty()) {
      this.attrs.writeWithAttrs(notation);
    }
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final IntRepr ZERO = new IntRepr(Attrs.empty(), 0);

  static final IntRepr POSITIVE_ONE = new IntRepr(Attrs.empty(), 1);

  static final IntRepr NEGATIVE_ONE = new IntRepr(Attrs.empty(), -1);

  public static IntRepr of(int value) {
    if (value == 0) {
      return ZERO;
    } else if (value == 1) {
      return POSITIVE_ONE;
    } else if (value == -1) {
      return NEGATIVE_ONE;
    }
    return new IntRepr(Attrs.empty(), value);
  }

}
