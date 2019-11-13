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

import java.util.AbstractCollection;
import java.util.AbstractMap;
import java.util.AbstractSet;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

public final class HashTrieMap<K, V> implements Iterable<Map.Entry<K, V>>, Map<K, V>, Debug {
  final int treeMap;
  final int leafMap;
  final Object[] slots;

  HashTrieMap(int treeMap, int leafMap, Object[] slots) {
    this.treeMap = treeMap;
    this.leafMap = leafMap;
    this.slots = slots;
  }

  @Override
  public boolean isEmpty() {
    return slotMap() == 0;
  }

  @Override
  public int size() {
    int t = 0;
    int i = 0;
    int treeMap = this.treeMap;
    int leafMap = this.leafMap;
    while ((treeMap | leafMap) != 0) {
      switch (leafMap & 1 | (treeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          t += 1;
          i += 1;
          break;
        case TREE:
          t += treeAt(i).size();
          i += 1;
          break;
        case KNOT:
          t += knotAt(i).size();
          i += 1;
          break;
        default:
          throw new AssertionError();
      }
      treeMap >>>= 1;
      leafMap >>>= 1;
    }
    return t;
  }

  @Override
  public boolean containsKey(Object key) {
    if (key != null) {
      return containsKey(this, key, Murmur3.hash(key), 0);
    } else {
      return false;
    }
  }

  @Override
  public boolean containsValue(Object value) {
    int i = 0;
    int j = 0;
    int treeMap = this.treeMap;
    int leafMap = this.leafMap;
    while ((treeMap | leafMap) != 0) {
      switch (leafMap & 1 | (treeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          final V v = valueAt(j);
          if (value == null ? v == null : value.equals(v)) {
            return true;
          }
          i += 1;
          j += 1;
          break;
        case TREE:
          if (treeAt(i).containsValue(value)) {
            return true;
          }
          i += 1;
          break;
        case KNOT:
          if (knotAt(i).containsValue(value)) {
            return true;
          }
          i += 1;
          break;
        default:
          throw new AssertionError();
      }
      treeMap >>>= 1;
      leafMap >>>= 1;
    }
    return false;
  }

  public Entry<K, V> head() {
    return head(this);
  }

  public K headKey() {
    return headKey(this);
  }

  public V headValue() {
    return headValue(this);
  }

  public Entry<K, V> next(Object key) {
    Entry<K, V> next = next(key, Murmur3.hash(key), 0);
    if (next == null) {
      next = head(this);
    }
    return next;
  }

  public K nextKey(Object key) {
    K next = nextKey(key, Murmur3.hash(key), 0);
    if (next == null) {
      next = headKey(this);
    }
    return next;
  }

  public V nextValue(Object key) {
    V next = nextValue(key, Murmur3.hash(key), 0);
    if (next == null) {
      next = headValue(this);
    }
    return next;
  }

  @Override
  public V get(Object key) {
    if (key != null) {
      return get(this, key, Murmur3.hash(key), 0);
    } else {
      return null;
    }
  }

  @Override
  public V put(K key, V value) {
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

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  public HashTrieMap<K, V> updated(K key, V value) {
    if (key != null) {
      return updated(key, Murmur3.hash(key), value, 0);
    } else {
      throw new NullPointerException();
    }
  }

  public HashTrieMap<K, V> updated(Map<? extends K, ? extends V> map) {
    HashTrieMap<K, V> these = this;
    for (Entry<? extends K, ? extends V> entry : map.entrySet()) {
      these = these.updated(entry.getKey(), entry.getValue());
    }
    return these;
  }

  public HashTrieMap<K, V> removed(Object key) {
    if (key != null) {
      return removed(key, Murmur3.hash(key), 0);
    } else {
      return this;
    }
  }

  int slotMap() {
    return treeMap | leafMap;
  }

  int choose(int hash, int shift) {
    return 1 << ((hash >>> shift) & 0x1F);
  }

  int select(int branch) {
    return Integer.bitCount(slotMap() & (branch - 1));
  }

  int lookup(int branch) {
    return Integer.bitCount(leafMap & (branch - 1));
  }

  int follow(int branch) {
    return ((leafMap & branch) != 0 ? 1 : 0) | ((treeMap & branch) != 0 ? 2 : 0);
  }

  @SuppressWarnings("unchecked")
  K keyAt(int index) {
    return (K) slots[index];
  }

  @SuppressWarnings("unchecked")
  K getKey(int branch) {
    return (K) slots[select(branch)];
  }

  @SuppressWarnings("unchecked")
  V valueAt(int index) {
    return (V) slots[slots.length - index - 1];
  }

  @SuppressWarnings("unchecked")
  V getValue(int branch) {
    return (V) slots[slots.length - lookup(branch) - 1];
  }

  HashTrieMap<K, V> setLeaf(int branch, K key, V value) {
    slots[select(branch)] = key;
    slots[slots.length - lookup(branch) - 1] = value;
    return this;
  }

  @SuppressWarnings("unchecked")
  HashTrieMap<K, V> treeAt(int index) {
    return (HashTrieMap<K, V>) slots[index];
  }

  @SuppressWarnings("unchecked")
  HashTrieMap<K, V> getTree(int branch) {
    return (HashTrieMap<K, V>) slots[select(branch)];
  }

  HashTrieMap<K, V> setTree(int branch, HashTrieMap<K, V> tree) {
    slots[select(branch)] = tree;
    return this;
  }

  @SuppressWarnings("unchecked")
  ArrayMap<K, V> knotAt(int index) {
    return (ArrayMap<K, V>) slots[index];
  }

  @SuppressWarnings("unchecked")
  ArrayMap<K, V> getKnot(int branch) {
    return (ArrayMap<K, V>) slots[select(branch)];
  }

  HashTrieMap<K, V> setKnot(int branch, ArrayMap<K, V> knot) {
    slots[select(branch)] = knot;
    return this;
  }

  boolean isUnary() {
    return treeMap == 0 && Integer.bitCount(leafMap) == 1;
  }

  @SuppressWarnings("unchecked")
  K unaryKey() {
    return (K) slots[0];
  }

  @SuppressWarnings("unchecked")
  V unaryValue() {
    return (V) slots[1];
  }

  HashTrieMap<K, V> remap(int treeMap, int leafMap) {
    int oldLeafMap = this.leafMap;
    int newLeafMap = leafMap;
    int oldSlotMap = this.treeMap | this.leafMap;
    int newSlotMap = treeMap | leafMap;
    if (oldLeafMap == newLeafMap && oldSlotMap == newSlotMap) {
      return new HashTrieMap<K, V>(treeMap, leafMap, slots.clone());
    } else {
      int i = 0;
      int j = 0;
      final Object[] newSlots = new Object[Integer.bitCount(newSlotMap) + Integer.bitCount(newLeafMap)];
      while (newSlotMap != 0) {
        if ((oldSlotMap & newSlotMap & 1) == 1) {
          newSlots[j] = slots[i];
        }
        if ((oldSlotMap & 1) == 1) {
          i += 1;
        }
        if ((newSlotMap & 1) == 1) {
          j += 1;
        }
        oldSlotMap >>>= 1;
        newSlotMap >>>= 1;
      }
      i = slots.length - 1;
      j = newSlots.length - 1;
      while (newLeafMap != 0) {
        if ((oldLeafMap & newLeafMap & 1) == 1) {
          newSlots[j] = slots[i];
        }
        if ((oldLeafMap & 1) == 1) {
          i -= 1;
        }
        if ((newLeafMap & 1) == 1) {
          j -= 1;
        }
        oldLeafMap >>>= 1;
        newLeafMap >>>= 1;
      }
      return new HashTrieMap<K, V>(treeMap, leafMap, newSlots);
    }
  }

  static boolean containsKey(HashTrieMap<?, ?> tree, Object key, int keyHash, int shift) {
    while (true) {
      final int branch = tree.choose(keyHash, shift);
      switch (tree.follow(branch)) {
        case VOID:
          return false;
        case LEAF:
          return key.equals(tree.getKey(branch));
        case TREE:
          tree = tree.getTree(branch);
          shift += 5;
          break;
        case KNOT:
          return tree.getKnot(branch).containsKey(key);
        default:
          throw new AssertionError();
      }
    }
  }

  static <K, V> Entry<K, V> head(HashTrieMap<K, V> tree) {
    loop: while (true) {
      int treeMap = tree.treeMap;
      int leafMap = tree.leafMap;
      while ((treeMap | leafMap) != 0) {
        switch (leafMap & 1 | (treeMap & 1) << 1) {
          case VOID:
            break;
          case LEAF:
            return new AbstractMap.SimpleImmutableEntry<K, V>(tree.keyAt(0), tree.valueAt(0));
          case TREE:
            tree = tree.treeAt(0);
            continue loop;
          case KNOT:
            return tree.knotAt(0).head();
          default:
            throw new AssertionError();
        }
        treeMap >>>= 1;
        leafMap >>>= 1;
      }
      return null;
    }
  }

  static <K> K headKey(HashTrieMap<K, ?> tree) {
    loop: while (true) {
      int treeMap = tree.treeMap;
      int leafMap = tree.leafMap;
      while ((treeMap | leafMap) != 0) {
        switch (leafMap & 1 | (treeMap & 1) << 1) {
          case VOID:
            break;
          case LEAF:
            return tree.keyAt(0);
          case TREE:
            tree = tree.treeAt(0);
            continue loop;
          case KNOT:
            return tree.knotAt(0).headKey();
          default:
            throw new AssertionError();
        }
        treeMap >>>= 1;
        leafMap >>>= 1;
      }
      return null;
    }
  }

  static <V> V headValue(HashTrieMap<?, V> tree) {
    loop: while (true) {
      int treeMap = tree.treeMap;
      int leafMap = tree.leafMap;
      while ((treeMap | leafMap) != 0) {
        switch (leafMap & 1 | (treeMap & 1) << 1) {
          case VOID:
            break;
          case LEAF:
            return tree.valueAt(0);
          case TREE:
            tree = tree.treeAt(0);
            continue loop;
          case KNOT:
            return tree.knotAt(0).headValue();
          default:
            throw new AssertionError();
        }
        treeMap >>>= 1;
        leafMap >>>= 1;
      }
      return null;
    }
  }

  Entry<K, V> next(Object key, int keyHash, int shift) {
    final int block;
    if (key == null) {
      block = 0;
    } else {
      block = (keyHash >>> shift) & 0x1F;
    }
    int branch = 1 << block;
    int treeMap = this.treeMap >>> block;
    int leafMap = this.leafMap >>> block;
    Map.Entry<K, V> next;
    while ((treeMap | leafMap) != 0) {
      switch (leafMap & 1 | (treeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          if (key == null) {
            return new AbstractMap.SimpleImmutableEntry<K, V>(getKey(branch), getValue(branch));
          }
          break;
        case TREE:
          next = getTree(branch).next(key, keyHash, shift + 5);
          if (next != null) {
            return next;
          }
          break;
        case KNOT:
          next = getKnot(branch).next(key);
          if (next != null) {
            return next;
          }
          break;
        default:
          throw new AssertionError();
      }
      key = null;
      keyHash = 0;
      treeMap >>>= 1;
      leafMap >>>= 1;
      branch <<= 1;
    }
    return null;
  }

  K nextKey(Object key, int keyHash, int shift) {
    final int block;
    if (key == null) {
      block = 0;
    } else {
      block = (keyHash >>> shift) & 0x1F;
    }
    int branch = 1 << block;
    int treeMap = this.treeMap >>> block;
    int leafMap = this.leafMap >>> block;
    K next;
    while ((treeMap | leafMap) != 0) {
      switch (leafMap & 1 | (treeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          if (key == null) {
            return getKey(branch);
          }
          break;
        case TREE:
          next = getTree(branch).nextKey(key, keyHash, shift + 5);
          if (next != null) {
            return next;
          }
          break;
        case KNOT:
          next = getKnot(branch).nextKey(key);
          if (next != null) {
            return next;
          }
          break;
        default:
          throw new AssertionError();
      }
      key = null;
      keyHash = 0;
      treeMap >>>= 1;
      leafMap >>>= 1;
      branch <<= 1;
    }
    return null;
  }

  V nextValue(Object key, int keyHash, int shift) {
    final int block;
    if (key == null) {
      block = 0;
    } else {
      block = (keyHash >>> shift) & 0x1F;
    }
    int branch = 1 << block;
    int treeMap = this.treeMap >>> block;
    int leafMap = this.leafMap >>> block;
    V next;
    while ((treeMap | leafMap) != 0) {
      switch (leafMap & 1 | (treeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          if (key == null) {
            return getValue(branch);
          }
          break;
        case TREE:
          next = getTree(branch).nextValue(key, keyHash, shift + 5);
          if (next != null) {
            return next;
          }
          break;
        case KNOT:
          next = getKnot(branch).nextValue(key);
          if (next != null) {
            return next;
          }
          break;
        default:
          throw new AssertionError();
      }
      key = null;
      keyHash = 0;
      treeMap >>>= 1;
      leafMap >>>= 1;
      branch <<= 1;
    }
    return null;
  }

  static <V> V get(HashTrieMap<?, V> tree, Object key, int keyHash, int shift) {
    while (true) {
      final int branch = tree.choose(keyHash, shift);
      switch (tree.follow(branch)) {
        case VOID:
          return null;
        case LEAF:
          if (key.equals(tree.getKey(branch))) {
            return tree.getValue(branch);
          } else {
            return null;
          }
        case TREE:
          tree = tree.getTree(branch);
          shift += 5;
          break;
        case KNOT:
          return tree.getKnot(branch).get(key);
        default:
          throw new AssertionError();
      }
    }
  }

  HashTrieMap<K, V> updated(K key, int keyHash, V value, int shift) {
    final int branch = choose(keyHash, shift);
    switch (follow(branch)) {
      case VOID:
        return remap(treeMap, leafMap | branch).setLeaf(branch, key, value);
      case LEAF:
        final K leaf = getKey(branch);
        final int leafHash = Murmur3.hash(leaf);
        if (keyHash == leafHash && key.equals(leaf)) {
          final V v = getValue(branch);
          if (value == v) {
            return this;
          } else {
            return remap(treeMap, leafMap).setLeaf(branch, key, value);
          }
        } else if (keyHash != leafHash) {
          return remap(treeMap | branch, leafMap ^ branch)
            .setTree(branch, merge(leaf, leafHash, getValue(branch), key, keyHash, value, shift + 5));
        } else {
          return remap(treeMap | branch, leafMap)
            .setKnot(branch, new ArrayMap<K, V>(leaf, getValue(branch), key, value));
        }
      case TREE:
        final HashTrieMap<K, V> oldTree = getTree(branch);
        final HashTrieMap<K, V> newTree = oldTree.updated(key, keyHash, value, shift + 5);
        if (oldTree == newTree) {
          return this;
        } else {
          return remap(treeMap, leafMap).setTree(branch, newTree);
        }
      case KNOT:
        final ArrayMap<K, V> oldKnot = getKnot(branch);
        final ArrayMap<K, V> newKnot = oldKnot.updated(key, value);
        if (oldKnot == newKnot) {
          return this;
        } else {
          return remap(treeMap, leafMap).setKnot(branch, newKnot);
        }
      default:
        throw new AssertionError();
    }
  }

  HashTrieMap<K, V> merge(K key0, int hash0, V value0, K key1, int hash1, V value1, int shift) {
    // assume(hash0 != hash1)
    final int branch0 = choose(hash0, shift);
    final int branch1 = choose(hash1, shift);
    final int slotMap = branch0 | branch1;
    if (branch0 == branch1) {
      final Object[] slots = new Object[1];
      slots[0] = merge(key0, hash0, value0, key1, hash1, value1, shift + 5);
      return new HashTrieMap<K, V>(slotMap, 0, slots);
    } else {
      final Object[] slots = new Object[4];
      if (((branch0 - 1) & branch1) == 0) {
        slots[0] = key0;
        slots[1] = key1;
        slots[2] = value1;
        slots[3] = value0;
      } else {
        slots[0] = key1;
        slots[1] = key0;
        slots[2] = value0;
        slots[3] = value1;
      }
      return new HashTrieMap<K, V>(0, slotMap, slots);
    }
  }

  HashTrieMap<K, V> removed(Object key, int keyHash, int shift) {
    final int branch = choose(keyHash, shift);
    switch (follow(branch)) {
      case VOID:
        return this;
      case LEAF:
        if (!key.equals(getKey(branch))) {
          return this;
        } else {
          return remap(treeMap, leafMap ^ branch);
        }
      case TREE:
        final HashTrieMap<K, V> oldTree = getTree(branch);
        final HashTrieMap<K, V> newTree = oldTree.removed(key, keyHash, shift + 5);
        if (oldTree == newTree) {
          return this;
        } else if (newTree.isEmpty()) {
          return remap(treeMap ^ branch, leafMap);
        } else if (newTree.isUnary()) {
          return remap(treeMap ^ branch, leafMap | branch)
            .setLeaf(branch, newTree.unaryKey(), newTree.unaryValue());
        } else {
          return remap(treeMap, leafMap).setTree(branch, newTree);
        }
      case KNOT:
        final ArrayMap<K, V> oldKnot = getKnot(branch);
        final ArrayMap<K, V> newKnot = oldKnot.removed(key);
        if (oldKnot == newKnot) {
          return this;
        } else if (newKnot.isEmpty()) {
          return remap(treeMap ^ branch, leafMap);
        } else if (newKnot.isUnary()) {
          return remap(treeMap ^ branch, leafMap | branch)
            .setLeaf(branch, newKnot.unaryKey(), newKnot.unaryValue());
        } else {
          return remap(treeMap, leafMap).setKnot(branch, newKnot);
        }
      default:
        throw new AssertionError();
    }
  }

  @Override
  public Set<Entry<K, V>> entrySet() {
    return new HashTrieMapEntrySet<K, V>(this);
  }

  @Override
  public Set<K> keySet() {
    return new HashTrieMapKeySet<K, V>(this);
  }

  @Override
  public Collection<V> values() {
    return new HashTrieMapValues<K, V>(this);
  }

  @Override
  public Iterator<Entry<K, V>> iterator() {
    return new HashTrieMapEntryIterator<K, V>(this);
  }

  public Iterator<K> keyIterator() {
    return new HashTrieMapKeyIterator<K, V>(this);
  }

  public Iterator<V> valueIterator() {
    return new HashTrieMapValueIterator<K, V>(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof HashTrieMap<?, ?>) {
      final HashTrieMap<K, V> that = (HashTrieMap<K, V>) other;
      if (size() == that.size()) {
        final Iterator<Entry<K, V>> those = that.iterator();
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
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(HashTrieMap.class);
    }
    int a = 0;
    int b = 0;
    int c = 1;
    final Iterator<Entry<K, V>> these = iterator();
    while (these.hasNext()) {
      final Entry<K, V> entry = these.next();
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
    output = output.write("HashTrieMap").write('.');
    final Iterator<Entry<K, V>> these = iterator();
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

  private static int hashSeed;

  static final int VOID = 0;
  static final int LEAF = 1;
  static final int TREE = 2;
  static final int KNOT = 3;

  private static HashTrieMap<Object, Object> empty;

  @SuppressWarnings("unchecked")
  public static <K, V> HashTrieMap<K, V> empty() {
    if (empty == null) {
      empty = new HashTrieMap<Object, Object>(0, 0, new Object[0]);
    }
    return (HashTrieMap<K, V>) empty;
  }

  public static <K, V> HashTrieMap<K, V> of(K key, V value) {
    return HashTrieMap.<K, V>empty().updated(key, value);
  }

  public static <K, V> HashTrieMap<K, V> from(Map<? extends K, ? extends V> map) {
    HashTrieMap<K, V> trie = empty();
    for (Entry<? extends K, ? extends V> entry : map.entrySet()) {
      trie = trie.updated(entry.getKey(), entry.getValue());
    }
    return trie;
  }

  public static <K, V> HashTrieMap<K, HashTrieSet<V>> updated(HashTrieMap<K, HashTrieSet<V>> multimap, K key, V value) {
    HashTrieSet<V> set = multimap.get(key);
    if (set == null) {
      set = HashTrieSet.empty();
    }
    set = set.added(value);
    multimap = multimap.updated(key, set);
    return multimap;
  }

  public static <K, V> HashTrieMap<K, HashTrieSet<V>> merged(HashTrieMap<K, HashTrieSet<V>> multimap, HashTrieMap<K, HashTrieSet<V>> that) {
    final Iterator<Entry<K, HashTrieSet<V>>> entries = that.iterator();
    while (entries.hasNext()) {
      final Entry<K, HashTrieSet<V>> entry = entries.next();
      HashTrieSet<V> these = multimap.get(entry.getKey());
      if (these != null) {
        these = these.merged(entry.getValue());
      } else {
        these = entry.getValue();
      }
      multimap = multimap.updated(entry.getKey(), these);
    }
    return multimap;
  }

  public static <K, V> HashTrieMap<K, HashTrieSet<V>> removed(HashTrieMap<K, HashTrieSet<V>> multimap, K key, V value) {
    HashTrieSet<V> set = multimap.get(key);
    if (set == null) {
      return multimap;
    }
    set = set.removed(value);
    if (set.isEmpty()) {
      multimap = multimap.removed(key);
    } else {
      multimap = multimap.updated(key, set);
    }
    return multimap;
  }
}

abstract class HashTrieMapIterator<K, V> {
  final Object[] nodes;
  int depth;
  final int[] stack;
  int stackPointer;

  HashTrieMapIterator(HashTrieMap<K, V> tree) {
    nodes = new Object[8];
    depth = 0;
    stack = new int[32];
    stackPointer = 0;
    setNode(tree);
    setSlotIndex(0);
    setLeafIndex(0);
    setTreeMap(tree.treeMap);
    setLeafMap(tree.leafMap);
  }

  final Object getNode() {
    return nodes[depth];
  }

  final void setNode(Object node) {
    nodes[depth] = node;
  }

  final int getSlotIndex() {
    return stack[stackPointer];
  }

  final void setSlotIndex(int index) {
    stack[stackPointer] = index;
  }

  final int getLeafIndex() {
    return stack[stackPointer + 1];
  }

  final void setLeafIndex(int index) {
    stack[stackPointer + 1] = index;
  }

  final int getTreeMap() {
    return stack[stackPointer + 2];
  }

  final void setTreeMap(int treeMap) {
    stack[stackPointer + 2] = treeMap;
  }

  final int getLeafMap() {
    return stack[stackPointer + 3];
  }

  final void setLeafMap(int leafMap) {
    stack[stackPointer + 3] = leafMap;
  }

  final int follow(int treeMap, int leafMap) {
    return leafMap & 1 | (treeMap & 1) << 1;
  }

  final void push(HashTrieMap<K, V> tree) {
    depth += 1;
    setNode(tree);

    stackPointer += 4;
    setSlotIndex(0);
    setLeafIndex(0);
    setTreeMap(tree.treeMap);
    setLeafMap(tree.leafMap);
  }

  final void push(ArrayMap<K, V> knot) {
    depth += 1;
    setNode(knot);

    stackPointer += 4;
    setSlotIndex(0);
  }

  final void pop() {
    setNode(null);
    depth -= 1;

    setSlotIndex(0);
    setLeafIndex(0);
    setTreeMap(0);
    setLeafMap(0);
    stackPointer -= 4;

    setSlotIndex(getSlotIndex() + 1);
    setTreeMap(getTreeMap() >>> 1);
    setLeafMap(getLeafMap() >>> 1);
  }

  @SuppressWarnings("unchecked")
  public boolean hasNext() {
    while (true) {
      final Object node = getNode();
      if (node instanceof HashTrieMap<?, ?>) {
        final HashTrieMap<K, V> tree = (HashTrieMap<K, V>) node;
        final int treeMap = getTreeMap();
        final int leafMap = getLeafMap();
        if ((treeMap | leafMap) != 0) {
          switch (follow(treeMap, leafMap)) {
            case HashTrieMap.VOID:
              setTreeMap(treeMap >>> 1);
              setLeafMap(leafMap >>> 1);
              break;
            case HashTrieMap.LEAF:
              return true;
            case HashTrieMap.TREE:
              push(tree.treeAt(getSlotIndex()));
              break;
            case HashTrieMap.KNOT:
              push(tree.knotAt(getSlotIndex()));
              break;
            default:
              throw new AssertionError();
          }
        } else if (depth > 0) {
          pop();
        } else {
          return false;
        }
      } else if (node instanceof ArrayMap<?, ?>) {
        final ArrayMap<K, V> knot = (ArrayMap<K, V>) node;
        if (getSlotIndex() < knot.size()) {
          return true;
        } else {
          pop();
        }
      } else {
        throw new AssertionError();
      }
    }
  }

  @SuppressWarnings("unchecked")
  protected Map.Entry<K, V> nextEntry() {
    while (true) {
      final Object node = getNode();
      if (node instanceof HashTrieMap<?, ?>) {
        final HashTrieMap<K, V> tree = (HashTrieMap<K, V>) node;
        final int treeMap = getTreeMap();
        final int leafMap = getLeafMap();
        final int slotMap = treeMap | leafMap;
        if (slotMap != 0) {
          switch (follow(treeMap, leafMap)) {
            case HashTrieMap.VOID:
              setTreeMap(treeMap >>> 1);
              setLeafMap(leafMap >>> 1);
              break;
            case HashTrieMap.LEAF:
              final int slotIndex = getSlotIndex();
              final int leafIndex = getLeafIndex();
              final K key = tree.keyAt(slotIndex);
              final V value = tree.valueAt(leafIndex);
              setSlotIndex(slotIndex + 1);
              setLeafIndex(leafIndex + 1);
              setTreeMap(treeMap >>> 1);
              setLeafMap(leafMap >>> 1);
              return new AbstractMap.SimpleImmutableEntry<K, V>(key, value);
            case HashTrieMap.TREE:
              push(tree.treeAt(getSlotIndex()));
              break;
            case HashTrieMap.KNOT:
              push(tree.knotAt(getSlotIndex()));
              break;
            default:
              throw new AssertionError();
          }
        } else if (depth > 0) {
          pop();
        } else {
          throw new NoSuchElementException();
        }
      } else if (node instanceof ArrayMap<?, ?>) {
        final ArrayMap<K, V> knot = (ArrayMap<K, V>) node;
        final int slotIndex = getSlotIndex();
        if (slotIndex < knot.size()) {
          final K key = knot.keyAt(slotIndex);
          final V value = knot.valueAt(slotIndex);
          setSlotIndex(slotIndex + 1);
          return new AbstractMap.SimpleImmutableEntry<K, V>(key, value);
        } else {
          pop();
        }
      } else {
        throw new AssertionError();
      }
    }
  }

  @SuppressWarnings("unchecked")
  protected K nextKey() {
    while (true) {
      final Object node = getNode();
      if (node instanceof HashTrieMap<?, ?>) {
        final HashTrieMap<K, V> tree = (HashTrieMap<K, V>) node;
        final int treeMap = getTreeMap();
        final int leafMap = getLeafMap();
        final int slotMap = treeMap | leafMap;
        if (slotMap != 0) {
          switch (follow(treeMap, leafMap)) {
            case HashTrieMap.VOID:
              setTreeMap(treeMap >>> 1);
              setLeafMap(leafMap >>> 1);
              break;
            case HashTrieMap.LEAF:
              final int slotIndex = getSlotIndex();
              final K key = tree.keyAt(slotIndex);
              setSlotIndex(slotIndex + 1);
              setLeafIndex(getLeafIndex() + 1);
              setTreeMap(treeMap >>> 1);
              setLeafMap(leafMap >>> 1);
              return key;
            case HashTrieMap.TREE:
              push(tree.treeAt(getSlotIndex()));
              break;
            case HashTrieMap.KNOT:
              push(tree.knotAt(getSlotIndex()));
              break;
            default:
              throw new AssertionError();
          }
        } else if (depth > 0) {
          pop();
        } else {
          throw new NoSuchElementException();
        }
      } else if (node instanceof ArrayMap<?, ?>) {
        final ArrayMap<K, V> knot = (ArrayMap<K, V>) node;
        final int slotIndex = getSlotIndex();
        if (slotIndex < knot.size()) {
          final K key = knot.keyAt(slotIndex);
          setSlotIndex(slotIndex + 1);
          return key;
        } else {
          pop();
        }
      } else {
        throw new AssertionError();
      }
    }
  }

  @SuppressWarnings("unchecked")
  protected V nextValue() {
    while (true) {
      final Object node = getNode();
      if (node instanceof HashTrieMap<?, ?>) {
        final HashTrieMap<K, V> tree = (HashTrieMap<K, V>) node;
        final int treeMap = getTreeMap();
        final int leafMap = getLeafMap();
        final int slotMap = treeMap | leafMap;
        if (slotMap != 0) {
          switch (follow(treeMap, leafMap)) {
            case HashTrieMap.VOID:
              setTreeMap(treeMap >>> 1);
              setLeafMap(leafMap >>> 1);
              break;
            case HashTrieMap.LEAF:
              final int leafIndex = getLeafIndex();
              final V value = tree.valueAt(leafIndex);
              setSlotIndex(getSlotIndex() + 1);
              setLeafIndex(leafIndex + 1);
              setTreeMap(treeMap >>> 1);
              setLeafMap(leafMap >>> 1);
              return value;
            case HashTrieMap.TREE:
              push(tree.treeAt(getSlotIndex()));
              break;
            case HashTrieMap.KNOT:
              push(tree.knotAt(getSlotIndex()));
              break;
            default:
              throw new AssertionError();
          }
        } else if (depth > 0) {
          pop();
        } else {
          throw new NoSuchElementException();
        }
      } else if (node instanceof ArrayMap<?, ?>) {
        final ArrayMap<K, V> knot = (ArrayMap<K, V>) node;
        final int slotIndex = getSlotIndex();
        if (slotIndex < knot.size()) {
          final V value = knot.valueAt(slotIndex);
          setSlotIndex(slotIndex + 1);
          return value;
        } else {
          pop();
        }
      } else {
        throw new AssertionError();
      }
    }
  }

  public void remove() {
    throw new UnsupportedOperationException();
  }
}

final class HashTrieMapEntryIterator<K, V> extends HashTrieMapIterator<K, V> implements Iterator<Map.Entry<K, V>> {
  HashTrieMapEntryIterator(HashTrieMap<K, V> tree) {
    super(tree);
  }

  @Override
  public Map.Entry<K, V> next() {
    return nextEntry();
  }
}

final class HashTrieMapKeyIterator<K, V> extends HashTrieMapIterator<K, V> implements Iterator<K> {
  HashTrieMapKeyIterator(HashTrieMap<K, V> tree) {
    super(tree);
  }

  @Override
  public K next() {
    return nextKey();
  }
}

final class HashTrieMapValueIterator<K, V> extends HashTrieMapIterator<K, V> implements Iterator<V> {
  HashTrieMapValueIterator(HashTrieMap<K, V> tree) {
    super(tree);
  }

  @Override
  public V next() {
    return nextValue();
  }
}

final class HashTrieMapEntrySet<K, V> extends AbstractSet<Map.Entry<K, V>> {
  final HashTrieMap<K, V> map;

  HashTrieMapEntrySet(HashTrieMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return map.size();
  }

  @Override
  public Iterator<Map.Entry<K, V>> iterator() {
    return map.iterator();
  }
}

final class HashTrieMapKeySet<K, V> extends AbstractSet<K> {
  final HashTrieMap<K, V> map;

  HashTrieMapKeySet(HashTrieMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return map.size();
  }

  @Override
  public Iterator<K> iterator() {
    return map.keyIterator();
  }
}

final class HashTrieMapValues<K, V> extends AbstractCollection<V> {
  final HashTrieMap<K, V> map;

  HashTrieMapValues(HashTrieMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return map.size();
  }

  @Override
  public Iterator<V> iterator() {
    return map.valueIterator();
  }
}
