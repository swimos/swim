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

import {Equals, Objects} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import {Look} from "../look/Look";

export type AnyFeelVector = FeelVector | FeelVectorArray;

export type FeelVectorArray = ReadonlyArray<[Look<unknown>, unknown]>;

export class FeelVector implements Equals, Debug {
  /** @hidden */
  readonly _array: ReadonlyArray<[Look<unknown>, unknown]>;
  /** @hidden */
  readonly _index: {readonly [name: string]: number | undefined};

  constructor(array: ReadonlyArray<[Look<unknown>, unknown]>,
              index: {readonly [name: string]: number | undefined}) {
    this._array = array;
    this._index = index;
  }

  get size(): number {
    return this._array.length;
  }

  isEmpty(): boolean {
    return this._array.length === 0;
  }

  has(look: Look<any>): boolean;
  has(name: string): boolean;
  has(look: Look<any> | string): boolean {
    if (typeof look === "object" && look !== null || typeof look === "function") {
      look = look.name;
    }
    return this._index[look] !== void 0;
  }

  get<T>(look: Look<T, any>): T | undefined;
  get(name: string): unknown | undefined;
  get(index: number): unknown | undefined;
  get<T>(look: Look<T, any> | string | number | undefined): T | unknown | undefined {
    if (typeof look === "object" && look !== null || typeof look === "function") {
      look = look.name;
    }
    if (typeof look === "string") {
      look = this._index[look];
    }
    const entry = typeof look === "number" ? this._array[look] : void 0;
    return entry !== void 0 ? entry[1] : void 0;
  }

  updated<T, U = T>(look: Look<T, U>, value: T | U | undefined): FeelVector {
    const oldArray = this._array;
    const oldIndex = this._index;
    const i = oldIndex[look.name];
    if (value !== void 0 && i !== void 0) { // update
      const newArray = oldArray.slice(0);
      newArray[i] = [look, value];
      return this.copy(newArray, oldIndex);
    } else if (value !== void 0) { // insert
      const newArray = oldArray.slice(0);
      const newIndex: {[name: string]: number | undefined} = {};
      for (const name in oldIndex) {
        newIndex[name] = oldIndex[name];
      }
      newIndex[look.name] = newArray.length;
      newArray.push([look, value]);
      return this.copy(newArray, newIndex);
    } else if (i !== void 0) { // remove
      const newArray = new Array<[Look<unknown>, unknown]>();
      const newIndex: {[name: string]: number | undefined} = {};
      let k = 0;
      for (let j = 0, n = oldArray.length; j < n; j += 1) {
        const entry = oldArray[j];
        if (entry[0] !== look) {
          newArray[k] = entry;
          newIndex[entry[0].name] = k;
          k += 1;
        }
      }
      return this.copy(newArray, newIndex);
    } else { // nop
      return this;
    }
  }

  plus(that: FeelVector): FeelVector {
    const thisArray = this._array;
    const thatArray = that._array;
    const newArray = new Array<[Look<unknown>, unknown]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0, n = thisArray.length; i < n; i += 1) {
      const entry = thisArray[i];
      const look = entry[0];
      const y = that.get(look);
      newIndex[look.name] = newArray.length;
      newArray.push(y === void 0 ? entry : [look, look.combine(entry[1], y)]);
    }
    for (let i = 0, n = thatArray.length; i < n; i += 1) {
      const entry = thatArray[i];
      const look = entry[0];
      if (newIndex[look.name] === void 0) {
        newIndex[look.name] = newArray.length;
        newArray.push(entry);
      }
    }
    return this.copy(newArray, newIndex);
  }

  opposite(): FeelVector {
    const oldArray = this._array;
    const n = oldArray.length;
    const newArray = new Array<[Look<unknown>, unknown]>(n);
    for (let i = 0; i < n; i += 1) {
      const [look, x] = oldArray[i];
      newArray[i] = [look, look.combine(void 0, x, -1)];
    }
    return this.copy(newArray, this._index);
  }

  minus(that: FeelVector): FeelVector {
    const thisArray = this._array;
    const thatArray = that._array;
    const newArray = new Array<[Look<unknown>, unknown]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0, n = thisArray.length; i < n; i += 1) {
      const entry = thisArray[i];
      const look = entry[0];
      const y = that.get(look);
      newIndex[look.name] = newArray.length;
      newArray.push(y === void 0 ? entry : [look, look.combine(entry[1], y, -1)]);
    }
    for (let i = 0, n = thatArray.length; i < n; i += 1) {
      const [look, y] = thatArray[i];
      if (newIndex[look.name] === void 0) {
        newIndex[look.name] = newArray.length;
        newArray.push([look, look.combine(void 0, y, -1)]);
      }
    }
    return this.copy(newArray, newIndex);
  }

  times(scalar: number): FeelVector {
    const oldArray = this._array;
    const n = oldArray.length;
    const newArray = new Array<[Look<unknown>, unknown]>(n);
    for (let i = 0; i < n; i += 1) {
      const [look, x] = oldArray[i];
      newArray[i] = [look, look.combine(void 0, x, scalar)];
    }
    return this.copy(newArray, this._index);
  }

  protected copy(array: ReadonlyArray<[Look<unknown>, unknown]>,
                 index?: {readonly [name: string]: number | undefined}): FeelVector {
    return FeelVector.fromArray(array, index);
  }

  forEach<R, S = unknown>(callback: <T>(this: S, value: T, look: Look<T>) => R | void,
                          thisArg?: S): R | undefined {
    const array = this._array;
    for (let i = 0, n = array.length; i < n; i += 1) {
      const entry = array[i];
      const result = callback.call(thisArg, entry[1], entry[0]);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof FeelVector) {
      return Objects.equal(this._array, that._array);
    }
    return false;
  }

  debug(output: Output): void {
    const array = this._array;
    const n = array.length;
    output = output.write("FeelVector").write(46/*'.'*/)
        .write(n !== 0 ? "of" : "empty").write(40/*'('*/);
    for (let i = 0; i < n; i += 1) {
      const [look, value] = array[i];
      if (i !== 0) {
        output = output.write(", ");
      }
      output = output.write(91/*'['*/).debug(look).write(", ").debug(value).write(93/*']'*/);
    }
    output = output.write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _empty?: FeelVector;
  static empty(): FeelVector {
    if (FeelVector._empty === void 0) {
      FeelVector._empty = new FeelVector([], {});
    }
    return FeelVector._empty;
  }

  static of(...looks: [Look<unknown>, unknown][]): FeelVector {
    const n = looks.length;
    const array = new Array<[Look<unknown>, unknown]>(n);
    const index: {[name: string]: number | undefined} = {};
    for (let i = 0; i < n; i += 1) {
      const [look, value] = looks[i];
      array[i] = [look, look.coerce(value)];
      index[look.name] = i;
    }
    return new FeelVector(array, index);
  }

  static fromArray(array: ReadonlyArray<[Look<unknown>, unknown]>,
                   index?: {readonly [name: string]: number | undefined}): FeelVector {
    if (index === void 0) {
      index = FeelVector.index(array);
    }
    return new FeelVector(array, index);
  }

  static fromAny(vector: AnyFeelVector): FeelVector {
    if (vector instanceof FeelVector) {
      return vector;
    } else if (Array.isArray(vector)) {
      return FeelVector.of(...vector);
    }
    throw new TypeError("" + vector);
  }

  /** @hidden */
  static index<T>(array: ReadonlyArray<[Look<T>, T]>): {readonly [name: string]: number | undefined} {
    const index: {[name: string]: number | undefined} = {};
    for (let i = 0, n = array.length; i < n; i += 1) {
      const entry = array[i];
      index[entry[0].name] = i;
    }
    return index;
  }
}
