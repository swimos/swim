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
import java.util.Iterator;
import java.util.Map;
import swim.codec.Debug;
import swim.codec.Display;
import swim.codec.Format;
import swim.codec.Output;
import swim.structure.func.MathModule;

public abstract class Item implements Comparable<Item>, Iterable<Item>, Debug, Display {
  Item() {
    // stub
  }

  /**
   * Returns {@code true} if this {@code Item} is not {@link Absent}.
   */
  public abstract boolean isDefined();

  /**
   * Returns {@code true} if this {@code Item} is neither {@link Extant} nor
   * {@link Absent}.
   */
  public abstract boolean isDistinct();

  /**
   * Returns {@code true} if this {@code Item} always {@link
   * #evaluate(Interpreter) evaluates} to the same {@code Item}.
   */
  public abstract boolean isConstant();

  /**
   * Returns the key component of this {@code Item}, if this {@code Item} is a
   * {@link Field}; otherwise returns {@link Absent} if this {@code Item} is a
   * {@code Value}.
   */
  public abstract Value key();

  /**
   * Returns the value component of this {@code Item}, if this {@code Item} is
   * a {@link Field}; otherwise returns {@code this} if this {@code Item} is
   * a {@code Value}.
   */
  public abstract Value toValue();

  /**
   * Returns the {@code key} string of the first member of this {@code Item},
   * if this {@code Item} is a {@link Record}, and its first member is an {@link
   * Attr}; otherwise returns {@code null} if this {@code Item} is not a {@code
   * Record}, or if this {@code Item} is a {@code Record} whose first member is
   * not an {@code Attr}.
   * <p>
   * Used to concisely get the name of the discriminating attribute of a
   * structure.  The {@code tag} can be used to discern the nominal type of a
   * polymorphic structure, similar to an XML element tag.
   */
  public abstract String tag();

  /**
   * Returns the {@link #flattened() flattened} members of this {@code Item}
   * after all attributes have been removed, if this {@code Item} is a {@link
   * Record}; otherwise returns {@code this} if this {@code Item} is a
   * non-{@code Record} {@code Value}, or returns the value component if this
   * {@code Item} is a {@code Field}.
   * <p>
   * Used to concisely get the scalar value of an attributed structure.
   * An attributed structure is a {@code Record} with one or more attributes
   * that modify one or more other members.
   */
  public abstract Value target();

  /**
   * Returns the sole member of this {@code Item}, if this {@code Item} is a
   * {@link Record} with exactly one member, and its member is a {@code Value};
   * returns {@link Extant} if this {@code Item} is an empty {@code Record};
   * returns {@link Absent} if this {@code Item} is a {@code Field}; otherwise
   * returns {@code this} if this {@code Item} is a {@code Record} with more
   * than one member, or if this {@code Item} is a non-{@code Record} {@code
   * Value}.
   * <p>
   * Used to convert a unary {@code Record} into its member {@code Value}.
   * Facilitates writing code that treats a unary {@code Record} equivalently
   * to a bare {@code Value}.
   */
  public abstract Value flattened();

  /**
   * Returns {@code this} if this {@code Item} is a {@link Record}; returns a
   * {@code Record} containing just this {@code Item}, if this {@code Item} is
   * {@link #isDistinct() distinct}; otherwise returns an empty {@code Record}
   * if this {@code Item} is {@link Extant} or {@link Absent}.  Facilitates
   * writing code that treats a bare {@code Value} equivalently to a unary
   * {@code Record}.
   */
  public abstract Record unflattened();

  /**
   * Returns the value of the first member of this {@code Item}, if this {@code
   * Item} is a {@link Record}, and its first member is an {@link Attr} whose
   * {@code key} string is equal to {@code tag}; otherwise returns {@link
   * Absent} if this {@code Item} is not a {@code Record}, or if this {@code
   * Item} is a {@code Record} whose first member is not an {@code Attr}, or if
   * this {@code Item} is a {@code Record} whose first member is an {@code
   * Attr} whose {@code key} does not equal the {@code tag}.
   * <p>
   * Used to conditionally get the value of the head {@code Attr} of a
   * structure, if and only if the key string of the head {@code Attr} is equal
   * to the {@code tag}.  Can be used to check if a structure might conform to
   * a nominal type named {@code tag}, while simultaneously getting the value
   * of the {@code tag} attribute.
   */
  public abstract Value header(String tag);

  /**
   * Returns the {@link #unflattened() unflattened} {@link #header(String)
   * header} of this {@code Item}, if this {@code Item} is a {@link Record},
   * and its first member is an {@link Attr} whose {@code key} string is equal
   * to {@code tag}; otherwise returns {@code null}.
   * <p>
   * The {@code headers} of the {@code tag} attribute of a structure are like
   * the attributes of an XML element tag; through unlike an XML element,
   * {@code tag} attribute headers are not limited to string keys and values.
   */
  public abstract Record headers(String tag);

  /**
   * Returns the first member of this {@code Item}, if this {@code Item} is a
   * non-empty {@link Record}; otherwise returns {@link Absent}.
   */
  public abstract Item head();

  /**
   * Returns a view of all but the first member of this {@code Item}, if this
   * {@code Item} is a non-empty {@link Record}; otherwise returns an empty
   * {@code Record} if this {@code Item} is not a {@code Record}, or if this
   * {@code Item} is itself an empty {@code Record}.
   */
  public abstract Record tail();

  /**
   * Returns the {@link Record#flattened() flattened} {@link #tail() tail}
   * of this {@code Item}.  Used to recursively deconstruct a structure,
   * terminating with its last {@code Value}, rather than a unary {@code
   * Record} containing its last value, if the structure ends with a {@code
   * Value} member.
   */
  public abstract Value body();

  /**
   * Returns the number of members contained in this {@code Item}, if this
   * {@code Item} is a {@link Record}; otherwise returns {@code 0} if this
   * {@code Item} is not a {@code Record}.
   */
  public abstract int length();

  /**
   * Returns {@code true} if this {@code Item} is a {@link Record} that has a
   * member equal to {@code item}; otherwise returns {@code false} if this
   * {@code Item} is not a {@code Record}, or if this {@code Item} is a {@code
   * Record}, but has no member equal to {@code item}.
   */
  public abstract boolean contains(Item item);

  /**
   * Returns {@code true} if this {@code Item} is a {@link Record} that has a
   * {@link Field} member with a key that is equal to the given {@code key};
   * otherwise returns {@code false} if this {@code Item} is not a {@code
   * Record}, or if this {@code Item} is a {@code Record}, but has no {@code
   * Field} member with a key equal to the given {@code key}.
   */
  public abstract boolean containsKey(Value key);

  /**
   * Returns {@code true} if this {@code Item} is a {@link Record} that has a
   * {@link Field} with a {@code Text} key whose string value is equal to the
   * given {@code key}; otherwise returns {@code false} if this {@code Item} is
   * not a {@code Record}, or if this {@code Item} is a {@code Record}, but has
   * no {@code Field} member with a {@code Text} key whose string value equals
   * the given {@code key}.  Equivalent to {@link #containsKey(Value)}, but
   * avoids boxing the {@code key} string into a {@code Text} value.
   */
  public abstract boolean containsKey(String key);

  /**
   * Returns {@code true} if this {@code Item} is a {@link Record} that has a
   * {@link Field} member with a value that is equal to the given {@code value};
   * otherwise returns {@code false} if this {@code Item} is not a {@code
   * Record}, or if this {@code Item} is a {@code Record}, but has no {@code
   * Field} member with a value equal to the given {@code value}.
   */
  public abstract boolean containsValue(Value value);

  /**
   * Returns the value of the last {@link Field} member of this {@code Item}
   * whose key is equal to the given {@code key}; returns {@link Absent} if
   * this {@code Item} is not a {@link Record}, or if this {@code Item} is a
   * {@code Record}, but has no {@code Field} member with a key equal to the
   * given {@code key}.
   */
  public abstract Value get(Value key);

  /**
   * Returns the value of the last {@link Field} member of this {@code Item}
   * with a {@code Text} key whose string value is equal to the given {@code
   * key}; returns {@link Absent} if this {@code Item} is not a {@link Record},
   * or if this {@code Item} is a {@code Record}, but has no {@code Field}
   * member with a {@code Text} key whose string value equals the given {@code
   * key}.  Equivalent to {@link #get(Value)}, but avoids boxing the {@code
   * key} string into a {@code Text} value.
   */
  public abstract Value get(String key);

  /**
   * Returns the value of the last {@link Attr} member of this {@code Item}
   * whose key is equal to the given {@code key}; returns {@link Absent} if
   * this {@code Item} is not a {@link Record}, or if this {@code Item} is a
   * {@code Record}, but has no {@code Attr} member with a key equal to the
   * given {@code key}.
   */
  public abstract Value getAttr(Text key);

  /**
   * Returns the value of the last {@link Attr} member of this {@code Item}
   * with a {@code Text} key whose string value is equal to the given {@code
   * key}; returns {@link Absent} if this {@code Item} is not a {@link Record},
   * or if this {@code Item} is a {@code Record}, but has no {@code Attr}
   * member with a {@code Text} key whose string value equals the given {@code
   * key}.  Equivalent to {@link #getAttr(Text)}, but avoids boxing the {@code
   * key} string into a {@code Text} value.
   */
  public abstract Value getAttr(String key);

  /**
   * Returns the value of the last {@link Slot} member of this {@code Item}
   * whose key is equal to the given {@code key}; returns {@link Absent} if
   * this {@code Item} is not a {@link Record}, or if this {@code Item} is a
   * {@code Record}, but has no {@code Slot} member with a key equal to the
   * given {@code key}.
   */
  public abstract Value getSlot(Value key);

  /**
   * Returns the value of the last {@link Slot} member of this {@code Item}
   * with a {@code Text} key whose string value is equal to the given {@code
   * key}; returns {@link Absent} if this {@code Item} is not a {@link Record},
   * or if this {@code Item} is a {@code Record}, but has no {@code Slot}
   * member with a {@code Text} key whose string value equals the given {@code
   * key}.  Equivalent to {@link #getSlot(Value)}, but avoids boxing the {@code
   * key} string into a {@code Text} value.
   */
  public abstract Value getSlot(String key);

  /**
   * Returns the last {@link Field} member of this {@code Item} whose key is
   * equal to the given {@code key}; returns {@code null} if this {@code Item}
   * is not a {@link Record}, or if this {@code Item} is a {@code Record}, but
   * has no {@code Field} member with a {@code key} equal to the given
   * {@code key}.
   */
  public abstract Field getField(Value key);

  /**
   * Returns the last {@link Field} member of this {@code Item} with a {@code
   * Text} key whose string value is equal to the given {@code key}; returns
   * {@code null} if this {@code Item} is not a {@link Record}, or if this
   * {@code Item} is a {@code Record}, but has no {@code Field} member with a
   * {@code Text} key whose string value equals the given {@code key}.
   * Equivalent to {@link #getField(Value)}, but avoids boxing the {@code key}
   * string into a {@code Text} value.
   */
  public abstract Field getField(String key);

  /**
   * Returns the member of this {@code Item} at the given {@code index}, if
   * this {@code Item} is a {@link Record}, and the {@code index} is greater
   * than or equal to zero, and less than the {@link Record#length() length} of
   * the {@code Record}; otherwise returns {@link Absent} if this {@code Item}
   * is not a {@code Record}, or if this {@code Item} is a {@code Record}, but
   * the {@code index} is out of bounds.
   */
  public abstract Item getItem(int index);

  public Record updated(Value key, Value value) {
    final Record record = Record.create(2);
    record.add(this);
    record.put(key, value);
    return record;
  }

  public Record updated(Value key, String value) {
    return updated(key, Text.from(value));
  }

  public Record updated(Value key, int value) {
    return updated(key, Num.from(value));
  }

  public Record updated(Value key, long value) {
    return updated(key, Num.from(value));
  }

  public Record updated(Value key, float value) {
    return updated(key, Num.from(value));
  }

  public Record updated(Value key, double value) {
    return updated(key, Num.from(value));
  }

  public Record updated(Value key, boolean value) {
    return updated(key, Bool.from(value));
  }

  public Record updated(String key, Value value) {
    return updated(Text.from(key), value);
  }

  public Record updated(String key, String value) {
    return updated(key, Text.from(value));
  }

  public Record updated(String key, int value) {
    return updated(key, Num.from(value));
  }

  public Record updated(String key, long value) {
    return updated(key, Num.from(value));
  }

  public Record updated(String key, float value) {
    return updated(key, Num.from(value));
  }

  public Record updated(String key, double value) {
    return updated(key, Num.from(value));
  }

  public Record updated(String key, boolean value) {
    return updated(key, Bool.from(value));
  }

  public Record updatedAttr(Text key, Value value) {
    final Record record = Record.create(2);
    record.add(this);
    record.putAttr(key, value);
    return record;
  }

  public Record updatedAttr(Text key, String value) {
    return updatedAttr(key, Text.from(value));
  }

  public Record updatedAttr(Text key, int value) {
    return updatedAttr(key, Num.from(value));
  }

  public Record updatedAttr(Text key, long value) {
    return updatedAttr(key, Num.from(value));
  }

  public Record updatedAttr(Text key, float value) {
    return updatedAttr(key, Num.from(value));
  }

  public Record updatedAttr(Text key, double value) {
    return updatedAttr(key, Num.from(value));
  }

  public Record updatedAttr(Text key, boolean value) {
    return updatedAttr(key, Bool.from(value));
  }

  public Record updatedAttr(String key, Value value) {
    return updatedAttr(Text.from(key), value);
  }

  public Record updatedAttr(String key, String value) {
    return updatedAttr(key, Text.from(value));
  }

  public Record updatedAttr(String key, int value) {
    return updatedAttr(key, Num.from(value));
  }

  public Record updatedAttr(String key, long value) {
    return updatedAttr(key, Num.from(value));
  }

  public Record updatedAttr(String key, float value) {
    return updatedAttr(key, Num.from(value));
  }

  public Record updatedAttr(String key, double value) {
    return updatedAttr(key, Num.from(value));
  }

  public Record updatedAttr(String key, boolean value) {
    return updatedAttr(key, Bool.from(value));
  }

  public Record updatedSlot(Value key, Value value) {
    final Record record = Record.create(2);
    record.add(this);
    record.putSlot(key, value);
    return record;
  }

  public Record updatedSlot(Value key, String value) {
    return updatedSlot(key, Text.from(value));
  }

  public Record updatedSlot(Value key, int value) {
    return updatedSlot(key, Num.from(value));
  }

  public Record updatedSlot(Value key, long value) {
    return updatedSlot(key, Num.from(value));
  }

  public Record updatedSlot(Value key, float value) {
    return updatedSlot(key, Num.from(value));
  }

  public Record updatedSlot(Value key, double value) {
    return updatedSlot(key, Num.from(value));
  }

  public Record updatedSlot(Value key, boolean value) {
    return updatedSlot(key, Bool.from(value));
  }

  public Record updatedSlot(String key, Value value) {
    return updatedSlot(Text.from(key), value);
  }

  public Record updatedSlot(String key, String value) {
    return updatedSlot(key, Text.from(value));
  }

  public Record updatedSlot(String key, int value) {
    return updatedSlot(key, Num.from(value));
  }

  public Record updatedSlot(String key, long value) {
    return updatedSlot(key, Num.from(value));
  }

  public Record updatedSlot(String key, float value) {
    return updatedSlot(key, Num.from(value));
  }

  public Record updatedSlot(String key, double value) {
    return updatedSlot(key, Num.from(value));
  }

  public Record updatedSlot(String key, boolean value) {
    return updatedSlot(key, Bool.from(value));
  }

  public Record appended(Item item) {
    final Record record = Record.create(2);
    record.add(this);
    record.add(item);
    return record;
  }

  public Record appended(String item) {
    return appended(Text.from(item));
  }

  public Record appended(int item) {
    return appended(Num.from(item));
  }

  public Record appended(long item) {
    return appended(Num.from(item));
  }

  public Record appended(float item) {
    return appended(Num.from(item));
  }

  public Record appended(double item) {
    return appended(Num.from(item));
  }

  public Record appended(boolean item) {
    return appended(Bool.from(item));
  }

  public Record appended(Object... items) {
    final Record record = Record.create(1 + items.length);
    record.add(this);
    record.addAll(Record.of(items));
    return record;
  }

  public Record prepended(Item item) {
    final Record record = Record.create(2);
    record.add(item);
    record.add(this);
    return record;
  }

  public Record prepended(String item) {
    return prepended(Text.from(item));
  }

  public Record prepended(int item) {
    return prepended(Num.from(item));
  }

  public Record prepended(long item) {
    return prepended(Num.from(item));
  }

  public Record prepended(float item) {
    return prepended(Num.from(item));
  }

  public Record prepended(double item) {
    return prepended(Num.from(item));
  }

  public Record prepended(boolean item) {
    return prepended(Bool.from(item));
  }

  public Record prepended(Object... items) {
    final Record record = Record.create(items.length + 1);
    record.addAll(Record.of(items));
    record.add(this);
    return record;
  }

  public abstract Item removed(Value key);

  public abstract Item removed(String key);

  public Record concat(Item that) {
    final Record record = Record.create(1 + that.length());
    record.add(this);
    if (that instanceof Record) {
      record.addAll((Record) that);
    } else {
      record.add(that);
    }
    return record;
  }

  public abstract Item conditional(Item thenTerm, Item elseTerm);

  public abstract Item or(Item that);

  public abstract Item and(Item that);

  public abstract Item bitwiseOr(Item that);

  public abstract Item bitwiseXor(Item that);

  public abstract Item bitwiseAnd(Item that);

  public Item lt(Item that) {
    return compareTo(that) < 0 ? Bool.from(true) : Item.absent();
  }

  public Item le(Item that) {
    return compareTo(that) <= 0 ? Bool.from(true) : Item.absent();
  }

  public Item eq(Item that) {
    return equals(that) ? Bool.from(true) : Item.absent();
  }

  public Item ne(Item that) {
    return !equals(that) ? Bool.from(true) : Item.absent();
  }

  public Item ge(Item that) {
    return compareTo(that) >= 0 ? Bool.from(true) : Item.absent();
  }

  public Item gt(Item that) {
    return compareTo(that) > 0 ? Bool.from(true) : Item.absent();
  }

  public abstract Item plus(Item that);

  public abstract Item minus(Item that);

  public abstract Item times(Item that);

  public abstract Item divide(Item that);

  public abstract Item modulo(Item that);

  public abstract Item not();

  public abstract Item bitwiseNot();

  public abstract Item negative();

  public abstract Item positive();

  public abstract Item inverse();

  public Item invoke(Value args) {
    return Item.absent();
  }

  public abstract Value lambda(Value template);

  public Selector filter() {
    final Selector selector = Selector.literal(this);
    return selector.filter();
  }

  public Selector filter(Item predicate) {
    final Selector selector = Selector.literal(this);
    return selector.filter(predicate);
  }

  public Item max(Item that) {
    return compareTo(that) >= 0 ? this : that;
  }

  public Item min(Item that) {
    return compareTo(that) <= 0 ? this : that;
  }

  public Item evaluate(Interpreter interpreter) {
    return this;
  }

  public Item evaluate(Item scope) {
    final Interpreter interpreter = new Interpreter();
    interpreter.pushScope(Item.globalScope());
    interpreter.pushScope(scope);
    return evaluate(interpreter);
  }

  public Item substitute(Interpreter interpreter) {
    return this;
  }

  public Item substitute(Item scope) {
    final Interpreter interpreter = new Interpreter();
    interpreter.pushScope(Item.globalScope());
    interpreter.pushScope(scope);
    return substitute(interpreter);
  }

  /**
   * Converts this {@code Item} into a {@code String} value, if possible.
   *
   * @throws UnsupportedOperationException if this {@code Item} can't be
   *                                       converted into a {@code String} value.
   */
  public abstract String stringValue();

  /**
   * Converts this {@code Item} into a {@code String} value, if possible;
   * otherwise returns {@code orElse} if this {@code Item} can't be converted
   * into a {@code string} value.
   */
  public abstract String stringValue(String orElse);

  /**
   * Converts this {@code Item} into a primitive {@code byte} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Item} can't be
   *                                       converted into a primitive {@code byte} value.
   */
  public abstract byte byteValue();

  /**
   * Converts this {@code Item} into a primitive {@code byte} value,
   * if possible; otherwise returns {@code orElse} if this {@code Item} can't
   * be converted into a primitive {@code byte} value.
   */
  public abstract byte byteValue(byte orElse);

  /**
   * Converts this {@code Item} into a primitive {@code short} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Item} can't be
   *                                       converted into a primitive {@code short} value.
   */
  public abstract short shortValue();

  /**
   * Converts this {@code Item} into a primitive {@code short} value,
   * if possible; otherwise returns {@code orElse} if this {@code Item} can't
   * be converted into a primitive {@code short} value.
   */
  public abstract short shortValue(short orElse);

  /**
   * Converts this {@code Item} into a primitive {@code int} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Item} can't be
   *                                       converted into a primitive {@code int} value.
   */
  public abstract int intValue();

  /**
   * Converts this {@code Item} into a primitive {@code int} value,
   * if possible; otherwise returns {@code orElse} if this {@code Item} can't
   * be converted into a primitive {@code int} value.
   */
  public abstract int intValue(int orElse);

  /**
   * Converts this {@code Item} into a primitive {@code long} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Item} can't be
   *                                       converted into a primitive {@code long} value.
   */
  public abstract long longValue();

  /**
   * Converts this {@code Item} into a primitive {@code long} value,
   * if possible; otherwise returns {@code orElse} if this {@code Item} can't
   * be converted into a primitive {@code long} value.
   */
  public abstract long longValue(long orElse);

  /**
   * Converts this {@code Item} into a primitive {@code float} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Item} can't be
   *                                       converted into a primitive {@code float} value.
   */
  public abstract float floatValue();

  /**
   * Converts this {@code Item} into a primitive {@code float} value,
   * if possible; otherwise returns {@code orElse} if this {@code Item} can't
   * be converted into a primitive {@code float} value.
   */
  public abstract float floatValue(float orElse);

  /**
   * Converts this {@code Item} into a primitive {@code double} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Item} can't be
   *                                       converted into a primitive {@code double} value.
   */
  public abstract double doubleValue();

  /**
   * Converts this {@code Item} into a primitive {@code double} value,
   * if possible; otherwise returns {@code orElse} if this {@code Item} can't
   * be converted into a primitive {@code double} value.
   */
  public abstract double doubleValue(double orElse);

  /**
   * Converts this {@code Item} into a {@code BigInteger} value, if possible.
   *
   * @throws UnsupportedOperationException if this {@code Item} can't be
   *                                       converted into a {@code BigInteger} value.
   */
  public abstract BigInteger integerValue();

  /**
   * Converts this {@code Item} into a {@code BigInteger} value, if possible;
   * otherwise returns {@code orElse} if this {@code Item} can't
   * be converted into a {@code BigInteger} value.
   */
  public abstract BigInteger integerValue(BigInteger orElse);

  /**
   * Converts this {@code Item} into a {@code Number} object, if possible.
   *
   * @throws UnsupportedOperationException if this {@code Item} can't be
   *                                       converted into a {@code Number} object.
   */
  public abstract Number numberValue();

  /**
   * Converts this {@code Item} into a {@code Number} object, if possible;
   * otherwise returns {@code orElse} if this {@code Item} can't
   * be converted into a {@code Number} object.
   */
  public abstract Number numberValue(Number orElse);

  /**
   * Converts this {@code Item} into a primitive {@code char} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Item} can't be
   *                                       converted into a primitive {@code char} value.
   */
  public abstract char charValue();

  /**
   * Converts this {@code Item} into a primitive {@code char} value,
   * if possible; otherwise returns {@code orElse} if this {@code Item} can't
   * be converted into a primitive {@code char} value.
   */
  public abstract char charValue(char orElse);

  /**
   * Converts this {@code Item} into a primitive {@code boolean} value,
   * if possible.
   *
   * @throws UnsupportedOperationException if this {@code Item} can't be
   *                                       converted into a primitive {@code boolean} value.
   */
  public abstract boolean booleanValue();

  /**
   * Converts this {@code Item} into a primitive {@code boolean} value,
   * if possible; otherwise returns {@code orElse} if this {@code Item} can't
   * be converted into a primitive {@code boolean} value.
   */
  public abstract boolean booleanValue(boolean orElse);

  public <T> T cast(Form<T> form) {
    return form.cast(this);
  }

  public <T> T cast(Form<T> form, T orElse) {
    T object = form.cast(this);
    if (object == null) {
      object = orElse;
    }
    return object;
  }

  public <T> T coerce(Form<T> form) {
    T object = form.cast(this);
    if (object == null) {
      object = form.unit();
    }
    return object;
  }

  public <T> T coerce(Form<T> form, T orElse) {
    T object = form.cast(this);
    if (object == null) {
      object = form.unit();
    }
    if (object == null) {
      object = orElse;
    }
    return object;
  }

  public abstract boolean isAliased();

  public abstract boolean isMutable();

  public abstract void alias();

  public abstract Item branch();

  /**
   * Flags this {@code Item} as immutable, recursively if it is a {@link
   * Record}, then returns this {@code Item}.
   */
  public abstract Item commit();

  public int precedence() {
    return 12;
  }

  @Override
  public Iterator<Item> iterator() {
    return new ItemIterator(this);
  }

  /**
   * Returns the heterogeneous sort order of this {@code Item}.  Used to impose
   * a total order on the set of all items.  When comparing two items of
   * different types, the items order according to their {@code typeOrder}.
   */
  public abstract int typeOrder();

  @Override
  public abstract int compareTo(Item other);

  public abstract boolean keyEquals(Object key);

  @Override
  public abstract boolean equals(Object other);

  @Override
  public abstract int hashCode();

  public abstract void debug(Output<?> output);

  public void display(Output<?> output) {
    debug(output);
  }

  public String toString() {
    return Format.debug(this);
  }

  public static Item empty() {
    return Record.empty();
  }

  public static Item extant() {
    return Extant.extant();
  }

  public static Item absent() {
    return Absent.absent();
  }

  public static Item fromObject(Object object) {
    if (object instanceof Item) {
      return (Item) object;
    } else if (object instanceof Map.Entry<?, ?>) {
      final Map.Entry<?, ?> entry = (Map.Entry<?, ?>) object;
      return Slot.of(Value.fromObject(entry.getKey()), Value.fromObject(entry.getValue()));
    } else {
      return Value.fromObject(object);
    }
  }

  private static Item globalScope;

  public static Item globalScope() {
    if (globalScope == null) {
      globalScope = Record.create(1)
          .slot("math", MathModule.scope())
          .commit();
    }
    return globalScope;
  }
}
