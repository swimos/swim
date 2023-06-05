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

import java.util.AbstractCollection;
import java.util.AbstractMap.SimpleImmutableEntry;
import java.util.AbstractSet;
import java.util.Collection;
import java.util.ConcurrentModificationException;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.UpdatableMap;

@Public
@Since("5.0")
public final class TupleRepr implements Repr, UpdatableMap<String, Repr>, Iterable<Map.Entry<String, Repr>>, ToSource {

  int flags;
  Attrs attrs;
  TupleShape shape;
  Repr[] slots;

  TupleRepr(int flags, Attrs attrs, TupleShape shape, Repr[] slots) {
    this.flags = flags;
    this.attrs = attrs;
    this.shape = shape;
    this.slots = slots;
  }

  @Override
  public Attrs attrs() {
    return this.attrs;
  }

  @Override
  public void setAttrs(Attrs attrs) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    this.attrs = attrs;
  }

  @Override
  public TupleRepr letAttrs(Attrs attrs) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      return this.withAttrs(attrs);
    }
    this.attrs = attrs;
    return this;
  }

  @Override
  public TupleRepr letAttr(String key, Repr value) {
    return this.letAttrs(this.attrs.let(key, value));
  }

  @Override
  public TupleRepr letAttr(String key) {
    return this.letAttr(key, Repr.unit());
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public TupleRepr withAttrs(Attrs attrs) {
    if (attrs == this.attrs) {
      return this;
    } else if (this.shape.size < 0 || this.shape.size >= 4) {
      this.flags |= ALIASED_FLAG;
    }
    return new TupleRepr(this.flags & ~IMMUTABLE_FLAG, attrs, this.shape, this.slots);
  }

  @Override
  public TupleRepr withAttr(String key, Repr value) {
    return this.withAttrs(this.attrs.updated(key, value));
  }

  @Override
  public TupleRepr withAttr(String key) {
    return this.withAttr(key, Repr.unit());
  }

  public TupleShape shape() {
    return this.shape;
  }

  public boolean isArray() {
    return this.shape.rank == 0;
  }

  @Override
  public boolean isDistinct() {
    return this.shape.size != 0;
  }

  @Override
  public boolean isEmpty() {
    return this.shape.size == 0;
  }

  @Override
  public int size() {
    return this.shape.size;
  }

  @Override
  public boolean containsKey(@Nullable Object key) {
    return this.get(key) != null;
  }

  @Override
  public boolean containsValue(@Nullable Object value) {
    final int size = this.shape.size;
    if (size == 0 || !(value instanceof Repr)) {
      return false;
    }
    final Repr[] slots = this.slots;
    for (int i = 0; i < size; i += 1) {
      if (value.equals(slots[i])) {
        return true;
      }
    }
    return false;
  }

  @Override
  public @Nullable Repr get(@Nullable Object key) {
    if (this.shape.size == 0 || !(key instanceof String)) {
      return null;
    }
    final int index = this.shape.lookup((String) key);
    if (index < 0) {
      return null;
    }
    return this.slots[index];
  }

  public Repr get(String key) {
    Repr value = this.get((Object) key);
    if (value == null) {
      value = Repr.undefined();
    }
    return value;
  }

  @Override
  public Repr getOrDefault(@Nullable Object key, Repr defaultValue) {
    Repr value = this.get(key);
    if (value == null) {
      value = defaultValue;
    }
    return value;
  }

  public Map.Entry<String, Repr> getEntry(int index) {
    if (index < 0 || index >= this.shape.size) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    final String key = this.shape.fields()[index].key;
    final Repr value = this.slots[index];
    return new SimpleImmutableEntry<String, Repr>(key, value);
  }

  public @Nullable String getKey(int index) {
    if (index < 0 || index >= this.shape.size) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return this.shape.fields()[index].key;
  }

  public Repr getValue(int index) {
    if (index < 0 || index >= this.shape.size) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return this.slots[index];
  }

  @Override
  public @Nullable Repr put(String key, Repr value) {
    Objects.requireNonNull(key, "key");
    Objects.requireNonNull(value, "value");
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final TupleShape shape = this.shape;
    final Repr[] slots = this.slots;
    final int index = shape.lookup(key);
    if (index >= 0) {
      final Repr oldValue = slots[index];
      if (value != oldValue) {
        if ((this.flags & ALIASED_FLAG) != 0) {
          final Repr[] newSlots = new Repr[TupleShape.expand(shape.size)];
          System.arraycopy(slots, 0, newSlots, 0, shape.size);
          this.slots = newSlots;
          this.flags &= ~ALIASED_FLAG;
        }
        slots[index] = value;
      }
      return oldValue;
    }

    final TupleShape newShape = shape.getChild(key);
    if (slots.length >= newShape.size && (this.flags & ALIASED_FLAG) == 0) {
      slots[newShape.size - 1] = value;
    } else {
      final Repr[] newSlots = new Repr[TupleShape.expand(newShape.size)];
      System.arraycopy(slots, 0, newSlots, 0, shape.size);
      newSlots[newShape.size - 1] = value;
      this.slots = newSlots;
      this.flags &= ~ALIASED_FLAG;
    }
    this.shape = newShape;
    return null;
  }

  @Override
  public @Nullable Repr putIfAbsent(String key, Repr value) {
    Objects.requireNonNull(key, "key");
    Objects.requireNonNull(value, "value");
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final TupleShape shape = this.shape;
    final Repr[] slots = this.slots;
    final int index = shape.lookup(key);
    if (index >= 0) {
      return slots[index];
    }

    final TupleShape newShape = shape.getChild(key);
    if (slots.length >= newShape.size && (this.flags & ALIASED_FLAG) == 0) {
      slots[newShape.size - 1] = value;
    } else {
      final Repr[] newSlots = new Repr[TupleShape.expand(newShape.size)];
      System.arraycopy(slots, 0, newSlots, 0, shape.size);
      newSlots[newShape.size - 1] = value;
      this.slots = newSlots;
      this.flags &= ~ALIASED_FLAG;
    }
    this.shape = newShape;
    return null;
  }

  @Override
  public void putAll(Map<? extends String, ? extends Repr> map) {
    for (Map.Entry<? extends String, ? extends Repr> entry : map.entrySet()) {
      this.put(entry.getKey(), entry.getValue());
    }
  }

  @Override
  public TupleRepr updated(@Nullable String key, @Nullable Repr value) {
    Objects.requireNonNull(key, "key");
    Objects.requireNonNull(value, "value");
    final TupleShape shape = this.shape;
    final Repr[] slots = this.slots;
    final int index = shape.lookup(key);
    if (index >= 0) {
      if (value == slots[index]) {
        return this;
      } else {
        final Repr[] newSlots = new Repr[TupleShape.expand(shape.size)];
        System.arraycopy(slots, 0, newSlots, 0, shape.size);
        slots[index] = value;
        return new TupleRepr(0, this.attrs, shape, newSlots);
      }
    }

    final TupleShape newShape = shape.getChild(key);
    final Repr[] newSlots = new Repr[TupleShape.expand(newShape.size)];
    System.arraycopy(slots, 0, newSlots, 0, shape.size);
    newSlots[newShape.size - 1] = value;
    return new TupleRepr(0, this.attrs, newShape, newSlots);
  }

  public TupleRepr let(String key, Repr value) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      return this.updated(key, value);
    }
    this.put(key, value);
    return this;
  }

  public TupleRepr letAll(Map<? extends String, ? extends Repr> map) {
    TupleRepr tuple = this;
    for (Map.Entry<? extends String, ? extends Repr> entry : map.entrySet()) {
      tuple = tuple.let(entry.getKey(), entry.getValue());
    }
    return tuple;
  }

  public Repr set(int index, Repr value) {
    Objects.requireNonNull(value);
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    } else if (index < 0 || index >= this.shape.size) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    final Repr oldValue = this.slots[index];
    this.slots[index] = value;
    return oldValue;
  }

  public boolean add(Repr value) {
    Objects.requireNonNull(value);
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final TupleShape shape = this.shape;
    final Repr[] slots = this.slots;
    final TupleShape newShape = shape.getChild(null);
    if (slots.length >= newShape.size && (this.flags & ALIASED_FLAG) == 0) {
      slots[newShape.size - 1] = value;
    } else {
      final Repr[] newSlots = new Repr[TupleShape.expand(newShape.size)];
      System.arraycopy(slots, 0, newSlots, 0, shape.size);
      newSlots[newShape.size - 1] = value;
      this.slots = newSlots;
      this.flags &= ~ALIASED_FLAG;
    }
    this.shape = newShape;
    return true;
  }

  public boolean addAll(Collection<? extends Repr> values) {
    Objects.requireNonNull(values);
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final int k = values.size();
    if (k == 0) {
      return false;
    }
    final TupleShape shape = this.shape;
    Repr[] slots = this.slots;
    if (shape.size + k > slots.length || (this.flags & ALIASED_FLAG) != 0) {
      final Repr[] newSlots = new Repr[TupleShape.expand(shape.size + k)];
      System.arraycopy(slots, 0, newSlots, 0, shape.size);
      slots = newSlots;
      this.slots = slots;
      this.flags &= ~ALIASED_FLAG;
    }
    TupleShape newShape = shape;
    for (Repr value : values) {
      newShape = newShape.getChild(null);
      slots[newShape.size - 1] = value;
    }
    this.shape = newShape;
    return true;
  }

  public TupleRepr appended(Repr value) {
    Objects.requireNonNull(value);
    final TupleShape shape = this.shape;
    final Repr[] slots = this.slots;
    final TupleShape newShape = shape.getChild(null);
    final Repr[] newSlots = new Repr[TupleShape.expand(newShape.size)];
    System.arraycopy(slots, 0, newSlots, 0, shape.size);
    newSlots[shape.size] = value;
    return new TupleRepr(0, this.attrs, newShape, newSlots);
  }

  @Override
  public @Nullable Repr remove(@Nullable Object key) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final TupleShape shape = this.shape;
    if (shape.size == 0 || !(key instanceof String)) {
      return null;
    }
    final int index = shape.lookup((String) key);
    if (index < 0) {
      // No matching key was found.
      return null;
    }

    final Repr[] slots = this.slots;
    final Repr oldValue = slots[index];
    if ((this.flags & ALIASED_FLAG) != 0) {
      // Dealias the remaining value slots, excluding the removed value.
      final Repr[] newSlots = new Repr[TupleShape.expand(shape.size - 1)];
      System.arraycopy(slots, 0, newSlots, 0, index);
      System.arraycopy(slots, index + 1, newSlots, index, shape.size - index - 1);
      this.slots = newSlots;
      this.flags &= ~ALIASED_FLAG;
    } else {
      // Shift the trailing slots forward, overwriting the removed value.
      System.arraycopy(slots, index + 1, slots, index, shape.size - index - 1);
      slots[shape.size - 1] = null;
    }
    // Update the tuple shape to reflect the removed field.
    if (index == shape.size - 1) {
      // The leaf field of the shape was removed; revert to the parent shape.
      this.shape = Assume.nonNull(shape.parent);
    } else {
      // A non-leaf field of the shape was removed.
      // Rebuild the tuple shape, excluding the removed key.
      TupleShape newShape = TupleShape.empty();
      final TupleShape[] fields = shape.fields();
      for (int i = 0; i < fields.length; i += 1) {
        if (i != index) {
          newShape = newShape.getChild(fields[i].key);
        }
      }
      this.shape = newShape;
    }
    return oldValue;
  }

  @Override
  public TupleRepr removed(@Nullable Object key) {
    final TupleShape shape = this.shape;
    if (shape.size == 0 || !(key instanceof String)) {
      return this;
    }
    final int index = shape.lookup((String) key);
    if (index < 0) {
      // No matching key was found.
      return this;
    }

    final Repr[] slots = this.slots;
    // Clone the remaining value slots, excluding the removed value.
    final Repr[] newSlots = new Repr[TupleShape.expand(shape.size - 1)];
    System.arraycopy(slots, 0, newSlots, 0, index);
    System.arraycopy(slots, index + 1, newSlots, index, shape.size - index - 1);
    // Update the tuple shape to reflect the removed field.
    TupleShape newShape;
    if (index == shape.size - 1) {
      // The leaf field of the shape was removed; revert to the parent shape.
      newShape = Assume.nonNull(shape.parent);
    } else {
      // A non-leaf field of the shape was removed.
      // Rebuild the tuple shape, excluding the removed key.
      newShape = TupleShape.empty();
      final TupleShape[] fields = shape.fields();
      for (int i = 0; i < fields.length; i += 1) {
        if (i != index) {
          newShape = newShape.getChild(fields[i].key);
        }
      }
    }
    return new TupleRepr(0, this.attrs, newShape, newSlots);
  }

  public Repr remove(int index) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final TupleShape shape = this.shape;
    if (index < 0 || index >= shape.size) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }

    final Repr[] slots = this.slots;
    final Repr oldValue = slots[index];
    if ((this.flags & ALIASED_FLAG) != 0) {
      // Dealias the remaining value slots, excluding the removed value.
      final Repr[] newSlots = new Repr[TupleShape.expand(shape.size - 1)];
      System.arraycopy(slots, 0, newSlots, 0, index);
      System.arraycopy(slots, index + 1, newSlots, index, shape.size - index - 1);
      this.slots = newSlots;
      this.flags &= ~ALIASED_FLAG;
    } else {
      // Shift the trailing slots forward, overwriting the removed value.
      System.arraycopy(slots, index + 1, slots, index, shape.size - index - 1);
      slots[shape.size - 1] = null;
    }
    // Update the tuple shape to reflect the removed value.
    if (index == shape.size - 1) {
      // The leaf field of the shape was removed; revert to the parent shape.
      this.shape = Assume.nonNull(shape.parent);
    } else {
      // A non-leaf field of the shape was removed.
      // Rebuild the tuple shape, excluding the removed key.
      TupleShape newShape = TupleShape.empty();
      final TupleShape[] fields = shape.fields();
      for (int i = 0; i < fields.length; i += 1) {
        if (i != index) {
          newShape = newShape.getChild(fields[i].key);
        }
      }
      this.shape = newShape;
    }
    return oldValue;
  }

  public TupleRepr removed(int index) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final TupleShape shape = this.shape;
    if (index < 0 || index >= shape.size) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }

    final Repr[] slots = this.slots;
    // Clone the remaining value slots, excluding the removed value.
    final Repr[] newSlots = new Repr[TupleShape.expand(shape.size - 1)];
    System.arraycopy(slots, 0, newSlots, 0, index);
    System.arraycopy(slots, index + 1, newSlots, index, shape.size - index - 1);
    // Update the tuple shape to reflect the removed field.
    TupleShape newShape;
    if (index == shape.size - 1) {
      // The leaf field of the shape was removed; revert to the parent shape.
      newShape = Assume.nonNull(shape.parent);
    } else {
      // A non-leaf field of the shape was removed.
      // Rebuild the tuple shape, excluding the removed key.
      newShape = TupleShape.empty();
      final TupleShape[] fields = shape.fields();
      for (int i = 0; i < fields.length; i += 1) {
        if (i != index) {
          newShape = newShape.getChild(fields[i].key);
        }
      }
    }
    return new TupleRepr(0, this.attrs, newShape, newSlots);
  }

  @Override
  public void clear() {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    this.shape = TupleShape.empty();
    this.slots = EMPTY_SLOTS;
    this.flags |= ALIASED_FLAG;
  }

  public int indexOf(@Nullable String key) {
    if (key == null) {
      return -1;
    }
    return this.shape.lookup(key);
  }

  @Override
  public boolean isMutable() {
    return (this.flags & IMMUTABLE_FLAG) == 0;
  }

  public TupleRepr asMutable() {
    return this.isMutable() ? this : this.clone();
  }

  @Override
  public TupleRepr clone() {
    this.flags |= ALIASED_FLAG;
    return new TupleRepr(this.flags & ~IMMUTABLE_FLAG, this.attrs, this.shape, this.slots);
  }

  @Override
  public TupleRepr commit() {
    if ((this.flags & IMMUTABLE_FLAG) == 0) {
      this.flags |= IMMUTABLE_FLAG;
      this.attrs.commit();
      final Repr[] slots = this.slots;
      for (int i = 0; i < this.shape.size; i += 1) {
        slots[i].commit();
      }
    }
    return this;
  }

  @Override
  public void forEach(BiConsumer<? super String, ? super Repr> action) {
    final TupleShape[] fields = this.shape.fields();
    final Repr[] slots = this.slots;
    for (int i = 0; i < fields.length; i += 1) {
      final TupleShape field = fields[i];
      final String key = field.key;
      final Repr value = slots[field.size - 1];
      action.accept(key, value);
    }
  }

  @Override
  public void forEach(Consumer<? super Map.Entry<String, Repr>> action) {
    final TupleShape[] fields = this.shape.fields();
    final Repr[] slots = this.slots;
    for (int i = 0; i < fields.length; i += 1) {
      final TupleShape field = fields[i];
      final String key = field.key;
      final Repr value = slots[field.size - 1];
      action.accept(new SimpleImmutableEntry<String, Repr>(key, value));
    }
  }

  @Override
  public Iterator<Map.Entry<String, Repr>> iterator() {
    return new TupleReprEntryIterator(this);
  }

  public Iterator<String> keyIterator() {
    return new TupleReprKeyIterator(this);
  }

  public Iterator<Repr> valueIterator() {
    return new TupleReprValueIterator(this);
  }

  @Override
  public Set<Map.Entry<String, Repr>> entrySet() {
    return new TupleReprEntrySet(this);
  }

  @Override
  public Set<String> keySet() {
    return new TupleReprKeySet(this);
  }

  @Override
  public Collection<Repr> values() {
    return new TupleReprValues(this);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map<?, ?> that) {
      return this.entrySet().equals(that.entrySet());
    }
    return false;
  }

  @Override
  public int hashCode() {
    int code = 0;
    for (Map.Entry<String, Repr> entry : this) {
      code += entry.hashCode();
    }
    return code;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.shape.size == 0 && (this.flags & IMMUTABLE_FLAG) != 0) {
      notation.beginInvoke("TupleRepr", "empty").endInvoke();
    } else {
      notation.beginInvoke("TupleRepr", "of");
      for (Map.Entry<String, Repr> entry : this) {
        notation.appendArgument(entry.getKey())
                .appendArgument(entry.getValue());
      }
      notation.endInvoke();
    }
    if (!this.attrs.isEmpty()) {
      this.attrs.writeWithAttrs(notation);
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final int IMMUTABLE_FLAG = 1 << 0;

  static final int ALIASED_FLAG = 1 << 1;

  static final Repr[] EMPTY_SLOTS = new Repr[0];

  static final TupleRepr EMPTY = new TupleRepr(IMMUTABLE_FLAG, Attrs.empty(),
                                               TupleShape.empty(), EMPTY_SLOTS);

  public static TupleRepr empty() {
    return EMPTY;
  }

  public static TupleRepr of() {
    return new TupleRepr(0, Attrs.empty(), TupleShape.empty(), EMPTY_SLOTS);
  }

  public static TupleRepr of(@Nullable String key, Repr value) {
    final Repr[] slots = new Repr[] {value};
    final TupleShape shape = TupleShape.empty().getChild(key);
    return new TupleRepr(0, Attrs.empty(), shape, slots);
  }

  public static TupleRepr of(@Nullable String key0, Repr value0,
                             @Nullable String key1, Repr value1) {
    final Repr[] slots = new Repr[] {value0, value1};
    final TupleShape shape = TupleShape.empty().getChild(key0).getChild(key1);
    return new TupleRepr(0, Attrs.empty(), shape, slots);
  }

  public static TupleRepr of(@Nullable String key0, Repr value0,
                             @Nullable String key1, Repr value1,
                             @Nullable String key2, Repr value2) {
    final Repr[] slots = new Repr[] {value0, value1, value2};
    final TupleShape shape = TupleShape.empty().getChild(key0).getChild(key1)
                                               .getChild(key2);
    return new TupleRepr(0, Attrs.empty(), shape, slots);
  }

  public static TupleRepr of(@Nullable String key0, Repr value0,
                             @Nullable String key1, Repr value1,
                             @Nullable String key2, Repr value2,
                             @Nullable String key3, Repr value3) {
    final Repr[] slots = new Repr[] {value0, value1, value2, value3};
    final TupleShape shape = TupleShape.empty().getChild(key0).getChild(key1)
                                               .getChild(key2).getChild(key3);
    return new TupleRepr(0, Attrs.empty(), shape, slots);
  }

  public static TupleRepr of(@Nullable Object... keyValuePairs) {
    keyValuePairs = Assume.nonNull(keyValuePairs);
    if (keyValuePairs.length % 2 != 0) {
      throw new IllegalArgumentException("odd number of key-value pairs");
    }
    final Repr[] slots = new Repr[keyValuePairs.length >>> 1];
    TupleShape shape = TupleShape.empty();
    for (int i = 0; i < keyValuePairs.length; i += 2) {
      final String key = (String) keyValuePairs[i];
      final Repr value = (Repr) keyValuePairs[i + 1];
      if (value == null) {
        throw new NullPointerException("value " + (i >>> 1));
      }
      shape = shape.getChild(key);
      slots[shape.size - 1] = value;
    }
    return new TupleRepr(0, Attrs.empty(), shape, slots);
  }

}

final class TupleEntry implements Map.Entry<String, Repr> {

  final String key;
  Repr value;
  @Nullable TupleEntry prev;
  @Nullable TupleEntry next;
  @Nullable TupleEntry nextCollision;

  TupleEntry(String key, Repr value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
    this.nextCollision = null;
  }

  @Override
  public String getKey() {
    return this.key;
  }

  @Override
  public Repr getValue() {
    return this.value;
  }

  @Override
  public Repr setValue(Repr value) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map.Entry<?, ?> that) {
      return this.key.equals(that.getKey()) && this.value.equals(that.getValue());
    }
    return false;
  }

  @Override
  public int hashCode() {
    return this.key.hashCode() ^ this.value.hashCode();
  }

}

final class TupleReprEntryIterator implements Iterator<Map.Entry<String, Repr>> {

  final TupleRepr repr;
  final TupleShape shape;
  final TupleShape[] fields;
  int index;

  TupleReprEntryIterator(TupleRepr repr) {
    this.repr = repr;
    this.shape = repr.shape;
    this.fields = this.shape.fields();
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.fields.length;
  }

  @Override
  public Map.Entry<String, Repr> next() {
    final int index = this.index;
    if (index >= this.fields.length) {
      throw new NoSuchElementException();
    } else if (this.repr.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    final String key = this.fields[index].key;
    final Repr value = this.repr.slots[index];
    return new SimpleImmutableEntry<String, Repr>(key, value);
  }

}

final class TupleReprEntrySet extends AbstractSet<Map.Entry<String, Repr>> {

  final TupleRepr repr;

  TupleReprEntrySet(TupleRepr repr) {
    this.repr = repr;
  }

  @Override
  public int size() {
    return this.repr.size();
  }

  @Override
  public Iterator<Map.Entry<String, Repr>> iterator() {
    return this.repr.iterator();
  }

}

final class TupleReprKeyIterator implements Iterator<String> {

  final TupleRepr repr;
  final TupleShape shape;
  final TupleShape[] fields;
  int index;

  TupleReprKeyIterator(TupleRepr repr) {
    this.repr = repr;
    this.shape = repr.shape;
    this.fields = this.shape.fields();
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.fields.length;
  }

  @Override
  public String next() {
    final int index = this.index;
    if (index >= this.fields.length) {
      throw new NoSuchElementException();
    } else if (this.repr.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    return Assume.nonNull(this.fields[index].key);
  }

}

final class TupleReprKeySet extends AbstractSet<String> {

  final TupleRepr repr;

  TupleReprKeySet(TupleRepr repr) {
    this.repr = repr;
  }

  @Override
  public int size() {
    return this.repr.size();
  }

  @Override
  public Iterator<String> iterator() {
    return this.repr.keyIterator();
  }

}

final class TupleReprValueIterator implements Iterator<Repr> {

  final TupleRepr repr;
  final TupleShape shape;
  int index;

  TupleReprValueIterator(TupleRepr repr) {
    this.repr = repr;
    this.shape = repr.shape;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.shape.size;
  }

  @Override
  public Repr next() {
    final int index = this.index;
    if (index >= this.shape.size) {
      throw new NoSuchElementException();
    } else if (this.repr.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    return this.repr.slots[index];
  }

}

final class TupleReprValues extends AbstractCollection<Repr> {

  final TupleRepr repr;

  TupleReprValues(TupleRepr repr) {
    this.repr = repr;
  }

  @Override
  public int size() {
    return this.repr.size();
  }

  @Override
  public Iterator<Repr> iterator() {
    return this.repr.valueIterator();
  }

}
