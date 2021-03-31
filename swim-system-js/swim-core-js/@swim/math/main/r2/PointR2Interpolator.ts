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

import {Interpolator} from "@swim/mapping";
import {PointR2} from "./PointR2";

/** @hidden */
export const PointR2Interpolator = function (p0: PointR2, p1: PointR2): Interpolator<PointR2> {
  const interpolator = function (u: number): PointR2 {
    const p0 = interpolator[0];
    const p1 = interpolator[1];
    const x = p0.x + u * (p1.x - p0.x);
    const y = p0.y + u * (p1.y - p0.y);
    return new PointR2(x, y);
  } as Interpolator<PointR2>;
  Object.setPrototypeOf(interpolator, PointR2Interpolator.prototype);
  Object.defineProperty(interpolator, 0, {
    value: p0,
    enumerable: true,
  });
  Object.defineProperty(interpolator, 1, {
    value: p1,
    enumerable: true,
  });
  return interpolator;
} as {
  (p0: PointR2, p1: PointR2): Interpolator<PointR2>;

  /** @hidden */
  prototype: Interpolator<PointR2>;
};

PointR2Interpolator.prototype = Object.create(Interpolator.prototype);
