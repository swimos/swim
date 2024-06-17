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

import type {Cursor} from "@swim/util";
import type {ReducedMap} from "@swim/util";
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
    return entry !== void 0 ? entry[0] : void 0;
  }

  firstValue(): V | undefined {
    const entry = this.root.firstEntry();
    return entry !== void 0 ? entry[1] : void 0;
  }

  firstEntry(): [K, V] | undefined {
    return this.root.firstEntry();
  }

  lastKey(): K | undefined {
    const entry = this.root.lastEntry();
    return entry !== void 0 ? entry[0] : void 0;
  }

  lastValue(): V | undefined {
    const entry = this.root.lastEntry();
    return entry !== void 0 ? entry[1] : void 0;
  }

  lastEntry(): [K, V] | undefined {
    return this.root.lastEntry();
  }

  nextKey(key: K): K | undefined {
    const entry = this.root.nextEntry(key, this);
    return entry !== void 0 ? entry[0] : void 0;
  }

  nextValue(key: K): V | undefined {
    const entry = this.root.nextEntry(key, this);
    return entry !== void 0 ? entry[1] : void 0;
  }

  nextEntry(key: K): [K, V] | undefined {
    return this.root.nextEntry(key, this);
  }

  previousKey(key: K): K | undefined {
    const entry = this.root.previousEntry(key, this);
    return entry !== void 0 ? entry[0] : void 0;
  }

  previousValue(key: K): V | undefined {
    const entry = this.root.previousEntry(key, this);
    return entry !== void 0 ? entry[1] : void 0;
  }

  previousEntry(key: K): [K, V] | undefined {
    return this.root.previousEntry(key, this);
  }

  set(key: K, newValue: V): this {
    const oldRoot = this.root;
    let newRoot = this.root.updated(key, newValue, this);
    if (oldRoot === newRoot) {
      return this;
    } else if (newRoot.size > oldRoot.size) {
      newRoot = newRoot.balanced(this);
    }
    this.root = newRoot;
    return this;
  }

  delete(key: K): boolean {
    const oldRoot = this.root;
    const newRoot = this.root.removed(key, this);
    if (oldRoot === newRoot) {
      return false;
    }
    this.root = newRoot;
    return true;
  }

  drop(lower: number): this {
    if (lower > 0 && this.root.size !== 0) {
      if (lower >= this.root.size) {
        this.root = BTreePage.empty();
      } else {
        this.root = this.root.drop(lower, this);
      }
    }
    return this;
  }

  take(upper: number): this {
    if (upper < this.root.size && this.root.size !== 0) {
      if (upper <= 0) {
        this.root = BTreePage.empty();
      } else {
        this.root = this.root.take(upper, this);
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
    if (oldRoot === newRoot) {
      return this;
    } else if (newRoot.size > oldRoot.size) {
      newRoot = newRoot.balanced(this);
    }
    return this.copy(newRoot);
  }

  removed(key: K): BTree<K, V, U> {
    const oldRoot = this.root;
    const newRoot = oldRoot.removed(key, this);
    if (oldRoot === newRoot) {
      return this;
    }
    return this.copy(newRoot);
  }

  cleared(): BTree<K, V, U> {
    if (this.root.isEmpty()) {
      return this;
    }
    return this.copy(BTreePage.empty());
  }

  reduced(identity: U, accumulator: (result: U, element: V) => U, combiner: (result: U, result2: U) => U): U {
    const oldRoot = this.root;
    const newRoot = oldRoot.reduced(identity, accumulator, combiner);
    if (oldRoot !== newRoot) {
      this.root = newRoot;
    }
    return newRoot.fold!;
  }

  forEach<T>(callback: (value: V, key: K, tree: BTree<K, V, U>) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, value: V, key: K, tree: BTree<K, V, U>) => T | void, thisArg?: S): T | undefined;
  forEach<T, S>(callback: (this: S | undefined, value: V, key: K, tree: BTree<K, V, U>) => T | void, thisArg?: S): T | undefined {
    return this.root.forEach(callback, thisArg, this);
  }

  forEachKey<T>(callback: (key: K, tree: BTree<K, V, U>) => T | void): T | undefined;
  forEachKey<T, S>(callback: (this: S, key: K, tree: BTree<K, V, U>) => T | void, thisArg: S): T | undefined;
  forEachKey<T, S>(callback: (this: S | undefined, key: K, tree: BTree<K, V, U>) => T | void, thisArg?: S): T | undefined {
    return this.root.forEachKey(callback, thisArg, this);
  }

  forEachValue<T>(callback: (value: V, tree: BTree<K, V, U>) => T | void): T | undefined;
  forEachValue<T, S>(callback: (this: S, value: V, tree: BTree<K, V, U>) => T | void, thisArg: S): T | undefined;
  forEachValue<T, S>(callback: (this: S | undefined, value: V, tree: BTree<K, V, U>) => T | void, thisArg?: S): T | undefined {
    return this.root.forEachValue(callback, thisArg, this);
  }

  [Symbol.iterator](): Cursor<[K, V]> {
    return this.root.entries();
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
    if (tree.pageSplitSize !== this.pageSplitSize) {
      tree.pageSplitSize = this.pageSplitSize;
    }
    if (tree.compare !== this.compare) {
      tree.compare = this.compare;
    }
    return tree;
  }

  get [Symbol.toStringTag](): string {
    return "BTree";
  }
}
