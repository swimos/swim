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

import {Mutable, Interpolator} from "@swim/util";
import {Angle} from "./Angle";

/** @internal */
export const AngleInterpolator = (function (_super: typeof Interpolator) {
  const AngleInterpolator = function (a0: Angle, a1: Angle): Interpolator<Angle> {
    const interpolator = function (u: number): Angle {
      const a0 = interpolator[0];
      const a1 = interpolator[1];
      return Angle.create(a0.value + u * (a1.value - a0.value), a1.units);
    } as Interpolator<Angle>;
    Object.setPrototypeOf(interpolator, AngleInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = a0.to(a1.units);
    (interpolator as Mutable<typeof interpolator>)[1] = a1;
    return interpolator;
  } as {
    (a0: Angle, a1: Angle): Interpolator<Angle>;

    /** @internal */
    prototype: Interpolator<Angle>;
  };

  AngleInterpolator.prototype = Object.create(_super.prototype);
  AngleInterpolator.prototype.constructor = AngleInterpolator;

  return AngleInterpolator;
})(Interpolator);
