// Copyright 2015-2021 Swim Inc.
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

import type {Cursor, ReducedMap} from "@swim/util";
import {BTreeContext} from "./BTreeContext";
import {BTreePage} from "./"; // forward import

/** @public */
export class BTree<K = unknown, V = unknown, U = never> extends BTreeContext<K, V> implements ReducedMap<K, V, U> {
  /** @internal */
  root: BTreePage<K, V, U>;

  constructor();
  /** @internal */
  constructor(root: BTreePage<K, V, U>);
  constructor(root?: BTreePage<K, V, U>) {
    super();
    if (root === void 0) {
      root = BTreePage.empty();
    }
    this.root = root;
  }

  get size(): number {
    return this.root.size;
  }

  isEmpty(): boolean {
    return this.root.isEmpty();
  }

  has(key: K): boolean {
    return this.root.has(key, this);
  }

  get(key: K): V | undefined {
    return this.root.get(key, this);
  }

  getEntry(index: number): [K, V] | undefined {
    return this.root.getEntry(index);
  }

  firstKey(): K | undefined {
    const entry = this.root.firstEntry();
    if (entry !== void 0) {
      return entry[0];
    } else {
      return void 0;
    }
  }

  firstValue(): V | undefined {
    const entry = this.root.firstEntry();
    if (entry !== void 0) {
      return entry[1];
    } else {
      return void 0;
    }
  }

  firstEntry(): [K, V] | undefined {
    return this.root.firstEntry();
  }

  lastKey(): K | undefined {
    const entry = this.root.lastEntry();
    if (entry !== void 0) {
      return entry[0];
    } else {
      return void 0;
    }
  }

  lastValue(): V | undefined {
    const entry = this.root.lastEntry();
    if (entry !== void 0) {
      return entry[1];
    } else {
      return void 0;
    }
  }

  lastEntry(): [K, V] | undefined {
    return this.root.lastEntry();
  }

  nextKey(key: K): K | undefined {
    const entry = this.root.nextEntry(key, this);
    if (entry !== void 0) {
      return entry[0];
    } else {
      return void 0;
    }
  }

  nextValue(key: K): V | undefined {
    const entry = this.root.nextEntry(key, this);
    if (entry !== void 0) {
      return entry[1];
    } else {
      return void 0;
    }
  }

  nextEntry(key: K): [K, V] | undefined {
    return this.root.nextEntry(key, this);
  }

  previousKey(key: K): K | undefined {
    const entry = this.root.previousEntry(key, this);
    if (entry !== void 0) {
      return entry[0];
    } else {
      return void 0;
    }
  }

  previousValue(key: K): V | undefined {
    const entry = this.root.previousEntry(key, this);
    if (entry !== void 0) {
      return entry[1];
    } else {
      return void 0;
    }
  }

  previousEntry(key: K): [K, V] | undefined {
    return this.root.previousEntry(key, this);
  }

  set(key: K, newValue: V): this {
    const oldRoot = this.root;
    let newRoot = this.root.updated(key, newValue, this);
    if (oldRoot !== newRoot) {
      if (newRoot.size > oldRoot.size) {
        newRoot = newRoot.balanced(this);
      }
      this.root = newRoot;
    }
    return this;
  }

  delete(key: K): boolean {
    const oldRoot = this.root;
    const newRoot = this.root.removed(key, this);
    if (oldRoot !== newRoot) {
      this.root = newRoot;
      return true;
    } else {
      return false;
    }
  }

  drop(lower: number): this {
    if (lower > 0 && this.root.size > 0) {
      if (lower < this.root.size) {
        this.root = this.root.drop(lower, this);
      } else {
        this.root = BTreePage.empty();
      }
    }
    return this;
  }

  take(upper: number): this {
    if (upper < this.root.size && this.root.size > 0) {
      if (upper > 0) {
        this.root = this.root.take(upper, this);
      } else {
        this.root = BTreePage.empty();
      }
    }
    return this;
  }

  clear(): void {
    this.root = BTreePage.empty();
  }

  updated(key: K, newValue: V): BTree<K, V, U> {
    const oldRoot = this.root;
    let newRoot = oldRoot.updated(key, newValue, this);
    if (oldRoot !== newRoot) {
      if (newRoot.size > oldRoot.size) {
        newRoot = newRoot.balanced(this);
      }
      return this.copy(newRoot);
    } else {
      return this;
    }
  }

  removed(key: K): BTree<K, V, U> {
    const oldRoot = this.root;
    const newRoot = oldRoot.removed(key, this);
    if (oldRoot !== newRoot) {
      return this.copy(newRoot);
    } else {
      return this;
    }
  }

  cleared(): BTree<K, V, U> {
    if (!this.root.isEmpty()) {
      return this.copy(BTreePage.empty());
    } else {
      return this;
    }
  }

  reduced(identity: U, accumulator: (result: U, element: V) => U, combiner: (result: U, result2: U) => U): U {
    const oldRoot = this.root;
    const newRoot = oldRoot.reduced(identity, accumulator, combiner);
    if (oldRoot !== newRoot) {
      this.root = newRoot;
    }
    return newRoot.fold!;
  }

  forEach<T>(callback: (key: K, value: V) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, key: K, value: V) => T | void,
                thisArg: S): T | undefined;
  forEach<T, S>(callback: (this: S | undefined, key: K, value: V) => T | void,
                thisArg?: S): T | undefined {
    return this.root.forEach(callback, thisArg);
  }

  forEachKey<T>(callback: (key: K) => T | void): T | undefined;
  forEachKey<T, S>(callback: (this: S, key: K) => T | void,
                   thisArg: S): T | undefined;
  forEachKey<T, S>(callback: (this: S | undefined, key: K) => T | void,
                   thisArg?: S): T | undefined {
    return this.root.forEachKey(callback, thisArg);
  }

  forEachValue<T>(callback: (value: V) => T | void): T | undefined;
  forEachValue<T, S>(callback: (this: S, value: V) => T | void,
                     thisArg: S): T | undefined;
  forEachValue<T, S>(callback: (this: S | undefined, value: V) => T | void,
                     thisArg?: S): T | undefined {
    return this.root.forEachValue(callback, thisArg);
  }

  keys(): Cursor<K> {
    return this.root.keys();
  }

  values(): Cursor<V> {
    return this.root.values();
  }

  entries(): Cursor<[K, V]> {
    return this.root.entries();
  }

  reverseKeys(): Cursor<K> {
    return this.root.reverseKeys();
  }

  reverseValues(): Cursor<V> {
    return this.root.reverseValues();
  }

  reverseEntries(): Cursor<[K, V]> {
    return this.root.reverseEntries();
  }

  clone(): BTree<K, V, U> {
    return this.copy(this.root);
  }

  /** @internal */
  protected copy(root: BTreePage<K, V, U>): BTree<K, V, U> {
    const tree = new BTree(root);
    if (tree.compare !== this.compare) {
      tree.compare = this.compare;
    }
    if (tree.pageSplitSize !== this.pageSplitSize) {
      tree.pageSplitSize = this.pageSplitSize;
    }
    return tree;
  }
}
