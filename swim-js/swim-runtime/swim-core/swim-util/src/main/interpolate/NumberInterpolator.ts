// Copyright 2015-2022 Swim.inc
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
export const NumberInterpolator = (function (_super: typeof Interpolator) {
  const NumberInterpolator = function (y0: number, y1: number): Interpolator<number> {
    const interpolator = function (u: number): number {
      const y0 = interpolator[0];
      const y1 = interpolator[1];
      return y0 + u * (y1 - y0);
    } as Interpolator<number>;
    Object.setPrototypeOf(interpolator, NumberInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = y0;
    (interpolator as Mutable<typeof interpolator>)[1] = y1;
    return interpolator;
  } as {
    (y0: number, y1: number): Interpolator<number>;

    /** @internal */
    prototype: Interpolator<number>;
  };

  NumberInterpolator.prototype = Object.create(_super.prototype);
  NumberInterpolator.prototype.constructor = NumberInterpolator;

  return NumberInterpolator;
})(Interpolator);
