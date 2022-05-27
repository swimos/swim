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

import {Values} from "../values/Values";
import {Range} from "../mapping/Range";
import {Interpolate} from "./Interpolate";
import {InterpolatorMap} from "./"; // forward import
import {IdentityInterpolator} from "./"; // forward import
import {StepInterpolator} from "./"; // forward import
import {NumberInterpolator} from "./"; // forward import
import {ArrayInterpolator} from "./"; // forward import
import {InterpolatorInterpolator} from "./"; // forward import

/** @public */
export interface Interpolator<Y = unknown> extends Range<Y>, Interpolate<Interpolator<Y>> {
  /** @override */
  readonly 0: Y;

  /** @override */
  readonly 1: Y;

  /** @override */
  union(that: Range<Y>): Interpolator<Y>;

  map<FY>(transform: (y: Y) => FY): Interpolator<FY>;

  interpolateTo(that: Interpolator<Y>): Interpolator<Interpolator<Y>>;
  interpolateTo(that: unknown): Interpolator<Interpolator<Y>> | null;

  /** @override */
  canEqual(that: unknown): boolean;

  /** @override */
  equals(that: unknown): boolean;

  /** @override */
  toString(): string;
}

/** @public */
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

  Interpolator.prototype.union = function <Y>(this: Interpolator<Y>, that: Range<Y>): Interpolator<Y> {
    const y00 = this[0];
    const y01 = this[1];
    const y10 = that[0];
    const y11 = that[1];
    let y0: Y;
    let y1: Y;
    const y0Order = Values.compare(y00, y01);
    const y1Order = Values.compare(y10, y11);
    if (y0Order <= 0 && y1Order <= 0) {
      y0 = Values.compare(y00, y10) <= 0 ? y00 : y10;
      y1 = Values.compare(y01, y11) >= 0 ? y01 : y11;
    } else if (y0Order >= 0 && y1Order >= 0) {
      y0 = Values.compare(y00, y10) >= 0 ? y00 : y10;
      y1 = Values.compare(y01, y11) <= 0 ? y01 : y11;
    } else if (y0Order <= 0 && y1Order >= 0) {
      y0 = Values.compare(y00, y11) <= 0 ? y00 : y11;
      y1 = Values.compare(y01, y10) >= 0 ? y01 : y10;
    } else { // y0Order >= 0 && y1Order <= 0
      y0 = Values.compare(y01, y10) <= 0 ? y01 : y10;
      y1 = Values.compare(y00, y11) >= 0 ? y00 : y11;
    }
    return Interpolator(y0, y1);
  };

  Interpolator.prototype.map = function <Y, FY>(this: Interpolator<Y>, transform: (y: Y) => FY): Interpolator<FY> {
    return InterpolatorMap(this, transform);
  };

  Interpolator.prototype.interpolateTo = function <Y>(this: Interpolator<Y>, that: unknown): Interpolator<Interpolator<Y>> | null {
    if (that instanceof Interpolator) {
      return InterpolatorInterpolator(this, that);
    }
    return null;
  } as typeof Interpolator.prototype.interpolateTo;

  Interpolator.prototype.canEqual = function <Y>(this: Interpolator<Y>, that: unknown): boolean {
    return that instanceof this.constructor;
  };

  Interpolator.prototype.equals = function <Y>(this: Interpolator<Y>, that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Interpolator) {
      return that.canEqual(this)
          && Values.equal(this[0], that[0])
          && Values.equal(this[1], that[1]);
    }
    return false;
  };

  Interpolator.prototype.toString = function <Y>(this: Interpolator<Y>): string {
    return "Interpolator(" + this[0] + ", " + this[1] + ")";
  };

  return Interpolator;
})(Range);
