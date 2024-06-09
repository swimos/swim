// Copyright 2015-2024 Nstream, inc.
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
import type {BTreeContext} from "./BTreeContext";
import type {BTree} from "./BTree";
import {BTreePage} from "./BTreePage";
import {BTreeNode} from "./"; // forward import

/** @internal */
export class BTreeLeaf<K, V, U> extends BTreePage<K, V, U> {
  constructor(slots: readonly [K, V][], fold: U | undefined) {
    super();
    this.slots = slots;
    this.fold = fold;
  }

  /** @internal */
  readonly slots: readonly [K, V][];

  override get arity(): number {
    return this.slots.length;
  }

  override get size(): number {
    return this.slots.length;
  }

  override isEmpty(): boolean {
    return this.slots.length === 0;
  }

  override readonly fold: U | undefined;

  override minKey(): K {
    return this.slots[0]![0];
  }

  override maxKey(): K {
    return this.slots[this.slots.length - 1]![0];
  }

  override has(key: K, tree: BTreeContext<K, V>): boolean {
    return this.lookup(key, tree) >= 0;
  }

  override get(key: K, tree: BTreeContext<K, V>): V | undefined {
    const x = this.lookup(key, tree);
    if (x < 0) {
      return void 0;
    }
    return this.slots[x]![1];
  }

  override getEntry(index: number): [K, V] | undefined {
    return this.slots[index];
  }

  override firstEntry(): [K, V] | undefined {
    const slots = this.slots;
    if (slots.length === 0) {
      return void 0;
    }
    return slots[0];
  }

  override lastEntry(): [K, V] | undefined {
    const slots = this.slots;
    if (slots.length === 0) {
      return void 0;
    }
    return slots[slots.length - 1];
  }

  override nextEntry(key: K, tree: BTreeContext<K, V>): [K, V] | undefined {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    return this.slots[x];
  }

  override previousEntry(key: K, tree: BTreeContext<K, V>): [K, V] | undefined {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x -= 1;
    } else {
      x = -(x + 2);
    }
    return this.slots[x];
  }

  override updated(key: K, newValue: V, tree: BTreeContext<K, V>): BTreeLeaf<K, V, U> {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      return this.updatedSlot(x, key, newValue);
    }
    x = -(x + 1);
    return this.insertedSlot(x, key, newValue);
  }

  /** @internal */
  updatedSlot(x: number, key: K, newValue: V): BTreeLeaf<K, V, U> {
    const oldSlots = this.slots;
    if (newValue === oldSlots[x]![1]) {
      return this;
    }
    const newSlots = oldSlots.slice(0);
    newSlots[x] = [key, newValue];
    return new BTreeLeaf<K, V, U>(newSlots, void 0);
  }

  /** @internal */
  insertedSlot(x: number, key: K, newValue: V): BTreeLeaf<K, V, U> {
    const oldSlots = this.slots;
    const n = oldSlots.length + 1;
    const newSlots = new Array<[K, V]>(n);
    for (let i = 0; i < x; i += 1) {
      newSlots[i] = oldSlots[i]!;
    }
    newSlots[x] = [key, newValue];
    for (let i = x; i < n - 1; i += 1) {
      newSlots[i + 1] = oldSlots[i]!;
    }
    return new BTreeLeaf<K, V, U>(newSlots, void 0);
  }

  override removed(key: K, tree: BTreeContext<K, V>): BTreeLeaf<K, V, U> {
    const x = this.lookup(key, tree);
    if (x < 0) {
      return this;
    } else if (this.slots.length <= 1) {
      return BTreePage.empty();
    }
    return this.removedSlot(x);
  }

  /** @internal */
  removedSlot(x: number): BTreeLeaf<K, V, U> {
    const oldSlots = this.slots;
    const newSlots = new Array<[K, V]>(oldSlots.length - 1);
    for (let i = 0; i < x; i += 1) {
      newSlots[i] = oldSlots[i]!;
    }
    for (let i = x; i < newSlots.length; i += 1) {
      newSlots[i] = oldSlots[i + 1]!;
    }
    return new BTreeLeaf<K, V, U>(newSlots, void 0);
  }

  override drop(lower: number, tree: BTreeContext<K, V>): BTreeLeaf<K, V, U> {
    const oldSlots = this.slots;
    if (lower <= 0) {
      return this;
    } else if (lower >= oldSlots.length) {
      return BTreePage.empty();
    }
    const size = oldSlots.length - lower;
    const newSlots = new Array<[K, V]>(size);
    for (let i = 0; i < size; i += 1) {
      newSlots[i] = oldSlots[i + lower]!;
    }
    return new BTreeLeaf<K, V, U>(newSlots, void 0);
  }

  override take(upper: number, tree: BTreeContext<K, V>): BTreeLeaf<K, V, U> {
    const oldSlots = this.slots;
    if (upper >= oldSlots.length) {
      return this;
    } else if (upper <= 0) {
      return BTreePage.empty();
    }
    const newSlots = new Array<[K, V]>(upper);
    for (let i = 0; i < upper; i += 1) {
      newSlots[i] = oldSlots[i]!;
    }
    return new BTreeLeaf<K, V, U>(newSlots, void 0);
  }

  override balanced(tree: BTreeContext<K, V>): BTreePage<K, V, U> {
    const n = this.slots.length;
    if (n <= 1 || !tree.pageShouldSplit(this)) {
      return this;
    }
    return this.split(n >>> 1);
  }

  override split(x: number): BTreeNode<K, V, U> {
    const newPages = new Array<BTreePage<K, V, U>>(2);
    const newLeftPage = this.splitLeft(x);
    const newRightPage = this.splitRight(x);
    newPages[0] = newLeftPage;
    newPages[1] = newRightPage;

    const newKnots = new Array<K>(1);
    newKnots[0] = newRightPage.minKey();

    return new BTreeNode(newPages, newKnots, void 0, this.slots.length);
  }

  override splitLeft(x: number): BTreeLeaf<K, V, U> {
    const oldSlots = this.slots;
    const newSlots = new Array<[K, V]>(x);
    for (let i = 0; i < x; i += 1) {
      newSlots[i] = oldSlots[i]!;
    }
    return new BTreeLeaf<K, V, U>(newSlots, void 0);
  }

  override splitRight(x: number): BTreeLeaf<K, V, U> {
    const oldSlots = this.slots;
    const y = oldSlots.length - x;
    const newSlots = new Array<[K, V]>(y);
    for (let i = 0; i < y; i += 1) {
      newSlots[i] = oldSlots[i + x]!;
    }
    return new BTreeLeaf<K, V, U>(newSlots, void 0);
  }

  override reduced(identity: U, accumulator: (result: U, element: V) => U,
                   combiner: (result: U, result2: U) => U): BTreeLeaf<K, V, U> {
    if (this.fold !== void 0) {
      return this;
    }
    const slots = this.slots;
    let fold = identity;
    for (let i = 0; i < slots.length; i += 1) {
      fold = accumulator(fold, slots[i]![1]);
    }
    return new BTreeLeaf<K, V, U>(slots, fold);
  }

  override forEach<T, S>(callback: (this: S, value: V, key: K, tree: BTree<K, V, U>) => T | void,
                         thisArg: S, tree: BTree<K, V, U>): T | undefined {
    const slots = this.slots;
    for (let i = 0; i < slots.length; i += 1) {
      const slot = slots[i]!;
      const result = callback.call(thisArg, slot[1], slot[0], tree);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  override forEachKey<T, S>(callback: (this: S, key: K, tree: BTree<K, V, U>) => T | void,
                            thisArg: S, tree: BTree<K, V, U>): T | undefined {
    const slots = this.slots;
    for (let i = 0; i < slots.length; i += 1) {
      const slot = slots[i]!;
      const result = callback.call(thisArg, slot[0], tree);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  override forEachValue<T, S>(callback: (this: S, value: V, tree: BTree<K, V, U>) => T | void,
                              thisArg: S, tree: BTree<K, V, U>): T | undefined {
    const slots = this.slots;
    for (let i = 0; i < slots.length; i += 1) {
      const slot = slots[i]!;
      const result = callback.call(thisArg, slot[1], tree);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  override entries(): Cursor<[K, V]> {
    return Cursor.array(this.slots);
  }

  override reverseEntries(): Cursor<[K, V]> {
    return Cursor.array(this.slots, this.slots.length);
  }

  /** @internal */
  lookup(key: K, tree: BTreeContext<K, V>): number {
    let lo = 0;
    let hi = this.slots.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const order = tree.compare(key, this.slots[mid]![0]);
      if (order > 0) {
        lo = mid + 1;
      } else if (order < 0) {
        hi = mid - 1;
      } else {
        return mid;
      }
    }
    return -(lo + 1);
  }
}
