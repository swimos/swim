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

import {Equals, Lazy, Arrays} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import type {Feel} from "../feel/Feel";
import type {Mood} from "./Mood";

export type AnyMoodVector<M extends Mood = Feel> = MoodVector<M> | MoodVectorArray<M>;

export type MoodVectorArray<M extends Mood = Feel> = ReadonlyArray<[M, number]>;

export type MoodVectorUpdates<M extends Mood = Feel> = ReadonlyArray<[M, number | undefined]>;

export class MoodVector<M extends Mood = Feel> implements Equals, Debug {
  constructor(array: ReadonlyArray<[M, number]>,
              index: {readonly [name: string]: number | undefined}) {
    Object.defineProperty(this, "array", {
      value: array,
      enumerable: true,
    });
    Object.defineProperty(this, "index", {
      value: index,
      enumerable: true,
    });
  }

  /** @hidden */
  readonly array!: ReadonlyArray<[M, number]>;

  /** @hidden */
  readonly index!: {readonly [name: string]: number | undefined};

  get size(): number {
    return this.array.length;
  }

  isEmpty(): boolean {
    return this.array.length === 0;
  }

  has(key: M): boolean;
  has(name: string): boolean;
  has(key: M | string): boolean {
    if (typeof key === "object" && key !== null || typeof key === "function") {
      key = key.name;
    }
    return this.index[key] !== void 0;
  }

  get(key: M): number | undefined;
  get(name: string): number | undefined;
  get(index: number): number | undefined;
  get(key: M | string | number | undefined): number | undefined {
    if (typeof key === "object" && key !== null || typeof key === "function") {
      key = key.name;
    }
    if (typeof key === "string") {
      key = this.index[key];
    }
    const entry = typeof key === "number" ? this.array[key] : void 0;
    return entry !== void 0 ? entry[1] : void 0;
  }

  getOr<E>(key: M, elseValue: E): number | E;
  getOr<E>(name: string, elseValue: E): number | E;
  getOr<E>(index: number, elseValue: E): number | E;
  getOr<E>(key: M | string | number | undefined, elseValue: E): number | E {
    if (typeof key === "object" && key !== null || typeof key === "function") {
      key = key.name;
    }
    if (typeof key === "string") {
      key = this.index[key];
    }
    const entry = typeof key === "number" ? this.array[key] : void 0;
    return entry !== void 0 ? entry[1] : elseValue;
  }

  updated(key: M, value: number | undefined): MoodVector<M>;
  updated(updates: MoodVectorUpdates<M>): MoodVector<M>;
  updated(updates: MoodVectorUpdates<M> | M, value?: number | undefined): MoodVector<M> {
    let key: M;
    let oldArray = this.array;
    let oldIndex = this.index;
    let newArray: [M, number][] | undefined;
    let newIndex: {[name: string]: number | undefined} | undefined;
    const updateCount = Array.isArray(updates) ? updates.length : 1;
    for (let updateIndex = 0; updateIndex < updateCount; updateIndex += 1) {
      if (updateIndex === 0 && !Array.isArray(updates)) {
        key = updates as M;
      } else {
        [key, value] = (updates as MoodVectorUpdates<M>)[updateIndex]!;
      }
      const i = oldIndex[key.name];
      if (value !== void 0 && i !== void 0) { // update
        newArray = oldArray.slice(0);
        newIndex = oldIndex;
        newArray[i] = [key, value];
        oldArray = newArray;
      } else if (value !== void 0) { // insert
        newArray = oldArray.slice(0);
        newIndex = {};
        for (const name in oldIndex) {
          newIndex[name] = oldIndex[name];
        }
        newIndex[key.name] = newArray.length;
        newArray.push([key, value]);
        oldArray = newArray;
        oldIndex = newIndex;
      } else if (i !== void 0) { // remove
        newArray = new Array<[M, number]>();
        newIndex = {};
        let k = 0;
        for (let j = 0, n = oldArray.length; j < n; j += 1) {
          const entry = oldArray[j]!;
          if (entry[0] !== key) {
            newArray[k] = entry;
            newIndex[entry[0].name] = k;
            k += 1;
          }
        }
        oldArray = newArray;
        oldIndex = newIndex;
      }
    }
    if (newArray !== void 0 && newIndex !== void 0) {
      return this.copy(newArray, newIndex);
    } else {
      return this;
    }
  }

  plus(that: MoodVector<M>): MoodVector<M> {
    const thisArray = this.array;
    const thatArray = that.array;
    const newArray = new Array<[M, number]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0, n = thisArray.length; i < n; i += 1) {
      const entry = thisArray[i]!;
      const key = entry[0];
      const y = that.get(key);
      newIndex[key.name] = newArray.length;
      newArray.push(y === void 0 ? entry : [key, entry[1] + y]);
    }
    for (let i = 0, n = thatArray.length; i < n; i += 1) {
      const entry = thatArray[i]!;
      const key = entry[0];
      if (newIndex[key.name] === void 0) {
        newIndex[key.name] = newArray.length;
        newArray.push(entry);
      }
    }
    return this.copy(newArray, newIndex);
  }

  negative(): MoodVector<M> {
    const oldArray = this.array;
    const n = oldArray.length;
    const newArray = new Array<[M, number]>(n);
    for (let i = 0; i < n; i += 1) {
      const [key, x] = oldArray[i]!;
      newArray[i] = [key, -x];
    }
    return this.copy(newArray, this.index);
  }

  minus(that: MoodVector<M>): MoodVector<M> {
    const thisArray = this.array;
    const thatArray = that.array;
    const newArray = new Array<[M, number]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0, n = thisArray.length; i < n; i += 1) {
      const entry = thisArray[i]!;
      const key = entry[0];
      const y = that.get(key);
      newIndex[key.name] = newArray.length;
      newArray.push(y === void 0 ? entry : [key, entry[1] - y]);
    }
    for (let i = 0, n = thatArray.length; i < n; i += 1) {
      const [key, y] = thatArray[i]!;
      if (newIndex[key.name] === void 0) {
        newIndex[key.name] = newArray.length;
        newArray.push([key, -y]);
      }
    }
    return this.copy(newArray, newIndex);
  }

  times(scalar: number): MoodVector<M> {
    const oldArray = this.array;
    const n = oldArray.length;
    const newArray = new Array<[M, number]>(n);
    for (let i = 0; i < n; i += 1) {
      const [key, x] = oldArray[i]!;
      newArray[i] = [key, x * scalar];
    }
    return this.copy(newArray, this.index);
  }

  dot(that: MoodVector<M>): number | undefined {
    const array = this.array;
    let combination: number | undefined;
    for (let i = 0, n = array.length; i < n; i += 1) {
      const [key, x] = array[i]!;
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

  forEach<R>(callback: (value: number, key: M) => R | void): R | undefined;
  forEach<R, S>(callback: (this: S, value: number, key: M) => R | void,
                thisArg: S): R | undefined;
  forEach<R, S>(callback: (this: S | undefined, value: number, key: M) => R | void,
                thisArg?: S): R | undefined {
    const array = this.array;
    for (let i = 0, n = array.length; i < n; i += 1) {
      const entry = array[i]!;
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
      return Arrays.equal(this.array, that.array);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    const array = this.array;
    const n = array.length;
    output = output.write("MoodVector").write(46/*'.'*/)
                   .write(n !== 0 ? "of" : "empty").write(40/*'('*/);
    for (let i = 0; i < n; i += 1) {
      const [key, value] = array[i]!;
      if (i !== 0) {
        output = output.write(", ");
      }
      output = output.write(91/*'['*/).debug(key).write(", ").debug(value).write(93/*']'*/);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static empty<M extends Mood>(): MoodVector<M> {
    return new MoodVector([], {});
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

  static fromAny<M extends Mood>(value: AnyMoodVector<M>): MoodVector<M> {
    if (value === void 0 || value === null || value instanceof MoodVector) {
      return value;
    } else if (Array.isArray(value)) {
      return MoodVector.fromArray(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static index<M extends Mood>(array: ReadonlyArray<[M, unknown]>): {readonly [name: string]: number | undefined} {
    const index: {[name: string]: number | undefined} = {};
    for (let i = 0, n = array.length; i < n; i += 1) {
      const entry = array[i]!;
      index[entry[0].name] = i;
    }
    return index;
  }
}
