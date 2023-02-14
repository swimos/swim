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
public class LruCacheMap<K, V> extends CacheMap<K, V> implements ToMarkup {

  final int capacity;
  int size;
  LruCacheMapEntry<K, V>[] table;
  @Nullable LruCacheMapEntry<K, V> head;
  @Nullable LruCacheMapEntry<K, V> foot;

  public LruCacheMap(int capacity) {
    this.capacity = capacity;
    this.size = 0;
    this.table = Assume.conforms(new LruCacheMapEntry<?, ?>[LruCacheMap.expand(Math.max(capacity, capacity * 10 / 7))]);
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
  public synchronized boolean contains(@Nullable K key) {
    final LruCacheMapEntry<K, V> entry = this.getEntry(Objects.hashCode(key), key);
    return entry != null;
  }

  @Override
  public synchronized @Nullable V peek(@Nullable K key) {
    final LruCacheMapEntry<K, V> entry = this.getEntry(Objects.hashCode(key), key);
    return entry != null ? entry.value : null;
  }

  @Override
  public synchronized @Nullable V get(@Nullable K key) {
    final LruCacheMapEntry<K, V> entry = this.getEntry(Objects.hashCode(key), key);
    if (entry != null) {
      if (entry.prev != null) {
        this.detachEntry(entry);
        this.enqueueEntry(entry);
      }
      return entry.value;
    }
    return null;
  }

  @Override
  public synchronized V put(@Nullable K key, V value) {
    final int hash = Objects.hashCode(key);
    LruCacheMapEntry<K, V> entry = this.getEntry(hash, key);
    if (entry != null) {
      entry.value = value;
      if (entry.prev != null) {
        this.detachEntry(entry);
        this.enqueueEntry(entry);
      }
    } else if (this.size == this.capacity) {
      entry = this.dequeueEntry();
      this.removeEntry(entry.hash, entry.key);
      entry.hash = hash;
      entry.key = key;
      entry.value = value;
      this.putEntry(entry);
      this.enqueueEntry(entry);
    } else {
      //assert this.size < this.capacity;
      entry = new LruCacheMapEntry<K, V>(hash, key, value);
      this.putEntry(entry);
      this.enqueueEntry(entry);
      this.size += 1;
    }
    return value;
  }

  @Override
  public synchronized @Nullable V remove(@Nullable K key) {
    final LruCacheMapEntry<K, V> entry = this.removeEntry(Objects.hashCode(key), key);
    if (entry != null) {
      this.detachEntry(entry);
      this.size -= 1;
    }
    return null;
  }

  final @Nullable LruCacheMapEntry<K, V> getEntry(int hash, @Nullable K key) {
    final LruCacheMapEntry<K, V>[] table = this.table;
    LruCacheMapEntry<K, V> bucket = table[Math.abs(hash % table.length)];
    while (bucket != null) {
      if (Objects.equals(key, bucket.key)) {
        return bucket;
      }
      bucket = bucket.nextCollision;
    }
    return null;
  }

  final void putEntry(LruCacheMapEntry<K, V> entry) {
    final LruCacheMapEntry<K, V>[] table = this.table;
    final int index = Math.abs(entry.hash % table.length);
    LruCacheMapEntry<K, V> bucket = table[index];
    if (bucket != null) {
      if (Objects.equals(entry.key, bucket.key)) {
        entry.nextCollision = bucket.nextCollision;
        table[index] = bucket;
      } else {
        LruCacheMapEntry<K, V> prev = bucket;
        do {
          bucket = prev.nextCollision;
          if (bucket != null) {
            if (Objects.equals(entry.key, bucket.key)) {
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
      table[index] = entry;
    }
  }

  final @Nullable LruCacheMapEntry<K, V> removeEntry(int hash, @Nullable K key) {
    final LruCacheMapEntry<K, V>[] table = this.table;
    final int index = Math.abs(hash % table.length);
    LruCacheMapEntry<K, V> bucket = table[index];
    if (bucket != null) {
      if (Objects.equals(key, bucket.key)) {
        table[index] = bucket.nextCollision;
        bucket.nextCollision = null;
        return bucket;
      } else {
        LruCacheMapEntry<K, V> prev = bucket;
        do {
          bucket = prev.nextCollision;
          if (bucket != null) {
            if (Objects.equals(key, bucket.key)) {
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

  final void enqueueEntry(LruCacheMapEntry<K, V> entry) {
    if (this.head != null) {
      this.head.prev = entry;
    } else {
      this.foot = entry;
    }
    entry.prev = null;
    entry.next = this.head;
    this.head = entry;
  }

  final LruCacheMapEntry<K, V> dequeueEntry() {
    final LruCacheMapEntry<K, V> entry = this.foot;
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

  final void detachEntry(LruCacheMapEntry<K, V> entry) {
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
      notation.beginObject("LruCacheMap");
      notation.appendField("capacity", this.capacity);
      notation.appendField("size", this.size);
      if (this.head != null) {
        notation.appendField("headKey", this.head.key);
      }
      if (this.foot != null) {
        notation.appendField("footKey", this.foot.key);
      }
      notation.appendField("table", this.table);
      notation.endObject();
    } else {
      notation.beginObject("LruCacheMap");
      LruCacheMapEntry<K, V> entry = this.head;
      while (entry != null) {
        notation.appendField(entry.key, entry.value);
        entry = entry.next;
      }
      notation.endObject();
    }
  }

  @Override
  public String toString() {
    return this.toMarkup();
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

final class LruCacheMapEntry<K, V> implements ToMarkup {

  int hash;
  @Nullable K key;
  V value;
  @Nullable LruCacheMapEntry<K, V> prev;
  @Nullable LruCacheMapEntry<K, V> next;
  @Nullable LruCacheMapEntry<K, V> nextCollision;

  LruCacheMapEntry(int hash, @Nullable K key, V value) {
    this.hash = hash;
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
    this.nextCollision = null;
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginObject();
    if (notation.options().verbose()) {
      notation.appendField("hash", this.hash);
    }
    notation.appendField("key", this.key);
    notation.appendField("value", this.value);
    if (notation.options().verbose()) {
      if (this.prev != null) {
        notation.appendField("prevKey", this.prev.key);
      }
      if (this.next != null) {
        notation.appendField("nextKey", this.next.key);
      }
      if (this.nextCollision != null) {
        notation.appendField("nextCollision", this.nextCollision);
      }
    }
    notation.endObject();
  }

  @Override
  public String toString() {
    return this.toMarkup();
  }

}
