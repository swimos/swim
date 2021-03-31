// Copyright 2015-2020 Swim inc.
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
import {CircleR2} from "./CircleR2";

/** @hidden */
export const CircleR2Interpolator = function (s0: CircleR2, s1: CircleR2): Interpolator<CircleR2> {
  const interpolator = function (u: number): CircleR2 {
    const s0 = interpolator[0];
    const s1 = interpolator[1];
    const cx = s0.cx + u * (s1.cx - s0.cx);
    const cy = s0.cy + u * (s1.cy - s0.cy);
    const r = s0.r + u * (s1.r - s0.r);
    return new CircleR2(cx, cy, r);
  } as Interpolator<CircleR2>;
  Object.setPrototypeOf(interpolator, CircleR2Interpolator.prototype);
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
  (s0: CircleR2, s1: CircleR2): Interpolator<CircleR2>;

  /** @hidden */
  prototype: Interpolator<CircleR2>;
};

CircleR2Interpolator.prototype = Object.create(Interpolator.prototype);
