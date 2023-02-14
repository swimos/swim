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

package swim.expr.term;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.Term;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class DoubleTerm implements Term, ToSource {

  final double value;

  DoubleTerm(double value) {
    this.value = value;
  }

  @Override
  public Term eq(Term that) {
    if (that.isValidDouble()) {
      return Term.of(this.value == that.doubleValue());
    } else {
      return Term.super.eq(that);
    }
  }

  @Override
  public Term ne(Term that) {
    if (that.isValidDouble()) {
      return Term.of(this.value != that.doubleValue());
    } else {
      return Term.super.ne(that);
    }
  }

  @Override
  public Term plus(Term that) {
    if (that instanceof FloatTerm) {
      return DoubleTerm.of(this.value + (double) ((FloatTerm) that).value);
    } else if (that instanceof DoubleTerm) {
      return DoubleTerm.of(this.value + ((DoubleTerm) that).value);
    } else {
      return Term.super.plus(that);
    }
  }

  @Override
  public Term minus(Term that) {
    if (that instanceof FloatTerm) {
      return DoubleTerm.of(this.value - (double) ((FloatTerm) that).value);
    } else if (that instanceof DoubleTerm) {
      return DoubleTerm.of(this.value - ((DoubleTerm) that).value);
    } else {
      return Term.super.minus(that);
    }
  }

  @Override
  public Term negative() {
    return DoubleTerm.of(-this.value);
  }

  @Override
  public Term positive() {
    return this;
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
  public boolean isValidDouble() {
    return true;
  }

  @Override
  public double doubleValue() {
    return this.value;
  }

  @Override
  public boolean isValidNumber() {
    return true;
  }

  @Override
  public Number numberValue() {
    return Double.valueOf(this.value);
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
  public boolean isValidObject() {
    return true;
  }

  @Override
  public Object objectValue() {
    return Double.valueOf(this.value);
  }

  @Override
  public String formatValue() {
    return Double.toString(this.value);
  }

  @Override
  public boolean canEqual(Term other) {
    return other.isValidNumber();
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (other instanceof Term) {
      final Term that = (Term) other;
      if (that.canEqual(this) && that.isValidNumber()) {
        final double x = this.value;
        if (x == (double) (byte) x && that.isValidByte()) {
          return (byte) x == that.byteValue();
        } else if (x == (double) (short) x && that.isValidShort()) {
          return (short) x == that.shortValue();
        } else if (x == (double) (int) x && that.isValidInt()) {
          return (int) x == that.intValue();
        } else if (x == (double) (long) x && that.isValidLong()) {
          return (long) x == that.longValue();
        } else if (x == (double) (float) x && that.isValidFloat()) {
          final float y = that.floatValue();
          return (float) x == y || (Float.isNaN((float) x) && Float.isNaN(y));
        } else if (that.isValidDouble()) {
          final double y = that.doubleValue();
          return x == y || (Double.isNaN(x) && Double.isNaN(y));
        }
      }
    }
    return false;
  }

  @Override
  public int hashCode() {
    final double value = this.value;
    if (value == (double) (byte) value) {
      return Murmur3.hash((byte) value);
    } else if (value == (double) (short) value) {
      return Murmur3.hash((short) value);
    } else if (value == (double) (int) value) {
      return Murmur3.hash((int) value);
    } else if (value == (double) (long) value) {
      return Murmur3.hash((long) value);
    } else if (value == (double) (float) value) {
      return Murmur3.hash((float) value);
    } else {
      return Murmur3.hash(value);
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("DoubleTerm", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static DoubleTerm of(double value) {
    return new DoubleTerm(value);
  }

}
