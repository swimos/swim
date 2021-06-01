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

import {__extends} from "tslib";
import {Interpolator} from "@swim/mapping";
import type {FontStyle} from "./FontStyle";
import type {FontVariant} from "./FontVariant";
import type {FontWeight} from "./FontWeight";
import type {FontStretch} from "./FontStretch";
import type {FontSize} from "./FontSize";
import type {LineHeight} from "./LineHeight";
import type {FontFamily} from "./FontFamily";
import {Font} from "./Font";

/** @hidden */
export declare abstract class FontInterpolator {
  /** @hidden */
  readonly styleInterpolator: Interpolator<FontStyle | undefined>;
  /** @hidden */
  readonly variantInterpolator: Interpolator<FontVariant | undefined>;
  /** @hidden */
  readonly weightInterpolator: Interpolator<FontWeight | undefined>;
  /** @hidden */
  readonly stretchInterpolator: Interpolator<FontStretch | undefined>;
  /** @hidden */
  readonly sizeInterpolator: Interpolator<FontSize | null>;
  /** @hidden */
  readonly heightInterpolator: Interpolator<LineHeight | null>;
  /** @hidden */
  readonly familyInterpolator: Interpolator<FontFamily | ReadonlyArray<FontFamily>>;

  get 0(): Font;

  get 1(): Font;

  equals(that: unknown): boolean;
}

export interface FontInterpolator extends Interpolator<Font> {
}

/** @hidden */
export function FontInterpolator(y0: Font, y1: Font): FontInterpolator {
  const interpolator = function (u: number): Font {
    const style = interpolator.styleInterpolator(u);
    const variant = interpolator.variantInterpolator(u);
    const weight = interpolator.weightInterpolator(u);
    const stretch = interpolator.stretchInterpolator(u);
    const size = interpolator.sizeInterpolator(u);
    const height = interpolator.heightInterpolator(u);
    const family = interpolator.familyInterpolator(u);
    return new Font(style, variant, weight, stretch, size, height, family);
  } as FontInterpolator;
  Object.setPrototypeOf(interpolator, FontInterpolator.prototype);
  Object.defineProperty(interpolator, "styleInterpolator", {
    value: Interpolator(y0.style, y1.style),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "variantInterpolator", {
    value: Interpolator(y0.variant, y1.variant),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "weightInterpolator", {
    value: Interpolator(y0.weight, y1.weight),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "stretchInterpolator", {
    value: Interpolator(y0.stretch, y1.stretch),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "sizeInterpolator", {
    value: Interpolator(y0.size, y1.size),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "heightInterpolator", {
    value: Interpolator(y0.height, y1.height),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "familyInterpolator", {
    value: Interpolator(y0.family, y1.family),
    enumerable: true,
  });
  return interpolator;
}
__extends(FontInterpolator, Interpolator);

Object.defineProperty(FontInterpolator.prototype, 0, {
  get(this: FontInterpolator): Font {
    const style = this.styleInterpolator[0];
    const variant = this.variantInterpolator[0];
    const weight = this.weightInterpolator[0];
    const stretch = this.stretchInterpolator[0];
    const size = this.sizeInterpolator[0];
    const height = this.heightInterpolator[0];
    const family = this.familyInterpolator[0];
    return new Font(style, variant, weight, stretch, size, height, family);
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(FontInterpolator.prototype, 1, {
  get(this: FontInterpolator): Font {
    const style = this.styleInterpolator[1];
    const variant = this.variantInterpolator[1];
    const weight = this.weightInterpolator[1];
    const stretch = this.stretchInterpolator[1];
    const size = this.sizeInterpolator[1];
    const height = this.heightInterpolator[1];
    const family = this.familyInterpolator[1];
    return new Font(style, variant, weight, stretch, size, height, family);
  },
  enumerable: true,
  configurable: true,
});

FontInterpolator.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof FontInterpolator) {
    return this.styleInterpolator.equals(that.styleInterpolator)
        && this.variantInterpolator.equals(that.variantInterpolator)
        && this.weightInterpolator.equals(that.weightInterpolator)
        && this.stretchInterpolator.equals(that.stretchInterpolator)
        && this.sizeInterpolator.equals(that.sizeInterpolator)
        && this.heightInterpolator.equals(that.heightInterpolator)
        && this.familyInterpolator.equals(that.familyInterpolator);
  }
  return false;
};
