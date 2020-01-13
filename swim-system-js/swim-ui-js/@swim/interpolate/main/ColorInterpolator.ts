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

import {AnyColor, Color, RgbColor, HslColor} from "@swim/color";
import {Interpolator} from "./Interpolator";
import {IdentityColorInterpolator} from "./color/IdentityColorInterpolator";
import {RgbColorInterpolator} from "./color/RgbColorInterpolator";
import {HslColorInterpolator} from "./color/HslColorInterpolator";

export abstract class ColorInterpolator<C extends Color = Color> extends Interpolator<C, AnyColor> {
  range(): C[];
  range(cs: ReadonlyArray<AnyColor>): ColorInterpolator<C>;
  range(c0: AnyColor, c1?: AnyColor): ColorInterpolator<C>;
  range(c0?: ReadonlyArray<AnyColor> | AnyColor, c1?: AnyColor): C[] | ColorInterpolator<C> {
    if (c0 === void 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (c1 === void 0) {
      c0 = c0 as ReadonlyArray<AnyColor>;
      return Interpolator.color(c0[0], c0[1]) as ColorInterpolator<C>;
    } else {
      return Interpolator.color(c0 as AnyColor, c1) as ColorInterpolator<C>;
    }
  }

  static color(c0?: AnyColor, c1?: AnyColor): ColorInterpolator {
    if (c0 === void 0 && c1 === void 0) {
      return new ColorInterpolator.Identity();
    }
    if (c0 !== void 0) {
      c0 = Color.fromAny(c0);
    }
    if (c1 !== void 0) {
      c1 = Color.fromAny(c1);
    }
    if (!c0 && !c1) {
      c1 = c0 = Color.transparent();
    } else if (!c1) {
      c1 = c0;
    } else if (!c0) {
      c0 = c1;
    }
    if (c0 instanceof HslColor && c1 instanceof HslColor) {
      return ColorInterpolator.hsl(c0, c1);
    } else {
      return ColorInterpolator.rgb(c0!.rgb(), c1!.rgb());
    }
  }

  static rgb(c0?: AnyColor, c1?: AnyColor): Interpolator<RgbColor> {
    return new ColorInterpolator.Rgb(c0, c1);
  }

  static hsl(c0?: AnyColor, c1?: AnyColor): Interpolator<HslColor> {
    return new ColorInterpolator.Hsl(c0, c1);
  }

  // Forward type declarations
  /** @hidden */
  static Identity: typeof IdentityColorInterpolator; // defined by IdentityColorInterpolator
  /** @hidden */
  static Rgb: typeof RgbColorInterpolator; // defined by RgbColorInterpolator
  /** @hidden */
  static Hsl: typeof HslColorInterpolator; // defined by HslColorInterpolator
}
Interpolator.Color = ColorInterpolator;
Interpolator.color = ColorInterpolator.color;
