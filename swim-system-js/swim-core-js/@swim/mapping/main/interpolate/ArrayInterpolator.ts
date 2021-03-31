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

import {Interpolator} from "./Interpolator";

/** @hidden */
export interface ArrayInterpolator<Y> extends Interpolator<ReadonlyArray<Y>> {
  /** @hidden */
  readonly interpolators: ReadonlyArray<Interpolator<Y>>;

  readonly 0: ReadonlyArray<Y>;

  readonly 1: ReadonlyArray<Y>;

  equals(that: unknown): boolean;
}

/** @hidden */
export const ArrayInterpolator = function <Y>(y0: ReadonlyArray<Y>, y1: ReadonlyArray<Y>): ArrayInterpolator<Y> {
  const interpolator = function (u: number): ReadonlyArray<Y> {
    const interpolators = interpolator.interpolators;
    const interpolatorCount = interpolators.length;
    const array = new Array<Y>(interpolatorCount);
    for (let i = 0; i < interpolatorCount; i += 1) {
      array[i] = interpolators[i]!(u);
    }
    return array;
  } as ArrayInterpolator<Y>;
  Object.setPrototypeOf(interpolator, ArrayInterpolator.prototype);
  const interpolatorCount = Math.min(y0.length, y1.length);
  const interpolators = new Array<Interpolator<Y>>(interpolatorCount);
  for (let i = 0; i < interpolatorCount; i += 1) {
    interpolators[i] = Interpolator(y0[i]!, y1[i]!);
  }
  Object.defineProperty(interpolator, "interpolators", {
    value: interpolators,
    enumerable: true,
  });
  return interpolator;
} as {
  <Y>(y0: ReadonlyArray<Y>, y1: ReadonlyArray<Y>): ArrayInterpolator<Y>;

  /** @hidden */
  prototype: ArrayInterpolator<any>;
};

ArrayInterpolator.prototype = Object.create(Interpolator.prototype);

Object.defineProperty(ArrayInterpolator.prototype, 0, {
  get<Y>(this: ArrayInterpolator<Y>): ReadonlyArray<Y> {
    const interpolators = this.interpolators;
    const interpolatorCount = interpolators.length;
    const array = new Array<Y>(interpolatorCount);
    for (let i = 0; i < interpolatorCount; i += 1) {
      array[i] = interpolators[i]![0];
    }
    return array;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ArrayInterpolator.prototype, 1, {
  get<Y>(this: ArrayInterpolator<Y>): ReadonlyArray<Y> {
    const interpolators = this.interpolators;
    const interpolatorCount = interpolators.length;
    const array = new Array<Y>(interpolatorCount);
    for (let i = 0; i < interpolatorCount; i += 1) {
      array[i] = interpolators[i]![1];
    }
    return array;
  },
  enumerable: true,
  configurable: true,
});

ArrayInterpolator.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof ArrayInterpolator) {
    const n = this.interpolators.length;
    if (n === that.interpolators.length) {
      for (let i = 0; i < n; i += 1) {
        if (!this.interpolators[i]!.equals(that.interpolators[i]!)) {
          return false;
        }
      }
      return true;
    }
  }
  return false;
};
