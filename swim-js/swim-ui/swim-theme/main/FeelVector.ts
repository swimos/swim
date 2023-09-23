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
import type {Mutable} from "@swim/util";
import {Arrays} from "@swim/util";
import type {Equals} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {Look} from "./Look";

/** @public */
export type FeelVectorLike = FeelVector | FeelVectorArray;

/** @public */
export type FeelVectorArray = readonly [Look<unknown>, unknown][];

/** @public */
export type FeelVectorUpdates = readonly [Look<unknown>, unknown | undefined][];

/** @public */
export class FeelVector implements Interpolate<FeelVector>, Equals, Debug {
  constructor(array: readonly [Look<unknown>, unknown][],
              index: {readonly [name: string]: number | undefined}) {
    this.array = array;
    this.index = index;
  }

  likeType?(like: FeelVectorArray): void;

  /** @internal */
  readonly array: readonly [Look<unknown>, unknown][];

  /** @internal */
  readonly index: {readonly [name: string]: number | undefined};

  get size(): number {
    return this.array.length;
  }

  isEmpty(): boolean {
    return this.array.length === 0;
  }

  has(look: Look<any>): boolean;
  has(name: string): boolean;
  has(look: Look<any> | string): boolean {
    if (typeof look === "object" && look !== null || typeof look === "function") {
      look = look.name;
    }
    return this.index[look] !== void 0;
  }

  get<T>(look: Look<T>): T | undefined;
  get(name: string): unknown | undefined;
  get(index: number): unknown | undefined;
  get<T>(look: Look<T> | string | number | undefined): T | unknown | undefined {
    if (typeof look === "object" && look !== null || typeof look === "function") {
      look = look.name;
    }
    if (typeof look === "string") {
      look = this.index[look];
    }
    const entry = typeof look === "number" ? this.array[look] : void 0;
    return entry !== void 0 ? entry[1] : void 0;
  }

  getOr<T, E>(look: Look<T>, elseValue: E): T | E;
  getOr(name: string, elseValue: unknown): unknown;
  getOr(index: number, elseValue: unknown): unknown;
  getOr<T, E>(look: Look<T> | string | number | undefined, elseValue: E): T | unknown | E {
    if (typeof look === "object" && look !== null || typeof look === "function") {
      look = look.name;
    }
    if (typeof look === "string") {
      look = this.index[look];
    }
    const entry = typeof look === "number" ? this.array[look] : void 0;
    return entry !== void 0 ? entry[1] : elseValue;
  }

  updated<T>(look: Look<T>, value: T | LikeType<T> | undefined): FeelVector;
  updated(updates: FeelVectorUpdates): FeelVector;
  updated(updates: FeelVectorUpdates | Look<unknown>, value?: unknown | undefined): FeelVector {
    let look: Look<unknown>;
    let oldArray = this.array;
    let oldIndex = this.index;
    let newArray: [Look<unknown>, unknown][] | undefined;
    let newIndex: {[name: string]: number | undefined} | undefined;
    const updateCount = Array.isArray(updates) ? updates.length : 1;
    for (let updateIndex = 0; updateIndex < updateCount; updateIndex += 1) {
      if (updateIndex === 0 && !Array.isArray(updates)) {
        look = updates as Look<unknown>;
      } else {
        [look, value] = (updates as FeelVectorUpdates)[updateIndex]!;
      }
      const i = oldIndex[look.name];
      if (value !== void 0 && i !== void 0) { // update
        const newArray = oldArray.slice(0);
        newIndex = oldIndex;
        newArray[i] = [look, value];
        oldArray = newArray;
      } else if (value !== void 0) { // insert
        const newArray = oldArray.slice(0);
        const newIndex: {[name: string]: number | undefined} = {};
        for (const name in oldIndex) {
          newIndex[name] = oldIndex[name];
        }
        newIndex[look.name] = newArray.length;
        newArray.push([look, value]);
        oldArray = newArray;
        oldIndex = newIndex;
      } else if (i !== void 0) { // remove
        const newArray = new Array<[Look<unknown>, unknown]>();
        const newIndex: {[name: string]: number | undefined} = {};
        let k = 0;
        for (let j = 0; j < oldArray.length; j += 1) {
          const entry = oldArray[j]!;
          if (entry[0] !== look) {
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

  plus(that: FeelVector): FeelVector {
    const thisArray = this.array;
    const thatArray = that.array;
    const newArray = new Array<[Look<unknown>, unknown]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0; i < thisArray.length; i += 1) {
      const entry = thisArray[i]!;
      const look = entry[0];
      const y = that.get(look);
      newIndex[look.name] = newArray.length;
      newArray.push(y === void 0 ? entry : [look, look.combine(entry[1], y)]);
    }
    for (let i = 0; i < thatArray.length; i += 1) {
      const entry = thatArray[i]!;
      const look = entry[0];
      if (newIndex[look.name] === void 0) {
        newIndex[look.name] = newArray.length;
        newArray.push(entry);
      }
    }
    return this.copy(newArray, newIndex);
  }

  negative(): FeelVector {
    const oldArray = this.array;
    const n = oldArray.length;
    const newArray = new Array<[Look<unknown>, unknown]>(n);
    for (let i = 0; i < n; i += 1) {
      const [look, x] = oldArray[i]!;
      newArray[i] = [look, look.combine(void 0, x, -1)];
    }
    return this.copy(newArray, this.index);
  }

  minus(that: FeelVector): FeelVector {
    const thisArray = this.array;
    const thatArray = that.array;
    const newArray = new Array<[Look<unknown>, unknown]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0; i < thisArray.length; i += 1) {
      const entry = thisArray[i]!;
      const look = entry[0];
      const y = that.get(look);
      newIndex[look.name] = newArray.length;
      newArray.push(y === void 0 ? entry : [look, look.combine(entry[1], y, -1)]);
    }
    for (let i = 0; i < thatArray.length; i += 1) {
      const [look, y] = thatArray[i]!;
      if (newIndex[look.name] === void 0) {
        newIndex[look.name] = newArray.length;
        newArray.push([look, look.combine(void 0, y, -1)]);
      }
    }
    return this.copy(newArray, newIndex);
  }

  times(scalar: number): FeelVector {
    const oldArray = this.array;
    const n = oldArray.length;
    const newArray = new Array<[Look<unknown>, unknown]>(n);
    for (let i = 0; i < n; i += 1) {
      const [look, x] = oldArray[i]!;
      newArray[i] = [look, look.combine(void 0, x, scalar)];
    }
    return this.copy(newArray, this.index);
  }

  protected copy(array: readonly [Look<unknown>, unknown][],
                 index?: {readonly [name: string]: number | undefined}): FeelVector {
    return FeelVector.fromArray(array, index);
  }

  forEach<R>(callback: <T>(value: T, look: Look<T>) => R | void): R | undefined;
  forEach<R, S>(callback: <T>(this: S, value: T, look: Look<T>) => R | void, thisArg: S): R | undefined;
  forEach<R, S>(callback: <T>(this: S | undefined, value: T, look: Look<T>) => R | void, thisArg?: S): R | undefined {
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
  interpolateTo(that: FeelVector): Interpolator<FeelVector>;
  interpolateTo(that: unknown): Interpolator<FeelVector> | null;
  interpolateTo(that: unknown): Interpolator<FeelVector> | null {
    if (that instanceof FeelVector) {
      return FeelVectorInterpolator(this, that);
    }
    return null;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof FeelVector) {
      return Arrays.equal(this.array, that.array);
    }
    return false;
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    const array = this.array;
    const n = array.length;
    output = output.write("FeelVector").write(46/*'.'*/)
                   .write(n !== 0 ? "of" : "empty").write(40/*'('*/);
    for (let i = 0; i < n; i += 1) {
      const [look, value] = array[i]!;
      if (i !== 0) {
        output = output.write(", ");
      }
      output = output.write(91/*'['*/).debug(look).write(", ").debug(value).write(93/*']'*/);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  /** @override */
  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static empty(): FeelVector {
    return new FeelVector(Arrays.empty(), {});
  }

  static of(...looks: [Look<unknown>, unknown][]): FeelVector {
    const n = looks.length;
    const array = new Array<[Look<unknown>, unknown]>(n);
    const index: {[name: string]: number | undefined} = {};
    for (let i = 0; i < n; i += 1) {
      const [look, value] = looks[i]!;
      array[i] = [look, look.coerce(value)];
      index[look.name] = i;
    }
    return new FeelVector(array, index);
  }

  static fromLike<V extends FeelVectorLike | null | undefined>(value: V): FeelVector | Uninitable<V> {
    if (value === void 0 || value === null || value instanceof FeelVector) {
      return value as FeelVector | Uninitable<V>;
    } else if (Array.isArray(value)) {
      return FeelVector.of(...value);
    }
    throw new TypeError("" + value);
  }

  static fromArray(array: readonly [Look<unknown>, unknown][],
                   index?: {readonly [name: string]: number | undefined}): FeelVector {
    if (index === void 0) {
      index = FeelVector.index(array);
    }
    return new FeelVector(array, index);
  }

  /** @internal */
  static index<T>(array: readonly [Look<T>, T][]): {readonly [name: string]: number | undefined} {
    const index: {[name: string]: number | undefined} = {};
    for (let i = 0; i < array.length; i += 1) {
      const entry = array[i]!;
      index[entry[0].name] = i;
    }
    return index;
  }
}

/** @internal */
export interface FeelVectorInterpolator extends Interpolator<FeelVector> {
  /** @internal */
  readonly interpolators: readonly [Look<unknown>, Interpolator<unknown>][];
  /** @internal */
  readonly index: {readonly [name: string]: number | undefined};

  get 0(): FeelVector;

  get 1(): FeelVector;

  equals(that: unknown): boolean;
}

/** @internal */
export const FeelVectorInterpolator = (function (_super: typeof Interpolator) {
  const FeelVectorInterpolator = function (v0: FeelVector, v1: FeelVector): FeelVectorInterpolator {
    const interpolator = function (u: number): FeelVector {
      const interpolators = interpolator.interpolators;
      const interpolatorCount = interpolators.length;
      const array = new Array<[Look<unknown>, unknown]>(interpolatorCount);
      const index = interpolator.index;
      for (let i = 0; i < interpolatorCount; i += 1) {
        const [look, interpolator] = interpolators[i]!;
        const value = interpolator(u);
        array[i] = [look, value];
      }
      return FeelVector.fromArray(array, index);
    } as FeelVectorInterpolator;
    Object.setPrototypeOf(interpolator, FeelVectorInterpolator.prototype);
    const interpolators = new Array<[Look<unknown>, Interpolator<unknown>]>();
    const index: {[name: string]: number | undefined} = {};
    v0.forEach(function <T>(a: T, look: Look<T>): void {
      const b = v1.get(look);
      if (b !== void 0) {
        const interpolator = look.between(a, b);
        index[look.name] = interpolators.length;
        interpolators.push([look, interpolator]);
      }
    });
    (interpolator as Mutable<typeof interpolator>).interpolators = interpolators;
    (interpolator as Mutable<typeof interpolator>).index = index;
    return interpolator;
  } as {
    (v0: FeelVector, v1: FeelVector): FeelVectorInterpolator;

    /** @internal */
    prototype: FeelVectorInterpolator;
  };

  FeelVectorInterpolator.prototype = Object.create(_super.prototype);
  FeelVectorInterpolator.prototype.constructor = FeelVectorInterpolator;

  Object.defineProperty(FeelVectorInterpolator.prototype, 0, {
    get(this: FeelVectorInterpolator): FeelVector {
      const interpolators = this.interpolators;
      const interpolatorCount = interpolators.length;
      const array = new Array<[Look<unknown>, unknown]>(interpolatorCount);
      const index = this.index;
      for (let i = 0; i < interpolatorCount; i += 1) {
        const [look, interpolator] = interpolators[i]!;
        const value = interpolator[0];
        array[i] = [look, value];
      }
      return FeelVector.fromArray(array, index);
    },
    configurable: true,
  });

  Object.defineProperty(FeelVectorInterpolator.prototype, 1, {
    get(this: FeelVectorInterpolator): FeelVector {
      const interpolators = this.interpolators;
      const interpolatorCount = interpolators.length;
      const array = new Array<[Look<unknown>, unknown]>(interpolatorCount);
      const index = this.index;
      for (let i = 0; i < interpolatorCount; i += 1) {
        const [look, interpolator] = interpolators[i]!;
        const value = interpolator[1];
        array[i] = [look, value];
      }
      return FeelVector.fromArray(array, index);
    },
    configurable: true,
  });

  FeelVectorInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof FeelVectorInterpolator) {
      const n = this.interpolators.length;
      if (n !== that.interpolators.length) {
        return false;
      }
      for (let i = 0; i < n; i += 1) {
        if (!Arrays.equal(this.interpolators[i]!, that.interpolators[i]!)) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  return FeelVectorInterpolator;
})(Interpolator);
