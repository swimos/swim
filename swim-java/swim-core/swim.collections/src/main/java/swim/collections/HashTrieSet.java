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

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.function.Consumer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToMarkup;
import swim.util.ToSource;
import swim.util.UpdatableSet;

@Public
@Since("5.0")
public final class HashTrieSet<T> implements UpdatableSet<T>, ToMarkup, ToSource {

  final int nodeMap;
  final int leafMap;
  final int size;
  final Object[] slots;

  HashTrieSet(int nodeMap, int leafMap, int size, Object[] slots) {
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
  public boolean contains(@Nullable Object elem) {
    HashTrieSet<T> tree = this;
    final int hash = Objects.hashCode(elem);
    int shift = 0;
    do {
      final int branch = 1 << ((hash >>> shift) & 0x1F);
      switch (tree.getBranchType(branch)) {
        case VOID:
          return false;
        case LEAF:
          return Objects.equals(elem, tree.getLeaf(branch));
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

  public @Nullable T head() {
    HashTrieSet<T> tree = this;
    loop: do {
      int nodeMap = tree.nodeMap;
      int leafMap = tree.leafMap;
      while ((nodeMap | leafMap) != 0) {
        switch ((leafMap & 1) | (nodeMap & 1) << 1) {
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
        nodeMap >>>= 1;
        leafMap >>>= 1;
      }
      return null;
    } while (true);
  }

  public @Nullable T next(@Nullable Object elem) {
    return this.next(elem, Objects.hashCode(elem), 0);
  }

  private @Nullable T next(@Nullable Object elem, int hash, int shift) {
    final int block;
    if (elem == null) {
      block = 0;
    } else {
      block = (hash >>> shift) & 0x1F;
    }
    int branch = 1 << block;
    int nodeMap = this.nodeMap >>> block;
    int leafMap = this.leafMap >>> block;
    T nextElem;
    while ((nodeMap | leafMap) != 0) {
      switch ((leafMap & 1) | (nodeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          if (elem == null) {
            return this.getLeaf(branch);
          }
          break;
        case TREE:
          nextElem = this.getTree(branch).next(elem, hash, shift + 5);
          if (nextElem != null) {
            return nextElem;
          }
          break;
        case KNOT:
          nextElem = this.getKnot(branch).next(elem);
          if (nextElem != null) {
            return nextElem;
          }
          break;
        default:
          throw new AssertionError();
      }
      elem = null;
      hash = 0;
      nodeMap >>>= 1;
      leafMap >>>= 1;
      branch <<= 1;
    }
    return null;
  }

  @Override
  public boolean add(@Nullable T elem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(Collection<? extends T> elems) {
    throw new UnsupportedOperationException();
  }

  @Override
  public HashTrieSet<T> added(@Nullable T elem) {
    return this.updated(elem, Objects.hashCode(elem), 0);
  }

  public HashTrieSet<T> added(Collection<? extends T> elems) {
    HashTrieSet<T> these = this;
    for (T elem : elems) {
      these = these.added(elem);
    }
    return these;
  }

  @SuppressWarnings("ReferenceEquality")
  private HashTrieSet<T> updated(@Nullable T elem, int hash, int shift) {
    final int branch = 1 << ((hash >>> shift) & 0x1F);
    switch (this.getBranchType(branch)) {
      case VOID:
        return this.remap(this.nodeMap, this.leafMap | branch, this.size + 1)
                   .setLeaf(branch, elem);
      case LEAF:
        final T leaf = this.getLeaf(branch);
        final int leafHash = Objects.hashCode(leaf);
        if (hash == leafHash && Objects.equals(elem, leaf)) {
          return this;
        } else if (hash != leafHash) {
          return this.remap(this.nodeMap | branch, this.leafMap ^ branch, this.size + 1)
                     .setTree(branch, this.merge(leaf, leafHash, elem, hash, shift + 5));
        } else {
          return this.remap(this.nodeMap | branch, this.leafMap, this.size + 1)
                     .setKnot(branch, new ArraySet<T>(new Object[] {leaf, elem}));
        }
      case TREE:
        final HashTrieSet<T> oldTree = this.getTree(branch);
        final HashTrieSet<T> newTree = oldTree.updated(elem, hash, shift + 5);
        if (oldTree == newTree) {
          return this;
        } else {
          return this.remap(this.nodeMap, this.leafMap, this.size + (newTree.size - oldTree.size))
                     .setTree(branch, newTree);
        }
      case KNOT:
        final ArraySet<T> oldKnot = this.getKnot(branch);
        final ArraySet<T> newKnot = oldKnot.added(elem);
        if (oldKnot == newKnot) {
          return this;
        } else {
          return this.remap(this.nodeMap, this.leafMap, this.size + (newKnot.size() - oldKnot.size()))
                     .setKnot(branch, newKnot);
        }
      default:
        throw new AssertionError();
    }
  }

  @Override
  public boolean remove(@Nullable Object elem) {
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
  public HashTrieSet<T> removed(@Nullable Object elem) {
    return this.removed(elem, Objects.hashCode(elem), 0);
  }

  @SuppressWarnings("ReferenceEquality")
  private HashTrieSet<T> removed(@Nullable Object elem, int hash, int shift) {
    final int branch = 1 << ((hash >>> shift) & 0x1F);
    switch (this.getBranchType(branch)) {
      case VOID:
        return this;
      case LEAF:
        if (!Objects.equals(elem, this.getLeaf(branch))) {
          return this;
        } else {
          return this.remap(this.nodeMap, this.leafMap ^ branch, this.size - 1);
        }
      case TREE:
        final HashTrieSet<T> oldTree = this.getTree(branch);
        final HashTrieSet<T> newTree = oldTree.removed(elem, hash, shift + 5);
        if (oldTree == newTree) {
          return this;
        } else if (newTree.isEmpty()) {
          return this.remap(this.nodeMap ^ branch, this.leafMap, this.size - 1);
        } else if (newTree.isUnary()) {
          return this.remap(this.nodeMap ^ branch, this.leafMap | branch, this.size - 1)
                     .setLeaf(branch, newTree.unaryElem());
        } else {
          return this.remap(this.nodeMap, this.leafMap, this.size - 1)
                     .setTree(branch, newTree);
        }
      case KNOT:
        final ArraySet<T> oldKnot = this.getKnot(branch);
        final ArraySet<T> newKnot = oldKnot.removed(elem);
        if (oldKnot == newKnot) {
          return this;
        } else if (newKnot.isEmpty()) {
          return this.remap(this.nodeMap ^ branch, this.leafMap, this.size - 1);
        } else if (newKnot.isUnary()) {
          return this.remap(this.nodeMap ^ branch, this.leafMap | branch, this.size - 1)
                     .setLeaf(branch, newKnot.unaryElem());
        } else {
          return this.remap(this.nodeMap, this.leafMap, this.size - 1)
                     .setKnot(branch, newKnot);
        }
      default:
        throw new AssertionError();
    }
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  private HashTrieSet<T> remap(int nodeMap, int leafMap, int size) {
    int oldSlotMap = this.nodeMap | this.leafMap;
    int newSlotMap = nodeMap | leafMap;
    final Object[] oldSlots = this.slots;
    if (oldSlotMap == newSlotMap) {
      return new HashTrieSet<T>(nodeMap, leafMap, size, oldSlots.clone());
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
      return new HashTrieSet<T>(nodeMap, leafMap, size, newSlots);
    }
  }

  private HashTrieSet<T> merge(@Nullable T elem0, int hash0, @Nullable T elem1, int hash1, int shift) {
    // assume(hash0 != hash1)
    final int branch0 = 1 << ((hash0 >>> shift) & 0x1F);
    final int branch1 = 1 << ((hash1 >>> shift) & 0x1F);
    final int slotMap = branch0 | branch1;
    if (branch0 == branch1) {
      final Object[] slots = new Object[1];
      slots[0] = this.merge(elem0, hash0, elem1, hash1, shift + 5);
      return new HashTrieSet<T>(slotMap, 0, 2, slots);
    } else {
      final Object[] slots = new Object[2];
      if (((branch0 - 1) & branch1) == 0) {
        slots[0] = elem0;
        slots[1] = elem1;
      } else {
        slots[0] = elem1;
        slots[1] = elem0;
      }
      return new HashTrieSet<T>(0, slotMap, 2, slots);
    }
  }

  int getBranchType(int branch) {
    return ((this.leafMap & branch) != 0 ? 1 : 0) | ((this.nodeMap & branch) != 0 ? 2 : 0);
  }

  int getBranchIndex(int branch) {
    return Integer.bitCount((this.nodeMap | this.leafMap) & (branch - 1));
  }

  boolean isUnary() {
    return this.nodeMap == 0 && Integer.bitCount(this.leafMap) == 1;
  }

  @Nullable T unaryElem() {
    return Assume.conformsNullable(this.slots[0]);
  }

  @Nullable T leafAt(int index) {
    return Assume.conformsNullable(this.slots[index]);
  }

  @Nullable T getLeaf(int branch) {
    return Assume.conformsNullable(this.slots[this.getBranchIndex(branch)]);
  }

  HashTrieSet<T> setLeaf(int branch, @Nullable T leaf) {
    this.slots[this.getBranchIndex(branch)] = leaf;
    return this;
  }

  HashTrieSet<T> treeAt(int index) {
    return Assume.conforms(this.slots[index]);
  }

  HashTrieSet<T> getTree(int branch) {
    return Assume.conforms(this.slots[this.getBranchIndex(branch)]);
  }

  HashTrieSet<T> setTree(int branch, HashTrieSet<T> tree) {
    this.slots[this.getBranchIndex(branch)] = tree;
    return this;
  }

  ArraySet<T> knotAt(int index) {
    return Assume.conforms(this.slots[index]);
  }

  ArraySet<T> getKnot(int branch) {
    return Assume.conforms(this.slots[this.getBranchIndex(branch)]);
  }

  HashTrieSet<T> setKnot(int branch, ArraySet<T> knot) {
    this.slots[this.getBranchIndex(branch)] = knot;
    return this;
  }

  @Override
  public Object[] toArray() {
    int i = 0;
    final Object[] array = new Object[this.size];
    for (T elem : this) {
      array[i] = elem;
      i += 1;
    }
    return array;
  }

  @Override
  public <U> U[] toArray(U[] array) {
    int i = 0;
    final int n = this.size;
    if (array.length < n) {
      array = Assume.conforms(Array.newInstance(array.getClass().getComponentType(), n));
    }
    for (T elem : this) {
      array[i] = Assume.conforms(elem);
      i += 1;
    }
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  @Override
  public void forEach(Consumer<? super T> action) {
    int i = 0;
    int nodeMap = this.nodeMap;
    int leafMap = this.leafMap;
    while ((nodeMap | leafMap) != 0) {
      switch ((leafMap & 1) | (nodeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          action.accept(this.leafAt(i));
          i += 1;
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
          throw new AssertionError();
      }
      nodeMap >>>= 1;
      leafMap >>>= 1;
    }
  }

  @Override
  public Iterator<T> iterator() {
    return new HashTrieSetIterator<T>(this);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Set<?>) {
      final Set<?> that = (Set<?>) other;
      if (this.size == that.size()) {
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
    for (T elem : this) {
      code += Objects.hashCode(elem);
    }
    return code;
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    if (notation.options().verbose()) {
      notation.beginObject("HashTrieSet");
      int i = 0;
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
            notation.appendElement(this.leafAt(i));
            i += 1;
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
            throw new AssertionError();
        }
        nodeMap >>>= 1;
        leafMap >>>= 1;
      }
      notation.endArray();
      notation.endValue();
      notation.endObject();
    } else {
      notation.beginArray("HashTrieSet");
      this.writeElements(notation);
      notation.endArray();
    }
  }

  void writeElements(Notation notation) {
    int i = 0;
    int nodeMap = this.nodeMap;
    int leafMap = this.leafMap;
    while ((nodeMap | leafMap) != 0) {
      switch ((leafMap & 1) | (nodeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          notation.appendElement(this.leafAt(i));
          i += 1;
          break;
        case TREE:
          this.treeAt(i).writeElements(notation);
          i += 1;
          break;
        case KNOT:
          this.knotAt(i).writeElements(notation);
          i += 1;
          break;
        default:
          throw new AssertionError();
      }
      nodeMap >>>= 1;
      leafMap >>>= 1;
    }
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    if (this.isEmpty()) {
      notation.beginInvoke("HashTrieSet", "empty").endInvoke();
    } else {
      notation.beginInvoke("HashTrieSet", "of");
      this.writeArguments(notation);
      notation.endInvoke();
    }
  }

  void writeArguments(Notation notation) {
    int i = 0;
    int nodeMap = this.nodeMap;
    int leafMap = this.leafMap;
    while ((nodeMap | leafMap) != 0) {
      switch ((leafMap & 1) | (nodeMap & 1) << 1) {
        case VOID:
          break;
        case LEAF:
          notation.appendArgument(this.leafAt(i));
          i += 1;
          break;
        case TREE:
          this.treeAt(i).writeArguments(notation);
          i += 1;
          break;
        case KNOT:
          this.knotAt(i).writeArguments(notation);
          i += 1;
          break;
        default:
          throw new AssertionError();
      }
      nodeMap >>>= 1;
      leafMap >>>= 1;
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final int VOID = 0;
  static final int LEAF = 1;
  static final int TREE = 2;
  static final int KNOT = 3;

  private static final HashTrieSet<Object> EMPTY = new HashTrieSet<Object>(0, 0, 0, new Object[0]);

  public static <T> HashTrieSet<T> empty() {
    return Assume.conforms(EMPTY);
  }

  @SuppressWarnings("unchecked")
  public static <T> HashTrieSet<T> of(@Nullable T... elems) {
    Objects.requireNonNull(elems);
    HashTrieSet<T> trie = HashTrieSet.empty();
    for (int i = 0; i < elems.length; i += 1) {
      trie = trie.added(elems[i]);
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
    this.setNodeMap(tree.nodeMap);
    this.setLeafMap(tree.leafMap);
  }

  @Nullable Object getNode() {
    return this.nodes[this.depth];
  }

  void setNode(@Nullable Object node) {
    this.nodes[this.depth] = node;
  }

  int getSlotIndex() {
    return this.stack[this.stackPointer];
  }

  void setSlotIndex(int index) {
    this.stack[this.stackPointer] = index;
  }

  int getNodeMap() {
    return this.stack[this.stackPointer + 1];
  }

  void setNodeMap(int nodeMap) {
    this.stack[this.stackPointer + 1] = nodeMap;
  }

  int getLeafMap() {
    return this.stack[this.stackPointer + 2];
  }

  void setLeafMap(int leafMap) {
    this.stack[this.stackPointer + 2] = leafMap;
  }

  int getBranchType(int nodeMap, int leafMap) {
    return (leafMap & 1) | (nodeMap & 1) << 1;
  }

  void push(HashTrieSet<T> tree) {
    this.depth += 1;
    this.setNode(tree);

    this.stackPointer += 3;
    this.setSlotIndex(0);
    this.setNodeMap(tree.nodeMap);
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
    this.setNodeMap(0);
    this.setLeafMap(0);
    this.stackPointer -= 3;

    this.setSlotIndex(this.getSlotIndex() + 1);
    this.setNodeMap(this.getNodeMap() >>> 1);
    this.setLeafMap(this.getLeafMap() >>> 1);
  }

  @Override
  public boolean hasNext() {
    do {
      final Object node = this.getNode();
      if (node instanceof HashTrieSet<?>) {
        final HashTrieSet<T> tree = Assume.conforms(node);
        final int nodeMap = this.getNodeMap();
        final int leafMap = this.getLeafMap();
        if ((nodeMap | leafMap) != 0) {
          switch (this.getBranchType(nodeMap, leafMap)) {
            case HashTrieSet.VOID:
              this.setNodeMap(nodeMap >>> 1);
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
        final ArraySet<T> knot = Assume.conforms(node);
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

  @Override
  public @Nullable T next() {
    do {
      final Object node = this.getNode();
      if (node instanceof HashTrieSet<?>) {
        final HashTrieSet<T> tree = Assume.conforms(node);
        final int nodeMap = this.getNodeMap();
        final int leafMap = this.getLeafMap();
        final int slotMap = nodeMap | leafMap;
        if (slotMap != 0) {
          switch (this.getBranchType(nodeMap, leafMap)) {
            case HashTrieSet.VOID:
              this.setNodeMap(nodeMap >>> 1);
              this.setLeafMap(leafMap >>> 1);
              break;
            case HashTrieSet.LEAF:
              final int slotIndex = this.getSlotIndex();
              final T elem = tree.leafAt(slotIndex);
              this.setSlotIndex(slotIndex + 1);
              this.setNodeMap(nodeMap >>> 1);
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
        final ArraySet<T> knot = Assume.conforms(node);
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

}
