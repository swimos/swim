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

import {Interpolator} from "@swim/mapping";
import {Presence} from "./Presence";

/** @hidden */
export const PresenceInterpolator = function (d0: Presence, d1: Presence): Interpolator<Presence> {
  const interpolator = function (u: number): Presence {
    const d0 = interpolator[0];
    const d1 = interpolator[1];
    const phase = d0.phase + u * (d1.phase - d0.phase);
    const direction = u !== 1 ? d0.direction : 0;
    return Presence.create(phase, direction);
  } as Interpolator<Presence>;
  Object.setPrototypeOf(interpolator, PresenceInterpolator.prototype);
  Object.defineProperty(interpolator, 0, {
    value: d0,
    enumerable: true,
  });
  Object.defineProperty(interpolator, 1, {
    value: d1,
    enumerable: true,
  });
  return interpolator;
} as {
  (d0: Presence, d1: Presence): Interpolator<Presence>;

  /** @hidden */
  prototype: Interpolator<Presence>;
};

PresenceInterpolator.prototype = Object.create(Interpolator.prototype);
