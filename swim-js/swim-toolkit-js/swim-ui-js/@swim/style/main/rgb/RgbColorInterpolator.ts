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
import {RgbColor} from "./RgbColor";

/** @hidden */
export const RgbColorInterpolator = function (c0: RgbColor, c1: RgbColor): Interpolator<RgbColor> {
  const interpolator = function (u: number): RgbColor {
    const c0 = interpolator[0];
    const c1 = interpolator[1];
    const r = c0.r + u * (c1.r - c0.r);
    const g = c0.g + u * (c1.g - c0.g);
    const b = c0.b + u * (c1.b - c0.b);
    const a = c0.a + u * (c1.a - c0.a);
    return new RgbColor(r, g, b, a);
  } as Interpolator<RgbColor>;
  Object.setPrototypeOf(interpolator, RgbColorInterpolator.prototype);
  Object.defineProperty(interpolator, 0, {
    value: c0,
    enumerable: true,
  });
  Object.defineProperty(interpolator, 1, {
    value: c1,
    enumerable: true,
  });
  return interpolator;
} as {
  (c0: RgbColor, c1: RgbColor): Interpolator<RgbColor>;

  /** @hidden */
  prototype: Interpolator<RgbColor>;
};

RgbColorInterpolator.prototype = Object.create(Interpolator.prototype);
