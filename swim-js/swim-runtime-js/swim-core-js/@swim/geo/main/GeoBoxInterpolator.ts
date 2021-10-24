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
import {GeoBox} from "./GeoBox";

/** @internal */
export const GeoBoxInterpolator = (function (_super: typeof Interpolator) {
  const GeoBoxInterpolator = function (s0: GeoBox, s1: GeoBox): Interpolator<GeoBox> {
    const interpolator = function (u: number): GeoBox {
      const s0 = interpolator[0];
      const s1 = interpolator[1];
      const lngMin = s0.lngMin + u * (s1.lngMin - s0.lngMin);
      const latMin = s0.latMin + u * (s1.latMin - s0.latMin);
      const lngMax = s0.lngMax + u * (s1.lngMax - s0.lngMax);
      const latMax = s0.latMax + u * (s1.latMax - s0.latMax);
      return new GeoBox(lngMin, latMin, lngMax, latMax);
    } as Interpolator<GeoBox>;
    Object.setPrototypeOf(interpolator, GeoBoxInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = s0;
    (interpolator as Mutable<typeof interpolator>)[1] = s1;
    return interpolator;
  } as {
    (s0: GeoBox, s1: GeoBox): Interpolator<GeoBox>;

    /** @internal */
    prototype: Interpolator<GeoBox>;
  };

  GeoBoxInterpolator.prototype = Object.create(_super.prototype);
  GeoBoxInterpolator.prototype.constructor = GeoBoxInterpolator;

  return GeoBoxInterpolator;
})(Interpolator);
