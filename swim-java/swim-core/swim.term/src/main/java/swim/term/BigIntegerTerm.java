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

import java.math.BigInteger;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class BigIntegerTerm implements Term, WriteSource {

  final BigInteger value;

  BigIntegerTerm(BigInteger value) {
    this.value = value;
  }

  @Override
  public Term eq(Term that) {
    if (that.isValidNumber()) {
      return Term.of(this.value.equals(that.numberValue()));
    } else {
      return Term.super.eq(that);
    }
  }

  @Override
  public Term ne(Term that) {
    if (that.isValidNumber()) {
      return Term.of(!this.value.equals(that.numberValue()));
    } else {
      return Term.super.ne(that);
    }
  }

  @Override
  public Term plus(Term that) {
    if (that instanceof BigIntegerTerm) {
      return BigIntegerTerm.of(this.value.add(((BigIntegerTerm) that).value));
    } else {
      return Term.super.plus(that);
    }
  }

  @Override
  public Term minus(Term that) {
    if (that instanceof BigIntegerTerm) {
      return BigIntegerTerm.of(this.value.subtract(((BigIntegerTerm) that).value));
    } else {
      return Term.super.minus(that);
    }
  }

  @Override
  public Term negative() {
    final BigInteger value = this.value.negate();
    final int bitLength = value.bitLength();
    if (bitLength <= 31) {
      return IntTerm.of(value.intValue());
    } else if (bitLength <= 63) {
      return LongTerm.of(value.longValue());
    } else {
      return BigIntegerTerm.of(value);
    }
  }

  @Override
  public Term positive() {
    return this;
  }

  @Override
  public boolean isTruthy() {
    return !BigInteger.ZERO.equals(this.value);
  }

  @Override
  public boolean isFalsey() {
    return BigInteger.ZERO.equals(this.value);
  }

  @Override
  public boolean isValidBigInteger() {
    return true;
  }

  @Override
  public BigInteger bigIntegerValue() {
    return this.value;
  }

  @Override
  public boolean isValidNumber() {
    return true;
  }

  @Override
  public Number numberValue() {
    return this.value;
  }

  @Override
  public boolean isValidString() {
    return true;
  }

  @Override
  public String stringValue() {
    return this.value.toString();
  }

  @Override
  public boolean isValidObject() {
    return true;
  }

  @Override
  public Object objectValue() {
    return this.value;
  }

  @Override
  public String formatValue() {
    return this.value.toString();
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
      return this.value.equals(that.numberValue());
    }
    return false;
  }

  @Override
  public int hashCode() {
    return this.value.hashCode();
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("BigIntegerTerm", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static BigIntegerTerm of(BigInteger value) {
    return new BigIntegerTerm(value);
  }

  public static BigIntegerTerm of(String value) {
    return new BigIntegerTerm(new BigInteger(value));
  }

}
