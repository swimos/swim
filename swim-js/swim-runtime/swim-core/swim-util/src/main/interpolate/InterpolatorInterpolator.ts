// Copyright 2015-2023 Swim.inc
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

import type {Mutable} from "../types/Mutable";
import {Interpolator} from "./Interpolator";

/** @internal */
export const InterpolatorInterpolator = (function (_super: typeof Interpolator) {
  const InterpolatorInterpolator = function <Y>(y0: Interpolator<Y>, y1: Interpolator<Y>): Interpolator<Interpolator<Y>> {
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
    (interpolator as Mutable<typeof interpolator>)[0] = y0;
    (interpolator as Mutable<typeof interpolator>)[1] = y1;
    return interpolator;
  } as {
    <Y>(y0: Interpolator<Y>, y1: Interpolator<Y>): Interpolator<Interpolator<Y>>;

    /** @internal */
    prototype: Interpolator<any>;
  };

  InterpolatorInterpolator.prototype = Object.create(_super.prototype);
  InterpolatorInterpolator.prototype.constructor = InterpolatorInterpolator;

  return InterpolatorInterpolator;
})(Interpolator);
