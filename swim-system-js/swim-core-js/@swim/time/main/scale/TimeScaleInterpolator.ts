// Copyright 2015-2020 Swim inc.
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

import {Interpolator, LinearRange} from "@swim/mapping";
import {DateTime} from "../DateTime";
import {TimeDomain} from "./TimeDomain";
import {TimeScale} from "./TimeScale";

/** @hidden */
export const TimeScaleInterpolator = function (s0: TimeScale, s1: TimeScale): Interpolator<TimeScale> {
  const interpolator = function (u: number): TimeScale {
    const s0 = interpolator[0];
    const s1 = interpolator[1];
    const x0 = s0.domain;
    const x00 = x0[0].time;
    const x01 = x0[1].time;
    const x1 = s1.domain;
    const x10 = x1[0].time;
    const x11 = x1[1].time;
    const domain = TimeDomain(new DateTime(x00 + u * (x10 - x00), u === 0 ? x0[0].zone : x1[0].zone),
                              new DateTime(x01 + u * (x11 - x01), u === 0 ? x0[1].zone : x1[1].zone));
    const y0 = s0.range;
    const y00 = y0[0];
    const y01 = y0[1];
    const y1 = s1.range;
    const y10 = y1[0];
    const y11 = y1[1];
    const range = LinearRange(y00 + u * (y10 - y00), y01 + u * (y11 - y01));
    return TimeScale(domain, range);
  } as Interpolator<TimeScale>;
  Object.setPrototypeOf(interpolator, TimeScaleInterpolator.prototype);
  Object.defineProperty(interpolator, 0, {
    value: s0,
    enumerable: true,
  });
  Object.defineProperty(interpolator, 1, {
    value: s1,
    enumerable: true,
  });
  return interpolator;
} as {
  (s0: TimeScale, s1: TimeScale): Interpolator<TimeScale>;

  /** @hidden */
  prototype: Interpolator<TimeScale>;
};

TimeScaleInterpolator.prototype = Object.create(Interpolator.prototype);
