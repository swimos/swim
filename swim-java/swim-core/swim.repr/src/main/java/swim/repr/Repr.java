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

import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.util.Map;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.expr.Term;

@Public
@Since("5.0")
public interface Repr extends Term {

  /**
   * Returns {@code true} if this {@code Repr} is not an
   * {@link UndefinedRepr}.
   */
  default boolean isDefined() {
    return true;
  }

  /**
   * Returns {@code true} if this {@code Repr} is neither a
   * {@link UnitRepr} nor an {@link UndefinedRepr}.
   */
  default boolean isDistinct() {
    return true;
  }

  /**
   * Returns {@code true} if this {@code Repr} is not one of:
   * an empty {@code Block}, {@code False}, {@code UnitRepr},
   * or {@code UndefinedRepr}.
   */
  default boolean isDefinite() {
    return true;
  }

  Attrs attrs();

  default boolean hasAttr(String key) {
    return this.attrs().containsKey(key);
  }

  default Repr getAttr(String key) {
    final Repr value = this.attrs().get(key);
    return value != null ? value : Repr.undefined();
  }

  void setAttrs(Attrs attrs);

  default Repr setAttr(String key, Repr value) {
    final Repr oldValue = this.attrs().put(key, value);
    return oldValue != null ? oldValue : Repr.undefined();
  }

  default Repr setAttr(String key) {
    final Repr oldValue = this.attrs().put(key, Repr.unit());
    return oldValue != null ? oldValue : Repr.undefined();
  }

  Repr letAttrs(Attrs attrs);

  Repr letAttr(String key, Repr value);

  Repr letAttr(String key);

  Repr withAttrs(Attrs attrs);

  Repr withAttr(String key, Repr value);

  Repr withAttr(String key);

  default Repr removeAttr(String key) {
    final Repr oldValue = this.attrs().remove(key);
    return oldValue != null ? oldValue : Repr.undefined();
  }

  @Override
  default boolean booleanValue() {
    throw new UnsupportedOperationException();
  }

  default boolean booleanValueOr(boolean orElse) {
    return orElse;
  }

  @Override
  default byte byteValue() {
    throw new UnsupportedOperationException();
  }

  default byte byteValueOr(byte orElse) {
    return orElse;
  }

  @Override
  default short shortValue() {
    throw new UnsupportedOperationException();
  }

  default short shortValueOr(short orElse) {
    return orElse;
  }

  @Override
  default int intValue() {
    throw new UnsupportedOperationException();
  }

  default int intValueOr(int orElse) {
    return orElse;
  }

  @Override
  default long longValue() {
    throw new UnsupportedOperationException();
  }

  default long longValueOr(long orElse) {
    return orElse;
  }

  @Override
  default float floatValue() {
    throw new UnsupportedOperationException();
  }

  default float floatValueOr(float orElse) {
    return orElse;
  }

  @Override
  default double doubleValue() {
    throw new UnsupportedOperationException();
  }

  default double doubleValueOr(double orElse) {
    return orElse;
  }

  @Override
  default BigInteger bigIntegerValue() {
    throw new UnsupportedOperationException();
  }

  default BigInteger bigIntegerValueOr(BigInteger orElse) {
    return orElse;
  }

  @Override
  default Number numberValue() {
    throw new UnsupportedOperationException();
  }

  default Number numberValueOr(Number orElse) {
    return orElse;
  }

  @Override
  default char charValue() {
    throw new UnsupportedOperationException();
  }

  default char charValueOr(char orElse) {
    return orElse;
  }

  @Override
  default String stringValue() {
    throw new UnsupportedOperationException();
  }

  default @Nullable String stringValueOr(@Nullable String orElse) {
    return orElse;
  }

  @Override
  default boolean isValidObject() {
    return true;
  }

  @Override
  default Object objectValue() {
    return this;
  }

  boolean isMutable();

  @Override
  Repr commit();

  static ReprRegistry registry() {
    return ReprRegistry.REGISTRY;
  }

  static Repr unit() {
    return UnitRepr.unit();
  }

  static Repr undefined() {
    return UndefinedRepr.undefined();
  }

  static Repr of(boolean value) {
    return BooleanRepr.of(value);
  }

  static Repr of(byte value) {
    return IntRepr.of((int) value);
  }

  static Repr of(short value) {
    return IntRepr.of((int) value);
  }

  static Repr of(int value) {
    return IntRepr.of(value);
  }

  static Repr of(long value) {
    return LongRepr.of(value);
  }

  static Repr of(float value) {
    return FloatRepr.of(value);
  }

  static Repr of(double value) {
    return DoubleRepr.of(value);
  }

  static Repr of(char value) {
    return IntRepr.of((int) value);
  }

  static Repr of(@Nullable String value) {
    if (value != null) {
      return StringRepr.of(value);
    } else {
      return UnitRepr.unit();
    }
  }

  static Repr from(@Nullable Object value) {
    if (value == null) {
      return UnitRepr.unit();
    } else if (value instanceof Repr) {
      return (Repr) value;
    } else if (value instanceof Term) {
      return TermRepr.of((Term) value);
    } else {
      return Repr.registry().intoRepr(value);
    }
  }

}
