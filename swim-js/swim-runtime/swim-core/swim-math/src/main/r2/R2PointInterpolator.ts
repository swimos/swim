// Copyright 2015-2021 Swim.inc
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
import {R2Point} from "./R2Point";

/** @internal */
export const R2PointInterpolator = (function (_super: typeof Interpolator) {
  const R2PointInterpolator = function (p0: R2Point, p1: R2Point): Interpolator<R2Point> {
    const interpolator = function (u: number): R2Point {
      const p0 = interpolator[0];
      const p1 = interpolator[1];
      const x = p0.x + u * (p1.x - p0.x);
      const y = p0.y + u * (p1.y - p0.y);
      return new R2Point(x, y);
    } as Interpolator<R2Point>;
    Object.setPrototypeOf(interpolator, R2PointInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = p0;
    (interpolator as Mutable<typeof interpolator>)[1] = p1;
    return interpolator;
  } as {
    (p0: R2Point, p1: R2Point): Interpolator<R2Point>;

    /** @internal */
    prototype: Interpolator<R2Point>;
  };

  R2PointInterpolator.prototype = Object.create(_super.prototype);
  R2PointInterpolator.prototype.constructor = R2PointInterpolator;

  return R2PointInterpolator;
})(Interpolator);
