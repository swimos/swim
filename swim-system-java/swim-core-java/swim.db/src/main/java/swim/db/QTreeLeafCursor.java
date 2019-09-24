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

package swim.db;

import java.util.NoSuchElementException;
import swim.spatial.BitInterval;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.Cursor;

class QTreeLeafCursor implements Cursor<Slot> {
  final QTreeLeaf page;
  final long x;
  final long y;
  int index;

  QTreeLeafCursor(QTreeLeaf page, long x, long y, int index) {
    this.page = page;
    this.x = x;
    this.y = y;
    this.index = index;
  }

  QTreeLeafCursor(QTreeLeaf page, long x, long y) {
    this(page, x, y, 0);
  }

  protected Slot getSlot(Slot slot) {
    return slot.updatedValue(slot.toValue().body());
  }

  @Override
  public boolean isEmpty() {
    final long x = this.x;
    final long y = this.y;
    final Slot[] slots = this.page.slots;
    while (this.index < slots.length) {
      final Slot slot = slots[this.index];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      if (BitInterval.intersects(x, y, xt, yt)) {
        return false;
      }
    }
    return true;
  }

  @Override
  public Slot head() {
    final long x = this.x;
    final long y = this.y;
    final Slot[] slots = this.page.slots;
    while (this.index < slots.length) {
      final Slot slot = slots[this.index];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      if (BitInterval.intersects(x, y, xt, yt)) {
        return getSlot(slot);
      }
    }
    throw new NoSuchElementException();
  }

  @Override
  public void step() {
    final long x = this.x;
    final long y = this.y;
    final Slot[] slots = this.page.slots;
    while (this.index < slots.length) {
      final Slot slot = slots[this.index];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      if (BitInterval.intersects(x, y, xt, yt)) {
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
    final Slot[] slots = this.page.slots;
    while (this.index < slots.length) {
      final Slot slot = slots[this.index];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      if (BitInterval.intersects(x, y, xt, yt)) {
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
  public Slot next() {
    final long x = this.x;
    final long y = this.y;
    final Slot[] slots = this.page.slots;
    while (this.index < slots.length) {
      final Slot slot = slots[this.index];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      this.index += 1;
      if (BitInterval.intersects(x, y, xt, yt)) {
        return getSlot(slot);
      }
    }
    throw new NoSuchElementException();
  }

  @Override
  public boolean hasPrevious() {
    final long x = this.x;
    final long y = this.y;
    final Slot[] slots = this.page.slots;
    while (this.index > 0) {
      final Slot slot = slots[this.index - 1];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      if (BitInterval.intersects(x, y, xt, yt)) {
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
  public Slot previous() {
    final long x = this.x;
    final long y = this.y;
    final Slot[] slots = this.page.slots;
    while (this.index > 0) {
      final Slot slot = slots[this.index - 1];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      this.index -= 1;
      if (BitInterval.intersects(x, y, xt, yt)) {
        return getSlot(slot);
      }
    }
    throw new NoSuchElementException();
  }
}
