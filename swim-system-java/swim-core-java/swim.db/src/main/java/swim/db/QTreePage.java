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

import java.util.Comparator;
import swim.spatial.BitInterval;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import swim.util.CombinerFunction;
import swim.util.Cursor;

public abstract class QTreePage extends Page {
  @Override
  public boolean isQTreePage() {
    return true;
  }

  @Override
  public abstract QTreePageRef pageRef();

  @Override
  public abstract QTreePageRef getChildRef(int index);

  @Override
  public abstract QTreePage getChild(int index);

  public long x() {
    return pageRef().x();
  }

  public int xRank() {
    return pageRef().xRank();
  }

  public long xBase() {
    return pageRef().xBase();
  }

  public long xMask() {
    return pageRef().xMask();
  }

  public long xSplit() {
    return pageRef().xSplit();
  }

  public long y() {
    return pageRef().y();
  }

  public int yRank() {
    return pageRef().yRank();
  }

  public long yBase() {
    return pageRef().yBase();
  }

  public long yMask() {
    return pageRef().yMask();
  }

  public long ySplit() {
    return pageRef().ySplit();
  }

  public abstract int slotCount();

  public abstract Slot getSlot(int index);

  public abstract boolean containsKey(Value key, long xk, long yk);

  public boolean containsKey(Value key, int xkRank, long xkBase, int ykRank, long ykBase) {
    return containsKey(key, BitInterval.from(xkRank, xkBase), BitInterval.from(ykRank, ykBase));
  }

  public abstract Value get(Value key, long xk, long yk);

  public Value get(Value key, int xkRank, long xkBase, int ykRank, long ykBase) {
    return get(key, BitInterval.from(xkRank, xkBase), BitInterval.from(ykRank, ykBase));
  }

  public Record getAll(long x, long y) {
    final Record record = Record.of();
    final Cursor<Slot> cursor = cursor(x, y);
    while (cursor.hasNext()) {
      record.add(cursor.next());
    }
    return record;
  }

  public Record getAll(long x0, long y0, long x1, long y1) {
    final long x = BitInterval.span(x0, x1);
    final long y = BitInterval.span(y0, y1);
    return getAll(x, y);
  }

  abstract QTreePage updated(Value key, long xk, long yk, Value newValue,
                             long newVersion, boolean canSplit);

  public QTreePage updated(Value key, long xk, long yk, Value newValue, long newVersion) {
    return updated(key, xk, yk, newValue, newVersion, true);
  }

  public QTreePage updated(Value key, int xkRank, long xkBase, int ykRank, long ykBase,
                           Value newValue, long newVersion) {
    final long xk = BitInterval.from(xkRank, xkBase);
    final long yk = BitInterval.from(ykRank, ykBase);
    return updated(key, xk, yk, newValue, newVersion);
  }

  abstract QTreePage insertedPageRef(QTreePageRef newPageRef, long newVersion);

  abstract QTreePage mergedPage(QTreePage newPage, long newVersion);

  abstract QTreePage mergedSlots(Slot[] subSlots, long newVersion);

  abstract QTreePage updatedSlot(Slot newSlot, long newVersion);

  public abstract QTreePage removed(Value key, long xk, long yk, long newVersion);

  public QTreePage removed(Value key, int xkRank, long xkBase,
                           int ykRank, long ykBase, long newVersion) {
    final long xk = BitInterval.from(xkRank, xkBase);
    final long yk = BitInterval.from(ykRank, ykBase);
    return removed(key, xk, yk, newVersion);
  }

  public abstract QTreePage flattened(long newVersion);

  public abstract QTreePage balanced(long newVersion);

  abstract QTreeNode split(long newVersion);

  public abstract QTreePage reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                                    CombinerFunction<Value, Value> combiner, long newVersion);

  @Override
  public abstract QTreePage evacuated(int post, long version);

  @Override
  public abstract QTreePage committed(int zone, long base, long version);

  @Override
  public abstract QTreePage uncommitted(long version);

  abstract void memoizeSize(QTreePageRef pageRef);

  @Override
  public Cursor<Slot> cursor() {
    return cursor(-1L, -1L);
  }

  public abstract Cursor<Slot> cursor(long x, long y);

  public abstract Cursor<Slot> depthCursor(long x, long y, int maxDepth);

  public Cursor<Slot> depthCursor(int maxDepth) {
    return depthCursor(-1L, -1L, maxDepth);
  }

  public abstract Cursor<Slot> deltaCursor(long x, long y, long sinceVersion);

  public Cursor<Slot> deltaCursor(long sinceVersion) {
    return deltaCursor(-1L, -1L, sinceVersion);
  }

  public abstract Cursor<Slot> tileCursor(long x, long y);

  public Cursor<Slot> tileCursor() {
    return tileCursor(-1L, -1L);
  }

  static final QTreePageRef[] EMPTY_CHILD_REFS = new QTreePageRef[0];

  static final Slot[] EMPTY_SLOTS = new Slot[0];

  static final Comparator<QTreePageRef> PAGE_REF_ORDERING = new QTreePageRefOrdering();

  static final Comparator<Slot> SLOT_ORDERING = new QTreeSlotOrdering();

  public static QTreePage empty(PageContext context, int stem, long version) {
    return QTreeLeaf.empty(context, stem, version);
  }

  public static QTreePage fromValue(QTreePageRef pageRef, Value value) {
    switch (pageRef.pageType()) {
      case LEAF: return QTreeLeaf.fromValue(pageRef, value);
      case NODE: return QTreeNode.fromValue(pageRef, value);
      default: throw new IllegalArgumentException(pageRef.toString());
    }
  }

  static Slot slot(Value key, long xk, long yk, Value value) {
    return Slot.of(key, Record.create(2)
        .attr("tile", Record.create(2)
            .item(Num.uint64(xk))
            .item(Num.uint64(yk)))
        .concat(value))
        .commit();
  }
}

final class QTreePageRefOrdering implements Comparator<QTreePageRef> {
  @Override
  public int compare(QTreePageRef a, QTreePageRef b) {
    return BitInterval.compare(a.x, a.y, b.x, b.y);
  }
}

final class QTreeSlotOrdering implements Comparator<Slot> {
  @Override
  public int compare(Slot a, Slot b) {
    return a.key().compareTo(b.key());
  }
}
