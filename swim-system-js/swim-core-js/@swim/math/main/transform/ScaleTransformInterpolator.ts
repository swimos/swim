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
import {ScaleTransform} from "./ScaleTransform";

/** @hidden */
export const ScaleTransformInterpolator = function (f0: ScaleTransform, f1: ScaleTransform): Interpolator<ScaleTransform> {
  const interpolator = function (u: number): ScaleTransform {
    const f0 = interpolator[0];
    const f1 = interpolator[1];
    const x = f0.x + u * (f1.x - f0.x);
    const y = f0.y + u * (f1.y - f0.y);
    return new ScaleTransform(x, y);
  } as Interpolator<ScaleTransform>;
  Object.setPrototypeOf(interpolator, ScaleTransformInterpolator.prototype);
  Object.defineProperty(interpolator, 0, {
    value: f0,
    enumerable: true,
  });
  Object.defineProperty(interpolator, 1, {
    value: f1,
    enumerable: true,
  });
  return interpolator;
} as {
  (f0: ScaleTransform, f1: ScaleTransform): Interpolator<ScaleTransform>;

  /** @hidden */
  prototype: Interpolator<ScaleTransform>;
};

ScaleTransformInterpolator.prototype = Object.create(Interpolator.prototype);
