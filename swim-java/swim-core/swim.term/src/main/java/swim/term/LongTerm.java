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

import java.math.BigInteger;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class LongTerm implements Term, WriteSource {

  final long value;

  LongTerm(long value) {
    this.value = value;
  }

  @Override
  public Term bitwiseOr(Term that) {
    if (that instanceof ByteTerm) {
      return LongTerm.of(this.value | (long) ((ByteTerm) that).value);
    } else if (that instanceof ShortTerm) {
      return LongTerm.of(this.value | (long) ((ShortTerm) that).value);
    } else if (that instanceof IntTerm) {
      return LongTerm.of(this.value | (long) ((IntTerm) that).value);
    } else if (that instanceof LongTerm) {
      return LongTerm.of(this.value | ((LongTerm) that).value);
    } else if (that.isValidLong()) {
      return LongTerm.of(this.value | that.longValue());
    } else {
      return Term.super.bitwiseOr(that);
    }
  }

  @Override
  public Term bitwiseXor(Term that) {
    if (that instanceof ByteTerm) {
      return LongTerm.of(this.value ^ (long) ((ByteTerm) that).value);
    } else if (that instanceof ShortTerm) {
      return LongTerm.of(this.value ^ (long) ((ShortTerm) that).value);
    } else if (that instanceof IntTerm) {
      return LongTerm.of(this.value ^ (long) ((IntTerm) that).value);
    } else if (that instanceof LongTerm) {
      return LongTerm.of(this.value ^ ((LongTerm) that).value);
    } else if (that.isValidLong()) {
      return LongTerm.of(this.value ^ that.longValue());
    } else {
      return Term.super.bitwiseXor(that);
    }
  }

  @Override
  public Term bitwiseAnd(Term that) {
    if (that instanceof ByteTerm) {
      return LongTerm.of(this.value & (long) ((ByteTerm) that).value);
    } else if (that instanceof ShortTerm) {
      return LongTerm.of(this.value & (long) ((ShortTerm) that).value);
    } else if (that instanceof IntTerm) {
      return LongTerm.of(this.value & (long) ((IntTerm) that).value);
    } else if (that instanceof LongTerm) {
      return LongTerm.of(this.value & ((LongTerm) that).value);
    } else if (that.isValidLong()) {
      return LongTerm.of(this.value & that.longValue());
    } else {
      return Term.super.bitwiseAnd(that);
    }
  }

  @Override
  public Term eq(Term that) {
    if (that.isValidLong()) {
      return Term.of(this.value == that.longValue());
    } else {
      return Term.super.eq(that);
    }
  }

  @Override
  public Term ne(Term that) {
    if (that.isValidLong()) {
      return Term.of(this.value != that.longValue());
    } else {
      return Term.super.ne(that);
    }
  }

  @Override
  public Term plus(Term that) {
    if (that instanceof ByteTerm) {
      return LongTerm.of(this.value + (long) ((ByteTerm) that).value);
    } else if (that instanceof ShortTerm) {
      return LongTerm.of(this.value + (long) ((ShortTerm) that).value);
    } else if (that instanceof IntTerm) {
      return LongTerm.of(this.value + (long) ((IntTerm) that).value);
    } else if (that instanceof LongTerm) {
      return LongTerm.of(this.value + ((LongTerm) that).value);
    } else if (that instanceof FloatTerm) {
      return FloatTerm.of((float) this.value + ((FloatTerm) that).value);
    } else if (that instanceof DoubleTerm) {
      return DoubleTerm.of((double) this.value + ((DoubleTerm) that).value);
    } else if (that.isValidLong()) {
      return LongTerm.of(this.value + that.longValue());
    } else if (that.isValidFloat()) {
      return FloatTerm.of((float) this.value + that.floatValue());
    } else if (that.isValidDouble()) {
      return DoubleTerm.of((double) this.value + that.doubleValue());
    } else {
      return Term.super.plus(that);
    }
  }

  @Override
  public Term minus(Term that) {
    if (that instanceof ByteTerm) {
      return LongTerm.of(this.value - (long) ((ByteTerm) that).value);
    } else if (that instanceof ShortTerm) {
      return LongTerm.of(this.value - (long) ((ShortTerm) that).value);
    } else if (that instanceof IntTerm) {
      return LongTerm.of(this.value - (long) ((IntTerm) that).value);
    } else if (that instanceof LongTerm) {
      return LongTerm.of(this.value - ((LongTerm) that).value);
    } else if (that instanceof FloatTerm) {
      return FloatTerm.of((float) this.value - ((FloatTerm) that).value);
    } else if (that instanceof DoubleTerm) {
      return DoubleTerm.of((double) this.value - ((DoubleTerm) that).value);
    } else if (that.isValidLong()) {
      return LongTerm.of(this.value - that.longValue());
    } else if (that.isValidFloat()) {
      return FloatTerm.of((float) this.value - that.floatValue());
    } else if (that.isValidDouble()) {
      return DoubleTerm.of((double) this.value - that.doubleValue());
    } else {
      return Term.super.minus(that);
    }
  }

  @Override
  public Term times(Term that) {
    if (that instanceof ByteTerm) {
      return LongTerm.of(this.value * (long) ((ByteTerm) that).value);
    } else if (that instanceof ShortTerm) {
      return LongTerm.of(this.value * (long) ((ShortTerm) that).value);
    } else if (that instanceof IntTerm) {
      return LongTerm.of(this.value * (long) ((IntTerm) that).value);
    } else if (that instanceof LongTerm) {
      return LongTerm.of(this.value * ((LongTerm) that).value);
    } else if (that instanceof FloatTerm) {
      return FloatTerm.of((float) this.value * ((FloatTerm) that).value);
    } else if (that instanceof DoubleTerm) {
      return DoubleTerm.of((double) this.value * ((DoubleTerm) that).value);
    } else if (that.isValidLong()) {
      return LongTerm.of(this.value * that.longValue());
    } else if (that.isValidFloat()) {
      return FloatTerm.of((float) this.value * that.floatValue());
    } else if (that.isValidDouble()) {
      return DoubleTerm.of((double) this.value * that.doubleValue());
    } else {
      return Term.super.times(that);
    }
  }

  @Override
  public Term divide(Term that) {
    if (that instanceof ByteTerm) {
      return LongTerm.of(this.value / (long) ((ByteTerm) that).value);
    } else if (that instanceof ShortTerm) {
      return LongTerm.of(this.value / (long) ((ShortTerm) that).value);
    } else if (that instanceof IntTerm) {
      return LongTerm.of(this.value / (long) ((IntTerm) that).value);
    } else if (that instanceof LongTerm) {
      return LongTerm.of(this.value / ((LongTerm) that).value);
    } else if (that instanceof FloatTerm) {
      return FloatTerm.of((float) this.value / ((FloatTerm) that).value);
    } else if (that instanceof DoubleTerm) {
      return DoubleTerm.of((double) this.value / ((DoubleTerm) that).value);
    } else if (that.isValidLong()) {
      return LongTerm.of(this.value / that.longValue());
    } else if (that.isValidFloat()) {
      return FloatTerm.of((float) this.value / that.floatValue());
    } else if (that.isValidDouble()) {
      return DoubleTerm.of((double) this.value / that.doubleValue());
    } else {
      return Term.super.divide(that);
    }
  }

  @Override
  public Term modulo(Term that) {
    if (that instanceof ByteTerm) {
      return LongTerm.of(this.value % (long) ((ByteTerm) that).value);
    } else if (that instanceof ShortTerm) {
      return LongTerm.of(this.value % (long) ((ShortTerm) that).value);
    } else if (that instanceof IntTerm) {
      return LongTerm.of(this.value % (long) ((IntTerm) that).value);
    } else if (that instanceof LongTerm) {
      return LongTerm.of(this.value % ((LongTerm) that).value);
    } else if (that instanceof FloatTerm) {
      return FloatTerm.of((float) this.value % ((FloatTerm) that).value);
    } else if (that instanceof DoubleTerm) {
      return DoubleTerm.of((double) this.value % ((DoubleTerm) that).value);
    } else if (that.isValidLong()) {
      return LongTerm.of(this.value % that.longValue());
    } else if (that.isValidFloat()) {
      return FloatTerm.of((float) this.value % that.floatValue());
    } else if (that.isValidDouble()) {
      return DoubleTerm.of((double) this.value % that.doubleValue());
    } else {
      return Term.super.modulo(that);
    }
  }

  @Override
  public Term bitwiseNot() {
    return LongTerm.of(~this.value);
  }

  @Override
  public Term negative() {
    final long value = -this.value;
    if (value == (long) (int) value) {
      return IntTerm.of((int) value);
    } else {
      return LongTerm.of(value);
    }
  }

  @Override
  public Term positive() {
    return this;
  }

  @Override
  public Term inverse() {
    return DoubleTerm.of(1.0 / (double) this.value);
  }

  @Override
  public boolean isTruthy() {
    return this.value != 0L;
  }

  @Override
  public boolean isFalsey() {
    return this.value == 0L;
  }

  @Override
  public boolean isValidByte() {
    return this.value == (long) (byte) this.value;
  }

  @Override
  public byte byteValue() {
    return (byte) this.value;
  }

  @Override
  public boolean isValidShort() {
    return this.value == (long) (short) this.value;
  }

  @Override
  public short shortValue() {
    return (short) this.value;
  }

  @Override
  public boolean isValidInt() {
    return this.value == (long) (int) this.value;
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
    return this.value;
  }

  @Override
  public boolean isValidFloat() {
    return this.value == (long) (float) this.value;
  }

  @Override
  public float floatValue() {
    return (float) this.value;
  }

  @Override
  public boolean isValidDouble() {
    return this.value == (long) (double) this.value;
  }

  @Override
  public double doubleValue() {
    return (double) this.value;
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
    return Long.valueOf(this.value);
  }

  @Override
  public boolean isValidChar() {
    return this.value == (long) (char) this.value;
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
    return Long.toString(this.value);
  }

  @Override
  public boolean isValidObject() {
    return true;
  }

  @Override
  public Object objectValue() {
    return Long.valueOf(this.value);
  }

  @Override
  public String formatValue() {
    return Long.toString(this.value);
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
      final long x = this.value;
      if (x == (long) (byte) x && that.isValidByte()) {
        return (byte) x == that.byteValue();
      } else if (x == (long) (short) x && that.isValidShort()) {
        return (short) x == that.shortValue();
      } else if (x == (long) (int) x && that.isValidInt()) {
        return (int) x == that.intValue();
      } else if (that.isValidLong()) {
        return x == that.longValue();
      }
    }
    return false;
  }

  @Override
  public int hashCode() {
    final long value = this.value;
    if (value == (long) (byte) value) {
      return Murmur3.hash((byte) value);
    } else if (value == (long) (short) value) {
      return Murmur3.hash((short) value);
    } else if (value == (long) (int) value) {
      return Murmur3.hash((int) value);
    } else {
      return Murmur3.hash(value);
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("LongTerm", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static LongTerm of(long value) {
    return new LongTerm(value);
  }

}
