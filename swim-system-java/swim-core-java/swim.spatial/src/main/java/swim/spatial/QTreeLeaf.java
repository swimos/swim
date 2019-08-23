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

final class QTreeLeaf<K, S, V> extends QTreePage<K, S, V> {
  final QTreeEntry<K, S, V>[] slots;
  final long x;
  final long y;

  QTreeLeaf(QTreeEntry<K, S, V>[] slots, long x, long y) {
    this.slots = slots;
    this.x = x;
    this.y = y;
  }

  @Override
  public boolean isEmpty() {
    return this.slots.length == 0;
  }

  @Override
  public long span() {
    return (long) this.slots.length;
  }

  @Override
  public int arity() {
    return this.slots.length;
  }

  @Override
  public QTreePage<K, S, V> getPage(int index) {
    throw new IndexOutOfBoundsException(Integer.toString(index));
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

  boolean containsKey(K key, QTreeContext<K, S, V> tree) {
    return lookup(key, tree) >= 0;
  }

  @Override
  public boolean containsKey(K key, long xk, long yk, QTreeContext<K, S, V> tree) {
    return containsKey(key, tree);
  }

  V get(K key, QTreeContext<K, S, V> tree) {
    final int i = lookup(key, tree);
    if (i >= 0) {
      return this.slots[i].value;
    } else {
      return null;
    }
  }

  @Override
  public V get(K key, long xk, long yk, QTreeContext<K, S, V> tree) {
    return get(key, tree);
  }

  @Override
  public QTreeLeaf<K, S, V> updated(K key, S shape, long xk, long yk, V newValue,
                                    QTreeContext<K, S, V> tree, boolean canSplit) {
    int i = lookup(key, tree);
    if (i >= 0) {
      return updatedSlot(i, key, shape, xk, yk, newValue);
    } else {
      i = -(i + 1);
      return insertedSlot(i, key, shape, xk, yk, newValue);
    }
  }

  @Override
  QTreeLeaf<K, S, V> updatedSlot(QTreeEntry<K, S, V> newSlot, QTreeContext<K, S, V> tree) {
    int i = lookup(newSlot.key, tree);
    if (i >= 0) {
      return updatedSlot(i, newSlot);
    } else {
      i = -(i + 1);
      return insertedSlot(i, newSlot);
    }
  }

  @SuppressWarnings("unchecked")
  QTreeLeaf<K, S, V> updatedSlot(int i, QTreeEntry<K, S, V> newSlot) {
    final QTreeEntry<K, S, V>[] oldSlots = this.slots;
    final QTreeEntry<K, S, V> oldSlot = oldSlots[i];
    if (!newSlot.equals(oldSlot)) {
      final int n = oldSlots.length;
      final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[n];
      System.arraycopy(oldSlots, 0, newSlots, 0, n);
      newSlots[i] = newSlot;
      return QTreeLeaf.create(newSlots);
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  QTreeLeaf<K, S, V> updatedSlot(int i, K key, S shape, long xk, long yk, V newValue) {
    final QTreeEntry<K, S, V>[] oldSlots = this.slots;
    final QTreeEntry<K, S, V> oldSlot = oldSlots[i];
    final long oldX = oldSlot.x;
    final long oldY = oldSlot.y;
    if (!newValue.equals(oldSlot.value) || oldX != xk || oldY != yk) {
      final int n = oldSlots.length;
      final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[n];
      System.arraycopy(oldSlots, 0, newSlots, 0, n);
      newSlots[i] = new QTreeEntry<K, S, V>(key, shape, xk, yk, newValue);
      return QTreeLeaf.create(newSlots);
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  QTreeLeaf<K, S, V> insertedSlot(int i, QTreeEntry<K, S, V> newSlot) {
    final QTreeEntry<K, S, V>[] oldSlots = this.slots;
    final int n = oldSlots.length + 1;
    final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    newSlots[i] = newSlot;
    System.arraycopy(oldSlots, i, newSlots, i + 1, n - (i + 1));
    return QTreeLeaf.create(newSlots);
  }

  @SuppressWarnings("unchecked")
  QTreeLeaf<K, S, V> insertedSlot(int i, K key, S shape, long xk, long yk, V newValue) {
    final QTreeEntry<K, S, V>[] oldSlots = this.slots;
    final int n = oldSlots.length + 1;
    final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    newSlots[i] = new QTreeEntry<K, S, V>(key, shape, xk, yk, newValue);
    System.arraycopy(oldSlots, i, newSlots, i + 1, n - (i + 1));
    return QTreeLeaf.create(newSlots);
  }

  @Override
  QTreeLeaf<K, S, V> insertedPage(QTreePage<K, S, V> newPage, QTreeContext<K, S, V> tree) {
    return mergedPage(newPage, tree);
  }

  @Override
  QTreeLeaf<K, S, V> mergedPage(QTreePage<K, S, V> newPage, QTreeContext<K, S, V> tree) {
    if (newPage instanceof QTreeLeaf<?, ?, ?>) {
      return mergedLeaf((QTreeLeaf<K, S, V>) newPage, tree);
    } else {
      return mergedNode(newPage, tree);
    }
  }

  QTreeLeaf<K, S, V> mergedLeaf(QTreeLeaf<K, S, V> newPage, QTreeContext<K, S, V> tree) {
    return mergedSlots(newPage.slots, tree);
  }

  @SuppressWarnings("unchecked")
  QTreeLeaf<K, S, V> mergedNode(QTreePage<K, S, V> newPage, QTreeContext<K, S, V> tree) {
    final QTreeEntry<K, S, V>[] oldSlots = this.slots;
    int i = oldSlots.length;
    final int n = i + (int) newPage.span();
    final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    final Cursor<QTreeEntry<K, S, V>> cursor = newPage.cursor();
    while (cursor.hasNext()) {
      newSlots[i] = cursor.next();
      i += 1;
    }
    BitInterval.sort(newSlots, tree);
    return QTreeLeaf.create(newSlots);
  }

  @SuppressWarnings("unchecked")
  @Override
  QTreeLeaf<K, S, V> mergedSlots(QTreeEntry<K, S, V>[] midSlots, QTreeContext<K, S, V> tree) {
    final QTreeEntry<K, S, V>[] oldSlots = this.slots;
    final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[oldSlots.length + midSlots.length];
    System.arraycopy(oldSlots, 0, newSlots, 0, oldSlots.length);
    System.arraycopy(midSlots, 0, newSlots, oldSlots.length, midSlots.length);
    BitInterval.sort(newSlots, tree);
    return QTreeLeaf.create(newSlots);
  }

  @Override
  public QTreeLeaf<K, S, V> removed(K key, long xk, long yk, QTreeContext<K, S, V> tree) {
    final int i = lookup(key, tree);
    if (i >= 0) {
      if (this.slots.length > 1) {
        return removedSlot(i);
      } else {
        return QTreeLeaf.empty();
      }
    } else {
      return this;
    }
  }

  @SuppressWarnings("unchecked")
  QTreeLeaf<K, S, V> removedSlot(int i) {
    final QTreeEntry<K, S, V>[] oldSlots = this.slots;
    final int n = oldSlots.length - 1;
    final QTreeEntry<K, S, V>[] newSlots = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    System.arraycopy(oldSlots, i + 1, newSlots, i, n - i);
    return QTreeLeaf.create(newSlots);
  }

  @Override
  public QTreeLeaf<K, S, V> flattened(QTreeContext<K, S, V> tree) {
    return this;
  }

  @Override
  public QTreePage<K, S, V> balanced(QTreeContext<K, S, V> tree) {
    if (this.slots.length > 1 && tree.pageShouldSplit(this)) {
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
          x11Rank = Math.max(x11Rank, xtRank);
          y11Rank = Math.max(y11Rank, ytRank);
          x11Base |= xtBase;
          y11Base |= ytBase;
          x11Mask &= xtBase;
          y11Mask &= ytBase;
        }
      }
    }

    if (slotCountX1 > 0 && (slotCount01 == 0 || slotCount11 == 0)) {
      if (slots01 != null) {
        System.arraycopy(slotsX1, 0, slots01, slotCount01, slotCountX1);
      } else {
        slots01 = slotsX1;
      }
      slotCount01 += slotCountX1;
      x01Rank = Math.max(x01Rank, xX1Rank);
      y01Rank = Math.max(y01Rank, yX1Rank);
      x01Base |= xX1Base;
      y01Base |= yX1Base;
      x01Mask &= xX1Mask;
      y01Mask &= yX1Mask;
      slotsX1 = null;
      slotCountX1 = 0;
      if (slotCount11 > 0) {
        System.arraycopy(slots11, 0, slots01, slotCount01, slotCount11);
        slotCount01 += slotCount11;
        x01Rank = Math.max(x01Rank, x11Rank);
        y01Rank = Math.max(y01Rank, y11Rank);
        x01Base |= x11Base;
        y01Base |= y11Base;
        x01Mask &= x11Mask;
        y01Mask &= y11Mask;
        slots11 = null;
        slotCount11 = 0;
      }
    }
    if (slotCountX0 > 0 && (slotCount00 == 0 || slotCount10 == 0)) {
      if (slots00 != null) {
        System.arraycopy(slotsX0, 0, slots00, slotCount00, slotCountX0);
      } else {
        slots00 = slotsX0;
      }
      slotCount00 += slotCountX0;
      x00Rank = Math.max(x00Rank, xX0Rank);
      y00Rank = Math.max(y00Rank, yX0Rank);
      x00Base |= xX0Base;
      y00Base |= yX0Base;
      x00Mask &= xX0Mask;
      y00Mask &= yX0Mask;
      slotsX0 = null;
      slotCountX0 = 0;
      if (slotCount10 > 0) {
        System.arraycopy(slots10, 0, slots00, slotCount00, slotCount10);
        slotCount00 += slotCount10;
        x00Rank = Math.max(x00Rank, x10Rank);
        y00Rank = Math.max(y00Rank, y10Rank);
        x00Base |= x10Base;
        y00Base |= y10Base;
        x00Mask &= x10Mask;
        y00Mask &= y10Mask;
        slots10 = null;
        slotCount10 = 0;
      }
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

    x00Mask ^= x00Base;
    y00Mask ^= y00Base;
    x01Mask ^= x01Base;
    y01Mask ^= y01Base;
    x10Mask ^= x10Base;
    y10Mask ^= y10Base;
    x11Mask ^= x11Base;
    y11Mask ^= y11Base;
    x00Rank = Math.max(x00Rank, 64 - Long.numberOfLeadingZeros(x00Mask));
    y00Rank = Math.max(y00Rank, 64 - Long.numberOfLeadingZeros(y00Mask));
    x01Rank = Math.max(x01Rank, 64 - Long.numberOfLeadingZeros(x01Mask));
    y01Rank = Math.max(y01Rank, 64 - Long.numberOfLeadingZeros(y01Mask));
    x10Rank = Math.max(x10Rank, 64 - Long.numberOfLeadingZeros(x10Mask));
    y10Rank = Math.max(y10Rank, 64 - Long.numberOfLeadingZeros(y10Mask));
    x11Rank = Math.max(x11Rank, 64 - Long.numberOfLeadingZeros(x11Mask));
    y11Rank = Math.max(y11Rank, 64 - Long.numberOfLeadingZeros(y11Mask));
    long x00 = BitInterval.from(x00Rank, x00Base);
    long y00 = BitInterval.from(y00Rank, y00Base);
    long x01 = BitInterval.from(x01Rank, x01Base);
    long y01 = BitInterval.from(y01Rank, y01Base);
    long x10 = BitInterval.from(x10Rank, x10Base);
    long y10 = BitInterval.from(y10Rank, y10Base);
    final long x11 = BitInterval.from(x11Rank, x11Base);
    final long y11 = BitInterval.from(y11Rank, y11Base);

    if (slotCount11 > 0 && slotCount01 > 0 && BitInterval.compare(x11, y11, x01, y01) == 0) {
      // Merge tile 11 into tile 01
      System.arraycopy(slots11, 0, slots01, slotCount01, slotCount11);
      slotCount01 += slotCount11;
      x01 = BitInterval.union(x01, x11);
      y01 = BitInterval.union(y01, y11);
      slots11 = null;
      slotCount11 = 0;
    }
    if (slotCount11 > 0 && slotCount10 > 0 && BitInterval.compare(x11, y11, x10, y10) == 0) {
      // Merge tile 11 into tile 10
      System.arraycopy(slots11, 0, slots10, slotCount10, slotCount11);
      slotCount10 += slotCount11;
      x10 = BitInterval.union(x10, x11);
      y10 = BitInterval.union(y10, y11);
      slots11 = null;
      slotCount11 = 0;
    }
    if (slotCount11 > 0 && slotCount00 > 0 && BitInterval.compare(x11, y11, x00, y00) == 0) {
      // Merge tile 11 into tile 00
      System.arraycopy(slots11, 0, slots00, slotCount00, slotCount11);
      slotCount00 += slotCount11;
      x00 = BitInterval.union(x00, x11);
      y00 = BitInterval.union(y00, y11);
      slots11 = null;
      slotCount11 = 0;
    }
    if (slotCount01 > 0 && slotCount00 > 0 && BitInterval.compare(x01, y01, x00, y00) == 0) {
      // Merge tile 01 into tile 00
      System.arraycopy(slots01, 0, slots00, slotCount00, slotCount01);
      slotCount00 += slotCount01;
      x00 = BitInterval.union(x00, x01);
      y00 = BitInterval.union(y00, y01);
      slots01 = null;
      slotCount01 = 0;
    }
    if (slotCount01 > 0 && slotCount10 > 0 && BitInterval.compare(x01, y01, x10, y10) == 0) {
      // Merge tile 01 into tile 10
      System.arraycopy(slots01, 0, slots10, slotCount10, slotCount01);
      slotCount10 += slotCount01;
      x10 = BitInterval.union(x10, x01);
      y10 = BitInterval.union(y10, y01);
      slots01 = null;
      slotCount01 = 0;
    }
    if (slotCount10 > 0 && slotCount00 > 0 && BitInterval.compare(x10, y10, x00, y00) == 0) {
      // Merge tile 10 into tile 00
      System.arraycopy(slots10, 0, slots00, slotCount00, slotCount10);
      slotCount00 += slotCount10;
      x00 = BitInterval.union(x00, x10);
      y00 = BitInterval.union(y00, y10);
      slots10 = null;
      slotCount10 = 0;
    }

    int pageRefCount = 0;
    if (slotCount00 > 0) {
      pageRefCount += 1;
    }
    if (slotCount01 > 0) {
      pageRefCount += 1;
    }
    if (slotCount10 > 0) {
      pageRefCount += 1;
    }
    if (slotCount11 > 0) {
      pageRefCount += 1;
    }
    final QTreePage<K, S, V>[] pages = (QTreePage<K, S, V>[]) new QTreePage<?, ?, ?>[pageRefCount];
    int pageRefOffset = 0;
    if (slotCount00 > 0) {
      if (slotCount00 < slotCount) {
        final QTreeEntry<K, S, V>[] newSlots00 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount00];
        System.arraycopy(slots00, 0, newSlots00, 0, slotCount00);
        slots00 = newSlots00;
      }
      BitInterval.sort(slots00, tree);
      pages[pageRefOffset] = new QTreeLeaf<K, S, V>(slots00, x00, y00);
      pageRefOffset += 1;
    }
    if (slotCount01 > 0) {
      if (slotCount01 < slotCount) {
        final QTreeEntry<K, S, V>[] newSlots01 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount01];
        System.arraycopy(slots01, 0, newSlots01, 0, slotCount01);
        slots01 = newSlots01;
      }
      BitInterval.sort(slots01, tree);
      pages[pageRefOffset] = new QTreeLeaf<K, S, V>(slots01, x01, y01);
      pageRefOffset += 1;
    }
    if (slotCount10 > 0) {
      if (slotCount10 < slotCount) {
        final QTreeEntry<K, S, V>[] newSlots10 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount10];
        System.arraycopy(slots10, 0, newSlots10, 0, slotCount10);
        slots10 = newSlots10;
      }
      BitInterval.sort(slots10, tree);
      pages[pageRefOffset] = new QTreeLeaf<K, S, V>(slots10, x10, y10);
      pageRefOffset += 1;
    }
    if (slotCount11 > 0) {
      if (slotCount11 < slotCount) {
        final QTreeEntry<K, S, V>[] newSlots11 = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCount11];
        System.arraycopy(slots11, 0, newSlots11, 0, slotCount11);
        slots11 = newSlots11;
      }
      BitInterval.sort(slots11, tree);
      pages[pageRefOffset] = new QTreeLeaf<K, S, V>(slots11, x11, y11);
      pageRefOffset += 1;
    }
    BitInterval.sort(pages, PAGE_ORDERING);

    if (slotCountXY == 0) {
      slotsXY = (QTreeEntry<K, S, V>[]) EMPTY_SLOTS;
    } else if (slotCountXY < slotCount) {
      final QTreeEntry<K, S, V>[] newSlotsXY = (QTreeEntry<K, S, V>[]) new QTreeEntry<?, ?, ?>[slotCountXY];
      System.arraycopy(slotsXY, 0, newSlotsXY, 0, slotCountXY);
      slotsXY = newSlotsXY;
    }
    BitInterval.sort(slotsXY, tree);

    return QTreeNode.create(pages, slotsXY, this.slots.length);
  }

  @Override
  public Cursor<QTreeEntry<K, S, V>> cursor(long x, long y) {
    return new QTreeLeafCursor<K, S, V>(this, x, y);
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

  public static <K, S, V> QTreeLeaf<K, S, V> create(QTreeEntry<K, S, V>[] slots) {
    int xRank = 0;
    int yRank = 0;
    long xBase = 0L;
    long yBase = 0L;
    long xMask = -1L;
    long yMask = -1L;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      final QTreeEntry<K, S, V> slot = slots[i];
      final long xt = slot.x;
      final long yt = slot.y;
      final int xtRank = Long.numberOfLeadingZeros(~xt);
      final int ytRank = Long.numberOfLeadingZeros(~yt);
      final long xtBase = xt << xtRank;
      final long ytBase = yt << ytRank;
      xRank = Math.max(xRank, xtRank);
      yRank = Math.max(yRank, ytRank);
      xBase |= xtBase;
      yBase |= ytBase;
      xMask &= xtBase;
      yMask &= ytBase;
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
    return new QTreeLeaf<K, S, V>(slots, x, y);
  }

  private static QTreeLeaf<Object, Object, Object> empty;

  @SuppressWarnings("unchecked")
  public static <K, S, V> QTreeLeaf<K, S, V> empty() {
    if (empty == null) {
      empty = new QTreeLeaf<Object, Object, Object>((QTreeEntry<Object, Object, Object>[]) EMPTY_SLOTS, -1L, -1L);
    }
    return (QTreeLeaf<K, S, V>) empty;
  }
}
