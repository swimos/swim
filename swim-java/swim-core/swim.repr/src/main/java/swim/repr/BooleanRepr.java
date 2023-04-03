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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class BooleanRepr implements Repr, Comparable<BooleanRepr>, ToSource {

  final Attrs attrs;
  final boolean value;

  BooleanRepr(Attrs attrs, boolean value) {
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
  public BooleanRepr letAttrs(Attrs attrs) {
    return this.withAttrs(attrs);
  }

  @Override
  public BooleanRepr letAttr(String key, Repr value) {
    return this.letAttrs(this.attrs.let(key, value));
  }

  @Override
  public BooleanRepr letAttr(String key) {
    return this.letAttr(key, Repr.unit());
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public BooleanRepr withAttrs(Attrs attrs) {
    if (attrs == this.attrs) {
      return this;
    } else if (attrs == Attrs.empty()) {
      return BooleanRepr.of(this.value);
    } else {
      return new BooleanRepr(attrs, this.value);
    }
  }

  @Override
  public BooleanRepr withAttr(String key, Repr value) {
    return this.withAttrs(this.attrs.updated(key, value));
  }

  @Override
  public BooleanRepr withAttr(String key) {
    return this.withAttr(key, Repr.unit());
  }

  @Override
  public boolean isDefinite() {
    return this.value;
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
  public boolean booleanValueOr(boolean orElse) {
    return this.value ? true : orElse;
  }

  @Override
  public String stringValue() {
    return this.value ? "true" : "false";
  }

  @Override
  public String stringValueOr(@Nullable String orElse) {
    return this.value ? "true" : "false";
  }

  @Override
  public String formatValue() {
    return this.value ? "true" : "false";
  }

  @Override
  public boolean isMutable() {
    return false;
  }

  @Override
  public BooleanRepr commit() {
    return this;
  }

  @Override
  public int compareTo(BooleanRepr that) {
    if (this.value && !that.value) {
      return -1;
    } else if (!this.value && that.value) {
      return 1;
    } else {
      return 0;
    }
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof BooleanRepr) {
      final BooleanRepr that = (BooleanRepr) other;
      return this.attrs.equals(that.attrs)
          && this.value == that.value;
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Boolean.valueOf(this.value).hashCode();
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("BooleanRepr", "of")
            .appendArgument(this.value)
            .endInvoke();
    if (!this.attrs.isEmpty()) {
      this.attrs.writeWithAttrs(notation);
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final BooleanRepr TRUE = new BooleanRepr(Attrs.empty(), true);

  private static final BooleanRepr FALSE = new BooleanRepr(Attrs.empty(), false);

  public static BooleanRepr of(boolean value) {
    return value ? TRUE : FALSE;
  }

}
