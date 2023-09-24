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

import type {Uninitable} from "@swim/util";
import {Lazy} from "@swim/util";
import {Arrays} from "@swim/util";
import type {Equals} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {Feel} from "./Feel";

/** @public */
export type LookVectorInit<T> = LookVector<T> | LookVectorArray<T>;

/** @public */
export type LookVectorArray<T> = readonly [Feel, T][];

/** @public */
export type LookVectorUpdates<T> = readonly [Feel, T | undefined][];

/** @public */
export class LookVector<T> implements Equals, Debug {
  constructor(array: readonly [Feel, T][],
              index: {readonly [name: string]: number | undefined}) {
    this.array = array;
    this.index = index;
  }

  likeType?(like: LookVectorArray<T>): void;

  /** @internal */
  readonly array: readonly [Feel, T][];

  /** @internal */
  readonly index: {readonly [name: string]: number | undefined};

  get size(): number {
    return this.array.length;
  }

  isEmpty(): boolean {
    return this.array.length === 0;
  }

  has(feel: Feel): boolean;
  has(name: string): boolean;
  has(feel: Feel | string): boolean {
    if (typeof feel === "object" && feel !== null || typeof feel === "function") {
      feel = feel.name;
    }
    return this.index[feel] !== void 0;
  }

  get(feel: Feel): T | undefined;
  get(name: string): T | undefined;
  get(index: number): T | undefined;
  get(feel: Feel | string | number | undefined): T | undefined {
    if (typeof feel === "object" && feel !== null || typeof feel === "function") {
      feel = feel.name;
    }
    if (typeof feel === "string") {
      feel = this.index[feel];
    }
    const entry = typeof feel === "number" ? this.array[feel] : void 0;
    return entry !== void 0 ? entry[1] : void 0;
  }

  getOr<E>(feel: Feel, elseValue: E): T | E;
  getOr<E>(name: string, elseValue: E): T | E;
  getOr<E>(index: number, elseValue: E): T | E;
  getOr<E>(feel: Feel | string | number | undefined, elseValue: E): T | E {
    if (typeof feel === "object" && feel !== null || typeof feel === "function") {
      feel = feel.name;
    }
    if (typeof feel === "string") {
      feel = this.index[feel];
    }
    const entry = typeof feel === "number" ? this.array[feel] : void 0;
    return entry !== void 0 ? entry[1] : elseValue;
  }

  updated(feel: Feel, value: T | undefined): LookVector<T>;
  updated(updates: LookVectorUpdates<T>): LookVector<T>;
  updated(updates: LookVectorUpdates<T> | Feel, value?: T | undefined): LookVector<T> {
    let feel: Feel;
    let oldArray = this.array;
    let oldIndex = this.index;
    let newArray: [Feel, T][] | undefined;
    let newIndex: {[name: string]: number | undefined} | undefined;
    const updateCount = Array.isArray(updates) ? updates.length : 1;
    for (let updateIndex = 0; updateIndex < updateCount; updateIndex += 1) {
      if (updateIndex === 0 && !Array.isArray(updates)) {
        feel = updates as Feel;
      } else {
        [feel, value] = (updates as LookVectorUpdates<T>)[updateIndex]!;
      }
      const i = oldIndex[feel.name];
      if (value !== void 0 && i !== void 0) { // update
        const newArray = oldArray.slice(0);
        newArray[i] = [feel, value];
        newIndex = oldIndex;
        oldArray = newArray;
      } else if (value !== void 0) { // insert
        const newArray = oldArray.slice(0);
        const newIndex: {[name: string]: number | undefined} = {};
        for (const name in oldIndex) {
          newIndex[name] = oldIndex[name];
        }
        newIndex[feel.name] = newArray.length;
        newArray.push([feel, value]);
        oldArray = newArray;
        oldIndex = newIndex;
      } else if (i !== void 0) { // remove
        const newArray = new Array<[Feel, T]>();
        const newIndex: {[name: string]: number | undefined} = {};
        let k = 0;
        for (let j = 0; j < oldArray.length; j += 1) {
          const entry = oldArray[j]!;
          if (entry[0] !== feel) {
            newArray[k] = entry;
            newIndex[entry[0].name] = k;
            k += 1;
          }
        }
        oldArray = newArray;
        oldIndex = newIndex;
      }
    }
    if (newArray === void 0 || newIndex === void 0) {
      return this;
    }
    return this.copy(newArray, newIndex);
  }

  protected copy(array: readonly [Feel, T][],
                 index?: {readonly [name: string]: number | undefined}): LookVector<T> {
    return LookVector.fromArray(array, index);
  }

  forEach<R>(callback: (value: T, feel: Feel) => R | void): R | undefined;
  forEach<R, S>(callback: (this: S, value: T, feel: Feel) => R | void, thisArg: S): R | undefined;
  forEach<R, S>(callback: (this: S | undefined, value: T, feel: Feel) => R | void, thisArg?: S): R | undefined {
    const array = this.array;
    for (let i = 0; i < array.length; i += 1) {
      const entry = array[i]!;
      const result = callback.call(thisArg, entry[1], entry[0]);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LookVector) {
      return Arrays.equal(this.array, that.array);
    }
    return false;
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    const array = this.array;
    const n = array.length;
    output = output.write("LookVector").write(46/*'.'*/)
                   .write(n !== 0 ? "of" : "empty").write(40/*'('*/);
    for (let i = 0; i < n; i += 1) {
      const [feel, value] = array[i]!;
      if (i !== 0) {
        output = output.write(", ");
      }
      output = output.write(91/*'['*/).debug(feel).write(", ").debug(value).write(93/*']'*/);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  /** @override */
  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static empty<T>(): LookVector<T> {
    return new LookVector(Arrays.empty(), {});
  }

  static of<T>(...feels: [Feel, T][]): LookVector<T> {
    return new LookVector(feels, LookVector.index(feels));
  }

  static fromLike<T, V extends LookVectorInit<T> | null | undefined>(value: V): LookVector<T> | Uninitable<V> {
    if (value === void 0 || value === null || value instanceof LookVector) {
      return value as LookVector<T> | Uninitable<V>;
    } else if (Array.isArray(value)) {
      return LookVector.fromArray(value);
    }
    throw new TypeError("" + value);
  }

  static fromArray<T>(array: readonly [Feel, T][],
                      index?: {[name: string]: number | undefined}): LookVector<T> {
    if (index === void 0) {
      index = LookVector.index(array);
    }
    return new LookVector(array, index);
  }

  /** @internal */
  static index<T>(array: readonly [Feel, T][]): {readonly [name: string]: number | undefined} {
    const index: {[name: string]: number | undefined} = {};
    for (let i = 0; i < array.length; i += 1) {
      const entry = array[i]!;
      index[entry[0].name] = i;
    }
    return index;
  }
}
