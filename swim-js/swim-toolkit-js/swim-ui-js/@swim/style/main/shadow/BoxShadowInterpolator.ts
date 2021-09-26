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

import {__extends} from "tslib";
import type {Mutable} from "@swim/util";
import {Interpolator} from "@swim/mapping";
import type {Length} from "@swim/math";
import type {Color} from "../color/Color";
import {BoxShadow} from "./BoxShadow";

/** @hidden */
export declare abstract class BoxShadowInterpolator {
  /** @hidden */
  readonly insetInterpolator: Interpolator<boolean>;
  /** @hidden */
  readonly offsetXInterpolator: Interpolator<Length>;
  /** @hidden */
  readonly offsetYInterpolator: Interpolator<Length>;
  /** @hidden */
  readonly blurRadiusInterpolator: Interpolator<Length>;
  /** @hidden */
  readonly spreadRadiusInterpolator: Interpolator<Length>;
  /** @hidden */
  readonly colorInterpolator: Interpolator<Color>;
  /** @hidden */
  readonly nextInterpolator: Interpolator<BoxShadow | null>;

  get 0(): BoxShadow;

  get 1(): BoxShadow;

  equals(that: unknown): boolean;
}

export interface BoxShadowInterpolator extends Interpolator<BoxShadow> {
}

/** @hidden */
export function BoxShadowInterpolator(y0: BoxShadow, y1: BoxShadow): BoxShadowInterpolator {
  const interpolator = function (u: number): BoxShadow {
    const inset = interpolator.insetInterpolator(u);
    const offsetX = interpolator.offsetXInterpolator(u);
    const offsetY = interpolator.offsetYInterpolator(u);
    const blurRadius = interpolator.blurRadiusInterpolator(u);
    const spreadRadius = interpolator.spreadRadiusInterpolator(u);
    const color = interpolator.colorInterpolator(u);
    const next = interpolator.nextInterpolator(u);
    return new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, next);
  } as BoxShadowInterpolator;
  Object.setPrototypeOf(interpolator, BoxShadowInterpolator.prototype);
  (interpolator as Mutable<typeof interpolator>).insetInterpolator = Interpolator(y0.inset, y1.inset);
  (interpolator as Mutable<typeof interpolator>).offsetXInterpolator = y0.offsetX.interpolateTo(y1.offsetX);
  (interpolator as Mutable<typeof interpolator>).offsetYInterpolator = y0.offsetY.interpolateTo(y1.offsetY);
  (interpolator as Mutable<typeof interpolator>).blurRadiusInterpolator = y0.blurRadius.interpolateTo(y1.blurRadius);
  (interpolator as Mutable<typeof interpolator>).spreadRadiusInterpolator = y0.spreadRadius.interpolateTo(y1.spreadRadius);
  (interpolator as Mutable<typeof interpolator>).colorInterpolator = y0.color.interpolateTo(y1.color);
  (interpolator as Mutable<typeof interpolator>).nextInterpolator = Interpolator(y0.next, y1.next);
  return interpolator;
}
__extends(BoxShadowInterpolator, Interpolator);

Object.defineProperty(BoxShadowInterpolator.prototype, 0, {
  get(this: BoxShadowInterpolator): BoxShadow {
    const inset = this.insetInterpolator[0];
    const offsetX = this.offsetXInterpolator[0];
    const offsetY = this.offsetYInterpolator[0];
    const blurRadius = this.blurRadiusInterpolator[0];
    const spreadRadius = this.spreadRadiusInterpolator[0];
    const color = this.colorInterpolator[0];
    const next = this.nextInterpolator[0];
    return new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, next);
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(BoxShadowInterpolator.prototype, 1, {
  get(this: BoxShadowInterpolator): BoxShadow {
    const inset = this.insetInterpolator[1];
    const offsetX = this.offsetXInterpolator[1];
    const offsetY = this.offsetYInterpolator[1];
    const blurRadius = this.blurRadiusInterpolator[1];
    const spreadRadius = this.spreadRadiusInterpolator[1];
    const color = this.colorInterpolator[1];
    const next = this.nextInterpolator[1];
    return new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, next);
  },
  enumerable: true,
  configurable: true,
});

BoxShadowInterpolator.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof BoxShadowInterpolator) {
    return this.insetInterpolator.equals(that.insetInterpolator)
        && this.offsetXInterpolator.equals(that.offsetXInterpolator)
        && this.offsetYInterpolator.equals(that.offsetYInterpolator)
        && this.blurRadiusInterpolator.equals(that.blurRadiusInterpolator)
        && this.spreadRadiusInterpolator.equals(that.spreadRadiusInterpolator)
        && this.colorInterpolator.equals(that.colorInterpolator)
        && this.nextInterpolator.equals(that.nextInterpolator);
  }
  return false;
};
