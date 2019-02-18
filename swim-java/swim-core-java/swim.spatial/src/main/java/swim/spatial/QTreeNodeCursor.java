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

final class QTreeNodeCursor<K, S, V> implements Cursor<QTreeEntry<K, S, V>> {
  final QTreeNode<K, S, V> page;
  final long x;
  final long y;
  long index;
  int slotIndex;
  int pageIndex;
  Cursor<QTreeEntry<K, S, V>> pageCursor;

  QTreeNodeCursor(QTreeNode<K, S, V> page, long x, long y, long index, int slotIndex, int pageIndex) {
    this.page = page;
    this.x = x;
    this.y = y;
    this.index = index;
    this.slotIndex = slotIndex;
    this.pageIndex = pageIndex;
  }

  QTreeNodeCursor(QTreeNode<K, S, V> page, long x, long y) {
    this(page, x, y, 0L, 0, 0);
  }

  Cursor<QTreeEntry<K, S, V>> pageCursor(QTreePage<K, S, V> page) {
    return page.cursor(this.x, this.y);
  }

  @Override
  public boolean isEmpty() {
    final long x = this.x;
    final long y = this.y;
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.slotIndex < slots.length) {
      final QTreeEntry<K, S, V> slot = slots[this.slotIndex];
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        return false;
      }
    }
    do {
      final Cursor<QTreeEntry<K, S, V>> pageCursor = this.pageCursor;
      if (pageCursor != null) {
        if (!pageCursor.isEmpty()) {
          return false;
        } else {
          this.pageCursor = null;
        }
      } else {
        final QTreePage<K, S, V>[] pages = this.page.pages;
        final int pageIndex = this.pageIndex;
        if (pageIndex < pages.length) {
          final QTreePage<K, S, V> page = pages[pageIndex];
          if (BitInterval.intersects(x, y, page.x(), page.y())) {
            this.pageCursor = pageCursor(page);
          } else {
            this.index += page.span();
          }
          this.pageIndex = pageIndex + 1;
        } else {
          return true;
        }
      }
    } while (true);
  }

  @Override
  public QTreeEntry<K, S, V> head() {
    final long x = this.x;
    final long y = this.y;
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.slotIndex < slots.length) {
      final QTreeEntry<K, S, V> slot = slots[this.slotIndex];
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        return slot;
      }
    }
    do {
      final Cursor<QTreeEntry<K, S, V>> pageCursor = this.pageCursor;
      if (pageCursor != null) {
        if (!pageCursor.isEmpty()) {
          return pageCursor.head();
        } else {
          this.pageCursor = null;
        }
      } else {
        final QTreePage<K, S, V>[] pages = this.page.pages;
        final int pageIndex = this.pageIndex;
        if (pageIndex < pages.length) {
          final QTreePage<K, S, V> page = pages[pageIndex];
          if (BitInterval.intersects(x, y, page.x(), page.y())) {
            this.pageCursor = pageCursor(page);
          } else {
            this.index += page.span();
          }
          this.pageIndex = pageIndex + 1;
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
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.slotIndex < slots.length) {
      final QTreeEntry<K, S, V> slot = slots[this.slotIndex];
      this.index += 1L;
      this.slotIndex += 1;
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        return;
      }
    }
    do {
      final Cursor<QTreeEntry<K, S, V>> pageCursor = this.pageCursor;
      if (pageCursor != null) {
        if (pageCursor.hasNext()) {
          this.index += 1L;
          pageCursor.step();
        } else {
          this.pageCursor = null;
        }
      } else {
        final QTreePage<K, S, V>[] pages = this.page.pages;
        final int pageIndex = this.pageIndex;
        if (pageIndex < pages.length) {
          final QTreePage<K, S, V> page = pages[pageIndex];
          if (BitInterval.intersects(x, y, page.x(), page.y())) {
            this.pageCursor = pageCursor(page);
          } else {
            this.index += page.span();
          }
          this.pageIndex = pageIndex + 1;
        } else {
          throw new UnsupportedOperationException();
        }
      }
    } while (true);
  }

  @Override
  public void skip(long count) {
    while (count > 0L) {
      final Cursor<QTreeEntry<K, S, V>> pageCursor = this.pageCursor;
      if (pageCursor != null) {
        if (pageCursor.hasNext()) {
          this.index += 1L;
          count -= 1L;
          pageCursor.next();
        } else {
          this.pageCursor = null;
        }
      } else {
        final QTreePage<K, S, V>[] pages = this.page.pages;
        final int pageIndex = this.pageIndex;
        if (pageIndex < pages.length) {
          final QTreePage<K, S, V> page = pages[pageIndex];
          final long pageSpan = page.span();
          this.pageIndex = pageIndex + 1;
          if (pageSpan < count) {
            this.pageCursor = pageCursor(page);
            if (count > 0L) {
              this.index += count;
              this.pageCursor.skip(count);
              count = 0L;
            }
            break;
          } else {
            this.index += pageSpan;
            count -= pageSpan;
          }
        } else {
          break;
        }
      }
    }
  }

  @Override
  public boolean hasNext() {
    final long x = this.x;
    final long y = this.y;
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.slotIndex < slots.length) {
      final QTreeEntry<K, S, V> slot = slots[this.slotIndex];
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        return true;
      }
      this.index += 1L;
      this.slotIndex += 1;
    }
    do {
      final Cursor<QTreeEntry<K, S, V>> pageCursor = this.pageCursor;
      if (pageCursor != null) {
        if (pageCursor.hasNext()) {
          return true;
        } else {
          this.pageCursor = null;
        }
      } else {
        final QTreePage<K, S, V>[] pages = this.page.pages;
        final int pageIndex = this.pageIndex;
        if (pageIndex < pages.length) {
          final QTreePage<K, S, V> page = pages[pageIndex];
          if (BitInterval.intersects(x, y, page.x(), page.y())) {
            this.pageCursor = pageCursor(page);
          } else {
            this.index += page.span();
          }
          this.pageIndex = pageIndex + 1;
        } else {
          return false;
        }
      }
    } while (true);
  }

  @Override
  public long nextIndexLong() {
    return this.index;
  }

  @Override
  public QTreeEntry<K, S, V> next() {
    final long x = this.x;
    final long y = this.y;
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.slotIndex < slots.length) {
      final QTreeEntry<K, S, V> slot = slots[this.slotIndex];
      this.index += 1L;
      this.slotIndex += 1;
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        return slot;
      }
    }
    do {
      final Cursor<QTreeEntry<K, S, V>> pageCursor = this.pageCursor;
      if (pageCursor != null) {
        if (pageCursor.hasNext()) {
          this.index += 1L;
          return pageCursor.next();
        } else {
          this.pageCursor = null;
        }
      } else {
        final QTreePage<K, S, V>[] pages = this.page.pages;
        final int pageIndex = this.pageIndex;
        if (pageIndex < pages.length) {
          final QTreePage<K, S, V> page = pages[pageIndex];
          if (BitInterval.intersects(x, y, page.x(), page.y())) {
            this.pageCursor = pageCursor(page);
          } else {
            this.index += page.span();
          }
          this.pageIndex = pageIndex + 1;
        } else {
          throw new NoSuchElementException();
        }
      }
    } while (true);
  }

  @Override
  public boolean hasPrevious() {
    final long x = this.x;
    final long y = this.y;
    do {
      final Cursor<QTreeEntry<K, S, V>> pageCursor = this.pageCursor;
      if (pageCursor != null) {
        if (pageCursor.hasPrevious()) {
          return true;
        } else {
          this.pageCursor = null;
        }
      } else {
        final QTreePage<K, S, V>[] pages = this.page.pages;
        final int pageIndex = this.pageIndex - 1;
        if (pageIndex >= 0) {
          final QTreePage<K, S, V> page = pages[pageIndex];
          if (BitInterval.intersects(x, y, page.x(), page.y())) {
            this.pageCursor = pageCursor(page);
          } else {
            this.index -= page.span();
          }
          this.pageIndex = pageIndex;
        } else {
          break;
        }
      }
    } while (true);
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.slotIndex > 0) {
      final QTreeEntry<K, S, V> slot = slots[this.slotIndex - 1];
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        return true;
      }
      this.index -= 1L;
      this.slotIndex -= 1;
    }
    return false;
  }

  @Override
  public long previousIndexLong() {
    return this.index - 1L;
  }

  @Override
  public QTreeEntry<K, S, V> previous() {
    final long x = this.x;
    final long y = this.y;
    do {
      final Cursor<QTreeEntry<K, S, V>> pageCursor = this.pageCursor;
      if (pageCursor != null) {
        if (pageCursor.hasPrevious()) {
          this.index -= 1L;
          return pageCursor.previous();
        } else {
          this.pageCursor = null;
        }
      } else {
        final QTreePage<K, S, V>[] pages = this.page.pages;
        final int pageIndex = this.pageIndex - 1;
        if (pageIndex < pages.length) {
          final QTreePage<K, S, V> page = pages[pageIndex];
          if (BitInterval.intersects(x, y, page.x(), page.y())) {
            this.pageCursor = pageCursor(page);
          } else {
            this.index -= page.span();
          }
          this.pageIndex = pageIndex;
        } else {
          break;
        }
      }
    } while (true);
    final QTreeEntry<K, S, V>[] slots = this.page.slots;
    while (this.slotIndex > 0) {
      final QTreeEntry<K, S, V> slot = slots[this.slotIndex - 1];
      this.index -= 1L;
      this.slotIndex -= 1;
      if (BitInterval.intersects(x, y, slot.x, slot.y)) {
        return slot;
      }
    }
    throw new NoSuchElementException();
  }
}
