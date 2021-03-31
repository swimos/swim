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

import {Interpolator} from "../interpolate/Interpolator";
import {LinearDomain} from "./LinearDomain";
import {LinearRange} from "./LinearRange";
import {LinearScale} from "./LinearScale";

/** @hidden */
export const LinearScaleInterpolator = function (s0: LinearScale, s1: LinearScale): Interpolator<LinearScale> {
  const interpolator = function (u: number): LinearScale {
    const s0 = interpolator[0];
    const s1 = interpolator[1];
    const x0 = s0.domain;
    const x00 = x0[0];
    const x01 = x0[1];
    const x1 = s1.domain;
    const x10 = x1[0];
    const x11 = x1[1];
    const domain = LinearDomain(x00 + u * (x10 - x00), x01 + u * (x11 - x01));
    const y0 = s0.range;
    const y00 = y0[0];
    const y01 = y0[1];
    const y1 = s1.range;
    const y10 = y1[0];
    const y11 = y1[1];
    const range = LinearRange(y00 + u * (y10 - y00), y01 + u * (y11 - y01));
    return LinearScale(domain, range);
  } as Interpolator<LinearScale>;
  Object.setPrototypeOf(interpolator, LinearScaleInterpolator.prototype);
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
  (s0: LinearScale, s1: LinearScale): Interpolator<LinearScale>;

  /** @hidden */
  prototype: Interpolator<LinearScale>;
};

LinearScaleInterpolator.prototype = Object.create(Interpolator.prototype);
