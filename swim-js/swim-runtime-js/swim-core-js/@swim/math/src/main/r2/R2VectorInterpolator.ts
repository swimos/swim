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
import {R2Vector} from "./R2Vector";

/** @internal */
export const R2VectorInterpolator = (function (_super: typeof Interpolator) {
  const R2VectorInterpolator = function (v0: R2Vector, v1: R2Vector): Interpolator<R2Vector> {
    const interpolator = function (u: number): R2Vector {
      const v0 = interpolator[0];
      const v1 = interpolator[1];
      const x = v0.x + u * (v1.x - v0.x);
      const y = v0.y + u * (v1.y - v0.y);
      return new R2Vector(x, y);
    } as Interpolator<R2Vector>;
    Object.setPrototypeOf(interpolator, R2VectorInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = v0;
    (interpolator as Mutable<typeof interpolator>)[1] = v1;
    return interpolator;
  } as {
    (v0: R2Vector, v1: R2Vector): Interpolator<R2Vector>;

    /** @internal */
    prototype: Interpolator<R2Vector>;
  };

  R2VectorInterpolator.prototype = Object.create(_super.prototype);
  R2VectorInterpolator.prototype.constructor = R2VectorInterpolator;

  return R2VectorInterpolator;
})(Interpolator);
