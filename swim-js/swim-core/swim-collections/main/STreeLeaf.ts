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

import {Cursor} from "@swim/util";
import type {STreeContext} from "./STreeContext";
import type {STree} from "./STree";
import {STreePage} from "./STreePage";
import {STreeNode} from "./"; // forward import

/** @internal */
export class STreeLeaf<V, I> extends STreePage<V, I> {
  constructor(slots: readonly [I, V][]) {
    super();
    this.slots = slots;
  }

  /** @internal */
  readonly slots: readonly [I, V][];

  override get arity(): number {
    return this.slots.length;
  }

  override get size(): number {
    return this.slots.length;
  }

  override isEmpty(): boolean {
    return this.slots.length === 0;
  }

  override get(index: number): V | undefined {
    const slot = this.slots[index];
    if (slot === void 0) {
      return void 0;
    }
    return slot[1];
  }

  override getEntry(index: number): [I, V] | undefined {
    return this.slots[index];
  }

  override updated(index: number, newValue: V, tree: STreeContext<V, I>): STreeLeaf<V, I> {
    if (index < 0 || index >= this.slots.length) {
      throw new RangeError("" + index);
    }
    return this.updatedItem(index, newValue);
  }

  /** @internal */
  updatedItem(index: number, newValue: V): STreeLeaf<V, I> {
    const oldItems = this.slots;
    const oldSlot = oldItems[index];
    if (oldSlot === void 0 || newValue === oldSlot[1]) {
      return this;
    }
    const newValues = oldItems.slice(0);
    newValues[index] = [oldSlot[0], newValue];
    return new STreeLeaf<V, I>(newValues);
  }

  override inserted(index: number, newValue: V, id: I | undefined, tree: STreeContext<V, I>): STreeLeaf<V, I> {
    if (index < 0 || index > this.slots.length) {
      throw new RangeError("" + index);
    }
    return this.insertedItem(index, newValue, id, tree);
  }

  /** @internal */
  insertedItem(index: number, newValue: V, id: I | undefined, tree: STreeContext<V, I>): STreeLeaf<V, I> {
    if (id === void 0) {
      id = tree.identify(newValue);
    }
    const oldSlots = this.slots;
    const newSlots = new Array<[I, V]>(oldSlots.length + 1);
    for (let i = 0; i < index; i += 1) {
      newSlots[i] = oldSlots[i]!;
    }
    newSlots[index] = [id, newValue];
    for (let i = index; i < oldSlots.length; i += 1) {
      newSlots[i + 1] = oldSlots[i]!;
    }
    return new STreeLeaf<V, I>(newSlots);
  }

  override removed(index: number, tree: STreeContext<V, I>): STreeLeaf<V, I> {
    if (index < 0 || index >= this.slots.length) {
      throw new RangeError("" + index);
    }
    if (this.slots.length <= 1) {
      return STreePage.empty();
    }
    return this.removedSlot(index);
  }

  /** @internal */
  removedSlot(index: number): STreeLeaf<V, I> {
    const oldSlots = this.slots;
    const newSlots = new Array<[I, V]>(oldSlots.length - 1);
    for (let i = 0; i < index; i += 1) {
      newSlots[i] = oldSlots[i]!;
    }
    for (let i = index; i < newSlots.length; i += 1) {
      newSlots[i] = oldSlots[i + 1]!;
    }
    return new STreeLeaf<V, I>(newSlots);
  }

  override drop(lower: number, tree: STreeContext<V, I>): STreeLeaf<V, I> {
    const oldSlots = this.slots;
    if (lower <= 0 || oldSlots.length === 0) {
      return this;
    } else if (lower >= oldSlots.length) {
      return STreePage.empty();
    }
    const size = oldSlots.length - lower;
    const newSlots = new Array<[I, V]>(size);
    for (let i = 0; i < size; i += 1) {
      newSlots[i] = oldSlots[i + lower]!;
    }
    return new STreeLeaf<V, I>(newSlots);
  }

  override take(upper: number, tree: STreeContext<V, I>): STreeLeaf<V, I> {
    const oldSlots = this.slots;
    if (upper >= oldSlots.length || oldSlots.length === 0) {
      return this;
    } else if (upper <= 0) {
      return STreePage.empty();
    }
    const newSlots = new Array<[I, V]>(upper);
    for (let i = 0; i < upper; i += 1) {
      newSlots[i] = oldSlots[i]!;
    }
    return new STreeLeaf<V, I>(newSlots);
  }

  override balanced(tree: STreeContext<V, I>): STreePage<V, I> {
    const size = this.slots.length;
    if (size <= 1 || !tree.pageShouldSplit(this)) {
      return this;
    }
    return this.split(size >>> 1);
  }

  override split(index: number): STreeNode<V, I> {
    const newPages = new Array<STreePage<V, I>>(2);
    const newLeftPage = this.splitLeft(index);
    const newRightPage = this.splitRight(index);
    newPages[0] = newLeftPage;
    newPages[1] = newRightPage;

    const newKnots = new Array<number>(1);
    newKnots[0] = index;

    return new STreeNode(newPages, newKnots, this.slots.length);
  }

  override splitLeft(index: number): STreeLeaf<V, I> {
    const oldSlots = this.slots;
    const newSlots = new Array<[I, V]>(index);
    for (let i = 0; i < index; i += 1) {
      newSlots[i] = oldSlots[i]!;
    }
    return new STreeLeaf<V, I>(newSlots);
  }

  override splitRight(index: number): STreeLeaf<V, I> {
    const oldSlots = this.slots;
    const newSize = oldSlots.length - index;
    const newSlots = new Array<[I, V]>(newSize);
    for (let i = 0; i < newSize; i += 1) {
      newSlots[i] = oldSlots[i + index]!;
    }
    return new STreeLeaf<V, I>(newSlots);
  }

  override forEach<T, S>(callback: (this: S, value: V, index: number, id: I, tree: STree<V, I>) => T | void,
                         thisArg: S, offset: number, tree: STree<V, I>): T | undefined {
    for (let i = 0; i < this.slots.length; i += 1) {
      const slot = this.slots[i]!;
      const result = callback.call(thisArg, slot[1], offset + i, slot[0], tree);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  override entries(): Cursor<[I, V]> {
    return Cursor.array(this.slots);
  }

  override reverseEntries(): Cursor<[I, V]> {
    return Cursor.array(this.slots, this.slots.length);
  }
}
