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

import {Mutable, Interpolator} from "@swim/util";
import {HslColor} from "./HslColor";

/** @internal */
export const HslColorInterpolator = (function (_super: typeof Interpolator) {
  const HslColorInterpolator = function (c0: HslColor, c1: HslColor): Interpolator<HslColor> {
    const interpolator = function (u: number): HslColor {
      const c0 = interpolator[0];
      const c1 = interpolator[1];
      const h = c0.h + u * (c1.h - c0.h);
      const s = c0.s + u * (c1.s - c0.s);
      const l = c0.l + u * (c1.l - c0.l);
      const a = c0.a + u * (c1.a - c0.a);
      return new HslColor(h, s, l, a);
    } as Interpolator<HslColor>;
    Object.setPrototypeOf(interpolator, HslColorInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = c0;
    (interpolator as Mutable<typeof interpolator>)[1] = c1;
    return interpolator;
  } as {
    (c0: HslColor, c1: HslColor): Interpolator<HslColor>;

    /** @internal */
    prototype: Interpolator<HslColor>;
  };

  HslColorInterpolator.prototype = Object.create(_super.prototype);

  return HslColorInterpolator;
})(Interpolator);
