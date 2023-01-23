// Copyright 2015-2023 Swim.inc
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

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.Set;
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;
import swim.util.Murmur3;

public final class HashTrieSet<T> implements Set<T>, Debug {

  final int treeMap;
  final int leafMap;
  final Object[] slots;

  HashTrieSet(int treeMap, int leafMap, Object[] slots) {
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
  public boolean contains(Object elem) {
    if (elem != null) {
      return HashTrieSet.contains(this, elem, Murmur3.hash(elem), 0);
    } else {
      return false;
    }
  }

  static boolean contains(HashTrieSet<?> tree, Object elem, int elemHash, int shift) {
    do {
      final int branch = tree.choose(elemHash, shift);
      switch (tree.follow(branch)) {
        case VOID:
          return false;
        case LEAF:
          return elem.equals(tree.getLeaf(branch));
        case TREE:
          tree = tree.getTree(branch);
          shift += 5;
          break;
        case KNOT:
          return tree.getKnot(branch).contains(elem);
        default:
          throw new AssertionError();
      }
    } while (true);
  }

  @Override
  public boolean containsAll(Collection<?> elems) {
    for (Object elem : elems) {
      if (!this.contains(elem)) {
        return false;
      }
    }
    return true;
  }

  public T head() {
    return HashTrieSet.head(this);
  }

  static <T> T head(HashTrieSet<T> tree) {
    loop: do {
      int treeMap = tree.treeMap;
      int leafMap = tree.leafMap;
      while ((treeMap | leafMap) != 0) {
        switch (leafMap & 1 | (treeMap & 1) << 1) {
          case VOID:
            break;
          case LEAF:
            return tree.leafAt(0);
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

  public T next(Object elem) {
    return this.next(elem, Murmur3.hash(elem), 0);
  }

  @Override
  public boolean add(T elem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(Collection<? extends T> elems) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean remove(Object elem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean removeAll(Collection<?> elems) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean retainAll(Collection<?> elems) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  public HashTrieSet<T> added(T elem) {
    return this.updated(elem, Murmur3.hash(elem), 0);
  }

  public HashTrieSet<T> added(Collection<? extends T> elems) {
    HashTrieSet<T> these = this;
    for (T elem : elems) {
      these = these.added(elem);
    }
    return these;
  }

  public HashTrieSet<T> merged(HashTrieSet<T> elems) {
    HashTrieSet<T> these = this;
    final Iterator<T> iter = elems.iterator();
    while (iter.hasNext()) {
      these = these.added(iter.next());
    }
    return these;
  }

  public HashTrieSet<T> removed(T elem) {
    if (elem != null) {
      return this.removed(elem, Murmur3.hash(elem), 0);
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

  int follow(int branch) {
    return ((this.leafMap & branch) != 0 ? 1 : 0) | ((this.treeMap & branch) != 0 ? 2 : 0);
  }

  @SuppressWarnings("unchecked")
  T leafAt(int index) {
    return (T) this.slots[index];
  }

  @SuppressWarnings("unchecked")
  T getLeaf(int branch) {
    return (T) this.slots[this.select(branch)];
  }

  HashTrieSet<T> setLeaf(int branch, T leaf) {
    this.slots[this.select(branch)] = leaf;
    return this;
  }

  @SuppressWarnings("unchecked")
  HashTrieSet<T> treeAt(int index) {
    return (HashTrieSet<T>) this.slots[index];
  }

  @SuppressWarnings("unchecked")
  HashTrieSet<T> getTree(int branch) {
    return (HashTrieSet<T>) this.slots[this.select(branch)];
  }

  HashTrieSet<T> setTree(int branch, HashTrieSet<T> tree) {
    this.slots[this.select(branch)] = tree;
    return this;
  }

  @SuppressWarnings("unchecked")
  ArraySet<T> knotAt(int index) {
    return (ArraySet<T>) this.slots[index];
  }

  @SuppressWarnings("unchecked")
  ArraySet<T> getKnot(int branch) {
    return (ArraySet<T>) this.slots[this.select(branch)];
  }

  HashTrieSet<T> setKnot(int branch, ArraySet<T> knot) {
    this.slots[this.select(branch)] = knot;
    return this;
  }

  boolean isUnary() {
    return this.treeMap == 0 && Integer.bitCount(this.leafMap) == 1;
  }

  @SuppressWarnings("unchecked")
  T unaryElem() {
    return (T) this.slots[0];
  }

  HashTrieSet<T> remap(int treeMap, int leafMap) {
    int oldSlotMap = this.treeMap | this.leafMap;
    int newSlotMap = treeMap | leafMap;
    final Object[] oldSlots = this.slots;
    if (oldSlotMap == newSlotMap) {
      return new HashTrieSet<T>(treeMap, leafMap, oldSlots.clone());
    } else {
      int i = 0;
      int j = 0;
      final Object[] newSlots = new Object[Integer.bitCount(newSlotMap)];
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
      return new HashTrieSet<T>(treeMap, leafMap, newSlots);
    }
  }

  T next(Object elem, int elemHash, int shift) {
    final int block;
    if (elem == null) {
      block = 0;
    } else {
      block = (elemHash >>> shift) & 0x1F;
    }
    int branch = 1 << block;
    int treeMap = this.treeMap >>> block;
    int leafMap = this.leafMap >>> block;
    T next;
    while ((treeMap | leafMap) != 0) {
      switch (leafMap & 1 | (treeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          if (elem == null) {
            return this.getLeaf(branch);
          }
          break;
        case TREE:
          next = this.getTree(branch).next(elem, elemHash, shift + 5);
          if (next != null) {
            return next;
          }
          break;
        case KNOT:
          next = this.getKnot(branch).next(elem);
          if (next != null) {
            return next;
          }
          break;
        default:
          throw new AssertionError();
      }
      elem = null;
      elemHash = 0;
      treeMap >>>= 1;
      leafMap >>>= 1;
      branch <<= 1;
    }
    return null;
  }

  HashTrieSet<T> updated(T elem, int elemHash, int shift) {
    final int branch = this.choose(elemHash, shift);
    switch (this.follow(branch)) {
      case VOID:
        return this.remap(this.treeMap, this.leafMap | branch).setLeaf(branch, elem);
      case LEAF:
        final T leaf = this.getLeaf(branch);
        final int leafHash = Murmur3.hash(leaf);
        if (elemHash == leafHash && elem.equals(leaf)) {
          return this;
        } else if (elemHash != leafHash) {
          return this.remap(this.treeMap | branch, this.leafMap ^ branch)
                     .setTree(branch, this.merge(leaf, leafHash, elem, elemHash, shift + 5));
        } else {
          return this.remap(this.treeMap | branch, this.leafMap)
                     .setKnot(branch, new ArraySet<T>(new Object[] {leaf, elem}));
        }
      case TREE:
        final HashTrieSet<T> oldTree = this.getTree(branch);
        final HashTrieSet<T> newTree = oldTree.updated(elem, elemHash, shift + 5);
        if (oldTree == newTree) {
          return this;
        } else {
          return this.remap(this.treeMap, this.leafMap).setTree(branch, newTree);
        }
      case KNOT:
        final ArraySet<T> oldKnot = this.getKnot(branch);
        final ArraySet<T> newKnot = oldKnot.added(elem);
        if (oldKnot == newKnot) {
          return this;
        } else {
          return this.remap(this.treeMap, this.leafMap).setKnot(branch, newKnot);
        }
      default:
        throw new AssertionError();
    }
  }

  HashTrieSet<T> merge(T elem0, int hash0, T elem1, int hash1, int shift) {
    // assume(hash0 != hash1)
    final int branch0 = this.choose(hash0, shift);
    final int branch1 = this.choose(hash1, shift);
    final int slotMap = branch0 | branch1;
    if (branch0 == branch1) {
      final Object[] slots = new Object[1];
      slots[0] = this.merge(elem0, hash0, elem1, hash1, shift + 5);
      return new HashTrieSet<T>(slotMap, 0, slots);
    } else {
      final Object[] slots = new Object[2];
      if (((branch0 - 1) & branch1) == 0) {
        slots[0] = elem0;
        slots[1] = elem1;
      } else {
        slots[0] = elem1;
        slots[1] = elem0;
      }
      return new HashTrieSet<T>(0, slotMap, slots);
    }
  }

  HashTrieSet<T> removed(T elem, int elemHash, int shift) {
    final int branch = this.choose(elemHash, shift);
    switch (this.follow(branch)) {
      case VOID:
        return this;
      case LEAF:
        if (!elem.equals(this.getLeaf(branch))) {
          return this;
        } else {
          return this.remap(this.treeMap, this.leafMap ^ branch);
        }
      case TREE:
        final HashTrieSet<T> oldTree = this.getTree(branch);
        final HashTrieSet<T> newTree = oldTree.removed(elem, elemHash, shift + 5);
        if (oldTree == newTree) {
          return this;
        } else if (newTree.isEmpty()) {
          return this.remap(this.treeMap ^ branch, this.leafMap);
        } else if (newTree.isUnary()) {
          return this.remap(this.treeMap ^ branch, this.leafMap | branch).setLeaf(branch, newTree.unaryElem());
        } else {
          return this.remap(this.treeMap, this.leafMap).setTree(branch, newTree);
        }
      case KNOT:
        final ArraySet<T> oldKnot = this.getKnot(branch);
        final ArraySet<T> newKnot = oldKnot.removed(elem);
        if (oldKnot == newKnot) {
          return this;
        } else if (newKnot.isEmpty()) {
          return this.remap(this.treeMap ^ branch, this.leafMap);
        } else if (newKnot.isUnary()) {
          return this.remap(this.treeMap ^ branch, this.leafMap | branch).setLeaf(branch, newKnot.unaryElem());
        } else {
          return this.remap(this.treeMap, this.leafMap).setKnot(branch, newKnot);
        }
      default:
        throw new AssertionError();
    }
  }

  @Override
  public Object[] toArray() {
    int i = 0;
    final Object[] array = new Object[this.size()];
    final Iterator<T> iter = this.iterator();
    while (iter.hasNext()) {
      array[i] = iter.next();
      i += 1;
    }
    return array;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <U> U[] toArray(U[] array) {
    int i = 0;
    final int n = this.size();
    if (array.length < n) {
      array = (U[]) Array.newInstance(array.getClass().getComponentType(), n);
    }
    final Iterator<T> iter = this.iterator();
    while (iter.hasNext()) {
      array[i] = (U) iter.next();
      i += 1;
    }
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  @Override
  public Iterator<T> iterator() {
    return new HashTrieSetIterator<T>(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Set<?>) {
      final Set<?> that = (Set<?>) other;
      if (this.size() == that.size()) {
        final Iterator<?> those = that.iterator();
        while (those.hasNext()) {
          if (!this.contains(those.next())) {
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
    final Iterator<T> these = this.iterator();
    while (these.hasNext()) {
      final T next = these.next();
      code += next == null ? 0 : next.hashCode();
    }
    return code;
  }

  @Override
  public <U> Output<U> debug(Output<U> output) {
    output = output.write("HashTrieSet").write('.');
    final Iterator<T> these = this.iterator();
    if (these.hasNext()) {
      output = output.write("of").write('(').debug(these.next());
      while (these.hasNext()) {
        output = output.write(", ").debug(these.next());
      }
    } else {
      output = output.write("empty").write('(');
    }
    output = output.write(')');
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

  private static HashTrieSet<Object> empty;

  @SuppressWarnings("unchecked")
  public static <T> HashTrieSet<T> empty() {
    if (HashTrieSet.empty == null) {
      HashTrieSet.empty = new HashTrieSet<Object>(0, 0, new Object[0]);
    }
    return (HashTrieSet<T>) HashTrieSet.empty;
  }

  @SuppressWarnings("unchecked")
  public static <T> HashTrieSet<T> of(T... elems) {
    HashTrieSet<T> trie = HashTrieSet.empty();
    for (T elem : elems) {
      trie = trie.added(elem);
    }
    return trie;
  }

  public static <T> HashTrieSet<T> from(Iterable<? extends T> elems) {
    HashTrieSet<T> trie = HashTrieSet.empty();
    for (T elem : elems) {
      trie = trie.added(elem);
    }
    return trie;
  }

}

final class HashTrieSetIterator<T> implements Iterator<T> {

  final Object[] nodes;
  final int[] stack;
  int depth;
  int stackPointer;

  HashTrieSetIterator(HashTrieSet<T> tree) {
    this.nodes = new Object[8];
    this.depth = 0;
    this.stack = new int[24];
    this.stackPointer = 0;
    this.setNode(tree);
    this.setSlotIndex(0);
    this.setTreeMap(tree.treeMap);
    this.setLeafMap(tree.leafMap);
  }

  Object getNode() {
    return this.nodes[this.depth];
  }

  void setNode(Object node) {
    this.nodes[this.depth] = node;
  }

  int getSlotIndex() {
    return this.stack[this.stackPointer];
  }

  void setSlotIndex(int index) {
    this.stack[this.stackPointer] = index;
  }

  int getTreeMap() {
    return this.stack[this.stackPointer + 1];
  }

  void setTreeMap(int treeMap) {
    this.stack[this.stackPointer + 1] = treeMap;
  }

  int getLeafMap() {
    return this.stack[this.stackPointer + 2];
  }

  void setLeafMap(int leafMap) {
    this.stack[this.stackPointer + 2] = leafMap;
  }

  int follow(int treeMap, int leafMap) {
    return leafMap & 1 | (treeMap & 1) << 1;
  }

  void push(HashTrieSet<T> tree) {
    this.depth += 1;
    this.setNode(tree);

    this.stackPointer += 3;
    this.setSlotIndex(0);
    this.setTreeMap(tree.treeMap);
    this.setLeafMap(tree.leafMap);
  }

  void push(ArraySet<T> knot) {
    this.depth += 1;
    this.setNode(knot);

    this.stackPointer += 3;
    this.setSlotIndex(0);
  }

  void pop() {
    this.setNode(null);
    this.depth -= 1;

    this.setSlotIndex(0);
    this.setTreeMap(0);
    this.setLeafMap(0);
    this.stackPointer -= 3;

    this.setSlotIndex(this.getSlotIndex() + 1);
    this.setTreeMap(this.getTreeMap() >>> 1);
    this.setLeafMap(this.getLeafMap() >>> 1);
  }

  @SuppressWarnings("unchecked")
  @Override
  public boolean hasNext() {
    do {
      final Object node = this.getNode();
      if (node instanceof HashTrieSet<?>) {
        final HashTrieSet<T> tree = (HashTrieSet<T>) node;
        final int treeMap = this.getTreeMap();
        final int leafMap = this.getLeafMap();
        if ((treeMap | leafMap) != 0) {
          switch (this.follow(treeMap, leafMap)) {
            case HashTrieSet.VOID:
              this.setTreeMap(treeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              break;
            case HashTrieSet.LEAF:
              return true;
            case HashTrieSet.TREE:
              this.push(tree.treeAt(this.getSlotIndex()));
              break;
            case HashTrieSet.KNOT:
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
      } else if (node instanceof ArraySet<?>) {
        final ArraySet<T> knot = (ArraySet<T>) node;
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
  @Override
  public T next() {
    do {
      final Object node = this.getNode();
      if (node instanceof HashTrieSet<?>) {
        final HashTrieSet<T> tree = (HashTrieSet<T>) node;
        final int treeMap = this.getTreeMap();
        final int leafMap = this.getLeafMap();
        final int slotMap = treeMap | leafMap;
        if (slotMap != 0) {
          switch (this.follow(treeMap, leafMap)) {
            case HashTrieSet.VOID:
              this.setTreeMap(treeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              break;
            case HashTrieSet.LEAF:
              final int slotIndex = this.getSlotIndex();
              final T elem = tree.leafAt(slotIndex);
              this.setSlotIndex(slotIndex + 1);
              this.setTreeMap(treeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              return elem;
            case HashTrieSet.TREE:
              this.push(tree.treeAt(this.getSlotIndex()));
              break;
            case HashTrieSet.KNOT:
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
      } else if (node instanceof ArraySet<?>) {
        final ArraySet<T> knot = (ArraySet<T>) node;
        final int slotIndex = this.getSlotIndex();
        if (slotIndex < knot.size()) {
          final T elem = knot.elemAt(slotIndex);
          this.setSlotIndex(slotIndex + 1);
          return elem;
        } else {
          this.pop();
        }
      } else {
        throw new AssertionError();
      }
    } while (true);
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }

}
