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
public final class FloatTerm implements Term, ToSource {

  final float value;

  FloatTerm(float value) {
    this.value = value;
  }

  @Override
  public Term eq(Term that) {
    if (that.isValidFloat()) {
      return Term.of(this.value == that.floatValue());
    } else {
      return Term.super.eq(that);
    }
  }

  @Override
  public Term ne(Term that) {
    if (that.isValidFloat()) {
      return Term.of(this.value != that.floatValue());
    } else {
      return Term.super.ne(that);
    }
  }

  @Override
  public Term plus(Term that) {
    if (that instanceof FloatTerm) {
      return FloatTerm.of(this.value + ((FloatTerm) that).value);
    } else if (that instanceof DoubleTerm) {
      return DoubleTerm.of((double) this.value + ((DoubleTerm) that).value);
    } else {
      return Term.super.plus(that);
    }
  }

  @Override
  public Term minus(Term that) {
    if (that instanceof FloatTerm) {
      return FloatTerm.of(this.value - ((FloatTerm) that).value);
    } else if (that instanceof DoubleTerm) {
      return DoubleTerm.of((double) this.value - ((DoubleTerm) that).value);
    } else {
      return Term.super.minus(that);
    }
  }

  @Override
  public Term negative() {
    return FloatTerm.of(-this.value);
  }

  @Override
  public Term positive() {
    return this;
  }

  @Override
  public boolean isTruthy() {
    return this.value != 0.0f;
  }

  @Override
  public boolean isFalsey() {
    return this.value == 0.0f;
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
    return (double) this.value;
  }

  @Override
  public boolean isValidNumber() {
    return true;
  }

  @Override
  public Float numberValue() {
    return Float.valueOf(this.value);
  }

  @Override
  public boolean isValidString() {
    return true;
  }

  @Override
  public String stringValue() {
    return Float.toString(this.value);
  }

  @Override
  public boolean isValidObject() {
    return true;
  }

  @Override
  public Object objectValue() {
    return Float.valueOf(this.value);
  }

  @Override
  public String formatValue() {
    return Float.toString(this.value);
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
      final float x = this.value;
      if (x == (float) (byte) x && that.isValidByte()) {
        return (byte) x == that.byteValue();
      } else if (x == (float) (short) x && that.isValidShort()) {
        return (short) x == that.shortValue();
      } else if (x == (float) (int) x && that.isValidInt()) {
        return (int) x == that.intValue();
      } else if (x == (float) (long) x && that.isValidLong()) {
        return (long) x == that.longValue();
      } else if (that.isValidFloat()) {
        final float y = that.floatValue();
        return x == y || (Float.isNaN(x) && Float.isNaN(y));
      }
    }
    return false;
  }

  @Override
  public int hashCode() {
    final float value = this.value;
    if (value == (float) (byte) value) {
      return Murmur3.hash((byte) value);
    } else if (value == (float) (short) value) {
      return Murmur3.hash((short) value);
    } else if (value == (float) (int) value) {
      return Murmur3.hash((int) value);
    } else if (value == (float) (long) value) {
      return Murmur3.hash((long) value);
    } else {
      return Murmur3.hash(value);
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("FloatTerm", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static FloatTerm of(float value) {
    return new FloatTerm(value);
  }

}
