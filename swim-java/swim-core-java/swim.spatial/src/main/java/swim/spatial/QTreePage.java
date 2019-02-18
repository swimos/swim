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

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import swim.util.Cursor;

public abstract class QTreePage<K, S, V> {
  QTreePage() {
    // stub
  }

  public abstract boolean isEmpty();

  public abstract long span();

  public abstract int arity();

  public abstract QTreePage<K, S, V> getPage(int index);

  public abstract int slotCount();

  public abstract QTreeEntry<K, S, V> getSlot(int index);

  public abstract long x();

  public abstract int xRank();

  public abstract long xBase();

  public abstract long xMask();

  public abstract long xSplit();

  public abstract long y();

  public abstract int yRank();

  public abstract long yBase();

  public abstract long yMask();

  public abstract long ySplit();

  public abstract boolean containsKey(K key, long xk, long yk, QTreeContext<K, S, V> tree);

  public boolean containsKey(K key, int xkRank, long xkBase, int ykRank, long ykBase, QTreeContext<K, S, V> tree) {
    final long x = BitInterval.from(xkRank, xkBase);
    final long y = BitInterval.from(ykRank, ykBase);
    return containsKey(key, x, y, tree);
  }

  public abstract V get(K key, long xk, long yk, QTreeContext<K, S, V> tree);

  public V get(K key, int xkRank, long xkBase, int ykRank, long ykBase, QTreeContext<K, S, V> tree) {
    final long x = BitInterval.from(xkRank, xkBase);
    final long y = BitInterval.from(ykRank, ykBase);
    return get(key, x, y, tree);
  }

  public Collection<QTreeEntry<K, S, V>> getAll(long x, long y) {
    final Collection<QTreeEntry<K, S, V>> slots = new ArrayList<QTreeEntry<K, S, V>>();
    final Cursor<QTreeEntry<K, S, V>> cursor = cursor(x, y);
    while (cursor.hasNext()) {
      slots.add(cursor.next());
    }
    return slots;
  }

  public Collection<QTreeEntry<K, S, V>> getAll(long x0, long y0, long x1, long y1) {
    final long x = BitInterval.span(x0, x1);
    final long y = BitInterval.span(y0, y1);
    return getAll(x, y);
  }

  abstract QTreePage<K, S, V> updated(K key, S shape, long xk, long yk, V newValue,
                                      QTreeContext<K, S, V> tree, boolean canSplit);

  public QTreePage<K, S, V> updated(K key, S shape, long xk, long yk, V newValue, QTreeContext<K, S, V> tree) {
    return updated(key, shape, xk, yk, newValue, tree, true);
  }

  public QTreePage<K, S, V> updated(K key, S shape, int xkRank, long xkBase,
                                    int ykRank, long ykBase, V newValue, QTreeContext<K, S, V> tree) {
    final long xk = BitInterval.from(xkRank, xkBase);
    final long yk = BitInterval.from(ykRank, ykBase);
    return updated(key, shape, xk, yk, newValue, tree);
  }

  abstract QTreePage<K, S, V> insertedPage(QTreePage<K, S, V> newPage, QTreeContext<K, S, V> tree);

  abstract QTreePage<K, S, V> mergedPage(QTreePage<K, S, V> newPage, QTreeContext<K, S, V> tree);

  abstract QTreePage<K, S, V> mergedSlots(QTreeEntry<K, S, V>[] midSlots, QTreeContext<K, S, V> tree);

  abstract QTreePage<K, S, V> updatedSlot(QTreeEntry<K, S, V> newSlot, QTreeContext<K, S, V> tree);

  public abstract QTreePage<K, S, V> removed(K key, long xk, long yk, QTreeContext<K, S, V> tree);

  public QTreePage<K, S, V> removed(K key, int xkRank, long xkBase, int ykRank, long ykBase, QTreeContext<K, S, V> tree) {
    final long xk = BitInterval.from(xkRank, xkBase);
    final long yk = BitInterval.from(ykRank, ykBase);
    return removed(key, xk, yk, tree);
  }

  public abstract QTreePage<K, S, V> flattened(QTreeContext<K, S, V> tree);

  public abstract QTreePage<K, S, V> balanced(QTreeContext<K, S, V> tree);

  // Always returns QTreeNode, but we don't want to publicly expose it.
  public abstract QTreePage<K, S, V> split(QTreeContext<K, S, V> tree);

  public abstract Cursor<QTreeEntry<K, S, V>> cursor(long x, long y);

  public Cursor<QTreeEntry<K, S, V>> cursor(long x0, long y0, long x1, long y1) {
    final long x = BitInterval.span(x0, x1);
    final long y = BitInterval.span(y0, y1);
    return cursor(x, y);
  }

  public Cursor<QTreeEntry<K, S, V>> cursor() {
    return cursor(-1L, -1L);
  }

  static final QTreePage<?, ?, ?>[] EMPTY_PAGES = new QTreePage<?, ?, ?>[0];

  static final QTreeEntry<?, ?, ?>[] EMPTY_SLOTS = new QTreeEntry<?, ?, ?>[0];

  static final Comparator<QTreePage<?, ?, ?>> PAGE_ORDERING = new QTreePageOrdering();

  public static <K, S, V> QTreePage<K, S, V> empty() {
    return QTreeLeaf.empty();
  }
}

final class QTreePageOrdering implements Comparator<QTreePage<?, ?, ?>> {
  @Override
  public int compare(QTreePage<?, ?, ?> a, QTreePage<?, ?, ?> b) {
    return BitInterval.compare(a.x(), a.y(), b.x(), b.y());
  }
}
