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
import swim.term.Term;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class StringRepr implements Repr, Comparable<StringRepr>, ToSource {

  final Attrs attrs;
  final String value;

  StringRepr(Attrs attrs, String value) {
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
  public StringRepr letAttrs(Attrs attrs) {
    return this.withAttrs(attrs);
  }

  @Override
  public StringRepr letAttr(String key, Repr value) {
    return this.letAttrs(this.attrs.let(key, value));
  }

  @Override
  public StringRepr letAttr(String key) {
    return this.letAttr(key, Repr.unit());
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public StringRepr withAttrs(Attrs attrs) {
    if (attrs == this.attrs) {
      return this;
    } else if (attrs == Attrs.empty()) {
      return StringRepr.of(this.value);
    }
    return new StringRepr(attrs, this.value);
  }

  @Override
  public StringRepr withAttr(String key, Repr value) {
    return this.withAttrs(this.attrs.updated(key, value));
  }

  @Override
  public StringRepr withAttr(String key) {
    return this.withAttr(key, Repr.unit());
  }

  @Override
  public Term plus(Term that) {
    if (that.isValidString()) {
      return StringRepr.of(this.value + that.stringValue());
    }
    return Repr.super.plus(that);
  }

  @Override
  public boolean isTruthy() {
    return this.value.length() != 0;
  }

  @Override
  public boolean isFalsey() {
    return this.value.length() == 0;
  }

  @Override
  public boolean isValidString() {
    return true;
  }

  @Override
  public String stringValue() {
    return this.value;
  }

  @Override
  public String stringValueOr(@Nullable String orElse) {
    return this.value;
  }

  @Override
  public byte byteValue() {
    try {
      return Byte.parseByte(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public byte byteValueOr(byte orElse) {
    try {
      return Byte.parseByte(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public short shortValue() {
    try {
      return Short.parseShort(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public short shortValueOr(short orElse) {
    try {
      return Short.parseShort(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public int intValue() {
    try {
      return Integer.parseInt(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public int intValueOr(int orElse) {
    try {
      return Integer.parseInt(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public long longValue() {
    try {
      return Long.parseLong(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public long longValueOr(long orElse) {
    try {
      return Long.parseLong(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public float floatValue() {
    try {
      return Float.parseFloat(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public float floatValueOr(float orElse) {
    try {
      return Float.parseFloat(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public double doubleValue() {
    try {
      return Double.parseDouble(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public double doubleValueOr(double orElse) {
    try {
      return Double.parseDouble(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  @Override
  public BigInteger bigIntegerValue() {
    try {
      return new BigInteger(this.value);
    } catch (NumberFormatException cause) {
      throw new UnsupportedOperationException(cause);
    }
  }

  @Override
  public BigInteger bigIntegerValueOr(BigInteger orElse) {
    try {
      return new BigInteger(this.value);
    } catch (NumberFormatException cause) {
      return orElse;
    }
  }

  //@Override
  //public Number numberValue() {
  //  return NumberRepr.of(this.value).numberValue();
  //}

  //@Override
  //public Number numberValueOr(Number orElse) {
  //  try {
  //    return NumberRepr.of(this.value).numberValue();
  //  } catch (NumberFormatException cause) {
  //    return orElse;
  //  }
  //}

  @Override
  public char charValue() {
    if (this.value.length() == 1) {
      return this.value.charAt(0);
    }
    throw new UnsupportedOperationException();
  }

  @Override
  public char charValueOr(char orElse) {
    try {
      return this.charValue();
    } catch (UnsupportedOperationException cause) {
      return orElse;
    }
  }

  @Override
  public boolean booleanValue() {
    if ("true".equals(this.value)) {
      return true;
    } else if ("false".equals(this.value)) {
      return false;
    }
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean booleanValueOr(boolean orElse) {
    if ("true".equals(this.value)) {
      return true;
    } else if ("false".equals(this.value)) {
      return false;
    }
    return orElse;
  }

  @Override
  public boolean isMutable() {
    return false;
  }

  @Override
  public StringRepr commit() {
    return this;
  }

  @Override
  public int compareTo(StringRepr that) {
    return this.value.compareTo(that.value);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof StringRepr that) {
      return this.attrs.equals(that.attrs)
          && this.value.equals(that.value);
    }
    return false;
  }

  @Override
  public int hashCode() {
    // StringRepr hashCode *must* equal String hashCode to ensure that
    // BlockValue hashtable lookups work with String keys.
    return this.value.hashCode();
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.value.length() == 0) {
      notation.beginInvoke("StringRepr", "empty").endInvoke();
    } else {
      notation.beginInvoke("StringRepr", "of")
              .appendArgument(this.value)
              .endInvoke();
    }
    if (!this.attrs.isEmpty()) {
      this.attrs.writeWithAttrs(notation);
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final StringRepr EMPTY = new StringRepr(Attrs.empty(), "");

  public static StringRepr empty() {
    return EMPTY;
  }

  public static StringRepr of(String value) {
    if (value.length() == 0) {
      return EMPTY;
    }
    return new StringRepr(Attrs.empty(), value);
  }

}
