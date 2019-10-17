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
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.CombinerFunction;
import swim.util.Cursor;

public final class QTreeNode extends QTreePage {
  final QTreePageRef pageRef;
  final long version;
  final QTreePageRef[] childRefs;
  final Slot[] slots;

  protected QTreeNode(QTreePageRef pageRef, long version,
                      QTreePageRef[] childRefs, Slot[] slots) {
    this.pageRef = pageRef;
    this.version = version;
    this.childRefs = childRefs;
    this.slots = slots;
  }

  @Override
  public boolean isNode() {
    return true;
  }

  @Override
  public QTreePageRef pageRef() {
    return this.pageRef;
  }

  @Override
  public PageType pageType() {
    return PageType.NODE;
  }

  @Override
  public long version() {
    return this.version;
  }

  @Override
  public boolean isEmpty() {
    return this.pageRef.span == 0;
  }

  @Override
  public int arity() {
    return this.childRefs.length + this.slots.length;
  }

  @Override
  public int childCount() {
    return this.childRefs.length;
  }

  @Override
  public QTreePageRef getChildRef(int index) {
    return this.childRefs[index];
  }

  @Override
  public QTreePage getChild(int index) {
    try {
      return this.childRefs[index].page();
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public int slotCount() {
    return this.slots.length;
  }

  @Override
  public Slot getSlot(int index) {
    return this.slots[index];
  }

  int scan(long xk, long yk) {
    final QTreePageRef[] childRefs = this.childRefs;
    int j = 0;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      final QTreePageRef childRef = childRefs[i];
      final int order = BitInterval.compare(childRef.x, childRef.y, xk, yk);
      if (order == 0) {
        return i;
      } else if (order < 0) {
        j = i;
      }
    }
    return -(j + 1);
  }

  int lookup(long xk, long yk) {
    final QTreePageRef[] childRefs = this.childRefs;
    int l = 0;
    int u = childRefs.length - 1;
    while (l <= u) { // binary search for xlub + 1
      final int i = (l + u) >>> 1;
      final int xOrder = BitInterval.compare(childRefs[i].x, xk);
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
      final int yOrder = BitInterval.compare(childRefs[l].y, yk);
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

  @Override
  public boolean containsKey(Value key, long xk, long yk) {
    try {
      final int xRank = Long.numberOfLeadingZeros(~this.pageRef.x);
      final int yRank = Long.numberOfLeadingZeros(~this.pageRef.y);
      final int xkRank = Long.numberOfLeadingZeros(~xk);
      final int ykRank = Long.numberOfLeadingZeros(~yk);
      if (xkRank <= xRank && ykRank <= yRank) {
        final int i = scan(xk, yk);
        //final int i = lookup(xk, yk);
        if (i >= 0) {
          final QTreePageRef childRef = this.childRefs[i];
          if (xkRank <= childRef.xRank() && ykRank <= childRef.yRank()) {
            if (childRef.page().containsKey(key, xk, yk)) {
              return true;
            }
          }
        }
        return lookup(key) >= 0;
      }
      return false;
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public Value get(Value key, long xk, long yk) {
    try {
      final int xRank = Long.numberOfLeadingZeros(~this.pageRef.x);
      final int yRank = Long.numberOfLeadingZeros(~this.pageRef.y);
      final int xkRank = Long.numberOfLeadingZeros(~xk);
      final int ykRank = Long.numberOfLeadingZeros(~yk);
      if (xkRank <= xRank && ykRank <= yRank) {
        int i = scan(xk, yk);
        //int i = lookup(xk, yk);
        if (i >= 0) {
          final QTreePageRef childRef = this.childRefs[i];
          if (xkRank <= childRef.xRank() && ykRank <= childRef.yRank()) {
            final Value value = childRef.page().get(key, xk, yk);
            if (value.isDefined()) {
              return value;
            }
          }
        }
        i = lookup(key);
        if (i >= 0) {
          return this.slots[i].toValue().body();
        }
      }
      return Value.absent();
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  QTreeNode updated(Value key, long xk, long yk, Value newValue,
                    long newVersion, boolean canSplit) {
    try {
      final QTreePageRef[] childRefs = this.childRefs;
      final int n = childRefs.length;
      final int j = lookup(xk, yk);
      final int i = j >= 0 ? j : -(j + 1);
      final QTreePage oldPage = childRefs[i].page();
      final QTreePage newPage = oldPage.updated(key, xk, yk, newValue, newVersion);
      if (oldPage.x() == newPage.x() && oldPage.y() == newPage.y()) {
        if (canSplit && oldPage.span() != newPage.span() && this.pageRef.context.pageShouldSplit(newPage)) {
          return updatedPageSplit(i, newPage, oldPage, newVersion);
        } else {
          return updatedPage(i, newPage, oldPage, newVersion);
        }
      } else {
        return coalescePage(this, i, newPage, oldPage, newVersion);
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  QTreeNode coalescePage(QTreeNode basePage, int i, QTreePage newPage,
                         QTreePage oldPage, long newVersion) {
    try {
      do {
        basePage = basePage.removedPage(i, oldPage, newVersion);
        int j = basePage.scan(newPage.x(), newPage.y());
        //int j = basePage.lookup(newPage.x(), newPage.y());
        if (j < 0) {
          j = -(j + 1);
          return basePage.insertedPageRef(j, newPage.pageRef(), newVersion).reinsertedSlots(newVersion);
        } else {
          i = j;
          oldPage = basePage.getChildRef(i).page();
          newPage = oldPage.mergedPage(newPage, newVersion);
        }
      } while (true);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  QTreeNode updatedPage(int i, QTreePage newPage, QTreePage oldPage, long newVersion) {
    final QTreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length;
    final QTreePageRef[] newChildRefs = new QTreePageRef[n];
    System.arraycopy(oldChildRefs, 0, newChildRefs, 0, n);
    newChildRefs[i] = newPage.pageRef();
    BitInterval.sort(newChildRefs, PAGE_REF_ORDERING);
    final long newSpan = this.pageRef.span - oldPage.span() + newPage.span();
    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  newSpan, Value.absent(), newChildRefs, this.slots);
  }

  QTreeNode updatedPageSplit(int i, QTreePage newPage, QTreePage oldPage, long newVersion) {
    QTreeNode page = removedPage(i, oldPage, newVersion);
    final QTreeNode subPage = newPage.split(newVersion);
    final QTreePageRef[] subChildRefs = subPage.childRefs;
    final int subChildCount = subChildRefs.length;
    if (subChildCount <= 1) {
      return updatedPage(i, newPage, oldPage, newVersion);
    }
    for (int j = 0; j < subChildCount; j += 1) {
      page = page.insertedPageRef(subChildRefs[j], newVersion);
    }
    return page.mergedSlots(subPage.slots, newVersion);
  }

  QTreeNode updatedPageMerge(int i, QTreeNode newPage, QTreePage oldPage, long newVersion) {
    QTreeNode page = removedPage(i, oldPage, newVersion);
    final QTreePageRef[] newChildRefs = newPage.childRefs;
    for (int j = 0, childCount = newChildRefs.length; j < childCount; j += 1) {
      page = page.insertedPageRef(newChildRefs[j], newVersion);
    }
    final Slot[] newSlots = newPage.slots;
    for (int j = 0, slotCount = newSlots.length; j < slotCount; j += 1) {
      page = page.updatedSlot(newSlots[j], newVersion);
    }
    return page;
  }

  QTreeNode mergedPage(QTreePage newPage, long newVersion) {
    QTreeNode page = this;
    if (newPage.isNode()) {
      for (int i = 0, childCount = newPage.childCount(); i < childCount; i += 1) {
        page = page.insertedPageRef(newPage.getChildRef(i), newVersion);
      }
    }
    for (int i = 0, slotCount = newPage.slotCount(); i < slotCount; i += 1) {
      final Slot slot = newPage.getSlot(i);
      final Value key = slot.key();
      final Value tile = slot.toValue().header("tile");
      final long x = tile.getItem(0).longValue();
      final long y = tile.getItem(1).longValue();
      final Value value = slot.toValue().body();
      page = page.updated(key, x, y, value, newVersion, false);
    }
    return page;
  }

  @Override
  QTreeNode mergedSlots(Slot[] subSlots, long newVersion) {
    if (subSlots.length > 0) {
      final Slot[] oldSlots = this.slots;
      final Slot[] newSlots = new Slot[oldSlots.length + subSlots.length];
      System.arraycopy(oldSlots, 0, newSlots, 0, oldSlots.length);
      System.arraycopy(subSlots, 0, newSlots, oldSlots.length, subSlots.length);
      BitInterval.sort(newSlots, SLOT_ORDERING);
      final long newSpan = this.pageRef.span + subSlots.length;
      return create(this.pageRef.context, this.pageRef.stem, newVersion,
                    newSpan, Value.absent(), this.childRefs, newSlots);
    } else {
      return this;
    }
  }

  QTreeNode reinsertedSlots(long newVersion) {
    QTreeNode page = this;
    final Slot[] oldSlots = this.slots;
    final int oldSlotCount = oldSlots.length;
    Slot[] newSlots = null;
    int newSlotCount = 0;
    for (int i = 0; i < oldSlotCount; i += 1) {
      final Slot slot = oldSlots[i];
      final Value tile = slot.toValue().header("tile");
      final long x = tile.getItem(0).longValue();
      final long y = tile.getItem(1).longValue();
      final int j = page.lookup(x, y);
      if (j >= 0) {
        final Value key = slot.key();
        final Value value = slot.toValue().body();
        // page will temporarily have two copies of slot,
        // one in parent, and one in child
        page = page.updated(key, x, y, value, newVersion, false);
        if (newSlots == null) {
          newSlots = new Slot[oldSlotCount - 1];
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
        newSlots = EMPTY_SLOTS;
      } else if (newSlotCount < oldSlotCount - 1) {
        final Slot[] resizedSlots = new Slot[newSlotCount];
        System.arraycopy(newSlots, 0, resizedSlots, 0, newSlotCount);
        newSlots = resizedSlots;
      }
      return create(page.pageRef.context, page.pageRef.stem, newVersion,
                    this.pageRef.span, Value.absent(), page.childRefs, newSlots);
    } else {
      return page;
    }
  }

  @Override
  QTreeNode insertedPageRef(QTreePageRef newPageRef, long newVersion) {
    try {
      int i = lookup(newPageRef.x(), newPageRef.y());
      if (i < 0) {
        i = -(i + 1);
        return insertedPageRef(i, newPageRef, newVersion);
      } else {
        return mergedPage(newPageRef.page(), newVersion);
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  QTreeNode insertedPageRef(int i, QTreePageRef newPageRef, long newVersion) {
    final QTreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length + 1;
    final QTreePageRef[] newChildRefs = new QTreePageRef[n];
    System.arraycopy(oldChildRefs, 0, newChildRefs, 0, i);
    newChildRefs[i] = newPageRef;
    System.arraycopy(oldChildRefs, i, newChildRefs, i + 1, n - (i + 1));
    BitInterval.sort(newChildRefs, PAGE_REF_ORDERING);
    final long newSpan = this.pageRef.span + newPageRef.span();
    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  newSpan, Value.absent(), newChildRefs, this.slots);
  }

  QTreeNode insertedSlot(int i, Value key, long xk, long yk, Value newValue, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final int n = oldSlots.length + 1;
    final Slot[] newSlots = new Slot[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    newSlots[i] = slot(key, xk, yk, newValue);
    System.arraycopy(oldSlots, i, newSlots, i + 1, n - (i + 1));
    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  this.pageRef.span + 1L, Value.absent(), this.childRefs, newSlots);
  }

  QTreeNode updatedSlot(Value key, long xk, long yk, Value newValue, long newVersion) {
    return updatedSlot(slot(key, xk, yk, newValue), newVersion);
  }

  QTreeNode updatedSlot(int i, Value key, long xk, long yk, Value newValue, long newVersion) {
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
      return create(this.pageRef.context, this.pageRef.stem, newVersion,
                    this.pageRef.span, Value.absent(), this.childRefs, newSlots);
    } else {
      return this;
    }
  }

  @Override
  QTreeNode updatedSlot(Slot newSlot, long newVersion) {
    int i = lookup(newSlot.key());
    if (i >= 0) {
      return updatedSlot(i, newSlot, newVersion);
    } else {
      i = -(i + 1);
      return insertedSlot(i, newSlot, newVersion);
    }
  }

  QTreeNode updatedSlot(int i, Slot newSlot, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final Slot oldSlot = oldSlots[i];
    if (!newSlot.equals(oldSlot)) {
      final int n = oldSlots.length;
      final Slot[] newSlots = new Slot[n];
      System.arraycopy(oldSlots, 0, newSlots, 0, n);
      newSlots[i] = newSlot.commit();
      return create(this.pageRef.context, this.pageRef.stem, newVersion,
                    this.pageRef.span, Value.absent(), this.childRefs, newSlots);
    } else {
      return this;
    }
  }

  QTreeNode insertedSlot(int i, Slot newSlot, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final int n = oldSlots.length + 1;
    final Slot[] newSlots = new Slot[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    newSlots[i] = newSlot.commit();
    System.arraycopy(oldSlots, i, newSlots, i + 1, n - (i + 1));
    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  this.pageRef.span, Value.absent(), this.childRefs, newSlots);
  }

  @Override
  public QTreePage removed(Value key, long xk, long yk, long newVersion) {
    final int xRank = Long.numberOfLeadingZeros(~this.pageRef.x);
    final int yRank = Long.numberOfLeadingZeros(~this.pageRef.y);
    final int xkRank = Long.numberOfLeadingZeros(~xk);
    final int ykRank = Long.numberOfLeadingZeros(~yk);
    if (xkRank <= xRank && ykRank <= yRank) {
      int i = scan(xk, yk);
      //int i = lookup(xk, yk);
      if (i >= 0) {
        final QTreePage oldPage = getChild(i);
        final QTreePage newPage = oldPage.removed(key, xk, yk, newVersion);
        if (oldPage != newPage) {
          return replacedPage(i, newPage, oldPage, newVersion);
        }
      }
      i = lookup(key);
      if (i >= 0) {
        return removedSlot(i, newVersion);
      }
    }
    return this;
  }

  QTreePage replacedPage(int i, QTreePage newPage, QTreePage oldPage, long newVersion) {
    if (!newPage.isEmpty()) {
      if (newPage.isNode() && this.pageRef.context.pageShouldMerge(newPage)) {
        return updatedPageMerge(i, (QTreeNode) newPage, oldPage, newVersion);
      } else {
        return updatedPage(i, newPage, oldPage, newVersion);
      }
    } else if (this.childRefs.length > 2) {
      return removedPage(i, oldPage, newVersion);
    } else if (this.childRefs.length > 1) {
      final QTreePage onlyChild;
      if (i == 0) {
        onlyChild = getChild(1);
      } else {
        onlyChild = getChild(0);
      }
      if (this.slots.length == 0) {
        return onlyChild;
      } else {
        return onlyChild.mergedSlots(this.slots, newVersion);
      }
    } else if (this.slots.length > 0) {
      return QTreeLeaf.create(this.pageRef.context, this.pageRef.stem, newVersion,
                              Value.absent(), this.slots);
    } else {
      return QTreeLeaf.empty(this.pageRef.context, this.pageRef.stem, newVersion);
    }
  }

  QTreeNode removedPage(int i, QTreePage oldPage, long newVersion) {
    final QTreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length - 1;
    final QTreePageRef[] newChildRefs = new QTreePageRef[n];
    System.arraycopy(oldChildRefs, 0, newChildRefs, 0, i);
    System.arraycopy(oldChildRefs, i + 1, newChildRefs, i, n - i);
    BitInterval.sort(newChildRefs, PAGE_REF_ORDERING);
    final long newSpan = this.pageRef.span - oldPage.span();
    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  newSpan, Value.absent(), newChildRefs, this.slots);
  }

  QTreeNode removedSlot(int i, long newVersion) {
    final Slot[] oldSlots = this.slots;
    final int n = oldSlots.length - 1;
    final Slot[] newSlots = new Slot[n];
    System.arraycopy(oldSlots, 0, newSlots, 0, i);
    System.arraycopy(oldSlots, i + 1, newSlots, i, n - i);
    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  this.pageRef.span - 1L, Value.absent(), this.childRefs, newSlots);
  }

  @Override
  public QTreePage flattened(long newVersion) {
    try {
      final QTreePageRef[] childRefs = this.childRefs;
      final Slot[] slots = this.slots;
      if (childRefs.length > 1) {
        return this;
      } else if (childRefs.length == 1) {
        final QTreePage child = childRefs[0].page();
        if (slots.length == 0) {
          return child;
        } else {
          return child.mergedSlots(slots, newVersion);
        }
      } else if (slots.length > 0) {
        return QTreeLeaf.create(this.pageRef.context, this.pageRef.stem, newVersion,
                                Value.absent(), slots);
      } else {
        return QTreeLeaf.empty(this.pageRef.context, this.pageRef.stem, newVersion);
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        throw new StoreException(toDebugString(), cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public QTreeNode balanced(long newVersion) {
    if (this.childRefs.length > 1 && this.pageRef.context.pageShouldSplit(this)) {
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

    final QTreePageRef[] childRefs = this.childRefs;
    QTreePageRef[] childRefs00 = null;
    QTreePageRef[] childRefs01 = null;
    QTreePageRef[] childRefs10 = null;
    QTreePageRef[] childRefs11 = null;
    final int childCount = childRefs.length;
    int childCount00 = 0;
    int childCount01 = 0;
    int childCount10 = 0;
    int childCount11 = 0;
    long span00 = 0L;
    long span01 = 0L;
    long span10 = 0L;
    long span11 = 0L;
    for (int i = 0; i < childCount; i += 1) {
      final QTreePageRef childRef = childRefs[i];
      final long xc = childRef.x;
      final long yc = childRef.y;
      final int xcRank = Long.numberOfLeadingZeros(~xc);
      final int ycRank = Long.numberOfLeadingZeros(~yc);
      final long xcBase = xc << xcRank;
      final long ycBase = yc << ycRank;
      final long xcNorm = xcBase & xnMask;
      final long ycNorm = ycBase & ynMask;
      if (xcNorm == x0Base) {
        if (ycNorm == y0Base) {
          if (childRefs00 == null) {
            childRefs00 = new QTreePageRef[childCount];
          }
          childRefs00[childCount00] = childRef;
          childCount00 += 1;
          span00 += childRef.span;
          x00Rank = Math.max(x00Rank, xcRank);
          y00Rank = Math.max(y00Rank, ycRank);
          x00Base |= xcBase;
          y00Base |= ycBase;
          x00Mask &= xcBase;
          y00Mask &= ycBase;
        } else {
          if (childRefs01 == null) {
            childRefs01 = new QTreePageRef[childCount];
          }
          childRefs01[childCount01] = childRef;
          childCount01 += 1;
          span01 += childRef.span;
          x01Rank = Math.max(x01Rank, xcRank);
          y01Rank = Math.max(y01Rank, ycRank);
          x01Base |= xcBase;
          y01Base |= ycBase;
          x01Mask &= xcBase;
          y01Mask &= ycBase;
        }
      } else {
        if (ycNorm == y0Base) {
          if (childRefs10 == null) {
            childRefs10 = new QTreePageRef[childCount];
          }
          childRefs10[childCount10] = childRef;
          childCount10 += 1;
          span10 += childRef.span;
          x10Rank = Math.max(x10Rank, xcRank);
          y10Rank = Math.max(y10Rank, ycRank);
          x10Base |= xcBase;
          y10Base |= ycBase;
          x10Mask &= xcBase;
          y10Mask &= ycBase;
        } else {
          if (childRefs11 == null) {
            childRefs11 = new QTreePageRef[childCount];
          }
          childRefs11[childCount11] = childRef;
          childCount11 += 1;
          span11 += childRef.span;
          x11Rank = Math.max(x11Rank, xcRank);
          y11Rank = Math.max(y11Rank, ycRank);
          x11Base |= xcBase;
          y11Base |= ycBase;
          x11Mask &= xcBase;
          y11Mask &= ycBase;
        }
      }
    }

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
          span00 += 1L;
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
            slots10 = new Slot[slotCount];
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
            slots11 = new Slot[slotCount];
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

    if (childCount11 > 0 && childCount01 > 0 && BitInterval.compare(x11, y11, x01, y01) == 0) {
      // Merge tile 11 into tile 01
      System.arraycopy(childRefs11, 0, childRefs01, childCount01, childCount11);
      childCount01 += childCount11;
      span01 += span11;
      if (slotCount11 > 0) {
        if (slots01 == null) {
          slots01 = new Slot[slotCount];
        }
        System.arraycopy(slots11, 0, slots01, slotCount01, slotCount11);
        slotCount01 += slotCount11;
        slots11 = null;
        slotCount11 = 0;
      }
      x01 = BitInterval.union(x01, x11);
      y01 = BitInterval.union(y01, y11);
      childRefs11 = null;
      childCount11 = 0;
      span11 = 0L;
    }
    if (childCount01 > 0 && childCount00 > 0 && BitInterval.compare(x01, y01, x00, y00) == 0) {
      // Merge tile 01 into tile 00
      System.arraycopy(childRefs01, 0, childRefs00, childCount00, childCount01);
      childCount00 += childCount01;
      span00 += span01;
      if (slotCount01 > 0) {
        if (slots00 == null) {
          slots00 = new Slot[slotCount];
        }
        System.arraycopy(slots01, 0, slots00, slotCount00, slotCount01);
        slotCount00 += slotCount01;
        slots01 = null;
        slotCount01 = 0;
      }
      x00 = BitInterval.union(x00, x01);
      y00 = BitInterval.union(y00, y01);
      childRefs01 = null;
      childCount01 = 0;
      span01 = 0L;
    }
    if (childCount01 > 0 && childCount10 > 0 && BitInterval.compare(x01, y01, x10, y10) == 0) {
      // Merge tile 01 into tile 10
      System.arraycopy(childRefs01, 0, childRefs10, childCount10, childCount01);
      childCount10 += childCount01;
      span10 += span01;
      if (slotCount01 > 0) {
        if (slots10 == null) {
          slots10 = new Slot[slotCount];
        }
        System.arraycopy(slots01, 0, slots10, slotCount10, slotCount01);
        slotCount10 += slotCount01;
        slots01 = null;
        slotCount01 = 0;
      }
      x10 = BitInterval.union(x10, x01);
      y10 = BitInterval.union(y10, y01);
      childRefs01 = null;
      childCount01 = 0;
      span01 = 0L;
    }
    if (childCount10 > 0 && childCount00 > 0 && BitInterval.compare(x10, y10, x00, y00) == 0) {
      // Merge tile 10 into tile 00
      System.arraycopy(childRefs10, 0, childRefs00, childCount00, childCount10);
      childCount00 += childCount10;
      span00 += span10;
      if (slotCount10 > 0) {
        if (slots00 == null) {
          slots00 = new Slot[slotCount];
        }
        System.arraycopy(slots10, 0, slots00, slotCount00, slotCount10);
        slotCount00 += slotCount10;
        slots10 = null;
        slotCount10 = 0;
      }
      x00 = BitInterval.union(x00, x10);
      y00 = BitInterval.union(y00, y10);
      childRefs10 = null;
      childCount10 = 0;
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

    int pageRefCount = 0;
    if (childCount00 > 0 || slotCount00 > 0) {
      pageRefCount += 1;
    }
    if (childCount01 > 0 || slotCount01 > 0) {
      pageRefCount += 1;
    }
    if (childCount10 > 0 || slotCount10 > 0) {
      pageRefCount += 1;
    }
    if (childCount11 > 0 || slotCount11 > 0) {
      pageRefCount += 1;
    }
    final QTreePageRef[] pageRefs = new QTreePageRef[pageRefCount];
    int pageRefOffset = 0;
    if (childCount00 > 0 || slotCount00 > 0) {
      if (childCount00 < childCount) {
        final QTreePageRef[] newChildRefs = new QTreePageRef[childCount00];
        System.arraycopy(childRefs00, 0, newChildRefs, 0, childCount00);
        childRefs00 = newChildRefs;
      }
      if (slotCount00 == 0) {
        slots00 = EMPTY_SLOTS;
      } else if (slotCount00 < slotCount) {
        final Slot[] newSlots = new Slot[slotCount00];
        System.arraycopy(slots00, 0, newSlots, 0, slotCount00);
        slots00 = newSlots;
      }
      if (childCount00 > 1 || childCount00 == 1 && slotCount00 > 0) {
        BitInterval.sort(childRefs00, PAGE_REF_ORDERING);
        BitInterval.sort(slots00, SLOT_ORDERING);
        pageRefs[pageRefOffset] = create(this.pageRef.context, this.pageRef.stem, newVersion,
                                         span00, x00, y00, Value.absent(), childRefs00, slots00).pageRef();
      } else if (slotCount00 == 0) {
        pageRefs[pageRefOffset] = childRefs00[0];
      } else {
        BitInterval.sort(slots00, SLOT_ORDERING);
        pageRefs[pageRefOffset] = QTreeLeaf.create(this.pageRef.context, this.pageRef.stem,
                                                   newVersion, Value.absent(), slots00).pageRef();
      }
      pageRefOffset += 1;
    }
    if (childCount01 > 0 || slotCount01 > 0) {
      if (childCount01 < childCount) {
        final QTreePageRef[] newChildRefs = new QTreePageRef[childCount01];
        System.arraycopy(childRefs01, 0, newChildRefs, 0, childCount01);
        childRefs01 = newChildRefs;
      }
      if (slotCount01 == 0) {
        slots01 = EMPTY_SLOTS;
      } else if (slotCount01 < slotCount) {
        final Slot[] newSlots = new Slot[slotCount01];
        System.arraycopy(slots01, 0, newSlots, 0, slotCount01);
        slots01 = newSlots;
      }
      if (childCount01 > 1 || childCount01 == 1 && slotCount01 > 0) {
        BitInterval.sort(childRefs01, PAGE_REF_ORDERING);
        BitInterval.sort(slots01, SLOT_ORDERING);
        pageRefs[pageRefOffset] = create(this.pageRef.context, this.pageRef.stem, newVersion,
                                         span01, x01, y01, Value.absent(), childRefs01, slots01).pageRef();
      } else if (slotCount01 == 0) {
        pageRefs[pageRefOffset] = childRefs01[0];
      } else {
        BitInterval.sort(slots01, SLOT_ORDERING);
        pageRefs[pageRefOffset] = QTreeLeaf.create(this.pageRef.context, this.pageRef.stem,
                                                   newVersion, Value.absent(), slots01).pageRef();
      }
      pageRefOffset += 1;
    }
    if (childCount10 > 0 || slotCount10 > 0) {
      if (childCount10 < childCount) {
        final QTreePageRef[] newChildRefs = new QTreePageRef[childCount10];
        System.arraycopy(childRefs10, 0, newChildRefs, 0, childCount10);
        childRefs10 = newChildRefs;
      }
      if (slotCount10 == 0) {
        slots10 = EMPTY_SLOTS;
      } else if (slotCount10 < slotCount) {
        final Slot[] newSlots = new Slot[slotCount10];
        System.arraycopy(slots10, 0, newSlots, 0, slotCount10);
        slots10 = newSlots;
      }
      if (childCount10 > 1 || childCount10 == 1 && slotCount10 > 0) {
        BitInterval.sort(childRefs10, PAGE_REF_ORDERING);
        BitInterval.sort(slots10, SLOT_ORDERING);
        pageRefs[pageRefOffset] = create(this.pageRef.context, this.pageRef.stem, newVersion,
                                         span10, x10, y10, Value.absent(), childRefs10, slots10).pageRef();
      } else if (slotCount10 == 0) {
        pageRefs[pageRefOffset] = childRefs10[0];
      } else {
        BitInterval.sort(slots10, SLOT_ORDERING);
        pageRefs[pageRefOffset] = QTreeLeaf.create(this.pageRef.context, this.pageRef.stem,
                                                   newVersion, Value.absent(), slots10).pageRef();
      }
      pageRefOffset += 1;
    }
    if (childCount11 > 0 || slotCount11 > 0) {
      if (childCount11 < childCount) {
        final QTreePageRef[] newChildRefs = new QTreePageRef[childCount11];
        System.arraycopy(childRefs11, 0, newChildRefs, 0, childCount11);
        childRefs11 = newChildRefs;
      }
      if (slotCount11 == 0) {
        slots11 = EMPTY_SLOTS;
      } else if (slotCount11 < slotCount) {
        final Slot[] newSlots = new Slot[slotCount11];
        System.arraycopy(slots11, 0, newSlots, 0, slotCount11);
        slots11 = newSlots;
      }
      if (childCount11 > 1 || childCount11 == 1 && slotCount11 > 0) {
        BitInterval.sort(childRefs11, PAGE_REF_ORDERING);
        BitInterval.sort(slots11, SLOT_ORDERING);
        pageRefs[pageRefOffset] = create(this.pageRef.context, this.pageRef.stem, newVersion,
                                         span11, x11, y11, Value.absent(), childRefs11, slots11).pageRef();
      } else if (slotCount11 == 0) {
        pageRefs[pageRefOffset] = childRefs11[0];
      } else {
        BitInterval.sort(slots11, SLOT_ORDERING);
        pageRefs[pageRefOffset] = QTreeLeaf.create(this.pageRef.context, this.pageRef.stem,
                                                   newVersion, Value.absent(), slots11).pageRef();
      }
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

    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  this.pageRef.span, Value.absent(), pageRefs, slotsXY);
  }

  @Override
  void memoizeSize(QTreePageRef pageRef) {
    int pageSize = 12; // "@qnode(stem:"
    pageSize += Recon.sizeOf(Num.from(this.pageRef.stem));
    pageSize += 3; // ",v:"
    pageSize += Recon.sizeOf(Num.from(this.version));
    pageSize += 1; // ')'

    final QTreePageRef[] childRefs = this.childRefs;
    final int childCount = childRefs.length;
    int diffSize = 0;
    long treeSize = 0L;
    if (childCount > 0) {
      pageSize += 1; // '{'
      for (int i = 0; i < childCount; i += 1) {
        if (i > 0) {
          pageSize += 1; // ','
        }
        final QTreePageRef childRef = childRefs[i];
        pageSize += childRef.pageRefSize();
        if (this.version == childRef.softVersion()) {
          diffSize += childRef.diffSize();
        }
        treeSize += childRef.treeSize();
      }
      final Slot[] slots = this.slots;
      for (int i = 0, slotCount = slots.length; i < slotCount; i += 1) {
        pageSize += 1; // ','
        pageSize += Recon.sizeOf(slots[i]);
      }
      pageSize += 1; // '}'
      pageSize += 1; // '\n'
    }
    diffSize += pageSize;
    treeSize += pageSize;

    pageRef.pageSize = pageSize; // Must match bytes written by writePage
    pageRef.diffSize = diffSize; // Must match bytes written by writeDiff
    pageRef.treeSize = treeSize;
  }

  @Override
  public Value toHeader() {
    final Record header = Record.create(2)
        .slot("stem", this.pageRef.stem)
        .slot("v", this.version);
    return Record.create(1).attr("qnode", header);
  }

  @Override
  public Value toValue() {
    final Record record = (Record) toHeader();
    final QTreePageRef[] childRefs = this.childRefs;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      record.add(childRefs[i].toValue());
    }
    return record;
  }

  @Override
  public QTreeNode reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                           CombinerFunction<Value, Value> combiner, long newVersion) {
    final QTreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length;
    final QTreePageRef[] newChildRefs = new QTreePageRef[n];
    for (int i = 0; i < n; i += 1) {
      newChildRefs[i] = oldChildRefs[i].reduced(identity, accumulator, combiner, newVersion);
    }
    // assert n > 0;
    Value fold = newChildRefs[0].fold();
    for (int i = 1; i < n; i += 1) {
      fold = combiner.combine(fold, newChildRefs[i].fold());
    }
    final Slot[] slots = this.slots;
    for (int i = 0, k = slots.length; i < k; i += 1) {
      fold = accumulator.combine(fold, slots[i].value());
    }
    return create(this.pageRef.context, this.pageRef.stem, newVersion,
                  this.pageRef.span, this.pageRef.x, this.pageRef.y,
                  fold, newChildRefs, slots);
  }

  @Override
  public QTreeNode evacuated(int post, long version) {
    final int oldPost = this.pageRef.post;
    if (oldPost != 0 && oldPost < post) {
      final QTreePageRef[] oldChildRefs = this.childRefs;
      final int n = oldChildRefs.length;
      final QTreePageRef[] newChildRefs = new QTreePageRef[n];
      for (int i = 0; i < n; i += 1) {
        final QTreePageRef oldChildRef = oldChildRefs[i];
        final QTreePageRef newChildRef = oldChildRef.evacuated(post, version);
        newChildRefs[i] = newChildRef;
        if (oldChildRef != newChildRef) {
          i += 1;
          if (i < n) {
            System.arraycopy(oldChildRefs, i, newChildRefs, i, n - i);
          }
          return create(this.pageRef.context, this.pageRef.stem, version,
                        this.pageRef.span, this.pageRef.x, this.pageRef.y,
                        this.pageRef.fold, newChildRefs, this.slots);
        }
      }
    }
    return this;
  }

  @Override
  public QTreeNode committed(int zone, long base, long version) {
    final QTreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length;
    final QTreePageRef[] newChildRefs = new QTreePageRef[n];

    long step = base;
    for (int i = 0; i < n; i += 1) {
      final QTreePageRef oldChildRef = oldChildRefs[i];
      if (!oldChildRef.isCommitted()) {
        final QTreePageRef newChildRef = oldChildRef.committed(zone, step, version);
        newChildRefs[i] = newChildRef;
        step += newChildRef.diffSize();
      } else {
        newChildRefs[i] = oldChildRef;
      }
    }

    return create(this.pageRef.context, this.pageRef.stem, version, zone, step,
                  this.pageRef.span, this.pageRef.x, this.pageRef.y,
                  this.pageRef.fold, newChildRefs, this.slots);
  }

  @Override
  public QTreeNode uncommitted(long version) {
    final QTreePageRef[] oldChildRefs = this.childRefs;
    final int n = oldChildRefs.length;
    final QTreePageRef[] newChildRefs = new QTreePageRef[n];
    for (int i = 0; i < n; i += 1) {
      newChildRefs[i] = oldChildRefs[i].uncommitted(version);
    }
    return create(this.pageRef.context, this.pageRef.stem, version, this.pageRef.span,
                  this.pageRef.x, this.pageRef.y, this.pageRef.fold, newChildRefs, this.slots);
  }

  @Override
  public void writePage(Output<?> output) {
    Recon.write(toHeader(), output);
    writePageContent(output);
    output.write('\n');
  }

  void writePageContent(Output<?> output) {
    final QTreePageRef[] childRefs = this.childRefs;
    final int childCount = childRefs.length;
    if (childCount > 0) {
      output.write('{');
      for (int i = 0; i < childCount; i += 1) {
        if (i > 0) {
          output.write(',');
        }
        childRefs[i].writePageRef(output);
      }
      final Slot[] slots = this.slots;
      for (int i = 0, slotCount = slots.length; i < slotCount; i += 1) {
        output.write(',');
        Recon.write(slots[i], output);
      }
      output.write('}');
    }
  }

  @Override
  public void writeDiff(Output<?> output) {
    final QTreePageRef[] childRefs = this.childRefs;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      final QTreePageRef childRef = childRefs[i];
      if (this.version == childRef.softVersion()) {
        childRef.writeDiff(output);
      }
    }
    writePage(output);
  }

  @Override
  public void loadTreeAsync(PageLoader pageLoader, Cont<Page> cont) {
    try {
      final QTreePageRef[] childRefs = this.childRefs;
      if (childRefs.length > 0) {
        childRefs[0].loadTreeAsync(pageLoader, new LoadSubtree(pageLoader, this, 1, cont));
      } else {
        // Call continuation on fresh stack
        this.pageRef.context.stage().execute(Conts.async(cont, this));
      }
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void soften(long version) {
    final QTreePageRef[] childRefs = this.childRefs;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      childRefs[i].soften(version);
    }
  }

  @Override
  public Cursor<Slot> cursor(long x, long y) {
    return new QTreeNodeDepthCursor(this, x, y, Integer.MAX_VALUE);
  }

  @Override
  public Cursor<Slot> depthCursor(long x, long y, int maxDepth) {
    return new QTreeNodeDepthCursor(this, x, y, maxDepth);
  }

  @Override
  public Cursor<Slot> deltaCursor(long x, long y, long sinceVersion) {
    return new QTreeNodeDeltaCursor(this, x, y, sinceVersion);
  }

  @Override
  public Cursor<Slot> tileCursor(long x, long y) {
    return new QTreeNodeTileCursor(this, x, y);
  }

  @Override
  public String toString() {
    final Output<String> output = Unicode.stringOutput(pageSize() - 1); // ignore trailing '\n'
    Recon.write(toHeader(), output);
    writePageContent(output);
    return output.bind();
  }

  public static QTreeNode create(PageContext context, int stem, long version,
                                 int post, int zone, long base, long span, long x, long y,
                                 Value fold, QTreePageRef[] childRefs, Slot[] slots) {
    final QTreePageRef pageRef = new QTreePageRef(context, PageType.NODE, stem, post,
                                                  zone, base, span, x, y, fold);
    final QTreeNode page = new QTreeNode(pageRef, version, childRefs, slots);
    pageRef.page = page;
    return page;
  }


  public static QTreeNode create(PageContext context, int stem, long version,
                                 int zone, long base, long span, long x, long y,
                                 Value fold, QTreePageRef[] childRefs, Slot[] slots) {
    int post = zone;
    for (int i = 0, n = childRefs.length; i < n; i += 1) {
      final int childPost = childRefs[i].post;
      if (childPost != 0) {
        post = post == 0 ? childPost : Math.min(post, childPost);
      }
    }
    return create(context, stem, version, post, zone, base, span, x, y, fold, childRefs, slots);
  }

  public static QTreeNode create(PageContext context, int stem, long version, long span,
                                 long x, long y, Value fold, QTreePageRef[] childRefs, Slot[] slots) {
    return create(context, stem, version, 0, 0L, span, x, y, fold, childRefs, slots);
  }

  public static QTreeNode create(PageContext context, int stem, long version, long span,
                                 Value fold, QTreePageRef[] childRefs, Slot[] slots) {
    int xRank = 0;
    int yRank = 0;
    long xBase = 0L;
    long yBase = 0L;
    long xMask = -1L;
    long yMask = -1L;
    int post = 0;
    for (int i = 0, childCount = childRefs.length; i < childCount; i += 1) {
      final QTreePageRef childRef = childRefs[i];
      final long cx = childRef.x;
      final long cy = childRef.y;
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
      final int childPost = childRef.post;
      if (childPost != 0) {
        post = post == 0 ? childPost : Math.min(post, childPost);
      }
    }
    for (int i = 0, slotCount = slots.length; i < slotCount; i += 1) {
      final Value tile = slots[i].toValue().header("tile");
      final long tx = tile.getItem(0).longValue();
      final long ty = tile.getItem(1).longValue();
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
    return create(context, stem, version, post, 0, 0L, span, x, y, fold, childRefs, slots);
  }

  public static QTreeNode fromValue(QTreePageRef pageRef, Value value) {
    Throwable cause = null;
    try {
      final Value header = value.header("qnode");
      final long version = header.get("v").longValue();
      final Record tail = value.tail();
      final int n = tail.size();
      QTreePageRef[] childRefs = new QTreePageRef[n];
      Slot[] slots = null;
      int childCount = 0;
      int slotCount = 0;
      for (int i = 0; i < n; i += 1) {
        final Item item = tail.get(i);
        if (item instanceof Slot) {
          if (slots == null) {
            slots = new Slot[n];
          }
          slots[slotCount] = (Slot) item;
          slotCount += 1;
        } else {
          childRefs[childCount] = QTreePageRef.fromValue(pageRef.context, pageRef.stem, item.toValue());
          childCount += 1;
        }
      }
      if (childCount < n) {
        final QTreePageRef[] newChildRefs = new QTreePageRef[childCount];
        System.arraycopy(childRefs, 0, newChildRefs, 0, childCount);
        childRefs = newChildRefs;
      }
      if (slotCount == 0) {
        slots = EMPTY_SLOTS;
      } else if (slotCount < n) {
        final Slot[] newSlots = new Slot[slotCount];
        System.arraycopy(slots, 0, newSlots, 0, slotCount);
        slots = newSlots;
      }
      return new QTreeNode(pageRef, version, childRefs, slots);
    } catch (Throwable error) {
      if (Conts.isNonFatal(error)) {
        cause = error;
      } else {
        throw error;
      }
    }
    final Output<String> message = Unicode.stringOutput("Malformed qnode: ");
    Recon.write(value, message);
    throw new StoreException(message.bind(), cause);
  }
}
