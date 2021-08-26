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

import {__extends} from "tslib";
import {Arrays} from "@swim/util";
import {Interpolator} from "@swim/mapping";
import type {Look} from "../look/Look";
import {FeelVector} from "./FeelVector";

/** @hidden */
export declare abstract class FeelVectorInterpolator {
  /** @hidden */
  readonly interpolators: ReadonlyArray<[Look<unknown>, Interpolator<unknown>]>;
  /** @hidden */
  readonly index: {readonly [name: string]: number | undefined};

  get 0(): FeelVector;

  get 1(): FeelVector;

  equals(that: unknown): boolean;
}

export interface FeelVectorInterpolator extends Interpolator<FeelVector> {
}

/** @hidden */
export function FeelVectorInterpolator(v0: FeelVector, v1: FeelVector): FeelVectorInterpolator {
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
  Object.defineProperty(interpolator, "interpolators", {
    value: interpolators,
    enumerable: true,
  });
  Object.defineProperty(interpolator, "index", {
    value: index,
    enumerable: true,
  });
  return interpolator;
}
__extends(FeelVectorInterpolator, Interpolator);

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
  enumerable: true,
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
  enumerable: true,
  configurable: true,
});

FeelVectorInterpolator.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof FeelVectorInterpolator) {
    const n = this.interpolators.length;
    if (n === that.interpolators.length) {
      for (let i = 0; i < n; i += 1) {
        if (!Arrays.equal(this.interpolators[i]!, that.interpolators[i]!)) {
          return false;
        }
      }
      return true;
    }
  }
  return false;
};
