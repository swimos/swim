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

import swim.codec.Output;
import swim.codec.Unicode;
import swim.concurrent.Cont;
import swim.concurrent.Conts;
import swim.recon.Recon;
import swim.spatial.BitInterval;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.CombinerFunction;
import swim.util.Cursor;

public final class QTreeLeaf extends QTreePage {
  final QTreePageRef pageRef;
  final long version;
  final Slot[] slots;

  protected QTreeLeaf(QTreePageRef pageRef, long version, Slot[] slots) {
    this.pageRef = pageRef;
    this.version = version;
    this.slots = slots;
  }

  @Override
  public boolean isLeaf() {
    return true;
  }

  @Override
  public QTreePageRef pageRef() {
    return this.pageRef;
  }

  @Override
  public PageType pageType() {
    return PageType.LEAF;
  }

  @Override
  public long version() {
    return this.version;
  }

  @Override
  public boolean isEmpty() {
    return this.slots.length == 0;
  }

  @Override
  public int arity() {
    return this.slots.length;
  }

  @Override
  public int childCount() {
    return 0;
  }

  @Override
  public QTreePageRef getChildRef(int index) {
    throw new IndexOutOfBoundsException(Integer.toString(index));
  }

  @Override
  public QTreePage getChild(int index) {
    throw new IndexOutOfBoundsException(Integer.toString(index));
  }

  @Override
  public int slotCount() {
    return this.slots.length;
  }

  @Override
  public Slot getSlot(int index) {
    return this.slots[index];
  }

  int lookup(Value key) {
    final Slot[] slots = this.slots;
    int low = 0;
    int high = slots.length - 1;
    while (low <= high) {
      final int i = (low + high) >>> 1;
      final int order = key.compareTo(slots[i].key());
      if (order > 0) {
        low = i + 1;
      } else if (order < 0) {
        high = i - 1;
      } else {
        return i;
      }
    }
    return -(low + 1);
  }

  boolean containsKey(Value key) {
    return lookup(key) >= 0;
  }

  @Override
  public boolean containsKey(Value key, long xk, long yk) {
    return containsKey(key);
  }

  Value get(Value key) {
    final int i = lookup(key);
    if (i >= 0) {
      return this.slots[i].toValue().body();
    } else {
      return Value.absent();
    }
  }

  @Override
  public Value get(Value key, long xk, long yk) {
    return get(key);
  }

  @Override
  public QTreeLeaf updated(Value key, long xk, long yk, Value newValue,
                           long newVersion, boolean canSplit) {
    int i = lookup(key);
    if (i >= 0) {
      return updatedSlot(i, key, xk, yk, newValue, newVersion);
    } else {
      i = -(i + 1);
      return insertedSlot(i, key, xk, yk, newValue, newVersion);
    }
  }

  @Override
  QTreeLeaf updatedSlot(Slot newSlot, long newVersion) {
    int i = lookup(newSlot.key());
    if (i >= 0) {
      return updatedSlot(i, newSlot, newVersion);
    } else {
      i = -(i + 1);
      return insertedSlot(i, newSlot, newVersion);
    }
  }

  QTreeLeaf updatedSlot(int i, Slot newSlot, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final Slot oldSlot = oldSlots[i];
    if (!newSlot.equals(oldSlot)) {
      final int n = oldSlots.length;
      final Slot[] newSlots = new Slot[n];
      System.arraycopy(oldSlots, 0, newSlots, 0, n);
      newSlots[i] = newSlot.commit();
      return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
    } else {
      return this;
    }
  }

  QTreeLeaf insertedSlot(int i, Slot newSlot, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final int n = oldSlots.length + 1;
    final Slot[] newSlots = new Slot[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    newSlots[i] = newSlot.commit();
    System.arraycopy(oldSlots, i, newSlots, i + 1, n - (i + 1));
    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
  }

  QTreeLeaf updatedSlot(int i, Value key, long xk, long yk, Value newValue, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final Slot oldSlot = oldSlots[i];
    final Value oldTile = oldSlot.toValue().header("tile");
    final long oldX = oldTile.getItem(0).longValue();
    final long oldY = oldTile.getItem(1).longValue();
    if (!newValue.equals(oldSlot.toValue()) || oldX != xk || oldY != yk) {
      final int n = oldSlots.length;
      final Slot[] newSlots = new Slot[n];
      System.arraycopy(oldSlots, 0, newSlots, 0, n);
      newSlots[i] = slot(key, xk, yk, newValue);
      return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
    } else {
      return this;
    }
  }

  QTreeLeaf insertedSlot(int i, Value key, long xk, long yk, Value newValue, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final int n = oldSlots.length + 1;
    final Slot[] newSlots = new Slot[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    newSlots[i] = slot(key, xk, yk, newValue);
    System.arraycopy(oldSlots, i, newSlots, i + 1, n - (i + 1));
    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
  }

  @Override
  QTreeLeaf insertedPageRef(QTreePageRef newPageRef, long newVersion) {
    return mergedPage(newPageRef.page(), newVersion);
  }

  @Override
  QTreeLeaf mergedPage(QTreePage newPage, long newVersion) {
    if (newPage.isLeaf()) {
      return mergedLeaf((QTreeLeaf) newPage, newVersion);
    } else {
      return mergedNode(newPage, newVersion);
    }
  }

  QTreeLeaf mergedLeaf(QTreeLeaf newPage, long newVersion) {
    return mergedSlots(newPage.slots, newVersion);
  }

  QTreeLeaf mergedNode(QTreePage newPage, long newVersion) {
    final Slot[] oldSlots = this.slots;
    int i = oldSlots.length;
    final int n = i + (int) newPage.span();
    final Slot[] newSlots = new Slot[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    final Cursor<Slot> cursor = newPage.tileCursor();
    while (cursor.hasNext()) {
      newSlots[i] = cursor.next();
      i += 1;
    }
    BitInterval.sort(newSlots, SLOT_ORDERING);
    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
  }

  @Override
  QTreeLeaf mergedSlots(Slot[] subSlots, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final Slot[] newSlots = new Slot[oldSlots.length + subSlots.length];
    System.arraycopy(oldSlots, 0, newSlots, 0, oldSlots.length);
    System.arraycopy(subSlots, 0, newSlots, oldSlots.length, subSlots.length);
    BitInterval.sort(newSlots, SLOT_ORDERING);
    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
  }

  @Override
  public QTreeLeaf removed(Value key, long xk, long yk, long newVersion) {
    final int i = lookup(key);
    if (i >= 0) {
      if (this.slots.length > 1) {
        return removedSlot(i, newVersion);
      } else {
        return empty(this.pageRef.context, this.pageRef.stem, newVersion);
      }
    } else {
      return this;
    }
  }

  QTreeLeaf removedSlot(int i, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final int n = oldSlots.length - 1;
    final Slot[] newSlots = new Slot[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    System.arraycopy(oldSlots, i + 1, newSlots, i, n - i);
    return create(this.pageRef.context, this.pageRef.stem, newVersion, Value.absent(), newSlots);
  }

  @Override
  public QTreePage flattened(long newVersion) {
    return this;
  }

  @Override
  public QTreePage balanced(long newVersion) {
    if (this.slots.length > 1 && this.pageRef.context.pageShouldSplit(this)) {
      return split(newVersion);
    } else {
      return this;
    }
  }

  @Override
  QTreeNode split(long newVersion) {
    final long x = this.pageRef.x;
    final long y = this.pageRef.y;
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

    final Slot[] slots = this.slots;
    Slot[] slots00 = null;
    Slot[] slots01 = null;
    Slot[] slots10 = null;
    Slot[] slots11 = null;
    Slot[] slotsX0 = null;
    Slot[] slotsX1 = null;
    Slot[] slotsXY = null;
    final int slotCount = slots.length;
    int slotCount00 = 0;
    int slotCount01 = 0;
    int slotCount10 = 0;
    int slotCount11 = 0;
    int slotCountX0 = 0;
    int slotCountX1 = 0;
    int slotCountXY = 0;
    for (int i = 0; i < slotCount; i += 1) {
      final Slot slot = slots[i];
      final Value tile = slot.toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
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
            slotsX0 = new Slot[slotCount];
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
            slotsX1 = new Slot[slotCount];
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
            slots00 = new Slot[slotCount];
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
            slots01 = new Slot[slotCount];
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
            slots10 = new Slot[slotCount];
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
            slots11 = new Slot[slotCount];
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
        slotsXY = new Slot[slotCount];
      }
      System.arraycopy(slotsX0, 0, slotsXY, slotCountXY, slotCountX0);
      slotCountXY += slotCountX0;
      slotsX0 = null;
      slotCountX0 = 0;
    }
    if (slotsX1 != null) {
      if (slotsXY == null) {
        slotsXY = new Slot[slotCount];
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
    final QTreePageRef[] pageRefs = new QTreePageRef[pageRefCount];
    int pageRefOffset = 0;
    if (slotCount00 > 0) {
      if (slotCount00 < slotCount) {
        final Slot[] newSlots00 = new Slot[slotCount00];
        System.arraycopy(slots00, 0, newSlots00, 0, slotCount00);
        slots00 = newSlots00;
      }
      BitInterval.sort(slots00, SLOT_ORDERING);
      pageRefs[pageRefOffset] = create(this.pageRef.context, this.pageRef.stem,
                                       newVersion, x00, y00, Value.absent(), slots00).pageRef();
      pageRefOffset += 1;
    }
    if (slotCount01 > 0) {
      if (slotCount01 < slotCount) {
        final Slot[] newSlots01 = new Slot[slotCount01];
        System.arraycopy(slots01, 0, newSlots01, 0, slotCount01);
        slots01 = newSlots01;
      }
      BitInterval.sort(slots01, SLOT_ORDERING);
      pageRefs[pageRefOffset] = create(this.pageRef.context, this.pageRef.stem,
                                       newVersion, x01, y01, Value.absent(), slots01).pageRef();
      pageRefOffset += 1;
    }
    if (slotCount10 > 0) {
      if (slotCount10 < slotCount) {
        final Slot[] newSlots10 = new Slot[slotCount10];
        System.arraycopy(slots10, 0, newSlots10, 0, slotCount10);
        slots10 = newSlots10;
      }
      BitInterval.sort(slots10, SLOT_ORDERING);
      pageRefs[pageRefOffset] = create(this.pageRef.context, this.pageRef.stem,
                                       newVersion, x10, y10, Value.absent(), slots10).pageRef();
      pageRefOffset += 1;
    }
    if (slotCount11 > 0) {
      if (slotCount11 < slotCount) {
        final Slot[] newSlots11 = new Slot[slotCount11];
        System.arraycopy(slots11, 0, newSlots11, 0, slotCount11);
        slots11 = newSlots11;
      }
      BitInterval.sort(slots11, SLOT_ORDERING);
      pageRefs[pageRefOffset] = create(this.pageRef.context, this.pageRef.stem,
                                       newVersion, x11, y11, Value.absent(), slots11).pageRef();
      pageRefOffset += 1;
    }
    BitInterval.sort(pageRefs, PAGE_REF_ORDERING);

    if (slotCountXY == 0) {
      slotsXY = EMPTY_SLOTS;
    } else if (slotCountXY < slotCount) {
      final Slot[] newSlotsXY = new Slot[slotCountXY];
      System.arraycopy(slotsXY, 0, newSlotsXY, 0, slotCountXY);
      slotsXY = newSlotsXY;
    }
    BitInterval.sort(slotsXY, SLOT_ORDERING);

    return QTreeNode.create(this.pageRef.context, this.pageRef.stem,
                            newVersion, this.pageRef.span, Value.absent(), pageRefs, slotsXY);
  }

  @Override
  void memoizeSize(QTreePageRef pageRef) {
    int pageSize = 12; // "@qleaf(stem:"
    pageSize += Recon.sizeOf(Num.from(this.pageRef.stem));
    pageSize += 3; // ",v:"
    pageSize += Recon.sizeOf(Num.from(this.version));
    pageSize += 1; // ')'

    final Slot[] slots = this.slots;
    final int n = slots.length;
    if (n > 0) {
      pageSize += 1; // '{'
      pageSize += Recon.sizeOf(slots[0]);
      for (int i = 1; i < n; i += 1) {
        pageSize += 1; // ','
        pageSize += Recon.sizeOf(slots[i]);
      }
      pageSize += 1; // '}'
    }

    pageSize += 1; // '\n'
    pageRef.pageSize = pageSize; // Must match bytes written by writePage
    pageRef.diffSize = pageSize; // Must match bytes written by writeDiff
    pageRef.treeSize = pageSize;
  }

  @Override
  public Value toHeader() {
    final Record header = Record.create(2)
        .slot("stem", this.pageRef.stem)
        .slot("v", this.version);
    return Record.create(1).attr("qleaf", header);
  }

  @Override
  public Value toValue() {
    final Record record = (Record) toHeader();
    final Slot[] slots = this.slots;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      record.add(slots[i]);
    }
    return record;
  }

  @Override
  public QTreeLeaf reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                           CombinerFunction<Value, Value> combiner, long newVersion) {
    final Slot[] slots = this.slots;
    Value fold = identity;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      fold = accumulator.combine(fold, slots[i].value());
    }
    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  this.pageRef.x, this.pageRef.y, fold, slots);
  }

  @Override
  public QTreeLeaf evacuated(int post, long version) {
    final int oldPost = this.pageRef.post;
    if (oldPost != 0 && oldPost < post) {
      return create(this.pageRef.context, this.pageRef.stem, version,
                    this.pageRef.x, this.pageRef.y, this.pageRef.fold, this.slots);
    } else {
      return this;
    }
  }

  @Override
  public QTreeLeaf committed(int zone, long base, long version) {
    return create(this.pageRef.context, this.pageRef.stem, version, zone, base,
                  this.pageRef.x, this.pageRef.y, this.pageRef.fold, this.slots);
  }

  @Override
  public QTreeLeaf uncommitted(long version) {
    return create(this.pageRef.context, this.pageRef.stem, version,
                  this.pageRef.x, this.pageRef.y, this.pageRef.fold, this.slots);
  }

  @Override
  public void writePage(Output<?> output) {
    Recon.write(toHeader(), output);
    writePageContent(output);
    output.write('\n');
  }

  void writePageContent(Output<?> output) {
    final Slot[] slots = this.slots;
    final int n = slots.length;
    if (n > 0) {
      output.write('{');
      Recon.write(slots[0], output);
      for (int i = 1; i < n; i += 1) {
        output.write(',');
        Recon.write(slots[i], output);
      }
      output.write('}');
    }
  }

  @Override
  public void writeDiff(Output<?> output) {
    writePage(output);
  }

  @Override
  public void loadTreeAsync(PageLoader pageLoader, Cont<Page> future) {
    try {
      // Call continuation on fresh stack
      this.pageRef.context.stage().execute(Conts.async(future, this));
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        future.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void soften(long version) {
    // nop
  }

  @Override
  public Cursor<Slot> cursor(long x, long y) {
    return new QTreeLeafCursor(this, x, y);
  }

  @Override
  public Cursor<Slot> depthCursor(long x, long y, int maxDepth) {
    return cursor(x, y);
  }

  @Override
  public Cursor<Slot> deltaCursor(long x, long y, long sinceVersion) {
    if (sinceVersion <= version) {
      return cursor(x, y);
    } else {
      return Cursor.empty();
    }
  }

  @Override
  public Cursor<Slot> tileCursor(long x, long y) {
    return new QTreeLeafTileCursor(this, x, y);
  }

  @Override
  public String toString() {
    final Output<String> output = Unicode.stringOutput(pageSize() - 1); // ignore trailing '\n'
    Recon.write(toHeader(), output);
    writePageContent(output);
    return output.bind();
  }

  public static QTreeLeaf create(PageContext context, int stem, long version, int zone,
                                 long base, long x, long y, Value fold, Slot[] slots) {
    final QTreePageRef pageRef = new QTreePageRef(context, PageType.LEAF, stem, zone,
                                                  zone, base, slots.length, x, y, fold);
    final QTreeLeaf page = new QTreeLeaf(pageRef, version, slots);
    pageRef.page = page;
    return page;
  }

  public static QTreeLeaf create(PageContext context, int stem, long version,
                                 long x, long y, Value fold, Slot[] slots) {
    return create(context, stem, version, 0, 0L, x, y, fold, slots);
  }

  public static QTreeLeaf create(PageContext context, int stem, long version,
                                 Value fold, Slot[] slots) {
    int xRank = 0;
    int yRank = 0;
    long xBase = 0L;
    long yBase = 0L;
    long xMask = -1L;
    long yMask = -1L;
    for (int i = 0, n = slots.length; i < n; i += 1) {
      final Value tile = slots[i].toValue().header("tile");
      final long xt = tile.getItem(0).longValue();
      final long yt = tile.getItem(1).longValue();
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
    return create(context, stem, version, 0, 0L, x, y, fold, slots);
  }

  public static QTreeLeaf empty(PageContext context, int stem, long version) {
    return create(context, stem, version, 0, 0L, -1L, -1L, Value.absent(), EMPTY_SLOTS);
  }

  public static QTreeLeaf fromValue(QTreePageRef pageRef, Value value) {
    Throwable cause = null;
    try {
      final Value header = value.header("qleaf");
      final long version = header.get("v").longValue();
      final Record tail = value.tail();
      final Slot[] slots = new Slot[tail.size()];
      tail.toArray(slots);
      return new QTreeLeaf(pageRef, version, slots);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        cause = error;
      } else {
        throw error;
      }
    }
    final Output<String> message = Unicode.stringOutput("Malformed qleaf: ");
    Recon.write(value, message);
    throw new StoreException(message.bind(), cause);
  }
}
