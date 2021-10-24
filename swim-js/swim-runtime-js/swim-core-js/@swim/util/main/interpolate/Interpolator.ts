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

import {Values} from "../values/Values";
import {Range} from "../mapping/Range";
import {Interpolate} from "./Interpolate";
import {InterpolatorMap} from "../"; // forward import
import {IdentityInterpolator} from "../"; // forward import
import {StepInterpolator} from "../"; // forward import
import {NumberInterpolator} from "../"; // forward import
import {ArrayInterpolator} from "../"; // forward import
import {InterpolatorInterpolator} from "../"; // forward import

export interface Interpolator<Y = unknown> extends Range<Y>, Interpolate<Interpolator<Y>> {
  readonly 0: Y;

  readonly 1: Y;

  map<FY>(transform: (y: Y) => FY): Interpolator<FY>;

  interpolateTo(that: Interpolator<Y>): Interpolator<Interpolator<Y>>;
  interpolateTo(that: unknown): Interpolator<Interpolator<Y>> | null;

  canEqual(that: unknown): boolean;

  equals(that: unknown): boolean;

  toString(): string;
}

export const Interpolator = (function (_super: typeof Range) {
  const Interpolator = function (y0: unknown, y1: unknown): Interpolator {
    let interpolator: Interpolator | null;
    if (y0 === y1) {
      interpolator = IdentityInterpolator(y0);
    } else if (typeof y0 === "number" && typeof y1 === "number") {
      interpolator = NumberInterpolator(y0, y1);
    } else if (Array.isArray(y0) && Array.isArray(y1)) {
      interpolator = ArrayInterpolator(y0, y1);
    } else {
      interpolator = Interpolate(y0, y1);
      if (interpolator === null) {
        interpolator = StepInterpolator(y0, y1);
      }
    }
    return interpolator;
  } as {
    <Y>(y0: Y, y1: Y): Interpolator<Y>;
    (y0: unknown, y1: unknown): Interpolator;

    /** @internal */
    prototype: Interpolator<any>;
  };

  Interpolator.prototype = Object.create(_super.prototype);
  Interpolator.prototype.constructor = Interpolator;

  Interpolator.prototype.map = function <Y, FY>(this: Interpolator<Y>, transform: (y: Y) => FY): Interpolator<FY> {
    return InterpolatorMap(this, transform);
  };

  Interpolator.prototype.interpolateTo = function <Y>(this: Interpolator<Y>, that: unknown): Interpolator<Interpolator<Y>> | null {
    if (that instanceof Interpolator) {
      return InterpolatorInterpolator(this, that);
    }
    return null;
  } as typeof Interpolator.prototype.interpolateTo;

  Interpolator.prototype.canEqual = function (that: unknown): boolean {
    return that instanceof this.constructor;
  };

  Interpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Interpolator) {
      return that.canEqual(this)
          && Values.equal(this[0], that[0])
          && Values.equal(this[1], that[1]);
    }
    return false;
  };

  Interpolator.prototype.toString = function (): string {
    return "Interpolator(" + this[0] + ", " + this[1] + ")";
  };

  return Interpolator;
})(Range);
