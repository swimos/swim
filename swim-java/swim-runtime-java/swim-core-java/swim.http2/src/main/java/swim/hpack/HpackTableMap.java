// Copyright 2015-2021 Swim Inc.
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

package swim.hpack;

import java.util.Arrays;

final class HpackTableMap {

  final Entry[] entries;
  final Entry head;
  int size;
  int capacity;

  HpackTableMap(Entry[] entries, Entry head, int size, int capacity) {
    this.entries = entries;
    this.head = head;
    this.size = size;
    this.capacity = capacity;
  }

  int length() {
    if (this.size != 0) {
      final Entry head = this.head;
      return head.after.index - head.before.index + 1;
    } else {
      return 0;
    }
  }

  int size() {
    return this.size;
  }

  int capacity() {
    return this.capacity;
  }

  void setCapacity(int capacity) {
    this.capacity = capacity;
    this.ensureCapacity(0);
  }

  void ensureCapacity(int headerSize) {
    while (this.size + headerSize > this.capacity && this.length() != 0) {
      this.removeEntry();
    }
  }

  HpackHeader get(int index) {
    return this.getEntry(index).header;
  }

  Entry getEntry(int index) {
    index -= 1;
    Entry entry = this.head;
    while (index >= 0) {
      entry = entry.before;
      index -= 1;
    }
    return entry;
  }

  Entry getEntry(HpackHeader header) {
    if (this.length() != 0 && header != null) {
      final int hash = this.hash(header.name);
      final int i = hash % this.entries.length;
      for (Entry entry = this.entries[i]; entry != null; entry = entry.next) {
        if (entry.hash == hash && entry.header.equals(header)) {
          return entry;
        }
      }
    }
    return null;
  }

  int getIndex(byte[] name) {
    if (this.length() != 0 && name != null) {
      final int hash = this.hash(name);
      final int i = hash % this.entries.length;
      for (Entry entry = this.entries[i]; entry != null; entry = entry.next) {
        if (entry.hash == hash && entry.header.equalsName(name)) {
          return this.getIndex(entry);
        }
      }
    }
    return -1;
  }

  int getIndex(Entry entry) {
    return entry.index - this.head.before.index + 1;
  }

  void add(HpackHeader header) {
    final int headerSize = header.hpackSize();
    if (headerSize > this.capacity) {
      this.clear();
    } else {
      while (this.size + headerSize > this.capacity) {
        this.removeEntry();
      }
      final int hash = this.hash(header.name);
      final int i = hash % this.entries.length;
      final int index = this.head.before.index - 1;
      final Entry oldEntry = this.entries[i];
      final Entry newEntry = new Entry(header, hash, index, oldEntry, null, null);
      this.entries[i] = newEntry;
      newEntry.addBefore(this.head);
      this.size += headerSize;
    }
  }

  Entry removeEntry() {
    if (this.size != 0) {
      final Entry eldest = this.head.after;
      final int i = eldest.hash % this.entries.length;
      Entry prev = this.entries[i];
      Entry entry = prev;
      while (entry != null) {
        final Entry next = entry.next;
        if (entry == eldest) {
          if (prev == eldest) {
            this.entries[i] = next;
          } else {
            prev.next = next;
          }
          eldest.remove();
          this.size -= eldest.header.hpackSize();
          return eldest;
        }
        prev = entry;
        entry = next;
      }
    }
    return null;
  }

  HpackHeader remove() {
    final Entry entry = this.removeEntry();
    return entry != null ? entry.header : null;
  }

  void clear() {
    Arrays.fill(this.entries, null);
    final Entry head = this.head;
    head.before = head;
    head.after = head;
    this.size = 0;
  }

  int hash(byte[] name) {
    int h = 0;
    for (int i = 0; i < name.length; i++) {
      h = 31 * h + name[i];
    }
    if (h > 0) {
      return h;
    } else if (h == Integer.MIN_VALUE) {
      return Integer.MAX_VALUE;
    } else {
      return -h;
    }
  }

  @Override
  public HpackTableMap clone() {
    final HpackTableMap dynamicTable = HpackTableMap.withCapacity(this.capacity);
    for (Entry entry = this.head.after; entry != null && entry.header != null; entry = entry.after) {
      dynamicTable.add(entry.header);
    }
    return dynamicTable;
  }

  static HpackTableMap withCapacity(int capacity) {
    final Entry[] entries = new Entry[17];
    final Entry head = new Entry(null, -1, Integer.MAX_VALUE);
    head.before = head;
    head.after = head;
    return new HpackTableMap(entries, head, 0, capacity);
  }

  static final class Entry {

    HpackHeader header;
    int hash;
    int index;
    Entry next;
    Entry before;
    Entry after;

    Entry(HpackHeader header, int hash, int index, Entry next, Entry before, Entry after) {
      this.header = header;
      this.hash = hash;
      this.index = index;
      this.next = next;
      this.before = before;
      this.after = after;
    }

    Entry(HpackHeader header, int hash, int index) {
      this(header, hash, index, null, null, null);
    }

    void remove() {
      this.before.after = this.after;
      this.after.before = this.before;
      this.before = null;
      this.after = null;
      this.next = null;
    }

    void addBefore(Entry that) {
      this.after = that;
      this.before = that.before;
      this.before.after = this;
      this.after.before = this;
    }

  }

}
