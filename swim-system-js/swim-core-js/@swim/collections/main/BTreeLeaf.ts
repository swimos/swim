// Copyright 2015-2020 Swim inc.
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
import {BTreeContext} from "./BTreeContext";
import {BTree} from "./BTree";
import {BTreePage} from "./BTreePage";
import {BTreeNode} from "./BTreeNode";

/** @hidden */
export class BTreeLeaf<K, V, U> extends BTreePage<K, V, U> {
  readonly _slots: [K, V][];
  readonly _fold: U | undefined;

  constructor(slots: [K, V][], fold: U | undefined) {
    super();
    this._slots = slots;
    this._fold = fold;
  }

  get arity(): number {
    return this._slots.length;
  }

  get size(): number {
    return this._slots.length;
  }

  isEmpty(): boolean {
    return this._slots.length === 0;
  }

  fold(): U | undefined {
    return this._fold;
  }

  minKey(): K {
    return this._slots[0][0];
  }

  maxKey(): K {
    return this._slots[this._slots.length - 1][0];
  }

  has(key: K, tree: BTreeContext<K, V>): boolean {
    return this.lookup(key, tree) >= 0;
  }

  get(key: K, tree: BTreeContext<K, V>): V | undefined {
    const x = this.lookup(key, tree);
    if (x >= 0) {
      return this._slots[x][1];
    } else {
      return void 0;
    }
  }

  getEntry(index: number): [K, V] | undefined {
    return this._slots[index];
  }

  firstEntry(): [K, V] | undefined {
    const slots = this._slots;
    if (slots.length !== 0) {
      return slots[0];
    } else {
      return void 0;
    }
  }

  lastEntry(): [K, V] | undefined {
    const slots = this._slots;
    if (slots.length !== 0) {
      return slots[slots.length - 1];
    } else {
      return void 0;
    }
  }

  nextEntry(key: K, tree: BTreeContext<K, V>): [K, V] | undefined {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x += 1;
    } else {
      x = -(x + 1);
    }
    return this._slots[x];
  }

  previousEntry(key: K, tree: BTreeContext<K, V>): [K, V] | undefined {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      x -= 1;
    } else {
      x = -(x + 2);
    }
    return this._slots[x];
  }

  updated(key: K, newValue: V, tree: BTreeContext<K, V>): BTreeLeaf<K, V, U> {
    let x = this.lookup(key, tree);
    if (x >= 0) {
      return this.updatedSlot(x, key, newValue);
    } else {
      x = -(x + 1);
      return this.insertedSlot(x, key, newValue);
    }
  }

  private updatedSlot(x: number, key: K, newValue: V): BTreeLeaf<K, V, U> {
    const oldSlots = this._slots;
    if (newValue !== oldSlots[x][1]) {
      const newSlots = oldSlots.slice(0);
      newSlots[x] = [key, newValue];
      return this.newLeaf(newSlots, void 0);
    } else {
      return this;
    }
  }

  private insertedSlot(x: number, key: K, newValue: V): BTreeLeaf<K, V, U> {
    const oldSlots = this._slots;
    const n = oldSlots.length + 1;
    const newSlots = new Array<[K, V]>(n);
    for (let i = 0; i < x; i += 1) {
      newSlots[i] = oldSlots[i];
    }
    newSlots[x] = [key, newValue];
    for (let i = x; i < n - 1; i += 1) {
      newSlots[i + 1] = oldSlots[i];
    }
    return this.newLeaf(newSlots, void 0);
  }

  removed(key: K, tree: BTreeContext<K, V>): BTreeLeaf<K, V, U> {
    const x = this.lookup(key, tree);
    if (x >= 0) {
      if (this._slots.length > 1) {
        return this.removedSlot(x);
      } else {
        return BTreePage.empty();
      }
    } else {
      return this;
    }
  }

  private removedSlot(x: number): BTreeLeaf<K, V, U> {
    const oldSlots = this._slots;
    const newSlots = new Array<[K, V]>(oldSlots.length - 1);
    for (let i = 0; i < x; i += 1) {
      newSlots[i] = oldSlots[i];
    }
    for (let i = x; i < newSlots.length; i += 1) {
      newSlots[i] = oldSlots[i + 1];
    }
    return this.newLeaf(newSlots, void 0);
  }

  drop(lower: number, tree: BTreeContext<K, V>): BTreeLeaf<K, V, U> {
    if (lower > 0) {
      const oldSlots = this._slots;
      if (lower < oldSlots.length) {
        const size = oldSlots.length - lower;
        const newSlots = new Array<[K, V]>(size);
        for (let i = 0; i < size; i += 1) {
          newSlots[i] = oldSlots[i + lower];
        }
        return this.newLeaf(newSlots, void 0);
      } else {
        return BTreePage.empty();
      }
    } else {
      return this;
    }
  }

  take(upper: number, tree: BTreeContext<K, V>): BTreeLeaf<K, V, U> {
    const oldSlots = this._slots;
    if (upper < oldSlots.length) {
      if (upper > 0) {
        const newSlots = new Array<[K, V]>(upper);
        for (let i = 0; i < upper; i += 1) {
          newSlots[i] = oldSlots[i];
        }
        return this.newLeaf(newSlots, void 0);
      } else {
        return BTreePage.empty();
      }
    } else {
      return this;
    }
  }

  balanced(tree: BTreeContext<K, V>): BTreePage<K, V, U> {
    const n = this._slots.length;
    if (n > 1 && tree.pageShouldSplit(this)) {
      const x = n >>> 1;
      return this.split(x);
    } else {
      return this;
    }
  }

  split(x: number): BTreeNode<K, V, U> {
    const newPages = new Array<BTreePage<K, V, U>>(2);
    const newLeftPage = this.splitLeft(x);
    const newRightPage = this.splitRight(x);
    newPages[0] = newLeftPage;
    newPages[1] = newRightPage;

    const newKnots = new Array<K>(1);
    newKnots[0] = newRightPage.minKey();

    return this.newNode(newPages, newKnots, void 0, this._slots.length);
  }

  splitLeft(x: number): BTreeLeaf<K, V, U> {
    const oldSlots = this._slots;
    const newSlots = new Array<[K, V]>(x);
    for (let i = 0; i < x; i += 1) {
      newSlots[i] = oldSlots[i];
    }
    return this.newLeaf(newSlots, void 0);
  }

  splitRight(x: number): BTreeLeaf<K, V, U> {
    const oldSlots = this._slots;
    const y = oldSlots.length - x;
    const newSlots = new Array<[K, V]>(y);
    for (let i = 0; i < y; i += 1) {
      newSlots[i] = oldSlots[i + x];
    }
    return this.newLeaf(newSlots, void 0);
  }

  reduced(identity: U, accumulator: (result: U, element: V) => U,
          combiner: (result: U, result2: U) => U): BTreeLeaf<K, V, U> {
    if (this._fold === void 0) {
      const slots = this._slots;
      let fold = identity;
      for (let i = 0, n = slots.length; i < n; i += 1) {
        fold = accumulator(fold, slots[i][1]);
      }
      return this.newLeaf(slots, fold);
    } else {
      return this;
    }
  }

  forEach<T, S>(callback: (this: S, key: K, value: V) => T | void,
                thisArg: S): T | undefined {
    const slots = this._slots;
    for (let i = 0, n = slots.length; i < n; i += 1) {
      const slot = slots[i];
      const result = callback.call(thisArg, slot[0], slot[1]);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  forEachKey<T, S>(callback: (this: S, key: K) => T | void,
                   thisArg: S): T | undefined {
    const slots = this._slots;
    for (let i = 0, n = slots.length; i < n; i += 1) {
      const slot = slots[i];
      const result = callback.call(thisArg, slot[0]);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  forEachValue<T, S>(callback: (this: S, value: V) => T | void,
                     thisArg: S): T | undefined {
    const slots = this._slots;
    for (let i = 0, n = slots.length; i < n; i += 1) {
      const slot = slots[i];
      const result = callback.call(thisArg, slot[1]);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  entries(): Cursor<[K, V]> {
    return Cursor.array(this._slots);
  }

  reverseEntries(): Cursor<[K, V]> {
    return Cursor.array(this._slots, this._slots.length);
  }

  private lookup(key: K, tree: BTreeContext<K, V>): number {
    let lo = 0;
    let hi = this._slots.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const order = tree.compare(key, this._slots[mid][0]);
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

  protected newLeaf(slots: [K, V][], fold: U | undefined): BTreeLeaf<K, V, U> {
    return new BTreeLeaf(slots, fold);
  }

  protected newNode(pages: BTreePage<K, V, U>[], knots: K[], fold: U | undefined, size: number): BTreeNode<K, V, U> {
    return new BTree.Node(pages, knots, fold, size);
  }
}
BTree.Leaf = BTreeLeaf;
