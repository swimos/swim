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

import {Equals, Mutable, Interpolator} from "@swim/util";
import type {Color} from "@swim/style";
import type {Look, MoodMatrix} from "@swim/theme";
import {CircleIcon} from "./CircleIcon";

/** @internal */
export interface CircleIconInterpolator extends Interpolator<CircleIcon> {
  /** @internal */
  readonly fillColorInterpolator: Interpolator<Color | null>;

  /** @internal */
  readonly fillLook: Look<Color> | null;

  /** @internal */
  readonly moodModifier: MoodMatrix | null;

  readonly 0: CircleIcon;

  readonly 1: CircleIcon;

  equals(that: unknown): boolean;
}

/** @internal */
export const CircleIconInterpolator = (function (_super: typeof Interpolator) {
  const CircleIconInterpolator = function (i0: CircleIcon, i1: CircleIcon): CircleIconInterpolator {
    const interpolator = function (u: number): CircleIcon {
      const fillColor = interpolator.fillColorInterpolator(u);
      const fillLook = interpolator.fillLook;
      const moodModifier = interpolator.moodModifier;
      return new CircleIcon(fillColor, fillLook, moodModifier);
    } as CircleIconInterpolator;
    Object.setPrototypeOf(interpolator, CircleIconInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).fillColorInterpolator = Interpolator(i0.fillColor, i1.fillColor);
    (interpolator as Mutable<typeof interpolator>).fillLook = i1.fillLook;
    (interpolator as Mutable<typeof interpolator>).moodModifier = i1.moodModifier;
    return interpolator;
  } as {
    (i0: CircleIcon, i1: CircleIcon): CircleIconInterpolator;

    /** @internal */
    prototype: CircleIconInterpolator;
  };

  CircleIconInterpolator.prototype = Object.create(_super.prototype);
  CircleIconInterpolator.prototype.constructor = CircleIconInterpolator;

  Object.defineProperty(CircleIconInterpolator.prototype, 0, {
    get(this: CircleIconInterpolator): CircleIcon {
      const fillColor = this.fillColorInterpolator[0];
      const fillLook = this.fillLook;
      const moodModifier = this.moodModifier;
      return new CircleIcon(fillColor, fillLook, moodModifier);
    },
    configurable: true,
  });

  Object.defineProperty(CircleIconInterpolator.prototype, 1, {
    get(this: CircleIconInterpolator): CircleIcon {
      const fillColor = this.fillColorInterpolator[1];
      const fillLook = this.fillLook;
      const moodModifier = this.moodModifier;
      return new CircleIcon(fillColor, fillLook, moodModifier);
    },
    configurable: true,
  });

  CircleIconInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof CircleIconInterpolator) {
      return this.fillColorInterpolator.equals(that.fillColorInterpolator)
          && this.fillLook === that.fillLook
          && Equals(this.moodModifier, that.moodModifier);
    }
    return false;
  };

  return CircleIconInterpolator;
})(Interpolator);
