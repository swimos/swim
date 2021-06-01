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

import {Interpolator} from "@swim/mapping";
import {Angle} from "./Angle";

/** @hidden */
export const AngleInterpolator = function (a0: Angle, a1: Angle): Interpolator<Angle> {
  const interpolator = function (u: number): Angle {
    const a0 = interpolator[0];
    const a1 = interpolator[1];
    return Angle.create(a0.value + u * (a1.value - a0.value), a1.units);
  } as Interpolator<Angle>;
  Object.setPrototypeOf(interpolator, AngleInterpolator.prototype);
  Object.defineProperty(interpolator, 0, {
    value: a0.to(a1.units),
    enumerable: true,
  });
  Object.defineProperty(interpolator, 1, {
    value: a1,
    enumerable: true,
  });
  return interpolator;
} as {
  (a0: Angle, a1: Angle): Interpolator<Angle>;

  /** @hidden */
  prototype: Interpolator<Angle>;
};

AngleInterpolator.prototype = Object.create(Interpolator.prototype);
