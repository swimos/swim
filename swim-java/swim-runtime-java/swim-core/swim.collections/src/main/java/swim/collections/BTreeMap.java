// Copyright 2015-2022 Swim.inc
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

  @SuppressWarnings("unchecked")
  final BTreePage<K, V, U> root() {
    return BTreeMap.ROOT.get(this);
  }

  @Override
  public boolean isEmpty() {
    final BTreePage<K, V, U> root = this.root();
    return root.isEmpty();
  }

  @Override
  public int size() {
    final BTreePage<K, V, U> root = this.root();
    return root.size();
  }

  @Override
  public boolean containsKey(Object key) {
    final BTreePage<K, V, U> root = this.root();
    return root.containsKey(key, this);
  }

  @Override
  public boolean containsValue(Object value) {
    final BTreePage<K, V, U> root = this.root();
    return root.containsValue(value);
  }

  @Override
  public int indexOf(Object key) {
    final BTreePage<K, V, U> root = this.root();
    return root.indexOf(key, this);
  }

  @Override
  public V get(Object key) {
    final BTreePage<K, V, U> root = this.root();
    return root.get(key, this);
  }

  @Override
  public Map.Entry<K, V> getEntry(Object key) {
    final BTreePage<K, V, U> root = this.root();
    return root.getEntry(key, this);
  }

  @Override
  public Map.Entry<K, V> getIndex(int index) {
    final BTreePage<K, V, U> root = this.root();
    return root.getIndex(index);
  }

  @Override
  public Map.Entry<K, V> firstEntry() {
    final BTreePage<K, V, U> root = this.root();
    return root.firstEntry();
  }

  @Override
  public K firstKey() {
    final BTreePage<K, V, U> root = this.root();
    final Map.Entry<K, V> entry = root.firstEntry();
    if (entry != null) {
      return entry.getKey();
    } else {
      return null;
    }
  }

  @Override
  public V firstValue() {
    final BTreePage<K, V, U> root = this.root();
    final Map.Entry<K, V> entry = root.firstEntry();
    if (entry != null) {
      return entry.getValue();
    } else {
      return null;
    }
  }

  @Override
  public Map.Entry<K, V> lastEntry() {
    final BTreePage<K, V, U> root = this.root();
    return root.lastEntry();
  }

  @Override
  public K lastKey() {
    final BTreePage<K, V, U> root = this.root();
    final Map.Entry<K, V> entry = root.lastEntry();
    if (entry != null) {
      return entry.getKey();
    } else {
      return null;
    }
  }

  @Override
  public V lastValue() {
    final BTreePage<K, V, U> root = this.root();
    final Map.Entry<K, V> entry = root.lastEntry();
    if (entry != null) {
      return entry.getValue();
    } else {
      return null;
    }
  }

  @Override
  public Map.Entry<K, V> nextEntry(K key) {
    final BTreePage<K, V, U> root = this.root();
    return root.nextEntry(key, this);
  }

  @Override
  public K nextKey(K key) {
    final BTreePage<K, V, U> root = this.root();
    final Map.Entry<K, V> entry = root.nextEntry(key, this);
    if (entry != null) {
      return entry.getKey();
    } else {
      return null;
    }
  }

  @Override
  public V nextValue(K key) {
    final BTreePage<K, V, U> root = this.root();
    final Map.Entry<K, V> entry = root.nextEntry(key, this);
    if (entry != null) {
      return entry.getValue();
    } else {
      return null;
    }
  }

  @Override
  public Map.Entry<K, V> previousEntry(K key) {
    final BTreePage<K, V, U> root = this.root();
    return root.previousEntry(key, this);
  }

  @Override
  public K previousKey(K key) {
    final BTreePage<K, V, U> root = this.root();
    final Map.Entry<K, V> entry = root.previousEntry(key, this);
    if (entry != null) {
      return entry.getKey();
    } else {
      return null;
    }
  }

  @Override
  public V previousValue(K key) {
    final BTreePage<K, V, U> root = this.root();
    final Map.Entry<K, V> entry = root.previousEntry(key, this);
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
      oldRoot = this.root();
      BTreePage<K, V, U> newRoot = oldRoot.updated(key, newValue, this);
      if (oldRoot != newRoot) {
        if (newRoot.size() > oldRoot.size()) {
          newRoot = newRoot.balanced(this);
        }
        if (BTreeMap.ROOT.compareAndSet(this, oldRoot, newRoot)) {
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
    for (Map.Entry<? extends K, ? extends V> entry : map.entrySet()) {
      this.put(entry.getKey(), entry.getValue());
    }
  }

  @Override
  public V remove(Object key) {
    do {
      final BTreePage<K, V, U> oldRoot = this.root();
      final BTreePage<K, V, U> newRoot = oldRoot.removed(key, this).balanced(this);
      if (oldRoot != newRoot) {
        if (BTreeMap.ROOT.compareAndSet(this, oldRoot, newRoot)) {
          return oldRoot.get(key, this);
        }
      } else {
        return null;
      }
    } while (true);
  }

  public BTreeMap<K, V, U> drop(int lower) {
    do {
      final BTreePage<K, V, U> oldRoot = this.root();
      if (lower > 0 && oldRoot.size() > 0) {
        final BTreePage<K, V, U> newRoot;
        if (lower < oldRoot.size()) {
          newRoot = oldRoot.drop(lower, this).balanced(this);
        } else {
          newRoot = BTreePage.empty();
        }
        if (BTreeMap.ROOT.compareAndSet(this, oldRoot, newRoot)) {
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
      final BTreePage<K, V, U> oldRoot = this.root();
      if (upper < oldRoot.size() && oldRoot.size() > 0) {
        final BTreePage<K, V, U> newRoot;
        if (upper > 0) {
          newRoot = oldRoot.take(upper, this).balanced(this);
        } else {
          newRoot = BTreePage.<K, V, U>empty();
        }
        if (BTreeMap.ROOT.compareAndSet(this, oldRoot, newRoot)) {
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
      final BTreePage<K, V, U> oldRoot = this.root();
      final BTreePage<K, V, U> newRoot = BTreePage.empty();
      if (oldRoot != newRoot) {
        if (BTreeMap.ROOT.compareAndSet(this, oldRoot, newRoot)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  public BTreeMap<K, V, U> updated(K key, V newValue) {
    final BTreePage<K, V, U> oldRoot = this.root();
    BTreePage<K, V, U> newRoot = oldRoot.updated(key, newValue, this);
    if (newRoot.size() > oldRoot.size()) {
      newRoot = newRoot.balanced(this);
    }
    return this.copy(newRoot);
  }

  public BTreeMap<K, V, U> removed(K key) {
    final BTreePage<K, V, U> oldRoot = this.root();
    BTreePage<K, V, U> newRoot = oldRoot.removed(key, this);
    if (oldRoot != newRoot) {
      newRoot = newRoot.balanced(this);
    }
    return this.copy(newRoot);
  }

  public BTreeMap<K, V, U> cleared() {
    return this.copy(BTreePage.empty());
  }

  @Override
  public U reduced(U identity, CombinerFunction<? super V, U> accumulator, CombinerFunction<U, U> combiner) {
    BTreePage<K, V, U> newRoot;
    do {
      final BTreePage<K, V, U> oldRoot = this.root();
      newRoot = oldRoot.reduced(identity, accumulator, combiner);
      if (oldRoot != newRoot) {
        if (BTreeMap.ROOT.compareAndSet(this, oldRoot, newRoot)) {
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
    final BTreePage<K, V, U> root = this.root();
    return new BTree<K, V>(root);
  }

  @Override
  public OrderedMapCursor<K, V> iterator() {
    final BTreePage<K, V, U> root = this.root();
    return root.iterator();
  }

  public Cursor<K> keyIterator() {
    final BTreePage<K, V, U> root = this.root();
    return root.keyIterator();
  }

  public Cursor<V> valueIterator() {
    final BTreePage<K, V, U> root = this.root();
    return root.valueIterator();
  }

  public OrderedMapCursor<K, V> reverseIterator() {
    final BTreePage<K, V, U> root = this.root();
    return root.reverseIterator();
  }

  public Cursor<K> reverseKeyIterator() {
    final BTreePage<K, V, U> root = this.root();
    return root.reverseKeyIterator();
  }

  public Cursor<V> reverseValueIterator() {
    final BTreePage<K, V, U> root = this.root();
    return root.reverseValueIterator();
  }

  @Override
  public BTreeMap<K, V, U> clone() {
    final BTreePage<K, V, U> root = this.root();
    return this.copy(root);
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
      final BTreePage<K, V, U> root = this.root();
      if (root.size() == that.size()) {
        final Iterator<Map.Entry<K, V>> those = that.entrySet().iterator();
        while (those.hasNext()) {
          final Map.Entry<K, V> entry = those.next();
          final V value = root.get(entry.getKey(), this);
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
    final Cursor<Map.Entry<K, V>> these = this.iterator();
    while (these.hasNext()) {
      code += these.next().hashCode();
    }
    return code;
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("BTreeMap").write('.').write("empty").write('(').write(')');
    final Cursor<Map.Entry<K, V>> these = this.iterator();
    while (these.hasNext()) {
      final Map.Entry<K, V> entry = these.next();
      output = output.write('.').write("updated").write('(').debug(entry.getKey())
                     .write(", ").debug(entry.getValue()).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  @SuppressWarnings("rawtypes")
  static final AtomicReferenceFieldUpdater<BTreeMap, BTreePage> ROOT =
      AtomicReferenceFieldUpdater.newUpdater(BTreeMap.class, BTreePage.class, "root");

  public static <K, V, U> BTreeMap<K, V, U> empty() {
    return new BTreeMap<K, V, U>();
  }

  public static <K, V, U> BTreeMap<K, V, U> from(Map<? extends K, ? extends V> map) {
    final BTreeMap<K, V, U> tree = new BTreeMap<K, V, U>();
    for (Map.Entry<? extends K, ? extends V> entry : map.entrySet()) {
      tree.put(entry.getKey(), entry.getValue());
    }
    return tree;
  }

}
