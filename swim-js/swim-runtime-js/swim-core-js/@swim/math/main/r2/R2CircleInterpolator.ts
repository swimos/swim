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

import {Interpolator} from "@swim/mapping";
import {R2Circle} from "./R2Circle";

/** @hidden */
export const R2CircleInterpolator = function (s0: R2Circle, s1: R2Circle): Interpolator<R2Circle> {
  const interpolator = function (u: number): R2Circle {
    const s0 = interpolator[0];
    const s1 = interpolator[1];
    const cx = s0.cx + u * (s1.cx - s0.cx);
    const cy = s0.cy + u * (s1.cy - s0.cy);
    const r = s0.r + u * (s1.r - s0.r);
    return new R2Circle(cx, cy, r);
  } as Interpolator<R2Circle>;
  Object.setPrototypeOf(interpolator, R2CircleInterpolator.prototype);
  Object.defineProperty(interpolator, 0, {
    value: s0,
    enumerable: true,
  });
  Object.defineProperty(interpolator, 1, {
    value: s1,
    enumerable: true,
  });
  return interpolator;
} as {
  (s0: R2Circle, s1: R2Circle): Interpolator<R2Circle>;

  /** @hidden */
  prototype: Interpolator<R2Circle>;
};

R2CircleInterpolator.prototype = Object.create(Interpolator.prototype);
