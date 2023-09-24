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

package swim.repr;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class UnitRepr implements Repr, WriteSource {

  final Attrs attrs;

  UnitRepr(Attrs attrs) {
    this.attrs = attrs.commit();
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
  public UnitRepr letAttrs(Attrs attrs) {
    return this.withAttrs(attrs);
  }

  @Override
  public UnitRepr letAttr(String key, Repr value) {
    return this.letAttrs(this.attrs.let(key, value));
  }

  @Override
  public UnitRepr letAttr(String key) {
    return this.letAttr(key, Repr.unit());
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public UnitRepr withAttrs(Attrs attrs) {
    if (attrs == this.attrs) {
      return this;
    } else if (attrs == Attrs.empty()) {
      return UnitRepr.unit();
    }
    return new UnitRepr(attrs);
  }

  @Override
  public UnitRepr withAttr(String key, Repr value) {
    return this.withAttrs(this.attrs.updated(key, value));
  }

  @Override
  public UnitRepr withAttr(String key) {
    return this.withAttr(key, Repr.unit());
  }

  /**
   * Always returns {@code false} because {@code UnitRepr}
   * is not a definite value.
   */
  @Override
  public boolean isDefinite() {
    return false;
  }

  /**
   * Always returns {@code false} because {@code UnitRepr}
   * is not a distinct value.
   */
  @Override
  public boolean isDistinct() {
    return false;
  }

  @Override
  public String stringValue() {
    return "";
  }

  @Override
  public String stringValueOr(@Nullable String orElse) {
    return "";
  }

  @Override
  public boolean booleanValue() {
    return true;
  }

  @Override
  public boolean booleanValueOr(boolean orElse) {
    return true;
  }

  @Override
  public boolean isMutable() {
    return false;
  }

  @Override
  public UnitRepr commit() {
    return this;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UnitRepr that) {
      return this.attrs.equals(that.attrs);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(UnitRepr.class);

  @Override
  public int hashCode() {
    return HASH_SEED;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Repr", "unit").endInvoke();
    if (!this.attrs.isEmpty()) {
      this.attrs.writeWithAttrs(notation);
    }
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final UnitRepr UNIT = new UnitRepr(Attrs.empty());

  public static UnitRepr unit() {
    return UNIT;
  }

}
