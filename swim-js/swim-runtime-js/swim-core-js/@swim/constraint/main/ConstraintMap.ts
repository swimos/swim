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

import type {Mutable} from "@swim/util";
import type {ConstraintKey} from "./ConstraintKey";

/** @hidden */
export class ConstraintMap<K extends ConstraintKey, V> {
  constructor(index?: {[id: number]: number | undefined}, array?: Array<[K, V]>) {
    this.index = index !== void 0 ? index : {};
    this.array = array !== void 0 ? array : [];
  }

  /** @hidden */
  readonly index: {[id: number]: number | undefined};

  /** @hidden */
  readonly array: Array<[K, V]>;

  get size(): number {
    return this.array.length;
  }

  isEmpty(): boolean {
    return this.array.length === 0;
  }

  has(key: K): boolean {
    return this.index[key.id] !== void 0;
  }

  get(key: K): V | undefined {
    const k = this.index[key.id];
    return k !== void 0 ? this.array[k]![1] : void 0;
  }

  getField(key: K): [K, V] | undefined {
    const k = this.index[key.id];
    return k !== void 0 ? this.array[k] : void 0;
  }

  getEntry(k: number): [K, V] | undefined {
    return this.array[k];
  }

  set(key: K, newValue: V): V | undefined {
    const k = this.index[key.id];
    if (k !== void 0) {
      const entry = this.array[k]!;
      const oldValue = entry[1];
      entry[1] = newValue;
      return oldValue;
    } else {
      this.index[key.id] = this.array.length;
      this.array.push([key, newValue]);
      return void 0;
    }
  }

  delete(key: K): boolean {
    const k = this.index[key.id];
    if (k !== void 0) {
      delete this.index[key.id];
      const item = this.array[k];
      const last = this.array.pop()!;
      if (item !== last) {
        this.array[k] = last;
        this.index[last[0].id] = k;
      }
      return true;
    } else {
      return false;
    }
  }

  remove(key: K): V | undefined {
    const k = this.index[key.id];
    if (k !== void 0) {
      delete this.index[key.id];
      const item = this.array[k]!;
      const last = this.array.pop()!;
      if (item !== last) {
        this.array[k] = last;
        this.index[last[0].id] = k;
      }
      return item[1];
    } else {
      return void 0;
    }
  }

  clear(): void {
    (this as Mutable<this>).index = {};
    this.array.length = 0;
  }

  forEach<T>(callback: (key: K, value: V) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, key: K, value: V) => T | void,
                thisArg: S): T | undefined;
  forEach<T, S>(callback: (this: S | undefined, key: K, value: V) => T | void,
                thisArg?: S): T | undefined {
    const array = this.array;
    for (let i = 0, n = array.length; i < n; i += 1) {
      const item = array[i]!;
      const result = callback.call(thisArg, item[0], item[1]);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  clone(): ConstraintMap<K, V> {
    const oldArray = this.array;
    const n = oldArray.length;
    const newIndex = {} as {[id: number]: number | undefined};
    const newArray = new Array<[K, V]>(n);
    for (let i = 0; i < n; i += 1) {
      const [key, value] = oldArray[i]!;
      newArray[i] = [key, value];
      newIndex[key.id] = i;
    }
    return new ConstraintMap(newIndex, newArray);
  }
}
