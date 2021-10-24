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
import {Angle} from "../angle/Angle";
import {SkewTransform} from "./SkewTransform";

/** @internal */
export const SkewTransformInterpolator = (function (_super: typeof Interpolator) {
  const SkewTransformInterpolator = function (f0: SkewTransform, f1: SkewTransform): Interpolator<SkewTransform> {
    const interpolator = function (u: number): SkewTransform {
      const f0 = interpolator[0];
      const f1 = interpolator[1];
      const x = Angle.create(f0.x.value + u * (f1.x.value - f0.x.value), f1.x.units);
      const y = Angle.create(f0.y.value + u * (f1.y.value - f0.y.value), f1.y.units);
      return new SkewTransform(x, y);
    } as Interpolator<SkewTransform>;
    Object.setPrototypeOf(interpolator, SkewTransformInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = f0.x.units === f1.x.units && f0.y.units === f1.y.units
                                                      ? f0 : new SkewTransform(f0.x.to(f1.x.units), f0.y.to(f1.y.units));
    (interpolator as Mutable<typeof interpolator>)[1] = f1;
    return interpolator;
  } as {
    (f0: SkewTransform, f1: SkewTransform): Interpolator<SkewTransform>;

    /** @internal */
    prototype: Interpolator<SkewTransform>;
  };

  SkewTransformInterpolator.prototype = Object.create(_super.prototype);
  SkewTransformInterpolator.prototype.constructor = SkewTransformInterpolator;

  return SkewTransformInterpolator;
})(Interpolator);
