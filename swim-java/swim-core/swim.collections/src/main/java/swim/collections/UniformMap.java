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

package swim.collections;

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

/**
 * A space-optimized map with insertion order iteration. {@code UniformMap}
 * uses one of three internal representations, depending on size and usage:
 * <ul>
 *   <li><strong>Inline</strong>: up to 3 values can be stored in the
 *       {@code UniformMap} instance itself, with insertion-ordered keys
 *       stored in a globally shared {@code UniformShape}.
 *   <li><strong>Packed</strong>: up to 32 values can be stored in an
 *       internal array, with insertion-ordered keys and a hashtable for
 *       fast lookups stored in a globally shared {@code UniformShape}
 *   <li><strong>Linked</strong>: maps with more than 32 entries, and maps
 *       which have deleted keys, are stored in an insertion-ordered doubly
 *       linked list, with a per-instance hashtable for fast lookups.
 * </ul>
 */
@Public
@Since("5.0")
public final class UniformMap<K, V> implements UpdatableMap<K, V>, Iterable<Map.Entry<K, V>>, ToSource {

  int flags;
  int size;
  UniformShape<K, V> shape;
  @Nullable Object slots; // UniformEntry<K, V>[] | V[] | V | null
  @Nullable Object head; // UniformEntry<K, V> | V | null
  @Nullable Object foot; // UniformEntry<K, V> | V | null

  UniformMap(int flags, int size, UniformShape<K, V> shape, @Nullable Object slots,
             @Nullable Object head, @Nullable Object foot) {
    this.flags = flags;
    this.size = size;
    this.shape = shape;
    this.slots = slots;
    this.head = head;
    this.foot = foot;
  }

  public UniformMap() {
    this(0, 0, UniformShape.empty(), null, null, null);
  }

  public UniformShape<K, V> shape() {
    return this.shape;
  }

  @Override
  public boolean isEmpty() {
    return this.size == 0;
  }

  @Override
  public int size() {
    return this.size;
  }

  @Override
  public boolean containsKey(@Nullable Object key) {
    return this.get(key) != null;
  }

  @Override
  public boolean containsValue(@Nullable Object value) {
    if (this.shape.size == 0) {
      return false;
    } else if (this.shape.size < 0) {
      return this.containsValueLinked(value);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.containsValuePacked(value);
    } else {
      return this.containsValueInline(value);
    }
  }

  private boolean containsValueInline(@Nullable Object value) {
    return (this.shape.size > 0 && Objects.equals(value, Assume.<V>conformsNullable(this.slots)))
        || (this.shape.size > 1 && Objects.equals(value, Assume.<V>conformsNullable(this.head)))
        || (this.shape.size > 2 && Objects.equals(value, Assume.<V>conformsNullable(this.foot)));
  }

  private boolean containsValuePacked(@Nullable Object value) {
    final V[] slots = Assume.<V[]>conformsNonNull(this.slots);
    for (int i = 0; i < this.shape.size; i += 1) {
      if (Objects.equals(value, slots[i])) {
        return true;
      }
    }
    return false;
  }

  private boolean containsValueLinked(@Nullable Object value) {
    UniformEntry<K, V> entry = Assume.<UniformEntry<K, V>>conformsNullable(this.head);
    while (entry != null) {
      if (Objects.equals(value, entry.value)) {
        return true;
      }
      entry = entry.next;
    }
    return false;
  }

  @Override
  public @Nullable V get(@Nullable Object key) {
    if (this.shape.size == 0 || key == null) {
      return null;
    } else if (this.shape.size < 0) {
      return this.getLinked(key);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.getPacked(key);
    } else {
      return this.getInline(key);
    }
  }

  private @Nullable V getInline(Object key) {
    final UniformShape<K, V>[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final UniformShape<K, V> field = fields[i];
      if (!key.equals(field.key)) {
        continue;
      }
      switch (field.size - 1) {
        case 0:
          return Assume.<V>conformsNullable(this.slots);
        case 1:
          return Assume.<V>conformsNullable(this.head);
        case 2:
          return Assume.<V>conformsNullable(this.foot);
        default:
          throw new AssertionError(Integer.toString(field.size - 1));
      }
    }
    return null;
  }

  private @Nullable V getPacked(Object key) {
    final int index = this.shape.lookup(key);
    if (index < 0) {
      return null;
    }
    return Assume.<V[]>conformsNonNull(this.slots)[index];
  }

  private @Nullable V getLinked(Object key) {
    final UniformEntry<K, V> entry = this.getEntry(key.hashCode(), key);
    if (entry == null) {
      return null;
    }
    return entry.value;
  }

  @Override
  public V getOrDefault(@Nullable Object key, V defaultValue) {
    V value = this.get(key);
    if (value == null) {
      value = defaultValue;
    }
    return value;
  }

  @Override
  public @Nullable V put(K key, @Nullable V value) {
    Objects.requireNonNull(key, "key");
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if (this.shape.size < 0) {
      return this.putLinked(key, value, false);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.putPacked(key, value, false);
    } else {
      return this.putInline(key, value, false);
    }
  }

  @Override
  public @Nullable V putIfAbsent(K key, @Nullable V value) {
    Objects.requireNonNull(key, "key");
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if (this.shape.size < 0) {
      return this.putLinked(key, value, true);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.putPacked(key, value, true);
    } else {
      return this.putInline(key, value, true);
    }
  }

  private @Nullable V putInline(K key, @Nullable V value, boolean ifAbsent) {
    final UniformShape<K, V>[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final UniformShape<K, V> field = fields[i];
      if (!key.equals(field.key)) {
        continue;
      }
      final V oldValue;
      switch (field.size - 1) {
        case 0:
          oldValue = Assume.<V>conformsNullable(this.slots);
          if (!ifAbsent) {
            this.slots = value;
          }
          break;
        case 1:
          oldValue = Assume.<V>conformsNullable(this.head);
          if (!ifAbsent) {
            this.head = value;
          }
          break;
        case 2:
          oldValue = Assume.<V>conformsNullable(this.foot);
          if (!ifAbsent) {
            this.foot = value;
          }
          break;
        default:
          throw new AssertionError(Integer.toString(field.size - 1));
      }
      return oldValue;
    }

    final UniformShape<K, V> newShape = this.shape.getChild(key);
    switch (newShape.size) {
      case 1:
        this.slots = value;
        break;
      case 2:
        this.head = value;
        break;
      case 3:
        this.foot = value;
        break;
      case 4:
        final V[] newSlots = Assume.<V[]>conforms(new Object[4]);
        newSlots[0] = Assume.<V>conformsNullable(this.slots);
        newSlots[1] = Assume.<V>conformsNullable(this.head);
        newSlots[2] = Assume.<V>conformsNullable(this.foot);
        newSlots[3] = value;
        this.slots = newSlots;
        this.head = null;
        this.foot = null;
        break;
      default:
        throw new AssertionError(Integer.toString(newShape.size - 1));
    }
    this.shape = newShape;
    this.size = newShape.size;
    return null;
  }

  private @Nullable V putPacked(K key, @Nullable V value, boolean ifAbsent) {
    final UniformShape<K, V> shape = this.shape;
    final V[] slots = Assume.<V[]>conformsNonNull(this.slots);
    final int index = shape.lookup(key);
    if (index >= 0) {
      final V oldValue = slots[index];
      if (!ifAbsent && value != oldValue) {
        if ((this.flags & ALIASED_FLAG) != 0) {
          final V[] newSlots = Assume.<V[]>conforms(new Object[UniformShape.expand(shape.size)]);
          System.arraycopy(slots, 0, newSlots, 0, shape.size);
          this.slots = newSlots;
          this.flags &= ~ALIASED_FLAG;
        }
        slots[index] = value;
      }
      return oldValue;
    }

    if (shape.size < MAX_PACKED_SIZE) {
      final UniformShape<K, V> newShape = shape.getChild(key);
      if (slots.length >= newShape.size && (this.flags & ALIASED_FLAG) == 0) {
        slots[newShape.size - 1] = value;
      } else {
        final V[] newSlots = Assume.<V[]>conforms(new Object[UniformShape.expand(newShape.size)]);
        System.arraycopy(slots, 0, newSlots, 0, shape.size);
        newSlots[newShape.size - 1] = value;
        this.slots = newSlots;
        this.flags &= ~ALIASED_FLAG;
      }
      this.shape = newShape;
      this.size = newShape.size;
      return null;
    }

    this.slots = new UniformEntry<?, ?>[UniformShape.expand((shape.size + 1) * 10 / 7)];
    this.head = null;
    this.foot = null;
    this.buildHashtable(shape.fields(), slots, -1);
    final UniformEntry<K, V> entry = new UniformEntry<K, V>(key, value);
    this.putEntry(key.hashCode(), entry);
    this.appendEntry(entry);
    this.shape = UniformShape.dictionary();
    this.size = shape.size + 1;
    return null;
  }

  private @Nullable V putLinked(K key, @Nullable V value, boolean ifAbsent) {
    final int hash = key.hashCode();
    UniformEntry<K, V> entry = this.getEntry(hash, key);
    if (entry != null) {
      final V oldValue = entry.value;
      if (!ifAbsent && value != oldValue) {
        if ((this.flags & ALIASED_FLAG) != 0) {
          this.dealiasHashtable(this.size, null);
          entry = Assume.nonNull(this.getEntry(hash, key));
        }
        entry.value = value;
      }
      return oldValue;
    }

    if ((this.flags & ALIASED_FLAG) != 0) {
      this.dealiasHashtable(this.size + 1, null);
    } else {
      this.resizeHashtable(this.size + 1);
    }
    entry = new UniformEntry<K, V>(key, value);
    this.putEntry(hash, entry);
    this.appendEntry(entry);
    this.size += 1;
    return null;
  }

  @Override
  public void putAll(Map<? extends K, ? extends V> map) {
    for (Map.Entry<? extends K, ? extends V> entry : map.entrySet()) {
      this.put(entry.getKey(), entry.getValue());
    }
  }

  @Override
  public UniformMap<K, V> updated(@Nullable K key, @Nullable V value) {
    Objects.requireNonNull(key, "key");
    if (this.shape.size < 0) {
      return this.updatedLinked(key, value);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.updatedPacked(key, value);
    } else {
      return this.updatedInline(key, value);
    }
  }

  private UniformMap<K, V> updatedInline(K key, @Nullable V value) {
    final UniformShape<K, V>[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final UniformShape<K, V> field = fields[i];
      if (!key.equals(field.key)) {
        continue;
      }
      switch (field.size - 1) {
        case 0:
          return new UniformMap<K, V>(0, this.size, this.shape, value, this.head, this.foot);
        case 1:
          return new UniformMap<K, V>(0, this.size, this.shape, this.slots, value, this.foot);
        case 2:
          return new UniformMap<K, V>(0, this.size, this.shape, this.slots, this.head, value);
        default:
          throw new AssertionError(Integer.toString(field.size - 1));
      }
    }

    final UniformShape<K, V> newShape = this.shape.getChild(key);
    switch (newShape.size) {
      case 1:
        return new UniformMap<K, V>(0, newShape.size, newShape, value, null, null);
      case 2:
        return new UniformMap<K, V>(0, newShape.size, newShape, this.slots, value, null);
      case 3:
        return new UniformMap<K, V>(0, newShape.size, newShape, this.slots, this.head, value);
      case 4:
        final V[] newSlots = Assume.<V[]>conforms(new Object[4]);
        newSlots[0] = Assume.<V>conformsNullable(this.slots);
        newSlots[1] = Assume.<V>conformsNullable(this.head);
        newSlots[2] = Assume.<V>conformsNullable(this.foot);
        newSlots[3] = value;
        return new UniformMap<K, V>(0, newShape.size, newShape, newSlots, null, null);
      default:
        throw new AssertionError(Integer.toString(newShape.size - 1));
    }
  }

  private UniformMap<K, V> updatedPacked(K key, @Nullable V value) {
    final UniformShape<K, V> shape = this.shape;
    final V[] slots = Assume.<V[]>conformsNonNull(this.slots);
    final int index = shape.lookup(key);
    if (index >= 0) {
      if (value == slots[index]) {
        return this;
      }
      final V[] newSlots = Assume.<V[]>conforms(new Object[UniformShape.expand(shape.size)]);
      System.arraycopy(slots, 0, newSlots, 0, shape.size);
      slots[index] = value;
      return new UniformMap<K, V>(0, this.size, shape, newSlots, null, null);
    }

    if (shape.size < MAX_PACKED_SIZE) {
      final UniformShape<K, V> newShape = shape.getChild(key);
      final V[] newSlots = Assume.<V[]>conforms(new Object[UniformShape.expand(newShape.size)]);
      System.arraycopy(slots, 0, newSlots, 0, shape.size);
      newSlots[newShape.size - 1] = value;
      return new UniformMap<K, V>(0, newShape.size, newShape, newSlots, null, null);
    }

    final UniformMap<K, V> newMap = new UniformMap<K, V>(0, shape.size + 1, UniformShape.dictionary(),
                                                         new UniformEntry<?, ?>[UniformShape.expand((shape.size + 1) * 10 / 7)],
                                                         null, null);
    newMap.buildHashtable(shape.fields(), slots, -1);
    final UniformEntry<K, V> entry = new UniformEntry<K, V>(key, value);
    newMap.putEntry(key.hashCode(), entry);
    newMap.appendEntry(entry);
    return newMap;
  }

  private UniformMap<K, V> updatedLinked(K key, @Nullable V value) {
    final int hash = key.hashCode();
    UniformEntry<K, V> entry = this.getEntry(hash, key);
    if (entry != null) {
      if (value == entry.value) {
        return this;
      }
      final UniformMap<K, V> newMap = new UniformMap<K, V>(0, this.size, this.shape,
                                                           this.slots, this.head, this.foot);
      newMap.dealiasHashtable(newMap.size, null);
      entry = Assume.nonNull(newMap.getEntry(hash, key));
      entry.value = value;
      return newMap;
    }

    final UniformMap<K, V> newMap = new UniformMap<K, V>(0, this.size, this.shape,
                                                         this.slots, this.head, this.foot);
    newMap.dealiasHashtable(newMap.size + 1, null);
    entry = new UniformEntry<K, V>(key, value);
    newMap.putEntry(hash, entry);
    newMap.appendEntry(entry);
    return newMap;
  }

  public UniformMap<K, V> let(K key, @Nullable V value) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      return this.updated(key, value);
    }
    this.put(key, value);
    return this;
  }

  @Override
  public @Nullable V remove(@Nullable Object key) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if (this.shape.size == 0 || key == null) {
      return null;
    } else if (this.shape.size < 0) {
      return this.removeLinked(key);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.removePacked(key);
    } else {
      return this.removeInline(key);
    }
  }

  private @Nullable V removeInline(Object key) {
    // Capture current inline value slots.
    final UniformShape<K, V> shape = this.shape;
    final V slot0 = shape.size > 0 ? Assume.<V>conformsNullable(this.slots) : null;
    final V slot1 = shape.size > 1 ? Assume.<V>conformsNullable(this.head) : null;
    final V slot2 = shape.size > 2 ? Assume.<V>conformsNullable(this.foot) : null;

    // Search fields for matching key.
    final UniformShape<K, V>[] fields = shape.fields();
    int index = -1;
    V oldValue = null;
    for (int i = 0; i < fields.length; i += 1) {
      final UniformShape<K, V> field = fields[i];
      if (!key.equals(field.key)) {
        continue;
      }
      // Capture the previous value associated with the matched key
      // and clear the inline value slot.
      index = field.size - 1;
      switch (index) {
        case 0:
          oldValue = Assume.<V>conformsNullable(this.slots);
          this.slots = null;
          break;
        case 1:
          oldValue = Assume.<V>conformsNullable(this.head);
          this.head = null;
          break;
        case 2:
          oldValue = Assume.<V>conformsNullable(this.foot);
          this.foot = null;
          break;
        default:
          throw new AssertionError(Integer.toString(index));
      }
      break;
    }
    if (index < 0) {
      // No matching key was found.
      return null;
    }

    // Update the map shape to reflect the removed field.
    if (index == shape.size - 1) {
      // The leaf field of the shape was removed; revert to the parent shape.
      // The inline value slot for the removed key has already been nulled out.
      this.shape = Assume.nonNull(shape.parent);
      this.size = shape.size - 1;
      return oldValue;
    }

    // Build a hashtable with the remaining fields.
    this.slots = new UniformEntry<?, ?>[UniformShape.expand((shape.size - 1) * 10 / 7)];
    this.head = null;
    this.foot = null;
    // Loop over all previous fields.
    for (int i = 0; i < fields.length; i += 1) {
      if (i == index) {
        // Skip the removed field.
        continue;
      }
      final UniformShape<K, V> field = fields[i];
      // Lookup the value of the remaining field.
      final V value;
      switch (field.size - 1) {
        case 0:
          value = slot0;
          break;
        case 1:
          value = slot1;
          break;
        case 2:
          value = slot2;
          break;
        default:
          throw new AssertionError(Integer.toString(field.size - 1));
      }
      // Insert the remaining field into the hashtable.
      final UniformEntry<K, V> entry = new UniformEntry<K, V>(Assume.nonNull(field.key), value);
      this.putEntry(Assume.nonNull(field.key).hashCode(), entry);
      this.appendEntry(entry);
    }
    this.shape = UniformShape.dictionary();
    this.size = shape.size - 1;
    return oldValue;
  }

  private @Nullable V removePacked(Object key) {
    final UniformShape<K, V> shape = this.shape;
    final int index = shape.lookup(key);
    if (index < 0) {
      // No matching key was found.
      return null;
    }

    // Update the map shape to reflect the removed field.
    final V[] slots = Assume.<V[]>conformsNonNull(this.slots);
    final V oldValue = slots[index];
    if (index == shape.size - 1) {
      // The leaf field of the shape was removed; revert to the parent shape.
      if (Assume.nonNull(shape.parent).size == MAX_INLINE_SIZE) {
        // Inline the remaining value slots.
        this.slots = slots[0];
        this.head = slots[1];
        this.foot = slots[2];
        this.flags &= ~ALIASED_FLAG;
      } else if ((this.flags & ALIASED_FLAG) != 0) {
        // Dealias the remaining value slots, excluding the last (removed) value.
        final V[] newSlots = Assume.<V[]>conforms(new Object[UniformShape.expand(shape.size - 1)]);
        System.arraycopy(slots, 0, newSlots, 0, shape.size - 1);
        this.slots = newSlots;
        this.flags &= ~ALIASED_FLAG;
      } else {
        // Clear the value slot of the removed key.
        slots[index] = null;
      }
      this.shape = Assume.nonNull(shape.parent);
      this.size = shape.size - 1;
      return oldValue;
    }

    // Build a hashtable with the remaining fields.
    this.slots = new UniformEntry<?, ?>[UniformShape.expand((shape.size - 1) * 10 / 7)];
    this.head = null;
    this.foot = null;
    this.buildHashtable(shape.fields(), slots, index);
    this.shape = UniformShape.dictionary();
    this.size = shape.size - 1;
    return oldValue;
  }

  private @Nullable V removeLinked(Object key) {
    if ((this.flags & ALIASED_FLAG) != 0) {
      final UniformEntry<K, V> entry = this.getEntry(key.hashCode(), key);
      if (entry == null) {
        return null;
      }
      this.dealiasHashtable(this.size - 1, key);
      this.size -= 1;
      return entry.value;
    }

    final UniformEntry<K, V> entry = this.removeEntry(key.hashCode(), key);
    if (entry == null) {
      return null;
    }
    this.detachEntry(entry);
    this.size -= 1;
    return entry.value;
  }

  @Override
  public UniformMap<K, V> removed(@Nullable Object key) {
    if (this.shape.size == 0 || key == null) {
      return this;
    } else if (this.shape.size < 0) {
      return this.removedLinked(key);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.removedPacked(key);
    } else {
      return this.removedInline(key);
    }
  }

  private UniformMap<K, V> removedInline(Object key) {
    // Capture current inline value slots.
    final UniformShape<K, V> shape = this.shape;
    V slot0 = shape.size > 0 ? Assume.<V>conformsNullable(this.slots) : null;
    V slot1 = shape.size > 1 ? Assume.<V>conformsNullable(this.head) : null;
    V slot2 = shape.size > 2 ? Assume.<V>conformsNullable(this.foot) : null;

    // Search fields for matching key.
    final UniformShape<K, V>[] fields = shape.fields();
    int index = -1;
    for (int i = 0; i < fields.length; i += 1) {
      final UniformShape<K, V> field = fields[i];
      if (!key.equals(field.key)) {
        continue;
      }
      // Clear the found inline value slot.
      index = field.size - 1;
      switch (index) {
        case 0:
          slot0 = null;
          break;
        case 1:
          slot1 = null;
          break;
        case 2:
          slot2 = null;
          break;
        default:
          throw new AssertionError(Integer.toString(index));
      }
      break;
    }
    if (index < 0) {
      // No matching key was found.
      return this;
    }

    // Update the map shape to reflect the removed field.
    if (index == shape.size - 1) {
      // The leaf field of the shape was removed; revert to the parent shape.
      // The found inline value slot for the removed key has already been nulled out.
      return new UniformMap<K, V>(0, shape.size - 1, Assume.nonNull(shape.parent),
                                  slot0, slot1, slot2);
    }

    // Build a hashtable with the remaining fields.
    final UniformMap<K, V> newMap = new UniformMap<K, V>(0, shape.size - 1, UniformShape.dictionary(),
                                                         new UniformEntry<?, ?>[UniformShape.expand((shape.size - 1) * 10 / 7)],
                                                         null, null);
    // Loop over all previous fields.
    for (int i = 0; i < fields.length; i += 1) {
      if (i == index) {
        // Skip the removed field.
        continue;
      }
      // Lookup the value of the remaining field.
      final UniformShape<K, V> field = fields[i];
      final V value;
      switch (field.size - 1) {
        case 0:
          value = slot0;
          break;
        case 1:
          value = slot1;
          break;
        case 2:
          value = slot2;
          break;
        default:
          throw new AssertionError(Integer.toString(field.size - 1));
      }
      // Insert the remaining field into the hashtable.
      final UniformEntry<K, V> entry = new UniformEntry<K, V>(Assume.nonNull(field.key), value);
      newMap.putEntry(Assume.nonNull(field.key).hashCode(), entry);
      newMap.appendEntry(entry);
    }
    return newMap;
  }

  private UniformMap<K, V> removedPacked(Object key) {
    final UniformShape<K, V> shape = this.shape;
    final int index = shape.lookup(key);
    if (index < 0) {
      // No matching key was found.
      return this;
    }

    final V[] slots = Assume.<V[]>conformsNonNull(this.slots);
    // Update the map shape to reflect the removed field.
    if (index == shape.size - 1) {
      // The leaf field of the shape was removed; revert to the parent shape.
      if (Assume.nonNull(shape.parent).size == MAX_INLINE_SIZE) {
        // Inline the remaining value slots.
        return new UniformMap<K, V>(0, shape.size - 1, Assume.nonNull(shape.parent),
                                    slots[0], slots[1], slots[2]);
      }
      // Clone the remaining value slots, excluding the last (removed) value.
      final V[] newSlots = Assume.<V[]>conforms(new Object[UniformShape.expand(shape.size - 1)]);
      System.arraycopy(slots, 0, newSlots, 0, shape.size - 1);
      return new UniformMap<K, V>(0, shape.size - 1, Assume.nonNull(shape.parent),
                                  newSlots, null, null);
    }

    // Build a hashtable with the remaining fields.
    final UniformMap<K, V> newMap = new UniformMap<K, V>(0, shape.size - 1, UniformShape.dictionary(),
                                                         new UniformEntry<?, ?>[UniformShape.expand((shape.size - 1) * 10 / 7)],
                                                         null, null);
    newMap.buildHashtable(shape.fields(), slots, index);
    return newMap;
  }

  private UniformMap<K, V> removedLinked(Object key) {
    final UniformEntry<K, V> entry = this.getEntry(key.hashCode(), key);
    if (entry == null) {
      return this;
    }
    final UniformMap<K, V> newMap = new UniformMap<K, V>(0, this.size - 1, this.shape,
                                                         this.slots, this.head, this.foot);
    newMap.dealiasHashtable(this.size - 1, key);
    return newMap;
  }

  @Override
  public void clear() {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    this.shape = UniformShape.empty();
    this.slots = null;
    this.head = null;
    this.foot = null;
    this.size = 0;
    this.flags |= ALIASED_FLAG;
  }

  public int indexOf(@Nullable K key) {
    if (this.shape.size == 0 || key == null) {
      return -1;
    } else if (this.shape.size < 0) {
      UniformEntry<K, V> entry = Assume.<UniformEntry<K, V>>conformsNullable(this.head);
      int index = 0;
      while (entry != null) {
        if (key.equals(entry.key)) {
          return index;
        }
        entry = entry.next;
        index += 1;
      }
      return -1;
    } else {
      return this.shape.lookup(key);
    }
  }

  private @Nullable UniformEntry<K, V> getEntry(int hash, Object key) {
    final UniformEntry<K, V>[] slots = Assume.<UniformEntry<K, V>[]>conformsNonNull(this.slots);
    UniformEntry<K, V> bucket = slots[Math.abs(hash % slots.length)];
    while (bucket != null) {
      if (key.equals(bucket.key)) {
        return bucket;
      }
      bucket = bucket.nextCollision;
    }
    return null;
  }

  private void putEntry(int hash, UniformEntry<K, V> entry) {
    final UniformEntry<K, V>[] slots = Assume.<UniformEntry<K, V>[]>conformsNonNull(this.slots);
    final int index = Math.abs(hash % slots.length);
    UniformEntry<K, V> bucket = slots[index];
    if (bucket == null) {
      slots[index] = entry;
      return;
    } else if (entry.key.equals(bucket.key)) {
      entry.nextCollision = bucket.nextCollision;
      slots[index] = bucket;
      return;
    }
    UniformEntry<K, V> prev = bucket;
    do {
      bucket = prev.nextCollision;
      if (bucket == null) {
        prev.nextCollision = entry;
        return;
      } else if (entry.key.equals(bucket.key)) {
        entry.nextCollision = bucket.nextCollision;
        prev.nextCollision = entry;
        return;
      }
      prev = bucket;
    } while (true);
  }

  private @Nullable UniformEntry<K, V> removeEntry(int hash, Object key) {
    final UniformEntry<K, V>[] slots = Assume.<UniformEntry<K, V>[]>conformsNonNull(this.slots);
    final int index = Math.abs(hash % slots.length);
    UniformEntry<K, V> bucket = slots[index];
    if (bucket == null) {
      return null;
    } else if (key.equals(bucket.key)) {
      slots[index] = bucket.nextCollision;
      bucket.nextCollision = null;
      return bucket;
    }
    UniformEntry<K, V> prev = bucket;
    do {
      bucket = prev.nextCollision;
      if (bucket == null) {
        return null;
      } else if (key.equals(bucket.key)) {
        prev.nextCollision = bucket.nextCollision;
        bucket.nextCollision = null;
        return bucket;
      }
      prev = bucket;
    } while (true);
  }

  private void buildHashtable(UniformShape<K, V>[] fields, V[] slots, int excludeIndex) {
    for (int i = 0; i < fields.length; i += 1) {
      if (i == excludeIndex) {
        continue;
      }
      final UniformShape<K, V> field = fields[i];
      final K key = Assume.nonNull(field.key);
      final V value = slots[field.size - 1];
      final UniformEntry<K, V> entry = new UniformEntry<K, V>(key, value);
      this.putEntry(key.hashCode(), entry);
      this.appendEntry(entry);
    }
  }

  private void resizeHashtable(int newSize) {
    final int newCapacity = UniformShape.expand(newSize * 10 / 7);
    if (newCapacity <= Assume.<UniformEntry<K, V>[]>conformsNonNull(this.slots).length) {
      return;
    }

    UniformEntry<K, V> entry = Assume.<UniformEntry<K, V>>conformsNullable(this.head);
    this.slots = new UniformEntry<?, ?>[newCapacity];
    this.head = null;
    this.foot = null;

    while (entry != null) {
      final UniformEntry<K, V> next = entry.next;
      entry.prev = null;
      entry.next = null;
      entry.nextCollision = null;

      this.putEntry(entry.key.hashCode(), entry);
      this.appendEntry(entry);

      entry = next;
    }
  }

  private void dealiasHashtable(int newSize, @Nullable Object excludeKey) {
    final int newCapacity = UniformShape.expand(newSize * 10 / 7);
    UniformEntry<K, V> head = Assume.<UniformEntry<K, V>>conformsNullable(this.head);
    this.slots = new UniformEntry<?, ?>[newCapacity];
    this.head = null;
    this.foot = null;

    while (head != null) {
      if (excludeKey == null || !excludeKey.equals(head.key)) {
        final UniformEntry<K, V> entry = new UniformEntry<K, V>(head.key, head.value);
        this.putEntry(entry.key.hashCode(), entry);
        this.appendEntry(entry);
      }
      head = head.next;
    }

    this.flags &= ~ALIASED_FLAG;
  }

  private void appendEntry(UniformEntry<K, V> entry) {
    final UniformEntry<K, V> foot = Assume.<UniformEntry<K, V>>conformsNullable(this.foot);
    if (foot != null) {
      foot.next = entry;
    } else {
      this.head = entry;
    }
    entry.next = null;
    entry.prev = foot;
    this.foot = entry;
  }

  private void detachEntry(UniformEntry<K, V> entry) {
    if (entry.prev != null) {
      entry.prev.next = entry.next;
    } else {
      this.head = entry.next;
    }
    if (entry.next != null) {
      entry.next.prev = entry.prev;
    } else {
      this.foot = entry.prev;
    }
    entry.prev = null;
    entry.next = null;
  }

  public boolean isMutable() {
    return (this.flags & IMMUTABLE_FLAG) == 0;
  }

  public UniformMap<K, V> asMutable() {
    return this.isMutable() ? this : this.clone();
  }

  @Override
  public UniformMap<K, V> clone() {
    if (this.shape.size < 0 || this.shape.size > MAX_INLINE_SIZE) {
      this.flags |= ALIASED_FLAG;
    }
    return new UniformMap<K, V>(this.flags & ~IMMUTABLE_FLAG, this.size,
                                this.shape, this.slots, this.head, this.foot);
  }

  public UniformMap<K, V> commit() {
    if ((this.flags & IMMUTABLE_FLAG) == 0) {
      this.flags |= IMMUTABLE_FLAG;
    }
    return this;
  }

  @Override
  public void forEach(BiConsumer<? super K, ? super V> action) {
    if (this.shape.size < 0) {
      this.forEachLinked(action);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      this.forEachPacked(action);
    } else if (this.shape.size > 0) {
      this.forEachInline(action);
    }
  }

  private void forEachInline(BiConsumer<? super K, ? super V> action) {
    final UniformShape<K, V>[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final UniformShape<K, V> field = fields[i];
      final K key = field.key;
      final V value;
      switch (field.size - 1) {
        case 0:
          value = Assume.<V>conformsNullable(this.slots);
          break;
        case 1:
          value = Assume.<V>conformsNullable(this.head);
          break;
        case 2:
          value = Assume.<V>conformsNullable(this.foot);
          break;
        default:
          throw new AssertionError(Integer.toString(field.size - 1));
      }
      action.accept(key, value);
    }
  }

  private void forEachPacked(BiConsumer<? super K, ? super V> action) {
    final UniformShape<K, V>[] fields = this.shape.fields();
    final V[] slots = Assume.<V[]>conformsNonNull(this.slots);
    for (int i = 0; i < fields.length; i += 1) {
      final UniformShape<K, V> field = fields[i];
      final K key = field.key;
      final V value = slots[field.size - 1];
      action.accept(key, value);
    }
  }

  private void forEachLinked(BiConsumer<? super K, ? super V> action) {
    UniformEntry<K, V> entry = Assume.<UniformEntry<K, V>>conformsNullable(this.head);
    while (entry != null) {
      final UniformEntry<K, V> next = entry.next;
      action.accept(entry.key, entry.value);
      entry = next;
    }
  }

  @Override
  public void forEach(Consumer<? super Map.Entry<K, V>> action) {
    if (this.shape.size < 0) {
      this.forEachLinked(action);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      this.forEachPacked(action);
    } else if (this.shape.size > 0) {
      this.forEachInline(action);
    }
  }

  private void forEachInline(Consumer<? super Map.Entry<K, V>> action) {
    final UniformShape<K, V>[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final UniformShape<K, V> field = fields[i];
      final K key = field.key;
      final V value;
      switch (field.size - 1) {
        case 0:
          value = Assume.<V>conformsNullable(this.slots);
          break;
        case 1:
          value = Assume.<V>conformsNullable(this.head);
          break;
        case 2:
          value = Assume.<V>conformsNullable(this.foot);
          break;
        default:
          throw new AssertionError(Integer.toString(field.size - 1));
      }
      action.accept(new SimpleImmutableEntry<K, V>(key, value));
    }
  }

  private void forEachPacked(Consumer<? super Map.Entry<K, V>> action) {
    final UniformShape<K, V>[] fields = this.shape.fields();
    final V[] slots = Assume.<V[]>conformsNonNull(this.slots);
    for (int i = 0; i < fields.length; i += 1) {
      final UniformShape<K, V> field = fields[i];
      final K key = field.key;
      final V value = slots[field.size - 1];
      action.accept(new SimpleImmutableEntry<K, V>(key, value));
    }
  }

  private void forEachLinked(Consumer<? super Map.Entry<K, V>> action) {
    UniformEntry<K, V> entry = Assume.<UniformEntry<K, V>>conformsNullable(this.head);
    while (entry != null) {
      final UniformEntry<K, V> next = entry.next;
      action.accept(entry);
      entry = next;
    }
  }

  @Override
  public Iterator<Map.Entry<K, V>> iterator() {
    if (this.shape.size < 0) {
      return new UniformMapLinkedEntryIterator<K, V>(Assume.<UniformEntry<K, V>>conformsNonNull(this.head));
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return new UniformMapPackedEntryIterator<K, V>(this);
    } else if (this.shape.size > 0) {
      return new UniformMapInlineEntryIterator<K, V>(this);
    } else {
      return Assume.conforms(UniformMapInlineEntryIterator.EMPTY);
    }
  }

  public Iterator<K> keyIterator() {
    if (this.shape.size < 0) {
      return new UniformMapLinkedKeyIterator<K, V>(Assume.<UniformEntry<K, V>>conformsNonNull(this.head));
    } else {
      return new UniformMapPackedKeyIterator<K, V>(this);
    }
  }

  public Iterator<V> valueIterator() {
    if (this.shape.size < 0) {
      return new UniformMapLinkedValueIterator<K, V>(Assume.<UniformEntry<K, V>>conformsNonNull(this.head));
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return new UniformMapPackedValueIterator<K, V>(this);
    } else {
      return new UniformMapInlineValueIterator<K, V>(this);
    }
  }

  @Override
  public Set<Map.Entry<K, V>> entrySet() {
    return new UniformMapEntrySet<K, V>(this);
  }

  @Override
  public Set<K> keySet() {
    return new UniformMapKeySet<K, V>(this);
  }

  @Override
  public Collection<V> values() {
    return new UniformMapValues<K, V>(this);
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
    for (Map.Entry<K, V> entry : this) {
      code += entry.hashCode();
    }
    return code;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.size == 0 && (this.flags & IMMUTABLE_FLAG) != 0) {
      notation.beginInvoke("UniformMap", "empty").endInvoke();
    } else {
      notation.beginInvoke("UniformMap", "of");
      for (Map.Entry<K, V> entry : this) {
        notation.appendArgument(entry.getKey())
                .appendArgument(entry.getValue());
      }
      notation.endInvoke();
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final int IMMUTABLE_FLAG = 1 << 0;

  static final int ALIASED_FLAG = 1 << 1;

  public static final int MAX_INLINE_SIZE = 3;

  public static final int MAX_PACKED_SIZE = 32;

  static final UniformMap<?, ?> EMPTY = new UniformMap<Object, Object>(IMMUTABLE_FLAG, 0,
                                                                       UniformShape.empty(),
                                                                       null, null, null);

  public static <K, V> UniformMap<K, V> empty() {
    return Assume.conforms(EMPTY);
  }

  public static <K, V> UniformMap<K, V> of() {
    return new UniformMap<K, V>(0, 0, UniformShape.empty(), null, null, null);
  }

  public static <K, V> UniformMap<K, V> of(K key, V value) {
    final UniformShape<K, V> shape = UniformShape.<K, V>empty().getChild(key);
    return new UniformMap<K, V>(0, 1, shape, value, null, null);
  }

  public static <K, V> UniformMap<K, V> of(K key0, V value0,
                                           K key1, V value1) {
    final UniformShape<K, V> shape = UniformShape.<K, V>empty().getChild(key0).getChild(key1);
    return new UniformMap<K, V>(0, 2, shape, value0, value1, null);
  }

  public static <K, V> UniformMap<K, V> of(K key0, V value0,
                                           K key1, V value1,
                                           K key2, V value2) {
    final UniformShape<K, V> shape = UniformShape.<K, V>empty().getChild(key0).getChild(key1)
                                                               .getChild(key2);
    return new UniformMap<K, V>(0, 3, shape, value0, value1, value2);
  }

  public static <K, V> UniformMap<K, V> of(K key0, V value0,
                                           K key1, V value1,
                                           K key2, V value2,
                                           K key3, V value3) {
    final V[] slots = Assume.<V[]>conforms(new Object[] {value0, value1, value2, value3});
    final UniformShape<K, V> shape = UniformShape.<K, V>empty().getChild(key0).getChild(key1)
                                                               .getChild(key2).getChild(key3);
    return new UniformMap<K, V>(0, 4, shape, slots, null, null);
  }

  public static <K, V> UniformMap<K, V> of(@Nullable Object... keyValuePairs) {
    Objects.requireNonNull(keyValuePairs);
    if (keyValuePairs.length % 2 != 0) {
      throw new IllegalArgumentException("odd number of key-value pairs");
    }
    final UniformMap<K, V> map = UniformMap.of();
    for (int i = 0; i < keyValuePairs.length; i += 2) {
      final K key = Assume.conformsNullable(keyValuePairs[i]);
      if (key == null) {
        throw new NullPointerException("key " + (i >>> 1));
      }
      final V value = Assume.conformsNullable(keyValuePairs[i + 1]);
      map.put(key, value);
    }
    return map;
  }

}

final class UniformEntry<K, V> implements Map.Entry<K, V> {

  final K key;
  @Nullable V value;
  @Nullable UniformEntry<K, V> prev;
  @Nullable UniformEntry<K, V> next;
  @Nullable UniformEntry<K, V> nextCollision;

  UniformEntry(K key, @Nullable V value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
    this.nextCollision = null;
  }

  @Override
  public K getKey() {
    return this.key;
  }

  @Override
  public @Nullable V getValue() {
    return this.value;
  }

  @Override
  public @Nullable V setValue(@Nullable V value) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map.Entry<?, ?> that) {
      return this.key.equals(that.getKey()) && Objects.equals(this.value, that.getValue());
    }
    return false;
  }

  @Override
  public int hashCode() {
    return this.key.hashCode() ^ Objects.hashCode(this.value);
  }

}

final class UniformMapInlineEntryIterator<K, V> implements Iterator<Map.Entry<K, V>> {

  final UniformMap<K, V> map;
  final UniformShape<K, V> shape;
  final UniformShape<K, V>[] fields;
  int index;

  UniformMapInlineEntryIterator(UniformMap<K, V> map) {
    this.map = map;
    this.shape = map.shape;
    this.fields = this.shape.fields();
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.fields.length;
  }

  @Override
  public Map.Entry<K, V> next() {
    final int index = this.index;
    if (index >= this.fields.length) {
      throw new NoSuchElementException();
    } else if (this.map.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    final K key = this.fields[index].key;
    final V value;
    switch (index) {
      case 0:
        value = Assume.<V>conformsNullable(this.map.slots);
        break;
      case 1:
        value = Assume.<V>conformsNullable(this.map.head);
        break;
      case 2:
        value = Assume.<V>conformsNullable(this.map.foot);
        break;
      default:
        throw new AssertionError(Integer.toString(index));
    }
    return new SimpleImmutableEntry<K, V>(key, value);
  }

  static final UniformMapInlineEntryIterator<?, ?> EMPTY =
      new UniformMapInlineEntryIterator<Object, Object>(UniformMap.empty());

}

final class UniformMapPackedEntryIterator<K, V> implements Iterator<Map.Entry<K, V>> {

  final UniformMap<K, V> map;
  final UniformShape<K, V> shape;
  final UniformShape<K, V>[] fields;
  int index;

  UniformMapPackedEntryIterator(UniformMap<K, V> map) {
    this.map = map;
    this.shape = map.shape;
    this.fields = this.shape.fields();
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.fields.length;
  }

  @Override
  public Map.Entry<K, V> next() {
    final int index = this.index;
    if (index >= this.fields.length) {
      throw new NoSuchElementException();
    } else if (this.map.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    final K key = this.fields[index].key;
    final V value = Assume.<V[]>conformsNonNull(this.map.slots)[index];
    return new SimpleImmutableEntry<K, V>(key, value);
  }

}

final class UniformMapLinkedEntryIterator<K, V> implements Iterator<Map.Entry<K, V>> {

  @Nullable UniformEntry<K, V> entry;

  UniformMapLinkedEntryIterator(@Nullable UniformEntry<K, V> entry) {
    this.entry = entry;
  }

  @Override
  public boolean hasNext() {
    return this.entry != null;
  }

  @Override
  public Map.Entry<K, V> next() {
    final UniformEntry<K, V> entry = this.entry;
    if (entry == null) {
      throw new NoSuchElementException();
    }
    this.entry = entry.next;
    return entry;
  }

}

final class UniformMapEntrySet<K, V> extends AbstractSet<Map.Entry<K, V>> {

  final UniformMap<K, V> map;

  UniformMapEntrySet(UniformMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Iterator<Map.Entry<K, V>> iterator() {
    return this.map.iterator();
  }

}

final class UniformMapPackedKeyIterator<K, V> implements Iterator<K> {

  final UniformMap<K, V> map;
  final UniformShape<K, V> shape;
  final UniformShape<K, V>[] fields;
  int index;

  UniformMapPackedKeyIterator(UniformMap<K, V> map) {
    this.map = map;
    this.shape = map.shape;
    this.fields = this.shape.fields();
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.fields.length;
  }

  @Override
  public K next() {
    final int index = this.index;
    if (index >= this.fields.length) {
      throw new NoSuchElementException();
    } else if (this.map.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    return Assume.nonNull(this.fields[index].key);
  }

}

final class UniformMapLinkedKeyIterator<K, V> implements Iterator<K> {

  @Nullable UniformEntry<K, V> entry;

  UniformMapLinkedKeyIterator(@Nullable UniformEntry<K, V> entry) {
    this.entry = entry;
  }

  @Override
  public boolean hasNext() {
    return this.entry != null;
  }

  @Override
  public K next() {
    final UniformEntry<K, V> entry = this.entry;
    if (entry == null) {
      throw new NoSuchElementException();
    }
    this.entry = entry.next;
    return entry.key;
  }

}

final class UniformMapKeySet<K, V> extends AbstractSet<K> {

  final UniformMap<K, V> map;

  UniformMapKeySet(UniformMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Iterator<K> iterator() {
    return this.map.keyIterator();
  }

}

final class UniformMapInlineValueIterator<K, V> implements Iterator<V> {

  final UniformMap<K, V> map;
  final UniformShape<K, V> shape;
  int index;

  UniformMapInlineValueIterator(UniformMap<K, V> map) {
    this.map = map;
    this.shape = map.shape;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.shape.size;
  }

  @Override
  public @Nullable V next() {
    final int index = this.index;
    if (index >= this.shape.size) {
      throw new NoSuchElementException();
    } else if (this.map.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    switch (index) {
      case 0:
        return Assume.<V>conformsNullable(this.map.slots);
      case 1:
        return Assume.<V>conformsNullable(this.map.head);
      case 2:
        return Assume.<V>conformsNullable(this.map.foot);
      default:
        throw new AssertionError(Integer.toString(index));
    }
  }

}

final class UniformMapPackedValueIterator<K, V> implements Iterator<V> {

  final UniformMap<K, V> map;
  final UniformShape<K, V> shape;
  int index;

  UniformMapPackedValueIterator(UniformMap<K, V> map) {
    this.map = map;
    this.shape = map.shape;
    this.index = 0;
  }

  @Override
  public boolean hasNext() {
    return this.index < this.shape.size;
  }

  @Override
  public @Nullable V next() {
    final int index = this.index;
    if (index >= this.shape.size) {
      throw new NoSuchElementException();
    } else if (this.map.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    return Assume.<V[]>conformsNonNull(this.map.slots)[index];
  }

}

final class UniformMapLinkedValueIterator<K, V> implements Iterator<V> {

  @Nullable UniformEntry<K, V> entry;

  UniformMapLinkedValueIterator(@Nullable UniformEntry<K, V> entry) {
    this.entry = entry;
  }

  @Override
  public boolean hasNext() {
    return this.entry != null;
  }

  @Override
  public @Nullable V next() {
    final UniformEntry<K, V> entry = this.entry;
    if (entry == null) {
      throw new NoSuchElementException();
    }
    this.entry = entry.next;
    return entry.value;
  }

}

final class UniformMapValues<K, V> extends AbstractCollection<V> {

  final UniformMap<K, V> map;

  UniformMapValues(UniformMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Iterator<V> iterator() {
    return this.map.valueIterator();
  }

}
