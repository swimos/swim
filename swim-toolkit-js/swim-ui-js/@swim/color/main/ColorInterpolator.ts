// Copyright 2015-2020 SWIM.AI inc.
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
import {AnyColor, Color} from "./Color";
import {RgbColor} from "./RgbColor";
import {HslColor} from "./HslColor";
import {RgbColorInterpolator} from "./RgbColorInterpolator";
import {HslColorInterpolator} from "./HslColorInterpolator";

export abstract class ColorInterpolator<C extends Color = Color> extends Interpolator<C, AnyColor> {
  abstract range(): ReadonlyArray<C>;
  abstract range(cs: ReadonlyArray<C>): ColorInterpolator<C>;
  abstract range(c0: C, c1: C): ColorInterpolator<C>;
  abstract range(cs: ReadonlyArray<AnyColor>): ColorInterpolator;
  abstract range(c0: AnyColor, c1: AnyColor): ColorInterpolator;

  static between(c0: AnyColor, c1: AnyColor): ColorInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof RgbColor && b instanceof RgbColor) {
      return new ColorInterpolator.Rgb(a, b);
    } else if (a instanceof HslColor && b instanceof HslColor) {
      return new ColorInterpolator.Hsl(a, b);
    } else if (a instanceof Color && b instanceof Color) {
      return new ColorInterpolator.Rgb(a.rgb(), b.rgb());
    } else if (RgbColor.isInit(a) && RgbColor.isInit(b)) {
      return new ColorInterpolator.Rgb(RgbColor.fromInit(a), RgbColor.fromInit(b));
    } else if (HslColor.isInit(a) && HslColor.isInit(b)) {
      return new ColorInterpolator.Hsl(HslColor.fromInit(a), HslColor.fromInit(b));
    } else if (Color.isAny(a) && Color.isAny(b)) {
      return ColorInterpolator.between(Color.fromAny(a), Color.fromAny(b));
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): ColorInterpolator | null {
    if (a instanceof RgbColor && b instanceof RgbColor) {
      return new ColorInterpolator.Rgb(a, b);
    } else if (a instanceof HslColor && b instanceof HslColor) {
      return new ColorInterpolator.Hsl(a, b);
    }
    return null;
  }

  static tryBetweenAny(a: unknown, b: unknown): ColorInterpolator | null {
    if ((a instanceof Color || Color.isInit(a)) && (b instanceof Color || Color.isInit(b))) {
      const c0 = Color.fromAny(a);
      const c1 = Color.fromAny(b);
      if (c0 instanceof RgbColor && c1 instanceof RgbColor) {
        return new ColorInterpolator.Rgb(c0, c1);
      } else if (c0 instanceof HslColor && c1 instanceof HslColor) {
        return new ColorInterpolator.Hsl(c0, c1);
      } else if (c0 instanceof Color && c1 instanceof Color) {
        return new ColorInterpolator.Rgb(c0.rgb(), c1.rgb());
      }
    }
    return null;
  }

  // Forward type declarations
  /** @hidden */
  static Rgb: typeof RgbColorInterpolator; // defined by RgbColorInterpolator
  /** @hidden */
  static Hsl: typeof HslColorInterpolator; // defined by HslColorInterpolator
}
Interpolator.registerFactory(ColorInterpolator);
