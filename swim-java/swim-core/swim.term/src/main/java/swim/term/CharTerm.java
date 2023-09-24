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

package swim.term;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class CharTerm implements Term, WriteSource {

  final char value;

  CharTerm(char value) {
    this.value = value;
  }

  @Override
  public Term eq(Term that) {
    if (that.isValidChar()) {
      return Term.of(this.value == that.charValue());
    } else {
      return Term.super.eq(that);
    }
  }

  @Override
  public Term ne(Term that) {
    if (that.isValidChar()) {
      return Term.of(this.value != that.charValue());
    } else {
      return Term.super.ne(that);
    }
  }

  @Override
  public Term plus(Term that) {
    if (that instanceof IntTerm) {
      return IntTerm.of((int) this.value + ((IntTerm) that).value);
    } else if (that instanceof LongTerm) {
      return LongTerm.of((long) this.value + ((LongTerm) that).value);
    } else {
      return Term.super.plus(that);
    }
  }

  @Override
  public Term minus(Term that) {
    if (that instanceof IntTerm) {
      return IntTerm.of((int) this.value - ((IntTerm) that).value);
    } else if (that instanceof LongTerm) {
      return LongTerm.of((long) this.value - ((LongTerm) that).value);
    } else {
      return Term.super.minus(that);
    }
  }

  @Override
  public Term negative() {
    return IntTerm.of(-this.value);
  }

  @Override
  public Term positive() {
    return this;
  }

  @Override
  public boolean isTruthy() {
    return this.value != (char) 0;
  }

  @Override
  public boolean isFalsey() {
    return this.value == (char) 0;
  }

  @Override
  public boolean isValidByte() {
    return this.value == (char) (byte) this.value;
  }

  @Override
  public byte byteValue() {
    return (byte) this.value;
  }

  @Override
  public boolean isValidShort() {
    return this.value == (char) (short) this.value;
  }

  @Override
  public short shortValue() {
    return (short) this.value;
  }

  @Override
  public boolean isValidChar() {
    return true;
  }

  @Override
  public char charValue() {
    return this.value;
  }

  @Override
  public boolean isValidInt() {
    return true;
  }

  @Override
  public int intValue() {
    return (int) this.value;
  }

  @Override
  public boolean isValidLong() {
    return true;
  }

  @Override
  public long longValue() {
    return (long) this.value;
  }

  @Override
  public boolean isValidFloat() {
    return true;
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
    return (double) this.value;
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
  public boolean isValidString() {
    return true;
  }

  @Override
  public String stringValue() {
    return Character.toString(this.value);
  }

  @Override
  public boolean isValidObject() {
    return true;
  }

  @Override
  public Object objectValue() {
    return Character.valueOf(this.value);
  }

  @Override
  public String formatValue() {
    return Character.toString(this.value);
  }

  @Override
  public boolean canEqual(Term other) {
    return other.isValidChar();
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Term that && that.canEqual(this) && that.isValidChar()) {
      return this.value == that.charValue();
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Murmur3.hash(this.value);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("CharTerm", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static CharTerm of(char value) {
    return new CharTerm(value);
  }

}
