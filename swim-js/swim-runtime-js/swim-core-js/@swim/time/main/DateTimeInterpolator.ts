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
import {DateTime} from "./DateTime";

/** @internal */
export const DateTimeInterpolator = (function (_super: typeof Interpolator) {
  const DateTimeInterpolator = function (d0: DateTime, d1: DateTime): Interpolator<DateTime> {
    const interpolator = function (u: number): DateTime {
      const d0 = interpolator[0];
      const d1 = interpolator[1];
      return new DateTime(d0.time + u * (d1.time - d0.time), d1.zone);
    } as Interpolator<DateTime>;
    Object.setPrototypeOf(interpolator, DateTimeInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = d0;
    (interpolator as Mutable<typeof interpolator>)[1] = d1;
    return interpolator;
  } as {
    (d0: DateTime, d1: DateTime): Interpolator<DateTime>;

    /** @internal */
    prototype: Interpolator<DateTime>;
  };

  DateTimeInterpolator.prototype = Object.create(_super.prototype);

  return DateTimeInterpolator;
})(Interpolator);
