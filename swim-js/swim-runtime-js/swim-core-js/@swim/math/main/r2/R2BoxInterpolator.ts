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

import {Mutable, Interpolator} from "@swim/util";
import {R2Box} from "./R2Box";

/** @hidden */
export const R2BoxInterpolator = function (s0: R2Box, s1: R2Box): Interpolator<R2Box> {
  const interpolator = function (u: number): R2Box {
    const s0 = interpolator[0];
    const s1 = interpolator[1];
    const xMin = s0.xMin + u * (s1.xMin - s0.xMin);
    const yMin = s0.yMin + u * (s1.yMin - s0.yMin);
    const xMax = s0.xMax + u * (s1.xMax - s0.xMax);
    const yMax = s0.yMax + u * (s1.yMax - s0.yMax);
    return new R2Box(xMin, yMin, xMax, yMax);
  } as Interpolator<R2Box>;
  Object.setPrototypeOf(interpolator, R2BoxInterpolator.prototype);
  (interpolator as Mutable<typeof interpolator>)[0] = s0;
  (interpolator as Mutable<typeof interpolator>)[1] = s1;
  return interpolator;
} as {
  (s0: R2Box, s1: R2Box): Interpolator<R2Box>;

  /** @hidden */
  prototype: Interpolator<R2Box>;
};

R2BoxInterpolator.prototype = Object.create(Interpolator.prototype);
