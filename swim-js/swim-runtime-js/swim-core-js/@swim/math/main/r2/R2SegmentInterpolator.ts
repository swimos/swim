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
import {R2Segment} from "./R2Segment";

/** @hidden */
export const R2SegmentInterpolator = function (s0: R2Segment, s1: R2Segment): Interpolator<R2Segment> {
  const interpolator = function (u: number): R2Segment {
    const s0 = interpolator[0];
    const s1 = interpolator[1];
    const x0 = s0.x0 + u * (s1.x0 - s0.x0);
    const y0 = s0.y0 + u * (s1.y0 - s0.y0);
    const x1 = s0.x1 + u * (s1.x1 - s0.x1);
    const y1 = s0.y1 + u * (s1.y1 - s0.y1);
    return new R2Segment(x0, y0, x1, y1);
  } as Interpolator<R2Segment>;
  Object.setPrototypeOf(interpolator, R2SegmentInterpolator.prototype);
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
  (s0: R2Segment, s1: R2Segment): Interpolator<R2Segment>;

  /** @hidden */
  prototype: Interpolator<R2Segment>;
};

R2SegmentInterpolator.prototype = Object.create(Interpolator.prototype);
