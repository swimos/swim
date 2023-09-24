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

import java.util.AbstractCollection;
import java.util.AbstractMap.SimpleImmutableEntry;
import java.util.AbstractSet;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.UpdatableMap;
import swim.util.WriteMarkup;
import swim.util.WriteSource;

@Public
@Since("5.0")
public final class HashTrieMap<K, V> implements Iterable<Map.Entry<K, V>>, UpdatableMap<K, V>, WriteMarkup, WriteSource {

  final int nodeMap;
  final int leafMap;
  final int size;
  final Object[] slots;

  HashTrieMap(int nodeMap, int leafMap, int size, Object[] slots) {
    this.nodeMap = nodeMap;
    this.leafMap = leafMap;
    this.size = size;
    this.slots = slots;
  }

  @Override
  public boolean isEmpty() {
    return this.size == 0;
  }

  @Override
  public int size() {
    return this.size;
  }

  @Override
  public boolean containsKey(@Nullable Object key) {
    HashTrieMap<K, V> tree = this;
    final int hash = Objects.hashCode(key);
    int shift = 0;
    while (true) {
      final int branch = 1 << ((hash >>> shift) & 0x1F);
      switch (tree.getBranchType(branch)) {
        case VOID:
          return false;
        case LEAF:
          return Objects.equals(key, tree.getKey(branch));
        case TREE:
          tree = tree.getTree(branch);
          shift += 5;
          break;
        case KNOT:
          return tree.getKnot(branch).containsKey(key);
        default:
          throw new AssertionError("unreachable");
      }
    }
  }

  @Override
  public boolean containsValue(@Nullable Object value) {
    int i = 0;
    int j = 0;
    int nodeMap = this.nodeMap;
    int leafMap = this.leafMap;
    while ((nodeMap | leafMap) != 0) {
      switch ((leafMap & 1) | (nodeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          if (Objects.equals(value == null, this.valueAt(j))) {
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
          throw new AssertionError("unreachable");
      }
      nodeMap >>>= 1;
      leafMap >>>= 1;
    }
    return false;
  }

  public Map.@Nullable Entry<K, V> head() {
    HashTrieMap<K, V> tree = this;
    loop: do {
      int nodeMap = tree.nodeMap;
      int leafMap = tree.leafMap;
      while ((nodeMap | leafMap) != 0) {
        switch ((leafMap & 1) | (nodeMap & 1) << 1) {
          case VOID:
            break;
          case LEAF:
            return new SimpleImmutableEntry<K, V>(tree.keyAt(0), tree.valueAt(0));
          case TREE:
            tree = tree.treeAt(0);
            continue loop;
          case KNOT:
            return tree.knotAt(0).head();
          default:
            throw new AssertionError("unreachable");
        }
        nodeMap >>>= 1;
        leafMap >>>= 1;
      }
      return null;
    } while (true);
  }

  public @Nullable K headKey() {
    HashTrieMap<K, V> tree = this;
    loop: do {
      int nodeMap = tree.nodeMap;
      int leafMap = tree.leafMap;
      while ((nodeMap | leafMap) != 0) {
        switch ((leafMap & 1) | (nodeMap & 1) << 1) {
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
            throw new AssertionError("unreachable");
        }
        nodeMap >>>= 1;
        leafMap >>>= 1;
      }
      return null;
    } while (true);
  }

  public @Nullable V headValue() {
    HashTrieMap<K, V> tree = this;
    loop: do {
      int nodeMap = tree.nodeMap;
      int leafMap = tree.leafMap;
      while ((nodeMap | leafMap) != 0) {
        switch ((leafMap & 1) | (nodeMap & 1) << 1) {
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
            throw new AssertionError("unreachable");
        }
        nodeMap >>>= 1;
        leafMap >>>= 1;
      }
      return null;
    } while (true);
  }

  public Map.@Nullable Entry<K, V> next(@Nullable Object key) {
    return this.next(key, Objects.hashCode(key), 0);
  }

  private Map.@Nullable Entry<K, V> next(@Nullable Object key, int hash, int shift) {
    final int block;
    if (key == null) {
      block = 0;
    } else {
      block = (hash >>> shift) & 0x1F;
    }
    int branch = 1 << block;
    int nodeMap = this.nodeMap >>> block;
    int leafMap = this.leafMap >>> block;
    Map.Entry<K, V> nextEntry;
    while ((nodeMap | leafMap) != 0) {
      switch ((leafMap & 1) | (nodeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          if (key == null) {
            return new SimpleImmutableEntry<K, V>(this.getKey(branch), this.getValue(branch));
          }
          break;
        case TREE:
          nextEntry = this.getTree(branch).next(key, hash, shift + 5);
          if (nextEntry != null) {
            return nextEntry;
          }
          break;
        case KNOT:
          nextEntry = this.getKnot(branch).next(key);
          if (nextEntry != null) {
            return nextEntry;
          }
          break;
        default:
          throw new AssertionError("unreachable");
      }
      key = null;
      hash = 0;
      nodeMap >>>= 1;
      leafMap >>>= 1;
      branch <<= 1;
    }
    return null;
  }

  public @Nullable K nextKey(@Nullable Object key) {
    return this.nextKey(key, Objects.hashCode(key), 0);
  }

  private @Nullable K nextKey(@Nullable Object key, int hash, int shift) {
    final int block;
    if (key == null) {
      block = 0;
    } else {
      block = (hash >>> shift) & 0x1F;
    }
    int branch = 1 << block;
    int nodeMap = this.nodeMap >>> block;
    int leafMap = this.leafMap >>> block;
    K next;
    while ((nodeMap | leafMap) != 0) {
      switch ((leafMap & 1) | (nodeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          if (key == null) {
            return this.getKey(branch);
          }
          break;
        case TREE:
          next = this.getTree(branch).nextKey(key, hash, shift + 5);
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
          throw new AssertionError("unreachable");
      }
      key = null;
      hash = 0;
      nodeMap >>>= 1;
      leafMap >>>= 1;
      branch <<= 1;
    }
    return null;
  }

  public @Nullable V nextValue(@Nullable Object key) {
    return this.nextValue(key, Objects.hashCode(key), 0);
  }

  private @Nullable V nextValue(@Nullable Object key, int hash, int shift) {
    final int block;
    if (key == null) {
      block = 0;
    } else {
      block = (hash >>> shift) & 0x1F;
    }
    int branch = 1 << block;
    int nodeMap = this.nodeMap >>> block;
    int leafMap = this.leafMap >>> block;
    V next;
    while ((nodeMap | leafMap) != 0) {
      switch ((leafMap & 1) | (nodeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          if (key == null) {
            return this.getValue(branch);
          }
          break;
        case TREE:
          next = this.getTree(branch).nextValue(key, hash, shift + 5);
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
          throw new AssertionError("unreachable");
      }
      key = null;
      hash = 0;
      nodeMap >>>= 1;
      leafMap >>>= 1;
      branch <<= 1;
    }
    return null;
  }

  @Override
  public @Nullable V get(@Nullable Object key) {
    HashTrieMap<K, V> tree = this;
    final int hash = Objects.hashCode(key);
    int shift = 0;
    do {
      final int branch = 1 << ((hash >>> shift) & 0x1F);
      switch (tree.getBranchType(branch)) {
        case VOID:
          return null;
        case LEAF:
          if (Objects.equals(key, tree.getKey(branch))) {
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
          throw new AssertionError("unreachable");
      }
    } while (true);
  }

  @Override
  public @Nullable V put(@Nullable K key, @Nullable V value) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void putAll(Map<? extends K, ? extends V> map) {
    throw new UnsupportedOperationException();
  }

  @Override
  public HashTrieMap<K, V> updated(@Nullable K key, @Nullable V value) {
    return this.updated(key, Objects.hashCode(key), value, 0);
  }

  public HashTrieMap<K, V> updated(Map<? extends K, ? extends V> map) {
    HashTrieMap<K, V> these = this;
    for (Map.Entry<? extends K, ? extends V> entry : map.entrySet()) {
      these = these.updated(entry.getKey(), entry.getValue());
    }
    return these;
  }

  @SuppressWarnings("ReferenceEquality")
  private HashTrieMap<K, V> updated(@Nullable K key, int hash, @Nullable V value, int shift) {
    final int branch = 1 << ((hash >>> shift) & 0x1F);
    switch (this.getBranchType(branch)) {
      case VOID:
        return this.remap(this.nodeMap, this.leafMap | branch, this.size + 1)
                   .setLeaf(branch, key, value);
      case LEAF:
        final K leaf = this.getKey(branch);
        final int leafHash = Objects.hashCode(leaf);
        if (hash == leafHash && Objects.equals(key, leaf)) {
          final V v = this.getValue(branch);
          if (value == v) {
            return this;
          } else {
            return this.remap(this.nodeMap, this.leafMap, this.size)
                       .setLeaf(branch, key, value);
          }
        } else if (hash != leafHash) {
          return this.remap(this.nodeMap | branch, this.leafMap ^ branch, this.size + 1)
                     .setTree(branch, this.merge(leaf, leafHash, this.getValue(branch), key, hash, value, shift + 5));
        } else {
          return this.remap(this.nodeMap | branch, this.leafMap, this.size + 1)
                     .setKnot(branch, new ArrayMap<K, V>(new Object[] {leaf, this.getValue(branch), key, value}));
        }
      case TREE:
        final HashTrieMap<K, V> oldTree = this.getTree(branch);
        final HashTrieMap<K, V> newTree = oldTree.updated(key, hash, value, shift + 5);
        if (oldTree == newTree) {
          return this;
        } else {
          return this.remap(this.nodeMap, this.leafMap, this.size + (newTree.size - oldTree.size))
                     .setTree(branch, newTree);
        }
      case KNOT:
        final ArrayMap<K, V> oldKnot = this.getKnot(branch);
        final ArrayMap<K, V> newKnot = oldKnot.updated(key, value);
        if (oldKnot == newKnot) {
          return this;
        } else {
          return this.remap(this.nodeMap, this.leafMap, this.size + (newKnot.size() - oldKnot.size()))
                     .setKnot(branch, newKnot);
        }
      default:
        throw new AssertionError("unreachable");
    }
  }

  @Override
  public @Nullable V remove(@Nullable Object key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public HashTrieMap<K, V> removed(@Nullable Object key) {
    return this.removed(key, Objects.hashCode(key), 0);
  }

  @SuppressWarnings("ReferenceEquality")
  private HashTrieMap<K, V> removed(@Nullable Object key, int hash, int shift) {
    final int branch = 1 << ((hash >>> shift) & 0x1F);
    switch (this.getBranchType(branch)) {
      case VOID:
        return this;
      case LEAF:
        if (!Objects.equals(key, this.getKey(branch))) {
          return this;
        } else {
          return this.remap(this.nodeMap, this.leafMap ^ branch, this.size - 1);
        }
      case TREE:
        final HashTrieMap<K, V> oldTree = this.getTree(branch);
        final HashTrieMap<K, V> newTree = oldTree.removed(key, hash, shift + 5);
        if (oldTree == newTree) {
          return this;
        } else if (newTree.isEmpty()) {
          return this.remap(this.nodeMap ^ branch, this.leafMap, this.size - 1);
        } else if (newTree.isUnary()) {
          return this.remap(this.nodeMap ^ branch, this.leafMap | branch, this.size - 1)
                     .setLeaf(branch, newTree.unaryKey(), newTree.unaryValue());
        } else {
          return this.remap(this.nodeMap, this.leafMap, this.size - 1)
                     .setTree(branch, newTree);
        }
      case KNOT:
        final ArrayMap<K, V> oldKnot = this.getKnot(branch);
        final ArrayMap<K, V> newKnot = oldKnot.removed(key);
        if (oldKnot == newKnot) {
          return this;
        } else if (newKnot.isEmpty()) {
          return this.remap(this.nodeMap ^ branch, this.leafMap, this.size - 1);
        } else if (newKnot.isUnary()) {
          return this.remap(this.nodeMap ^ branch, this.leafMap | branch, this.size - 1)
                     .setLeaf(branch, newKnot.unaryKey(), newKnot.unaryValue());
        } else {
          return this.remap(this.nodeMap, this.leafMap, this.size - 1)
                     .setKnot(branch, newKnot);
        }
      default:
        throw new AssertionError("unreachable");
    }
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  int getBranchType(int branch) {
    return ((this.leafMap & branch) != 0 ? 1 : 0) | ((this.nodeMap & branch) != 0 ? 2 : 0);
  }

  int getBranchIndex(int branch) {
    return Integer.bitCount((this.nodeMap | this.leafMap) & (branch - 1));
  }

  int getValueIndex(int branch) {
    return Integer.bitCount(this.leafMap & (branch - 1));
  }

  boolean isUnary() {
    return this.nodeMap == 0 && Integer.bitCount(this.leafMap) == 1;
  }

  @Nullable K unaryKey() {
    return Assume.conformsNullable(this.slots[0]);
  }

  @Nullable V unaryValue() {
    return Assume.conformsNullable(this.slots[this.slots.length - 1]);
  }

  @Nullable K keyAt(int index) {
    return Assume.conformsNullable(this.slots[index]);
  }

  @Nullable K getKey(int branch) {
    return Assume.conformsNullable(this.slots[this.getBranchIndex(branch)]);
  }

  @Nullable V valueAt(int index) {
    return Assume.conformsNullable(this.slots[this.slots.length - index - 1]);
  }

  @Nullable V getValue(int branch) {
    return Assume.conformsNullable(this.slots[this.slots.length - this.getValueIndex(branch) - 1]);
  }

  HashTrieMap<K, V> setLeaf(int branch, @Nullable K key, @Nullable V value) {
    this.slots[this.getBranchIndex(branch)] = key;
    this.slots[this.slots.length - this.getValueIndex(branch) - 1] = value;
    return this;
  }

  HashTrieMap<K, V> treeAt(int index) {
    return Assume.conforms(this.slots[index]);
  }

  HashTrieMap<K, V> getTree(int branch) {
    return Assume.conforms(this.slots[this.getBranchIndex(branch)]);
  }

  HashTrieMap<K, V> setTree(int branch, HashTrieMap<K, V> tree) {
    this.slots[this.getBranchIndex(branch)] = tree;
    return this;
  }

  ArrayMap<K, V> knotAt(int index) {
    return Assume.conforms(this.slots[index]);
  }

  ArrayMap<K, V> getKnot(int branch) {
    return Assume.conforms(this.slots[this.getBranchIndex(branch)]);
  }

  HashTrieMap<K, V> setKnot(int branch, ArrayMap<K, V> knot) {
    this.slots[this.getBranchIndex(branch)] = knot;
    return this;
  }

  HashTrieMap<K, V> remap(int nodeMap, int leafMap, int size) {
    int oldLeafMap = this.leafMap;
    int newLeafMap = leafMap;
    int oldSlotMap = this.nodeMap | oldLeafMap;
    int newSlotMap = nodeMap | leafMap;
    final Object[] oldSlots = this.slots;
    if (oldLeafMap == newLeafMap && oldSlotMap == newSlotMap) {
      return new HashTrieMap<K, V>(nodeMap, leafMap, size, oldSlots.clone());
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
      return new HashTrieMap<K, V>(nodeMap, leafMap, size, newSlots);
    }
  }

  HashTrieMap<K, V> merge(@Nullable K key0, int hash0, @Nullable V value0,
                          @Nullable K key1, int hash1, @Nullable V value1,
                          int shift) {
    // assume(hash0 != hash1)
    final int branch0 = 1 << ((hash0 >>> shift) & 0x1F);
    final int branch1 = 1 << ((hash1 >>> shift) & 0x1F);
    final int slotMap = branch0 | branch1;
    if (branch0 == branch1) {
      final Object[] slots = new Object[1];
      slots[0] = this.merge(key0, hash0, value0, key1, hash1, value1, shift + 5);
      return new HashTrieMap<K, V>(slotMap, 0, 2, slots);
    }
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
    return new HashTrieMap<K, V>(0, slotMap, 2, slots);
  }

  @Override
  public void forEach(BiConsumer<? super K, ? super V> action) {
    int i = 0;
    int j = 0;
    int nodeMap = this.nodeMap;
    int leafMap = this.leafMap;
    while ((nodeMap | leafMap) != 0) {
      switch ((leafMap & 1) | (nodeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          action.accept(this.keyAt(i), this.valueAt(j));
          i += 1;
          j += 1;
          break;
        case TREE:
          this.treeAt(i).forEach(action);
          i += 1;
          break;
        case KNOT:
          this.knotAt(i).forEach(action);
          i += 1;
          break;
        default:
          throw new AssertionError("unreachable");
      }
      nodeMap >>>= 1;
      leafMap >>>= 1;
    }
  }

  @Override
  public void forEach(Consumer<? super Map.Entry<K, V>> action) {
    int i = 0;
    int j = 0;
    int nodeMap = this.nodeMap;
    int leafMap = this.leafMap;
    while ((nodeMap | leafMap) != 0) {
      switch ((leafMap & 1) | (nodeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          action.accept(new SimpleImmutableEntry<K, V>(this.keyAt(i), this.valueAt(j)));
          i += 1;
          j += 1;
          break;
        case TREE:
          this.treeAt(i).forEach(action);
          i += 1;
          break;
        case KNOT:
          this.knotAt(i).forEach(action);
          i += 1;
          break;
        default:
          throw new AssertionError("unreachable");
      }
      nodeMap >>>= 1;
      leafMap >>>= 1;
    }
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

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map<?, ?> that) {
      return this.entrySet().equals(that.entrySet());
    }
    return false;
  }

  @Override
  public int hashCode() {
    int code = 0;
    for (Map.Entry<K, V> entry : this) {
      code += entry.hashCode();
    }
    return code;
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    if (notation.options().verbose()) {
      notation.beginObject("HashTrieMap");
      int i = 0;
      int j = 0;
      int nodeMap = this.nodeMap;
      int leafMap = this.leafMap;
      notation.appendKey("nodeMap")
              .beginValue()
              .append("0x").append(Long.toHexString(nodeMap))
              .endValue();
      notation.appendKey("leafMap")
              .beginValue()
              .append("0x").append(Long.toHexString(leafMap))
              .endValue();
      notation.appendField("size", this.size);
      notation.appendKey("branches")
              .beginValue();
      notation.beginArray();
      while ((nodeMap | leafMap) != 0) {
        switch ((leafMap & 1) | (nodeMap & 1) << 1) {
          case VOID:
            break;
          case LEAF:
            notation.appendElement(this.keyAt(i));
            i += 1;
            j += 1;
            break;
          case TREE:
            notation.appendElement(this.treeAt(i));
            i += 1;
            break;
          case KNOT:
            notation.appendElement(this.knotAt(i));
            i += 1;
            break;
          default:
            throw new AssertionError("unreachable");
        }
        nodeMap >>>= 1;
        leafMap >>>= 1;
      }
      while (j > 0) {
        j -= 1;
        notation.appendElement(this.valueAt(j));
      }
      notation.endArray();
      notation.endValue();
      notation.endObject();
    } else {
      notation.beginObject("HashTrieMap");
      this.writeFields(notation);
      notation.endObject();
    }
  }

  void writeFields(Notation notation) {
    int i = 0;
    int j = 0;
    int nodeMap = this.nodeMap;
    int leafMap = this.leafMap;
    while ((nodeMap | leafMap) != 0) {
      switch ((leafMap & 1) | (nodeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          notation.appendField(this.keyAt(i), this.valueAt(j));
          i += 1;
          j += 1;
          break;
        case TREE:
          this.treeAt(i).writeFields(notation);
          i += 1;
          break;
        case KNOT:
          this.knotAt(i).writeFields(notation);
          i += 1;
          break;
        default:
          throw new AssertionError("unreachable");
      }
      nodeMap >>>= 1;
      leafMap >>>= 1;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HashTrieMap", "empty").endInvoke();
    this.writeUpdated(notation);
  }

  void writeUpdated(Notation notation) {
    int i = 0;
    int j = 0;
    int nodeMap = this.nodeMap;
    int leafMap = this.leafMap;
    while ((nodeMap | leafMap) != 0) {
      switch ((leafMap & 1) | (nodeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          notation.beginInvoke("updated")
                  .appendArgument(this.keyAt(i))
                  .appendArgument(this.valueAt(j))
                  .endInvoke();
          i += 1;
          j += 1;
          break;
        case TREE:
          this.treeAt(i).writeUpdated(notation);
          i += 1;
          break;
        case KNOT:
          this.knotAt(i).writeUpdated(notation);
          i += 1;
          break;
        default:
          throw new AssertionError("unreachable");
      }
      nodeMap >>>= 1;
      leafMap >>>= 1;
    }
  }

  @Override
  public String toString() {
    return WriteSource.toString(this);
  }

  static final int VOID = 0;
  static final int LEAF = 1;
  static final int TREE = 2;
  static final int KNOT = 3;

  static final HashTrieMap<Object, Object> EMPTY = new HashTrieMap<Object, Object>(0, 0, 0, new Object[0]);

  public static <K, V> HashTrieMap<K, V> empty() {
    return Assume.conforms(EMPTY);
  }

  public static <K, V> HashTrieMap<K, V> of(@Nullable K k1, @Nullable V v1) {
    HashTrieMap<K, V> map = HashTrieMap.empty();
    map = map.updated(k1, v1);
    return map;
  }

  public static <K, V> HashTrieMap<K, V> of(@Nullable K k1, @Nullable V v1, @Nullable K k2, @Nullable V v2) {
    HashTrieMap<K, V> map = HashTrieMap.empty();
    map = map.updated(k1, v1);
    map = map.updated(k2, v2);
    return map;
  }

  public static <K, V> HashTrieMap<K, V> from(Map<? extends K, ? extends V> map) {
    HashTrieMap<K, V> trie = HashTrieMap.empty();
    for (Map.Entry<? extends K, ? extends V> entry : map.entrySet()) {
      trie = trie.updated(entry.getKey(), entry.getValue());
    }
    return trie;
  }

  public static int compareKeys(@Nullable Object a, @Nullable Object b) {
    if (a != null && b != null) {
      return HashTrieMap.compareKeyHashes(Objects.hashCode(a), Objects.hashCode(b));
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
    this.setNodeMap(tree.nodeMap);
    this.setLeafMap(tree.leafMap);
  }

  final @Nullable Object getNode() {
    return this.nodes[this.depth];
  }

  final void setNode(@Nullable Object node) {
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

  final int getNodeMap() {
    return this.stack[this.stackPointer + 2];
  }

  final void setNodeMap(int nodeMap) {
    this.stack[this.stackPointer + 2] = nodeMap;
  }

  final int getLeafMap() {
    return this.stack[this.stackPointer + 3];
  }

  final void setLeafMap(int leafMap) {
    this.stack[this.stackPointer + 3] = leafMap;
  }

  final int getBranchType(int nodeMap, int leafMap) {
    return (leafMap & 1) | (nodeMap & 1) << 1;
  }

  final void push(HashTrieMap<K, V> tree) {
    this.depth += 1;
    this.setNode(tree);

    this.stackPointer += 4;
    this.setSlotIndex(0);
    this.setLeafIndex(0);
    this.setNodeMap(tree.nodeMap);
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
    this.setNodeMap(0);
    this.setLeafMap(0);
    this.stackPointer -= 4;

    this.setSlotIndex(this.getSlotIndex() + 1);
    this.setNodeMap(this.getNodeMap() >>> 1);
    this.setLeafMap(this.getLeafMap() >>> 1);
  }

  public boolean hasNext() {
    do {
      final Object node = this.getNode();
      if (node instanceof HashTrieMap<?, ?>) {
        final HashTrieMap<K, V> tree = Assume.conforms(node);
        final int nodeMap = this.getNodeMap();
        final int leafMap = this.getLeafMap();
        if ((nodeMap | leafMap) != 0) {
          switch (this.getBranchType(nodeMap, leafMap)) {
            case HashTrieMap.VOID:
              this.setNodeMap(nodeMap >>> 1);
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
              throw new AssertionError("unreachable");
          }
          continue;
        } else if (this.depth > 0) {
          this.pop();
          continue;
        } else {
          return false;
        }
      } else if (node instanceof ArrayMap<?, ?>) {
        final ArrayMap<K, V> knot = Assume.conforms(node);
        if (this.getSlotIndex() < knot.size()) {
          return true;
        } else {
          this.pop();
          continue;
        }
      }
      throw new AssertionError("unreachable");
    } while (true);
  }

  protected Map.Entry<K, V> nextEntry() {
    do {
      final Object node = this.getNode();
      if (node instanceof HashTrieMap<?, ?>) {
        final HashTrieMap<K, V> tree = Assume.conforms(node);
        final int nodeMap = this.getNodeMap();
        final int leafMap = this.getLeafMap();
        final int slotMap = nodeMap | leafMap;
        if (slotMap != 0) {
          switch (this.getBranchType(nodeMap, leafMap)) {
            case HashTrieMap.VOID:
              this.setNodeMap(nodeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              break;
            case HashTrieMap.LEAF:
              final int slotIndex = this.getSlotIndex();
              final int leafIndex = this.getLeafIndex();
              final K key = tree.keyAt(slotIndex);
              final V value = tree.valueAt(leafIndex);
              this.setSlotIndex(slotIndex + 1);
              this.setLeafIndex(leafIndex + 1);
              this.setNodeMap(nodeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              return new SimpleImmutableEntry<K, V>(key, value);
            case HashTrieMap.TREE:
              this.push(tree.treeAt(this.getSlotIndex()));
              break;
            case HashTrieMap.KNOT:
              this.push(tree.knotAt(this.getSlotIndex()));
              break;
            default:
              throw new AssertionError("unreachable");
          }
          continue;
        } else if (this.depth > 0) {
          this.pop();
          continue;
        }
        throw new NoSuchElementException();
      } else if (node instanceof ArrayMap<?, ?>) {
        final ArrayMap<K, V> knot = Assume.conforms(node);
        final int slotIndex = this.getSlotIndex();
        if (slotIndex < knot.size()) {
          final K key = knot.keyAt(slotIndex);
          final V value = knot.valueAt(slotIndex);
          this.setSlotIndex(slotIndex + 1);
          return new SimpleImmutableEntry<K, V>(key, value);
        } else {
          this.pop();
          continue;
        }
      }
      throw new AssertionError("unreachable");
    } while (true);
  }

  protected @Nullable K nextKey() {
    do {
      final Object node = this.getNode();
      if (node instanceof HashTrieMap<?, ?>) {
        final HashTrieMap<K, V> tree = Assume.conforms(node);
        final int nodeMap = this.getNodeMap();
        final int leafMap = this.getLeafMap();
        final int slotMap = nodeMap | leafMap;
        if (slotMap != 0) {
          switch (this.getBranchType(nodeMap, leafMap)) {
            case HashTrieMap.VOID:
              this.setNodeMap(nodeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              break;
            case HashTrieMap.LEAF:
              final int slotIndex = this.getSlotIndex();
              final K key = tree.keyAt(slotIndex);
              this.setSlotIndex(slotIndex + 1);
              this.setLeafIndex(this.getLeafIndex() + 1);
              this.setNodeMap(nodeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              return key;
            case HashTrieMap.TREE:
              this.push(tree.treeAt(this.getSlotIndex()));
              break;
            case HashTrieMap.KNOT:
              this.push(tree.knotAt(this.getSlotIndex()));
              break;
            default:
              throw new AssertionError("unreachable");
          }
          continue;
        } else if (this.depth > 0) {
          this.pop();
          continue;
        }
        throw new NoSuchElementException();
      } else if (node instanceof ArrayMap<?, ?>) {
        final ArrayMap<K, V> knot = Assume.conforms(node);
        final int slotIndex = this.getSlotIndex();
        if (slotIndex < knot.size()) {
          final K key = knot.keyAt(slotIndex);
          this.setSlotIndex(slotIndex + 1);
          return key;
        } else {
          this.pop();
          continue;
        }
      }
      throw new AssertionError("unreachable");
    } while (true);
  }

  protected @Nullable V nextValue() {
    do {
      final Object node = this.getNode();
      if (node instanceof HashTrieMap<?, ?>) {
        final HashTrieMap<K, V> tree = Assume.conforms(node);
        final int nodeMap = this.getNodeMap();
        final int leafMap = this.getLeafMap();
        final int slotMap = nodeMap | leafMap;
        if (slotMap != 0) {
          switch (this.getBranchType(nodeMap, leafMap)) {
            case HashTrieMap.VOID:
              this.setNodeMap(nodeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              break;
            case HashTrieMap.LEAF:
              final int leafIndex = this.getLeafIndex();
              final V value = tree.valueAt(leafIndex);
              this.setSlotIndex(this.getSlotIndex() + 1);
              this.setLeafIndex(leafIndex + 1);
              this.setNodeMap(nodeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              return value;
            case HashTrieMap.TREE:
              this.push(tree.treeAt(this.getSlotIndex()));
              break;
            case HashTrieMap.KNOT:
              this.push(tree.knotAt(this.getSlotIndex()));
              break;
            default:
              throw new AssertionError("unreachable");
          }
          continue;
        } else if (this.depth > 0) {
          this.pop();
          continue;
        }
        throw new NoSuchElementException();
      } else if (node instanceof ArrayMap<?, ?>) {
        final ArrayMap<K, V> knot = Assume.conforms(node);
        final int slotIndex = this.getSlotIndex();
        if (slotIndex < knot.size()) {
          final V value = knot.valueAt(slotIndex);
          this.setSlotIndex(slotIndex + 1);
          return value;
        } else {
          this.pop();
          continue;
        }
      }
      throw new AssertionError("unreachable");
    } while (true);
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

final class HashTrieMapKeyIterator<K, V> extends HashTrieMapIterator<K, V> implements Iterator<K> {

  HashTrieMapKeyIterator(HashTrieMap<K, V> tree) {
    super(tree);
  }

  @Override
  public @Nullable K next() {
    return this.nextKey();
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

final class HashTrieMapValueIterator<K, V> extends HashTrieMapIterator<K, V> implements Iterator<V> {

  HashTrieMapValueIterator(HashTrieMap<K, V> tree) {
    super(tree);
  }

  @Override
  public @Nullable V next() {
    return this.nextValue();
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
