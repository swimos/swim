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

import type {Mutable} from "../types/Mutable";
import {Interpolator} from "./Interpolator";

/** @internal */
export const StepInterpolator = (function (_super: typeof Interpolator) {
  const StepInterpolator = function <Y>(y0: Y, y1: Y): Interpolator<Y> {
    const interpolator = function (u: number): Y {
      return u < 1 ? interpolator[0] : interpolator[1];
    } as Interpolator<Y>;
    Object.setPrototypeOf(interpolator, StepInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = y0;
    (interpolator as Mutable<typeof interpolator>)[1] = y1;
    return interpolator;
  } as {
    <Y>(y0: Y, y1: Y): Interpolator<Y>;

    /** @internal */
    prototype: Interpolator<any>;
  };

  StepInterpolator.prototype = Object.create(_super.prototype);

  return StepInterpolator;
})(Interpolator);
