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
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public final class UndefinedRepr implements Repr, ToSource {

  final Attrs attrs;

  UndefinedRepr(Attrs attrs) {
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
  public UndefinedRepr letAttrs(Attrs attrs) {
    return this.withAttrs(attrs);
  }

  @Override
  public UndefinedRepr letAttr(String key, Repr value) {
    return this.letAttrs(this.attrs.let(key, value));
  }

  @Override
  public UndefinedRepr letAttr(String key) {
    return this.letAttr(key, Repr.unit());
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public UndefinedRepr withAttrs(Attrs attrs) {
    if (attrs == this.attrs) {
      return this;
    } else if (attrs == Attrs.empty()) {
      return UndefinedRepr.undefined();
    } else {
      return new UndefinedRepr(attrs);
    }
  }

  @Override
  public UndefinedRepr withAttr(String key, Repr value) {
    return this.withAttrs(this.attrs.updated(key, value));
  }

  @Override
  public UndefinedRepr withAttr(String key) {
    return this.withAttr(key, Repr.unit());
  }

  /**
   * Always returns {@code false} because {@code UndefinedRepr}
   * represents an undefined value.
   */
  @Override
  public boolean isDefined() {
    return false;
  }

  /**
   * Always returns {@code false} because {@code UndefinedRepr}
   * is not a distinct value.
   */
  @Override
  public boolean isDistinct() {
    return false;
  }

  /**
   * Always returns {@code false} because {@code UndefinedRepr}
   * is not  definite value.
   */
  @Override
  public boolean isDefinite() {
    return false;
  }

  @Override
  public boolean booleanValue() {
    return false;
  }

  @Override
  public boolean booleanValueOr(boolean orElse) {
    return false;
  }

  @Override
  public boolean isMutable() {
    return false;
  }

  @Override
  public UndefinedRepr commit() {
    return this;
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UndefinedRepr) {
      final UndefinedRepr that = (UndefinedRepr) other;
      return this.attrs.equals(that.attrs);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(UndefinedRepr.class);

  @Override
  public int hashCode() {
    return HASH_SEED;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Repr", "undefined").endInvoke();
    if (!this.attrs.isEmpty()) {
      this.attrs.writeWithAttrs(notation);
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final UndefinedRepr UNDEFINED = new UndefinedRepr(Attrs.empty());

  public static UndefinedRepr undefined() {
    return UNDEFINED;
  }

}
