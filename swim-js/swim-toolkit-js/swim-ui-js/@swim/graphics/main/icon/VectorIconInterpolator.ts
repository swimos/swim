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

import {Equals, Mutable, Interpolator} from "@swim/util";
import type {R2Path} from "@swim/math";
import type {Color} from "@swim/style";
import type {Look, MoodMatrix} from "@swim/theme";
import type {PaintingFillRule} from "../painting/PaintingContext";
import {VectorIcon} from "./VectorIcon";

/** @internal */
export interface VectorIconInterpolator extends Interpolator<VectorIcon> {
  /** @internal */
  readonly path: R2Path;

  /** @internal */
  readonly fillRule: PaintingFillRule;

  /** @internal */
  readonly fillColorInterpolator: Interpolator<Color | null>;

  /** @internal */
  readonly fillLook: Look<Color> | null;

  /** @internal */
  readonly moodModifier: MoodMatrix | null;

  readonly 0: VectorIcon;

  readonly 1: VectorIcon;

  equals(that: unknown): boolean;
}

/** @internal */
export const VectorIconInterpolator = (function (_super: typeof Interpolator) {
  const VectorIconInterpolator = function (i0: VectorIcon, i1: VectorIcon): VectorIconInterpolator {
    const interpolator = function (u: number): VectorIcon {
      const path = interpolator.path;
      const fillRule = interpolator.fillRule;
      const fillColor = interpolator.fillColorInterpolator(u);
      const fillLook = interpolator.fillLook;
      const moodModifier = interpolator.moodModifier;
      return new VectorIcon(path, fillRule, fillColor, fillLook, moodModifier);
    } as VectorIconInterpolator;
    Object.setPrototypeOf(interpolator, VectorIconInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).path = i1.path;
    (interpolator as Mutable<typeof interpolator>).fillRule = i1.fillRule;
    (interpolator as Mutable<typeof interpolator>).fillColorInterpolator = Interpolator(i0.fillColor, i1.fillColor);
    (interpolator as Mutable<typeof interpolator>).fillLook = i1.fillLook;
    (interpolator as Mutable<typeof interpolator>).moodModifier = i1.moodModifier;
    return interpolator;
  } as {
    (i0: VectorIcon, i1: VectorIcon): VectorIconInterpolator;

    /** @internal */
    prototype: VectorIconInterpolator;
  };

  VectorIconInterpolator.prototype = Object.create(_super.prototype);
  VectorIconInterpolator.prototype.constructor = VectorIconInterpolator;

  Object.defineProperty(VectorIconInterpolator.prototype, 0, {
    get(this: VectorIconInterpolator): VectorIcon {
      const path = this.path;
      const fillRule = this.fillRule;
      const fillColor = this.fillColorInterpolator[0];
      const fillLook = this.fillLook;
      const moodModifier = this.moodModifier;
      return new VectorIcon(path, fillRule, fillColor, fillLook, moodModifier);
    },
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

  return VectorIconInterpolator;
})(Interpolator);
