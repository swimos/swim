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
import swim.concurrent.Sync;
import swim.spatial.BitInterval;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.Cursor;

abstract class QTreeNodeCursor implements Cursor<Slot> {
  final QTreeNode page;
  final long x;
  final long y;
  long index;
  int slotIndex;
  int childIndex;
  Cursor<Slot> childCursor;

  QTreeNodeCursor(QTreeNode page, long x, long y, long index, int slotIndex, int childIndex) {
    this.page = page;
    this.x = x;
    this.y = y;
    this.index = index;
    this.slotIndex = slotIndex;
    this.childIndex = childIndex;
  }

  QTreeNodeCursor(QTreeNode page, long x, long y) {
    this(page, x, y, 0L, 0, 0);
  }

  abstract Cursor<Slot> childCursor(QTreePageRef childRef);

  @Override
  public final boolean isEmpty() {
    final long x = this.x;
    final long y = this.y;
    final Slot[] slots = this.page.slots;
    while (this.slotIndex < slots.length) {
      final Slot slot = slots[this.slotIndex];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      if (BitInterval.intersects(x, y, xt, yt)) {
        return false;
      }
    }
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (!childCursor.isEmpty()) {
          return false;
        } else {
          this.childCursor = null;
        }
      } else {
        final QTreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex;
        if (childIndex < childRefs.length) {
          final QTreePageRef childRef = childRefs[childIndex];
          if (BitInterval.intersects(x, y, childRef.x, childRef.y)) {
            this.childCursor = childCursor(childRef);
          } else {
            this.index += childRef.span();
          }
          this.childIndex = childIndex + 1;
        } else {
          return true;
        }
      }
    } while (true);
  }

  @Override
  public final Slot head() {
    final long x = this.x;
    final long y = this.y;
    final Slot[] slots = this.page.slots;
    while (this.slotIndex < slots.length) {
      final Slot slot = slots[this.slotIndex];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      if (BitInterval.intersects(x, y, xt, yt)) {
        return slot;
      }
    }
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (!childCursor.isEmpty()) {
          return childCursor.head();
        } else {
          this.childCursor = null;
        }
      } else {
        final QTreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex;
        if (childIndex < childRefs.length) {
          final QTreePageRef childRef = childRefs[childIndex];
          if (BitInterval.intersects(x, y, childRef.x, childRef.y)) {
            this.childCursor = childCursor(childRef);
          } else {
            this.index += childRef.span();
          }
          this.childIndex = childIndex + 1;
        } else {
          throw new NoSuchElementException();
        }
      }
    } while (true);
  }

  @Override
  public void step() {
    final long x = this.x;
    final long y = this.y;
    final Slot[] slots = this.page.slots;
    while (this.slotIndex < slots.length) {
      final Slot slot = slots[this.slotIndex];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      this.index += 1L;
      this.slotIndex += 1;
      if (BitInterval.intersects(x, y, xt, yt)) {
        return;
      }
    }
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasNext()) {
          this.index += 1L;
          childCursor.step();
        } else {
          this.childCursor = null;
        }
      } else {
        final QTreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex;
        if (childIndex < childRefs.length) {
          final QTreePageRef childRef = childRefs[childIndex];
          if (BitInterval.intersects(x, y, childRef.x, childRef.y)) {
            this.childCursor = childCursor(childRef);
          } else {
            this.index += childRef.span();
          }
          this.childIndex = childIndex + 1;
        } else {
          throw new UnsupportedOperationException();
        }
      }
    } while (true);
  }

  @Override
  public final void skip(long count) {
    while (count > 0L) {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasNext()) {
          this.index += 1L;
          count -= 1L;
          childCursor.next();
        } else {
          this.childCursor = null;
        }
      } else {
        final QTreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex;
        if (childIndex < childRefs.length) {
          final QTreePageRef childRef = childRefs[childIndex];
          final long childSpan = childRef.span();
          this.childIndex = childIndex + 1;
          if (childSpan < count) {
            this.childCursor = childCursor(childRef);
            if (count > 0L) {
              this.index += count;
              this.childCursor.skip(count);
              count = 0L;
            }
            break;
          } else {
            this.index += childSpan;
            count -= childSpan;
          }
        } else {
          break;
        }
      }
    }
  }

  @Override
  public final boolean hasNext() {
    final long x = this.x;
    final long y = this.y;
    final Slot[] slots = this.page.slots;
    while (this.slotIndex < slots.length) {
      final Slot slot = slots[this.slotIndex];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      if (BitInterval.intersects(x, y, xt, yt)) {
        return true;
      }
      this.index += 1L;
      this.slotIndex += 1;
    }
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasNext()) {
          return true;
        } else {
          this.childCursor = null;
        }
      } else {
        final QTreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex;
        if (childIndex < childRefs.length) {
          final QTreePageRef childRef = childRefs[childIndex];
          if (BitInterval.intersects(x, y, childRef.x, childRef.y)) {
            this.childCursor = childCursor(childRef);
          } else {
            this.index += childRef.span();
          }
          this.childIndex = childIndex + 1;
        } else {
          return false;
        }
      }
    } while (true);
  }

  @Override
  public final long nextIndexLong() {
    return this.index;
  }

  @Override
  public final Slot next() {
    final long x = this.x;
    final long y = this.y;
    final Slot[] slots = this.page.slots;
    while (this.slotIndex < slots.length) {
      final Slot slot = slots[this.slotIndex];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      this.index += 1L;
      this.slotIndex += 1;
      if (BitInterval.intersects(x, y, xt, yt)) {
        return slot;
      }
    }
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasNext()) {
          this.index += 1L;
          return childCursor.next();
        } else {
          this.childCursor = null;
        }
      } else {
        final QTreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex;
        if (childIndex < childRefs.length) {
          final QTreePageRef childRef = childRefs[childIndex];
          if (BitInterval.intersects(x, y, childRef.x, childRef.y)) {
            this.childCursor = childCursor(childRef);
          } else {
            this.index += childRef.span();
          }
          this.childIndex = childIndex + 1;
        } else {
          throw new NoSuchElementException();
        }
      }
    } while (true);
  }

  @Override
  public final boolean hasPrevious() {
    final long x = this.x;
    final long y = this.y;
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasPrevious()) {
          return true;
        } else {
          this.childCursor = null;
        }
      } else {
        final QTreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex - 1;
        if (childIndex >= 0) {
          final QTreePageRef childRef = childRefs[childIndex];
          if (BitInterval.intersects(x, y, childRef.x, childRef.y)) {
            this.childCursor = childCursor(childRef);
          } else {
            this.index -= childRef.span();
          }
          this.childIndex = childIndex;
        } else {
          break;
        }
      }
    } while (true);
    final Slot[] slots = this.page.slots;
    while (this.slotIndex > 0) {
      final Slot slot = slots[this.slotIndex - 1];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      if (BitInterval.intersects(x, y, xt, yt)) {
        return true;
      }
      this.index -= 1L;
      this.slotIndex -= 1;
    }
    return false;
  }

  @Override
  public final long previousIndexLong() {
    return this.index - 1L;
  }

  @Override
  public final Slot previous() {
    final long x = this.x;
    final long y = this.y;
    do {
      final Cursor<Slot> childCursor = this.childCursor;
      if (childCursor != null) {
        if (childCursor.hasPrevious()) {
          this.index -= 1L;
          return childCursor.previous();
        } else {
          this.childCursor = null;
        }
      } else {
        final QTreePageRef[] childRefs = this.page.childRefs;
        final int childIndex = this.childIndex - 1;
        if (childIndex < childRefs.length) {
          final QTreePageRef childRef = childRefs[childIndex];
          if (BitInterval.intersects(x, y, childRef.x, childRef.y)) {
            this.childCursor = childCursor(childRef);
          } else {
            this.index -= childRef.span();
          }
          this.childIndex = childIndex;
        } else {
          break;
        }
      }
    } while (true);
    final Slot[] slots = this.page.slots;
    while (this.slotIndex > 0) {
      final Slot slot = slots[this.slotIndex - 1];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
      this.index -= 1L;
      this.slotIndex -= 1;
      if (BitInterval.intersects(x, y, xt, yt)) {
        return slot;
      }
    }
    throw new NoSuchElementException();
  }

  @Override
  public void load() throws InterruptedException {
    final Sync<Page> syncPage = new Sync<Page>();
    page.pageRef.loadTreeAsync(false, syncPage);
    syncPage.await(page.pageRef.settings().pageLoadTimeout);
  }
}
