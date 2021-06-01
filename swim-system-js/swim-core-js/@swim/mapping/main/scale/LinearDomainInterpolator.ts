// Copyright 2015-2021 Swim inc.
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

import {Interpolator} from "../interpolate/Interpolator";
import {LinearDomain} from "./LinearDomain";

/** @hidden */
export const LinearDomainInterpolator = function (x0: LinearDomain, x1: LinearDomain): Interpolator<LinearDomain> {
  const interpolator = function (u: number): LinearDomain {
    const x0 = interpolator[0];
    const x00 = x0[0];
    const x01 = x0[1];
    const x1 = interpolator[1];
    const x10 = x1[0];
    const x11 = x1[1];
    return LinearDomain(x00 + u * (x10 - x00), x01 + u * (x11 - x01));
  } as Interpolator<LinearDomain>;
  Object.setPrototypeOf(interpolator, LinearDomainInterpolator.prototype);
  Object.defineProperty(interpolator, 0, {
    value: x0,
    enumerable: true,
  });
  Object.defineProperty(interpolator, 1, {
    value: x1,
    enumerable: true,
  });
  return interpolator;
} as {
  (x0: LinearDomain, x1: LinearDomain): Interpolator<LinearDomain>;

  /** @hidden */
  prototype: Interpolator<LinearDomain>;
};

LinearDomainInterpolator.prototype = Object.create(Interpolator.prototype);
