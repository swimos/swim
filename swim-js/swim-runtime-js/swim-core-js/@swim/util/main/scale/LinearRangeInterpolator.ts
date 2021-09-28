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

import type {Mutable} from "../lang/Mutable";
import {Interpolator} from "../interpolate/Interpolator";
import {LinearRange} from "./LinearRange";

/** @hidden */
export const LinearRangeInterpolator = function (y0: LinearRange, y1: LinearRange): Interpolator<LinearRange> {
  const interpolator = function (u: number): LinearRange {
    const y0 = interpolator[0];
    const y00 = y0[0];
    const y01 = y0[1];
    const y1 = interpolator[1];
    const y10 = y1[0];
    const y11 = y1[1];
    return LinearRange(y00 + u * (y10 - y00), y01 + u * (y11 - y01));
  } as Interpolator<LinearRange>;
  Object.setPrototypeOf(interpolator, LinearRangeInterpolator.prototype);
  (interpolator as Mutable<typeof interpolator>)[0] = y0;
  (interpolator as Mutable<typeof interpolator>)[1] = y1;
  return interpolator;
} as {
  (y0: LinearRange, y1: LinearRange): Interpolator<LinearRange>;

  /** @hidden */
  prototype: Interpolator<LinearRange>;
};

LinearRangeInterpolator.prototype = Object.create(Interpolator.prototype);
