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
public final class BooleanTerm implements Term, ToSource {

  final boolean value;

  BooleanTerm(boolean value) {
    this.value = value;
  }

  @Override
  public Term eq(Term that) {
    if (that.isValidBoolean()) {
      return Term.of(this.value == that.booleanValue());
    } else {
      return Term.super.eq(that);
    }
  }

  @Override
  public Term ne(Term that) {
    if (that.isValidBoolean()) {
      return Term.of(this.value != that.booleanValue());
    } else {
      return Term.super.ne(that);
    }
  }

  @Override
  public Term not() {
    return BooleanTerm.of(!this.value);
  }

  @Override
  public boolean isTruthy() {
    return this.value;
  }

  @Override
  public boolean isFalsey() {
    return !this.value;
  }

  @Override
  public boolean isValidBoolean() {
    return true;
  }

  @Override
  public boolean booleanValue() {
    return this.value;
  }

  @Override
  public boolean isValidString() {
    return true;
  }

  @Override
  public String stringValue() {
    return this.value ? "true" : "false";
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
    return Boolean.toString(this.value);
  }

  @Override
  public boolean canEqual(Term other) {
    return other instanceof BooleanTerm;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (other instanceof BooleanTerm) {
      final BooleanTerm that = (BooleanTerm) other;
      return this.value == that.value;
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
    notation.beginInvoke("BooleanTerm", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final BooleanTerm TRUE = new BooleanTerm(true);

  private static final BooleanTerm FALSE = new BooleanTerm(false);

  public static BooleanTerm of(boolean value) {
    return value ? TRUE : FALSE;
  }

}
