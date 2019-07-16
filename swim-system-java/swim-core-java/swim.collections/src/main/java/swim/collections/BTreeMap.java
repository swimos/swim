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

package swim.collections;

import java.util.Comparator;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.CombinerFunction;
import swim.util.Cursor;
import swim.util.OrderedMapCursor;
import swim.util.ReducedMap;

/**
 * Mutable, thread-safe {@link Map} backed by a B-tree.
 */
public class BTreeMap<K, V, U> extends BTreeContext<K, V> implements ReducedMap<K, V, U>, Cloneable, Debug {
  volatile BTreePage<K, V, U> root;

  protected BTreeMap(BTreePage<K, V, U> root) {
    this.root = root;
  }

  public BTreeMap() {
    this(BTreePage.<K, V, U>empty());
  }

  @Override
  public boolean isEmpty() {
    return this.root.isEmpty();
  }

  @Override
  public int size() {
    return this.root.size();
  }

  @Override
  public boolean containsKey(Object key) {
    return this.root.containsKey(key, this);
  }

  @Override
  public boolean containsValue(Object value) {
    return this.root.containsValue(value);
  }

  @Override
  public int indexOf(Object key) {
    return this.root.indexOf(key, this);
  }

  @Override
  public V get(Object key) {
    return this.root.get(key, this);
  }

  @Override
  public Entry<K, V> getEntry(Object key) {
    return this.root.getEntry(key, this);
  }

  @Override
  public Entry<K, V> getIndex(int index) {
    return this.root.getIndex(index);
  }

  @Override
  public Entry<K, V> firstEntry() {
    return this.root.firstEntry();
  }

  @Override
  public K firstKey() {
    final Entry<K, V> entry = this.root.firstEntry();
    if (entry != null) {
      return entry.getKey();
    } else {
      return null;
    }
  }

  @Override
  public V firstValue() {
    final Entry<K, V> entry = this.root.firstEntry();
    if (entry != null) {
      return entry.getValue();
    } else {
      return null;
    }
  }

  @Override
  public Entry<K, V> lastEntry() {
    return this.root.lastEntry();
  }

  @Override
  public K lastKey() {
    final Entry<K, V> entry = this.root.lastEntry();
    if (entry != null) {
      return entry.getKey();
    } else {
      return null;
    }
  }

  @Override
  public V lastValue() {
    final Entry<K, V> entry = this.root.lastEntry();
    if (entry != null) {
      return entry.getValue();
    } else {
      return null;
    }
  }

  @Override
  public Entry<K, V> nextEntry(K key) {
    return this.root.nextEntry(key, this);
  }

  @Override
  public K nextKey(K key) {
    final Entry<K, V> entry = this.root.nextEntry(key, this);
    if (entry != null) {
      return entry.getKey();
    } else {
      return null;
    }
  }

  @Override
  public V nextValue(K key) {
    final Entry<K, V> entry = this.root.nextEntry(key, this);
    if (entry != null) {
      return entry.getValue();
    } else {
      return null;
    }
  }

  @Override
  public Entry<K, V> previousEntry(K key) {
    return this.root.previousEntry(key, this);
  }

  @Override
  public K previousKey(K key) {
    final Entry<K, V> entry = this.root.previousEntry(key, this);
    if (entry != null) {
      return entry.getKey();
    } else {
      return null;
    }
  }

  @Override
  public V previousValue(K key) {
    final Entry<K, V> entry = this.root.previousEntry(key, this);
    if (entry != null) {
      return entry.getValue();
    } else {
      return null;
    }
  }

  @Override
  public V put(K key, V newValue) {
    BTreePage<K, V, U> oldRoot;
    do {
      oldRoot = this.root;
      BTreePage<K, V, U> newRoot = oldRoot.updated(key, newValue, this);
      if (oldRoot != newRoot) {
        if (newRoot.size() > oldRoot.size()) {
          newRoot = newRoot.balanced(this);
        }
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    return oldRoot.get(key, this);
  }

  @Override
  public void putAll(Map<? extends K, ? extends V> map) {
    for (Entry<? extends K, ? extends V> entry : map.entrySet()) {
      put(entry.getKey(), entry.getValue());
    }
  }

  @Override
  public V remove(Object key) {
    do {
      final BTreePage<K, V, U> oldRoot = this.root;
      final BTreePage<K, V, U> newRoot = oldRoot.removed(key, this).balanced(this);
      if (oldRoot != newRoot) {
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          return oldRoot.get(key, this);
        }
      } else {
        return null;
      }
    } while (true);
  }

  public BTreeMap<K, V, U> drop(int lower) {
    do {
      final BTreePage<K, V, U> oldRoot = this.root;
      if (lower > 0 && oldRoot.size() > 0) {
        final BTreePage<K, V, U> newRoot;
        if (lower < oldRoot.size()) {
          newRoot = oldRoot.drop(lower, this).balanced(this);
        } else {
          newRoot = BTreePage.empty();
        }
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    return this;
  }

  public BTreeMap<K, V, U> take(int upper) {
    do {
      final BTreePage<K, V, U> oldRoot = this.root;
      if (upper < oldRoot.size() && oldRoot.size() > 0) {
        final BTreePage<K, V, U> newRoot;
        if (upper > 0) {
          newRoot = oldRoot.take(upper, this).balanced(this);
        } else {
          newRoot = BTreePage.<K, V, U>empty();
        }
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    return this;
  }

  @Override
  public void clear() {
    do {
      final BTreePage<K, V, U> oldRoot = this.root;
      final BTreePage<K, V, U> newRoot = BTreePage.empty();
      if (oldRoot != newRoot) {
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  public BTreeMap<K, V, U> updated(K key, V newValue) {
    final BTreePage<K, V, U> oldRoot = this.root;
    BTreePage<K, V, U> newRoot = oldRoot.updated(key, newValue, this);
    if (newRoot.size() > oldRoot.size()) {
      newRoot = newRoot.balanced(this);
    }
    return copy(newRoot);
  }

  public BTreeMap<K, V, U> removed(K key) {
    return copy(this.root.removed(key, this).balanced(this));
  }

  public BTreeMap<K, V, U> cleared() {
    return copy(BTreePage.empty());
  }

  @Override
  public U reduced(U identity, CombinerFunction<? super V, U> accumulator, CombinerFunction<U, U> combiner) {
    BTreePage<K, V, U> newRoot;
    do {
      final BTreePage<K, V, U> oldRoot = this.root;
      newRoot = oldRoot.reduced(identity, accumulator, combiner);
      if (oldRoot != newRoot) {
        if (ROOT.compareAndSet(this, oldRoot, newRoot)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    return newRoot.fold();
  }

  /**
   * An immutable copy of this {@code BTreeMap}'s data.
   */
  public BTree<K, V> snapshot() {
    return new BTree<K, V>(this.root);
  }

  @Override
  public OrderedMapCursor<K, V> iterator() {
    return this.root.iterator();
  }

  public Cursor<K> keyIterator() {
    return this.root.keyIterator();
  }

  public Cursor<V> valueIterator() {
    return this.root.valueIterator();
  }

  public OrderedMapCursor<K, V> lastIterator() {
    return this.root.lastIterator();
  }

  public Cursor<K> lastKeyIterator() {
    return this.root.lastKeyIterator();
  }

  public Cursor<V> lastValueIterator() {
    return this.root.lastValueIterator();
  }

  @Override
  public BTreeMap<K, V, U> clone() {
    return copy(this.root);
  }

  protected BTreeMap<K, V, U> copy(BTreePage<K, V, U> root) {
    return new BTreeMap<K, V, U>(root);
  }

  @Override
  public Comparator<? super K> comparator() {
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map<?, ?>) {
      final Map<K, V> that = (Map<K, V>) other;
      if (size() == that.size()) {
        final Iterator<Entry<K, V>> those = that.entrySet().iterator();
        while (those.hasNext()) {
          final Entry<K, V> entry = those.next();
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
    int code = 0;
    final Cursor<Entry<K, V>> these = iterator();
    while (these.hasNext()) {
      code += these.next().hashCode();
    }
    return code;
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("BTreeMap").write('.');
    final Cursor<Entry<K, V>> these = iterator();
    if (these.hasNext()) {
      Entry<K, V> entry = these.next();
      output = output.write("of").write('(')
          .debug(entry.getKey()).write(", ").debug(entry.getValue());
      while (these.hasNext()) {
        entry = these.next();
        output = output.write(')').write('.').write("updated").write('(')
            .debug(entry.getKey()).write(", ").debug(entry.getValue());
      }
    } else {
      output = output.write("empty").write('(');
    }
    output = output.write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  public static <K, V, U> BTreeMap<K, V, U> empty() {
    return new BTreeMap<K, V, U>();
  }

  public static <K, V, U> BTreeMap<K, V, U> of(K key, V value) {
    final BTreeMap<K, V, U> tree = new BTreeMap<K, V, U>();
    tree.put(key, value);
    return tree;
  }

  public static <K, V, U> BTreeMap<K, V, U> from(Map<? extends K, ? extends V> map) {
    final BTreeMap<K, V, U> tree = new BTreeMap<K, V, U>();
    for (Entry<? extends K, ? extends V> entry : map.entrySet()) {
      tree.put(entry.getKey(), entry.getValue());
    }
    return tree;
  }

  @SuppressWarnings("rawtypes")
  static final AtomicReferenceFieldUpdater<BTreeMap, BTreePage> ROOT =
      AtomicReferenceFieldUpdater.newUpdater(BTreeMap.class, BTreePage.class, "root");
}
