// Copyright 2015-2020 SWIM.AI inc.
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

import {Cursor} from "@swim/util";
import {STreeContext} from "./STreeContext";
import {STreePage} from "./STreePage";
import {STreeLeaf} from "./STreeLeaf";
import {STreeNode} from "./STreeNode";
import {STreeNodeCursor} from "./STreeNodeCursor";

export class STree<V = unknown, I = unknown> extends STreeContext<V, I> {
  root: STreePage<V, I>;

  constructor(root: STreePage<V, I> = STree.Page.empty()) {
    super();
    this.root = root;
  }

  get length(): number {
    return this.root.size;
  }

  isEmpty(): boolean {
    return this.root.isEmpty();
  }

  get(index: number, id?: I): V | undefined {
    if (id !== void 0) {
      index = this.lookup(id, index);
      if (index < 0) {
        return void 0;
      }
    }
    return this.root.get(index);
  }

  getEntry(index: number, id?: I): [I, V] | undefined {
    if (id !== void 0) {
      index = this.lookup(id, index);
      if (index < 0) {
        return void 0;
      }
    }
    return this.root.getEntry(index);
  }

  set(index: number, newValue: V, id?: I): this {
    if (id !== void 0) {
      index = this.lookup(id, index);
      if (index < 0) {
        throw new RangeError("" + id);
      }
    }
    const oldRoot = this.root;
    if (index < 0 || index >= oldRoot.size) {
      throw new RangeError("" + index);
    }
    this.root = oldRoot.updated(index, newValue, this);
    return this;
  }

  insert(index: number, newValue: V, id?: I): this {
    const oldRoot = this.root;
    if (index < 0 || index > oldRoot.size) {
      throw new RangeError("" + index);
    }
    this.root = oldRoot.inserted(index, newValue, id, this).balanced(this);
    return this;
  }

  remove(index: number, id?: I): this {
    if (id !== void 0) {
      index = this.lookup(id, index);
      if (index < 0) {
        throw new RangeError("" + id);
      }
    }
    const oldRoot = this.root;
    if (index < 0 || index > oldRoot.size) {
      throw new RangeError("" + index);
    }
    this.root = oldRoot.removed(index, this);
    return this;
  }

  push(...newValues: V[]): number {
    let newRoot = this.root;
    for (let i = 0; i < newValues.length; i += 1) {
      newRoot = newRoot.inserted(newRoot.size, newValues[i], void 0, this).balanced(this);
    }
    this.root = newRoot;
    return newRoot.size;
  }

  pop(): V | undefined {
    const oldRoot = this.root;
    const index = oldRoot.size - 1;
    if (index >= 0) {
      const oldValue = oldRoot.get(index);
      this.root = oldRoot.removed(index, this);
      return oldValue;
    } else {
      return void 0;
    }
  }

  unshift(...newValues: V[]): number {
    let newRoot = this.root;
    for (let i = newValues.length - 1; i >= 0; i -= 1) {
      newRoot = newRoot.inserted(0, newValues[i], void 0, this).balanced(this);
    }
    this.root = newRoot;
    return newRoot.size;
  }

  shift(): V | undefined {
    const oldRoot = this.root;
    if (oldRoot.size > 0) {
      const oldValue = oldRoot.get(0);
      this.root = oldRoot.removed(0, this);
      return oldValue;
    } else {
      return void 0;
    }
  }

  move(fromIndex: number, toIndex: number, id?: I): this {
    if (id !== void 0) {
      fromIndex = this.lookup(id, fromIndex);
      if (fromIndex < 0) {
        throw new RangeError("" + id);
      }
    }
    const oldRoot = this.root;
    if (fromIndex < 0 || fromIndex >= oldRoot.size) {
      throw new RangeError("" + fromIndex);
    }
    if (toIndex < 0 || toIndex >= oldRoot.size) {
      throw new RangeError("" + toIndex);
    }
    if (fromIndex !== toIndex) {
      const entry = oldRoot.getEntry(fromIndex)!;
      this.root = oldRoot.removed(fromIndex, this)
                         .inserted(toIndex, entry[1], entry[0], this)
                         .balanced(this);
    }
    return this;
  }

  splice(start: number, deleteCount?: number, ...newValues: V[]): V[] {
    let newRoot = this.root;
    if (start < 0) {
      start = newRoot.size + start;
    }
    start = Math.min(Math.max(0, start), newRoot.size);
    if (deleteCount === void 0) {
      deleteCount = newRoot.size - start;
    }
    const deleted = [] as V[];
    for (let i = start, n = start + deleteCount; i < n; i += 1) {
      deleted.push(newRoot.get(start)!);
      newRoot = newRoot.removed(start, this);
    }
    for (let i = 0; i < newValues.length; i += 1) {
      newRoot = newRoot.inserted(start + i, newValues[i], void 0, this).balanced(this);
    }
    this.root = newRoot;
    return deleted;
  }

  drop(lower: number): this {
    const oldRoot = this.root;
    if (lower > 0 && oldRoot.size > 0) {
      if (lower < oldRoot.size) {
        this.root = oldRoot.drop(lower, this);
      } else {
        this.root = STree.Page.empty();
      }
    }
    return this;
  }

  take(upper: number): this {
    const oldRoot = this.root;
    if (upper < oldRoot.size && oldRoot.size > 0) {
      if (upper > 0) {
        this.root = oldRoot.take(upper, this);
      } else {
        this.root = STree.Page.empty();
      }
    }
    return this;
  }

  clear(): void {
    this.root = STree.Page.empty();
  }

  forEach<T, S = unknown>(callback: (this: S, value: V, index: number, id: I) => T | void,
                          thisArg?: S): T | undefined {
    return this.root.forEach(callback, thisArg, 0);
  }

  keys(): Cursor<I> {
    return this.root.keys();
  }

  values(): Cursor<V> {
    return this.root.values();
  }

  entries(): Cursor<[I, V]> {
    return this.root.entries();
  }

  reverseKeys(): Cursor<I> {
    return this.root.reverseKeys();
  }

  reverseValues(): Cursor<V> {
    return this.root.reverseValues();
  }

  reverseEntries(): Cursor<[I, V]> {
    return this.root.reverseEntries();
  }

  clone(): STree<V, I> {
    return this.copy(this.root);
  }

  protected copy(root: STreePage<V, I>): STree<V, I> {
    const tree = new STree(root);
    if (tree.identify !== this.identify) {
      tree.identify = this.identify;
    }
    if (tree.compare !== this.compare) {
      tree.compare = this.compare;
    }
    if (tree.pageSplitSize !== this.pageSplitSize) {
      tree.pageSplitSize = this.pageSplitSize;
    }
    return tree;
  }

  lookup(id: I, start: number = 0): number {
    const root = this.root;
    start = Math.min(Math.max(0, start), root.size - 1);
    let index = start;
    do {
      const entry = root.getEntry(index);
      if (entry !== void 0 && this.compare(entry[0], id) === 0) {
        return index;
      }
      index = (index + 1) % root.size;
    } while (isFinite(index) && index !== start);
    return -1;
  }

  // Forward type declarations
  /** @hidden */
  static Page: typeof STreePage; // defined by STreePage
  /** @hidden */
  static Leaf: typeof STreeLeaf; // defined by STreeLeaf
  /** @hidden */
  static Node: typeof STreeNode; // defined by STreeNode
  /** @hidden */
  static NodeCursor: typeof STreeNodeCursor; // defined by STreeNodeCursor
}
STree.prototype.pageSplitSize = 32;
