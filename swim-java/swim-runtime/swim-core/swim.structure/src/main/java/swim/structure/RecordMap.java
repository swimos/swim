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

package swim.structure;

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.HashSet;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;

final class RecordMap extends Record {

  Item[] array;
  Field[] table;
  int itemCount;
  int fieldCount;
  volatile int flags;

  RecordMap(Item[] array, Field[] table, int itemCount, int fieldCount, int flags) {
    this.array = array;
    this.table = table;
    this.itemCount = itemCount;
    this.fieldCount = fieldCount;
    this.flags = flags;
  }

  @Override
  public boolean isEmpty() {
    return this.itemCount == 0;
  }

  @Override
  public int size() {
    return this.itemCount;
  }

  @Override
  public int fieldCount() {
    return this.fieldCount;
  }

  @Override
  public int valueCount() {
    return this.itemCount - this.fieldCount;
  }

  @Override
  public boolean isConstant() {
    final Item[] array = this.array;
    for (int i = 0, n = this.itemCount; i < n; i += 1) {
      if (!array[i].isConstant()) {
        return false;
      }
    }
    return true;
  }

  @Override
  public String tag() {
    if (this.fieldCount > 0) {
      final Item item = this.array[0];
      if (item instanceof Attr) {
        return ((Attr) item).key.value;
      }
    }
    return null;
  }

  @Override
  public Value target() {
    Value value = null;
    Record record = null;
    boolean modified = false;
    final Item[] array = this.array;
    final int n = this.itemCount;
    for (int i = 0; i < n; i += 1) {
      final Item item = array[i];
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

  @Override
  public Item head() {
    if (this.itemCount > 0) {
      return this.array[0];
    } else {
      return Item.absent();
    }
  }

  @Override
  public Record tail() {
    final int n = this.itemCount;
    if (n > 0) {
      return new RecordMapView(this, 1, n);
    } else {
      return Record.empty();
    }
  }

  @Override
  public Value body() {
    final int n = this.itemCount;
    if (n > 2) {
      return new RecordMapView(this, 1, n).branch();
    } else if (n == 2) {
      final Item item = this.array[1];
      if (item instanceof Value) {
        return (Value) item;
      } else {
        return Record.of(item);
      }
    } else {
      return Value.absent();
    }
  }

  @Override
  public boolean contains(Item item) {
    final Item[] array = this.array;
    final int n = this.itemCount;
    for (int i = 0; i < n; i += 1) {
      if (array[i].equals(item)) {
        return true;
      }
    }
    return false;
  }

  @Override
  public boolean containsAll(Collection<?> items) {
    final HashSet<Object> q = new HashSet<Object>(items);
    final Item[] array = this.array;
    final int n = this.itemCount;
    for (int i = 0; i < n && !q.isEmpty(); i += 1) {
      q.remove(array[i]);
    }
    return q.isEmpty();
  }

  @Override
  public boolean containsKey(Value key) {
    return this.containsKey((Object) key);
  }

  @Override
  public boolean containsKey(String key) {
    return this.containsKey((Object) key);
  }

  private boolean containsKey(Object key) {
    if (!(key instanceof Value) && !(key instanceof String)) {
      key = Value.fromObject(key);
    }
    if (this.fieldCount != 0) {
      final Field[] table = this.hashTable();
      final int n = table.length;
      assert n > 0;
      final int x = Math.abs(key.hashCode() % n);
      int i = x;
      do {
        final Field field = table[i];
        if (field != null) {
          if (field.keyEquals(key)) {
            return true;
          }
        } else {
          break;
        }
        i = (i + 1) % n;
      } while (i != x);
    }
    return false;
  }

  @Override
  public boolean containsValue(Value value) {
    if (this.fieldCount != 0) {
      final Field[] table = this.hashTable();
      final int n = table.length;
      for (int i = 0; i < n; i += 1) {
        final Field field = table[i];
        if (field != null && field.value().equals(value)) {
          return true;
        }
      }
    }
    return false;
  }

  @Override
  public int indexOf(Object object) {
    final Item item = Item.fromObject(object);
    final Item[] array = this.array;
    for (int i = 0, n = this.itemCount; i < n; i += 1) {
      if (array[i].equals(item)) {
        return i;
      }
    }
    return -1;
  }

  @Override
  public int lastIndexOf(Object object) {
    final Item item = Item.fromObject(object);
    final Item[] array = this.array;
    for (int i = this.itemCount - 1; i >= 0; i -= 1) {
      if (array[i].equals(item)) {
        return i;
      }
    }
    return -1;
  }

  @Override
  public Value get(Value key) {
    return this.get((Object) key);
  }

  @Override
  public Value get(String key) {
    return this.get((Object) key);
  }

  private Value get(Object key) {
    if (!(key instanceof Value) && !(key instanceof String)) {
      key = Value.fromObject(key);
    }
    if (this.fieldCount != 0) {
      final Field[] table = this.hashTable();
      final int n = table.length;
      assert n > 0;
      final int x = Math.abs(key.hashCode() % n);
      int i = x;
      do {
        final Field field = table[i];
        if (field != null) {
          if (field.keyEquals(key)) {
            return field.value();
          }
        } else {
          break;
        }
        i = (i + 1) % n;
      } while (i != x);
    }
    return Value.absent();
  }

  @Override
  public Value getAttr(Text key) {
    return this.getAttr((Object) key);
  }

  @Override
  public Value getAttr(String key) {
    return this.getAttr((Object) key);
  }

  private Value getAttr(Object key) {
    if (this.fieldCount != 0) {
      final Field[] table = this.hashTable();
      final int n = table.length;
      assert n > 0;
      final int x = Math.abs(key.hashCode() % n);
      int i = x;
      do {
        final Field field = table[i];
        if (field != null) {
          if (field instanceof Attr && field.keyEquals(key)) {
            return field.value();
          }
        } else {
          break;
        }
        i = (i + 1) % n;
      } while (i != x);
    }
    return Value.absent();
  }

  @Override
  public Value getSlot(Value key) {
    return this.getSlot((Object) key);
  }

  @Override
  public Value getSlot(String key) {
    return this.getSlot((Object) key);
  }

  private Value getSlot(Object key) {
    if (this.fieldCount != 0) {
      final Field[] table = this.hashTable();
      final int n = table.length;
      assert n > 0;
      final int x = Math.abs(key.hashCode() % n);
      int i = x;
      do {
        final Field field = table[i];
        if (field != null) {
          if (field instanceof Slot && field.keyEquals(key)) {
            return field.value();
          }
        } else {
          break;
        }
        i = (i + 1) % n;
      } while (i != x);
    }
    return Value.absent();
  }

  @Override
  public Field getField(Value key) {
    return this.getField((Object) key);
  }

  @Override
  public Field getField(String key) {
    return this.getField((Object) key);
  }

  private Field getField(Object key) {
    if (this.fieldCount != 0) {
      final Field[] table = this.hashTable();
      final int n = table.length;
      assert n > 0;
      final int x = Math.abs(key.hashCode() % n);
      int i = x;
      do {
        final Field field = table[i];
        if (field != null) {
          if (field.keyEquals(key)) {
            return field;
          }
        } else {
          break;
        }
        i = (i + 1) % n;
      } while (i != x);
    }
    return null;
  }

  @Override
  public Item get(int index) {
    if (index < 0 || index >= this.itemCount) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return this.array[index];
  }

  @Override
  public Item getItem(int index) {
    if (index >= 0 && index < this.itemCount) {
      return this.array[index];
    } else {
      return Item.absent();
    }
  }

  @Override
  public Value put(Value key, Value newValue) {
    return this.put((Object) key, newValue);
  }

  @Override
  public Value put(String key, Value newValue) {
    return this.put((Object) key, newValue);
  }

  private Value put(Object key, Value newValue) {
    final int flags = RecordMap.FLAGS.get(this);
    if ((flags & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((flags & RecordMap.ALIASED) != 0) {
      if (this.fieldCount > 0) {
        return this.putAliased(key, newValue);
      } else {
        this.addAliased(new Slot(Value.fromObject(key), newValue));
        return Value.absent();
      }
    } else {
      if (this.fieldCount > 0) {
        if (this.table != null) {
          return this.putMutable(key, newValue);
        } else {
          return this.updateMutable(key, newValue);
        }
      } else {
        this.addMutable(new Slot(Value.fromObject(key), newValue));
        return Value.absent();
      }
    }
  }

  private Value putAliased(Object key, Value newValue) {
    final int n = this.itemCount;
    final Item[] oldArray = this.array;
    final Item[] newArray = new Item[RecordMap.expand(n + 1)];
    for (int i = 0; i < n; i += 1) {
      final Item item = oldArray[i];
      if (item instanceof Field && item.keyEquals(key)) {
        final Value oldValue = item.toValue();
        newArray[i] = ((Field) item).updatedValue(newValue);
        i += 1;
        System.arraycopy(oldArray, i, newArray, i, n - i);
        this.array = newArray;
        this.table = null;
        do {
          final int oldFlags = RecordMap.FLAGS.get(this);
          final int newFlags = oldFlags & ~RecordMap.ALIASED;
          if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
            break;
          }
        } while (true);
        return oldValue;
      }
      newArray[i] = item;
    }
    newArray[n] = new Slot(Value.fromObject(key), newValue);
    this.array = newArray;
    this.table = null;
    this.itemCount = n + 1;
    this.fieldCount += 1;
    do {
      final int oldFlags = RecordMap.FLAGS.get(this);
      final int newFlags = oldFlags & ~RecordMap.ALIASED;
      if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
    return Value.absent();
  }

  private Value putMutable(Object key, Value newValue) {
    final Field[] table = this.table;
    final int n = table.length;
    assert n > 0;
    final int x = Math.abs(key.hashCode() % n);
    int i = x;
    do {
      final Field field = table[i];
      if (field != null) {
        if (field.keyEquals(key)) {
          if (field.isMutable()) {
            return field.setValue(newValue);
          } else {
            return this.updateMutable(key, newValue);
          }
        }
      } else {
        break;
      }
      i = (i + 1) % n;
    } while (i != x);
    final Field field = new Slot(Value.fromObject(key), newValue);
    this.addMutable(field);
    RecordMap.put(table, field);
    return Value.absent();
  }

  private Value updateMutable(Object key, Value newValue) {
    final Item[] array = this.array;
    for (int i = 0, n = this.itemCount; i < n; i += 1) {
      final Item item = array[i];
      if (item instanceof Field && item.keyEquals(key)) {
        final Value oldValue = item.toValue();
        array[i] = ((Field) item).updatedValue(newValue);
        this.table = null;
        return oldValue;
      }
    }
    final Field field = new Slot(Value.fromObject(key), newValue);
    this.addMutable(field);
    RecordMap.put(this.table, field);
    return Value.absent();
  }

  @Override
  public Value putAttr(Text key, Value newValue) {
    return this.putAttr((Object) key, newValue);
  }

  @Override
  public Value putAttr(String key, Value newValue) {
    return this.putAttr((Object) key, newValue);
  }

  private Value putAttr(Object key, Value newValue) {
    final int flags = RecordMap.FLAGS.get(this);
    if ((flags & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((flags & RecordMap.ALIASED) != 0) {
      if (this.fieldCount > 0) {
        return this.putAttrAliased(key, newValue);
      } else {
        this.addAliased(new Attr(Text.fromObject(key), newValue));
        return Value.absent();
      }
    } else {
      if (this.fieldCount > 0) {
        if (this.table != null) {
          return this.putAttrMutable(key, newValue);
        } else {
          return this.updateAttrMutable(key, newValue);
        }
      } else {
        this.addMutable(new Attr(Text.fromObject(key), newValue));
        return Value.absent();
      }
    }
  }

  private Value putAttrAliased(Object key, Value newValue) {
    final int n = this.itemCount;
    final Item[] oldArray = this.array;
    final Item[] newArray = new Item[RecordMap.expand(n + 1)];
    for (int i = 0; i < n; i += 1) {
      final Item item = oldArray[i];
      if (item instanceof Field && item.keyEquals(key)) {
        final Value oldValue = item.toValue();
        newArray[i] = new Attr(Text.fromObject(key), newValue);
        i += 1;
        System.arraycopy(oldArray, i, newArray, i, n - i);
        this.array = newArray;
        this.table = null;
        do {
          final int oldFlags = RecordMap.FLAGS.get(this);
          final int newFlags = oldFlags & ~RecordMap.ALIASED;
          if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
            break;
          }
        } while (true);
        return oldValue;
      }
      newArray[i] = item;
    }
    newArray[n] = new Attr(Text.fromObject(key), newValue);
    this.array = newArray;
    this.table = null;
    this.itemCount = n + 1;
    this.fieldCount += 1;
    do {
      final int oldFlags = RecordMap.FLAGS.get(this);
      final int newFlags = oldFlags & ~RecordMap.ALIASED;
      if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
    return Value.absent();
  }

  private Value putAttrMutable(Object key, Value newValue) {
    final Field[] table = this.table;
    final int n = table.length;
    assert n > 0;
    final int x = Math.abs(key.hashCode() % n);
    int i = x;
    do {
      final Field field = table[i];
      if (field != null) {
        if (field.keyEquals(key)) {
          if (field instanceof Attr && field.isMutable()) {
            return field.setValue(newValue);
          } else {
            return this.updateAttrMutable(key, newValue);
          }
        }
      } else {
        break;
      }
      i = (i + 1) % n;
    } while (i != x);
    final Field field = new Attr(Text.fromObject(key), newValue);
    this.add(field);
    RecordMap.put(table, field);
    return Value.absent();
  }

  private Value updateAttrMutable(Object key, Value newValue) {
    final Item[] array = this.array;
    for (int i = 0, n = this.itemCount; i < n; i += 1) {
      final Item item = array[i];
      if (item instanceof Field && item.keyEquals(key)) {
        final Value oldValue = item.toValue();
        array[i] = new Attr(Text.fromObject(key), newValue);
        this.table = null;
        return oldValue;
      }
    }
    final Field field = new Attr(Text.fromObject(key), newValue);
    this.add(field);
    RecordMap.put(this.table, field);
    return Value.absent();
  }

  @Override
  public Value putSlot(Value key, Value newValue) {
    return this.putSlot((Object) key, newValue);
  }

  @Override
  public Value putSlot(String key, Value newValue) {
    return this.putSlot((Object) key, newValue);
  }

  private Value putSlot(Object key, Value newValue) {
    final int flags = RecordMap.FLAGS.get(this);
    if ((flags & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((flags & RecordMap.ALIASED) != 0) {
      if (this.fieldCount > 0) {
        return this.putSlotAliased(key, newValue);
      } else {
        this.addAliased(new Slot(Value.fromObject(key), newValue));
        return Value.absent();
      }
    } else {
      if (this.fieldCount > 0) {
        if (this.table != null) {
          return this.putSlotMutable(key, newValue);
        } else {
          return this.updateSlotMutable(key, newValue);
        }
      } else {
        this.addMutable(new Slot(Value.fromObject(key), newValue));
        return Value.absent();
      }
    }
  }

  private Value putSlotAliased(Object key, Value newValue) {
    final int n = this.itemCount;
    final Item[] oldArray = this.array;
    final Item[] newArray = new Item[RecordMap.expand(n + 1)];
    for (int i = 0; i < n; i += 1) {
      final Item item = oldArray[i];
      if (item instanceof Field && item.keyEquals(key)) {
        final Value oldValue = item.toValue();
        newArray[i] = new Slot(Value.fromObject(key), newValue);
        i += 1;
        System.arraycopy(oldArray, i, newArray, i, n - i);
        this.array = newArray;
        this.table = null;
        do {
          final int oldFlags = RecordMap.FLAGS.get(this);
          final int newFlags = oldFlags & ~RecordMap.ALIASED;
          if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
            break;
          }
        } while (true);
        return oldValue;
      }
      newArray[i] = item;
    }
    newArray[n] = new Slot(Value.fromObject(key), newValue);
    this.array = newArray;
    this.table = null;
    this.itemCount = n + 1;
    this.fieldCount += 1;
    do {
      final int oldFlags = RecordMap.FLAGS.get(this);
      final int newFlags = oldFlags & ~RecordMap.ALIASED;
      if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
    return Value.absent();
  }

  private Value putSlotMutable(Object key, Value newValue) {
    final Field[] table = this.table;
    final int n = table.length;
    assert n > 0;
    final int x = Math.abs(key.hashCode() % n);
    int i = x;
    do {
      final Field field = table[i];
      if (field != null) {
        if (field.keyEquals(key)) {
          if (field instanceof Slot && field.isMutable()) {
            return field.setValue(newValue);
          } else {
            return this.updateSlotMutable(key, newValue);
          }
        }
      } else {
        break;
      }
      i = (i + 1) % n;
    } while (i != x);
    final Field field = new Slot(Value.fromObject(key), newValue);
    this.add(field);
    RecordMap.put(table, field);
    return Value.absent();
  }

  private Value updateSlotMutable(Object key, Value newValue) {
    final Item[] array = this.array;
    for (int i = 0, n = this.itemCount; i < n; i += 1) {
      final Item item = array[i];
      if (item instanceof Field && item.keyEquals(key)) {
        final Value oldValue = item.toValue();
        array[i] = new Slot(Value.fromObject(key), newValue);
        this.table = null;
        return oldValue;
      }
    }
    final Field field = new Slot(Value.fromObject(key), newValue);
    this.add(field);
    RecordMap.put(this.table, field);
    return Value.absent();
  }

  @Override
  public Item setItem(int index, Item newItem) {
    final int flags = RecordMap.FLAGS.get(this);
    if ((flags & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    } else if (index < 0 || index >= this.itemCount) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    if ((flags & RecordMap.ALIASED) != 0) {
      return this.setItemAliased(index, newItem);
    } else {
      return this.setItemMutable(index, newItem);
    }
  }

  private Item setItemAliased(int index, Item newItem) {
    final int n = this.itemCount;
    final Item[] oldArray = this.array;
    final Item[] newArray = new Item[RecordMap.expand(n)];
    System.arraycopy(oldArray, 0, newArray, 0, n);
    final Item oldItem = oldArray[index];
    newArray[index] = newItem;
    this.array = newArray;
    this.table = null;
    if (newItem instanceof Field) {
      if (!(oldItem instanceof Field)) {
        this.fieldCount += 1;
      }
    } else if (oldItem instanceof Field) {
      this.fieldCount -= 1;
    }
    do {
      final int oldFlags = RecordMap.FLAGS.get(this);
      final int newFlags = oldFlags & ~RecordMap.ALIASED;
      if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
    return oldItem;
  }

  private Item setItemMutable(int index, Item newItem) {
    final Item[] array = this.array;
    final Item oldItem = array[index];
    array[index] = newItem;
    if (newItem instanceof Field) {
      this.table = null;
      if (!(oldItem instanceof Field)) {
        this.fieldCount += 1;
      }
    } else if (oldItem instanceof Field) {
      this.table = null;
      this.fieldCount -= 1;
    }
    return oldItem;
  }

  @Override
  public Record updated(Value key, Value newValue) {
    return this.updated((Object) key, newValue);
  }

  @Override
  public Record updated(String key, Value newValue) {
    return this.updated((Object) key, newValue);
  }

  private Record updated(Object key, Value newValue) {
    final RecordMap record = (RecordMap.FLAGS.get(this) & RecordMap.IMMUTABLE) == 0 ? this : this.branch();
    if ((RecordMap.FLAGS.get(record) & RecordMap.ALIASED) != 0) {
      if (record.fieldCount > 0) {
        record.putAliased(key, newValue);
      } else {
        record.addAliased(new Slot(Value.fromObject(key), newValue));
      }
    } else {
      if (record.fieldCount > 0) {
        if (record.table != null) {
          record.putMutable(key, newValue);
        } else {
          record.updateMutable(key, newValue);
        }
      } else {
        record.addMutable(new Slot(Value.fromObject(key), newValue));
      }
    }
    return record;
  }

  @Override
  public Record updatedAttr(Text key, Value newValue) {
    return this.updatedAttr((Object) key, newValue);
  }

  @Override
  public Record updatedAttr(String key, Value newValue) {
    return this.updatedAttr((Object) key, newValue);
  }

  private Record updatedAttr(Object key, Value newValue) {
    final RecordMap record = (RecordMap.FLAGS.get(this) & RecordMap.IMMUTABLE) == 0 ? this : this.branch();
    if ((RecordMap.FLAGS.get(record) & RecordMap.ALIASED) != 0) {
      if (record.fieldCount > 0) {
        record.putAttrAliased(key, newValue);
      } else {
        record.addAliased(new Attr(Text.fromObject(key), newValue));
      }
    } else {
      if (record.fieldCount > 0) {
        if (record.table != null) {
          record.putAttrMutable(key, newValue);
        } else {
          record.updateAttrMutable(key, newValue);
        }
      } else {
        record.addMutable(new Attr(Text.fromObject(key), newValue));
      }
    }
    return record;
  }

  @Override
  public Record updatedSlot(Value key, Value newValue) {
    return this.updatedSlot((Object) key, newValue);
  }

  @Override
  public Record updatedSlot(String key, Value newValue) {
    return this.updatedSlot((Object) key, newValue);
  }

  private Record updatedSlot(Object key, Value newValue) {
    final RecordMap record = (RecordMap.FLAGS.get(this) & RecordMap.IMMUTABLE) == 0 ? this : this.branch();
    if ((RecordMap.FLAGS.get(record) & RecordMap.ALIASED) != 0) {
      if (record.fieldCount > 0) {
        record.putSlotAliased(key, newValue);
      } else {
        record.addAliased(new Slot(Value.fromObject(key), newValue));
      }
    } else {
      if (record.fieldCount > 0) {
        if (record.table != null) {
          record.putSlotMutable(key, newValue);
        } else {
          record.updateSlotMutable(key, newValue);
        }
      } else {
        record.addMutable(new Slot(Value.fromObject(key), newValue));
      }
    }
    return record;
  }

  @Override
  public boolean add(Item newItem) {
    final int flags = RecordMap.FLAGS.get(this);
    if ((flags & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((flags & RecordMap.ALIASED) != 0) {
      return this.addAliased(newItem);
    } else {
      return this.addMutable(newItem);
    }
  }

  private boolean addAliased(Item newItem) {
    final int n = this.itemCount;
    final Item[] oldArray = this.array;
    final Item[] newArray = new Item[RecordMap.expand(n + 1)];
    if (oldArray != null) {
      System.arraycopy(oldArray, 0, newArray, 0, n);
    }
    newArray[n] = newItem;
    this.array = newArray;
    this.table = null;
    this.itemCount = n + 1;
    if (newItem instanceof Field) {
      this.fieldCount += 1;
    }
    do {
      final int oldFlags = RecordMap.FLAGS.get(this);
      final int newFlags = oldFlags & ~RecordMap.ALIASED;
      if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
    return true;
  }

  private boolean addMutable(Item newItem) {
    final int n = this.itemCount;
    final Item[] oldArray = this.array;
    final Item[] newArray;
    if (oldArray == null || n + 1 > oldArray.length) {
      newArray = new Item[RecordMap.expand(n + 1)];
      if (oldArray != null) {
        System.arraycopy(oldArray, 0, newArray, 0, n);
      }
      this.array = newArray;
    } else {
      newArray = oldArray;
    }
    newArray[n] = newItem;
    this.itemCount = n + 1;
    if (newItem instanceof Field) {
      this.fieldCount += 1;
      final Field[] table = this.table;
      if (table != null && Math.max(table.length, table.length * 7 / 10) > n + 1) {
        put(table, (Field) newItem);
      } else {
        this.table = null;
      }
    }
    return true;
  }

  @Override
  public void add(int index, Item newItem) {
    final int flags = RecordMap.FLAGS.get(this);
    if ((flags & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    } else if (index < 0 || index > this.itemCount) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    if (index == this.itemCount) {
      this.add(newItem);
    } else if ((flags & RecordMap.ALIASED) != 0) {
      this.addAliased(index, newItem);
    } else {
      this.addMutable(index, newItem);
    }
  }

  private void addAliased(int index, Item newItem) {
    final int n = this.itemCount;
    final Item[] oldArray = this.array;
    final Item[] newArray = new Item[RecordMap.expand(n + 1)];
    System.arraycopy(oldArray, 0, newArray, 0, index);
    System.arraycopy(oldArray, index, newArray, index + 1, n - index);
    newArray[index] = newItem;
    this.array = newArray;
    this.table = null;
    this.itemCount = n + 1;
    if (newItem instanceof Field) {
      this.fieldCount += 1;
    }
    do {
      final int oldFlags = RecordMap.FLAGS.get(this);
      final int newFlags = oldFlags & ~RecordMap.ALIASED;
      if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
  }

  private void addMutable(int index, Item newItem) {
    final int n = this.itemCount;
    final Item[] oldArray = this.array;
    final Item[] newArray;
    if (n + 1 > oldArray.length) {
      newArray = new Item[RecordMap.expand(n + 1)];
      System.arraycopy(oldArray, 0, newArray, 0, index);
    } else {
      newArray = oldArray;
    }
    System.arraycopy(oldArray, index, newArray, index + 1, n - index);
    newArray[index] = newItem;
    this.array = newArray;
    this.itemCount = n + 1;
    if (newItem instanceof Field) {
      this.fieldCount += 1;
      this.table = null;
    }
  }

  @Override
  public boolean addAll(Collection<? extends Item> newItems) {
    final int flags = RecordMap.FLAGS.get(this);
    if ((flags & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((flags & RecordMap.ALIASED) != 0) {
      return this.addAllAliased(newItems);
    } else {
      return this.addAllMutable(newItems);
    }
  }

  private boolean addAllAliased(Collection<? extends Item> newItems) {
    final int k = newItems.size();
    if (k == 0) {
      return false;
    }
    int m = this.itemCount;
    int n = this.fieldCount;
    final Item[] oldArray = this.array;
    final Item[] newArray = new Item[RecordMap.expand(m + k)];
    if (oldArray != null) {
      System.arraycopy(oldArray, 0, newArray, 0, m);
    }
    for (Item newItem : newItems) {
      newArray[m] = newItem;
      m += 1;
      if (newItem instanceof Field) {
        n += 1;
      }
    }
    this.array = newArray;
    this.table = null;
    this.itemCount = m;
    this.fieldCount = n;
    do {
      final int oldFlags = RecordMap.FLAGS.get(this);
      final int newFlags = oldFlags & ~RecordMap.ALIASED;
      if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
    return true;
  }

  private boolean addAllMutable(Collection<? extends Item> newItems) {
    final int k = newItems.size();
    if (k == 0) {
      return false;
    }
    int m = this.itemCount;
    int n = this.fieldCount;
    final Item[] oldArray = this.array;
    final Item[] newArray;
    if (oldArray == null || m + k > oldArray.length) {
      newArray = new Item[RecordMap.expand(m + k)];
      if (oldArray != null) {
        System.arraycopy(oldArray, 0, newArray, 0, m);
      }
    } else {
      newArray = oldArray;
    }
    for (Item newItem : newItems) {
      newArray[m] = newItem;
      m += 1;
      if (newItem instanceof Field) {
        n += 1;
        this.table = null;
      }
    }
    this.array = newArray;
    this.itemCount = m;
    this.fieldCount = n;
    return true;
  }

  @Override
  public boolean addAll(int index, Collection<? extends Item> newItems) {
    final int flags = RecordMap.FLAGS.get(this);
    if ((flags & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    } else if (index < 0 || index > this.itemCount) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    if (index == this.itemCount) {
      return this.addAll(newItems);
    } else if ((flags & RecordMap.ALIASED) != 0) {
      return this.addAllAliased(index, newItems);
    } else {
      return this.addAllMutable(index, newItems);
    }
  }

  private boolean addAllAliased(int index, Collection<? extends Item> newItems) {
    final int k = newItems.size();
    if (k == 0) {
      return false;
    }
    final int m = this.itemCount;
    int n = this.fieldCount;
    final Item[] oldArray = this.array;
    final Item[] newArray = new Item[RecordMap.expand(m + k)];
    if (oldArray != null) {
      System.arraycopy(oldArray, 0, newArray, 0, index);
      System.arraycopy(oldArray, index, newArray, index + k, m - index);
    }
    for (Item newItem : newItems) {
      newArray[index] = newItem;
      index += 1;
      if (newItem instanceof Field) {
        n += 1;
      }
    }
    this.array = newArray;
    this.table = null;
    this.itemCount = m + k;
    this.fieldCount = n;
    do {
      final int oldFlags = RecordMap.FLAGS.get(this);
      final int newFlags = oldFlags & ~RecordMap.ALIASED;
      if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
    return true;
  }

  private boolean addAllMutable(int index, Collection<? extends Item> newItems) {
    final int k = newItems.size();
    if (k == 0) {
      return false;
    }
    final int m = this.itemCount;
    int n = this.fieldCount;
    final Item[] oldArray = this.array;
    final Item[] newArray;
    if (oldArray == null || m + k > oldArray.length) {
      newArray = new Item[RecordMap.expand(m + k)];
      if (oldArray != null) {
        System.arraycopy(oldArray, 0, newArray, 0, index);
      }
    } else {
      newArray = oldArray;
    }
    if (oldArray != null) {
      System.arraycopy(oldArray, index, newArray, index + k, m - index);
    }
    for (Item newItem : newItems) {
      newArray[index] = newItem;
      index += 1;
      if (newItem instanceof Field) {
        n += 1;
        this.table = null;
      }
    }
    this.array = newArray;
    this.itemCount = m + k;
    this.fieldCount = n;
    return true;
  }

  @Override
  public Item remove(int index) {
    final int flags = RecordMap.FLAGS.get(this);
    if ((flags & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    } else if (index < 0 || index >= this.itemCount) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    if ((flags & RecordMap.ALIASED) != 0) {
      return this.removeAliased(index);
    } else {
      return this.removeMutable(index);
    }
  }

  private Item removeAliased(int index) {
    final int n = this.itemCount;
    final Item[] oldArray = this.array;
    final Item[] newArray = new Item[RecordMap.expand(n - 1)];
    final Item oldItem = oldArray[index];
    System.arraycopy(oldArray, 0, newArray, 0, index);
    System.arraycopy(oldArray, index + 1, newArray, index, n - index - 1);
    this.array = newArray;
    this.table = null;
    this.itemCount = n - 1;
    if (oldItem instanceof Field) {
      this.fieldCount -= 1;
    }
    do {
      final int oldFlags = RecordMap.FLAGS.get(this);
      final int newFlags = oldFlags & ~RecordMap.ALIASED;
      if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
    return oldItem;
  }

  private Item removeMutable(int index) {
    final int n = this.itemCount;
    final Item[] array = this.array;
    final Item oldItem = array[index];
    System.arraycopy(array, index + 1, array, index, n - index - 1);
    array[n - 1] = null;
    this.itemCount = n - 1;
    if (oldItem instanceof Field) {
      this.fieldCount -= 1;
      this.table = null;
    }
    return oldItem;
  }

  @Override
  public boolean remove(Object object) {
    final Item item = Item.fromObject(object);
    if ((RecordMap.FLAGS.get(this) & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final int index = this.indexOf(item);
    if (index >= 0) {
      this.remove(index);
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean removeKey(Value key) {
    return this.removeKey((Object) key);
  }

  @Override
  public boolean removeKey(String key) {
    return this.removeKey((Object) key);
  }

  private boolean removeKey(Object key) {
    final int flags = RecordMap.FLAGS.get(this);
    if ((flags & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((flags & RecordMap.ALIASED) != 0) {
      return this.removeKeyAliased(key);
    } else {
      return this.removeKeyMutable(key);
    }
  }

  private boolean removeKeyAliased(Object key) {
    final int n = this.itemCount;
    final Item[] oldArray = this.array;
    final Item[] newArray = new Item[RecordMap.expand(n)];
    for (int i = 0; i < n; i += 1) {
      final Item item = oldArray[i];
      if (item.keyEquals(key)) {
        System.arraycopy(oldArray, i + 1, newArray, i, n - i - 1);
        this.array = newArray;
        this.table = null;
        this.itemCount = n - 1;
        this.fieldCount -= 1;
        do {
          final int oldFlags = RecordMap.FLAGS.get(this);
          final int newFlags = oldFlags & ~RecordMap.ALIASED;
          if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
            break;
          }
        } while (true);
        return true;
      }
      newArray[i] = item;
    }
    return false;
  }

  private boolean removeKeyMutable(Object key) {
    final int n = this.itemCount;
    final Item[] array = this.array;
    for (int i = 0; i < n; i += 1) {
      final Item item = array[i];
      if (item.keyEquals(key)) {
        System.arraycopy(array, i + 1, array, i, n - i - 1);
        array[n - 1] = null;
        this.table = null;
        this.itemCount = n - 1;
        this.fieldCount -= 1;
        return true;
      }
    }
    return false;
  }

  @Override
  public boolean removeAll(Collection<?> items) {
    final int flags = RecordMap.FLAGS.get(this);
    if ((flags & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((flags & RecordMap.ALIASED) != 0) {
      return this.removeAllAliased(items);
    } else {
      return this.removeAllMutable(items);
    }
  }

  private boolean removeAllAliased(Collection<?> items) {
    final int m = this.itemCount;
    int n = this.fieldCount;
    final Item[] oldArray = this.array;
    final Item[] newArray = new Item[RecordMap.expand(m)];
    int i = 0;
    int j = 0;
    while (i < m) {
      final Item item = oldArray[i];
      if (!items.contains(item)) {
        newArray[j] = item;
        j += 1;
      } else if (item instanceof Field) {
        n -= 1;
      }
      i += 1;
    }
    if (i > j) {
      this.array = newArray;
      this.table = null;
      this.itemCount = j;
      this.fieldCount = n;
      do {
        final int oldFlags = RecordMap.FLAGS.get(this);
        final int newFlags = oldFlags & ~RecordMap.ALIASED;
        if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
          break;
        }
      } while (true);
      return true;
    } else {
      return false;
    }
  }

  private boolean removeAllMutable(Collection<?> items) {
    final int m = this.itemCount;
    int n = this.fieldCount;
    final Item[] array = this.array;
    int i = 0;
    int j = 0;
    while (i < m) {
      final Item item = array[i];
      if (!items.contains(item)) {
        array[j] = item;
        j += 1;
      } else if (item instanceof Field) {
        n -= 1;
        this.table = null;
      }
      i += 1;
    }
    if (i > j) {
      while (i > j) {
        i -= 1;
        array[i] = null;
      }
      this.itemCount = j;
      this.fieldCount = n;
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean retainAll(Collection<?> items) {
    final int flags = RecordMap.FLAGS.get(this);
    if ((flags & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((flags & RecordMap.ALIASED) != 0) {
      return this.retainAllAliased(items);
    } else {
      return this.retainAllMutable(items);
    }
  }

  private boolean retainAllAliased(Collection<?> items) {
    final int m = this.itemCount;
    int n = this.fieldCount;
    final Item[] oldArray = this.array;
    final Item[] newArray = new Item[RecordMap.expand(m)];
    int i = 0;
    int j = 0;
    while (i < m) {
      final Item item = oldArray[i];
      if (items.contains(item)) {
        newArray[j] = item;
        j += 1;
      } else if (item instanceof Field) {
        n -= 1;
      }
      i += 1;
    }
    if (i > j) {
      this.array = newArray;
      this.table = null;
      this.itemCount = j;
      this.fieldCount = n;
      do {
        final int oldFlags = RecordMap.FLAGS.get(this);
        final int newFlags = oldFlags & ~RecordMap.ALIASED;
        if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
          break;
        }
      } while (true);
      return true;
    } else {
      return false;
    }
  }

  private boolean retainAllMutable(Collection<?> items) {
    final int m = this.itemCount;
    int n = this.fieldCount;
    final Item[] array = this.array;
    int i = 0;
    int j = 0;
    while (i < m) {
      final Item item = array[i];
      if (items.contains(item)) {
        array[j] = item;
        j += 1;
      } else if (item instanceof Field) {
        n -= 1;
        this.table = null;
      }
      i += 1;
    }
    if (i > j) {
      while (i > j) {
        i -= 1;
        array[i] = null;
      }
      this.itemCount = j;
      this.fieldCount = n;
      return true;
    } else {
      return false;
    }
  }

  @Override
  public void clear() {
    if ((RecordMap.FLAGS.get(this) & RecordMap.IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    this.array = null;
    this.table = null;
    this.itemCount = 0;
    this.fieldCount = 0;
    RecordMap.FLAGS.set(this, 0);
  }

  @Override
  public boolean isAliased() {
    return (RecordMap.FLAGS.get(this) & RecordMap.ALIASED) != 0;
  }

  @Override
  public boolean isMutable() {
    return (RecordMap.FLAGS.get(this) & RecordMap.IMMUTABLE) == 0;
  }

  @Override
  public void alias() {
    do {
      final int oldFlags = RecordMap.FLAGS.get(this);
      final int newFlags = oldFlags | RecordMap.ALIASED;
      if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
  }

  @Override
  public RecordMap branch() {
    if ((RecordMap.FLAGS.get(this) & (RecordMap.ALIASED | RecordMap.IMMUTABLE)) == 0) {
      final Item[] array = this.array;
      for (int i = 0, n = this.itemCount; i < n; i += 1) {
        array[i].alias();
      }
    }
    do {
      final int oldFlags = RecordMap.FLAGS.get(this);
      final int newFlags = oldFlags | RecordMap.ALIASED;
      if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
    return new RecordMap(this.array, this.table, this.itemCount, this.fieldCount, RecordMap.ALIASED);
  }

  @Override
  public RecordMap commit() {
    if ((RecordMap.FLAGS.get(this) & RecordMap.IMMUTABLE) == 0) {
      do {
        final int oldFlags = RecordMap.FLAGS.get(this);
        final int newFlags = oldFlags | RecordMap.IMMUTABLE;
        if (RecordMap.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
          break;
        }
      } while (true);
      final Item[] array = this.array;
      for (int i = 0, n = this.itemCount; i < n; i += 1) {
        array[i].commit();
      }
    }
    return this;
  }

  private Field[] hashTable() {
    final int n = this.fieldCount;
    Field[] table = this.table;
    if (n != 0 && table == null) {
      table = new Field[RecordMap.expand(Math.max(n, n * 10 / 7))];
      final int m = this.itemCount;
      final Item[] array = this.array;
      for (int i = 0; i < m; i += 1) {
        final Item item = array[i];
        if (item instanceof Field) {
          RecordMap.put(table, (Field) item);
        }
      }
      this.table = table;
    }
    return table;
  }

  @Override
  public Record evaluate(Interpreter interpreter) {
    final int n = this.itemCount;
    final Item[] array = this.array;
    final Record scope = Record.create(n);
    interpreter.pushScope(scope);
    boolean changed = false;
    for (int i = 0; i < n; i += 1) {
      final Item oldItem = array[i];
      final Item newItem = oldItem.evaluate(interpreter);
      scope.add(newItem);
      if (oldItem != newItem) {
        changed = true;
      }
    }
    interpreter.popScope();
    return changed ? scope : this;
  }

  @Override
  public Record substitute(Interpreter interpreter) {
    final int n = this.itemCount;
    final Item[] array = this.array;
    final Record scope = Record.create(n);
    interpreter.pushScope(scope);
    boolean changed = false;
    for (int i = 0; i < n; i += 1) {
      final Item oldItem = array[i];
      final Item newItem = oldItem.substitute(interpreter);
      scope.add(newItem);
      if (oldItem != newItem) {
        changed = true;
      }
    }
    interpreter.popScope();
    return changed ? scope : this;
  }

  @Override
  public Item[] toArray() {
    final int n = this.itemCount;
    final Item[] array = new Item[n];
    System.arraycopy(this.array, 0, array, 0, n);
    return array;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T[] toArray(T[] array) {
    final int n = this.itemCount;
    if (array.length < n) {
      array = (T[]) Array.newInstance(array.getClass().getComponentType(), n);
    }
    System.arraycopy(this.array, 0, array, 0, n);
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  @Override
  public Record subList(int fromIndex, int toIndex) {
    if (fromIndex < 0 || toIndex > this.itemCount || fromIndex > toIndex) {
      throw new IndexOutOfBoundsException(fromIndex + ", " + toIndex);
    }
    return new RecordMapView(this, fromIndex, toIndex);
  }

  static final int ALIASED = 1 << 0;
  static final int IMMUTABLE = 1 << 1;

  protected static final AtomicIntegerFieldUpdater<RecordMap> FLAGS =
      AtomicIntegerFieldUpdater.newUpdater(RecordMap.class, "flags");

  private static RecordMap empty;

  public static RecordMap empty() {
    if (RecordMap.empty == null) {
      RecordMap.empty = new RecordMap(null, null, 0, 0, RecordMap.ALIASED | RecordMap.IMMUTABLE);
    }
    return RecordMap.empty;
  }

  public static RecordMap create() {
    return new RecordMap(null, null, 0, 0, RecordMap.ALIASED);
  }

  public static RecordMap create(int initialCapacity) {
    return new RecordMap(new Item[initialCapacity], null, 0, 0, 0);
  }

  public static RecordMap of() {
    return new RecordMap(null, null, 0, 0, RecordMap.ALIASED);
  }

  public static Record of(Object object) {
    final Item[] array = new Item[1];
    final Item item = Item.fromObject(object);
    array[0] = item;
    return new RecordMap(array, null, 1, item instanceof Field ? 1 : 0, 0);
  }

  public static RecordMap of(Object... objects) {
    final int itemCount = objects.length;
    int fieldCount = 0;
    final Item[] array = new Item[itemCount];
    for (int i = 0; i < itemCount; i += 1) {
      final Item item = Item.fromObject(objects[i]);
      array[i] = item;
      if (item instanceof Field) {
        fieldCount += 1;
      }
    }
    return new RecordMap(array, null, itemCount, fieldCount, 0);
  }

  static void put(Field[] table, Field field) {
    if (table == null) {
      return;
    }
    final int n = table.length;
    final int x = Math.abs(field.getKey().hashCode() % n);
    int i = x;
    do {
      final Field item = table[i];
      if (item != null) {
        if (field.keyEquals(item)) {
          table[i] = field;
          return;
        }
      } else {
        table[i] = field;
        return;
      }
      i = (i + 1) % n;
    } while (i != x);
    throw new AssertionError();
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
