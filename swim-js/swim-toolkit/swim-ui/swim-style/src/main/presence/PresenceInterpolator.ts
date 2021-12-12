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
import {Presence} from "./Presence";

/** @internal */
export const PresenceInterpolator = (function (_super: typeof Interpolator) {
  const PresenceInterpolator = function (p0: Presence, p1: Presence): Interpolator<Presence> {
    const interpolator = function (u: number): Presence {
      const p0 = interpolator[0];
      const p1 = interpolator[1];
      const phase = p0.phase + u * (p1.phase - p0.phase);
      const direction = u !== 1 ? p0.direction : 0;
      return Presence.create(phase, direction);
    } as Interpolator<Presence>;
    Object.setPrototypeOf(interpolator, PresenceInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = p0;
    (interpolator as Mutable<typeof interpolator>)[1] = p1;
    return interpolator;
  } as {
    (p0: Presence, p1: Presence): Interpolator<Presence>;

    /** @internal */
    prototype: Interpolator<Presence>;
  };

  PresenceInterpolator.prototype = Object.create(_super.prototype);
  PresenceInterpolator.prototype.constructor = PresenceInterpolator;

  return PresenceInterpolator;
})(Interpolator);
