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

import {Equals} from "@swim/util";
import {Interpolator} from "@swim/mapping";
import type {MoodMatrix} from "@swim/theme";
import type {Icon} from "./Icon";
import {EnclosedIcon} from "./EnclosedIcon";

/** @hidden */
export interface EnclosedIconInterpolator extends Interpolator<EnclosedIcon> {
  /** @hidden */
  readonly outerInterpolator: Interpolator<Icon | null>;

  /** @hidden */
  readonly innerInterpolator: Interpolator<Icon | null>;

  /** @hidden */
  readonly innerScaleInterpolator: Interpolator<number>;

  /** @hidden */
  readonly moodModifier: MoodMatrix | null;

  /** @hidden */
  readonly outerMoodModifier: MoodMatrix | null;

  /** @hidden */
  readonly innerMoodModifier: MoodMatrix | null;

  readonly 0: EnclosedIcon;

  readonly 1: EnclosedIcon;

  equals(that: unknown): boolean;
}

/** @hidden */
export const EnclosedIconInterpolator = function (i0: EnclosedIcon, i1: EnclosedIcon): EnclosedIconInterpolator {
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
  Object.defineProperty(interpolator, "outerInterpolator", {
    value: Interpolator(i0.outer, i1.outer),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "innerInterpolator", {
    value: Interpolator(i0.inner, i1.inner),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "innerScaleInterpolator", {
    value: Interpolator(i0.innerScale, i1.innerScale),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "moodModifier", {
    value: i1.moodModifier,
    enumerable: true,
  });
  Object.defineProperty(interpolator, "outerMoodModifier", {
    value: i1.outerMoodModifier,
    enumerable: true,
  });
  Object.defineProperty(interpolator, "innerMoodModifier", {
    value: i1.innerMoodModifier,
    enumerable: true,
  });
  return interpolator;
} as {
  (i0: EnclosedIcon, i1: EnclosedIcon): EnclosedIconInterpolator;

  /** @hidden */
  prototype: EnclosedIconInterpolator;
};

EnclosedIconInterpolator.prototype = Object.create(Interpolator.prototype);

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
  enumerable: true,
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
  enumerable: true,
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
