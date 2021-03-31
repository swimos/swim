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

import {Equals} from "@swim/util";
import {Interpolator} from "@swim/mapping";
import type {Color} from "@swim/style";
import type {Look, MoodMatrix} from "@swim/theme";
import {CircleIcon} from "./CircleIcon";

/** @hidden */
export interface CircleIconInterpolator extends Interpolator<CircleIcon> {
  /** @hidden */
  readonly fillColorInterpolator: Interpolator<Color | null>;

  /** @hidden */
  readonly fillLook: Look<Color> | null;

  /** @hidden */
  readonly moodModifier: MoodMatrix | null;

  readonly 0: CircleIcon;

  readonly 1: CircleIcon;

  equals(that: unknown): boolean;
}

/** @hidden */
export const CircleIconInterpolator = function (i0: CircleIcon, i1: CircleIcon): CircleIconInterpolator {
  const interpolator = function (u: number): CircleIcon {
    const fillColor = interpolator.fillColorInterpolator(u);
    const fillLook = interpolator.fillLook;
    const moodModifier = interpolator.moodModifier;
    return new CircleIcon(fillColor, fillLook, moodModifier);
  } as CircleIconInterpolator;
  Object.setPrototypeOf(interpolator, CircleIconInterpolator.prototype);
  Object.defineProperty(interpolator, "fillColorInterpolator", {
    value: Interpolator(i0.fillColor, i1.fillColor),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "fillLook", {
    value: i1.fillLook,
    enumerable: true,
  });
  Object.defineProperty(interpolator, "moodModifier", {
    value: i1.moodModifier,
    enumerable: true,
  });
  return interpolator;
} as {
  (i0: CircleIcon, i1: CircleIcon): CircleIconInterpolator;

  /** @hidden */
  prototype: CircleIconInterpolator;
};

CircleIconInterpolator.prototype = Object.create(Interpolator.prototype);

Object.defineProperty(CircleIconInterpolator.prototype, 0, {
  get(this: CircleIconInterpolator): CircleIcon {
    const fillColor = this.fillColorInterpolator[0];
    const fillLook = this.fillLook;
    const moodModifier = this.moodModifier;
    return new CircleIcon(fillColor, fillLook, moodModifier);
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(CircleIconInterpolator.prototype, 1, {
  get(this: CircleIconInterpolator): CircleIcon {
    const fillColor = this.fillColorInterpolator[1];
    const fillLook = this.fillLook;
    const moodModifier = this.moodModifier;
    return new CircleIcon(fillColor, fillLook, moodModifier);
  },
  enumerable: true,
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
