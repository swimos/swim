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

import {Iterator, Map} from "@swim/util";

/** @hidden */
export interface ConstraintKey {
  id: number;
}

/** @hidden */
export class ConstraintMap<K extends ConstraintKey, V> implements Map<K, V> {
  /** @hidden */
  _index: {[id: number]: number | undefined};
  /** @hidden */
  readonly _array: Array<[K, V]>;

  constructor(index: {[id: number]: number | undefined} = {}, array: Array<[K, V]> = []) {
    this._index = index;
    this._array = array;
  }

  get size(): number {
    return this._array.length;
  }

  isEmpty(): boolean {
    return this._array.length === 0;
  }

  has(key: K): boolean {
    return this._index[key.id] !== void 0;
  }

  get(key: K): V | undefined {
    const index = this._index[key.id];
    return index !== void 0 ? this._array[index][1] : void 0;
  }

  getField(key: K): [K, V] | undefined {
    const index = this._index[key.id];
    return index !== void 0 ? this._array[index] : void 0;
  }

  getEntry(index: number): [K, V] | undefined {
    return this._array[index];
  }

  set(key: K, newValue: V): this {
    const index = this._index[key.id];
    if (index !== void 0) {
      this._array[index][1] = newValue;
    } else {
      this._index[key.id] = this._array.length;
      this._array.push([key, newValue]);
    }
    return this;
  }

  delete(key: K): boolean {
    const index = this._index[key.id];
    if (index !== void 0) {
      delete this._index[key.id];
      const item = this._array[index];
      const last = this._array.pop()!;
      if (item !== last) {
        this._array[index] = last;
        this._index[last[0].id] = index;
      }
      return true;
    } else {
      return false;
    }
  }

  remove(key: K): V | undefined {
    const index = this._index[key.id];
    if (index !== void 0) {
      delete this._index[key.id];
      const item = this._array[index];
      const last = this._array.pop()!;
      if (item !== last) {
        this._array[index] = last;
        this._index[last[0].id] = index;
      }
      return item[1];
    } else {
      return void 0;
    }
  }

  clear(): void {
    this._index = {};
    this._array.length = 0;
  }

  forEach<T, S = unknown>(callback: (this: S, key: K, value: V) => T | void,
                          thisArg?: S): T | undefined {
    const array = this._array;
    for (let i = 0, n = array.length; i < n; i += 1) {
      const item = array[i];
      const result = callback.call(thisArg, item[0], item[1]);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  keys(): Iterator<K> {
    return void 0 as any; // not implemented
  }

  values(): Iterator<V> {
    return void 0 as any; // not implemented
  }

  entries(): Iterator<[K, V]> {
    return void 0 as any; // not implemented
  }

  clone(): ConstraintMap<K, V> {
    const oldArray = this._array;
    const n = oldArray.length;
    const newIndex = {} as {[id: number]: number | undefined};
    const newArray = new Array<[K, V]>(n);
    for (let i = 0; i < n; i += 1) {
      const [key, value] = oldArray[i];
      newArray[i] = [key, value];
      newIndex[key.id] = i;
    }
    return new ConstraintMap(newIndex, newArray);
  }

  /** @hidden */
  static _nextId: number = 1;

  static nextId(): number {
    const nextId = ConstraintMap._nextId;
    ConstraintMap._nextId = nextId + 1;
    return nextId;
  }
}
