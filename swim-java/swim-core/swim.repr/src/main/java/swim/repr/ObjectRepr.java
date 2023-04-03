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
public final class ObjectRepr implements Repr, UpdatableMap<String, Repr>, Iterable<Map.Entry<String, Repr>>, ToSource {

  int flags;
  int size;
  Attrs attrs;
  ObjectShape shape;
  @Nullable Object slots; // ObjectEntry[] | Repr[] | Repr | null
  @Nullable Object head; // ObjectEntry | Repr | null
  @Nullable Object foot; // ObjectEntry | Repr | null

  ObjectRepr(int flags, int size, Attrs attrs, ObjectShape shape,
             @Nullable Object slots, @Nullable Object head,
             @Nullable Object foot) {
    this.flags = flags;
    this.size = size;
    this.attrs = attrs;
    this.shape = shape;
    this.slots = slots;
    this.head = head;
    this.foot = foot;
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
  public ObjectRepr letAttrs(Attrs attrs) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      return this.withAttrs(attrs);
    } else {
      this.attrs = attrs;
      return this;
    }
  }

  @Override
  public ObjectRepr letAttr(String key, Repr value) {
    return this.letAttrs(this.attrs.let(key, value));
  }

  @Override
  public ObjectRepr letAttr(String key) {
    return this.letAttr(key, Repr.unit());
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public ObjectRepr withAttrs(Attrs attrs) {
    if (attrs == this.attrs) {
      return this;
    } else {
      if (this.shape.size < 0 || this.shape.size > MAX_INLINE_SIZE) {
        this.flags |= ALIASED_FLAG;
      }
      return new ObjectRepr(this.flags & ~IMMUTABLE_FLAG, this.size, attrs,
                            this.shape, this.slots, this.head, this.foot);
    }
  }

  @Override
  public ObjectRepr withAttr(String key, Repr value) {
    return this.withAttrs(this.attrs.updated(key, value));
  }

  @Override
  public ObjectRepr withAttr(String key) {
    return this.withAttr(key, Repr.unit());
  }

  public ObjectShape shape() {
    return this.shape;
  }

  @Override
  public boolean isDefinite() {
    return this.size != 0;
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
    ObjectEntry entry = (ObjectEntry) this.head;
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
    final ObjectShape[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final ObjectShape field = fields[i];
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
    final ObjectEntry entry = this.getEntry(key.hashCode(), key);
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
      throw new UnsupportedOperationException("immutable");
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
      throw new UnsupportedOperationException("immutable");
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
    final ObjectShape[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final ObjectShape field = fields[i];
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

    final ObjectShape newShape = this.shape.getChild(key);
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
    final ObjectShape shape = this.shape;
    final Repr[] slots = (Repr[]) Assume.nonNull(this.slots);
    final int index = shape.lookup(key);
    if (index >= 0) {
      final Repr oldValue = slots[index];
      if (!ifAbsent && value != oldValue) {
        if ((this.flags & ALIASED_FLAG) != 0) {
          final Repr[] newSlots = new Repr[ObjectShape.expand(shape.size)];
          System.arraycopy(slots, 0, newSlots, 0, shape.size);
          this.slots = newSlots;
          this.flags &= ~ALIASED_FLAG;
        }
        slots[index] = value;
      }
      return oldValue;
    }

    if (shape.size < MAX_PACKED_SIZE) {
      final ObjectShape newShape = shape.getChild(key);
      if (slots.length >= newShape.size && (this.flags & ALIASED_FLAG) == 0) {
        slots[newShape.size - 1] = value;
      } else {
        final Repr[] newSlots = new Repr[ObjectShape.expand(newShape.size)];
        System.arraycopy(slots, 0, newSlots, 0, shape.size);
        newSlots[newShape.size - 1] = value;
        this.slots = newSlots;
        this.flags &= ~ALIASED_FLAG;
      }
      this.shape = newShape;
      this.size = newShape.size;
    } else {
      this.slots = new ObjectEntry[ObjectShape.expand((shape.size + 1) * 10 / 7)];
      this.head = null;
      this.foot = null;
      this.buildHashTable(shape.fields(), slots, -1);
      final ObjectEntry entry = new ObjectEntry(key, value);
      this.putEntry(key.hashCode(), entry);
      this.appendEntry(entry);
      this.shape = ObjectShape.dictionary();
      this.size = shape.size + 1;
    }
    return null;
  }

  private @Nullable Repr putHashed(String key, Repr value, boolean ifAbsent) {
    final int hash = key.hashCode();
    ObjectEntry entry = this.getEntry(hash, key);
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
    entry = new ObjectEntry(key, value);
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
  public ObjectRepr updated(@Nullable String key, @Nullable Repr value) {
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

  private ObjectRepr updatedInline(String key, Repr value) {
    final ObjectShape[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final ObjectShape field = fields[i];
      if (key.equals(field.key)) {
        switch (field.size - 1) {
          case 0:
            return new ObjectRepr(0, this.size, this.attrs, this.shape, value, this.head, this.foot);
          case 1:
            return new ObjectRepr(0, this.size, this.attrs, this.shape, this.slots, value, this.foot);
          case 2:
            return new ObjectRepr(0, this.size, this.attrs, this.shape, this.slots, this.head, value);
          default:
            throw new AssertionError(Integer.toString(field.size - 1));
        }
      }
    }

    final ObjectShape newShape = this.shape.getChild(key);
    switch (newShape.size) {
      case 1:
        return new ObjectRepr(0, newShape.size, this.attrs, newShape, value, null, null);
      case 2:
        return new ObjectRepr(0, newShape.size, this.attrs, newShape, this.slots, value, null);
      case 3:
        return new ObjectRepr(0, newShape.size, this.attrs, newShape, this.slots, this.head, value);
      case 4:
        final Repr[] newSlots = new Repr[4];
        newSlots[0] = (Repr) this.slots;
        newSlots[1] = (Repr) this.head;
        newSlots[2] = (Repr) this.foot;
        newSlots[3] = value;
        return new ObjectRepr(0, newShape.size, this.attrs, newShape, newSlots, null, null);
      default:
        throw new AssertionError(Integer.toString(newShape.size - 1));
    }
  }

  private ObjectRepr updatedPacked(String key, Repr value) {
    final ObjectShape shape = this.shape;
    final Repr[] slots = (Repr[]) Assume.nonNull(this.slots);
    final int index = shape.lookup(key);
    if (index >= 0) {
      if (value == slots[index]) {
        return this;
      } else {
        final Repr[] newSlots = new Repr[ObjectShape.expand(shape.size)];
        System.arraycopy(slots, 0, newSlots, 0, shape.size);
        slots[index] = value;
        return new ObjectRepr(0, this.size, this.attrs, shape, newSlots, null, null);
      }
    }

    if (shape.size < MAX_PACKED_SIZE) {
      final ObjectShape newShape = shape.getChild(key);
      final Repr[] newSlots = new Repr[ObjectShape.expand(newShape.size)];
      System.arraycopy(slots, 0, newSlots, 0, shape.size);
      newSlots[newShape.size - 1] = value;
      return new ObjectRepr(0, newShape.size, this.attrs, newShape, newSlots, null, null);
    } else {
      final ObjectRepr newObject = new ObjectRepr(0, shape.size + 1, this.attrs, ObjectShape.dictionary(),
                                                  new ObjectEntry[ObjectShape.expand((shape.size + 1) * 10 / 7)],
                                                  null, null);
      newObject.buildHashTable(shape.fields(), slots, -1);
      final ObjectEntry entry = new ObjectEntry(key, value);
      newObject.putEntry(key.hashCode(), entry);
      newObject.appendEntry(entry);
      return newObject;
    }
  }

  private ObjectRepr updatedHashed(String key, Repr value) {
    final int hash = key.hashCode();
    ObjectEntry entry = this.getEntry(hash, key);
    if (entry != null) {
      if (value == entry.value) {
        return this;
      } else {
        final ObjectRepr newObject = new ObjectRepr(0, this.size, this.attrs,
                                                    this.shape, this.slots,
                                                    this.head, this.foot);
        newObject.dealiasHashTable(newObject.size, null);
        entry = Assume.nonNull(newObject.getEntry(hash, key));
        entry.value = value;
        return newObject;
      }
    }

    final ObjectRepr newObject = new ObjectRepr(0, this.size, this.attrs,
                                                this.shape, this.slots,
                                                this.head, this.foot);
    newObject.dealiasHashTable(newObject.size + 1, null);
    entry = new ObjectEntry(key, value);
    newObject.putEntry(hash, entry);
    newObject.appendEntry(entry);
    return newObject;
  }

  public ObjectRepr let(String key, Repr value) {
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
      throw new UnsupportedOperationException("immutable");
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
    final ObjectShape shape = this.shape;

    // Capture current inline value slots.
    final Repr slot0 = shape.size > 0 ? (Repr) this.slots : null;
    final Repr slot1 = shape.size > 1 ? (Repr) this.head : null;
    final Repr slot2 = shape.size > 2 ? (Repr) this.foot : null;

    final ObjectShape[] fields = shape.fields();
    final int fieldCount = fields.length;

    // Search fields for matching key.
    int index = -1;
    for (int i = 0; i < fieldCount; i += 1) {
      final ObjectShape field = fields[i];
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
      this.slots = new ObjectEntry[ObjectShape.expand((shape.size - 1) * 10 / 7)];
      this.head = null;
      this.foot = null;
      // Loop over all previous fields.
      for (int i = 0; i < fieldCount; i += 1) {
        // Skip the removed field.
        if (i != index) {
          final ObjectShape field = fields[i];
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
          final ObjectEntry entry = new ObjectEntry(Assume.nonNull(field.key), value);
          this.putEntry(Assume.nonNull(field.key).hashCode(), entry);
          this.appendEntry(entry);
        }
      }
      this.shape = ObjectShape.dictionary();
      this.size = shape.size - 1;
    }

    return oldValue;
  }

  private @Nullable Repr removePacked(String key) {
    final ObjectShape shape = this.shape;
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
        final Repr[] newSlots = new Repr[ObjectShape.expand(shape.size - 1)];
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
      this.slots = new ObjectEntry[ObjectShape.expand((shape.size - 1) * 10 / 7)];
      this.head = null;
      this.foot = null;
      this.buildHashTable(shape.fields(), slots, index);
      this.shape = ObjectShape.dictionary();
      this.size = shape.size - 1;
    }
    return oldValue;
  }

  private @Nullable Repr removeHashed(String key) {
    if ((this.flags & ALIASED_FLAG) != 0) {
      final ObjectEntry entry = this.getEntry(key.hashCode(), key);
      if (entry != null) {
        this.dealiasHashTable(this.size - 1, key);
        this.size -= 1;
        return entry.value;
      } else {
        return null;
      }
    } else {
      final ObjectEntry entry = this.removeEntry(key.hashCode(), key);
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
  public ObjectRepr removed(@Nullable Object key) {
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

  private ObjectRepr removedInline(String key) {
    final ObjectShape shape = this.shape;

    // Capture current inline value slots.
    Repr slot0 = shape.size > 0 ? (Repr) this.slots : null;
    Repr slot1 = shape.size > 1 ? (Repr) this.head : null;
    Repr slot2 = shape.size > 2 ? (Repr) this.foot : null;

    final ObjectShape[] fields = shape.fields();
    final int fieldCount = fields.length;

    // Search fields for matching key.
    int index = -1;
    for (int i = 0; i < fieldCount; i += 1) {
      final ObjectShape field = fields[i];
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
      return new ObjectRepr(0, shape.size - 1, this.attrs, Assume.nonNull(shape.parent),
                            slot0, slot1, slot2);
    } else {
      // Build a hash table with the remaining fields.
      final ObjectRepr newObject = new ObjectRepr(0, shape.size - 1, this.attrs,
                                                  ObjectShape.dictionary(),
                                                  new ObjectEntry[ObjectShape.expand((shape.size - 1) * 10 / 7)],
                                                  null, null);
      // Loop over all previous fields.
      for (int i = 0; i < fieldCount; i += 1) {
        // Skip the removed field.
        if (i != index) {
          final ObjectShape field = fields[i];
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
          final ObjectEntry entry = new ObjectEntry(Assume.nonNull(field.key), value);
          newObject.putEntry(Assume.nonNull(field.key).hashCode(), entry);
          newObject.appendEntry(entry);
        }
      }
      return newObject;
    }
  }

  private ObjectRepr removedPacked(String key) {
    final ObjectShape shape = this.shape;
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
        return new ObjectRepr(0, shape.size - 1, this.attrs, Assume.nonNull(shape.parent),
                              slots[0], slots[1], slots[2]);
      } else {
        // Clone the remaining value slots, excluding the last (removed) value.
        final Repr[] newSlots = new Repr[ObjectShape.expand(shape.size - 1)];
        System.arraycopy(slots, 0, newSlots, 0, shape.size - 1);
        return new ObjectRepr(0, shape.size - 1, this.attrs, Assume.nonNull(shape.parent),
                              newSlots, null, null);
      }
    } else {
      // Build a hash table with the remaining fields.
      final ObjectRepr newObject = new ObjectRepr(0, shape.size - 1, this.attrs,
                                                  ObjectShape.dictionary(),
                                                  new ObjectEntry[ObjectShape.expand((shape.size - 1) * 10 / 7)],
                                                  null, null);
      newObject.buildHashTable(shape.fields(), slots, index);
      return newObject;
    }
  }

  private ObjectRepr removedHashed(String key) {
    final ObjectEntry entry = this.getEntry(key.hashCode(), key);
    if (entry != null) {
      final ObjectRepr newObject = new ObjectRepr(0, this.size - 1, this.attrs, this.shape,
                                                  this.slots, this.head, this.foot);
      newObject.dealiasHashTable(this.size - 1, key);
      return newObject;
    } else {
      return this;
    }
  }

  @Override
  public void clear() {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    this.shape = ObjectShape.empty();
    this.slots = null;
    this.head = null;
    this.foot = null;
    this.size = 0;
    this.flags |= ALIASED_FLAG;
  }

  private @Nullable ObjectEntry getEntry(int hash, String key) {
    final ObjectEntry[] slots = (ObjectEntry[]) Assume.nonNull(this.slots);
    ObjectEntry bucket = slots[Math.abs(hash % slots.length)];
    while (bucket != null) {
      if (key.equals(bucket.key)) {
        return bucket;
      }
      bucket = bucket.nextCollision;
    }
    return null;
  }

  private void putEntry(int hash, ObjectEntry entry) {
    final ObjectEntry[] slots = (ObjectEntry[]) Assume.nonNull(this.slots);
    final int index = Math.abs(hash % slots.length);
    ObjectEntry bucket = slots[index];
    if (bucket != null) {
      if (entry.key.equals(bucket.key)) {
        entry.nextCollision = bucket.nextCollision;
        slots[index] = bucket;
      } else {
        ObjectEntry prev = bucket;
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

  private @Nullable ObjectEntry removeEntry(int hash, String key) {
    final ObjectEntry[] slots = (ObjectEntry[]) Assume.nonNull(this.slots);
    final int index = Math.abs(hash % slots.length);
    ObjectEntry bucket = slots[index];
    if (bucket != null) {
      if (key.equals(bucket.key)) {
        slots[index] = bucket.nextCollision;
        bucket.nextCollision = null;
        return bucket;
      } else {
        ObjectEntry prev = bucket;
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

  private void buildHashTable(ObjectShape[] fields, Repr[] slots, int excludeIndex) {
    for (int i = 0; i < fields.length; i += 1) {
      if (i != excludeIndex) {
        final ObjectShape field = fields[i];
        final String key = Assume.nonNull(field.key);
        final Repr value = slots[field.size - 1];
        final ObjectEntry entry = new ObjectEntry(key, value);
        this.putEntry(key.hashCode(), entry);
        this.appendEntry(entry);
      }
    }
  }

  private void resizeHashTable(int newSize) {
    final int newCapacity = ObjectShape.expand(newSize * 10 / 7);
    if (newCapacity <= ((ObjectEntry[]) Assume.nonNull(this.slots)).length) {
      return;
    }

    ObjectEntry entry = (ObjectEntry) this.head;
    this.slots = new ObjectEntry[newCapacity];
    this.head = null;
    this.foot = null;

    while (entry != null) {
      final ObjectEntry next = entry.next;
      entry.prev = null;
      entry.next = null;
      entry.nextCollision = null;

      this.putEntry(entry.key.hashCode(), entry);
      this.appendEntry(entry);

      entry = next;
    }
  }

  private void dealiasHashTable(int newSize, @Nullable String excludeKey) {
    final int newCapacity = ObjectShape.expand(newSize * 10 / 7);
    ObjectEntry head = (ObjectEntry) this.head;
    this.slots = new ObjectEntry[newCapacity];
    this.head = null;
    this.foot = null;

    while (head != null) {
      if (excludeKey == null || !excludeKey.equals(head.key)) {
        final ObjectEntry entry = new ObjectEntry(head.key, head.value);
        this.putEntry(entry.key.hashCode(), entry);
        this.appendEntry(entry);
      }
      head = head.next;
    }

    this.flags &= ~ALIASED_FLAG;
  }

  private void appendEntry(ObjectEntry entry) {
    final ObjectEntry foot = (ObjectEntry) this.foot;
    if (foot != null) {
      foot.next = entry;
    } else {
      this.head = entry;
    }
    entry.next = null;
    entry.prev = foot;
    this.foot = entry;
  }

  private void detachEntry(ObjectEntry entry) {
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
  public boolean isMutable() {
    return (this.flags & IMMUTABLE_FLAG) == 0;
  }

  public ObjectRepr asMutable() {
    return this.isMutable() ? this : this.clone();
  }

  @Override
  public ObjectRepr clone() {
    if (this.shape.size < 0 || this.shape.size > MAX_INLINE_SIZE) {
      this.flags |= ALIASED_FLAG;
    }
    return new ObjectRepr(this.flags & ~IMMUTABLE_FLAG, this.size, this.attrs,
                          this.shape, this.slots, this.head, this.foot);
  }

  @Override
  public ObjectRepr commit() {
    if ((this.flags & IMMUTABLE_FLAG) == 0) {
      this.flags |= IMMUTABLE_FLAG;
      this.attrs.commit();
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
    ObjectEntry entry = (ObjectEntry) this.head;
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
    final ObjectShape[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final ObjectShape field = fields[i];
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
    final ObjectShape[] fields = this.shape.fields();
    final Repr[] slots = (Repr[]) Assume.nonNull(this.slots);
    for (int i = 0; i < fields.length; i += 1) {
      final ObjectShape field = fields[i];
      final String key = field.key;
      final Repr value = slots[field.size - 1];
      action.accept(key, value);
    }
  }

  private void forEachHashed(BiConsumer<? super String, ? super Repr> action) {
    ObjectEntry entry = (ObjectEntry) this.head;
    while (entry != null) {
      final ObjectEntry next = entry.next;
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
    final ObjectShape[] fields = this.shape.fields();
    for (int i = 0; i < fields.length; i += 1) {
      final ObjectShape field = fields[i];
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
    final ObjectShape[] fields = this.shape.fields();
    final Repr[] slots = (Repr[]) Assume.nonNull(this.slots);
    for (int i = 0; i < fields.length; i += 1) {
      final ObjectShape field = fields[i];
      final String key = field.key;
      final Repr value = slots[field.size - 1];
      action.accept(new SimpleImmutableEntry<String, Repr>(key, value));
    }
  }

  private void forEachHashed(Consumer<? super Map.Entry<String, Repr>> action) {
    ObjectEntry entry = (ObjectEntry) this.head;
    while (entry != null) {
      final ObjectEntry next = entry.next;
      action.accept(entry);
      entry = next;
    }
  }

  @Override
  public Iterator<Map.Entry<String, Repr>> iterator() {
    if (this.shape.size < 0) {
      return new ObjectReprHashedEntryIterator((ObjectEntry) this.head);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return new ObjectReprPackedEntryIterator(this);
    } else if (this.shape.size > 0) {
      return new ObjectReprInlineEntryIterator(this);
    } else {
      return ObjectReprInlineEntryIterator.EMPTY;
    }
  }

  public Iterator<String> keyIterator() {
    if (this.shape.size < 0) {
      return new ObjectReprHashedKeyIterator((ObjectEntry) this.head);
    } else {
      return new ObjectReprPackedKeyIterator(this);
    }
  }

  public Iterator<Repr> valueIterator() {
    if (this.shape.size < 0) {
      return new ObjectReprHashedValueIterator((ObjectEntry) this.head);
    } else if (this.shape.size > MAX_INLINE_SIZE) {
      return new ObjectReprPackedValueIterator(this);
    } else {
      return new ObjectReprInlineValueIterator(this);
    }
  }

  @Override
  public Set<Map.Entry<String, Repr>> entrySet() {
    return new ObjectReprEntrySet(this);
  }

  @Override
  public Set<String> keySet() {
    return new ObjectReprKeySet(this);
  }

  @Override
  public Collection<Repr> values() {
    return new ObjectReprValues(this);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map<?, ?>) {
      return this.entrySet().equals(((Map<?, ?>) other).entrySet());
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
    if (this.size == 0 && (this.flags & IMMUTABLE_FLAG) != 0) {
      notation.beginInvoke("ObjectRepr", "empty").endInvoke();
    } else {
      notation.beginInvoke("ObjectRepr", "of");
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

  static final int MAX_INLINE_SIZE = 3;

  static final int MAX_PACKED_SIZE = 32;

  private static final ObjectRepr EMPTY = new ObjectRepr(IMMUTABLE_FLAG, 0,
                                                         Attrs.empty(),
                                                         ObjectShape.empty(),
                                                         null, null, null);

  public static ObjectRepr empty() {
    return EMPTY;
  }

  public static ObjectRepr of() {
    return new ObjectRepr(0, 0, Attrs.empty(), ObjectShape.empty(), null, null, null);
  }

  public static ObjectRepr of(String key, Repr value) {
    final ObjectShape shape = ObjectShape.empty().getChild(key);
    return new ObjectRepr(0, 1, Attrs.empty(), shape, value, null, null);
  }

  public static ObjectRepr of(String key0, Repr value0,
                              String key1, Repr value1) {
    final ObjectShape shape = ObjectShape.empty().getChild(key0).getChild(key1);
    return new ObjectRepr(0, 2, Attrs.empty(), shape, value0, value1, null);
  }

  public static ObjectRepr of(String key0, Repr value0,
                              String key1, Repr value1,
                              String key2, Repr value2) {
    final ObjectShape shape = ObjectShape.empty().getChild(key0).getChild(key1)
                                                 .getChild(key2);
    return new ObjectRepr(0, 3, Attrs.empty(), shape, value0, value1, value2);
  }

  public static ObjectRepr of(String key0, Repr value0,
                              String key1, Repr value1,
                              String key2, Repr value2,
                              String key3, Repr value3) {
    final Repr[] slots = new Repr[] {value0, value1, value2, value3};
    final ObjectShape shape = ObjectShape.empty().getChild(key0).getChild(key1)
                                                 .getChild(key2).getChild(key3);
    return new ObjectRepr(0, 4, Attrs.empty(), shape, slots, null, null);
  }

  public static ObjectRepr of(Object... keyValuePairs) {
    Objects.requireNonNull(keyValuePairs);
    final int n = keyValuePairs.length;
    if (n % 2 != 0) {
      throw new IllegalArgumentException("odd number of key-value pairs");
    }
    final ObjectRepr object = ObjectRepr.of();
    for (int i = 0; i < n; i += 2) {
      object.put((String) keyValuePairs[i], (Repr) keyValuePairs[i + 1]);
    }
    return object;
  }

}

final class ObjectEntry implements Map.Entry<String, Repr> {

  final String key;
  Repr value;
  @Nullable ObjectEntry prev;
  @Nullable ObjectEntry next;
  @Nullable ObjectEntry nextCollision;

  ObjectEntry(String key, Repr value) {
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

final class ObjectReprInlineEntryIterator implements Iterator<Map.Entry<String, Repr>> {

  final ObjectRepr repr;
  final ObjectShape shape;
  final ObjectShape[] fields;
  int index;

  ObjectReprInlineEntryIterator(ObjectRepr repr) {
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
    }
    if (this.repr.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    final String key = this.fields[index].key;
    final Repr value;
    switch (index) {
      case 0:
        value = (Repr) this.repr.slots;
        break;
      case 1:
        value = (Repr) this.repr.head;
        break;
      case 2:
        value = (Repr) this.repr.foot;
        break;
      default:
        throw new AssertionError(Integer.toString(index));
    }
    return new SimpleImmutableEntry<String, Repr>(key, value);
  }

  static final ObjectReprInlineEntryIterator EMPTY = new ObjectReprInlineEntryIterator(ObjectRepr.empty());

}

final class ObjectReprPackedEntryIterator implements Iterator<Map.Entry<String, Repr>> {

  final ObjectRepr repr;
  final ObjectShape shape;
  final ObjectShape[] fields;
  int index;

  ObjectReprPackedEntryIterator(ObjectRepr repr) {
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
    }
    if (this.repr.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    final String key = this.fields[index].key;
    final Repr value = ((Repr[]) Assume.nonNull(this.repr.slots))[index];
    return new SimpleImmutableEntry<String, Repr>(key, value);
  }

}

final class ObjectReprHashedEntryIterator implements Iterator<Map.Entry<String, Repr>> {

  @Nullable ObjectEntry entry;

  ObjectReprHashedEntryIterator(@Nullable ObjectEntry entry) {
    this.entry = entry;
  }

  @Override
  public boolean hasNext() {
    return this.entry != null;
  }

  @Override
  public Map.Entry<String, Repr> next() {
    final ObjectEntry entry = this.entry;
    if (entry != null) {
      this.entry = entry.next;
      return entry;
    } else {
      throw new NoSuchElementException();
    }
  }

}

final class ObjectReprEntrySet extends AbstractSet<Map.Entry<String, Repr>> {

  final ObjectRepr repr;

  ObjectReprEntrySet(ObjectRepr repr) {
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

final class ObjectReprPackedKeyIterator implements Iterator<String> {

  final ObjectRepr repr;
  final ObjectShape shape;
  final ObjectShape[] fields;
  int index;

  ObjectReprPackedKeyIterator(ObjectRepr repr) {
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
    }
    if (this.repr.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    return Assume.nonNull(this.fields[index].key);
  }

}

final class ObjectReprHashedKeyIterator implements Iterator<String> {

  @Nullable ObjectEntry entry;

  ObjectReprHashedKeyIterator(@Nullable ObjectEntry entry) {
    this.entry = entry;
  }

  @Override
  public boolean hasNext() {
    return this.entry != null;
  }

  @Override
  public String next() {
    final ObjectEntry entry = this.entry;
    if (entry != null) {
      this.entry = entry.next;
      return entry.key;
    } else {
      throw new NoSuchElementException();
    }
  }

}

final class ObjectReprKeySet extends AbstractSet<String> {

  final ObjectRepr repr;

  ObjectReprKeySet(ObjectRepr repr) {
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

final class ObjectReprInlineValueIterator implements Iterator<Repr> {

  final ObjectRepr repr;
  final ObjectShape shape;
  int index;

  ObjectReprInlineValueIterator(ObjectRepr repr) {
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
    }
    if (this.repr.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    switch (index) {
      case 0:
        return (Repr) Assume.nonNull(this.repr.slots);
      case 1:
        return (Repr) Assume.nonNull(this.repr.head);
      case 2:
        return (Repr) Assume.nonNull(this.repr.foot);
      default:
        throw new AssertionError(Integer.toString(index));
    }
  }

}

final class ObjectReprPackedValueIterator implements Iterator<Repr> {

  final ObjectRepr repr;
  final ObjectShape shape;
  int index;

  ObjectReprPackedValueIterator(ObjectRepr repr) {
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
    }
    if (this.repr.shape != this.shape) {
      throw new ConcurrentModificationException();
    }
    this.index = index + 1;
    return ((Repr[]) Assume.nonNull(this.repr.slots))[index];
  }

}

final class ObjectReprHashedValueIterator implements Iterator<Repr> {

  @Nullable ObjectEntry entry;

  ObjectReprHashedValueIterator(@Nullable ObjectEntry entry) {
    this.entry = entry;
  }

  @Override
  public boolean hasNext() {
    return this.entry != null;
  }

  @Override
  public Repr next() {
    final ObjectEntry entry = this.entry;
    if (entry != null) {
      this.entry = entry.next;
      return entry.value;
    } else {
      throw new NoSuchElementException();
    }
  }

}

final class ObjectReprValues extends AbstractCollection<Repr> {

  final ObjectRepr repr;

  ObjectReprValues(ObjectRepr repr) {
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
