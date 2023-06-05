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

package swim.term;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class ByteTerm implements Term, ToSource {

  final byte value;

  ByteTerm(byte value) {
    this.value = value;
  }

  @Override
  public Term eq(Term that) {
    if (that.isValidByte()) {
      return Term.of(this.value == that.byteValue());
    } else {
      return Term.super.eq(that);
    }
  }

  @Override
  public Term ne(Term that) {
    if (that.isValidByte()) {
      return Term.of(this.value != that.byteValue());
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
    return this.value != (byte) 0;
  }

  @Override
  public boolean isFalsey() {
    return this.value == (byte) 0;
  }

  @Override
  public boolean isValidByte() {
    return true;
  }

  @Override
  public byte byteValue() {
    return this.value;
  }

  @Override
  public boolean isValidShort() {
    return true;
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
  public boolean isValidNumber() {
    return true;
  }

  @Override
  public Number numberValue() {
    return Byte.valueOf(this.value);
  }

  @Override
  public boolean isValidString() {
    return true;
  }

  @Override
  public String stringValue() {
    return Byte.toString(this.value);
  }

  @Override
  public boolean isValidObject() {
    return true;
  }

  @Override
  public Object objectValue() {
    return Byte.valueOf(this.value);
  }

  @Override
  public String formatValue() {
    return Byte.toString(this.value);
  }

  @Override
  public boolean canEqual(Term other) {
    return other.isValidNumber();
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Term that && that.canEqual(this) && that.isValidNumber()) {
      if (that.isValidByte()) {
        return this.value == that.byteValue();
      }
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
    notation.beginInvoke("ByteTerm", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static ByteTerm of(byte value) {
    return new ByteTerm(value);
  }

}
