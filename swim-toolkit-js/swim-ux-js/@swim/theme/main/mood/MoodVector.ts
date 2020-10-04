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
import {Feel} from "../feel/Feel";
import {Mood} from "./Mood";

export type AnyMoodVector<M extends Mood = Feel> = MoodVector<M> | MoodVectorArray<M>;

export type MoodVectorArray<M extends Mood = Feel> = ReadonlyArray<[M, number]>;

export class MoodVector<M extends Mood = Feel> implements Equals, Debug {
  /** @hidden */
  readonly _array: ReadonlyArray<[M, number]>;
  /** @hidden */
  readonly _index: {readonly [name: string]: number | undefined};

  constructor(array: ReadonlyArray<[M, number]>,
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

  has(key: M): boolean;
  has(name: string): boolean;
  has(key: M | string): boolean {
    if (typeof key === "object" && key !== null || typeof key === "function") {
      key = key.name;
    }
    return this._index[key] !== void 0;
  }

  get(key: M): number | undefined;
  get(name: string): number | undefined;
  get(index: number): number | undefined;
  get(key: M | string | number | undefined): number | undefined {
    if (typeof key === "object" && key !== null || typeof key === "function") {
      key = key.name;
    }
    if (typeof key === "string") {
      key = this._index[key];
    }
    const entry = typeof key === "number" ? this._array[key] : void 0;
    return entry !== void 0 ? entry[1] : void 0;
  }

  updated(key: M, value: number | undefined): MoodVector<M> {
    const oldArray = this._array;
    const oldIndex = this._index;
    const i = oldIndex[key.name];
    if (value !== void 0 && i !== void 0) { // update
      const newArray = oldArray.slice(0);
      newArray[i] = [key, value];
      return this.copy(newArray, oldIndex);
    } else if (value !== void 0) { // insert
      const newArray = oldArray.slice(0);
      const newIndex: {[name: string]: number | undefined} = {};
      for (const name in oldIndex) {
        newIndex[name] = oldIndex[name];
      }
      newIndex[key.name] = newArray.length;
      newArray.push([key, value]);
      return this.copy(newArray, newIndex);
    } else if (i !== void 0) { // remove
      const newArray = new Array<[M, number]>();
      const newIndex: {[name: string]: number | undefined} = {};
      let k = 0;
      for (let j = 0, n = oldArray.length; j < n; j += 1) {
        const entry = oldArray[j];
        if (entry[0] !== key) {
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

  plus(that: MoodVector<M>): MoodVector<M> {
    const thisArray = this._array;
    const thatArray = that._array;
    const newArray = new Array<[M, number]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0, n = thisArray.length; i < n; i += 1) {
      const entry = thisArray[i];
      const key = entry[0];
      const y = that.get(key);
      newIndex[key.name] = newArray.length;
      newArray.push(y === void 0 ? entry : [key, entry[1] + y]);
    }
    for (let i = 0, n = thatArray.length; i < n; i += 1) {
      const entry = thatArray[i];
      const key = entry[0];
      if (newIndex[key.name] === void 0) {
        newIndex[key.name] = newArray.length;
        newArray.push(entry);
      }
    }
    return this.copy(newArray, newIndex);
  }

  opposite(): MoodVector<M> {
    const oldArray = this._array;
    const n = oldArray.length;
    const newArray = new Array<[M, number]>(n);
    for (let i = 0; i < n; i += 1) {
      const [key, x] = oldArray[i];
      newArray[i] = [key, -x];
    }
    return this.copy(newArray, this._index);
  }

  minus(that: MoodVector<M>): MoodVector<M> {
    const thisArray = this._array;
    const thatArray = that._array;
    const newArray = new Array<[M, number]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0, n = thisArray.length; i < n; i += 1) {
      const entry = thisArray[i];
      const key = entry[0];
      const y = that.get(key);
      newIndex[key.name] = newArray.length;
      newArray.push(y === void 0 ? entry : [key, entry[1] - y]);
    }
    for (let i = 0, n = thatArray.length; i < n; i += 1) {
      const [key, y] = thatArray[i];
      if (newIndex[key.name] === void 0) {
        newIndex[key.name] = newArray.length;
        newArray.push([key, -y]);
      }
    }
    return this.copy(newArray, newIndex);
  }

  times(scalar: number): MoodVector<M> {
    const oldArray = this._array;
    const n = oldArray.length;
    const newArray = new Array<[M, number]>(n);
    for (let i = 0; i < n; i += 1) {
      const [key, x] = oldArray[i];
      newArray[i] = [key, x * scalar];
    }
    return this.copy(newArray, this._index);
  }

  dot(that: MoodVector<M>): number | undefined {
    const array = this._array;
    let combination: number | undefined;
    for (let i = 0, n = array.length; i < n; i += 1) {
      const [key, x] = array[i];
      const y = that.get(key);
      if (y !== void 0) {
        if (combination === void 0) {
          combination = x * y;
        } else {
          combination += x * y
        }
      }
    }
    return combination;
  }

  protected copy(array: ReadonlyArray<[M, number]>,
                 index?: {readonly [name: string]: number | undefined}): MoodVector<M> {
    return MoodVector.fromArray(array, index);
  }

  forEach<R, S = unknown>(callback: (this: S, value: number, key: M) => R | void,
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
    } else if (that instanceof MoodVector) {
      return Objects.equal(this._array, that._array);
    }
    return false;
  }

  debug(output: Output): void {
    const array = this._array;
    const n = array.length;
    output = output.write("MoodVector").write(46/*'.'*/)
        .write(n !== 0 ? "of" : "empty").write(40/*'('*/);
    for (let i = 0; i < n; i += 1) {
      const [key, value] = array[i];
      if (i !== 0) {
        output = output.write(", ");
      }
      output = output.write(91/*'['*/).debug(key).write(", ").debug(value).write(93/*']'*/);
    }
    output = output.write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _empty?: MoodVector<any>;
  static empty<M extends Mood>(): MoodVector<M> {
    if (MoodVector._empty === void 0) {
      MoodVector._empty = new MoodVector([], {});
    }
    return MoodVector._empty;
  }

  static of<M extends Mood>(...keys: [M, number][]): MoodVector<M> {
    return new MoodVector(keys, MoodVector.index(keys));
  }

  static fromArray<M extends Mood>(array: ReadonlyArray<[M, number]>,
                                   index?: {[name: string]: number | undefined}): MoodVector<M> {
    if (index === void 0) {
      index = MoodVector.index(array);
    }
    return new MoodVector(array, index);
  }

  static fromAny<M extends Mood>(vector: AnyMoodVector<M>): MoodVector<M> {
    if (vector instanceof MoodVector) {
      return vector;
    } else if (Array.isArray(vector)) {
      return MoodVector.fromArray(vector);
    }
    throw new TypeError("" + vector);
  }

  /** @hidden */
  static index<M extends Mood>(array: ReadonlyArray<[M, unknown]>): {readonly [name: string]: number | undefined} {
    const index: {[name: string]: number | undefined} = {};
    for (let i = 0, n = array.length; i < n; i += 1) {
      const entry = array[i];
      index[entry[0].name] = i;
    }
    return index;
  }
}
