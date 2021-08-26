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
import type {Angle} from "@swim/math";
import type {Color} from "@swim/style";
import type {Look, MoodMatrix} from "@swim/theme";
import {PolygonIcon} from "./PolygonIcon";

/** @hidden */
export interface PolygonIconInterpolator extends Interpolator<PolygonIcon> {
  /** @hidden */
  readonly sides: number;

  /** @hidden */
  readonly rotationInterpolator: Interpolator<Angle>;

  /** @hidden */
  readonly fillColorInterpolator: Interpolator<Color | null>;

  /** @hidden */
  readonly fillLook: Look<Color> | null;

  /** @hidden */
  readonly moodModifier: MoodMatrix | null;

  readonly 0: PolygonIcon;

  readonly 1: PolygonIcon;

  equals(that: unknown): boolean;
}

/** @hidden */
export const PolygonIconInterpolator = function (i0: PolygonIcon, i1: PolygonIcon): PolygonIconInterpolator {
  const interpolator = function (u: number): PolygonIcon {
    const sides = interpolator.sides;
    const rotation = interpolator.rotationInterpolator(u);
    const fillColor = interpolator.fillColorInterpolator(u);
    const fillLook = interpolator.fillLook;
    const moodModifier = interpolator.moodModifier;
    return new PolygonIcon(sides, rotation, fillColor, fillLook, moodModifier);
  } as PolygonIconInterpolator;
  Object.setPrototypeOf(interpolator, PolygonIconInterpolator.prototype);
  Object.defineProperty(interpolator, "sides", {
    value: i1.sides,
    enumerable: true,
  });
  Object.defineProperty(interpolator, "rotationInterpolator", {
    value: i0.rotation.interpolateTo(i1.rotation),
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
  (i0: PolygonIcon, i1: PolygonIcon): PolygonIconInterpolator;

  /** @hidden */
  prototype: PolygonIconInterpolator;
};

PolygonIconInterpolator.prototype = Object.create(Interpolator.prototype);

Object.defineProperty(PolygonIconInterpolator.prototype, 0, {
  get(this: PolygonIconInterpolator): PolygonIcon {
    const sides = this.sides;
    const rotation = this.rotationInterpolator[0];
    const fillColor = this.fillColorInterpolator[0];
    const fillLook = this.fillLook;
    const moodModifier = this.moodModifier;
    return new PolygonIcon(sides, rotation, fillColor, fillLook, moodModifier);
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(PolygonIconInterpolator.prototype, 1, {
  get(this: PolygonIconInterpolator): PolygonIcon {
    const sides = this.sides;
    const rotation = this.rotationInterpolator[1];
    const fillColor = this.fillColorInterpolator[1];
    const fillLook = this.fillLook;
    const moodModifier = this.moodModifier;
    return new PolygonIcon(sides, rotation, fillColor, fillLook, moodModifier);
  },
  enumerable: true,
  configurable: true,
});

PolygonIconInterpolator.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof PolygonIconInterpolator) {
    return this.sides === that.sides
        && this.rotationInterpolator.equals(that.rotationInterpolator)
        && this.fillColorInterpolator.equals(that.fillColorInterpolator)
        && this.fillLook === that.fillLook
        && Equals(this.moodModifier, that.moodModifier);
  }
  return false;
};
