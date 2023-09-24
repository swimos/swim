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

import {Lazy} from "@swim/util";
import {Cursor} from "@swim/util";
import type {BTreeContext} from "./BTreeContext";
import type {BTree} from "./BTree";
import {BTreeLeaf} from "./"; // forward import

/** @internal */
export abstract class BTreePage<K, V, U> {
  abstract readonly arity: number;

  abstract readonly size: number;

  abstract isEmpty(): boolean;

  abstract readonly fold: U | undefined;

  abstract minKey(): K;

  abstract maxKey(): K;

  abstract has(key: K, tree: BTreeContext<K, V>): boolean;

  abstract get(key: K, tree: BTreeContext<K, V>): V | undefined;

  abstract getEntry(index: number): [K, V] | undefined;

  abstract firstEntry(): [K, V] | undefined;

  abstract lastEntry(): [K, V] | undefined;

  abstract nextEntry(key: K, tree: BTreeContext<K, V>): [K, V] | undefined;

  abstract previousEntry(key: K, tree: BTreeContext<K, V>): [K, V] | undefined;

  abstract updated(key: K, newValue: V, tree: BTreeContext<K, V>): BTreePage<K, V, U>;

  abstract removed(key: K, tree: BTreeContext<K, V>): BTreePage<K, V, U>;

  abstract drop(lower: number, tree: BTreeContext<K, V>): BTreePage<K, V, U>;

  abstract take(upper: number, tree: BTreeContext<K, V>): BTreePage<K, V, U>;

  abstract balanced(tree: BTreeContext<K, V>): BTreePage<K, V, U>;

  abstract split(index: number): BTreePage<K, V, U>;

  abstract splitLeft(index: number): BTreePage<K, V, U>;

  abstract splitRight(index: number): BTreePage<K, V, U>;

  abstract reduced(identity: U, accumulator: (result: U, element: V) => U,
                   combiner: (result: U, result2: U) => U): BTreePage<K, V, U>;

  abstract forEach<T, S>(callback: (this: S, value: V, key: K, tree: BTree<K, V, U>) => T | void,
                         thisArg: S, tree: BTree<K, V, U>): T | undefined;

  abstract forEachKey<T, S>(callback: (this: S, key: K, tree: BTree<K, V, U>) => T | void,
                            thisArg: S, tree: BTree<K, V, U>): T | undefined;

  abstract forEachValue<T, S>(callback: (this: S, value: V, tree: BTree<K, V, U>) => T | void,
                              thisArg: S, tree: BTree<K, V, U>): T | undefined;

  keys(): Cursor<K> {
    return Cursor.keys(this.entries());
  }

  values(): Cursor<V> {
    return Cursor.values(this.entries());
  }

  abstract entries(): Cursor<[K, V]>;

  reverseKeys(): Cursor<K> {
    return Cursor.keys(this.reverseEntries());
  }

  reverseValues(): Cursor<V> {
    return Cursor.values(this.reverseEntries());
  }

  abstract reverseEntries(): Cursor<[K, V]>;

  @Lazy
  static empty<K, V, U>(): BTreeLeaf<K, V, U> {
    return new BTreeLeaf<K, V, U>([], void 0);
  }
}
