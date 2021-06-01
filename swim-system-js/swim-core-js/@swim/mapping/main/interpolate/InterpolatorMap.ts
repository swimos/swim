// Copyright 2015-2021 Swim inc.
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
export interface InterpolatorMap<Y, FY> extends Interpolator<FY> {
  /** @hidden */
  readonly interpolator: Interpolator<Y>;

  /** @hidden */
  readonly transform: (y: Y) => FY;

  readonly 0: FY;

  readonly 1: FY;

  equals(that: unknown): boolean;
}

export const InterpolatorMap = function <Y, FY>(interpolator: Interpolator<Y>,
                                                transform: (y: Y) => FY): InterpolatorMap<Y, FY> {
  const map = function (u: number): FY {
    return map.transform(map.interpolator(u));
  } as InterpolatorMap<Y, FY>;
  Object.setPrototypeOf(map, InterpolatorMap.prototype);
  Object.defineProperty(map, "interpolator", {
    value: interpolator,
    enumerable: true,
  });
  Object.defineProperty(map, "transform", {
    value: transform,
    enumerable: true,
  });
  return map;
} as {
  <Y, FY>(interpolator: Interpolator<Y>, transform: (y: Y) => FY): InterpolatorMap<Y, FY>;

  /** @hidden */
  prototype: InterpolatorMap<any, any>;
};

InterpolatorMap.prototype = Object.create(Interpolator.prototype);

Object.defineProperty(InterpolatorMap.prototype, 0, {
  get<Y, FY>(this: InterpolatorMap<Y, FY>): FY {
    return this.transform(this.interpolator[0]);
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(InterpolatorMap.prototype, 1, {
  get<Y, FY>(this: InterpolatorMap<Y, FY>): FY {
    return this.transform(this.interpolator[1]);
  },
  enumerable: true,
  configurable: true,
});

InterpolatorMap.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof InterpolatorMap) {
    return this.interpolator.equals(that.interpolator)
        && this.transform === that.transform;
  }
  return false;
};
