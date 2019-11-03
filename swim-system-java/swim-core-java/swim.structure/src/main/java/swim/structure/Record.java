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

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import swim.codec.Output;
import swim.util.Builder;
import swim.util.PairBuilder;

public abstract class Record extends Value implements List<Item>, Builder<Item, Record>, PairBuilder<Value, Value, Record> {
  volatile int flags;

  protected Record() {
    // stub
  }

  /**
   * Returns {@code true} if this {@code Record} has no members.
   */
  @Override
  public abstract boolean isEmpty();

  /**
   * Returns {@code true} if this {@code Record} has only {@link Value}
   * members–no {@code Field} members.
   */
  public boolean isArray() {
    return fieldCount() == 0;
  }

  /**
   * Returns {@code true} if this {@code Record} has only {@link Field}
   * members–no {@code Value} members.
   */
  public boolean isObject() {
    return valueCount() == 0;
  }

  /**
   * Returns the number of members contained in this {@code Record}.
   */
  @Override
  public abstract int size();

  /**
   * Returns the number of members contained in this {@code Record}; equivalent
   * to {@link #size()}.
   */
  @Override
  public final int length() {
    return size();
  }

  /**
   * Returns the number of {@link Field} members contained in this
   * {@code Record}.
   */
  public int fieldCount() {
    int count = 0;
    for (Item member : this) {
      if (member instanceof Field) {
        count += 1;
      }
    }
    return count;
  }

  /**
   * Returns the number of {@link Value} members contained in this
   * {@code Record}.
   */
  public int valueCount() {
    int count = 0;
    for (Item member : this) {
      if (member instanceof Value) {
        count += 1;
      }
    }
    return count;
  }

  @Override
  public boolean isConstant() {
    for (Item member : this) {
      if (!member.isConstant()) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns the {@code key} string of the first member of this {@code Record},
   * if the first member is an {@link Attr}; otherwise returns {@code null} if
   * the first member is not an {@code Attr}.
   * <p>
   * Used to concisely get the name of the discriminating attribute of a
   * structure.  The {@code tag} can be used to discern the nominal type of a
   * polymorphic structure, similar to an XML element tag.
   */
  @Override
  public String tag() {
    final Item item = head();
    if (item instanceof Attr) {
      return ((Attr) item).key.value;
    }
    return null;
  }

  /**
   * Returns the {@link #flattened() flattened} members of this {@code Record}
   * after all attributes have been removed.
   * <p>
   * Used to concisely get the scalar value of an attributed structure.
   * An attributed structure is a {@code Record} with one or more attributes
   * that modify one or more other members.
   */
  @Override
  public Value target() {
    Value value = null;
    Record record = null;
    boolean modified = false;
    for (Item item : this) {
      if (item instanceof Attr) {
        modified = true;
      } else if (value == null && item instanceof Value) {
        value = (Value) item;
      } else {
        if (record == null) {
          record = Record.create();
          if (value != null) {
            record.add(value);
          }
        }
        record.add(item);
      }
    }
    if (value == null) {
      return Value.extant();
    } else if (record == null) {
      return value;
    } else if (modified) {
      return record;
    } else {
      return this;
    }
  }

  /**
   * Returns the sole member of this {@code Record}, if this {@code Record} has
   * exactly one member, and its member is a {@code Value}; returns {@link
   * Extant} if this {@code Record} is empty; otherwise returns {@code this} if
   * this {@code Record} has more than one member.
   * <p>
   * Used to convert a unary {@code Record} into its member {@code Value}.
   * Facilitates writing code that treats a unary {@code Record} equivalently
   * to a bare {@code Value}.
   */
  @Override
  public Value flattened() {
    if (isEmpty()) {
      return Value.extant();
    } else {
      final Iterator<Item> items = iterator();
      final Item head = items.next();
      if (!items.hasNext() && head instanceof Value) {
        return (Value) head;
      } else {
        return branch();
      }
    }
  }

  /**
   * Returns {@code this} {@code Record}.
   */
  @Override
  public Record unflattened() {
    return this;
  }

  /**
   * Returns the value of the first member of this {@code Record}, if the first
   * member is an {@link Attr} whose {@code key} string is equal to {@code tag};
   * otherwise returns {@link Absent} if the first member of this {@code Record}
   * is not an {@code Attr}, or if the first member of this {@code Record} is an
   * {@code Attr} whose {@code key} does not equal the {@code tag}.
   * <p>
   * Used to conditionally get the value of the head {@code Attr} of a
   * structure, if and only if the key string of the head {@code Attr} is equal
   * to the {@code tag}.  Can be used to check if a structure might conform to
   * a nominal type named {@code tag}, while simultaneously getting the value
   * of the {@code tag} attribute.
   */
  @Override
  public Value header(String tag) {
    final Item head = head();
    if (head instanceof Attr && head.keyEquals(tag)) {
      return ((Attr) head).value;
    } else {
      return Value.absent();
    }
  }

  /**
   * Returns the {@link #unflattened() unflattened} {@link #header(String)
   * header} of this {@code Record}.  The {@code headers} of the {@code tag}
   * attribute of a structure are like the attributes of an XML element tag;
   * through unlike an XML element, {@code tag} attribute headers are not
   * limited to string keys and values.
   */
  @Override
  public Record headers(String tag) {
    final Item head = head();
    if (head instanceof Attr && head.keyEquals(tag)) {
      final Value header = ((Attr) head).value;
      if (header instanceof Record) {
        return (Record) header;
      } else {
        return Record.of(header);
      }
    }
    return null;
  }

  /**
   * Returns the first member of this {@code Record}, if this {@code Record} is
   * non-empty; otherwise returns {@link Absent}.
   */
  @Override
  public Item head() {
    return getItem(0);
  }

  /**
   * Returns a view of all but the first member of this {@code Record}, if this
   * {@code Record} is non-empty; otherwise returns an empty {@code Record}, if
   * this {@code Record} is itself empty.
   */
  @Override
  public Record tail() {
    final Record tail = Record.create();
    final Iterator<Item> items = iterator();
    if (items.hasNext()) {
      items.next(); // skip head
    }
    while (items.hasNext()) {
      tail.add(items.next());
    }
    return tail;
  }

  /**
   * Returns the {@link #flattened() flattened} {@link #tail() tail} of this
   * {@code Record}.  Used to recursively deconstruct a structure, terminating
   * with its last {@code Value}, rather than a unary {@code Record} containing
   * its last value, if the structure ends with a {@code Value} member.
   */
  @Override
  public Value body() {
    final Record tail = tail();
    if (!tail.isEmpty()) {
      return tail.flattened();
    } else {
      return Value.absent();
    }
  }

  /**
   * Returns {@code true} if this {@code Record} has a member equal to {@code
   * Item.fromObject(item)}; otherwise returns {@code false} if this {@code
   * Record} has no member equal to {@code Item.fromObject(item)}.
   */
  @Override
  public boolean contains(Object item) {
    return contains(Item.fromObject(item));
  }

  /**
   * Returns {@code true} if this {@code Record} has a member equal to {@code
   * item}; otherwise returns {@code false} if this {@code Record} has no
   * member equal to {@code item}.
   */
  @Override
  public boolean contains(Item item) {
    for (Item member : this) {
      if (member.equals(item)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns {@code true} if this {@code Record} has a member equal to every
   * item in {@code items}; returns {@code false} if any item in {@code items}
   * is not contained in this {@code Record}.
   */
  @Override
  public boolean containsAll(Collection<?> items) {
    final HashSet<Object> q = new HashSet<Object>(items);
    final Iterator<Item> elems = iterator();
    while (elems.hasNext() && !q.isEmpty()) {
      q.remove(elems.next());
    }
    return q.isEmpty();
  }

  /**
   * Returns {@code true} if this {@code Record} has a {@link Field} member
   * with a key that is equal to the given {@code key}; otherwise returns
   * {@code false} if this {@code Record} has no {@code Field} member with a
   * key equal to the given {@code key}.
   */
  @Override
  public boolean containsKey(Value key) {
    for (Item item : this) {
      if (item instanceof Field && item.keyEquals(key)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns {@code true} if this {@code Record} has a {@link Field} member
   * with a key that is equal to the given {@code key}; otherwise returns
   * {@code false} if this {@code Record} has no {@code Field} member with a
   * key equal to the given {@code key}.  Equivalent to {@link
   * #containsKey(Value)}, but avoids boxing the {@code key} string into a
   * {@code Text} value.
   */
  @Override
  public boolean containsKey(String key) {
    for (Item item : this) {
      if (item instanceof Field && item.keyEquals(key)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns {@code true} if this {@code Record} has a {@link Field} member
   * with a value that is equal to the given {@code value}; otherwise returns
   * {@code false} if this {@code Record} has no {@code Field} member with a
   * value equal to the given {@code value}.
   */
  @Override
  public boolean containsValue(Value value) {
    for (Item item : this) {
      if (item instanceof Field && item.toValue().equals(value)) {
        return true;
      }
    }
    return false;
  }

  @Override
  public int indexOf(Object item) {
    return indexOf(Item.fromObject(item));
  }

  private int indexOf(Item item) {
    final Iterator<Item> items = iterator();
    int index = 0;
    while (items.hasNext()) {
      if (item.equals(items.next())) {
        return index;
      }
      index += 1;
    }
    return -1;
  }

  @Override
  public int lastIndexOf(Object item) {
    return lastIndexOf(Item.fromObject(item));
  }

  private int lastIndexOf(Item item) {
    int index = this.size() - 1;
    while (index >= 0) {
      if (item.equals(getItem(index))) {
        return index;
      }
      index -= 1;
    }
    return -1;
  }

  /**
   * Returns the value of the last {@link Field} member of this {@code Record}
   * whose key is equal to the given {@code key}; returns {@link Absent} if
   * this {@code Record} has no {@code Field} member with a key equal to the
   * given {@code key}.
   */
  @Override
  public Value get(Value key) {
    for (Item item : this) {
      if (item instanceof Field && item.keyEquals(key)) {
        return item.toValue();
      }
    }
    return Value.absent();
  }

  /**
   * Returns the value of the last {@link Field} member of this {@code Record}
   * whose key is equal to the given {@code key}; returns {@link Absent} if
   * this {@code Record} has no {@code Field} member with a key equal to the
   * given {@code key}.  Equivalent to {@link #get(Value)}, but avoids boxing
   * the {@code key} string into a {@code Text} value.
   */
  @Override
  public Value get(String key) {
    for (Item item : this) {
      if (item instanceof Field && item.keyEquals(key)) {
        return item.toValue();
      }
    }
    return Value.absent();
  }

  /**
   * Returns the value of the last {@link Attr} member of this {@code Record}
   * whose key is equal to the given {@code key}; returns {@link Absent} if
   * this {@code Record} has no {@code Attr} member with a key equal to the
   * given {@code key}.
   */
  @Override
  public Value getAttr(Text key) {
    for (Item item : this) {
      if (item instanceof Attr && item.keyEquals(key)) {
        return item.toValue();
      }
    }
    return Value.absent();
  }

  /**
   * Returns the value of the last {@link Attr} member of this {@code Record}
   * whose key is equal to the given {@code key}; returns {@link Absent} if
   * this {@code Record} has no {@code Attr} member with a key equal to the
   * given {@code key}.  Equivalent to {@link #getAttr(Text)}, but avoids
   * boxing the {@code key} string into a {@code Text} value.
   */
  @Override
  public Value getAttr(String key) {
    for (Item item : this) {
      if (item instanceof Attr && item.keyEquals(key)) {
        return item.toValue();
      }
    }
    return Value.absent();
  }

  /**
   * Returns the value of the last {@link Slot} member of this {@code Record}
   * whose key is equal to the given {@code key}; returns {@link Absent} if
   * this {@code Record} has no {@code Slot} member with a key equal to the
   * given {@code key}.
   */
  @Override
  public Value getSlot(Value key) {
    for (Item item : this) {
      if (item instanceof Slot && item.keyEquals(key)) {
        return item.toValue();
      }
    }
    return Value.absent();
  }

  /**
   * Returns the value of the last {@link Slot} member of this {@code Record}
   * whose key is equal to the given {@code key}; returns {@link Absent} if
   * this {@code Record} has no {@code Slot} member with a key equal to the
   * given {@code key}.  Equivalent to {@link #getSlot(Value)}, but avoids
   * boxing the {@code key} string into a {@code Text} value.
   */
  @Override
  public Value getSlot(String key) {
    for (Item item : this) {
      if (item instanceof Slot && item.keyEquals(key)) {
        return item.toValue();
      }
    }
    return Value.absent();
  }

  /**
   * Returns the last {@link Field} member of this {@code Record} whose key
   * is equal to the given {@code key}; returns {@code null} if this {@code
   * Record} has no {@code Field} member with a {@code key} equal to the
   * given {@code key}.
   */
  @Override
  public Field getField(Value key) {
    for (Item item : this) {
      if (item instanceof Field && item.keyEquals(key)) {
        return (Field) item;
      }
    }
    return null;
  }

  /**
   * Returns the last {@link Field} member of this {@code Record} whose key
   * is equal to the given {@code key}; returns {@code null} if this {@code
   * Record} has no {@code Field} member with a {@code key} equal to the
   * given {@code key}.  Equivalent to {@link #getField(Value)}, but avoids
   * boxing the {@code key} string into a {@code Text} value.
   */
  @Override
  public Field getField(String key) {
    for (Item item : this) {
      if (item instanceof Field && item.keyEquals(key)) {
        return (Field) item;
      }
    }
    return null;
  }

  /**
   * Returns the member of this {@code Record} at the given {@code index},
   * if the {@code index} is greater than or equal to zero, and less than the
   * {@link #length() length} of this {@code Record}.
   *
   * @throws IndexOutOfBoundsException if the {@code index} is out of bounds.
   */
  @Override
  public abstract Item get(int index);

  /**
   * Returns the member of this {@code Record} at the given {@code index},
   * if the {@code index} is greater than or equal to zero, and less than the
   * {@link #length() length} of this {@code Record}; otherwise returns {@link
   * Absent} if the {@code index} is out of bounds.
   */
  @Override
  public abstract Item getItem(int index);

  public Value put(Value key, Value newValue) {
    final ListIterator<Item> items = listIterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item instanceof Field && item.keyEquals(key)) {
        final Field field = (Field) item;
        if (field.isMutable()) {
          return field.setValue(newValue);
        } else {
          final Value oldValue = field.toValue();
          items.set(field.updatedValue(newValue));
          return oldValue;
        }
      }
    }
    add(new Slot(key, newValue));
    return Value.absent();
  }

  public Value put(Value key, String newValue) {
    return put(key, Text.from(newValue));
  }

  public Value put(Value key, int newValue) {
    return put(key, Num.from(newValue));
  }

  public Value put(Value key, long newValue) {
    return put(key, Num.from(newValue));
  }

  public Value put(Value key, float newValue) {
    return put(key, Num.from(newValue));
  }

  public Value put(Value key, double newValue) {
    return put(key, Num.from(newValue));
  }

  public Value put(Value key, boolean newValue) {
    return put(key, Bool.from(newValue));
  }

  public Value put(String key, Value newValue) {
    final ListIterator<Item> items = listIterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item instanceof Field && item.keyEquals(key)) {
        final Field field = (Field) item;
        if (field.isMutable()) {
          return field.setValue(newValue);
        } else {
          final Value oldValue = field.toValue();
          items.set(field.updatedValue(newValue));
          return oldValue;
        }
      }
    }
    add(new Slot(Text.from(key), newValue));
    return Value.absent();
  }

  public Value put(String key, String newValue) {
    return put(key, Text.from(newValue));
  }

  public Value put(String key, int newValue) {
    return put(key, Num.from(newValue));
  }

  public Value put(String key, long newValue) {
    return put(key, Num.from(newValue));
  }

  public Value put(String key, float newValue) {
    return put(key, Num.from(newValue));
  }

  public Value put(String key, double newValue) {
    return put(key, Num.from(newValue));
  }

  public Value put(String key, boolean newValue) {
    return put(key, Bool.from(newValue));
  }

  public Value putAttr(Text key, Value newValue) {
    final ListIterator<Item> items = listIterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item instanceof Field && item.keyEquals(key)) {
        if (item instanceof Attr && item.isMutable()) {
          return ((Attr) item).setValue(newValue);
        } else {
          final Value oldValue = item.toValue();
          items.set(new Attr(key, newValue));
          return oldValue;
        }
      }
    }
    add(new Attr(key, newValue));
    return Value.absent();
  }

  public Value putAttr(Text key, String newValue) {
    return putAttr(key, Text.from(newValue));
  }

  public Value putAttr(Text key, int newValue) {
    return putAttr(key, Num.from(newValue));
  }

  public Value putAttr(Text key, long newValue) {
    return putAttr(key, Num.from(newValue));
  }

  public Value putAttr(Text key, float newValue) {
    return putAttr(key, Num.from(newValue));
  }

  public Value putAttr(Text key, double newValue) {
    return putAttr(key, Num.from(newValue));
  }

  public Value putAttr(Text key, boolean newValue) {
    return putAttr(key, Bool.from(newValue));
  }

  public Value putAttr(String key, Value newValue) {
    final ListIterator<Item> items = listIterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item instanceof Field && item.keyEquals(key)) {
        if (item instanceof Attr && item.isMutable()) {
          return ((Attr) item).setValue(newValue);
        } else {
          final Value oldValue = item.toValue();
          items.set(new Attr(Text.from(key), newValue));
          return oldValue;
        }
      }
    }
    add(new Attr(Text.from(key), newValue));
    return Value.absent();
  }

  public Value putAttr(String key, String newValue) {
    return putAttr(key, Text.from(newValue));
  }

  public Value putAttr(String key, int newValue) {
    return putAttr(key, Num.from(newValue));
  }

  public Value putAttr(String key, long newValue) {
    return putAttr(key, Num.from(newValue));
  }

  public Value putAttr(String key, float newValue) {
    return putAttr(key, Num.from(newValue));
  }

  public Value putAttr(String key, double newValue) {
    return putAttr(key, Num.from(newValue));
  }

  public Value putAttr(String key, boolean newValue) {
    return putAttr(key, Bool.from(newValue));
  }

  public Value putSlot(Value key, Value newValue) {
    final ListIterator<Item> items = listIterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item instanceof Field && item.keyEquals(key)) {
        if (item instanceof Slot && item.isMutable()) {
          return ((Slot) item).setValue(newValue);
        } else {
          final Value oldValue = item.toValue();
          items.set(new Slot(key, newValue));
          return oldValue;
        }
      }
    }
    add(new Slot(key, newValue));
    return Value.absent();
  }

  public Value putSlot(Value key, String newValue) {
    return putSlot(key, Text.from(newValue));
  }

  public Value putSlot(Value key, int newValue) {
    return putSlot(key, Num.from(newValue));
  }

  public Value putSlot(Value key, long newValue) {
    return putSlot(key, Num.from(newValue));
  }

  public Value putSlot(Value key, float newValue) {
    return putSlot(key, Num.from(newValue));
  }

  public Value putSlot(Value key, double newValue) {
    return putSlot(key, Num.from(newValue));
  }

  public Value putSlot(Value key, boolean newValue) {
    return putSlot(key, Bool.from(newValue));
  }

  public Value putSlot(String key, Value newValue) {
    final ListIterator<Item> items = listIterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item instanceof Field && item.keyEquals(key)) {
        if (item instanceof Slot && item.isMutable()) {
          return ((Slot) item).setValue(newValue);
        } else {
          final Value oldValue = item.toValue();
          items.set(new Slot(Text.from(key), newValue));
          return oldValue;
        }
      }
    }
    add(new Slot(Text.from(key), newValue));
    return Value.absent();
  }

  public Value putSlot(String key, String newValue) {
    return putSlot(key, Text.from(newValue));
  }

  public Value putSlot(String key, int newValue) {
    return putSlot(key, Num.from(newValue));
  }

  public Value putSlot(String key, long newValue) {
    return putSlot(key, Num.from(newValue));
  }

  public Value putSlot(String key, float newValue) {
    return putSlot(key, Num.from(newValue));
  }

  public Value putSlot(String key, double newValue) {
    return putSlot(key, Num.from(newValue));
  }

  public Value putSlot(String key, boolean newValue) {
    return putSlot(key, Bool.from(newValue));
  }

  public void putAll(Map<? extends Value, ? extends Value> fields) {
    for (Map.Entry<? extends Value, ? extends Value> field : fields.entrySet()) {
      put(field.getKey(), field.getValue());
    }
  }

  /**
   * Replaces the member of this {@code Record} at the given {@code index} with
   * a new {@code item}, returning the previous {@code Item} at the given {@code
   * index}, if the {@code index} is greater than or equal to zero, and less
   * than the {@link #length() length} of this {@code Record}.  Equivalent to
   * {@link #setItem(int, Item)}.
   *
   * @throws UnsupportedOperationException if this is an immutable {@code Record}.
   * @throws IndexOutOfBoundsException     if the {@code index} is out of bounds.
   */
  @Override
  public Item set(int index, Item item) {
    return setItem(index, item);
  }

  /**
   * Replaces the member of this {@code Record} at the given {@code index} with
   * a new {@code item}, returning the previous {@code Item} at the given {@code
   * index}, if the {@code index} is greater than or equal to zero, and less
   * than the {@link #length() length} of this {@code Record}.
   *
   * @throws UnsupportedOperationException if this is an immutable {@code Record}.
   * @throws IndexOutOfBoundsException     if the {@code index} is out of bounds.
   */
  public abstract Item setItem(int index, Item item);

  /**
   * Replaces the member of this {@code Record} at the given {@code index} with
   * a {@link Text#from(String) Text} {@code value}, returning the previous
   * {@code Item} at the given {@code index}, if the {@code index} is greater
   * than or equal to zero, and less than the {@link #length() length} of this
   * {@code Record}.
   *
   * @throws UnsupportedOperationException if this is an immutable {@code Record}.
   * @throws IndexOutOfBoundsException     if the {@code index} is out of bounds.
   */
  public Item setItem(int index, String value) {
    return setItem(index, Text.from(value));
  }

  /**
   * Replaces the member of this {@code Record} at the given {@code index} with
   * a {@link Num#from(int) Num} {@code value}, returning the previous {@code
   * Item} at the given {@code index}, if the {@code index} is greater than or
   * equal to zero, and less than the {@link #length() length} of this {@code
   * Record}.
   *
   * @throws UnsupportedOperationException if this is an immutable {@code Record}.
   * @throws IndexOutOfBoundsException     if the {@code index} is out of bounds.
   */
  public Item setItem(int index, int value) {
    return setItem(index, Num.from(value));
  }

  /**
   * Replaces the member of this {@code Record} at the given {@code index} with
   * a {@link Num#from(long) Num} {@code value}, returning the previous
   * {@code Item} at the given {@code index}, if the {@code index} is greater
   * than or equal to zero, and less than the {@link #length() length} of this
   * {@code Record}.
   *
   * @throws UnsupportedOperationException if this is an immutable {@code Record}.
   * @throws IndexOutOfBoundsException     if the {@code index} is out of bounds.
   */
  public Item setItem(int index, long value) {
    return setItem(index, Num.from(value));
  }

  /**
   * Replaces the member of this {@code Record} at the given {@code index} with
   * a {@link Num#from(float) Num} {@code value}, returning the previous {@code
   * Item} at the given {@code index}, if the {@code index} is greater than or
   * equal to zero, and less than the {@link #length() length} of this {@code
   * Record}.
   *
   * @throws UnsupportedOperationException if this is an immutable {@code Record}.
   * @throws IndexOutOfBoundsException     if the {@code index} is out of bounds.
   */
  public Item setItem(int index, float value) {
    return setItem(index, Num.from(value));
  }

  /**
   * Replaces the member of this {@code Record} at the given {@code index} with
   * a {@link Num#from(double) Num} {@code value}, returning the previous
   * {@code Item} at the given {@code index}, if the {@code index} is greater
   * than or equal to zero, and less than the {@link #length() length} of this
   * {@code Record}.
   *
   * @throws UnsupportedOperationException if this is an immutable {@code Record}.
   * @throws IndexOutOfBoundsException     if the {@code index} is out of bounds.
   */
  public Item setItem(int index, double value) {
    return setItem(index, Num.from(value));
  }

  /**
   * Replaces the member of this {@code Record} at the given {@code index} with
   * a {@link Bool#from(boolean) Bool} {@code value}, returning the previous
   * {@code Item} at the given {@code index}, if the {@code index} is greater
   * than or equal to zero, and less than the {@link #length() length} of this
   * {@code Record}.
   *
   * @throws UnsupportedOperationException if this is an immutable {@code Record}.
   * @throws IndexOutOfBoundsException     if the {@code index} is out of bounds.
   */
  public Item setItem(int index, boolean value) {
    return setItem(index, Bool.from(value));
  }

  @Override
  public abstract boolean add(Item item);

  public boolean add(String item) {
    return add(Text.from(item));
  }

  public boolean add(int item) {
    return add(Num.from(item));
  }

  public boolean add(long item) {
    return add(Num.from(item));
  }

  public boolean add(float item) {
    return add(Num.from(item));
  }

  public boolean add(double item) {
    return add(Num.from(item));
  }

  public boolean add(boolean item) {
    return add(Bool.from(item));
  }

  @Override
  public abstract void add(int index, Item item);

  public void add(int index, String item) {
    add(index, Text.from(item));
  }

  public void add(int index, int item) {
    add(index, Num.from(item));
  }

  public void add(int index, long item) {
    add(index, Num.from(item));
  }

  public void add(int index, float item) {
    add(index, Num.from(item));
  }

  public void add(int index, double item) {
    add(index, Num.from(item));
  }

  public void add(int index, boolean item) {
    add(index, Bool.from(item));
  }

  @Override
  public boolean add(Value key, Value value) {
    return add(new Slot(key, value));
  }

  @Override
  public boolean addAll(Collection<? extends Item> items) {
    boolean changed = false;
    for (Item item : items) {
      add(item);
      changed = true;
    }
    return changed;
  }

  @Override
  public boolean addAll(int index, Collection<? extends Item> items) {
    boolean changed = false;
    for (Item item : items) {
      add(index, item);
      changed = true;
      index += 1;
    }
    return changed;
  }

  public Record attr(Text key, Value value) {
    add(new Attr(key, value));
    return this;
  }

  public Record attr(Text key, String value) {
    return attr(key, Text.from(value));
  }

  public Record attr(Text key, int value) {
    return attr(key, Num.from(value));
  }

  public Record attr(Text key, long value) {
    return attr(key, Num.from(value));
  }

  public Record attr(Text key, float value) {
    return attr(key, Num.from(value));
  }

  public Record attr(Text key, double value) {
    return attr(key, Num.from(value));
  }

  public Record attr(Text key, boolean value) {
    return attr(key, Bool.from(value));
  }

  public Record attr(Text key) {
    return attr(key, Value.extant());
  }

  public Record attr(String key, Value value) {
    return attr(Text.from(key), value);
  }

  public Record attr(String key, String value) {
    return attr(key, Text.from(value));
  }

  public Record attr(String key, int value) {
    return attr(key, Num.from(value));
  }

  public Record attr(String key, long value) {
    return attr(key, Num.from(value));
  }

  public Record attr(String key, float value) {
    return attr(key, Num.from(value));
  }

  public Record attr(String key, double value) {
    return attr(key, Num.from(value));
  }

  public Record attr(String key, boolean value) {
    return attr(key, Bool.from(value));
  }

  public Record attr(String key) {
    return attr(key, Value.extant());
  }

  public Record slot(Value key, Value value) {
    add(new Slot(key, value));
    return this;
  }

  public Record slot(Value key, String value) {
    return slot(key, Text.from(value));
  }

  public Record slot(Value key, int value) {
    return slot(key, Num.from(value));
  }

  public Record slot(Value key, long value) {
    return slot(key, Num.from(value));
  }

  public Record slot(Value key, float value) {
    return slot(key, Num.from(value));
  }

  public Record slot(Value key, double value) {
    return slot(key, Num.from(value));
  }

  public Record slot(Value key, boolean value) {
    return slot(key, Bool.from(value));
  }

  public Record slot(Value key) {
    return slot(key, Value.extant());
  }

  public Record slot(String key, Value value) {
    return slot(Text.from(key), value);
  }

  public Record slot(String key, String value) {
    return slot(key, Text.from(value));
  }

  public Record slot(String key, int value) {
    return slot(key, Num.from(value));
  }

  public Record slot(String key, long value) {
    return slot(key, Num.from(value));
  }

  public Record slot(String key, float value) {
    return slot(key, Num.from(value));
  }

  public Record slot(String key, double value) {
    return slot(key, Num.from(value));
  }

  public Record slot(String key, boolean value) {
    return slot(key, Bool.from(value));
  }

  public Record slot(String key) {
    return slot(key, Value.extant());
  }

  public Record item(Item item) {
    add(item);
    return this;
  }

  public Record item(String item) {
    return item(Text.from(item));
  }

  public Record item(int item) {
    return item(Num.from(item));
  }

  public Record item(long item) {
    return item(Num.from(item));
  }

  public Record item(float item) {
    return item(Num.from(item));
  }

  public Record item(double item) {
    return item(Num.from(item));
  }

  public Record item(boolean item) {
    return item(Bool.from(item));
  }

  @Override
  public abstract Item remove(int index);

  @Override
  public boolean remove(Object object) {
    final Item item = Item.fromObject(object);
    final int index = indexOf(item);
    if (index >= 0) {
      remove(index);
      return true;
    } else {
      return false;
    }
  }

  public boolean removeKey(Value key) {
    final Iterator<Item> items = iterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item.keyEquals(key)) {
        items.remove();
        return true;
      }
    }
    return false;
  }

  public boolean removeKey(String key) {
    final Iterator<Item> items = iterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item.keyEquals(key)) {
        items.remove();
        return true;
      }
    }
    return false;
  }

  @Override
  public boolean removeAll(Collection<?> items) {
    boolean modified = false;
    final Iterator<Item> iter = iterator();
    while (iter.hasNext()) {
      final Item item = iter.next();
      if (items.contains(item)) {
        iter.remove();
        modified = true;
      }
    }
    return modified;
  }

  @Override
  public boolean retainAll(Collection<?> items) {
    boolean modified = false;
    final Iterator<Item> iter = iterator();
    while (iter.hasNext()) {
      final Item item = iter.next();
      if (!items.contains(item)) {
        iter.remove();
        modified = true;
      }
    }
    return modified;
  }

  @Override
  public abstract void clear();

  @Override
  public Record updated(Value key, Value value) {
    final Record record = isMutable() ? this : branch();
    final ListIterator<Item> items = record.listIterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item.keyEquals(key)) {
        if (item instanceof Field && item.isMutable()) {
          ((Field) item).setValue(value);
        } else {
          items.set(new Slot(key, value));
        }
        return record;
      }
    }
    record.add(new Slot(key, value));
    return record;
  }

  @Override
  public Record updated(String key, Value value) {
    final Record record = isMutable() ? this : branch();
    final ListIterator<Item> items = record.listIterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item.keyEquals(key)) {
        if (item instanceof Field && item.isMutable()) {
          ((Field) item).setValue(value);
        } else {
          items.set(new Slot(Text.from(key), value));
        }
        return record;
      }
    }
    record.add(new Slot(Text.from(key), value));
    return record;
  }

  @Override
  public Record updatedAttr(Text key, Value value) {
    final Record record = isMutable() ? this : branch();
    final ListIterator<Item> items = record.listIterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item.keyEquals(key)) {
        if (item instanceof Attr && item.isMutable()) {
          ((Attr) item).setValue(value);
        } else {
          items.set(new Attr(key, value));
        }
        return record;
      }
    }
    record.add(new Attr(key, value));
    return record;
  }

  @Override
  public Record updatedAttr(String key, Value value) {
    final Record record = isMutable() ? this : branch();
    final ListIterator<Item> items = record.listIterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item.keyEquals(key)) {
        if (item instanceof Attr && item.isMutable()) {
          ((Attr) item).setValue(value);
        } else {
          items.set(new Attr(Text.from(key), value));
        }
        return record;
      }
    }
    record.add(new Attr(Text.from(key), value));
    return record;
  }

  @Override
  public Record updatedSlot(Value key, Value value) {
    final Record record = isMutable() ? this : branch();
    final ListIterator<Item> items = record.listIterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item.keyEquals(key)) {
        if (item instanceof Slot && item.isMutable()) {
          ((Slot) item).setValue(value);
        } else {
          items.set(new Slot(key, value));
        }
        return record;
      }
    }
    record.add(new Slot(key, value));
    return record;
  }

  @Override
  public Record updatedSlot(String key, Value value) {
    final Record record = isMutable() ? this : branch();
    final ListIterator<Item> items = record.listIterator();
    while (items.hasNext()) {
      final Item item = items.next();
      if (item.keyEquals(key)) {
        if (item instanceof Slot && item.isMutable()) {
          ((Slot) item).setValue(value);
        } else {
          items.set(new Slot(Text.from(key), value));
        }
        return record;
      }
    }
    record.add(new Slot(Text.from(key), value));
    return record;
  }

  @Override
  public Record appended(Item item) {
    final Record record = isMutable() ? this : branch();
    record.add(item);
    return record;
  }

  @Override
  public Record appended(Object... items) {
    final Record record = isMutable() ? this : branch();
    record.addAll(Record.of(items));
    return record;
  }

  @Override
  public Record prepended(Item item) {
    final Record record = isMutable() ? this : branch();
    record.add(0, item);
    return record;
  }

  @Override
  public Record prepended(Object... items) {
    final Record record = isMutable() ? this : branch();
    record.addAll(0, Record.of(items));
    return record;
  }

  @Override
  public Record removed(Value key) {
    final Record record = isMutable() ? this : branch();
    record.removeKey(key);
    return record;
  }

  @Override
  public Record removed(String key) {
    final Record record = isMutable() ? this : branch();
    record.removeKey(key);
    return record;
  }

  @Override
  public Record concat(Item that) {
    if (!that.isDefined()) {
      return branch();
    } else {
      final Record record = Record.create(this.length() + that.length());
      record.addAll(this);
      if (that instanceof Record) {
        record.addAll((Record) that);
      } else {
        record.add(that);
      }
      return record;
    }
  }

  @Override
  public Record evaluate(Interpreter interpreter) {
    final Record scope = Record.create();
    interpreter.pushScope(scope);
    boolean changed = false;
    for (Item oldItem : this) {
      final Item newItem = oldItem.evaluate(interpreter);
      if (newItem.isDefined()) {
        scope.add(newItem);
      }
      if (oldItem != newItem) {
        changed = true;
      }
    }
    interpreter.popScope();
    return changed ? scope : this;
  }

  @Override
  public Record substitute(Interpreter interpreter) {
    final Record scope = Record.create();
    interpreter.pushScope(scope);
    boolean changed = false;
    for (Item oldItem : this) {
      final Item newItem = oldItem.substitute(interpreter);
      if (newItem.isDefined()) {
        scope.add(newItem);
      }
      if (oldItem != newItem) {
        changed = true;
      }
    }
    interpreter.popScope();
    return changed ? scope : this;
  }

  @Override
  public String stringValue() {
    return stringValue(null);
  }

  @Override
  public String stringValue(String orElse) {
    final StringBuilder recordString = new StringBuilder();
    for (Item item : this) {
      if (item instanceof Value) {
        final String itemString = item.stringValue(null);
        if (itemString != null) {
          recordString.append(itemString);
          continue;
        }
      }
      return orElse;
    }
    return recordString.toString();
  }

  public boolean isAliased() {
    return false;
  }

  public boolean isMutable() {
    return true;
  }

  public void alias() {
    // nop
  }

  @Override
  public Record branch() {
    final Record branch = Record.create();
    branch.addAll(this);
    return branch;
  }

  @Override
  public Record commit() {
    return this;
  }

  @Override
  public Record bind() {
    return this;
  }

  @Override
  public Item[] toArray() {
    final int n = size();
    final Item[] array = new Item[n];
    final Iterator<Item> items = iterator();
    int i = 0;
    while (items.hasNext()) {
      array[i] = items.next();
      i += 1;
    }
    return array;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T[] toArray(T[] array) {
    final int n = size();
    if (array.length < n) {
      array = (T[]) Array.newInstance(array.getClass().getComponentType(), n);
    }
    final Iterator<Item> items = iterator();
    int i = 0;
    while (items.hasNext()) {
      array[i] = (T) items.next();
      i += 1;
    }
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  @Override
  public Record subList(int fromIndex, int toIndex) {
    final Iterator<Item> items = iterator();
    final Record record = Record.create();
    int index = 0;
    while (items.hasNext()) {
      if (index >= fromIndex && index < toIndex) {
        record.add(items.next());
      } else if (index >= toIndex) {
        break;
      }
      index += 1;
    }
    return record;
  }

  @SuppressWarnings("unchecked")
  public Set<Map.Entry<Value, Value>> entrySet() {
    return (Set<Map.Entry<Value, Value>>) (Set<?>) fieldSet();
  }

  public Set<Field> fieldSet() {
    return new RecordFieldSet(this);
  }

  public Set<Value> keySet() {
    return new RecordKeySet(this);
  }

  public Collection<Value> values() {
    return new RecordValues(this);
  }

  @Override
  public Iterator<Item> iterator() {
    return new RecordIterator(this);
  }

  @Override
  public ListIterator<Item> listIterator() {
    return new RecordIterator(this);
  }

  @Override
  public ListIterator<Item> listIterator(int index) {
    if (index < 0 || index > size()) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return new RecordIterator(this, index);
  }

  public Iterator<Value> keyIterator() {
    return new RecordKeyIterator(iterator());
  }

  public Iterator<Value> valueIterator() {
    return new RecordValueIterator(iterator());
  }

  public Iterator<Field> fieldIterator() {
    return new RecordFieldIterator(iterator());
  }

  @Override
  public int typeOrder() {
    return 3;
  }

  @Override
  public int compareTo(Item other) {
    if (other instanceof Record) {
      return compareTo((Record) other);
    }
    return Integer.compare(typeOrder(), other.typeOrder());
  }

  public int compareTo(Record that) {
    final Iterator<Item> xs = iterator();
    final Iterator<Item> ys = that.iterator();
    int order = 0;
    do {
      if (xs.hasNext() && ys.hasNext()) {
        order = xs.next().compareTo(ys.next());
      } else {
        break;
      }
    } while (order == 0);
    if (order != 0) {
      return order;
    } else if (!xs.hasNext() && ys.hasNext()) {
      return -1;
    } else if (xs.hasNext() && !ys.hasNext()) {
      return 1;
    } else {
      return 0;
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof List<?>) {
      final List<?> that = (List<?>) other;
      final Iterator<Item> xs = iterator();
      final Iterator<?> ys = that.iterator();
      while (xs.hasNext() && ys.hasNext()) {
        if (!xs.next().equals(ys.next())) {
          return false;
        }
      }
      return !xs.hasNext() && !ys.hasNext();
    }
    return false;
  }

  @Override
  public int hashCode() {
    int code = 1;
    for (Item item : this) {
      code = 31 * code + item.hashCode();
    }
    return code;
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Record").write('.');
    if (isEmpty()) {
      output = output.write("empty").write('(').write(')');
    } else {
      final Iterator<Item> items = iterator();
      output = output.write("of").write('(').display(items.next());
      while (items.hasNext()) {
        output = output.write(", ").display(items.next());
      }
      output = output.write(')');
    }
  }

  static final int ALIASED = 1 << 0;
  static final int IMMUTABLE = 1 << 1;

  protected static final AtomicIntegerFieldUpdater<Record> FLAGS =
      AtomicIntegerFieldUpdater.newUpdater(Record.class, "flags");

  public static Record empty() {
    return RecordMap.empty();
  }

  public static Record create() {
    return RecordMap.create();
  }

  public static Record create(int initialSize) {
    return RecordMap.create(initialSize);
  }

  public static Record of() {
    return RecordMap.of();
  }

  public static Record of(Object object) {
    return RecordMap.of(object);
  }

  public static Record of(Object... objects) {
    return RecordMap.of(objects);
  }

  static int expand(int n) {
    n = Math.max(8, n) - 1;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
  }
}
