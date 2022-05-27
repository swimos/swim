// Copyright 2015-2022 Swim.inc
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

import type {Mutable} from "../types/Mutable";
import {Values} from "../values/Values";
import {Interpolator} from "./Interpolator";

/** @internal */
export interface StepInterpolator<Y> extends Interpolator<Y> {
  /** @internal */
  readonly phase: number;

  /** @override */
  equals(that: unknown): boolean;
}

/** @internal */
export const StepInterpolator = (function (_super: typeof Interpolator) {
  const StepInterpolator = function <Y>(y0: Y, y1: Y, phase?: number): StepInterpolator<Y> {
    const interpolator = function (u: number): Y {
      return u < interpolator.phase ? interpolator[0] : interpolator[1];
    } as StepInterpolator<Y>;
    Object.setPrototypeOf(interpolator, StepInterpolator.prototype);
    if (phase === void 0) {
      phase = 1;
    }
    (interpolator as Mutable<typeof interpolator>).phase = phase;
    (interpolator as Mutable<typeof interpolator>)[0] = y0;
    (interpolator as Mutable<typeof interpolator>)[1] = y1;
    return interpolator;
  } as {
    <Y>(y0: Y, y1: Y, phase?: number): StepInterpolator<Y>;

    /** @internal */
    prototype: StepInterpolator<any>;
  };

  StepInterpolator.prototype = Object.create(_super.prototype);
  StepInterpolator.prototype.constructor = StepInterpolator;

  StepInterpolator.prototype.equals = function <Y>(this: StepInterpolator<Y>, that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof StepInterpolator) {
      return that.canEqual(this)
          && this.phase === that.phase
          && Values.equal(this[0], that[0])
          && Values.equal(this[1], that[1]);
    }
    return false;
  };

  return StepInterpolator;
})(Interpolator);
