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

final class RecordMapView extends Record {
  RecordMap record;
  int lower;
  int upper;

  RecordMapView(RecordMap record, int lower, int upper) {
    this.record = record;
    this.lower = lower;
    this.upper = upper;
  }

  @Override
  public boolean isEmpty() {
    return this.lower == this.upper;
  }

  @Override
  public boolean isArray() {
    final Item[] array = this.record.array;
    for (int i = this.lower, n = this.upper; i < n; i += 1) {
      if (array[i] instanceof Field) {
        return false;
      }
    }
    return true;
  }

  @Override
  public boolean isObject() {
    final Item[] array = this.record.array;
    for (int i = this.lower, n = this.upper; i < n; i += 1) {
      if (array[i] instanceof Value) {
        return false;
      }
    }
    return true;
  }

  @Override
  public int size() {
    return this.upper - this.lower;
  }

  @Override
  public int fieldCount() {
    final Item[] array = this.record.array;
    int k = 0;
    for (int i = this.lower, n = this.upper; i < n; i += 1) {
      if (array[i] instanceof Field) {
        k += 1;
      }
    }
    return k;
  }

  @Override
  public int valueCount() {
    final Item[] array = this.record.array;
    int k = 0;
    for (int i = this.lower, n = this.upper; i < n; i += 1) {
      if (array[i] instanceof Value) {
        k += 1;
      }
    }
    return k;
  }

  @Override
  public boolean isConstant() {
    final Item[] array = this.record.array;
    for (int i = this.lower, n = this.upper; i < n; i += 1) {
      if (!array[i].isConstant()) {
        return false;
      }
    }
    return true;
  }

  @Override
  public String tag() {
    if (size() > 0) {
      final Item item = this.record.array[this.lower];
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
    final Item[] array = this.record.array;
    final int n = this.upper;
    for (int i = this.lower; i < n; i += 1) {
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
    if (this.size() > 0) {
      return this.record.array[this.lower];
    } else {
      return Item.absent();
    }
  }

  @Override
  public Record tail() {
    if (size() > 0) {
      return new RecordMapView(this.record, this.lower + 1, this.upper);
    } else {
      return Record.empty();
    }
  }

  @Override
  public Value body() {
    final int n = size();
    if (n > 2) {
      return new RecordMapView(this.record, this.lower + 1, this.upper).branch();
    } else if (n == 2) {
      final Item item = this.record.array[this.lower + 1];
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
    final Item[] array = this.record.array;
    final int n = this.upper;
    for (int i = this.lower; i < n; i += 1) {
      if (array[i].equals(item)) {
        return true;
      }
    }
    return false;
  }

  @Override
  public boolean containsAll(Collection<?> items) {
    final HashSet<Object> q = new HashSet<Object>(items);
    final Item[] array = this.record.array;
    final int n = this.upper;
    for (int i = this.lower; i < n && !q.isEmpty(); i += 1) {
      q.remove(array[i]);
    }
    return q.isEmpty();
  }

  @Override
  public int indexOf(Object object) {
    final Item item = Item.fromObject(object);
    final Item[] array = this.record.array;
    for (int i = this.lower, n = this.upper; i < n; i += 1) {
      if (array[i].equals(item)) {
        return i - this.lower;
      }
    }
    return -1;
  }

  @Override
  public int lastIndexOf(Object object) {
    final Item item = Item.fromObject(object);
    final Item[] array = this.record.array;
    for (int i = this.upper - 1; i >= this.lower; i -= 1) {
      if (array[i].equals(item)) {
        return i - this.lower;
      }
    }
    return -1;
  }

  @Override
  public Item get(int index) {
    if (index < 0 || index >= size()) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return this.record.array[this.lower + index];
  }

  @Override
  public Item getItem(int index) {
    if (index >= 0 && index < size()) {
      return this.record.array[this.lower + index];
    } else {
      return Item.absent();
    }
  }

  @Override
  public Item setItem(int index, Item newItem) {
    if ((this.record.flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    } else if (index < 0 || index >= size()) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    if ((this.record.flags & ALIASED) != 0) {
      return setItemAliased(index, newItem);
    } else {
      return setItemMutable(index, newItem);
    }
  }

  private Item setItemAliased(int index, Item newItem) {
    final int n = this.record.itemCount;
    final Item[] oldArray = this.record.array;
    final Item[] newArray = new Item[expand(n)];
    System.arraycopy(oldArray, 0, newArray, 0, n);
    final Item oldItem = oldArray[this.lower + index];
    newArray[this.lower + index] = newItem;
    this.record.array = newArray;
    this.record.table = null;
    if (newItem instanceof Field) {
      if (!(oldItem instanceof Field)) {
        this.record.fieldCount += 1;
      }
    } else if (oldItem instanceof Field) {
      this.record.fieldCount -= 1;
    }
    FLAGS.set(this.record, this.record.flags & ~ALIASED);
    return oldItem;
  }

  private Item setItemMutable(int index, Item newItem) {
    final Item[] array = this.record.array;
    final Item oldItem = array[this.lower + index];
    array[this.lower + index] = newItem;
    if (newItem instanceof Field) {
      this.record.table = null;
      if (!(oldItem instanceof Field)) {
        this.record.fieldCount += 1;
      }
    } else if (oldItem instanceof Field) {
      this.record.table = null;
      this.record.fieldCount -= 1;
    }
    return oldItem;
  }

  @Override
  public boolean add(Item newItem) {
    add(size(), newItem);
    return true;
  }

  @Override
  public void add(int index, Item newItem) {
    if ((this.record.flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    } else if (index < 0 || index > size()) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    if ((this.record.flags & ALIASED) != 0) {
      addAliased(index, newItem);
    } else {
      addMutable(index, newItem);
    }
  }

  private void addAliased(int index, Item newItem) {
    final int n = this.record.itemCount;
    final Item[] oldArray = this.record.array;
    final Item[] newArray = new Item[expand(n + 1)];
    System.arraycopy(oldArray, 0, newArray, 0, this.lower + index);
    System.arraycopy(oldArray, this.lower + index, newArray, this.lower + index + 1, n - (this.lower + index));
    newArray[this.lower + index] = newItem;
    this.record.array = newArray;
    this.record.table = null;
    this.record.itemCount = n + 1;
    if (newItem instanceof Field) {
      this.record.fieldCount += 1;
    }
    FLAGS.set(this.record, this.record.flags & ~ALIASED);
    this.upper += 1;
  }

  private void addMutable(int index, Item newItem) {
    final int n = this.record.itemCount;
    final Item[] oldArray = this.record.array;
    final Item[] newArray;
    if (n + 1 > oldArray.length) {
      newArray = new Item[expand(n + 1)];
      System.arraycopy(oldArray, 0, newArray, 0, this.lower + index);
    } else {
      newArray = oldArray;
    }
    System.arraycopy(oldArray, this.lower + index, newArray, this.lower + index + 1, n - (this.lower + index));
    newArray[this.lower + index] = newItem;
    this.record.array = newArray;
    this.record.itemCount = n + 1;
    if (newItem instanceof Field) {
      this.record.fieldCount += 1;
      this.record.table = null;
    }
    this.upper += 1;
  }

  @Override
  public boolean addAll(Collection<? extends Item> newItems) {
    if ((this.record.flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((this.record.flags & ALIASED) != 0) {
      return addAllAliased(size(), newItems);
    } else {
      return addAllMutable(size(), newItems);
    }
  }

  @Override
  public boolean addAll(int index, Collection<? extends Item> newItems) {
    if ((this.record.flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    } else if (index < 0 || index > size()) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    if ((this.record.flags & ALIASED) != 0) {
      return addAllAliased(index, newItems);
    } else {
      return addAllMutable(index, newItems);
    }
  }

  private boolean addAllAliased(int index, Collection<? extends Item> newItems) {
    final int k = newItems.size();
    if (k == 0) {
      return false;
    }
    final int m = this.record.itemCount;
    int n = this.record.fieldCount;
    final Item[] oldArray = this.record.array;
    final Item[] newArray = new Item[expand(m + k)];
    if (oldArray != null) {
      System.arraycopy(oldArray, 0, newArray, 0, this.lower + index);
      System.arraycopy(oldArray, this.lower + index, newArray, this.lower + index + k, m - (this.lower + index));
    }
    for (Item newItem : newItems) {
      newArray[this.lower + index] = newItem;
      index += 1;
      if (newItem instanceof Field) {
        n += 1;
      }
    }
    this.record.array = newArray;
    this.record.table = null;
    this.record.itemCount = m + k;
    this.record.fieldCount = n;
    FLAGS.set(this.record, this.record.flags & ~ALIASED);
    this.upper += k;
    return true;
  }

  private boolean addAllMutable(int index, Collection<? extends Item> newItems) {
    final int k = newItems.size();
    if (k == 0) {
      return false;
    }
    final int m = this.record.itemCount;
    int n = this.record.fieldCount;
    final Item[] oldArray = this.record.array;
    final Item[] newArray;
    if (oldArray == null || m + k > oldArray.length) {
      newArray = new Item[expand(m + k)];
      if (oldArray != null) {
        System.arraycopy(oldArray, 0, newArray, 0, this.lower + index);
      }
    } else {
      newArray = oldArray;
    }
    if (oldArray != null) {
      System.arraycopy(oldArray, this.lower + index, newArray, this.lower + index + k, m - (this.lower + index));
    }
    for (Item newItem : newItems) {
      newArray[this.lower + index] = newItem;
      index += 1;
      if (newItem instanceof Field) {
        n += 1;
        this.record.table = null;
      }
    }
    this.record.array = newArray;
    this.record.itemCount = m + k;
    this.record.fieldCount = n;
    this.upper += k;
    return true;
  }

  @Override
  public Item remove(int index) {
    if ((this.record.flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    } else if (index < 0 || index >= size()) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    if ((this.record.flags & ALIASED) != 0) {
      return removeAliased(index);
    } else {
      return removeMutable(index);
    }
  }

  private Item removeAliased(int index) {
    final int n = this.record.itemCount;
    final Item[] oldArray = this.record.array;
    final Item[] newArray = new Item[expand(n - 1)];
    final Item oldItem = oldArray[index];
    System.arraycopy(oldArray, 0, newArray, 0, this.lower + index);
    System.arraycopy(oldArray, this.lower + index + 1, newArray, this.lower + index, n - (this.lower + index) - 1);
    this.record.array = newArray;
    this.record.table = null;
    this.record.itemCount = n - 1;
    if (oldItem instanceof Field) {
      this.record.fieldCount -= 1;
    }
    FLAGS.set(this.record, this.record.flags & ~ALIASED);
    this.upper -= 1;
    return oldItem;
  }

  private Item removeMutable(int index) {
    final int n = this.record.itemCount;
    final Item[] array = this.record.array;
    final Item oldItem = array[this.lower + index];
    System.arraycopy(array, this.lower + index + 1, array, this.lower + index, n - (this.lower + index) - 1);
    array[n - 1] = null;
    this.record.itemCount = n - 1;
    if (oldItem instanceof Field) {
      this.record.fieldCount -= 1;
      this.record.table = null;
    }
    this.upper -= 1;
    return oldItem;
  }

  @Override
  public boolean remove(Object object) {
    final Item item = Item.fromObject(object);
    if ((this.record.flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    final int index = indexOf(item);
    if (index >= 0) {
      remove(index);
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean removeAll(Collection<?> items) {
    if ((this.record.flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((this.record.flags & ALIASED) != 0) {
      return removeAllAliased(items);
    } else {
      return removeAllMutable(items);
    }
  }

  private boolean removeAllAliased(Collection<?> items) {
    final int m = this.record.itemCount;
    int n = this.record.fieldCount;
    final Item[] oldArray = this.record.array;
    final Item[] newArray = new Item[expand(m)];
    int i = this.lower;
    int j = i;
    final int k = this.upper;
    System.arraycopy(oldArray, 0, newArray, 0, i);
    while (i < k) {
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
      this.upper = j;
      while (i < m) {
        newArray[j] = oldArray[i];
        j += 1;
        i += 1;
      }
      this.record.array = newArray;
      this.record.table = null;
      this.record.itemCount = j;
      this.record.fieldCount = n;
      FLAGS.set(this.record, this.record.flags & ~ALIASED);
      return true;
    } else {
      return false;
    }
  }

  private boolean removeAllMutable(Collection<?> items) {
    final int m = this.record.itemCount;
    int n = this.record.fieldCount;
    final Item[] array = this.record.array;
    int i = this.lower;
    int j = i;
    final int k = this.upper;
    while (i < k) {
      final Item item = array[i];
      if (!items.contains(item)) {
        array[j] = item;
        j += 1;
      } else if (item instanceof Field) {
        n -= 1;
        this.record.table = null;
      }
      i += 1;
    }
    this.upper = j;
    while (i < m) {
      array[j] = array[i];
      j += 1;
      i += 1;
    }
    if (i > j) {
      while (i > j) {
        i -= 1;
        array[i] = null;
      }
      this.record.itemCount = j;
      this.record.fieldCount = n;
      return true;
    } else {
      return false;
    }
  }

  @Override
  public boolean retainAll(Collection<?> items) {
    if ((this.record.flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((this.record.flags & ALIASED) != 0) {
      return retainAllAliased(items);
    } else {
      return retainAllMutable(items);
    }
  }

  private boolean retainAllAliased(Collection<?> items) {
    final int m = this.record.itemCount;
    int n = this.record.fieldCount;
    final Item[] oldArray = this.record.array;
    final Item[] newArray = new Item[expand(m)];
    int i = this.lower;
    int j = i;
    final int k = this.upper;
    System.arraycopy(oldArray, 0, newArray, 0, i);
    while (i < k) {
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
      this.upper = j;
      while (i < m) {
        newArray[j] = oldArray[i];
        j += 1;
        i += 1;
      }
      this.record.array = newArray;
      this.record.table = null;
      this.record.itemCount = j;
      this.record.fieldCount = n;
      FLAGS.set(this.record, this.record.flags & ~ALIASED);
      return true;
    } else {
      return false;
    }
  }

  private boolean retainAllMutable(Collection<?> items) {
    final int m = this.record.itemCount;
    int n = this.record.fieldCount;
    final Item[] array = this.record.array;
    int i = this.lower;
    int j = i;
    final int k = this.upper;
    while (i < k) {
      final Item item = array[i];
      if (items.contains(item)) {
        array[j] = item;
        j += 1;
      } else if (item instanceof Field) {
        n -= 1;
        this.record.table = null;
      }
      i += 1;
    }
    this.upper = j;
    while (i < m) {
      array[j] = array[i];
      j += 1;
      i += 1;
    }
    if (i > j) {
      while (i > j) {
        i -= 1;
        array[i] = null;
      }
      this.record.itemCount = j;
      this.record.fieldCount = n;
      return true;
    } else {
      return false;
    }
  }

  @Override
  public void clear() {
    if ((this.record.flags & IMMUTABLE) != 0) {
      throw new UnsupportedOperationException("immutable");
    }
    if ((this.record.flags & ALIASED) != 0) {
      clearAliased();
    } else {
      clearMutable();
    }
  }

  private void clearAliased() {
    final int m = this.record.itemCount;
    int n = this.record.fieldCount;
    final int l = m - size();
    final Item[] oldArray = this.record.array;
    final Item[] newArray = new Item[expand(l)];
    System.arraycopy(oldArray, 0, newArray, 0, this.lower);
    int i = this.lower;
    while (i < n) {
      if (oldArray[i] instanceof Field) {
        n -= 1;
      }
      i += 1;
    }
    i = this.lower;
    int j = this.upper;
    while (j < m) {
      newArray[i] = oldArray[j];
      i += 1;
      j += 1;
    }
    this.record.array = newArray;
    this.record.table = null;
    this.record.itemCount = l;
    this.record.fieldCount = n;
    FLAGS.set(this.record, this.record.flags & ~ALIASED);
    this.upper = this.lower;
  }

  private void clearMutable() {
    final int m = this.record.itemCount;
    int n = this.record.fieldCount;
    final Item[] array = this.record.array;
    int i = this.lower;
    while (i < n) {
      if (array[i] instanceof Field) {
        n -= 1;
      }
      i += 1;
    }
    i = this.lower;
    int j = this.upper;
    while (j < m) {
      final Item item = array[j];
      if (item instanceof Field) {
        this.record.table = null;
      }
      array[i] = item;
      i += 1;
      j += 1;
    }
    this.record.itemCount = i;
    this.record.fieldCount = n;
    while (i < m) {
      array[i] = null;
      i += 1;
    }
    this.upper = this.lower;
  }

  @Override
  public boolean isAliased() {
    return (this.record.flags & ALIASED) != 0;
  }

  @Override
  public boolean isMutable() {
    return (this.record.flags & IMMUTABLE) == 0;
  }

  @Override
  public void alias() {
    FLAGS.set(this.record, this.record.flags | ALIASED);
  }

  @Override
  public Record branch() {
    final int m = size();
    int n = 0;
    final Item[] oldArray = this.record.array;
    final Item[] newArray = new Item[expand(m)];
    int i = this.lower;
    int j = 0;
    while (j < m) {
      final Item item = oldArray[i];
      newArray[j] = item;
      if (item instanceof Field) {
        n += 1;
      }
      i += 1;
      j += 1;
    }
    return new RecordMap(newArray, null, m, n, 0);
  }

  @Override
  public Record commit() {
    this.record.commit();
    return this;
  }

  @Override
  public Item[] toArray() {
    final int n = size();
    final Item[] array = new Item[n];
    System.arraycopy(this.record.array, this.lower, array, 0, n);
    return array;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T[] toArray(T[] array) {
    final int n = size();
    if (array.length < n) {
      array = (T[]) Array.newInstance(array.getClass().getComponentType(), n);
    }
    System.arraycopy(this.record.array, this.lower, array, 0, n);
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  @Override
  public Record subList(int lower, int upper) {
    if (lower < 0 || upper > size() || lower > upper) {
      throw new IndexOutOfBoundsException(lower + ", " + upper);
    }
    return new RecordMapView(this.record, this.lower + lower, this.lower + upper);
  }
}
