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
import {Focus} from "./Focus";

/** @internal */
export const FocusInterpolator = (function (_super: typeof Interpolator) {
  const FocusInterpolator = function (f0: Focus, f1: Focus): Interpolator<Focus> {
    const interpolator = function (u: number): Focus {
      const f0 = interpolator[0];
      const f1 = interpolator[1];
      const phase = f0.phase + u * (f1.phase - f0.phase);
      const direction = u !== 1 ? f0.direction : 0;
      return Focus.create(phase, direction);
    } as Interpolator<Focus>;
    Object.setPrototypeOf(interpolator, FocusInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = f0;
    (interpolator as Mutable<typeof interpolator>)[1] = f1;
    return interpolator;
  } as {
    (f0: Focus, f1: Focus): Interpolator<Focus>;

    /** @internal */
    prototype: Interpolator<Focus>;
  };

  FocusInterpolator.prototype = Object.create(_super.prototype);
  FocusInterpolator.prototype.constructor = FocusInterpolator;

  return FocusInterpolator;
})(Interpolator);
