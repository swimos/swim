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

package swim.util;

import java.util.NoSuchElementException;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public class LruCacheSet<T> extends CacheSet<T> implements WriteMarkup {

  final int capacity;
  int size;
  LruCacheSetEntry<T>[] table;
  @Nullable LruCacheSetEntry<T> head;
  @Nullable LruCacheSetEntry<T> foot;

  public LruCacheSet(int capacity) {
    this.capacity = capacity;
    this.size = 0;
    this.table = Assume.conforms(new LruCacheSetEntry<?>[LruCacheSet.expand(Math.max(capacity, capacity * 10 / 7))]);
    this.head = null;
    this.foot = null;
  }

  @Override
  public final int capacity() {
    return this.capacity;
  }

  @Override
  public final int size() {
    return this.size;
  }

  @Override
  public synchronized boolean contains(T value) {
    final LruCacheSetEntry<T> entry = this.getEntry(Objects.hashCode(value), value);
    return entry != null;
  }

  @Override
  public synchronized @Nullable T peek(T value) {
    final LruCacheSetEntry<T> entry = this.getEntry(Objects.hashCode(value), value);
    return entry != null ? entry.value : null;
  }

  @Override
  public synchronized @Nullable T get(T value) {
    final LruCacheSetEntry<T> entry = this.getEntry(Objects.hashCode(value), value);
    if (entry == null) {
      return null;
    } else if (entry.prev != null) {
      this.detachEntry(entry);
      this.enqueueEntry(entry);
    }
    return entry.value;
  }

  @Override
  public synchronized T put(T value) {
    final int hash = Objects.hashCode(value);
    LruCacheSetEntry<T> entry = this.getEntry(hash, value);
    if (entry != null) {
      if (entry.prev != null) {
        this.detachEntry(entry);
        this.enqueueEntry(entry);
      }
    } else if (this.size == this.capacity) {
      entry = this.dequeueEntry();
      this.removeEntry(entry.hash, entry.value);
      entry.hash = hash;
      entry.value = value;
      this.putEntry(entry);
      this.enqueueEntry(entry);
    } else {
      //assert this.size < this.capacity;
      entry = new LruCacheSetEntry<T>(hash, value);
      this.putEntry(entry);
      this.enqueueEntry(entry);
      this.size += 1;
    }
    return value;
  }

  @Override
  public synchronized @Nullable T remove(T value) {
    final LruCacheSetEntry<T> entry = this.removeEntry(Objects.hashCode(value), value);
    if (entry == null) {
      return null;
    }
    this.detachEntry(entry);
    this.size -= 1;
    return entry.value;
  }

  final @Nullable LruCacheSetEntry<T> getEntry(int hash, T value) {
    final LruCacheSetEntry<T>[] table = this.table;
    LruCacheSetEntry<T> bucket = table[Math.abs(hash % table.length)];
    while (bucket != null) {
      if (Objects.equals(value, bucket.value)) {
        return bucket;
      }
      bucket = bucket.nextCollision;
    }
    return null;
  }

  final void putEntry(LruCacheSetEntry<T> entry) {
    final LruCacheSetEntry<T>[] table = this.table;
    final int index = Math.abs(entry.hash % table.length);
    LruCacheSetEntry<T> bucket = table[index];
    if (bucket == null) {
      table[index] = entry;
      return;
    } else if (Objects.equals(entry.value, bucket.value)) {
      entry.nextCollision = bucket.nextCollision;
      table[index] = bucket;
      return;
    }
    LruCacheSetEntry<T> prev = bucket;
    do {
      bucket = prev.nextCollision;
      if (bucket == null) {
        prev.nextCollision = entry;
        return;
      } else if (Objects.equals(entry.value, bucket.value)) {
        entry.nextCollision = bucket.nextCollision;
        prev.nextCollision = entry;
        return;
      }
      prev = bucket;
    } while (true);
  }

  final @Nullable LruCacheSetEntry<T> removeEntry(int hash, T value) {
    final LruCacheSetEntry<T>[] table = this.table;
    final int index = Math.abs(hash % table.length);
    LruCacheSetEntry<T> bucket = table[index];
    if (bucket == null) {
      return null;
    } else if (Objects.equals(value, bucket.value)) {
      table[index] = bucket.nextCollision;
      bucket.nextCollision = null;
      return bucket;
    }
    LruCacheSetEntry<T> prev = bucket;
    do {
      bucket = prev.nextCollision;
      if (bucket == null) {
        return null;
      } else if (Objects.equals(value, bucket.value)) {
        prev.nextCollision = bucket.nextCollision;
        bucket.nextCollision = null;
        return bucket;
      }
      prev = bucket;
    } while (true);
  }

  final void enqueueEntry(LruCacheSetEntry<T> entry) {
    if (this.head != null) {
      this.head.prev = entry;
    } else {
      this.foot = entry;
    }
    entry.prev = null;
    entry.next = this.head;
    this.head = entry;
  }

  final LruCacheSetEntry<T> dequeueEntry() {
    final LruCacheSetEntry<T> entry = this.foot;
    if (entry == null) {
      throw new NoSuchElementException();
    }
    if (entry.prev != null) {
      entry.prev.next = null;
    } else {
      this.head = null;
    }
    this.foot = entry.prev;
    entry.prev = null;
    entry.next = null;
    return entry;
  }

  final void detachEntry(LruCacheSetEntry<T> entry) {
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
  public synchronized void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    if (notation.options().verbose()) {
      notation.beginObject("LruCacheSet")
              .appendField("capacity", this.capacity)
              .appendField("size", this.size);
      if (this.head != null) {
        notation.appendField("headValue", this.head.value);
      }
      if (this.foot != null) {
        notation.appendField("footValue", this.foot.value);
      }
      notation.appendField("table", this.table)
              .endObject();
    } else {
      notation.beginArray("LruCacheSet");
      LruCacheSetEntry<T> entry = this.head;
      while (entry != null) {
        notation.appendElement(entry.value);
        entry = entry.next;
      }
      notation.endArray();
    }
  }

  @Override
  public String toString() {
    return WriteMarkup.toString(this);
  }

  static int expand(int n) {
    n = Math.max(4, n) - 1;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
  }

}

final class LruCacheSetEntry<T> implements WriteMarkup {

  int hash;
  T value;
  @Nullable LruCacheSetEntry<T> prev;
  @Nullable LruCacheSetEntry<T> next;
  @Nullable LruCacheSetEntry<T> nextCollision;

  LruCacheSetEntry(int hash, T value) {
    this.hash = hash;
    this.value = value;
    this.prev = null;
    this.next = null;
    this.nextCollision = null;
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    if (notation.options().verbose()) {
      notation.beginObject()
              .appendField("hash", this.hash)
              .appendField("value", this.value);
      if (this.prev != null) {
        notation.appendField("prevValue", this.prev.value);
      }
      if (this.next != null) {
        notation.appendField("nextValue", this.next.value);
      }
      if (this.nextCollision != null) {
        notation.appendField("nextCollision", this.nextCollision);
      }
      notation.endObject();
    } else {
      notation.appendMarkup(this.value);
    }
  }

  @Override
  public String toString() {
    return WriteMarkup.toString(this);
  }

}
