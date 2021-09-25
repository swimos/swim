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

import type {Mutable} from "@swim/util";
import {Interpolator} from "@swim/mapping";
import {Num} from "./Num";

/** @hidden */
export const NumInterpolator = function (y0: Num, y1: Num): Interpolator<Num> {
  const interpolator = function (u: number): Num {
    const y0 = interpolator[0].value;
    const y1 = interpolator[1].value;
    return Num.from(y0 + u * (y1 - y0));
  } as Interpolator<Num>;
  Object.setPrototypeOf(interpolator, NumInterpolator.prototype);
  (interpolator as Mutable<typeof interpolator>)[0] = y0;
  (interpolator as Mutable<typeof interpolator>)[1] = y1;
  return interpolator;
} as {
  (y0: Num, y1: Num): Interpolator<Num>;

  /** @hidden */
  prototype: Interpolator<Num>;
};

NumInterpolator.prototype = Object.create(Interpolator.prototype);
