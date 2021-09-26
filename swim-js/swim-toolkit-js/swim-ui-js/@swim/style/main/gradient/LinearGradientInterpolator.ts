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

import type {Mutable} from "@swim/util";
import {Interpolator} from "@swim/mapping";
import type {ColorStop} from "./ColorStop";
import {LinearGradientAngle, LinearGradient} from "./LinearGradient";

/** @hidden */
export interface LinearGradientInterpolator extends Interpolator<LinearGradient> {
  /** @hidden */
  readonly angleInterpolator: Interpolator<LinearGradientAngle>;
  /** @hidden */
  readonly stopInterpolators: ReadonlyArray<Interpolator<ColorStop>>;

  readonly 0: LinearGradient;

  readonly 1: LinearGradient;

  equals(that: unknown): boolean;
}

/** @hidden */
export const LinearGradientInterpolator = function (g0: LinearGradient, g1: LinearGradient): LinearGradientInterpolator {
  const interpolator = function (u: number): LinearGradient {
    const angle = interpolator.angleInterpolator(u);
    const stopInterpolators = interpolator.stopInterpolators;
    const stopCount = stopInterpolators.length;
    const stops = new Array<ColorStop>(stopCount);
    for (let i = 0; i < stopCount; i += 1) {
      stops[i] = stopInterpolators[i]!(u);
    }
    return new LinearGradient(angle, stops);
  } as LinearGradientInterpolator;
  Object.setPrototypeOf(interpolator, LinearGradientInterpolator.prototype);
  (interpolator as Mutable<typeof interpolator>).angleInterpolator = Interpolator(g0.angle, g1.angle);
  const stops0 = g0.stops;
  const stops1 = g1.stops;
  const stopCount = Math.min(stops0.length, stops1.length);
  const stopInterpolators = new Array<Interpolator<ColorStop>>(stopCount);
  for (let i = 0; i < stopCount; i += 1) {
    stopInterpolators[i] = stops0[i]!.interpolateTo(stops1[i]!);
  }
  (interpolator as Mutable<typeof interpolator>).stopInterpolators = stopInterpolators;
  return interpolator;
} as {
  (g0: LinearGradient, g1: LinearGradient): LinearGradientInterpolator;

  /** @hidden */
  prototype: LinearGradientInterpolator;
};

LinearGradientInterpolator.prototype = Object.create(Interpolator.prototype);

Object.defineProperty(LinearGradientInterpolator.prototype, 0, {
  get(this: LinearGradientInterpolator): LinearGradient {
    const angle = this.angleInterpolator[0];
    const stopInterpolators = this.stopInterpolators;
    const stopCount = stopInterpolators.length;
    const stops = new Array<ColorStop>(stopCount);
    for (let i = 0; i < stopCount; i += 1) {
      stops[i] = stopInterpolators[i]![0];
    }
    return new LinearGradient(angle, stops);
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(LinearGradientInterpolator.prototype, 1, {
  get(this: LinearGradientInterpolator): LinearGradient {
    const angle = this.angleInterpolator[1];
    const stopInterpolators = this.stopInterpolators;
    const stopCount = stopInterpolators.length;
    const stops = new Array<ColorStop>(stopCount);
    for (let i = 0; i < stopCount; i += 1) {
      stops[i] = stopInterpolators[i]![1];
    }
    return new LinearGradient(angle, stops);
  },
  enumerable: true,
  configurable: true,
});

LinearGradientInterpolator.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof LinearGradientInterpolator) {
    if (this.angleInterpolator.equals(that.angleInterpolator)) {
      const n = this.stopInterpolators.length;
      if (n === that.stopInterpolators.length) {
        for (let i = 0; i < n; i += 1) {
          if (!this.stopInterpolators[i]!.equals(that.stopInterpolators[i]!)) {
            return false;
          }
        }
        return true;
      }
    }
  }
  return false;
};
