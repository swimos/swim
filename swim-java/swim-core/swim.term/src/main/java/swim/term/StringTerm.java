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
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class StringTerm implements Term, WriteSource {

  final String value;

  StringTerm(String value) {
    this.value = value;
  }

  @Override
  public Term plus(Term that) {
    if (that.isValidString()) {
      return StringTerm.of(this.value + that.stringValue());
    } else {
      return Term.super.plus(that);
    }
  }

  @Override
  public Term eq(Term that) {
    if (that.isValidString()) {
      return Term.of(this.value.equals(that.stringValue()));
    } else {
      return Term.super.eq(that);
    }
  }

  @Override
  public Term ne(Term that) {
    if (that.isValidString()) {
      return Term.of(!this.value.equals(that.stringValue()));
    } else {
      return Term.super.ne(that);
    }
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
  public boolean isValidObject() {
    return true;
  }

  @Override
  public Object objectValue() {
    return this.value;
  }

  @Override
  public String formatValue() {
    return this.value;
  }

  @Override
  public boolean canEqual(Term other) {
    return other.isValidString();
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Term that && that.canEqual(this) && that.isValidString()) {
      return this.value.equals(that.stringValue());
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
    notation.beginInvoke("StringTerm", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  public static StringTerm of(String value) {
    return new StringTerm(value);
  }

}
