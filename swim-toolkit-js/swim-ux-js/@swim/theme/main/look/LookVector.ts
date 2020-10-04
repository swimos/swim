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

export type AnyLookVector<T> = LookVector<T> | LookVectorArray<T>;

export type LookVectorArray<T> = ReadonlyArray<[Feel, T]>;

export class LookVector<T> implements Equals, Debug {
  /** @hidden */
  readonly _array: ReadonlyArray<[Feel, T]>;
  /** @hidden */
  readonly _index: {readonly [name: string]: number | undefined};

  constructor(array: ReadonlyArray<[Feel, T]>,
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

  has(feel: Feel): boolean;
  has(name: string): boolean;
  has(feel: Feel | string): boolean {
    if (typeof feel === "object" && feel !== null || typeof feel === "function") {
      feel = feel.name;
    }
    return this._index[feel] !== void 0;
  }

  get(feel: Feel): T | undefined;
  get(name: string): T | undefined;
  get(index: number): T | undefined;
  get(feel: Feel | string | number | undefined): T | undefined {
    if (typeof feel === "object" && feel !== null || typeof feel === "function") {
      feel = feel.name;
    }
    if (typeof feel === "string") {
      feel = this._index[feel];
    }
    const entry = typeof feel === "number" ? this._array[feel] : void 0;
    return entry !== void 0 ? entry[1] : void 0;
  }

  updated(feel: Feel, value: T | undefined): LookVector<T> {
    const oldArray = this._array;
    const oldIndex = this._index;
    const i = oldIndex[feel.name];
    if (value !== void 0 && i !== void 0) { // update
      const newArray = oldArray.slice(0);
      newArray[i] = [feel, value];
      return this.copy(newArray, oldIndex);
    } else if (value !== void 0) { // insert
      const newArray = oldArray.slice(0);
      const newIndex: {[name: string]: number | undefined} = {};
      for (const name in oldIndex) {
        newIndex[name] = oldIndex[name];
      }
      newIndex[feel.name] = newArray.length;
      newArray.push([feel, value]);
      return this.copy(newArray, newIndex);
    } else if (i !== void 0) { // remove
      const newArray = new Array<[Feel, T]>();
      const newIndex: {[name: string]: number | undefined} = {};
      let k = 0;
      for (let j = 0, n = oldArray.length; j < n; j += 1) {
        const entry = oldArray[j];
        if (entry[0] !== feel) {
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

  protected copy(array: ReadonlyArray<[Feel, T]>,
                 index?: {readonly [name: string]: number | undefined}): LookVector<T> {
    return LookVector.fromArray(array, index);
  }

  forEach<R, S = unknown>(callback: (this: S, value: T, feel: Feel) => R | void,
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
    } else if (that instanceof LookVector) {
      return Objects.equal(this._array, that._array);
    }
    return false;
  }

  debug(output: Output): void {
    const array = this._array;
    const n = array.length;
    output = output.write("LookVector").write(46/*'.'*/)
        .write(n !== 0 ? "of" : "empty").write(40/*'('*/);
    for (let i = 0; i < n; i += 1) {
      const [feel, value] = array[i];
      if (i !== 0) {
        output = output.write(", ");
      }
      output = output.write(91/*'['*/).debug(feel).write(", ").debug(value).write(93/*']'*/);
    }
    output = output.write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _empty?: LookVector<any>;
  static empty<T>(): LookVector<T> {
    if (LookVector._empty === void 0) {
      LookVector._empty = new LookVector([], {});
    }
    return LookVector._empty;
  }

  static of<T>(...feels: [Feel, T][]): LookVector<T> {
    return new LookVector(feels, LookVector.index(feels));
  }

  static fromArray<T>(array: ReadonlyArray<[Feel, T]>,
                      index?: {[name: string]: number | undefined}): LookVector<T> {
    if (index === void 0) {
      index = LookVector.index(array);
    }
    return new LookVector(array, index);
  }

  static fromAny<T>(vector: AnyLookVector<T>): LookVector<T> {
    if (vector instanceof LookVector) {
      return vector;
    } else if (Array.isArray(vector)) {
      return LookVector.fromArray(vector);
    }
    throw new TypeError("" + vector);
  }

  /** @hidden */
  static index<T>(array: ReadonlyArray<[Feel, T]>): {readonly [name: string]: number | undefined} {
    const index: {[name: string]: number | undefined} = {};
    for (let i = 0, n = array.length; i < n; i += 1) {
      const entry = array[i];
      index[entry[0].name] = i;
    }
    return index
  }
}
