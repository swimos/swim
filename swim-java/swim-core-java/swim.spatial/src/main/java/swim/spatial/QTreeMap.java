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

import java.util.Comparator;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.math.Z2Form;
import swim.util.Cursor;
import swim.util.Murmur3;

public class QTreeMap<K, S, V> extends QTreeContext<K, S, V> implements SpatialMap<K, S, V>, Comparator<QTreeEntry<K, S, V>>, Cloneable, Debug {
  final Z2Form<S> shapeForm;
  volatile QTreePage<K, S, V> root;

  protected QTreeMap(Z2Form<S> shapeForm, QTreePage<K, S, V> root) {
    this.shapeForm = shapeForm;
    this.root = root;
  }

  public QTreeMap(Z2Form<S> shapeForm) {
    this(shapeForm, QTreePage.<K, S, V>empty());
  }

  public Z2Form<S> shapeForm() {
    return this.shapeForm;
  }

  @Override
  public boolean isEmpty() {
    return this.root.isEmpty();
  }

  @Override
  public int size() {
    return (int) this.root.span();
  }

  @Override
  public boolean containsKey(K key, S shape) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    return this.root.containsKey(key, x, y, this);
  }

  @Override
  public boolean containsKey(Object key) {
    final Cursor<QTreeEntry<K, S, V>> cursor = this.root.cursor();
    while (cursor.hasNext()) {
      if (key.equals(cursor.next().key)) {
        return true;
      }
    }
    return false;
  }

  @Override
  public boolean containsValue(Object value) {
    final Cursor<QTreeEntry<K, S, V>> cursor = this.root.cursor();
    while (cursor.hasNext()) {
      if (value.equals(cursor.next().value)) {
        return true;
      }
    }
    return false;
  }

  @Override
  public V get(K key, S shape) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    return this.root.get(key, x, y, this);
  }

  @Override
  public V get(Object key) {
    final Cursor<QTreeEntry<K, S, V>> cursor = this.root.cursor();
    while (cursor.hasNext()) {
      final QTreeEntry<K, S, V> slot = cursor.next();
      if (key.equals(slot.key)) {
        return slot.value;
      }
    }
    return null;
  }

  @Override
  public V put(K key, S shape, V newValue) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    do {
      final QTreePage<K, S, V> oldRoot = this.root;
      final QTreePage<K, S, V> newRoot = oldRoot.updated(key, shape, x, y, newValue, this)
          .balanced(this);
      if (oldRoot != newRoot) {
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          return oldRoot.get(key, x, y, this);
        }
      } else {
        return null;
      }
    } while (true);
  }

  @Override
  public V move(K key, S oldShape, S newShape, V newValue) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long oldX = BitInterval.span(shapeForm.getXMin(oldShape), shapeForm.getXMax(oldShape));
    final long oldY = BitInterval.span(shapeForm.getYMin(oldShape), shapeForm.getYMax(oldShape));
    final long newX = BitInterval.span(shapeForm.getXMin(newShape), shapeForm.getXMax(newShape));
    final long newY = BitInterval.span(shapeForm.getYMin(newShape), shapeForm.getYMax(newShape));
    do {
      final QTreePage<K, S, V> oldRoot = this.root;
      final QTreePage<K, S, V> newRoot = oldRoot.removed(key, oldX, oldY, this)
          .balanced(this)
          .updated(key, newShape, newX, newY, newValue, this)
          .balanced(this);
      if (oldRoot != newRoot) {
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          return oldRoot.get(key, oldX, oldY, this);
        }
      } else {
        return null;
      }
    } while (true);
  }

  @Override
  public V remove(K key, S shape) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    do {
      final QTreePage<K, S, V> oldRoot = this.root;
      final QTreePage<K, S, V> newRoot = oldRoot.removed(key, x, y, this)
          .balanced(this);
      if (oldRoot != newRoot) {
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          return oldRoot.get(key, x, y, this);
        }
      } else {
        return null;
      }
    } while (true);
  }

  @Override
  public void clear() {
    this.root = QTreePage.empty();
  }

  public QTreeMap<K, S, V> updated(K key, S shape, V newValue) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    final QTreePage<K, S, V> oldRoot = this.root;
    QTreePage<K, S, V> newRoot = oldRoot.updated(key, shape, x, y, newValue, this);
    if (oldRoot != newRoot) {
      if (newRoot.span() > oldRoot.span()) {
        newRoot = newRoot.balanced(this);
      }
      return copy(newRoot);
    } else {
      return this;
    }
  }

  public QTreeMap<K, S, V> removed(K key, S shape) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    final QTreePage<K, S, V> oldRoot = this.root;
    QTreePage<K, S, V> newRoot = oldRoot.removed(key, x, y, this);
    if (oldRoot != newRoot) {
      newRoot = newRoot.balanced(this);
      return copy(newRoot);
    } else {
      return this;
    }
  }

  @Override
  public Cursor<Entry<K, S, V>> iterator(S shape) {
    final Z2Form<S> shapeForm = this.shapeForm;
    final long x = BitInterval.span(shapeForm.getXMin(shape), shapeForm.getXMax(shape));
    final long y = BitInterval.span(shapeForm.getYMin(shape), shapeForm.getYMax(shape));
    return new QTreeShapeCursor<K, S, V>(this.root.cursor(x, y), shapeForm, shape);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Cursor<Entry<K, S, V>> iterator() {
    return (Cursor<Entry<K, S, V>>) (Cursor<?>) this.root.cursor();
  }

  @Override
  public Cursor<K> keyIterator() {
    return Cursor.keys(this.root.cursor());
  }

  @Override
  public Cursor<V> valueIterator() {
    return Cursor.values(this.root.cursor());
  }

  public SpatialMap<K, S, V> snapshot() {
    return new QTree<K, S, V>(this.shapeForm, this.root);
  }

  @Override
  public QTreeMap<K, S, V> clone() {
    return copy(this.root);
  }

  protected QTreeMap<K, S, V> copy(QTreePage<K, S, V> root) {
    return new QTreeMap<K, S, V>(this.shapeForm, root);
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof QTreeMap<?, ?, ?>) {
      final QTreeMap<K, S, V> that = (QTreeMap<K, S, V>) other;
      if (size() == that.size()) {
        final Cursor<Entry<K, S, V>> those = that.iterator();
        while (those.hasNext()) {
          final Entry<K, S, V> entry = those.next();
          final V value = get(entry.getKey());
          final V v = entry.getValue();
          if (value == null ? v != null : !value.equals(v)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(QTree.class);
    }
    int a = 0;
    int b = 0;
    int c = 1;
    final Cursor<Entry<K, S, V>> these = iterator();
    while (these.hasNext()) {
      final Entry<K, S, V> entry = these.next();
      final int h = Murmur3.mix(Murmur3.hash(entry.getKey()), Murmur3.hash(entry.getValue()));
      a ^= h;
      b += h;
      if (h != 0) {
        c *= h;
      }
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed, a), b), c));
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("QTree").write('.').write("empty").write('(')
        .debug(this.shapeForm).write(')');
    for (Entry<K, S, V> entry : this) {
      output = output.write('.').write("updated").write('(')
          .debug(entry.getKey()).write(", ")
          .debug(entry.getShape()).write(", ")
          .debug(entry.getValue()).write(')');
    }
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static int hashSeed;

  @SuppressWarnings("rawtypes")
  public static <K, S, V> QTreeMap<K, S, V> empty(Z2Form<S> shapeForm) {
    return new QTreeMap<K, S, V>(shapeForm);
  }

  @SuppressWarnings("rawtypes")
  static final AtomicReferenceFieldUpdater<QTreeMap, QTreePage> ROOT =
      AtomicReferenceFieldUpdater.newUpdater(QTreeMap.class, QTreePage.class, "root");
}
