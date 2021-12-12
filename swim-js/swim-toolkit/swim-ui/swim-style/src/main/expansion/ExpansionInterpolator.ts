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
import {Expansion} from "./Expansion";

/** @internal */
export const ExpansionInterpolator = (function (_super: typeof Interpolator) {
  const ExpansionInterpolator = function (e0: Expansion, e1: Expansion): Interpolator<Expansion> {
    const interpolator = function (u: number): Expansion {
      const e0 = interpolator[0];
      const e1 = interpolator[1];
      const phase = e0.phase + u * (e1.phase - e0.phase);
      const direction = u !== 1 ? e0.direction : 0;
      return Expansion.create(phase, direction);
    } as Interpolator<Expansion>;
    Object.setPrototypeOf(interpolator, ExpansionInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = e0;
    (interpolator as Mutable<typeof interpolator>)[1] = e1;
    return interpolator;
  } as {
    (e0: Expansion, e1: Expansion): Interpolator<Expansion>;

    /** @internal */
    prototype: Interpolator<Expansion>;
  };

  ExpansionInterpolator.prototype = Object.create(_super.prototype);
  ExpansionInterpolator.prototype.constructor = ExpansionInterpolator;

  return ExpansionInterpolator;
})(Interpolator);
