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

import {Interpolator} from "@swim/interpolate";
import {FontStyle} from "./FontStyle";
import {FontVariant} from "./FontVariant";
import {FontWeight} from "./FontWeight";
import {FontStretch} from "./FontStretch";
import {FontSize} from "./FontSize";
import {LineHeight} from "./LineHeight";
import {FontFamily} from "./FontFamily";
import {AnyFont, FontInit, Font} from "./Font";

export class FontInterpolator extends Interpolator<Font, AnyFont> {
  /** @hidden */
  readonly style: Interpolator<FontStyle | undefined>;
  /** @hidden */
  readonly variant: Interpolator<FontVariant | undefined>;
  /** @hidden */
  readonly weight: Interpolator<FontWeight | undefined>;
  /** @hidden */
  readonly stretch: Interpolator<FontStretch | undefined>;
  /** @hidden */
  readonly size: Interpolator<FontSize | undefined>;
  /** @hidden */
  readonly height: Interpolator<LineHeight | undefined>;
  /** @hidden */
  readonly family: Interpolator<FontFamily | ReadonlyArray<FontFamily>>;

  constructor(f0: Font, f1: Font) {
    super();
    this.style = Interpolator.between(f0._style, f1._style);
    this.variant = Interpolator.between(f0._variant, f1._variant);
    this.weight = Interpolator.between(f0._weight, f1._weight);
    this.stretch = Interpolator.between(f0._stretch, f1._stretch);
    this.size = Interpolator.between(f0._size, f1._size);
    this.height = Interpolator.between(f0._height, f1._height);
    this.family = Interpolator.between(f0._family, f1._family);
  }

  interpolate(u: number): Font {
    const style = this.style.interpolate(u);
    const variant = this.variant.interpolate(u);
    const weight = this.weight.interpolate(u);
    const stretch = this.stretch.interpolate(u);
    const size = this.size.interpolate(u);
    const height = this.height.interpolate(u);
    const family = this.family.interpolate(u);
    return new Font(style, variant, weight, stretch, size, height, family);
  }

  deinterpolate(f: AnyFont): number {
    return 0; // not implemented
  }

  range(): readonly [Font, Font];
  range(fs: readonly [Font | FontInit, Font | FontInit]): FontInterpolator;
  range(f0: Font | FontInit, f1: Font | FontInit): FontInterpolator;
  range(fs: readonly [AnyFont, AnyFont]): Interpolator<Font, AnyFont>;
  range(f0: AnyFont, f1: AnyFont): Interpolator<Font, AnyFont>;
  range(f0?: readonly [AnyFont, AnyFont] | AnyFont,
        f1?: AnyFont): readonly [Font, Font] | Interpolator<Font, AnyFont> {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      f0 = f0 as readonly [AnyFont, AnyFont];
      return FontInterpolator.between(f0[0], f0[1]);
    } else {
      return FontInterpolator.between(f0 as AnyFont, f1 as AnyFont);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof FontInterpolator) {
      return this.style.equals(that.style)
          && this.variant.equals(that.variant)
          && this.weight.equals(that.weight)
          && this.stretch.equals(that.stretch)
          && this.size.equals(that.size)
          && this.height.equals(that.height)
          && this.family.equals(that.family);
    }
    return false;
  }

  static between(f0: Font | FontInit, f1: Font | FontInit): FontInterpolator;
  static between(f0: AnyFont, f1: AnyFont): Interpolator<Font, AnyFont>;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof Font && b instanceof Font) {
      return new FontInterpolator(a, b);
    } else if (Font.isAny(a) && Font.isAny(b)) {
      return new FontInterpolator(Font.fromAny(a), Font.fromAny(b));
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): FontInterpolator | null {
    if (a instanceof Font && b instanceof Font) {
      return new FontInterpolator(a, b);
    }
    return null;
  }
}
Interpolator.registerFactory(FontInterpolator);
