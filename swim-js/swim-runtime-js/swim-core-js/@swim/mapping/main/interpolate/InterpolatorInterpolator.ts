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

import {Interpolator} from "./Interpolator";

/** @hidden */
export const InterpolatorInterpolator = function <Y>(y0: Interpolator<Y>, y1: Interpolator<Y>): Interpolator<Interpolator<Y>> {
  const interpolator = function (u: number): Interpolator<Y> {
    if (u === 0) {
      return interpolator[0];
    } else if (u === 1) {
      return interpolator[1];
    } else {
      return Interpolator(interpolator[0](u), interpolator[1](u));
    }
  } as Interpolator<Interpolator<Y>>;
  Object.setPrototypeOf(interpolator, InterpolatorInterpolator.prototype);
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
  <Y>(y0: Interpolator<Y>, y1: Interpolator<Y>): Interpolator<Interpolator<Y>>;

  /** @hidden */
  prototype: Interpolator<any>;
};

InterpolatorInterpolator.prototype = Object.create(Interpolator.prototype);
