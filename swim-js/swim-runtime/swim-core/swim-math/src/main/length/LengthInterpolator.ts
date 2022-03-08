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

import {Mutable, Interpolator} from "@swim/util";
import {Length} from "./Length";

/** @internal */
export const LengthInterpolator = (function (_super: typeof Interpolator) {
  const LengthInterpolator = function (l0: Length, l1: Length): Interpolator<Length> {
    const interpolator = function (u: number): Length {
      const l0 = interpolator[0];
      const l1 = interpolator[1];
      return Length.create(l0.value + u * (l1.value - l0.value), l1.units);
    } as Interpolator<Length>;
    Object.setPrototypeOf(interpolator, LengthInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = l0.to(l1.units);
    (interpolator as Mutable<typeof interpolator>)[1] = l1;
    return interpolator;
  } as {
    (l0: Length, l1: Length): Interpolator<Length>;

    /** @internal */
    prototype: Interpolator<Length>;
  };

  LengthInterpolator.prototype = Object.create(_super.prototype);
  LengthInterpolator.prototype.constructor = LengthInterpolator;

  return LengthInterpolator;
})(Interpolator);
