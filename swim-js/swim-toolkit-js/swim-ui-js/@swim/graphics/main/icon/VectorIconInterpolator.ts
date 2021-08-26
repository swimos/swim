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

import {Equals} from "@swim/util";
import {Interpolator} from "@swim/mapping";
import type {R2Path} from "@swim/math";
import type {Color} from "@swim/style";
import type {Look, MoodMatrix} from "@swim/theme";
import type {PaintingFillRule} from "../painting/PaintingContext";
import {VectorIcon} from "./VectorIcon";

/** @hidden */
export interface VectorIconInterpolator extends Interpolator<VectorIcon> {
  /** @hidden */
  readonly path: R2Path;

  /** @hidden */
  readonly fillRule: PaintingFillRule;

  /** @hidden */
  readonly fillColorInterpolator: Interpolator<Color | null>;

  /** @hidden */
  readonly fillLook: Look<Color> | null;

  /** @hidden */
  readonly moodModifier: MoodMatrix | null;

  readonly 0: VectorIcon;

  readonly 1: VectorIcon;

  equals(that: unknown): boolean;
}

/** @hidden */
export const VectorIconInterpolator = function (i0: VectorIcon, i1: VectorIcon): VectorIconInterpolator {
  const interpolator = function (u: number): VectorIcon {
    const path = interpolator.path;
    const fillRule = interpolator.fillRule;
    const fillColor = interpolator.fillColorInterpolator(u);
    const fillLook = interpolator.fillLook;
    const moodModifier = interpolator.moodModifier;
    return new VectorIcon(path, fillRule, fillColor, fillLook, moodModifier);
  } as VectorIconInterpolator;
  Object.setPrototypeOf(interpolator, VectorIconInterpolator.prototype);
  Object.defineProperty(interpolator, "path", {
    value: i1.path,
    enumerable: true,
  });
  Object.defineProperty(interpolator, "fillRule", {
    value: i1.fillRule,
    enumerable: true,
  });
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
  (i0: VectorIcon, i1: VectorIcon): VectorIconInterpolator;

  /** @hidden */
  prototype: VectorIconInterpolator;
};

VectorIconInterpolator.prototype = Object.create(Interpolator.prototype);

Object.defineProperty(VectorIconInterpolator.prototype, 0, {
  get(this: VectorIconInterpolator): VectorIcon {
    const path = this.path;
    const fillRule = this.fillRule;
    const fillColor = this.fillColorInterpolator[0];
    const fillLook = this.fillLook;
    const moodModifier = this.moodModifier;
    return new VectorIcon(path, fillRule, fillColor, fillLook, moodModifier);
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(VectorIconInterpolator.prototype, 1, {
  get(this: VectorIconInterpolator): VectorIcon {
    const path = this.path;
    const fillRule = this.fillRule;
    const fillColor = this.fillColorInterpolator[1];
    const fillLook = this.fillLook;
    const moodModifier = this.moodModifier;
    return new VectorIcon(path, fillRule, fillColor, fillLook, moodModifier);
  },
  enumerable: true,
  configurable: true,
});

VectorIconInterpolator.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof VectorIconInterpolator) {
    return this.path.equals(that.path)
        && this.fillRule === that.fillRule
        && this.fillColorInterpolator.equals(that.fillColorInterpolator)
        && this.fillLook === that.fillLook
        && Equals(this.moodModifier, that.moodModifier);
  }
  return false;
};
