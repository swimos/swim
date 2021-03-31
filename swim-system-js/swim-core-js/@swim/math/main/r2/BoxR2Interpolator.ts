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
import {BoxR2} from "./BoxR2";

/** @hidden */
export const BoxR2Interpolator = function (s0: BoxR2, s1: BoxR2): Interpolator<BoxR2> {
  const interpolator = function (u: number): BoxR2 {
    const s0 = interpolator[0];
    const s1 = interpolator[1];
    const xMin = s0.xMin + u * (s1.xMin - s0.xMin);
    const yMin = s0.yMin + u * (s1.yMin - s0.yMin);
    const xMax = s0.xMax + u * (s1.xMax - s0.xMax);
    const yMax = s0.yMax + u * (s1.yMax - s0.yMax);
    return new BoxR2(xMin, yMin, xMax, yMax);
  } as Interpolator<BoxR2>;
  Object.setPrototypeOf(interpolator, BoxR2Interpolator.prototype);
  Object.defineProperty(interpolator, 0, {
    value: s0,
    enumerable: true,
  });
  Object.defineProperty(interpolator, 1, {
    value: s1,
    enumerable: true,
  });
  return interpolator;
} as {
  (s0: BoxR2, s1: BoxR2): Interpolator<BoxR2>;

  /** @hidden */
  prototype: Interpolator<BoxR2>;
};

BoxR2Interpolator.prototype = Object.create(Interpolator.prototype);
