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

import {Cursor} from "@swim/util";
import {STreeContext} from "./STreeContext";
import {STree} from "./STree";
import {STreePage} from "./STreePage";
import {STreeNode} from "./STreeNode";

/** @hidden */
export class STreeLeaf<V, I> extends STreePage<V, I> {
  readonly _slots: [I, V][];

  constructor(slots: [I, V][]) {
    super();
    this._slots = slots;
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

  get(index: number): V | undefined {
    const slot = this._slots[index];
    if (slot) {
      return slot[1];
    } else {
      return void 0;
    }
  }

  getEntry(index: number): [I, V] | undefined {
    return this._slots[index];
  }

  updated(index: number, newValue: V, tree: STreeContext<V, I>): STreeLeaf<V, I> {
    if (index < 0 || index >= this._slots.length) {
      throw new RangeError("" + index);
    }
    return this.updatedItem(index, newValue);
  }

  private updatedItem(index: number, newValue: V): STreeLeaf<V, I> {
    const oldItems = this._slots;
    const oldSlot = oldItems[index];
    if (newValue !== oldSlot[1]) {
      const newValues = oldItems.slice(0);
      newValues[index] = [oldSlot[0], newValue];
      return new STreeLeaf(newValues);
    } else {
      return this;
    }
  }

  inserted(index: number, newValue: V, id: I | undefined, tree: STreeContext<V, I>): STreeLeaf<V, I> {
    if (index < 0 || index > this._slots.length) {
      throw new RangeError("" + index);
    }
    return this.insertedItem(index, newValue, id, tree);
  }

  private insertedItem(index: number, newValue: V, id: I | undefined, tree: STreeContext<V, I>): STreeLeaf<V, I> {
    if (id === void 0) {
      id = tree.identify(newValue);
    }
    const oldSlots = this._slots;
    const newSlots = new Array<[I, V]>(oldSlots.length + 1);
    for (let i = 0; i < index; i += 1) {
      newSlots[i] = oldSlots[i];
    }
    newSlots[index] = [id, newValue];
    for (let i = index; i < oldSlots.length; i += 1) {
      newSlots[i + 1] = oldSlots[i];
    }
    return new STreeLeaf(newSlots);
  }

  removed(index: number, tree: STreeContext<V, I>): STreeLeaf<V, I> {
    if (index < 0 || index >= this._slots.length) {
      throw new RangeError("" + index);
    }
    if (this._slots.length > 1) {
      return this.removedSlot(index);
    } else {
      return STreePage.empty();
    }
  }

  private removedSlot(index: number): STreeLeaf<V, I> {
    const oldSlots = this._slots;
    const newSlots = new Array<[I, V]>(oldSlots.length - 1);
    for (let i = 0; i < index; i += 1) {
      newSlots[i] = oldSlots[i];
    }
    for (let i = index; i < newSlots.length; i += 1) {
      newSlots[i] = oldSlots[i + 1];
    }
    return new STreeLeaf(newSlots);
  }

  drop(lower: number, tree: STreeContext<V, I>): STreeLeaf<V, I> {
    const oldSlots = this._slots;
    if (lower > 0 && oldSlots.length > 0) {
      if (lower < oldSlots.length) {
        const size = oldSlots.length - lower;
        const newSlots = new Array<[I, V]>(size);
        for (let i = 0; i < size; i += 1) {
          newSlots[i] = oldSlots[i + lower];
        }
        return new STreeLeaf(newSlots);
      } else {
        return STreePage.empty();
      }
    } else {
      return this;
    }
  }

  take(upper: number, tree: STreeContext<V, I>): STreeLeaf<V, I> {
    const oldSlots = this._slots;
    if (upper < oldSlots.length && oldSlots.length > 0) {
      if (upper > 0) {
        const newSlots = new Array<[I, V]>(upper);
        for (let i = 0; i < upper; i += 1) {
          newSlots[i] = oldSlots[i];
        }
        return new STreeLeaf(newSlots);
      } else {
        return STreePage.empty();
      }
    } else {
      return this;
    }
  }

  balanced(tree: STreeContext<V, I>): STreePage<V, I> {
    const size = this._slots.length;
    if (size > 1 && tree.pageShouldSplit(this)) {
      return this.split(size >>> 1);
    } else {
      return this;
    }
  }

  split(index: number): STreeNode<V, I> {
    const newPages = new Array<STreePage<V, I>>(2);
    const newLeftPage = this.splitLeft(index);
    const newRightPage = this.splitRight(index);
    newPages[0] = newLeftPage;
    newPages[1] = newRightPage;

    const newKnots = new Array<number>(1);
    newKnots[0] = index;

    return new STree.Node(newPages, newKnots, this._slots.length);
  }

  splitLeft(index: number): STreeLeaf<V, I> {
    const oldSlots = this._slots;
    const newSlots = new Array<[I, V]>(index);
    for (let i = 0; i < index; i += 1) {
      newSlots[i] = oldSlots[i];
    }
    return new STreeLeaf(newSlots);
  }

  splitRight(index: number): STreeLeaf<V, I> {
    const oldSlots = this._slots;
    const newSize = oldSlots.length - index;
    const newSlots = new Array<[I, V]>(newSize);
    for (let i = 0; i < newSize; i += 1) {
      newSlots[i] = oldSlots[i + index];
    }
    return new STreeLeaf(newSlots);
  }

  forEach<T, S>(callback: (this: S,
                           value: V,
                           index: number,
                           tree: STree<V, I>,
                           id: I) => T | void,
                thisArg: S,
                offset: number,
                tree: STree<V, I>): T | undefined {
    for (let i = 0; i < this._slots.length; i += 1) {
      const slot = this._slots[i];
      const result = callback.call(thisArg, slot[1], offset + i, tree, slot[0]);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  entries(): Cursor<[I, V]> {
    return Cursor.array(this._slots);
  }

  reverseEntries(): Cursor<[I, V]> {
    return Cursor.array(this._slots, this._slots.length);
  }
}
STree.Leaf = STreeLeaf;
