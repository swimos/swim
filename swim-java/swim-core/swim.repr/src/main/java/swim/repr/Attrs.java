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
import swim.expr.Term;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.UpdatableMap;

@Public
@Since("5.0")
public final class Attrs implements Term, UpdatableMap<String, Repr>, Iterable<Map.Entry<String, Repr>>, /*Comparable<Attrs>,*/ ToSource {

  int flags;
  int size;
  AttrsShape shape;
  @Nullable Object slots; // AttrEntry[] | Repr[] | Repr | null
  @Nullable Object head; // AttrEntry | Repr | null
  @Nullable Object foot; // AttrEntry | Repr | null

  Attrs(int flags, int size, AttrsShape shape, @Nullable Object slots,
        @Nullable Object head, @Nullable Object foot) {
    this.flags = flags;
    this.size = size;
    this.shape = shape;
    this.slots = slots;
    this.head = head;
    this.foot = foot;
  }

  public AttrsShape shape() {
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
    if (this.shape.size == 0 || !(value instanceof Repr)) {
      return false;
    } else if (this.shape.size < 0) {
      return this.containsValueHashed((Repr) value);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.containsValuePacked((Repr) value);
    } else {
      return this.containsValueInline((Repr) value);
    }
  }

  private boolean containsValueInline(Repr value) {
    return (this.shape.size > 0 && value.equals((Repr) this.slots))
        || (this.shape.size > 1 && value.equals((Repr) this.head))
        || (this.shape.size > 2 && value.equals((Repr) this.foot));
  }

  private boolean containsValuePacked(Repr value) {
    final Repr[] slots = (Repr[]) Assume.nonNull(this.slots);
    for (int i = 0; i < this.shape.size; i += 1) {
      if (value.equals(slots[i])) {
        return true;
      }
    }
    return false;
  }

  private boolean containsValueHashed(Repr value) {
    AttrEntry entry = (AttrEntry) this.head;
    while (entry != null) {
      if (value.equals(entry.value)) {
        return true;
      }
      entry = entry.next;
    }
    return false;
  }

  @Override
  public @Nullable Repr get(@Nullable Object key) {
    if (this.shape.size == 0 || !(key instanceof String)) {
      return null;
    } else if (this.shape.size < 0) {
      return this.getHashed((String) key);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.getPacked((String) key);
    } else {
      return this.getInline((String) key);
    }
  }

  private @Nullable Repr getInline(String key) {
    final AttrsShape[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final AttrsShape field = fields[i];
      if (key.equals(field.key)) {
        switch (field.size - 1) {
          case 0:
            return (Repr) this.slots;
          case 1:
            return (Repr) this.head;
          case 2:
            return (Repr) this.foot;
          default:
            throw new AssertionError(Integer.toString(field.size - 1));
        }
      }
    }
    return null;
  }

  private @Nullable Repr getPacked(String key) {
    final int index = this.shape.lookup(key);
    if (index >= 0) {
      return ((Repr[]) Assume.nonNull(this.slots))[index];
    }
    return null;
  }

  private @Nullable Repr getHashed(String key) {
    final AttrEntry entry = this.getEntry(key.hashCode(), key);
    if (entry != null) {
      return entry.value;
    }
    return null;
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

  @Override
  public @Nullable Repr put(String key, Repr value) {
    Objects.requireNonNull(key, "key");
    Objects.requireNonNull(value, "value");
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    if (this.shape.size < 0) {
      return this.putHashed(key, value, false);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.putPacked(key, value, false);
    } else {
      return this.putInline(key, value, false);
    }
  }

  @Override
  public @Nullable Repr putIfAbsent(String key, Repr value) {
    Objects.requireNonNull(key, "key");
    Objects.requireNonNull(value, "value");
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    if (this.shape.size < 0) {
      return this.putHashed(key, value, true);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.putPacked(key, value, true);
    } else {
      return this.putInline(key, value, true);
    }
  }

  private @Nullable Repr putInline(String key, Repr value, boolean ifAbsent) {
    final AttrsShape[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final AttrsShape field = fields[i];
      if (key.equals(field.key)) {
        final Repr oldValue;
        switch (field.size - 1) {
          case 0:
            oldValue = (Repr) this.slots;
            if (!ifAbsent) {
              this.slots = value;
            }
            break;
          case 1:
            oldValue = (Repr) this.head;
            if (!ifAbsent) {
              this.head = value;
            }
            break;
          case 2:
            oldValue = (Repr) this.foot;
            if (!ifAbsent) {
              this.foot = value;
            }
            break;
          default:
            throw new AssertionError(Integer.toString(field.size - 1));
        }
        return oldValue;
      }
    }

    final AttrsShape newShape = this.shape.getChild(key);
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
        final Repr[] newSlots = new Repr[4];
        newSlots[0] = (Repr) this.slots;
        newSlots[1] = (Repr) this.head;
        newSlots[2] = (Repr) this.foot;
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

  private @Nullable Repr putPacked(String key, Repr value, boolean ifAbsent) {
    final AttrsShape shape = this.shape;
    final Repr[] slots = (Repr[]) Assume.nonNull(this.slots);
    final int index = shape.lookup(key);
    if (index >= 0) {
      final Repr oldValue = slots[index];
      if (!ifAbsent && value != oldValue) {
        if ((this.flags & ALIASED_FLAG) != 0) {
          final Repr[] newSlots = new Repr[AttrsShape.expand(shape.size)];
          System.arraycopy(slots, 0, newSlots, 0, shape.size);
          this.slots = newSlots;
          this.flags &= ~ALIASED_FLAG;
        }
        slots[index] = value;
      }
      return oldValue;
    }

    if (shape.size < MAX_PACKED_SIZE) {
      final AttrsShape newShape = shape.getChild(key);
      if (slots.length >= newShape.size && (this.flags & ALIASED_FLAG) == 0) {
        slots[newShape.size - 1] = value;
      } else {
        final Repr[] newSlots = new Repr[AttrsShape.expand(newShape.size)];
        System.arraycopy(slots, 0, newSlots, 0, shape.size);
        newSlots[newShape.size - 1] = value;
        this.slots = newSlots;
        this.flags &= ~ALIASED_FLAG;
      }
      this.shape = newShape;
      this.size = newShape.size;
    } else {
      this.slots = new AttrEntry[AttrsShape.expand((shape.size + 1) * 10 / 7)];
      this.head = null;
      this.foot = null;
      this.buildHashTable(shape.fields(), slots, -1);
      final AttrEntry entry = new AttrEntry(key, value);
      this.putEntry(key.hashCode(), entry);
      this.appendEntry(entry);
      this.shape = AttrsShape.dictionary();
      this.size = shape.size + 1;
    }
    return null;
  }

  private @Nullable Repr putHashed(String key, Repr value, boolean ifAbsent) {
    final int hash = key.hashCode();
    AttrEntry entry = this.getEntry(hash, key);
    if (entry != null) {
      final Repr oldValue = entry.value;
      if (!ifAbsent && value != oldValue) {
        if ((this.flags & ALIASED_FLAG) != 0) {
          this.dealiasHashTable(this.size, null);
          entry = Assume.nonNull(this.getEntry(hash, key));
        }
        entry.value = value;
      }
      return oldValue;
    }

    if ((this.flags & ALIASED_FLAG) != 0) {
      this.dealiasHashTable(this.size + 1, null);
    } else {
      this.resizeHashTable(this.size + 1);
    }
    entry = new AttrEntry(key, value);
    this.putEntry(hash, entry);
    this.appendEntry(entry);
    this.size += 1;
    return null;
  }

  @Override
  public void putAll(Map<? extends String, ? extends Repr> map) {
    for (Map.Entry<? extends String, ? extends Repr> entry : map.entrySet()) {
      this.put(entry.getKey(), entry.getValue());
    }
  }

  @Override
  public Attrs updated(@Nullable String key, @Nullable Repr value) {
    Objects.requireNonNull(key, "key");
    Objects.requireNonNull(value, "value");
    if (this.shape.size < 0) {
      return this.updatedHashed(key, value);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.updatedPacked(key, value);
    } else {
      return this.updatedInline(key, value);
    }
  }

  private Attrs updatedInline(String key, Repr value) {
    final AttrsShape[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final AttrsShape field = fields[i];
      if (key.equals(field.key)) {
        switch (field.size - 1) {
          case 0:
            return new Attrs(0, this.size, this.shape, value, this.head, this.foot);
          case 1:
            return new Attrs(0, this.size, this.shape, this.slots, value, this.foot);
          case 2:
            return new Attrs(0, this.size, this.shape, this.slots, this.head, value);
          default:
            throw new AssertionError(Integer.toString(field.size - 1));
        }
      }
    }

    final AttrsShape newShape = this.shape.getChild(key);
    switch (newShape.size) {
      case 1:
        return new Attrs(0, newShape.size, newShape, value, null, null);
      case 2:
        return new Attrs(0, newShape.size, newShape, this.slots, value, null);
      case 3:
        return new Attrs(0, newShape.size, newShape, this.slots, this.head, value);
      case 4:
        final Repr[] newSlots = new Repr[4];
        newSlots[0] = (Repr) this.slots;
        newSlots[1] = (Repr) this.head;
        newSlots[2] = (Repr) this.foot;
        newSlots[3] = value;
        return new Attrs(0, newShape.size, newShape, newSlots, null, null);
      default:
        throw new AssertionError(Integer.toString(newShape.size - 1));
    }
  }

  private Attrs updatedPacked(String key, Repr value) {
    final AttrsShape shape = this.shape;
    final Repr[] slots = (Repr[]) Assume.nonNull(this.slots);
    final int index = shape.lookup(key);
    if (index >= 0) {
      if (value == slots[index]) {
        return this;
      } else {
        final Repr[] newSlots = new Repr[AttrsShape.expand(shape.size)];
        System.arraycopy(slots, 0, newSlots, 0, shape.size);
        slots[index] = value;
        return new Attrs(0, this.size, shape, newSlots, null, null);
      }
    }

    if (shape.size < MAX_PACKED_SIZE) {
      final AttrsShape newShape = shape.getChild(key);
      final Repr[] newSlots = new Repr[AttrsShape.expand(newShape.size)];
      System.arraycopy(slots, 0, newSlots, 0, shape.size);
      newSlots[newShape.size - 1] = value;
      return new Attrs(0, newShape.size, newShape, newSlots, null, null);
    } else {
      final Attrs newAttrs = new Attrs(0, shape.size + 1, AttrsShape.dictionary(),
                                      new AttrEntry[AttrsShape.expand((shape.size + 1) * 10 / 7)],
                                      null, null);
      newAttrs.buildHashTable(shape.fields(), slots, -1);
      final AttrEntry entry = new AttrEntry(key, value);
      newAttrs.putEntry(key.hashCode(), entry);
      newAttrs.appendEntry(entry);
      return newAttrs;
    }
  }

  private Attrs updatedHashed(String key, Repr value) {
    final int hash = key.hashCode();
    AttrEntry entry = this.getEntry(hash, key);
    if (entry != null) {
      if (value == entry.value) {
        return this;
      } else {
        final Attrs newAttrs = new Attrs(0, this.size, this.shape,
                                         this.slots, this.head, this.foot);
        newAttrs.dealiasHashTable(newAttrs.size, null);
        entry = Assume.nonNull(newAttrs.getEntry(hash, key));
        entry.value = value;
        return newAttrs;
      }
    }

    final Attrs newAttrs = new Attrs(0, this.size, this.shape,
                                     this.slots, this.head, this.foot);
    newAttrs.dealiasHashTable(newAttrs.size + 1, null);
    entry = new AttrEntry(key, value);
    newAttrs.putEntry(hash, entry);
    newAttrs.appendEntry(entry);
    return newAttrs;
  }

  public Attrs let(String key, Repr value) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      return this.updated(key, value);
    } else {
      this.put(key, value);
      return this;
    }
  }

  @Override
  public @Nullable Repr remove(@Nullable Object key) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    if (this.shape.size == 0 || !(key instanceof String)) {
      return null;
    } else if (this.shape.size < 0) {
      return this.removeHashed((String) key);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.removePacked((String) key);
    } else {
      return this.removeInline((String) key);
    }
  }

  private @Nullable Repr removeInline(String key) {
    Repr oldValue = null;
    final AttrsShape shape = this.shape;

    // Capture current inline value slots.
    final Repr slot0 = shape.size > 0 ? (Repr) this.slots : null;
    final Repr slot1 = shape.size > 1 ? (Repr) this.head : null;
    final Repr slot2 = shape.size > 2 ? (Repr) this.foot : null;

    final AttrsShape[] fields = shape.fields();
    final int fieldCount = fields.length;

    // Search fields for matching key.
    int index = -1;
    for (int i = 0; i < fieldCount; i += 1) {
      final AttrsShape field = fields[i];
      if (key.equals(field.key)) {
        // Capture the previous value associated with the matched key
        // and clear the inline value slot.
        index = field.size - 1;
        switch (index) {
          case 0:
            oldValue = (Repr) this.slots;
            this.slots = null;
            break;
          case 1:
            oldValue = (Repr) this.head;
            this.head = null;
            break;
          case 2:
            oldValue = (Repr) this.foot;
            this.foot = null;
            break;
          default:
            throw new AssertionError(Integer.toString(index));
        }
        break;
      }
    }
    if (index < 0) {
      // No matching key was found.
      return null;
    }

    // Update the object shape to reflect the removed field.
    if (index == shape.size - 1) {
      // The leaf field of the shape was removed; revert to the parent shape.
      // The inline value slot for the removed key has already been nulled out.
      this.shape = Assume.nonNull(shape.parent);
      this.size = shape.size - 1;
    } else {
      // Build a hash table with the remaining fields.
      this.slots = new AttrEntry[AttrsShape.expand((shape.size - 1) * 10 / 7)];
      this.head = null;
      this.foot = null;
      // Loop over all previous fields.
      for (int i = 0; i < fieldCount; i += 1) {
        // Skip the removed field.
        if (i != index) {
          final AttrsShape field = fields[i];
          // Lookup the value of the remaining field.
          final Repr value;
          switch (field.size - 1) {
            case 0:
              value = Assume.nonNull(slot0);
              break;
            case 1:
              value = Assume.nonNull(slot1);
              break;
            case 2:
              value = Assume.nonNull(slot2);
              break;
            default:
              throw new AssertionError(Integer.toString(field.size - 1));
          }
          // Insert the remaining field into the hash table.
          final AttrEntry entry = new AttrEntry(Assume.nonNull(field.key), value);
          this.putEntry(Assume.nonNull(field.key).hashCode(), entry);
          this.appendEntry(entry);
        }
      }
      this.shape = AttrsShape.dictionary();
      this.size = shape.size - 1;
    }

    return oldValue;
  }

  private @Nullable Repr removePacked(String key) {
    final AttrsShape shape = this.shape;
    final int index = shape.lookup(key);
    if (index < 0) {
      // No matching key was found.
      return null;
    }

    final Repr[] slots = (Repr[]) Assume.nonNull(this.slots);
    final Repr oldValue = slots[index];
    // Update the object shape to reflect the removed field.
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
        final Repr[] newSlots = new Repr[AttrsShape.expand(shape.size - 1)];
        System.arraycopy(slots, 0, newSlots, 0, shape.size - 1);
        this.slots = newSlots;
        this.flags &= ~ALIASED_FLAG;
      } else {
        // Clear the value slot of the removed key.
        slots[index] = null;
      }
      this.shape = Assume.nonNull(shape.parent);
      this.size = shape.size - 1;
    } else {
      // Build a hash table with the remaining fields.
      this.slots = new AttrEntry[AttrsShape.expand((shape.size - 1) * 10 / 7)];
      this.head = null;
      this.foot = null;
      this.buildHashTable(shape.fields(), slots, index);
      this.shape = AttrsShape.dictionary();
      this.size = shape.size - 1;
    }
    return oldValue;
  }

  private @Nullable Repr removeHashed(String key) {
    if ((this.flags & ALIASED_FLAG) != 0) {
      final AttrEntry entry = this.getEntry(key.hashCode(), key);
      if (entry != null) {
        this.dealiasHashTable(this.size - 1, key);
        this.size -= 1;
        return entry.value;
      } else {
        return null;
      }
    } else {
      final AttrEntry entry = this.removeEntry(key.hashCode(), key);
      if (entry != null) {
        this.detachEntry(entry);
        this.size -= 1;
        return entry.value;
      } else {
        return null;
      }
    }
  }

  @Override
  public Attrs removed(@Nullable Object key) {
    if (this.shape.size == 0 || !(key instanceof String)) {
      return this;
    } else if (this.shape.size < 0) {
      return this.removedHashed((String) key);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return this.removedPacked((String) key);
    } else {
      return this.removedInline((String) key);
    }
  }

  private Attrs removedInline(String key) {
    final AttrsShape shape = this.shape;

    // Capture current inline value slots.
    Repr slot0 = shape.size > 0 ? (Repr) this.slots : null;
    Repr slot1 = shape.size > 1 ? (Repr) this.head : null;
    Repr slot2 = shape.size > 2 ? (Repr) this.foot : null;

    final AttrsShape[] fields = shape.fields();
    final int fieldCount = fields.length;

    // Search fields for matching key.
    int index = -1;
    for (int i = 0; i < fieldCount; i += 1) {
      final AttrsShape field = fields[i];
      if (key.equals(field.key)) {
        // Clear the captured inline value slot.
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
    }
    if (index < 0) {
      // No matching key was found.
      return this;
    }

    // Update the object shape to reflect the removed field.
    if (index == shape.size - 1) {
      // The leaf field of the shape was removed; revert to the parent shape.
      // The captured inline value slot for the removed key has already been nulled out.
      return new Attrs(0, shape.size - 1, Assume.nonNull(shape.parent), slot0, slot1, slot2);
    } else {
      // Build a hash table with the remaining fields.
      final Attrs newAttrs = new Attrs(0, shape.size - 1, AttrsShape.dictionary(),
                                      new AttrEntry[AttrsShape.expand((shape.size - 1) * 10 / 7)],
                                      null, null);
      // Loop over all previous fields.
      for (int i = 0; i < fieldCount; i += 1) {
        // Skip the removed field.
        if (i != index) {
          final AttrsShape field = fields[i];
          // Lookup the value of the remaining field.
          final Repr value;
          switch (field.size - 1) {
            case 0:
              value = Assume.nonNull(slot0);
              break;
            case 1:
              value = Assume.nonNull(slot1);
              break;
            case 2:
              value = Assume.nonNull(slot2);
              break;
            default:
              throw new AssertionError(Integer.toString(field.size - 1));
          }
          // Insert the remaining field into the hash table.
          final AttrEntry entry = new AttrEntry(Assume.nonNull(field.key), value);
          newAttrs.putEntry(Assume.nonNull(field.key).hashCode(), entry);
          newAttrs.appendEntry(entry);
        }
      }
      return newAttrs;
    }
  }

  private Attrs removedPacked(String key) {
    final AttrsShape shape = this.shape;
    final int index = shape.lookup(key);
    if (index < 0) {
      // No matching key was found.
      return this;
    }

    final Repr[] slots = (Repr[]) Assume.nonNull(this.slots);
    // Update the object shape to reflect the removed field.
    if (index == shape.size - 1) {
      // The leaf field of the shape was removed; revert to the parent shape.
      if (Assume.nonNull(shape.parent).size == MAX_INLINE_SIZE) {
        // Inline the remaining value slots.
        return new Attrs(0, shape.size - 1, Assume.nonNull(shape.parent), slots[0], slots[1], slots[2]);
      } else {
        // Clone the remaining value slots, excluding the last (removed) value.
        final Repr[] newSlots = new Repr[AttrsShape.expand(shape.size - 1)];
        System.arraycopy(slots, 0, newSlots, 0, shape.size - 1);
        return new Attrs(0, shape.size - 1, Assume.nonNull(shape.parent), newSlots, null, null);
      }
    } else {
      // Build a hash table with the remaining fields.
      final Attrs newAttrs = new Attrs(0, shape.size - 1, AttrsShape.dictionary(),
                                       new AttrEntry[AttrsShape.expand((shape.size - 1) * 10 / 7)],
                                       null, null);
      newAttrs.buildHashTable(shape.fields(), slots, index);
      return newAttrs;
    }
  }

  private Attrs removedHashed(String key) {
    final AttrEntry entry = this.getEntry(key.hashCode(), key);
    if (entry != null) {
      final Attrs newAttrs = new Attrs(0, this.size - 1, this.shape,
                                       this.slots, this.head, this.foot);
      newAttrs.dealiasHashTable(this.size - 1, key);
      return newAttrs;
    } else {
      return this;
    }
  }

  @Override
  public void clear() {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    this.shape = AttrsShape.empty();
    this.slots = null;
    this.head = null;
    this.foot = null;
    this.size = 0;
    this.flags |= ALIASED_FLAG;
  }

  private @Nullable AttrEntry getEntry(int hash, String key) {
    final AttrEntry[] slots = (AttrEntry[]) Assume.nonNull(this.slots);
    AttrEntry bucket = slots[Math.abs(hash % slots.length)];
    while (bucket != null) {
      if (key.equals(bucket.key)) {
        return bucket;
      }
      bucket = bucket.nextCollision;
    }
    return null;
  }

  private void putEntry(int hash, AttrEntry entry) {
    final AttrEntry[] slots = (AttrEntry[]) Assume.nonNull(this.slots);
    final int index = Math.abs(hash % slots.length);
    AttrEntry bucket = slots[index];
    if (bucket != null) {
      if (entry.key.equals(bucket.key)) {
        entry.nextCollision = bucket.nextCollision;
        slots[index] = bucket;
      } else {
        AttrEntry prev = bucket;
        do {
          bucket = prev.nextCollision;
          if (bucket != null) {
            if (entry.key.equals(bucket.key)) {
              entry.nextCollision = bucket.nextCollision;
              prev.nextCollision = entry;
              break;
            } else {
              prev = bucket;
            }
          } else {
            prev.nextCollision = entry;
            break;
          }
        } while (true);
      }
    } else {
      slots[index] = entry;
    }
  }

  private @Nullable AttrEntry removeEntry(int hash, String key) {
    final AttrEntry[] slots = (AttrEntry[]) Assume.nonNull(this.slots);
    final int index = Math.abs(hash % slots.length);
    AttrEntry bucket = slots[index];
    if (bucket != null) {
      if (key.equals(bucket.key)) {
        slots[index] = bucket.nextCollision;
        bucket.nextCollision = null;
        return bucket;
      } else {
        AttrEntry prev = bucket;
        do {
          bucket = prev.nextCollision;
          if (bucket != null) {
            if (key.equals(bucket.key)) {
              prev.nextCollision = bucket.nextCollision;
              bucket.nextCollision = null;
              return bucket;
            } else {
              prev = bucket;
            }
          } else {
            break;
          }
        } while (true);
      }
    }
    return null;
  }

  private void buildHashTable(AttrsShape[] fields, Repr[] slots, int excludeIndex) {
    for (int i = 0; i < fields.length; i += 1) {
      if (i != excludeIndex) {
        final AttrsShape field = fields[i];
        final String key = Assume.nonNull(field.key);
        final Repr value = slots[field.size - 1];
        final AttrEntry entry = new AttrEntry(key, value);
        this.putEntry(key.hashCode(), entry);
        this.appendEntry(entry);
      }
    }
  }

  private void resizeHashTable(int newSize) {
    final int newCapacity = AttrsShape.expand(newSize * 10 / 7);
    if (newCapacity <= ((AttrEntry[]) Assume.nonNull(this.slots)).length) {
      return;
    }

    AttrEntry entry = (AttrEntry) this.head;
    this.slots = new AttrEntry[newCapacity];
    this.head = null;
    this.foot = null;

    while (entry != null) {
      final AttrEntry next = entry.next;
      entry.prev = null;
      entry.next = null;
      entry.nextCollision = null;

      this.putEntry(entry.key.hashCode(), entry);
      this.appendEntry(entry);

      entry = next;
    }
  }

  private void dealiasHashTable(int newSize, @Nullable String excludeKey) {
    final int newCapacity = AttrsShape.expand(newSize * 10 / 7);
    AttrEntry head = (AttrEntry) this.head;
    this.slots = new AttrEntry[newCapacity];
    this.head = null;
    this.foot = null;

    while (head != null) {
      if (excludeKey == null || !excludeKey.equals(head.key)) {
        final AttrEntry entry = new AttrEntry(head.key, head.value);
        this.putEntry(entry.key.hashCode(), entry);
        this.appendEntry(entry);
      }
      head = head.next;
    }

    this.flags &= ~ALIASED_FLAG;
  }

  private void appendEntry(AttrEntry entry) {
    final AttrEntry foot = (AttrEntry) this.foot;
    if (foot != null) {
      foot.next = entry;
    } else {
      this.head = entry;
    }
    entry.next = null;
    entry.prev = foot;
    this.foot = entry;
  }

  private void detachEntry(AttrEntry entry) {
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

  @Override
  public boolean isValidObject() {
    return true;
  }

  @Override
  public Object objectValue() {
    return this;
  }

  public boolean isMutable() {
    return (this.flags & IMMUTABLE_FLAG) == 0;
  }

  public Attrs asMutable() {
    return this.isMutable() ? this : this.clone();
  }

  @Override
  public Attrs clone() {
    if (this.shape.size < 0 || this.shape.size > MAX_INLINE_SIZE) {
      this.flags |= ALIASED_FLAG;
    }
    return new Attrs(this.flags & ~IMMUTABLE_FLAG, this.size,
                     this.shape, this.slots, this.head, this.foot);
  }

  @Override
  public Attrs commit() {
    if ((this.flags & IMMUTABLE_FLAG) == 0) {
      this.flags |= IMMUTABLE_FLAG;
      if (this.shape.size < 0) {
        this.commitHashed();
      } else if (this.shape.size > MAX_INLINE_SIZE) {
        this.commitPacked();
      } else if (this.shape.size > 0) {
        this.commitInline();
      }
    }
    return this;
  }

  private void commitInline() {
    if (this.shape.size > 0) {
      ((Repr) Assume.nonNull(this.slots)).commit();
    }
    if (this.shape.size > 1) {
      ((Repr) Assume.nonNull(this.head)).commit();
    }
    if (this.shape.size > 2) {
      ((Repr) Assume.nonNull(this.foot)).commit();
    }
  }

  private void commitPacked() {
    final Repr[] slots = (Repr[]) Assume.nonNull(this.slots);
    for (int i = 0; i < this.shape.size; i += 1) {
      slots[i].commit();
    }
  }

  private void commitHashed() {
    AttrEntry entry = (AttrEntry) this.head;
    while (entry != null) {
      entry.value.commit();
      entry = entry.next;
    }
  }

  @Override
  public void forEach(BiConsumer<? super String, ? super Repr> action) {
    if (this.shape.size < 0) {
      this.forEachHashed(action);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      this.forEachPacked(action);
    } else if (this.shape.size > 0) {
      this.forEachInline(action);
    }
  }

  private void forEachInline(BiConsumer<? super String, ? super Repr> action) {
    final AttrsShape[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final AttrsShape field = fields[i];
      final String key = field.key;
      final Repr value;
      switch (field.size - 1) {
        case 0:
          value = (Repr) this.slots;
          break;
        case 1:
          value = (Repr) this.head;
          break;
        case 2:
          value = (Repr) this.foot;
          break;
        default:
          throw new AssertionError(Integer.toString(field.size - 1));
      }
      action.accept(key, value);
    }
  }

  private void forEachPacked(BiConsumer<? super String, ? super Repr> action) {
    final AttrsShape[] fields = this.shape.fields();
    final Repr[] slots = (Repr[]) Assume.nonNull(this.slots);
    for (int i = 0; i < fields.length; i += 1) {
      final AttrsShape field = fields[i];
      final String key = field.key;
      final Repr value = slots[field.size - 1];
      action.accept(key, value);
    }
  }

  private void forEachHashed(BiConsumer<? super String, ? super Repr> action) {
    AttrEntry entry = (AttrEntry) this.head;
    while (entry != null) {
      final AttrEntry next = entry.next;
      action.accept(entry.key, entry.value);
      entry = next;
    }
  }

  @Override
  public void forEach(Consumer<? super Map.Entry<String, Repr>> action) {
    if (this.shape.size < 0) {
      this.forEachHashed(action);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      this.forEachPacked(action);
    } else if (this.shape.size > 0) {
      this.forEachInline(action);
    }
  }

  private void forEachInline(Consumer<? super Map.Entry<String, Repr>> action) {
    final AttrsShape[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final AttrsShape field = fields[i];
      final String key = field.key;
      final Repr value;
      switch (field.size - 1) {
        case 0:
          value = (Repr) this.slots;
          break;
        case 1:
          value = (Repr) this.head;
          break;
        case 2:
          value = (Repr) this.foot;
          break;
        default:
          throw new AssertionError(Integer.toString(field.size - 1));
      }
      action.accept(new SimpleImmutableEntry<String, Repr>(key, value));
    }
  }

  private void forEachPacked(Consumer<? super Map.Entry<String, Repr>> action) {
    final AttrsShape[] fields = this.shape.fields();
    final Repr[] slots = (Repr[]) Assume.nonNull(this.slots);
    for (int i = 0; i < fields.length; i += 1) {
      final AttrsShape field = fields[i];
      final String key = field.key;
      final Repr value = slots[field.size - 1];
      action.accept(new SimpleImmutableEntry<String, Repr>(key, value));
    }
  }

  private void forEachHashed(Consumer<? super Map.Entry<String, Repr>> action) {
    AttrEntry entry = (AttrEntry) this.head;
    while (entry != null) {
      final AttrEntry next = entry.next;
      action.accept(entry);
      entry = next;
    }
  }

  @Override
  public Iterator<Map.Entry<String, Repr>> iterator() {
    if (this.shape.size < 0) {
      return new AttrsHashedEntryIterator((AttrEntry) this.head);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return new AttrsPackedEntryIterator(this);
    } else if (this.shape.size > 0) {
      return new AttrsInlineEntryIterator(this);
    } else {
      return AttrsInlineEntryIterator.EMPTY;
    }
  }

  public Iterator<String> keyIterator() {
    if (this.shape.size < 0) {
      return new AttrsHashedKeyIterator((AttrEntry) this.head);
    } else {
      return new AttrsPackedKeyIterator(this);
    }
  }

  public Iterator<Repr> valueIterator() {
    if (this.shape.size < 0) {
      return new AttrsHashedValueIterator((AttrEntry) this.head);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return new AttrsPackedValueIterator(this);
    } else {
      return new AttrsInlineValueIterator(this);
    }
  }

  @Override
  public Set<Map.Entry<String, Repr>> entrySet() {
    return new AttrsEntrySet(this);
  }

  @Override
  public Set<String> keySet() {
    return new AttrsKeySet(this);
  }

  @Override
  public Collection<Repr> values() {
    return new AttrsValues(this);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map<?, ?>) {
      final Map<?, ?> that = (Map<?, ?>) other;
      if (this.size() == that.size()) {
        final Iterator<? extends Map.Entry<?, ?>> those = that.entrySet().iterator();
        while (those.hasNext()) {
          final Map.Entry<?, ?> entry = those.next();
          if (!Objects.equals(entry.getValue(), this.get(entry.getKey()))) {
            return false;
          }
        }
        return true;
      }
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
    if (this.isEmpty()) {
      notation.beginInvoke("Attrs", "empty").endInvoke();
    } else {
      notation.beginInvoke("Attrs", "of");
      for (Map.Entry<String, Repr> entry : this) {
        notation.appendArgument(entry.getKey())
                .appendArgument(entry.getValue());
      }
      notation.endInvoke();
    }
  }

  void writeWithAttrs(Notation notation) {
    for (Map.Entry<String, Repr> entry : this) {
      notation.beginInvoke("withAttr");
      notation.appendArgument(entry.getKey());
      if (entry.getValue() != UnitRepr.unit()) {
        notation.appendArgument(entry.getValue());
      }
      notation.endInvoke();
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final int MAX_INLINE_SIZE = 3;

  static final int MAX_PACKED_SIZE = 8;

  static final int IMMUTABLE_FLAG = 1 << 0;

  static final int ALIASED_FLAG = 1 << 1;

  private static final Attrs EMPTY = new Attrs(IMMUTABLE_FLAG, 0,
                                               AttrsShape.empty(),
                                               null, null, null);

  public static Attrs empty() {
    return EMPTY;
  }

  public static Attrs of() {
    return new Attrs(0, 0, AttrsShape.empty(), null, null, null);
  }

  public static Attrs of(String key, @Nullable Object value) {
    value = Repr.from(value);
    final AttrsShape shape = AttrsShape.empty().getChild(key);
    return new Attrs(0, 1, shape, value, null, null);
  }

  public static Attrs of(String key0, @Nullable Object value0,
                         String key1, @Nullable Object value1) {
    value0 = Repr.from(value0);
    value1 = Repr.from(value1);
    final AttrsShape shape = AttrsShape.empty().getChild(key0).getChild(key1);
    return new Attrs(0, 2, shape, value0, value1, null);
  }

  public static Attrs of(String key0, @Nullable Object value0,
                         String key1, @Nullable Object value1,
                         String key2, @Nullable Object value2) {
    value0 = Repr.from(value0);
    value1 = Repr.from(value1);
    value2 = Repr.from(value2);
    final AttrsShape shape = AttrsShape.empty().getChild(key0).getChild(key1)
                                                 .getChild(key2);
    return new Attrs(0, 3, shape, value0, value1, value2);
  }

  public static Attrs of(String key0, @Nullable Object value0,
                         String key1, @Nullable Object value1,
                         String key2, @Nullable Object value2,
                         String key3, @Nullable Object value3) {
    final Repr[] slots = new Repr[] {Repr.from(value0), Repr.from(value1),
                                     Repr.from(value2), Repr.from(value3)};
    final AttrsShape shape = AttrsShape.empty().getChild(key0).getChild(key1)
                                                 .getChild(key2).getChild(key3);
    return new Attrs(0, 4, shape, slots, null, null);
  }

  public static Attrs of(@Nullable Object... keyValuePairs) {
    Objects.requireNonNull(keyValuePairs);
    final int n = keyValuePairs.length;
    if (n % 2 != 0) {
      throw new IllegalArgumentException("Odd number of key-value pairs");
    }
    final Attrs attrs = Attrs.of();
    for (int i = 0; i < n; i += 2) {
      attrs.put((String) keyValuePairs[i], Repr.from(keyValuePairs[i + 1]));
    }
    return attrs;
  }

}

final class AttrEntry implements Map.Entry<String, Repr> {

  final String key;
  Repr value;
  @Nullable AttrEntry prev;
  @Nullable AttrEntry next;
  @Nullable AttrEntry nextCollision;

  AttrEntry(String key, Repr value) {
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
    } else if (other instanceof Map.Entry<?, ?>) {
      final Map.Entry<?, ?> that = (Map.Entry<?, ?>) other;
      return this.key.equals(that.getKey()) && this.value.equals(that.getValue());
    }
    return false;
  }

  @Override
  public int hashCode() {
    return this.key.hashCode() ^ this.value.hashCode();
  }

}

final class AttrsInlineEntryIterator implements Iterator<Map.Entry<String, Repr>> {

  final Attrs attrs;
  final AttrsShape shape;
  final AttrsShape[] fields;
  int index;

  AttrsInlineEntryIterator(Attrs attrs) {
    this.attrs = attrs;
    this.shape = attrs.shape;
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
    }
    if (this.attrs.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    final String key = this.fields[index].key;
    final Repr value;
    switch (index) {
      case 0:
        value = (Repr) this.attrs.slots;
        break;
      case 1:
        value = (Repr) this.attrs.head;
        break;
      case 2:
        value = (Repr) this.attrs.foot;
        break;
      default:
        throw new AssertionError(Integer.toString(index));
    }
    return new SimpleImmutableEntry<String, Repr>(key, value);
  }

  static final AttrsInlineEntryIterator EMPTY = new AttrsInlineEntryIterator(Attrs.empty());

}

final class AttrsPackedEntryIterator implements Iterator<Map.Entry<String, Repr>> {

  final Attrs attrs;
  final AttrsShape shape;
  final AttrsShape[] fields;
  int index;

  AttrsPackedEntryIterator(Attrs attrs) {
    this.attrs = attrs;
    this.shape = attrs.shape;
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
    }
    if (this.attrs.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    final String key = this.fields[index].key;
    final Repr value = ((Repr[]) Assume.nonNull(this.attrs.slots))[index];
    return new SimpleImmutableEntry<String, Repr>(key, value);
  }

}

final class AttrsHashedEntryIterator implements Iterator<Map.Entry<String, Repr>> {

  @Nullable AttrEntry entry;

  AttrsHashedEntryIterator(@Nullable AttrEntry entry) {
    this.entry = entry;
  }

  @Override
  public boolean hasNext() {
    return this.entry != null;
  }

  @Override
  public Map.Entry<String, Repr> next() {
    final AttrEntry entry = this.entry;
    if (entry != null) {
      this.entry = entry.next;
      return entry;
    } else {
      throw new NoSuchElementException();
    }
  }

}

final class AttrsEntrySet extends AbstractSet<Map.Entry<String, Repr>> {

  final Attrs attrs;

  AttrsEntrySet(Attrs attrs) {
    this.attrs = attrs;
  }

  @Override
  public int size() {
    return this.attrs.size();
  }

  @Override
  public Iterator<Map.Entry<String, Repr>> iterator() {
    return this.attrs.iterator();
  }

}

final class AttrsPackedKeyIterator implements Iterator<String> {

  final Attrs attrs;
  final AttrsShape shape;
  final AttrsShape[] fields;
  int index;

  AttrsPackedKeyIterator(Attrs attrs) {
    this.attrs = attrs;
    this.shape = attrs.shape;
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
    }
    if (this.attrs.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    return Assume.nonNull(this.fields[index].key);
  }

}

final class AttrsHashedKeyIterator implements Iterator<String> {

  @Nullable AttrEntry entry;

  AttrsHashedKeyIterator(@Nullable AttrEntry entry) {
    this.entry = entry;
  }

  @Override
  public boolean hasNext() {
    return this.entry != null;
  }

  @Override
  public String next() {
    final AttrEntry entry = this.entry;
    if (entry != null) {
      this.entry = entry.next;
      return entry.key;
    } else {
      throw new NoSuchElementException();
    }
  }

}

final class AttrsKeySet extends AbstractSet<String> {

  final Attrs attrs;

  AttrsKeySet(Attrs attrs) {
    this.attrs = attrs;
  }

  @Override
  public int size() {
    return this.attrs.size();
  }

  @Override
  public Iterator<String> iterator() {
    return this.attrs.keyIterator();
  }

}

final class AttrsInlineValueIterator implements Iterator<Repr> {

  final Attrs attrs;
  final AttrsShape shape;
  int index;

  AttrsInlineValueIterator(Attrs attrs) {
    this.attrs = attrs;
    this.shape = attrs.shape;
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
    }
    if (this.attrs.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    switch (index) {
      case 0:
        return (Repr) Assume.nonNull(this.attrs.slots);
      case 1:
        return (Repr) Assume.nonNull(this.attrs.head);
      case 2:
        return (Repr) Assume.nonNull(this.attrs.foot);
      default:
        throw new AssertionError(Integer.toString(index));
    }
  }

}

final class AttrsPackedValueIterator implements Iterator<Repr> {

  final Attrs attrs;
  final AttrsShape shape;
  int index;

  AttrsPackedValueIterator(Attrs attrs) {
    this.attrs = attrs;
    this.shape = attrs.shape;
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
    }
    if (this.attrs.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    return ((Repr[]) Assume.nonNull(this.attrs.slots))[index];
  }

}

final class AttrsHashedValueIterator implements Iterator<Repr> {

  @Nullable AttrEntry entry;

  AttrsHashedValueIterator(@Nullable AttrEntry entry) {
    this.entry = entry;
  }

  @Override
  public boolean hasNext() {
    return this.entry != null;
  }

  @Override
  public Repr next() {
    final AttrEntry entry = this.entry;
    if (entry != null) {
      this.entry = entry.next;
      return entry.value;
    } else {
      throw new NoSuchElementException();
    }
  }

}

final class AttrsValues extends AbstractCollection<Repr> {

  final Attrs attrs;

  AttrsValues(Attrs attrs) {
    this.attrs = attrs;
  }

  @Override
  public int size() {
    return this.attrs.size();
  }

  @Override
  public Iterator<Repr> iterator() {
    return this.attrs.valueIterator();
  }

}
