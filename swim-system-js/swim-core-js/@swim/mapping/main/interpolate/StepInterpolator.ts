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
export const StepInterpolator = function <Y>(y0: Y, y1: Y): Interpolator<Y> {
  const interpolator = function (u: number): Y {
    return u < 1 ? interpolator[0] : interpolator[1];
  } as Interpolator<Y>;
  Object.setPrototypeOf(interpolator, StepInterpolator.prototype);
  Object.defineProperty(interpolator, 0, {
    value: y0,
    enumerable: true,
  });
  Object.defineProperty(interpolator, 1, {
    value: y1,
    enumerable: true,
  });
  return interpolator;
} as {
  <Y>(y0: Y, y1: Y): Interpolator<Y>;

  /** @hidden */
  prototype: Interpolator<any>;
};

StepInterpolator.prototype = Object.create(Interpolator.prototype);
