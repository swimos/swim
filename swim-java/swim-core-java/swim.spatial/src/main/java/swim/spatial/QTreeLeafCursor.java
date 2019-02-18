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

package swim.spatial;

import java.util.NoSuchElementException;
import swim.util.Cursor;

final class QTreeLeafCursor<K, S, V> implements Cursor<QTreeEntry<K, S, V>> {
  final QTreeLeaf<K, S, V> page;
  final long x;
  final long y;
  int index;

  QTreeLeafCursor(QTreeLeaf<K, S, V> page, long x, long y, int index) {
    this.page = page;
    this.x = x;
    this.y = y;
    this.index = index;
  }

  QTreeLeafCursor(QTreeLeaf<K, S, V> page, long x, long y) {
    this(page, x, y, 0);
  }

  @Override
  public boolean isEmpty() {
    final long x = this.x;
    final long y = this.y;
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.index < slots.length) {
      final QTreeEntry<K, S, V> slot = slots[this.index];
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        return false;
      }
    }
    return true;
  }

  @Override
  public QTreeEntry<K, S, V> head() {
    final long x = this.x;
    final long y = this.y;
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.index < slots.length) {
      final QTreeEntry<K, S, V> slot = slots[this.index];
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        return slot;
      }
    }
    throw new NoSuchElementException();
  }

  @Override
  public void step() {
    final long x = this.x;
    final long y = this.y;
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.index < slots.length) {
      final QTreeEntry<K, S, V> slot = slots[this.index];
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        this.index += 1;
        return;
      }
    }
    throw new UnsupportedOperationException();
  }

  @Override
  public void skip(long count) {
    if (count < 0L) {
      throw new IllegalArgumentException();
    }
    this.index = Math.min(this.index + (int) count, this.page.slots.length);
  }

  @Override
  public boolean hasNext() {
    final long x = this.x;
    final long y = this.y;
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.index < slots.length) {
      final QTreeEntry<K, S, V> slot = slots[this.index];
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        return true;
      }
      this.index += 1;
    }
    return false;
  }

  @Override
  public long nextIndexLong() {
    return (long) nextIndex();
  }

  @Override
  public int nextIndex() {
    return this.index;
  }

  @Override
  public QTreeEntry<K, S, V> next() {
    final long x = this.x;
    final long y = this.y;
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.index < slots.length) {
      final QTreeEntry<K, S, V> slot = slots[this.index];
      this.index += 1;
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        return slot;
      }
    }
    throw new NoSuchElementException();
  }

  @Override
  public boolean hasPrevious() {
    final long x = this.x;
    final long y = this.y;
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.index > 0) {
      final QTreeEntry<K, S, V> slot = slots[this.index - 1];
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        return true;
      }
      this.index -= 1;
    }
    return false;
  }

  @Override
  public long previousIndexLong() {
    return (long) previousIndex();
  }

  @Override
  public int previousIndex() {
    return this.index - 1;
  }

  @Override
  public QTreeEntry<K, S, V> previous() {
    final long x = this.x;
    final long y = this.y;
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.index > 0) {
      final QTreeEntry<K, S, V> slot = slots[this.index - 1];
      this.index -= 1;
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        return slot;
      }
    }
    throw new NoSuchElementException();
  }
}
