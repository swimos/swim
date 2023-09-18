// Copyright 2015-2023 Nstream, inc.
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
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Cursor;
import swim.util.OrderedMap;
import swim.util.OrderedMapCursor;

/**
 * Immutable {@link OrderedMap} backed by a B-tree.
 */
public class BTree<K, V> extends BTreeContext<K, V> implements OrderedMap<K, V>, Debug {

  final BTreePage<K, V, ?> root;

  protected BTree(BTreePage<K, V, ?> root) {
    this.root = root;
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
  public Map.Entry<K, V> getEntry(Object key) {
    return this.root.getEntry(key, this);
  }

  @Override
  public Map.Entry<K, V> getIndex(int index) {
    return this.root.getIndex(index);
  }

  @Override
  public Map.Entry<K, V> firstEntry() {
    return this.root.firstEntry();
  }

  @Override
  public K firstKey() {
    final Map.Entry<K, V> entry = this.root.firstEntry();
    if (entry != null) {
      return entry.getKey();
    } else {
      return null;
    }
  }

  @Override
  public V firstValue() {
    final Map.Entry<K, V> entry = this.root.firstEntry();
    if (entry != null) {
      return entry.getValue();
    } else {
      return null;
    }
  }

  @Override
  public Map.Entry<K, V> lastEntry() {
    return this.root.lastEntry();
  }

  @Override
  public K lastKey() {
    final Map.Entry<K, V> entry = this.root.lastEntry();
    if (entry != null) {
      return entry.getKey();
    } else {
      return null;
    }
  }

  @Override
  public V lastValue() {
    final Map.Entry<K, V> entry = this.root.lastEntry();
    if (entry != null) {
      return entry.getValue();
    } else {
      return null;
    }
  }

  @Override
  public Map.Entry<K, V> nextEntry(K key) {
    return this.root.nextEntry(key, this);
  }

  @Override
  public K nextKey(K key) {
    final Map.Entry<K, V> entry = this.root.nextEntry(key, this);
    if (entry != null) {
      return entry.getKey();
    } else {
      return null;
    }
  }

  @Override
  public V nextValue(K key) {
    final Map.Entry<K, V> entry = this.root.nextEntry(key, this);
    if (entry != null) {
      return entry.getValue();
    } else {
      return null;
    }
  }

  @Override
  public Map.Entry<K, V> previousEntry(K key) {
    return this.root.previousEntry(key, this);
  }

  @Override
  public K previousKey(K key) {
    final Map.Entry<K, V> entry = this.root.previousEntry(key, this);
    if (entry != null) {
      return entry.getKey();
    } else {
      return null;
    }
  }

  @Override
  public V previousValue(K key) {
    final Map.Entry<K, V> entry = this.root.previousEntry(key, this);
    if (entry != null) {
      return entry.getValue();
    } else {
      return null;
    }
  }

  @Override
  public V put(K key, V newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void putAll(Map<? extends K, ? extends V> map) {
    throw new UnsupportedOperationException();
  }

  @Override
  public V remove(Object key) {
    throw new UnsupportedOperationException();
  }

  public BTree<K, V> drop(int lower) {
    if (lower > 0 && this.root.size() > 0) {
      if (lower < this.root.size()) {
        return this.copy(this.root.drop(lower, this).balanced(this));
      } else {
        return BTree.empty();
      }
    }
    return this;
  }

  public BTree<K, V> take(int upper) {
    if (upper < this.root.size() && this.root.size() > 0) {
      if (upper > 0) {
        return this.copy(this.root.take(upper, this).balanced(this));
      } else {
        return BTree.empty();
      }
    }
    return this;
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  public BTree<K, V> updated(K key, V newValue) {
    final BTreePage<K, V, ?> oldRoot = this.root;
    BTreePage<K, V, ?> newRoot = oldRoot.updated(key, newValue, this);
    if (oldRoot != newRoot) {
      if (newRoot.size() > oldRoot.size()) {
        newRoot = newRoot.balanced(this);
      }
      return this.copy(newRoot);
    } else {
      return this;
    }
  }

  public BTree<K, V> removed(K key) {
    final BTreePage<K, V, ?> oldRoot = this.root;
    final BTreePage<K, V, ?> newRoot = oldRoot.removed(key, this).balanced(this);
    if (oldRoot != newRoot) {
      return this.copy(newRoot);
    } else {
      return this;
    }
  }

  public BTree<K, V> cleared() {
    return BTree.empty();
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

  public OrderedMapCursor<K, V> reverseIterator() {
    return this.root.reverseIterator();
  }

  public Cursor<K> reverseKeyIterator() {
    return this.root.reverseKeyIterator();
  }

  public Cursor<V> reverseValueIterator() {
    return this.root.reverseValueIterator();
  }

  protected BTree<K, V> copy(BTreePage<K, V, ?> root) {
    return new BTree<K, V>(root);
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
      if (this.size() == that.size()) {
        final Iterator<Map.Entry<K, V>> those = that.entrySet().iterator();
        while (those.hasNext()) {
          final Map.Entry<K, V> entry = those.next();
          final V value = this.get(entry.getKey());
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
    output = output.write("BTree").write('.').write("empty").write('(').write(')');
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

  private static BTree<Object, Object> empty;

  @SuppressWarnings("unchecked")
  public static <K, V> BTree<K, V> empty() {
    if (BTree.empty == null) {
      BTree.empty = new BTree<Object, Object>(BTreePage.empty());
    }
    return (BTree<K, V>) (BTree<?, ?>) BTree.empty;
  }

  public static <K, V> BTree<K, V> from(Map<? extends K, ? extends V> map) {
    BTree<K, V> tree = BTree.empty();
    for (Map.Entry<? extends K, ? extends V> entry : map.entrySet()) {
      tree = tree.updated(entry.getKey(), entry.getValue());
    }
    return tree;
  }

}
