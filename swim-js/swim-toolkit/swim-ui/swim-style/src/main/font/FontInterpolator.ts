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

import {Mutable, Interpolator} from "@swim/util";
import type {FontStyle} from "./FontStyle";
import type {FontVariant} from "./FontVariant";
import type {FontWeight} from "./FontWeight";
import type {FontStretch} from "./FontStretch";
import type {FontSize} from "./FontSize";
import type {LineHeight} from "./LineHeight";
import type {FontFamily} from "./FontFamily";
import {Font} from "./Font";

/** @internal */
export interface FontInterpolator extends Interpolator<Font> {
  /** @internal */
  readonly styleInterpolator: Interpolator<FontStyle | undefined>;
  /** @internal */
  readonly variantInterpolator: Interpolator<FontVariant | undefined>;
  /** @internal */
  readonly weightInterpolator: Interpolator<FontWeight | undefined>;
  /** @internal */
  readonly stretchInterpolator: Interpolator<FontStretch | undefined>;
  /** @internal */
  readonly sizeInterpolator: Interpolator<FontSize | null>;
  /** @internal */
  readonly heightInterpolator: Interpolator<LineHeight | null>;
  /** @internal */
  readonly familyInterpolator: Interpolator<FontFamily | ReadonlyArray<FontFamily>>;

  get 0(): Font;

  get 1(): Font;

  equals(that: unknown): boolean;
}

/** @internal */
export const FontInterpolator = (function (_super: typeof Interpolator) {
  const FontInterpolator = function (f0: Font, f1: Font): FontInterpolator {
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
    (interpolator as Mutable<typeof interpolator>).styleInterpolator = Interpolator(f0.style, f1.style);
    (interpolator as Mutable<typeof interpolator>).variantInterpolator = Interpolator(f0.variant, f1.variant);
    (interpolator as Mutable<typeof interpolator>).weightInterpolator = Interpolator(f0.weight, f1.weight);
    (interpolator as Mutable<typeof interpolator>).stretchInterpolator = Interpolator(f0.stretch, f1.stretch);
    (interpolator as Mutable<typeof interpolator>).sizeInterpolator = Interpolator(f0.size, f1.size);
    (interpolator as Mutable<typeof interpolator>).heightInterpolator = Interpolator(f0.height, f1.height);
    (interpolator as Mutable<typeof interpolator>).familyInterpolator = Interpolator(f0.family, f1.family);
    return interpolator;
  } as {
    (f0: Font, f1: Font): FontInterpolator;

    /** @internal */
    prototype: FontInterpolator;
  };

  FontInterpolator.prototype = Object.create(_super.prototype);
  FontInterpolator.prototype.constructor = FontInterpolator;

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

  return FontInterpolator;
})(Interpolator);
