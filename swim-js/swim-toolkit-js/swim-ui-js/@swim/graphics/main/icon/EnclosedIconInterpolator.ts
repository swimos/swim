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
import type {MoodMatrix} from "@swim/theme";
import type {Icon} from "./Icon";
import {EnclosedIcon} from "./EnclosedIcon";

/** @internal */
export interface EnclosedIconInterpolator extends Interpolator<EnclosedIcon> {
  /** @internal */
  readonly outerInterpolator: Interpolator<Icon | null>;

  /** @internal */
  readonly innerInterpolator: Interpolator<Icon | null>;

  /** @internal */
  readonly innerScaleInterpolator: Interpolator<number>;

  /** @internal */
  readonly moodModifier: MoodMatrix | null;

  /** @internal */
  readonly outerMoodModifier: MoodMatrix | null;

  /** @internal */
  readonly innerMoodModifier: MoodMatrix | null;

  readonly 0: EnclosedIcon;

  readonly 1: EnclosedIcon;

  equals(that: unknown): boolean;
}

/** @internal */
export const EnclosedIconInterpolator = (function (_super: typeof Interpolator) {
  const EnclosedIconInterpolator = function (i0: EnclosedIcon, i1: EnclosedIcon): EnclosedIconInterpolator {
    const interpolator = function (u: number): EnclosedIcon {
      const outer = interpolator.outerInterpolator(u);
      const inner = interpolator.innerInterpolator(u);
      const innerScale = interpolator.innerScaleInterpolator(u);
      const moodModifier = interpolator.moodModifier;
      const outerMoodModifier = interpolator.outerMoodModifier;
      const innerMoodModifier = interpolator.innerMoodModifier;
      return new EnclosedIcon(outer, inner, innerScale, moodModifier,
                              outerMoodModifier, innerMoodModifier);
    } as EnclosedIconInterpolator;
    Object.setPrototypeOf(interpolator, EnclosedIconInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).outerInterpolator = Interpolator(i0.outer, i1.outer);
    (interpolator as Mutable<typeof interpolator>).innerInterpolator = Interpolator(i0.inner, i1.inner);
    (interpolator as Mutable<typeof interpolator>).innerScaleInterpolator = Interpolator(i0.innerScale, i1.innerScale);
    (interpolator as Mutable<typeof interpolator>).moodModifier = i1.moodModifier;
    (interpolator as Mutable<typeof interpolator>).outerMoodModifier = i1.outerMoodModifier;
    (interpolator as Mutable<typeof interpolator>).innerMoodModifier = i1.innerMoodModifier;
    return interpolator;
  } as {
    (i0: EnclosedIcon, i1: EnclosedIcon): EnclosedIconInterpolator;

    /** @internal */
    prototype: EnclosedIconInterpolator;
  };

  EnclosedIconInterpolator.prototype = Object.create(_super.prototype);

  Object.defineProperty(EnclosedIconInterpolator.prototype, 0, {
    get(this: EnclosedIconInterpolator): EnclosedIcon {
      const outer = this.outerInterpolator[0];
      const inner = this.innerInterpolator[0];
      const innerScale = this.innerScaleInterpolator[0];
      const moodModifier = this.moodModifier;
      const outerMoodModifier = this.outerMoodModifier;
      const innerMoodModifier = this.innerMoodModifier;
      return new EnclosedIcon(outer, inner, innerScale, moodModifier,
                              outerMoodModifier, innerMoodModifier);
    },
    configurable: true,
  });

  Object.defineProperty(EnclosedIconInterpolator.prototype, 1, {
    get(this: EnclosedIconInterpolator): EnclosedIcon {
      const outer = this.outerInterpolator[1];
      const inner = this.innerInterpolator[1];
      const innerScale = this.innerScaleInterpolator[1];
      const moodModifier = this.moodModifier;
      const outerMoodModifier = this.outerMoodModifier;
      const innerMoodModifier = this.innerMoodModifier;
      return new EnclosedIcon(outer, inner, innerScale, moodModifier,
                              outerMoodModifier, innerMoodModifier);
    },
    configurable: true,
  });

  EnclosedIconInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof EnclosedIconInterpolator) {
      return this.outerInterpolator.equals(that.outerInterpolator)
          && this.innerInterpolator.equals(that.innerInterpolator)
          && this.innerScaleInterpolator.equals(that.innerScaleInterpolator)
          && Equals(this.moodModifier, that.moodModifier)
          && Equals(this.outerMoodModifier, that.outerMoodModifier)
          && Equals(this.innerMoodModifier, that.innerMoodModifier);
    }
    return false;
  };

  return EnclosedIconInterpolator;
})(Interpolator);
