// Copyright 2015-2019 SWIM.AI inc.
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

package swim.structure;

import java.math.BigInteger;
import java.util.Map;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;

public abstract class Field extends Item implements Map.Entry<Value, Value> {
  volatile int flags;

  Field() {
    // stub
  }

  /**
   * Always returns {@code true} because a {@code Field} can never be
   * {@link Absent}.
   */
  @Override
  public final boolean isDefined() {
    return true;
  }

  /**
   * Always returns {@code true} because a {@code Field} can be neither
   * {@link Extant} nor {@link Absent}.
   */
  @Override
  public final boolean isDistinct() {
    return true;
  }

  /**
   * Returns the key component of this {@code Field}.
   */
  @Override
  public abstract Value key();

  /**
   * Returns the key component of this {@code Field}.  Equivalent to {@link
   * #key()}.
   */
  @Override
  public Value getKey() {
    return key();
  }

  /**
   * Returns the value component of this {@code Field}.
   */
  public abstract Value value();

  /**
   * Returns the value component of this {@code Field}.  Equivalent to {@link
   * #value()}.
   */
  @Override
  public Value getValue() {
    return value();
  }

  /**
   * Sets the value of this {@code Field} to the new {@code value}, returning
   * the old value.
   *
   * @throws UnsupportedOperationException if this {@code Field} is immutable.
   */
  @Override
  public abstract Value setValue(Value value);

  /**
   * Returns a copy of this {@code Field} with the updated {@code value}.
   */
  public abstract Field updatedValue(Value value);

  /**
   * Returns the value component of this {@code Field}.  Equivalent to {@link
   * #value()}.
   */
  @Override
  public Value toValue() {
    return value();
  }

  /**
   * Always returns {@code null} because a {@code Field} can't be a {@code
   * Record}, so it can't have a first member {@code Attr} whose key string
   * could be returned.
   */
  @Override
  public final String tag() {
    return null;
  }

  /**
   * Always returns the value component of this {@code Field}.
   */
  @Override
  public final Value target() {
    return value();
  }

  /**
   * Always returns {@link Absent} because a {@code Field} can't be flattened
   * into a {@code Value}.
   */
  @Override
  public final Value flattened() {
    return Value.absent();
  }

  /**
   * Returns a {@code Record} containing just this {@code Field}.
   */
  @Override
  public final Record unflattened() {
    return Record.of(this);
  }

  /**
   * Always returns {@link Absent} because a {@code Field} can't be a {@code
   * Record}, so it can't have a head {@code Attr} whose value could be
   * returned if its key were equal to the {@code tag}.
   */
  @Override
  public final Value header(String tag) {
    return Value.absent();
  }

  /**
   * Always returns {@code null} because a {@code Field} can't be a {@code
   * Record}, so it can't have a head {@code Attr} whose value could be
   * returned as a {@code Record} if its key is equal to the {@code tag}.
   */
  @Override
  public final Record headers(String tag) {
    return null;
  }

  /**
   * Always returns {@link Absent} because a {@code Field} can't be a {@code
   * Record}, so it can't have a first member.
   */
  @Override
  public final Item head() {
    return Item.absent();
  }

  /**
   * Always returns an empty {@code Record} because a {@code Field} can't
   * itself be a {@code Record}, so it can't have any non-first members.
   */
  @Override
  public final Record tail() {
    return Record.empty();
  }

  /**
   * Always returns {@link Absent} because a {@code Field} can't be a {@code
   * Record}, so it can't have any non-first members to flatten, and because a
   * {@code Field} isn't a distinct {@code Value}, so it can't return {@code
   * Extant}.
   */
  @Override
  public final Value body() {
    return Value.absent();
  }

  /**
   * Always returns {@code 0} because a {@code Field} can't be a {@code Record},
   * so it can't contain any members.
   */
  @Override
  public final int length() {
    return 0;
  }

  /**
   * Always returns {@code false} because a {@code Field} can't be a {@code
   * Record}, so it can't have a member equal to {@code item}.
   */
  @Override
  public final boolean contains(Item item) {
    return false;
  }

  /**
   * Always returns {@code false} because a {@code Field} can't be a {@code
   * Record}, so it can't have a {@code Field} member whose key is equal to the
   * given {@code key}.
   */
  @Override
  public final boolean containsKey(Value key) {
    return false;
  }

  /**
   * Always returns {@code false} because a {@code Field} can't be a {@code
   * Record}, so it can't have a {@code Field} member whose key string is equal
   * to the given {@code key}.
   */
  @Override
  public final boolean containsKey(String key) {
    return false;
  }

  /**
   * Always returns {@code false} because a {@code Field} can't be a {@code
   * Record}, so it can't have a {@code Field} member whose value is equal to
   * the given {@code value}.
   */
  @Override
  public final boolean containsValue(Value value) {
    return false;
  }

  /**
   * Always returns {@link Absent} because a {@code Field} can't be a {@code
   * Record}, so it can't have a {@code Field} member whose key is equal to the
   * given {@code key}.
   */
  @Override
  public final Value get(Value key) {
    return Value.absent();
  }

  /**
   * Always returns {@link Absent} because a {@code Field} can't be a {@code
   * Record}, so it can't have a {@code Field} member whose key string is equal
   * to the given {@code key}.
   */
  @Override
  public final Value get(String key) {
    return Value.absent();
  }

  /**
   * Always returns {@link Absent} because a {@code Field} can't be a {@code
   * Record}, so it can't have an {@code Attr} member whose key is equal to the
   * given {@code key}.
   */
  @Override
  public final Value getAttr(Text key) {
    return Value.absent();
  }

  /**
   * Always returns {@link Absent} because a {@code Field} can't be a {@code
   * Record}, so it can't have an {@code Attr} member whose key string is equal
   * to the given {@code key}.
   */
  @Override
  public final Value getAttr(String key) {
    return Value.absent();
  }

  /**
   * Always returns {@link Absent} because a {@code Field} can't be a {@code
   * Record}, so it can't have a {@code Slot} member whose key is equal to the
   * given {@code key}.
   */
  @Override
  public final Value getSlot(Value key) {
    return Value.absent();
  }

  /**
   * Always returns {@link Absent} because a {@code Field} can't be a {@code
   * Record}, so it can't have a {@code Slot} member whose key string is equal
   * to the given {@code key}.
   */
  @Override
  public final Value getSlot(String key) {
    return Value.absent();
  }

  /**
   * Always returns {@code null} because a {@code Field} can't be a {@code
   * Record}, so it can't have a {@code Field} member whose key is equal to the
   * given {@code key}.
   */
  @Override
  public final Field getField(Value key) {
    return null;
  }

  /**
   * Always returns {@code null} because a {@code Field} can't be a {@code
   * Record}, so it can't have a {@code Field} member whose key string is equal
   * to the given {@code key}.
   */
  @Override
  public final Field getField(String key) {
    return null;
  }

  /**
   * Always returns {@link Absent} because a {@code Field} can't be a {@code
   * Record}, so it can't have a member at the given {@code index}.
   */
  @Override
  public final Item getItem(int index) {
    return Item.absent();
  }

  @Override
  public Field removed(Value key) {
    return this;
  }

  @Override
  public Field removed(String key) {
    return this;
  }

  @Override
  public Item conditional(Item thenTerm, Item elseTerm) {
    if (thenTerm instanceof Field && elseTerm instanceof Field) {
      return conditional((Field) thenTerm, (Field) elseTerm);
    }
    return thenTerm;
  }

  public Field conditional(Field thenTerm, Field elseTerm) {
    return thenTerm;
  }

  @Override
  public Item or(Item that) {
    if (that instanceof Field) {
      return or((Field) that);
    }
    return this;
  }

  public Field or(Field that) {
    return this;
  }

  @Override
  public Item and(Item that) {
    if (that instanceof Field) {
      return and((Field) that);
    }
    return that;
  }

  public Field and(Field that) {
    return that;
  }

  @Override
  public Value lambda(Value template) {
    return Value.absent();
  }

  /**
   * Converts the value of this {@code Field} into a {@code String} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if the value of this {@code Field}
   *                                       can't be converted into a {@code String} value.
   */
  @Override
  public final String stringValue() {
    return getValue().stringValue();
  }

  /**
   * Converts the value of this {@code Field} into a {@code String} value,
   * if possible; otherwise returns {@code orElse} if the value of this
   * {@code Field} can't be converted into a {@code string} value.
   */
  @Override
  public final String stringValue(String orElse) {
    return getValue().stringValue(orElse);
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code byte}
   * value, if possible.
   *
   * @throws UnsupportedOperationException if the value of this {@code Field}
   *                                       can't be converted into a primitive {@code byte} value.
   */
  @Override
  public final byte byteValue() {
    return getValue().byteValue();
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code byte}
   * value, if possible; otherwise returns {@code orElse} if the value of this
   * {@code Field} can't be converted into a primitive {@code byte} value.
   */
  @Override
  public final byte byteValue(byte orElse) {
    return getValue().byteValue(orElse);
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code short}
   * value, if possible.
   *
   * @throws UnsupportedOperationException if the value of this {@code Field}
   *                                       can't be converted into a primitive {@code short} value.
   */
  @Override
  public final short shortValue() {
    return getValue().shortValue();
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code short}
   * value, if possible; otherwise returns {@code orElse} if the value of this
   * {@code Field} can't be converted into a primitive {@code short} value.
   */
  @Override
  public final short shortValue(short orElse) {
    return getValue().shortValue(orElse);
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code int}
   * value, if possible.
   *
   * @throws UnsupportedOperationException if the value of this {@code Field}
   *                                       can't be converted into a primitive {@code int} value.
   */
  @Override
  public final int intValue() {
    return getValue().intValue();
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code int}
   * value, if possible; otherwise returns {@code orElse} if the value of this
   * {@code Field} can't be converted into a primitive {@code int} value.
   */
  @Override
  public final int intValue(int orElse) {
    return getValue().intValue(orElse);
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code long}
   * value, if possible.
   *
   * @throws UnsupportedOperationException if the value of this {@code Field}
   *                                       can't be converted into a primitive {@code long} value.
   */
  @Override
  public final long longValue() {
    return getValue().longValue();
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code long}
   * value, if possible; otherwise returns {@code orElse} if the value of this
   * {@code Field} can't be converted into a primitive {@code long} value.
   */
  @Override
  public final long longValue(long orElse) {
    return getValue().longValue(orElse);
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code float}
   * value, if possible.
   *
   * @throws UnsupportedOperationException if the value of this {@code Field}
   *                                       can't be converted into a primitive {@code float} value.
   */
  @Override
  public final float floatValue() {
    return getValue().floatValue();
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code float}
   * value, if possible; otherwise returns {@code orElse} if the value of this
   * {@code Field} can't be converted into a primitive {@code float} value.
   */
  @Override
  public final float floatValue(float orElse) {
    return getValue().floatValue(orElse);
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code double}
   * value, if possible.
   *
   * @throws UnsupportedOperationException if the value of this {@code Field}
   *                                       can't be converted into a primitive {@code double} value.
   */
  @Override
  public final double doubleValue() {
    return getValue().doubleValue();
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code double}
   * value, if possible; otherwise returns {@code orElse} if the value of this
   * {@code Field} can't be converted into a primitive {@code double} value.
   */
  @Override
  public final double doubleValue(double orElse) {
    return getValue().doubleValue(orElse);
  }

  /**
   * Converts the value of this {@code Field} into a {@code BigInteger} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if the value of this {@code Field}
   *                                       can't be converted into a {@code BigInteger} value.
   */
  @Override
  public final BigInteger integerValue() {
    return getValue().integerValue();
  }

  /**
   * Converts the value of this {@code Field} into a {@code BigInteger} value,
   * if possible; otherwise returns {@code orElse} if the value of this
   * {@code Field} can't be converted into a {@code BigInteger} value.
   */
  @Override
  public final BigInteger integerValue(BigInteger orElse) {
    return getValue().integerValue(orElse);
  }

  /**
   * Converts the value of this {@code Field} into a {@code Number} object,
   * if possible.
   *
   * @throws UnsupportedOperationException if the value of this {@code Field}
   *                                       can't be converted into a {@code Number} object.
   */
  @Override
  public final Number numberValue() {
    return getValue().numberValue();
  }

  /**
   * Converts the value of this {@code Field} into a {@code Number} object,
   * if possible; otherwise returns {@code orElse} if the value of this
   * {@code Field} can't be converted into a {@code Number} object.
   */
  @Override
  public final Number numberValue(Number orElse) {
    return getValue().numberValue(orElse);
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code char}
   * value, if possible.
   *
   * @throws UnsupportedOperationException if the value of this {@code Field}
   *                                       can't be converted into a primitive {@code char} value.
   */
  @Override
  public final char charValue() {
    return getValue().charValue();
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code char}
   * value, if possible; otherwise returns {@code orElse} if the value of this
   * {@code Field} can't be converted into a primitive {@code char} value.
   */
  @Override
  public final char charValue(char orElse) {
    return getValue().charValue(orElse);
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code boolean}
   * value, if possible.
   *
   * @throws UnsupportedOperationException if the value of this {@code Field}
   *                                       can't be converted into a primitive {@code boolean} value.
   */
  @Override
  public final boolean booleanValue() {
    return getValue().booleanValue();
  }

  /**
   * Converts the value of this {@code Field} into a primitive {@code boolean}
   * value, if possible; otherwise returns {@code orElse} if the value of this
   * {@code Field} can't be converted into a primitive {@code boolean} value.
   */
  @Override
  public final boolean booleanValue(boolean orElse) {
    return getValue().booleanValue(orElse);
  }

  @Override
  public abstract Field branch();

  @Override
  public abstract Field commit();

  static final int IMMUTABLE = 1 << 0;
  static final AtomicIntegerFieldUpdater<Field> FLAGS =
      AtomicIntegerFieldUpdater.newUpdater(Field.class, "flags");

  public static Field of(Object object) {
    if (object instanceof Field) {
      return (Field) object;
    } else if (object instanceof Map.Entry<?, ?>) {
      final Map.Entry<?, ?> entry = (Map.Entry<?, ?>) object;
      return Slot.of(Value.fromObject(entry.getKey()), Value.fromObject(entry.getValue()));
    } else {
      throw new IllegalArgumentException(object.toString());
    }
  }
}
