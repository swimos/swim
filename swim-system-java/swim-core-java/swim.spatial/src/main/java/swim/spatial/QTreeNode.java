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

import swim.util.Cursor;

final class QTreeNode<K, S, V> extends QTreePage<K, S, V> {
  final QTreePage<K, S, V>[] pages;
  final QTreeEntry<K, S, V>[] slots;
  final long x;
  final long y;
  final long span;

  QTreeNode(QTreePage<K, S, V>[] pages, QTreeEntry<K, S, V>[] slots, long x, long y, long span) {
    this.pages = pages;
    this.slots = slots;
    this.x = x;
    this.y = y;
    this.span = span;
  }

  @Override
  public boolean isEmpty() {
    return this.span == 0L;
  }

  @Override
  public long span() {
    return this.span;
  }

  @Override
  public int arity() {
    return this.pages.length + this.slots.length;
  }

  @Override
  public QTreePage<K, S, V> getPage(int index) {
    return this.pages[index];
  }

  @Override
  public int slotCount() {
    return this.slots.length;
  }

  @Override
  public QTreeEntry<K, S, V> getSlot(int index) {
    return this.slots[index];
  }

  @Override
  public long x() {
    return this.x;
  }

  @Override
  public int xRank() {
    return Long.numberOfLeadingZeros(~this.x);
  }

  @Override
  public long xBase() {
    return this.x << xRank();
  }

  @Override
  public long xMask() {
    return ~((1L << xRank()) - 1L);
  }

  @Override
  public long xSplit() {
    return this.x << 1 & 1L;
  }

  @Override
  public long y() {
    return this.y;
  }

  @Override
  public int yRank() {
    return Long.numberOfLeadingZeros(~this.y);
  }

  @Override
  public long yBase() {
    return this.y << yRank();
  }

  @Override
  public long yMask() {
    return ~((1L << yRank()) - 1L);
  }

  @Override
  public long ySplit() {
    return this.y << 1 & 1L;
  }

  @Override
  public boolean containsKey(K key, long xk, long yk, QTreeContext<K, S, V> tree) {
    final int xRank = Long.numberOfLeadingZeros(~this.x);
    final int yRank = Long.numberOfLeadingZeros(~this.y);
    final int xkRank = Long.numberOfLeadingZeros(~xk);
    final int ykRank = Long.numberOfLeadingZeros(~yk);
    if (xkRank <= xRank && ykRank <= yRank) {
      final int i = scan(xk, yk);
      //final int i = lookup(xk, yk);
      if (i >= 0) {
        final QTreePage<K, S, V> page = this.pages[i];
        if (xkRank <= page.xRank() && ykRank <= page.yRank()) {
          if (page.containsKey(key, xk, yk, tree)) {
            return true;
          }
        }
      }
      return lookup(key, tree) >= 0;
    }
    return false;
  }

  @Override
  public V get(K key, long xk, long yk, QTreeContext<K, S, V> tree) {
    final int xRank = Long.numberOfLeadingZeros(~this.x);
    final int yRank = Long.numberOfLeadingZeros(~this.y);
    final int xkRank = Long.numberOfLeadingZeros(~xk);
    final int ykRank = Long.numberOfLeadingZeros(~yk);
    if (xkRank <= xRank && ykRank <= yRank) {
      int i = scan(xk, yk);
      //int i = lookup(xk, yk);
      if (i >= 0) {
        final QTreePage<K, S, V> page = this.pages[i];
        if (xkRank <= page.xRank() && ykRank <= page.yRank()) {
          final V value = page.get(key, xk, yk, tree);
          if (value != null) {
            return value;
          }
        }
      }
      i = lookup(key, tree);
      if (i >= 0) {
        return this.slots[i].value;
      }
    }
    return null;
  }

  @Override
  QTreeNode<K, S, V> updated(K key, S shape, long xk, long yk, V newValue,
                             QTreeContext<K, S, V> tree, boolean canSplit) {
    final QTreePage<K, S, V>[] pages = this.pages;
    final int n = pages.length;
    final int j = lookup(xk, yk);
    final int i = j >= 0 ? j : -(j + 1);
    final QTreePage<K, S, V> oldPage = pages[i];
    final QTreePage<K, S, V> newPage = oldPage.updated(key, shape, xk, yk, newValue, tree);
    if (oldPage.x() == newPage.x() && oldPage.y() == newPage.y()) {
      if (canSplit && oldPage.span() != newPage.span() && tree.pageShouldSplit(newPage)) {
        return updatedPageSplit(i, newPage, oldPage, tree);
      } else {
        return updatedPage(i, newPage, oldPage);
      }
    } else {
      return coalescePage(this, i, newPage, oldPage, tree);
    }
  }

  QTreeNode<K, S, V> coalescePage(QTreeNode<K, S, V> basePage, int i, QTreePage<K, S, V> newPage,
                                  QTreePage<K, S, V> oldPage, QTreeContext<K, S, V> tree) {
    do {
      basePage = basePage.removedPage(i, oldPage);
      int j = basePage.scan(newPage.x(), newPage.y());
      //int j = basePage.lookup(newPage.x(), newPage.y());
      if (j < 0) {
        j = -(j + 1);
        return basePage.insertedPage(j, newPage).reinsertedSlots(tree);
      } else {
        i = j;
        oldPage = basePage.getPage(i);
        newPage = oldPage.mergedPage(newPage, tree);
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  QTreeNode<K, S, V> updatedPage(int i, QTreePage<K, S, V> newPage, QTreePage<K, S, V> oldPage) {
    final QTreePage<K, S, V>[] oldPages = this.pages;
    final int n = oldPages.length;
    final QTreePage<K, S, V>[] newPages = (QTreePage<K, S, V>[]) new QTreePage<?, ?, ?>[n];
    System.arraycopy(oldPages, 0, newPages, 0, n);
    newPages[i] = newPage;
    BitInterval.sort(newPages, PAGE_ORDERING);
    final long newSpan = this.span - oldPage.span() + newPage.span();
    return QTreeNode.create(newPages, this.slots, newSpan);
  }

  QTreeNode<K, S, V> updatedPageSplit(int i, QTreePage<K, S, V> newPage,
                                      QTreePage<K, S, V> oldPage, QTreeContext<K, S, V> tree) {
    QTreeNode<K, S, V> page = removedPage(i, oldPage);
    final QTreeNode<K, S, V> midPage = (QTreeNode<K, S, V>) newPage.split(tree);
    final QTreePage<K, S, V>[] midPages = midPage.pages;
    final int midArity = midPages.length;
    if (midArity <= 1) {
      return updatedPage(i, newPage, oldPage);
    }
    for (int j = 0; j < midArity; j += 1) {
      page = page.insertedPage(midPages[j], tree);
    }
    return page.mergedSlots(midPage.slots, tree);
  }

  QTreeNode<K, S, V> updatedPageMerge(int i, QTreeNode<K, S, V> newPage,
                                      QTreePage<K, S, V> oldPage, QTreeContext<K, S, V> tree) {
    QTreeNode<K, S, V> page = removedPage(i, oldPage);
    final QTreePage<K, S, V>[] newPages = newPage.pages;
    for (int j = 0, pageCount = newPages.length; j < pageCount; j += 1) {
      page = page.insertedPage(newPages[j], tree);
    }
    final QTreeEntry<K, S, V>[] newSlots = newPage.slots;
    for (int j = 0, slotCount = newSlots.length; j < slotCount; j += 1) {
      page = page.updatedSlot(newSlots[j], tree);
    }
    return page;
  }

  QTreeNode<K, S, V> mergedPage(QTreePage<K, S, V> newPage, QTreeContext<K, S, V> tree) {
    QTreeNode<K, S, V> page = this;
    if (newPage instanceof QTreeNode<?, ?, ?>) {
      for (int i = 0, arity = newPage.arity(); i < arity; i += 1) {
        page = page.insertedPage(newPage.getPage(i), tree);
      }
    }
    for (int i = 0, slotCount = newPage.slotCount(); i < slotCount; i += 1) {
      final QTreeEntry<K, S, V> slot = newPage.getSlot(i);
      page = page.updated(slot.key, slot.shape, slot.x, slot.y, slot.value, tree, false);
    }
    return page;
  }

  @SuppressWarnings("unchecked")
  @Override
  QTreeNode<K, S, V> mergedSlots(QTreeEntry<K, S, V>[] midSlots, QTreeContext<K, S, V> tree) {
    if (midSlots.length > 0) {
      final QTreeEntry<K, S, V>[] oldSlots = this.slots;
      final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[oldSlots.length + midSlots.length];
      System.arraycopy(oldSlots, 0, newSlots, 0, oldSlots.length);
      System.arraycopy(midSlots, 0, newSlots, oldSlots.length, midSlots.length);
      BitInterval.sort(newSlots, tree);
      final long newSpan = this.span + midSlots.length;
      return create(this.pages, newSlots, newSpan);
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  QTreeNode<K, S, V> reinsertedSlots(QTreeContext<K, S, V> tree) {
    QTreeNode<K, S, V> page = this;
    final QTreeEntry<K, S, V>[] oldSlots = this.slots;
    final int oldSlotCount = oldSlots.length;
    QTreeEntry<K, S, V>[] newSlots = null;
    int newSlotCount = 0;
    for (int i = 0; i < oldSlotCount; i += 1) {
      final QTreeEntry<K, S, V> slot = oldSlots[i];
      final long x = slot.x;
      final long y = slot.y;
      final int j = page.lookup(x, y);
      if (j >= 0) {
        // page will temporarily have two copies of slot,
        // one in parent, and one in child
        page = page.updated(slot.key, slot.shape, slot.x, slot.y, slot.value, tree, false);
        if (newSlots == null) {
          newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[oldSlotCount - 1];
          System.arraycopy(oldSlots, 0, newSlots, 0, i);
          newSlotCount = i;
        }
      } else if (newSlots != null) {
        newSlots[newSlotCount] = slot;
        newSlotCount += 1;
      }
    }

    if (newSlots != null) {
      if (newSlotCount == 0) {
        newSlots = (QTreeEntry<K, S, V>[]) EMPTY_SLOTS;
      } else if (newSlotCount < oldSlotCount - 1) {
        final QTreeEntry<K, S, V>[] resizedSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[newSlotCount];
        System.arraycopy(newSlots, 0, resizedSlots, 0, newSlotCount);
        newSlots = resizedSlots;
      }
      return QTreeNode.create(page.pages, newSlots, this.span);
    } else {
      return page;
    }
  }

  @Override
  QTreeNode<K, S, V> insertedPage(QTreePage<K, S, V> newPage, QTreeContext<K, S, V> tree) {
    int i = lookup(newPage.x(), newPage.y());
    if (i < 0) {
      i = -(i + 1);
      return insertedPage(i, newPage);
    } else {
      return mergedPage(newPage, tree);
    }
  }

  @SuppressWarnings("unchecked")
  QTreeNode<K, S, V> insertedPage(int i, QTreePage<K, S, V> newPage) {
    final QTreePage<K, S, V>[] oldPages = this.pages;
    final int n = oldPages.length + 1;
    final QTreePage<K, S, V>[] newPages = (QTreePage<K, S, V>[]) new QTreePage<?, ?, ?>[n];
    System.arraycopy(oldPages, 0, newPages, 0, i);
    newPages[i] = newPage;
    System.arraycopy(oldPages, i, newPages, i + 1, n - (i + 1));
    BitInterval.sort(newPages, PAGE_ORDERING);
    final long newSpan = this.span + newPage.span();
    return QTreeNode.create(newPages, this.slots, newSpan);
  }

  @SuppressWarnings("unchecked")
  QTreeNode<K, S, V> insertedSlot(int i, K key, S shape, long xk, long yk, V newValue) {
    final QTreeEntry<K, S, V>[] oldSlots = this.slots;
    final int n = oldSlots.length + 1;
    final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    newSlots[i] = new QTreeEntry<K, S, V>(key, shape, xk, yk, newValue);
    System.arraycopy(oldSlots, i, newSlots, i + 1, n - (i + 1));
    return QTreeNode.create(this.pages, newSlots, this.span + 1L);
  }

  QTreeNode<K, S, V> updatedSlot(K key, S shape, long xk, long yk, V newValue, QTreeContext<K, S, V> tree) {
    return updatedSlot(new QTreeEntry<K, S, V>(key, shape, xk, yk, newValue), tree);
  }

  @SuppressWarnings("unchecked")
  QTreeNode<K, S, V> updatedSlot(int i, K key, S shape, long xk, long yk, V newValue) {
    final QTreeEntry<K, S, V>[] oldSlots = this.slots;
    final QTreeEntry<K, S, V> oldSlot = oldSlots[i];
    final long oldX = oldSlot.x;
    final long oldY = oldSlot.y;
    if (!newValue.equals(oldSlot.value) || oldX != xk || oldY != yk) {
      final int n = oldSlots.length;
      final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[n];
      System.arraycopy(oldSlots, 0, newSlots, 0, n);
      newSlots[i] = new QTreeEntry<K, S, V>(key, shape, xk, yk, newValue);
      return QTreeNode.create(this.pages, newSlots, this.span);
    } else {
      return this;
    }
  }

  @Override
  QTreeNode<K, S, V> updatedSlot(QTreeEntry<K, S, V> newSlot, QTreeContext<K, S, V> tree) {
    int i = lookup(newSlot.key, tree);
    if (i >= 0) {
      return updatedSlot(i, newSlot);
    } else {
      i = -(i + 1);
      return insertedSlot(i, newSlot);
    }
  }

  @SuppressWarnings("unchecked")
  QTreeNode<K, S, V> updatedSlot(int i, QTreeEntry<K, S, V> newSlot) {
    final QTreeEntry<K, S, V>[] oldSlots = this.slots;
    final QTreeEntry<K, S, V> oldSlot = oldSlots[i];
    if (!newSlot.equals(oldSlot)) {
      final int n = oldSlots.length;
      final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[n];
      System.arraycopy(oldSlots, 0, newSlots, 0, n);
      newSlots[i] = newSlot;
      return QTreeNode.create(this.pages, newSlots, this.span);
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  QTreeNode<K, S, V> insertedSlot(int i, QTreeEntry<K, S, V> newSlot) {
    final QTreeEntry<K, S, V>[] oldSlots = this.slots;
    final int n = oldSlots.length + 1;
    final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    newSlots[i] = newSlot;
    System.arraycopy(oldSlots, i, newSlots, i + 1, n - (i + 1));
    return QTreeNode.create(this.pages, newSlots, this.span);
  }

  @Override
  public QTreePage<K, S, V> removed(K key, long xk, long yk, QTreeContext<K, S, V> tree) {
    final int xRank = Long.numberOfLeadingZeros(~this.x);
    final int yRank = Long.numberOfLeadingZeros(~this.y);
    final int xkRank = Long.numberOfLeadingZeros(~xk);
    final int ykRank = Long.numberOfLeadingZeros(~yk);
    if (xkRank <= xRank && ykRank <= yRank) {
      int i = scan(xk, yk);
      //int i = lookup(xk, yk);
      if (i >= 0) {
        final QTreePage<K, S, V> oldPage = this.pages[i];
        final QTreePage<K, S, V> newPage = oldPage.removed(key, xk, yk, tree);
        if (oldPage != newPage) {
          return replacedPage(i, newPage, oldPage, tree);
        }
      }
      i = lookup(key, tree);
      if (i >= 0) {
        return removedSlot(i);
      }
    }
    return this;
  }

  QTreePage<K, S, V> replacedPage(int i, QTreePage<K, S, V> newPage,
                                  QTreePage<K, S, V> oldPage, QTreeContext<K, S, V> tree) {
    if (!newPage.isEmpty()) {
      if (newPage instanceof QTreeNode<?, ?, ?> && tree.pageShouldMerge(newPage)) {
        return updatedPageMerge(i, (QTreeNode<K, S, V>) newPage, oldPage, tree);
      } else {
        return updatedPage(i, newPage, oldPage);
      }
    } else if (this.pages.length > 2) {
      return removedPage(i, oldPage);
    } else if (this.pages.length > 1) {
      final QTreePage<K, S, V> onlyChild;
      if (i == 0) {
        onlyChild = this.pages[1];
      } else {
        onlyChild = this.pages[0];
      }
      if (this.slots.length == 0) {
        return onlyChild;
      } else {
        return onlyChild.mergedSlots(this.slots, tree);
      }
    } else if (this.slots.length > 0) {
      return QTreeLeaf.create(this.slots);
    } else {
      return QTreeLeaf.empty();
    }
  }

  @SuppressWarnings("unchecked")
  QTreeNode<K, S, V> removedPage(int i, QTreePage<K, S, V> oldPage) {
    final QTreePage<K, S, V>[] oldPages = this.pages;
    final int n = oldPages.length - 1;
    final QTreePage<K, S, V>[] newPages = (QTreePage<K, S, V>[]) new QTreePage<?, ?, ?>[n];
    System.arraycopy(oldPages, 0, newPages, 0, i);
    System.arraycopy(oldPages, i + 1, newPages, i, n - i);
    BitInterval.sort(newPages, PAGE_ORDERING);
    final long newSpan = this.span - oldPage.span();
    return create(newPages, this.slots, newSpan);
  }

  @SuppressWarnings("unchecked")
  QTreeNode<K, S, V> removedSlot(int i) {
    final QTreeEntry<K, S, V>[] oldSlots = this.slots;
    final int n = oldSlots.length - 1;
    final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    System.arraycopy(oldSlots, i + 1, newSlots, i, n - i);
    return create(this.pages, newSlots, this.span - 1L);
  }

  @Override
  public QTreePage<K, S, V> flattened(QTreeContext<K, S, V> tree) {
    final QTreePage<K, S, V>[] pages = this.pages;
    final QTreeEntry<K, S, V>[] slots = this.slots;
    if (pages.length > 1) {
      return this;
    } else if (pages.length == 1) {
      final QTreePage<K, S, V> onlyChild = pages[0];
      if (slots.length == 0) {
        return onlyChild;
      } else {
        return onlyChild.mergedSlots(slots, tree);
      }
    } else if (slots.length > 0) {
      return QTreeLeaf.create(slots);
    } else {
      return QTreeLeaf.empty();
    }
  }

  @Override
  public QTreeNode<K, S, V> balanced(QTreeContext<K, S, V> tree) {
    if (this.pages.length > 1 && tree.pageShouldSplit(this)) {
      return split(tree);
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public QTreeNode<K, S, V> split(QTreeContext<K, S, V> tree) {
    final long x = this.x;
    final long y = this.y;
    final int xRank = Long.numberOfLeadingZeros(~x);
    final int yRank = Long.numberOfLeadingZeros(~y);
    final int xnRank = Math.max(0, xRank - 1);
    final int ynRank = Math.max(0, yRank - 1);
    final long xnMask = ~((1L << xnRank) - 1L);
    final long ynMask = ~((1L << ynRank) - 1L);
    final long x0Base = x << xRank;
    final long y0Base = y << yRank;
    final long x1Base = x0Base | (1L << xnRank);
    final long y1Base = y0Base | (1L << ynRank);

    int x00Rank = 0;
    int y00Rank = 0;
    int x01Rank = 0;
    int y01Rank = 0;
    int x10Rank = 0;
    int y10Rank = 0;
    int x11Rank = 0;
    int y11Rank = 0;
    int xX0Rank = 0;
    int yX0Rank = 0;
    int xX1Rank = 0;
    int yX1Rank = 0;
    long x00Base = 0L;
    long y00Base = 0L;
    long x01Base = 0L;
    long y01Base = 0L;
    long x10Base = 0L;
    long y10Base = 0L;
    long x11Base = 0L;
    long y11Base = 0L;
    long xX0Base = 0L;
    long yX0Base = 0L;
    long xX1Base = 0L;
    long yX1Base = 0L;
    long x00Mask = -1L;
    long y00Mask = -1L;
    long x01Mask = -1L;
    long y01Mask = -1L;
    long x10Mask = -1L;
    long y10Mask = -1L;
    long x11Mask = -1L;
    long y11Mask = -1L;
    long xX0Mask = -1L;
    long yX0Mask = -1L;
    long xX1Mask = -1L;
    long yX1Mask = -1L;

    final QTreePage<K, S, V>[] pages = this.pages;
    QTreePage<K, S, V>[] pages00 = null;
    QTreePage<K, S, V>[] pages01 = null;
    QTreePage<K, S, V>[] pages10 = null;
    QTreePage<K, S, V>[] pages11 = null;
    final int pageCount = pages.length;
    int pageCount00 = 0;
    int pageCount01 = 0;
    int pageCount10 = 0;
    int pageCount11 = 0;
    long span00 = 0L;
    long span01 = 0L;
    long span10 = 0L;
    long span11 = 0L;
    for (int i = 0; i < pageCount; i += 1) {
      final QTreePage<K, S, V> page = pages[i];
      final long xc = page.x();
      final long yc = page.y();
      final int xcRank = Long.numberOfLeadingZeros(~xc);
      final int ycRank = Long.numberOfLeadingZeros(~yc);
      final long xcBase = xc << xcRank;
      final long ycBase = yc << ycRank;
      final long xcNorm = xcBase & xnMask;
      final long ycNorm = ycBase & ynMask;
      if (xcNorm == x0Base) {
        if (ycNorm == y0Base) {
          if (pages00 == null) {
            pages00 = (QTreePage<K, S, V>[]) new QTreePage<?, ?, ?>[pageCount];
          }
          pages00[pageCount00] = page;
          pageCount00 += 1;
          span00 += page.span();
          x00Rank = Math.max(x00Rank, xcRank);
          y00Rank = Math.max(y00Rank, ycRank);
          x00Base |= xcBase;
          y00Base |= ycBase;
          x00Mask &= xcBase;
          y00Mask &= ycBase;
        } else {
          if (pages01 == null) {
            pages01 = (QTreePage<K, S, V>[]) new QTreePage<?, ?, ?>[pageCount];
          }
          pages01[pageCount01] = page;
          pageCount01 += 1;
          span01 += page.span();
          x01Rank = Math.max(x01Rank, xcRank);
          y01Rank = Math.max(y01Rank, ycRank);
          x01Base |= xcBase;
          y01Base |= ycBase;
          x01Mask &= xcBase;
          y01Mask &= ycBase;
        }
      } else {
        if (ycNorm == y0Base) {
          if (pages10 == null) {
            pages10 = (QTreePage<K, S, V>[]) new QTreePage<?, ?, ?>[pageCount];
          }
          pages10[pageCount10] = page;
          pageCount10 += 1;
          span10 += page.span();
          x10Rank = Math.max(x10Rank, xcRank);
          y10Rank = Math.max(y10Rank, ycRank);
          x10Base |= xcBase;
          y10Base |= ycBase;
          x10Mask &= xcBase;
          y10Mask &= ycBase;
        } else {
          if (pages11 == null) {
            pages11 = (QTreePage<K, S, V>[]) new QTreePage<?, ?, ?>[pageCount];
          }
          pages11[pageCount11] = page;
          pageCount11 += 1;
          span11 += page.span();
          x11Rank = Math.max(x11Rank, xcRank);
          y11Rank = Math.max(y11Rank, ycRank);
          x11Base |= xcBase;
          y11Base |= ycBase;
          x11Mask &= xcBase;
          y11Mask &= ycBase;
        }
      }
    }

    final QTreeEntry<K, S, V>[] slots = this.slots;
    QTreeEntry<K, S, V>[] slots00 = null;
    QTreeEntry<K, S, V>[] slots01 = null;
    QTreeEntry<K, S, V>[] slots10 = null;
    QTreeEntry<K, S, V>[] slots11 = null;
    QTreeEntry<K, S, V>[] slotsX0 = null;
    QTreeEntry<K, S, V>[] slotsX1 = null;
    QTreeEntry<K, S, V>[] slotsXY = null;
    final int slotCount = slots.length;
    int slotCount00 = 0;
    int slotCount01 = 0;
    int slotCount10 = 0;
    int slotCount11 = 0;
    int slotCountX0 = 0;
    int slotCountX1 = 0;
    int slotCountXY = 0;
    for (int i = 0; i < slotCount; i += 1) {
      final QTreeEntry<K, S, V> slot = slots[i];
      final long xt = slot.x;
      final long yt = slot.y;
      final int xtRank = Long.numberOfLeadingZeros(~xt);
      final int ytRank = Long.numberOfLeadingZeros(~yt);
      final long xtBase = xt << xtRank;
      final long ytBase = yt << ytRank;
      final long xtNorm = xtBase & xnMask;
      final long ytNorm = ytBase & ynMask;
      if (xnRank > 0 && xtRank > xnRank) {
        if (ynRank > 0 && ytRank > ynRank) {
          slotsXY[slotCountXY] = slot;
          slotCountXY += 1;
        } else if (ytNorm == y0Base) {
          if (slotsX0 == null) {
            slotsX0 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount];
          }
          slotsX0[slotCountX0] = slot;
          slotCountX0 += 1;
          xX0Rank = Math.max(xX0Rank, xtRank);
          yX0Rank = Math.max(yX0Rank, ytRank);
          xX0Base |= xtBase;
          yX0Base |= ytBase;
          xX0Mask &= xtBase;
          yX0Mask &= ytBase;
        } else {
          if (slotsX1 == null) {
            slotsX1 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount];
          }
          slotsX1[slotCountX1] = slot;
          slotCountX1 += 1;
          xX1Rank = Math.max(xX1Rank, xtRank);
          yX1Rank = Math.max(yX1Rank, ytRank);
          xX1Base |= xtBase;
          yX1Base |= ytBase;
          xX1Mask &= xtBase;
          yX1Mask &= ytBase;
        }
      } else if (xtNorm == x0Base) {
        if (ytNorm == y0Base) {
          if (slots00 == null) {
            slots00 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount];
          }
          slots00[slotCount00] = slot;
          slotCount00 += 1;
          span00 += 1L;
          x00Rank = Math.max(x00Rank, xtRank);
          y00Rank = Math.max(y00Rank, ytRank);
          x00Base |= xtBase;
          y00Base |= ytBase;
          x00Mask &= xtBase;
          y00Mask &= ytBase;
        } else {
          if (slots01 == null) {
            slots01 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount];
          }
          slots01[slotCount01] = slot;
          slotCount01 += 1;
          span01 += 1L;
          x01Rank = Math.max(x01Rank, xtRank);
          y01Rank = Math.max(y01Rank, ytRank);
          x01Base |= xtBase;
          y01Base |= ytBase;
          x01Mask &= xtBase;
          y01Mask &= ytBase;
        }
      } else {
        if (ytNorm == y0Base) {
          if (slots10 == null) {
            slots10 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount];
          }
          slots10[slotCount10] = slot;
          slotCount10 += 1;
          span10 += 1L;
          x10Rank = Math.max(x10Rank, xtRank);
          y10Rank = Math.max(y10Rank, ytRank);
          x10Base |= xtBase;
          y10Base |= ytBase;
          x10Mask &= xtBase;
          y10Mask &= ytBase;
        } else {
          if (slots11 == null) {
            slots11 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount];
          }
          slots11[slotCount11] = slot;
          slotCount11 += 1;
          span11 += 1L;
          x11Rank = Math.max(x11Rank, xtRank);
          y11Rank = Math.max(y11Rank, ytRank);
          x11Base |= xtBase;
          y11Base |= ytBase;
          x11Mask &= xtBase;
          y11Mask &= ytBase;
        }
      }
    }

    x00Mask ^= x00Base;
    y00Mask ^= y00Base;
    x01Mask ^= x01Base;
    y01Mask ^= y01Base;
    x10Mask ^= x10Base;
    y10Mask ^= y10Base;
    x11Mask ^= x11Base;
    y11Mask ^= y11Base;
    xX0Mask ^= xX0Base;
    yX0Mask ^= yX0Base;
    xX1Mask ^= xX1Base;
    yX1Mask ^= yX1Base;
    x00Rank = Math.max(x00Rank, 64 - Long.numberOfLeadingZeros(x00Mask));
    y00Rank = Math.max(y00Rank, 64 - Long.numberOfLeadingZeros(y00Mask));
    x01Rank = Math.max(x01Rank, 64 - Long.numberOfLeadingZeros(x01Mask));
    y01Rank = Math.max(y01Rank, 64 - Long.numberOfLeadingZeros(y01Mask));
    x10Rank = Math.max(x10Rank, 64 - Long.numberOfLeadingZeros(x10Mask));
    y10Rank = Math.max(y10Rank, 64 - Long.numberOfLeadingZeros(y10Mask));
    x11Rank = Math.max(x11Rank, 64 - Long.numberOfLeadingZeros(x11Mask));
    y11Rank = Math.max(y11Rank, 64 - Long.numberOfLeadingZeros(y11Mask));
    xX0Rank = Math.max(xX0Rank, 64 - Long.numberOfLeadingZeros(xX0Mask));
    yX0Rank = Math.max(yX0Rank, 64 - Long.numberOfLeadingZeros(yX0Mask));
    xX1Rank = Math.max(xX1Rank, 64 - Long.numberOfLeadingZeros(xX1Mask));
    yX1Rank = Math.max(yX1Rank, 64 - Long.numberOfLeadingZeros(yX1Mask));
    long x00 = BitInterval.from(x00Rank, x00Base);
    long y00 = BitInterval.from(y00Rank, y00Base);
    long x01 = BitInterval.from(x01Rank, x01Base);
    long y01 = BitInterval.from(y01Rank, y01Base);
    long x10 = BitInterval.from(x10Rank, x10Base);
    long y10 = BitInterval.from(y10Rank, y10Base);
    final long x11 = BitInterval.from(x11Rank, x11Base);
    final long y11 = BitInterval.from(y11Rank, y11Base);
    final long xX0 = BitInterval.from(xX0Rank, xX0Base);
    final long yX0 = BitInterval.from(yX0Rank, yX0Base);
    final long xX1 = BitInterval.from(xX1Rank, xX1Base);
    final long yX1 = BitInterval.from(yX1Rank, yX1Base);

    if (pageCount11 > 0 && pageCount01 > 0 && BitInterval.compare(x11, y11, x01, y01) == 0) {
      // Merge tile 11 into tile 01
      System.arraycopy(pages11, 0, pages01, pageCount01, pageCount11);
      pageCount01 += pageCount11;
      span01 += span11;
      if (slotCount11 > 0) {
        if (slots01 == null) {
          slots01 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount];
        }
        System.arraycopy(slots11, 0, slots01, slotCount01, slotCount11);
        slotCount01 += slotCount11;
        slots11 = null;
        slotCount11 = 0;
      }
      x01 = BitInterval.union(x01, x11);
      y01 = BitInterval.union(y01, y11);
      pages11 = null;
      pageCount11 = 0;
      span11 = 0L;
    }
    if (pageCount01 > 0 && pageCount00 > 0 && BitInterval.compare(x01, y01, x00, y00) == 0) {
      // Merge tile 01 into tile 00
      System.arraycopy(pages01, 0, pages00, pageCount00, pageCount01);
      pageCount00 += pageCount01;
      span00 += span01;
      if (slotCount01 > 0) {
        if (slots00 == null) {
          slots00 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount];
        }
        System.arraycopy(slots01, 0, slots00, slotCount00, slotCount01);
        slotCount00 += slotCount01;
        slots01 = null;
        slotCount01 = 0;
      }
      x00 = BitInterval.union(x00, x01);
      y00 = BitInterval.union(y00, y01);
      pages01 = null;
      pageCount01 = 0;
      span01 = 0L;
    }
    if (pageCount01 > 0 && pageCount10 > 0 && BitInterval.compare(x01, y01, x10, y10) == 0) {
      // Merge tile 01 into tile 10
      System.arraycopy(pages01, 0, pages10, pageCount10, pageCount01);
      pageCount10 += pageCount01;
      span10 += span01;
      if (slotCount01 > 0) {
        if (slots10 == null) {
          slots10 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount];
        }
        System.arraycopy(slots01, 0, slots10, slotCount10, slotCount01);
        slotCount10 += slotCount01;
        slots01 = null;
        slotCount01 = 0;
      }
      x10 = BitInterval.union(x10, x01);
      y10 = BitInterval.union(y10, y01);
      pages01 = null;
      pageCount01 = 0;
      span01 = 0L;
    }
    if (pageCount10 > 0 && pageCount00 > 0 && BitInterval.compare(x10, y10, x00, y00) == 0) {
      // Merge tile 10 into tile 00
      System.arraycopy(pages10, 0, pages00, pageCount00, pageCount10);
      pageCount00 += pageCount10;
      span00 += span10;
      if (slotCount10 > 0) {
        if (slots00 == null) {
          slots00 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount];
        }
        System.arraycopy(slots10, 0, slots00, slotCount00, slotCount10);
        slotCount00 += slotCount10;
        slots10 = null;
        slotCount10 = 0;
      }
      x00 = BitInterval.union(x00, x10);
      y00 = BitInterval.union(y00, y10);
      pages10 = null;
      pageCount10 = 0;
      span10 = 0L;
    }

    if (slotCountX1 > 0 && BitInterval.compare(xX1, yX1, x01, y01) == 0) {
      if (slots01 != null) {
        System.arraycopy(slotsX1, 0, slots01, slotCount01, slotCountX1);
      } else {
        slots01 = slotsX1;
      }
      slotCount01 += slotCountX1;
      span01 += slotCountX1;
      x01 = BitInterval.union(x01, xX1);
      y01 = BitInterval.union(y01, yX1);
      slotsX1 = null;
      slotCountX1 = 0;
    }
    if (slotCountX0 > 0 && BitInterval.compare(xX0, yX0, x00, y00) == 0) {
      if (slots00 != null) {
        System.arraycopy(slotsX0, 0, slots00, slotCount00, slotCountX0);
      } else {
        slots00 = slotsX0;
      }
      slotCount00 += slotCountX0;
      span00 += slotCountX0;
      x00 = BitInterval.union(x00, xX0);
      y00 = BitInterval.union(y00, yX0);
      slotsX0 = null;
      slotCountX0 = 0;
    }

    if (slotsX0 != null) {
      if (slotsXY == null) {
        slotsXY = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount];
      }
      System.arraycopy(slotsX0, 0, slotsXY, slotCountXY, slotCountX0);
      slotCountXY += slotCountX0;
      slotsX0 = null;
      slotCountX0 = 0;
    }
    if (slotsX1 != null) {
      if (slotsXY == null) {
        slotsXY = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount];
      }
      System.arraycopy(slotsX1, 0, slotsXY, slotCountXY, slotCountX1);
      slotCountXY += slotCountX1;
      slotsX1 = null;
      slotCountX1 = 0;
    }

    int pageCountXY = 0;
    if (pageCount00 > 0 || slotCount00 > 0) {
      pageCountXY += 1;
    }
    if (pageCount01 > 0 || slotCount01 > 0) {
      pageCountXY += 1;
    }
    if (pageCount10 > 0 || slotCount10 > 0) {
      pageCountXY += 1;
    }
    if (pageCount11 > 0 || slotCount11 > 0) {
      pageCountXY += 1;
    }
    final QTreePage<K, S, V>[] pagesXY = (QTreePage<K, S, V>[]) new QTreePage<?, ?, ?>[pageCountXY];
    int pageOffsetXY = 0;
    if (pageCount00 > 0 || slotCount00 > 0) {
      if (pageCount00 < pageCount) {
        final QTreePage<K, S, V>[] newPages = (QTreePage<K, S, V>[]) new QTreePage<?, ?, ?>[pageCount00];
        System.arraycopy(pages00, 0, newPages, 0, pageCount00);
        pages00 = newPages;
      }
      if (slotCount00 == 0) {
        slots00 = (QTreeEntry<K, S, V>[]) EMPTY_SLOTS;
      } else if (slotCount00 < slotCount) {
        final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount00];
        System.arraycopy(slots00, 0, newSlots, 0, slotCount00);
        slots00 = newSlots;
      }
      if (pageCount00 > 1 || pageCount00 == 1 && slotCount00 > 0) {
        BitInterval.sort(pages00, PAGE_ORDERING);
        BitInterval.sort(slots00, tree);
        pagesXY[pageOffsetXY] = new QTreeNode<K, S, V>(pages00, slots00, x00, y00, span00);
      } else if (slotCount00 == 0) {
        pagesXY[pageOffsetXY] = pages00[0];
      } else {
        BitInterval.sort(slots00, tree);
        pagesXY[pageOffsetXY] = QTreeLeaf.create(slots00);
      }
      pageOffsetXY += 1;
    }
    if (pageCount01 > 0 || slotCount01 > 0) {
      if (pageCount01 < pageCount) {
        final QTreePage<K, S, V>[] newPages = (QTreePage<K, S, V>[]) new QTreePage<?, ?, ?>[pageCount01];
        System.arraycopy(pages01, 0, newPages, 0, pageCount01);
        pages01 = newPages;
      }
      if (slotCount01 == 0) {
        slots01 = (QTreeEntry<K, S, V>[]) EMPTY_SLOTS;
      } else if (slotCount01 < slotCount) {
        final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount01];
        System.arraycopy(slots01, 0, newSlots, 0, slotCount01);
        slots01 = newSlots;
      }
      if (pageCount01 > 1 || pageCount01 == 1 && slotCount01 > 0) {
        BitInterval.sort(pages01, PAGE_ORDERING);
        BitInterval.sort(slots01, tree);
        pagesXY[pageOffsetXY] = new QTreeNode<K, S, V>(pages01, slots01, x01, y01, span01);
      } else if (slotCount01 == 0) {
        pagesXY[pageOffsetXY] = pages01[0];
      } else {
        BitInterval.sort(slots01, tree);
        pagesXY[pageOffsetXY] = QTreeLeaf.create(slots01);
      }
      pageOffsetXY += 1;
    }
    if (pageCount10 > 0 || slotCount10 > 0) {
      if (pageCount10 < pageCount) {
        final QTreePage<K, S, V>[] newPages = (QTreePage<K, S, V>[]) new QTreePage<?, ?, ?>[pageCount10];
        System.arraycopy(pages10, 0, newPages, 0, pageCount10);
        pages10 = newPages;
      }
      if (slotCount10 == 0) {
        slots10 = (QTreeEntry<K, S, V>[]) EMPTY_SLOTS;
      } else if (slotCount10 < slotCount) {
        final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount10];
        System.arraycopy(slots10, 0, newSlots, 0, slotCount10);
        slots10 = newSlots;
      }
      if (pageCount10 > 1 || pageCount10 == 1 && slotCount10 > 0) {
        BitInterval.sort(pages10, PAGE_ORDERING);
        BitInterval.sort(slots10, tree);
        pagesXY[pageOffsetXY] = new QTreeNode<K, S, V>(pages10, slots10, x10, y10, span10);
      } else if (slotCount10 == 0) {
        pagesXY[pageOffsetXY] = pages10[0];
      } else {
        BitInterval.sort(slots10, tree);
        pagesXY[pageOffsetXY] = QTreeLeaf.create(slots10);
      }
      pageOffsetXY += 1;
    }
    if (pageCount11 > 0 || slotCount11 > 0) {
      if (pageCount11 < pageCount) {
        final QTreePage<K, S, V>[] newPages = (QTreePage<K, S, V>[]) new QTreePage<?, ?, ?>[pageCount11];
        System.arraycopy(pages11, 0, newPages, 0, pageCount11);
        pages11 = newPages;
      }
      if (slotCount11 == 0) {
        slots11 = (QTreeEntry<K, S, V>[]) EMPTY_SLOTS;
      } else if (slotCount11 < slotCount) {
        final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount11];
        System.arraycopy(slots11, 0, newSlots, 0, slotCount11);
        slots11 = newSlots;
      }
      if (pageCount11 > 1 || pageCount11 == 1 && slotCount11 > 0) {
        BitInterval.sort(pages11, PAGE_ORDERING);
        BitInterval.sort(slots11, tree);
        pagesXY[pageOffsetXY] = new QTreeNode<K, S, V>(pages11, slots11, x11, y11, span11);
      } else if (slotCount11 == 0) {
        pagesXY[pageOffsetXY] = pages11[0];
      } else {
        BitInterval.sort(slots11, tree);
        pagesXY[pageOffsetXY] = QTreeLeaf.create(slots11);
      }
      pageOffsetXY += 1;
    }
    BitInterval.sort(pagesXY, PAGE_ORDERING);

    if (slotCountXY == 0) {
      slotsXY = (QTreeEntry<K, S, V>[]) EMPTY_SLOTS;
    } else if (slotCountXY < slotCount) {
      final QTreeEntry<K, S, V>[] newSlotsXY = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCountXY];
      System.arraycopy(slotsXY, 0, newSlotsXY, 0, slotCountXY);
      slotsXY = newSlotsXY;
    }
    BitInterval.sort(slotsXY, tree);

    return create(pagesXY, slotsXY, this.span);
  }

  @Override
  public Cursor<QTreeEntry<K, S, V>> cursor(long x, long y) {
    return new QTreeNodeCursor<K, S, V>(this, x, y);
  }

  private int scan(long xk, long yk) {
    final QTreePage<K, S, V>[] pages = this.pages;
    int j = 0;
    for (int i = 0, n = pages.length; i < n; i += 1) {
      final QTreePage<K, S, V> page = pages[i];
      final int order = BitInterval.compare(page.x(), page.y(), xk, yk);
      if (order == 0) {
        return i;
      } else if (order < 0) {
        j = i;
      }
    }
    return -(j + 1);
  }

  private int lookup(long xk, long yk) {
    final QTreePage<K, S, V>[] pages = this.pages;
    int l = 0;
    int u = pages.length - 1;
    while (l <= u) { // binary search for xlub + 1
      final int i = (l + u) >>> 1;
      final int xOrder = BitInterval.compare(pages[i].x(), xk);
      if (xOrder < 0) {
        l = i + 1;
      } else if (xOrder > 0) {
        u = i - 1;
      } else {
        l = i + 1;
      }
    }
    l -= 1; // step back to least upper bound
    while (l >= 0) { // scan backwards for y match
      final int yOrder = BitInterval.compare(pages[l].y(), yk);
      if (yOrder < 0) {
        break;
      } else if (yOrder > 0) {
        l -= 1;
      } else {
        return l;
      }
    }
    if (l >= 0) {
      return -(l + 1);
    } else {
      return -1;
    }
  }

  private int lookup(K key, QTreeContext<K, S, V> tree) {
    final QTreeEntry<K, S, V>[] slots = this.slots;
    int low = 0;
    int high = slots.length - 1;
    while (low <= high) {
      final int mid = (low + high) >>> 1;
      final int order = tree.compareKey(key, slots[mid].key);
      if (order > 0) {
        low = mid + 1;
      } else if (order < 0) {
        high = mid - 1;
      } else {
        return mid;
      }
    }
    return -(low + 1);
  }

  public static <K, S, V> QTreeNode<K, S, V> create(QTreePage<K, S, V>[] pages,
                                                    QTreeEntry<K, S, V>[] slots, long span) {
    int xRank = 0;
    int yRank = 0;
    long xBase = 0L;
    long yBase = 0L;
    long xMask = -1L;
    long yMask = -1L;
    for (int i = 0, pageCount = pages.length; i < pageCount; i += 1) {
      final QTreePage<K, S, V> page = pages[i];
      final long cx = page.x();
      final long cy = page.y();
      final int cxRank = Long.numberOfLeadingZeros(~cx);
      final int cyRank = Long.numberOfLeadingZeros(~cy);
      final long cxBase = cx << cxRank;
      final long cyBase = cy << cyRank;
      xRank = Math.max(xRank, cxRank);
      yRank = Math.max(yRank, cyRank);
      xBase |= cxBase;
      yBase |= cyBase;
      xMask &= cxBase;
      yMask &= cyBase;
    }
    for (int i = 0, slotCount = slots.length; i < slotCount; i += 1) {
      final QTreeEntry<K, S, V> slot = slots[i];
      final long tx = slot.x;
      final long ty = slot.y;
      final int txRank = Long.numberOfLeadingZeros(~tx);
      final int tyRank = Long.numberOfLeadingZeros(~ty);
      final long txBase = tx << txRank;
      final long tyBase = ty << tyRank;
      xRank = Math.max(xRank, txRank);
      yRank = Math.max(yRank, tyRank);
      xBase |= txBase;
      yBase |= tyBase;
      xMask &= txBase;
      yMask &= tyBase;
    }
    xMask ^= xBase;
    yMask ^= yBase;
    xRank = Math.max(xRank, 64 - Long.numberOfLeadingZeros(xMask));
    yRank = Math.max(yRank, 64 - Long.numberOfLeadingZeros(yMask));
    xMask = ~((1L << xRank) - 1L);
    yMask = ~((1L << yRank) - 1L);
    xBase &= xMask;
    yBase &= yMask;
    final long x = BitInterval.from(xRank, xBase);
    final long y = BitInterval.from(yRank, yBase);
    return new QTreeNode<K, S, V>(pages, slots, x, y, span);
  }
}
