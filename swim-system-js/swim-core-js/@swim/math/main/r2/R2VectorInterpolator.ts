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

import {Interpolator} from "@swim/mapping";
import {R2Vector} from "./R2Vector";

/** @hidden */
export const R2VectorInterpolator = function (v0: R2Vector, v1: R2Vector): Interpolator<R2Vector> {
  const interpolator = function (u: number): R2Vector {
    const v0 = interpolator[0];
    const v1 = interpolator[1];
    const x = v0.x + u * (v1.x - v0.x);
    const y = v0.y + u * (v1.y - v0.y);
    return new R2Vector(x, y);
  } as Interpolator<R2Vector>;
  Object.setPrototypeOf(interpolator, R2VectorInterpolator.prototype);
  Object.defineProperty(interpolator, 0, {
    value: v0,
    enumerable: true,
  });
  Object.defineProperty(interpolator, 1, {
    value: v1,
    enumerable: true,
  });
  return interpolator;
} as {
  (v0: R2Vector, v1: R2Vector): Interpolator<R2Vector>;

  /** @hidden */
  prototype: Interpolator<R2Vector>;
};

R2VectorInterpolator.prototype = Object.create(Interpolator.prototype);
