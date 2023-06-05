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
import swim.util.Severity;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class SeverityTerm implements Term, ToSource {

  final Severity value;

  SeverityTerm(Severity value) {
    this.value = value;
  }

  @Override
  public Term eq(Term that) {
    if (that.isValidObject()) {
      return BooleanTerm.of(this.value.equals(that.objectValue()));
    } else {
      return Term.super.eq(that);
    }
  }

  @Override
  public Term ne(Term that) {
    if (that.isValidObject()) {
      return BooleanTerm.of(!this.value.equals(that.objectValue()));
    } else {
      return Term.super.ne(that);
    }
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
    return this.value.label();
  }

  @Override
  public boolean canEqual(Term other) {
    return other.isValidObject();
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Term that && that.canEqual(this) && that.isValidObject()) {
      return this.value.equals(that.objectValue());
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
    notation.beginInvoke("SeverityTerm", "of")
            .appendArgument(this.value)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  public static SeverityTerm of(Severity value) {
    return new SeverityTerm(value);
  }

}
