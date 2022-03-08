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
    return this.slotMap() == 0;
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
          t += this.treeAt(i).size();
          i += 1;
          break;
        case KNOT:
          t += this.knotAt(i).size();
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
      return HashTrieMap.containsKey(this, key, Murmur3.hash(key), 0);
    } else {
      return false;
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
          final V v = this.valueAt(j);
          if (value == null ? v == null : value.equals(v)) {
            return true;
          }
          i += 1;
          j += 1;
          break;
        case TREE:
          if (this.treeAt(i).containsValue(value)) {
            return true;
          }
          i += 1;
          break;
        case KNOT:
          if (this.knotAt(i).containsValue(value)) {
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

  public Map.Entry<K, V> head() {
    return HashTrieMap.head(this);
  }

  static <K, V> Map.Entry<K, V> head(HashTrieMap<K, V> tree) {
    loop: do {
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
    } while (true);
  }

  public K headKey() {
    return HashTrieMap.headKey(this);
  }

  static <K> K headKey(HashTrieMap<K, ?> tree) {
    loop: do {
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
    } while (true);
  }

  public V headValue() {
    return HashTrieMap.headValue(this);
  }

  static <V> V headValue(HashTrieMap<?, V> tree) {
    loop: do {
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
    } while (true);
  }

  public Map.Entry<K, V> next(Object key) {
    return this.next(key, Murmur3.hash(key), 0);
  }

  public K nextKey(Object key) {
    return this.nextKey(key, Murmur3.hash(key), 0);
  }

  public V nextValue(Object key) {
    return this.nextValue(key, Murmur3.hash(key), 0);
  }

  @Override
  public V get(Object key) {
    if (key != null) {
      return HashTrieMap.get(this, key, Murmur3.hash(key), 0);
    } else {
      return null;
    }
  }

  static <V> V get(HashTrieMap<?, V> tree, Object key, int keyHash, int shift) {
    do {
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
    } while (true);
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
      return this.updated(key, Murmur3.hash(key), value, 0);
    } else {
      throw new NullPointerException();
    }
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

  public HashTrieMap<K, V> updated(Map<? extends K, ? extends V> map) {
    HashTrieMap<K, V> these = this;
    for (Map.Entry<? extends K, ? extends V> entry : map.entrySet()) {
      these = these.updated(entry.getKey(), entry.getValue());
    }
    return these;
  }

  public HashTrieMap<K, V> removed(Object key) {
    if (key != null) {
      return this.removed(key, Murmur3.hash(key), 0);
    } else {
      return this;
    }
  }

  int slotMap() {
    return this.treeMap | this.leafMap;
  }

  int choose(int hash, int shift) {
    return 1 << ((hash >>> shift) & 0x1F);
  }

  int select(int branch) {
    return Integer.bitCount(this.slotMap() & (branch - 1));
  }

  int lookup(int branch) {
    return Integer.bitCount(this.leafMap & (branch - 1));
  }

  int follow(int branch) {
    return ((this.leafMap & branch) != 0 ? 1 : 0) | ((this.treeMap & branch) != 0 ? 2 : 0);
  }

  @SuppressWarnings("unchecked")
  K keyAt(int index) {
    return (K) this.slots[index];
  }

  @SuppressWarnings("unchecked")
  K getKey(int branch) {
    return (K) this.slots[this.select(branch)];
  }

  @SuppressWarnings("unchecked")
  V valueAt(int index) {
    return (V) this.slots[this.slots.length - index - 1];
  }

  @SuppressWarnings("unchecked")
  V getValue(int branch) {
    return (V) this.slots[this.slots.length - this.lookup(branch) - 1];
  }

  HashTrieMap<K, V> setLeaf(int branch, K key, V value) {
    this.slots[this.select(branch)] = key;
    this.slots[this.slots.length - this.lookup(branch) - 1] = value;
    return this;
  }

  @SuppressWarnings("unchecked")
  HashTrieMap<K, V> treeAt(int index) {
    return (HashTrieMap<K, V>) this.slots[index];
  }

  @SuppressWarnings("unchecked")
  HashTrieMap<K, V> getTree(int branch) {
    return (HashTrieMap<K, V>) this.slots[this.select(branch)];
  }

  HashTrieMap<K, V> setTree(int branch, HashTrieMap<K, V> tree) {
    this.slots[this.select(branch)] = tree;
    return this;
  }

  @SuppressWarnings("unchecked")
  ArrayMap<K, V> knotAt(int index) {
    return (ArrayMap<K, V>) this.slots[index];
  }

  @SuppressWarnings("unchecked")
  ArrayMap<K, V> getKnot(int branch) {
    return (ArrayMap<K, V>) this.slots[this.select(branch)];
  }

  HashTrieMap<K, V> setKnot(int branch, ArrayMap<K, V> knot) {
    this.slots[this.select(branch)] = knot;
    return this;
  }

  boolean isUnary() {
    return this.treeMap == 0 && Integer.bitCount(this.leafMap) == 1;
  }

  @SuppressWarnings("unchecked")
  K unaryKey() {
    return (K) this.slots[0];
  }

  @SuppressWarnings("unchecked")
  V unaryValue() {
    return (V) this.slots[1];
  }

  HashTrieMap<K, V> remap(int treeMap, int leafMap) {
    int oldLeafMap = this.leafMap;
    int newLeafMap = leafMap;
    int oldSlotMap = this.treeMap | oldLeafMap;
    int newSlotMap = treeMap | leafMap;
    final Object[] oldSlots = this.slots;
    if (oldLeafMap == newLeafMap && oldSlotMap == newSlotMap) {
      return new HashTrieMap<K, V>(treeMap, leafMap, oldSlots.clone());
    } else {
      int i = 0;
      int j = 0;
      final Object[] newSlots = new Object[Integer.bitCount(newSlotMap) + Integer.bitCount(newLeafMap)];
      while (newSlotMap != 0) {
        if ((oldSlotMap & newSlotMap & 1) == 1) {
          newSlots[j] = oldSlots[i];
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
      i = oldSlots.length - 1;
      j = newSlots.length - 1;
      while (newLeafMap != 0) {
        if ((oldLeafMap & newLeafMap & 1) == 1) {
          newSlots[j] = oldSlots[i];
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

  Map.Entry<K, V> next(Object key, int keyHash, int shift) {
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
            return new AbstractMap.SimpleImmutableEntry<K, V>(this.getKey(branch), this.getValue(branch));
          }
          break;
        case TREE:
          next = this.getTree(branch).next(key, keyHash, shift + 5);
          if (next != null) {
            return next;
          }
          break;
        case KNOT:
          next = this.getKnot(branch).next(key);
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
            return this.getKey(branch);
          }
          break;
        case TREE:
          next = this.getTree(branch).nextKey(key, keyHash, shift + 5);
          if (next != null) {
            return next;
          }
          break;
        case KNOT:
          next = this.getKnot(branch).nextKey(key);
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
            return this.getValue(branch);
          }
          break;
        case TREE:
          next = this.getTree(branch).nextValue(key, keyHash, shift + 5);
          if (next != null) {
            return next;
          }
          break;
        case KNOT:
          next = this.getKnot(branch).nextValue(key);
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

  HashTrieMap<K, V> updated(K key, int keyHash, V value, int shift) {
    final int branch = this.choose(keyHash, shift);
    switch (this.follow(branch)) {
      case VOID:
        return this.remap(this.treeMap, this.leafMap | branch).setLeaf(branch, key, value);
      case LEAF:
        final K leaf = this.getKey(branch);
        final int leafHash = Murmur3.hash(leaf);
        if (keyHash == leafHash && key.equals(leaf)) {
          final V v = this.getValue(branch);
          if (value == v) {
            return this;
          } else {
            return this.remap(this.treeMap, this.leafMap).setLeaf(branch, key, value);
          }
        } else if (keyHash != leafHash) {
          return this.remap(this.treeMap | branch, this.leafMap ^ branch)
                     .setTree(branch, this.merge(leaf, leafHash, this.getValue(branch), key, keyHash, value, shift + 5));
        } else {
          return this.remap(this.treeMap | branch, this.leafMap)
                     .setKnot(branch, new ArrayMap<K, V>(new Object[] {leaf, this.getValue(branch), key, value}));
        }
      case TREE:
        final HashTrieMap<K, V> oldTree = this.getTree(branch);
        final HashTrieMap<K, V> newTree = oldTree.updated(key, keyHash, value, shift + 5);
        if (oldTree == newTree) {
          return this;
        } else {
          return this.remap(this.treeMap, this.leafMap).setTree(branch, newTree);
        }
      case KNOT:
        final ArrayMap<K, V> oldKnot = this.getKnot(branch);
        final ArrayMap<K, V> newKnot = oldKnot.updated(key, value);
        if (oldKnot == newKnot) {
          return this;
        } else {
          return this.remap(this.treeMap, this.leafMap).setKnot(branch, newKnot);
        }
      default:
        throw new AssertionError();
    }
  }

  HashTrieMap<K, V> merge(K key0, int hash0, V value0, K key1, int hash1, V value1, int shift) {
    // assume(hash0 != hash1)
    final int branch0 = this.choose(hash0, shift);
    final int branch1 = this.choose(hash1, shift);
    final int slotMap = branch0 | branch1;
    if (branch0 == branch1) {
      final Object[] slots = new Object[1];
      slots[0] = this.merge(key0, hash0, value0, key1, hash1, value1, shift + 5);
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

  public static <K, V> HashTrieMap<K, HashTrieSet<V>> merged(HashTrieMap<K, HashTrieSet<V>> multimap, HashTrieMap<K, HashTrieSet<V>> that) {
    final Iterator<Map.Entry<K, HashTrieSet<V>>> entries = that.iterator();
    while (entries.hasNext()) {
      final Map.Entry<K, HashTrieSet<V>> entry = entries.next();
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

  HashTrieMap<K, V> removed(Object key, int keyHash, int shift) {
    final int branch = this.choose(keyHash, shift);
    switch (this.follow(branch)) {
      case VOID:
        return this;
      case LEAF:
        if (!key.equals(this.getKey(branch))) {
          return this;
        } else {
          return this.remap(this.treeMap, this.leafMap ^ branch);
        }
      case TREE:
        final HashTrieMap<K, V> oldTree = this.getTree(branch);
        final HashTrieMap<K, V> newTree = oldTree.removed(key, keyHash, shift + 5);
        if (oldTree == newTree) {
          return this;
        } else if (newTree.isEmpty()) {
          return this.remap(this.treeMap ^ branch, this.leafMap);
        } else if (newTree.isUnary()) {
          return this.remap(this.treeMap ^ branch, this.leafMap | branch)
                     .setLeaf(branch, newTree.unaryKey(), newTree.unaryValue());
        } else {
          return this.remap(this.treeMap, this.leafMap).setTree(branch, newTree);
        }
      case KNOT:
        final ArrayMap<K, V> oldKnot = this.getKnot(branch);
        final ArrayMap<K, V> newKnot = oldKnot.removed(key);
        if (oldKnot == newKnot) {
          return this;
        } else if (newKnot.isEmpty()) {
          return this.remap(this.treeMap ^ branch, this.leafMap);
        } else if (newKnot.isUnary()) {
          return this.remap(this.treeMap ^ branch, this.leafMap | branch)
                     .setLeaf(branch, newKnot.unaryKey(), newKnot.unaryValue());
        } else {
          return this.remap(this.treeMap, this.leafMap).setKnot(branch, newKnot);
        }
      default:
        throw new AssertionError();
    }
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

  @Override
  public Set<Map.Entry<K, V>> entrySet() {
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
  public Iterator<Map.Entry<K, V>> iterator() {
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
      if (this.size() == that.size()) {
        final Iterator<Map.Entry<K, V>> those = that.iterator();
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

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (HashTrieMap.hashSeed == 0) {
      HashTrieMap.hashSeed = Murmur3.seed(HashTrieMap.class);
    }
    int a = 0;
    int b = 0;
    int c = 1;
    final Iterator<Map.Entry<K, V>> these = this.iterator();
    while (these.hasNext()) {
      final Map.Entry<K, V> entry = these.next();
      final int h = Murmur3.mix(Murmur3.hash(entry.getKey()), Murmur3.hash(entry.getValue()));
      a ^= h;
      b += h;
      if (h != 0) {
        c *= h;
      }
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(HashTrieMap.hashSeed, a), b), c));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("HashTrieMap").write('.').write("empty").write('(').write(')');
    final Iterator<Map.Entry<K, V>> these = this.iterator();
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

  static final int VOID = 0;
  static final int LEAF = 1;
  static final int TREE = 2;
  static final int KNOT = 3;

  private static HashTrieMap<Object, Object> empty;

  @SuppressWarnings("unchecked")
  public static <K, V> HashTrieMap<K, V> empty() {
    if (HashTrieMap.empty == null) {
      HashTrieMap.empty = new HashTrieMap<Object, Object>(0, 0, new Object[0]);
    }
    return (HashTrieMap<K, V>) HashTrieMap.empty;
  }

  public static <K, V> HashTrieMap<K, V> from(Map<? extends K, ? extends V> map) {
    HashTrieMap<K, V> trie = HashTrieMap.empty();
    for (Map.Entry<? extends K, ? extends V> entry : map.entrySet()) {
      trie = trie.updated(entry.getKey(), entry.getValue());
    }
    return trie;
  }

  public static int compareKeys(Object a, Object b) {
    if (a != null && b != null) {
      return HashTrieMap.compareKeyHashes(Murmur3.hash(a), Murmur3.hash(b));
    } else if (b != null) {
      return -1;
    } else if (a != null) {
      return 1;
    } else {
      return 0;
    }
  }

  public static int compareKeyHashes(int aHash, int bHash) {
    do {
      final int aNext = aHash & 0x1F;
      final int bNext = bHash & 0x1F;
      if (aNext < bNext) {
        return -1;
      } else if (aNext > bNext) {
        return 1;
      }
      aHash >>>= 5;
      bHash >>>= 5;
    } while (aHash != 0 && bHash != 0);
    return 0;
  }

}

abstract class HashTrieMapIterator<K, V> {

  final Object[] nodes;
  final int[] stack;
  int depth;
  int stackPointer;

  HashTrieMapIterator(HashTrieMap<K, V> tree) {
    this.nodes = new Object[8];
    this.depth = 0;
    this.stack = new int[32];
    this.stackPointer = 0;
    this.setNode(tree);
    this.setSlotIndex(0);
    this.setLeafIndex(0);
    this.setTreeMap(tree.treeMap);
    this.setLeafMap(tree.leafMap);
  }

  final Object getNode() {
    return this.nodes[this.depth];
  }

  final void setNode(Object node) {
    this.nodes[this.depth] = node;
  }

  final int getSlotIndex() {
    return this.stack[this.stackPointer];
  }

  final void setSlotIndex(int index) {
    this.stack[this.stackPointer] = index;
  }

  final int getLeafIndex() {
    return this.stack[this.stackPointer + 1];
  }

  final void setLeafIndex(int index) {
    this.stack[this.stackPointer + 1] = index;
  }

  final int getTreeMap() {
    return this.stack[this.stackPointer + 2];
  }

  final void setTreeMap(int treeMap) {
    this.stack[this.stackPointer + 2] = treeMap;
  }

  final int getLeafMap() {
    return this.stack[this.stackPointer + 3];
  }

  final void setLeafMap(int leafMap) {
    this.stack[this.stackPointer + 3] = leafMap;
  }

  final int follow(int treeMap, int leafMap) {
    return leafMap & 1 | (treeMap & 1) << 1;
  }

  final void push(HashTrieMap<K, V> tree) {
    this.depth += 1;
    this.setNode(tree);

    this.stackPointer += 4;
    this.setSlotIndex(0);
    this.setLeafIndex(0);
    this.setTreeMap(tree.treeMap);
    this.setLeafMap(tree.leafMap);
  }

  final void push(ArrayMap<K, V> knot) {
    this.depth += 1;
    this.setNode(knot);

    this.stackPointer += 4;
    this.setSlotIndex(0);
  }

  final void pop() {
    this.setNode(null);
    this.depth -= 1;

    this.setSlotIndex(0);
    this.setLeafIndex(0);
    this.setTreeMap(0);
    this.setLeafMap(0);
    this.stackPointer -= 4;

    this.setSlotIndex(this.getSlotIndex() + 1);
    this.setTreeMap(this.getTreeMap() >>> 1);
    this.setLeafMap(this.getLeafMap() >>> 1);
  }

  @SuppressWarnings("unchecked")
  public boolean hasNext() {
    do {
      final Object node = this.getNode();
      if (node instanceof HashTrieMap<?, ?>) {
        final HashTrieMap<K, V> tree = (HashTrieMap<K, V>) node;
        final int treeMap = this.getTreeMap();
        final int leafMap = this.getLeafMap();
        if ((treeMap | leafMap) != 0) {
          switch (this.follow(treeMap, leafMap)) {
            case HashTrieMap.VOID:
              this.setTreeMap(treeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              break;
            case HashTrieMap.LEAF:
              return true;
            case HashTrieMap.TREE:
              this.push(tree.treeAt(this.getSlotIndex()));
              break;
            case HashTrieMap.KNOT:
              this.push(tree.knotAt(this.getSlotIndex()));
              break;
            default:
              throw new AssertionError();
          }
        } else if (this.depth > 0) {
          this.pop();
        } else {
          return false;
        }
      } else if (node instanceof ArrayMap<?, ?>) {
        final ArrayMap<K, V> knot = (ArrayMap<K, V>) node;
        if (this.getSlotIndex() < knot.size()) {
          return true;
        } else {
          this.pop();
        }
      } else {
        throw new AssertionError();
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  protected Map.Entry<K, V> nextEntry() {
    do {
      final Object node = this.getNode();
      if (node instanceof HashTrieMap<?, ?>) {
        final HashTrieMap<K, V> tree = (HashTrieMap<K, V>) node;
        final int treeMap = this.getTreeMap();
        final int leafMap = this.getLeafMap();
        final int slotMap = treeMap | leafMap;
        if (slotMap != 0) {
          switch (this.follow(treeMap, leafMap)) {
            case HashTrieMap.VOID:
              this.setTreeMap(treeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              break;
            case HashTrieMap.LEAF:
              final int slotIndex = this.getSlotIndex();
              final int leafIndex = this.getLeafIndex();
              final K key = tree.keyAt(slotIndex);
              final V value = tree.valueAt(leafIndex);
              this.setSlotIndex(slotIndex + 1);
              this.setLeafIndex(leafIndex + 1);
              this.setTreeMap(treeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              return new AbstractMap.SimpleImmutableEntry<K, V>(key, value);
            case HashTrieMap.TREE:
              this.push(tree.treeAt(this.getSlotIndex()));
              break;
            case HashTrieMap.KNOT:
              this.push(tree.knotAt(this.getSlotIndex()));
              break;
            default:
              throw new AssertionError();
          }
        } else if (this.depth > 0) {
          this.pop();
        } else {
          throw new NoSuchElementException();
        }
      } else if (node instanceof ArrayMap<?, ?>) {
        final ArrayMap<K, V> knot = (ArrayMap<K, V>) node;
        final int slotIndex = this.getSlotIndex();
        if (slotIndex < knot.size()) {
          final K key = knot.keyAt(slotIndex);
          final V value = knot.valueAt(slotIndex);
          this.setSlotIndex(slotIndex + 1);
          return new AbstractMap.SimpleImmutableEntry<K, V>(key, value);
        } else {
          this.pop();
        }
      } else {
        throw new AssertionError();
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  protected K nextKey() {
    do {
      final Object node = this.getNode();
      if (node instanceof HashTrieMap<?, ?>) {
        final HashTrieMap<K, V> tree = (HashTrieMap<K, V>) node;
        final int treeMap = this.getTreeMap();
        final int leafMap = this.getLeafMap();
        final int slotMap = treeMap | leafMap;
        if (slotMap != 0) {
          switch (this.follow(treeMap, leafMap)) {
            case HashTrieMap.VOID:
              this.setTreeMap(treeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              break;
            case HashTrieMap.LEAF:
              final int slotIndex = this.getSlotIndex();
              final K key = tree.keyAt(slotIndex);
              this.setSlotIndex(slotIndex + 1);
              this.setLeafIndex(this.getLeafIndex() + 1);
              this.setTreeMap(treeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              return key;
            case HashTrieMap.TREE:
              this.push(tree.treeAt(this.getSlotIndex()));
              break;
            case HashTrieMap.KNOT:
              this.push(tree.knotAt(this.getSlotIndex()));
              break;
            default:
              throw new AssertionError();
          }
        } else if (this.depth > 0) {
          this.pop();
        } else {
          throw new NoSuchElementException();
        }
      } else if (node instanceof ArrayMap<?, ?>) {
        final ArrayMap<K, V> knot = (ArrayMap<K, V>) node;
        final int slotIndex = this.getSlotIndex();
        if (slotIndex < knot.size()) {
          final K key = knot.keyAt(slotIndex);
          this.setSlotIndex(slotIndex + 1);
          return key;
        } else {
          this.pop();
        }
      } else {
        throw new AssertionError();
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  protected V nextValue() {
    do {
      final Object node = this.getNode();
      if (node instanceof HashTrieMap<?, ?>) {
        final HashTrieMap<K, V> tree = (HashTrieMap<K, V>) node;
        final int treeMap = this.getTreeMap();
        final int leafMap = this.getLeafMap();
        final int slotMap = treeMap | leafMap;
        if (slotMap != 0) {
          switch (this.follow(treeMap, leafMap)) {
            case HashTrieMap.VOID:
              this.setTreeMap(treeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              break;
            case HashTrieMap.LEAF:
              final int leafIndex = this.getLeafIndex();
              final V value = tree.valueAt(leafIndex);
              this.setSlotIndex(this.getSlotIndex() + 1);
              this.setLeafIndex(leafIndex + 1);
              this.setTreeMap(treeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              return value;
            case HashTrieMap.TREE:
              this.push(tree.treeAt(this.getSlotIndex()));
              break;
            case HashTrieMap.KNOT:
              this.push(tree.knotAt(this.getSlotIndex()));
              break;
            default:
              throw new AssertionError();
          }
        } else if (this.depth > 0) {
          this.pop();
        } else {
          throw new NoSuchElementException();
        }
      } else if (node instanceof ArrayMap<?, ?>) {
        final ArrayMap<K, V> knot = (ArrayMap<K, V>) node;
        final int slotIndex = this.getSlotIndex();
        if (slotIndex < knot.size()) {
          final V value = knot.valueAt(slotIndex);
          this.setSlotIndex(slotIndex + 1);
          return value;
        } else {
          this.pop();
        }
      } else {
        throw new AssertionError();
      }
    } while (true);
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
    return this.nextEntry();
  }

}

final class HashTrieMapKeyIterator<K, V> extends HashTrieMapIterator<K, V> implements Iterator<K> {

  HashTrieMapKeyIterator(HashTrieMap<K, V> tree) {
    super(tree);
  }

  @Override
  public K next() {
    return this.nextKey();
  }

}

final class HashTrieMapValueIterator<K, V> extends HashTrieMapIterator<K, V> implements Iterator<V> {

  HashTrieMapValueIterator(HashTrieMap<K, V> tree) {
    super(tree);
  }

  @Override
  public V next() {
    return this.nextValue();
  }

}

final class HashTrieMapEntrySet<K, V> extends AbstractSet<Map.Entry<K, V>> {

  final HashTrieMap<K, V> map;

  HashTrieMapEntrySet(HashTrieMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Iterator<Map.Entry<K, V>> iterator() {
    return this.map.iterator();
  }

}

final class HashTrieMapKeySet<K, V> extends AbstractSet<K> {

  final HashTrieMap<K, V> map;

  HashTrieMapKeySet(HashTrieMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Iterator<K> iterator() {
    return this.map.keyIterator();
  }

}

final class HashTrieMapValues<K, V> extends AbstractCollection<V> {

  final HashTrieMap<K, V> map;

  HashTrieMapValues(HashTrieMap<K, V> map) {
    this.map = map;
  }

  @Override
  public int size() {
    return this.map.size();
  }

  @Override
  public Iterator<V> iterator() {
    return this.map.valueIterator();
  }

}
